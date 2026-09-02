# Aplayan — AI-Powered Job Search & Application Tracker for Filipino Professionals

Aplayan is a modern, full-stack, AI-augmented career copilot and job application tracking platform tailored specifically for Filipino job seekers and global remote professionals. It combines drag-and-drop Kanban application management, rigorous Philippine statutory tax computation (BIR TRAIN Law, SSS, PhilHealth, Pag-IBIG), real-time multi-currency FX conversion, Google Gemini AI ATS resume matching (4-pillar weighted evaluation rubric), dynamic job offer comparison, AI interview coaching, document studio with versioned resume snapshots, recruiter CRM, and predictive career analytics.

---

## What It Does

Modern job seekers face fragmented workflows: tracking applications across messy spreadsheets, guessing how resumes score against ATS filters, manually calculating Philippine tax deductions from gross salaries, and losing track of follow-up timelines. Aplayan solves this by providing an end-to-end career command center:

- **Kanban & List Application Tracking:** Interactive drag-and-drop board powered by `@dnd-kit` with customizable status columns (Wishlist, Applied, Interviewing, Offer, Rejected), priority tags, multi-currency support, and granular activity timelines.
- **Philippine Statutory Tax & Take-Home Pay Engine:** Real-time net salary calculator incorporating the BIR TRAIN Law brackets, 2025/2026 SSS tiered contribution schedules, PhilHealth 5% premium rates, Pag-IBIG caps with voluntary contributions, non-taxable 13th-month pay ceilings (₱90,000 threshold), de minimis benefits, and taxable allowances.
- **Multi-Currency FX Conversion:** Automatic real-time currency normalization (USD, EUR, GBP, AUD, SGD, JPY, CAD to PHP) allowing remote Filipino professionals to evaluate foreign offers directly against Philippine living standards and net take-home earnings.
- **AI ATS Resume Matching & Gap Analysis:** Chain-of-Thought evaluation powered by Google Gemini API using a 4-pillar weighted rubric (Technical Skills 40% with partial credit for adjacent technologies, Work Experience 35%, Seniority & Scope 15%, Education & Certifications 10%) with actionable strengths and gap breakdowns.
- **AI Salary Benchmarking & Market Reality Check:** AI estimation of localized Philippine market rates with high/low salary bands and detailed industry context.
- **AI Interview Coaching & Prep:** Context-aware generation of common interview questions, role-specific talking points, and tactical preparation tips tailored to the target job description.
- **AI Follow-Up Assistant & Draft Generator:** Generates professional follow-up email drafts based on elapsed days, contact history, and application status.
- **Side-by-Side Offer Comparison Matrix:** Weighted decision matrix to evaluate multiple job offers across net pay, HMO/benefits, commute/remote flexibility, work-life balance, and career growth potential.
- **Smart Action Feed & Stale Alert Detection:** Proactive notification feed identifying overdue follow-ups, upcoming interviews, stagnant applications (>14 days without activity), and weekly goal milestones.
- **Document Studio & ATS Resume Builder:** Structured resume profile builder, section-by-section AI polisher with strong action verbs and quantifiable metrics, AI cover letter generator with tone presets (Polish, Concise, Formal), and versioned snapshot archives.
- **Visual Schedule Calendar:** Interactive calendar view for interview deadlines, follow-up dates, and recruitment milestones.
- **Performance Analytics & Conversion Funnel:** Data-driven visualizations with Recharts tracking funnel conversion rates, 12-week application volume trends, status distributions over time, salary expectations vs. offer bands, and response velocity.
- **Recruiter Contact CRM:** Centralized directory for hiring managers, HR contacts, and recruiters linked directly to target job applications.
- **Data Portability & Import/Export:** Secure JSON and CSV data export and bulk import with validation and deduplication safeguards.
- **Administrative Command Center & AI Telemetry:** User administration, role toggling, granular per-user AI quota management, token usage logs, cost tracking, and legal document markdown editing.

---

## Tech Stack

