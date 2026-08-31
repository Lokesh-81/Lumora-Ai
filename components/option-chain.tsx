"use client"

import { useState, useEffect, useMemo, useRef, memo } from "react"
import { motion, AnimatePresence } from "motion/react"
import useSWR from "swr"
import {
  Loader2,
  AlertCircle,
  ShieldCheck,
  Calendar,
  Layers,
  ChevronDown,
  TrendingUp,
  Target,
  LayoutGrid,
  ListFilter,
  Columns,
  Table,
  Cpu,
  Radio,
} from "lucide-react"
import type { OptionChainData, OptionContract } from "@/lib/options"
import { parseOptionQuery } from "@/lib/instrument"
import { calculateTheoreticalOption } from "@/lib/derivatives/black-scholes"

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

interface StrikeMatrixRow {
  strike: number
  call?: OptionContract
  put?: OptionContract
  isATM: boolean
  isTarget: boolean
  callITM: boolean
  putITM: boolean
  callTheoretical?: ReturnType<typeof calculateTheoreticalOption>
  putTheoretical?: ReturnType<typeof calculateTheoreticalOption>
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
  const [viewMode, setViewMode] = useState<"matrix" | "ladder">("matrix")
  const [typeFilter, setTypeFilter] = useState<"ALL" | "CE" | "PE">("ALL")
  const [strikeRange, setStrikeRange] = useState<number>(10) // ± 10 strikes around ATM
  const [modelMode, setModelMode] = useState<"exchange" | "theoretical">("exchange")
  const tableRef = useRef<HTMLDivElement>(null)

  // Parse if input symbol was a specific option query (e.g. "NIFTY 50 24150 PE" or "NFO:NIFTY-SEP-24150-PE")
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
  const filteredStrikes = useMemo(() => {
    if (!chain?.contracts || chain.contracts.length === 0) return []
    const uniqueStrikes = Array.from(new Set(chain.contracts.map((c) => c.strike))).sort((a, b) => a - b)
    if (uniqueStrikes.length === 0) return []

    if (strikeRange === 0 || atmStrike === 0) {
      return uniqueStrikes
    }

    const atmIndex = uniqueStrikes.indexOf(atmStrike)
    const startIdx = Math.max(0, atmIndex - strikeRange)
    const endIdx = Math.min(uniqueStrikes.length - 1, atmIndex + strikeRange)
    const allowed = new Set(uniqueStrikes.slice(startIdx, endIdx + 1))

    if (targetStrike) {
      const match = uniqueStrikes.find((s) => Math.abs(s - targetStrike) < 0.01)
      if (match) allowed.add(match)
    }

    return uniqueStrikes.filter((s) => allowed.has(s))
  }, [chain, strikeRange, atmStrike, targetStrike])

  // Compute time to expiry in years for theoretical Black-Scholes calculation
  const timeToExpiryYears = useMemo(() => {
    if (!expiry) return 7 / 365
    const expDate = new Date(expiry)
    const now = new Date()
    const diffMs = expDate.getTime() - now.getTime()
    const diffDays = Math.max(0.5, diffMs / (1000 * 60 * 60 * 24))
    return diffDays / 365
  }, [expiry])

  // Matrix rows (Calls on Left, Strike in Center, Puts on Right)
  const matrixRows = useMemo<StrikeMatrixRow[]>(() => {
    if (!chain?.contracts) return []
    const spot = chain.underlyingPrice || 0

    // Single-pass indexed map for O(1) lookups
    const contractMap = new Map<string, OptionContract>()
    for (const c of chain.contracts) {
      contractMap.set(`${c.strike}_${c.type}`, c)
    }

    return filteredStrikes.map((strike) => {
      const call = contractMap.get(`${strike}_CE`)
      const put = contractMap.get(`${strike}_PE`)
      const isATM = Math.abs(strike - atmStrike) < 0.001
      const isTarget = targetStrike !== undefined && Math.abs(strike - targetStrike) < 0.01

      const callTheoretical = spot > 0 ? calculateTheoreticalOption(spot, strike, timeToExpiryYears, 0.15, 0.065, "CE") : undefined
      const putTheoretical = spot > 0 ? calculateTheoreticalOption(spot, strike, timeToExpiryYears, 0.15, 0.065, "PE") : undefined

      return {
        strike,
        call,
        put,
        isATM,
        isTarget,
        callITM: spot > 0 && strike < spot,
        putITM: spot > 0 && strike > spot,
        callTheoretical,
        putTheoretical,
      }
    })
  }, [chain, filteredStrikes, atmStrike, targetStrike, timeToExpiryYears])

