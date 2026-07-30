# Aplayan - Project Context & Domain Model

## Overview
Aplayan is an AI-powered Job Application Tracker designed for job seekers in the Philippines.  
It helps users manage their job applications while providing intelligent insights to support better decision-making in the Philippine job market context.

## Target Users
- Filipino job seekers (fresh graduates, career shifters, and professionals)
- People applying to local companies, BPO/shared services, and remote/international roles

## Tech Stack & Layout Architecture
- Backend: Laravel 13 (OOP + Domain Service Layer + Policies + API Resources + Socialite)
- Frontend: Inertia.js (v3) + React 19
- UI Framework: Tailwind CSS (v4) + shadcn/ui
- **Navigation Layout System**:
  - **Authenticated Layout (`app-layout.tsx`)**: Left collapsible Sidebar Navigation (Dashboard, Applications, Settings) + User Profile footer & Logout trigger.
  - **Guest Layout (`guest-layout.tsx`)**: Top Navigation bar (Logo, Features, Sign In, Register CTA).
  - **Guest Landing Page (`welcome.tsx`)**: High-converting hero page showcasing AI Resume Match & Philippine Salary Reality Check.
- **Visual Design Identity**: "Philippine Professional" Modern Glassmorphism
  - Palette: Dark/light mode with curated HSL status tokens (`Wishlist`: Indigo, `Applied`: Sky, `Interviewing`: Amber, `Offer`: Emerald, `Rejected`: Rose).
  - Cards & Layout: Subtle glassmorphism (`backdrop-blur-md`), smooth rounded borders, Philippine Peso (₱) badges, and hover micro-animations.
- Database: MySQL / PostgreSQL (Vercel-compatible like Supabase/PlanetScale/Neon)
- Auth: Laravel Breeze (React + Inertia) + Laravel Socialite (Google OAuth)
- AI Integration: Google Gemini API (`gemini-2.5-flash`)
- Deployment Target: Vercel (Serverless PHP, zero-cost maintenance architecture)

