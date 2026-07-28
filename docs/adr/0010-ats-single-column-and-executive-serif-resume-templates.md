# ADR 0010: ATS Single-Column Bulleted and Executive Serif Resume Templates Architecture

## Status
Accepted

## Context
Job seekers using Aplayan require high-performance, ATS-friendly resume templates that pass automated Applicant Tracking Systems and impress Philippine and international recruiters.
1. **Layout & Scannability:** Recruiters require clean single-column layouts with clear horizontal dividers, bold categorized skill groupings (`Frontend: React, Next.js`), right-aligned dates, and prominent section titles.
2. **Typography Diversity:** Users need options for both modern sans-serif tech roles (Instrument Sans / Inter) and classic corporate/executive roles (Times New Roman / Garamond font stack with square bullets `▪`).
3. **Flexible Date Formatting:** Strict date pickers break when users present date ranges like `2025-PRESENT`, `February 2026 - Present`, or `June 2025`.
4. **Additional Information & Bullet Highlighting:** Users need a dedicated section for languages, certificates, and extra highlights, plus support for bold key phrase highlighting (`**bold text**`) inside accomplishment bullets.

## Decisions

### 1. Dedicated Single-Column ATS Templates (`TEMPLATES`)
* Add **`ats_single_column` ("ATS Standard Bulleted")**: Modern sans-serif ATS layout featuring a centered pipe-separated contact header (`+63 915 395 5170 | email | location | linkedin`), solid horizontal line section dividers, and bulleted lists.
* Add **`ats_classic_serif` ("ATS Executive Serif")**: Classic serif ATS layout featuring Times New Roman / Garamond typography, uppercase section headings (`EXPERIENCE`, `PROJECTS`, `EDUCATION`), right-aligned date & location metadata, and square bullet markers (`▪`).

### 2. Free-Form Text Date Architecture
* All date/duration attributes (`duration` in Work Experience and Projects, `year` in Education) are stored as free-form `string` values in JSON database records.
* Allows seamless text like `2025-PRESENT`, `Feb 2026 - Present`, `2022-2026`, or `June 2025` without validation errors or schema rigidness.

### 3. Additional Information Schema Section
* Add an `additional_info` field to the `ResumeProfile` model and JSON structure.
* Provide an "Additional Info" tab in the Resume Builder interface for managing bullet items (e.g., `Languages: English, Filipino.`, `Certificates of Completion: ...`) rendering cleanly under an **ADDITIONAL INFORMATION** section heading.

### 4. Categorized Skills & Markdown Bullet Highlighting
* Parse skill lines with category prefixes (`Category Name: Skill 1, Skill 2`) and render the prefix in bold automatically.
* Implement inline Markdown bold parsing (`**bold text**` -> `<strong>`) across both screen preview elements and print CSS styling.

## Consequences
* **Positive:**
  * Provides 100% visual parity with modern tech ATS resumes and traditional corporate executive resumes.
  * Maximum flexibility for ongoing roles (`2025-PRESENT`) and custom date range text.
  * Bulleted descriptions allow metrics and keywords to stand out to ATS parsers and human recruiters.
  * 1:1 visual match between live web preview and exported PDF.
* **Negative:**
  * Slightly expands `ResumeProfile` JSON payload size, but remains lightweight and zero-storage serverless.
