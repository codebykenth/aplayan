# 04b — Responsive Sidebar Layout & Always-Visible Drag Handle

**What to build:** Make the sidebar navigation collapsible and closable on smaller screens via a hamburger drawer/sheet, ensure 100% layout responsiveness with zero horizontal scrolling across all viewports, update `JobApplicationCard` to feature a permanently visible drag handle button/icon, and implement adaptive mobile column tabs for the Kanban board.

**Blocked by:** 04a — Kanban Board UX Polish & Interaction Fixes

**Status:** ready-for-agent

- [ ] **Always-Visible Drag Handle**: Update `JobApplicationCard` so the drag handle icon (`GripVerticalIcon`) is permanently visible (not hidden or hover-only), clearly separating drag triggers from click/open events on desktop.
- [ ] **Adaptive Mobile Kanban View**:
  - **Desktop (`>= md`)**: Render full 5-column side-by-side Kanban grid with drag-and-drop enabled via grip handles.
  - **Mobile (`< md`)**: Render column navigation tabs (`Wishlist (3)`, `Applied (5)`, `Interviewing (2)`, `Offer (1)`, `Rejected`) displaying applications in a clean single-column vertical list with 1-tap detail modal status updates.
- [ ] **Mobile Sidebar Drawer**: Make the sidebar navigation (`resources/js/layouts/app-layout.tsx`) collapsible and closable on mobile and tablet viewports (`< md`) using a hamburger button + Sheet/Drawer overlay.
- [ ] **Zero Horizontal Scrollbar**: Enforce `w-full overflow-x-hidden min-w-0` on page layouts and main content containers to eliminate horizontal page scrolling on mobile devices.
- [ ] **Responsive Spacing & Touch Targets**: Ensure mobile touch targets (buttons, links, status pickers) are at least 44px for comfortable touch interaction.
