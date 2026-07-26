# 15 — Interview Prep & Follow-Up Tracker

**What to build:** Per-application interview scheduling with countdown badges, AI-generated interview prep questions via GeminiService, follow-up reminders with staleness indicators, and an interview notes field for recording interviewer names, questions asked, and personal observations.

**Blocked by:** 05 — Full Application Detail & Edit Modal, 06 — Gemini AI Service Integration

**Status:** ready-for-agent

- [ ] Add `interview_date` (datetime, nullable), `interview_notes` (text, nullable), and `last_contacted_at` (date, nullable) columns to `job_applications` migration.
- [ ] Display countdown badge ("Interview in 2 days") on Kanban cards when `interview_date` is set and status is `interviewing`.
- [ ] Add "Generate Interview Prep" button inside `application-detail-modal.tsx` that calls GeminiService with the job description to produce role-specific interview questions and talking points.
- [ ] Create `InterviewPrepController` (`POST /job-applications/{id}/interview-prep`) invoking GeminiService and returning AI-generated prep content.
- [ ] Store AI interview prep results (`ai_interview_prep` JSON column) on the application record to avoid repeat API calls.
- [ ] Add interview notes textarea inside the detail modal for recording post-interview observations.
- [ ] Write Pest feature tests in `tests/Feature/InterviewPrepTest.php`.
