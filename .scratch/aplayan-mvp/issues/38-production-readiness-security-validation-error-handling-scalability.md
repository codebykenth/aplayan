# Feature Spec: Production Readiness — Security, Validation, Error Handling & Scalability

## Problem Statement

Aplayan is feature-complete but not production-ready. The application currently has no rate limiting on most endpoints, no client-side validation, no custom error pages for HTTP errors, no security headers, inline validation bypassing the Form Request convention, an IDOR vulnerability in contact unlinking, no database indexes on frequently queried columns, no caching on expensive dashboard/analytics queries, no pagination on list endpoints, all AI/import/export operations block the HTTP request synchronously, and no measures to deter casual dev tools inspection. Deploying in this state exposes the app to brute-force attacks, abuse, poor performance at scale, and unprofessional error UX.

## Solution

A comprehensive production hardening pass across the full stack:

1. **Rate limiting** — Group all routes by HTTP method (read/write/update/delete) with per-user throttles. Cap AI endpoints at 10/day. Throttle login and registration.
2. **Backend validation** — Extract all inline validation into dedicated Form Requests. Add input sanitization (strip HTML/script tags) before validation.
3. **Frontend validation** — Add Zod schemas for every form. Validate on submit before sending to the server. Display client-side errors instantly.
4. **Exception handling** — Create a shared Inertia `ErrorPage` component for all HTTP error codes (400–503). Register via `Inertia::handleExceptionsUsing()`.
5. **Security headers** — Add a middleware that sets X-Frame-Options, X-Content-Type-Options, Referrer-Policy, Permissions-Policy, HSTS on every response.
6. **Dev tools deterrent** — Disable right-click, F12, and console output in production via a script in the Blade root template.
7. **Scalability** — Add composite database indexes, cache expensive queries, add pagination to list endpoints, implement server-side search, and enable Vite code splitting.

## User Stories

### Rate Limiting

1. As a user, I want my dashboard to load quickly without being rate-limited, so that normal usage is never interrupted.
2. As a user, I want to create up to 30 job applications per minute without hitting limits, so that bulk data entry works smoothly.
3. As a user, I want AI features limited to 10 requests per day, so that the Gemini API costs stay zero.
4. As an attacker, I want to be blocked from brute-forcing the login endpoint, so that I cannot compromise user accounts.
5. As an attacker, I want to be blocked from mass-registering accounts, so that the platform is not abused.
6. As a user, I want to delete contacts and templates without being throttled unnecessarily, so that cleanup is efficient.

### Backend Validation

7. As a developer, I want all validation logic in dedicated Form Request classes, so that controllers stay thin and validation is consistent.
8. As a user, I want HTML and script tags stripped from all text inputs, so that my data is clean and safe.
9. As a user, I want tax settings validated with proper nested array rules, so that invalid tax configurations are rejected.
10. As a user, I want theme and color theme changes validated against allowed values, so that invalid themes cannot be set.
11. As a user, I want interview dates validated as nullable dates, so that invalid dates are rejected.

### Frontend Validation

12. As a user, I want to see validation errors instantly when I submit a form, so that I can fix mistakes without a round trip.
13. As a user, I want Zod schemas to validate my login credentials before submission, so that I get immediate feedback.
14. As a user, I want my job application form validated for required fields (company name, job title, status) before submission, so that incomplete applications are caught early.
15. As a user, I want my contact form validated for name and email format before submission, so that invalid contacts are caught early.
16. As a user, I want my settings form validated for name, email, and currency before submission, so that invalid profile data is caught early.
17. As a user, I want my password change form to require current password and confirmation match, so that accidental changes are prevented.
18. As a user, I want my goal input validated as a number between 0 and 100, so that unreasonable goals are rejected.
19. As a user, I want my resume save form validated for name and template selection, so that incomplete saves are caught early.

### Exception Handling

