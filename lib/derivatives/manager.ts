// Derivatives Market Data Manager for Lumora AI
// Manages Indian and Global derivative providers, failover, caching, and health diagnostics.

import type {
  IDerivativeProvider,
  DerivativeQuote,
  OptionChainData,
  OptionChainRequest,
  ProviderHealth,
  ExchangeInstrument,
  OptionContract,
} from "./types"
import { KiteConnectOptionsProvider } from "./providers/kite"
import { UpstoxOptionsProvider } from "./providers/upstox"
import { DhanOptionsProvider } from "./providers/dhan"
import { AngelOneSmartApiProvider } from "./providers/angelone"
import { FyersOptionsProvider } from "./providers/fyers"
import { generateOptionChainInstruments, createExchangeInstrument } from "./instruments"
import { resolveUnderlying, getValidExpiries } from "../instrument"

// In-memory cache to protect broker rate-limits and optimize responsiveness
interface CacheEntry<T> {
  data: T
  cachedAt: number
  ttl: number
}

class DerivativesManager {
  private providers: IDerivativeProvider[] = [
    new UpstoxOptionsProvider(),
    new KiteConnectOptionsProvider(),
    new DhanOptionsProvider(),
    new AngelOneSmartApiProvider(),
    new FyersOptionsProvider(),
  ]

  private chainCache = new Map<string, CacheEntry<OptionChainData>>()
  private quoteCache = new Map<string, CacheEntry<DerivativeQuote>>()

  getRegisteredProviders(): IDerivativeProvider[] {
    return this.providers
  }

  getConfiguredProviders(): IDerivativeProvider[] {
    return this.providers.filter((p) => p.isConfigured())
  }

  async getAllProviderHealth(): Promise<ProviderHealth[]> {
    return Promise.all(this.providers.map((p) => p.getHealth()))
  }

  async getActiveProviderHealth(): Promise<ProviderHealth | null> {
    const configured = this.getConfiguredProviders()
    if (configured.length === 0) return null
    return configured[0].getHealth()
  }

  /**
   * Fetches quote for a specific exchange instrument from active broker feed.
   */
  async getDerivativeQuote(instrument: ExchangeInstrument): Promise<DerivativeQuote | null> {
    const cacheKey = instrument.canonicalSymbol
    const cached = this.quoteCache.get(cacheKey)
    if (cached && Date.now() - cached.cachedAt < cached.ttl) {
      return cached.data
    }

    const configured = this.getConfiguredProviders()
    for (const provider of configured) {
      try {
        const quote = await provider.getQuote(instrument)
        if (quote && quote.isLive) {
          this.quoteCache.set(cacheKey, { data: quote, cachedAt: Date.now(), ttl: 5000 })
          return quote
        }
      } catch {
        continue
      }
    }

    return null
  }

  /**
   * Main entry point for option chain data.
   */
  async getOptionChain(
    request: OptionChainRequest,
    underlyingQuote: { price: number; change: number; changePercent: number; name: string }
  ): Promise<OptionChainData> {
    const cacheKey = `${request.symbol}:${request.expiry ?? "DEFAULT"}`
    const cached = this.chainCache.get(cacheKey)
    if (cached && Date.now() - cached.cachedAt < cached.ttl) {
      return cached.data
    }

    const configured = this.getConfiguredProviders()

    // 1. Try authenticated broker providers first
    for (const provider of configured) {
      try {
        const chain = await provider.getOptionChain(request, underlyingQuote)
        if (chain && chain.isLiveData && chain.contracts.length > 0) {
          chain.availableProviders = configured.map((p) => p.name)
          this.chainCache.set(cacheKey, { data: chain, cachedAt: Date.now(), ttl: 15000 })
          return chain
        }
      } catch {
        continue
      }
    }

    // 2. Unconfigured / Feed Unavailable fallback
    // Build real resolved exchange contracts without fabricating fake numbers
    const validExpiries = getValidExpiries(request.symbol)
    const expiries = validExpiries.map((e) => e.date)
    const selectedExpiry = request.expiry ?? expiries[0]

    const { calls, puts, atmStrike } = generateOptionChainInstruments(
      request.symbol,
      underlyingQuote.price,
      selectedExpiry,
      request.strikeCount ?? 20
    )

    const allInstruments = [...calls, ...puts]

    const contracts: OptionContract[] = allInstruments.map((inst) => ({
      strike: inst.strike,
      type: inst.optionType,
      expiry: selectedExpiry,
      hasLiveData: false,
      premium: null, // STRICTLY NULL — No fake / synthetic numbers
      iv: null,
      delta: null,
      gamma: null,
      theta: null,
      vega: null,
      openInterest: null,
      volume: null,
      change: null,
      changePercent: null,
      tradingsymbol: inst.tradingsymbol,
    }))

    const resolved = resolveUnderlying(request.symbol)
    const segment = resolved?.segment ?? (request.symbol.includes(".BO") || request.symbol.startsWith("^BSE") ? "BFO" : "NFO")

    const fallbackChain: OptionChainData = {
      symbol: request.symbol,
      underlyingSymbol: request.symbol,
      underlyingName: underlyingQuote.name,
      underlyingPrice: underlyingQuote.price,
      underlyingChange: underlyingQuote.change,
      underlyingChangePercent: underlyingQuote.changePercent,
      expiries,
      expiry: selectedExpiry,
      contracts,
      pcr: null,
      maxPain: null,
      provider: "Lumora Contract Resolver",
      isLiveData: false,
      isStructureOnly: true,
      segment,
      timestamp: Date.now(),
      availableProviders: configured.map((p) => p.name),
      notice: {
        type: "AUTHENTICATION_REQUIRED",
        title: "Contract Resolved (Feed Unavailable)",
        message:
          "Real exchange option contracts have been identified and mapped to exchange tradingsymbols. Live streaming derivative fields (LTP, OI, Volume, IV, Greeks) require broker credentials (e.g. Zerodha Kite, Upstox, Dhan HQ, or Angel One) configured in the environment.",
        actionable: "Configure Broker API",
      },
    }

    this.chainCache.set(cacheKey, { data: fallbackChain, cachedAt: Date.now(), ttl: 30000 })
    return fallbackChain
  }
}

export const derivativeManager = new DerivativesManager()
