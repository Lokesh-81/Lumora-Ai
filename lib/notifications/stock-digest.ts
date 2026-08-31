import { db } from "@/lib/db"
import { user, notification, activityLog, watchlistItem, portfolioHolding, savedAnalysis } from "@/lib/db/schema"
import { eq, and, gt, desc } from "drizzle-orm"
import { getQuotes, type Quote } from "@/lib/market"
import { generateText } from "@/lib/ai/provider"
import { sendStockDigestEmail, sendInactiveUserEmail, sendWhatsNewEmail } from "@/lib/email"

export type DigestResult = {
  processed: number
  sent: number
  skipped: number
  errors: Array<{ userId: string; error: string }>
}

/**
 * Collects distinct active tickers relevant to a given user based on their
 * real platform activity: watchlist, portfolio, saved analyses, and activity logs.
 */
export async function getUserTrackedTickers(userId: string): Promise<string[]> {
  const tickerScores = new Map<string, number>()

  const addTicker = (raw: string | null | undefined, weight = 1) => {
    if (!raw) return
    const symbol = raw.trim().toUpperCase()
    if (!symbol || symbol.length > 20) return
    tickerScores.set(symbol, (tickerScores.get(symbol) ?? 0) + weight)
  }

  // 1. Portfolio holdings (highest weight)
  const holdings = await db
    .select({ symbol: portfolioHolding.symbol })
    .from(portfolioHolding)
    .where(eq(portfolioHolding.userId, userId))
    .limit(20)
    .catch(() => [])

  for (const h of holdings) addTicker(h.symbol, 3)

  // 2. Watchlist items (high weight)
  const watch = await db
    .select({ symbol: watchlistItem.symbol })
    .from(watchlistItem)
    .where(eq(watchlistItem.userId, userId))
    .limit(20)
    .catch(() => [])

  for (const w of watch) addTicker(w.symbol, 2)

  // 3. Saved analyses
  const saved = await db
    .select({ symbol: savedAnalysis.symbol })
    .from(savedAnalysis)
    .where(eq(savedAnalysis.userId, userId))
    .orderBy(desc(savedAnalysis.createdAt))
    .limit(10)
    .catch(() => [])

  for (const s of saved) addTicker(s.symbol, 2)

  // 4. Recent activity log tickers (searches, AI prompts)
  const activities = await db
    .select({ ticker: activityLog.ticker })
    .from(activityLog)
    .where(and(eq(activityLog.userId, userId)))
    .orderBy(desc(activityLog.createdAt))
    .limit(30)
    .catch(() => [])

  for (const a of activities) addTicker(a.ticker, 1)

  // Sort tickers by interaction weight and take the top 4
  const sorted = [...tickerScores.entries()]
    .sort((a, b) => b[1] - a[1])
    .map(([sym]) => sym)

  return sorted.slice(0, 4)
}

/**
 * Runs the intelligent stock notification engine for a specific user.
 */
