import { betterAuth } from "better-auth"
import { emailOTP } from "better-auth/plugins"
import { pool } from "@/lib/db"
import { sendOtpEmail } from "@/lib/email"

const socialProviders: Record<string, unknown> = {}

if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
  socialProviders.google = {
    clientId: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  }
}

if (process.env.YAHOO_CLIENT_ID && process.env.YAHOO_CLIENT_SECRET) {
  socialProviders.yahoo = {
    clientId: process.env.YAHOO_CLIENT_ID,
    clientSecret: process.env.YAHOO_CLIENT_SECRET,
  }
}

if (process.env.APPLE_CLIENT_ID && process.env.APPLE_CLIENT_SECRET) {
  socialProviders.apple = {
    clientId: process.env.APPLE_CLIENT_ID,
    clientSecret: process.env.APPLE_CLIENT_SECRET,
    ...(process.env.APPLE_APP_BUNDLE_IDENTIFIER
      ? { appBundleIdentifier: process.env.APPLE_APP_BUNDLE_IDENTIFIER }
      : {}),
  }
}

export const enabledProviders = Object.keys(socialProviders)

// Never ship a predictable signing secret. Keep module imports build-safe, but
// authentication must be configured with a high-entropy BETTER_AUTH_SECRET.
const BETTER_AUTH_SECRET = process.env.BETTER_AUTH_SECRET?.trim() || ""

if (process.env.NODE_ENV === "production" && BETTER_AUTH_SECRET.length < 32) {
  console.error("[Lumora Security] BETTER_AUTH_SECRET must be configured with at least 32 characters.")
}

// Resolve the canonical deployment URL without trusting request Host/Origin
// headers. Those headers are attacker-controlled and must not define auth URLs.
function resolveBaseUrl(): string {
  const envUrl =
    process.env.BETTER_AUTH_URL ||
    process.env.NEXT_PUBLIC_APP_URL ||
    process.env.NEXT_PUBLIC_SITE_URL ||
    process.env.APP_URL ||
    process.env.AUTH_URL ||
    process.env.NEXTAUTH_URL

  if (envUrl?.trim()) {
    const value = envUrl.trim()
    return value.startsWith("http://") || value.startsWith("https://")
      ? new URL(value).origin
      : `https://${value}`
  }

  if (process.env.VERCEL_PROJECT_PRODUCTION_URL)
    return `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
  if (process.env.VERCEL_URL)
    return `https://${process.env.VERCEL_URL.replace(/^https?:\/\//, "")}`
  if (process.env.NODE_ENV === "production") return "https://www.lumoraai.in"
  return "http://localhost:3000"
}

const RESOLVED_BASE_URL = resolveBaseUrl()

if (!process.env.BETTER_AUTH_URL) {
  process.env.BETTER_AUTH_URL = RESOLVED_BASE_URL
}

// Exact origins only. Do not trust every *.vercel.app preview or dynamically
// echo the incoming Origin/Host: either can turn an untrusted site into a
// trusted authentication origin.
const trustedOriginSet = new Set<string>([
  "https://www.lumoraai.in",
  "https://lumoraai.in",
  RESOLVED_BASE_URL,
])

if (process.env.NODE_ENV !== "production") {
  trustedOriginSet.add("http://localhost:3000")
  trustedOriginSet.add("http://127.0.0.1:3000")
}

for (const raw of (process.env.BETTER_AUTH_TRUSTED_ORIGINS || "").split(",")) {
  const value = raw.trim()
  if (!value) continue
  try {
    const url = new URL(value)
    if (url.protocol === "https:" || (process.env.NODE_ENV !== "production" && url.protocol === "http:")) {
      trustedOriginSet.add(url.origin)
    }
  } catch {
    console.warn("[Lumora Security] Ignoring an invalid BETTER_AUTH_TRUSTED_ORIGINS entry.")
  }
}

const TRUSTED_ORIGINS = [...trustedOriginSet]

const _auth = betterAuth({
  database: pool,
  secret: BETTER_AUTH_SECRET,
  baseURL: RESOLVED_BASE_URL,
  emailAndPassword: {
    enabled: true,
    autoSignIn: false,
  },
  emailVerification: {
    sendOnSignUp: false,
    autoSignInAfterVerification: true,
  },
  socialProviders,
  plugins: [
    emailOTP({
      otpLength: 6,
      expiresIn: 600,
      sendVerificationOnSignUp: false,
      async sendVerificationOTP({ email, otp, type }) {
        const emailType = type === "forget-password" ? "reset" : "verification"
        try {
          await sendOtpEmail({ email, otp, type: emailType })
        } catch (e) {
          console.warn("[Lumora Auth] OTP email delivery failed:", (e as Error)?.message)
        }
      },
    }),
  ],
  trustedOrigins: TRUSTED_ORIGINS,
  session: {
    expiresIn: 60 * 60 * 24 * 7,
    updateAge: 60 * 60 * 24,
  },
  ...(process.env.NODE_ENV === "development"
    ? {
        advanced: {
          defaultCookieAttributes: {
            sameSite: "lax" as const,
            secure: false,
          },
        },
      }
    : {}),
})

export const auth = _auth
