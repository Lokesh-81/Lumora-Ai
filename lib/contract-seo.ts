import {
  getStrikeRulesForSymbol,
  getValidExpiries,
  type OptionType,
  type DerivativeSegment,
} from "@/lib/instrument"

export interface SupportedUnderlyingInfo {
  slug: string
  name: string
  symbol: string
  exchange: "NSE" | "BSE" | "NASDAQ" | "NYSE"
  segment: DerivativeSegment
  step: number
  aliases: string[]
  description: string
  currency: "INR" | "USD"
  currencySymbol: "₹" | "$"
}

export const SUPPORTED_UNDERLYINGS: Record<string, SupportedUnderlyingInfo> = {
  "nifty-50": {
    slug: "nifty-50",
    name: "NIFTY 50",
    symbol: "^NSEI",
    exchange: "NSE",
    segment: "NFO",
    step: 50,
    aliases: ["nifty", "nifty50", "nse-nifty", "nifty-index"],
    description: "India's flagship benchmark index tracking the top 50 large-cap enterprises on the National Stock Exchange of India.",
    currency: "INR",
    currencySymbol: "₹",
  },
  "banknifty": {
    slug: "banknifty",
    name: "NIFTY BANK",
    symbol: "^NSEBANK",
    exchange: "NSE",
    segment: "NFO",
    step: 100,
    aliases: ["nifty-bank", "bank-nifty", "niftybank"],
    description: "The premier banking index reflecting the capital performance of the 12 most liquid Indian private and public banks.",
    currency: "INR",
    currencySymbol: "₹",
  },
  "sensex": {
    slug: "sensex",
    name: "BSE SENSEX",
    symbol: "^BSESN",
    exchange: "BSE",
    segment: "BFO",
    step: 100,
    aliases: ["bse-sensex", "bsesn", "bse30"],
    description: "The Bombay Stock Exchange flagship index tracking 30 well-established companies across Indian industrial sectors.",
    currency: "INR",
    currencySymbol: "₹",
  },
  "finnifty": {
    slug: "finnifty",
    name: "NIFTY FINANCIAL SERVICES",
    symbol: "NIFTY_FIN_SERVICE.NS",
    exchange: "NSE",
    segment: "NFO",
    step: 50,
    aliases: ["nifty-financial-services", "nifty-fin"],
    description: "Indian financial services benchmark including banks, insurance firms, asset managers, and housing finance institutions.",
    currency: "INR",
    currencySymbol: "₹",
  },
  "midcpnifty": {
    slug: "midcpnifty",
    name: "NIFTY MIDCAP SELECT",
    symbol: "^NSEMDCP50",
    exchange: "NSE",
    segment: "NFO",
    step: 25,
    aliases: ["nifty-midcap", "midcap-nifty"],
    description: "Targeted index tracking top 25 high-growth mid-capitalization leaders listed on the NSE.",
    currency: "INR",
    currencySymbol: "₹",
  },
  "reliance": {
    slug: "reliance",
    name: "Reliance Industries",
    symbol: "RELIANCE.NS",
    exchange: "NSE",
    segment: "NFO",
    step: 20,
    aliases: ["reliance-industries", "ril"],
    description: "India's largest conglomerate spanning energy, telecommunications (Jio), petrochemicals, and retail.",
    currency: "INR",
    currencySymbol: "₹",
  },
  "tcs": {
    slug: "tcs",
    name: "Tata Consultancy Services",
    symbol: "TCS.NS",
    exchange: "NSE",
    segment: "NFO",
    step: 20,
    aliases: ["tata-consultancy-services"],
    description: "Global IT services and digital transformation leader from the Tata Group.",
    currency: "INR",
    currencySymbol: "₹",
  },
  "hdfcbank": {
    slug: "hdfcbank",
    name: "HDFC Bank",
    symbol: "HDFCBANK.NS",
    exchange: "NSE",
    segment: "NFO",
    step: 10,
    aliases: ["hdfc-bank", "hdfc"],
    description: "India's largest private sector banking conglomerate and highest-weighted index component.",
    currency: "INR",
    currencySymbol: "₹",
  },
  "infy": {
    slug: "infy",
    name: "Infosys Ltd",
    symbol: "INFY.NS",
    exchange: "NSE",
    segment: "NFO",
    step: 10,
    aliases: ["infosys"],
    description: "Multinational information technology services provider offering consulting and AI business solutions.",
    currency: "INR",
    currencySymbol: "₹",
  },
  "sbin": {
    slug: "sbin",
    name: "State Bank of India",
    symbol: "SBIN.NS",
    exchange: "NSE",
    segment: "NFO",
    step: 5,
    aliases: ["state-bank-of-india", "sbi"],
    description: "India's largest public sector commercial banking institution.",
    currency: "INR",
    currencySymbol: "₹",
  },
  "aapl": {
    slug: "aapl",
    name: "Apple Inc.",
    symbol: "AAPL",
    exchange: "NASDAQ",
    segment: "US_OPTIONS",
    step: 5,
    aliases: ["apple"],
    description: "Global consumer technology and software giant based in Cupertino, California.",
    currency: "USD",
    currencySymbol: "$",
  },
  "tsla": {
    slug: "tsla",
    name: "Tesla Inc.",
    symbol: "TSLA",
    exchange: "NASDAQ",
    segment: "US_OPTIONS",
    step: 5,
    aliases: ["tesla"],
    description: "Electric vehicle manufacturing, battery energy storage, and clean technology pioneer.",
    currency: "USD",
    currencySymbol: "$",
  },
  "spy": {
    slug: "spy",
    name: "SPDR S&P 500 ETF Trust",
    symbol: "SPY",
    exchange: "NYSE",
    segment: "US_OPTIONS",
    step: 1,
    aliases: ["spdr-sp500", "sp500-etf"],
    description: "World's most liquid exchange-traded fund tracking the S&P 500 index.",
    currency: "USD",
    currencySymbol: "$",
  },
}

