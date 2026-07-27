# 26 — Full-Page Documents Suite Redesign, Manual Cover Letter Creator & Daily AI Rate Limiting

**Status:** ready-for-agent

## Problem Statement

The previous Documents page relied on a cramped side-by-side grid layout (editor on left, preview on right) and a small modal dialog for AI cover letters. Job seekers need a distraction-free, full-page editing workspace for building resumes and cover letters, the ability to manually craft custom cover letters from scratch, synchronized visual styling between resume and cover letter application packets, and protection against hitting Gemini AI rate limits.

## Solution

Redesign the Documents suite (`/documents`) into 4 full-page views toggled via a top full-width segmented tab navigation switcher (`Resume Builder`, `Cover Letter Builder`, `Resume Preview`, `Cover Letter Preview`). Introduce a full-page Cover Letter editor with dual-mode support (manual scratchpad + AI generation/assist), synchronized template rendering (`Clean Minimal`, `Modern Professional`, `Philippine Standard`) across both document previews, targeted field-level `✨ AI Polish` triggers, and a daily rate limit per DAU (Daily Active User) to protect AI quotas and ensure system scalability.

## User Stories

1. As a job seeker, I want to switch seamlessly between full-page views for Resume Builder, Cover Letter Builder, Resume Preview, and Cover Letter Preview using a top segmented navigation bar, so that I can edit and inspect my documents in a full-width workspace without cramped side-by-side split screens.
2. As a job seeker, I want to manually type, edit, and format custom cover letters from scratch or load existing saved drafts in a dedicated full-page editor canvas, so that I can create cover letters without relying solely on AI modal popups.
3. As a job seeker, I want to generate a cover letter from my stored resume profile and job description directly inside the cover letter editor and immediately customize the output manually, so that I have complete control over my final application text.
4. As a job seeker, I want to select a document template (Clean Minimal, Modern Professional, Philippine Standard) that synchronizes matching header typography and layout across both my Resume Preview and Cover Letter Preview, so that my job application package looks cohesive and professional.
5. As a job seeker, I want targeted `✨ AI Polish` buttons on specific resume fields (Summary, Work Experience, Projects) and cover letter content presets (`Polish & Grammar`, `Make Concise`, `Make Formal`), so that I can refine specific sections without overwriting my whole document.
6. As a system administrator, I want to enforce a daily AI action limit per user on backend routes (`RateLimiter::for('ai')`) with friendly UI cooldown timers and error notifications, so that Gemini API quota limits are protected and costs scale predictably.

## Implementation Decisions

- **View Architecture**: Top full-width segmented view navigation bar (`resume-edit`, `cover-letter-edit`, `resume-preview`, `cover-letter-preview`) with transient client-side state preservation in Inertia React.
- **Cover Letter Builder**: Full-page editor canvas with target job metadata inputs (Job Title, Company Name, Job Description), quick action toolbar (`✨ AI Generate`, `📝 Clear / Start Manual`, `📁 Load Saved`, `✨ AI Polish`), full-height textarea editor, and direct saving to `saved_cover_letters`.
- **Targeted AI Polish API**: Add controller endpoints (`/documents/ai-improve-resume`, `/documents/ai-improve-cover-letter`) powered by `GeminiService::polishResumeSection()` and `GeminiService::improveCoverLetter()`.
- **Daily Rate Limiting**: Enforce user-scoped daily limits (e.g. 20 AI calls/day) using Laravel `RateLimiter` facade or route middleware, with graceful `429 Too Many Requests` error handling and client-side button debouncing.
- **Synchronized Preview Engine**: Full-page printable preview views for both Resume and Cover Letter with shared template engine (`clean`, `modern`, `philippine`), PDF download (`window.print()`), copy text, version saving, and direct edit navigation.

## Testing Decisions

- **Backend Feature Tests (`DocumentTest.php`)**: Test authorization, profile saving, manual cover letter saving, AI generation routes, and rate limiter enforcement when daily AI limits are exceeded.
- **Service Unit Tests (`GeminiServiceTest.php`)**: Test prompt construction and fallback handling for section-level resume polish and cover letter improvement presets.

## Out of Scope

- Rich text WYSIWYG HTML canvas editors (using clean formatted plain text textareas with live print-styled previews).
- Storing generated PDF files as binary assets in cloud storage or disk.

## Further Notes

- Architectural decisions recorded in `docs/adr/0005-full-page-documents-redesign-and-ai-rate-limiting.md`.
