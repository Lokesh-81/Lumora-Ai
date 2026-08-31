// FYERS API v3 Provider Connector for Indian Derivatives & Option Chains

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

export class FyersOptionsProvider implements IDerivativeProvider {
  readonly id = "fyers"
  readonly name = "FYERS API v3"
  readonly supportedSegments: DerivativeSegment[] = ["NFO", "BFO"]

  private getAppId(): string | undefined {
    return process.env.FYERS_APP_ID || process.env.FYERS_API_KEY
  }

  private getAccessToken(): string | undefined {
    return process.env.FYERS_ACCESS_TOKEN
  }

  isConfigured(): boolean {
    return !!(this.getAppId() && this.getAccessToken())
  }

  async getHealth(): Promise<ProviderHealth> {
    const appId = this.getAppId()
    const token = this.getAccessToken()
    const missing: string[] = []
    if (!appId) missing.push("FYERS_APP_ID")
    if (!token) missing.push("FYERS_ACCESS_TOKEN")

    if (missing.length > 0) {
      return {
        id: this.id,
        name: this.name,
        isConfigured: false,
        status: "UNCONFIGURED",
        requiredEnvVars: ["FYERS_APP_ID", "FYERS_ACCESS_TOKEN"],
        missingEnvVars: missing,
        supportedSegments: this.supportedSegments,
      }
    }

    const t0 = Date.now()
    try {
      const res = await fetch("https://api-t1.fyers.in/api/v3/profile", {
        headers: {
          Authorization: `${appId}:${token}`,
        },
      })
      const latencyMs = Date.now() - t0
      if (!res.ok) {
        return {
          id: this.id,
          name: this.name,
          isConfigured: true,
          status: "AUTH_FAILED",
          requiredEnvVars: ["FYERS_APP_ID", "FYERS_ACCESS_TOKEN"],
          missingEnvVars: [],
          supportedSegments: this.supportedSegments,
          latencyMs,
          errorMessage: `FYERS Auth Failed (HTTP ${res.status}): Token may be expired.`,
          lastChecked: Date.now(),
        }
      }

      return {
        id: this.id,
        name: this.name,
        isConfigured: true,
        status: "CONNECTED",
        requiredEnvVars: ["FYERS_APP_ID", "FYERS_ACCESS_TOKEN"],
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
        requiredEnvVars: ["FYERS_APP_ID", "FYERS_ACCESS_TOKEN"],
        missingEnvVars: [],
        supportedSegments: this.supportedSegments,
        latencyMs: Date.now() - t0,
        errorMessage: err?.message ?? "Network error connecting to FYERS API",
        lastChecked: Date.now(),
      }
    }
  }

  async getQuote(instrument: ExchangeInstrument): Promise<DerivativeQuote | null> {
    if (!this.isConfigured()) return null
    return null
  }

  async getQuotes(instruments: ExchangeInstrument[]): Promise<Map<string, DerivativeQuote>> {
    const results = new Map<string, DerivativeQuote>()
    return results
  }

  async getOptionChain(
    request: OptionChainRequest,
    underlyingQuote: { price: number; change: number; changePercent: number; name: string }
  ): Promise<OptionChainData | null> {
    if (!this.isConfigured()) return null
    return null
  }
}