export interface ParsedContractRoute {
  isValid: boolean
  underlying: SupportedUnderlyingInfo
  strike: number
  optionType: OptionType
  expiryCode: string
  expiryDate: string
  expiryLabel: string
  canonicalSymbol: string
  terminalSymbol: string
  canonicalUrl: string
  isCanonicalStrike: boolean
  rejectionReason?: string
}

export function resolveUnderlyingSlug(slug: string): SupportedUnderlyingInfo | null {
  const norm = slug.toLowerCase().trim()
  if (SUPPORTED_UNDERLYINGS[norm]) {
    return SUPPORTED_UNDERLYINGS[norm]
  }
  for (const info of Object.values(SUPPORTED_UNDERLYINGS)) {
    if (info.aliases.includes(norm)) {
      return info
    }
  }
  return null
}

export function parseContractSlug(
  underlyingSlug: string,
  contractSlug: string
): ParsedContractRoute | null {
  const underlying = resolveUnderlyingSlug(underlyingSlug)
  if (!underlying) return null

  // contractSlug examples:
  // "24150-pe", "24150-ce", "aug-24150-pe", "2026-08-27-24150-ce"
  const cleanSlug = contractSlug.toLowerCase().trim()
  const match = cleanSlug.match(/^(?:([a-z0-9-]+)-)?(\d+(?:\.\d+)?)-(ce|pe|call|put)$/)
  if (!match) return null

  const [, rawExpiryPrefix, strikeStr, rawType] = match
  const strike = parseFloat(strikeStr)
  if (isNaN(strike) || strike <= 0) return null

  const optionType: OptionType = rawType === "call" || rawType === "ce" ? "CE" : "PE"

  const expiries = getValidExpiries(underlying.symbol)
  const currentExpiry = expiries[0]

  let resolvedExpiry = currentExpiry
  if (rawExpiryPrefix) {
    const pUpper = rawExpiryPrefix.toUpperCase()
    const found = expiries.find(
      (e) =>
        e.code.toUpperCase() === pUpper ||
        e.date === rawExpiryPrefix ||
        e.date.replace(/-/g, "") === rawExpiryPrefix
    )
    if (found) {
      resolvedExpiry = found
    }
  }

  const strikeRules = getStrikeRulesForSymbol(underlying.symbol)
  const isCanonicalStrike =
    strike >= strikeRules.minStrike &&
    strike <= strikeRules.maxStrike &&
    strike % strikeRules.step === 0

  const canonicalSymbol = `${underlying.segment}:${underlying.name.replace(/\s+/g, "")}-${resolvedExpiry.code}-${strike}-${optionType}`
  const terminalSymbol = canonicalSymbol
  const canonicalUrl = `https://www.lumoraai.in/options/${underlying.slug}/${strike}-${optionType.toLowerCase()}`

  return {
    isValid: true,
    underlying,
    strike,
    optionType,
    expiryCode: resolvedExpiry.code,
    expiryDate: resolvedExpiry.date,
    expiryLabel: resolvedExpiry.label,
    canonicalSymbol,
    terminalSymbol,
    canonicalUrl,
    isCanonicalStrike,
  }
}

