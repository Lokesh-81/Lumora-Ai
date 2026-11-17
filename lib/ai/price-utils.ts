export function parseNumericPrice(val: string | number | undefined | null): number | null {
  if (val == null) return null
  if (typeof val === "number") return isNaN(val) || !isFinite(val) ? null : val
  const str = String(val).trim()
  if (!str) return null

  // Direct Number parse if clean string is a valid floating point number
  const cleanStr = str.replace(/[₹$€£¥,]/g, "").trim()
  const directNum = Number(cleanStr)
  if (!isNaN(directNum) && isFinite(directNum)) {
    return directNum
  }

  // 1. Explicit currency match: e.g. ₹ 738.35, $738.35, €738
  const currencyMatch = str.match(/[₹$€£¥]\s*([0-9]+(?:,[0-9]+)*(?:\.[0-9]+)?)/)
  if (currencyMatch && currencyMatch[1]) {
    const num = parseFloat(currencyMatch[1].replace(/,/g, ""))
    if (!isNaN(num) && isFinite(num)) return num
  }

  // 2. Clean out common labels containing ordinal numbers ("Target 1", "Target 2", etc.)
  const cleaned = str
    .replace(/\btarget\s*\d+\b/gi, "")
    .replace(/\bresistance\s*\d+\b/gi, "")
    .replace(/\bsupport\s*\d+\b/gi, "")
    .replace(/\bstop\s*loss\b/gi, "")
    .replace(/\bentry\b/gi, "")
    .replace(/\bstep\s*\d+\b/gi, "")
    .trim()

  const numMatch = cleaned.match(/([0-9]+(?:,[0-9]+)*(?:\.[0-9]+)?)/)
  if (numMatch && numMatch[1]) {
    const num = parseFloat(numMatch[1].replace(/,/g, ""))
    if (!isNaN(num) && isFinite(num)) return num
  }

  // 3. Fallback: search string for any floating point or integer number
  const match = str.match(/-?\d+(?:\.\d+)?/)
  if (match) {
    const num = parseFloat(match[0])
    if (!isNaN(num) && isFinite(num)) return num
  }

  return null
}

