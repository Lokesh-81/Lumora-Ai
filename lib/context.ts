// Builds the grounded, data-only prompt context shared by the AI routes.
// Everything here comes from real Yahoo Finance data + locally computed
// technical indicators. The model is instructed to use ONLY this context.

import { getQuote, getChart, displayName, type Quote, type Candle } from "@/lib/market"
import { computeIndicators } from "@/lib/indicators"
import { getNews, type NewsItem } from "@/lib/news"
import { buildReasoningObject, type ReasoningObject } from "@/lib/ai/engine/reasoning"
import { computeRiskScores, type RiskScores } from "@/lib/ai/engine/risk"
import { computeConfidence, type ConfidenceResult } from "@/lib/ai/engine/confidence"
import { validateReasoningObject, type ValidationResult } from "@/lib/ai/engine/validation"
import { calculateTheoreticalOption } from "@/lib/derivatives/black-scholes"

export function fmt(n: number | null | undefined, d = 2) {
  return n == null ? "n/a" : n.toLocaleString(undefined, { minimumFractionDigits: d, maximumFractionDigits: d })
}

export function bigNum(n?: number) {
  if (n == null) return "n/a"
  if (n >= 1e12) return `${(n / 1e12).toFixed(2)}T`
  if (n >= 1e9) return `${(n / 1e9).toFixed(2)}B`
  if (n >= 1e6) return `${(n / 1e6).toFixed(2)}M`
  return n.toLocaleString()
}

export type InstrumentContext = {
  quote: Quote
  name: string
  news: NewsItem[]
  candles: Candle[]
  context: string
  reasoning: ReasoningObject
  risk: RiskScores
  confidence: ConfidenceResult
  validation: ValidationResult
}

/**
 * Fetches quote + 1y candles + news for a symbol and assembles the grounded
 * prompt context. Returns null when no market data is available.
 */
