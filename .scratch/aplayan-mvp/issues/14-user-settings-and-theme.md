# 14 — User Settings & Profile Management Page with Theme Controls

**What to build:** Dedicated Settings page (`resources/js/pages/settings/index.tsx`) allowing users to manage profile information (name, avatar, default expected salary, job search preferences) and switch app theme settings (Light, Dark, System).

**Blocked by:** 00 — User Authentication & Social Login

**Status:** ready-for-agent

- [ ] Create `SettingsController` (`GET /settings`, `PATCH /settings/profile`, `PATCH /settings/password`) and associated Form Requests (`UpdateProfileRequest`, `UpdatePasswordRequest`).
- [ ] Implement settings page at `resources/js/pages/settings/index.tsx` with tabs/sections for Profile Management, Password & Security, and Appearance / Theme Selection (Light / Dark / System).
- [ ] Connect theme switcher to persist preference in local storage and apply dark/light classes on html document.
- [ ] Write Pest feature tests in `tests/Feature/SettingsTest.php` verifying profile & password update flows.
