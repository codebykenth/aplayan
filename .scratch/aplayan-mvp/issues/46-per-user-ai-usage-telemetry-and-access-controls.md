# Issue 46: Per-User AI Usage Telemetry & Access Controls

## Problem Statement

Currently, AI feature usage (Resume Match, Salary Check, Cover Letter, Interview Prep) is tracked only at a coarse global level via the `ai_responses_cache` table. Administrators lack visibility into per-user token consumption metrics (`prompt_tokens`, `completion_tokens`, `total_tokens`), cost breakdowns, and cache efficiency metrics. Furthermore, if a user exhibits abusive or unusual AI generation activity, system administrators have no immediate mechanism to throttle or temporarily restrict AI access for that specific account.

## Solution

Build a comprehensive **Per-User AI Telemetry & Access Control System**:
1. **Dedicated AI Telemetry Logging:** Create an `ai_usage_logs` table to store granular logs for every AI execution (user ID, feature type, prompt tokens, completion tokens, total tokens, cache hit flag, estimated cost, timestamps).
2. **Per-User AI Restriction Controls:** Add `is_ai_disabled` and `custom_ai_daily_limit` fields to the `users` table, guarded by backend validation middleware/services to gracefully block restricted users.
3. **Advanced Admin AI Usage Dashboard (`/admin/ai-usage`):**
   - **KPI Cards:** Calls Today, 30-Day Token Volume, Estimated API Cost, and Tokens Saved via Caching.
   - **Token Usage Chart:** Visual graph of API calls and token counts over the last 30 days.
   - **Top Features Breakdown:** Capitalized list (`Job Match`, `Salary Check`, `Cover Letter`, `Interview Prep`) showing call and token volume per feature.
   - **Top AI Consumers Leaderboard:** Ranked leaderboard of users showing token usage, total calls, estimated cost, and an instant **Disable/Enable AI Access** toggle switch.

## User Stories

1. As an administrator, I want to view AI token usage and estimated cost per user, so that I can identify high-volume consumers and manage infrastructure costs.
2. As an administrator, I want to see how many tokens and API dollars were saved via response caching, so that I can evaluate cache efficiency.
3. As an administrator, I want to toggle AI access (`Disable/Enable AI`) for any user directly from the AI Usage Leaderboard or User Management table, so that I can immediately mitigate abusive activity.
4. As an administrator, I want to set a custom daily AI request quota for specific users when needed, so that I can apply targeted limits without affecting all platform users.
5. As a user whose AI access has been disabled, I want to receive a clean, friendly notification when attempting AI features, so that I understand why the feature is restricted and how to contact support.

## Implementation Decisions

- **Database Schema Changes:**
  - Create migration for `ai_usage_logs` table:
    - `id` (bigint)
    - `user_id` (foreign key to `users`, nullable, indexed)
    - `feature_type` (string, indexed, e.g. `'job_match'`, `'salary_check'`, `'cover_letter'`, `'interview_prep'`, `'resume_polish'`)
    - `prompt_tokens` (integer, default 0)
    - `completion_tokens` (integer, default 0)
    - `total_tokens` (integer, default 0)
    - `is_cache_hit` (boolean, default `false`)
    - `estimated_cost` (decimal 10,6, default 0.000000)
    - `created_at`, `updated_at`
  - Create migration for `users` table:
    - `is_ai_disabled` (boolean, default `false`)
    - `custom_ai_daily_limit` (integer, nullable)

- **Backend Telemetry & Guarding:**
  - Update `GeminiService` to parse `usageMetadata` (`promptTokenCount`, `candidatesTokenCount`, `totalTokenCount`) from Gemini API responses.
  - Update `AiCacheService` to record an `AiUsageLog` entry on every request, tracking actual Gemini tokens for live calls or computing virtual saved tokens for cache hits.
  - Implement a pre-request check in `AiCacheService` checking `$user->is_ai_disabled`. If `true`, throw a `ValidationException` or return an authorization error message: *"AI features are temporarily restricted for your account. Please contact support."*

- **Admin Controller & UI (`/admin/ai-usage`):**
  - Update `AiUsageController` to aggregate:
    - 30-day token volume (input vs. output tokens)
    - Estimated cost based on Gemini pricing ($0.075 / 1M input tokens, $0.30 / 1M output tokens)
    - Tokens and cost saved via caching (`is_cache_hit = true`)
    - Capitalized top features breakdown
    - Top AI consumers leaderboard (User name, email, avatar, call count, token count, cost, and `is_ai_disabled` status)
  - Add API endpoints in `Admin\UserController` (`POST /admin/users/{user}/toggle-ai`, `POST /admin/users/{user}/ai-limit`) to toggle AI restrictions.

## Testing Decisions

- **Pest Feature Tests:**
  - `tests/Feature/Admin/AiUsageTelemetryTest.php`:
    - Assert calling an AI feature creates an `AiUsageLog` entry attached to the authenticated user.
    - Assert cache hits set `is_cache_hit = true` in `AiUsageLog`.
    - Assert `AiUsageController` returns per-user consumption leaderboards and token totals.
  - `tests/Feature/Admin/UserAiRestrictionTest.php`:
    - Assert admins can toggle `is_ai_disabled` on a user account.
    - Assert a user with `is_ai_disabled = true` is blocked from executing AI features with an appropriate error message.
