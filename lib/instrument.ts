// Generic, dynamic instrument master & derivative resolution engine for Lumora AI.
// Handles benchmark indices, equities, and options across NSE (NFO) and BSE (BFO).
// Completely dynamic strike and expiry resolution with canonical exchange instrument mapping.

export type DerivativeSegment = "NFO" | "BFO" | "CDS" | "MCX" | "EQUITY_CASH" | "US_OPTIONS"
export type OptionType = "CE" | "PE"

export interface ExpiryOption {
  code: string // e.g., "AUG" or "28AUG26"
  label: string // e.g., "27 Aug 2026 (Monthly)"
  date: string // ISO date e.g. "2026-08-27"
  isCurrent: boolean
}

export interface InstrumentStrikeRule {
  step: number
  minStrike: number
  maxStrike: number
  defaultAtm: number
}

export interface ParsedInstrument {
  type: "equity" | "index" | "crypto" | "forex" | "commodity" | "option" | "unknown"
  symbol: string // Canonical symbol (e.g. "NFO:NIFTY-AUG-24150-CE", "^NSEI", "RELIANCE.NS")
  name: string // Display name (e.g. "NIFTY 50 24150 CE", "NIFTY 50", "Reliance Industries Ltd")
  exchange?: string // "NSE" | "BSE" | "NASDAQ" | "Crypto" | "Forex" | "COMEX"
  segment?: DerivativeSegment
  raw?: string
  underlying?: string // e.g. "NIFTY 50"
  underlyingSymbol?: string // e.g. "^NSEI"
  underlyingCode?: string // e.g. "NIFTY"
  strike?: number
  optionType?: OptionType
  expiry?: string // e.g. "AUG" or "2026-08-27"
  expiryLabel?: string
  isPartial?: boolean
  isMalformed?: boolean
  rejectionReason?: string
}

/* -------------------------------------------------------------------------- */
/* Dynamic Expiry Computation                                                 */
/* -------------------------------------------------------------------------- */

export const MONTH_NAMES = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"]
export const FULL_MONTH_NAMES: Record<string, string> = {
  JANUARY: "JAN",
  FEBRUARY: "FEB",
  MARCH: "MAR",
  APRIL: "APR",
  MAY: "MAY",
  JUNE: "JUN",
  JULY: "JUL",
  AUGUST: "AUG",
  SEPTEMBER: "SEP",
  OCTOBER: "OCT",
  NOVEMBER: "NOV",
  DECEMBER: "DEC",
}

/**
 * Dynamically computes valid active monthly and near-term expiries for Indian derivatives.
 * NSE index/equity options expire on the last Thursday of the month.
 * BSE index options expire on the last Friday of the month.
 */
