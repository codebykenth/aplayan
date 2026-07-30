# Issue 45: Admin Dashboard & System Management

## Problem Statement

As Aplayan grows in features and user base, system administrators lack a dedicated internal interface to monitor application analytics, oversee registered users, inspect AI rate limiting & usage, update legal policies (Privacy Policy & Terms of Service) dynamically, and manage user roles. Currently, user permissions are unsegmented, legal document content is static, and platform metrics require direct database or log inspection.

## Solution

Implement an **Admin Dashboard Suite** accessible exclusively to authenticated users with the `admin` role:
1. **Role-Based Authorization:** Add a `role` column (`'user'`, `'admin'`) to the `users` database table, guarded by an `$user->isAdmin()` method and `EnsureUserIsAdmin` middleware on `/admin/*` routes.
2. **Consistent Admin Layout:** Create `resources/js/layouts/admin-layout.tsx` that strictly mirrors the visual aesthetic, dark mode support, and navigation flow of the main application layout.
3. **Core Admin Modules:**
   - **Overview Metrics (`/admin/dashboard`):** Real-time telemetries (total users, active job applications, generated resumes, daily AI API calls).
   - **User Management (`/admin/users`):** Search, filter, view user details, toggle roles between `user` and `admin`, and suspend/delete accounts.
   - **AI Usage Monitor (`/admin/ai-usage`):** Track daily AI consumption logs, identify top AI consumers, and monitor API quota thresholds.
   - **Legal Document CMS (`/admin/legal-documents`):** Dynamic Markdown editor to manage Privacy Policy and Terms of Service stored in a `legal_documents` database table, dynamically rendered on public compliance pages.

## User Stories

1. As a system administrator, I want to log in and access an `/admin` portal, so that I can manage the platform securely from a unified dashboard.
2. As a non-admin user, I want attempts to access `/admin/*` routes blocked with a 403 Forbidden or redirected, so that administrative tools remain protected.
3. As an administrator, I want to view platform-wide metrics (user counts, tracked applications, total resumes, AI usage), so that I can evaluate platform growth and resource consumption.
4. As an administrator, I want to search registered users and update their role between 'user' and 'admin', so that I can grant or revoke administrative privileges.
5. As an administrator, I want to monitor daily AI API consumption by user, so that I can prevent API abuse and track infrastructure costs.
6. As an administrator, I want an in-app Markdown editor to update the Privacy Policy and Terms of Service, so that legal policy updates do not require code redeployments.
7. As a public visitor, I want `/privacy-policy` and `/terms-of-service` to render the latest published legal text from the database (with fallback to default content), so that I am always viewing current terms.

## Implementation Decisions

- **Database Schema Changes:**
  - Create a migration adding `role` (`string`, default `'user'`, indexed) to `users`.
  - Create a `legal_documents` table with columns: `id`, `key` (`string`, unique, e.g., `'privacy_policy'`, `'terms_of_service'`), `title` (`string`), `content` (`longText`), `version` (`integer`), `updated_at`, `created_at`.

- **Backend Authorization & Mirroring:**
  - Create `app/Http/Middleware/EnsureUserIsAdmin.php` checking `$request->user()?->isAdmin()`.
  - Colocate Admin controllers strictly in `app/Http/Controllers/Admin/`:
    - `DashboardController.php` (`/admin/dashboard`)
    - `UserController.php` (`/admin/users`)
    - `AiUsageController.php` (`/admin/ai-usage`)
    - `LegalDocumentController.php` (`/admin/legal-documents`)

- **Frontend Structure & Layout:**
  - Create `resources/js/layouts/admin-layout.tsx` incorporating the platform's standard sidebar styling, dark/light theme switcher, user avatar menu, and responsive mobile drawer.
  - Colocate Admin pages strictly in lowercase directories:
    - `resources/js/pages/admin/dashboard/index.tsx`
    - `resources/js/pages/admin/users/index.tsx`
    - `resources/js/pages/admin/ai-usage/index.tsx`
    - `resources/js/pages/admin/legal/index.tsx`

- **Legal Document Public Integration:**
  - Update `PrivacyPolicyController` and `TermsOfServiceController` to check the `legal_documents` table for active content, falling back to local view/file content if unseeded.

## Testing Decisions

- **Testing Philosophy:**
  - Test external HTTP responses, role authorization enforcement, and data mutations.
- **Pest Feature Tests:**
  - `tests/Feature/Admin/AdminAuthorizationTest.php`: Assert guests and regular users (`role = 'user'`) receive `403 Forbidden` on `/admin/*` routes, while admin users (`role = 'admin'`) access `/admin/*` successfully.
  - `tests/Feature/Admin/UserManagementTest.php`: Assert admins can search users, toggle roles, and update user statuses.
  - `tests/Feature/Admin/LegalDocumentCmsTest.php`: Assert admins can update legal documents via POST/PUT, and public pages reflect the updated text.

## Out of Scope

- Super-admin multi-tenant organization scoping.
- Live chat / customer support ticketing module inside admin panel.

## Further Notes

- Maintains 100% DRY compliance by sharing UI primitives (`resources/js/components/ui/`) between user and admin layouts.
