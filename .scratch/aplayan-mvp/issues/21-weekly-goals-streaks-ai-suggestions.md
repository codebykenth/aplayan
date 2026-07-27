# 21 — Weekly Goals & Streak Tracking

**Status:** ready-for-agent

## Problem Statement
Job seekers struggle to stay consistent over long job searches. Without weekly targets or visual momentum tracking, it is difficult to know if they are applying enough or maintaining an effective pace.

## Solution
Build a Goals page (`/goals`) allowing users to set a manual weekly application target (e.g. 10 applications/week). Track weekly progress with a visual progress bar, streak counter (consecutive weeks hitting target), a 4-week historical math benchmark tip, and weekly submission breakdown.

## User Stories
1. As a job seeker, I want to set a weekly application goal, so that I have a clear numerical target every week.
2. As a job seeker, I want to see my current week's application count and progress bar, so that I know if I am on pace.
3. As a job seeker, I want to maintain a streak counter of consecutive successful weeks, so that I stay motivated.
4. As a job seeker, I want to see my 4-week average application rate as a baseline benchmark tip, so that I set realistic targets.

## Implementation Decisions
- **Database Schema**: Add `weekly_goal` (integer, default 10) and `goal_streak` (integer, default 0) columns to `users` table via migration.
- **Backend Service**: Build `GoalService` in `app/Services/` to calculate current week applications, 4-week moving average, streak status, and weekly submission history.
- **HTTP Controller**: Create `GoalController` handling `GET /goals` and `PATCH /goals` for updating `weekly_goal`.
- **Frontend UI**: Build `resources/js/pages/goals/index.tsx` featuring progress card, streak flame badge, 4-week math baseline tip, and goal update form.
- **Navigation Integration**: Add "Goals" (`Target` icon) link to `AppLayout` sidebar.

## Testing Decisions
- Write Pest feature tests verifying `PATCH /goals` validates and updates `weekly_goal`.
- Write unit tests for `GoalService` verifying streak calculation logic and 4-week average math.

## Out of Scope
- External push notifications or SMS alerts for missed goals.
