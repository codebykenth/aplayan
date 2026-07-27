# 25 — Dashboard Recent Activity Sidebar

**Status:** ready-for-agent

## Problem Statement

Job seekers managing multiple applications need a quick, unified way to see their latest progress and history (status changes, newly added applications, note edits, recruiter contacts, and AI evaluations) directly on the Dashboard. Currently, activity logs are stored per application in `job_application_activities` but are only visible inside individual application detail modals. Users lack a global feed to see what changed recently across all their applications.

## Solution

Build a **Recent Activity Sidebar** on the main Dashboard page. The feed displays the 10 most recent activity items across all job applications owned by the user in a right sidebar card (or stacked bottom card on mobile). Each item highlights the event type, company name, description, and relative timestamp. Clicking an item opens the `ApplicationDetailModal` directly for instant review and updates.

## User Stories

1. As a job seeker, I want to see a Recent Activity log in a right sidebar card on my Dashboard, so that I can immediately review my latest job search activity.
2. As a job seeker, I want the Recent Activity feed to display status updates, newly created applications, note edits, contact events, and AI evaluations, so that I have a comprehensive record of all changes.
3. As a job seeker, I want each activity item to show the company name, event type badge/icon, activity description, and relative time (e.g. "10 minutes ago"), so that I can quickly contextualize what happened.
4. As a job seeker, I want to click any activity item in the feed to open the Application Detail Modal directly on the Dashboard, so that I can inspect or edit the application without navigating away.
5. As a job seeker on a mobile device, I want the Recent Activity sidebar to stack cleanly below the metric cards and charts, so that the layout remains clear and responsive.
6. As a user with no application history, I want to see an empty state in the Recent Activity card with a call-to-action to create my first application, so that the interface feels welcoming.

## Implementation Decisions

- **Backend Query (`ActivityService` / `DashboardController`)**:
  - Implement `ActivityService::recentForUser(User $user, int $limit = 10)` returning a collection of `JobApplicationActivity`.
  - Scope query to `$user->jobApplications()` using `whereHas('jobApplication', fn($q) => $q->where('user_id', $user->id))`.
  - Eager load `jobApplication` relationship (`with('jobApplication')`) to eliminate N+1 queries.
  - Pass `recent_activities` prop in `DashboardController::__invoke()`.

- **Frontend Component (`resources/js/components/recent-activity-feed.tsx`)**:
  - Create a reusable `RecentActivityFeed` component styled with shadcn/ui Card.
  - Map activity types (`status_update`, `created`, `note`, `contacted`, `ai_evaluated`) to distinct icons and badge colors.
  - Handle click callback `onSelectApplication(applicationId)` to trigger `ApplicationDetailModal`.

- **Dashboard Layout (`resources/js/pages/dashboard.tsx`)**:
  - Update Dashboard container to a responsive multi-column grid (`grid-cols-1 lg:grid-cols-3` or `lg:grid-cols-4`).
  - Position `RecentActivityFeed` in the right column alongside charts on desktop.

## Testing Decisions

- **Good Test Criteria**: Test that the backend endpoint passes `recent_activities` props correctly scoped to the authenticated user, verifies eager loading, and ensures activities from other users are not exposed.
- **Tested Seams**:
  - Feature test in `tests/Feature/DashboardTest.php` asserting Inertia `recent_activities` prop structure and authorization isolation.
  - Unit test in `tests/Unit/ActivityServiceTest.php` checking activity query ordering and limit.
- **Prior Art**: Standard Pest feature tests matching `DashboardTest.php` using `assertInertia()`.

## Out of Scope

- Infinite scrolling or full pagination of all historical activity on the Dashboard (handled per application in `application-detail-modal.tsx`).
- Filtering or searching activities within the dashboard feed sidebar.

## Further Notes

- Ensures 0 N+1 queries and 0 external AI API calls.
- Preserves responsive design across desktop, tablet, and mobile viewports.
