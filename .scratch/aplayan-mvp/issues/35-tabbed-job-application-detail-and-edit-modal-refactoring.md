# 35 — Tabbed Job Application Detail & Edit Modal Refactoring

## Problem Statement

The `ApplicationDetailModal` component has grown into a complex, monolithic file exceeding 1,200 lines of code. It stacks over 10 distinct features vertically in a single scroll container—including AI Resume Matching, Salary Estimates, Interview Prep Generators, Follow-up Email Drafts, Contact Linking, and Activity Timelines. Despite holding all these actions, the modal lacks basic inline field editing capabilities for core application attributes (such as Company Name, Job Title, Salaries, Location, Job URL, or Notes), forcing users to delete and recreate applications or rely on single-field updates. Furthermore, net take-home pay and tax regime parameters (allowances, deductions, manual net overrides, statutory overrides) cannot be edited directly inside the application modal, requiring navigation to external pages. This creates visual clutter, poor interaction hierarchy, and user frustration.

## Solution

Refactor `ApplicationDetailModal` into a modular, 3-tab multitasking modal with a clear separation of concerns, complete inline editing capabilities for both job parameters and net take-home tax settings (including manual statutory SSS, PhilHealth, Pag-IBIG, and BIR Tax overrides), pristine form state tracking (`isDirty`), strict input validation error handling, and accessible secondary action placement:

1. **Tab 1 — Details & Edit**: Direct input fields for all application parameters, plus an embedded contextual **Offer & Tax Configuration** accordion (Tax Regime selector, Manual Net Override, collapsible Statutory Deduction Overrides, itemized allowances, and custom deductions) with a sticky footer "Save Changes" action disabled when no changes are made.
2. **Tab 2 — AI Copilot**: Consolidated tab for AI Resume Match, Salary Reality Check (₱), Interview Prep, and Follow-up Email Draft generation.
3. **Tab 3 — Contacts & Activity**: Dedicated view for linked contacts, contact creation, last contacted tracking, and the status transition timeline log.
4. **Header & Footer Actions**: Place "Save as Template" in the modal header and "Delete Application" (triggering the standard `AlertDialog`) on the bottom-left of the sticky footer.

## User Stories

1. As a job seeker, I want to edit my job application's company name, job title, salaries, location, job URL, description, and notes directly inside the application detail modal, so that I don't have to delete and recreate entries when details change.
2. As a user viewing an application, I want the modal organized into distinct tabs ("Details & Edit", "AI Copilot", "Contacts & Activity"), so that I am not overwhelmed by a giant vertical list of buttons and textareas.
3. As a user receiving an offer, I want to configure my tax regime (PH Regular, 8% Freelancer, Tax-Exempt), enter non-taxable/taxable allowances, add custom deductions, set manual statutory overrides, or set a manual net pay override directly in Tab 1, so that my net take-home pay updates dynamically.
4. As a user editing an application, I want clear validation and error handling when entering itemized allowance/deduction amounts or statutory overrides, so that submitting empty amounts or non-numeric text displays inline error feedback.
5. As a user editing an application, I want the tax configuration accordion to auto-expand when status is set to `offer` or when an offered salary is provided, so that I am immediately guided to configure my net take-home pay.
6. As a user editing an application, I want the "Save Changes" button to be disabled when I haven't modified any fields or tax settings, so that I know whether I have unsaved changes.
7. As a user who made edits to an application, I want to click "Save Changes" to update both application attributes and tax configuration via `PATCH /job-applications/{id}`, so that my updates persist immediately on the dashboard, Kanban board, and offer matrix.
8. As a job applicant preparing for an interview, I want to switch to the "AI Copilot" tab to run AI Resume Match, request a Philippine Salary Reality Check, generate Interview Prep questions, and create Follow-up email drafts without leaving the modal.
9. As a user networking with recruiters, I want to switch to the "Contacts & Activity" tab to link existing contacts, create new contacts inline, mark the last contacted date, and view the status change history.
10. As a user who wants to reuse an application structure, I want to click a "Save as Template" action in the modal header, so that I can quickly generate a reusable job application template.
11. As a user wanting to remove an application, I want a "Delete Application" button on the bottom-left of the sticky modal footer that triggers a standard `AlertDialog` confirmation, so that I can safely remove unwanted applications without accidental deletion.
12. As a mobile user, I want the modal height capped at `max-h-[90vh]` with fixed header, scrollable tab body, and sticky footer, so that the modal actions never overflow off-screen.

