# 10 — Job URL Auto-Extractor Service & Form Autofill (Two-Tier Zero-Token Hybrid)

**What to build:** Server-side URL fetching service (`JobUrlParserService`) that attempts zero-token OpenGraph / Schema.org `JobPosting` JSON-LD microdata extraction first, falling back to `GeminiService` only when metadata is missing, automatically populating the form fields.

**Blocked by:** 06 — Synchronous GeminiService Architecture, 03 — Application List & Form UI

**Status:** ready-for-agent

- [ ] Create `JobUrlParserController` (`POST /api/job-applications/parse-url`) and `JobUrlParserRequest` validating incoming `job_url`.
- [ ] Implement `JobUrlParserService` using Laravel `Http` facade to fetch public page content.
- [ ] Add zero-token microdata parser extracting OpenGraph (`og:title`, `og:description`, `og:site_name`) and Schema.org `JobPosting` JSON-LD (`title`, `hiringOrganization`, `jobLocation`, `baseSalary`).
- [ ] Add conditional fallback to `GeminiService` ONLY if primary microdata parsing returns incomplete attributes.
- [ ] Add an "Autofill from Link" URL input & action button in `job-application-form.tsx` that populates form fields dynamically upon success.
- [ ] Write Pest feature tests in `tests/Feature/JobUrlParserTest.php` asserting zero-token microdata extraction and fallback execution.
