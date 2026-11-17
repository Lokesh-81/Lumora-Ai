import "server-only"

// Per-instance sliding-window limiter. This is a useful application-layer
// safety net, not a substitute for an edge/WAF or a shared Redis limiter.
// On serverless deployments each warm instance has its own buckets.

import { isIP } from "node:net"
import { randomUUID } from "node:crypto"

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
    h.get("x-vercel-forwarded-for")?.split(",")[0]?.trim(),
    h.get("cf-connecting-ip"),
    h.get("x-real-ip"),
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


/**
 * Enforce a route quota using shared Upstash Redis when configured.
 * If Redis credentials are absent, retain the bounded per-instance limiter as
 * a development/best-effort fallback. A partially configured or failing Redis
 * backend fails closed so a production deployment cannot silently bypass it.
 */
const REDIS_SLIDING_WINDOW_SCRIPT = [
  "redis.call('ZREMRANGEBYSCORE', KEYS[1], '-inf', tonumber(ARGV[1]) - tonumber(ARGV[2]))",
  "local count = redis.call('ZCARD', KEYS[1])",
  "if count >= tonumber(ARGV[3]) then",
  "  local oldest = redis.call('ZRANGE', KEYS[1], 0, 0, 'WITHSCORES')",
  "  return {0, 0, tonumber(oldest[2]) + tonumber(ARGV[2])}",
  "end",
  "redis.call('ZADD', KEYS[1], tonumber(ARGV[1]), ARGV[4])",
  "redis.call('PEXPIRE', KEYS[1], tonumber(ARGV[2]))",
  "return {1, tonumber(ARGV[3]) - count - 1, tonumber(ARGV[1]) + tonumber(ARGV[2])}",
].join("\n")

export async function enforceRateLimit(
  key: string,
  limit: number,
  windowMs: number,
  message = "Too many requests. Please try again shortly.",
): Promise<Response | null> {
  const redisUrl = process.env.UPSTASH_REDIS_REST_URL?.trim()
  const redisToken = process.env.UPSTASH_REDIS_REST_TOKEN?.trim()

  if (!redisUrl && !redisToken) {
    const local = rateLimit(key, limit, windowMs)
    if (local.ok) return null
    const retryAfter = Math.max(1, Math.ceil((local.resetAt - Date.now()) / 1000))
    return Response.json({ error: message }, {
      status: 429,
      headers: { "Retry-After": String(retryAfter), "Cache-Control": "no-store" },
    })
  }

  if (!redisUrl || !redisToken) {
    return Response.json({ error: "Request protection is temporarily unavailable." }, {
      status: 503,
      headers: { "Cache-Control": "no-store" },
    })
  }

  try {
    const parsedUrl = new URL(redisUrl)
    if (parsedUrl.protocol !== "https:") throw new Error("Invalid Redis endpoint protocol")

    const now = Date.now()
    const response = await fetch(redisUrl.replace(/\/+$/, "") + "/", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${redisToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify([
        "EVAL",
        REDIS_SLIDING_WINDOW_SCRIPT,
        "1",
        `lumora:rate-limit:${key}`,
        String(now),
        String(windowMs),
        String(limit),
        randomUUID(),
      ]),
      cache: "no-store",
    })

    if (!response.ok) throw new Error("Redis rate-limit request failed")
    const payload = await response.json() as { result?: unknown; error?: unknown }
    if (payload.error || !Array.isArray(payload.result) || payload.result.length < 3) {
      throw new Error("Invalid Redis rate-limit response")
    }

    const [allowed, remaining, resetAt] = payload.result.map(Number)
    if (![allowed, remaining, resetAt].every(Number.isFinite)) {
      throw new Error("Invalid Redis rate-limit result")
    }
    if (allowed === 1) return null

    const retryAfter = Math.max(1, Math.ceil((resetAt - now) / 1000))
    return Response.json({ error: message }, {
      status: 429,
      headers: {
        "Retry-After": String(retryAfter),
        "Cache-Control": "no-store",
      },
    })
  } catch {
    // Never log the URL, token, command payload, or provider response.
    return Response.json({ error: "Request protection is temporarily unavailable." }, {
      status: 503,
      headers: { "Cache-Control": "no-store" },
    })
  }
}
