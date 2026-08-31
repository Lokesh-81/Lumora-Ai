import test from "node:test"
import assert from "node:assert/strict"
import {
  parseOptionQuery,
  getValidExpiries,
  resolveUnderlying,
} from "../lib/instrument.ts"
import {
  createExchangeInstrument,
  generateOptionChainInstruments,
} from "../lib/derivatives/instruments.ts"
import { derivativeManager } from "../lib/derivatives/manager.ts"

test("Derivatives Pipeline & Resolution Audit", async (t) => {
  await t.test("NIFTY CE and PE resolve to distinct exchange instruments", () => {
    const expiries = getValidExpiries("^NSEI")
    assert.ok(expiries.length > 0, "Should have valid expiries for NIFTY")
    const expiry = expiries[0].date

    const ce = createExchangeInstrument("^NSEI", 24150, "CE", expiry)
    const pe = createExchangeInstrument("^NSEI", 24150, "PE", expiry)

    assert.equal(ce.exchange, "NSE")
    assert.equal(ce.segment, "NFO")
    assert.equal(ce.strike, 24150)
    assert.equal(ce.optionType, "CE")

    assert.equal(pe.exchange, "NSE")
    assert.equal(pe.segment, "NFO")
    assert.equal(pe.strike, 24150)
    assert.equal(pe.optionType, "PE")

    // Distinct canonical symbols and tradingsymbols
    assert.notEqual(ce.tradingsymbol, pe.tradingsymbol, "CE and PE tradingsymbols must be distinct")
    assert.notEqual(ce.canonicalSymbol, pe.canonicalSymbol, "CE and PE canonical symbols must be distinct")
    assert.ok(ce.tradingsymbol.endsWith("CE"), "CE trading symbol must end with CE")
    assert.ok(pe.tradingsymbol.endsWith("PE"), "PE trading symbol must end with PE")
  })

  await t.test("Stock options (TCS, RELIANCE) resolve correctly", () => {
    const tcsExpiries = getValidExpiries("TCS.NS")
    assert.ok(tcsExpiries.length > 0, "Should have valid monthly expiries for TCS")
    const tcsExpiry = tcsExpiries[0].date

    const tcsCe = createExchangeInstrument("TCS.NS", 3500, "CE", tcsExpiry)
    assert.equal(tcsCe.underlyingCode, "TCS")
    assert.equal(tcsCe.strike, 3500)
    assert.equal(tcsCe.optionType, "CE")
    assert.ok(tcsCe.lotSize && tcsCe.lotSize > 0, "TCS should have a positive lot size")

    const relExpiries = getValidExpiries("RELIANCE.NS")
    const relExpiry = relExpiries[0].date
    const relCe = createExchangeInstrument("RELIANCE.NS", 1300, "CE", relExpiry)
    assert.equal(relCe.underlyingCode, "RELIANCE")
    assert.equal(relCe.strike, 1300)
    assert.ok(relCe.tradingsymbol.includes("RELIANCE"), "Tradingsymbol must contain RELIANCE")
  })

  await t.test("Anti-spot-substitution & No fake synthetic data guarantee", async () => {
    const mockSpot = {
      price: 24150.75,
      change: 85.3,
      changePercent: 0.35,
      name: "NIFTY 50",
    }

    const chain = await derivativeManager.getOptionChain({ symbol: "^NSEI" }, mockSpot)

    assert.equal(chain.isLiveData, false, "Without broker credentials, chain must be marked as not live")
    assert.equal(chain.isStructureOnly, true, "Chain must indicate it is structure-only")
    assert.ok(chain.contracts.length > 0, "Option contracts should be resolved")

    for (const contract of chain.contracts) {
      // Premium MUST NOT equal the underlying spot price (24150.75)
      assert.notEqual(
        contract.premium,
        mockSpot.price,
        `Option strike ${contract.strike} ${contract.type} premium must NEVER equal spot price (${mockSpot.price})`
      )
      // When offline/unconfigured, premium must be strictly null
      assert.equal(contract.premium, null, "Unconfigured contract premium must be null")
      assert.equal(contract.hasLiveData, false, "Contract hasLiveData must be false")
      assert.equal(contract.iv, null, "Unconfigured contract IV must be null")
      assert.equal(contract.openInterest, null, "Unconfigured contract OI must be null")
      assert.equal(contract.volume, null, "Unconfigured contract volume must be null")
    }
  })

  await t.test("Option query parsing correctly extracts strike, type and underlying", () => {
    const q1 = parseOptionQuery("NIFTY 24150 CE")
    assert.ok(q1, "Should parse 'NIFTY 24150 CE'")
    assert.equal(q1.strike, 24150)
    assert.equal(q1.optionType, "CE")
    assert.equal(q1.underlyingSymbol, "^NSEI")

    const q2 = parseOptionQuery("BANKNIFTY 52000 PE")
    assert.ok(q2, "Should parse 'BANKNIFTY 52000 PE'")
    assert.equal(q2.strike, 52000)
    assert.equal(q2.optionType, "PE")
    assert.equal(q2.underlyingSymbol, "^NSEBANK")

    const q3 = parseOptionQuery("RELIANCE 1300 CE")
    assert.ok(q3, "Should parse 'RELIANCE 1300 CE'")
    assert.equal(q3.strike, 1300)
    assert.equal(q3.optionType, "CE")
    assert.equal(q3.underlyingSymbol, "RELIANCE.NS")
  })
})
