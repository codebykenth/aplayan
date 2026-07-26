# 11 — Application Timeline & Activity Log

**What to build:** An activity timeline tracking status change history, interview date events, and time-stamped notes for each job application.

**Blocked by:** 05 — Mobile-Friendly Application Detail Modal & Status Picker

**Status:** ready-for-agent

- [ ] Create `JobApplicationActivity` migration and model (`job_application_id`, `type`, `description`, `created_at`).
- [ ] Automatically record `JobApplicationActivity` entries on status updates or note modifications inside `JobApplicationService`.
- [ ] Render a chronological activity timeline component inside `application-detail-modal.tsx`.
- [ ] Write Pest feature tests in `tests/Feature/ApplicationTimelineTest.php`.
