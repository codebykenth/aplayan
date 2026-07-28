# 10 — Application Data Export & Import (CSV / JSON)

**What to build:** Controllers and services allowing users to export their job applications to CSV/JSON files for backups or spreadsheet reporting, and bulk-import job applications from CSV files.

**Blocked by:** 02 — Form Requests & CRUD Backend Controllers

**Status:** ready-for-agent

- [ ] Create `JobApplicationExportController` (`GET /job-applications/export`) returning CSV and JSON downloadable responses.
- [ ] Create `JobApplicationImportController` (`POST /job-applications/import`) and `JobApplicationImportRequest` validating uploaded CSV and JSON files.
- [ ] Implement `JobApplicationImportService` mapping CSV headers and JSON payloads (`company_name`, `job_title`, `status`, `location`, `expected_salary`, `date_applied`, `job_url`, `notes`) into user applications with flexible defaults.
- [ ] Add "Export Data" and "Import Applications" modal triggers inside `resources/js/pages/job-applications/index.tsx` (See Issue #33 for full modal instructions & downloadable sample files UI).
- [ ] Write Pest feature tests in `tests/Feature/DataExportImportTest.php`.
