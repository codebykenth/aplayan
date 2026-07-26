# 04c — Trello-Style Viewport Kanban Layout & Independent Column Scrolling

**What to build:** Lock the Kanban page layout to fixed viewport height (`h-screen overflow-hidden`), move horizontal scrolling for columns directly to the bottom of the viewport area, and enable independent vertical scrolling within each column so the full page never scrolls vertically.

**Blocked by:** 04b — Responsive Sidebar Layout & Always-Visible Drag Handle

**Status:** ready-for-agent

- [x] **Fixed Viewport Layout**: Lock the overall layout height on the Kanban page (`h-screen flex flex-col overflow-hidden`), keeping the topbar, page title, and action headers fixed in place.
- [x] **Bottom Horizontal Scrollbar**: Position the column container (`flex-1 min-h-0 overflow-x-auto`) so the horizontal scrollbar for switching columns sits pinned at the bottom of the viewport area.
- [x] **Full-Height Columns & Independent Vertical Card Scrolling**:
  - Make each status column fill full vertical height (`h-full flex flex-col`).
  - Keep the column header (title and item count badge) sticky at the top of each column.
  - Enable independent vertical scrolling (`flex-1 min-h-0 overflow-y-auto`) for the cards list inside each column.
- [x] **Mobile Adaptive Viewport Locking**: Ensure mobile single-column view (`< md`) uses the same fixed-height viewport lock, allowing cards within the active status tab to scroll internally without triggering page-level bounce or double scrollbars.
