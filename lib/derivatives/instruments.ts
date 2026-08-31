// Exchange Instrument Master & Real Tradingsymbol Generator for Indian Derivatives
// Formats exact exchange tradingsymbols for NSE (NFO) and BSE (BFO).

import type { DerivativeSegment, ExchangeInstrument, OptionType } from "./types"
import {
  INDEX_MASTER,
  STOCK_MASTER,
  resolveUnderlying,
  getValidExpiries,
  getStrikeRulesForSymbol,
  MONTH_NAMES,
  type ExpiryOption,
} from "../instrument"

// Lot sizes for standard Indian derivatives
export const LOT_SIZES: Record<string, number> = {
  // Indices
  "^NSEI": 25, // NIFTY
  "^NSEBANK": 15, // BANKNIFTY
  "NIFTY_FIN_SERVICE.NS": 25, // FINNIFTY
  "^NSMIDCP": 50, // MIDCPNIFTY
  "^BSESN": 10, // SENSEX
  "^BSEBANK": 15, // BANKEX
  "^CNXIT": 25,
  "^CNXAUTO": 25,
  // Equities
  "RELIANCE.NS": 250,
  "TCS.NS": 175,
  "INFY.NS": 300,
  "HDFCBANK.NS": 550,
  "ICICIBANK.NS": 700,
  "SBIN.NS": 750,
  "BHARTIARTL.NS": 475,
  "LT.NS": 150,
  "ITC.NS": 1600,
  "TATAMOTORS.NS": 550,
  "AXISBANK.NS": 625,
  "KOTAKBANK.NS": 400,
  "MARUTI.NS": 50,
  "SUNPHARMA.NS": 350,
  "TITAN.NS": 175,
  "BAJFINANCE.NS": 125,
  "BAJAJFINSV.NS": 500,
  "HINDUNILVR.NS": 300,
  "ASIANPAINT.NS": 200,
  "NTPC.NS": 1500,
  "ONGC.NS": 2250,
  "POWERGRID.NS": 1800,
  "ULTRACEMCO.NS": 100,
  "HCLTECH.NS": 350,
  "WIPRO.NS": 1500,
  "ADANIENT.NS": 300,
  "ADANIPORTS.NS": 400,
  "COALINDIA.NS": 2100,
  "JSWSTEEL.NS": 675,
  "TATASTEEL.NS": 5500,
  "M&M.NS": 350,
  "TECHM.NS": 600,
  "GRASIM.NS": 250,
  "HINDALCO.NS": 1400,
  "DIVISLAB.NS": 100,
  "DRREDDY.NS": 125,
  "CIPLA.NS": 650,
  "APOLLOHOSP.NS": 125,
  "EICHERMOT.NS": 150,
  "BPCL.NS": 1800,
  "TATACONSUM.NS": 900,
  "BRITANNIA.NS": 200,
  "NESTLEIND.NS": 25,
  "SHRIRAMFIN.NS": 300,
  "TRENT.NS": 100,
  "BEL.NS": 1500,
  "HAL.NS": 150,
  "VEDL.NS": 1400,
  "ZOMATO.NS": 2000,
  "DLF.NS": 825,
}

/**
 * Formats a clean exchange tradingsymbol according to standard exchange convention.
 * Example NSE format: NIFTY26AUG24150CE, RELIANCE26AUG3000CE
 * Example BSE format: BSESENSEX26AUG77400CE or SENSEX2682877400CE
 */
export function buildExchangeTradingsymbol(
  underlyingCode: string,
  expiryDate: string,
  strike: number,
  optionType: OptionType,
  segment: DerivativeSegment
): string {
  const d = new Date(expiryDate)
  const yy = String(d.getFullYear()).slice(-2) // e.g. "26"
  const mmm = MONTH_NAMES[d.getMonth()] // e.g. "AUG"
  const cleanStrike = Number.isInteger(strike) ? String(strike) : String(strike).replace(".", "P")

  if (segment === "BFO") {
    // BSE derivatives tradingsymbol: SENSEX26AUG77400CE or BSESENSEX26AUG77400CE
    const bseCode = underlyingCode.toUpperCase().replace(/^BSE/, "")
    return `${bseCode}${yy}${mmm}${cleanStrike}${optionType}`
  }

  // NSE derivatives tradingsymbol: NIFTY26AUG24150CE
  return `${underlyingCode}${yy}${mmm}${cleanStrike}${optionType}`
}

/**
 * Builds the canonical full exchange instrument metadata.
 */
export function createExchangeInstrument(
  underlyingSymbol: string,
  strike: number,
  optionType: OptionType,
  expiryDate: string
): ExchangeInstrument {
  const resolved = resolveUnderlying(underlyingSymbol)
  const underlyingCode = resolved?.code ?? underlyingSymbol.replace(/[\^._-]/g, "").toUpperCase()
  const exchange = resolved?.exchange ?? (underlyingSymbol.includes(".BO") || underlyingSymbol.startsWith("^BSE") ? "BSE" : "NSE")
  const segment: DerivativeSegment = exchange === "BSE" ? "BFO" : "NFO"

  const tradingsymbol = buildExchangeTradingsymbol(underlyingCode, expiryDate, strike, optionType, segment)
  const canonicalSymbol = `${segment}:${tradingsymbol}`

  const d = new Date(expiryDate)
  const expiryCode = `${String(d.getFullYear()).slice(-2)}${MONTH_NAMES[d.getMonth()]}`

  return {
    exchange,
    segment,
    tradingsymbol,
    canonicalSymbol,
    upstoxKey: `${segment === "BFO" ? "BSE_FO" : "NSE_FO"}|${tradingsymbol}`,
    dhanSecurityId: `${underlyingCode}-${expiryCode}-${strike}-${optionType}`,
    fyersSymbol: `${exchange === "BSE" ? "BSE" : "NSE"}:${tradingsymbol}`,
    underlyingSymbol,
    underlyingCode,
    strike,
    optionType,
    expiry: expiryDate,
    expiryCode,
    lotSize: LOT_SIZES[underlyingSymbol] ?? 50,
    tickSize: 0.05,
  }
}

/**
 * Generates the complete strike ladder instruments for a given underlying & expiry.
 */
export function generateOptionChainInstruments(
  underlyingSymbol: string,
  spotPrice: number,
  expiryDate: string,
  rangeCount = 20
): { calls: ExchangeInstrument[]; puts: ExchangeInstrument[]; strikes: number[]; atmStrike: number } {
  const rules = getStrikeRulesForSymbol(underlyingSymbol, spotPrice)
  const step = rules.step
  const atmStrike = Math.round(spotPrice / step) * step

  const strikes: number[] = []
  for (let i = -rangeCount; i <= rangeCount; i++) {
    const s = atmStrike + i * step
    if (s >= rules.minStrike && s <= rules.maxStrike) {
      strikes.push(s)
    }
  }

  const calls: ExchangeInstrument[] = []
  const puts: ExchangeInstrument[] = []

  for (const strike of strikes) {
    calls.push(createExchangeInstrument(underlyingSymbol, strike, "CE", expiryDate))
    puts.push(createExchangeInstrument(underlyingSymbol, strike, "PE", expiryDate))
  }

  return { calls, puts, strikes, atmStrike }
}
