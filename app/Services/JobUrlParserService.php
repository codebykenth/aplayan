<?php

namespace App\Services;

use DOMDocument;
use DOMXPath;
use Illuminate\Http\Client\RequestException;
use Illuminate\Support\Facades\Http;
use JsonException;

class JobUrlParserService
{
    private const int TIMEOUT = 15;

    private const int CONNECT_TIMEOUT = 5;

    private const int MAX_BODY_BYTES = 512_000;

    public function __construct(private GeminiService $gemini) {}

    public function parse(string $jobUrl): array
    {
        $html = $this->fetchPage($jobUrl);

        $result = $this->parseOpenGraph($html);

        $result = $this->mergeSchema($result, $this->parseSchemaOrg($html));

        if ($this->isIncomplete($result)) {
            try {
                $result = $this->fallbackToGemini($jobUrl, $html);
            } catch (RequestException) {
                return $this->makeSafe($result);
            } catch (JsonException) {
                return $this->makeSafe($result);
            }
        }

        return $this->makeSafe($result);
    }

    private function fetchPage(string $url): string
    {
        $response = Http::timeout(self::TIMEOUT)
            ->connectTimeout(self::CONNECT_TIMEOUT)
            ->withUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36')
            ->withOptions(['stream' => false])
            ->get($url);

        $response->throw();

        $body = $response->body();

        return mb_substr($body, 0, self::MAX_BODY_BYTES, 'UTF-8');
    }

    private function parseOpenGraph(string $html): array
    {
        $result = [
            'company_name' => null,
            'job_title' => null,
            'job_description' => null,
        ];

        $xpath = $this->createXPath($html);

        foreach ($xpath->query('//meta[@property]') as $meta) {
            $property = $meta->getAttribute('property');
            $content = $meta->getAttribute('content');

            if ($content === '') {
                continue;
            }

            match ($property) {
                'og:site_name' => $result['company_name'] ??= $content,
                'og:title' => $result['job_title'] ??= $content,
                'og:description' => $result['job_description'] ??= $content,
                default => null,
            };
        }

        return $result;
    }

    private function parseSchemaOrg(string $html): array
    {
        $result = [
            'company_name' => null,
            'job_title' => null,
            'job_description' => null,
            'location' => null,
            'expected_salary' => null,
        ];

        $xpath = $this->createXPath($html);

        foreach ($xpath->query('//script[@type="application/ld+json"]') as $script) {
            $json = trim($script->textContent);
            if ($json === '') {
                continue;
            }

            try {
                $data = json_decode($json, true, flags: JSON_THROW_ON_ERROR);
            } catch (JsonException) {
                continue;
            }

            $graphs = $data['@graph'] ?? [$data];

            foreach ($graphs as $item) {
                if (($item['@type'] ?? null) !== 'JobPosting') {
                    continue;
                }

                $result['job_title'] ??= $item['title'] ?? null;
                $result['job_description'] ??= $item['description'] ?? null;

                if (isset($item['hiringOrganization'])) {
                    $org = $item['hiringOrganization'];
                    $result['company_name'] ??= is_string($org) ? $org : ($org['name'] ?? null);
                }

                if (isset($item['jobLocation'])) {
                    $loc = $item['jobLocation'];
                    if (is_string($loc)) {
                        $result['location'] ??= $loc;
                    } elseif (isset($loc['address'])) {
                        $address = $loc['address'];
                        if (is_string($address)) {
                            $result['location'] ??= $address;
                        } else {
                            $parts = array_filter([
                                $address['addressLocality'] ?? null,
                                $address['addressRegion'] ?? null,
                                $address['addressCountry'] ?? null,
                            ]);
                            $result['location'] ??= implode(', ', $parts) ?: null;
                        }
                    }
                }

                if (isset($item['baseSalary'])) {
                    $salary = $item['baseSalary'];
                    $value = $salary['value'] ?? $salary;
                    if (is_array($value)) {
                        $minValue = $value['minValue'] ?? $value['value'] ?? null;
                        if ($minValue !== null) {
                            $result['expected_salary'] ??= (int) $minValue;
                        }
                    } elseif (is_numeric($value)) {
                        $result['expected_salary'] ??= (int) $value;
                    }
                }
            }
        }

        return $result;
    }

    private function mergeSchema(array $result, array $schema): array
    {
        foreach ($schema as $key => $value) {
            if ($value !== null) {
                $result[$key] = $value;
            }
        }

        return $result;
    }

    private function isIncomplete(array $result): bool
    {
        return empty($result['job_title']) || empty($result['company_name']);
    }

    private function fallbackToGemini(string $jobUrl, string $html): array
    {
        $pageText = $this->extractPageText($html);

        $result = $this->gemini->parseJobPosting($jobUrl, $pageText);

        return [
            'company_name' => $result['company_name'] ?: null,
            'job_title' => $result['job_title'] ?: null,
            'job_description' => $result['job_description'] ?: null,
            'location' => $result['location'] ?: null,
            'expected_salary' => ! empty($result['expected_salary']) ? (int) $result['expected_salary'] : null,
        ];
    }

    private function makeSafe(array $result): array
    {
        return [
            'company_name' => $result['company_name'] ?? null,
            'job_title' => $result['job_title'] ?? null,
            'job_description' => $result['job_description'] ?? null,
            'location' => $result['location'] ?? null,
            'expected_salary' => $result['expected_salary'] ?? null,
        ];
    }

    private function createXPath(string $html): DOMXPath
    {
        $dom = new DOMDocument;
        @$dom->loadHTML('<?xml encoding="utf-8" ?>'.$html, LIBXML_NOWARNING | LIBXML_NOERROR);

        return new DOMXPath($dom);
    }

    private function extractPageText(string $html): string
    {
        $xpath = $this->createXPath($html);

        $blocks = [];
        foreach ($xpath->query('//h1 | //h2 | //h3 | //h4 | //p | //li | //td | //th') as $node) {
            $text = trim($node->textContent);
            if ($text !== '') {
                $blocks[] = $text;
            }
        }

        return implode("\n", $blocks);
    }
}
