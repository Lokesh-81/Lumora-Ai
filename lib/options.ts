import { getQuote } from "@/lib/market"
import {
  parseOptionQuery,
  getValidExpiries,
  getStrikeRulesForSymbol,
  MONTH_NAMES,
  type DerivativeSegment,
  type OptionType,
} from "@/lib/instrument"
import { derivativeManager } from "@/lib/derivatives/manager"
import type {
  OptionContract,
  DerivativeNotice,
  OptionChainData,
  OptionChainRequest,
  IDerivativeProvider,
} from "@/lib/derivatives/types"

export type { OptionType, OptionContract, DerivativeNotice, OptionChainData, OptionChainRequest }

export interface OptionsProvider {
  readonly id: string
  readonly name: string
  readonly supportedSegments: DerivativeSegment[]
  isConfigured(): boolean
  getOptionChain(request: OptionChainRequest): Promise<OptionChainData | null>
}

/* -------------------------------------------------------------------------- */
/* Yahoo Finance Provider (US Equities & ETFs with listed chains)             */
/* -------------------------------------------------------------------------- */

let crumbOptCache: { crumb: string; cookie: string; at: number } | null = null

async function getYfCrumb(): Promise<{ crumb: string; cookie: string } | null> {
  if (crumbOptCache && Date.now() - crumbOptCache.at < 30 * 60 * 1000) {
    return { crumb: crumbOptCache.crumb, cookie: crumbOptCache.cookie }
  }
  try {
    const ua = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"
    const c1 = await fetch("https://fc.yahoo.com", { headers: { "User-Agent": ua } })
    let cookie = c1.headers.get("set-cookie") ?? ""
    if (!cookie) {
      const c2 = await fetch("https://finance.yahoo.com", { headers: { "User-Agent": ua } })
      cookie = c2.headers.get("set-cookie") ?? ""
    }
    cookie = cookie.split(";")[0] ?? ""
    const res = await fetch("https://query1.finance.yahoo.com/v1/test/getcrumb", {
      headers: { "User-Agent": ua, Accept: "text/plain", ...(cookie ? { Cookie: cookie } : {}) },
    })
    const crumb = (await res.text()).trim()
    if (!crumb || crumb.includes("<")) return null
    crumbOptCache = { crumb, cookie, at: Date.now() }
    return { crumb, cookie }
  } catch {
    return null
  }
}

export class YahooFinanceOptionsProvider implements OptionsProvider {
  readonly id = "yahoo_finance"
  readonly name = "Yahoo Finance"
  readonly supportedSegments: DerivativeSegment[] = ["US_OPTIONS"]

  isConfigured(): boolean {
    return true
  }

