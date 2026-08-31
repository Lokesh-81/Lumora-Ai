// Upstox API v2 Provider Connector for Indian Derivatives & Option Chains

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
import { resolveUnderlying, getValidExpiries } from "../../instrument"
import { createExchangeInstrument } from "../instruments"

export class UpstoxOptionsProvider implements IDerivativeProvider {
  readonly id = "upstox"
  readonly name = "Upstox API v2"
  readonly supportedSegments: DerivativeSegment[] = ["NFO", "BFO"]

  private getAccessToken(): string | undefined {
    return process.env.UPSTOX_ACCESS_TOKEN || process.env.UPSTOX_API_KEY
  }

  isConfigured(): boolean {
    return !!this.getAccessToken()
  }

  async getHealth(): Promise<ProviderHealth> {
    const token = this.getAccessToken()
    if (!token) {
      return {
        id: this.id,
        name: this.name,
        isConfigured: false,
        status: "UNCONFIGURED",
        requiredEnvVars: ["UPSTOX_ACCESS_TOKEN"],
        missingEnvVars: ["UPSTOX_ACCESS_TOKEN"],
        supportedSegments: this.supportedSegments,
      }
    }

    const t0 = Date.now()
    try {
      const res = await fetch("https://api.upstox.com/v2/user/profile", {
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${token}`,
        },
      })
      const latencyMs = Date.now() - t0
      if (!res.ok) {
        return {
          id: this.id,
          name: this.name,
          isConfigured: true,
          status: "AUTH_FAILED",
          requiredEnvVars: ["UPSTOX_ACCESS_TOKEN"],
          missingEnvVars: [],
          supportedSegments: this.supportedSegments,
          latencyMs,
          errorMessage: `Upstox Auth Failed (HTTP ${res.status}): Bearer token may be expired or unauthorized.`,
          lastChecked: Date.now(),
        }
      }

      return {
        id: this.id,
        name: this.name,
        isConfigured: true,
        status: "CONNECTED",
        requiredEnvVars: ["UPSTOX_ACCESS_TOKEN"],
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
        requiredEnvVars: ["UPSTOX_ACCESS_TOKEN"],
        missingEnvVars: [],
        supportedSegments: this.supportedSegments,
        latencyMs: Date.now() - t0,
        errorMessage: err?.message ?? "Network error connecting to Upstox API",
        lastChecked: Date.now(),
      }
    }
  }

  private mapInstrumentKey(underlyingSymbol: string): string {
    const resolved = resolveUnderlying(underlyingSymbol)
    const code = resolved?.code ?? underlyingSymbol.replace(/[\^._-]/g, "").toUpperCase()

    if (code === "NIFTY") return "NSE_INDEX|Nifty 50"
    if (code === "BANKNIFTY") return "NSE_INDEX|Nifty Bank"
    if (code === "FINNIFTY") return "NSE_INDEX|Nifty Fin Service"
    if (code === "MIDCPNIFTY") return "NSE_INDEX|NIFTY MID SELECT"
    if (code === "SENSEX") return "BSE_INDEX|SENSEX"
    if (code === "BANKEX") return "BSE_INDEX|BANKEX"

    return `NSE_EQ|${code}`
  }

  async getQuote(instrument: ExchangeInstrument): Promise<DerivativeQuote | null> {
    if (!this.isConfigured()) return null
    const map = await this.getQuotes([instrument])
    return map.get(instrument.canonicalSymbol) ?? null
  }

  async getQuotes(instruments: ExchangeInstrument[]): Promise<Map<string, DerivativeQuote>> {
    const results = new Map<string, DerivativeQuote>()
    if (!this.isConfigured() || instruments.length === 0) return results

    const token = this.getAccessToken()!
    const instrumentKeys = instruments.map((i) => i.upstoxKey ?? `NSE_FO|${i.tradingsymbol}`).join(",")

    try {
      const url = `https://api.upstox.com/v2/market-quote/quotes?instrument_key=${encodeURIComponent(instrumentKeys)}`
      const res = await fetch(url, {
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${token}`,
        },
      })

      if (!res.ok) return results
      const json = await res.json()
      if (json.status !== "success" || !json.data) return results

      for (const inst of instruments) {
        const key = inst.upstoxKey ?? `NSE_FO|${inst.tradingsymbol}`
        const raw = json.data[key]
        if (!raw) continue

        const ltp = Number(raw.last_price ?? 0)
        const close = Number(raw.ohlc?.close ?? 0)
        const change = close > 0 ? ltp - close : 0
        const changePercent = close > 0 ? (change / close) * 100 : 0

        const q: DerivativeQuote = {
          instrument: inst,
          ltp,
          change,
          changePercent,
          open: raw.ohlc?.open ?? null,
          high: raw.ohlc?.high ?? null,
          low: raw.ohlc?.low ?? null,
          close: raw.ohlc?.close ?? null,
          volume: raw.volume ?? null,
          openInterest: raw.oi ?? null,
          openInterestChange: null,
          iv: null,
          delta: null,
          gamma: null,
          theta: null,
          vega: null,
          bid: raw.depth?.buy?.[0]?.price ?? null,
          ask: raw.depth?.sell?.[0]?.price ?? null,
          bidQty: raw.depth?.buy?.[0]?.quantity ?? null,
          askQty: raw.depth?.sell?.[0]?.quantity ?? null,
          lastTradeTime: raw.timestamp ?? null,
          timestamp: Date.now(),
          isLive: true,
          sourceProvider: this.name,
        }

        results.set(inst.canonicalSymbol, q)
      }
    } catch {}

    return results
  }

  async getOptionChain(
    request: OptionChainRequest,
    underlyingQuote: { price: number; change: number; changePercent: number; name: string }
  ): Promise<OptionChainData | null> {
    if (!this.isConfigured()) return null

    const token = this.getAccessToken()!
    const instKey = this.mapInstrumentKey(request.symbol)
    const validExpiries = getValidExpiries(request.symbol)
    const expiries = validExpiries.map((e) => e.date)
    const selectedExpiry = request.expiry ?? expiries[0]

    try {
      const url = `https://api.upstox.com/v2/option/chain?instrument_key=${encodeURIComponent(instKey)}&expiry_date=${encodeURIComponent(selectedExpiry)}`
      const res = await fetch(url, {
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${token}`,
        },
      })

      if (!res.ok) return null
      const json = await res.json()
      if (json.status !== "success" || !Array.isArray(json.data)) return null

      const contracts: OptionContract[] = []

      for (const row of json.data) {
        const strike = Number(row.strike_price)
        if (isNaN(strike)) continue

        // Call option side
        if (row.call_options) {
          const c = row.call_options
          const md = c.market_data ?? {}
          const g = c.option_greeks ?? {}

          contracts.push({
            strike,
            type: "CE",
            expiry: selectedExpiry,
            hasLiveData: md.ltp != null,
            premium: md.ltp != null ? Number(md.ltp) : null,
            iv: g.iv != null ? Number(g.iv) : null,
            delta: g.delta != null ? Number(g.delta) : null,
            gamma: g.gamma != null ? Number(g.gamma) : null,
            theta: g.theta != null ? Number(g.theta) : null,
            vega: g.vega != null ? Number(g.vega) : null,
            openInterest: md.oi != null ? Number(md.oi) : null,
            volume: md.volume != null ? Number(md.volume) : null,
            change: md.close_price && md.ltp ? Number(md.ltp) - Number(md.close_price) : null,
            changePercent:
              md.close_price && md.ltp
                ? ((Number(md.ltp) - Number(md.close_price)) / Number(md.close_price)) * 100
                : null,
            bid: md.bid_price != null ? Number(md.bid_price) : null,
            ask: md.ask_price != null ? Number(md.ask_price) : null,
            instrumentToken: c.instrument_key,
          })
        }

        // Put option side
        if (row.put_options) {
          const p = row.put_options
          const md = p.market_data ?? {}
          const g = p.option_greeks ?? {}

          contracts.push({
            strike,
            type: "PE",
            expiry: selectedExpiry,
            hasLiveData: md.ltp != null,
            premium: md.ltp != null ? Number(md.ltp) : null,
            iv: g.iv != null ? Number(g.iv) : null,
            delta: g.delta != null ? Number(g.delta) : null,
            gamma: g.gamma != null ? Number(g.gamma) : null,
            theta: g.theta != null ? Number(g.theta) : null,
            vega: g.vega != null ? Number(g.vega) : null,
            openInterest: md.oi != null ? Number(md.oi) : null,
            volume: md.volume != null ? Number(md.volume) : null,
            change: md.close_price && md.ltp ? Number(md.ltp) - Number(md.close_price) : null,
            changePercent:
              md.close_price && md.ltp
                ? ((Number(md.ltp) - Number(md.close_price)) / Number(md.close_price)) * 100
                : null,
            bid: md.bid_price != null ? Number(md.bid_price) : null,
            ask: md.ask_price != null ? Number(md.ask_price) : null,
            instrumentToken: p.instrument_key,
          })
        }
      }

      if (contracts.length === 0) return null

      const totalCallOI = contracts.filter((c) => c.type === "CE").reduce((sum, c) => sum + (c.openInterest ?? 0), 0)
      const totalPutOI = contracts.filter((c) => c.type === "PE").reduce((sum, c) => sum + (c.openInterest ?? 0), 0)
      const pcr = totalCallOI > 0 && totalPutOI > 0 ? totalPutOI / totalCallOI : null

      const resolved = resolveUnderlying(request.symbol)

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
        segment: resolved?.segment ?? "NFO",
        timestamp: Date.now(),
        notice: {
          type: "LIVE_CONFIRMED",
          title: "Live Derivative Feed Active",
          message: "Live NFO/BFO option quotes, real Greeks, and IV streaming from Upstox API v2.",
          provider: this.name,
        },
      }
    } catch {
      return null
    }
  }
}
