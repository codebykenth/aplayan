# 1. OOP Domain Service Layer Architecture with Form Requests, Policies & API Resources

Date: 2026-07-26

## Status
Accepted

## Context
Aplayan requires clean code organization, robust security, and strict data contracts between Laravel and Inertia React components for job application management, AI evaluation, salary estimation, and dashboard metrics. We need an architectural pattern that maintains OOP principles, prevents bloated controllers, enforces authorization/validation, and prevents over-exposing raw model attributes to the frontend.

## Decision
We adopt a **Domain Service Layer Architecture (`app/Services/`) combined with Form Requests (`app/Http/Requests/`), Policies (`app/Policies/`), and API Resources (`app/Http/Resources/`)**:

1. **Form Requests (`app/Http/Requests/`)**: All incoming HTTP payload validation and initial authorization rules are strictly encapsulated within dedicated Laravel Form Request classes (e.g. `StoreJobApplicationRequest`, `UpdateJobApplicationRequest`). Controllers must never perform inline `$request->validate()`.
2. **Authorization Policies (`app/Policies/`)**: Resource access (view, update, delete) is governed by `JobApplicationPolicy`. Actions authorize requests using `Gate::authorize()` returning HTTP 403 Forbidden on unauthorized access attempts.
3. **Domain Service Classes (`app/Services/`)**: All core domain logic, DB transactions, AI API integrations, and aggregation queries are encapsulated within dedicated OOP service classes:
   - `JobApplicationService`: Application CRUD operations, user-scoped querying (`$user->jobApplications()`), and status updates.
   - `GeminiService`: Google Gemini API prompt formatting, HTTP communication, JSON response parsing, and error fallbacks.
   - `DashboardMetricsService`: Statistical aggregations and 30-day application trend calculations.
4. **Eloquent API Resources (`app/Http/Resources/`)**: All data passed to Inertia React components is explicitly transformed using `JobApplicationResource` (`JobApplicationResource::collection()` or `JobApplicationResource::make()`). This guarantees strict response type shapes, formatted dates, and safe field exposure to React state.
5. **Thin HTTP Controllers (`app/Http/Controllers/`)**: Controllers serve solely as HTTP bridges. They receive validated Form Requests, authorize via Policies, delegate work to Service classes, wrap return models in Eloquent API Resources, and return Inertia responses.

## Consequences
- **Pros**:
  - Defense in depth and clean boundaries: Requests validate, Policies authorize, Services execute, and API Resources format output.
  - High testability: Service methods can be unit-tested directly, while controllers, resources, and policies are feature-tested using Pest.
  - Consistent type safety for React TypeScript components via explicit API Resource array shapes.
- **Cons**:
  - Requires maintaining `JobApplicationResource` alongside Controllers, Requests, and Services.
