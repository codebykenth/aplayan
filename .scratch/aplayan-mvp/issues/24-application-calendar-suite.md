# 24 — Application & Interview Calendar Suite

**Status:** ready-for-agent

## Problem Statement
Job seekers miss interview dates or follow-up deadlines because application milestones are scattered across individual application detail cards without a unified chronological schedule.

## Solution
Build a read-only Calendar page (`/calendar`) displaying interview dates, application submission dates, and computed follow-up reminder deadlines in Month and Week calendar layouts directly from existing `JobApplication` data without duplicating storage.

## User Stories
1. As a job seeker, I want a Month and Week calendar view of all upcoming interviews, so that I can manage my schedule visually.
2. As a job seeker, I want to see visual indicators for application submission dates and follow-up deadlines on the calendar.
3. As a job seeker, I want to click any calendar event to open that application's detail modal, so that I can inspect notes or prep materials immediately.
4. As a job seeker, I want status color coding on calendar events (Wishlist, Applied, Interviewing, Offer, Rejected), so that I can distinguish event types at a glance.

## Implementation Decisions
- **Backend Service**: Create `CalendarService` in `app/Services/` that queries user applications within a given date range (`start_date`, `end_date`), transforming `interview_date`, `date_applied`, and calculated follow-up dates into a normalized event list payload.
- **HTTP Controller**: Create `CalendarController` handling `GET /calendar` with optional `month` / `year` query parameters.
- **Frontend UI**: Build `resources/js/pages/calendar/index.tsx` using a responsive grid layout with Month/Week view toggles, color-coded event chips, status badges, and integration with `application-detail-modal.tsx`.
- **Zero Storage**: Calendar events are generated dynamically from `JobApplication` timestamps on the fly without an extra `calendar_events` table.

## Testing Decisions
- Write Pest feature tests in `tests/Feature/CalendarTest.php` asserting that `GET /calendar` returns normalized events within requested date ranges.
- Verify that only applications belonging to the authenticated user are returned.

## Out of Scope
- Google Calendar / iCal bi-directional sync (can be a future integration).
- Custom non-application personal events.
