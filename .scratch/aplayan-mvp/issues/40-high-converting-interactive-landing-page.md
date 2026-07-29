# Issue 40: High-Converting Interactive Landing Page Architecture

## Problem Statement

As a prospective job seeker visiting Aplayan for the first time, a basic static landing page fails to demonstrate the full value of the application's AI match analysis, Philippine statutory tax take-home pay engine, ATS resume builder, and job search analytics. Prospective users cannot experience how Aplayan solves their specific job hunt pain points before signing up. Without interactive micro-demos, clear value comparisons, and direct registration shortcuts, conversion rates remain suboptimal.

## Solution

A high-converting, interactive landing page on route `/` (`welcome.tsx` wrapped in `guest-layout.tsx`) designed with Aplayan's "Philippine Professional" Glassmorphism identity. It features a sticky glassmorphic navigation header with dark/light mode toggle, an interactive hero with a client-side **AI Match Simulator**, an interactive **Philippine Net Take-Home Pay Calculator** widget, an **ATS Resume Template Switcher**, a **Job Search OS & Analytics Showcase**, an interactive **Feature Comparison Table** (Spreadsheet vs Generic Tracker vs Aplayan), a **Philippine Job Seeker FAQ Accordion**, and a high-impact **Google OAuth / Email Registration CTA Banner**.

## User Stories

1. As a guest visitor, I want to see a sticky glassmorphic navigation header with a dark/light mode toggle, so that I can experience Aplayan's visual design in my preferred theme before creating an account.
2. As a prospective job seeker, I want to interact with a live AI Match Simulator in the hero section, so that I can see how AI analyzes resume fit and highlights skill gaps without having to upload a real resume first.
3. As a Filipino job applicant, I want to test an interactive Philippine Net Take-Home Pay calculator widget on the landing page, so that I can see instant net pay calculations (SSS, PhilHealth, Pag-IBIG, BIR TRAIN Law) for my gross monthly salary.
4. As a job seeker evaluating different employment options, I want to toggle between tax regimes (Regular Employee, 8% Freelancer, Tax-Exempt Overseas) in the landing page salary widget, so that I can see how different employment contracts impact my actual spendable income.
5. As a candidate looking to pass ATS resume scanners, I want to preview pixel-perfect ATS resume templates (`ats_single_column` and `ats_classic_serif`) on the landing page, so that I can see how Aplayan formats professional resumes.
6. As a job hunter managing multiple applications, I want to explore interactive showcase cards for the Kanban board, Smart Action Feed, and 6 Analytics Charts, so that I understand how Aplayan keeps my job hunt organized.
7. As a job seeker using traditional spreadsheets, I want to view a feature comparison table comparing Excel vs. generic application trackers vs. Aplayan, so that I can clearly see why upgrading to Aplayan saves time and increases interview success.
8. As a privacy-conscious job seeker, I want to read a Philippine-focused FAQ accordion addressing data privacy, zero-cost usage, tax accuracy, and PDF export, so that I feel safe and confident registering.
9. As a prospective user ready to sign up, I want to click a direct "Sign in with Google" or "Get Started Free" CTA button in the landing page header and hero banner, so that I can create an account in one click.
10. As a mobile visitor, I want the entire landing page and its interactive micro-demos to be fully responsive with a slide-out mobile navigation menu, so that I can easily browse and test features on my smartphone.

## Implementation Decisions

### Layout & Navigation Layer (`resources/js/layouts/guest-layout.tsx`)
- Implement a sticky top header with backdrop blur glassmorphism (`backdrop-blur-md border-b border-border bg-background/80`).
- Include brand logo with Philippine Peso (`₱`) badge, anchor links (`#features`, `#ai-match`, `#salary-calc`, `#resume-builder`, `#comparison`, `#faq`), dark/light mode toggle button, "Sign In" link, and "Get Started Free" CTA button.
- Provide a responsive slide-out mobile menu supporting theme toggling and anchor navigation.

### Hero & Interactive AI Match Simulator (`resources/js/pages/welcome.tsx` / `resources/js/components/landing/ai-match-simulator.tsx`)
- Design a high-impact hero banner featuring headline: *"Land Your Dream Job in the Philippines with AI-Powered Insights"*.
- Build `AiMatchSimulator` component:
  - Preset target role selectors (e.g., *Senior Full-Stack Dev*, *Frontend Engineer*, *Product Manager*).
  - Client-side animated counter triggering simulated match score breakdown (e.g., 94% Match), 3 matched strengths, and 2 identified skill gaps.
  - Zero backend API cost (runs purely in-browser state).

### Interactive Philippine Net Pay Calculator Widget (`resources/js/components/landing/ph-pay-calculator-widget.tsx`)
- Build standalone local calculator component reusing `PhilippineTaxCalculatorService` logic on the client side:
  - Input field for monthly gross salary in ₱ PHP (default `₱85,000`).
  - Regime selector buttons (*PH Regular Employee*, *8% Freelancer Flat Tax*, *Tax-Exempt / Overseas*).
  - Instant live breakdown showing calculated Net Take-Home Pay, SSS, PhilHealth, Pag-IBIG, and BIR Income Tax.

### ATS Resume Template Switcher (`resources/js/components/landing/ats-resume-previewer.tsx`)
- Build interactive template switcher tab component:
  - Tabs for `ATS Single Column` (Modern Sans-Serif) and `ATS Classic Serif` (Executive Serif).
  - Displays sample candidate profile with target role headline, categorized skills, and bold markdown terms.

### Feature Comparison Matrix (`resources/js/components/landing/comparison-matrix.tsx`)
- Build structured comparative matrix table:
  - Categories: AI Match Analysis, Philippine Statutory Tax Engine, Zero-Storage Resume Privacy, ATS PDF Export, Multi-Currency FX Engine, Smart Action Feed.
  - Features columns for **Excel Spreadsheets**, **Generic Trackers**, and **Aplayan** (highlighted with emerald badges and checkmarks).

### Philippine FAQ Accordion & Final CTA (`resources/js/components/landing/faq-accordion.tsx` & `welcome.tsx`)
- 5-item collapsible accordion answering key questions (Zero-Cost, PH Tax Accuracy, Zero-Storage Privacy, PDF Export, Remote/FX Support).
- High-impact final CTA banner with direct Google OAuth (`/auth/google/redirect`) and Registration (`/register`) actions.

## Testing Decisions

### Good Test Principles
- Test external behavior by asserting HTTP route responses and Inertia component props for guest visitors.
- Validate that guest users accessing `/` receive the `welcome` page component without authorization blocks.
- Ensure all guest routes respond with 200 OK and valid HTML metadata.

### Modules Tested
- `WelcomePageTest`: Pest feature test verifying `GET /` returns `200 OK`, renders Inertia component `welcome`, and contains valid meta tags and guest navigation attributes.
- `GuestRoutesTest`: Feature test verifying guest links (`/login`, `/register`, `/auth/google/redirect`) are correctly configured and accessible.

### Prior Art
- Existing `tests/Feature/Auth/AuthenticationTest.php` for guest access assertions.

## Out of Scope

- Paid subscription tiers or payment gateway integrations (Aplayan remains 100% free).
- Live backend Gemini API calls on the guest landing page (all micro-demos execute client-side to guarantee $0 server/AI operational cost).

## Further Notes

- Maintains 100% serverless zero-cost runtime architecture.
- Adheres strictly to the **"Philippine Professional" Modern Glassmorphism** design system across both light and dark mode.
