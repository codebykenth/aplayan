# 04a — Kanban Board UX Polish & Interaction Fixes

**What to build:** Refine the Kanban board UI to make cards more compact, hiding long details (job description, long notes) which should only live in the detail modal. Fix the interaction conflict where clicking a card to view/edit it inadvertently triggers drag-and-drop behavior.

**Blocked by:** 04 — Visual Kanban Board & Drag-and-Drop Column Transitions

**Status:** ready-for-agent

- [ ] Add a dedicated drag handle (e.g. grip icon) to `JobApplicationCard` OR separate card actions into a dropdown menu (e.g., three dots) so clicks don't conflict with dragging.
- [ ] Make `JobApplicationCard` compact: remove/hide `job_description` and `notes` from the card preview to save vertical space.
- [ ] Display only core identifiers on the card: Company, Title, Date Applied, Expected Salary (small), and a status color indicator.
- [ ] Ensure mobile responsiveness: cards should stack gracefully if the Kanban board is viewed on smaller screens, or default to a standard list view on mobile.
