import { NextResponse } from "next/server"
import { derivativeManager } from "@/lib/derivatives/manager"
import { rateLimit, clientIp } from "@/lib/ratelimit"

export const runtime = "nodejs"
export const maxDuration = 10

export async function GET(req: Request) {
  const rl = rateLimit(`options-health:${clientIp(req)}`, 30, 60_000)
  if (!rl.ok) return NextResponse.json({ error: "Too many requests." }, { status: 429 })

  try {
    const health = await derivativeManager.getAllProviderHealth()
    const configuredCount = health.filter((h) => h.isConfigured).length

    return NextResponse.json({
      timestamp: Date.now(),
      status: configuredCount > 0 ? "FEED_AVAILABLE" : "AUTHENTICATION_REQUIRED",
      summary: `${configuredCount} of ${health.length} Indian broker market data providers configured.`,
      providers: health,
    })
  } catch (err: any) {
    return NextResponse.json(
      {
        error: "Failed to check provider health",
        message: err?.message,
      },
      { status: 500 }
    )
  }
}