  async getOptionChain(request: OptionChainRequest): Promise<OptionChainData | null> {
    const symbol = request.symbol
    const optParsed = parseOptionQuery(symbol)
    const targetSymbol = optParsed?.underlyingSymbol ?? symbol

    // Yahoo Finance does NOT provide option chain feeds for Indian BFO/NFO symbols
    if (
      targetSymbol.endsWith(".NS") ||
      targetSymbol.endsWith(".BO") ||
      targetSymbol.startsWith("^NSE") ||
      targetSymbol.startsWith("^BSE") ||
      targetSymbol === "NIFTY_FIN_SERVICE.NS"
    ) {
      return null
    }

    try {
      const auth = await getYfCrumb()
      const crumbQs = auth?.crumb ? `?crumb=${encodeURIComponent(auth.crumb)}` : ""

      const ua = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"
      const url = `https://query1.finance.yahoo.com/v7/finance/options/${encodeURIComponent(targetSymbol)}${crumbQs}`

      const headers: Record<string, string> = { "User-Agent": ua, Accept: "application/json" }
      if (auth?.cookie) headers.Cookie = auth.cookie
      const res = await fetch(url, { headers })
      if (!res.ok) return null
      const json = await res.json()
      const opt = json?.optionChain?.result?.[0]
      if (!opt) return null

      const underlyingPrice = opt.quote?.regularMarketPrice ?? opt.underlyingPrice ?? 0
      const underlyingChange = opt.quote?.regularMarketChange ?? 0
      const underlyingChangePercent = opt.quote?.regularMarketChangePercent ?? 0
      const expirations: string[] = opt.expirationDates?.map((e: number) => {
        const d = new Date(e * 1000)
        return d.toISOString().slice(0, 10)
      }) ?? []

      const expiry = request.expiry ?? expirations[0] ?? ""

      const options = opt.options?.[0]
      if (!options) return null

      const calls: OptionContract[] = (options.calls ?? []).map((c: any) => ({
        strike: Number(c.strike ?? 0),
        type: "CE" as OptionType,
        expiry,
        hasLiveData: true,
        premium: c.lastPrice != null ? Number(c.lastPrice) : null,
        iv: c.impliedVolatility != null ? Number(c.impliedVolatility) * 100 : null,
        delta: c.greeks?.delta != null ? Number(c.greeks.delta) : null,
        gamma: c.greeks?.gamma != null ? Number(c.greeks.gamma) : null,
        theta: c.greeks?.theta != null ? Number(c.greeks.theta) : null,
        vega: c.greeks?.vega != null ? Number(c.greeks.vega) : null,
        openInterest: c.openInterest != null ? Number(c.openInterest) : null,
        volume: c.volume != null ? Number(c.volume) : null,
        change: c.change != null ? Number(c.change) : null,
        changePercent: c.percentChange != null ? Number(c.percentChange) : null,
        bid: c.bid != null ? Number(c.bid) : null,
        ask: c.ask != null ? Number(c.ask) : null,
      }))

      const puts: OptionContract[] = (options.puts ?? []).map((p: any) => ({
        strike: Number(p.strike ?? 0),
        type: "PE" as OptionType,
        expiry,
        hasLiveData: true,
        premium: p.lastPrice != null ? Number(p.lastPrice) : null,
        iv: p.impliedVolatility != null ? Number(p.impliedVolatility) * 100 : null,
        delta: p.greeks?.delta != null ? Number(p.greeks.delta) : null,
        gamma: p.greeks?.gamma != null ? Number(p.greeks.gamma) : null,
        theta: p.greeks?.theta != null ? Number(p.greeks.theta) : null,
        vega: p.greeks?.vega != null ? Number(p.greeks.vega) : null,
        openInterest: p.openInterest != null ? Number(p.openInterest) : null,
        volume: p.volume != null ? Number(p.volume) : null,
        change: p.change != null ? Number(p.change) : null,
        changePercent: p.percentChange != null ? Number(p.percentChange) : null,
        bid: p.bid != null ? Number(p.bid) : null,
        ask: p.ask != null ? Number(p.ask) : null,
      }))

      const allContracts = [...calls, ...puts]
      if (allContracts.length === 0) return null

      const totalCallOI = calls.reduce((s, c) => s + (c.openInterest ?? 0), 0)
      const totalPutOI = puts.reduce((s, p) => s + (p.openInterest ?? 0), 0)
      const pcr = totalPutOI > 0 && totalCallOI > 0 ? totalPutOI / totalCallOI : null

      let maxPain: number | null = null
      let minPain = Infinity
      for (const c of calls) {
        let pain = 0
        const strike = c.strike
        for (const cc of calls) pain += Math.max(0, strike - cc.strike) * (cc.openInterest ?? 0)
        for (const pp of puts) pain += Math.max(0, pp.strike - strike) * (pp.openInterest ?? 0)
        if (pain < minPain) {
          minPain = pain
          maxPain = strike
        }
      }

      return {
        symbol,
        underlyingSymbol: targetSymbol,
        underlyingName: targetSymbol,
        underlyingPrice,
        underlyingChange,
        underlyingChangePercent,
        expiries: expirations,
        expiry,
        contracts: allContracts,
        pcr,
        maxPain,
        provider: this.name,
        isLiveData: true,
        segment: "US_OPTIONS",
        notice: {
          type: "LIVE_CONFIRMED",
          title: "Live US Options Feed Active",
          message: "Real-time option contract prices, volume, and open interest provided by Yahoo Finance.",
        },
      }
    } catch {
      return null
    }
  }
}

/* -------------------------------------------------------------------------- */
/* Registered Providers & Dispatcher                                          */
/* -------------------------------------------------------------------------- */

const yfProvider = new YahooFinanceOptionsProvider()

export const providers = [
  ...derivativeManager.getRegisteredProviders().map((p) => ({
    id: p.id,
    name: p.name,
    supportedSegments: p.supportedSegments,
    isConfigured: () => p.isConfigured(),
  })),
  {
    id: yfProvider.id,
    name: yfProvider.name,
    supportedSegments: yfProvider.supportedSegments,
    isConfigured: () => yfProvider.isConfigured(),
  },
]

export async function getOptionChain(request: OptionChainRequest): Promise<OptionChainData | null> {
  const optParsed = parseOptionQuery(request.symbol)
  const targetSymbol = optParsed?.underlyingSymbol ?? request.symbol

  const isIndian =
    targetSymbol.endsWith(".NS") ||
    targetSymbol.endsWith(".BO") ||
    targetSymbol.startsWith("^NSE") ||
    targetSymbol.startsWith("^BSE") ||
    targetSymbol === "NIFTY_FIN_SERVICE.NS"

  // 1. If Indian equity or index option -> Delegate to Indian Derivative Manager
  if (isIndian || optParsed) {
    const underlyingQuote = await getQuote(targetSymbol, { withFundamentals: false })
    if (!underlyingQuote || underlyingQuote.price <= 0) return null

    return derivativeManager.getOptionChain(
      {
        symbol: targetSymbol,
        expiry: request.expiry,
      },
      {
        price: underlyingQuote.price,
        change: underlyingQuote.change,
        changePercent: underlyingQuote.changePercent,
        name: underlyingQuote.name || targetSymbol,
      }
    )
  }

  // 2. Global / US Listed Option Chain
  return yfProvider.getOptionChain(request)
}
