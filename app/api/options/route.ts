import { NextResponse } from "next/server"
import { getOptionChain, providers } from "@/lib/options"
import { enforceRateLimit, clientIp } from "@/lib/ratelimit"

export const runtime = "nodejs"
export const maxDuration = 15

export async function GET(req: Request) {
  const rateLimitResponse1 = await enforceRateLimit(`options:${clientIp(req)}`, 20, 60_000)
  if (rateLimitResponse1) return rateLimitResponse1

  try {
    const data = await getOptionChain({ symbol, expiry })
    if (!data) {
      return NextResponse.json({
        available: false,
        symbol,
        message: "Options data unavailable",
        provider: null,
      })
    }
    return NextResponse.json({ available: true, data })
  } catch {
    return NextResponse.json({
      available: false,
      symbol,
      message: "Options data unavailable",
    })
  }
}