### Backend
- **Framework:** PHP 8.4, Laravel 13 (Latest release with Model strictness and Transaction Middleware)
- **Monolith SPA Bridge:** Inertia.js v3 (Server-side rendering, typed props, zero-API boilerplate)
- **Authentication & Security:** Laravel Fortify, Laravel Socialite v5 (Google OAuth), Cloudflare Turnstile bot defense
- **Routing & Type Generation:** Laravel Wayfinder v0 (Auto-generated TypeScript functions for backend routes and actions)
- **Code Quality & Testing:** Pest PHP v4, Larastan v3 (PHPStan Level 8), Laravel Pint v1

### Frontend
- **Framework & Runtime:** React 19, TypeScript 5.7, Vite 8, `@vitejs/plugin-react` with React Compiler support
- **Client Routing & SPA:** Inertia.js v3 React Client (`@inertiajs/react`)
- **Styling & Design System:** Tailwind CSS v4, `@tailwindcss/vite`, CSS custom properties for dynamic light/dark/system themes
- **UI Components:** Radix UI primitives / Base UI (`@base-ui/react`), Lucide React icons, Sonner toast notifications
- **Drag & Drop:** `@dnd-kit/core`, `@dnd-kit/sortable`, `@dnd-kit/utilities`
- **Data Visualization:** Recharts 3.8 (Responsive Bar, Line, Pie, and Funnel charts)
- **Forms & Validation:** Zod schemas, React state management, Inertia form helpers

### Database & Caching
- **Database:** PostgreSQL / SQLite (Strict foreign keys, indexed query columns, relational transactions)
- **AI Prompt Caching:** SHA-256 hashed response caching (`AiCacheService`) with database persistence (`ai_response_caches`) and automated heuristic fallbacks

---

## Architecture & Code Highlights

```
aplayan/
├── app/
│   ├── Enums/               # Strict PHP Enums (JobApplicationStatus, Priority, RemoteType, etc.)
│   ├── Http/
│   │   ├── Controllers/     # Single-responsibility & resource controllers (Admin, Auth, User)
│   │   ├── Middleware/      # Turnstile verification, admin gating, transaction management
│   │   └── Requests/        # Form Requests for validated input (Never inline validation)
│   ├── Models/              # Strict Eloquent models with fillable attributes & relationships
│   └── Services/            # Isolated business logic layer
│       ├── ActionFeedService.php              # Smart proactive assistant & alerts
│       ├── AiCacheService.php                 # Prompt hashing, deduplication & quota manager
│       ├── AnalyticsService.php               # Funnel, volume & salary aggregation algorithms
│       ├── FxExchangeService.php              # Multi-currency FX conversion & caching
│       ├── GeminiService.php                  # Google Gemini API integration & prompt engineering
│       └── PhilippineTaxCalculatorService.php # BIR TRAIN Law, SSS, PhilHealth & Pag-IBIG engine
├── database/
│   ├── factories/           # Comprehensive model factories for reliable testing
│   ├── migrations/          # Indexed relational schema definitions
│   └── seeders/             # Database seeders with test accounts & default data
├── resources/js/
│   ├── actions/             # Wayfinder auto-generated typed controller action invokers
│   ├── components/
│   │   ├── domain/          # Business-specific shared components (Tax modals, resume viewers)
│   │   ├── job-applications/# Application cards, Kanban boards, AI Copilot tabs, activity logs
│   │   ├── landing/         # Interactive landing widgets (Pay calculator, ATS simulator, FAQ)
│   │   └── ui/              # Reusable presentational primitives (Button, Dialog, Sheet, Dropdown)
│   ├── pages/               # Inertia page views structured strictly by role & domain module
│   │   ├── admin/           # Admin dashboard, user management, AI usage telemetry, legal editor
│   │   ├── analytics/       # Visual conversion funnels, volume charts, salary analytics
│   │   ├── auth/            # Login, Register, Forgot/Reset Password, Verify Email
│   │   ├── calendar/        # Interview & deadline calendar interface
│   │   ├── contacts/        # Recruiter & networking CRM
│   │   ├── documents/       # Resume profile studio, saved versions, AI cover letter generator
│   │   ├── goals/           # Weekly application goals & streak tracking
│   │   ├── job-applications/# Main Kanban/list view, application details, offer comparison
│   │   └── templates/       # Custom application templates & boilerplate notes
│   └── types/               # TypeScript type definitions matching backend models & schemas
└── tests/
    ├── Feature/             # Pest PHP Feature tests covering full user journeys & edge cases
    └── Unit/                # Unit tests verifying tax math, FX rates, and AI fallback services
```

