import { GET } from "../app/api/search/route"

interface SearchItem {
  symbol: string
  name: string
  exchange: string
  type: string
  strike?: number
  optionType?: string
  expiry?: string
  underlying?: string
}

async function search(q: string): Promise<SearchItem[]> {
  const req = new Request(`http://localhost:3000/api/search?q=${encodeURIComponent(q)}`)
  const res = await GET(req)
  const data = await res.json()
  return data.results || []
}

async function runTests() {
  console.log("=== COMPREHENSIVE MARKETS TERMINAL SEARCH AUTOCOMPLETE AUDIT ===\n")

  const exactOptionCases = [
    {
      query: "NIFTY 50 AUG 24150 PE",
      expectedSymbol: "NFO:NIFTY-AUG-24150-PE",
      expectedType: "OPTION",
      expectedStrike: 24150,
      expectedSide: "PE",
    },
    {
      query: "NIFTY 24150 PE",
      expectedSymbol: "NFO:NIFTY-AUG-24150-PE",
      expectedType: "OPTION",
      expectedStrike: 24150,
      expectedSide: "PE",
    },
    {
      query: "NIFTY AUG 24150 CE",
      expectedSymbol: "NFO:NIFTY-AUG-24150-CE",
      expectedType: "OPTION",
      expectedStrike: 24150,
      expectedSide: "CE",
    },
    {
      query: "NIFTY 50 24150 PE",
      expectedSymbol: "NFO:NIFTY-AUG-24150-PE",
      expectedType: "OPTION",
      expectedStrike: 24150,
      expectedSide: "PE",
    },
    {
      query: "NIFTY 24250 PE",
      expectedSymbol: "NFO:NIFTY-AUG-24250-PE",
      expectedType: "OPTION",
      expectedStrike: 24250,
      expectedSide: "PE",
    },
    {
      query: "BANKNIFTY 55000 CE",
      expectedSymbol: "NFO:BANKNIFTY-AUG-55000-CE",
      expectedType: "OPTION",
      expectedStrike: 55000,
      expectedSide: "CE",
    },
    {
      query: "SENSEX 77400 PE",
      expectedSymbol: "BFO:SENSEX-AUG-77400-PE",
      expectedType: "OPTION",
      expectedStrike: 77400,
      expectedSide: "PE",
    },
    {
      query: "TCS 4500 CE",
      expectedSymbol: "NFO:TCS-AUG-4500-CE",
      expectedType: "OPTION",
      expectedStrike: 4500,
      expectedSide: "CE",
    },
    {
      query: "RELIANCE 3000 CE",
      expectedSymbol: "NFO:RELIANCE-AUG-3000-CE",
      expectedType: "OPTION",
      expectedStrike: 3000,
      expectedSide: "CE",
    },
    // Order / Spacing / Case variations
    {
      query: "24150 PE NIFTY 50",
      expectedSymbol: "NFO:NIFTY-AUG-24150-PE",
      expectedType: "OPTION",
      expectedStrike: 24150,
      expectedSide: "PE",
    },
    {
      query: "24150 PE NIFTY",
      expectedSymbol: "NFO:NIFTY-AUG-24150-PE",
      expectedType: "OPTION",
      expectedStrike: 24150,
      expectedSide: "PE",
    },
    {
      query: "nifty 50 aug 24150 pe",
      expectedSymbol: "NFO:NIFTY-AUG-24150-PE",
      expectedType: "OPTION",
      expectedStrike: 24150,
      expectedSide: "PE",
    },
    {
      query: "55000 CE BANKNIFTY",
      expectedSymbol: "NFO:BANKNIFTY-AUG-55000-CE",
      expectedType: "OPTION",
      expectedStrike: 55000,
      expectedSide: "CE",
    },
    {
      query: "77400 PE SENSEX",
      expectedSymbol: "BFO:SENSEX-AUG-77400-PE",
      expectedType: "OPTION",
      expectedStrike: 77400,
      expectedSide: "PE",
    },
  ]

  let passed = 0
  let failed = 0

  for (const c of exactOptionCases) {
    const results = await search(c.query)
    const top = results[0]

    const matchesTop =
      top &&
      top.symbol === c.expectedSymbol &&
      top.type === c.expectedType &&
      top.strike === c.expectedStrike &&
      top.optionType === c.expectedSide

    if (matchesTop) {
      console.log(`[PASS] "${c.query}" -> 1st Result: ${top.name} [${top.symbol}] (${top.type})`)
      passed++
    } else {
      console.error(
        `[FAIL] "${c.query}" -> Expected 1st result ${c.expectedSymbol}, but got: ${
          top ? `${top.name} [${top.symbol}]` : "No results"
        }`
      )
      failed++
    }
  }

  // Test Partial / Broad Queries
  console.log("\n--- Partial & Broad Queries ---")
  const partialCases = [
    { query: "NIFTY 24150", expectOptionsWithStrike: 24150 },
    { query: "24150 NIFTY", expectOptionsWithStrike: 24150 },
    { query: "NIFTY", expectUnderlying: "^NSEI" },
  ]

  for (const p of partialCases) {
    const results = await search(p.query)
    if (p.expectOptionsWithStrike) {
      const hasStrike = results.some((r) => r.strike === p.expectOptionsWithStrike)
      if (hasStrike) {
        console.log(`[PASS] Partial "${p.query}" returned options for strike ${p.expectOptionsWithStrike}`)
        passed++
      } else {
        console.error(`[FAIL] Partial "${p.query}" did not return options for strike ${p.expectOptionsWithStrike}`)
        failed++
      }
    }
    if (p.expectUnderlying) {
      const top = results[0]
      if (top && top.symbol === p.expectUnderlying) {
        console.log(`[PASS] Broad query "${p.query}" prioritized underlying index: ${top.name} [${top.symbol}]`)
        passed++
      } else {
        console.error(`[FAIL] Broad query "${p.query}" did not prioritize underlying index`)
        failed++
      }
    }
  }

  console.log(`\n=== SUMMARY: ${passed} PASSED, ${failed} FAILED ===`)
  if (failed > 0) {
    process.exit(1)
  }
}

runTests().catch((err) => {
  console.error("Test execution error:", err)
  process.exit(1)
})
