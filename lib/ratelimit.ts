// Per-instance sliding-window limiter. This is a useful application-layer
// safety net, not a substitute for an edge/WAF or a shared Redis limiter.
// On serverless deployments each warm instance has its own buckets.

import { isIP } from "node:net"

type Bucket = { hits: number[]; lastSeen: number }

const buckets = new Map<string, Bucket>()
const MAX_BUCKETS = 20_000
const MAX_HITS_PER_BUCKET = 500

export type RateLimitResult = {
  ok: boolean
  remaining: number
  resetAt: number
}

function prune(now: number) {
  for (const [key, bucket] of buckets) {
    if (now - bucket.lastSeen > 10 * 60_000) buckets.delete(key)
  }
  // Bound memory even during a high-cardinality distributed request flood.
  while (buckets.size > MAX_BUCKETS) {
    const oldest = buckets.keys().next().value
    if (!oldest) break
    buckets.delete(oldest)
  }
}

/** Sliding-window limiter keyed by route + caller identity. */
export function rateLimit(key: string, limit = 20, windowMs = 60_000): RateLimitResult {
  const now = Date.now()
  if (buckets.size > MAX_BUCKETS * 0.8) prune(now)

  const bucket = buckets.get(key) ?? { hits: [], lastSeen: now }
  const cutoff = now - windowMs
  bucket.hits = bucket.hits.filter((time) => time > cutoff)
  bucket.lastSeen = now

  const ok = bucket.hits.length < limit
  if (ok && bucket.hits.length < MAX_HITS_PER_BUCKET) bucket.hits.push(now)
  buckets.set(key, bucket)

  const resetAt = bucket.hits.length
    ? bucket.hits[0] + windowMs
    : now + windowMs

  return {
    ok,
    remaining: Math.max(0, limit - bucket.hits.length),
    resetAt,
  }
}

/**
 * Resolve a client address from reverse-proxy headers.
 * Deploy behind a trusted proxy (e.g. Vercel/Cloudflare); never expose the
 * origin directly while relying on forwarded headers for identity.
 */
export function clientIp(req: Request): string {
  const h = req.headers
  const candidates = [
    h.get("x-real-ip"),
    h.get("cf-connecting-ip"),
    h.get("x-vercel-forwarded-for"),
    h.get("x-forwarded-for")?.split(",")[0]?.trim(),
  ]

  for (const candidate of candidates) {
    const value = candidate?.trim()
    if (value && isIP(value)) return value
  }
  return "unknown"
}

// Opportunistic cleanup keeps long-lived Node instances bounded.
if (typeof setInterval !== "undefined") {
  const timer = setInterval(() => prune(Date.now()), 60_000)
  if (typeof (timer as { unref?: () => void }).unref === "function") {
    ;(timer as { unref?: () => void }).unref!()
  }
}
