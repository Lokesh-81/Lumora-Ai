import type { Metadata } from "next"
import Link from "next/link"
import { notFound } from "next/navigation"
import {
  ArrowRight,
  ChevronRight,
  Layers,
  ShieldCheck,
  Target,
  TrendingDown,
  TrendingUp,
  Zap,
  Info,
  Clock,
  Landmark,
  Compass,
} from "lucide-react"
import { LumoraMark } from "@/components/lumora-mark"
import { getQuote } from "@/lib/market"
import {
  parseContractSlug,
  computeMoneyness,
  getSiblingStrikes,
  TOP_CANONICAL_CONTRACT_SLUGS,
  SUPPORTED_UNDERLYINGS,
} from "@/lib/contract-seo"

interface PageProps {
  params: Promise<{
    underlying: string
    contract: string
  }>
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { underlying, contract } = await params
  const parsed = parseContractSlug(underlying, contract)

  if (!parsed || !parsed.isValid) {
    return {
      title: "Option Contract Not Found | Lumora AI",
      robots: { index: false, follow: false },
    }
  }

  const { underlying: uInfo, strike, optionType, expiryLabel, canonicalSymbol, canonicalUrl, isCanonicalStrike } = parsed
  const optName = optionType === "CE" ? "Call (CE)" : "Put (PE)"
  const title = `${uInfo.name} ${strike} ${optionType} Option Analysis & Spot Chain | Lumora AI`
  const description = `Analyze ${uInfo.name} ${strike} ${optName} (${canonicalSymbol}) expiring ${expiryLabel}. View live underlying spot quotes, strike distance, moneyness, and multi-exchange option chains with Lumora AI.`

