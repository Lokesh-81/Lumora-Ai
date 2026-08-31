import { NextResponse } from "next/server"
import { searchSymbols } from "@/lib/market"
import {
  parseInstrument,
  suggestOptionContracts,
  isPartialDerivativeQuery,
  searchCatalogSymbols,
  INDEX_MAP,
  STOCK_MAP,
} from "@/lib/instrument"
import { rateLimit, clientIp } from "@/lib/ratelimit"
import { logActivity } from "@/app/actions/activity"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"
export const fetchCache = "force-no-store"

export async function GET(req: Request) {
  const rl = rateLimit(`search:${clientIp(req)}`, 60, 60_000)
  if (!rl.ok) return NextResponse.json({ error: "Too many requests." }, { status: 429 })

  const { searchParams } = new URL(req.url)
  const q = searchParams.get("q") ?? ""
  const trimmed = q.trim()
  if (!trimmed) return NextResponse.json({ results: [] })

  if (trimmed.length >= 2) {
    logActivity({
      type: "search",
      title: `Searched for "${trimmed}"`,
      ticker: trimmed.toUpperCase(),
      href: `/markets?symbol=${trimmed.toUpperCase()}`,
    }).catch(() => {})
  }

  const isPartial = isPartialDerivativeQuery(trimmed)
  const parsed = parseInstrument(trimmed)

  // 1. Primary parsed result (Full Option Contract, Index, or Stock)
  const primaryResults: Record<string, unknown>[] = []
  const underlyingResults: Record<string, unknown>[] = []

  if (parsed.type === "option" && !parsed.isPartial && parsed.strike && parsed.optionType) {
    // Exact Option Contract requested -> ALWAYS TOP RESULT
    primaryResults.push({
      symbol: parsed.symbol,
      name: parsed.name,
      exchange: parsed.exchange ?? "NSE",
      type: "OPTION",
      strike: parsed.strike,
      optionType: parsed.optionType,
      expiry: parsed.expiry,
      underlying: parsed.underlying,
    })
    // Also include the underlying index/stock below option contracts for convenience
    if (parsed.underlyingSymbol) {
      underlyingResults.push({
        symbol: parsed.underlyingSymbol,
        name: parsed.underlying ?? parsed.underlyingSymbol,
        exchange: parsed.exchange ?? "NSE",
        type: parsed.segment === "BFO" ? "INDEX" : "INDEX",
      })
    }
  } else if (parsed.type !== "unknown" && parsed.type !== "option") {
    // Index, Equity, Crypto, Forex, Commodity -> ALWAYS TOP RESULT
    primaryResults.push({
      symbol: parsed.symbol,
      name: parsed.name,
      exchange: parsed.exchange ?? "",
      type: parsed.type.toUpperCase(),
    })
  } else if (parsed.underlyingSymbol) {
    // Partial derivative query (e.g. "NIFTY 24150") -> include underlying
    underlyingResults.push({
      symbol: parsed.underlyingSymbol,
      name: parsed.underlying ?? parsed.name,
      exchange: parsed.exchange ?? "NSE",
      type: INDEX_MAP[parsed.underlying?.toUpperCase() ?? ""] ? "INDEX" : "EQUITY",
    })
  }

  // 2. Option Suggestions (for partial queries like "NIFTY 24250" or index searches)
  let optionSuggestions: Record<string, unknown>[] = []
  if (trimmed.length >= 2) {
    const options = suggestOptionContracts(trimmed, 6)
    optionSuggestions = options.map((o) => ({
      symbol: o.symbol,
      name: o.name,
      exchange: o.exchange,
      type: "OPTION",
      strike: o.strike,
      optionType: o.optionType,
      expiry: o.expiry,
      underlying: o.underlyingName ?? o.underlyingSymbol,
    }))
  }

  // 3. Catalog & Online Search
  const catalogResults = searchCatalogSymbols(trimmed).map((c) => ({
    symbol: c.symbol,
    name: c.name,
    exchange: c.exchange,
    type: c.type.toUpperCase(),
  }))

  const onlineResults = isPartial || parsed.type === "option" ? [] : await searchSymbols(trimmed)

  const combined = [
    ...primaryResults,
    ...optionSuggestions,
    ...underlyingResults,
    ...catalogResults,
    ...onlineResults,
  ]

  // Deduplicate by symbol
  const seen = new Set<string>()
  const unique = combined.filter((r) => {
    const sym = String(r.symbol || "").toUpperCase()
    if (!sym || seen.has(sym)) return false
    seen.add(sym)
    return true
  })

  return NextResponse.json({ results: unique.slice(0, 25) })
}
