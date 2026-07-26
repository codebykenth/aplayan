# 1. OOP Domain Service Layer Architecture with Form Requests & Policies

Date: 2026-07-26

## Status
Accepted

## Context
Aplayan requires clean code organization and robust security for job application management, AI evaluation, salary estimation, and dashboard metrics calculation. We need an architectural pattern that maintains OOP principles, prevents bloated controllers, and enforces strict authorization and validation without cross-tenant data leakage.

## Decision
We adopt a **Domain Service Layer Architecture (`app/Services/`) combined with Form Requests (`app/Http/Requests/`) and Policies (`app/Policies/`)**:

1. **Form Requests (`app/Http/Requests/`)**: All incoming HTTP payload validation and initial authorization rules are strictly encapsulated within dedicated Laravel Form Request classes (e.g. `StoreJobApplicationRequest`, `UpdateJobApplicationRequest`). Controllers must never perform inline `$request->validate()`.
2. **Authorization Policies (`app/Policies/`)**: Resource access (view, update, delete) is governed by `JobApplicationPolicy`. Actions authorize requests using `Gate::authorize()` or `$this->authorize()` returning HTTP 403 Forbidden on unauthorized access attempts.
3. **Domain Service Classes (`app/Services/`)**: All core domain logic, DB transactions, AI API integrations, and aggregation queries are encapsulated within dedicated OOP service classes:
   - `JobApplicationService`: Application CRUD operations, user-scoped querying (`$user->jobApplications()`), and status updates.
   - `GeminiService`: Google Gemini API prompt formatting, HTTP communication, JSON response parsing, and error fallbacks.
   - `DashboardMetricsService`: Statistical aggregations and 30-day application trend calculations.
4. **Thin HTTP Controllers (`app/Http/Controllers/`)**: Controllers serve solely as HTTP bridges. They receive validated Form Requests, authorize via Policies, delegate work to injected Service classes, and return Inertia responses.

## Consequences
- **Pros**:
  - Defense in depth: Policies return clear 403 Forbidden errors while Service queries enforce `$user->jobApplications()` scoping.
  - High testability: Service methods can be unit-tested directly, while controllers and policies are feature-tested using Pest.
  - Zero bloated controllers and 100% adherence to Laravel strict authorization and validation rules.
- **Cons**:
  - Requires maintaining `JobApplicationPolicy` alongside Controllers and Requests.
