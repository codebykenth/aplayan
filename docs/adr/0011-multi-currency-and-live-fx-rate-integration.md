# ADR 0011: Multi-Currency & Live Foreign Exchange (FX) Rate Integration Architecture

## Status
Accepted

## Context
Filipino job seekers track job applications across both local companies (paid in PHP ₱) and international/remote companies (paid in USD $, EUR €, AUD A$, SGD S$, etc.). Previously, expected and offered salary fields assumed a single implicit currency (PHP ₱).

To support remote and global job offers while maintaining accurate salary analytics, offer comparisons, and net take-home pay calculations, Aplayan requires dynamic multi-currency support per job application.

## Decision

We adopt a **Per-Application Currency with Live Daily Cached FX Rate Conversion** architecture:

1. **Per-Application ISO Currency Storage**:
   - Add `currency` (string, ISO 4217 code, e.g., `'PHP'`, `'USD'`, `'EUR'`, default `'PHP'`) to `job_applications`.
   - `expected_salary` and `offered_salary` retain raw numeric values in the job application's native currency.
   - Add `currency` (default base display currency) to `users.tax_settings` / user preferences.

2. **Curated Currency List & Symbol Formatting**:
   - Standardized selection list: `PHP (₱)`, `USD ($)`, `EUR (€)`, `GBP (£)`, `AUD (A$)`, `CAD (C$)`, `SGD (S$)`, `JPY (¥)`, `AED (AED)`, `NZD (NZ$)`.
   - UI formatting helper (`formatCurrency(amount, currencyCode)`) displays correct currency symbols and number formatting across tables, cards, and modals.

3. **Daily Cached Live Foreign Exchange (FX) Service**:
   - Server-side `FxExchangeService` queries a free public exchange rate endpoint (e.g. `open.er-api.com`) to retrieve conversion rates relative to the user's base currency.
   - Rates are cached in Laravel for 24 hours (`Cache::remember('fx_rates_' . $baseCurrency, 86400, ...)`).
   - If the external API fails, times out, or rate limits, the service falls back gracefully to hardcoded static rates (e.g., 1 USD = 58.50 PHP), guaranteeing 100% uptime and zero external API dependencies.

4. **Multi-Currency Analytics & Tax Engine Normalization**:
   - **Analytics Suite**: Converts foreign currency salary offers into the user's base display currency (PHP) on the backend before computing aggregate Salary Insights and Salary Band Distribution charts.
   - **Net Take-Home Pay Engine**: Converts foreign currency offers to PHP using the FX rate, computes statutory PH contributions (SSS, PhilHealth, Pag-IBIG) or 8% Freelance flat tax in PHP, and renders net take-home pay in both native currency (USD) and converted base currency (PHP).

## Consequences

### Positive
- Allows job seekers to track both local and foreign/remote job offers in their native currencies without losing precision.
- Keeps analytics charts unified and readable by normalizing all figures to the user's base display currency.
- Daily caching maintains instant server response times (0ms external API overhead during page renders).
- Hardcoded fallback rates protect the application from external FX provider outages or API downtime.

### Negative
- Exchange rates fluctuate daily, so historical aggregate charts may reflect current rate conversions rather than exact historical conversion rates on the day applied.
