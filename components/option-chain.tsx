"use client"

import { useState, useEffect, useMemo, useRef } from "react"
import { motion, AnimatePresence } from "motion/react"
import useSWR from "swr"
import {
  Loader2,
  AlertCircle,
  ShieldCheck,
  CheckCircle2,
  Info,
  Calendar,
  Layers,
  ChevronRight,
  ChevronDown,
  TrendingUp,
  TrendingDown,
  Target,
  Radio,
  KeyRound,
  ExternalLink,
} from "lucide-react"
import type { OptionChainData, OptionContract } from "@/lib/options"
import { parseOptionQuery } from "@/lib/instrument"

const fetcher = (url: string) => fetch(url).then((r) => r.json())

function fmt(n: number | null | undefined, d = 2) {
  return n == null ? "—" : n.toLocaleString(undefined, { minimumFractionDigits: d, maximumFractionDigits: d })
}

function fmtNA(n: number | null | undefined, d = 2) {
  return n == null ? "—" : n.toLocaleString(undefined, { minimumFractionDigits: d, maximumFractionDigits: d })
}

function bigNum(n: number | undefined | null) {
  if (n == null) return "—"
  if (n >= 1e7) return `${(n / 1e7).toFixed(1)}Cr`
  if (n >= 1e5) return `${(n / 1e5).toFixed(1)}L`
  if (n >= 1e3) return `${(n / 1e3).toFixed(1)}K`
  return n.toLocaleString()
}

