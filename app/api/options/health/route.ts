import { NextResponse } from "next/server"
import { derivativeManager } from "@/lib/derivatives/manager"
import { enforceRateLimit, clientIp } from "@/lib/ratelimit"

export const runtime = "nodejs"
export const maxDuration = 10

export async function GET(req: Request) {
  const limited = await enforceRateLimit(`options-health:${clientIp(req)}`, 30, 60_000)
  if (limited) return limited

  try {
    const health = await derivativeManager.getAllProviderHealth()
    const configuredCount = health.filter((provider) => provider.isConfigured).length

    // Expose only coarse availability. Never return provider diagnostics,
    // authentication errors, account identifiers, or upstream messages.
    return NextResponse.json({
      status: configuredCount > 0 ? "FEED_AVAILABLE" : "AUTHENTICATION_REQUIRED",
      configuredProviders: configuredCount,
      providerCount: health.length,
    }, { headers: { "Cache-Control": "no-store" } })
  } catch {
    return NextResponse.json({ error: "Provider health is temporarily unavailable." }, { status: 503 })
  }
}
