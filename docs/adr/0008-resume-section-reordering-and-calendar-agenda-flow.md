# ADR 0008: Resume Section Reordering, Calendar Agenda Flow, Week View Sync, and Layout Responsiveness

## Status
Accepted

## Context
1. **Resume Builder Section Customization:** Users need the ability to reorder resume sections (e.g. Work Experience, Education, Skills, Projects, Certifications) to tailor their resume layout according to career background and template needs.
2. **Calendar UX Friction:** In the calendar view, clicking a date cell previously triggered two concurrent actions: opening the `ApplicationDetailModal` for the first event on that date and populating the bottom "Selected Date Agenda" card. This resulted in poor UX on multi-event days and redundant UI feedback.
3. **Calendar Week View Date Sync Bug:** `parseInt(date_display)` on full `"YYYY-MM-DD"` date strings misparsed years instead of days, causing the week view calculation to default to "Jan 1-7" regardless of the active month/year.
4. **Layout Responsiveness & Overflow:** On mobile and smaller screen widths, elements in both the Resume Builder preview pane and Calendar event grid risk overflowing parent containers or causing unwanted horizontal scrollbars.

## Decisions

### 1. Resume Section Reordering
* **UI Placement:** Section reorder controls (`[↑] [↓]` up/down actions) will be integrated directly on the section builder navigation tabs in `resources/js/pages/documents/index.tsx`.
* **State & Preview:** The order of sections will be tracked in section order state and passed to template preview renderers, updating the live preview dynamically.

### 2. Calendar Event Navigation Flow
* **Date Click Behavior:** Clicking a calendar day cell will select the date and display the bottom **Events Agenda Card** listing all events scheduled for that day.
* **Modal Trigger:** The `ApplicationDetailModal` will no longer open automatically on date cell click. It will only open when a user explicitly clicks a specific event item inside the bottom Agenda card or an event badge within the date cell.

### 3. Calendar Week View Calculation & Synchronization
* Correct day parsing from `"YYYY-MM-DD"` strings (extracting `split('-')[2]`) so `getWeekDays` receives valid day-of-month integers.
* Ensure `weekDays` calculation stays strictly synchronized with `currentYear`, `currentMonth`, and top month/year navigation controls.

### 4. Layout Responsiveness & Overflow Protection
* Enforce strict container bounds (`min-w-0`, `max-w-full`, `overflow-x-auto`) on document preview containers in `resources/js/pages/documents/index.tsx`.
* Add text truncation (`truncate`), flex wrap constraints, and responsive grid sizing to prevent calendar event badges and cards from clipping or breaking mobile viewports in `resources/js/pages/calendar/index.tsx`.

## Consequences
* **Positive:**
  * Clean, non-intrusive reordering UX inside the Resume Builder with live preview sync.
  * Frictionless calendar navigation on multi-event days with consistent behavior across mobile and desktop.
  * Accurate, synchronized week view dates reflecting the active month/year.
  * Robust, responsive layout behavior across all screen viewports without horizontal scroll overflow.
* **Negative:**
  * Requires 1 extra click to open application details on desktop if navigating purely via day cells, but significantly reduces accidental modal popups.
