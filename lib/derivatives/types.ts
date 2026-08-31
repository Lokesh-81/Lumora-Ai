// Core Types for Indian & Global Derivatives Market Data Architecture

export type DerivativeSegment = "NFO" | "BFO" | "CDS" | "MCX" | "EQUITY_CASH" | "US_OPTIONS"
export type OptionType = "CE" | "PE"

export interface ExchangeInstrument {
  exchange: "NSE" | "BSE" | "NASDAQ" | "CBOE"
  segment: DerivativeSegment
  tradingsymbol: string // e.g. "NIFTY26AUG24150CE"
  canonicalSymbol: string // e.g. "NFO:NIFTY26AUG24150CE"
  instrumentToken?: string | number // e.g. "12345678" or "45214"
  upstoxKey?: string // e.g. "NSE_FO|NIFTY26AUG24150CE"
  dhanSecurityId?: string // e.g. "54321"
  fyersSymbol?: string // e.g. "NSE:NIFTY26AUG24150CE"
  underlyingSymbol: string // e.g. "^NSEI" or "RELIANCE.NS"
  underlyingCode: string // e.g. "NIFTY", "BANKNIFTY", "RELIANCE"
  strike: number
  optionType: OptionType
  expiry: string // ISO date "YYYY-MM-DD" e.g. "2026-08-27"
  expiryCode: string // e.g. "AUG" or "26AUG"
  lotSize?: number
  tickSize?: number
}

export interface DerivativeQuote {
  instrument: ExchangeInstrument
  ltp: number | null // Last Traded Price
  change: number | null
  changePercent: number | null
  open: number | null
  high: number | null
  low: number | null
  close: number | null
  volume: number | null
  openInterest: number | null
  openInterestChange?: number | null
  iv: number | null // Implied Volatility %
  delta: number | null
  gamma: number | null
  theta: number | null
  vega: number | null
  bid?: number | null
  ask?: number | null
  bidQty?: number | null
  askQty?: number | null
  lastTradeTime?: string | number | null
  timestamp: number
  isLive: boolean
  sourceProvider: string
}

export interface OptionContract {
  strike: number
  type: OptionType
  expiry: string
  hasLiveData: boolean
  premium: number | null // Real LTP
  iv: number | null
  delta: number | null
  gamma: number | null
  theta: number | null
  vega: number | null
  openInterest: number | null
  volume: number | null
  change: number | null
  changePercent: number | null
  bid?: number | null
  ask?: number | null
  instrumentToken?: string | number
  tradingsymbol?: string
  lastTradeTime?: string | number | null
}

export interface DerivativeNotice {
  type: "LIVE_CONFIRMED" | "INDIAN_DERIVATIVE_DISCLAIMER" | "UNAVAILABLE" | "AUTHENTICATION_REQUIRED"
  title: string
  message: string
  actionable?: string
  provider?: string
}

export interface OptionChainData {
  symbol: string
  underlyingSymbol: string
  underlyingName: string
  underlyingPrice: number
  underlyingChange: number
  underlyingChangePercent: number
  expiries: string[]
  expiry: string
  contracts: OptionContract[]
  pcr: number | null
  maxPain: number | null
  provider: string
  isLiveData: boolean
  isStructureOnly?: boolean
  segment?: DerivativeSegment
  notice?: DerivativeNotice
  timestamp?: number
  availableProviders?: string[]
}

export interface OptionChainRequest {
  symbol: string
  expiry?: string
  strikeCount?: number
}

export interface ProviderHealth {
  id: string
  name: string
  isConfigured: boolean
  status: "CONNECTED" | "UNCONFIGURED" | "AUTH_FAILED" | "RATE_LIMITED" | "ERROR"
  requiredEnvVars: string[]
  missingEnvVars: string[]
  supportedSegments: DerivativeSegment[]
  lastChecked?: number
  latencyMs?: number
  errorMessage?: string
}

export interface IDerivativeProvider {
  readonly id: string
  readonly name: string
  readonly supportedSegments: DerivativeSegment[]
  isConfigured(): boolean
  getHealth(): Promise<ProviderHealth>
  getQuote(instrument: ExchangeInstrument): Promise<DerivativeQuote | null>
  getQuotes(instruments: ExchangeInstrument[]): Promise<Map<string, DerivativeQuote>>
  getOptionChain(request: OptionChainRequest, underlyingQuote: { price: number; change: number; changePercent: number; name: string }): Promise<OptionChainData | null>
}
