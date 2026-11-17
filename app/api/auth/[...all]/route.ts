import { auth } from "@/lib/auth"
import { toNextJsHandler } from "better-auth/next-js"
import { db } from "@/lib/db"
import { user, activityLog } from "@/lib/db/schema"
import { eq, and, lt, sql } from "drizzle-orm"
import { enforceRateLimit, clientIp } from "@/lib/ratelimit"

const betterHandler = toNextJsHandler(auth.handler)

export const GET = async (req: Request) => {
  const limited = await enforceRateLimit(`auth:get:${clientIp(req)}`, 60, 60_000, "Too many authentication requests.")
  if (limited) return limited
  return betterHandler.GET(req)
}

function normalizeEmail(email: string): string {
  return email.trim().toLowerCase()
}

async function findUserByEmail(email: string) {
  const normalized = normalizeEmail(email)
  const rows = await db.select({
    id: user.id,
    email: user.email,
    emailVerified: user.emailVerified,
    createdAt: user.createdAt,
  }).from(user).where(eq(user.email, normalized)).limit(1)
  return rows[0] || null
}

function json(data: Record<string, unknown>, status: number): Response {
  return Response.json(data, { status })
}

function error(msg: string, status: number): Response {
  return json({ error: msg, message: msg }, status)
}

export async function POST(request: Request) {
  const ip = clientIp(request)
  const globalLimit = await enforceRateLimit(`auth:post:${ip}`, 30, 60_000, "Too many authentication requests.")
  if (globalLimit) return globalLimit

  const url = new URL(request.url)
  const path = url.pathname
  const body = await request.clone().json().catch(() => ({}))
  const email = body.email as string | undefined
  const normalizedEmail = email ? normalizeEmail(email) : undefined

  // ── Sign-up ──────────────────────────────────────────────────
  if (path === "/api/auth/sign-up/email") {
    const rateLimitResponse1 = await enforceRateLimit(`auth:signup:${ip}`, 5, 60_000)
    if (rateLimitResponse1) return rateLimitResponse1

    if (!body.agreedToLegal || !body.acceptedTerms || !body.acceptedPrivacyPolicy) {
      return error("You must accept the Terms & Conditions and Privacy Policy.", 400)
    }

    if (normalizedEmail) {
      const found = await findUserByEmail(normalizedEmail)
      if (found) {
        if (found.emailVerified) {
          return error("An account with this email already exists. Please sign in instead.", 409)
        }
        // Unverified user → allow resend
        return json({
          message: "Your account is awaiting verification. A new OTP has been sent.",
          status: "pending_verification",
          email: normalizedEmail,
        }, 200)
      }
    }

    const { agreedToLegal: _, acceptedTerms: __, acceptedPrivacyPolicy: ___, acceptedLegalVersion: ____, ...clean } = body
    const cleanRequest = new Request(request.url, {
      method: "POST",
      headers: request.headers,
      body: JSON.stringify(clean),
    })
    return safeForward(cleanRequest, clean)
  }

  // ── Send OTP ──────────────────────────────────────────────────
  if ((path === "/api/auth/email-otp/send-verification-otp" || path === "/api/auth/email-otp/request-password-reset") && normalizedEmail) {
    const rateLimitResponse2 = await enforceRateLimit(`auth:send-otp:${ip}`, 3, 60_000)
    if (rateLimitResponse2) return rateLimitResponse2

    const otpType: string = body.type || (path.includes("request-password-reset") ? "forget-password" : "")
    const found = await findUserByEmail(normalizedEmail)

    if (otpType === "email-verification") {
      if (!found) {
        return error("No account found for this email. Please sign up first.", 404)
      }
      if (found.emailVerified) {
        return error("This email is already verified. Please sign in instead.", 409)
      }
    } else if (otpType === "forget-password" || otpType === "password-reset") {
      if (!found) {
        return error("No account found for this email.", 404)
      }
    }

    // Forward to better-auth which handles OTP generation + email
    return safeForward(request, body)
  }

  // ── Verify OTP ────────────────────────────────────────────────
  if (path === "/api/auth/email-otp/verify-email" && normalizedEmail) {
    const rateLimitResponse3 = await enforceRateLimit(`auth:verify-otp:${ip}`, 10, 60_000)
    if (rateLimitResponse3) return rateLimitResponse3

    const found = await findUserByEmail(normalizedEmail)
    if (!found) {
      return error("No account found for this email. Please sign up first.", 404)
    }
    return safeForward(request, body)
  }

  // ── Default ───────────────────────────────────────────────────
  return safeForward(request, body)
}

async function safeForward(request: Request, body?: Record<string, any>): Promise<Response> {
  try {
    const response = await betterHandler.POST(request)
    if (!response.ok) {
      const cloned = response.clone()
      const resBody = await cloned.json().catch(() => ({}))
      const msg = String((resBody as Record<string, unknown>)?.message || (resBody as Record<string, unknown>)?.error || "Request failed.")
      if (response.status >= 500) {
        console.error("[AUTH] upstream authentication service failure", { status: response.status })
        return error("Authentication is temporarily unavailable. Please try again.", 503)
      }
      if (response.status === 422 || response.status === 409) {
        return error("An account with this email already exists. Please sign in instead.", 409)
      }
      return error(msg, response.status)
    }

    // Record auth activity event if applicable
    const url = new URL(request.url)
    const p = url.pathname
    const reqEmail = body?.email as string | undefined
    if (reqEmail) {
      if (p.endsWith("/sign-in/email")) {
        const found = await findUserByEmail(reqEmail)
        if (found) {
          await db.insert(activityLog).values({
            userId: found.id,
            type: "auth",
            title: "Signed in to Lumora AI",
            href: "/dashboard",
          }).catch(() => {})
        }
      } else if (p.endsWith("/reset-password") || p.endsWith("/change-password")) {
        const found = await findUserByEmail(reqEmail)
        if (found) {
          await db.insert(activityLog).values({
            userId: found.id,
            type: "auth",
            title: "Changed account password",
            href: "/profile",
          }).catch(() => {})
        }
      }
    }

    return response
  } catch (e) {
    const err = e as any
    // Better Auth's verifyPassword throws "Invalid password hash" (not a 401)
    // when a stored credential is in an incompatible format. That must surface
    // as a normal auth failure, not a generic 500 "internal error".
    if (err?.message === "Invalid password hash") {
      console.warn("[AUTH] incompatible stored password hash for sign-in; returning 401")
      return error("Invalid email or password", 401)
    }
    console.error("[AUTH] request failed", { name: err?.name || "Error" })
    return error("An internal error occurred. Please try again.", 500)
  }
}