### Architectural Principles
- **No API Boilerplate (Inertia v3):** Endpoints directly return Inertia views with typed server-side data, combining the DX of a modern React SPA with the security and velocity of Laravel.
- **Service Layer Isolation:** Complex algorithms (tax math, foreign exchange conversions, AI prompt orchestration, analytics caching) are encapsulated into dedicated, unit-tested Service classes.
- **Strict Eloquent Configuration:** Model lazy loading is strictly prevented in non-production environments to completely eliminate N+1 query performance bottlenecks.
- **Resilient AI Pipeline with Hashing & Heuristic Fallbacks:** AI prompts are hashed via SHA-256 and cached to avoid redundant API fees and reduce latency. When the AI API is unreachable or quotas are exhausted, `AiFallbackService` activates keyword and heuristic analysis to ensure zero UI disruption.
- **Comprehensive Rate Limiting:** Dedicated throttle buckets protect database writes, authentication attempts, PDF/data exports, and AI generation endpoints.

---

## Full Feature Breakdown

### 1. Job Application Tracker & Kanban Board
- **Dual View Modes:** Seamlessly switch between an interactive drag-and-drop Kanban board (`@dnd-kit`) and a dense, filterable list table.
- **Lifecycle Stages:** Manage applications across 5 native stages: `Wishlist`, `Applied`, `Interviewing`, `Offer`, and `Rejected`.
- **Granular Metadata:** Track company name, role title, job location, work arrangement (Remote, On-site, Hybrid), priority (Low, Medium, High), job posting URL, and application deadlines.
- **Comprehensive Activity Log:** Automatic and manual event tracking (status changes, follow-up emails sent, interview scheduled, note added) with chronological timeline visualization.
- **Stale Alert Indicators:** Automatic visual badge notifications for applications with no recorded activity for 14+ days.

### 2. Philippine Statutory Tax & Take-Home Pay Engine
- **BIR TRAIN Law Calculation:** Precise progressive tax computation across all statutory brackets with excess tax rates.
- **2025/2026 SSS Tiered Matrix:** Exact monthly employee contribution calculations based on official Social Security System compensation brackets.
- **PhilHealth 5% Premium:** Accurate 2.5% employee share deduction with statutory ceiling limits.
- **Pag-IBIG Fund Computations:** Mandatory standard contributions (₱100 / ₱200 cap) plus custom voluntary MP2/regular additions.
- **13th-Month Pay Exemption:** Non-taxable ceiling computation up to the ₱90,000 threshold.
- **Custom Deductions & Allowances:** Add non-taxable de minimis allowances (rice allowance, medical, uniform) and other taxable allowances or custom company deductions.
- **Per-Application & Global Defaults:** Configure baseline tax settings in user profile settings or customize tax parameters per individual job application.

### 3. Multi-Currency FX Engine & Global Remote Support
- **Multi-Currency Tracking:** Record salary expectations and job offers in PHP, USD, EUR, GBP, AUD, SGD, JPY, or CAD.
- **Automated Currency Conversion:** Powered by `FxExchangeService` to normalize all global salaries into PHP for unified analytics and side-by-side comparison.
- **Take-Home Reality Check:** Instantly view how a USD $3,000/month remote contract converts to net monthly PHP after local tax deductions and bank fees.

### 4. Google Gemini AI ATS Resume Matcher & Career Copilot
- **4-Pillar Weighted Rubric:**
  - *Technical Skills & Tech Stack (40%):* Direct keyword and stack analysis with 75% partial credit for adjacent technologies (e.g., React to Next.js, MySQL to PostgreSQL).
  - *Work Experience & Relevance (35%):* Experience duration, industry alignment, and responsibility scope.
  - *Seniority & Responsibility (15%):* Career level alignment (Junior, Mid, Senior, Lead).
  - *Education & Certifications (10%):* Degree match, professional certifications, and soft skill signals.
