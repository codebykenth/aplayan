# Issue 31: Cover Letter Templates and PDF Preview Parity

## Problem Statement

Currently, job seekers using Aplayan's Dynamic Document Builder cannot save reusable cover letter text templates. They have to re-type or manually copy-paste cover letter paragraphs when applying to different roles. Additionally, the PDF download feature creates a document that does not visually match 100% of what is shown in the live UI preview pane, leading to alignment, font size, or styling discrepancies between the screen and the printed PDF.

## Solution

1. **Cover Letter Templates**: Introduce a `cover_letter_templates` table and management system allowing users to save, edit, delete, and insert reusable cover letter templates with custom recipients (e.g., "Hiring Manager", "HR Team", or specific names) and dynamic placeholders (`[Company Name]`, `[Job Title]`, `[Recipient]`, `[Your Name]`). Provide management UI both on the `/templates` hub and inline within the `/documents` builder.
2. **PDF Preview Parity**: Standardize the CSS styling and print generation logic in `handleDownload()` so that the output rendered in the print window matches the live `.resume-paper-preview` UI element with 1:1 visual parity.

## User Stories

1. As a job seeker, I want to save cover letter text as a reusable template, so that I can apply to multiple jobs faster without retyping standard paragraphs.
2. As a job seeker, I want to specify an optional recipient (e.g., "Engineering Manager") for a template, so that my cover letter salutation is appropriately targeted.
3. As a job seeker, I want to use dynamic placeholders like `[Company Name]` and `[Job Title]`, so that my cover letter automatically customizes itself when loaded into a job application context.
4. As a job seeker, I want to manage my cover letter templates alongside my application templates on the `/templates` page, so that I have a central place to organize my application materials.
5. As a job seeker, I want to pick from my saved templates directly within the `/documents` Cover Letter tab, so that I can insert them into my draft in one click.
6. As a job seeker, I want to click "Save as Template" while writing a cover letter in the builder, so that I can instantly save my current draft for future use.
7. As a job seeker, I want the downloaded PDF to look identical to the live screen preview, so that there are no surprising formatting, margin, or layout shifts in my final document.

## Implementation Decisions

### Schema & Models
- Create `cover_letter_templates` table with fields: `id`, `user_id` (foreign key, constrained, cascade delete), `title`, `recipient` (nullable string), `content` (long text), and `timestamps`.
- Create `CoverLetterTemplate` Eloquent model with `$fillable` attributes and `belongsTo(User::class)` relation.

### Backend Layer
- `CoverLetterTemplateController`: Handle standard CRUD actions (`index`, `store`, `update`, `destroy`).
- Form Requests: `StoreCoverLetterTemplateRequest` and `UpdateCoverLetterTemplateRequest` for validation.
- User authorization via `$user->coverLetterTemplates()` policy scope.

### Frontend UI & Seams
- **`/templates` Page**: Add a tab navigation (`Application Templates` vs `Cover Letter Templates`) to view, search, edit, and delete cover letter templates.
- **`/documents` Cover Letter Tab**:
  - Add a **"Load Template"** dropdown menu to insert saved templates into the cover letter textarea with automatic placeholder replacement.
  - Add a **"Save as Template"** modal trigger to save the current text content as a new template.
- **PDF Preview Parity Fix**:
  - Unify `getPrintStyles(template)` with `getScopedResumeStyles(template)` in `documents/index.tsx` so that @page margins, font declarations (`Instrument Sans`), line heights, and container padding are identical between the `.resume-paper-preview` element and the print pop-up document window.

## Testing Decisions

- **Test Quality**: Tests should focus on controller endpoints, policy authorization, DB operations, and placeholder string replacement math.
- **Backend Tests**: Create Pest feature test `tests/Feature/CoverLetterTemplateTest.php` covering:
  - Unauthenticated users cannot access or modify templates.
  - Authenticated users can list, create, update, and delete their own templates.
  - Users cannot view or delete another user's templates.

## Out of Scope

- Rich text HTML editing for cover letters (plain text with clean paragraphs remains standard for ATS compatibility).
- Storing static generated PDF binary blobs on cloud storage (maintaining Zero-Storage architecture).

## Further Notes

- Placeholders supported out of the box: `[Company Name]`, `[Job Title]`, `[Recipient]`, `[Your Name]`, `[Date]`.
