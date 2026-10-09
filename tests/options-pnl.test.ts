import test from "node:test"
import assert from "node:assert/strict"
import { buildExpiryPayoffCurve, calculateExpiryPayoff } from "../lib/options/pnl"

test("long call expiry payoff includes premium and contract multiplier", () => {
  const result = calculateExpiryPayoff({
    legs: [{ side: "long", right: "call", strike: 100, entryPremium: 8, contracts: 2, multiplier: 100 }],
    underlyingAtExpiry: 120, costs: 15,
  })
  assert.equal(result.grossPnl, 2400)
  assert.equal(result.netPnl, 2385)
  assert.equal(result.legs[0].intrinsicPerUnit, 20)
})
test("long put can expire worthless and lose premium only", () => {
  const result = calculateExpiryPayoff({
    legs: [{ side: "long", right: "put", strike: 100, entryPremium: 7, contracts: 1, multiplier: 100 }],
    underlyingAtExpiry: 110,
  })
  assert.equal(result.grossPnl, -700)
  assert.equal(result.netPnl, -700)
})
test("multi-leg strategy sums each leg and explicit costs", () => {
  const result = calculateExpiryPayoff({
    legs: [
      { side: "long", right: "call", strike: 100, entryPremium: 10, contracts: 1, multiplier: 100 },
      { side: "short", right: "call", strike: 110, entryPremium: 4, contracts: 1, multiplier: 100 },
    ],
    underlyingAtExpiry: 115, costs: 25,
  })
  assert.equal(result.grossPnl, 400)
  assert.equal(result.netPnl, 375)
})
test("payoff curve is deterministic and preserves requested order", () => {
  const curve = buildExpiryPayoffCurve(
    [{ side: "long", right: "call", strike: 100, entryPremium: 5, contracts: 1, multiplier: 100 }],
    [90, 100, 110],
  )
  assert.deepEqual(curve.map((point) => point.netPnl), [-500, -500, 500])
  assert.deepEqual(curve.map((point) => point.underlyingPrice), [90, 100, 110])
})
test("invalid contracts and costs fail closed", () => {
  assert.throws(() => calculateExpiryPayoff({
    legs: [{ side: "long", right: "call", strike: 100, entryPremium: 5, contracts: 0, multiplier: 100 }],
    underlyingAtExpiry: 100,
  }), /contracts/)
  assert.throws(() => calculateExpiryPayoff({
    legs: [{ side: "long", right: "call", strike: 100, entryPremium: 5, contracts: 1, multiplier: 100 }],
    underlyingAtExpiry: 100, costs: -1,
  }), /costs/)
})