- **Actionable Gap Analysis:** Highlights exact matching strengths and concrete missing keywords needed to beat ATS scanners.
- **AI Salary Benchmarking:** Synthesizes job title, location, and description to provide realistic PHP monthly salary ranges and market context.
- **AI Interview Preparation Coach:** Auto-generates role-tailored technical and behavioral interview questions, talking points, and tactical preparation tips.
- **Smart Follow-Up Drafter:** Crafts culturally appropriate, polite follow-up emails tuned to the number of days since last contact.

### 5. Side-by-Side Offer Comparison Matrix
- **Comparative Decision Matrix:** View multiple job offers side-by-side on a unified scorecard.
- **Customizable Weighted Scoring:** Score offers based on personal priorities (Net Salary, Health Insurance/HMO, Commute/Remote Flexibility, Work-Life Balance, Growth Opportunities).
- **Net Pay Comparison:** Directly compares statutory net take-home pay, total allowances, and annualized 13th-month earnings across employers.

### 6. Document Studio & ATS Resume Builder
- **Structured Resume Builder:** Store and organize complete resume profiles (Personal Summary, Work History, Education, Skills, Projects, and Certifications).
- **AI Section Polisher:** Enhance bullet points with strong action verbs, professional tone, and quantified metrics.
- **AI Cover Letter Synthesizer:** Generate tailored cover letters customized for target job descriptions with adjustable tone presets:
  - *Polish:* Refines grammar, spelling, and narrative flow.
  - *Concise:* Cuts fluff while preserving critical impact.
  - *Formal:* Elevates tone for executive or corporate roles.
- **Versioned Document Snapshots:** Save and manage multiple versions of resumes and cover letters tailored for different roles.

### 7. Smart Action Feed & Calendar
- **Proactive Dashboard Feed:** Centralized list of high-priority daily actions (overdue follow-ups, upcoming interviews, stagnant leads).
- **Interactive Calendar View:** Schedule and visualize interview appointments, application deadlines, and follow-up milestones.

### 8. Career Analytics & Funnel Insights
- **Conversion Funnel Visualization:** Visual funnel from Wishlist -> Applied -> Interviewing -> Offer.
- **12-Week Application Velocity:** Rolling weekly application volume charts to monitor search momentum.
- **Salary Distribution Bands:** Group expected vs. offered compensation across customizable income brackets.
- **Response Velocity Tracking:** Measures average days between application submission and employer first response.

### 9. Weekly Application Goals & Streak Tracking
- **Target Quotas:** Set weekly application targets and monitor live progress bars.
- **Momentum Streaks:** Track continuous weekly active search streaks to stay accountable.

### 10. Recruiter & Professional Contact CRM
- **Contact Directory:** Store recruiter names, roles, company affiliations, email addresses, phone numbers, and LinkedIn URLs.
- **Relational Linking:** Link contacts directly to job applications to maintain context during interview stages.

### 11. Application Templates
- **Reusable Application Blueprints:** Create preset templates with default notes, checklist items, and standard responses for recurring job types.

### 12. Admin Command Center & AI Telemetry
- **User Management:** Search users, toggle roles (Admin / User), activate/deactivate accounts, and delete records.
- **Per-User AI Quota Controls:** Enable/disable AI features per user and configure daily generation limits.
- **AI Token & Cost Telemetry:** Real-time logging of prompt tokens, candidate tokens, total usage, and estimated API costs.
- **Legal Document Management:** In-app markdown editor for Terms of Service and Privacy Policy.

---

## 🔌 Third-Party API & Service Integrations

### 1. Google Gemini AI API
- **Endpoint:** `https://generativelanguage.googleapis.com/v1beta/models`
- **Supported Models:** `gemini-1.5-flash`, `gemini-1.5-pro`, `gemini-2.5-flash`
- **Implementation:** `App\Services\GeminiService`
- **Capabilities:** ATS resume matching with Chain-of-Thought prompting, salary estimation, interview coaching, section polishing, and cover letter synthesis.
- **Reliability:** Built-in connection timeouts, retry backoff (100ms, 500ms), and automatic fallback to `AiFallbackService`.

