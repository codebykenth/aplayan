# 22 — Zero-Storage ATS Resume Builder & AI Cover Letter Generator

**Status:** ready-for-agent

## Problem Statement
Job seekers need tailored, ATS-friendly resumes and cover letters for different applications, but storing binary PDF/DOCX files in cloud storage introduces storage costs and privacy risks.

## Solution
Build a Dynamic Document Builder (`/documents`) storing structured profile data (personal info, summary, work history, education, skills, certifications) in database records. Render 3 ATS-friendly templates ("Clean Minimal", "Modern Professional", "Philippine Standard") in React with instant client-side PDF export, paired with an on-demand Gemini AI Cover Letter Generator.

## User Stories
1. As a job seeker, I want to input my work experience, education, skills, and personal summary once into a structured form, so that I can generate tailored ATS resumes dynamically.
2. As a job seeker, I want to select between 3 ATS-friendly visual templates, so that I can choose the best style for my target industry.
3. As a job seeker, I want to download my resume as a crisp PDF directly from the browser, so that no binary files are stored on server storage.
4. As a job seeker, I want to generate an AI-crafted cover letter based on my stored resume profile and a specific job application description.

## Implementation Decisions
- **Database Schema**: Create `resume_profiles` table (`user_id`, `full_name`, `email`, `phone`, `location`, `linkedin_url`, `summary`, `work_experience` JSON, `education` JSON, `skills` JSON, `certifications` JSON).
- **Backend Service**: Create `ResumeProfileService` for profile CRUD and `GeminiService::generateCoverLetter()` for AI letter generation.
- **HTTP Controller**: Build `DocumentController` with routes for `GET /documents`, `PUT /documents/profile`, and `POST /documents/cover-letter`.
- **Frontend UI**: Create `resources/js/pages/documents/index.tsx` featuring tabbed profile editor, live ATS resume preview with CSS print layout / PDF export button, template switcher, and Cover Letter modal.
- **Zero Storage**: Resumes and cover letters are rendered on the fly in the DOM and exported client-side without storing PDF assets on server disks or S3.

## Testing Decisions
- Write Pest feature tests for `DocumentController` verifying profile storage, JSON structure validation, and authorization.
- Write tests for `GeminiService` cover letter prompt generation with mock HTTP responses.

## Out of Scope
- File upload parsing (PDF-to-text resume parsing).
- Storing generated PDF files on server storage.
