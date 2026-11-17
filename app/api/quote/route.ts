import { NextResponse } from "next/server"
import { getQuotes } from "@/lib/market"
import { enforceRateLimit, clientIp } from "@/lib/ratelimit"

export const runtime = "nodejs"

export async function GET(req: Request) {
  const rateLimitResponse1 = await enforceRateLimit(`quote:${clientIp(req)}`, 30, 60_000)
  if (rateLimitResponse1) return rateLimitResponse1

  const { searchParams } = new URL(req.url)
  const symbolsParam = searchParams.get("symbols") ?? ""
  const symbols = symbolsParam.split(",").map((s) => s.trim().toUpperCase()).filter(Boolean).slice(0, 10)
  if (symbols.length === 0) return NextResponse.json({ quotes: [] })
  const quotes = await getQuotes(symbols)
  return NextResponse.json({ quotes })
}
