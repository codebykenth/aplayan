# 00 — User Authentication, Socialite Google Login & Password Recovery

**What to build:** Complete user authentication system featuring standard email/password registration with email verification, Google OAuth social login via Laravel Socialite, forgot password reset flow, and a main app header navigation bar displaying the user's profile and logout trigger.

**Blocked by:** None — can start immediately

**Status:** ready-for-agent

- [ ] Install and configure `laravel/socialite` package for Google OAuth login (`/auth/google/redirect` and `/auth/google/callback`).
- [ ] Implement standard Email/Password Registration with Email Verification notification enabled.
- [ ] Implement Login, Logout, and Forgot Password / Password Reset request and reset views and controller actions.
- [ ] Create React auth pages: `resources/js/pages/auth/login.tsx`, `register.tsx`, `forgot-password.tsx`, `reset-password.tsx`, `verify-email.tsx`.
- [ ] Add Google Sign-In button on Login and Register pages.
- [ ] Create persistent main application Header Navigation component (`resources/js/layouts/app-layout.tsx`) displaying logged-in user name, email, avatar, and Logout button.
- [ ] Write Pest feature tests in `tests/Feature/Auth/AuthenticationTest.php` asserting email/password auth, Google socialite redirect/callback mocking, email verification, and password reset flows.
