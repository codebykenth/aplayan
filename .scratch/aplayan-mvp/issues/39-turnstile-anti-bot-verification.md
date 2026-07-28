# 39 �?? Turnstile Anti-Bot Verification for Guest-Facing Forms

**What to build:** Integrate Cloudflare Turnstile (a CAPTCHA replacement widget) on Login, Registration, and Forgot Password forms to protect guest-facing authentication endpoints from bot abuse. The widget runs invisibly on legitimate traffic and only presents a challenge when Cloudflare flags suspicious activity. Server-side token verification is handled by a dedicated service using `.env` credentials.

**Blocked by:** None ? can start immediately

**Status:** ready-for-agent

- [ ] Add `CLOUDFLARE_TURNSTILE_SITE_KEY` and `CLOUDFLARE_TURNSTILE_SECRET_KEY` to `.env.example` with documentation comments.
- [ ] Add `turnstile` key to `config/services.php` referencing the env variables for site key and secret.
- [ ] Create `app/Services/TurnstileVerifyService.php` that calls `https://challenges.cloudflare.com/turnstile/v0/siteverify` with the secret key and client token, returning a boolean pass/fail.
- [ ] Integrate Turnstile verification into `AuthController::authenticate()` before processing login credentials.
- [ ] Integrate Turnstile verification into `AuthController::store()` before processing registration.
- [ ] Integrate Turnstile verification into `ForgotPasswordController::sendResetLink()` before processing the reset request.
- [ ] On verification failure, return a generic validation error (e.g., `security_check_failed`) mapped to "Please complete the security check, then try again." — no internal bot-detection details exposed.
- [ ] Add `<Turnstile />` widget component (invisible mode) to `resources/js/pages/auth/login.tsx`, `resources/js/pages/auth/register.tsx`, and `resources/js/pages/auth/forgot-password.tsx`.
- [ ] Write Pest feature tests in `tests/Feature/Auth/AuthenticationTest.php` asserting Turnstile verification blocks auth on failed challenge, allows auth on successful challenge, and returns generic error on failure.
- [ ] Write unit tests for `TurnstileVerifyService` mocking the Cloudflare API call.
- [ ] Create ADR at `docs/adr/0013-turnstile-anti-bot-verification.md` documenting the decision.