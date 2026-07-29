# Issue 42: Unified Error Handling, Auto-Scroll & Environment-Aware Sanitization

## Goal
Implement a unified error handling system featuring a reusable `<FormField>` component, global toast notifications via `@base-ui/react/toast`, automatic scrolling to invalid fields on submission errors, and environment-aware error sanitization (raw details in development, safe friendly messages in production).

## User Story
As an Aplayan user, I want clear inline error messaging, automatic page scrolling to invalid inputs, and helpful toast alerts when form actions fail, while ensuring technical database errors are safely hidden in production and detailed in development.

## Scope & Technical Requirements

### 1. Reusable `<FormField>` Component (`resources/js/components/ui/form-field.tsx`)
- Standardized wrapper for inputs across all forms (Job Applications, Contacts, Settings, Resume Builder).
- Props: `label`, `error`, `required`, `children`, `className`.
- Features:
  - Destructive border/ring styling (`border-destructive focus-visible:ring-destructive`) when error exists.
  - Accessibility attributes (`aria-invalid="true"`).
  - Standardized `<InputError message={error} />` rendering.

### 2. Global Form & Async Hook (`resources/js/hooks/use-form-submit.ts`)
- Custom hook wrapping Inertia `useForm` and fetch async calls.
- Features:
  - **Toast Dispatch**: Fires global toast alert when validation or API requests fail.
  - **Auto-Scroll**: Locates first input with `aria-invalid="true"` and performs smooth `scrollIntoView()`.

### 3. Environment-Aware Error Sanitizer (`resources/js/lib/error-sanitizer.ts`)
- **Development (`APP_ENV=local`)**: Display raw exception messages (`SQLSTATE`, missing classes, line numbers) in toasts/banners for fast debugging.
- **Production (`APP_ENV=production`)**: Sanitize internal database/PHP errors into clean user messages:
  - **401/403**: *"Session expired or permission denied."*
  - **422**: *"Validation failed. Please check the highlighted fields."*
  - **429**: *"Rate limit exceeded. Please wait a moment before trying again."*
  - **500**: *"Something went wrong. Please try again later."*

## Acceptance Criteria
- [ ] Every form field across application forms utilizes `<FormField>` for input error styling and inline text.
- [ ] Submitting a form with errors automatically scrolls the viewport to the first invalid input field.
- [ ] Form submission errors trigger a global toast notification.
- [ ] Raw `SQLSTATE` and PHP backend exception strings are sanitized in production environments.
- [ ] Raw exception strings remain visible in development mode (`APP_ENV=local`) for debugging.

## Verification Plan
### Automated Tests
- `php artisan test --compact`

### Manual Verification
- Trigger form validation errors on Job Applications, Contacts, and Settings forms.
- Verify auto-scroll behavior and toast notification display.