  return {
    title,
    description,
    alternates: {
      canonical: canonicalUrl,
    },
    robots: {
      index: isCanonicalStrike,
      follow: true,
    },
    openGraph: {
      title,
      description,
      url: canonicalUrl,
      type: "website",
      images: [{ url: "https://www.lumoraai.in/lumora-logo.png" }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: ["https://www.lumoraai.in/lumora-logo.png"],
    },
  }
}

export default async function OptionContractPage({ params }: PageProps) {
  const { underlying, contract } = await params
  const parsed = parseContractSlug(underlying, contract)

  if (!parsed || !parsed.isValid) {
    notFound()
  }

  const {
    underlying: uInfo,
    strike,
    optionType,
    expiryCode,
    expiryDate,
    expiryLabel,
    canonicalSymbol,
    terminalSymbol,
    canonicalUrl,
  } = parsed

  // Fetch live underlying spot quote
  const spotQuote = await getQuote(uInfo.symbol).catch(() => null)
  const spotPrice = spotQuote?.price ?? 0
  const spotChange = spotQuote?.change ?? 0
  const spotChangePercent = spotQuote?.changePercent ?? 0

  const moneynessInfo = computeMoneyness(strike, spotPrice, optionType, uInfo.step)
  const siblingStrikes = getSiblingStrikes(uInfo, strike, 4)
  const oppositeType = optionType === "CE" ? "pe" : "ce"
  const oppositeUrl = `/options/${uInfo.slug}/${strike}-${oppositeType}`

  const isCall = optionType === "CE"
  const isIndian = uInfo.segment === "NFO" || uInfo.segment === "BFO"

  // FAQ Schema
  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
      {
        "@type": "Question",
        name: `What is the ${uInfo.name} ${strike} ${optionType} contract?`,
        acceptedAnswer: {
          "@type": "Answer",
          text: `The ${uInfo.name} ${strike} ${optionType} is an exchange-listed ${
            isCall ? "Call option (CE)" : "Put option (PE)"
          } contract anchored to the underlying ${uInfo.name} on the ${
            uInfo.exchange
          } (${uInfo.segment} segment) with a strike price of ${uInfo.currencySymbol}${strike.toLocaleString()} expiring on ${expiryLabel}.`,
        },
      },
      {
        "@type": "Question",
        name: `Is ${uInfo.name} ${strike} ${optionType} In-The-Money (ITM) or Out-of-The-Money (OTM)?`,
        acceptedAnswer: {
          "@type": "Answer",
          text: `Based on the underlying ${uInfo.name} live spot quote (${uInfo.currencySymbol}${spotPrice.toLocaleString()}), the ${strike} ${optionType} is currently ${
            moneynessInfo.label
          }, approximately ${moneynessInfo.distancePoints.toLocaleString()} points (${moneynessInfo.distancePercent}%) from current spot.`,
        },
      },
      {
        "@type": "Question",
        name: `What is the strike interval for ${uInfo.name} options?`,
        acceptedAnswer: {
          "@type": "Answer",
          text: `Standard option contracts for ${uInfo.name} on the ${uInfo.exchange} are listed at ${uInfo.step}-point strike step intervals across active monthly and near-term expiry cycles.`,
        },
      },
      {
        "@type": "Question",
        name: `How do I analyze ${uInfo.name} ${strike} ${optionType} on Lumora AI?`,
        acceptedAnswer: {
          "@type": "Answer",
          text: `You can launch the Lumora AI interactive terminal to inspect live underlying spot candlestick charts, multi-timeframe indicators, AI synthesis summaries, and the full multi-strike option chain matrix around the ${strike} level.`,
        },
      },
    ],
  }

  // Breadcrumb Schema
  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Home",
        item: "https://www.lumoraai.in",
      },
      {
        "@type": "ListItem",
        position: 2,
        name: "Options Analysis",
        item: "https://www.lumoraai.in/options-analysis",
      },
      {
        "@type": "ListItem",
        position: 3,
        name: uInfo.name,
        item: `https://www.lumoraai.in/markets?symbol=${encodeURIComponent(uInfo.symbol)}`,
      },
      {
        "@type": "ListItem",
        position: 4,
        name: `${uInfo.name} ${strike} ${optionType}`,
        item: canonicalUrl,
      },
    ],
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />

      <div className="relative min-h-screen bg-[var(--background)] text-foreground">
        {/* Navigation Header */}
        <header className="relative z-30 mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-6 border-b border-[var(--line)]">
          <Link href="/" className="flex items-center gap-2.5 text-foreground">
            <LumoraMark className="h-7 w-7" />
            <span className="font-heading font-semibold tracking-tight">Lumora AI</span>
          </Link>
          <div className="flex items-center gap-4">
            <Link
              href="/options-analysis"
              className="text-xs font-semibold uppercase tracking-wider text-muted-foreground hover:text-foreground transition-colors hidden sm:block"
            >
              Options Intelligence
            </Link>
            <Link
              href={`/markets?symbol=${encodeURIComponent(terminalSymbol)}`}
              className="btn btn--primary rounded-full px-4 py-1.5 text-xs font-semibold flex items-center gap-1.5"
            >
              <span>Launch Terminal</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </header>

        {/* Breadcrumb Navigation */}
        <nav className="mx-auto max-w-5xl px-6 pt-6 pb-2 text-xs text-muted-foreground flex items-center gap-1.5 flex-wrap">
          <Link href="/" className="hover:text-foreground transition-colors">
            Home
          </Link>
          <ChevronRight className="h-3 w-3" />
          <Link href="/options-analysis" className="hover:text-foreground transition-colors">
            Options Analysis
          </Link>
          <ChevronRight className="h-3 w-3" />
          <Link
            href={`/markets?symbol=${encodeURIComponent(uInfo.symbol)}`}
            className="hover:text-foreground transition-colors"
          >
            {uInfo.name}
          </Link>
          <ChevronRight className="h-3 w-3" />
          <span className="text-foreground font-medium">
            {strike} {optionType}
          </span>
        </nav>

        {/* Main Content Area */}
        <main className="relative z-10 mx-auto max-w-5xl px-6 py-8 space-y-10">
          {/* Header Card */}
          <section className="glass-card rounded-2xl border p-6 sm:p-8 space-y-6" style={{ borderColor: "var(--line)" }}>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-2">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="inline-flex items-center gap-1 rounded-md bg-[var(--surface-alt)] px-2.5 py-1 text-xs font-mono font-medium text-foreground">
                    <Layers className="h-3 w-3 text-[var(--gold)]" />
                    {canonicalSymbol}
                  </span>
                  <span className={`inline-flex items-center rounded-md border px-2.5 py-0.5 text-xs font-medium ${moneynessInfo.colorClass}`}>
                    {moneynessInfo.label}
                  </span>
                  <span className="inline-flex items-center rounded-md bg-blue-500/10 text-blue-600 dark:text-blue-400 px-2 py-0.5 text-[11px] font-mono">
                    {uInfo.exchange} &middot; {uInfo.segment}
                  </span>
                </div>

                <h1 className="font-heading text-2xl sm:text-3xl lg:text-4xl font-semibold tracking-tight text-foreground">
                  {uInfo.name} {strike.toLocaleString()} {isCall ? "Call Option (CE)" : "Put Option (PE)"}
                </h1>
                <p className="text-xs sm:text-sm text-muted-foreground">
                  Contract Expiry: <strong className="text-foreground">{expiryLabel}</strong> ({expiryDate})
                </p>
              </div>

              {/* Terminal Quick CTA */}
              <div className="flex sm:flex-col items-stretch gap-2 shrink-0">
                <Link
                  href={`/markets?symbol=${encodeURIComponent(terminalSymbol)}`}
                  className="btn btn--primary rounded-xl px-5 py-2.5 text-sm font-semibold flex items-center justify-center gap-2"
                >
                  <Zap className="h-4 w-4" />
                  <span>Inspect in Terminal</span>
                </Link>
                <Link
                  href={oppositeUrl}
                  className="btn rounded-xl border border-[var(--line)] bg-[var(--surface)] hover:bg-[var(--surface-alt)] px-4 py-2 text-xs font-medium text-center text-muted-foreground hover:text-foreground transition-colors"
                >
                  Switch to {strike} {oppositeType.toUpperCase()}
                </Link>
              </div>
            </div>

            {/* Live Underlying Spot Summary Bar */}
            <div className="rounded-xl border border-[var(--line)] bg-[var(--surface)] p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Landmark className="h-3.5 w-3.5 text-[var(--gold)]" />
                  <span>Underlying Asset Live Spot Quote ({uInfo.symbol})</span>
                  <span className="inline-block h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                </div>
                <div className="flex items-baseline gap-3">
                  <span className="font-mono text-2xl sm:text-3xl font-bold text-foreground">
                    {uInfo.currencySymbol}
                    {spotPrice ? spotPrice.toLocaleString(undefined, { minimumFractionDigits: 2 }) : "—"}
                  </span>
                  {spotPrice > 0 && (
                    <span
                      className={`inline-flex items-center gap-1 text-xs sm:text-sm font-mono font-medium ${
                        spotChange >= 0
                          ? "text-emerald-600 dark:text-emerald-400"
                          : "text-rose-600 dark:text-rose-400"
                      }`}
                    >
                      {spotChange >= 0 ? <TrendingUp className="h-3.5 w-3.5" /> : <TrendingDown className="h-3.5 w-3.5" />}
                      {spotChange >= 0 ? "+" : ""}
                      {spotChange.toFixed(2)} ({spotChangePercent >= 0 ? "+" : ""}
                      {spotChangePercent.toFixed(2)}%)
                    </span>
                  )}
                </div>
              </div>

              {/* Distance from spot */}
              <div className="text-left sm:text-right border-t sm:border-t-0 pt-3 sm:pt-0 border-[var(--line)]">
                <div className="text-xs text-muted-foreground">Distance to Strike Level</div>
                <div className="font-mono text-sm sm:text-base font-semibold text-foreground">
                  {moneynessInfo.distancePoints.toLocaleString()} points ({moneynessInfo.distancePercent}%)
                </div>
                <div className="text-[11px] text-muted-foreground">
                  {strike > spotPrice ? "Strike is Above Spot" : strike < spotPrice ? "Strike is Below Spot" : "Exact Spot Match"}
                </div>
              </div>
            </div>
          </section>

          {/* Contract Specifications Grid */}
          <section className="space-y-4">
            <h2 className="font-heading text-xl font-semibold text-foreground flex items-center gap-2">
              <Target className="h-5 w-5 text-[var(--gold)]" />
              Contract Parameters &amp; Microstructure
            </h2>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <div className="glass-card rounded-xl border p-4 space-y-1.5" style={{ borderColor: "var(--line)" }}>
                <span className="text-xs text-muted-foreground">Strike Price</span>
                <p className="font-mono text-lg font-bold text-foreground">
                  {uInfo.currencySymbol}{strike.toLocaleString()}
                </p>
                <span className="text-[11px] text-muted-foreground">
                  Step interval: {uInfo.step} pts
                </span>
              </div>

              <div className="glass-card rounded-xl border p-4 space-y-1.5" style={{ borderColor: "var(--line)" }}>
                <span className="text-xs text-muted-foreground">Option Right</span>
                <p className="font-mono text-lg font-bold text-foreground">
                  {isCall ? "Call (CE)" : "Put (PE)"}
                </p>
                <span className="text-[11px] text-muted-foreground">
                  {isCall ? "Bullish / Upward Speculation" : "Bearish / Downward Protection"}
                </span>
              </div>

              <div className="glass-card rounded-xl border p-4 space-y-1.5" style={{ borderColor: "var(--line)" }}>
                <span className="text-xs text-muted-foreground">Moneyness State</span>
                <p className="font-mono text-lg font-bold text-foreground">
                  {moneynessInfo.moneyness}
                </p>
                <span className="text-[11px] text-muted-foreground">
                  {moneynessInfo.label}
                </span>
              </div>

              <div className="glass-card rounded-xl border p-4 space-y-1.5" style={{ borderColor: "var(--line)" }}>
                <span className="text-xs text-muted-foreground">Expiry Cycle</span>
                <p className="font-mono text-lg font-bold text-foreground">
                  {expiryCode}
                </p>
                <span className="text-[11px] text-muted-foreground truncate">
                  {expiryLabel}
                </span>
              </div>
            </div>
          </section>

          {/* E-E-A-T Data Feed Transparency Callout */}
          <section
            className="glass-card rounded-2xl border p-6 space-y-3"
            style={{ borderColor: "var(--gold-line)", background: "var(--surface)" }}
          >
            <div className="flex items-center gap-2 text-foreground font-semibold text-sm">
              <ShieldCheck className="h-4 w-4 text-[var(--gold)]" />
              <span>Data Architecture &amp; Execution Transparency</span>
            </div>
            <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
              <strong>Spot vs. Derivative Pricing:</strong> Lumora AI provides live, tick-calibrated underlying spot data for {uInfo.name} directly from exchange feeds. For Indian derivatives (NSE NFO / BSE BFO), the strike ladder and canonical contract structure are dynamically resolved. Real-time tick streaming of derivative bid/ask premiums, live OI, and volume require institutional market feeds. Lumora operates in Free Market-Data Mode with spot-anchored Black-Scholes theoretical modelling for options analysis.
            </p>
          </section>

          {/* Sibling Strikes Navigation Ladder */}
          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="font-heading text-xl font-semibold text-foreground flex items-center gap-2">
                <Layers className="h-5 w-5 text-[var(--gold)]" />
                Adjacent Strike Ladder ({uInfo.name})
              </h2>
              <span className="text-xs text-muted-foreground">
                Step size: {uInfo.step} points
              </span>
            </div>

            <div className="rounded-xl border border-[var(--line)] bg-[var(--surface)] overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs sm:text-sm">
                  <thead>
                    <tr className="border-b border-[var(--line)] bg-[var(--surface-alt)] text-muted-foreground font-semibold">
                      <th className="py-2.5 px-4">Call Contract (CE)</th>
                      <th className="py-2.5 px-4 text-center">Strike Price</th>
                      <th className="py-2.5 px-4 text-right">Put Contract (PE)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[var(--line)]">
                    {siblingStrikes.map((s) => {
                      const isCurrentStrike = s.strike === strike
                      return (
                        <tr
                          key={s.strike}
                          className={`hover:bg-[var(--surface-alt)]/50 transition-colors ${
                            isCurrentStrike ? "bg-[var(--gold)]/5 font-semibold" : ""
                          }`}
                        >
                          <td className="py-2.5 px-4">
                            <Link
                              href={s.callUrl}
                              className={`inline-flex items-center gap-1 hover:text-[var(--gold)] transition-colors ${
                                isCurrentStrike && isCall ? "text-[var(--gold)] font-bold" : "text-foreground"
                              }`}
                            >
                              <span>{s.strike} CE</span>
                              {isCurrentStrike && isCall && (
                                <span className="text-[10px] bg-[var(--gold)]/20 text-[var(--gold)] px-1.5 py-0.2 rounded">
                                  Current
                                </span>
                              )}
                            </Link>
                          </td>

                          <td className="py-2.5 px-4 text-center font-mono font-medium text-foreground">
                            {uInfo.currencySymbol}{s.strike.toLocaleString()}
                          </td>

                          <td className="py-2.5 px-4 text-right">
                            <Link
                              href={s.putUrl}
                              className={`inline-flex items-center justify-end gap-1 hover:text-[var(--gold)] transition-colors ${
                                isCurrentStrike && !isCall ? "text-[var(--gold)] font-bold" : "text-foreground"
                              }`}
                            >
                              {isCurrentStrike && !isCall && (
                                <span className="text-[10px] bg-[var(--gold)]/20 text-[var(--gold)] px-1.5 py-0.2 rounded">
                                  Current
                                </span>
                              )}
                              <span>{s.strike} PE</span>
                            </Link>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </section>

          {/* High Intent AEO Section */}
          <section className="space-y-6">
            <h2 className="font-heading text-2xl font-semibold text-foreground">
              Frequently Asked Questions: {uInfo.name} {strike} {optionType}
            </h2>

            <div className="space-y-4">
              <div className="glass-card rounded-xl border p-5 space-y-2" style={{ borderColor: "var(--line)" }}>
                <h3 className="text-base font-semibold text-foreground">
                  What does a {uInfo.name} {strike} {isCall ? "Call (CE)" : "Put (PE)"} option mean?
                </h3>
                <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                  A {uInfo.name} {strike} {optionType} is a financial derivative contract giving the buyer the right (but not the obligation) to {isCall ? "buy" : "sell"} the underlying {uInfo.name} index or security at the specified strike price of {uInfo.currencySymbol}{strike.toLocaleString()} on or before the {expiryLabel} expiration date.
                </p>
              </div>

              <div className="glass-card rounded-xl border p-5 space-y-2" style={{ borderColor: "var(--line)" }}>
                <h3 className="text-base font-semibold text-foreground">
                  How does moneyness (ITM, ATM, OTM) affect this contract?
                </h3>
                <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                  With {uInfo.name} trading at {uInfo.currencySymbol}{spotPrice ? spotPrice.toLocaleString() : "spot"}, the {strike} {optionType} contract is currently <strong>{moneynessInfo.label}</strong>. {isCall ? "Call options with strikes below the spot price possess intrinsic value (ITM), while strikes above the spot price consist entirely of extrinsic/time value (OTM)." : "Put options with strikes above the spot price possess intrinsic value (ITM), while strikes below the spot price consist purely of extrinsic/time value (OTM)."}
                </p>
              </div>

              <div className="glass-card rounded-xl border p-5 space-y-2" style={{ borderColor: "var(--line)" }}>
                <h3 className="text-base font-semibold text-foreground">
                  How can I analyze {uInfo.name} options in the Lumora AI terminal?
                </h3>
                <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                  By launching the Lumora AI terminal with symbol <code className="text-foreground font-mono">{canonicalSymbol}</code>, you can view the complete strike ladder, inspect the underlying technical chart across multi-timeframe moving averages, and generate AI synthesis reports.
                </p>
              </div>
            </div>
          </section>

          {/* Popular Index Options Hub Links */}
          <section className="rounded-2xl border border-[var(--line)] bg-[var(--surface-alt)] p-6 space-y-4">
            <h3 className="font-heading text-sm font-semibold uppercase tracking-wider text-muted-foreground">
              Explore Popular Indian Derivative Contracts
            </h3>
            <div className="grid gap-2.5 sm:grid-cols-2 lg:grid-cols-4">
              {TOP_CANONICAL_CONTRACT_SLUGS.slice(0, 8).map((c) => (
                <Link
                  key={`${c.underlying}-${c.contract}`}
                  href={`/options/${c.underlying}/${c.contract}`}
                  className="rounded-lg border border-[var(--line)] bg-[var(--surface)] p-3 text-xs font-medium text-foreground hover:border-[var(--gold)] hover:text-[var(--gold)] transition-colors flex items-center justify-between"
                >
                  <span className="uppercase">{c.underlying.replace("-", " ")} {c.contract.toUpperCase()}</span>
                  <ArrowRight className="h-3 w-3 text-muted-foreground" />
                </Link>
              ))}
            </div>
          </section>

          {/* E-E-A-T Disclaimer Footer */}
          <footer className="pt-8 border-t border-[var(--line)] text-xs text-muted-foreground space-y-2">
            <p>
              <strong>Derivative Risk Disclosure:</strong> Options trading involves substantial risk of loss and is not suitable for all investors. Option contracts are wasting assets subject to rapid time decay. Lumora AI is strictly an educational research platform.
            </p>
            <p>
              &copy; {new Date().getFullYear()} Lumora AI. Production Domain: <code className="text-foreground">https://www.lumoraai.in</code>
            </p>
          </footer>
        </main>
      </div>
    </>
  )
}
