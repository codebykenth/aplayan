<?php

namespace App\Services;

use App\Models\AiResponseCache;
use App\Models\AiUsageLog;
use App\Models\User;
use Illuminate\Cache\RateLimiter;
use Illuminate\Http\Client\RequestException;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Log;
use Illuminate\Validation\ValidationException;
use JsonException;

class AiCacheService
{
    private const int UNCACHED_LIMIT = 10;

    private const int CACHE_TTL_SECONDS = 86400;

    private const float INPUT_TOKEN_COST = 0.075;

    private const float OUTPUT_TOKEN_COST = 0.30;

    public function __construct(
        private GeminiService $gemini,
        private AiEntityNormalizer $normalizer,
        private AiFallbackService $fallback,
        private RateLimiter $rateLimiter,
    ) {}

    public function resumeMatch(string $companyName, string $jobTitle, string $jobDescription, string $resumeText, int $userId, bool $forceRefresh = false): array
    {
        $user = $this->loadUser($userId);

        $this->ensureAiEnabled($user);

        $resumeFingerprint = $this->normalizer->createDescriptionFingerprint($resumeText);
        $canonicalKey = $this->normalizer->generateCanonicalKey('job_match', $companyName, $jobTitle, $jobDescription.'|resume:'.$resumeFingerprint);

        if (! $forceRefresh) {
            $cached = $this->getFromCache($canonicalKey);
            if ($cached !== null) {
                $this->logUsage($user, 'job_match', true);

                return $cached;
            }
        }

        $uncachedKey = "ai-uncached:{$userId}";
        $effectiveLimit = $user->custom_ai_daily_limit ?? self::UNCACHED_LIMIT;

        if ($this->isUncachedLimitReached($uncachedKey, $effectiveLimit)) {
            return $this->fallback->computeJobMatchScore($jobDescription, $resumeText);
        }

        try {
            $result = $this->gemini->analyzeResumeMatch($jobDescription, $resumeText);

            $this->logUsage($user, 'job_match', false, $this->gemini->getLastUsageMetadata());

            $this->storeInCache($canonicalKey, 'job_match', $this->normalizer->normalizeCompany($companyName), $this->normalizer->normalizeJobTitle($jobTitle), $result);

            $this->rateLimiter->hit($uncachedKey, 86400);

            return $result;
        } catch (\Throwable $e) {
            Log::error('Gemini API resume match error: '.$e->getMessage(), ['exception' => $e]);

            $fallback = $this->fallback->computeJobMatchScore($jobDescription, $resumeText);
            $fallback['_error'] = $e->getMessage();

            return $fallback;
        }
    }

    public function salaryCheck(string $jobTitle, string $location, ?string $jobDescription, int $userId): array
    {
        $user = $this->loadUser($userId);

        $this->ensureAiEnabled($user);

        $canonicalKey = $this->normalizer->generateCanonicalKey('salary_check', '', $jobTitle, $jobDescription ?? '');

        $cached = $this->getFromCache($canonicalKey);
        if ($cached !== null) {
            $this->logUsage($user, 'salary_check', true);

            return $cached;
        }

        $uncachedKey = "ai-uncached:{$userId}";
        $effectiveLimit = $user->custom_ai_daily_limit ?? self::UNCACHED_LIMIT;

        if ($this->isUncachedLimitReached($uncachedKey, $effectiveLimit)) {
            return $this->fallback->computeJobMatchScore($jobDescription ?? '', $jobTitle);
        }

        try {
            $result = $this->gemini->estimateSalary($jobTitle, $location, $jobDescription);

            $this->logUsage($user, 'salary_check', false, $this->gemini->getLastUsageMetadata());

            $this->storeInCache($canonicalKey, 'salary_check', null, $this->normalizer->normalizeJobTitle($jobTitle), $result);

            $this->rateLimiter->hit($uncachedKey, 86400);

            return $result;
        } catch (\Throwable $e) {
            Log::error('Gemini API salary check error: '.$e->getMessage(), ['exception' => $e]);

            $fallback = $this->fallback->computeJobMatchScore($jobDescription ?? '', $jobTitle);
            $fallback['_error'] = $e->getMessage();

            return $fallback;
        }
    }

