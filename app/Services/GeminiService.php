<?php

namespace App\Services;

use Illuminate\Http\Client\PendingRequest;
use Illuminate\Support\Arr;
use Illuminate\Support\Facades\Http;
use JsonException;

class GeminiService
{
    private const string MODEL = 'gemini-2.5-flash';

    private const int TIMEOUT = 30;

    private const int CONNECT_TIMEOUT = 5;

    public function analyzeResumeMatch(string $jobDescription, string $resumeText): array
    {
        $prompt = <<<PROMPT
You are an expert resume analyst. Analyze the following job description and resume text.
Return a JSON object with these exact keys:
- match_percentage (integer 0-100)
- strengths (array of strings)
- gaps (array of strings)

Job Description:
{$jobDescription}

Resume:
{$resumeText}
PROMPT;

        $response = $this->sendRequest($prompt);

        return $this->extractJson($response, ['match_percentage', 'strengths', 'gaps']);
    }

    public function estimateSalary(string $jobTitle, string $location, ?string $jobDescription): array
    {
        $desc = $jobDescription
            ? "Job Description:\n{$jobDescription}"
            : 'No job description provided.';

        $prompt = <<<PROMPT
You are a salary estimation expert. Based on the following job details, estimate the salary range.
Return a JSON object with these exact keys:
- min_salary_php (integer, annual PHP salary)
- max_salary_php (integer, annual PHP salary)
- market_context (string, brief explanation of the market context)

Job Title: {$jobTitle}
Location: {$location}
{$desc}
PROMPT;

        $response = $this->sendRequest($prompt);

        return $this->extractJson($response, ['min_salary_php', 'max_salary_php', 'market_context']);
    }

    private function client(): PendingRequest
    {
        return Http::timeout(self::TIMEOUT)
            ->connectTimeout(self::CONNECT_TIMEOUT)
            ->baseUrl('https://generativelanguage.googleapis.com/v1beta/models')
            ->withQueryParameters(['key' => config('services.gemini.key')])
            ->asJson();
    }

    private function sendRequest(string $prompt): array
    {
        return $this->client()
            ->retry([100, 500])
            ->post('/'.self::MODEL.':generateContent', [
                'contents' => [
                    [
                        'parts' => [
                            ['text' => $prompt],
                        ],
                    ],
                ],
            ])
            ->throw()
            ->json();
    }

    private function extractJson(array $response, array $expectedKeys): array
    {
        $text = $response['candidates'][0]['content']['parts'][0]['text'] ?? throw new JsonException('Unexpected API response structure');

        $parsed = json_decode($text, true, flags: JSON_THROW_ON_ERROR);

        $missing = array_diff($expectedKeys, array_keys($parsed));
        if ($missing !== []) {
            throw new JsonException('Missing keys in API response: '.implode(', ', $missing));
        }

        return Arr::only($parsed, $expectedKeys);
    }

    public function parseJobPosting(string $jobUrl, string $pageContent): array
    {
        $truncated = mb_substr($pageContent, 0, 30000, 'UTF-8');

        $prompt = <<<PROMPT
You are a job posting parser. Given the page content below from {$jobUrl}, extract the job details.
Return a JSON object with these exact keys:
- company_name (string)
- job_title (string)
- job_description (string, the full job description)
- location (string, or empty string if not found)
- expected_salary (integer, annual salary in PHP, or 0 if not found)

Page Content:
{$truncated}
PROMPT;

        $response = $this->sendRequest($prompt);

        return $this->extractJson($response, [
            'company_name', 'job_title', 'job_description', 'location', 'expected_salary',
        ]);
    }
}
