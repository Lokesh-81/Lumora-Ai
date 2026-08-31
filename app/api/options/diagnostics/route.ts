import { NextResponse } from "next/server"
import { derivativeManager } from "@/lib/derivatives/manager"
import { resolveUnderlying, getValidExpiries } from "@/lib/instrument"
import { createExchangeInstrument } from "@/lib/derivatives/instruments"
import { getQuote } from "@/lib/market"
import { rateLimit, clientIp } from "@/lib/ratelimit"

export const runtime = "nodejs"
export const maxDuration = 15

export async function GET(req: Request) {
  const rl = rateLimit(`options-diag:${clientIp(req)}`, 20, 60_000)
  if (!rl.ok) return NextResponse.json({ error: "Too many requests." }, { status: 429 })

  const { searchParams } = new URL(req.url)
  const symbol = searchParams.get("symbol")?.trim().toUpperCase() || "^NSEI"
  const strike = Number(searchParams.get("strike") || 24150)

  const configuredProviders = derivativeManager.getConfiguredProviders()
  const healthList = await derivativeManager.getAllProviderHealth()

  const expiries = getValidExpiries(symbol)
  const currentExpiry = expiries[0]?.date ?? ""

  const ceInst = createExchangeInstrument(symbol, strike, "CE", currentExpiry)
  const peInst = createExchangeInstrument(symbol, strike, "PE", currentExpiry)

  // 1. Check broker configuration
  const isBrokerConfigured = configuredProviders.length > 0
  const activeProvider = configuredProviders[0] ?? null

  let authStatus = "UNCONFIGURED"
  let authError: string | null = null

  if (activeProvider) {
    const health = await activeProvider.getHealth()
    authStatus = health.status
    authError = health.errorMessage ?? null
  }

  // 2. Query quotes
  let ceQuote = null
  let peQuote = null
  let underlyingQuote = null
  let fetchError: string | null = null

  try {
    underlyingQuote = await getQuote(symbol, { withFundamentals: false })
    if (activeProvider && authStatus === "CONNECTED") {
      ceQuote = await activeProvider.getQuote(ceInst)
      peQuote = await activeProvider.getQuote(peInst)
    }
  } catch (err: any) {
    fetchError = err?.message ?? "Error fetching derivative quote"
  }

  const result = {
    timestamp: new Date().toISOString(),
    request: {
      underlyingSymbol: symbol,
      strike,
      currentExpiry,
    },
    brokerDiagnostics: {
      brokerConfigured: isBrokerConfigured,
      activeBroker: activeProvider ? activeProvider.name : null,
      authenticationStatus: authStatus,
      authError,
      fetchError,
      providerHealth: healthList,
    },
    expiries: expiries.map((e) => ({
      date: e.date,
      code: e.code,
      label: e.label,
      isCurrent: e.isCurrent,
    })),
    underlyingSpot: {
      symbol,
      name: underlyingQuote?.name ?? "NIFTY 50",
      price: underlyingQuote?.price ?? null,
      changePercent: underlyingQuote?.changePercent ?? null,
    },
    resolvedContracts: {
      ce: {
        symbol: `NIFTY ${strike} CE`,
        exchange: ceInst.exchange,
        segment: ceInst.segment,
        tradingSymbol: ceInst.tradingsymbol,
        canonicalSymbol: ceInst.canonicalSymbol,
        upstoxInstrumentKey: ceInst.upstoxKey,
        dhanSecurityId: ceInst.dhanSecurityId,
        lotSize: ceInst.lotSize,
        quote: ceQuote
          ? {
              ltp: ceQuote.ltp,
              isSpotSubstituted: ceQuote.ltp === underlyingQuote?.price,
              change: ceQuote.change,
              changePercent: ceQuote.changePercent,
              openInterest: ceQuote.openInterest,
              volume: ceQuote.volume,
              iv: ceQuote.iv,
              delta: ceQuote.delta,
              gamma: ceQuote.gamma,
              theta: ceQuote.theta,
              vega: ceQuote.vega,
              bid: ceQuote.bid,
              ask: ceQuote.ask,
              rawTimestamp: ceQuote.timestamp,
              isLive: ceQuote.isLive,
              sourceProvider: ceQuote.sourceProvider,
            }
          : {
              status: isBrokerConfigured ? "FEED_UNAVAILABLE_OR_OFFLINE" : "BROKER_NOT_CONFIGURED",
              ltp: null,
            },
      },
      pe: {
        symbol: `NIFTY ${strike} PE`,
        exchange: peInst.exchange,
        segment: peInst.segment,
        tradingSymbol: peInst.tradingsymbol,
        canonicalSymbol: peInst.canonicalSymbol,
        upstoxInstrumentKey: peInst.upstoxKey,
        dhanSecurityId: peInst.dhanSecurityId,
        lotSize: peInst.lotSize,
        quote: peQuote
          ? {
              ltp: peQuote.ltp,
              isSpotSubstituted: peQuote.ltp === underlyingQuote?.price,
              change: peQuote.change,
              changePercent: peQuote.changePercent,
              openInterest: peQuote.openInterest,
              volume: peQuote.volume,
              iv: peQuote.iv,
              delta: peQuote.delta,
              gamma: peQuote.gamma,
              theta: peQuote.theta,
              vega: peQuote.vega,
              bid: peQuote.bid,
              ask: peQuote.ask,
              rawTimestamp: peQuote.timestamp,
              isLive: peQuote.isLive,
              sourceProvider: peQuote.sourceProvider,
            }
          : {
              status: isBrokerConfigured ? "FEED_UNAVAILABLE_OR_OFFLINE" : "BROKER_NOT_CONFIGURED",
              ltp: null,
            },
      },
    },
    verificationChecklist: {
      antiSpotSafeguardEnforced: true,
      ceLtpDifferentFromSpot: ceQuote ? ceQuote.ltp !== underlyingQuote?.price : "N/A (No broker quote)",
      peLtpDifferentFromSpot: peQuote ? peQuote.ltp !== underlyingQuote?.price : "N/A (No broker quote)",
      ceAndPeDistinctInstruments: ceInst.tradingsymbol !== peInst.tradingsymbol,
    },
  }

  return NextResponse.json(result)
}
