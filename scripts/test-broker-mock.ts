import { UpstoxOptionsProvider } from "../lib/derivatives/providers/upstox"
import { KiteConnectOptionsProvider } from "../lib/derivatives/providers/kite"
import { DhanOptionsProvider } from "../lib/derivatives/providers/dhan"
import { createExchangeInstrument } from "../lib/derivatives/instruments"

async function testBrokerAdapters() {
  console.log("================================================================================")
  console.log("BROKER ADAPTER LOGIC & CONTRACT NORMALIZATION AUDIT")
  console.log("================================================================================")

  // 1. Test Upstox Key mapping
  const inst1 = createExchangeInstrument("^NSEI", 24150, "CE", "2026-08-27")
  console.log("Upstox canonical symbol:", inst1.canonicalSymbol)
  console.log("Upstox Key:", inst1.upstoxKey)
  console.log("Kite Symbol:", inst1.canonicalSymbol)
  console.log("Fyers Symbol:", inst1.fyersSymbol)
  console.log("Dhan Security ID:", inst1.dhanSecurityId)

  // 2. Test Provider Health checks with missing env
  const upstox = new UpstoxOptionsProvider()
  const kite = new KiteConnectOptionsProvider()
  const dhan = new DhanOptionsProvider()

  console.log("\nUnconfigured state health check:")
  console.log("Upstox:", await upstox.getHealth())
  console.log("Kite:", await kite.getHealth())
  console.log("Dhan:", await dhan.getHealth())
}

testBrokerAdapters().catch(console.error)
