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
11. As a job seeker, I want to view a Dashboard with total application count, status breakdown metrics, average match score, and applications added this week and this month, so that I can assess my weekly job hunting momentum.
12. As a job seeker, I want to view visual charts on my Dashboard representing my status breakdown and application trends, so that I can quickly spot bottlenecks in my interview pipeline.
13. As a job seeker, I want to update or delete job application details, so that my application tracker remains accurate over time.
14. As a job seeker, I want to filter or search my job applications by company name or position title, so that I can locate specific applications instantly.

## Implementation Decisions

### Modules & Domain Architecture
- **Authentication Module**: Utilizing Laravel Breeze with Inertia React for user authentication and session management.
- **Service, Request, Policy & Resource Architecture**: Enforcing a strict OOP Domain Service Layer (`app/Services/`), Form Request validation (`app/Http/Requests/`), Authorization Policies (`app/Policies/`), and Eloquent API Resources (`app/Http/Resources/`). Controllers remain thin HTTP entry points.
  - `JobApplicationPolicy`: Enforces resource authorization (`$user->id === $jobApplication->user_id`), raising HTTP 403 Forbidden on illegal access.
  - `JobApplicationResource`: Explicitly transforms model attributes into structured JSON/Inertia prop shapes for frontend React components.
  - `JobApplicationService`: Encapsulates CRUD operations, user-scoped querying (`$user->jobApplications()`), and status updates.
  - `GeminiService`: Handles Google Gemini API (`gemini-2.5-flash`) prompt generation, HTTP submission, structured JSON parsing, and error fallbacks.
  - `DashboardMetricsService`: Computes statistical aggregations and 30-day application trend metrics.
- **UI Components**: shadcn/ui dialogs, select inputs, cards, and recharts-powered chart components wrapped in responsive Tailwind CSS v4 layouts.

### Schema & Database Decisions
- `users`: Standard Laravel user model (id, name, email, password, timestamps).
- `job_applications`:
  - `user_id` (foreign key to `users`, indexed)
  - `company_name` (string)
  - `job_title` (string)
  - `job_url` (string, nullable)
  - `job_description` (text, nullable)
  - `location` (string, e.g., "Metro Manila", "Cebu", "Remote PH", "Foreign Remote")
  - `status` (enum: 'wishlist', 'applied', 'interviewing', 'offer', 'rejected', indexed)
  - `date_applied` (date, nullable)
  - `expected_salary` (unsigned integer in ₱, nullable)
  - `offered_salary` (unsigned integer in ₱, nullable)
  - `notes` (text, nullable)
  - `ai_match_percentage` (unsigned tinyint 0–100, nullable)
  - `ai_strengths` (json array of strings, nullable)
  - `ai_gaps` (json array of strings, nullable)
  - `ai_salary_min` (unsigned integer in ₱, nullable)
  - `ai_salary_max` (unsigned integer in ₱, nullable)
  - `ai_salary_notes` (text, nullable)
  - `ai_evaluated_at` (timestamp, nullable)

### API & Data Contracts
- **Gemini Match Prompt Schema**: Input: Job Description + Ephemeral Resume Text. Output JSON: `{ "match_percentage": int, "strengths": string[], "gaps": string[] }`.
- **Gemini Salary Prompt Schema**: Input: Job Title, Location, Job Description. Output JSON: `{ "min_salary_php": int, "max_salary_php": int, "market_context": string }`.
- **Inertia Dashboard Props Contract**: `{ total: int, status_counts: Record<string, int>, avg_match_score: int|null, added_this_week: int, added_this_month: int, trend_data: Array<{ date: string, count: int }> }`.

### Serverless Hosting Decision
- Project is configured for Vercel PHP serverless execution.
- All AI operations are synchronous within the HTTP request lifecycle.
- Zero local file storage or disk writes; PDF parsing occurs in-memory via text extraction libraries.

## Testing Decisions

### Good Test Criteria
Tests must verify user-observable behavior and domain constraints—such as authorized access, database mutations, valid status transitions, and correct Inertia page props—without coupling to internal implementation details.

### Tested Modules & Seams
- **Feature Tests (`tests/Feature/JobApplicationTest.php`)**: Full CRUD lifecycle, search/filter logic, status updates via drag-and-drop endpoint and modal endpoint, ensuring users cannot view/edit another user's applications.
- **AI Feature Tests (`tests/Feature/JobApplicationAiTest.php`)**: Invoking AI Match Analysis and Salary Reality Check endpoints using `Http::fake()` to verify database persistence of Gemini JSON results.
- **Dashboard Feature Tests (`tests/Feature/DashboardTest.php`)**: Asserting accurate Eloquent aggregation statistics and trend data passed as Inertia props.
- **Service Unit Tests (`tests/Unit/GeminiServiceTest.php`)**: Testing prompt construction, JSON parsing, and handling API timeout/rate limit exceptions gracefully.

### Prior Art
Following standard Pest PHP feature testing syntax (`actingAs($user)`, `get()`, `post()`, `assertDatabaseHas()`, `assertInertia()`) native to Laravel 13 starter kits.

## Out of Scope

- Scraping job listings from external websites (JobStreet, LinkedIn, OnlineJobs.ph).
- Persistent PDF file storage / S3 bucket uploads.
- Automated background queue workers or websockets.
- Multi-user / team sharing or recruiter features.
- Email notifications or automated interview calendar reminders.

## Further Notes

- All currency amounts throughout the user interface must be formatted explicitly with the Philippine Peso symbol (`₱`).
- Gemini API key must be read from environment variables (`GEMINI_API_KEY`).
