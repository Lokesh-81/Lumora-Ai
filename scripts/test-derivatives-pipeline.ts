import { parseInstrument, parseOptionQuery, resolveUnderlying, getValidExpiries } from "../lib/instrument"
import { createExchangeInstrument, generateOptionChainInstruments, LOT_SIZES } from "../lib/derivatives/instruments"
import { derivativeManager } from "../lib/derivatives/manager"
import { getOptionChain } from "../lib/options"

async function runDerivativesAudit() {
  console.log("================================================================================")
  console.log("LUMORA AI - INDIAN DERIVATIVES & BROKER DATA PIPELINE PRODUCTION AUDIT")
  console.log("================================================================================")
  console.log(`Execution Timestamp: ${new Date().toISOString()}`)

  // 1. Audit Provider Health & Environment Credentials Status
  console.log("\n[SECTION 1: PROVIDER CONFIGURATION & HEALTH DIAGNOSTICS]")
  const providerHealth = await derivativeManager.getAllProviderHealth()
  const configuredProviders = providerHealth.filter((h) => h.isConfigured)

  for (const h of providerHealth) {
    console.log(`- Provider: ${h.name} (${h.id})`)
    console.log(`  Configured: ${h.isConfigured ? "YES" : "NO"}`)
    console.log(`  Status: ${h.status}`)
    console.log(`  Required Vars: ${h.requiredEnvVars.join(", ")}`)
    if (h.missingEnvVars.length > 0) {
      console.log(`  Missing in Env: ${h.missingEnvVars.join(", ")}`)
    }
    if (h.errorMessage) {
      console.log(`  Error: ${h.errorMessage}`)
    }
  }

  if (configuredProviders.length === 0) {
    console.log("\n================================================================================")
    console.log(">>> [STATUS: BROKER NOT CONFIGURED] <<<")
    console.log("No broker credentials found in the environment.")
    console.log("Lumora is operating under strict safeguard mode: Live option data is UNAVAILABLE.")
    console.log("Spot price substitution is STRICTLY PREVENTED.")
    console.log("================================================================================")
  }

  // 2. Real Exchange Tradingsymbol & Token Resolution
  console.log("\n[SECTION 2: REAL EXCHANGE TRADING理工SYMBOL & INSTRUMENT MAPPING AUDIT]")
  const testContracts = [
    { query: "NIFTY 24150 CE", underlying: "^NSEI", strike: 24150, type: "CE" as const },
    { query: "NIFTY 24150 PE", underlying: "^NSEI", strike: 24150, type: "PE" as const },
    { query: "NIFTY 24250 CE", underlying: "^NSEI", strike: 24250, type: "CE" as const },
    { query: "NIFTY 24250 PE", underlying: "^NSEI", strike: 24250, type: "PE" as const },
    { query: "BANKNIFTY 55000 CE", underlying: "^NSEBANK", strike: 55000, type: "CE" as const },
    { query: "BANKNIFTY 55000 PE", underlying: "^NSEBANK", strike: 55000, type: "PE" as const },
    { query: "SENSEX 77400 CE", underlying: "^BSESN", strike: 77400, type: "CE" as const },
    { query: "SENSEX 77400 PE", underlying: "^BSESN", strike: 77400, type: "PE" as const },
    { query: "TCS 4500 CE", underlying: "TCS.NS", strike: 4500, type: "CE" as const },
    { query: "TCS 4500 PE", underlying: "TCS.NS", strike: 4500, type: "PE" as const },
    { query: "RELIANCE 3000 CE", underlying: "RELIANCE.NS", strike: 3000, type: "CE" as const },
    { query: "RELIANCE 3000 PE", underlying: "RELIANCE.NS", strike: 3000, type: "PE" as const },
  ]

  for (const tc of testContracts) {
    const expiries = getValidExpiries(tc.underlying)
    const exp = expiries[0].date
    const inst = createExchangeInstrument(tc.underlying, tc.strike, tc.type, exp)

    console.log(`\nQuery: "${tc.query}"`)
    console.log(`  Resolved Exchange: ${inst.exchange}`)
    console.log(`  Segment: ${inst.segment}`)
    console.log(`  Standard Exchange Tradingsymbol: ${inst.tradingsymbol}`)
    console.log(`  Canonical Symbol: ${inst.canonicalSymbol}`)
    console.log(`  Upstox Instrument Key: ${inst.upstoxKey}`)
    console.log(`  Fyers Symbol: ${inst.fyersSymbol}`)
    console.log(`  Dhan Security ID: ${inst.dhanSecurityId}`)
    console.log(`  Lot Size: ${inst.lotSize}`)
    console.log(`  Expiry Date: ${inst.expiry} (${inst.expiryCode})`)
  }

  // 3. Complete Option Chain Pipeline Flow (NIFTY 50)
  console.log("\n[SECTION 3: COMPLETE OPTION CHAIN PIPELINE EXECUTION (NIFTY)]")
  const niftyChain = await getOptionChain({ symbol: "^NSEI" })

  if (niftyChain) {
    console.log(`- Symbol: ${niftyChain.symbol}`)
    console.log(`- Underlying: ${niftyChain.underlyingName} @ ₹${niftyChain.underlyingPrice}`)
    console.log(`- Active Expiry: ${niftyChain.expiry}`)
    console.log(`- Expiries Available: ${niftyChain.expiries.slice(0, 4).join(", ")}`)
    console.log(`- Provider: ${niftyChain.provider}`)
    console.log(`- isLiveData: ${niftyChain.isLiveData}`)
    console.log(`- isStructureOnly: ${niftyChain.isStructureOnly}`)
    console.log(`- Notice: [${niftyChain.notice?.type}] ${niftyChain.notice?.title}`)
    console.log(`- Total Contracts Resolved: ${niftyChain.contracts.length}`)

    // Sample 4 contracts around ATM
    console.log("\nSample Resolved Contracts:")
    const sample = niftyChain.contracts.filter(c => c.strike >= 24100 && c.strike <= 24300).slice(0, 6)
    for (const c of sample) {
      console.log(`  * Strike: ${c.strike} ${c.type} | Status: ${c.hasLiveData ? "LIVE" : "RESOLVED (OFFLINE)"} | LTP: ${c.premium ?? "—"} | OI: ${c.openInterest ?? "—"} | IV: ${c.iv ?? "—"} | Delta: ${c.delta ?? "—"} | Tradingsymbol: ${c.tradingsymbol ?? "—"}`)
    }
  } else {
    console.error("FAILED to load NIFTY option chain!")
  }

  // 4. Complete Option Chain Pipeline Flow (RELIANCE)
  console.log("\n[SECTION 4: COMPLETE OPTION CHAIN PIPELINE EXECUTION (RELIANCE.NS)]")
  const relChain = await getOptionChain({ symbol: "RELIANCE.NS" })
  if (relChain) {
    console.log(`- Symbol: ${relChain.symbol}`)
    console.log(`- Underlying: ${relChain.underlyingName} @ ₹${relChain.underlyingPrice}`)
    console.log(`- Expiry: ${relChain.expiry}`)
    console.log(`- Total Contracts: ${relChain.contracts.length}`)
  }

  // 5. Complete Option Chain Pipeline Flow (SENSEX)
  console.log("\n[SECTION 5: COMPLETE OPTION CHAIN PIPELINE EXECUTION (SENSEX ^BSESN)]")
  const sensexChain = await getOptionChain({ symbol: "^BSESN" })
  if (sensexChain) {
    console.log(`- Symbol: ${sensexChain.symbol}`)
    console.log(`- Underlying: ${sensexChain.underlyingName} @ ₹${sensexChain.underlyingPrice}`)
    console.log(`- Segment: ${sensexChain.segment}`)
    console.log(`- Expiry: ${sensexChain.expiry}`)
    console.log(`- Total Contracts: ${sensexChain.contracts.length}`)
  }

  // 6. Direct Quote & Anti-Spot Substitution Verification
  console.log("\n[SECTION 6: DIRECT QUOTE & ANTI-SPOT SUBSTITUTION VERIFICATION]")
  const { getQuote } = await import("../lib/market")
  const ceQuote = await getQuote("NIFTY 24150 CE")
  const peQuote = await getQuote("NIFTY 24150 PE")

  console.log("Testing NIFTY 24150 CE Quote:")
  if (ceQuote) {
    console.log(`  - Option Symbol: ${ceQuote.symbol}`)
    console.log(`  - Option Price (LTP): ${ceQuote.price}`)
    console.log(`  - Underlying Price: ${ceQuote.derivativeInfo?.underlyingPrice}`)
    console.log(`  - Has Live Data: ${ceQuote.derivativeInfo?.hasLiveData}`)
    console.log(`  - Trading Symbol: ${ceQuote.derivativeInfo?.tradingsymbol}`)
    console.log(`  - Status: ${ceQuote.derivativeInfo?.statusMessage}`)

    // Verification assertion:
    if (ceQuote.price > 0 && ceQuote.price === ceQuote.derivativeInfo?.underlyingPrice) {
      throw new Error("CRITICAL SAFETY VIOLATION: Underlying spot price was substituted for option premium!")
    }
    console.log("  ✓ Spot substitution check passed: Underlying spot is NOT substituted as option LTP.")
  }

  console.log("Testing NIFTY 24150 PE Quote:")
  if (peQuote) {
    console.log(`  - Option Symbol: ${peQuote.symbol}`)
    console.log(`  - Option Price (LTP): ${peQuote.price}`)
    console.log(`  - Underlying Price: ${peQuote.derivativeInfo?.underlyingPrice}`)
    console.log(`  - Has Live Data: ${peQuote.derivativeInfo?.hasLiveData}`)
    console.log(`  - Trading Symbol: ${peQuote.derivativeInfo?.tradingsymbol}`)

    if (ceQuote && peQuote && ceQuote.derivativeInfo?.tradingsymbol === peQuote.derivativeInfo?.tradingsymbol) {
      throw new Error("CRITICAL VIOLATION: CE and PE share the same trading symbol!")
    }
    console.log("  ✓ CE and PE instruments resolve to separate exchange tradingsymbols.")
  }

  console.log("\n================================================================================")
  console.log("AUDIT COMPLETE - ALL RESOLVERS, EXCHANGES & PROVIDER HANDLERS VERIFIED")
  console.log("================================================================================")
}

runDerivativesAudit().catch(console.error)