export function OptionChain({
  symbol,
  defaultStrike,
  defaultType,
  defaultExpiry,
}: {
  symbol: string
  defaultStrike?: number
  defaultType?: "CE" | "PE"
  defaultExpiry?: string
}) {
  const [expiry, setExpiry] = useState("")
  const [expiries, setExpiries] = useState<string[]>([])
  const [typeFilter, setTypeFilter] = useState<"ALL" | "CE" | "PE">("ALL")
  const [strikeRange, setStrikeRange] = useState<number>(10) // ± 10 strikes around ATM
  const [showBrokerGuide, setShowBrokerGuide] = useState(false)
  const tableRef = useRef<HTMLDivElement>(null)

  // Parse if input symbol was a specific option query (e.g. "NIFTY 24250 CE" or "NFO:NIFTY-AUG-24250-CE")
  const parsedOption = useMemo(() => parseOptionQuery(symbol), [symbol])

  const targetStrike = defaultStrike ?? parsedOption?.strike
  const targetType = defaultType ?? parsedOption?.optionType
  const targetExpiry = defaultExpiry ?? parsedOption?.expiry

  const { data, isLoading, error } = useSWR(
    `/api/options?symbol=${encodeURIComponent(symbol)}${expiry ? `&expiry=${encodeURIComponent(expiry)}` : ""}`,
    fetcher,
    { revalidateOnFocus: false, dedupingInterval: 15000 }
  )

  useEffect(() => {
    if (data?.data?.expiries) {
      setExpiries(data.data.expiries)
      if (!expiry && data.data.expiries.length > 0) {
        if (targetExpiry) {
          const tUpper = targetExpiry.toUpperCase()
          const matched = data.data.expiries.find((e: string) => {
            if (e === targetExpiry) return true
            const d = new Date(e)
            const m = d.toLocaleDateString("en-US", { month: "short" }).toUpperCase()
            return m === tUpper || e.toUpperCase().includes(tUpper)
          })
          setExpiry(matched ?? data.data.expiry ?? data.data.expiries[0])
        } else {
          setExpiry(data.data.expiry ?? data.data.expiries[0])
        }
      }
    }
  }, [data, expiry, targetExpiry])

  const chain: OptionChainData | null = data?.data ?? null
  const available = data?.available ?? false

  // Determine EXACT single ATM strike based on minimum absolute difference to spot
  const atmStrike = useMemo(() => {
    if (!chain || !chain.contracts || chain.contracts.length === 0) return 0
    const spot = chain.underlyingPrice
    const uniqueStrikes = Array.from(new Set(chain.contracts.map((c) => c.strike))).sort((a, b) => a - b)
    if (uniqueStrikes.length === 0) return 0

    return uniqueStrikes.reduce((closest, curr) => {
      return Math.abs(curr - spot) < Math.abs(closest - spot) ? curr : closest
    }, uniqueStrikes[0])
  }, [chain])

  // Filter strikes around ATM for compact, scannable viewing
  const visibleContracts = useMemo(() => {
    if (!chain?.contracts) return []
    let list = chain.contracts

    if (typeFilter !== "ALL") {
      list = list.filter((c) => c.type === typeFilter)
    }

    if (strikeRange > 0 && atmStrike > 0) {
      const uniqueStrikes = Array.from(new Set(chain.contracts.map((c) => c.strike))).sort((a, b) => a - b)
      const atmIndex = uniqueStrikes.indexOf(atmStrike)

      const startIdx = Math.max(0, atmIndex - strikeRange)
      const endIdx = Math.min(uniqueStrikes.length - 1, atmIndex + strikeRange)
      const allowedStrikes = new Set(uniqueStrikes.slice(startIdx, endIdx + 1))

      list = list.filter((c) => allowedStrikes.has(c.strike) || (targetStrike && Math.abs(c.strike - targetStrike) < 0.01))
    }

    return list
  }, [chain, typeFilter, strikeRange, atmStrike, targetStrike])

  // Auto-scroll to target strike or ATM strike
  useEffect(() => {
    if (!tableRef.current) return
    const target = targetStrike ?? atmStrike
    if (!target) return

    const rows = tableRef.current.querySelectorAll("[data-strike]")
    let closestRow: Element | null = null
    let minDiff = Infinity

    rows.forEach((r) => {
      const strikeVal = Number(r.getAttribute("data-strike"))
      if (!isNaN(strikeVal)) {
        const diff = Math.abs(strikeVal - target)
        if (diff < minDiff) {
          minDiff = diff
          closestRow = r
        }
      }
    })

    if (closestRow) {
      setTimeout(() => {
        (closestRow as HTMLElement).scrollIntoView({ behavior: "smooth", block: "center" })
      }, 150)
    }
  }, [targetStrike, atmStrike, visibleContracts])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center gap-2.5 py-12 text-sm text-muted-foreground">
        <Loader2 className="h-4 w-4 animate-spin text-[var(--gold)]" />
        <span>Resolving option contracts &amp; underlying spot…</span>
      </div>
    )
  }

  if (error || (!available && !isLoading) || !chain) {
    return (
      <div className="glass-card rounded-[24px] p-6 text-center border" style={{ borderColor: "var(--line)" }}>
        <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-[var(--surface-alt)]">
          <AlertCircle className="h-6 w-6 text-muted-foreground" />
        </div>
        <h4 className="font-heading text-sm font-semibold text-foreground">Options chain unavailable</h4>
        <p className="mt-1 text-xs text-muted-foreground max-w-md mx-auto">
          No listed options contracts found for {symbol}. Direct exchange option chains are available for listed US equities or through a connected broker feed.
        </p>
      </div>
    )
  }

  const isLive = chain.isLiveData === true

  return (
    <div className="p-6 space-y-6">
      {/* Top Stat Cards */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Live Spot Quote"
          value={fmtNA(chain.underlyingPrice)}
          change={
            chain.underlyingChangePercent != null
              ? `${chain.underlyingChangePercent >= 0 ? "+" : ""}${chain.underlyingChangePercent.toFixed(2)}%`
              : undefined
          }
          positive={chain.underlyingChangePercent != null ? chain.underlyingChangePercent >= 0 : undefined}
          hint="Exchange Spot (Active Live)"
        />
        <StatCard
          label="Exchange & Segment"
          value={chain.segment === "BFO" ? "BSE (BFO)" : chain.segment === "NFO" ? "NSE (NFO)" : "US Listed Options"}
          hint={chain.underlyingName ?? symbol}
        />
        <StatCard
          label="Derivative Feed"
          value={isLive ? `Active (${chain.provider})` : "Feed Unavailable"}
          positive={isLive}
          hint={isLive ? "Live streaming quotes" : "Requires Broker API Credentials"}
        />
        <StatCard
          label="Nearest ATM Strike"
          value={atmStrike > 0 ? fmt(atmStrike, 0) : "—"}
          hint="Calculated from live underlying spot"
        />
      </div>

      {/* Target Selected Contract Card (if a specific strike or contract was requested) */}
      {targetStrike && (
        <div className="glass-card rounded-2xl border p-4 sm:p-5" style={{ borderColor: "var(--gold-line)", background: "var(--surface)" }}>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[var(--gold)]/10 text-[var(--gold)] border border-[var(--gold)]/20">
                <Target className="h-5 w-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-heading text-sm font-semibold text-foreground">
                    Target Contract: {chain.underlyingName} {targetStrike} {targetType ?? "CE/PE"}
                  </h3>
                  {isLive ? (
                    <span className="rounded-md bg-emerald-500/10 px-2 py-0.5 text-[10px] font-bold text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                      Live Derivative Feed Active
                    </span>
                  ) : (
                    <span className="rounded-md bg-amber-500/10 px-2 py-0.5 text-[10px] font-bold text-amber-600 dark:text-amber-400 border border-amber-500/20">
                      Contract Resolved (Feed Unavailable)
                    </span>
                  )}
                </div>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  Underlying: <strong className="text-foreground">{chain.underlyingSymbol}</strong> @ ₹{fmtNA(chain.underlyingPrice)} · Strike: <strong className="text-foreground">{targetStrike}</strong> · Type: <strong className="text-foreground">{targetType ?? "CE"}</strong> · Expiry: <strong className="text-foreground">{targetExpiry ?? expiry}</strong>
                </p>
              </div>
            </div>
            <div className="text-xs text-muted-foreground sm:text-right">
              <span className="chip text-[11px] font-medium" style={{ background: "var(--surface-alt)" }}>
                {chain.segment === "BFO" ? "BSE Derivative" : "NSE Derivative"}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Feed Status Banner */}
      {!isLive ? (
        <div className="glass-card rounded-2xl border p-4 sm:p-5" style={{ borderColor: "var(--line)" }}>
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3.5">
            <div className="flex items-start gap-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[var(--surface-alt)] border" style={{ borderColor: "var(--line)" }}>
                <KeyRound className="h-4 w-4 text-[var(--gold)]" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h4 className="font-heading text-xs font-semibold uppercase tracking-wider text-foreground">
                    Contract Resolution Active — Live Derivative Quote Feed Unavailable
                  </h4>
                </div>
                <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                  Real exchange derivative instruments (NFO/BFO) are fully resolved and grounded in live underlying spot quotes. Real-time derivative streaming fields (LTP, OI, Volume, IV, Greeks) require broker credentials (Zerodha Kite, Upstox, Dhan HQ, or Angel One) in environment variables.
                </p>
              </div>
            </div>
            <button
              onClick={() => setShowBrokerGuide(!showBrokerGuide)}
              className="inline-flex items-center gap-1.5 self-start shrink-0 rounded-lg px-3 py-1.5 text-xs font-semibold bg-[var(--surface-alt)] hover:bg-[var(--line)] text-foreground transition-colors border"
              style={{ borderColor: "var(--line)" }}
            >
              <span>Broker Setup</span>
              <ChevronDown className={`h-3.5 w-3.5 transition-transform ${showBrokerGuide ? "rotate-180" : ""}`} />
            </button>
          </div>

          <AnimatePresence>
            {showBrokerGuide && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="mt-4 pt-4 border-t space-y-3 overflow-hidden text-xs text-muted-foreground"
                style={{ borderColor: "var(--line)" }}
              >
                <div className="font-semibold text-foreground">To stream live derivative market data, set any of the following in your environment:</div>
                <div className="grid gap-2 sm:grid-cols-2">
                  <div className="p-2.5 rounded-xl bg-[var(--surface-alt)] border" style={{ borderColor: "var(--line)" }}>
                    <div className="font-semibold text-foreground">Zerodha Kite Connect v3</div>
                    <div className="font-mono text-[10px] mt-1 text-muted-foreground">ZERODHA_KITE_API_KEY=...<br/>ZERODHA_KITE_ACCESS_TOKEN=...</div>
                  </div>
                  <div className="p-2.5 rounded-xl bg-[var(--surface-alt)] border" style={{ borderColor: "var(--line)" }}>
                    <div className="font-semibold text-foreground">Upstox API v2</div>
                    <div className="font-mono text-[10px] mt-1 text-muted-foreground">UPSTOX_ACCESS_TOKEN=...</div>
                  </div>
                  <div className="p-2.5 rounded-xl bg-[var(--surface-alt)] border" style={{ borderColor: "var(--line)" }}>
                    <div className="font-semibold text-foreground">Dhan HQ API v2</div>
                    <div className="font-mono text-[10px] mt-1 text-muted-foreground">DHAN_ACCESS_TOKEN=...<br/>DHAN_CLIENT_ID=...</div>
                  </div>
                  <div className="p-2.5 rounded-xl bg-[var(--surface-alt)] border" style={{ borderColor: "var(--line)" }}>
                    <div className="font-semibold text-foreground">Angel One SmartAPI</div>
                    <div className="font-mono text-[10px] mt-1 text-muted-foreground">ANGEL_ONE_API_KEY=...<br/>ANGEL_ONE_JWT_TOKEN=...</div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      ) : (
        <div className="glass-card rounded-2xl border p-4 sm:p-5 bg-emerald-500/5" style={{ borderColor: "rgba(16,185,129,0.2)" }}>
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
              <ShieldCheck className="h-4 w-4" />
            </div>
            <div>
              <h4 className="font-heading text-xs font-semibold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                Live Derivative Feed Active (via {chain.provider})
              </h4>
              <p className="mt-0.5 text-xs text-muted-foreground">
                Streaming live exchange quotes, open interest, and contract metrics for {chain.underlyingName}.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Expiry Selector & Filters */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
        {/* Expiries */}
        {expiries.length > 0 && (
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground mr-1">
              Expiry:
            </span>
            {expiries.slice(0, 6).map((e, idx) => {
              const dateObj = new Date(e)
              const formatted = isNaN(dateObj.getTime())
                ? e
                : dateObj.toLocaleDateString("en-US", { day: "numeric", month: "short" })
              return (
                <button
                  key={e}
                  onClick={() => setExpiry(e)}
                  className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${
                    expiry === e
                      ? "bg-[var(--gold)] text-white shadow-sm ring-1 ring-blue-400/40"
                      : "bg-[var(--surface-alt)] hover:bg-[var(--line)] text-foreground/80"
                  }`}
                >
                  {formatted} {idx === 0 ? "(Near)" : ""}
                </button>
              )
            })}
          </div>
        )}

        {/* Side and Range Filters */}
        <div className="flex items-center gap-2.5">
          <div className="flex items-center rounded-lg border border-[var(--line)] bg-[var(--surface-alt)] p-0.5 text-xs">
            <button
              onClick={() => setTypeFilter("ALL")}
              className={`rounded-md px-2.5 py-1 font-medium transition-colors ${typeFilter === "ALL" ? "bg-[var(--surface)] text-foreground font-bold shadow-xs" : "text-muted-foreground"}`}
            >
              All
            </button>
            <button
              onClick={() => setTypeFilter("CE")}
              className={`rounded-md px-2.5 py-1 font-medium transition-colors ${typeFilter === "CE" ? "bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 font-bold" : "text-muted-foreground"}`}
            >
              Calls
            </button>
            <button
              onClick={() => setTypeFilter("PE")}
              className={`rounded-md px-2.5 py-1 font-medium transition-colors ${typeFilter === "PE" ? "bg-rose-500/20 text-rose-600 dark:text-rose-400 font-bold" : "text-muted-foreground"}`}
            >
              Puts
            </button>
          </div>

          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <span className="hidden sm:inline text-[11px] font-semibold uppercase tracking-wider">Range:</span>
            <select
              value={strikeRange}
              onChange={(e) => setStrikeRange(Number(e.target.value))}
              aria-label="Strike range around ATM"
              className="rounded-lg border border-[var(--line)] bg-[var(--surface-alt)] px-2.5 py-1 text-xs font-medium text-foreground outline-none cursor-pointer"
            >
              <option value={5}>±5 Strikes</option>
              <option value={8}>±8 Strikes</option>
              <option value={10}>±10 Strikes (Default)</option>
              <option value={15}>±15 Strikes</option>
              <option value={20}>±20 Strikes</option>
              <option value={0}>All Strikes</option>
            </select>
          </div>
        </div>
      </div>

      {/* Contract & Strike Ladder Table */}
      <div
        ref={tableRef}
        className="w-full overflow-x-auto rounded-2xl border shadow-inner max-h-[460px] overflow-y-auto scrollbar-thin"
        style={{ borderColor: "var(--line)" }}
      >
        <table className="w-full text-left border-collapse table-auto">
          <thead
            className="sticky top-0 z-20 backdrop-blur-md text-[10px] font-bold uppercase tracking-wider text-muted-foreground"
            style={{ background: "var(--surface-alt)", borderBottom: "1px solid var(--line)" }}
          >
            <tr>
              <th className="px-6 py-3.5 font-bold whitespace-nowrap">Strike</th>
              <th className="px-5 py-3.5 font-bold whitespace-nowrap">Side</th>
              <th className="px-5 py-3.5 font-bold whitespace-nowrap">Feed Status</th>
              <th className="px-5 py-3.5 font-bold whitespace-nowrap">LTP (Premium)</th>
              <th className="px-5 py-3.5 font-bold whitespace-nowrap">IV</th>
              <th className="px-5 py-3.5 font-bold whitespace-nowrap hidden md:table-cell">Delta</th>
              <th className="px-5 py-3.5 font-bold whitespace-nowrap hidden lg:table-cell">Gamma</th>
              <th className="px-5 py-3.5 font-bold whitespace-nowrap hidden lg:table-cell">Theta</th>
              <th className="px-5 py-3.5 font-bold whitespace-nowrap hidden xl:table-cell">Vega</th>
              <th className="px-5 py-3.5 font-bold whitespace-nowrap">OI</th>
              <th className="px-5 py-3.5 font-bold whitespace-nowrap">Volume</th>
              <th className="px-6 py-3.5 font-bold whitespace-nowrap text-right sm:text-left">Chg%</th>
            </tr>
          </thead>
          <tbody>
            {visibleContracts.map((contract) => (
              <OptionRow
                key={`${contract.strike}-${contract.type}-${contract.expiry}`}
                contract={contract}
                atmStrike={atmStrike}
                defaultStrike={targetStrike}
                defaultType={targetType}
              />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

function OptionRow({
  contract,
  atmStrike,
  defaultStrike,
  defaultType,
}: {
  contract: OptionContract
  atmStrike: number
  defaultStrike?: number
  defaultType?: "CE" | "PE"
}) {
  const isTargetStrike =
    defaultStrike !== undefined &&
    Math.abs(contract.strike - defaultStrike) < 0.01 &&
    (!defaultType || contract.type === defaultType)

  const isCall = contract.type === "CE"
  const isATM = Math.abs(contract.strike - atmStrike) < 0.001

  return (
    <tr
      data-strike={contract.strike}
      className={`border-b transition-colors hover:bg-[var(--surface-alt)] ${
        isTargetStrike
          ? "bg-[var(--gold)]/10 ring-1 ring-inset ring-[var(--gold)]/40 font-medium"
          : isATM
          ? "bg-[var(--info)]/[0.07]"
          : ""
      }`}
      style={{ borderColor: "var(--line)" }}
    >
      {/* STRIKE */}
      <td className="px-6 py-3.5 font-mono text-xs font-bold text-foreground tabular-nums whitespace-nowrap">
        <div className="flex items-center gap-2.5">
          <span>{contract.strike.toFixed(0)}</span>
          {isATM && (
            <span className="rounded-md bg-[var(--info)]/20 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-[var(--info)] border border-[var(--info)]/30">
              ATM
            </span>
          )}
          {isTargetStrike && (
            <span className="rounded-md bg-[var(--gold)]/20 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-[var(--gold)] border border-[var(--gold)]/30">
              TARGET
            </span>
          )}
        </div>
      </td>

      {/* SIDE */}
      <td className="px-5 py-3.5 whitespace-nowrap">
        <span
          className={`inline-flex items-center rounded-md px-2.5 py-0.5 text-[10px] font-bold ${
            isCall
              ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20"
              : "bg-rose-500/15 text-rose-600 dark:text-rose-400 border border-rose-500/20"
          }`}
        >
          {contract.type}
        </span>
      </td>

      {/* STATUS */}
      <td className="px-5 py-3.5 whitespace-nowrap text-xs">
        {contract.hasLiveData ? (
          <span className="inline-flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-semibold text-[11px]">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
            Live Feed
          </span>
        ) : (
          <span className="text-muted-foreground/70 font-mono text-[10px]">Resolved (Offline)</span>
        )}
      </td>

      {/* LTP (PREMIUM) */}
      <td className="px-5 py-3.5 font-mono text-xs font-semibold tabular-nums text-foreground whitespace-nowrap">
        {contract.hasLiveData && contract.premium != null ? (
          fmt(contract.premium)
        ) : (
          <span className="text-muted-foreground/40">—</span>
        )}
      </td>

      {/* IV */}
      <td className="px-5 py-3.5 font-mono text-xs tabular-nums text-muted-foreground whitespace-nowrap">
        {contract.hasLiveData && contract.iv != null ? `${fmt(contract.iv, 1)}%` : <span className="text-muted-foreground/40">—</span>}
      </td>

      {/* DELTA */}
      <td className="px-5 py-3.5 font-mono text-xs tabular-nums text-muted-foreground hidden md:table-cell whitespace-nowrap">
        {contract.hasLiveData && contract.delta != null ? fmt(contract.delta, 2) : <span className="text-muted-foreground/40">—</span>}
      </td>

      {/* GAMMA */}
      <td className="px-5 py-3.5 font-mono text-xs tabular-nums text-muted-foreground hidden lg:table-cell whitespace-nowrap">
        {contract.hasLiveData && contract.gamma != null ? fmt(contract.gamma, 4) : <span className="text-muted-foreground/40">—</span>}
      </td>

      {/* THETA */}
      <td className="px-5 py-3.5 font-mono text-xs tabular-nums text-muted-foreground hidden lg:table-cell whitespace-nowrap">
        {contract.hasLiveData && contract.theta != null ? fmt(contract.theta, 2) : <span className="text-muted-foreground/40">—</span>}
      </td>

      {/* VEGA */}
      <td className="px-5 py-3.5 font-mono text-xs tabular-nums text-muted-foreground hidden xl:table-cell whitespace-nowrap">
        {contract.hasLiveData && contract.vega != null ? fmt(contract.vega, 2) : <span className="text-muted-foreground/40">—</span>}
      </td>

      {/* OI */}
      <td className="px-5 py-3.5 font-mono text-xs tabular-nums text-muted-foreground whitespace-nowrap">
        {contract.hasLiveData && contract.openInterest != null ? bigNum(contract.openInterest) : <span className="text-muted-foreground/40">—</span>}
      </td>

      {/* VOLUME */}
      <td className="px-5 py-3.5 font-mono text-xs tabular-nums text-muted-foreground whitespace-nowrap">
        {contract.hasLiveData && contract.volume != null ? bigNum(contract.volume) : <span className="text-muted-foreground/40">—</span>}
      </td>

      {/* CHG% */}
      <td className="px-6 py-3.5 font-mono text-xs tabular-nums whitespace-nowrap text-right sm:text-left">
        {contract.hasLiveData && contract.changePercent != null ? (
          <span className={contract.changePercent > 0 ? "text-emerald-600 dark:text-emerald-400 font-semibold" : contract.changePercent < 0 ? "text-rose-600 dark:text-rose-400 font-semibold" : "text-muted-foreground"}>
            {contract.changePercent > 0 ? "+" : ""}{contract.changePercent.toFixed(1)}%
          </span>
        ) : (
          <span className="text-muted-foreground/40">—</span>
        )}
      </td>
    </tr>
  )
}

function StatCard({
  label,
  value,
  change,
  positive,
  hint,
}: {
  label: string
  value: string
  change?: string
  positive?: boolean
  hint?: string
}) {
  return (
    <div className="glass-card rounded-2xl px-4 py-3.5 border" style={{ borderColor: "var(--line)" }}>
      <div className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">{label}</div>
      <div className="mt-1 font-heading text-base font-semibold text-foreground tabular-nums">{value}</div>
      {change && (
        <div className={`mt-0.5 text-xs font-medium ${positive === true ? "text-emerald-600 dark:text-emerald-400" : positive === false ? "text-rose-600 dark:text-rose-400" : "text-muted-foreground"}`}>
          {change}
        </div>
      )}
      {hint && !change && (
        <div className="mt-0.5 text-[10px] text-muted-foreground/70">{hint}</div>
      )}
    </div>
  )
}
