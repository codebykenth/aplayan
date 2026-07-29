# Issue 41: AI Resume Matcher Accuracy & Custom Text Persistence

## Goal
Enhance the precision and accuracy of the AI Resume Matcher evaluation engine by implementing a structured weighted scoring rubric with sub-category breakdowns, semantic ecosystem matching, and text section normalization. Resolve state persistence and dropdown selection defects so custom resume edits and selected resume templates persist reliably across reloads without reverting to default profiles.

## User Story
As an Aplayan applicant, I want my resume to be evaluated accurately against job descriptions using weighted metrics (Tech Stack, Work Experience, Seniority, Education) and sub-score indicators, while ensuring any custom text or template I choose stays saved and selected across sessions.

## Scope & Technical Requirements

### 1. Weighted Rubric & Sub-Category Matching (`app/Services/GeminiService.php`)
- **System Prompt Overhaul**: Enforce a 4-part weighted scoring rubric within Gemini evaluation prompts:
  - **Tech Stack & Hard Skills**: 40%
  - **Experience & Relevance**: 35%
  - **Role Seniority & Responsibilities**: 15%
  - **Education & Certifications**: 10%
- **Sub-Category Breakdown Metrics**:
  - `match_percentage` (0-100)
  - `tech_stack_percentage` (0-100)
  - `experience_percentage` (0-100)
  - `education_percentage` (0-100)
- **Semantic Ecosystem Equivalence**: Instruct Gemini to award 75% partial credit for ecosystem-adjacent technologies (e.g. React -> Next.js, MySQL -> PostgreSQL, Docker -> Kubernetes).

### 2. Resume Text Section Normalization (`app/Services/AiEntityNormalizer.php`)
- Standardize raw resume inputs into clear markdown sections before invoking AI endpoints:
  - `## SUMMARY`
  - `## WORK EXPERIENCE`
  - `## SKILLS & TECHNOLOGIES`
  - `## EDUCATION & CERTIFICATIONS`

### 3. State & Selection Persistence (`resources/js/components/job-applications/ai-copilot-tab.tsx`)
- **Database Initial Load**: Check `application.ai_resume_text` upon mount:
  - If present: Load saved evaluated text and set dropdown state to `✏️ Custom / Analyzed Resume Text`.
  - If absent: Fall back to formatted master resume profile and set dropdown to `📌 Master Resume Profile`.
- **Text Area Synchronization**: Dynamically set dropdown to `✏️ Custom / Analyzed Resume Text` on user keystrokes in the resume textarea.
- **Cache Unique Constraint Fix**: Update `storeInCache()` in `app/Services/AiCacheService.php` to use `updateOrCreate()` to prevent `SQLSTATE[23505]` duplicate key violations on forced re-evaluations.

### 4. Copilot Match Score UI Component (`resources/js/components/job-applications/ai-copilot-tab.tsx`)
- Display visual sub-progress indicators for **Tech Stack Match**, **Experience Match**, and **Education Match**.
- Maintain full-width card layout for Key Strengths and Skill Gaps grid.

## Acceptance Criteria
- [ ] AI Match evaluation returns structured sub-category percentages (`tech_stack_percentage`, `experience_percentage`, `education_percentage`).
- [ ] Sub-category metrics are displayed visually inside the Resume Match Score card.
- [ ] Resume text is normalized with markdown headers before sending to Gemini.
- [ ] Custom resume text and template selections persist across page reloads and tab switches.
- [ ] Forced re-evaluations update database cache records using `updateOrCreate()` without duplicate key errors.
- [ ] Development environments bypass rate limits (`Limit::none()`).

## Verification Plan
### Automated Tests
- `php artisan test --compact --filter=JobApplicationAiControllerTest`
- `php artisan test --compact --filter=AiCacheServiceTest`

### Manual Verification
- Test running AI Match with custom resume text and verify persistence on reload.
- Verify sub-category breakdown progress bars in the AI Copilot tab.
