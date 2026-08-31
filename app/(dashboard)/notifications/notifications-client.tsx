"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "motion/react"
import Link from "next/link"
import { Bell, TrendingUp, Brain, Wallet, Check, CheckCheck, Trash2, Loader2, Plus, Sparkles, SlidersHorizontal, ShieldCheck, Mail } from "lucide-react"
import { markNotificationRead, markAllNotificationsRead, deleteNotification, triggerStockDigestForCurrentUser } from "@/app/actions/notifications"
import { updateProfile } from "@/app/actions/profile"
import { useRouter } from "next/navigation"

type Notif = { id: number; type: string; title: string; body: string | null; read: boolean; createdAt: string }

const ICONS: Record<string, React.ElementType> = {
  price: TrendingUp,
  ai: Brain,
  portfolio: Wallet,
  general: Bell,
  stock_digest: Brain,
  stock: TrendingUp,
  alert: TrendingUp,
  whats_new: Sparkles,
  inactive_nudge: Bell,
}

export function NotificationsClient({
  notifications: initial,
  initialPrefs = {},
}: {
  notifications: Notif[]
  initialPrefs?: Record<string, boolean>
}) {
  const router = useRouter()
  const [items, setItems] = useState(initial)
  const [busy, setBusy] = useState<number | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [successMsg, setSuccessMsg] = useState<string | null>(null)
  const [generatingDigest, setGeneratingDigest] = useState(false)
  const [deleting, setDeleting] = useState<number | null>(null)
  const [pushStatus, setPushStatus] = useState<"granted" | "denied" | "default" | "unsupported">("unsupported")
  const [showSettings, setShowSettings] = useState(false)
  const [savingPrefs, setSavingPrefs] = useState(false)

  const [prefs, setPrefs] = useState({
    stockDigest: initialPrefs.stockDigest !== false,
    priceAlerts: initialPrefs.priceAlerts !== false,
    aiInsights: initialPrefs.aiInsights !== false,
    portfolioUpdates: initialPrefs.portfolioUpdates !== false,
    marketNews: initialPrefs.marketNews !== false,
    inactiveUserNudge: initialPrefs.inactiveUserNudge !== false,
  })

  useEffect(() => {
    if (typeof window !== "undefined" && "Notification" in window) {
      setPushStatus(Notification.permission as "granted" | "denied" | "default")
    }
  }, [])

  async function requestPushPermission() {
    if (typeof window === "undefined" || !("Notification" in window)) {
      setPushStatus("unsupported")
      return
    }
    try {
      const res = await Notification.requestPermission()
      setPushStatus(res)
      if (res === "granted") {
        new Notification("Lumora AI Notifications Enabled", {
          body: "You will now receive instant market alerts and AI analysis updates.",
          icon: "/favicon.ico",
        })
      }
    } catch {
      setPushStatus("denied")
    }
  }

  useEffect(() => { setItems(initial) }, [initial])

  async function togglePref(key: keyof typeof prefs) {
    const updated = { ...prefs, [key]: !prefs[key] }
    setPrefs(updated)
    setSavingPrefs(true)
    try {
      await updateProfile({ notificationPrefs: updated })
      setSuccessMsg("Notification preferences saved")
      setTimeout(() => setSuccessMsg(null), 3000)
    } catch (e: any) {
      setError(e?.message || "Failed to save preferences")
    } finally {
      setSavingPrefs(false)
    }
  }

  async function markRead(id: number) {
    setBusy(id)
    try {
      await markNotificationRead(id)
      setItems((p) => p.map((n) => (n.id === id ? { ...n, read: true } : n)))
      router.refresh()
    } catch (e: any) { setError(e?.message || "Failed") } finally { setBusy(null) }
  }

  async function markAll() {
    setBusy(-1)
    try {
      await markAllNotificationsRead()
      setItems((p) => p.map((n) => ({ ...n, read: true })))
      router.refresh()
    } catch (e: any) { setError(e?.message || "Failed") } finally { setBusy(null) }
  }

  async function handleGenerateDigest() {
    setGeneratingDigest(true)
    setError(null)
    setSuccessMsg(null)
    try {
      const res = await triggerStockDigestForCurrentUser()
      if (res.success) {
        setSuccessMsg(`Generated 3-day intelligence digest for: ${res.symbols?.join(", ") || "tracked assets"}`)
        router.refresh()
      } else {
        setError(res.reason || "Could not generate stock digest")
      }
    } catch (e: any) {
      setError(e?.message || "Failed to generate stock digest")
    } finally {
      setGeneratingDigest(false)
    }
  }

  async function remove(id: number) {
    setDeleting(id)
    try { await deleteNotification(id); setItems((p) => p.filter((n) => n.id !== id)) }
    catch (e: any) { setError(e?.message || "Failed") } finally { setDeleting(null) }
  }

  const unread = items.filter((n) => !n.read).length

  return (
    <div className="p-6 lg:p-8">
      <hr className="divider divider--gold" />
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }} className="page-head mb-8 flex flex-wrap items-end justify-between gap-4">
        <div className="glow-page">
          <p className="subheading"><span className="dot-gold" /> Notifications</p>
          <h1 className="heading mt-1">Alerts &amp; Updates</h1>
          <p className="body mt-2">
            {items.length > 0 ? (unread > 0 ? `${unread} unread ${unread === 1 ? "notification" : "notifications"}` : "You're all caught up") : "No notifications yet"}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setShowSettings(!showSettings)}
            className={`btn flex items-center gap-2 px-3.5 py-2.5 text-xs font-semibold ${showSettings ? "border-[var(--gold)] text-[var(--gold)]" : ""}`}
            title="Configure notification channels and preferences"
          >
            <SlidersHorizontal className="h-3.5 w-3.5" />
            Preferences
          </button>
          <button
            onClick={handleGenerateDigest}
            disabled={generatingDigest}
            className="btn btn--gold flex items-center gap-2 px-4 py-2.5 text-xs font-semibold disabled:opacity-50"
            title="Generate personalized market intelligence based on your tracked stocks and activity"
          >
            {generatingDigest ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <Sparkles className="h-3.5 w-3.5" />
            )}
            3-Day Stock Digest
          </button>
          {pushStatus === "default" && (
            <button
              onClick={requestPushPermission}
              className="lm-btn lm-btn-gold rounded-full px-4 py-2 text-xs font-semibold"
            >
              <Bell className="h-3.5 w-3.5" /> Enable Browser Push
            </button>
          )}
          {pushStatus === "granted" && (
            <span className="inline-flex items-center gap-1.5 rounded-full border border-pos/30 bg-pos/10 px-3 py-1 text-xs font-medium text-pos">
              <Check className="h-3.5 w-3.5" /> Browser Push Active
            </span>
          )}
          {pushStatus === "denied" && (
            <span className="inline-flex items-center gap-1.5 rounded-full border border-neg/30 bg-neg/10 px-3 py-1 text-xs font-medium text-neg">
              Browser Push Blocked
            </span>
          )}
          <AnimatePresence>
            {unread > 0 && (
              <motion.button
                initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                onClick={markAll} disabled={busy === -1}
                className="btn flex items-center gap-2 px-4 py-2.5 text-xs disabled:opacity-50"
              >
                {busy === -1 ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <CheckCheck className="h-3.5 w-3.5" />} Mark all read
              </motion.button>
            )}
          </AnimatePresence>
        </div>
      </motion.div>

      {/* Expandable Notification Preferences Panel */}
      <AnimatePresence>
        {showSettings && (
          <motion.div
            initial={{ opacity: 0, height: 0, y: -10 }}
            animate={{ opacity: 1, height: "auto", y: 0 }}
            exit={{ opacity: 0, height: 0, y: -10 }}
            transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
            className="mb-8 overflow-hidden rounded-2xl border border-[var(--glass-border)] bg-[var(--glass-bg)] p-6 backdrop-blur-md shadow-xl"
          >
            <div className="flex items-center justify-between border-b border-[var(--glass-border)] pb-4">
              <div>
                <h3 className="text-sm font-semibold text-[var(--text-primary)] flex items-center gap-2">
                  <Mail className="h-4 w-4 text-[var(--gold)]" />
                  Email &amp; Alert Delivery Preferences
                </h3>
                <p className="text-xs text-[var(--text-tertiary)] mt-0.5">
                  Control which automated market updates and digests Lumora AI sends to your verified email.
                </p>
              </div>
              {savingPrefs && (
                <div className="flex items-center gap-1.5 text-xs text-[var(--gold)]">
                  <Loader2 className="h-3 w-3 animate-spin" />
                  <span>Saving...</span>
                </div>
              )}
            </div>

            <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <label className="flex items-start gap-3 rounded-xl border border-[var(--glass-border)] p-3.5 cursor-pointer hover:bg-[var(--glass-bg-hover)] transition-colors">
                <input
                  type="checkbox"
                  checked={prefs.stockDigest}
                  onChange={() => togglePref("stockDigest")}
                  className="mt-0.5 h-4 w-4 rounded accent-[var(--gold)] cursor-pointer"
                />
                <div className="min-w-0 flex-1">
                  <div className="text-xs font-semibold text-[var(--text-primary)]">3-Day Stock Digest</div>
                  <div className="text-[11px] text-[var(--text-tertiary)] mt-0.5">
                    Personalized multi-asset Gemini 3.7 Flash digest based on your tracked stocks.
                  </div>
                </div>
              </label>

              <label className="flex items-start gap-3 rounded-xl border border-[var(--glass-border)] p-3.5 cursor-pointer hover:bg-[var(--glass-bg-hover)] transition-colors">
                <input
                  type="checkbox"
                  checked={prefs.priceAlerts}
                  onChange={() => togglePref("priceAlerts")}
                  className="mt-0.5 h-4 w-4 rounded accent-[var(--gold)] cursor-pointer"
                />
                <div className="min-w-0 flex-1">
                  <div className="text-xs font-semibold text-[var(--text-primary)]">Price &amp; Target Alerts</div>
                  <div className="text-[11px] text-[var(--text-tertiary)] mt-0.5">
                    Triggered notifications when watchlisted assets hit key support or resistance targets.
                  </div>
                </div>
              </label>

              <label className="flex items-start gap-3 rounded-xl border border-[var(--glass-border)] p-3.5 cursor-pointer hover:bg-[var(--glass-bg-hover)] transition-colors">
                <input
                  type="checkbox"
                  checked={prefs.aiInsights}
                  onChange={() => togglePref("aiInsights")}
                  className="mt-0.5 h-4 w-4 rounded accent-[var(--gold)] cursor-pointer"
                />
                <div className="min-w-0 flex-1">
                  <div className="text-xs font-semibold text-[var(--text-primary)]">AI Research Notes</div>
                  <div className="text-[11px] text-[var(--text-tertiary)] mt-0.5">
                    Automated technical deep-dives and momentum analysis generated by Gemini.
                  </div>
                </div>
              </label>

              <label className="flex items-start gap-3 rounded-xl border border-[var(--glass-border)] p-3.5 cursor-pointer hover:bg-[var(--glass-bg-hover)] transition-colors">
                <input
                  type="checkbox"
                  checked={prefs.portfolioUpdates}
                  onChange={() => togglePref("portfolioUpdates")}
                  className="mt-0.5 h-4 w-4 rounded accent-[var(--gold)] cursor-pointer"
                />
                <div className="min-w-0 flex-1">
                  <div className="text-xs font-semibold text-[var(--text-primary)]">Portfolio Risk &amp; Valuation</div>
                  <div className="text-[11px] text-[var(--text-tertiary)] mt-0.5">
                    Periodic summaries of overall portfolio allocation, drawdown risks, and returns.
                  </div>
                </div>
              </label>

              <label className="flex items-start gap-3 rounded-xl border border-[var(--glass-border)] p-3.5 cursor-pointer hover:bg-[var(--glass-bg-hover)] transition-colors">
                <input
                  type="checkbox"
                  checked={prefs.marketNews}
                  onChange={() => togglePref("marketNews")}
                  className="mt-0.5 h-4 w-4 rounded accent-[var(--gold)] cursor-pointer"
                />
                <div className="min-w-0 flex-1">
                  <div className="text-xs font-semibold text-[var(--text-primary)]">Market News &amp; Macro</div>
                  <div className="text-[11px] text-[var(--text-tertiary)] mt-0.5">
                    High-impact macroeconomic announcements, RBI/Fed interest rate decisions, and sector moves.
                  </div>
                </div>
              </label>

              <label className="flex items-start gap-3 rounded-xl border border-[var(--glass-border)] p-3.5 cursor-pointer hover:bg-[var(--glass-bg-hover)] transition-colors">
                <input
                  type="checkbox"
                  checked={prefs.inactiveUserNudge}
                  onChange={() => togglePref("inactiveUserNudge")}
                  className="mt-0.5 h-4 w-4 rounded accent-[var(--gold)] cursor-pointer"
                />
                <div className="min-w-0 flex-1">
                  <div className="text-xs font-semibold text-[var(--text-primary)]">Re-Engagement Briefs</div>
                  <div className="text-[11px] text-[var(--text-tertiary)] mt-0.5">
                    A brief check-in email with key price movements if you haven't visited in 3 days.
                  </div>
                </div>
              </label>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {successMsg && (
          <motion.p initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} className="mb-4 rounded-xl border border-[var(--pos-glow)] bg-[var(--pos-glow)] px-4 py-2.5 text-xs text-[var(--pos)]">{successMsg}</motion.p>
        )}
        {error && (
          <motion.p initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} className="mb-4 rounded-xl border border-[var(--neg-glow)] bg-[var(--neg-glow)] px-4 py-2.5 text-xs text-[var(--neg)]">{error}</motion.p>
        )}
      </AnimatePresence>

      {items.length === 0 ? (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }} className="bento-card relative overflow-hidden px-8 py-14 text-center">
          <div className="pointer-events-none absolute -inset-20 opacity-40" style={{ background: 'radial-gradient(circle at 50% 0%, var(--gold-glow-strong), transparent 60%)' }} />
          <div className="relative mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-[var(--gold-glow)]"><Bell className="h-7 w-7 text-[var(--gold)]" /></div>
          <p className="heading-sm">You're all caught up</p>
          <p className="body mt-2 mx-auto max-w-sm">New price alerts and AI insights will appear here as they happen.</p>
          <div className="relative mt-8 rounded-2xl border border-[var(--gold-line)] bg-[var(--gold-glow)] p-4 text-left">
            <p className="meta mb-1.5 text-[var(--gold)]">Get notified about</p>
            <ul className="space-y-1.5 text-sm text-[var(--text-secondary)]">
              <li className="flex items-center gap-2"><span className="h-1.5 w-1.5 rounded-full bg-[var(--gold)]" />Price moves on your watchlisted stocks</li>
              <li className="flex items-center gap-2"><span className="h-1.5 w-1.5 rounded-full bg-[var(--gold)]" />New AI analysis &amp; trade-plan insights</li>
              <li className="flex items-center gap-2"><span className="h-1.5 w-1.5 rounded-full bg-[var(--gold)]" />Portfolio valuation &amp; allocation updates</li>
            </ul>
            <Link href="/watchlist" className="btn btn--gold sweep mt-4"><Plus className="h-3.5 w-3.5" />Add a stock to watch</Link>
          </div>
        </motion.div>
      ) : (
        <div className="grid gap-3 lg:grid-cols-2">
          <AnimatePresence mode="popLayout">
            {items.map((n, i) => {
              const Icon = ICONS[n.type] || Bell
              return (
                <motion.div
                  key={n.id} layout
                  initial={{ opacity: 0, x: -16, scale: 0.97 }}
                  whileHover={{ y: -4 }}
                  animate={{ opacity: 1, x: 0, scale: 1 }}
                  exit={{ opacity: 0, x: 16, scale: 0.97, filter: "blur(4px)" }}
                  transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1], delay: deleting === n.id ? 0 : 0.03 * i }}
                  className={`glass-card flex items-start gap-3.5 p-4 transition-all ${
                    deleting === n.id ? "pointer-events-none scale-95 opacity-0 blur-sm" : n.read ? "" : "border-l-2 border-l-gold"
                  }`}
                >
                  <div className={`relative mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${n.read ? "bg-[var(--panel-2)] text-[var(--text-tertiary)]" : "bg-[var(--gold-glow)] text-[var(--gold)]"}`}>
                    {!n.read && <span className="absolute -right-0.5 -top-0.5 h-2 w-2 rounded-full bg-[var(--gold)]" />}
                    <Icon className="h-4 w-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-[var(--text-primary)]">{n.title}</p>
                    {n.body && <p className="body mt-0.5">{n.body}</p>}
                    <p className="meta mt-1">{new Date(n.createdAt).toLocaleString("en-US", { timeZone: "UTC", year: "numeric", month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}</p>
                  </div>
                  <div className="flex items-center gap-1 opacity-60 transition-opacity duration-200 hover:opacity-100">
                    {!n.read && (
                      <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} onClick={() => markRead(n.id)} disabled={busy === n.id} title="Mark read"
                        className="rounded-lg p-2 text-[var(--text-tertiary)] transition-colors hover:bg-[var(--pos-glow)] hover:text-[var(--pos)]">
                        {busy === n.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
                      </motion.button>
                    )}
                    <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} onClick={() => remove(n.id)} disabled={deleting === n.id} title="Delete"
                      className="rounded-lg p-2 text-[var(--text-tertiary)] transition-colors hover:bg-[var(--neg-glow)] hover:text-[var(--neg)]">
                      {deleting === n.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                    </motion.button>
                  </div>
                </motion.div>
              )
            })}
          </AnimatePresence>
        </div>
      )}
    </div>
  )
}
