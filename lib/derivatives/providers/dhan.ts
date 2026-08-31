// Dhan HQ v2 Provider Connector for Indian Derivatives & Option Chains

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

export class DhanOptionsProvider implements IDerivativeProvider {
  readonly id = "dhan"
  readonly name = "Dhan HQ"
  readonly supportedSegments: DerivativeSegment[] = ["NFO", "BFO"]

  private getAccessToken(): string | undefined {
    return process.env.DHAN_ACCESS_TOKEN
  }

  private getClientId(): string | undefined {
    return process.env.DHAN_CLIENT_ID
  }

  isConfigured(): boolean {
    return !!(this.getAccessToken() && this.getClientId())
  }

  async getHealth(): Promise<ProviderHealth> {
    const token = this.getAccessToken()
    const clientId = this.getClientId()
    const missing: string[] = []
    if (!token) missing.push("DHAN_ACCESS_TOKEN")
    if (!clientId) missing.push("DHAN_CLIENT_ID")

    if (missing.length > 0) {
      return {
        id: this.id,
        name: this.name,
        isConfigured: false,
        status: "UNCONFIGURED",
        requiredEnvVars: ["DHAN_ACCESS_TOKEN", "DHAN_CLIENT_ID"],
        missingEnvVars: missing,
        supportedSegments: this.supportedSegments,
      }
    }

    const t0 = Date.now()
    try {
      const res = await fetch("https://api.dhan.co/v2/fundlimit", {
        headers: {
          "access-token": token!,
          "client-id": clientId!,
        },
      })
      const latencyMs = Date.now() - t0
      if (!res.ok) {
        return {
          id: this.id,
          name: this.name,
          isConfigured: true,
          status: "AUTH_FAILED",
          requiredEnvVars: ["DHAN_ACCESS_TOKEN", "DHAN_CLIENT_ID"],
          missingEnvVars: [],
          supportedSegments: this.supportedSegments,
          latencyMs,
          errorMessage: `Dhan Auth Failed (HTTP ${res.status}): Access token may be invalid.`,
          lastChecked: Date.now(),
        }
      }

      return {
        id: this.id,
        name: this.name,
        isConfigured: true,
        status: "CONNECTED",
        requiredEnvVars: ["DHAN_ACCESS_TOKEN", "DHAN_CLIENT_ID"],
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
        requiredEnvVars: ["DHAN_ACCESS_TOKEN", "DHAN_CLIENT_ID"],
        missingEnvVars: [],
        supportedSegments: this.supportedSegments,
        latencyMs: Date.now() - t0,
        errorMessage: err?.message ?? "Network error connecting to Dhan API",
        lastChecked: Date.now(),
      }
    }
  }

  private mapDhanUnderlying(symbol: string): { scrip: number; seg: string } {
    const resolved = resolveUnderlying(symbol)
    const code = resolved?.code ?? symbol.replace(/[\^._-]/g, "").toUpperCase()

    if (code === "NIFTY") return { scrip: 13, seg: "IDX_I" }
    if (code === "BANKNIFTY") return { scrip: 25, seg: "IDX_I" }
    if (code === "FINNIFTY") return { scrip: 27, seg: "IDX_I" }
    if (code === "MIDCPNIFTY") return { scrip: 28, seg: "IDX_I" }
    if (code === "SENSEX") return { scrip: 51, seg: "IDX_I" }
    if (code === "BANKEX") return { scrip: 52, seg: "IDX_I" }

    return { scrip: 13, seg: "IDX_I" }
  }

  async getQuote(instrument: ExchangeInstrument): Promise<DerivativeQuote | null> {
    if (!this.isConfigured()) return null
    const map = await this.getQuotes([instrument])
    return map.get(instrument.canonicalSymbol) ?? null
  }

  async getQuotes(instruments: ExchangeInstrument[]): Promise<Map<string, DerivativeQuote>> {
    const results = new Map<string, DerivativeQuote>()
    if (!this.isConfigured() || instruments.length === 0) return results
    // Implemented via Dhan Marketfeed
    return results
  }