  // Ladder rows (Sorted strictly by Strike ascending, grouping CE & PE together)
  const visibleLadderContracts = useMemo(() => {
    if (!chain?.contracts) return []
    const allowedStrikes = new Set(filteredStrikes)

    let list = chain.contracts.filter((c) => allowedStrikes.has(c.strike))

    if (typeFilter !== "ALL") {
      list = list.filter((c) => c.type === typeFilter)
    }

    // Sort by strike ascending, with CE first then PE
    return list.sort((a, b) => {
      if (a.strike !== b.strike) return a.strike - b.strike
      return a.type === "CE" ? -1 : 1
    })
  }, [chain, filteredStrikes, typeFilter])

  // Target contract theoretical calculations (if specific contract selected)
  const targetTheoretical = useMemo(() => {
    if (!chain || !targetStrike || chain.underlyingPrice <= 0) return null
    return calculateTheoreticalOption(
      chain.underlyingPrice,
      targetStrike,
      timeToExpiryYears,
      0.15,
      0.065,
      targetType ?? "CE"
    )
  }, [chain, targetStrike, targetType, timeToExpiryYears])

  if (isLoading && !chain) {
    return (
      <div className="flex h-72 flex-col items-center justify-center gap-3 p-8 text-center">
        <Loader2 className="h-8 w-8 animate-spin text-[var(--gold)]" />
        <span className="text-sm font-medium text-muted-foreground">Resolving canonical exchange option contracts…</span>
      </div>
    )
  }

  if (error || !chain) {
    return (
      <div className="flex h-72 flex-col items-center justify-center gap-3 p-8 text-center">
        <AlertCircle className="h-8 w-8 text-amber-500" />
        <div className="text-sm font-semibold text-foreground">Option chain not available for {symbol}</div>
        <p className="max-w-md text-xs text-muted-foreground">
          Options data is available for major index derivatives (NIFTY, BANKNIFTY, FINNIFTY, SENSEX) and listed equity derivatives.
        </p>
      </div>
    )
  }

