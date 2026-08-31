# 0014. Mandatory Terms & Conditions Acceptance Modal

Date: 2026-08-31

## Status

Accepted

## Context

To ensure compliance with privacy regulations (including the Philippine Data Privacy Act of 2012 / RA 10173) and platform usage policies, new users must explicitly review and accept the Terms of Service and Privacy Policy before accessing authenticated features in Aplayan.

## Decision

1. **Database Schema**: Added `terms_accepted_at` (nullable timestamp) to the `users` table.
2. **Acceptance Endpoint**: Introduced `POST /terms/accept` handled by `AcceptTermsController` that sets `terms_accepted_at` to the current timestamp.
3. **Modal UI (`AcceptTermsModal`)**:
   - Integrated at the layout level (`AppLayout` and `AdminLayout`).
   - Triggered automatically if an authenticated user has `terms_accepted_at === null`.
   - Non-cancellable: Close button ('x') removed, escape key and outside click dismissal disabled.
   - Requires checking the agreement checkbox to enable the `CONTINUE` button.
   - Provides a `LOGOUT` button for users who choose not to agree.

## Consequences

- Authenticated users cannot interact with the dashboard, applications, documents, or settings until terms are explicitly accepted.
- Audit trail for terms acceptance is recorded per user.