export async function processStockDigestForUser(
  userId: string,
  options: { force?: boolean } = {},
): Promise<{ success: boolean; reason?: string; symbols?: string[] }> {
  // 1. Fetch user
  const users = await db
    .select()
    .from(user)
    .where(eq(user.id, userId))
    .limit(1)

  if (!users.length) return { success: false, reason: "User not found" }
  const u = users[0]

  if (!u.emailVerified && !options.force) {
    return { success: false, reason: "Email is not verified" }
  }

  // Check user-controlled notification preferences
  const prefs = (u.notificationPrefs as Record<string, boolean> | null) ?? {}
  if ((prefs.stockDigest === false || prefs.priceAlerts === false) && !options.force) {
    return { success: false, reason: "User opted out of stock digest emails" }
  }

  // 2. Cooldown check: Has a stock digest been sent within the last 3 days (72h)?
  const threeDaysAgo = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000)
  if (!options.force) {
    const recentNotif = await db
      .select({ id: notification.id })
      .from(notification)
      .where(
        and(
          eq(notification.userId, userId),
          eq(notification.type, "stock_digest"),
          gt(notification.createdAt, threeDaysAgo),
        ),
      )
      .limit(1)

    if (recentNotif.length > 0) {
      return { success: false, reason: "Cooldown active (received digest within 3 days)" }
    }
  }

  // 3. Collect tracked stocks
  let symbols = await getUserTrackedTickers(userId)
  if (symbols.length === 0) {
    // Default to benchmark assets if user has not yet populated a watchlist
    symbols = ["^NSEI", "RELIANCE.NS", "AAPL", "NVDA"]
  }

  // 4. Fetch live market quotes
  let quotes: Quote[] = []
  try {
    quotes = await getQuotes(symbols)
  } catch (err) {
    console.error("[StockDigest] Failed to fetch quotes:", err)
    return { success: false, reason: "Failed to fetch live market data" }
  }

  if (quotes.length === 0) {
    return { success: false, reason: "Unable to retrieve quotes for tracked symbols" }
  }

  // 5. Generate AI Intelligence summary using Gemini 3.7 Flash
  const quoteLines = quotes.map(
    (q) => `${q.symbol} (${q.name}): ${q.price} ${q.currency}, ${q.changePercent >= 0 ? "+" : ""}${q.changePercent.toFixed(2)}% today`,
  )

  let summary = `Market update for your followed assets: ${quotes.map((q) => `${q.symbol} is trading at ${q.price} ${q.currency} (${q.changePercent >= 0 ? "+" : ""}${q.changePercent.toFixed(2)}%)`).join("; ")}.`

  try {
    const aiResponse = await generateText({
      system:
        "You are Lumora AI's chief market strategist. Provide a crisp, 2-3 sentence personalized intelligence note for an investor tracking these specific assets. Highlight actionable technical momentum or market posture based only on the quotes. Keep it executive, concise, and grounded in the data.",
      prompt: `User's tracked assets over the last 3 days:\n${quoteLines.join("\n")}`,
      temperature: 0.3,
    })
    if (aiResponse?.text?.trim()) {
      summary = aiResponse.text.trim().replace(/^["']|["']$/g, "")
    }
  } catch (err) {
    console.warn("[StockDigest] AI summary generation fallback:", err)
  }

  // 6. Insert in-app notification
  const notifTitle = `3-Day Market Digest: ${quotes.map((q) => q.symbol).join(", ")}`
  await db.insert(notification).values({
    userId,
    type: "stock_digest",
    title: notifTitle,
    body: summary,
    symbol: quotes[0]?.symbol ?? null,
    read: false,
  })

  // 7. Dispatch branded enterprise-white Email
  const stocksPayload = quotes.map((q) => ({
    symbol: q.symbol,
    name: q.name,
    price: q.price,
    changePercent: q.changePercent,
    currency: q.currency,
  }))

  await sendStockDigestEmail({
    email: u.email,
    name: u.name,
    stocks: stocksPayload,
    summary,
  }).catch((e) => {
    console.warn("[StockDigest] Email dispatch warning:", e)
  })

  // 8. Log to activityLog
  await db.insert(activityLog).values({
    userId,
    type: "notification",
    title: `Received 3-day stock intelligence digest for ${symbols.join(", ")}`,
    ticker: symbols[0] ?? null,
    href: "/notifications",
  }).catch(() => {})

  return { success: true, symbols }
}

/**
 * Re-engagement email for users who haven't visited in 3 days.
 * Includes market movements of stocks they follow, AI summary, strict cooldowns,
 * and respects notification preferences.
 */
export async function processInactiveUserReengagement(
  userId: string,
  options: { force?: boolean } = {},
): Promise<{ success: boolean; reason?: string }> {
  const users = await db.select().from(user).where(eq(user.id, userId)).limit(1)
  if (!users.length) return { success: false, reason: "User not found" }
  const u = users[0]

  if (!u.emailVerified && !options.force) {
    return { success: false, reason: "Email is not verified" }
  }

  const prefs = (u.notificationPrefs as Record<string, boolean> | null) ?? {}
  if (prefs.inactiveUserNudge === false && !options.force) {
    return { success: false, reason: "User opted out of re-engagement emails" }
  }

  const threeDaysAgo = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000)

  // Check last activity
  if (!options.force) {
    const recentActivity = await db
      .select({ id: activityLog.id, createdAt: activityLog.createdAt })
      .from(activityLog)
      .where(and(eq(activityLog.userId, userId), gt(activityLog.createdAt, threeDaysAgo)))
      .limit(1)

    if (recentActivity.length > 0) {
      return { success: false, reason: "User has been active within the last 3 days" }
    }

    // Cooldown check for inactive re-engagement: maximum once every 7 days
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
    const recentNudge = await db
      .select({ id: notification.id })
      .from(notification)
      .where(
        and(
          eq(notification.userId, userId),
          eq(notification.type, "inactive_nudge"),
          gt(notification.createdAt, sevenDaysAgo),
        ),
      )
      .limit(1)

    if (recentNudge.length > 0) {
      return { success: false, reason: "Re-engagement cooldown active" }
    }
  }

  let symbols = await getUserTrackedTickers(userId)
  if (symbols.length === 0) {
    symbols = ["^NSEI", "^BSESN", "NVDA", "RELIANCE.NS"]
  }

  let quotes: Quote[] = []
  try {
    quotes = await getQuotes(symbols)
  } catch (err) {
    console.warn("[InactiveUser] Quote fetch error:", err)
  }

  const quoteLines = quotes.map(
    (q) => `${q.symbol} (${q.name}): ${q.price} ${q.currency}, ${q.changePercent >= 0 ? "+" : ""}${q.changePercent.toFixed(2)}%`,
  )

  let summary = "Key indices and equities have made significant moves over the past few days. Log in to your terminal to review up-to-date AI valuations and risk indicators."
  try {
    const aiResponse = await generateText({
      system:
        "You are Lumora AI's chief market strategist. Provide a brief 2-sentence market check-in highlighting recent price action and key developments for these stocks. Keep it professional, encouraging, and informative.",
      prompt: `Stocks:\n${quoteLines.join("\n")}`,
      temperature: 0.3,
    })
    if (aiResponse?.text?.trim()) {
      summary = aiResponse.text.trim().replace(/^["']|["']$/g, "")
    }
  } catch {
    // fallback
  }

  await db.insert(notification).values({
    userId,
    type: "inactive_nudge",
    title: "Market developments while you were away",
    body: summary,
    symbol: quotes[0]?.symbol ?? null,
    read: false,
  })

  const stocksPayload = quotes.map((q) => ({
    symbol: q.symbol,
    name: q.name,
    price: q.price,
    changePercent: q.changePercent,
    currency: q.currency,
  }))

  await sendInactiveUserEmail({
    email: u.email,
    name: u.name,
    stocks: stocksPayload,
    summary,
  }).catch((e) => {
    console.warn("[InactiveUser] Email send error:", e)
  })

  return { success: true }
}

/**
 * Sends a one-time idempotent "What's New" announcement email to a user.
 */
export async function processWhatsNewForUser(
  userId: string,
  options: { force?: boolean } = {},
): Promise<{ success: boolean; reason?: string }> {
  const users = await db.select().from(user).where(eq(user.id, userId)).limit(1)
  if (!users.length) return { success: false, reason: "User not found" }
  const u = users[0]

  if (!u.emailVerified && !options.force) {
    return { success: false, reason: "Email is not verified" }
  }

  const prefs = (u.notificationPrefs as Record<string, unknown> | null) ?? {}
  if (prefs.whatsNewEmailSent === true && !options.force) {
    return { success: false, reason: "What's New email already sent to this user" }
  }

  if (!options.force) {
    const existingNotif = await db
      .select({ id: notification.id })
      .from(notification)
      .where(and(eq(notification.userId, userId), eq(notification.type, "whats_new")))
      .limit(1)

    if (existingNotif.length > 0) {
      return { success: false, reason: "What's New notification already exists for this user" }
    }
  }

  // Send the email
  await sendWhatsNewEmail({
    email: u.email,
    name: u.name,
  }).catch((e) => {
    console.warn("[WhatsNew] Email send error:", e)
  })

  // Mark in preferences and add in-app notification
  const updatedPrefs = { ...prefs, whatsNewEmailSent: true }
  await db.update(user).set({ notificationPrefs: updatedPrefs }).where(eq(user.id, userId))

  await db.insert(notification).values({
    userId,
    type: "whats_new",
    title: "What's New in Lumora AI: Gemini 3.7 Flash & Expanded Markets",
    body: "Upgraded to Gemini 3.7 Flash, Google Sign-In, expanded F&O derivatives, and 3-day market intelligence digests.",
    read: false,
  })

  return { success: true }
}

/**
 * Sweeps all verified users and runs scheduled notifications:
 * - 3-day stock digests
 * - Inactive user re-engagements
 */
export async function processIntelligentStockNotifications(): Promise<DigestResult> {
  const result: DigestResult = {
    processed: 0,
    sent: 0,
    skipped: 0,
    errors: [],
  }

  const allUsers = await db
    .select({ id: user.id, email: user.email, emailVerified: user.emailVerified })
    .from(user)
    .where(eq(user.emailVerified, true))

  result.processed = allUsers.length

  for (const u of allUsers) {
    try {
      const res = await processStockDigestForUser(u.id, { force: false })
      if (res.success) {
        result.sent++
      } else {
        // Check inactive user re-engagement if digest was skipped
        const inactiveRes = await processInactiveUserReengagement(u.id, { force: false })
        if (inactiveRes.success) {
          result.sent++
        } else {
          result.skipped++
        }
      }
    } catch (err) {
      result.errors.push({
        userId: u.id,
        error: err instanceof Error ? err.message : String(err),
      })
    }
  }

  return result
}
