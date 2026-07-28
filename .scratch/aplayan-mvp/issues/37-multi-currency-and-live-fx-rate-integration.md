# Issue 37: Multi-Currency & Live Foreign Exchange (FX) Rate Integration Architecture

## Problem Statement

Filipino job seekers track job applications across both local companies (paid in PHP ₱) and international/remote companies (paid in USD $, EUR €, AUD A$, SGD S$, etc.). Currently, salary fields (`expected_salary`, `offered_salary`) implicitly assume PHP ₱. Without per-application currency tracking, live foreign exchange rate conversion, and currency normalization in charts and tax calculation engines, users applying for foreign or remote roles cannot accurately compare offers or view unified salary analytics.

## Solution

1. **Per-Application ISO Currency Field**:
   - Add `currency` column (`VARCHAR(3)`, default `'PHP'`) to `job_applications` table.
   - Update `JobApplication` model, `StoreJobApplicationRequest`, `UpdateJobApplicationRequest`, and `JobApplicationResource`.
   - Update User Settings default currency in `users.tax_settings` / user preferences.

2. **Curated Currency Selection & Symbol Formatting**:
   - Support top ISO currency codes: `PHP (₱)`, `USD ($)`, `EUR (€)`, `GBP (£)`, `AUD (A$)`, `CAD (C$)`, `SGD (S$)`, `JPY (¥)`, `AED (AED)`, `NZD (NZ$)`.
   - Add frontend currency formatting utilities with symbol badges.

3. **Daily-Cached Free Live FX API (`FxExchangeService`)**:
   - Create server-side `FxExchangeService` to query a free public FX rate API (`open.er-api.com`).
   - Cache FX rates in Laravel for 24 hours (`Cache::remember('fx_rates_' . $baseCurrency, 86400, ...)`).
   - Fall back seamlessly to hardcoded fallback rates if the external FX service is unreachable.

4. **Multi-Currency Analytics Normalization**:
   - Update backend `DashboardMetricsService` and Analytics queries to convert non-base currency salaries into the user's base display currency before computing Salary Insights and Band Distribution charts.

5. **Dynamic Net Take-Home Tax Engine Conversion**:
   - Convert foreign offers (e.g. USD) to PHP using the FX rate before evaluating tax regimes (8% Freelancer, Tax-Exempt / Overseas, PH Employee), displaying net pay in both native currency and converted base currency.

## User Stories

1. As a job seeker applying for a US remote role, I want to select USD ($) as the currency for my application, so that I can record my expected/offered salary accurately in USD.
2. As a job seeker, I want to set my default currency (e.g., PHP ₱) in my User Settings, so that new job applications automatically default to my preferred currency.
3. As a job seeker with offers in both USD ($4,000/mo) and PHP (₱150,000/mo), I want the Analytics charts to normalize amounts to PHP, so that I can view accurate aggregated salary statistics across my entire job hunt.
4. As a remote contractor receiving a foreign offer in USD, I want the Net Take-Home Pay engine to convert my offer to PHP and apply the 8% Freelancer tax regime, so that I can see my net income in both USD and PHP.
5. As a user tracking applications during an external FX API outage, I want the application to fall back gracefully to cached or fallback conversion rates, so that my dashboard and application management never crash or slow down.
6. As a user viewing job application cards and detail modals, I want to see clean currency symbol badges (e.g., `$4,000 / mo`, `₱120,000 / mo`), so that I can instantly distinguish local and foreign salary figures.

## Implementation Decisions

- **Database Schema**: Add `currency` (VARCHAR(3), default `'PHP'`) to `job_applications` table via a new migration.
- **Service Layer**: Implement `FxExchangeService` in `app/Services/FxExchangeService.php` to handle external HTTP fetching, 24-hour Laravel caching, and hardcoded fallback rate array lookup.
- **Backend Analytics Integration**: Inject `FxExchangeService` into `DashboardMetricsService` to normalize salaries before aggregating chart datasets.
- **Tax Engine Integration**: Update `TaxCalculatorService` to convert foreign currency offer amounts to base currency before running statutory tax rules.
- **Form Validation & Serialization**: Add `currency` validation rules to `StoreJobApplicationRequest` and `UpdateJobApplicationRequest` (in array of valid ISO codes). Include `currency` in `JobApplicationResource`.
- **Frontend UI Components**: Update `application-detail-modal.tsx`, `job-application-card.tsx`, `kanban-board.tsx`, and `index.tsx` to render currency selector dropdowns and formatted currency badges.

## Testing Decisions

- Only test external behavior and endpoints, not internal API mock structures.
- **Feature Tests**:
  - Test creating a job application with a non-default currency (`USD`) via `JobApplicationController@store`.
  - Test updating an application's currency via `JobApplicationController@update`.
  - Test `FxExchangeService` returns valid exchange rate arrays and falls back gracefully when external endpoints fail.
  - Test `DashboardMetricsService` computes normalized salary stats accurately when mixed currency applications exist.
  - Test `TaxCalculatorService` handles foreign currency offer conversions correctly.

## Out of Scope

- Real-time intraday FX stock market trading tickers or sub-minute rate updates.
- Historical FX exchange rate tracking on exact dates in the past.

## Further Notes

- Reference ADR 0011 (`docs/adr/0011-multi-currency-and-live-fx-rate-integration.md`) for architectural details.