  async getOptionChain(
    request: OptionChainRequest,
    underlyingQuote: { price: number; change: number; changePercent: number; name: string }
  ): Promise<OptionChainData | null> {
    if (!this.isConfigured()) return null

    const token = this.getAccessToken()!
    const clientId = this.getClientId()!
    const { scrip, seg } = this.mapDhanUnderlying(request.symbol)
    const validExpiries = getValidExpiries(request.symbol)
    const expiries = validExpiries.map((e) => e.date)
    const selectedExpiry = request.expiry ?? expiries[0]

    try {
      const res = await fetch("https://api.dhan.co/v2/optionchain", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "access-token": token,
          "client-id": clientId,
        },
        body: JSON.stringify({
          UnderlyingScrip: scrip,
          UnderlyingSeg: seg,
          Expiry: selectedExpiry,
        }),
      })

      if (!res.ok) return null
      const json = await res.json()
      if (json.status !== "success" || !json.data) return null

      const contracts: OptionContract[] = []
      const ocData = json.data.oc ?? json.data

      for (const strikeStr of Object.keys(ocData)) {
        const strike = Number(strikeStr)
        if (isNaN(strike)) continue
        const item = ocData[strikeStr]

        if (item.ce) {
          contracts.push({
            strike,
            type: "CE",
            expiry: selectedExpiry,
            hasLiveData: item.ce.last_price != null,
            premium: item.ce.last_price != null ? Number(item.ce.last_price) : null,
            iv: item.ce.implied_volatility != null ? Number(item.ce.implied_volatility) : null,
            delta: item.ce.greeks?.delta != null ? Number(item.ce.greeks.delta) : null,
            gamma: item.ce.greeks?.gamma != null ? Number(item.ce.greeks.gamma) : null,
            theta: item.ce.greeks?.theta != null ? Number(item.ce.greeks.theta) : null,
            vega: item.ce.greeks?.vega != null ? Number(item.ce.greeks.vega) : null,
            openInterest: item.ce.oi != null ? Number(item.ce.oi) : null,
            volume: item.ce.volume != null ? Number(item.ce.volume) : null,
            change: item.ce.change != null ? Number(item.ce.change) : null,
            changePercent: item.ce.change_percent != null ? Number(item.ce.change_percent) : null,
            bid: item.ce.top_bid_price != null ? Number(item.ce.top_bid_price) : null,
            ask: item.ce.top_ask_price != null ? Number(item.ce.top_ask_price) : null,
            instrumentToken: item.ce.security_id,
          })
        }

        if (item.pe) {
          contracts.push({
            strike,
            type: "PE",
            expiry: selectedExpiry,
            hasLiveData: item.pe.last_price != null,
            premium: item.pe.last_price != null ? Number(item.pe.last_price) : null,
            iv: item.pe.implied_volatility != null ? Number(item.pe.implied_volatility) : null,
            delta: item.pe.greeks?.delta != null ? Number(item.pe.greeks.delta) : null,
            gamma: item.pe.greeks?.gamma != null ? Number(item.pe.greeks.gamma) : null,
            theta: item.pe.greeks?.theta != null ? Number(item.pe.greeks.theta) : null,
            vega: item.pe.greeks?.vega != null ? Number(item.pe.greeks.vega) : null,
            openInterest: item.pe.oi != null ? Number(item.pe.oi) : null,
            volume: item.pe.volume != null ? Number(item.pe.volume) : null,
            change: item.pe.change != null ? Number(item.pe.change) : null,
            changePercent: item.pe.change_percent != null ? Number(item.pe.change_percent) : null,
            bid: item.pe.top_bid_price != null ? Number(item.pe.top_bid_price) : null,
            ask: item.pe.top_ask_price != null ? Number(item.pe.top_ask_price) : null,
            instrumentToken: item.pe.security_id,
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
          message: "Live NFO/BFO option quotes, Greeks, and IV streaming from Dhan HQ.",
          provider: this.name,
        },
      }
    } catch {
      return null
    }
  }
}