20. As a user, I want a friendly error page when I visit a non-existent URL (404), so that I'm not shown a raw stack trace.
21. As a user, I want a friendly error page when I'm not authorized to access a resource (403), so that I understand what happened.
22. As a user, I want a friendly error page when my session has expired (419), so that I know to refresh and log in again.
23. As a user, I want a friendly error page when I hit the rate limit (429), so that I know to wait before retrying.
24. As a user, I want a friendly error page when the server encounters an error (500), so that I'm not shown sensitive debug information.
25. As a user, I want a friendly error page when the service is temporarily unavailable (503), so that I know to check back later.
26. As a user, I want error pages to include a "Go Home" link, so that I can easily return to the dashboard.

### Security Headers

27. As a user, I want the app to set X-Frame-Options: DENY, so that it cannot be embedded in iframes (clickjacking protection).
28. As a user, I want the app to set X-Content-Type-Options: nosniff, so that browsers don't MIME-sniff responses.
29. As a user, I want the app to set Referrer-Policy: strict-origin-when-cross-origin, so that my referrer info is limited.
30. As a user, I want the app to set Permissions-Policy to disable camera, microphone, and geolocation, so that the page cannot access these APIs.
31. As a user, I want the app to set Strict-Transport-Security in production, so that my browser enforces HTTPS.

### Dev Tools Deterrent

32. As a platform owner, I want right-click disabled on the page, so that casual users cannot inspect elements.
33. As a platform owner, I want F12 and Ctrl+Shift+I/J/C keyboard shortcuts disabled, so that casual users cannot open DevTools.
34. As a platform owner, I want console output silenced in production, so that the app cannot be inspected via the console.

### Scalability — Database Indexes

35. As a user, I want my dashboard to load fast, so that I can quickly see my job application overview.
36. As a user, I want the analytics page to load fast, so that I can review my job search performance without waiting.
37. As a user, I want the calendar to load fast, so that I can quickly see upcoming interviews and follow-ups.

### Scalability — Caching

38. As a user, I want my dashboard metrics cached for 60 seconds, so that repeated visits are instant.
39. As a user, I want my analytics charts cached for 10 minutes, so that the page loads fast even with complex queries.
40. As a user, I want my action feed cached for 5 minutes, so that the dashboard smart actions load quickly.
41. As a user, I want my goal progress cached for 60 seconds, so that the weekly streak display is instant.

### Scalability — Pagination

42. As a user with 200+ job applications, I want the list paginated (25 per page), so that the page loads quickly.
43. As a user with 100+ contacts, I want the list paginated, so that the page loads quickly.
44. As a user, I want pagination controls with page numbers, so that I can navigate between pages easily.
45. As a user, I want the current page to maintain my search/filter state, so that I don't lose context when paginating.

### Scalability — Server-Side Search

46. As a user with many job applications, I want to search by company name or job title on the server side, so that results are fast even with large datasets.
47. As a user, I want search results to update as I type (debounced), so that the experience feels responsive.

### Scalability — Code Splitting

48. As a user, I want only the JavaScript needed for the current page loaded, so that initial page load is fast.
49. As a user, I want analytics charts (recharts) loaded lazily, so that the 200KB+ chart library doesn't slow down other pages.

## Implementation Decisions

### Rate Limiting

- Define 4 new rate limiters in `AppServiceProvider::boot()`: `read` (120/min), `write` (30/min), `update` (30/min), `delete` (20/min). All scoped per-user via `->by("limiter:user_id")`.
- Change existing `ai` limiter from `20/day` to `10/day`.
- Wrap routes in `routes/web.php` by HTTP method group with `throttle:` middleware.
- AI routes get stacked middleware: `throttle:write,ai` (both per-minute and daily caps apply).
- Add `throttle:5,1` on `POST /login` and `throttle:3,1` on `POST /register`.
- Email verification keeps existing `throttle:6,1`.

### Backend Validation

