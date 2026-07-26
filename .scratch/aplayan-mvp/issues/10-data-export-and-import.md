# 10 — Application Data Export & Import (CSV / JSON)

**What to build:** Controllers and services allowing users to export their job applications to CSV/JSON files for backups or spreadsheet reporting, and bulk-import job applications from CSV files.

**Blocked by:** 02 — Form Requests & CRUD Backend Controllers

**Status:** ready-for-agent

- [ ] Create `JobApplicationExportController` (`GET /job-applications/export`) returning CSV and JSON downloadable responses.
- [ ] Create `JobApplicationImportController` (`POST /job-applications/import`) and `JobApplicationImportRequest` validating uploaded CSV files.
- [ ] Implement `JobApplicationImportService` mapping CSV headers (`company_name`, `job_title`, `status`, `location`, `expected_salary`, `date_applied`) into user applications.
- [ ] Add "Export Data" and "Import CSV" UI triggers inside `resources/js/pages/job-applications/index.tsx`.
- [ ] Write Pest feature tests in `tests/Feature/DataExportImportTest.php`.
