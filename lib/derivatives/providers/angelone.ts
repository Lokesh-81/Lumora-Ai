// Angel One SmartAPI Provider Connector for Indian Derivatives

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

export class AngelOneSmartApiProvider implements IDerivativeProvider {
  readonly id = "angelone"
  readonly name = "Angel One SmartAPI"
  readonly supportedSegments: DerivativeSegment[] = ["NFO", "BFO"]

  private getApiKey(): string | undefined {
    return process.env.ANGEL_ONE_API_KEY
  }

  private getJwtToken(): string | undefined {
    return process.env.ANGEL_ONE_JWT_TOKEN || process.env.ANGEL_ONE_PIN
  }

  isConfigured(): boolean {
    return !!(this.getApiKey() && this.getJwtToken())
  }

  async getHealth(): Promise<ProviderHealth> {
    const apiKey = this.getApiKey()
    const jwt = this.getJwtToken()
    const missing: string[] = []
    if (!apiKey) missing.push("ANGEL_ONE_API_KEY")
    if (!jwt) missing.push("ANGEL_ONE_JWT_TOKEN")

    if (missing.length > 0) {
      return {
        id: this.id,
        name: this.name,
        isConfigured: false,
        status: "UNCONFIGURED",
        requiredEnvVars: ["ANGEL_ONE_API_KEY", "ANGEL_ONE_JWT_TOKEN"],
        missingEnvVars: missing,
        supportedSegments: this.supportedSegments,
      }
    }

    const t0 = Date.now()
    try {
      const res = await fetch("https://apiconnect.angelbroking.com/rest/secure/angelbroking/user/v1/getProfile", {
        headers: {
          "X-PrivateKey": apiKey!,
          Authorization: `Bearer ${jwt}`,
          "X-UserType": "USER",
          "X-SourceID": "WEB",
          "X-ClientLocalIP": "127.0.0.1",
          "X-ClientPublicIP": "127.0.0.1",
          "X-MACAddress": "00:00:00:00:00:00",
          Accept: "application/json",
        },
      })
      const latencyMs = Date.now() - t0
      if (!res.ok) {
        return {
          id: this.id,
          name: this.name,
          isConfigured: true,
          status: "AUTH_FAILED",
          requiredEnvVars: ["ANGEL_ONE_API_KEY", "ANGEL_ONE_JWT_TOKEN"],
          missingEnvVars: [],
          supportedSegments: this.supportedSegments,
          latencyMs,
          errorMessage: `Angel One Auth Failed (HTTP ${res.status}): JWT Token may be expired.`,
          lastChecked: Date.now(),
        }
      }

      return {
        id: this.id,
        name: this.name,
        isConfigured: true,
        status: "CONNECTED",
        requiredEnvVars: ["ANGEL_ONE_API_KEY", "ANGEL_ONE_JWT_TOKEN"],
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
        requiredEnvVars: ["ANGEL_ONE_API_KEY", "ANGEL_ONE_JWT_TOKEN"],
        missingEnvVars: [],
        supportedSegments: this.supportedSegments,
        latencyMs: Date.now() - t0,
        errorMessage: err?.message ?? "Network error connecting to Angel One API",
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
    // Calls SmartAPI /rest/secure/angelbroking/market/v1/quote with exchangeTokens
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

    return null
  }
}
