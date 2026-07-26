# 17 — Application Templates & Quick-Apply Presets

**What to build:** A template system allowing users to save common application patterns as reusable presets, with a "Quick Apply" flow that reduces new application creation from 8 fields to 2 (company name + job URL).

**Blocked by:** 02 — Form Requests & CRUD Backend Controllers

**Status:** ready-for-agent

- [ ] Create `ApplicationTemplate` migration and model (`user_id`, `name`, `category`, `default_location`, `default_expected_salary`, `default_job_description_keywords`, `default_notes`, timestamps).
- [ ] Create `ApplicationTemplateController` with full CRUD (`GET /templates`, `POST /templates`, `PATCH /templates/{id}`, `DELETE /templates/{id}`) and `ApplicationTemplatePolicy`.
- [ ] Create `ApplicationTemplateService` in `app/Services/ApplicationTemplateService.php` handling template CRUD and application pre-fill logic.
- [ ] Add "Save as Template" action inside `application-detail-modal.tsx` that snapshots current application fields into a new template.
- [ ] Build template management UI at `resources/js/pages/templates/index.tsx` with category grouping (e.g., "Remote Frontend", "BPO Cebu", "Government PH").
- [ ] Add "Quick Apply" button on the Kanban page that opens a minimal form: select template → fill company name + job URL → submit.
- [ ] Add navigation link to "Templates" in `AppLayout` sidebar.
- [ ] Write Pest feature tests in `tests/Feature/ApplicationTemplateTest.php`.
