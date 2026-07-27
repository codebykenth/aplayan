# Specification: Aplayan - AI-Powered Job Application Tracker (Philippines Context)

## Problem Statement

Filipino job seekers (fresh graduates, career shifters, and experienced professionals) often manage their applications across disparate platforms, local companies, BPO/shared service centers, and foreign remote opportunities. They struggle to track application statuses effectively and lack contextual, AI-driven feedback tailored to the Philippine job market—such as realistic salary expectations in Philippine Peso (₱) and immediate evaluation of how well their resume aligns with specific job descriptions. Existing application trackers are either overly complex, require paid subscriptions/storage fees, or lack Philippine market intelligence.

## Solution

Aplayan is a free-to-maintain, privacy-first, web-based Job Application Tracker for Filipino job seekers. It features a responsive Kanban board for organizing application pipelines, server-side aggregated dashboard analytics with visual charts, and on-demand AI intelligence powered by Google Gemini API (`gemini-2.5-flash`). It processes resume files/text ephemerally in-memory (zero storage cost, maximum data privacy) to deliver instant match scores (0–100%), qualification gaps, strengths, and realistic Philippine Peso (₱) salary estimates.

## User Stories

1. As a job seeker, I want to register and log into my private Aplayan account, so that my job applications are securely accessible only to me.
2. As a job seeker, I want to create a job application record with company name, position, location, status, applied date, expected salary (in ₱), job URL, and job description, so that I can maintain a central hub of my job hunt.
3. As a job seeker, I want to view my job applications on a visual Kanban board divided into Wishlist, Applied, Interviewing, Offer, and Rejected columns, so that I can see the state of my job search at a glance.
4. As a desktop job seeker, I want to drag and drop application cards between Kanban columns, so that I can update application statuses quickly.
5. As a mobile job seeker, I want to open an application detail modal and select a new status from a dropdown picker, so that I can easily update status on touch devices without drag-and-drop friction.
6. As a job seeker, I want to upload a resume file (PDF/TXT) or paste resume text inside the AI Match Analysis modal for a specific job application, so that the AI can compare my resume against the job description.
7. As a privacy-conscious user, I want my uploaded resume file or pasted text to be processed ephemerally in-memory without being stored on a server disk or database, so that my personal data remains secure and storage costs remain zero.
8. As a job seeker, I want to view the AI Match Analysis result (Match Percentage, Strengths, and Qualification Gaps) saved directly on the job application, so that I can review AI insights anytime without re-running the analysis.
9. As a job seeker in the Philippines, I want to trigger a Salary Reality Check for a job application, so that I can receive a realistic salary estimate range in Philippine Peso (₱) based on job location, role tier, and PH market context.
10. As a job seeker, I want the Salary Reality Check results saved to the application record, so that I don't incur additional AI API token calls when revisiting the application.
11. As a job seeker, I want to view a Smart Action Feed at the top of my Dashboard with 6 priority-ranked action items (stale follow-ups, upcoming interviews, high-match wishlist items, missing AI evaluations, salary negotiation opportunities, rejection momentum checks), so that I know what to work on today without recurring AI costs.
12. As a job seeker, I want a dedicated Analytics page (`/analytics`) with 6 deep-dive charts (Application Funnel, 12-Week Application Volume, Status Distribution Over Time, Salary Insights, Salary Band Distribution, Time-to-Response), so that I can analyze pipeline bottlenecks and market positioning.
13. As a job seeker, I want a Weekly Goals page (`/goals`) to set manual application targets (e.g. 10/week), track progress bars, build weekly streaks, and view 4-week math benchmarks, so that I stay motivated.
14. As a job seeker, I want to save reusable application templates and quick-apply presets (`/templates`), so that I can create new applications with minimal effort.
15. As a job seeker, I want an Interview Prep and Follow-up Email Generator, so that I can generate tailored preparation notes and professional follow-up email drafts.
16. As a job seeker, I want to export my application data to CSV and import CSV data (`/job-applications/export` & `/import`), so that I maintain data ownership and backup options.
17. As a job seeker, I want an Offer Comparison Matrix (`/job-applications/offers`), so that I can evaluate multiple job offers side-by-side.
18. As a job seeker in the Philippines, I want a Philippine Statutory Tax & Take-Home Pay Calculator (`PhilippineTaxCalculatorService`), so that I can estimate net monthly pay under TRAIN Law tax brackets, SSS, PhilHealth, and Pag-IBIG.
19. As a job seeker, I want a Zero-Storage Dynamic Resume & Cover Letter Builder (`/documents`), so that I can store structured experience data and export ATS-friendly PDFs in 3 visual templates without uploading files to cloud storage.
20. As a job seeker, I want a Contacts Management module (`/contacts`), so that I can store recruiter and hiring manager records and link them many-to-many to specific job applications.
21. As a job seeker, I want a read-only Calendar view (`/calendar`), so that I can inspect interview dates, application milestones, and follow-up deadlines on Month and Week schedules.

## Implementation Decisions

