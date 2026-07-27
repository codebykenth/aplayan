# 27 — UI Design System Standardization & Visual Consistency Audit

**Status:** ready-for-agent

## Problem Statement

Across the Aplayan application, individual pages (`Dashboard`, `Job Applications`, `Analytics`, `Goals`, `Templates`, `Documents`, `Contacts`, `Calendar`, `Offer Comparison`) have evolved independently. This has introduced subtle UI inconsistencies, including mismatched page header hierarchies, non-standard font sizes and font weight variations, ad-hoc hardcoded colors instead of design system CSS variables, varying button padding and height sizes, inconsistent card padding/border radius, and conflicting modal layout structures.

## Solution

Establish a unified UI Design System across the entire React/Inertia frontend. Standardize typography scales (`Instrument Sans`), page header layouts, card padding/elevation, button variant hierarchy (`shadcn/ui`), badge colors, form inputs, status pill styles, and dark mode contrast variables. Audit and refactor all existing pages (`resources/js/pages/*`) and components (`resources/js/components/*`) to enforce 100% visual consistency.

## User Stories

1. As a user, I want every page in Aplayan to share the exact same top header hierarchy (h1 font size, font weight, description subtitle, and top-right action button placement), so that navigating between pages feels cohesive and predictable.
2. As a user, I want consistent typography across all body copy, headings, and labels using standard Tailwind font-size tokens (`text-xs`, `text-sm`, `text-base`, `text-lg`, `text-xl`, `text-2xl`) and defined line heights, so that text does not look disjointed or mismatched.
3. As a user, I want all buttons across the application (primary, secondary, outline, ghost, destructive, AI action buttons) to use uniform height, padding, icon spacing, and hover states, so that interactive elements feel responsive and uniform.
4. As a user, I want all Card components (`Dashboard`, `Analytics`, `Templates`, `Documents`, `Goals`, `Contacts`) to share matching border colors, border radius (`rounded-xl`), background tokens (`bg-card`), and internal padding (`p-4` / `p-6`), so that card-based layouts look polished.
5. As a user, I want status badges (e.g. Wishlist, Applied, Interviewing, Offer, Rejected) to use a single centralized color & badge component (`<StatusBadge status="..." />`), ensuring identical status color coding everywhere (Kanban, tables, action feeds, calendar, activity feeds).
6. As a user, I want all modals and slide-over dialogs (`Dialog`, `DialogHeader`, `DialogTitle`, `DialogContent`, `DialogFooter`) to share uniform max-widths, padding, button footers, and backdrop blur effects, so that popups feel seamless.
7. As a dark mode user, I want every UI component to respect semantic CSS variables (`bg-background`, `text-foreground`, `text-muted-foreground`, `border-border`) without hardcoded hex codes (e.g., `#1b1b18`, `#706f6c`), ensuring flawless contrast in both light and dark themes.

## Implementation Decisions

### Unified Layout Architecture (`resources/js/layouts/app-layout.tsx`)
- **Single Master Layout**: All authenticated pages (`Dashboard`, `Job Applications`, `Analytics`, `Goals`, `Templates`, `Documents`, `Contacts`, `Calendar`, `Settings`, `Offers`) MUST render within the single unified `AppLayout`.
- **Sidebar Consistency**: Single persistent left sidebar with active link highlighting (`bg-accent text-accent-foreground`), smooth desktop collapse toggle (`w-64` vs `w-16`), mobile drawer overlay, and profile avatar footer.
- **Main Content Container**: Standardized main view wrapper (`flex flex-1 min-h-0 flex-col overflow-hidden p-4 sm:p-6 lg:p-8`) across all top-level page views.

