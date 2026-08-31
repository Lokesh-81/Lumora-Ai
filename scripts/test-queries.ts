import { parseOptionQuery, suggestOptionContracts, parseInstrument } from "../lib/instrument"

const queries = [
  "NIFTY 50 AUG 24150 PE",
  "NIFTY 24150 PE",
  "NIFTY AUG 24150 CE",
  "NIFTY 50 24150 PE",
  "NIFTY 24250 PE",
  "BANKNIFTY 55000 CE",
  "SENSEX 77400 PE",
  "TCS 4500 CE",
  "RELIANCE 3000 CE",
  // Permutations & case/spacing variants
  "nifty 50 aug 24150 pe",
  "24150 PE NIFTY",
  "24150 PE NIFTY 50",
  "24150 NIFTY PE",
  "24150 NIFTY 50 PE",
  "NIFTY PE 24150",
  "NIFTY 50 PE 24150",
  "AUG 24150 PE NIFTY",
  "24150 AUG PE NIFTY",
  "PE 24150 NIFTY",
  "55000 CE BANKNIFTY",
  "BANK NIFTY 55000 CE",
  "77400 PE SENSEX",
  "BSE SENSEX 77400 PE",
  "4500 CE TCS",
  "3000 CE RELIANCE",
  "NIFTY26AUG24150PE",
  "NIFTY24150PE",
  "NFO:NIFTY-AUG-24150-PE",
  // Partial queries
  "NIFTY 24150",
  "24150 NIFTY",
  "NIFTY PE",
  "NIFTY",
]

console.log("=== COMPREHENSIVE SEARCH & RESOLUTION TEST ===")
for (const q of queries) {
  const parsed = parseInstrument(q)
  const isExactOption = parsed.type === "option" && !parsed.isPartial && !!parsed.strike && !!parsed.optionType
  const suggestions = suggestOptionContracts(q, 4)

  console.log(`\nQuery: "${q}"`)
  console.log(`  Exact Option: ${isExactOption ? "YES" : "NO"} => ${parsed.name} (${parsed.symbol})`)
  console.log(`  Suggestions count: ${suggestions.length}`)
  if (suggestions.length > 0) {
    console.log(`  Top suggestion: ${suggestions[0].name} (${suggestions[0].symbol})`)
  }
}