### Modules & Domain Architecture
- **Authentication Module**: Utilizing Laravel Breeze with Inertia React for user authentication. Enhanced with Google OAuth social login via Laravel Socialite, Email Verification, and Forgot Password recovery.
- **Service Layer Architecture (`app/Services/`)**:
  - `JobApplicationService`: Application CRUD, user-scoped querying, and status updates.
  - `GeminiService`: Google Gemini API prompt formatting, HTTP communication, JSON parsing, and fallbacks.
  - `ActionFeedService`: Computes 6 priority-ranked action items for the Dashboard feed server-side with 0 AI cost.
  - `AnalyticsService`: Computes 6 deep-dive charts (Funnel, 12-Week Volume, Status Over Time, Salary Insights, Salary Bands, Time-to-Response) via SQL aggregations.
  - `GoalService`: Computes weekly application progress, streak counters, and 4-week moving average benchmarks.
  - `ApplicationTemplateService`: Manages preset templates and quick-apply pre-filling.
  - `PhilippineTaxCalculatorService`: Computes Philippine net take-home pay based on 2026 TRAIN Law tax brackets and statutory contributions (SSS, PhilHealth, Pag-IBIG).
  - `JobApplicationImportService`: Handles CSV parsing, validation, and batch application creation.
  - `ContactService`: Manages recruiter/manager records and many-to-many application linking.
  - `ResumeProfileService`: Manages structured resume experience JSON data for ATS PDF generation.
  - `CalendarService`: Normalizes application dates and follow-up deadlines into calendar event payloads.
- **UI Navigation System**: Left collapsible Sidebar (`app-layout.tsx`) hosting 7 core tabs (`Dashboard`, `Applications`, `Offer Comparison`, `Templates`, `Analytics`, `Goals`, `Settings`).

### Schema & Database Decisions
- `users`: Standard user attributes + `weekly_goal` (integer, default 10) + `goal_streak` (integer, default 0) + `expected_salary` + `job_search_preferences` + `theme`.
- `job_applications`: Core application attributes + AI evaluation columns (`ai_match_percentage`, `ai_strengths`, `ai_gaps`, `ai_salary_min`, `ai_salary_max`, `ai_salary_notes`, `ai_evaluated_at`) + activity dates (`last_contacted_at`, `interview_date`, `interview_notes`, `ai_interview_prep`).
- `application_templates`: Reusable preset patterns (`user_id`, `name`, `category`, `default_location`, `default_expected_salary`, `default_job_description_keywords`, `default_notes`).
- `job_application_activities`: Audit log table (`job_application_id`, `type`, `description`, `created_at`).
- `contacts`: Recruiter & manager records (`user_id`, `name`, `email`, `phone`, `company_name`, `role`, `notes`, `last_contacted_at`).
- `contact_job_application`: Pivot table (`contact_id`, `job_application_id`).
- `resume_profiles`: Structured ATS profile data (`user_id`, `full_name`, `email`, `phone`, `location`, `summary`, `work_experience` JSON, `education` JSON, `skills` JSON, `certifications` JSON).

### API & Data Contracts
- **Action Feed Contract**: `Array<{ id: string, title: string, priority: 'urgent'|'moderate'|'low', description: string, job_application_id: int, company_name: string, action_label: string, action_route: string }>`
- **Analytics Props Contract**: `{ funnel: Object, weekly_volume: Array, status_over_time: Array, salary_insights: Object, salary_bands: Array, time_to_response: Object }`
- **Goals Props Contract**: `{ weekly_goal: int, current_week_count: int, streak_count: int, four_week_avg: int, weekly_history: Array }`

### Zero-Cost & Serverless Hosting Decision
- Project is deployed on Vercel serverless PHP architecture.
- Daily action feed, deep-dive analytics, goals, contacts, and calendar run strictly server-side on database queries with **$0 recurring AI API costs**.
- Ephemeral in-memory resume processing and dynamic client-side ATS PDF generation guarantee **$0 cloud file storage fees**.

## Testing Decisions

### Good Test Criteria
Tests verify user-observable behavior, authorization boundaries, database state changes, and Inertia page prop contracts using Pest PHP without coupling to internal class mechanics.

### Tested Modules & Seams
- **Feature Tests (`tests/Feature/`)**: `JobApplicationTest.php`, `JobApplicationAiTest.php`, `DashboardTest.php`, `AnalyticsTest.php`, `GoalTest.php`, `ApplicationTemplateTest.php`, `ContactTest.php`, `CalendarTest.php`, `DocumentTest.php`.
- **Service Unit Tests (`tests/Unit/`)**: `GeminiServiceTest.php`, `PhilippineTaxCalculatorServiceTest.php`, `ActionFeedServiceTest.php`, `GoalServiceTest.php`.

### Prior Art
Using standard Pest PHP syntax (`actingAs($user)`, `get()`, `post()`, `assertDatabaseHas()`, `assertInertia()`).

## Out of Scope

- External job listing scraping from JobStreet, LinkedIn, or OnlineJobs.ph.
- Binary PDF/DOCX file upload storage in S3 buckets or local disks.
- Multi-user / employer recruiter portals.
- Direct external email sending protocols (email drafts are generated for user copy-pasting).

## Further Notes

- All currency amounts throughout the application must be formatted explicitly with the Philippine Peso symbol (`₱`).
- Gemini API integration is strictly on-demand on explicit user button triggers (`GEMINI_API_KEY`).
