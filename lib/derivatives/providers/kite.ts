// Zerodha Kite Connect v3 Provider Connector for Indian NFO & BFO Derivatives

import type {
  IDerivativeProvider,
  DerivativeSegment,
  ExchangeInstrument,
  DerivativeQuote,
  OptionChainData,
  OptionChainRequest,
  ProviderHealth,
  OptionContract,
} from "../types"
import { generateOptionChainInstruments } from "../instruments"
import { getValidExpiries } from "../../instrument"

export class KiteConnectOptionsProvider implements IDerivativeProvider {
  readonly id = "zerodha_kite"
  readonly name = "Zerodha Kite Connect"
  readonly supportedSegments: DerivativeSegment[] = ["NFO", "BFO"]

  private getApiKey(): string | undefined {
    return process.env.ZERODHA_KITE_API_KEY
  }

  private getAccessToken(): string | undefined {
    return process.env.ZERODHA_KITE_ACCESS_TOKEN
  }

  isConfigured(): boolean {
    return !!(this.getApiKey() && this.getAccessToken())
  }

  async getHealth(): Promise<ProviderHealth> {
    const apiKey = this.getApiKey()
    const accessToken = this.getAccessToken()
    const missing: string[] = []
    if (!apiKey) missing.push("ZERODHA_KITE_API_KEY")
    if (!accessToken) missing.push("ZERODHA_KITE_ACCESS_TOKEN")

    if (missing.length > 0) {
      return {
        id: this.id,
        name: this.name,
        isConfigured: false,
        status: "UNCONFIGURED",
        requiredEnvVars: ["ZERODHA_KITE_API_KEY", "ZERODHA_KITE_ACCESS_TOKEN"],
        missingEnvVars: missing,
        supportedSegments: this.supportedSegments,
      }
    }

    const t0 = Date.now()
    try {
      // Kite Profile / User endpoint to verify session token validity
      const res = await fetch("https://api.kite.trade/user/profile", {
        headers: {
          "X-Kite-Version": "3",
          Authorization: `token ${apiKey}:${accessToken}`,
        },
      })
      const latencyMs = Date.now() - t0
      if (!res.ok) {
        return {
          id: this.id,
          name: this.name,
          isConfigured: true,
          status: "AUTH_FAILED",
          requiredEnvVars: ["ZERODHA_KITE_API_KEY", "ZERODHA_KITE_ACCESS_TOKEN"],
          missingEnvVars: [],
          supportedSegments: this.supportedSegments,
          latencyMs,
          errorMessage: `Kite Auth Failed (HTTP ${res.status}): Access token may be expired or invalid.`,
          lastChecked: Date.now(),
        }
      }

      return {
        id: this.id,
        name: this.name,
        isConfigured: true,
        status: "CONNECTED",
        requiredEnvVars: ["ZERODHA_KITE_API_KEY", "ZERODHA_KITE_ACCESS_TOKEN"],
        missingEnvVars: [],
        supportedSegments: this.supportedSegments,
        latencyMs,
        lastChecked: Date.now(),
      }
    } catch (err: any) {
      return {
        id: this.id,
        name: this.name,
        isConfigured: true,
        status: "ERROR",
        requiredEnvVars: ["ZERODHA_KITE_API_KEY", "ZERODHA_KITE_ACCESS_TOKEN"],
        missingEnvVars: [],
        supportedSegments: this.supportedSegments,
        latencyMs: Date.now() - t0,
        errorMessage: err?.message ?? "Network connection error to Kite Trade API",
        lastChecked: Date.now(),
      }
    }
  }

  async getQuote(instrument: ExchangeInstrument): Promise<DerivativeQuote | null> {
    if (!this.isConfigured()) return null
    const map = await this.getQuotes([instrument])
    return map.get(instrument.canonicalSymbol) ?? null
  }

