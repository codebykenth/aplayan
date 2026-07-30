# Spec 18: Public Page SEO and Structured Data Improvements

## Problem Statement

Search engines and social media platforms currently receive minimal metadata when indexing or sharing links from Aplayan. The application lacks OpenGraph image previews, structured data (JSON-LD), canonical URL management, a dynamic XML sitemap (`/sitemap.xml`), and clear crawler directives in `robots.txt`. As a result, link previews on platforms like LinkedIn or X look basic, organic search visibility is unoptimized, and web crawlers lack clear boundaries regarding public versus authenticated routes.

## Solution

Implement a comprehensive public-page SEO and metadata system:
1. A reusable frontend `SeoHead` component that wraps Inertia's `<Head>` to render complete Meta titles, descriptions, canonical URLs, OpenGraph tags, Twitter Card tags, and JSON-LD structured data.
2. Embedded `SoftwareApplication` and `WebSite` JSON-LD schemas on the public homepage.
3. A dynamic XML sitemap endpoint (`/sitemap.xml`) served by a Laravel controller.
4. An updated `robots.txt` file specifying explicitly allowed public routes, disallowed private/authenticated application routes, and the sitemap location.

## User Stories

1. As a public job seeker, I want search engines to accurately index Aplayan's landing page, so that I can discover the platform through organic search queries.
2. As a user sharing an Aplayan link on LinkedIn or X, I want rich link preview cards with an eye-catching thumbnail image and descriptive summary, so that recipients receive a professional visual preview.
3. As a platform administrator, I want authenticated application routes (like dashboards and personal job tracking boards) excluded from search engine indexing, so that user privacy is strictly preserved.
4. As a search engine web crawler, I want access to a clean `/sitemap.xml` file, so that I can efficiently crawl and index all public marketing and legal compliance pages.
5. As a search engine displaying rich results, I want structured JSON-LD metadata about Aplayan's web application software features, so that rich snippets (ratings, app category, pricing) display directly in search results.

## Implementation Decisions

- **Frontend `SeoHead` Component:**
  - Create a modular React component in `resources/js/components/ui/seo-head.tsx`.
  - Accept props for `title`, `description`, `canonicalPath`, `ogImage`, `ogType`, `noindex`, and custom `jsonLd`.
  - Provide fallback defaults for brand name ("Aplayan - AI-Powered Job Search & Resume Tracker"), default description, canonical root URL, and default social share image (`/aplayan-logo-compressed.png`).
  - **Comprehensive Multi-Platform Social Media Meta Tags:**
    - **Facebook / Meta / WhatsApp / Messenger:** `og:site_name`, `og:title`, `og:description`, `og:url`, `og:image`, `og:image:secure_url`, `og:image:width` (1200), `og:image:height` (630), `og:image:type` (`image/png`), `og:locale` (`en_US`).
    - **Twitter / X:** `twitter:card` (`summary_large_image`), `twitter:title`, `twitter:description`, `twitter:image`, `twitter:site`.
    - **LinkedIn / Slack / Discord / iMessage:** Standardized OpenGraph properties with `<meta name="theme-color" content="#042f2e" />` for brand-colored embed cards.
  - Integrate `SeoHead` into public pages (`welcome.tsx`, `privacy-policy/index.tsx`, `terms-of-service/index.tsx`, `login.tsx`, `register.tsx`).

- **JSON-LD Schema Integration:**
  - On the homepage (`welcome.tsx`), inject a `<script type="application/ld+json">` containing `SoftwareApplication` schema (Category: `BusinessApplication` / `JobSearchApplication`, Price: 0 USD, OS: Web) and `WebSite` schema.

- **Dynamic Sitemap Endpoint:**
  - Create a `SitemapController` at `app/Http/Controllers/SitemapController.php`.
  - Register a `GET /sitemap.xml` route in `routes/web.php`.
  - Return an XML response (`Content-Type: text/xml`) listing all canonical public endpoints (`/`, `/privacy-policy`, `/terms-of-service`, `/login`, `/register`) with ISO `lastmod` timestamps and `changefreq` tags.

- **Crawler Directives (`robots.txt`):**
  - Update `public/robots.txt` to explicitly allow public routes and disallow private routes (`/dashboard`, `/job-applications/*`, `/documents/*`, `/settings/*`, `/analytics/*`, `/goals/*`, `/calendar/*`).
  - Include `Sitemap: <APP_URL>/sitemap.xml`.

## Testing Decisions

- **Testing Philosophy:**
  - Test external HTTP behavior and contract compliance rather than internal implementation details.
- **Modules & Endpoint Testing:**
  - Feature tests covering HTTP responses for `/sitemap.xml` and `/robots.txt`.
  - Feature tests verifying that public pages render with proper HTTP 200 responses and valid Inertia component data.
- **Prior Art:**
  - Follow existing Pest feature testing conventions established in `tests/Feature/WelcomePageTest.php` and `tests/Feature/LegalPagesTest.php`.

## Out of Scope

- User-generated public profiles or public shareable resume URLs (currently all resumes and application data are strictly private).
- Multi-language localization (i18n) metadata tags (e.g., `hreflang`).

## Further Notes

- All absolute URLs for social sharing and canonical links will dynamically respect the configured application host URL (`config('app.url')`).
