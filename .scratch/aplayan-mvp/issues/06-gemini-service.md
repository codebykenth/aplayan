# 06 — Google Gemini AI Service Abstraction

**What to build:** An encapsulated `GeminiService` class handling HTTP communications with Google Gemini API (`gemini-2.5-flash`), structured prompt formatting, JSON extraction, and exception handling.

**Blocked by:** 01 — Job Applications Database Schema & Migration

**Status:** ready-for-agent

- [ ] Create `App\Services\GeminiService` class using Laravel `Http` client reading `config('services.gemini.key')`.
- [ ] Implement `analyzeResumeMatch(string $jobDescription, string $resumeText)` method returning structured array: `['match_percentage' => int, 'strengths' => array, 'gaps' => array]`.
- [ ] Implement `estimateSalary(string $jobTitle, string $location, ?string $jobDescription)` method returning structured array: `['min_salary_php' => int, 'max_salary_php' => int, 'market_context' => string]`.
- [ ] Add config mapping in `config/services.php` for Gemini.
- [ ] Write Pest unit tests in `tests/Unit/GeminiServiceTest.php` using `Http::fake()` to verify JSON parsing and error handling.
