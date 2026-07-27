# 23 — Standalone & Linked Contacts Management

**Status:** ready-for-agent

## Problem Statement
Job seekers interact with recruiters, HR managers, and interviewers across multiple job applications, but lose track of contact details, conversation history, and company relationships.

## Solution
Create a Contacts management system (`/contacts`) allowing users to store recruiter and hiring manager records (`name`, `email`, `phone`, `company_name`, `role`, `notes`, `last_contacted_at`). Link contacts to multiple job applications using a many-to-many relationship (`contact_job_application`), exposing contact management on both a standalone `/contacts` page and inside individual application detail modals.

## User Stories
1. As a job seeker, I want to store contact info for recruiters and hiring managers (name, email, role, company, notes), so that I can maintain my professional network.
2. As a job seeker, I want to link a contact to one or more of my job applications, so that I know who handles which hiring process.
3. As a job seeker, I want to see assigned contacts on a job application's detail modal, so that I can reach out quickly during interviews or follow-ups.
4. As a job seeker, I want to track when I last contacted a recruiter, so that I know when to follow up.

## Implementation Decisions
- **Database Schema**:
  - `contacts` table (`id`, `user_id`, `name`, `email`, `phone`, `company_name`, `role`, `notes`, `last_contacted_at`, timestamps).
  - `contact_job_application` pivot table (`contact_id`, `job_application_id`).
- **Eloquent Models**: Create `Contact` model with `belongsTo(User::class)` and `belongsToMany(JobApplication::class)`. Update `JobApplication` with `belongsToMany(Contact::class)`.
- **Backend Service**: Create `ContactService` handling contact CRUD and linking/unlinking applications.
- **HTTP Controller**: Create `ContactController` (`GET /contacts`, `POST /contacts`, `PUT /contacts/{id}`, `DELETE /contacts/{id}`, `POST /contacts/{id}/link`).
- **Frontend UI**: Build `resources/js/pages/contacts/index.tsx` with contact table/cards, search, modal form, and linked applications view. Update `application-detail-modal.tsx` to display and attach contacts.

## Testing Decisions
- Write Pest feature tests in `tests/Feature/ContactTest.php` testing CRUD operations and pivot table linking/unlinking.
- Assert strict user isolation so users can only view and link their own contacts.

## Out of Scope
- Direct email sending from within the application (covered by follow-up draft generation).
- Automatic LinkedIn profile scraping.
