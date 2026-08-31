"use client"

import { useEffect, useRef, useState } from "react"
import { AnimatePresence, motion } from "motion/react"
import { Search, Loader2, Clock, TrendingUp, X, ChevronRight } from "lucide-react"
import { logActivity } from "@/app/actions/activity"

export type SearchResult = {
  symbol: string
  name: string
  exchange: string
  type: string
  strike?: number
  optionType?: "CE" | "PE"
  expiry?: string
  underlying?: string
}

const RECENT_STORAGE_KEY = "lumora_recent_searches"

const TRENDING_QUICK: SearchResult[] = [
  { symbol: "^NSEI", name: "NIFTY 50", exchange: "NSE", type: "INDEX" },
  { symbol: "^NSEBANK", name: "BANK NIFTY", exchange: "NSE", type: "INDEX" },
  { symbol: "RELIANCE.NS", name: "Reliance Industries", exchange: "NSE", type: "EQUITY" },
  { symbol: "TCS.NS", name: "Tata Consultancy Services", exchange: "NSE", type: "EQUITY" },
  { symbol: "NFO:NIFTY-SEP-24500-CE", name: "NIFTY 24500 CE", exchange: "NSE", type: "OPTION", strike: 24500, optionType: "CE", expiry: "SEP", underlying: "NIFTY 50" },
  { symbol: "^BSESN", name: "BSE SENSEX", exchange: "BSE", type: "INDEX" },
  { symbol: "GC=F", name: "Gold Futures", exchange: "COMEX", type: "COMMODITY" },
  { symbol: "BTC-USD", name: "Bitcoin", exchange: "CCC", type: "CRYPTO" },
]

