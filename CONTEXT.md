# Aplayan - Project Context & Domain Model

## Overview
Aplayan is an AI-powered Job Application Tracker designed for job seekers in the Philippines.  
It helps users manage their job applications while providing intelligent insights to support better decision-making in the Philippine job market context.

## Target Users
- Filipino job seekers (fresh graduates, career shifters, and professionals)
- People applying to local companies, BPO/shared services, and remote/international roles

## Tech Stack
- Backend: Laravel 13 (OOP + Domain Service Layer + Policies + API Resources + Socialite)
- Frontend: Inertia.js (v3) + React 19
- UI: Tailwind CSS (v4) + shadcn/ui (Cards, Dialogs, Charts)
- Database: MySQL / PostgreSQL (Vercel-compatible like Supabase/PlanetScale/Neon)
- Auth: Laravel Breeze (React + Inertia) + Laravel Socialite (Google OAuth)
- AI Integration: Google Gemini API (`gemini-2.5-flash`)
- Deployment Target: Vercel (Serverless PHP, zero-cost maintenance architecture)

## Architectural & Design Pattern
We adhere strictly to a **Domain Service Layer Architecture with Policies & API Resources**:
- **Authentication**: Email/Password with Email Verification, Forgot Password Recovery, plus Google OAuth via Laravel Socialite.
- **Git Commit Convention**: Follow Conventional Commits formatted with the ticket scope (e.g., `feat(00): ...`, `feat(01): ...`, `feat(02): ...`, `test(06): ...`).
- **Response Transformation**: Use `JobApplicationResource` (`app/Http/Resources/JobApplicationResource.php`) for all Inertia page props and response payloads.
- **Authorization**: Resource access is authorized via `JobApplicationPolicy` (`Gate::authorize()`) and enforced at DB level using `$user->jobApplications()`.
- **HTTP Layer**: Thin controllers in `app/Http/Controllers/` that delegate work to Services and wrap data in API Resources.
- **Validation**: Dedicated Form Requests in `app/Http/Requests/` (no inline validation in controllers).
- **Service Layer**: OOP domain services in `app/Services/` (`JobApplicationService`, `GeminiService`, `DashboardMetricsService`) encapsulating business logic, queries, and external AI integrations.
- *Reference*: See `docs/adr/0001-service-layer-architecture.md`.

## Ubiquitous Language & Domain Entities

### User
The authenticated account owner tracking their job hunt.
- **Auth Methods**: Email/Password (with Email Verification & Forgot Password) or Google OAuth Social Sign-In.

### Job Application
A record of a user's application to a specific job opening.
- **Core Fields**: `company_name`, `job_title`, `job_url` (optional), `job_description` (optional text for AI analysis), `location` (Metro Manila, Cebu, Davao, Remote, etc.), `status`, `date_applied`, `expected_salary` (in ₱), `offered_salary` (in ₱), `notes`.
- **Statuses**: `wishlist`, `applied`, `interviewing`, `offer`, `rejected`.
- **AI Evaluation Fields**:
  - `ai_match_percentage` (0–100, nullable)
  - `ai_strengths` (JSON array of strings, nullable)
  - `ai_gaps` (JSON array of strings, nullable)
  - `ai_salary_min` (integer in ₱, nullable)
  - `ai_salary_max` (integer in ₱, nullable)
  - `ai_salary_notes` (string/text market context, nullable)
  - `ai_evaluated_at` (timestamp, nullable)

### Ephemeral Resume Processing
Resume files (PDF/TXT) or pasted text are uploaded directly within the AI Match Analysis dialog. The text is parsed in-memory, evaluated by Google Gemini API, and immediately discarded without saving any resume files or text to disk, database, or cloud storage. This ensures zero storage cost and privacy security.

### AI Evaluation / Match Analysis
An independent AI-generated analysis comparing a Job Application's description with the user-provided ephemeral Resume text.

### Salary Reality Check
An independent AI-estimated salary range in Philippine Peso (₱) contextualized for Philippine market tiers (e.g., Local PH Company, BPO/Shared Services, Foreign Remote).

---

## Decisions Log
- **2026-07-26 - Full User Authentication Suite**: Standard email/password registration with email verification, forgot password reset, and Google OAuth social login via Laravel Socialite.
- **2026-07-26 - Eloquent API Resources**: All Inertia page props and response payloads are transformed using `JobApplicationResource` (`app/Http/Resources/JobApplicationResource.php`) to decouple DB schema from frontend props.
- **2026-07-26 - Git Commit Convention**: Standardized Conventional Commits with ticket scope (e.g. `feat(00): add google socialite`, `feat(01): create migration`).
- **2026-07-26 - Dual-Layer Authorization & Policies**: Resource authorization enforced via `JobApplicationPolicy` in controllers/requests and user-scoped queries (`$user->jobApplications()`) in services.
- **2026-07-26 - OOP Service Layer & Form Requests**: Form Requests (`app/Http/Requests/`) handle input validation; Domain Services (`app/Services/`) handle business logic; Controllers stay thin.
- **2026-07-26 - Zero-Storage Ephemeral Resumes**: Resume files/text are processed in-memory during AI analysis and never persisted on disk or DB. Keeps application 100% free to maintain and eliminates privacy risks.
- **2026-07-26 - Independent AI Triggers & Persistence**: AI Match Analysis and Salary Reality Check are triggered independently on-demand. Results are persisted directly on the `job_applications` record to avoid unnecessary API token costs.
- **2026-07-26 - Kanban & Status Update Interaction**: Hybrid Kanban layout with drag-and-drop support on desktop, paired with an explicit status picker in the application detail modal for mobile usability.
- **2026-07-26 - AI Integration & Vercel Deployment**: Uses Google Gemini API (`gemini-2.5-flash`) encapsulated in a synchronous `GeminiService` class, tailored for Vercel serverless execution without long-running background queue workers.
- **2026-07-26 - Dashboard Metrics & Visuals**: Aggregated stats (counts, averages, weekly/monthly trends) are computed via backend `DashboardMetricsService`, passed as Inertia page props, and rendered visually using shadcn/ui charts (`recharts`).