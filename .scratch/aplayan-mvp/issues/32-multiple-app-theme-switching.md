# Issue 32: Multiple App Theme Switching and Color Accents

## Problem Statement

Currently, users in Aplayan can only toggle between basic Light and Dark appearance modes. There is no support for customizing visual accent colors (such as corporate blue, emerald green, or vibrant coral), limiting personalization and visual alignment with different user preferences.

## Solution

Expand the application-wide theme engine to support 5 curated color accent palettes (`Zinc`, `Emerald`, `Ocean`, `Indigo`, `Sunset`) alongside the standard Light, Dark, and System modes. Theme choices will be stored in both `localStorage` for instant zero-flash rendering and persisted to the user's database profile (`users.color_theme`) to sync across devices.

## User Stories

1. As a user, I want to choose from multiple accent color themes (Zinc, Emerald, Ocean, Indigo, Sunset), so that I can personalize my application tracking workspace.
2. As a user, I want to toggle between Light, Dark, and System display modes, so that the application conforms to my operating system lighting preferences.
3. As a user, I want my theme and color accent preferences saved to my account, so that my preferred look persists across devices and browser sessions.
4. As a user, I want to select color themes using an interactive visual color swatch grid on the `/settings` page, so that I can easily preview each theme option.

## Implementation Decisions

### Schema & Models
- Add a nullable `color_theme` string column (default: `'zinc'`) to the `users` table migration.
- Update `User` Eloquent model `$fillable` array to include `color_theme`.

### Backend Layer
- Update `ProfileController` / `SettingsController` to validate and update `color_theme`.
- Pass `color_theme` in `Inertia` shared user props.

### Frontend UI & Theme System
- **Theme Manager (`use-theme.ts`)**:
  - Extend the hook to handle both `mode` (`light` | `dark` | `system`) and `colorTheme` (`zinc` | `emerald` | `ocean` | `indigo` | `sunset`).
  - Read from and write to `localStorage` (`aplayan-color-theme`).
  - Set `data-color-theme` attribute on `document.documentElement` (`<html>` root tag).
- **Design Tokens (`index.css`)**:
  - Define CSS custom properties for each `data-color-theme` value (`:root[data-color-theme="emerald"]`, etc.), updating primary colors, focus rings, and selection tokens while preserving contrast ratios.
- **Settings Appearance Section (`settings/index.tsx`)**:
  - Redesign the **Appearance** section to feature visual color swatch buttons for theme selection.

## Testing Decisions

- **Test Quality**: Tests should focus on API endpoint validation and database persistence.
- **Backend Tests**: Add Pest tests to `tests/Feature/SettingsTest.php` covering:
  - Updating `color_theme` via the profile settings endpoint correctly updates the database.
  - Invalid color theme values are rejected by validation.

## Out of Scope

- User-defined arbitrary hex code color pickers (sticking to curated CSS variable design tokens to guarantee dark mode contrast and component accessibility).

## Further Notes

- Available color accent palettes:
  - `Zinc`: Default sleek neutral slate/charcoal.
  - `Emerald`: Philippine Peso / Financial success green.
  - `Ocean`: Professional deep navy blue.
  - `Indigo`: Modern tech SaaS purple.
  - `Sunset`: Warm vibrant coral/orange.