### Strict DRY Component Extraction & Reusability Rule
- **Mandatory Component Reuse**: Whenever duplicate UI elements, repetitive card layouts, header structures, action toolbars, or form patterns are identified across 2 or more views, they MUST immediately be extracted into reusable modular components.
- **Shared Directory Structure**:
  - Generic UI primitives -> `resources/js/components/ui/` (e.g. `PageHeader`, `StatusBadge`, `StatCard`, `EmptyState`, `ConfirmDialog`)
  - Domain-specific reusable components -> `resources/js/components/domain/` (e.g. `SalaryFormatter`, `JobApplicationCard`, `ActivityItem`)
- **No Inlined Duplication**: Avoid duplicating JSX layout blocks across different pages. Prioritize small, focused functional components for maximum maintainability.

### Design System Tokens & Typography Scale
- **Font Family**: Standardize on `font-sans` (`'Instrument Sans'`, sans-serif) across all Blade, CSS, and React components.
- **Heading Scale**:
  - Page Title: `h1` (`text-2xl font-semibold tracking-tight text-foreground`)
  - Section Title: `h2` (`text-lg font-semibold text-foreground`)
  - Card/Modal Title: `h3` (`text-base font-medium text-foreground`)
  - Subtitles & Descriptions: `p` (`text-sm text-muted-foreground`)
- **Semantic Colors**: Eliminate hardcoded `#hex` values in TSX files. Use semantic utility classes:
  - Backgrounds: `bg-background`, `bg-card`, `bg-muted`
  - Text: `text-foreground`, `text-muted-foreground`, `text-primary`, `text-destructive`
  - Borders: `border-border`, `border-input`

### Shared Component Refactoring
1. **Page Header Component (`resources/js/components/ui/page-header.tsx`)**:
   - Standardize page headers across all views: `title`, `description`, `action` slot.
2. **Status Badge Component (`resources/js/components/ui/status-badge.tsx`)**:
   - Centralize status pill styling for `wishlist`, `applied`, `interviewing`, `offer`, `rejected`.
3. **Button Standardization (`resources/js/components/ui/button.tsx`)**:
   - Enforce uniform sizes (`sm`: `h-8 px-3 text-xs`, `default`: `h-9 px-4 py-2 text-sm`, `lg`: `h-10 px-8 text-base`, `icon`: `h-9 w-9`).
   - Standardize icon sizes inside buttons (`size-4` / `h-4 w-4` with `mr-2` or `gap-2`).
4. **Card Component (`resources/js/components/ui/card.tsx`)**:
   - Ensure uniform `border border-border bg-card text-card-foreground shadow-xs rounded-xl`.
5. **Form Controls (`Input`, `Select`, `Textarea`, `Label`)**:
   - Standardize focus ring (`focus-visible:ring-1 focus-visible:ring-ring`), label typography (`text-sm font-medium`), and input heights.

### Pages Audited & Refactored
- `resources/js/pages/dashboard.tsx`
- `resources/js/pages/job-applications/index.tsx`
- `resources/js/pages/analytics/index.tsx`
- `resources/js/pages/goals/index.tsx`
- `resources/js/pages/templates/index.tsx`
- `resources/js/pages/documents/index.tsx`
- `resources/js/pages/contacts/index.tsx`
- `resources/js/pages/calendar/index.tsx`
- `resources/js/pages/job-applications/offers.tsx`

## Testing Decisions

### Good Test Criteria
- Tests verify component rendering, standard class presence, and dark mode token compatibility without breaking layout props.

### Tested Modules & Seams
- Pest browser/smoke tests verifying page load and UI rendering across all main navigation routes (`/dashboard`, `/job-applications`, `/analytics`, `/goals`, `/templates`, `/documents`, `/contacts`, `/calendar`, `/job-applications/offers`).
- Visual check of button heights, card borders, typography hierarchy, and dark mode class application.

## Out of Scope

- Introducing 3rd-party component libraries outside existing `shadcn/ui` Tailwind setup.
- Custom animation libraries (rely on Tailwind CSS transitions and existing keyframes).

## Further Notes

- Complements issue #18 (Text Capitalization & UI Polish) by elevating visual consistency across layout, typography, cards, and interactive components.