  async getQuotes(instruments: ExchangeInstrument[]): Promise<Map<string, DerivativeQuote>> {
    const results = new Map<string, DerivativeQuote>()
    if (!this.isConfigured() || instruments.length === 0) return results

    const apiKey = this.getApiKey()!
    const accessToken = this.getAccessToken()!

    // Kite takes query params like ?i=NFO:NIFTY26AUG24150CE&i=NFO:NIFTY26AUG24150PE
    const params = new URLSearchParams()
    instruments.forEach((inst) => params.append("i", inst.canonicalSymbol))

    try {
      const res = await fetch(`https://api.kite.trade/quote?${params.toString()}`, {
        headers: {
          "X-Kite-Version": "3",
          Authorization: `token ${apiKey}:${accessToken}`,
        },
      })

      if (!res.ok) return results
      const json = await res.json()
      if (json.status !== "success" || !json.data) return results

      for (const inst of instruments) {
        const rawQuote = json.data[inst.canonicalSymbol]
        if (!rawQuote) continue

        const ltp = Number(rawQuote.last_price ?? 0)
        const close = Number(rawQuote.ohlc?.close ?? 0)
        const change = close > 0 ? ltp - close : 0
        const changePercent = close > 0 ? (change / close) * 100 : 0

        const q: DerivativeQuote = {
          instrument: inst,
          ltp,
          change,
          changePercent,
          open: rawQuote.ohlc?.open ?? null,
          high: rawQuote.ohlc?.high ?? null,
          low: rawQuote.ohlc?.low ?? null,
          close: rawQuote.ohlc?.close ?? null,
          volume: rawQuote.volume ?? null,
          openInterest: rawQuote.oi ?? null,
          openInterestChange: rawQuote.oi_day_high ? (rawQuote.oi ?? 0) - (rawQuote.oi_day_low ?? 0) : null,
          iv: null, // Kite raw quote does not include Greeks; can be calculated via Black-Scholes if requested
          delta: null,
          gamma: null,
          theta: null,
          vega: null,
          bid: rawQuote.depth?.buy?.[0]?.price ?? null,
          ask: rawQuote.depth?.sell?.[0]?.price ?? null,
          bidQty: rawQuote.depth?.buy?.[0]?.quantity ?? null,
          askQty: rawQuote.depth?.sell?.[0]?.quantity ?? null,
          lastTradeTime: rawQuote.last_trade_time ?? null,
          timestamp: Date.now(),
          isLive: true,
          sourceProvider: this.name,
        }

        results.set(inst.canonicalSymbol, q)
      }
    } catch {
      // Return whatever was successfully collected
    }

    return results
  }

  async getOptionChain(
    request: OptionChainRequest,
    underlyingQuote: { price: number; change: number; changePercent: number; name: string }
  ): Promise<OptionChainData | null> {
    if (!this.isConfigured()) return null

    const validExpiries = getValidExpiries(request.symbol)
    const expiries = validExpiries.map((e) => e.date)
    const selectedExpiry = request.expiry ?? expiries[0]

    const { calls, puts } = generateOptionChainInstruments(
      request.symbol,
      underlyingQuote.price,
      selectedExpiry,
      request.strikeCount ?? 20
    )

    const allInstruments = [...calls, ...puts]
    const quotesMap = await this.getQuotes(allInstruments)

    if (quotesMap.size === 0) return null

    const contracts: OptionContract[] = allInstruments.map((inst) => {
      const q = quotesMap.get(inst.canonicalSymbol)
      return {
        strike: inst.strike,
        type: inst.optionType,
        expiry: selectedExpiry,
        hasLiveData: !!q && q.ltp !== null,
        premium: q?.ltp ?? null,
        iv: q?.iv ?? null,
        delta: q?.delta ?? null,
        gamma: q?.gamma ?? null,
        theta: q?.theta ?? null,
        vega: q?.vega ?? null,
        openInterest: q?.openInterest ?? null,
        volume: q?.volume ?? null,
        change: q?.change ?? null,
        changePercent: q?.changePercent ?? null,
        bid: q?.bid ?? null,
        ask: q?.ask ?? null,
        instrumentToken: inst.instrumentToken,
        tradingsymbol: inst.tradingsymbol,
        lastTradeTime: q?.lastTradeTime,
      }
    })

    const totalCallOI = contracts.filter((c) => c.type === "CE").reduce((sum, c) => sum + (c.openInterest ?? 0), 0)
    const totalPutOI = contracts.filter((c) => c.type === "PE").reduce((sum, c) => sum + (c.openInterest ?? 0), 0)
    const pcr = totalCallOI > 0 && totalPutOI > 0 ? totalPutOI / totalCallOI : null

    return {
      symbol: request.symbol,
      underlyingSymbol: request.symbol,
      underlyingName: underlyingQuote.name,
      underlyingPrice: underlyingQuote.price,
      underlyingChange: underlyingQuote.change,
      underlyingChangePercent: underlyingQuote.changePercent,
      expiries,
      expiry: selectedExpiry,
      contracts,
      pcr,
      maxPain: null,
      provider: this.name,
      isLiveData: true,
      segment: calls[0]?.segment ?? "NFO",
      timestamp: Date.now(),
      notice: {
        type: "LIVE_CONFIRMED",
        title: "Live Derivative Feed Active",
        message: "Live NFO/BFO option quotes streaming directly from Zerodha Kite Connect.",
        provider: this.name,
      },
    }
  }
}