export function SymbolSearch({ onSelect }: { onSelect: (result: SearchResult) => void }) {
  const [q, setQ] = useState("")
  const [results, setResults] = useState<SearchResult[]>([])
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [active, setActive] = useState(0)
  const [focused, setFocused] = useState(false)
  const [recent, setRecent] = useState<SearchResult[]>([])

  const boxRef = useRef<HTMLDivElement>(null)
  const listRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    try {
      const stored = localStorage.getItem(RECENT_STORAGE_KEY)
      if (stored) setRecent(JSON.parse(stored))
    } catch {}
  }, [])

  function saveRecent(item: SearchResult) {
    try {
      const updated = [item, ...recent.filter((r) => r.symbol !== item.symbol || r.name !== item.name)].slice(0, 8)
      setRecent(updated)
      localStorage.setItem(RECENT_STORAGE_KEY, JSON.stringify(updated))
    } catch {}
  }

  function clearRecent() {
    setRecent([])
    try {
      localStorage.removeItem(RECENT_STORAGE_KEY)
    } catch {}
  }

  useEffect(() => {
    const trimmed = q.trim()
    if (!trimmed) {
      setResults([])
      setLoading(false)
      return
    }

    setLoading(true)
    const controller = new AbortController()
    let active = true

    const id = setTimeout(async () => {
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(trimmed)}`, {
          signal: controller.signal,
          cache: "no-store",
        })
        const data = await res.json()
        if (active) {
          setResults(data.results || [])
          setOpen(true)
          setActive(0)
        }
      } catch (err: unknown) {
        if ((err as Error)?.name !== "AbortError" && active) {
          setResults([])
        }
      } finally {
        if (active) {
          setLoading(false)
        }
      }
    }, 120)

    return () => {
      active = false
      controller.abort()
      clearTimeout(id)
    }
  }, [q])

  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (boxRef.current && !boxRef.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener("mousedown", onClick)
    return () => document.removeEventListener("mousedown", onClick)
  }, [])

  // Auto-scroll active keyboard item into view
  useEffect(() => {
    if (!open || !listRef.current) return
    const activeEl = listRef.current.querySelector(`[data-index="${active}"]`)
    if (activeEl) {
      activeEl.scrollIntoView({ block: "nearest", behavior: "smooth" })
    }
  }, [active, open])

  function choose(r: SearchResult) {
    saveRecent(r)
    onSelect(r)
    logActivity({ type: "search", title: `Searched ${r.symbol}`, ticker: r.symbol, href: "/markets?symbol=" + r.symbol }).catch(() => {})
    setQ("")
    setResults([])
    setOpen(false)
  }

  function typeBadge(t: string) {
    switch (t.toUpperCase()) {
      case "OPTION":
        return <span className="rounded-md bg-purple-500/20 text-purple-700 dark:text-purple-300 px-2 py-0.5 text-[10px] font-bold border border-purple-500/30 tracking-wider">OPTION</span>
      case "FUTURE":
      case "COMMODITY":
        return <span className="rounded-md bg-amber-500/20 text-amber-700 dark:text-amber-300 px-2 py-0.5 text-[10px] font-bold border border-amber-500/30 tracking-wider">FUT/COMM</span>
      case "INDEX":
        return <span className="rounded-md bg-blue-500/20 text-blue-700 dark:text-blue-300 px-2 py-0.5 text-[10px] font-bold border border-blue-500/30 tracking-wider">INDEX</span>
      case "EQUITY":
        return <span className="rounded-md bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 px-2 py-0.5 text-[10px] font-bold border border-emerald-500/30 tracking-wider">EQUITY</span>
      case "CRYPTO":
        return <span className="rounded-md bg-cyan-500/20 text-cyan-700 dark:text-cyan-300 px-2 py-0.5 text-[10px] font-bold border border-cyan-500/30 tracking-wider">CRYPTO</span>
      case "FOREX":
      case "CURRENCY":
        return <span className="rounded-md bg-pink-500/20 text-pink-700 dark:text-pink-300 px-2 py-0.5 text-[10px] font-bold border border-pink-500/30 tracking-wider">FOREX</span>
      default:
        return <span className="rounded-md bg-slate-500/20 text-slate-700 dark:text-slate-300 px-2 py-0.5 text-[10px] font-bold border border-slate-500/30 tracking-wider">{t}</span>
    }
  }

  return (
    <div ref={boxRef} className="relative w-full max-w-2xl z-40">
      <motion.div
        className={`flex items-center gap-3 rounded-[24px] px-5 py-3.5 glass-strong transition-all duration-300 ${
          focused
            ? "ring-2 ring-[var(--gold)] border-transparent shadow-xl shadow-[var(--gold)]/10"
            : "border border-[var(--line-strong)] shadow-sm"
        }`}
        animate={focused ? { scale: 1.005 } : { scale: 1 }}
        transition={{ type: "spring", stiffness: 250, damping: 20 }}
      >
        {loading ? (
          <Loader2 className="h-4 w-4 shrink-0 animate-spin text-[var(--gold)]" />
        ) : (
          <Search className="h-4 w-4 shrink-0 text-muted-foreground" />
        )}
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          onFocus={() => {
            setFocused(true)
            setOpen(true)
          }}
          onBlur={() => setFocused(false)}
          onKeyDown={(e) => {
            if (e.key === "Escape") {
              setOpen(false)
              return
            }
            if (!open) return
            const maxIdx = q.trim() ? results.length - 1 : recent.length + TRENDING_QUICK.length - 1
            if (e.key === "ArrowDown") {
              e.preventDefault()
              setActive((a) => Math.min(a + 1, maxIdx))
            } else if (e.key === "ArrowUp") {
              e.preventDefault()
              setActive((a) => Math.max(a - 1, 0))
            } else if (e.key === "Enter") {
              e.preventDefault()
              if (q.trim() && results[active]) {
                choose(results[active])
              } else if (!q.trim()) {
                const combined = [...recent, ...TRENDING_QUICK]
                if (combined[active]) choose(combined[active])
              }
            }
          }}
          placeholder="Search stocks, indices, options (e.g. NIFTY 50 24150 PE, SENSEX 77400 PE)…"
          className="w-full bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground/70 font-medium"
          aria-label="Search symbols"
        />
        {q && (
          <button
            onClick={() => {
              setQ("")
              setResults([])
            }}
            className="text-muted-foreground hover:text-foreground p-1 transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        )}
        <kbd className="hidden rounded-lg border border-[var(--line)] bg-[var(--surface-alt)] px-2 py-0.5 text-[10px] font-mono text-muted-foreground sm:block">
          ESC
        </kbd>
      </motion.div>

      <AnimatePresence>
        {open && (
          <motion.div
            onMouseDown={(e) => e.preventDefault()}
            initial={{ opacity: 0, y: -6, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.98 }}
            transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
            className="absolute z-[100] mt-2 w-full overflow-hidden rounded-[24px] border border-neutral-300 dark:border-neutral-700/80 bg-white dark:bg-[#0c121e] backdrop-blur-2xl shadow-2xl shadow-black/20 dark:shadow-black/70 ring-1 ring-black/10 dark:ring-white/10"
          >
            <div ref={listRef} className="max-h-[380px] overflow-y-auto p-2 scrollbar-thin">
              {q.trim() ? (
                results.length > 0 ? (
                  results.map((r, i) => (
                    <motion.button
                      key={`${r.symbol}-${r.type}-${r.strike ?? ""}-${r.optionType ?? ""}-${r.expiry ?? ""}-${i}`}
                      data-index={i}
                      onClick={() => choose(r)}
                      onMouseEnter={() => setActive(i)}
                      className={`flex w-full items-center justify-between gap-4 rounded-xl px-3.5 py-2.5 text-left transition-all ${
                        i === active
                          ? "bg-[var(--gold)]/15 dark:bg-neutral-800 text-foreground ring-1 ring-[var(--gold)]/50 shadow-sm"
                          : "hover:bg-neutral-100 dark:hover:bg-neutral-800/60 text-foreground"
                      }`}
                    >
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          {typeBadge(r.type)}
                          <span className="font-mono text-sm font-bold tracking-tight text-neutral-950 dark:text-neutral-50">
                            {r.type === "OPTION"
                              ? `${r.underlying ?? r.symbol} · ${r.expiry ? `${r.expiry} ` : ""}${r.strike ?? ""} ${r.optionType ?? ""}`.trim()
                              : r.symbol}
                          </span>
                        </div>
                        <div className="truncate text-xs font-medium text-neutral-600 dark:text-neutral-300 mt-0.5">
                          {r.type === "OPTION"
                            ? `${r.exchange ?? "NSE"} · ${r.name || `${r.underlying} ${r.strike} ${r.optionType}`}`
                            : r.name}
                        </div>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <span className="rounded-full border border-neutral-300 dark:border-neutral-700 bg-neutral-100 dark:bg-neutral-800/80 px-2.5 py-0.5 text-[10px] font-mono font-bold text-neutral-800 dark:text-neutral-200">
                          {r.exchange || r.type}
                        </span>
                        <ChevronRight className="h-3.5 w-3.5 text-neutral-400 dark:text-neutral-500" />
                      </div>
                    </motion.button>
                  ))
                ) : (
                  <div className="p-6 text-center text-sm font-medium text-neutral-600 dark:text-neutral-400">
                    No matching instruments found for &ldquo;{q}&rdquo;
                  </div>
                )
              ) : (
                <div className="p-2 space-y-3">
                  {recent.length > 0 && (
                    <div>
                      <div className="flex items-center justify-between px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-neutral-700 dark:text-neutral-300">
                        <span className="flex items-center gap-1.5"><Clock className="h-3 w-3 text-[var(--gold)]" /> Recent Searches</span>
                        <button onClick={clearRecent} className="text-[10px] font-semibold text-neutral-500 hover:text-neutral-900 dark:hover:text-neutral-100">Clear</button>
                      </div>
                      <div className="grid grid-cols-2 gap-1.5 mt-1">
                        {recent.map((r, i) => (
                          <button
                            key={`rec-${r.symbol}-${i}`}
                            data-index={i}
                            onClick={() => choose(r)}
                            onMouseEnter={() => setActive(i)}
                            className={`flex items-center justify-between rounded-xl px-3 py-2 text-left text-xs transition-all ${
                              i === active
                                ? "bg-[var(--gold)]/15 dark:bg-neutral-800 text-neutral-950 dark:text-neutral-50 ring-1 ring-[var(--gold)]/40"
                                : "bg-neutral-100 dark:bg-neutral-800/50 hover:bg-neutral-200 dark:hover:bg-neutral-800 text-neutral-800 dark:text-neutral-200"
                            }`}
                          >
                            <span className="font-mono font-bold truncate text-neutral-900 dark:text-neutral-100">{r.symbol}</span>
                            <span className="text-[10px] font-medium text-neutral-600 dark:text-neutral-400 truncate ml-1.5">{r.name}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  <div>
                    <div className="px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-neutral-700 dark:text-neutral-300 flex items-center gap-1.5">
                      <TrendingUp className="h-3 w-3 text-[var(--gold)]" /> Trending Universe
                    </div>
                    <div className="grid grid-cols-2 gap-1.5 mt-1">
                      {TRENDING_QUICK.map((r, i) => {
                        const idx = recent.length + i
                        return (
                          <button
                            key={`trend-${r.symbol}-${i}`}
                            data-index={idx}
                            onClick={() => choose(r)}
                            onMouseEnter={() => setActive(idx)}
                            className={`flex items-center justify-between rounded-xl px-3 py-2 text-left text-xs transition-all ${
                              idx === active
                                ? "bg-[var(--gold)]/15 dark:bg-neutral-800 text-neutral-950 dark:text-neutral-50 ring-1 ring-[var(--gold)]/40"
                                : "bg-neutral-100 dark:bg-neutral-800/50 hover:bg-neutral-200 dark:hover:bg-neutral-800 text-neutral-800 dark:text-neutral-200"
                            }`}
                          >
                            <span className="font-mono font-bold text-neutral-900 dark:text-neutral-100">{r.name}</span>
                            <span className="text-[10px] font-semibold text-neutral-500 dark:text-neutral-400">{r.type}</span>
                          </button>
                        )
                      })}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

