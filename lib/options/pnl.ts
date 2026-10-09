/**
 * Deterministic option payoff calculations. Inputs must come from a verified
 * contract source or explicit user input; this module never guesses multipliers,
 * market prices, fees, or the probability of profit.
 */
export type OptionRight = "call" | "put"
export type PositionSide = "long" | "short"
export type OptionLeg = {
  id?: string
  side: PositionSide
  right: OptionRight
  strike: number
  entryPremium: number
  contracts: number
  multiplier: number
}
export type ExpiryPayoffInput = { legs: OptionLeg[]; underlyingAtExpiry: number; costs?: number }
export type LegExpiryResult = {
  id?: string
  side: PositionSide
  right: OptionRight
  strike: number
  intrinsicPerUnit: number
  premiumCashFlow: number
  expiryCashFlow: number
  grossPnl: number
}
export type ExpiryPayoffResult = {
  underlyingAtExpiry: number
  grossPnl: number
  costs: number
  netPnl: number
  legs: LegExpiryResult[]
  currency: "caller-specified"
  basis: "expiry-payoff"
}
function positive(value: number, label: string): void {
  if (!Number.isFinite(value) || value <= 0) throw new RangeError(label + " must be finite and greater than zero.")
}
function validateLeg(leg: OptionLeg, index: number): void {
  const label = "legs[" + index + "]"
  if (leg.side !== "long" && leg.side !== "short") throw new TypeError(label + ".side must be long or short.")
  if (leg.right !== "call" && leg.right !== "put") throw new TypeError(label + ".right must be call or put.")
  positive(leg.strike, label + ".strike")
  if (!Number.isFinite(leg.entryPremium) || leg.entryPremium < 0) throw new RangeError(label + ".entryPremium must be finite and non-negative.")
  if (!Number.isSafeInteger(leg.contracts) || leg.contracts < 1) throw new RangeError(label + ".contracts must be a positive safe integer.")
  positive(leg.multiplier, label + ".multiplier")
}
/** Premium and costs use the same caller-specified currency. Premium is per unit. */
export function calculateExpiryPayoff(input: ExpiryPayoffInput): ExpiryPayoffResult {
  if (!Array.isArray(input.legs) || input.legs.length === 0) throw new RangeError("At least one option leg is required.")
  if (!Number.isFinite(input.underlyingAtExpiry) || input.underlyingAtExpiry < 0) throw new RangeError("underlyingAtExpiry must be finite and non-negative.")
  const costs = input.costs ?? 0
  if (!Number.isFinite(costs) || costs < 0) throw new RangeError("costs must be finite and non-negative.")
  const legs = input.legs.map((leg, index): LegExpiryResult => {
    validateLeg(leg, index)
    const intrinsicPerUnit = leg.right === "call"
      ? Math.max(0, input.underlyingAtExpiry - leg.strike)
      : Math.max(0, leg.strike - input.underlyingAtExpiry)
    const units = leg.contracts * leg.multiplier
    const premiumCashFlow = (leg.side === "long" ? -1 : 1) * leg.entryPremium * units
    const expiryCashFlow = (leg.side === "long" ? 1 : -1) * intrinsicPerUnit * units
    return { ...(leg.id ? { id: leg.id } : {}), side: leg.side, right: leg.right, strike: leg.strike, intrinsicPerUnit, premiumCashFlow, expiryCashFlow, grossPnl: premiumCashFlow + expiryCashFlow }
  })
  const grossPnl = legs.reduce((sum, leg) => sum + leg.grossPnl, 0)
  return { underlyingAtExpiry: input.underlyingAtExpiry, grossPnl, costs, netPnl: grossPnl - costs, legs, currency: "caller-specified", basis: "expiry-payoff" }
}
export function buildExpiryPayoffCurve(legs: OptionLeg[], underlyingPrices: number[], costs = 0) {
  return underlyingPrices.map((underlyingPrice) => {
    const result = calculateExpiryPayoff({ legs, underlyingAtExpiry: underlyingPrice, costs })
    return { underlyingPrice, grossPnl: result.grossPnl, netPnl: result.netPnl }
  })
}
