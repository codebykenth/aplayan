# Feature Specification: Unified Error Handling & Environment-Aware Sanitization

## Problem Statement

Users and developers encounter fragmented error reporting across the Aplayan web application:

1. **Inconsistent Form Input Error Display**: Some form inputs render inline error text while others rely on browser tooltips or lack destructive focus styling, creating inconsistent form submission experiences.
2. **Missing Global Notification Feedback**: When a multi-field form or async modal action fails, users must manually scroll through the form to discover which specific field failed, leading to frustration.
3. **Sensitive Error Exposure in Production**: Backend exceptions (such as raw `SQLSTATE` database constraint errors, missing class exceptions, or unhandled model exceptions) can leak internal schema and file path details to end users in production. Conversely, developers in local environments need raw exception details in toasts/banners to rapidly diagnose bugs.

## Solution

1. **Standardized Reusable `<FormField>` Component**:
   - Create a unified component that encapsulates field labels, required indicators, accessible `aria-invalid` attributes, destructive focus borders (`border-destructive focus-visible:ring-destructive`), and `<InputError>` message rendering.

2. **Global Form & Async Error Hook (`useFormSubmit`)**:
   - Create a reusable React hook that wraps Inertia forms and async API calls to automatically trigger toast notifications (`@base-ui/react/toast` / shadcn toast manager) and auto-scroll to the first invalid input field upon validation failure.

3. **Environment-Aware Error Sanitization**:
   - **Production (`APP_ENV=production`)**: Sanitize internal database/PHP exceptions into clean, user-friendly status messages (e.g. 401/403: *"Session expired or permission denied"*, 422: *"Validation failed. Please check the highlighted fields"*, 429: *"Rate limit exceeded"*, 500: *"Something went wrong. Please try again later"*).
   - **Development (`APP_ENV=local`)**: Preserve raw backend exception messages (`SQLSTATE`, class names, stack traces) directly in toasts and inline error banners for instant developer feedback.

## User Stories

1. As a job seeker, I want every form field to show clear inline error text and destructive outline borders when I enter invalid data, so that I know exactly which input needs correction.
2. As a job seeker, I want a global toast notification to appear when form validation fails, so that I am immediately alerted even if the invalid input is currently off-screen.
3. As a job seeker, I want the page to automatically scroll to the first invalid field when I submit a form with errors, so that I can correct it without manual searching.
4. As a production user, I want error messages to be clear, friendly, and free of confusing database codes or file paths, so that the application feels professional and secure.
5. As a developer in local mode, I want raw exception messages (like `SQLSTATE` or missing classes) to appear in toast alerts and error banners, so that I can immediately debug backend issues without digging through server logs.
6. As a job seeker using AI features, I want rate-limit (HTTP 429) errors to explicitly inform me to wait rather than showing generic failure messages, so that I understand why the action paused.

## Implementation Decisions

- **`<FormField>` Component Interface**:
  - Reusable component wrapping `<Label>`, child input element, and `<InputError>`.
  - Automatically sets `aria-invalid={!!error}` on child inputs.
  - Applies `border-destructive focus-visible:ring-destructive` when error prop is non-empty.

- **`useFormSubmit` Hook & Auto-Scroll**:
  - Intercepts Inertia `useForm` `onError` callbacks.
  - Finds the first DOM element matching `[aria-invalid="true"]` or `.text-destructive` and triggers smooth `scrollIntoView({ behavior: 'smooth', block: 'center' })`.
  - Calls `toast.add()` with error summaries.

- **Environment Error Sanitizer Utility**:
  - Utility function `sanitizeErrorMessage(error, env)`:
    - If `env === 'local'`, return raw error string.
    - If `env === 'production'`, inspect status codes and sanitizes known internal patterns (`SQLSTATE`, `PDOException`, `QueryException`, `ClassNotFoundException`) to user-friendly defaults.

- **Specific Status Code Mappings**:
  - **401/403**: *"Session expired or permission denied. Please refresh or sign in again."*
  - **422**: *"Validation failed. Please review the highlighted fields."*
  - **429**: *"Rate limit exceeded. Please wait a moment before trying again."*
  - **500 / 503**: *"Server issue encountered. Please try again later."*

## Testing Decisions

- **Seams**:
  - Test via browser/feature tests verifying error rendering on form submit and toast manager invocations.
- **Frontend Test Scenarios**:
  - Verify `<FormField>` renders destructive borders when `error` prop is provided.
  - Verify `useFormSubmit` triggers auto-scroll to the first invalid field.
  - Verify error messages are sanitized in production mode and raw in development mode.

## Out of Scope

- Native browser form validation (`HTMLFormElement.reportValidity`).
- Custom third-party analytics tracking for form error events.

## Further Notes

- All changes integrate with the existing `@base-ui/react/toast` infrastructure.
