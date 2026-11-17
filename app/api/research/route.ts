import { NextResponse } from "next/server"
import { buildInstrumentContext } from "@/lib/context"
import { generateInvestmentResearch, getAiErrorDiagnostic, DISCLAIMER, AiConfigError, AiBillingError } from "@/lib/ai/provider"
import { enforceRateLimit, clientIp } from "@/lib/ratelimit"

export const runtime = "nodejs"
export const maxDuration = 60

export async function POST(req: Request) {
  const rateLimitResponse1 = await enforceRateLimit(`research:${clientIp(req)}`, 10, 60_000)
  if (rateLimitResponse1) return rateLimitResponse1

  let body: { symbol?: string }
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 })
  }
  const symbol = body.symbol?.trim()
  if (!symbol) return NextResponse.json({ error: "Missing symbol" }, { status: 400 })
  if (symbol.length > 24) return NextResponse.json({ error: "Invalid symbol" }, { status: 400 })

  const built = await buildInstrumentContext(symbol, { newsCount: 8 })
  if (!built) {
    return NextResponse.json({ error: "Unable to load market data for this symbol." }, { status: 404 })
  }

  try {
    const research = await generateInvestmentResearch({ name: built.name, context: built.context })
    return NextResponse.json(
      { research, meta: { symbol: built.quote.symbol, name: built.name } },
      { headers: { "Cache-Control": "no-store" } },
    )
  } catch (err) {
    const message =
      err instanceof AiBillingError
        ? "Research is temporarily unavailable — quota exceeded."
        : err instanceof AiConfigError
          ? "Research is temporarily unavailable. Please try again later."
          : "Research is temporarily unavailable — the model provider returned an error."
    console.error("[Lumora AI] research failed", getAiErrorDiagnostic(err))
    return NextResponse.json({ error: message, disclaimer: DISCLAIMER }, { status: 200 })
  }
}
