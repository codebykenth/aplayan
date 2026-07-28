# 33 — Job Application Import Instructions Modal & Multi-Format Parser Expansion

## Problem Statement

Currently, clicking "Import CSV" on the Job Applications index page immediately launches a native browser file picker without giving the user any instructions, field guidelines, or downloadable templates. Furthermore, the backend import parser strictly supports CSV files (`.csv`, `.txt`), whereas the application's Export feature supports both CSV and JSON formats. Users attempting to import JSON exports or CSVs missing optional headers experience silent failures or rigid validation errors without clear instructions.

## Solution

Build an interactive, high-fidelity **Job Application Import Modal** (`resources/js/components/job-applications/import-modal.tsx`) and expand the backend `JobApplicationImportService` and `JobApplicationImportRequest` to support both **CSV** and **JSON** file formats. The modal will feature tabbed format instructions (CSV vs JSON), a detailed field reference matrix, sample template download buttons (`sample_applications.csv` and `sample_applications.json`), and a drag-and-drop upload dropzone with validation error displays.

## User Stories

1. As a job seeker, I want to click an "Import Applications" button on the Job Applications page, so that an interactive instruction modal opens instead of immediately triggering a native file picker.
2. As a job seeker, I want to view tabbed format instructions for both CSV and JSON formats inside the import modal, so that I understand how to structure my application data before uploading.
3. As a job seeker, I want to inspect a clear field reference table showing required fields (`company_name`, `job_title`), optional fields (`location`, `status`, `date_applied`, `expected_salary`, `job_url`, `job_description`, `notes`), and accepted status values (`wishlist`, `applied`, `interviewing`, `offer`, `rejected`, `withdrawn`), so that I can prepare my data accurately.
4. As a job seeker, I want to click a "Download Sample CSV" button inside the modal, so that I can save a pre-formatted `sample_applications.csv` file with header columns and sample rows to my device.
5. As a job seeker, I want to click a "Download Sample JSON" button inside the modal, so that I can save a pre-formatted `sample_applications.json` file with structured JSON sample array data to my device.
6. As a job seeker, I want to drag and drop or select a `.csv`, `.txt`, or `.json` file inside the modal dropzone, so that I can submit my data with visual file selection feedback.
7. As a job seeker, I want the backend importer to flexibly parse CSV and JSON files where missing `status` defaults to `'wishlist'` and missing `location` defaults to `'Remote'`, so that my imported data is preserved without failing on missing optional columns.
8. As a job seeker, I want optional fields like `job_url`, `job_description`, and `notes` to be imported whenever present in the CSV or JSON payload, so that full application details are retained.
9. As a job seeker, I want to receive clear feedback toast notifications and modal inline error lists if my file contains invalid JSON or unparseable headers, so that I can correct issues promptly.

## Implementation Decisions

### Frontend Components & Interactions
- **Import Modal Component (`resources/js/components/job-applications/import-modal.tsx`)**:
  - Controlled dialog using shadcn `Dialog`, `DialogContent`, `DialogHeader`, `DialogTitle`, and `Tabs` components.
  - Tab 1: **CSV Format** — step-by-step instructions, column definitions, and sample downloadable CSV generator.
  - Tab 2: **JSON Format** — JSON schema explanation, array snippet preview, and sample downloadable JSON generator.
  - Interactive file dropzone with drag-and-drop support, visual active border, file type indicator, and selected file preview.
  - Sample file downloads generated client-side via Blob URLs (`sample_applications.csv` & `sample_applications.json`).
- **Page Update (`resources/js/pages/job-applications/index.tsx`)**:
  - Replace button text "Import CSV" with "Import Applications" triggering `setImportModalOpen(true)`.

### Backend Extensions
- **`JobApplicationImportRequest` (`app/Http/Requests/JobApplicationImportRequest.php`)**:
  - Update validation rules to accept `mimes:csv,txt,json` or `mimetypes:text/csv,text/plain,application/json,text/json`.
  - Update custom validation closure to detect file format (CSV vs JSON):
    - For CSV: verify presence of `company_name` and `job_title` headers (flexible validation).
    - For JSON: verify valid JSON syntax and array structure containing objects with `company_name` and `job_title`.
- **`JobApplicationImportService` (`app/Services/JobApplicationImportService.php`)**:
  - Add `parseJson(UploadedFile $file): array` alongside `parseCsv()`.
  - Update `mapRow()` / `mapItem()` to support all model attributes (`company_name`, `job_title`, `status`, `location`, `expected_salary`, `date_applied`, `job_url`, `job_description`, `notes`).
  - Apply flexible defaults: `status` defaults to `'wishlist'` if omitted or invalid; `location` defaults to `'Remote'` if omitted.
  - Validate minimum required attributes (`company_name` and `job_title`).

## Testing Decisions

### Good Test Criteria
Tests verify end-to-end upload processing for valid/invalid CSV and JSON payloads via HTTP requests to `POST /job-applications/import`, ensuring correct database record creation and failure handling without relying on internal helper method implementation details.

### Tested Modules & Seams
- **Feature Tests (`tests/Feature/DataExportImportTest.php`)**:
  - Test CSV import with full fields.
  - Test CSV import with minimal required fields (`company_name`, `job_title`) verifying smart defaults.
  - Test JSON import with array of application objects.
  - Test upload validation failures for corrupt JSON or missing mandatory headers.
  - Test multi-user isolation during bulk import.

## Out of Scope

- External third-party ATS platform API sync (e.g., LinkedIn, Greenhouse, Lever direct API integration).
- Binary Excel (`.xlsx`, `.xls`) file parsing via heavy spreadsheet packages (CSV and JSON cover spreadsheet and software interoperability).

## Further Notes

- The import feature maintains $0 backend operational cost by executing synchronously in-memory using native PHP functions (`fgetcsv`, `json_decode`).
