<?php

namespace App\Services;

class AiEntityNormalizer
{
    private const COMPANY_SUFFIXES = [
        '/\bpty\.?\s*ltd\.?$/i',
        '/\bcorporation$/i',
        '/\bcompany$/i',
        '/\bphilippines\b/i',
        '/\blimited$/i',
        '/\binc\.?$/i',
        '/\bcorp\.?$/i',
        '/\bllc\.?$/i',
        '/\bltd\.?$/i',
        '/\bgmbh\.?$/i',
        '/\bco\.?$/i',
        '/\bcorp$/i',
    ];

    private const JOB_TITLE_REPLACEMENTS = [
        '/\bsr\.?\b/i' => 'senior',
        '/\bjr\.?\b/i' => 'junior',
        '/\bdev\b/i' => 'developer',
        '/\beng\b/i' => 'engineer',
        '/\blead\b/i' => 'lead',
        '/\bmgr\b/i' => 'manager',
        '/\bdir\b/i' => 'director',
        '/\bvp\b/i' => 'vice president',
        '/\bcto\b/i' => 'chief technology officer',
        '/\bceo\b/i' => 'chief executive officer',
        '/\bcfo\b/i' => 'chief financial officer',
        '/\bcoo\b/i' => 'chief operating officer',
        '/\bml\b/i' => 'machine learning',
        '/\bai\b/i' => 'artificial intelligence',
        '/\bui\b/i' => 'user interface',
        '/\bux\b/i' => 'user experience',
        '/\bfe\b/i' => 'frontend',
        '/\bbe\b/i' => 'backend',
        '/\bqa\b/i' => 'quality assurance',
        '/\bsre\b/i' => 'site reliability engineer',
        '/\btech lead\b/i' => 'technical lead',
    ];

    public function normalizeCompany(string $name): string
    {
        $normalized = trim(mb_strtolower($name));
        $normalized = preg_replace('/[^a-z0-9\s]/', '', $normalized);

        $previous = '';
        while ($previous !== $normalized) {
            $previous = $normalized;
            foreach (self::COMPANY_SUFFIXES as $pattern) {
                $normalized = preg_replace($pattern, '', $normalized);
            }
            $normalized = trim($normalized);
        }

        $normalized = preg_replace('/\s+/', ' ', $normalized);

        return trim($normalized);
    }

    public function normalizeJobTitle(string $title): string
    {
        $normalized = trim(mb_strtolower($title));
        $normalized = preg_replace('/[^a-z0-9\s]/', ' ', $normalized);
        $normalized = preg_replace('/\s+/', ' ', $normalized);

        foreach (self::JOB_TITLE_REPLACEMENTS as $pattern => $replacement) {
            $normalized = preg_replace($pattern, $replacement, $normalized);
        }

        return trim($normalized);
    }

    public function createDescriptionFingerprint(string $description): string
    {
        $cleaned = strip_tags($description);
        $cleaned = preg_replace('/[^\w\s]/', '', $cleaned);
        $cleaned = preg_replace('/\s+/', ' ', $cleaned);
        $cleaned = trim(mb_strtolower($cleaned));

        return mb_substr($cleaned, 0, 500);
    }

    public function generateCanonicalKey(string $featureType, string $company, string $jobTitle, string $description): string
    {
        $normalizedCompany = $this->normalizeCompany($company);
        $normalizedTitle = $this->normalizeJobTitle($jobTitle);
        $fingerprint = $this->createDescriptionFingerprint($description);
        $descriptionHash = hash('sha256', $fingerprint);
        $payload = "{$featureType}:{$normalizedCompany}|{$normalizedTitle}|{$descriptionHash}";

        return hash('sha256', $payload);
    }
}