    public function interviewPrep(string $jobDescription, int $userId): array
    {
        $user = $this->loadUser($userId);

        $this->ensureAiEnabled($user);

        $canonicalKey = $this->normalizer->generateCanonicalKey('interview_prep', '', '', $jobDescription);

        $cached = $this->getFromCache($canonicalKey);
        if ($cached !== null) {
            $this->logUsage($user, 'interview_prep', true);

            return $cached;
        }

        $uncachedKey = "ai-uncached:{$userId}";
        $effectiveLimit = $user->custom_ai_daily_limit ?? self::UNCACHED_LIMIT;

        if ($this->isUncachedLimitReached($uncachedKey, $effectiveLimit)) {
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

            $this->logUsage($user, 'interview_prep', false, $this->gemini->getLastUsageMetadata());

            $this->storeInCache($canonicalKey, 'interview_prep', null, null, $result);

            $this->rateLimiter->hit($uncachedKey, 86400);

            return $result;
        } catch (\Throwable $e) {
            Log::error('Gemini API interview prep error: '.$e->getMessage(), ['exception' => $e]);

            return [
                'questions' => ['Tell me about yourself'],
                'talking_points' => ['Review the job description'],
                'tips' => ['Prepare based on the job requirements'],
                '_fallback' => true,
                '_badge' => 'Generated via Smart Analysis (AI provider busy)',
                '_error' => $e->getMessage(),
            ];
        }
    }

    public function generateCoverLetter(string $profileText, string $jobDescription, int $userId): string
    {
        $user = $this->loadUser($userId);

        $this->ensureAiEnabled($user);

        $fingerprint = $this->normalizer->createDescriptionFingerprint($profileText.$jobDescription);
        $canonicalKey = hash('sha256', "cover_letter:{$fingerprint}");

        $cached = $this->getFromCache($canonicalKey);
        if ($cached !== null && isset($cached['cover_letter'])) {
            $this->logUsage($user, 'cover_letter', true);

            return $cached['cover_letter'];
        }

        $uncachedKey = "ai-uncached:{$userId}";
        $effectiveLimit = $user->custom_ai_daily_limit ?? self::UNCACHED_LIMIT;

        if ($this->isUncachedLimitReached($uncachedKey, $effectiveLimit)) {
            return 'Generated via Smart Analysis (AI provider busy)';
        }

        try {
            $result = $this->gemini->generateCoverLetter($profileText, $jobDescription);

            $this->logUsage($user, 'cover_letter', false, $this->gemini->getLastUsageMetadata());

            $this->storeInCache($canonicalKey, 'cover_letter', null, null, ['cover_letter' => $result]);

            $this->rateLimiter->hit($uncachedKey, 86400);

            return $result;
        } catch (RequestException|JsonException $e) {
            return 'Generated via Smart Analysis (AI provider busy)';
        }
    }

    public function polishResumeSection(string $sectionType, string $content, string $context, int $userId): string
    {
        $user = $this->loadUser($userId);

        $this->ensureAiEnabled($user);

        $fingerprint = $this->normalizer->createDescriptionFingerprint($content.$context);
        $canonicalKey = hash('sha256', "resume_polish:{$sectionType}:{$fingerprint}");

        $cached = $this->getFromCache($canonicalKey);
        if ($cached !== null && isset($cached['polished'])) {
            $this->logUsage($user, 'resume_polish', true);

            return $cached['polished'];
        }

        $uncachedKey = "ai-uncached:{$userId}";
        $effectiveLimit = $user->custom_ai_daily_limit ?? self::UNCACHED_LIMIT;

        if ($this->isUncachedLimitReached($uncachedKey, $effectiveLimit)) {
            return $this->fallback->polishText($content);
        }

        try {
            $result = $this->gemini->polishResumeSection($sectionType, $content, $context);

            $this->logUsage($user, 'resume_polish', false, $this->gemini->getLastUsageMetadata());

            $this->storeInCache($canonicalKey, 'resume_polish', null, null, ['polished' => $result]);

            $this->rateLimiter->hit($uncachedKey, 86400);

            return $result;
        } catch (RequestException|JsonException $e) {
            return $this->fallback->polishText($content);
        }
    }

    public function improveCoverLetter(string $content, string $preset, int $userId): string
    {
        $user = $this->loadUser($userId);

        $this->ensureAiEnabled($user);

        $fingerprint = $this->normalizer->createDescriptionFingerprint($content);
        $canonicalKey = hash('sha256', "cover_letter_polish:{$preset}:{$fingerprint}");

        $cached = $this->getFromCache($canonicalKey);
        if ($cached !== null && isset($cached['improved'])) {
            $this->logUsage($user, 'cover_letter_polish', true);

            return $cached['improved'];
        }

        $uncachedKey = "ai-uncached:{$userId}";
        $effectiveLimit = $user->custom_ai_daily_limit ?? self::UNCACHED_LIMIT;

        if ($this->isUncachedLimitReached($uncachedKey, $effectiveLimit)) {
            return $this->fallback->polishText($content);
        }

        try {
            $result = $this->gemini->improveCoverLetter($content, $preset);

            $this->logUsage($user, 'cover_letter_polish', false, $this->gemini->getLastUsageMetadata());

            $this->storeInCache($canonicalKey, 'cover_letter_polish', null, null, ['improved' => $result]);

            $this->rateLimiter->hit($uncachedKey, 86400);

            return $result;
        } catch (RequestException|JsonException $e) {
            return $this->fallback->polishText($content);
        }
    }

