import { NextResponse } from "next/server"
import { getQuotes, REGION_CONFIG, displayName, type Region } from "@/lib/market"
import { generateMarketSummary, getAiErrorDiagnostic, DISCLAIMER, AiConfigError, AiBillingError } from "@/lib/ai/provider"
import { enforceRateLimit, clientIp } from "@/lib/ratelimit"

export const runtime = "nodejs"
export const maxDuration = 30

const VALID_REGIONS: Region[] = ["IN", "US", "GB", "JP", "GLOBAL"]

export async function GET(req: Request) {
  const rateLimitResponse1 = await enforceRateLimit(`summary:${clientIp(req)}`, 20, 60_000)
  if (rateLimitResponse1) return rateLimitResponse1

  const { searchParams } = new URL(req.url)
  const raw = (searchParams.get("region") ?? "GLOBAL").toUpperCase() as Region
  const region: Region = VALID_REGIONS.includes(raw) ? raw : "GLOBAL"
  const config = REGION_CONFIG[region]

  const quotes = await getQuotes(config.watchlist)
  if (quotes.length === 0) {
    return NextResponse.json({ summary: "", movers: [], region })
  }

  const movers = quotes.map((q) => ({
    symbol: q.symbol,
    name: displayName(q.symbol, q.name),
    price: q.price,
    changePercent: q.changePercent,
  }))

  const moversStr = movers
    .map((m) => `${m.name} (${m.symbol}): ${m.price.toLocaleString()} ${m.changePercent >= 0 ? "+" : ""}${m.changePercent.toFixed(2)}%`)
    .join("\n")

  try {
    const summary = await generateMarketSummary({ region: config.label, movers: moversStr })
    return NextResponse.json({ summary, movers, region, disclaimer: DISCLAIMER })
  } catch (err) {
    const message =
      err instanceof AiBillingError
        ? "Market summary is temporarily unavailable — quota exceeded."
        : err instanceof AiConfigError
          ? "Market summary is temporarily unavailable. Please try again later."
          : "Market summary is temporarily unavailable — the model provider returned an error."
    console.error("[Lumora AI] market summary failed", getAiErrorDiagnostic(err))
    return NextResponse.json({ summary: "", movers, region, error: message }, { status: 200 })
  }
}
