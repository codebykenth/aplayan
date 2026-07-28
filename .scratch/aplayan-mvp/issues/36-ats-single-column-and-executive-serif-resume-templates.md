# Issue 36: ATS Single-Column Bulleted & Executive Serif Resume Templates

## Problem Statement

Filipino job seekers submitting applications to local tech companies, corporate enterprises, BPO shared services, and international remote positions need high-density, ATS-friendly resume templates that guarantee 100% scannability by Applicant Tracking Systems (ATS). Current resume templates in Aplayan lack a dedicated single-column bulleted layout with pipe-separated contact headers, bold category skill lists (`Frontend: React, Next.js`), right-aligned project date ranges (`February 2026 - Present`), free-form text dates (`2025-PRESENT`), and an Additional Information section for bulleted items like languages and certificates. Furthermore, users lack a formal executive serif template variation (Times New Roman / Garamond font stack) preferred by legal, corporate, and administrative recruiters.

## Solution

1. **New ATS Resume Templates (`TEMPLATES`)**:
   - **`ats_single_column` ("ATS Standard Bulleted")**: Modern sans-serif (Instrument Sans / Inter), centered pipe-separated contact header (`+63 915 395 5170 | email | location | linkedin`), solid horizontal section dividers, high scannability, and bulleted project/experience lists.
   - **`ats_classic_serif` ("ATS Executive Serif")**: Classic serif typography (Times New Roman / Garamond), uppercase section titles (`EXPERIENCE`, `PROJECTS`, `EDUCATION`), right-aligned date & location metadata, and square bullet markers (`▪`).
2. **Schema & Domain Data Enhancements**:
   - **Free-Form Text Dates**: Support flexible date string formats (`2025-PRESENT`, `February 2026 - Present`, `2022-2026`, `June 2025`) across Work Experience, Education, and Projects.
   - **Project Dates & Metadata**: Add an optional `duration` field to `Project` schema and `location` field to `WorkExperience` and `Education`.
   - **Additional Information Section**: Add an **Additional Info** section/tab to `ResumeProfile` for custom key-value or bulleted entries (`Languages: English, Filipino.`, `Certificates of Completion: ...`) rendering under an **ADDITIONAL INFORMATION** section heading.
3. **Enhanced Formatting & PDF Parity**:
   - **Categorized Skills**: Support automatic bolding of category prefixes (`Category Name: Skill 1, Skill 2`).
   - **Markdown Bullet Bolding**: Render `**bold text**` in bullet descriptions as styled `<strong>` elements in both web preview and PDF downloads.
   - **1:1 PDF Download Parity**: Synchronize print styles with scoped preview styles for both new ATS templates.

## User Stories

1. As a job seeker, I want to select the `ats_single_column` (ATS Standard Bulleted) template, so that my resume is rendered in a high-scannability sans-serif format with clean section line dividers and pipe-separated contact info.
2. As a job seeker, I want to select the `ats_classic_serif` (ATS Executive Serif) template, so that I can generate a traditional serif resume with square bullets and right-aligned dates for corporate and formal job applications.
3. As a job seeker, I want to enter free-form text in date fields (such as `2025-PRESENT` or `February 2026 - Present`), so that I am not constrained by rigid date pickers when describing ongoing or historical roles.
4. As a job seeker, I want to add date ranges to my technical projects, so that recruiters can see when I built specific projects.
5. As a job seeker, I want to organize my skills with bold category names (e.g. `Languages: JavaScript, TypeScript`), so that hiring managers can quickly scan my core competencies.
6. As a job seeker, I want to use `**bold text**` inside my experience bullet descriptions, so that key metrics and impact statements stand out.
7. As a job seeker, I want an "Additional Information" section on my resume, so that I can highlight languages, certifications, and extra qualifications.
8. As a job seeker, I want the exported PDF to match the live ATS preview 1:1, so that my downloaded resume looks exactly as expected when submitted to recruiters.

## Implementation Decisions

### Domain Schema & Models
- Update `ResumeProfile` JSON casts and properties to support optional `duration` on `projects`, optional `location` on `work_experience` & `education`, and `additional_info` array/string on `ResumeProfile`.
- Ensure `$fillable` on `ResumeProfile` model includes `additional_info`.

### Backend Layer
- `ResumeProfileController` / `DocumentController`: Update resume validation and save logic to pass through `additional_info`, project `duration`, and location metadata without discarding attributes.

### Frontend UI & Seams
- **`TEMPLATES` Constant (`resources/js/pages/documents/index.tsx`)**:
  - Add `{ id: 'ats_single_column', name: 'ATS Standard Bulleted (High Scannability)' }`.
  - Add `{ id: 'ats_classic_serif', name: 'ATS Executive Serif (Classic Corporate)' }`.
- **Resume Builder Navigation & Forms**:
  - Add **Additional Info** tab (`{ id: 'additional_info', label: 'Additional Info', icon: BookText }`).
  - Update `WorkExperienceTab`, `EducationTab`, and `ProjectsTab` to include `duration` and `location` inputs.
- **Markdown & Bullet Helper**:
  - Create helper `renderFormattedBullet(text)` to parse `**bold text**` into `<strong>` JSX and support categorized skill lines (`Prefix: Items`).
- **Template Renderers & Styles**:
  - Implement `ats_single_column` preview block and print CSS in `getScopedResumeStyles()` and `getPrintStyles()`.
  - Implement `ats_classic_serif` preview block and print CSS in `getScopedResumeStyles()` and `getPrintStyles()`.

## Testing Decisions

- **Seam**: Feature test in `tests/Feature/ResumeProfileTest.php` validating saving and updating `ResumeProfile` payloads with `ats_single_column` & `ats_classic_serif` template IDs, `additional_info`, project durations, and categorized skills.
- **Seam**: Smoke testing document rendering in `resources/js/pages/documents/index.tsx` ensuring template selection, Markdown bullet rendering, free-form date input (`2025-PRESENT`), and PDF print generation execute without JS errors.

## Out of Scope

- Storing static generated PDF binaries in cloud storage (maintains Zero-Storage architecture).
- Multi-column ATS templates (ATS standard guidelines strongly prefer single-column layouts for parser reliability).

## Further Notes

- Both templates enforce zero-margin @page print rules to guarantee exact 1-page/A4 output formatting when downloaded via browser print.
