# 04 — Visual Kanban Board & Drag-and-Drop Column Transitions

**What to build:** A visual 5-column Kanban layout (Wishlist, Applied, Interviewing, Offer, Rejected) allowing users to drag application cards between status columns on desktop.

**Blocked by:** 03 — Application List & Creation Form UI

**Status:** ready-for-agent

- [ ] Implement 5-column Kanban layout (Wishlist, Applied, Interviewing, Offer, Rejected) in `resources/js/pages/job-applications/index.tsx`.
- [ ] Add drag-and-drop column transition handling with optimistic UI update.
- [ ] Implement `patch('/job-applications/{jobApplication}/status')` route and controller action to persist status updates.
- [ ] Write Pest feature tests asserting status update HTTP endpoint changes application status in DB.
