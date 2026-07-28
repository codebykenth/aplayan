# ADR-0012: Grouped Rate Limiting by HTTP Method

## Context

The application previously only rate-limited AI endpoints (`throttle:ai` — 20/day). All other authenticated write operations (create/update/delete) had zero rate limiting, leaving them vulnerable to abuse. The user decided to add per-user rate limiting grouped by HTTP method category, with AI endpoints reduced to 10/day.

## Decision

Define 4 named rate limiters in `AppServiceProvider::boot()`:

- `read`: 120/min per user — covers all GET list/show routes
- `write`: 30/min per user — covers all POST store routes
- `update`: 30/min per user — covers all PUT/PATCH update routes
- `delete`: 20/min per user — covers all DELETE routes

AI POST routes stack both `throttle:write` and `throttle:ai` middleware, meaning they get the per-minute write limit AND the daily AI cap.

Login gets `throttle:5,1` (5 attempts/min). Registration gets `throttle:3,1` (3 registrations/min).

## Alternatives Considered

- **Per-route throttles**: More granular but harder to maintain across 40+ routes. Rejected for maintainability.
- **Global single limiter**: Simple but doesn't distinguish cheap reads from expensive writes. Rejected for lack of granularity.
- **Only throttling writes**: Partial protection. Rejected because reads can also be abused for scraping.

## Consequences

- All authenticated endpoints are now protected against abuse.
- Normal usage (dashboard loads, list views) is never interrupted (120 reads/min is generous).
- AI costs are capped at 10/day per user (down from 20).
- Login brute-force is blocked at 5 attempts/min.
- The stacked middleware pattern for AI routes is slightly unusual but well-documented in Laravel.