export async function buildInstrumentContext(
  symbol: string,
  opts?: { horizon?: string; newsCount?: number },
): Promise<InstrumentContext | null> {
  const [quote, candles, news] = await Promise.all([
    getQuote(symbol, { withFundamentals: true }),
    getChart(symbol, "1y", "1d"),
    getNews(symbol, opts?.newsCount ?? 8),
  ])

  if (!quote) return null

  const ind = computeIndicators(candles)
  const name = displayName(quote.symbol, quote.name)

  const fibStr = ind.fib
    ? Object.entries(ind.fib)
        .map(([k, v]) => `${k}: ${v.toFixed(2)}`)
        .join(", ")
    : "n/a"

  const newsStr = news.length
    ? news
        .slice(0, opts?.newsCount ?? 8)
        .map((n, i) => `${i + 1}. "${n.title}" — ${n.publisher} (${new Date(n.publishedAt).toISOString().slice(0, 10)})`)
        .join("\n")
    : "No recent headlines available."

  const horizonLine = opts?.horizon ? `\nTrader horizon requested: ${opts.horizon}` : ""

  let derivSection = ""
  if (quote.derivativeInfo?.isDerivative) {
    const d = quote.derivativeInfo
    if (d.hasLiveData) {
      derivSection = `
DERIVATIVE CONTRACT DETAILS (EXACT OPTION INSTRUMENT - LIVE FEED ACTIVE)
Trading Symbol: ${d.tradingsymbol || quote.symbol}
Contract Type: ${d.optionType} | Strike: ${d.strike} | Expiry: ${d.expiry}
Segment: ${d.segment} | Lot Size: ${d.lotSize ?? "n/a"}
Option Premium (LTP): ${fmt(quote.price)} (${quote.changePercent >= 0 ? "+" : ""}${quote.changePercent.toFixed(2)}% today)
Underlying Spot Price: ${d.underlyingName} (${d.underlyingSymbol}) @ ${fmt(d.underlyingPrice)}
Open Interest: ${bigNum(d.openInterest)}
Implied Volatility (IV): ${d.iv != null ? d.iv.toFixed(2) + "%" : "n/a"}
Greeks: Delta ${fmt(d.delta)}, Gamma ${fmt(d.gamma, 4)}, Theta ${fmt(d.theta)}, Vega ${fmt(d.vega)}
Bid / Ask: ${fmt(d.bid)} / ${fmt(d.ask)}
`
    } else {
      // Calculate Black-Scholes theoretical model values
      const expDate = d.expiry ? new Date(d.expiry) : new Date()
      const now = new Date()
      const diffMs = expDate.getTime() - now.getTime()
      const days = Math.max(0.5, diffMs / (1000 * 60 * 60 * 24))
      const timeToExpiryYears = days / 365
      const strikePrice = d.strike ?? 0
      const theo = calculateTheoreticalOption(
        d.underlyingPrice || 0,
        strikePrice,
        timeToExpiryYears,
        0.15,
        0.065,
        d.optionType ?? "CE"
      )

      derivSection = `
DERIVATIVE CONTRACT DETAILS (FREE MARKET-DATA MODE - SPOT GROUNDED + THEORETICAL MODEL)
Trading Symbol: ${d.tradingsymbol || quote.symbol}
Contract Type: ${d.optionType} | Strike: ${d.strike} | Expiry: ${d.expiry} (${days.toFixed(1)} days to expiration)
Segment: ${d.segment} | Underlying Name: ${d.underlyingName} (${d.underlyingSymbol})
Live Underlying Spot Price: ${fmt(d.underlyingPrice)} (${d.underlyingChangePercent != null ? (d.underlyingChangePercent >= 0 ? "+" : "") + d.underlyingChangePercent.toFixed(2) + "%" : "n/a"})
Live Exchange Option Traded LTP: UNAVAILABLE on free tier (—)
Live Exchange Open Interest (OI): UNAVAILABLE on free tier (—)
Live Exchange Implied Volatility (IV): UNAVAILABLE on free tier (—)

THEORETICAL / MODELLED METRICS (Black-Scholes Model r=6.5%, σ=15% ATM HV):
Theoretical Fair Value: ₹${theo.theoreticalPrice} [MODELLED]
Modelled Moneyness: ${theo.moneyness}
Modelled Intrinsic Value: ₹${theo.intrinsicValue}
Modelled Time Value: ₹${theo.timeValue}
Modelled Delta: ${theo.delta}
Modelled Gamma: ${theo.gamma}
Modelled Daily Theta Decay: ₹${theo.thetaDaily}
Modelled 1% Vega: ₹${theo.vega1Pct}
Modelled Break-even at Expiration: ₹${theo.breakEven}

IMPORTANT AI INSTRUCTION FOR THIS OPTION:
1. You MUST explicitly state in your analysis which fields are missing (Real Exchange LTP, Real OI, Real IV) due to the free data tier.
2. Ground your market bias in the live underlying spot price and technical structure (${d.underlyingName} @ ₹${fmt(d.underlyingPrice)}).
3. Clearly label any option pricing and Greeks analysis as THEORETICAL / MODELLED. NEVER claim they are live exchange-traded prices.
`
    }
  }

  const context = `
INSTRUMENT
Name: ${name} (${quote.symbol})
Type: ${quote.assetType ?? "n/a"} | Exchange: ${quote.exchange} | Currency: ${quote.currency}
Market status: ${quote.marketState}
Sector: ${quote.sector ?? "n/a"} | Industry: ${quote.industry ?? "n/a"}
${derivSection}
PRICE
Last: ${fmt(quote.price)} (${quote.changePercent >= 0 ? "+" : ""}${quote.changePercent.toFixed(2)}% today)
Previous close: ${fmt(quote.previousClose)} | Open: ${fmt(quote.open)}
Day range: ${fmt(quote.dayLow)} – ${fmt(quote.dayHigh)}
52-week range: ${fmt(quote.fiftyTwoWeekLow)} – ${fmt(quote.fiftyTwoWeekHigh)}
Volume: ${bigNum(quote.volume)} (avg ${bigNum(quote.avgVolume)})

FUNDAMENTALS
Market cap: ${bigNum(quote.marketCap)}
Trailing P/E: ${fmt(quote.trailingPE)} | Forward P/E: ${fmt(quote.forwardPE)}
EPS (TTM): ${fmt(quote.eps)} | Dividend yield: ${quote.dividendYield != null ? quote.dividendYield.toFixed(2) + "%" : "n/a"}
Beta: ${fmt(quote.beta)}

TECHNICALS (computed from 1y daily candles)
Trend regime: ${ind.trend} (strength: ${ind.trendStrength}, ADX ${fmt(ind.adx, 1)})
Momentum: ${ind.momentum}
RSI(14): ${fmt(ind.rsi, 1)} | Stoch RSI %K: ${ind.stochRsi ? fmt(ind.stochRsi.k, 1) : "n/a"}
MACD: ${ind.macd ? `${fmt(ind.macd.macd)} (signal ${fmt(ind.macd.signal)}, hist ${fmt(ind.macd.histogram)})` : "n/a"}
EMA 20/50/200: ${fmt(ind.ema20)} / ${fmt(ind.ema50)} / ${fmt(ind.ema200)}
SMA 50: ${fmt(ind.sma50)} | VWAP: ${fmt(ind.vwap)}
Bollinger(20,2): ${ind.bollinger ? `${fmt(ind.bollinger.lower)} – ${fmt(ind.bollinger.upper)}` : "n/a"}
ATR(14): ${fmt(ind.atr)}
Support / Resistance (60d): ${fmt(ind.support)} / ${fmt(ind.resistance)}
Fibonacci: ${fibStr}

RECENT HEADLINES
${newsStr}${horizonLine}
`.trim()

  const reasoning = buildReasoningObject(quote.symbol, quote, ind)
  const risk = computeRiskScores(reasoning)
  const confidence = computeConfidence(reasoning)
  const validation = validateReasoningObject(reasoning)

  return { quote, name, news, candles, context, reasoning, risk, confidence, validation }
}