    public function followUpEmail(string $companyName, string $jobTitle, int $daysSinceContact, string $status, int $userId): string
    {
        $user = $this->loadUser($userId);

        $this->ensureAiEnabled($user);

        $key = hash('sha256', "follow_up:{$this->normalizer->normalizeCompany($companyName)}|{$this->normalizer->normalizeJobTitle($jobTitle)}|{$daysSinceContact}|{$status}");
        $canonicalKey = hash('sha256', "follow_up:{$key}");

        $cached = $this->getFromCache($canonicalKey);
        if ($cached !== null && isset($cached['draft'])) {
            $this->logUsage($user, 'follow_up', true);

            return $cached['draft'];
        }

        $uncachedKey = "ai-uncached:{$userId}";
        $effectiveLimit = $user->custom_ai_daily_limit ?? self::UNCACHED_LIMIT;

        if ($this->isUncachedLimitReached($uncachedKey, $effectiveLimit)) {
            return 'Generated via Smart Analysis (AI provider busy)';
        }

        try {
            $result = $this->gemini->generateFollowUpEmail($companyName, $jobTitle, $daysSinceContact, $status);

            $this->logUsage($user, 'follow_up', false, $this->gemini->getLastUsageMetadata());

            $this->storeInCache($canonicalKey, 'follow_up', $this->normalizer->normalizeCompany($companyName), $this->normalizer->normalizeJobTitle($jobTitle), ['draft' => $result]);

            $this->rateLimiter->hit($uncachedKey, 86400);

            return $result;
        } catch (RequestException|JsonException $e) {
            return 'Generated via Smart Analysis (AI provider busy)';
        }
    }

    public function getRateLimitInfo(int $userId): array
    {
        $user = User::find($userId);

        $effectiveLimit = $user?->custom_ai_daily_limit ?? self::UNCACHED_LIMIT;

        if (! app()->isProduction()) {
            return [
                'remaining' => 999,
                'total' => 999,
                'exhausted' => false,
            ];
        }

        $uncachedKey = "ai-uncached:{$userId}";

        $remaining = max(0, $effectiveLimit - $this->rateLimiter->attempts($uncachedKey));

        return [
            'remaining' => $remaining,
            'total' => $effectiveLimit,
            'exhausted' => $remaining <= 0,
        ];
    }

    private function loadUser(int $userId): User
    {
        return User::findOrFail($userId);
    }

    private function ensureAiEnabled(User $user): void
    {
        if ($user->is_ai_disabled) {
            throw ValidationException::withMessages([
                'ai' => ['AI features are temporarily restricted for your account. Please contact support.'],
            ]);
        }
    }

    private function logUsage(User $user, string $featureType, bool $isCacheHit, ?array $usageMetadata = null): void
    {
        $promptTokens = 0;
        $completionTokens = 0;
        $totalTokens = 0;
        $model = config('services.gemini.model', 'gemini-3.6-flash');

        if (! $isCacheHit && $usageMetadata !== null) {
            $promptTokens = $usageMetadata['promptTokenCount'] ?? 0;
            $completionTokens = $usageMetadata['candidatesTokenCount'] ?? 0;
            $totalTokens = $usageMetadata['totalTokenCount'] ?? 0;
        }

        $estimatedCost = $this->calculateCost($promptTokens, $completionTokens, $model);

        AiUsageLog::create([
            'user_id' => $user->id,
            'feature_type' => $featureType,
            'model' => $model,
            'prompt_tokens' => $promptTokens,
            'completion_tokens' => $completionTokens,
            'total_tokens' => $totalTokens,
            'is_cache_hit' => $isCacheHit,
            'estimated_cost' => $estimatedCost,
        ]);
    }

    private function calculateCost(int $promptTokens, int $completionTokens, string $model): float
    {
        $isPro = str_contains(strtolower($model), 'pro');

        $inputRate = $isPro ? 1.25 : self::INPUT_TOKEN_COST;
        $outputRate = $isPro ? 5.00 : self::OUTPUT_TOKEN_COST;

        $inputCost = ($promptTokens * $inputRate) / 1_000_000;
        $outputCost = ($completionTokens * $outputRate) / 1_000_000;

        return round($inputCost + $outputCost, 6);
    }

    private function isUncachedLimitReached(string $uncachedKey, int $effectiveLimit): bool
    {
        if (! app()->isProduction()) {
            return false;
        }

        return $this->rateLimiter->tooManyAttempts($uncachedKey, $effectiveLimit);
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
        AiResponseCache::updateOrCreate(
            ['canonical_key' => $canonicalKey],
            [
                'feature_type' => $featureType,
                'normalized_company' => $normalizedCompany,
                'normalized_title' => $normalizedTitle,
                'response_data' => $responseData,
            ]
        );

        $ramKey = "ai_cache:{$canonicalKey}";
        Cache::put($ramKey, $responseData, now()->addSeconds(self::CACHE_TTL_SECONDS));
    }
}
