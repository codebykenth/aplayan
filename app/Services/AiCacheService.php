<?php

namespace App\Services;

use App\Models\AiResponseCache;
use Illuminate\Cache\RateLimiter;
use Illuminate\Http\Client\RequestException;
use Illuminate\Support\Facades\Cache;
use JsonException;

class AiCacheService
{
    private const int UNCACHED_LIMIT = 10;

    private const int CACHE_TTL_SECONDS = 86400;

    public function __construct(
        private GeminiService $gemini,
        private AiEntityNormalizer $normalizer,
        private AiFallbackService $fallback,
        private RateLimiter $rateLimiter,
    ) {}

    public function resumeMatch(string $companyName, string $jobTitle, string $jobDescription, string $resumeText, int $userId): array
    {
        $canonicalKey = $this->normalizer->generateCanonicalKey('job_match', $companyName, $jobTitle, $jobDescription);

        $cached = $this->getFromCache($canonicalKey);
        if ($cached !== null) {
            return $cached;
        }

        $uncachedKey = "ai-uncached:{$userId}";

        if ($this->rateLimiter->tooManyAttempts($uncachedKey, self::UNCACHED_LIMIT)) {
            return $this->fallback->computeJobMatchScore($jobDescription, $resumeText);
        }

        try {
            $result = $this->gemini->analyzeResumeMatch($jobDescription, $resumeText);

            $this->storeInCache($canonicalKey, 'job_match', $this->normalizer->normalizeCompany($companyName), $this->normalizer->normalizeJobTitle($jobTitle), $result);

            $this->rateLimiter->hit($uncachedKey, 86400);

            return $result;
        } catch (RequestException|JsonException $e) {
            return $this->fallback->computeJobMatchScore($jobDescription, $resumeText);
        }
    }

    public function salaryCheck(string $jobTitle, string $location, ?string $jobDescription, int $userId): array
    {
        $canonicalKey = $this->normalizer->generateCanonicalKey('salary_check', '', $jobTitle, $jobDescription ?? '');

        $cached = $this->getFromCache($canonicalKey);
        if ($cached !== null) {
            return $cached;
        }

        $uncachedKey = "ai-uncached:{$userId}";

        if ($this->rateLimiter->tooManyAttempts($uncachedKey, self::UNCACHED_LIMIT)) {
            return $this->fallback->computeJobMatchScore($jobDescription ?? '', $jobTitle);
        }

        try {
            $result = $this->gemini->estimateSalary($jobTitle, $location, $jobDescription);

            $this->storeInCache($canonicalKey, 'salary_check', null, $this->normalizer->normalizeJobTitle($jobTitle), $result);

            $this->rateLimiter->hit($uncachedKey, 86400);

            return $result;
        } catch (RequestException|JsonException $e) {
            return $this->fallback->computeJobMatchScore($jobDescription ?? '', $jobTitle);
        }
    }

    public function interviewPrep(string $jobDescription, int $userId): array
    {
        $canonicalKey = $this->normalizer->generateCanonicalKey('interview_prep', '', '', $jobDescription);

        $cached = $this->getFromCache($canonicalKey);
        if ($cached !== null) {
            return $cached;
        }

        $uncachedKey = "ai-uncached:{$userId}";

        if ($this->rateLimiter->tooManyAttempts($uncachedKey, self::UNCACHED_LIMIT)) {
            return [
                'questions' => ['Tell me about yourself'],
                'talking_points' => ['Review the job description'],
                'tips' => ['Prepare based on the job requirements'],
                '_fallback' => true,
                '_badge' => 'Generated via Smart Analysis (AI provider busy)',
            ];
        }

        try {
            $result = $this->gemini->generateInterviewPrep($jobDescription);

            $this->storeInCache($canonicalKey, 'interview_prep', null, null, $result);

            $this->rateLimiter->hit($uncachedKey, 86400);

            return $result;
        } catch (RequestException|JsonException $e) {
            return [
                'questions' => ['Tell me about yourself'],
                'talking_points' => ['Review the job description'],
                'tips' => ['Prepare based on the job requirements'],
                '_fallback' => true,
                '_badge' => 'Generated via Smart Analysis (AI provider busy)',
            ];
        }
    }

    public function generateCoverLetter(string $profileText, string $jobDescription, int $userId): string
    {
        $fingerprint = $this->normalizer->createDescriptionFingerprint($profileText.$jobDescription);
        $canonicalKey = hash('sha256', "cover_letter:{$fingerprint}");

        $cached = $this->getFromCache($canonicalKey);
        if ($cached !== null && isset($cached['cover_letter'])) {
            return $cached['cover_letter'];
        }

        $uncachedKey = "ai-uncached:{$userId}";

        if ($this->rateLimiter->tooManyAttempts($uncachedKey, self::UNCACHED_LIMIT)) {
            return 'Generated via Smart Analysis (AI provider busy)';
        }

        try {
            $result = $this->gemini->generateCoverLetter($profileText, $jobDescription);

            $this->storeInCache($canonicalKey, 'cover_letter', null, null, ['cover_letter' => $result]);

            $this->rateLimiter->hit($uncachedKey, 86400);

            return $result;
        } catch (RequestException|JsonException $e) {
            return 'Generated via Smart Analysis (AI provider busy)';
        }
    }

