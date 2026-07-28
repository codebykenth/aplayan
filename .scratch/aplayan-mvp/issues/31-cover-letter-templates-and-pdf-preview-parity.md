# Issue 31: Cover Letter Templates and PDF Preview Parity

## Problem Statement

Currently, job seekers using Aplayan's Dynamic Document Builder cannot save reusable cover letter text templates. They have to re-type or manually copy-paste cover letter paragraphs when applying to different roles. Additionally, the PDF download feature creates a document that does not visually match 100% of what is shown in the live UI preview pane, leading to alignment, font size, or styling discrepancies between the screen and the printed PDF.

*Update: During implementation, the decision was made to simplify the architecture by removing a separate `cover_letter_templates` system, instead integrating the template experience directly into the `saved_cover_letters` versioning workflow.*

## Solution

1. **Cover Letter Versioning Pivot**: Instead of a separate templates system, consolidate cover letter persistence into the existing `saved_cover_letters` table. Add a `recipient` column to allow custom targeting. Replace the static "Copy Text" action in the cover letter preview with a "Save Version" workflow that persists data directly into the "Saved Documents" list, mirroring the resume builder workflow.
2. **PDF Preview Parity**: Standardize the CSS styling and print generation logic in `handleDownload()` so that the output rendered in the print window matches the live UI preview element with 1:1 visual parity.

## User Stories

1. As a job seeker, I want to save cover letter text as a reusable version, so that I can apply to multiple jobs faster without retyping standard paragraphs.
2. As a job seeker, I want to specify an optional recipient (e.g., "Engineering Manager") for a version, so that my cover letter salutation is appropriately targeted.
3. As a job seeker, I want to click "Save Version" from the cover letter preview, so that I can instantly persist my current draft for future use directly into my saved documents.
4. As a job seeker, I want the downloaded PDF to look identical to the live screen preview, so that there are no surprising formatting, margin, or layout shifts in my final document.

## Implementation Decisions

### Schema & Models
- Update `saved_cover_letters` table to include a `recipient` (nullable string) column.
- Update `SavedCoverLetter` Eloquent model `$fillable` attributes.
- Pivot: Do **not** create a separate `cover_letter_templates` table or model. Drop it if it exists.

### Backend Layer
- `DocumentController`: Update `saveCoverLetter` to handle Inertia requests and redirect to the saved documents view upon successful save. Ensure it injects a default empty `job_description` to satisfy strict database schemas if absent.
- Form Requests: Update `SaveCoverLetterRequest` to validate the `recipient` field.

### Frontend UI & Seams
- **`/documents` Cover Letter Builder**:
  - Add an input field for "Address To / Recipient".
  - Hoist state (e.g., `jobDescription`, `recipient`) to the parent `DocumentsIndex` component to ensure data persistence when toggling between Builder and Preview tabs.
  - Replace the "Copy Text" button with a "Save Version" button inside `CoverLetterPreview`.
  - Pass the dynamic `recipient` field through the entire preview and saving lifecycle.
- **PDF Preview Parity Fix**:
  - Unify `getPrintStyles(template)` with `getScopedResumeStyles(template)` in `documents/index.tsx` so that @page margins, font declarations (`Instrument Sans`), line heights, and container padding are identical between the `.resume-paper-preview` element and the print pop-up document window.

## Testing Decisions

- **Test Quality**: Tests should focus on controller endpoints, policy authorization, DB operations, and placeholder string replacement math.

## Out of Scope

- Rich text HTML editing for cover letters (plain text with clean paragraphs remains standard for ATS compatibility).
- Storing static generated PDF binary blobs on cloud storage (maintaining Zero-Storage architecture).
- Dedicated cover letter template management UI on the `/templates` page (this feature was removed in favor of the consolidated saving workflow).

## Further Notes

- Placeholders supported out of the box: `[Company Name]`, `[Job Title]`, `[Recipient]`, `[Your Name]`, `[Date]`.
