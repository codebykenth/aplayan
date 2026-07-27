# Issue 28: Zero-Cost Serverless AI Caching & Entity Normalization Engine

## Goal
Implement a production-grade, zero-cost AI response caching and entity normalization engine (`AiCacheService` & `ai_responses_cache`) to reduce Google Gemini API token usage by up to 80%, enforce daily per-user uncached rate limits, guarantee 100% serverless compatibility on Vercel, and provide deterministic fallback rules (`AiFallbackService`) during AI service outages.

## User Story
As a user of Aplayan, I want instant (<10ms) responses for popular job match evaluations and content polishes without hitting daily rate limits, so that the AI assistance is 100% free, fast, and resilient even when third-party AI services experience downtime.

## Scope & Technical Requirements

### 1. Entity Normalization Engine (`app/Services/AiEntityNormalizer.php`)
- **Company Normalizer**: Strips regional and corporate suffixes (`Inc.`, `Corp`, `LLC`, `Ltd`, `Philippines`, `Pty`, `GmbH`).
  - *Example*: `"Canva Philippines Inc."` -> `"canva"`
- **Job Title Normalizer**: Standardizes common tech abbreviations (`Sr.` -> `Senior`, `Dev` -> `Developer`, `Eng` -> `Engineer`, `Lead` -> `Lead`).
  - *Example*: `"Sr. React Dev"` -> `"senior react developer"`
- **Description Fingerprint**: Cleans HTML tags, punctuation, and extra whitespace, taking a 500-character content snippet.
- **Canonical Key Generator**:
  - `sha256("job_match:" . $normalizedCompany . "|" . $normalizedTitle . "|" . sha256($cleanSnippet))`

### 2. Database Migration & Schema (`database/migrations/xxxx_create_ai_responses_cache_table.php`)
- `id` (bigint, primary)
- `canonical_key` (string, unique index)
- `feature_type` (string: `job_match`, `salary_check`, `resume_polish`, `cover_letter_polish`, `interview_prep`)
- `normalized_company` (string, nullable index)
- `normalized_title` (string, nullable index)
- `response_data` (json)
- `hit_count` (integer, default 1)
- `expires_at` (timestamp, nullable)
- `timestamps()`

### 3. Service Layer Integration (`app/Services/AiCacheService.php` & `app/Services/GeminiService.php`)
- **Cache-First Pattern**: Check Redis/Laravel RAM cache (`Cache::get($key)`) -> Check DB (`AiResponseCache::findByCanonicalKey($key)`).
- **Cache Hit**: Increment `hit_count` asynchronously, return response in <10ms with `0` tokens consumed and `0` daily quota points deducted.
- **Cache Miss**:
  - Check user's daily rate limit (10 uncached requests per 24 hours via `RateLimiter`).
  - If allowed: Call `GeminiService` synchronously, save response to `ai_responses_cache`, decrement user daily quota, return response.
  - If limit reached: Return friendly status warning (`"Daily limit reached (10/10). Cached responses remain unlimited."`) and trigger `AiFallbackService`.

### 4. Resilient Fallback Engine (`app/Services/AiFallbackService.php`)
- Triggers on HTTP 429 (Rate Limit), HTTP 503 (Outage), or network timeout.
- Computes deterministic PHP keyword intersection scores for Job Match Analysis and applies regex formatting for text polishing.
- Displays badge: `"Generated via Smart Analysis (AI provider busy)"`.

## Acceptance Criteria
- [ ] Different user inputs for the same job post (e.g. `"Canva Inc."` and `"Canva"`) resolve to identical canonical keys and trigger a Cache Hit.
- [ ] Cache hits take 0 Gemini API tokens and respond in sub-10ms.
- [ ] Cache hits do not decrement the user's 10/day uncached limit.
- [ ] Uncached requests execute synchronously (100% serverless Vercel compatible).
- [ ] External Gemini API timeouts/errors trigger `AiFallbackService` without crashing the UI.
- [ ] Unit & Feature tests verify normalization, caching, rate limiting, and fallback execution.

## Verification Plan
### Automated Tests
- `php artisan test --filter=AiCacheServiceTest`
- `php artisan test --filter=GeminiServiceTest`
- `php artisan test --compact`

### Manual Verification
- Test identical and variations of job posts in AI Match Analysis modal.
- Verify sub-10ms response time on repeat analyses.
