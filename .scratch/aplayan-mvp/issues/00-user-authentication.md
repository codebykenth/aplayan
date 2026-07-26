# 00 — User Authentication, Socialite Google Login & Navigation Layouts

**What to build:** Complete user authentication system featuring standard email/password registration with email verification, Google OAuth social login via Laravel Socialite, forgot password reset flow, guest top-navigation landing page (`welcome.tsx`), and a collapsible sidebar navigation layout for authenticated users.

**Blocked by:** None — can start immediately

**Status:** ready-for-agent

- [ ] Install and configure `laravel/socialite` package for Google OAuth login (`/auth/google/redirect` and `/auth/google/callback`).
- [ ] Implement standard Email/Password Registration with Email Verification notification enabled.
- [ ] Implement Login, Logout, and Forgot Password / Password Reset request and reset views and controller actions.
- [ ] Create Guest Layout (`resources/js/layouts/guest-layout.tsx`) featuring a clean top navigation bar with Logo, Features, Sign In, and Register CTA.
- [ ] Create Guest Landing Page (`resources/js/pages/welcome.tsx`) using Guest Layout with modern hero section highlighting AI Resume Match & Salary Reality Check.
- [ ] Create Authenticated Layout (`resources/js/layouts/app-layout.tsx`) featuring a collapsible left Sidebar Navigation (Dashboard, Applications, Settings) and user profile footer with Logout trigger.
- [ ] Create React auth pages: `resources/js/pages/auth/login.tsx`, `register.tsx`, `forgot-password.tsx`, `reset-password.tsx`, `verify-email.tsx`.
- [ ] Add Google Sign-In button on Login and Register pages.
- [ ] Write Pest feature tests in `tests/Feature/Auth/AuthenticationTest.php` asserting email/password auth, Google socialite redirect/callback mocking, email verification, and password reset flows.