## Architectural & Design Pattern
We adhere strictly to a **Domain Service Layer Architecture with Policies & API Resources**:
- **Design Standard**: Enforce `frontend-design` skill guidelines — opinionated typography, glassmorphism cards, micro-interactions, and non-generic color palettes.
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
- **Core Fields**: `company_name`, `job_title`, `job_url` (optional), `job_description` (optional text for AI analysis), `location` (Metro Manila, Cebu, Davao, Remote, etc.), `status`, `date_applied`, `currency` (ISO 4217 code, e.g., `PHP`, `USD`, `EUR`, default `PHP`), `expected_salary` (job seeker's target/asking salary, prefilled from User Profile default), `offered_salary` (final formal gross salary offer received from employer), `notes`.
- **Statuses**: `wishlist`, `applied`, `interviewing`, `offer`, `rejected`, `withdrawn`.
- **AI Evaluation Fields**:
  - `ai_match_percentage` (0–100, nullable)
  - `ai_strengths` (JSON array of strings, nullable)
  - `ai_gaps` (JSON array of strings, nullable)
  - `ai_salary_min` (integer in native currency, nullable)
  - `ai_salary_max` (integer in native currency, nullable)
  - `ai_salary_notes` (string/text market context, nullable)
  - `ai_evaluated_at` (timestamp, nullable)

### Action Feed
A priority-ranked, auto-clearing list of action items (stale follow-ups, upcoming interviews, high-match unactioned, missing AI analysis, salary negotiation opps, rejection momentum check) calculated on the server using pure DB queries (0 AI cost).

### Recent Activity Feed
A chronological stream of activity events across a user's job applications (status changes, newly created applications, note additions, contact updates, and AI evaluations) displayed on the Dashboard right sidebar for quick context and modal inspection.

### Weekly Application Goal
A user-defined weekly target for applications submitted (e.g., 10/week) with a streak counter and a 4-week historical average benchmark computed via pure PHP math.

### Analytics Suite
A dedicated dashboard section/page containing 6 deep-dive charts (Application Funnel, 12-Week Application Volume, Status Distribution Over Time, Salary Insights, Salary Band Distribution, Time-to-Response) computed server-side, with multi-currency offers dynamically normalized to the user's base currency using cached daily live foreign exchange rates.

### Contact
A recruiter, hiring manager, or interviewer contact record (`name`, `email`, `phone`, `company_name`, `role`, `notes`) linked via a many-to-many relationship (`contact_job_application`) to job applications.

### Calendar Suite
A read-only calendar view displaying interview dates, follow-up deadlines, and application milestones pulled dynamically from `JobApplication` data without extra storage.

### Dynamic Document Builder
A structured Resume & Cover Letter generator storing user experience, education, skills, certifications, projects, and additional information as structured JSON/DB records. Renders ATS-friendly React templates—including `ats_single_column` (ATS Standard Bulleted) and `ats_classic_serif` (ATS Executive Serif)—with free-form date ranges (`2025-PRESENT`), categorized skills (`Category: Skill 1, Skill 2`), Markdown bullet highlighting (`**bold text**`), and instant PDF generation without cloud storage overhead.

### Target Role
An optional headline displayed prominently in the resume header indicating the specific position the resume is tailored for (e.g. "Senior Software Developer"). Allows a single resume profile to be customized per job application without duplicating data.

### Additional Information
A bulleted section storing key-value pairs or text items (e.g., `Languages: English, Filipino.`, `Certificates of Completion: ...`) displayed cleanly at the bottom of ATS resume templates.

### Tax Configuration & Net Pay Engine
A flexible, zero-cost salary evaluation engine for job offers. Supports multiple tax regimes (PH Regular Employee, PH Freelancer 8% Flat Tax, Tax-Exempt / Overseas, and Custom Net Override), itemized taxable and non-taxable allowances, itemized custom deductions (HMO dependent, insurance, loans), global user-level tax defaults with per-offer overrides, and automatic conversion of foreign currency offers to local currency (PHP) for accurate statutory net pay computation.

---

## Decisions Log
- **2026-07-26 - Dual Layout Strategy**: Authenticated views use a left collapsible Sidebar navigation (`app-layout.tsx`); Guest views use a Top Navigation header (`guest-layout.tsx`) and a landing page (`welcome.tsx`).
- **2026-07-26 - "Philippine Professional" Visual Design**: Standardized modern glassmorphism aesthetic with curated HSL status tokens, smooth hover micro-animations, and clean typography.
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
- **2026-07-26 - Milestone 2 Roadmap**: Planned and initialized issues 10–14 covering Data Export & Import (`10-data-export-and-import.md`), Application Timeline & Activity Log (`11-application-timeline-log.md`), Philippine Statutory Tax & Net Take-Home Pay Calculator (`12-philippine-tax-calculator.md`), Offer Comparison Matrix Page (`13-offer-comparison-matrix.md`), and User Settings & Theme Management (`14-user-settings-and-theme.md`).
- **2026-07-27 - Zero-AI-Cost Job Search Intelligence Architecture**: Replaced full-dashboard AI charts with a dedicated Analytics page (6 non-AI charts) and a server-side Smart Action Feed on the Dashboard. Goals feature uses manual user targets with pure PHP 4-week math benchmarks. Guarantees $0 recurring AI token costs for daily application tracking.
- **2026-07-27 - Phase 2 Zero-Storage Documents, Contacts & Calendar**: Planned Phase 2 extensions including Dynamic ATS Resume/Cover Letter Builder (zero cloud file storage), standalone & linked Contacts management, and a read-only Calendar suite with automated follow-up overlays.
- **2026-07-27 - Dashboard Recent Activity Sidebar Architecture**: Structured a responsive multi-column layout for the Dashboard featuring a right sidebar Recent Activity feed. Eager loads `jobApplication` relations to prevent N+1 queries and enables instant modal inspection upon clicking activity items.
- **2026-07-27 - Zero-Cost Serverless AI Caching and Entity Normalization Architecture**: Established a global entity-normalized cache system (`ai_responses_cache`) with SHA-256 canonical keys, daily user rate-limiting allowance, 100% serverless synchronous execution, and fallback to local PHP `AiFallbackService` rules during Gemini outages. (See `docs/adr/0006-zero-cost-serverless-ai-caching-architecture.md`).
- **2026-07-27 - Target Role Resume Header**: Added optional `target_role` field to Resume Profile, displayed as a headline under the name in all 6 resume templates. Enables per-application tailoring of a single resume profile without data duplication. Field is nullable — when empty, templates render normally without the role line.
- **2026-07-28 - Automated & Customizable Offer Net Take-Home Pay Engine**: Implemented hybrid zero-cost tax engine architecture. Supports PH statutory employee tax auto-calc, 8% freelancer flat tax, tax-exempt/overseas, itemized allowances/deductions, manual statutory overrides (SSS, PhilHealth, Pag-IBIG, BIR tax), strict input validation error handling, global user tax defaults (`users.tax_settings`), per-offer JSON overrides (`job_applications.tax_config`), interactive "Customize Net Pay" card modal, and 1-click default resets. (See `docs/adr/0009-offer-net-take-home-pay-and-tax-calculator.md`).
- **2026-07-28 - Tabbed Job Application Detail & Edit Modal Refactoring**: Designed 3-tab modal layout (`Details & Edit`, `AI Copilot`, `Contacts & Activity`). Introduces full inline editing for core application fields and Net Take-Home tax configurations (tax regime, allowances, deductions, manual net overrides), auto-expanding when status is `offer` or `offered_salary` is present, pristine form dirtiness tracking (`isDirty`), header-placed "Save as Template" action, and persistent footer "Delete Application" action using standard `AlertDialog` confirmation.
- **2026-07-28 - Grouped Rate Limiting by HTTP Method**: Established per-user rate limiting grouped by HTTP method: `read` (120/min), `write` (30/min), `update` (30/min), `delete` (20/min). AI endpoints stacked with both write (30/min) and daily AI cap (10/day). Login throttled at 5/min, registration at 3/min. (See `docs/adr/0012-grouped-rate-limiting-by-http-method.md`).
- **2026-07-28 - ATS Single-Column Bulleted & Executive Serif Resume Templates Architecture**: Introduced `ats_single_column` (Modern Sans-Serif ATS Bulleted) and `ats_classic_serif` (Executive Serif ATS) templates matching Philippine tech & corporate standards. Supports free-form text date ranges (`2025-PRESENT`), categorized skills (`Category: Skill 1, Skill 2`), project dates, Markdown bold bullet highlighting (`**key terms**`), and a dedicated `additional_info` schema section for languages, certificates, and extra highlights.
- **2026-07-28 - Multi-Currency & Live FX Rate Integration Architecture**: Introduced per-application ISO currency codes (`job_applications.currency`, e.g., `USD`, `EUR`, `PHP`), user default currency (`users.currency`), curated list of major currencies with symbol formatting (`₱`, `$`, `€`, `£`, `A$`, `S$`, etc.), live exchange rate caching (24-hour TTL) with hardcoded fallbacks, automatic FX conversion in multi-currency analytics charts, and dynamic conversion for Net Take-Home tax engine calculations.
- **2026-07-29 - High-Converting Interactive Landing Page Architecture**: Designed interactive guest landing page (`welcome.tsx` & `guest-layout.tsx`) featuring sticky glassmorphic header with dark/light mode toggle, client-side AI Match Simulator micro-demo, interactive Philippine Net Take-Home Pay Calculator widget, ATS Resume Template Switcher, Job Search OS showcase, Feature Comparison Table (Excel vs Generic vs Aplayan), Philippine FAQ accordion, and Google OAuth registration CTA. (See `docs/specs/15-interactive-landing-page.md`).