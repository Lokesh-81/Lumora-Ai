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

async function handleCron(req: Request) {
  const authHeader = req.headers.get("authorization")
  const cronSecret = process.env.CRON_SECRET

  const url = new URL(req.url)
  const querySecret = url.searchParams.get("secret")
  const action = url.searchParams.get("action")

  // If a CRON_SECRET is defined in environment, verify either Authorization header or ?secret= query param
  if (cronSecret) {
    const bearer = authHeader ? authHeader.replace(/^Bearer\s+/i, "") : null

    if (bearer !== cronSecret && querySecret !== cronSecret) {
      return NextResponse.json({ error: "Unauthorized cron request" }, { status: 401 })
    }
  }

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
    console.error("[Cron Notifications Error]", err)
    return NextResponse.json(
      {
        success: false,
        error: err instanceof Error ? err.message : "Failed to run scheduled notifications job",
      },
      { status: 500 },
    )
  }
}
