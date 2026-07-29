# Feature Specification: AI Resume Matcher Accuracy & Custom Text Persistence

## Problem Statement

Users of the Aplayan Job Copilot experience two primary issues when evaluating their resume against job descriptions:

1. **Arbitrary Match Scores**: The current AI resume matching system queries Gemini with a simple prompt that requests an integer score without explicit evaluation criteria, leading to unpredictable scores that lack domain-specific calibration (such as weighting tech stack vs. years of experience). Furthermore, sub-category match metrics (e.g. Tech Stack match vs. Education match) are unavailable to the user.
2. **Resume Selection & Persistence Issues**: When a user inputs custom resume text (or selects a saved resume template) and triggers an AI match evaluation, reloading the page or switching tabs sometimes reverts the UI back to displaying the Master Resume Profile instead of preserving and selecting the exact custom text version that was evaluated and stored in the database.

## Solution

1. **Weighted Rubric & Sub-Category AI Matching**:
   - Overhaul the AI system prompt to enforce a strict weighted rubric: **Tech Stack & Hard Skills (40%)**, **Experience & Relevance (35%)**, **Role Seniority & Responsibilities (15%)**, and **Education / Certifications (10%)**.
   - Incorporate Chain-of-Thought step-by-step reasoning and semantic ecosystem equivalence (granting partial credit for ecosystem-adjacent skills like React → Next.js or PostgreSQL → MySQL).
   - Expand the AI API output to return explicit sub-category breakdown percentages (`tech_stack_percentage`, `experience_percentage`, `education_percentage`) and render visual category breakdown indicators in the Copilot UI.

2. **Reliable Custom Resume Selection & Persistence**:
   - Ensure `ai_resume_text` saved in the database takes precedence during initial component mount.
   - When `ai_resume_text` matches a saved resume profile or custom text, automatically set the active dropdown selection to `✏️ Custom / Analyzed Resume Text` (or the matching saved resume template ID) and prevent default fallbacks from overwriting user edits.

## User Stories

1. As a job seeker, I want the AI Resume Match score to be calculated against a clear, standardized weighting model (Tech Stack, Experience, Seniority, Education), so that my match percentage is accurate and fair.
2. As a job seeker, I want to see sub-category score breakdowns (Tech Stack match, Experience match, Education match), so that I know exactly which area of my resume needs improvement.
3. As a job seeker, I want the AI to recognize ecosystem-adjacent skills (e.g., React when Next.js is requested) with partial credit, so that my score is not penalized excessively for equivalent technologies.
4. As a job seeker, I want my raw resume text to be automatically structured into clear markdown headers (`## WORK EXPERIENCE`, `## SKILLS & TECHNOLOGIES`, `## EDUCATION`) before AI evaluation, so that the AI model parses all sections accurately.
5. As a job seeker, I want any custom resume text I paste or edit to persist across page reloads and tab navigation, so that I don't lose my customized resume content.
6. As a job seeker, I want the resume selection dropdown to correctly display "Custom / Analyzed Resume Text" when viewing a saved custom evaluation, so that I know which resume version was used for the analysis.
7. As a job seeker, I want to be able to force a fresh re-evaluation of my resume against a job description when I edit my text, so that the displayed score reflects my latest changes in real time.
8. As a developer, I want AI daily rate limits to be bypassed in non-production environments, so that automated testing and local debugging are never blocked by quota limits.

## Implementation Decisions

- **AI Prompt Architecture**:
  - Implement a 4-part weighted scoring rubric within the Gemini system prompt:
    - Tech Stack & Hard Skills: 40%
    - Experience & Relevance: 35%
    - Role Seniority & Responsibilities: 15%
    - Education, Certifications & Soft Skills: 10%
  - Require Chain-of-Thought reasoning steps where Gemini extracts job requirements, compares candidates' credentials section by section, and calculates individual category scores before outputting the final JSON object.
  - Return JSON payload schema:
    ```json
    {
      "match_percentage": 85,
      "tech_stack_percentage": 90,
      "experience_percentage": 80,
      "education_percentage": 85,
      "strengths": ["Strong React and Node.js background", "5+ years full stack experience"],
      "gaps": ["Lacks AWS certification"]
    }
    ```

- **Input Normalization**:
  - Before sending resume content to the AI service, pass raw text through a section parser that standardizes headings into `## SUMMARY`, `## WORK EXPERIENCE`, `## SKILLS & TECHNOLOGIES`, and `## EDUCATION & CERTIFICATIONS`.

- **Frontend State & Dropdown Synchronization**:
  - Update `AiCopilotTab` initialization logic:
    - If `application.ai_resume_text` exists on load, initialize `resumeText` with `application.ai_resume_text` and set `selectedResumeId` to `'custom'`.
    - If `application.ai_resume_text` is null, fall back to formatting the Master Resume Profile and setting `selectedResumeId` to `'master'`.
  - Maintain `'custom'` dropdown state whenever the user edits text in the resume textarea, ensuring the selection indicator matches the current input.

- **Database Cache Overwrite Handling**:
  - Use `updateOrCreate` when storing AI response cache entries to prevent database unique constraint violations (`ai_responses_cache_canonical_key_unique`) during forced re-evaluations.

## Testing Decisions

- **Seams**:
  - Test via feature integration tests covering `POST /job-applications/{id}/ai-match` and frontend state rendering in Pest/PHPUnit.
- **Backend Test Scenarios**:
  - Assert that `analyzeMatch` saves `ai_resume_text` into `job_applications`.
  - Assert that `resumeMatch` returns `tech_stack_percentage`, `experience_percentage`, and `education_percentage`.
  - Assert that calling `resumeMatch` with `force_refresh` updates existing cache records without throwing unique key errors.
- **Frontend Test Scenarios**:
  - Verify that `AiCopilotTab` initializes `selectedResumeId` to `'custom'` when `ai_resume_text` is present.
  - Verify that sub-category breakdown progress bars render accurately when category scores are provided.

## Out of Scope

- Automated AI rewriting or auto-generation of entire resume files.
- Exporting sub-category score breakdowns to downloadable PDF documents.

## Further Notes

- All changes maintain strict adherence to non-production rate limit bypass rules (`Limit::none()`) to facilitate smooth developer testing.