- Create 6 new Form Request classes following existing convention (`authorize(): true`, `rules(): array`):
  - `UpdateThemeRequest` — validates `theme` enum
  - `UpdateColorThemeRequest` — validates `color_theme` enum
  - `UpdateTaxSettingsRequest` — validates nested `tax_settings` array with allowances and custom deductions
  - `UpdateInterviewDateRequest` — validates nullable `interview_date`
  - `SaveResumeRequest` — validates `name`, `template`, `profile_data`, `photo_url`
  - `MarkAsContactedRequest` — validates nullable `date`
- Create `App\Support\Sanitizer` utility class with `stripTags()` and `sanitizeArray()` static methods.
- Add `sanitize()` method to each new Form Request that runs `Sanitizer::sanitizeArray()` on input before validation.
- Add sanitization to high-traffic existing Form Requests: `StoreJobApplicationRequest`, `UpdateJobApplicationRequest`, `StoreContactRequest`, `UpdateContactRequest`, `UpdateProfileRequest`, `UpdateResumeProfileRequest`.
- Update controllers to type-hint new Form Requests and remove inline `$request->validate()`.

### Frontend Validation

- Create `resources/js/lib/validations.ts` exporting Zod schemas for all forms.
- Include a `validateWithZod(schema, data)` helper that returns `{ data, errors }` — maps Zod issues to a `Record<string, string>` compatible with Inertia's `useForm` `setError()`.
- All text inputs run through a `sanitize` transform in Zod that strips HTML tags and trims whitespace.
- Each form page imports its schema and calls `validateWithZod()` in the submit handler before `post()`/`put()`/`patch()`.
- Auth pages (login, register) use native HTML forms — add `onSubmit` Zod validation before `form.submit()`.
- Error display pattern stays consistent: `{errors.field && <p className="text-xs text-destructive">{errors.field}</p>}`.

### Exception Handling

- Use `Inertia::handleExceptionsUsing()` in `AppServiceProvider::boot()` to render a shared `ErrorPage` component for status codes: 400, 401, 403, 404, 405, 419, 429, 500, 502, 503.
- Call `->withSharedData()` so error pages have access to auth user, CSRF token, etc.
- Create `resources/js/pages/ErrorPage.tsx` — single React component with a `status` prop, mapping codes to title + description + "Go Home" link.
- Keep existing `shouldRenderJsonWhen` in `bootstrap/app.php` for AJAX/API fallback.

### Security Headers

- Create `app\Http\Middleware\SecurityHeaders` class.
- Set headers on every response: `X-Frame-Options: DENY`, `X-Content-Type-Options: nosniff`, `X-XSS-Protection: 1; mode=block`, `Referrer-Policy: strict-origin-when-cross-origin`, `Permissions-Policy: camera=(), microphone=(), geolocation=()`.
- Add `Strict-Transport-Security: max-age=31536000; includeSubDomains` only when `app()->isProduction()`.
- Register in `bootstrap/app.php` global web middleware stack.

### Dev Tools Disabling

- Add a `<script>` block in `resources/views/app.blade.php` before `</body>`.
- Disable `contextmenu` event (right-click).
- Disable keydown for F12, Ctrl+Shift+I/J/C, Ctrl+U.
- Override `console.log`, `console.warn`, `console.error`, `console.debug`, `console.info` to no-ops.
- This is deterrent-level only — determined users can bypass via browser settings.

### Scalability — Database Indexes

- Create one migration adding composite indexes:
  - `job_applications`: `(user_id, created_at)`, `(user_id, status)`, `interview_date`, `last_contacted_at`
  - `job_application_activities`: `(job_application_id, type)`, `created_at`
  - `contact_job_application`: standalone index on `job_application_id`
  - `ai_responses_cache`: index on `feature_type`

### Scalability — Caching

- Wrap `DashboardMetricsService` methods in `Cache::remember("dashboard:{method}:{user_id}", 60, fn() => ...)`.
- Wrap `ActionFeedService::forUser()` in `Cache::remember("action_feed:{user_id}", 300, fn() => ...)`.
- Wrap `GoalService::forUser()` in `Cache::remember("goals:{user_id}", 60, fn() => ...)`. Fix duplicate `weeklyHistory()` call.
- Wrap `AnalyticsService` methods in `Cache::remember("analytics:{method}:{user_id}", 600, fn() => ...)`.
- Invalidate relevant caches in `JobApplicationService` on create/update/delete via `Cache::forget()`.
- Use default database cache store (not Redis) — compatible with Vercel serverless.