    public function polishResumeSection(string $sectionType, string $content, string $context, int $userId): string
    {
        $fingerprint = $this->normalizer->createDescriptionFingerprint($content.$context);
        $canonicalKey = hash('sha256', "resume_polish:{$sectionType}:{$fingerprint}");

        $cached = $this->getFromCache($canonicalKey);
        if ($cached !== null && isset($cached['polished'])) {
            return $cached['polished'];
        }

        $uncachedKey = "ai-uncached:{$userId}";

        if ($this->rateLimiter->tooManyAttempts($uncachedKey, self::UNCACHED_LIMIT)) {
            return $this->fallback->polishText($content);
        }

        try {
            $result = $this->gemini->polishResumeSection($sectionType, $content, $context);

            $this->storeInCache($canonicalKey, 'resume_polish', null, null, ['polished' => $result]);

            $this->rateLimiter->hit($uncachedKey, 86400);

            return $result;
        } catch (RequestException|JsonException $e) {
            return $this->fallback->polishText($content);
        }
    }

    public function improveCoverLetter(string $content, string $preset, int $userId): string
    {
        $fingerprint = $this->normalizer->createDescriptionFingerprint($content);
        $canonicalKey = hash('sha256', "cover_letter_polish:{$preset}:{$fingerprint}");

        $cached = $this->getFromCache($canonicalKey);
        if ($cached !== null && isset($cached['improved'])) {
            return $cached['improved'];
        }

        $uncachedKey = "ai-uncached:{$userId}";

        if ($this->rateLimiter->tooManyAttempts($uncachedKey, self::UNCACHED_LIMIT)) {
            return $this->fallback->polishText($content);
        }

        try {
            $result = $this->gemini->improveCoverLetter($content, $preset);

            $this->storeInCache($canonicalKey, 'cover_letter_polish', null, null, ['improved' => $result]);

            $this->rateLimiter->hit($uncachedKey, 86400);

            return $result;
        } catch (RequestException|JsonException $e) {
            return $this->fallback->polishText($content);
        }
    }

    public function followUpEmail(string $companyName, string $jobTitle, int $daysSinceContact, string $status, int $userId): string
    {
        $key = hash('sha256', "follow_up:{$this->normalizer->normalizeCompany($companyName)}|{$this->normalizer->normalizeJobTitle($jobTitle)}|{$daysSinceContact}|{$status}");
        $canonicalKey = hash('sha256', "follow_up:{$key}");

        $cached = $this->getFromCache($canonicalKey);
        if ($cached !== null && isset($cached['draft'])) {
            return $cached['draft'];
        }

        $uncachedKey = "ai-uncached:{$userId}";

        if ($this->rateLimiter->tooManyAttempts($uncachedKey, self::UNCACHED_LIMIT)) {
            return 'Generated via Smart Analysis (AI provider busy)';
        }

        try {
            $result = $this->gemini->generateFollowUpEmail($companyName, $jobTitle, $daysSinceContact, $status);

            $this->storeInCache($canonicalKey, 'follow_up', $this->normalizer->normalizeCompany($companyName), $this->normalizer->normalizeJobTitle($jobTitle), ['draft' => $result]);

            $this->rateLimiter->hit($uncachedKey, 86400);

            return $result;
        } catch (RequestException|JsonException $e) {
            return 'Generated via Smart Analysis (AI provider busy)';
        }
    }

    public function getRateLimitInfo(int $userId): array
    {
        $uncachedKey = "ai-uncached:{$userId}";

        $remaining = max(0, self::UNCACHED_LIMIT - $this->rateLimiter->attempts($uncachedKey));

        return [
            'remaining' => $remaining,
            'total' => self::UNCACHED_LIMIT,
            'exhausted' => $remaining <= 0,
        ];
    }

    private function getFromCache(string $canonicalKey): ?array
    {
        $ramKey = "ai_cache:{$canonicalKey}";

        $cached = Cache::get($ramKey);
        if ($cached !== null) {
            return $cached;
        }

        $record = AiResponseCache::byCanonicalKey($canonicalKey)->first();

        if ($record === null) {
            return null;
        }

        if ($record->expires_at !== null && $record->expires_at->isPast()) {
            return null;
        }

        Cache::put($ramKey, $record->response_data, now()->addSeconds(self::CACHE_TTL_SECONDS));

        $record->increment('hit_count');

        return $record->response_data;
    }

    private function storeInCache(string $canonicalKey, string $featureType, ?string $normalizedCompany, ?string $normalizedTitle, array $responseData): void
    {
        AiResponseCache::create([
            'canonical_key' => $canonicalKey,
            'feature_type' => $featureType,
            'normalized_company' => $normalizedCompany,
            'normalized_title' => $normalizedTitle,
            'response_data' => $responseData,
        ]);

        $ramKey = "ai_cache:{$canonicalKey}";
        Cache::put($ramKey, $responseData, now()->addSeconds(self::CACHE_TTL_SECONDS));
    }
}