  const isLive = chain.isLiveData

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
          value={chain.segment === "BFO" ? "BSE (BFO)" : chain.segment === "NFO" ? "NSE (NFO)" : "Listed Options"}
          hint={chain.underlyingName ?? symbol}
        />
        <StatCard
          label="Market Data Mode"
          value={isLive ? `Live Feed (${chain.provider})` : "Free Market-Data Mode"}
          positive={isLive}
          hint={isLive ? "Live streaming quotes active" : "Spot + Calendar Expiries Active"}
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
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="font-heading text-sm font-semibold text-foreground">
                    Target Contract: {chain.underlyingName} {targetStrike} {targetType ?? "CE/PE"}
                  </h3>
                  {targetTheoretical && (
                    <span className="rounded-md bg-blue-500/10 px-2 py-0.5 text-[10px] font-bold text-blue-600 dark:text-blue-400 border border-blue-500/20">
                      Moneyness: {targetTheoretical.moneyness}
                    </span>
                  )}
                  {isLive ? (
                    <span className="rounded-md bg-emerald-500/10 px-2 py-0.5 text-[10px] font-bold text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                      Live Feed
                    </span>
                  ) : (
                    <span className="rounded-md bg-amber-500/10 px-2 py-0.5 text-[10px] font-bold text-amber-600 dark:text-amber-400 border border-amber-500/20">
                      Free Tier (Spot Grounded)
                    </span>
                  )}
                </div>
                <p className="mt-1 text-xs text-muted-foreground">
                  Underlying: <strong className="text-foreground">{chain.underlyingSymbol}</strong> @ ₹{fmtNA(chain.underlyingPrice)} · Strike: <strong className="text-foreground">{targetStrike}</strong> · Type: <strong className="text-foreground">{targetType ?? "CE/PE"}</strong> · Expiry: <strong className="text-foreground">{targetExpiry ?? expiry}</strong>
                </p>
                {targetTheoretical && modelMode === "theoretical" && (
                  <div className="mt-2.5 flex flex-wrap gap-2 text-xs">
                    <span className="rounded-md bg-[var(--surface-alt)] px-2 py-1 font-mono border" style={{ borderColor: "var(--line)" }}>
                      Theoretical Fair Value: <strong className="text-foreground">₹{targetTheoretical.theoreticalPrice}</strong> [MODELLED]
                    </span>
                    <span className="rounded-md bg-[var(--surface-alt)] px-2 py-1 font-mono border" style={{ borderColor: "var(--line)" }}>
                      Model Delta: <strong className="text-foreground">{targetTheoretical.delta}</strong>
                    </span>
                    <span className="rounded-md bg-[var(--surface-alt)] px-2 py-1 font-mono border" style={{ borderColor: "var(--line)" }}>
                      Daily Theta Decay: <strong className="text-foreground">₹{targetTheoretical.thetaDaily}</strong>
                    </span>
                    <span className="rounded-md bg-[var(--surface-alt)] px-2 py-1 font-mono border" style={{ borderColor: "var(--line)" }}>
                      Break-even: <strong className="text-foreground">₹{targetTheoretical.breakEven}</strong>
                    </span>
                  </div>
                )}
              </div>
            </div>
            <div className="text-xs text-muted-foreground sm:text-right shrink-0">
              <span className="chip text-[11px] font-medium" style={{ background: "var(--surface-alt)" }}>
                {chain.segment === "BFO" ? "BSE Derivative" : "NSE Derivative"}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Free Market-Data Mode Transparency Banner */}
      {!isLive ? (
        <div className="glass-card rounded-2xl border p-4 sm:p-5" style={{ borderColor: "var(--line)" }}>
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3.5">
            <div className="flex items-start gap-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-blue-500/10 text-blue-500 border border-blue-500/20">
                <Radio className="h-4 w-4" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h4 className="font-heading text-xs font-semibold uppercase tracking-wider text-foreground">
                    Free Market-Data Mode Active
                  </h4>
                  <span className="rounded-md bg-blue-500/10 px-2 py-0.5 text-[9px] font-bold text-blue-600 dark:text-blue-400 border border-blue-500/20">
                    LEGITIMATE SOURCES ONLY
                  </span>
                </div>
                <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                  Exchange instruments ({chain.segment === "BFO" ? "BFO" : "NFO"}) and strike ladders are canonical and grounded in real-time underlying spot quotes. Real-time derivative streaming ticks (live traded option LTP, broker orderbook OI, and volume) require institutional feeds not provided on free tiers, so observed exchange columns display as <strong className="text-foreground">—</strong>. You can switch to <strong>Theoretical Model</strong> mode below to inspect Black-Scholes mathematical pricing and Greeks.
                </p>
              </div>
            </div>
          </div>
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
                Streaming live exchange quotes with tick-by-tick derivative LTP, OI, and volume.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Control Bar: Expiry Tabs, View Toggle (Matrix / Ladder), Model Toggle, and Range Selector */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        {/* Expiry Selector Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          <div className="flex items-center gap-1 text-xs text-muted-foreground mr-1.5 shrink-0">
            <Calendar className="h-3.5 w-3.5" />
            <span className="text-[11px] font-semibold uppercase tracking-wider">Expiry:</span>
          </div>
          {expiries.map((exp) => {
            const isSelected = exp === expiry
            return (
              <button
                key={exp}
                onClick={() => setExpiry(exp)}
                className={`shrink-0 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${
                  isSelected
                    ? "bg-[var(--gold)] text-white shadow-sm"
                    : "bg-[var(--surface-alt)] hover:bg-[var(--line)] text-foreground border"
                }`}
                style={!isSelected ? { borderColor: "var(--line)" } : undefined}
              >
                {exp}
              </button>
            )
          })}
        </div>

        {/* View Mode & Model Controls */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Analytics Model Mode Toggle */}
          <div className="flex rounded-lg p-0.5 border" style={{ borderColor: "var(--line)", background: "var(--surface-alt)" }}>
            <button
              onClick={() => setModelMode("exchange")}
              className={`flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-semibold transition-colors ${
                modelMode === "exchange"
                  ? "bg-[var(--surface)] text-foreground shadow-sm font-bold"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <span>Exchange Quotes</span>
            </button>
            <button
              onClick={() => setModelMode("theoretical")}
              className={`flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-semibold transition-colors ${
                modelMode === "theoretical"
                  ? "bg-blue-500/20 text-blue-600 dark:text-blue-400 font-bold shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Cpu className="h-3.5 w-3.5" />
              <span>Theoretical Model</span>
            </button>
          </div>

          {/* Matrix vs Ladder View Toggle */}
          <div className="flex rounded-lg p-0.5 border" style={{ borderColor: "var(--line)", background: "var(--surface-alt)" }}>
            <button
              onClick={() => setViewMode("matrix")}
              className={`flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-medium transition-colors ${
                viewMode === "matrix"
                  ? "bg-[var(--surface)] text-foreground shadow-sm font-bold"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Columns className="h-3.5 w-3.5" />
              <span>Matrix</span>
            </button>
            <button
              onClick={() => setViewMode("ladder")}
              className={`flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-medium transition-colors ${
                viewMode === "ladder"
                  ? "bg-[var(--surface)] text-foreground shadow-sm font-bold"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Table className="h-3.5 w-3.5" />
              <span>Ladder</span>
            </button>
          </div>

          {/* Type Filter (Ladder View Only) */}
          {viewMode === "ladder" && (
            <div className="flex rounded-lg p-0.5 border text-xs" style={{ borderColor: "var(--line)", background: "var(--surface-alt)" }}>
              <button
                onClick={() => setTypeFilter("ALL")}
                className={`rounded-md px-2.5 py-1 font-medium transition-colors ${typeFilter === "ALL" ? "bg-[var(--surface)] text-foreground font-bold" : "text-muted-foreground"}`}
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
          )}

          {/* Range Selector */}
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

      {/* Model Mode Label Banner */}
      {modelMode === "theoretical" && (
        <div className="flex items-center justify-between rounded-xl px-4 py-2.5 text-xs bg-blue-500/10 border border-blue-500/20 text-blue-700 dark:text-blue-300">
          <div className="flex items-center gap-2">
            <Cpu className="h-4 w-4 shrink-0" />
            <span>
              <strong>THEORETICAL / MODELLED ANALYTICS:</strong> Values calculated via Black-Scholes formula (r=6.5%, σ=15% ATM HV) using live underlying spot quote and calendar expiry time. <em>Not exchange-traded prices.</em>
            </span>
          </div>
          <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-blue-500/20 shrink-0 ml-2">
            MODELLED
          </span>
        </div>
      )}

      {/* Main Table: Matrix View (Calls | Strike | Puts) or Ladder View */}
      {viewMode === "matrix" ? (
        <div
          ref={tableRef}
          className="w-full overflow-x-auto rounded-2xl border shadow-inner max-h-[500px] overflow-y-auto scrollbar-thin"
          style={{ borderColor: "var(--line)" }}
        >
          <table className="w-full text-left border-collapse table-auto">
            <thead
              className="sticky top-0 z-20 backdrop-blur-md text-[10px] font-bold uppercase tracking-wider text-muted-foreground"
              style={{ background: "var(--surface-alt)", borderBottom: "1px solid var(--line)" }}
            >
              {/* Main Section Header: Calls | Center Strike | Puts */}
              <tr className="border-b" style={{ borderColor: "var(--line)" }}>
                <th colSpan={5} className="px-4 py-2 text-center text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 font-bold tracking-widest border-r" style={{ borderColor: "var(--line)" }}>
                  CALLS (CE)
                </th>
                <th className="px-5 py-2 text-center text-foreground font-bold tracking-widest bg-[var(--surface)]">
                  STRIKE
                </th>
                <th colSpan={5} className="px-4 py-2 text-center text-rose-600 dark:text-rose-400 bg-rose-500/10 font-bold tracking-widest border-l" style={{ borderColor: "var(--line)" }}>
                  PUTS (PE)
                </th>
              </tr>
              {/* Column Metrics Header */}
              <tr>
                {/* Calls Metrics */}
                <th className="px-3 py-2.5 font-bold whitespace-nowrap text-right">Chg%</th>
                <th className="px-3 py-2.5 font-bold whitespace-nowrap text-right">{modelMode === "theoretical" ? "Delta (Model)" : "Volume"}</th>
                <th className="px-3 py-2.5 font-bold whitespace-nowrap text-right">{modelMode === "theoretical" ? "Theta (Model)" : "OI"}</th>
                <th className="px-3 py-2.5 font-bold whitespace-nowrap text-right">{modelMode === "theoretical" ? "Moneyness" : "IV"}</th>
                <th className="px-4 py-2.5 font-bold whitespace-nowrap text-right border-r" style={{ borderColor: "var(--line)" }}>
                  {modelMode === "theoretical" ? "Theo Value" : "LTP"}
                </th>
                {/* Center Strike */}
                <th className="px-6 py-2.5 font-bold whitespace-nowrap text-center bg-[var(--surface)]">Price</th>
                {/* Puts Metrics */}
                <th className="px-4 py-2.5 font-bold whitespace-nowrap text-left border-l" style={{ borderColor: "var(--line)" }}>
                  {modelMode === "theoretical" ? "Theo Value" : "LTP"}
                </th>
                <th className="px-3 py-2.5 font-bold whitespace-nowrap text-left">{modelMode === "theoretical" ? "Moneyness" : "IV"}</th>
                <th className="px-3 py-2.5 font-bold whitespace-nowrap text-left">{modelMode === "theoretical" ? "Theta (Model)" : "OI"}</th>
                <th className="px-3 py-2.5 font-bold whitespace-nowrap text-left">{modelMode === "theoretical" ? "Delta (Model)" : "Volume"}</th>
                <th className="px-3 py-2.5 font-bold whitespace-nowrap text-left">Chg%</th>
              </tr>
            </thead>
            <tbody>
              {matrixRows.map((row) => (
                <MatrixRow
                  key={`matrix-strike-${row.strike}`}
                  row={row}
                  targetType={targetType}
                  modelMode={modelMode}
                />
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div
          ref={tableRef}
          className="w-full overflow-x-auto rounded-2xl border shadow-inner max-h-[500px] overflow-y-auto scrollbar-thin"
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
                <th className="px-5 py-3.5 font-bold whitespace-nowrap">Mode / Status</th>
                <th className="px-5 py-3.5 font-bold whitespace-nowrap">
                  {modelMode === "theoretical" ? "Theo Fair Value" : "LTP (Premium)"}
                </th>
                <th className="px-5 py-3.5 font-bold whitespace-nowrap">
                  {modelMode === "theoretical" ? "Moneyness" : "IV"}
                </th>
                <th className="px-5 py-3.5 font-bold whitespace-nowrap hidden md:table-cell">
                  {modelMode === "theoretical" ? "Model Delta" : "Delta"}
                </th>
                <th className="px-5 py-3.5 font-bold whitespace-nowrap hidden lg:table-cell">
                  {modelMode === "theoretical" ? "Model Gamma" : "Gamma"}
                </th>
                <th className="px-5 py-3.5 font-bold whitespace-nowrap hidden lg:table-cell">
                  {modelMode === "theoretical" ? "Daily Theta" : "Theta"}
                </th>
                <th className="px-5 py-3.5 font-bold whitespace-nowrap hidden xl:table-cell">
                  {modelMode === "theoretical" ? "Model Vega" : "Vega"}
                </th>
                <th className="px-5 py-3.5 font-bold whitespace-nowrap">OI</th>
                <th className="px-5 py-3.5 font-bold whitespace-nowrap">Volume</th>
                <th className="px-6 py-3.5 font-bold whitespace-nowrap text-right sm:text-left">Chg%</th>
              </tr>
            </thead>
            <tbody>
              {visibleLadderContracts.map((contract) => {
                const theoretical =
                  chain.underlyingPrice > 0
                    ? calculateTheoreticalOption(
                        chain.underlyingPrice,
                        contract.strike,
                        timeToExpiryYears,
                        0.15,
                        0.065,
                        contract.type
                      )
                    : undefined
                return (
                  <OptionRow
                    key={`${contract.strike}-${contract.type}-${contract.expiry}`}
                    contract={contract}
                    atmStrike={atmStrike}
                    defaultStrike={targetStrike}
                    defaultType={targetType}
                    modelMode={modelMode}
                    theoretical={theoretical}
                  />
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

const MatrixRow = memo(function MatrixRow({
  row,
  targetType,
  modelMode,
}: {
  row: StrikeMatrixRow
  targetType?: "CE" | "PE"
  modelMode: "exchange" | "theoretical"
}) {
  const { strike, call, put, isATM, isTarget, callITM, putITM, callTheoretical, putTheoretical } = row

  const isCallTarget = isTarget && (!targetType || targetType === "CE")
  const isPutTarget = isTarget && (!targetType || targetType === "PE")

  return (
    <tr
      data-strike={strike}
      className={`border-b transition-colors hover:bg-[var(--surface-alt)]/70 ${
        isATM ? "bg-[var(--info)]/[0.07]" : ""
      }`}
      style={{ borderColor: "var(--line)" }}
    >
      {/* CALL SIDE */}
      {/* Call Chg% */}
      <td className={`px-3 py-2.5 font-mono text-xs text-right tabular-nums whitespace-nowrap ${callITM ? "bg-emerald-500/[0.04]" : ""}`}>
        {call?.hasLiveData && call.changePercent != null ? (
          <span className={call.changePercent >= 0 ? "text-emerald-600 dark:text-emerald-400 font-semibold" : "text-rose-600 dark:text-rose-400 font-semibold"}>
            {call.changePercent >= 0 ? "+" : ""}{call.changePercent.toFixed(1)}%
          </span>
        ) : (
          <span className="text-muted-foreground/40">—</span>
        )}
      </td>

      {/* Call Metric 2 (Delta in theoretical mode, Volume in exchange mode) */}
      <td className={`px-3 py-2.5 font-mono text-xs text-right tabular-nums text-muted-foreground whitespace-nowrap ${callITM ? "bg-emerald-500/[0.04]" : ""}`}>
        {modelMode === "theoretical" && callTheoretical ? (
          <span className="text-foreground">{callTheoretical.delta}</span>
        ) : call?.hasLiveData && call.volume != null ? (
          bigNum(call.volume)
        ) : (
          <span className="text-muted-foreground/40">—</span>
        )}
      </td>

      {/* Call Metric 3 (Theta in theoretical mode, OI in exchange mode) */}
      <td className={`px-3 py-2.5 font-mono text-xs text-right tabular-nums text-muted-foreground whitespace-nowrap ${callITM ? "bg-emerald-500/[0.04]" : ""}`}>
        {modelMode === "theoretical" && callTheoretical ? (
          <span className="text-foreground font-mono">₹{callTheoretical.thetaDaily}</span>
        ) : call?.hasLiveData && call.openInterest != null ? (
          bigNum(call.openInterest)
        ) : (
          <span className="text-muted-foreground/40">—</span>
        )}
      </td>

      {/* Call Metric 4 (Moneyness in theoretical mode, IV in exchange mode) */}
      <td className={`px-3 py-2.5 font-mono text-xs text-right tabular-nums text-muted-foreground whitespace-nowrap ${callITM ? "bg-emerald-500/[0.04]" : ""}`}>
        {modelMode === "theoretical" && callTheoretical ? (
          <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${callTheoretical.moneyness === "ITM" ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400" : callTheoretical.moneyness === "ATM" ? "bg-blue-500/10 text-blue-600 dark:text-blue-400" : "bg-zinc-500/10 text-muted-foreground"}`}>
            {callTheoretical.moneyness}
          </span>
        ) : call?.hasLiveData && call.iv != null ? (
          `${fmt(call.iv, 1)}%`
        ) : (
          <span className="text-muted-foreground/40">—</span>
        )}
      </td>

      {/* Call LTP / Theoretical Fair Value */}
      <td className={`px-4 py-2.5 font-mono text-xs font-bold text-right tabular-nums whitespace-nowrap border-r ${
        isCallTarget ? "bg-[var(--gold)]/15 text-foreground ring-1 ring-inset ring-[var(--gold)]/50" : callITM ? "bg-emerald-500/[0.06] text-emerald-950 dark:text-emerald-100" : "text-foreground"
      }`} style={{ borderColor: "var(--line)" }}>
        {modelMode === "theoretical" && callTheoretical ? (
          <span className="text-blue-600 dark:text-blue-400 font-bold">₹{callTheoretical.theoreticalPrice}</span>
        ) : call?.hasLiveData && call.premium != null ? (
          fmt(call.premium)
        ) : (
          <span className="text-muted-foreground/40">—</span>
        )}
      </td>

      {/* CENTER STRIKE */}
      <td className={`px-5 py-2.5 font-mono text-xs font-bold text-center tabular-nums whitespace-nowrap ${
        isATM
          ? "bg-[var(--info)]/20 text-foreground font-black ring-1 ring-inset ring-[var(--info)]/50"
          : isTarget
          ? "bg-[var(--gold)]/20 text-foreground font-black ring-1 ring-inset ring-[var(--gold)]/50"
          : "bg-[var(--surface-alt)]/60 text-foreground"
      }`}>
        <div className="flex items-center justify-center gap-1.5">
          <span>{strike.toFixed(0)}</span>
          {isATM && (
            <span className="rounded-md bg-[var(--info)]/20 px-1.5 py-0.2 text-[8px] font-bold uppercase tracking-wider text-[var(--info)] border border-[var(--info)]/30">
              ATM
            </span>
          )}
          {isTarget && (
            <span className="rounded-md bg-[var(--gold)]/20 px-1.5 py-0.2 text-[8px] font-bold uppercase tracking-wider text-[var(--gold)] border border-[var(--gold)]/30">
              TARGET
            </span>
          )}
        </div>
      </td>

      {/* PUT SIDE */}
      {/* Put LTP / Theoretical Fair Value */}
      <td className={`px-4 py-2.5 font-mono text-xs font-bold text-left tabular-nums whitespace-nowrap border-l ${
        isPutTarget ? "bg-[var(--gold)]/15 text-foreground ring-1 ring-inset ring-[var(--gold)]/50" : putITM ? "bg-rose-500/[0.06] text-rose-950 dark:text-rose-100" : "text-foreground"
      }`} style={{ borderColor: "var(--line)" }}>
        {modelMode === "theoretical" && putTheoretical ? (
          <span className="text-blue-600 dark:text-blue-400 font-bold">₹{putTheoretical.theoreticalPrice}</span>
        ) : put?.hasLiveData && put.premium != null ? (
          fmt(put.premium)
        ) : (
          <span className="text-muted-foreground/40">—</span>
        )}
      </td>

      {/* Put Metric 2 (Moneyness in theoretical mode, IV in exchange mode) */}
      <td className={`px-3 py-2.5 font-mono text-xs text-left tabular-nums text-muted-foreground whitespace-nowrap ${putITM ? "bg-rose-500/[0.04]" : ""}`}>
        {modelMode === "theoretical" && putTheoretical ? (
          <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${putTheoretical.moneyness === "ITM" ? "bg-rose-500/10 text-rose-600 dark:text-rose-400" : putTheoretical.moneyness === "ATM" ? "bg-blue-500/10 text-blue-600 dark:text-blue-400" : "bg-zinc-500/10 text-muted-foreground"}`}>
            {putTheoretical.moneyness}
          </span>
        ) : put?.hasLiveData && put.iv != null ? (
          `${fmt(put.iv, 1)}%`
        ) : (
          <span className="text-muted-foreground/40">—</span>
        )}
      </td>

      {/* Put Metric 3 (Theta in theoretical mode, OI in exchange mode) */}
      <td className={`px-3 py-2.5 font-mono text-xs text-left tabular-nums text-muted-foreground whitespace-nowrap ${putITM ? "bg-rose-500/[0.04]" : ""}`}>
        {modelMode === "theoretical" && putTheoretical ? (
          <span className="text-foreground font-mono">₹{putTheoretical.thetaDaily}</span>
        ) : put?.hasLiveData && put.openInterest != null ? (
          bigNum(put.openInterest)
        ) : (
          <span className="text-muted-foreground/40">—</span>
        )}
      </td>

      {/* Put Metric 4 (Delta in theoretical mode, Volume in exchange mode) */}
      <td className={`px-3 py-2.5 font-mono text-xs text-left tabular-nums text-muted-foreground whitespace-nowrap ${putITM ? "bg-rose-500/[0.04]" : ""}`}>
        {modelMode === "theoretical" && putTheoretical ? (
          <span className="text-foreground">{putTheoretical.delta}</span>
        ) : put?.hasLiveData && put.volume != null ? (
          bigNum(put.volume)
        ) : (
          <span className="text-muted-foreground/40">—</span>
        )}
      </td>

      {/* Put Chg% */}
      <td className={`px-3 py-2.5 font-mono text-xs text-left tabular-nums whitespace-nowrap ${putITM ? "bg-rose-500/[0.04]" : ""}`}>
        {put?.hasLiveData && put.changePercent != null ? (
          <span className={put.changePercent >= 0 ? "text-emerald-600 dark:text-emerald-400 font-semibold" : "text-rose-600 dark:text-rose-400 font-semibold"}>
            {put.changePercent >= 0 ? "+" : ""}{put.changePercent.toFixed(1)}%
          </span>
        ) : (
          <span className="text-muted-foreground/40">—</span>
        )}
      </td>
    </tr>
  )
})

const OptionRow = memo(function OptionRow({
  contract,
  atmStrike,
  defaultStrike,
  defaultType,
  modelMode,
  theoretical,
}: {
  contract: OptionContract
  atmStrike: number
  defaultStrike?: number
  defaultType?: "CE" | "PE"
  modelMode: "exchange" | "theoretical"
  theoretical?: ReturnType<typeof calculateTheoreticalOption>
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

      {/* STATUS / MODE */}
      <td className="px-5 py-3.5 whitespace-nowrap text-xs">
        {modelMode === "theoretical" ? (
          <span className="inline-flex items-center gap-1 text-blue-600 dark:text-blue-400 font-semibold text-[10px]">
            <Cpu className="h-3 w-3" />
            Modelled
          </span>
        ) : contract.hasLiveData ? (
          <span className="inline-flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-semibold text-[11px]">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
            Live Feed
          </span>
        ) : (
          <span className="text-muted-foreground/70 font-mono text-[10px]">Free Mode (Offline)</span>
        )}
      </td>

      {/* LTP (PREMIUM) / THEORETICAL FAIR VALUE */}
      <td className="px-5 py-3.5 font-mono text-xs font-semibold tabular-nums text-foreground whitespace-nowrap">
        {modelMode === "theoretical" && theoretical ? (
          <span className="text-blue-600 dark:text-blue-400 font-bold">₹{theoretical.theoreticalPrice}</span>
        ) : contract.hasLiveData && contract.premium != null ? (
          fmt(contract.premium)
        ) : (
          <span className="text-muted-foreground/40">—</span>
        )}
      </td>

      {/* MONEYNESS / IV */}
      <td className="px-5 py-3.5 font-mono text-xs tabular-nums text-muted-foreground whitespace-nowrap">
        {modelMode === "theoretical" && theoretical ? (
          <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${theoretical.moneyness === "ITM" ? (isCall ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400" : "bg-rose-500/10 text-rose-600 dark:text-rose-400") : theoretical.moneyness === "ATM" ? "bg-blue-500/10 text-blue-600 dark:text-blue-400" : "bg-zinc-500/10 text-muted-foreground"}`}>
            {theoretical.moneyness}
          </span>
        ) : contract.hasLiveData && contract.iv != null ? (
          `${fmt(contract.iv, 1)}%`
        ) : (
          <span className="text-muted-foreground/40">—</span>
        )}
      </td>

      {/* DELTA */}
      <td className="px-5 py-3.5 font-mono text-xs tabular-nums text-muted-foreground hidden md:table-cell whitespace-nowrap">
        {modelMode === "theoretical" && theoretical ? (
          <span className="text-foreground">{theoretical.delta}</span>
        ) : contract.hasLiveData && contract.delta != null ? (
          fmt(contract.delta, 2)
        ) : (
          <span className="text-muted-foreground/40">—</span>
        )}
      </td>

      {/* GAMMA */}
      <td className="px-5 py-3.5 font-mono text-xs tabular-nums text-muted-foreground hidden lg:table-cell whitespace-nowrap">
        {modelMode === "theoretical" && theoretical ? (
          <span className="text-foreground">{theoretical.gamma}</span>
        ) : contract.hasLiveData && contract.gamma != null ? (
          fmt(contract.gamma, 4)
        ) : (
          <span className="text-muted-foreground/40">—</span>
        )}
      </td>

      {/* THETA */}
      <td className="px-5 py-3.5 font-mono text-xs tabular-nums text-muted-foreground hidden lg:table-cell whitespace-nowrap">
        {modelMode === "theoretical" && theoretical ? (
          <span className="text-foreground">₹{theoretical.thetaDaily}</span>
        ) : contract.hasLiveData && contract.theta != null ? (
          fmt(contract.theta, 2)
        ) : (
          <span className="text-muted-foreground/40">—</span>
        )}
      </td>

      {/* VEGA */}
      <td className="px-5 py-3.5 font-mono text-xs tabular-nums text-muted-foreground hidden xl:table-cell whitespace-nowrap">
        {modelMode === "theoretical" && theoretical ? (
          <span className="text-foreground">{theoretical.vega1Pct}</span>
        ) : contract.hasLiveData && contract.vega != null ? (
          fmt(contract.vega, 2)
        ) : (
          <span className="text-muted-foreground/40">—</span>
        )}
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
})

const StatCard = memo(function StatCard({
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
})
