import { timingSafeEqual } from "node:crypto"
import { NextResponse } from "next/server"
import { processIntelligentStockNotifications, processWhatsNewForUser } from "@/lib/notifications/stock-digest"
import { db } from "@/lib/db"
import { user } from "@/lib/db/schema"
import { eq } from "drizzle-orm"

export const runtime = "nodejs"
export const maxDuration = 60
export const dynamic = "force-dynamic"

export async function GET(req: Request) {
  return handleCron(req)
}

export async function POST(req: Request) {
  return handleCron(req)
}

function safeSecretEqual(received: string, expected: string): boolean {
  const a = Buffer.from(received)
  const b = Buffer.from(expected)
  return a.length === b.length && timingSafeEqual(a, b)
}

async function handleCron(req: Request) {
  const cronSecret = process.env.CRON_SECRET
  if (!cronSecret || cronSecret.length < 32) {
    console.error("[Lumora Security] CRON_SECRET is missing or too short; cron endpoint is disabled.")
    return NextResponse.json({ error: "Cron endpoint is not configured." }, { status: 503 })
  }

  // Accept the secret only in the Authorization header. Query-string secrets
  // leak into browser history, analytics, proxy logs, and referrer headers.
  const authHeader = req.headers.get("authorization") || ""
  const match = authHeader.match(/^Bearer\s+(.+)$/i)
  if (!match || !safeSecretEqual(match[1], cronSecret)) {
    return NextResponse.json({ error: "Unauthorized cron request" }, { status: 401 })
  }

  const url = new URL(req.url)
  const action = url.searchParams.get("action")

  try {
    const startTime = Date.now()

    if (action === "whats-new") {
      const allUsers = await db.select({ id: user.id }).from(user).where(eq(user.emailVerified, true))
      let sentCount = 0
      let skippedCount = 0
      for (const u of allUsers) {
        const res = await processWhatsNewForUser(u.id)
        if (res.success) sentCount++
        else skippedCount++
      }
      const elapsedMs = Date.now() - startTime
      return NextResponse.json({
        success: true,
        action: "whats-new",
        sent: sentCount,
        skipped: skippedCount,
        elapsedMs,
        timestamp: new Date().toISOString(),
      })
    }

    const summary = await processIntelligentStockNotifications()
    const elapsedMs = Date.now() - startTime

    return NextResponse.json({
      success: true,
      message: `Processed ${summary.processed} users: ${summary.sent} digests sent, ${summary.skipped} skipped (cooldown or inactive).`,
      summary,
      elapsedMs,
      timestamp: new Date().toISOString(),
    })
  } catch (err) {
    console.error("[Cron Notifications Error]", { name: err instanceof Error ? err.name : "UnknownError" })
    return NextResponse.json(
      {
        success: false,
        error: "Failed to run scheduled notifications job",
      },
      { status: 500 },
    )
  }
}
