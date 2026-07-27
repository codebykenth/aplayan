# 6. Zero-Cost Serverless AI Caching and Entity Normalization Architecture

Date: 2026-07-27

## Status
Accepted

## Context
Aplayan provides AI-powered job search assistance (AI Resume/Job Match Analysis, AI Cover Letter Generation, AI Resume Bullet Polishing, and Philippine Salary Reality Checks) powered by the Google Gemini API (`gemini-2.5-flash`). 

When scaling the application to thousands of concurrent users on Vercel's serverless PHP runtime, naive on-demand API requests pose two major challenges:
1. **API Token Costs & Rate Limits**: Repeated AI analysis of popular job listings (e.g., openings at Canva, Accenture, Globe, GCash) would exhaust the free Gemini API quota (15 RPM) and incur unnecessary token costs.
2. **Serverless Execution Constraints**: Long-running background queue workers (`php artisan queue:work`) require dedicated server infrastructure not available in serverless environments without extra hosting costs.

We need an architecture that makes AI features 100% free to maintain at scale, serverless-native, resilient to external API outages, and smart enough to recognize identical job listings even when entered with slight typos or formatting variations.

## Decision
We adopt a **Zero-Cost Serverless AI Caching and Entity Normalization Architecture**:

1. **Entity Normalization & Composite Hashing**:
   - Before querying external AI or checking the cache, the server normalizes company names (stripping legal suffixes like `Inc.`, `Corp`, `LLC`, `Ltd`, `Philippines`) and job titles (standardizing abbreviations like `Sr.` -> `Senior`, `Dev` -> `Developer`).
   - A canonical key is created using a deterministic SHA-256 hash:
     `$canonicalKey = "job_match:" . $normalizedCompany . "|" . $normalizedTitle . "|" . hash('sha256', $cleanDescriptionSnippet);`
   - Job listings from different users with minor title/company variations (e.g., "Canva Inc." vs "Canva") evaluate to the exact same canonical key.

2. **Global AI Cache Table & Multi-Tier Lookup**:
   - Cache results are stored in a dedicated `ai_responses_cache` database table (`canonical_key`, `feature_type`, `response_json`, `hit_count`, `expires_at`).
   - The lookup uses a **Cache-First Pattern** (`Cache::remember()`). 
   - **Cache Hits consume 0 tokens**, bypass Gemini API completely, respond in sub-10ms, and do NOT count against daily user quotas. Popular job posts analyzed by one user instantly become free for all subsequent users.

3. **Serverless-Native Synchronous Execution & Daily Rate Limiting**:
   - Uncached requests check the user's daily allowance (e.g. 10 new uncached Gemini calls per 24 hours) enforced via Laravel's `RateLimiter`.
   - All uncached calls execute synchronously within the HTTP request lifecycle, making the architecture 100% compatible with serverless runtimes (Vercel/Vapor) without background queue workers.

4. **Rule-Based Deterministic Fallback (`AiFallbackService`)**:
   - If Google Gemini returns an HTTP 429 (Rate Limit), HTTP 503 (Outage), or network timeout, the system seamlessly falls back to local PHP rule-based algorithms (keyword intersection matching for Job Match; local regex grammar formatting for Resume Polish).
   - Ensures the application is 100% resilient and never breaks for end-users.

## Consequences
- **Pros**:
  - $0 operational AI costs across all users through shared entity caching.
  - Sub-10ms response times for all cached job match and content evaluations.
  - 100% serverless compatible without background queue infrastructure.
  - Zero application downtime or broken features during Google Gemini outages.
- **Cons**:
  - Requires database storage for cached JSON responses in `ai_responses_cache`.
