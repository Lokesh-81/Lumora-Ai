# Lumora AI Security Baseline

This document describes the application-layer controls in the repository and the production controls that must be enabled at the hosting edge.

## Implemented in the application

- Removes wildcard CORS response headers. Lumora is a same-origin application; do not re-enable `Access-Control-Allow-Origin: *`.
- Adds browser security headers: HSTS, frame denial, MIME sniffing protection, strict referrer policy, a restrictive permissions policy, and same-origin opener isolation.
- Applies `no-store` and `noindex` headers to API responses.
- Enforces route-specific sliding-window rate limits through a shared Upstash Redis REST backend when configured; retains a bounded per-instance fallback for local/development use. A partially configured or failing Redis backend fails closed with HTTP 503.
- Validates candidate client IP addresses and prioritizes hosting-provider forwarded-IP headers.
- Removes the predictable Better Auth fallback secret. Production must provide a random `BETTER_AUTH_SECRET` of at least 32 characters.
- Removes wildcard Vercel preview trust and request-derived Host/Origin trust from Better Auth. Configure preview origins explicitly.
- Makes the cron endpoint fail closed unless `CRON_SECRET` is configured with at least 32 characters; accepts it only as a Bearer token and compares it in constant time.
- Rate-limits the API routes, including authentication, AI analysis, market data, and profile uploads. Upload validation allows only JPEG, PNG, and WebP based on file signatures rather than trusting the client-provided MIME type.
- Removes public environment and broker-diagnostics endpoints; provider health responses expose only coarse availability.
- Removes request bodies, OTP email addresses, raw AI output, and stack traces from application/browser error logs. Marks the AI provider module as server-only to prevent accidental client imports.
- Rewrites the Privacy Policy to describe current categories of data and service providers without claiming analytics or security controls that are not present.

## Required production environment configuration

Set these in the hosting provider's encrypted environment-variable settings:

- `BETTER_AUTH_SECRET`: unique, cryptographically random value, 32+ characters.
- `BETTER_AUTH_URL`: canonical production origin, `https://www.lumoraai.in`.
- `BETTER_AUTH_TRUSTED_ORIGINS`: comma-separated exact HTTPS origins only, including any preview origin that is genuinely needed. Do not use wildcard host patterns.
- `CRON_SECRET`: unique, cryptographically random value, 32+ characters. Scheduler must send `Authorization: Bearer <secret>`.
- `UPSTASH_REDIS_REST_URL`: HTTPS REST URL for the shared Redis database.
- `UPSTASH_REDIS_REST_TOKEN`: REST authentication token for the same Redis database.

Rotate any secret that has ever been committed, logged, pasted into an issue, or exposed in a client bundle. Never put server secrets in `NEXT_PUBLIC_*` variables.

## Hosting-edge firewall — mandatory

The application limiter is an additional control, not a DDoS mitigation system. It is process-local and therefore cannot enforce a single global quota across multiple serverless instances. Before describing Lumora as protected by a strong WAF, configure the hosting provider's edge firewall:

1. Enable the provider's managed WAF / attack-challenge / DDoS protection for both `lumoraai.in` and `www.lumoraai.in`.
2. Enable managed rules for common web exploits (OWASP-style rules), bot protection, and reputation-based threat blocking.
3. Add rate-limit rules for `/api/auth/*`, `/api/analyze`, `/api/chat`, `/api/research`, `/api/trade-planner`, `/api/news`, and `/api/upload`. Use tighter limits for AI routes because they incur provider costs.
4. Keep `/api/cron/notifications` inaccessible to ordinary traffic where possible; the endpoint still requires its Bearer secret.
5. Restrict or remove public access to diagnostic endpoints if they are not required by the product.
6. Ensure the deployment origin cannot be reached directly while bypassing the edge proxy. Forwarded-IP headers are only trustworthy when requests pass through a trusted proxy.
7. Configure both Upstash variables above in the production environment. API routes use the shared Redis sliding-window limiter when both are present. If both are absent, the bounded in-memory limiter is used and quotas are only per warm instance; if only one is present or Redis fails, requests fail closed with HTTP 503.
8. Review WAF events, authentication failures, 429 rates, provider spend, and error spikes. Alert on unusual increases.

## Verification checklist

- [ ] Confirm production has a unique `BETTER_AUTH_SECRET` (32+ random characters).
- [ ] Confirm `CRON_SECRET` is configured and query-string cron secrets no longer work.
- [ ] Confirm production and required preview origins are explicitly allowlisted.
- [ ] Confirm wildcard CORS is absent from responses.
- [ ] Confirm HSTS, `X-Frame-Options`, `X-Content-Type-Options`, and `Referrer-Policy` response headers.
- [ ] Confirm both Upstash Redis environment variables are set in production and repeated requests receive HTTP 429 with a `Retry-After` header.
- [ ] Confirm a Redis outage fails closed with HTTP 503 instead of silently bypassing request limits.
- [ ] Confirm no public environment or broker-diagnostics endpoints are deployed.
- [ ] Confirm AI provider keys exist only in server-side environment variables and the AI provider module remains server-only.
- [ ] Confirm upload rejects SVG, HTML, renamed executables, and oversized files.
- [ ] Confirm edge WAF rules and shared rate limiting are enabled and tested.

## Important limitation

No application code can guarantee protection against volumetric DDoS, malicious traffic before it reaches the application, or abuse distributed across many serverless instances without edge controls and shared state. The repository changes provide defense-in-depth; the hosting WAF and distributed limiter remain deployment tasks.