### Scalability — Pagination

- `JobApplicationController::index()`: Change `->get()` to `->paginate(25)` with cursor pagination for smooth infinite scroll.
- `ContactController::index()`: Change `->get()` to `->paginate(25)`.
- Frontend: Use Inertia pagination props (`data`, `links`) with page number navigation or infinite scroll.
- Maintain search/filter state across pages via Inertia query params.

### Scalability — Server-Side Search

- Add optional `search` parameter to `JobApplicationService::listForUser()`.
- Apply `where('company_name', 'LIKE', "%{$search}%")` OR `where('job_title', 'LIKE', "%{$search}%")` when search is present.
- Frontend sends debounced search query via `router.get()` with `preserveState: true`.

### Scalability — Code Splitting

- Change `import.meta.glob('./pages/**/*.tsx', { eager: true })` to `{ eager: false }` in `resources/js/app.tsx`.
- This enables automatic code splitting — each page's JS is loaded on demand.
- Analytics pages with recharts (~200KB) only load when the user navigates to `/analytics` or `/dashboard`.

## Testing Decisions

### Good Test Principles

- Test external behavior (HTTP responses, DB state, cached values) not implementation details.
- Each test should be independent and not rely on other tests running first.
- Use existing factories for model creation in tests.
- Run `php artisan test --compact` with specific filenames or filters for speed.

### Modules Tested

- **Rate Limiting**: Feature test that sends requests beyond limits and asserts 429 responses. Test each limiter group (read, write, update, delete, ai).
- **Form Requests**: Feature test that POSTs invalid data to each endpoint and asserts validation errors. Test sanitization (HTML tag stripping).
- **Exception Handling**: Feature test that hits non-existent routes (404), unauthorized resources (403), and verifies error page rendering.
- **Security Headers**: Feature test that asserts response headers contain expected security headers.
- **Pagination**: Feature test that creates 30 job applications and asserts the index returns paginated results (25 per page).
- **Caching**: Feature test that calls dashboard/analytics twice and asserts the second call hits cache (faster, fewer queries).
- **Search**: Feature test that creates applications with different company names and asserts search returns matching results.

### Prior Art

- Existing `tests/Feature/` tests follow the pattern: `$this->actingAs($user)->get(route('...'))->assertOk()`.
- Existing `tests/Unit/` tests for services follow: `$service->method($user)->assertArrayHasKey(...)`.
- Existing form validation tests use: `$this->actingAs($user)->post(route('...'), $invalidData)->assertSessionHasErrors(...)`.

## Out of Scope

- **Redis for cache/session** — Using default database cache store for Vercel serverless compatibility.
- **Async AI calls via Jobs** — AI operations remain synchronous (30s timeout). Deferred to a future iteration.
- **Streaming export/import** — Export/import remain in-memory. Deferred to a future iteration.
- **Full-text search indexes** — Using LIKE queries for now. MySQL FULLTEXT or PostgreSQL tsvector deferred.
- **Session driver change** — Remaining on database sessions. Redis migration deferred.
- ** npm dependency updates** — Already handled via `npm audit fix --force`.
- **GitHub issue tracker migration** — Using local markdown until `gh` CLI is installed.

## Further Notes

- The app deploys to Vercel serverless. All decisions respect this constraint (no Redis, no long-running processes, database cache store).
- All new code follows existing conventions: Form Requests for validation, Services for business logic, Policies for authorization, API Resources for response transformation.
- The security headers middleware is non-breaking — it adds headers without modifying existing behavior.
- The dev tools disabling is deterrent-level only. It stops casual inspection but not determined attackers.
- Database indexes are designed for the most common query patterns identified in the audit. Additional indexes can be added as new query patterns emerge.
