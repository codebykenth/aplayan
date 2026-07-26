# 07 — Ephemeral Resume Upload & AI Match Analysis Feature

**What to build:** An in-memory resume text extractor and AI Match Analysis modal allowing users to upload/paste a resume, trigger Gemini AI analysis, and save Match Score (0-100%), Strengths, and Qualification Gaps to the application record without saving any resume files or text to storage/database.

**Blocked by:** 05 — Mobile-Friendly Application Detail Modal & Status Picker, 06 — Google Gemini AI Service Abstraction

**Status:** ready-for-agent

- [ ] Implement `JobApplicationAiController` with `analyzeMatch` method calling `GeminiService`.
- [ ] Implement in-memory text parsing for uploaded PDF/TXT resume files or pasted text payload. Ensure zero files or text are saved to disk or DB.
- [ ] Save `ai_match_percentage`, `ai_strengths`, `ai_gaps`, and `ai_evaluated_at` on the `JobApplication` record upon successful AI response.
- [ ] Add "Run AI Resume Match" modal UI trigger inside the Application Detail view displaying match progress and rendered results (score badge, strengths list, gaps list).
- [ ] Write Pest feature tests in `tests/Feature/JobApplicationAiTest.php` with `Http::fake()`.
