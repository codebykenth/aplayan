# 0007. Withdrawn Application Status & Flexible State Machine

* **Status:** Accepted
* **Date:** 2026-07-28
* **Context:** Job Application Tracking Suite

---

## Context & Problem Statement

In real-world job searching, candidates often choose not to pursue an application (e.g. accepted another offer, salary mismatch, or company culture fit). Previously, applications only supported `wishlist`, `applied`, `interviewing`, `offer`, and `rejected`. If a candidate stopped pursuing, they either had to mark it as `rejected` (which distorted analytics) or move it backward to `applied` (which left orphaned active interview dates on the calendar).

## Decision Drivers

1. **Domain Accuracy**: Candidates withdrawing from a role is fundamentally different from an employer rejecting a candidate.
2. **Calendar Consistency**: Calendar events for withdrawn applications should clearly indicate candidate cancellation without deleting historical interview records.
3. **Analytics Integrity**: Funnel analytics and dashboard action feeds must handle candidate withdrawal distinct from employer rejection.

## Proposed Changes & Architecture

### 1. Model & Enum Extension
Add `withdrawn` to `App\Enums\JobApplicationStatus`:
- Enum value: `withdrawn`
- Label: `Withdrawn`
- Tailwind Badge Color: `bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300`

### 2. Validation & Imports
- Update `StoreJobApplicationRequest`, `UpdateJobApplicationRequest`, and `JobApplicationImportService` to accept `withdrawn`.

### 3. Calendar Service Logic
- In `CalendarService`, if an application's status is `withdrawn`, display its scheduled/past interview events labeled as `"Withdrawn: {company_name}"` with neutral styling so candidates retain visibility over past schedules without active alert urgency.

### 4. Frontend UI Updates
- **Kanban Board**: Include `Withdrawn` as a standard status badge and filter option.
- **Application Detail Modal**: Include `Withdrawn` in status dropdown selection.

---

## Consequences & Verification Plan

### Positive Impacts
- Accurately tracks candidate-initiated application cancellations.
- Removes orphaned active interview badges while preserving schedule history.
- Maintains clean analytics funnel metrics.

### Automated Tests
- Run `php artisan test --compact` to verify enum casting, validation rules, and calendar transformations.