### 2. Google OAuth (Laravel Socialite)
- **Implementation:** `App\Http\Controllers\Auth\SocialiteController`
- **Capabilities:** One-click Google authentication, automatic user provisioning, and verified email sync.

### 3. Cloudflare Turnstile
- **Implementation:** `App\Services\TurnstileVerifyService` & `App\Http\Middleware\VerifyTurnstile`
- **Capabilities:** Invisible bot defense on user registration and authentication endpoints.

### 4. Foreign Exchange (FX) Services
- **Implementation:** `App\Services\FxExchangeService`
- **Capabilities:** Currency normalization across 8 major fiat currencies with cached exchange rates.

---

## Local Development Setup

### 1. Prerequisites
- **PHP 8.3+** (PHP 8.4 recommended) with extensions: `pdo`, `mbstring`, `bcmath`, `fileinfo`, `gd`, `zip`
- **Composer 2.x**
- **Node.js 20+** & **npm**
- **PostgreSQL 15+** or **SQLite 3**

### 2. Clone and Install

```bash
# Clone the repository
git clone https://github.com/codebykenth/aplayan.git
cd aplayan

# Automated setup (installs PHP & JS dependencies, copies .env, generates key, runs migrations)
composer setup
```

Or execute manual step-by-step installation:

```bash
composer install
npm install
cp .env.example .env
php artisan key:generate
php artisan migrate --seed
```

### 3. Environment Configuration

Edit your `.env` file with your local database and API credentials:

```env
# Application
APP_NAME="Aplayan"
APP_ENV=local
APP_KEY=base64:...
APP_DEBUG=true
APP_URL=http://localhost:8000

# Database (PostgreSQL or SQLite)
DB_CONNECTION=pgsql
DB_HOST=127.0.0.1
DB_PORT=5432
DB_DATABASE=aplayan
DB_USERNAME=postgres
DB_PASSWORD=your_password

# AI Services (Google Gemini API)
GEMINI_API_KEY=your_gemini_api_key_here
GEMINI_MODEL=gemini-1.5-flash

# Google OAuth (Optional)
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GOOGLE_REDIRECT_URI="${APP_URL}/auth/google/callback"

# Cloudflare Turnstile (Optional for local development)
TURNSTILE_SITE_KEY=your_turnstile_site_key
TURNSTILE_SECRET_KEY=your_turnstile_secret_key
```

### 4. Start Development Servers

```bash
composer run dev
```

This starts all necessary processes concurrently:
- **Laravel HTTP Server:** `http://127.0.0.1:8000`
- **Queue Listener:** `php artisan queue:listen --tries=1 --timeout=0`
- **Vite Dev Server:** Hot Module Replacement (HMR) for React and Tailwind CSS

---

## Automated Tests & Code Quality

The project includes an extensive suite of automated tests and static analysis tools.

```bash
# Run the complete test suite (Pest PHP)
php artisan test

# Run tests with compact output
php artisan test --compact

# Run a specific feature test
php artisan test --filter=JobApplicationTest

# Run static analysis (PHPStan / Larastan)
npm run types:check
# or: vendor/bin/phpstan analyse

# Run PHP code style fixer (Laravel Pint)
npm run lint
# or: vendor/bin/pint --parallel

# Run frontend linting & formatting checks
npm run lint:check
npm run format:check

# Run full CI check suite (lint + format + types + tests)
composer ci:check
```

---

## Deployment

Aplayan is architected for seamless containerized deployment via Docker, Laravel Cloud, or modern PaaS providers (Render, Fly.io, Railway, AWS, DigitalOcean).

### Production Build
```bash
# Compile and optimize frontend assets
npm run build

# Cache backend configurations and routes
php artisan config:cache
php artisan route:cache
php artisan view:cache
php artisan event:cache

# Run database migrations
php artisan migrate --force
```

---

## Author

Crafted by **[Kenth](https://github.com/codebykenth)**.
