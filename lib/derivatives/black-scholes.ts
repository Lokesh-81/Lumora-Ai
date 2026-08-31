// Black-Scholes Theoretical Option Pricing & Greeks Model
// Used strictly for "THEORETICAL / MODELLED" derived analytics
// NEVER labeled as Exchange Traded LTP, Real OI, or Live Exchange IV.

export interface TheoreticalOptionResult {
  theoreticalPrice: number
  delta: number
  gamma: number
  thetaDaily: number
  vega1Pct: number
  rho: number
  moneyness: "ITM" | "ATM" | "OTM"
  intrinsicValue: number
  timeValue: number
  breakEven: number
}

function erf(x: number): number {
  // Abramowitz and Stegun formula 7.1.26
  const a1 = 0.254829592
  const a2 = -0.284496736
  const a3 = 1.421413741
  const a4 = -1.453152027
  const a5 = 1.061405429
  const p = 0.3275911

  const sign = x < 0 ? -1 : 1
  const absX = Math.abs(x)

  const t = 1.0 / (1.0 + p * absX)
  const y = 1.0 - (((((a5 * t + a4) * t + a3) * t + a2) * t + a1) * t) * Math.exp(-absX * absX)

  return sign * y
}

function normalCdf(x: number): number {
  return 0.5 * (1.0 + erf(x / Math.SQRT2))
}

function normalPdf(x: number): number {
  return (1.0 / Math.sqrt(2.0 * Math.PI)) * Math.exp(-0.5 * x * x)
}

/**
 * Calculates theoretical option price and Greeks using Black-Scholes formula.
 * @param spot Underlying current spot price
 * @param strike Strike price of the option contract
 * @param timeToExpiryYears Time to expiration in years (e.g. days / 365)
 * @param volatility Annualized volatility (e.g. 0.15 for 15%)
 * @param riskFreeRate Annualized risk-free rate (default 0.065 = 6.5% benchmark T-bill rate)
 * @param type "CE" (Call) or "PE" (Put)
 */
export function calculateTheoreticalOption(
  spot: number,
  strike: number,
  timeToExpiryYears: number,
  volatility = 0.15,
  riskFreeRate = 0.065,
  type: "CE" | "PE" = "CE"
): TheoreticalOptionResult {
  if (spot <= 0 || strike <= 0) {
    return {
      theoreticalPrice: 0,
      delta: 0,
      gamma: 0,
      thetaDaily: 0,
      vega1Pct: 0,
      rho: 0,
      moneyness: "ATM",
      intrinsicValue: 0,
      timeValue: 0,
      breakEven: strike,
    }
  }

  const T = Math.max(timeToExpiryYears, 1 / 365 / 24) // minimum 1 hour to avoid division by zero
  const S = spot
  const K = strike
  const r = riskFreeRate
  const sigma = Math.max(volatility, 0.01)

  const sqrtT = Math.sqrt(T)
  const d1 = (Math.log(S / K) + (r + (sigma * sigma) / 2.0) * T) / (sigma * sqrtT)
  const d2 = d1 - sigma * sqrtT

  const nd1 = normalCdf(d1)
  const nd2 = normalCdf(d2)
  const nMinusD1 = normalCdf(-d1)
  const nMinusD2 = normalCdf(-d2)
  const npdfD1 = normalPdf(d1)
  const expNegativeRt = Math.exp(-r * T)

  let theoreticalPrice: number
  let delta: number
  let intrinsicValue: number
  let thetaDaily: number
  let rho: number

  if (type === "CE") {
    theoreticalPrice = S * nd1 - K * expNegativeRt * nd2
    delta = nd1
    intrinsicValue = Math.max(0, S - K)
    // Daily theta for Call
    thetaDaily = (-(S * npdfD1 * sigma) / (2 * sqrtT) - r * K * expNegativeRt * nd2) / 365
    rho = (K * T * expNegativeRt * nd2) / 100
  } else {
    theoreticalPrice = K * expNegativeRt * nMinusD2 - S * nMinusD1
    delta = nd1 - 1.0
    intrinsicValue = Math.max(0, K - S)
    // Daily theta for Put
    thetaDaily = (-(S * npdfD1 * sigma) / (2 * sqrtT) + r * K * expNegativeRt * nMinusD2) / 365
    rho = (-K * T * expNegativeRt * nMinusD2) / 100
  }

  theoreticalPrice = Math.max(0.05, theoreticalPrice)
  const gamma = npdfD1 / (S * sigma * sqrtT)
  const vega1Pct = (S * sqrtT * npdfD1) / 100
  const timeValue = Math.max(0, theoreticalPrice - intrinsicValue)

  let moneyness: "ITM" | "ATM" | "OTM" = "ATM"
  const ratio = S / K
  if (type === "CE") {
    if (ratio > 1.002) moneyness = "ITM"
    else if (ratio < 0.998) moneyness = "OTM"
    else moneyness = "ATM"
  } else {
    if (ratio < 0.998) moneyness = "ITM"
    else if (ratio > 1.002) moneyness = "OTM"
    else moneyness = "ATM"
  }

  const breakEven = type === "CE" ? strike + theoreticalPrice : strike - theoreticalPrice

  return {
    theoreticalPrice: Number(theoreticalPrice.toFixed(2)),
    delta: Number(delta.toFixed(4)),
    gamma: Number(gamma.toFixed(6)),
    thetaDaily: Number(thetaDaily.toFixed(2)),
    vega1Pct: Number(vega1Pct.toFixed(2)),
    rho: Number(rho.toFixed(4)),
    moneyness,
    intrinsicValue: Number(intrinsicValue.toFixed(2)),
    timeValue: Number(timeValue.toFixed(2)),
    breakEven: Number(breakEven.toFixed(2)),
  }
}