## Implementation Decisions

### Component Architecture & State Management
- **Refactor `resources/js/components/job-applications/application-detail-modal.tsx`**:
  - Replace vertical stack layout with shadcn `<Tabs defaultValue="details">`.
  - Wrap content inside fixed-height modal frame (`max-h-[90vh] flex flex-col p-0 overflow-hidden`).
  - Initialize controlled form state (`formData` including `tax_config`) from `application` prop.
  - Track pristine state by comparing current `formData` against original `application` prop (`isDirty = JSON.stringify(formData) !== JSON.stringify(initialData)`).
- **Tab Breakdown**:
  - **Tab 1: `details` (Details & Edit)**:
    - Inputs for `company_name`, `job_title`, `status`, `location`, `expected_salary`, `offered_salary`, `date_applied`, `interview_date`, `job_url`, `job_description`, `notes`.
    - **Offer & Tax Configuration Accordion**: `tax_config.regime` dropdown, `tax_config.manual_net_override` input, collapsible Statutory Deduction Overrides (`override_sss`, `override_philhealth`, `override_pagibig`, `override_bir_tax`), itemized `allowances` array editor, and itemized `custom_deductions` array editor. Auto-expands when `status === 'offer'` or `offered_salary` is set.
    - `TaxBreakdownCard` rendering calculated net take-home pay dynamically.
  - **Tab 2: `ai` (AI Copilot)**: `ResumeMatchSection`, `SalaryCheckSection`, `InterviewPrepSection`, and `FollowUpDraftSection`.
  - **Tab 3: `activity` (Contacts & Activity)**: `ContactLinkingSection`, `MarkAsContactedSection`, and `ActivityTimeline`.

### Secondary & Footer Actions
- **Header Actions**:
  - Render "Save as Template" button next to title/close button.
- **Sticky Footer Actions**:
  - Left: "Delete Application" button (`variant="ghost"` or `variant="outline"` text-destructive), opening `AlertDialog` confirmation.
  - Right: "Cancel" button and "Save Changes" button (`disabled={!isDirty || updating}`).

### API Contracts & Routing
- Submit form updates (including `tax_config`) via `PATCH /job-applications/{id}` using Inertia `router.patch()` or `useForm()`.
- Validate all monetary amounts with `numeric|min:0` rules.
- On successful update, trigger Inertia page reload / resource sync and toast notification.

## Testing Decisions

- **Seams to Test**:
  - Controller & Service Layer (`JobApplicationControllerTest`, `JobApplicationServiceTest`): Verify `PATCH /job-applications/{id}` validates and updates both core attributes and `tax_config`.
  - Frontend Smoke & Pest Tests: Test modal opening, tab switching, input modification enabling "Save Changes", tax accordion toggle, validation error triggers on empty amounts, form submit, and `AlertDialog` delete trigger.
- **Test Specs**:
  - `it('can update job application fields and tax config via patch endpoint')`
  - `it('validates tax config amounts and rejects invalid numeric inputs')`
  - `it('authorizes user before updating job application')`

## Out of Scope

- Adding real-time websocket collaboration or auto-save draft syncing.
- Multi-file attachment uploads for resumes (supports text extraction / text copy-paste).

## Further Notes

- Maintains strict compliance with project design guidelines (`frontend-design`, glassmorphism UI, accessible contrast, standard `AlertDialog` for destructive actions).
