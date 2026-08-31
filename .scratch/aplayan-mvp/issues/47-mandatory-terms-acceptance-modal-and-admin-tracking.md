# Issue 47: Mandatory Terms Acceptance Modal & Admin Tracking

## Problem Statement

To comply with Philippine data privacy regulations (such as RA 10173 / Data Privacy Act of 2012) and platform terms of service, users must explicitly review and accept the Terms of Service and Privacy Policy before accessing authenticated platform capabilities. Previously, terms acceptance was implicit, leaving no auditable timestamp in the database or visibility for administrators in the User Management dashboard.

## Solution

Build a **Mandatory Terms & Conditions Acceptance Modal & Admin Tracking Flow**:
1. **Database Schema:** Add a `terms_accepted_at` timestamp column to the `users` table.
2. **Acceptance Endpoint:** Provide `POST /terms/accept` handled by `AcceptTermsController` to mark terms as accepted with the current timestamp.
3. **Non-Dismissible Terms Acceptance Modal:**
   - Appears automatically across `AppLayout` and `AdminLayout` whenever an authenticated user has `terms_accepted_at === null`.
   - Includes concise policy summaries and direct links to the public Terms of Service and Privacy Policy pages.
   - Requires explicit checkbox agreement before enabling the "Accept & Continue" action.
   - Includes a clean "Log Out" option for users who decline to accept.
4. **Admin User Management Column:**
   - Display a single-line "Terms Accepted" column in `/admin/users` showing an accepted icon with formatted date or a pending indicator.

## User Stories

1. As a newly registered or existing user who hasn't accepted policies, I want to be presented with a clear Terms & Privacy acceptance modal upon login, so that I can review and agree to platform rules before continuing.
2. As a user reviewing policies in the modal, I want links to open the full Terms of Service and Privacy Policy in a new tab, so that I can read the complete documents without losing my current session.
3. As a user who does not wish to accept the updated terms, I want an option to log out directly from the modal, so that I can safely exit my account.
4. As an administrator, I want to see whether each user has accepted terms and the exact date of acceptance in the User Management table, so that I have clear compliance records.

## Implementation Decisions

- **Database Schema:**
  - Added `terms_accepted_at` (`timestamp`, nullable) to `users` table via migration `2026_08_31_000001_add_terms_accepted_at_to_users_table.php`.
  - Added `terms_accepted_at` to `$fillable` and `casts` as `datetime` in `User` model, with a `hasAcceptedTerms(): bool` helper.

- **Backend Endpoints:**
  - Added `POST /terms/accept` route named `terms.accept` mapped to `AcceptTermsController@store`, protected by `auth` middleware.

- **Frontend Components:**
  - Created `AcceptTermsModal` (`resources/js/components/domain/accept-terms-modal.tsx`) using Base UI Dialog primitives with `disablePointerDismissal`.
  - Embedded `AcceptTermsModal` in `AppLayout` (`resources/js/layouts/app-layout.tsx`) and `AdminLayout` (`resources/js/layouts/admin-layout.tsx`).
  - Added `terms_accepted_at` to the `AuthUser` / `User` TypeScript definitions (`resources/js/types/auth.ts`).

- **Admin User Management UI (`/admin/users`):**
  - Added "Terms Accepted" column to the table in `resources/js/pages/admin/users/index.tsx` showing formatted date with `CheckCircle2` icon or `Clock` Pending indicator.

## Testing Decisions

- **Pest Feature Tests:**
  - `tests/Feature/Auth/AcceptTermsTest.php`:
    - Assert authenticated user can accept terms via `POST /terms/accept`.
    - Assert unauthenticated user cannot accept terms.
    - Assert user with accepted terms retains the timestamp.
  - `tests/Feature/Admin/UserManagementTest.php`:
    - Assert admin can view terms acceptance status across users.
