# ADR-0013: Turnstile Anti-Bot Verification for Guest-Facing Forms

## Context

The application's login, registration, and forgot password forms are exposed to the internet and vulnerable to bot abuse. Traditional CAPTCHA solutions degrade user experience and add friction. Cloudflare Turnstile provides a CAPTCHA replacement that runs invisibly on legitimate traffic and only presents challenges when Cloudflare flags suspicious activity.

## Decision

Integrate Cloudflare Turnstile (invisible mode) on all guest-facing authentication forms: Login, Registration, and Forgot Password. The widget is loaded via Cloudflare's JavaScript API and the verification token is submitted as a hidden `turnstile` form field. Server-side verification is handled by `TurnstileVerifyService` which calls the Cloudflare siteverify API endpoint.

### Implementation Details

- **Environment variables**: `CLOUDFLARE_TURNSTILE_SITE_KEY` (public, frontend) and `CLOUDFLARE_TURNSTILE_SECRET_KEY` (private, server-only) are stored in `.env` and referenced through `config/services.php`.
- **Service**: `TurnstileVerifyService` at `app/Services/TurnstileVerifyService.php` calls `https://challenges.cloudflare.com/turnstile/v0/siteverify` with the secret key and client token, returning a boolean. Errors (network failures, invalid responses) return `false` — a safe default that blocks action on failure.
- **Controller integration**: Each guest-facing auth endpoint validates the `turnstile` field and verifies it via `TurnstileVerifyService::verify()` before processing the request.
- **Error handling**: On verification failure, a generic validation error `security_check_failed` is returned with the message "Please complete the security check, then try again." No internal bot-detection details are exposed to the client.
- **Frontend widget**: A `<Turnssible />` React component (invisible mode) dynamically loads Cloudflare's Turnstile script, executes a challenge on form submit, and includes the resulting token as a hidden `turnstile` input field.

## Alternatives Considered

- **reCAPTCHA v3**: Similar functionality but requires Google account and has heavier Google ecosystem dependency. Turnstile is Cloudflare's offering and preferred for its modern API and privacy-first approach.
- **No anti-bot protection**: Leaving forms unprotected would allow automated abuse (credential stuffing, spam registration). Rejected due to security risk.
- **Honeypot fields**: A lightweight client-side approach but unreliable against modern bots. Rejected as insufficient protection.
- **Rate limiting alone**: The application already has rate limiting on auth endpoints (`throttle:5,1` for login, `throttle:3,1` for registration). Turnstile provides defense-in-depth alongside rate limiting, not a replacement for it.

## Consequences

- Guest-facing auth flows now require a Turnstile token, blocking automated form submissions.
- Legitimate users experience no visible challenge (invisible mode).
- Server-side verification adds one HTTP call per auth form submission.
- If Cloudflare's verification API is unavailable, all attempts fail closed (denied), providing a safe default.
- The `CLOUDFLARE_TURNSTILE_SITE_KEY` and `CLOUDFLARE_TURNSTILE_SECRET_KEY` must be configured in production for Turnstile to function. Without them, the service defaults to blocking all requests.