export function computeMoneyness(
  strike: number,
  spotPrice: number,
  optionType: OptionType,
  step: number
): {
  moneyness: "ITM" | "ATM" | "OTM"
  label: string
  colorClass: string
  distancePoints: number
  distancePercent: number
} {
  const diff = strike - spotPrice
  const absDiff = Math.abs(diff)
  const distancePercent = spotPrice > 0 ? (absDiff / spotPrice) * 100 : 0

  if (absDiff <= step / 2) {
    return {
      moneyness: "ATM",
      label: "At-The-Money (ATM)",
      colorClass: "text-amber-500 bg-amber-500/10 border-amber-500/30",
      distancePoints: Math.round(absDiff * 100) / 100,
      distancePercent: Math.round(distancePercent * 100) / 100,
    }
  }

  if (optionType === "CE") {
    if (strike < spotPrice) {
      return {
        moneyness: "ITM",
        label: "In-The-Money (ITM)",
        colorClass: "text-emerald-500 bg-emerald-500/10 border-emerald-500/30",
        distancePoints: Math.round(absDiff * 100) / 100,
        distancePercent: Math.round(distancePercent * 100) / 100,
      }
    } else {
      return {
        moneyness: "OTM",
        label: "Out-of-The-Money (OTM)",
        colorClass: "text-blue-500 bg-blue-500/10 border-blue-500/30",
        distancePoints: Math.round(absDiff * 100) / 100,
        distancePercent: Math.round(distancePercent * 100) / 100,
      }
    }
  } else {
    // Put option (PE)
    if (strike > spotPrice) {
      return {
        moneyness: "ITM",
        label: "In-The-Money (ITM)",
        colorClass: "text-emerald-500 bg-emerald-500/10 border-emerald-500/30",
        distancePoints: Math.round(absDiff * 100) / 100,
        distancePercent: Math.round(distancePercent * 100) / 100,
      }
    } else {
      return {
        moneyness: "OTM",
        label: "Out-of-The-Money (OTM)",
        colorClass: "text-blue-500 bg-blue-500/10 border-blue-500/30",
        distancePoints: Math.round(absDiff * 100) / 100,
        distancePercent: Math.round(distancePercent * 100) / 100,
      }
    }
  }
}

export function getSiblingStrikes(
  underlying: SupportedUnderlyingInfo,
  centerStrike: number,
  count = 5
): Array<{
  strike: number
  callUrl: string
  putUrl: string
  isCenter: boolean
}> {
  const step = underlying.step
  const strikes: Array<{
    strike: number
    callUrl: string
    putUrl: string
    isCenter: boolean
  }> = []

  for (let i = -count; i <= count; i++) {
    const s = centerStrike + i * step
    if (s > 0) {
      strikes.push({
        strike: s,
        callUrl: `/options/${underlying.slug}/${s}-ce`,
        putUrl: `/options/${underlying.slug}/${s}-pe`,
        isCenter: i === 0,
      })
    }
  }

  return strikes
}

export const TOP_CANONICAL_CONTRACT_SLUGS = [
  // NIFTY 50 Top strikes
  { underlying: "nifty-50", contract: "24150-pe" },
  { underlying: "nifty-50", contract: "24150-ce" },
  { underlying: "nifty-50", contract: "24250-pe" },
  { underlying: "nifty-50", contract: "24250-ce" },
  { underlying: "nifty-50", contract: "24000-pe" },
  { underlying: "nifty-50", contract: "24000-ce" },
  { underlying: "nifty-50", contract: "24100-pe" },
  { underlying: "nifty-50", contract: "24100-ce" },
  { underlying: "nifty-50", contract: "24200-pe" },
  { underlying: "nifty-50", contract: "24200-ce" },
  { underlying: "nifty-50", contract: "24300-pe" },
  { underlying: "nifty-50", contract: "24300-ce" },

  // SENSEX Top strikes
  { underlying: "sensex", contract: "77400-pe" },
  { underlying: "sensex", contract: "77400-ce" },
  { underlying: "sensex", contract: "77000-pe" },
  { underlying: "sensex", contract: "77000-ce" },
  { underlying: "sensex", contract: "77500-pe" },
  { underlying: "sensex", contract: "77500-ce" },

  // BANKNIFTY Top strikes
  { underlying: "banknifty", contract: "55000-ce" },
  { underlying: "banknifty", contract: "55000-pe" },
  { underlying: "banknifty", contract: "54500-ce" },
  { underlying: "banknifty", contract: "54500-pe" },
  { underlying: "banknifty", contract: "55500-ce" },
  { underlying: "banknifty", contract: "55500-pe" },
]
