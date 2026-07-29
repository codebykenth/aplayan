# Issue 43: Privacy Policy and Terms of Service Compliance Pages

## Problem Statement

Users visiting Aplayan need legal transparency regarding how their personal information, resume content, and job application tracking data are collected, processed, and stored. Furthermore, as an AI-powered job application platform utilizing third-party services (such as Google Gemini for AI content generation and Cloudflare Turnstile for anti-bot verification), Aplayan requires explicit terms outlining user responsibility for AI-generated resume accuracy, data protection compliance under Philippine Data Privacy principles (RA 10173), and developer limitation of liability.

## Solution

Implement dedicated, publicly accessible **Privacy Policy** (`/privacy-policy`) and **Terms of Service** (`/terms-of-service`) pages rendered as clean, responsive Inertia React components. Update all site footers (Landing page, Auth forms, and App sidebar) to link directly to these compliance documents.

## User Stories

1. As a public visitor or job seeker, I want to access a Privacy Policy page without logging in, so that I can understand how my resume and application data are collected and used.
2. As a registered user, I want clear disclosures about third-party AI processing (Google Gemini API), so that I know how my resume text and job descriptions are processed.
3. As a job applicant, I want to know my data ownership rights, so that I can update or delete my stored resumes, cover letters, and application logs at any time.
4. As a user generating resumes with AI, I want to understand my responsibility to verify AI content accuracy before submitting applications to employers.
5. As a visitor browsing the landing page or login screen, I want direct footer links to the Privacy Policy and Terms of Service, so that I can navigate to legal compliance information from anywhere on the platform.
6. As a solo application developer, I want clear terms of service disclaimers limiting liability regarding employment outcomes, third-party service availability, and AI-generated text.

## Implementation Decisions

- **Routing & Controllers**: Define public GET routes for `/privacy-policy` and `/terms-of-service` pointing to dedicated Controllers (`PrivacyPolicyController` and `TermsOfServiceController`) returning Inertia page renders.
- **Frontend Pages**: Create React components under `resources/js/pages/public/privacy-policy/index.tsx` and `resources/js/pages/public/terms-of-service/index.tsx` matching the application's design system and typography.
- **Privacy Policy Content**:
  - Information collected (account profile, Google OAuth, resumes, cover letters, job applications, contacts, and activity logs).
  - Third-party disclosures (Google Gemini API for AI generation, Cloudflare Turnstile for bot protection). Explicit statement that user data is never sold to third parties.
  - Data storage, encryption, and user rights (data update/deletion).
  - Philippine Data Privacy Act (RA 10173) reference standards.
- **Terms of Service Content**:
  - Acceptable use of the platform.
  - AI Output Disclaimer (users are solely responsible for reviewing and verifying AI-generated resumes/cover letters before submitting them to employers).
  - Limitation of liability for the independent developer (no guarantees of job interviews, hiring outcomes, or zero-downtime third-party APIs).
- **UI Integration**:
  - Update `resources/js/components/landing/footer.tsx` to link to `/privacy-policy` and `/terms-of-service`.
  - Update authentication footers (`resources/js/pages/auth/...`) and main app layout footers.

## Testing Decisions

- **Testing Approach**: Write Pest feature tests asserting that `/privacy-policy` and `/terms-of-service` HTTP GET endpoints return 200 OK responses and render the correct Inertia React components for both guest and authenticated users.
- **Modules Tested**: `tests/Feature/LegalPagesTest.php`.
- **Prior Art**: Follow existing Inertia page routing tests in `tests/Feature/Auth/`.

## Out of Scope

- Paid subscription terms or payment processor legal agreements.
- Multi-language translation of legal documents (English only for initial release).

## Further Notes

Designed to provide legal clarity and user trust for Aplayan as an independent SaaS product.
