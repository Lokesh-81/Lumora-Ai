import test from "node:test"
import assert from "node:assert/strict"
import {
  parseOptionQuery,
  getValidExpiries,
  resolveUnderlying,
  isOptionSymbol,
} from "../lib/instrument.ts"
import {
  createExchangeInstrument,
  generateOptionChainInstruments,
} from "../lib/derivatives/instruments.ts"
import { buildReasoningObject, reasoningToPrompt } from "../lib/ai/engine/reasoning.ts"
import { calculateTheoreticalOption } from "../lib/derivatives/black-scholes.ts"
import type { Quote } from "../lib/market.ts"

test("End-to-End Contract Identity & Resolution Audit", async (t) => {
  await t.test("NIFTY 24150 PE resolves with 100% exact strike and type (Anti-24350 drift check)", () => {
    const rawQuery = "NIFTY 50 24150 PE"
    const parsed = parseOptionQuery(rawQuery)

    assert.ok(parsed, `Failed to parse query: ${rawQuery}`)
    assert.equal(parsed.type, "option")
    assert.equal(parsed.underlyingCode, "NIFTY")
    assert.equal(parsed.underlyingSymbol, "^NSEI")
    assert.equal(parsed.strike, 24150, "Strike MUST be exactly 24150, NOT 24350 or ATM")
    assert.equal(parsed.optionType, "PE", "Option type MUST be PE")

    // Check exchange instrument generation
    const expiries = getValidExpiries("^NSEI")
    assert.ok(expiries.length > 0)
    const selectedExpiry = expiries[0].date

    const inst = createExchangeInstrument("^NSEI", parsed.strike, parsed.optionType, selectedExpiry)
    assert.equal(inst.strike, 24150)
    assert.equal(inst.optionType, "PE")
    assert.equal(inst.underlyingCode, "NIFTY")
    assert.ok(inst.tradingsymbol.includes("24150PE"), `Tradingsymbol ${inst.tradingsymbol} must include 24150PE`)
    assert.ok(!inst.tradingsymbol.includes("24350"), "Tradingsymbol must NEVER contain 24350")
  })

  await t.test("NIFTY 24250 CE resolves with 100% exact strike and type", () => {
    const rawQuery = "NIFTY 24250 CE"
    const parsed = parseOptionQuery(rawQuery)

    assert.ok(parsed)
    assert.equal(parsed.strike, 24250)
    assert.equal(parsed.optionType, "CE")
    assert.equal(parsed.underlyingSymbol, "^NSEI")
  })

  await t.test("BANKNIFTY 52000 PE resolves accurately", () => {
    const rawQuery = "BANKNIFTY 52000 PE"
    const parsed = parseOptionQuery(rawQuery)

    assert.ok(parsed)
    assert.equal(parsed.underlyingCode, "BANKNIFTY")
    assert.equal(parsed.underlyingSymbol, "^NSEBANK")
    assert.equal(parsed.strike, 52000)
    assert.equal(parsed.optionType, "PE")
  })

  await t.test("SENSEX 80000 CE resolves accurately", () => {
    const rawQuery = "SENSEX 80000 CE"
    const parsed = parseOptionQuery(rawQuery)

    assert.ok(parsed)
    assert.equal(parsed.underlyingCode, "SENSEX")
    assert.equal(parsed.underlyingSymbol, "^BSESN")
    assert.equal(parsed.strike, 80000)
    assert.equal(parsed.optionType, "CE")
  })

  await t.test("Single stock options (TCS, RELIANCE) preserve contract identity", () => {
    const tcsQuery = parseOptionQuery("TCS 3500 CE")
    assert.ok(tcsQuery)
    assert.equal(tcsQuery.underlyingCode, "TCS")
    assert.equal(tcsQuery.underlyingSymbol, "TCS.NS")
    assert.equal(tcsQuery.strike, 3500)
    assert.equal(tcsQuery.optionType, "CE")

    const relQuery = parseOptionQuery("RELIANCE 1300 PE")
    assert.ok(relQuery)
    assert.equal(relQuery.underlyingCode, "RELIANCE")
    assert.equal(relQuery.underlyingSymbol, "RELIANCE.NS")
    assert.equal(relQuery.strike, 1300)
    assert.equal(relQuery.optionType, "PE")
  })

  await t.test("ReasoningObject preserves derivative identity into AI prompts", () => {
    const mockDerivativeQuote: Quote = {
      symbol: "NIFTY26AUG24150PE.NFO",
      name: "NIFTY 24150 PE",
      price: 0, // Unquoted in free tier
      change: 0,
      changePercent: 0,
      previousClose: 0,
      currency: "INR",
      marketState: "REGULAR",
      exchange: "NSE",
      assetType: "OPTION",
      derivativeInfo: {
        isDerivative: true,
        tradingsymbol: "NIFTY26AUG24150PE",
        underlyingSymbol: "^NSEI",
        underlyingName: "NIFTY 50",
        underlyingPrice: 24180.5,
        underlyingChangePercent: 0.45,
        strike: 24150,
        optionType: "PE",
        expiry: "2026-08-27",
        segment: "NFO",
        hasLiveData: false,
        lotSize: 25,
      },
    }

    const mockIndicators = {
      trend: "bullish" as const,
      trendStrength: "strong" as const,
      momentum: "positive" as const,
      rsi: 58.4,
      macd: { macd: 12.3, signal: 10.1, histogram: 2.2 },
      adx: 24.5,
      atr: 120.0,
      support: 24000,
      resistance: 24400,
      ema20: 24100,
      ema50: 23950,
      ema200: 23200,
      vwap: 24160,
      bollinger: { upper: 24400, middle: 24100, lower: 23800 },
      fib: { "0.0%": 24000, "100.0%": 24500 },
    }

    const ro = buildReasoningObject(mockDerivativeQuote.symbol, mockDerivativeQuote, mockIndicators)

    assert.ok(ro.derivative, "Derivative reasoning must be present")
    assert.equal(ro.derivative.strike, 24150, "ReasoningObject must contain exact strike 24150")
    assert.equal(ro.derivative.optionType, "PE", "ReasoningObject must contain exact option type PE")
    assert.equal(ro.derivative.underlyingName, "NIFTY 50")
    assert.equal(ro.derivative.hasLiveData, false)

    const prompt = reasoningToPrompt(ro)
    assert.ok(prompt.includes("DERIVATIVE CONTRACT IDENTITY"), "Prompt must include contract identity header")
    assert.ok(prompt.includes("Selected Strike Price: 24150"), "Prompt must explicitly list 24150 strike")
    assert.ok(prompt.includes("Option Type: PE (Put)"), "Prompt must explicitly state PE (Put)")
    assert.ok(!prompt.includes("24350"), "Prompt must NEVER contain 24350")
  })

  await t.test("Black-Scholes Theoretical Model calculation integrity & provenance", () => {
    const spot = 24500
    const strike = 24150
    const daysToExpiry = 7
    const timeToExpiryYears = daysToExpiry / 365
    const volatility = 0.15
    const riskFreeRate = 0.065

    const pe = calculateTheoreticalOption(spot, strike, timeToExpiryYears, volatility, riskFreeRate, "PE")
    const ce = calculateTheoreticalOption(spot, strike, timeToExpiryYears, volatility, riskFreeRate, "CE")

    // PE properties for OTM Put (Spot 24500 > Strike 24150)
    assert.equal(pe.moneyness, "OTM")
    assert.equal(pe.intrinsicValue, 0)
    assert.ok(pe.theoreticalPrice > 0, "Theoretical price must be positive")
    assert.ok(pe.delta < 0 && pe.delta >= -1, "Put delta must be negative between -1 and 0")
    assert.ok(pe.gamma > 0, "Gamma must be positive")
    assert.ok(pe.thetaDaily < 0, "Theta decay must be negative")

    // CE properties for ITM Call (Spot 24500 > Strike 24150)
    assert.equal(ce.moneyness, "ITM")
    assert.equal(ce.intrinsicValue, 350)
    assert.ok(ce.theoreticalPrice >= 350, "ITM call theoretical price must exceed intrinsic value")
    assert.ok(ce.delta > 0 && ce.delta <= 1, "Call delta must be positive between 0 and 1")
  })
})
