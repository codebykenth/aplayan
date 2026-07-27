# 29 — Add Target Role Header to Resume Templates

**Status:** ready-for-agent

## Problem Statement

Job seekers reuse the same resume profile data across multiple job applications, but currently there is no way to indicate which specific position the resume targets. Recruiters and ATS systems benefit from immediately seeing the target role at the top of the resume, and users need a way to tailor the same profile data per application without duplicating it.

## Solution

Add an optional `target_role` field to the Resume Profile, displayed as a prominent headline under the name in all 6 resume templates. When empty, templates render normally without the role line. Each template gets a visual treatment matching its existing style (ATS-friendly plain text for ATS templates, styled for modern/philippine templates).

## User Stories

1. As a job seeker, I want to enter a target role (e.g. "Senior Software Developer") in my resume profile, so that my resume immediately communicates which position I'm applying for.
2. As a job seeker, I want the target role to appear as a headline under my name in the resume preview, so that recruiters see my intended role at a glance.
3. As a job seeker, I want the target role to be optional, so that I can leave it blank for general-purpose resumes.
4. As a job seeker, I want the target role styling to match each template's visual design, so that my resume looks cohesive regardless of which template I choose.

## Implementation Decisions

- **Database**: Add nullable `string('target_role')` column to `resume_profiles` table via new migration.
- **Backend**: Add `target_role` to `ResumeProfile` fillable, `UpdateResumeProfileRequest` validation (`nullable|string|max:255`), and `ResumeProfileService::buildProfileText()`.
- **Frontend Type**: Add `target_role: string | null` to `ResumeProfile` TypeScript type.
- **Form Input**: Add optional input field in `PersonalInfoTab` after Full Name with placeholder "e.g. Senior Software Developer".
- **Template Rendering**: Insert conditional `{data.target_role && ...}` after the name div in all 6 templates (`ats_classic`, `ats_executive`, `ats_bullet`, `clean`, `modern`, `philippine`).
- **CSS Styling**: Add `target-role` class styles in both `getScopedResumeStyles()` and `getPrintStyles()` per template:
  - ATS templates: plain text, `font-size: 13px`, `font-weight: 500`, no uppercase (ATS-parseable)
  - `clean`: italic, `color: #706f6c`
  - `modern`: white text, `opacity: 0.9` (on dark header background)
  - `philippine`: uppercase, `letter-spacing: 0.05em`
- **Factory**: Add `'target_role' => fake()->optional(0.6)->jobTitle()` to `ResumeProfileFactory`.

## Testing Decisions

- Feature tests: verify `target_role` is stored on profile update, validated correctly (max 255 chars), and included in saved resume profile data.
- Factory: update `ResumeProfileFactory` to optionally generate `target_role`.

## Out of Scope

- Auto-populating `target_role` from job application data (user must enter manually).
- Making `target_role` required or linking it to specific job applications.
- Cover letter templates (they already have `target_job_title` on `SavedCoverLetter`).