export function getValidExpiries(underlyingSymbol = "^NSEI"): ExpiryOption[] {
  const now = new Date()
  const todayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`
  const expiries: ExpiryOption[] = []

  const isBse =
    underlyingSymbol.startsWith("^BSE") ||
    underlyingSymbol.includes("BSESN") ||
    underlyingSymbol.includes("BSEBANK") ||
    underlyingSymbol.includes("SENSEX") ||
    underlyingSymbol.includes("BANKEX") ||
    underlyingSymbol.endsWith(".BO")

  const targetDayOfWeek = isBse ? 5 : 4 // 5 = Friday (BSE), 4 = Thursday (NSE)

  let count = 0
  for (let mOffset = 0; count < 6 && mOffset < 12; mOffset++) {
    const targetDate = new Date(now.getFullYear(), now.getMonth() + mOffset + 1, 0) // last day of month
    while (targetDate.getDay() !== targetDayOfWeek) {
      targetDate.setDate(targetDate.getDate() - 1)
    }

    const day = String(targetDate.getDate()).padStart(2, "0")
    const dateStr = `${targetDate.getFullYear()}-${String(targetDate.getMonth() + 1).padStart(2, "0")}-${day}`

    // Skip if this expiry date has already passed relative to today
    if (dateStr < todayStr) {
      continue
    }

    const monthCode = MONTH_NAMES[targetDate.getMonth()]
    const year = targetDate.getFullYear()
    const isCurrent = count === 0

    expiries.push({
      code: monthCode,
      label: `${day} ${monthCode} ${year} (${isCurrent ? "Current Monthly" : "Monthly"})`,
      date: dateStr,
      isCurrent,
    })
    count++
  }

  return expiries
}

export function getCurrentExpiryCode(underlyingSymbol = "^NSEI"): string {
  const expiries = getValidExpiries(underlyingSymbol)
  return expiries[0]?.code ?? MONTH_NAMES[new Date().getMonth()]
}

/* -------------------------------------------------------------------------- */
/* Dynamic Strike Rules & Validation                                          */
/* -------------------------------------------------------------------------- */

export const STRIKE_RULES: Record<string, InstrumentStrikeRule> = {
  // Benchmark Indices
  "^NSEI": { step: 50, minStrike: 10000, maxStrike: 45000, defaultAtm: 24500 },
  "^NSEBANK": { step: 100, minStrike: 20000, maxStrike: 95000, defaultAtm: 52000 },
  "NIFTY_FIN_SERVICE.NS": { step: 50, minStrike: 10000, maxStrike: 45000, defaultAtm: 24000 },
  "^NSMIDCP": { step: 25, minStrike: 4000, maxStrike: 25000, defaultAtm: 13000 },
  "^BSESN": { step: 100, minStrike: 30000, maxStrike: 140000, defaultAtm: 78000 },
  "^BSEBANK": { step: 100, minStrike: 20000, maxStrike: 110000, defaultAtm: 60000 },
  "^CNXIT": { step: 100, minStrike: 15000, maxStrike: 75000, defaultAtm: 42000 },
  "^CNXAUTO": { step: 100, minStrike: 10000, maxStrike: 55000, defaultAtm: 25000 },
}

/**
 * Returns dynamic strike rules for an underlying symbol (indices or equities).
 */
export function getStrikeRulesForSymbol(symbol: string, currentPrice?: number): InstrumentStrikeRule {
  if (STRIKE_RULES[symbol]) {
    const r = STRIKE_RULES[symbol]
    if (currentPrice && currentPrice > 0) {
      return {
        step: r.step,
        minStrike: Math.max(100, Math.floor(currentPrice * 0.4)),
        maxStrike: Math.ceil(currentPrice * 2.5),
        defaultAtm: Math.round(currentPrice / r.step) * r.step,
      }
    }
    return r
  }

  // Dynamic strike rule calculation for equities based on stock price
  const price = currentPrice && currentPrice > 0 ? currentPrice : 1500
  let step = 10
  if (price > 10000) step = 100
  else if (price > 5000) step = 50
  else if (price > 2500) step = 25
  else if (price > 1000) step = 20
  else if (price > 500) step = 10
  else if (price > 200) step = 5
  else step = 2.5

  const minStrike = Math.max(1, Math.floor((price * 0.1) / step) * step)
  const maxStrike = Math.max(200000, Math.ceil((price * 5.0) / step) * step)
  const defaultAtm = Math.round(price / step) * step

  return { step, minStrike, maxStrike, defaultAtm }
}

/**
 * Checks if a strike is mathematically plausible without false positive rejections.
 */
export function isValidStrike(symbol: string, strike: number, currentPrice?: number): { valid: boolean; reason?: string } {
  if (!strike || isNaN(strike) || strike <= 0) {
    return { valid: false, reason: "Strike must be a positive number." }
  }

  const rules = getStrikeRulesForSymbol(symbol, currentPrice)

  if (strike < rules.minStrike) {
    return {
      valid: false,
      reason: `Strike ${strike} is below the valid minimum boundary of ${rules.minStrike} for ${symbol}.`,
    }
  }

  if (strike > rules.maxStrike) {
    return {
      valid: false,
      reason: `Strike ${strike} exceeds the valid maximum boundary of ${rules.maxStrike} for ${symbol}.`,
    }
  }

  return { valid: true }
}

/* -------------------------------------------------------------------------- */
/* Comprehensive Index Master Dictionary                                      */
/* -------------------------------------------------------------------------- */

export interface IndexInfo {
  code: string // Canonical derivative root code (e.g. "NIFTY")
  symbol: string // Spot market Yahoo ticker (e.g. "^NSEI")
  name: string // Full display name (e.g. "NIFTY 50")
  exchange: "NSE" | "BSE"
  segment: DerivativeSegment
  strikeStep: number
  aliases: string[]
}

export const INDEX_MASTER: IndexInfo[] = [
  {
    code: "NIFTY",
    symbol: "^NSEI",
    name: "NIFTY 50",
    exchange: "NSE",
    segment: "NFO",
    strikeStep: 50,
    aliases: ["NIFTY", "NIFTY 50", "NIFTY50", "NIFTY-50", "CNX NIFTY", "^NSEI", "NSEI"],
  },
  {
    code: "BANKNIFTY",
    symbol: "^NSEBANK",
    name: "NIFTY BANK",
    exchange: "NSE",
    segment: "NFO",
    strikeStep: 100,
    aliases: ["BANKNIFTY", "BANK NIFTY", "NIFTY BANK", "BANK-NIFTY", "^NSEBANK", "NSEBANK"],
  },
  {
    code: "FINNIFTY",
    symbol: "NIFTY_FIN_SERVICE.NS",
    name: "NIFTY FINANCIAL SERVICES",
    exchange: "NSE",
    segment: "NFO",
    strikeStep: 50,
    aliases: ["FINNIFTY", "FIN NIFTY", "NIFTY FIN SERVICE", "FIN-NIFTY", "NIFTY_FIN_SERVICE.NS", "NIFTY_FIN_SERVICE"],
  },
  {
    code: "MIDCPNIFTY",
    symbol: "^NSMIDCP",
    name: "NIFTY MIDCAP SELECT",
    exchange: "NSE",
    segment: "NFO",
    strikeStep: 25,
    aliases: ["MIDCPNIFTY", "MIDCAP NIFTY", "NIFTY MIDCAP", "NIFTY NEXT 50", "^NSMIDCP", "NSMIDCP"],
  },
  {
    code: "SENSEX",
    symbol: "^BSESN",
    name: "BSE SENSEX",
    exchange: "BSE",
    segment: "BFO",
    strikeStep: 100,
    aliases: ["SENSEX", "BSE SENSEX", "BSESN", "SENSEX 30", "^BSESN"],
  },
  {
    code: "BANKEX",
    symbol: "^BSEBANK",
    name: "BSE BANKEX",
    exchange: "BSE",
    segment: "BFO",
    strikeStep: 100,
    aliases: ["BANKEX", "BSE BANKEX", "^BSEBANK", "BSEBANK"],
  },
  {
    code: "NIFTYIT",
    symbol: "^CNXIT",
    name: "NIFTY IT",
    exchange: "NSE",
    segment: "NFO",
    strikeStep: 100,
    aliases: ["NIFTY IT", "CNX IT", "NIFTYIT", "^CNXIT", "CNXIT"],
  },
  {
    code: "NIFTYAUTO",
    symbol: "^CNXAUTO",
    name: "NIFTY AUTO",
    exchange: "NSE",
    segment: "NFO",
    strikeStep: 100,
    aliases: ["NIFTY AUTO", "CNX AUTO", "NIFTYAUTO", "^CNXAUTO", "CNXAUTO"],
  },
  {
    code: "NIFTYFMCG",
    symbol: "^CNXFMCG",
    name: "NIFTY FMCG",
    exchange: "NSE",
    segment: "NFO",
    strikeStep: 100,
    aliases: ["NIFTY FMCG", "CNX FMCG", "NIFTYFMCG", "^CNXFMCG", "CNXFMCG"],
  },
  {
    code: "NIFTYPHARMA",
    symbol: "^CNXPHARMA",
    name: "NIFTY PHARMA",
    exchange: "NSE",
    segment: "NFO",
    strikeStep: 100,
    aliases: ["NIFTY PHARMA", "CNX PHARMA", "NIFTYPHARMA", "^CNXPHARMA", "CNXPHARMA"],
  },
  {
    code: "NIFTYMETAL",
    symbol: "^CNXMETAL",
    name: "NIFTY METAL",
    exchange: "NSE",
    segment: "NFO",
    strikeStep: 100,
    aliases: ["NIFTY METAL", "CNX METAL", "NIFTYMETAL", "^CNXMETAL", "CNXMETAL"],
  },
  {
    code: "NIFTYPSUBANK",
    symbol: "^CNXPSUBANK",
    name: "NIFTY PSU BANK",
    exchange: "NSE",
    segment: "NFO",
    strikeStep: 50,
    aliases: ["NIFTY PSU BANK", "PSU BANK", "^CNXPSUBANK", "CNXPSUBANK"],
  },
]

export const INDEX_MAP: Record<string, IndexInfo> = {}
for (const idx of INDEX_MASTER) {
  INDEX_MAP[idx.code.toUpperCase()] = idx
  INDEX_MAP[idx.symbol.toUpperCase()] = idx
  INDEX_MAP[idx.name.toUpperCase()] = idx
  for (const alias of idx.aliases) {
    INDEX_MAP[alias.toUpperCase()] = idx
    const noSpace = alias.replace(/[\s^._-]/g, "").toUpperCase()
    if (noSpace) INDEX_MAP[noSpace] = idx
  }
}

/* -------------------------------------------------------------------------- */
/* Comprehensive Indian Equity Master Dictionary                              */
/* -------------------------------------------------------------------------- */

export interface StockInfo {
  code: string // Clean derivative root ticker (e.g. "RELIANCE")
  symbol: string // Spot market Yahoo ticker (e.g. "RELIANCE.NS")
  name: string // Display name (e.g. "Reliance Industries Ltd")
  exchange: "NSE" | "BSE"
  segment: DerivativeSegment
  aliases: string[]
}

export const STOCK_MASTER: StockInfo[] = [
  { code: "RELIANCE", symbol: "RELIANCE.NS", name: "Reliance Industries Ltd", exchange: "NSE", segment: "NFO", aliases: ["RELIANCE", "RIL", "RELIANCE IND", "RELIANCE.NS", "RELIANCENS"] },
  { code: "TCS", symbol: "TCS.NS", name: "Tata Consultancy Services Ltd", exchange: "NSE", segment: "NFO", aliases: ["TCS", "TATA CONSULTANCY", "TCS.NS", "TCSNS"] },
  { code: "INFY", symbol: "INFY.NS", name: "Infosys Ltd", exchange: "NSE", segment: "NFO", aliases: ["INFY", "INFOSYS", "INFY.NS", "INFYNS"] },
  { code: "HDFCBANK", symbol: "HDFCBANK.NS", name: "HDFC Bank Ltd", exchange: "NSE", segment: "NFO", aliases: ["HDFCBANK", "HDFC BANK", "HDFC", "HDFCBANK.NS", "HDFCBANKNS"] },
  { code: "ICICIBANK", symbol: "ICICIBANK.NS", name: "ICICI Bank Ltd", exchange: "NSE", segment: "NFO", aliases: ["ICICIBANK", "ICICI BANK", "ICICI", "ICICIBANK.NS", "ICICIBANKNS"] },
  { code: "SBIN", symbol: "SBIN.NS", name: "State Bank of India", exchange: "NSE", segment: "NFO", aliases: ["SBIN", "SBI", "STATE BANK", "SBIN.NS", "SBINNS"] },
  { code: "BHARTIARTL", symbol: "BHARTIARTL.NS", name: "Bharti Airtel Ltd", exchange: "NSE", segment: "NFO", aliases: ["BHARTIARTL", "AIRTEL", "BHARTI AIRTEL", "BHARTIARTL.NS"] },
  { code: "LT", symbol: "LT.NS", name: "Larsen & Toubro Ltd", exchange: "NSE", segment: "NFO", aliases: ["LT", "L&T", "LARSEN", "LARSEN & TOUBRO", "LT.NS", "LTNS"] },
  { code: "ITC", symbol: "ITC.NS", name: "ITC Ltd", exchange: "NSE", segment: "NFO", aliases: ["ITC", "ITC LTD", "ITC.NS", "ITCNS"] },
  { code: "TATAMOTORS", symbol: "TATAMOTORS.NS", name: "Tata Motors Ltd", exchange: "NSE", segment: "NFO", aliases: ["TATAMOTORS", "TATA MOTORS", "TAMO", "TATAMOTORS.NS"] },
  { code: "AXISBANK", symbol: "AXISBANK.NS", name: "Axis Bank Ltd", exchange: "NSE", segment: "NFO", aliases: ["AXISBANK", "AXIS BANK", "AXIS", "AXISBANK.NS"] },
  { code: "KOTAKBANK", symbol: "KOTAKBANK.NS", name: "Kotak Mahindra Bank Ltd", exchange: "NSE", segment: "NFO", aliases: ["KOTAKBANK", "KOTAK BANK", "KOTAK", "KOTAKBANK.NS"] },
  { code: "MARUTI", symbol: "MARUTI.NS", name: "Maruti Suzuki India Ltd", exchange: "NSE", segment: "NFO", aliases: ["MARUTI", "MARUTI SUZUKI", "MARUTI.NS"] },
  { code: "SUNPHARMA", symbol: "SUNPHARMA.NS", name: "Sun Pharmaceutical Industries Ltd", exchange: "NSE", segment: "NFO", aliases: ["SUNPHARMA", "SUN PHARMA", "SUNPHARMA.NS"] },
  { code: "TITAN", symbol: "TITAN.NS", name: "Titan Company Ltd", exchange: "NSE", segment: "NFO", aliases: ["TITAN", "TITAN COMPANY", "TITAN.NS"] },
  { code: "BAJFINANCE", symbol: "BAJFINANCE.NS", name: "Bajaj Finance Ltd", exchange: "NSE", segment: "NFO", aliases: ["BAJFINANCE", "BAJAJ FINANCE", "BAJFINANCE.NS"] },
  { code: "BAJAJFINSV", symbol: "BAJAJFINSV.NS", name: "Bajaj Finserv Ltd", exchange: "NSE", segment: "NFO", aliases: ["BAJAJFINSV", "BAJAJ FINSERV", "BAJAJFINSV.NS"] },
  { code: "HINDUNILVR", symbol: "HINDUNILVR.NS", name: "Hindustan Unilever Ltd", exchange: "NSE", segment: "NFO", aliases: ["HINDUNILVR", "HUL", "HINDUSTAN UNILEVER", "HINDUNILVR.NS"] },
  { code: "ASIANPAINT", symbol: "ASIANPAINT.NS", name: "Asian Paints Ltd", exchange: "NSE", segment: "NFO", aliases: ["ASIANPAINT", "ASIAN PAINTS", "ASIANPAINT.NS"] },
  { code: "NTPC", symbol: "NTPC.NS", name: "NTPC Ltd", exchange: "NSE", segment: "NFO", aliases: ["NTPC", "NTPC.NS"] },
  { code: "ONGC", symbol: "ONGC.NS", name: "Oil & Natural Gas Corporation Ltd", exchange: "NSE", segment: "NFO", aliases: ["ONGC", "ONGC.NS"] },
  { code: "POWERGRID", symbol: "POWERGRID.NS", name: "Power Grid Corporation of India", exchange: "NSE", segment: "NFO", aliases: ["POWERGRID", "POWER GRID", "POWERGRID.NS"] },
  { code: "ULTRACEMCO", symbol: "ULTRACEMCO.NS", name: "UltraTech Cement Ltd", exchange: "NSE", segment: "NFO", aliases: ["ULTRACEMCO", "ULTRATECH CEMENT", "ULTRATECH", "ULTRACEMCO.NS"] },
  { code: "HCLTECH", symbol: "HCLTECH.NS", name: "HCL Technologies Ltd", exchange: "NSE", segment: "NFO", aliases: ["HCLTECH", "HCL TECH", "HCL", "HCLTECH.NS"] },
  { code: "WIPRO", symbol: "WIPRO.NS", name: "Wipro Ltd", exchange: "NSE", segment: "NFO", aliases: ["WIPRO", "WIPRO.NS"] },
  { code: "ADANIENT", symbol: "ADANIENT.NS", name: "Adani Enterprises Ltd", exchange: "NSE", segment: "NFO", aliases: ["ADANIENT", "ADANI ENTERPRISES", "ADANIENT.NS"] },
  { code: "ADANIPORTS", symbol: "ADANIPORTS.NS", name: "Adani Ports & SEZ Ltd", exchange: "NSE", segment: "NFO", aliases: ["ADANIPORTS", "ADANI PORTS", "ADANIPORTS.NS"] },
  { code: "COALINDIA", symbol: "COALINDIA.NS", name: "Coal India Ltd", exchange: "NSE", segment: "NFO", aliases: ["COALINDIA", "COAL INDIA", "COALINDIA.NS"] },
  { code: "JSWSTEEL", symbol: "JSWSTEEL.NS", name: "JSW Steel Ltd", exchange: "NSE", segment: "NFO", aliases: ["JSWSTEEL", "JSW STEEL", "JSWSTEEL.NS"] },
  { code: "TATASTEEL", symbol: "TATASTEEL.NS", name: "Tata Steel Ltd", exchange: "NSE", segment: "NFO", aliases: ["TATASTEEL", "TATA STEEL", "TATASTEEL.NS"] },
  { code: "M&M", symbol: "M&M.NS", name: "Mahindra & Mahindra Ltd", exchange: "NSE", segment: "NFO", aliases: ["M&M", "M_M", "MAHINDRA", "MAHINDRA & MAHINDRA", "M&M.NS", "MM.NS", "MM"] },
  { code: "TECHM", symbol: "TECHM.NS", name: "Tech Mahindra Ltd", exchange: "NSE", segment: "NFO", aliases: ["TECHM", "TECH MAHINDRA", "TECHM.NS"] },
  { code: "GRASIM", symbol: "GRASIM.NS", name: "Grasim Industries Ltd", exchange: "NSE", segment: "NFO", aliases: ["GRASIM", "GRASIM.NS"] },
  { code: "HINDALCO", symbol: "HINDALCO.NS", name: "Hindalco Industries Ltd", exchange: "NSE", segment: "NFO", aliases: ["HINDALCO", "HINDALCO.NS"] },
  { code: "DIVISLAB", symbol: "DIVISLAB.NS", name: "Divi's Laboratories Ltd", exchange: "NSE", segment: "NFO", aliases: ["DIVISLAB", "DIVIS LAB", "DIVISLAB.NS"] },
  { code: "DRREDDY", symbol: "DRREDDY.NS", name: "Dr. Reddy's Laboratories Ltd", exchange: "NSE", segment: "NFO", aliases: ["DRREDDY", "DR REDDYS", "DRREDDY.NS"] },
  { code: "CIPLA", symbol: "CIPLA.NS", name: "Cipla Ltd", exchange: "NSE", segment: "NFO", aliases: ["CIPLA", "CIPLA.NS"] },
  { code: "APOLLOHOSP", symbol: "APOLLOHOSP.NS", name: "Apollo Hospitals Enterprise Ltd", exchange: "NSE", segment: "NFO", aliases: ["APOLLOHOSP", "APOLLO HOSPITALS", "APOLLOHOSP.NS"] },
  { code: "EICHERMOT", symbol: "EICHERMOT.NS", name: "Eicher Motors Ltd", exchange: "NSE", segment: "NFO", aliases: ["EICHERMOT", "EICHER MOTORS", "ROYAL ENFIELD", "EICHERMOT.NS"] },
  { code: "BPCL", symbol: "BPCL.NS", name: "Bharat Petroleum Corporation Ltd", exchange: "NSE", segment: "NFO", aliases: ["BPCL", "BHARAT PETROLEUM", "BPCL.NS"] },
  { code: "TATACONSUM", symbol: "TATACONSUM.NS", name: "Tata Consumer Products Ltd", exchange: "NSE", segment: "NFO", aliases: ["TATACONSUM", "TATA CONSUMER", "TATACONSUM.NS"] },
  { code: "BRITANNIA", symbol: "BRITANNIA.NS", name: "Britannia Industries Ltd", exchange: "NSE", segment: "NFO", aliases: ["BRITANNIA", "BRITANNIA.NS"] },
  { code: "NESTLEIND", symbol: "NESTLEIND.NS", name: "Nestle India Ltd", exchange: "NSE", segment: "NFO", aliases: ["NESTLEIND", "NESTLE INDIA", "NESTLE", "NESTLEIND.NS"] },
  { code: "SHRIRAMFIN", symbol: "SHRIRAMFIN.NS", name: "Shriram Finance Ltd", exchange: "NSE", segment: "NFO", aliases: ["SHRIRAMFIN", "SHRIRAM FINANCE", "SHRIRAMFIN.NS"] },
  { code: "TRENT", symbol: "TRENT.NS", name: "Trent Ltd", exchange: "NSE", segment: "NFO", aliases: ["TRENT", "WESTSIDE", "ZUDIO", "TRENT.NS"] },
  { code: "BEL", symbol: "BEL.NS", name: "Bharat Electronics Ltd", exchange: "NSE", segment: "NFO", aliases: ["BEL", "BHARAT ELECTRONICS", "BEL.NS"] },
  { code: "HAL", symbol: "HAL.NS", name: "Hindustan Aeronautics Ltd", exchange: "NSE", segment: "NFO", aliases: ["HAL", "HINDUSTAN AERONAUTICS", "HAL.NS"] },
  { code: "VEDL", symbol: "VEDL.NS", name: "Vedanta Ltd", exchange: "NSE", segment: "NFO", aliases: ["VEDL", "VEDANTA", "VEDL.NS"] },
  { code: "ZOMATO", symbol: "ZOMATO.NS", name: "Zomato Ltd", exchange: "NSE", segment: "NFO", aliases: ["ZOMATO", "ZOMATO.NS"] },
  { code: "DLF", symbol: "DLF.NS", name: "DLF Ltd", exchange: "NSE", segment: "NFO", aliases: ["DLF", "DLF.NS"] },
  { code: "DMART", symbol: "DMART.NS", name: "Avenue Supermarts Ltd (DMart)", exchange: "NSE", segment: "NFO", aliases: ["DMART", "AVENUE SUPERMARTS", "DMART.NS"] },
  { code: "PIDILITIND", symbol: "PIDILITIND.NS", name: "Pidilite Industries Ltd", exchange: "NSE", segment: "NFO", aliases: ["PIDILITIND", "PIDILITE", "FEVICOL", "PIDILITIND.NS"] },
  { code: "SIEMENS", symbol: "SIEMENS.NS", name: "Siemens Ltd", exchange: "NSE", segment: "NFO", aliases: ["SIEMENS", "SIEMENS.NS"] },
  { code: "ABB", symbol: "ABB.NS", name: "ABB India Ltd", exchange: "NSE", segment: "NFO", aliases: ["ABB", "ABB INDIA", "ABB.NS"] },
  { code: "VOLTAS", symbol: "VOLTAS.NS", name: "Voltas Ltd", exchange: "NSE", segment: "NFO", aliases: ["VOLTAS", "VOLTAS.NS"] },
  { code: "COLPAL", symbol: "COLPAL.NS", name: "Colgate-Palmolive (India) Ltd", exchange: "NSE", segment: "NFO", aliases: ["COLPAL", "COLGATE", "COLPAL.NS"] },
  { code: "AMBUJACEM", symbol: "AMBUJACEM.NS", name: "Ambuja Cements Ltd", exchange: "NSE", segment: "NFO", aliases: ["AMBUJACEM", "AMBUJA CEMENT", "AMBUJACEM.NS"] },
  { code: "MUTHOOTFIN", symbol: "MUTHOOTFIN.NS", name: "Muthoot Finance Ltd", exchange: "NSE", segment: "NFO", aliases: ["MUTHOOTFIN", "MUTHOOT FINANCE", "MUTHOOTFIN.NS"] },
  { code: "NAUKRI", symbol: "NAUKRI.NS", name: "Info Edge (India) Ltd", exchange: "NSE", segment: "NFO", aliases: ["NAUKRI", "INFO EDGE", "NAUKRI.NS"] },
  { code: "HDFCLIFE", symbol: "HDFCLIFE.NS", name: "HDFC Life Insurance Company Ltd", exchange: "NSE", segment: "NFO", aliases: ["HDFCLIFE", "HDFC LIFE", "HDFCLIFE.NS"] },
  { code: "SBILIFE", symbol: "SBILIFE.NS", name: "SBI Life Insurance Company Ltd", exchange: "NSE", segment: "NFO", aliases: ["SBILIFE", "SBI LIFE", "SBILIFE.NS"] },
  { code: "ICICIPRULI", symbol: "ICICIPRULI.NS", name: "ICICI Prudential Life Insurance", exchange: "NSE", segment: "NFO", aliases: ["ICICIPRULI", "ICICI PRU LIFE", "ICICIPRULI.NS"] },
  { code: "ICICIGI", symbol: "ICICIGI.NS", name: "ICICI Lombard General Insurance", exchange: "NSE", segment: "NFO", aliases: ["ICICIGI", "ICICI LOMBARD", "ICICIGI.NS"] },
  { code: "MARICO", symbol: "MARICO.NS", name: "Marico Ltd", exchange: "NSE", segment: "NFO", aliases: ["MARICO", "PARACHUTE", "MARICO.NS"] },
  { code: "DABUR", symbol: "DABUR.NS", name: "Dabur India Ltd", exchange: "NSE", segment: "NFO", aliases: ["DABUR", "DABUR.NS"] },
  { code: "HAVELLS", symbol: "HAVELLS.NS", name: "Havells India Ltd", exchange: "NSE", segment: "NFO", aliases: ["HAVELLS", "HAVELLS.NS"] },
  { code: "GODREJCP", symbol: "GODREJCP.NS", name: "Godrej Consumer Products Ltd", exchange: "NSE", segment: "NFO", aliases: ["GODREJCP", "GODREJ CONSUMER", "GODREJCP.NS"] },
  { code: "BERGEPAINT", symbol: "BERGEPAINT.NS", name: "Berger Paints India Ltd", exchange: "NSE", segment: "NFO", aliases: ["BERGEPAINT", "BERGER PAINTS", "BERGEPAINT.NS"] },
  { code: "GAIL", symbol: "GAIL.NS", name: "GAIL (India) Ltd", exchange: "NSE", segment: "NFO", aliases: ["GAIL", "GAIL.NS"] },
  { code: "SAIL", symbol: "SAIL.NS", name: "Steel Authority of India Ltd", exchange: "NSE", segment: "NFO", aliases: ["SAIL", "SAIL.NS"] },
  { code: "BHEL", symbol: "BHEL.NS", name: "Bharat Heavy Electricals Ltd", exchange: "NSE", segment: "NFO", aliases: ["BHEL", "BHEL.NS"] },
  { code: "IRCTC", symbol: "IRCTC.NS", name: "Indian Railway Catering and Tourism Corp", exchange: "NSE", segment: "NFO", aliases: ["IRCTC", "IRCTC.NS"] },
  { code: "LIC", symbol: "LIC.NS", name: "Life Insurance Corporation of India", exchange: "NSE", segment: "NFO", aliases: ["LIC", "LICI", "LIC INDIA", "LIC.NS"] },
  { code: "LTF", symbol: "LTF.NS", name: "L&T Finance Ltd", exchange: "NSE", segment: "NFO", aliases: ["LTF", "L&TFH", "L&T FINANCE", "LTFIN", "LTF.NS"] },
  { code: "POLYCAB", symbol: "POLYCAB.NS", name: "Polycab India Ltd", exchange: "NSE", segment: "NFO", aliases: ["POLYCAB", "POLYCAB.NS"] },
  { code: "PERSISTENT", symbol: "PERSISTENT.NS", name: "Persistent Systems Ltd", exchange: "NSE", segment: "NFO", aliases: ["PERSISTENT", "PERSISTENT.NS"] },
  { code: "COFORGE", symbol: "COFORGE.NS", name: "Coforge Ltd", exchange: "NSE", segment: "NFO", aliases: ["COFORGE", "NIIT TECH", "COFORGE.NS"] },
  { code: "DIXON", symbol: "DIXON.NS", name: "Dixon Technologies Ltd", exchange: "NSE", segment: "NFO", aliases: ["DIXON", "DIXON.NS"] },
  { code: "CDSL", symbol: "CDSL.NS", name: "Central Depository Services Ltd", exchange: "NSE", segment: "NFO", aliases: ["CDSL", "CDSL.NS"] },
  { code: "MCX", symbol: "MCX.NS", name: "Multi Commodity Exchange of India", exchange: "NSE", segment: "NFO", aliases: ["MCX", "MCX.NS"] },
  { code: "BSE", symbol: "BSE.NS", name: "BSE Ltd", exchange: "NSE", segment: "NFO", aliases: ["BSE", "BOMBAY STOCK EXCHANGE", "BSE.NS"] },
  { code: "SUZLON", symbol: "SUZLON.NS", name: "Suzlon Energy Ltd", exchange: "NSE", segment: "NFO", aliases: ["SUZLON", "SUZLON.NS"] },
  { code: "RVNL", symbol: "RVNL.NS", name: "Rail Vikas Nigam Ltd", exchange: "NSE", segment: "NFO", aliases: ["RVNL", "RVNL.NS"] },
  { code: "IREDA", symbol: "IREDA.NS", name: "Indian Renewable Energy Development Agency", exchange: "NSE", segment: "NFO", aliases: ["IREDA", "IREDA.NS"] },
  { code: "MAZDOCK", symbol: "MAZDOCK.NS", name: "Mazagon Dock Shipbuilders Ltd", exchange: "NSE", segment: "NFO", aliases: ["MAZDOCK", "MAZAGON DOCK", "MAZDOCK.NS"] },
]

export const STOCK_MAP: Record<string, StockInfo> = {}
for (const stk of STOCK_MASTER) {
  STOCK_MAP[stk.code.toUpperCase()] = stk
  STOCK_MAP[stk.symbol.toUpperCase()] = stk
  STOCK_MAP[stk.name.toUpperCase()] = stk
  for (const alias of stk.aliases) {
    STOCK_MAP[alias.toUpperCase()] = stk
    const noSpace = alias.replace(/[\s^._-]/g, "").toUpperCase()
    if (noSpace) STOCK_MAP[noSpace] = stk
  }
}

/* -------------------------------------------------------------------------- */
/* Resolver Helpers                                                           */
/* -------------------------------------------------------------------------- */

export interface ResolvedUnderlying {
  code: string // Canonical root code (e.g. "NIFTY", "RELIANCE")
  symbol: string // Spot market Yahoo ticker (e.g. "^NSEI", "RELIANCE.NS")
  name: string // Display name (e.g. "NIFTY 50", "Reliance Industries Ltd")
  exchange: "NSE" | "BSE"
  segment: DerivativeSegment
  isIndex: boolean
  strikeStep: number
}

export function resolveUnderlying(input: string): ResolvedUnderlying | null {
  if (!input || typeof input !== "string") return null
  const upper = input.trim().toUpperCase()
  if (!upper) return null

  // 1. Direct Index Master lookup
  if (INDEX_MAP[upper]) {
    const idx = INDEX_MAP[upper]
    return {
      code: idx.code,
      symbol: idx.symbol,
      name: idx.name,
      exchange: idx.exchange,
      segment: idx.segment,
      isIndex: true,
      strikeStep: idx.strikeStep,
    }
  }

  // 1b. Normalized Index lookup (stripped of special characters)
  const normUpper = upper.replace(/[\s^._-]/g, "")
  if (INDEX_MAP[normUpper]) {
    const idx = INDEX_MAP[normUpper]
    return {
      code: idx.code,
      symbol: idx.symbol,
      name: idx.name,
      exchange: idx.exchange,
      segment: idx.segment,
      isIndex: true,
      strikeStep: idx.strikeStep,
    }
  }

  // 2. Direct Stock Master lookup
  if (STOCK_MAP[upper]) {
    const stk = STOCK_MAP[upper]
    return {
      code: stk.code,
      symbol: stk.symbol,
      name: stk.name,
      exchange: stk.exchange,
      segment: stk.segment,
      isIndex: false,
      strikeStep: getStrikeRulesForSymbol(stk.symbol).step,
    }
  }

  // 2b. Normalized Stock lookup
  if (STOCK_MAP[normUpper]) {
    const stk = STOCK_MAP[normUpper]
    return {
      code: stk.code,
      symbol: stk.symbol,
      name: stk.name,
      exchange: stk.exchange,
      segment: stk.segment,
      isIndex: false,
      strikeStep: getStrikeRulesForSymbol(stk.symbol).step,
    }
  }

  // 3. Explicit NSE/BSE stock ticker (e.g. "DIXON.NS", "ZOMATO.BO")
  if (/\.(NS|BO)$/i.test(upper)) {
    const bare = upper.replace(/\.(NS|BO)$/i, "").replace(/[^A-Z0-9&-]/g, "")
    const isBse = upper.endsWith(".BO")
    const suffix = isBse ? ".BO" : ".NS"
    return {
      code: bare,
      symbol: `${bare}${suffix}`,
      name: `${bare} Ltd`,
      exchange: isBse ? "BSE" : "NSE",
      segment: isBse ? "BFO" : "NFO",
      isIndex: false,
      strikeStep: 10,
    }
  }

  // 4. Single-token unmapped stock ticker fallback (no spaces, pure letters 2-10 chars, not a month)
  if (/^[A-Z&]{2,12}$/.test(upper) && !MONTH_NAMES.includes(upper) && !FULL_MONTH_NAMES[upper]) {
    return {
      code: upper,
      symbol: `${upper}.NS`,
      name: `${upper} Ltd`,
      exchange: "NSE",
      segment: "NFO",
      isIndex: false,
      strikeStep: 10,
    }
  }

  return null
}

/* -------------------------------------------------------------------------- */
/* Tokenizer & Parser for Derivative & Option Queries                         */
/* -------------------------------------------------------------------------- */

/**
 * Checks if a string is a partial derivative query (e.g. "NIFTY 24250", "24250 NIFTY", "NIFTY AUG", "BANKNIFTY 55000", "SENSEX 77400").
 */
export function isPartialDerivativeQuery(input: string): boolean {
  const raw = input.trim()
  if (!raw) return false

  // If it's already a full valid option contract, it's not partial
  const opt = parseOptionQuery(raw)
  if (opt && !opt.isPartial && opt.strike && opt.optionType) return false
  if (opt && opt.isPartial) return true

  const malformed = isMalformedDerivativeQuery(raw)
  if (malformed.malformed) return false

  const tokens = raw.toUpperCase().split(/[\s,/-]+/).filter(Boolean)
  if (tokens.length < 1 || tokens.length > 5) return false

  // Check if any token or 2-token pair resolves to an index or stock
  for (let i = 0; i < tokens.length; i++) {
    const u1 = resolveUnderlying(tokens[i])
    if (u1) {
      if (tokens.length === 1) return u1.isIndex
      const rest = tokens.filter((_, idx) => idx !== i)
      return rest.some((t) => MONTH_NAMES.includes(t) || !!FULL_MONTH_NAMES[t] || /^\d+(\.\d+)?$/.test(t) || ["CE", "PE", "CALL", "PUT"].includes(t))
    }
    if (i < tokens.length - 1) {
      const u2 = resolveUnderlying(`${tokens[i]} ${tokens[i + 1]}`)
      if (u2) {
        if (tokens.length === 2) return u2.isIndex
        const rest = tokens.filter((_, idx) => idx !== i && idx !== i + 1)
        return rest.some((t) => MONTH_NAMES.includes(t) || !!FULL_MONTH_NAMES[t] || /^\d+(\.\d+)?$/.test(t) || ["CE", "PE", "CALL", "PUT"].includes(t))
      }
    }
  }

  return false
}

/**
 * Checks if a derivative query is malformed (e.g. invalid side token or completely absurd numbers).
 */
export function isMalformedDerivativeQuery(input: string): { malformed: boolean; reason?: string } {
  const raw = input.trim().toUpperCase()
  if (!raw) return { malformed: false }

  // Check for absurd numeric strikes (> 250,000 for any Indian instrument)
  const numbers = raw.match(/\b\d+(\.\d+)?\b/g)
  if (numbers) {
    for (const numStr of numbers) {
      const n = parseFloat(numStr)
      if (n > 250000) {
        return {
          malformed: true,
          reason: `Strike ${n} exceeds maximum exchange derivative boundaries.`,
        }
      }
    }
  }

  const words = raw.split(/[\s,/-]+/).filter(Boolean)
  if (words.length >= 3) {
    // Check if any word is an invalid option side attempt (e.g. "XX", "ZZ") when underlying + strike are present
    const hasSideAttempt = words.some((w) => ["CE", "PE", "CALL", "PUT", "CALLS", "PUTS", "C", "P"].includes(w))
    const hasNumber = words.some((w) => /^\d+(\.\d+)?$/.test(w))
    if (!hasSideAttempt && hasNumber) {
      for (const w of words) {
        if (
          w.length >= 2 &&
          w.length <= 4 &&
          !/^\d+$/.test(w) &&
          !MONTH_NAMES.includes(w) &&
          !FULL_MONTH_NAMES[w] &&
          !resolveUnderlying(w) &&
          ["CEE", "PEE", "CAL", "PUTT", "CALLL", "CP", "PC"].includes(w)
        ) {
          return {
            malformed: true,
            reason: `Invalid option side '${w}'. Valid option types are CE (Call) or PE (Put).`,
          }
        }
      }
    }
  }

  return { malformed: false }
}

/**
 * Generic, dynamic Option Query Parser.
 * Resolves natural language, canonical (NFO:NIFTY-AUG-24150-CE), compact (NIFTY26AUG24150CE),
 * and arbitrary order queries (e.g. "24150 PE NIFTY", "NIFTY 50 24150 PE", "AUG 24150 PE NIFTY").
 */
export function parseOptionQuery(input: string): ParsedInstrument | null {
  if (!input || typeof input !== "string") return null
  const raw = input.trim()
  if (!raw) return null
  const upper = raw.toUpperCase()

  // 1. Check for malformed syntax first
  const malformedCheck = isMalformedDerivativeQuery(upper)
  if (malformedCheck.malformed) {
    return {
      type: "unknown",
      symbol: upper,
      name: upper,
      raw,
      isMalformed: true,
      rejectionReason: malformedCheck.reason,
    }
  }

  // 2. Canonical Format Check: "NFO:NIFTY-AUG-24150-CE", "BFO:SENSEX-AUG-77400-PE", "NFO:RELIANCE-AUG-3000-CE"
  const canonicalMatch = upper.match(/^(NFO|BFO|CDS|MCX):([A-Z0-9&-]+)-([A-Z0-9]+)-(\d+(?:\.\d+)?)-(CE|PE)$/)
  if (canonicalMatch) {
    const [, seg, undStr, expStr, strikeStr, sideStr] = canonicalMatch
    const underlying = resolveUnderlying(undStr)
    if (!underlying) return null
    const strike = parseFloat(strikeStr)
    const optionType = sideStr as OptionType
    const segment = seg as DerivativeSegment
    const expiry = expStr

    return {
      type: "option",
      symbol: `${segment}:${underlying.code}-${expiry}-${strike}-${optionType}`,
      name: `${underlying.name} ${strike} ${optionType}`,
      exchange: underlying.exchange,
      segment,
      raw,
      underlying: underlying.name,
      underlyingSymbol: underlying.symbol,
      underlyingCode: underlying.code,
      strike,
      optionType,
      expiry,
      expiryLabel: `${expiry} (Active Expiry)`,
      isPartial: false,
    }
  }

  // 3. Compact Exchange Format with Month: e.g. "NIFTY26AUG24150CE", "SENSEX26AUG77400PE", "BANKNIFTYAUG55000CE"
  const compactWithMonth = upper.match(/^([A-Z0-9&-]+?)(\d{2})?(JAN|FEB|MAR|APR|MAY|JUN|JUL|AUG|SEP|OCT|NOV|DEC)(\d+(?:\.\d+)?)(CE|PE|CALL|PUT)$/)
  if (compactWithMonth) {
    const [, undStr, , expStr, strikeStr, sideRaw] = compactWithMonth
    const underlying = resolveUnderlying(undStr)
    if (underlying) {
      const strike = parseFloat(strikeStr)
      const optionType: OptionType = sideRaw.startsWith("C") ? "CE" : "PE"
      const segment: DerivativeSegment = underlying.segment
      const expiry = expStr

      return {
        type: "option",
        symbol: `${segment}:${underlying.code}-${expiry}-${strike}-${optionType}`,
        name: `${underlying.name} ${strike} ${optionType}`,
        exchange: underlying.exchange,
        segment,
        raw,
        underlying: underlying.name,
        underlyingSymbol: underlying.symbol,
        underlyingCode: underlying.code,
        strike,
        optionType,
        expiry,
        expiryLabel: `${expiry} (Active Expiry)`,
        isPartial: false,
      }
    }
  }

  // 3b. Compact Exchange Format without Month: e.g. "NIFTY24150PE", "BANKNIFTY55000CE", "SENSEX77400PE", "TCS4500CE"
  const compactNoMonth = upper.match(/^([A-Z0-9&-]+?)(\d+(?:\.\d+)?)(CE|PE|CALL|PUT)$/)
  if (compactNoMonth) {
    const [, undStr, strikeStr, sideRaw] = compactNoMonth
    const underlying = resolveUnderlying(undStr)
    if (underlying) {
      const strike = parseFloat(strikeStr)
      const optionType: OptionType = sideRaw.startsWith("C") ? "CE" : "PE"
      const segment: DerivativeSegment = underlying.segment
      const expiry = getCurrentExpiryCode(underlying.symbol)

      return {
        type: "option",
        symbol: `${segment}:${underlying.code}-${expiry}-${strike}-${optionType}`,
        name: `${underlying.name} ${strike} ${optionType}`,
        exchange: underlying.exchange,
        segment,
        raw,
        underlying: underlying.name,
        underlyingSymbol: underlying.symbol,
        underlyingCode: underlying.code,
        strike,
        optionType,
        expiry,
        expiryLabel: `${expiry} (Active Expiry)`,
        isPartial: false,
      }
    }
  }

  // 4. Fully Order-Independent Token-based Parser
  // Handles all permutations:
  // - "NIFTY 50 AUG 24150 PE"
  // - "NIFTY 50 24150 PE"
  // - "NIFTY AUG 24150 CE"
  // - "NIFTY 24150 PE"
  // - "24150 PE NIFTY 50"
  // - "24150 PE NIFTY"
  // - "24150 NIFTY PE"
  // - "NIFTY PE 24150"
  // - "AUG 24150 PE NIFTY"
  // - "SENSEX 77400 PE"
  // - "77400 PE SENSEX"
  // - "BANKNIFTY 55000 CE"
  // - "55000 CE BANKNIFTY"
  // - "TCS 4500 CE"
  // - "4500 CE TCS"
  // - "RELIANCE 3000 CE"
  // - "3000 CE RELIANCE"

  const tokens = upper.split(/[\s,/-]+/).filter(Boolean)
  if (tokens.length === 0) return null

  // Step A: Extract Option Type (CE, PE, CALL, PUT, C, P)
  let optionType: OptionType | undefined
  let optionTypeTokenIndex = -1

  for (let i = 0; i < tokens.length; i++) {
    const t = tokens[i]
    if (["CE", "CALL", "CALLS"].includes(t)) {
      optionType = "CE"
      optionTypeTokenIndex = i
      break
    } else if (["PE", "PUT", "PUTS"].includes(t)) {
      optionType = "PE"
      optionTypeTokenIndex = i
      break
    } else if ((t === "C" || t === "P") && tokens.length > 2) {
      optionType = t === "C" ? "CE" : "PE"
      optionTypeTokenIndex = i
      break
    }
  }

  // Step B: Extract Expiry Month or Date
  let expiry: string | undefined
  let expiryTokenIndex = -1

  for (let i = 0; i < tokens.length; i++) {
    if (i === optionTypeTokenIndex) continue
    const t = tokens[i]
    if (MONTH_NAMES.includes(t)) {
      expiry = t
      expiryTokenIndex = i
      break
    } else if (FULL_MONTH_NAMES[t]) {
      expiry = FULL_MONTH_NAMES[t]
      expiryTokenIndex = i
      break
    } else if (/^\d{1,2}(JAN|FEB|MAR|APR|MAY|JUN|JUL|AUG|SEP|OCT|NOV|DEC)(?:\d{2,4})?$/.test(t)) {
      expiry = t
      expiryTokenIndex = i
      break
    } else if (/^\d{4}-\d{2}-\d{2}$/.test(t)) {
      expiry = t
      expiryTokenIndex = i
      break
    }
  }

  // Step C: Extract Underlying (Multi-word or Single-word in any order)
  const availableIndices = tokens
    .map((_, i) => i)
    .filter((i) => i !== optionTypeTokenIndex && i !== expiryTokenIndex)

  let underlyingMatch: ResolvedUnderlying | null = null
  const usedUnderlyingIndices: number[] = []

  // Check 3-word combinations
  for (let i = 0; i < availableIndices.length - 2; i++) {
    const i1 = availableIndices[i]
    const i2 = availableIndices[i + 1]
    const i3 = availableIndices[i + 2]
    if (i2 === i1 + 1 && i3 === i2 + 1) {
      const phrase = `${tokens[i1]} ${tokens[i2]} ${tokens[i3]}`
      const match = resolveUnderlying(phrase)
      if (match) {
        underlyingMatch = match
        usedUnderlyingIndices.push(i1, i2, i3)
        break
      }
    }
  }

  // Check 2-word continuous combinations
  if (!underlyingMatch) {
    for (let i = 0; i < availableIndices.length - 1; i++) {
      const i1 = availableIndices[i]
      const i2 = availableIndices[i + 1]
      if (i2 === i1 + 1) {
        const phrase = `${tokens[i1]} ${tokens[i2]}`
        const match = resolveUnderlying(phrase)
        if (match) {
          underlyingMatch = match
          usedUnderlyingIndices.push(i1, i2)
          break
        }
      }
    }
  }

  // Check 2-word non-continuous combinations (e.g. "NIFTY" and "50" separated by strike)
  if (!underlyingMatch) {
    const hasNifty = availableIndices.find((i) => tokens[i] === "NIFTY")
    const has50 = availableIndices.find((i) => tokens[i] === "50")
    if (hasNifty !== undefined && has50 !== undefined) {
      underlyingMatch = resolveUnderlying("NIFTY 50")
      if (underlyingMatch) {
        usedUnderlyingIndices.push(hasNifty, has50)
      }
    }
  }

  // Check single-word matches
  if (!underlyingMatch) {
    for (const idx of availableIndices) {
      const token = tokens[idx]
      // Skip pure numeric tokens unless they match a known ticker
      if (/^\d+(\.\d+)?$/.test(token) && token !== "50") continue
      const match = resolveUnderlying(token)
      if (match) {
        underlyingMatch = match
        usedUnderlyingIndices.push(idx)
        break
      }
    }
  }

  if (!underlyingMatch) {
    return null
  }

  // Step D: Extract Strike from remaining tokens
  const remainingForStrike = availableIndices.filter((i) => !usedUnderlyingIndices.includes(i))
  let strike: number | undefined

  for (const idx of remainingForStrike) {
    const t = tokens[idx]
    if (/^\d+(\.\d+)?$/.test(t)) {
      const num = parseFloat(t)
      // If strike not set yet, or we found a larger valid strike candidate (> 50)
      if (strike === undefined || (num > strike && num > 50)) {
        strike = num
      }
    }
  }

  // If expiry was omitted, resolve to default active expiry
  const finalExpiry = expiry || getCurrentExpiryCode(underlyingMatch.symbol)

  // Full Option Contract
  if (strike !== undefined && optionType !== undefined) {
    const segment = underlyingMatch.segment

    return {
      type: "option",
      symbol: `${segment}:${underlyingMatch.code}-${finalExpiry}-${strike}-${optionType}`,
      name: `${underlyingMatch.name} ${strike} ${optionType}`,
      exchange: underlyingMatch.exchange,
      segment,
      raw,
      underlying: underlyingMatch.name,
      underlyingSymbol: underlyingMatch.symbol,
      underlyingCode: underlyingMatch.code,
      strike,
      optionType,
      expiry: finalExpiry,
      expiryLabel: `${finalExpiry} (Active Expiry)`,
      isPartial: false,
    }
  }

  // Partial query with strike, expiry, or optionType
  if (strike !== undefined || expiry !== undefined || optionType !== undefined) {
    return {
      type: "option",
      symbol: underlyingMatch.symbol,
      name: `${underlyingMatch.name}${strike ? ` ${strike}` : ""}${expiry ? ` ${expiry}` : ""}${optionType ? ` ${optionType}` : ""}`,
      exchange: underlyingMatch.exchange,
      segment: underlyingMatch.segment,
      raw,
      underlying: underlyingMatch.name,
      underlyingSymbol: underlyingMatch.symbol,
      underlyingCode: underlyingMatch.code,
      strike,
      optionType,
      expiry: finalExpiry,
      isPartial: true,
    }
  }

  return null
}

/**
 * Universal Instrument Parser for Lumora AI.
 * Handles Equities, Indices, Options, Crypto, Forex, and Commodities.
 */
export function parseInstrument(input: string): ParsedInstrument {
  if (!input || typeof input !== "string") {
    return { type: "unknown", symbol: "", name: "" }
  }

  const raw = input.trim()
  const upper = raw.toUpperCase()

  // 1. Try parsing as an option or derivative first
  const optParsed = parseOptionQuery(raw)
  if (optParsed) {
    return optParsed
  }

  // 2. Check for malformed query
  const malformed = isMalformedDerivativeQuery(raw)
  if (malformed.malformed) {
    return {
      type: "unknown",
      symbol: upper,
      name: upper,
      raw,
      isMalformed: true,
      rejectionReason: malformed.reason,
    }
  }

  // 3. Check Crypto
  if (upper.startsWith("BTC") || upper === "BITCOIN") return { type: "crypto", symbol: "BTC-USD", name: "Bitcoin", exchange: "Crypto" }
  if (upper.startsWith("ETH") || upper === "ETHEREUM") return { type: "crypto", symbol: "ETH-USD", name: "Ethereum", exchange: "Crypto" }
  if (upper.startsWith("SOL") || upper === "SOLANA") return { type: "crypto", symbol: "SOL-USD", name: "Solana", exchange: "Crypto" }
  if (upper.endsWith("-USD") || upper.endsWith("USDT")) return { type: "crypto", symbol: upper, name: upper, exchange: "Crypto" }

  // 4. Check Forex
  if (["USDINR", "USD/INR", "INR=X"].includes(upper)) return { type: "forex", symbol: "INR=X", name: "USD/INR", exchange: "Forex" }
  if (["EURUSD", "EUR/USD", "EURUSD=X"].includes(upper)) return { type: "forex", symbol: "EURUSD=X", name: "EUR/USD", exchange: "Forex" }

  // 5. Check Commodities
  if (["GOLD", "GC=F"].includes(upper)) return { type: "commodity", symbol: "GC=F", name: "Gold Futures", exchange: "COMEX" }
  if (["SILVER", "SI=F"].includes(upper)) return { type: "commodity", symbol: "SI=F", name: "Silver Futures", exchange: "COMEX" }
  if (["CRUDE", "CRUDE OIL", "CL=F"].includes(upper)) return { type: "commodity", symbol: "CL=F", name: "Crude Oil Futures", exchange: "NYMEX" }

  // 6. Check Known Indices
  const indexMatch = resolveUnderlying(upper)
  if (indexMatch && indexMatch.isIndex) {
    return {
      type: "index",
      symbol: indexMatch.symbol,
      name: indexMatch.name,
      exchange: indexMatch.exchange,
      segment: indexMatch.segment,
    }
  }

  // 7. Check Known Indian Stocks
  if (indexMatch && !indexMatch.isIndex) {
    return {
      type: "equity",
      symbol: indexMatch.symbol,
      name: indexMatch.name,
      exchange: indexMatch.exchange,
    }
  }

  // 8. Global Major US Equities / Indices
  if (["AAPL", "APPLE"].includes(upper)) return { type: "equity", symbol: "AAPL", name: "Apple Inc.", exchange: "NASDAQ" }
  if (["MSFT", "MICROSOFT"].includes(upper)) return { type: "equity", symbol: "MSFT", name: "Microsoft Corp.", exchange: "NASDAQ" }
  if (["GOOGL", "GOOG", "ALPHABET", "GOOGLE"].includes(upper)) return { type: "equity", symbol: "GOOGL", name: "Alphabet Inc.", exchange: "NASDAQ" }
  if (["AMZN", "AMAZON"].includes(upper)) return { type: "equity", symbol: "AMZN", name: "Amazon.com Inc.", exchange: "NASDAQ" }
  if (["NVDA", "NVIDIA"].includes(upper)) return { type: "equity", symbol: "NVDA", name: "NVIDIA Corp.", exchange: "NASDAQ" }
  if (["TSLA", "TESLA"].includes(upper)) return { type: "equity", symbol: "TSLA", name: "Tesla Inc.", exchange: "NASDAQ" }
  if (["META", "FACEBOOK"].includes(upper)) return { type: "equity", symbol: "META", name: "Meta Platforms Inc.", exchange: "NASDAQ" }
  if (["^GSPC", "S&P 500", "SPX", "SP500"].includes(upper)) return { type: "index", symbol: "^GSPC", name: "S&P 500", exchange: "US" }
  if (["^IXIC", "NASDAQ", "COMPOSITE"].includes(upper)) return { type: "index", symbol: "^IXIC", name: "NASDAQ Composite", exchange: "US" }
  if (["^DJI", "DOW", "DJIA"].includes(upper)) return { type: "index", symbol: "^DJI", name: "Dow Jones Industrial Average", exchange: "US" }

  // 9. Bare Ticker Fallback
  if (/^[A-Z0-9&-]{1,10}$/.test(upper)) {
    return {
      type: "equity",
      symbol: upper,
      name: upper,
      exchange: "US",
    }
  }

  return {
    type: "unknown",
    symbol: upper,
    name: upper,
    raw,
  }
}

/* -------------------------------------------------------------------------- */
/* Dynamic Option Contract Suggestion Engine                                  */
/* -------------------------------------------------------------------------- */

export interface OptionSuggestion {
  symbol: string
  name: string
  exchange: string
  type: string
  strike?: number
  expiry?: string
  optionType?: OptionType
  segment?: DerivativeSegment
  underlyingSymbol?: string
  underlyingName?: string
}

/**
 * Suggests valid option contracts dynamically based on user query.
 */
export function suggestOptionContracts(query: string, count = 6): OptionSuggestion[] {
  const q = query.trim().toUpperCase()
  if (!q) return []

  const malformed = isMalformedDerivativeQuery(q)
  if (malformed.malformed) return []

  // 1. If query is already a full option contract (e.g. "NIFTY 50 AUG 24150 CE", "NIFTY 24150 CE", "24150 PE NIFTY")
  const fullParsed = parseOptionQuery(q)
  if (fullParsed && !fullParsed.isPartial && fullParsed.strike && fullParsed.optionType && fullParsed.underlyingSymbol) {
    const expiries = getValidExpiries(fullParsed.underlyingSymbol)
    const suggestions: OptionSuggestion[] = []

    // A. Active/requested expiry with exact strike & type
    for (const exp of expiries.slice(0, 3)) {
      const code = fullParsed.underlyingCode ?? "NIFTY"
      const sym = `${fullParsed.segment}:${code}-${exp.code}-${fullParsed.strike}-${fullParsed.optionType}`
      suggestions.push({
        symbol: sym,
        name: `${fullParsed.underlying} ${fullParsed.strike} ${fullParsed.optionType} (${exp.code})`,
        exchange: fullParsed.exchange ?? "NSE",
        type: "option",
        strike: fullParsed.strike,
        expiry: exp.code,
        optionType: fullParsed.optionType,
        segment: fullParsed.segment,
        underlyingSymbol: fullParsed.underlyingSymbol,
        underlyingName: fullParsed.underlying,
      })
    }

    // B. Also add opposite side for the primary expiry
    const oppSide: OptionType = fullParsed.optionType === "CE" ? "PE" : "CE"
    const primExp = fullParsed.expiry || expiries[0]?.code || "AUG"
    const oppSym = `${fullParsed.segment}:${fullParsed.underlyingCode ?? "NIFTY"}-${primExp}-${fullParsed.strike}-${oppSide}`
    suggestions.push({
      symbol: oppSym,
      name: `${fullParsed.underlying} ${fullParsed.strike} ${oppSide} (${primExp})`,
      exchange: fullParsed.exchange ?? "NSE",
      type: "option",
      strike: fullParsed.strike,
      expiry: primExp,
      optionType: oppSide,
      segment: fullParsed.segment,
      underlyingSymbol: fullParsed.underlyingSymbol,
      underlyingName: fullParsed.underlying,
    })

    return suggestions
  }

  // 2. Token extraction for partial queries (e.g. "NIFTY 24150", "24150 NIFTY", "NIFTY", "SENSEX 77400")
  const tokens = q.split(/[\s,/-]+/).filter(Boolean)
  if (tokens.length === 0) return []

  let underlying: ResolvedUnderlying | null = null
  let usedIndices: number[] = []

  // Check 2-word combinations first
  for (let i = 0; i < tokens.length - 1; i++) {
    const twoWord = `${tokens[i]} ${tokens[i + 1]}`
    const match = resolveUnderlying(twoWord)
    if (match) {
      underlying = match
      usedIndices.push(i, i + 1)
      break
    }
  }

  // Check single words
  if (!underlying) {
    for (let i = 0; i < tokens.length; i++) {
      if (/^\d+(\.\d+)?$/.test(tokens[i]) && tokens[i] !== "50") continue
      const match = resolveUnderlying(tokens[i])
      if (match) {
        underlying = match
        usedIndices.push(i)
        break
      }
    }
  }

  if (!underlying) return []

  let explicitStrike: number | undefined
  let explicitSide: OptionType | undefined

  for (let i = 0; i < tokens.length; i++) {
    if (usedIndices.includes(i)) continue
    const t = tokens[i]
    if (["CE", "CALL", "CALLS"].includes(t)) explicitSide = "CE"
    else if (["PE", "PUT", "PUTS"].includes(t)) explicitSide = "PE"
    else if (/^\d+(\.\d+)?$/.test(t)) {
      const num = parseFloat(t)
      if (explicitStrike === undefined || (num > explicitStrike && num > 50)) {
        explicitStrike = num
      }
    }
  }

  const rules = getStrikeRulesForSymbol(underlying.symbol)
  const defaultExpiry = getCurrentExpiryCode(underlying.symbol)
  const suggestions: OptionSuggestion[] = []

  // Case A: User provided a specific strike (e.g. 24150, 55000, 77400, 4500, 3000)
  if (explicitStrike !== undefined) {
    const sides: OptionType[] = explicitSide ? [explicitSide] : ["CE", "PE"]
    for (const side of sides) {
      suggestions.push({
        symbol: `${underlying.segment}:${underlying.code}-${defaultExpiry}-${explicitStrike}-${side}`,
        name: `${underlying.name} ${explicitStrike} ${side} (${defaultExpiry})`,
        exchange: underlying.exchange,
        type: "option",
        strike: explicitStrike,
        expiry: defaultExpiry,
        optionType: side,
        segment: underlying.segment,
        underlyingSymbol: underlying.symbol,
        underlyingName: underlying.name,
      })
    }
    // Also include adjacent strikes for context
    const step = rules.step
    for (const offset of [-step, step]) {
      const st = explicitStrike + offset
      if (st > 0) {
        for (const side of sides) {
          if (suggestions.length >= count) break
          suggestions.push({
            symbol: `${underlying.segment}:${underlying.code}-${defaultExpiry}-${st}-${side}`,
            name: `${underlying.name} ${st} ${side} (${defaultExpiry})`,
            exchange: underlying.exchange,
            type: "option",
            strike: st,
            expiry: defaultExpiry,
            optionType: side,
            segment: underlying.segment,
            underlyingSymbol: underlying.symbol,
            underlyingName: underlying.name,
          })
        }
      }
    }
    return suggestions
  }

  // Case B: No specific strike -> Generate ATM ladder
  const atm = rules.defaultAtm
  const step = rules.step
  const strikes = [atm, atm + step, atm - step, atm + step * 2, atm - step * 2]

  for (const st of strikes) {
    if (suggestions.length >= count) break
    const sides: OptionType[] = explicitSide ? [explicitSide] : ["CE", "PE"]
    for (const side of sides) {
      if (suggestions.length >= count) break
      suggestions.push({
        symbol: `${underlying.segment}:${underlying.code}-${defaultExpiry}-${st}-${side}`,
        name: `${underlying.name} ${st} ${side} (${defaultExpiry})`,
        exchange: underlying.exchange,
        type: "option",
        strike: st,
        expiry: defaultExpiry,
        optionType: side,
        segment: underlying.segment,
        underlyingSymbol: underlying.symbol,
        underlyingName: underlying.name,
      })
    }
  }

  return suggestions
}

/* -------------------------------------------------------------------------- */
/* Curated Search Catalog Helper                                              */
/* -------------------------------------------------------------------------- */

export function searchCatalogSymbols(query: string): Array<{ symbol: string; name: string; exchange: string; type: string }> {
  const q = query.trim().toUpperCase()
  if (!q) return []

  const results: Array<{ symbol: string; name: string; exchange: string; type: string }> = []
  const seen = new Set<string>()

  // 1. Search indices
  for (const idx of INDEX_MASTER) {
    if (
      idx.code.toUpperCase().includes(q) ||
      idx.symbol.toUpperCase().includes(q) ||
      idx.name.toUpperCase().includes(q) ||
      idx.aliases.some((a) => a.toUpperCase().includes(q))
    ) {
      if (!seen.has(idx.symbol)) {
        seen.add(idx.symbol)
        results.push({
          symbol: idx.symbol,
          name: idx.name,
          exchange: idx.exchange,
          type: "index",
        })
      }
    }
  }

  // 2. Search Indian stocks
  for (const stk of STOCK_MASTER) {
    if (
      stk.code.toUpperCase().includes(q) ||
      stk.symbol.toUpperCase().includes(q) ||
      stk.name.toUpperCase().includes(q) ||
      stk.aliases.some((a) => a.toUpperCase().includes(q))
    ) {
      if (!seen.has(stk.symbol)) {
        seen.add(stk.symbol)
        results.push({
          symbol: stk.symbol,
          name: stk.name,
          exchange: stk.exchange,
          type: "equity",
        })
      }
    }
  }

  return results
}
