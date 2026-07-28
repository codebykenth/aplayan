---
title: Resume Section Reordering, Calendar Agenda Flow, Week View Sync, and Layout Responsiveness Refinement
labels: ready-for-agent
---

## Problem Statement

Users encounter four usability and layout issues across the application:
1. In the Resume Builder, users cannot customize the order of sections (e.g., placing Skills above Work Experience, or Projects above Education), limiting their ability to tailor resumes for specific role applications or visual layout preferences.
2. On the Calendar page, clicking a date cell automatically pops up the `ApplicationDetailModal` for the first event on that date while simultaneously displaying the bottom Agenda card. On days with multiple events, this forces an arbitrary detail modal to open, causing friction and confusion.
3. On the Calendar page's Week view, week calculation misparses `date_display` strings (e.g., `parseInt("YYYY-MM-DD")` returning year instead of day-of-month), causing the week header to incorrectly render "Jan 1-7" regardless of the selected month (e.g., July). Top month/year navigation also fails to update the week view consistently.
4. In both the Resume Builder and Calendar views, UI containers suffer from layout overflow and responsiveness issues on mobile and smaller viewports (e.g., text overflow in calendar event badges, preview paper horizontal clipping, and nested flex overflow).

## Solution

1. Provide intuitive section reorder controls (`[↑] [↓]` up/down buttons) directly on the section builder navigation tabs in the Resume Builder, dynamically updating section order in the live preview and persisting order in the saved resume payload.
2. Refine the Calendar date interaction flow so clicking a date cell selects the date and displays the bottom Agenda list card listing all events for that day without auto-opening a detail modal. Users can then explicitly click any event item in the list or calendar cell to open its detail modal.
3. Fix the Calendar Week view calculation to derive days correctly from `currentYear`, `currentMonth`, and `selectedDate` (or day 1 of current month), ensuring week headers stay perfectly synchronized with top month/year navigation controls and selected dates.
4. Audit and fix layout responsiveness and flex overflow across the Resume Builder and Calendar interfaces, ensuring clean scrolling, responsive grid wrappers, responsive status badge truncation, and no unwanted horizontal document scrollbars.

## User Stories

1. As a job seeker, I want to reorder resume sections (e.g., moving Skills above Experience), so that I can tailor my resume highlight to match my target role.
2. As a job seeker, I want section reorder changes to be instantly reflected in the live resume preview, so that I can inspect how the final printed resume looks.
3. As a job seeker, I want my custom section ordering to be saved with my resume profile and saved resumes, so that my customized layout is preserved.
4. As a job seeker viewing my application calendar, I want clicking a date cell to highlight the date and show all events scheduled for that day in the Agenda list below, so that I can easily scan multiple events.
5. As a job seeker viewing my application calendar, I want clicking a date cell NOT to auto-open a modal, so that I am not forced into viewing details for an arbitrary event.
6. As a job seeker, I want to click any event item in the bottom Agenda list or day cell badge to open its specific detail modal, so that I can view complete details for the exact event I selected.
7. As a job seeker viewing the Calendar Week view, I want the displayed week range to accurately reflect the active month/year and selected date, so that July shows July dates instead of defaulting to Jan 1-7.
8. As a mobile or desktop user, I want the Resume Builder and Calendar views to scale responsively without visual overflow, horizontal scrollbars, or broken layout containers.

## Implementation Decisions

- **Resume Builder Section State:** Maintain an ordered array of section identifiers (e.g., `['personal', 'work', 'education', 'skills', 'projects', 'certifications']`) in the component state.
- **Section Tab Controls:** Render Move Up (`ArrowUp`) and Move Down (`ArrowDown`) buttons alongside each section tab in the builder navigation UI.
- **Dynamic Preview Order:** Update template preview renderers to iterate through the section order array to render sections in the specified sequence.
- **Persistence:** Save the custom section ordering array in the profile JSON data.
- **Calendar Date Interaction:** Modify `onClick` handlers on calendar day cells to set `selectedDate` without invoking `openApplicationDetailById()`.
- **Calendar Event Detail Trigger:** Retain explicit `openApplicationDetailById()` click handlers on individual event badges and bottom Agenda list items.
- **Calendar Week View Date Parsing Fix:** Correct `getWeekDays` invocation in `resources/js/pages/calendar/index.tsx` to extract the correct day integer from date strings or fallback to `1`, keeping week calculation locked to `currentYear` and `currentMonth`.
- **Layout Responsiveness & Overflow Fixes:**
  - Enforce `min-w-0`, `min-h-0`, `overflow-x-auto`, and `max-w-full` on document preview containers and flex wrappers in `resources/js/pages/documents/index.tsx`.
  - Add text truncation (`truncate`), flex wrap constraints, and responsive grid column scaling (`grid-cols-7`, `min-h-[50px] sm:min-h-[85px]`) on calendar day cells and event badges in `resources/js/pages/calendar/index.tsx`.

## Testing Decisions

- **Testing Seam:** Page-level UI component seam (`resources/js/pages/documents/index.tsx` and `resources/js/pages/calendar/index.tsx`) verified via Pest browser / end-to-end assertions.
- **Test Focus:** Verify DOM section order changes after reorder actions; verify modal visibility state when selecting date cells vs clicking event items; verify week view dates match selected month/year; verify responsive layout rendering without horizontal scrollbar overflow.
- **Prior Art:** Existing Pest Feature and browser tests in `tests/Feature`.

## Out of Scope

- Drag-and-drop animations across canvas elements outside section tabs.
- Multi-column drag layouts for printed resumes.

## Further Notes

- Guided by ADR 0008: Resume Section Reordering and Calendar Agenda Flow.
