import type { Metadata } from "next"
import Link from "next/link"
import {
  ArrowRight,
  ChevronRight,
  Flame,
  Globe,
  Landmark,
  Layers,
  LineChart,
  ShieldCheck,
  Target,
  TrendingUp,
  Zap,
} from "lucide-react"
import { LumoraMark } from "@/components/lumora-mark"
import { getQuote } from "@/lib/market"

export const metadata: Metadata = {
  title: "NIFTY 50 AI Analysis — Real-Time Technical Outlook, Support & Options | Lumora AI",
  description:
    "Analyze NIFTY 50 (^NSEI) with institutional AI: live spot pricing, multi-timeframe moving averages, support and resistance boundaries, and 50-point strike ladder options context.",
  alternates: {
    canonical: "https://www.lumoraai.in/nifty-50-ai-analysis",
  },
  openGraph: {
    title: "NIFTY 50 AI Analysis — NSE Index Intelligence | Lumora AI",
    description:
      "Real-time technical indicators, option strike resolution, and AI market research for India's NIFTY 50 benchmark.",
    url: "https://www.lumoraai.in/nifty-50-ai-analysis",
    type: "article",
    images: [{ url: "https://www.lumoraai.in/lumora-logo.png" }],
  },
}

const niftyFaqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "What is NIFTY 50 AI Analysis?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "NIFTY 50 AI Analysis is the algorithmic decomposition of India's benchmark stock market index (^NSEI) using quantitative indicators (RSI, EMAs, Bollinger Bands) and AI language models to generate objective technical outlooks, identify pivot levels, and map option positioning.",
      },
    },
    {
      "@type": "Question",
      name: "How are NIFTY 50 option strikes organized?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "NIFTY 50 derivative contracts on the National Stock Exchange (NSE) trade in standard 50-point strike step intervals (e.g. 24,000, 24,050, 24,100, 24,150, 24,200) with monthly expiries on the last Thursday of each contract month.",
      },
    },
    {
      "@type": "Question",
      name: "What are the major sector weightages in NIFTY 50?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "NIFTY 50 is heavily weighted toward Financial Services (~33%), Information Technology (~14%), Oil, Gas & Consumable Fuels (~12%), Fast Moving Consumer Goods (~8%), and Automobile (~7%).",
      },
    },
  ],
}

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
      name: "Indian Stock Market AI",
      item: "https://www.lumoraai.in/indian-stock-market-ai",
    },
    {
      "@type": "ListItem",
      position: 3,
      name: "NIFTY 50 AI Analysis",
      item: "https://www.lumoraai.in/nifty-50-ai-analysis",
    },
  ],
}

export default async function Nifty50AIAnalysisPage() {
  const quote = await getQuote("^NSEI").catch(() => null)
  const spotPrice = quote?.price ?? 0
  const change = quote?.change ?? 0
  const changePercent = quote?.changePercent ?? 0

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(niftyFaqSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />

      <div className="relative min-h-screen bg-[var(--background)] text-foreground">
        {/* Navigation Bar */}
        <header className="relative z-30 mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-6 border-b border-[var(--line)]">
          <Link href="/" className="flex items-center gap-2.5 text-foreground">
            <LumoraMark className="h-7 w-7" />
            <span className="font-heading font-semibold tracking-tight">Lumora AI</span>
          </Link>
          <div className="flex items-center gap-4">
            <Link
              href="/indian-stock-market-ai"
              className="text-xs font-semibold uppercase tracking-wider text-muted-foreground hover:text-foreground transition-colors hidden sm:block"
            >
              Indian Equities
            </Link>
            <Link
              href="/markets?symbol=%5ENSEI"
              className="btn btn--primary rounded-full px-4 py-1.5 text-xs font-semibold"
            >
              Inspect NIFTY 50
            </Link>
          </div>
        </header>

        {/* Main Content */}
        <main className="relative z-10 mx-auto max-w-4xl px-6 py-12 lg:py-16 space-y-16">
          <section className="space-y-6">
            <div className="inline-flex items-center gap-2 rounded-full border border-[var(--line)] bg-[var(--surface)] px-3.5 py-1 text-xs font-medium text-muted-foreground">
              <Landmark className="h-3.5 w-3.5 text-[var(--gold)]" />
              <span>National Stock Exchange of India (NSE: ^NSEI)</span>
            </div>

            <h1 className="font-heading text-3xl sm:text-4xl lg:text-5xl font-semibold tracking-tight text-foreground leading-[1.15]">
              NIFTY 50 AI Analysis: Live Index Technicals &amp; Derivative Matrix
            </h1>

            <p className="text-base sm:text-lg leading-relaxed text-muted-foreground max-w-3xl">
              Deconstruct India&apos;s premier benchmark with machine learning precision. Monitor real-time spot momentum, moving average ribbons, support/resistance zones, and option strike positioning.
            </p>

            {/* Live Spot Snapshot */}
            <div className="glass-card rounded-2xl border p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4" style={{ borderColor: "var(--line)" }}>
              <div className="space-y-1">
                <span className="text-xs text-muted-foreground">NIFTY 50 Spot Index Quote</span>
                <div className="flex items-baseline gap-3">
                  <span className="font-mono text-3xl font-bold text-foreground">
                    ₹{spotPrice ? spotPrice.toLocaleString(undefined, { minimumFractionDigits: 2 }) : "24,090.85"}
                  </span>
                  {spotPrice > 0 && (
                    <span className={`text-sm font-mono font-medium ${change >= 0 ? "text-emerald-500" : "text-rose-500"}`}>
                      {change >= 0 ? "+" : ""}{change.toFixed(2)} ({changePercent >= 0 ? "+" : ""}{changePercent.toFixed(2)}%)
                    </span>
                  )}
                </div>
              </div>

              <div className="flex gap-3">
                <Link
                  href="/markets?symbol=%5ENSEI"
                  className="btn btn--primary rounded-xl px-5 py-2.5 text-sm font-semibold flex items-center gap-2"
                >
                  Open Live NIFTY Terminal <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </div>
          </section>

          {/* Core Index Strikes Matrix */}
          <section className="space-y-6">
            <h2 className="font-heading text-2xl font-semibold text-foreground flex items-center gap-2">
              <Layers className="h-5 w-5 text-[var(--gold)]" />
              Popular NIFTY 50 Option Contracts
            </h2>
            <p className="text-sm text-muted-foreground">
              Direct access to canonical strike pages organized by 50-point intervals:
            </p>

            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {[
                { name: "NIFTY 24150 PE", path: "/options/nifty-50/24150-pe", type: "Put Option (PE)" },
                { name: "NIFTY 24150 CE", path: "/options/nifty-50/24150-ce", type: "Call Option (CE)" },
                { name: "NIFTY 24250 PE", path: "/options/nifty-50/24250-pe", type: "Put Option (PE)" },
                { name: "NIFTY 24250 CE", path: "/options/nifty-50/24250-ce", type: "Call Option (CE)" },
                { name: "NIFTY 24000 PE", path: "/options/nifty-50/24000-pe", type: "Put Option (PE)" },
                { name: "NIFTY 24000 CE", path: "/options/nifty-50/24000-ce", type: "Call Option (CE)" },
                { name: "NIFTY 24100 PE", path: "/options/nifty-50/24100-pe", type: "Put Option (PE)" },
                { name: "NIFTY 24100 CE", path: "/options/nifty-50/24100-ce", type: "Call Option (CE)" },
                { name: "NIFTY 24200 PE", path: "/options/nifty-50/24200-pe", type: "Put Option (PE)" },
                { name: "NIFTY 24200 CE", path: "/options/nifty-50/24200-ce", type: "Call Option (CE)" },
                { name: "NIFTY 24300 PE", path: "/options/nifty-50/24300-pe", type: "Put Option (PE)" },
                { name: "NIFTY 24300 CE", path: "/options/nifty-50/24300-ce", type: "Call Option (CE)" },
              ].map((c) => (
                <Link
                  key={c.path}
                  href={c.path}
                  className="glass-card rounded-xl border p-4 hover:border-[var(--gold)] transition-colors group flex items-center justify-between"
                  style={{ borderColor: "var(--line)" }}
                >
                  <div>
                    <h3 className="text-sm font-semibold text-foreground group-hover:text-[var(--gold)] transition-colors">
                      {c.name}
                    </h3>
                    <p className="text-[11px] text-muted-foreground">{c.type}</p>
                  </div>
                  <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-[var(--gold)] transition-colors" />
                </Link>
              ))}
            </div>
          </section>

          {/* High Intent AEO Section */}
          <section className="space-y-6">
            <h2 className="font-heading text-2xl font-semibold text-foreground">
              NIFTY 50 Analysis Questions Answered
            </h2>

            <div className="space-y-4">
              <div className="glass-card rounded-xl border p-5 space-y-2" style={{ borderColor: "var(--line)" }}>
                <h3 className="text-base font-semibold text-foreground">
                  What indicators are best for analyzing NIFTY 50 trends?
                </h3>
                <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                  Institutional market participants commonly monitor the 20-day, 50-day, and 200-day Exponential Moving Averages (EMAs) to evaluate long-term trend health, alongside the 14-period RSI for momentum exhaustion and Bollinger Band squeeze boundaries for breakout timing.
                </p>
              </div>

              <div className="glass-card rounded-xl border p-5 space-y-2" style={{ borderColor: "var(--line)" }}>
                <h3 className="text-base font-semibold text-foreground">
                  How does Lumora AI resolve natural language NIFTY queries?
                </h3>
                <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                  Lumora AI maps queries like &quot;NIFTY 50 24150 PE&quot; or &quot;NIFTY AUG 24150 CE&quot; into canonical exchange instruments (`NFO:NIFTY-AUG-24150-PE`), synchronizing the current monthly Thursday expiry and centering the option chain around the live spot price.
                </p>
              </div>
            </div>
          </section>

          {/* Internal Links Cluster */}
          <section className="rounded-2xl border border-[var(--line)] bg-[var(--surface-alt)] p-6 space-y-4">
            <h3 className="font-heading text-sm font-semibold uppercase tracking-wider text-muted-foreground">
              Related Indian Market Intelligence
            </h3>
            <div className="grid gap-3 sm:grid-cols-3">
              <Link
                href="/indian-stock-market-ai"
                className="glass-card rounded-xl border p-4 hover:border-[var(--gold)] transition-colors group"
                style={{ borderColor: "var(--line)" }}
              >
                <h4 className="text-sm font-semibold text-foreground group-hover:text-[var(--gold)] transition-colors">
                  Indian Stock Market AI &rarr;
                </h4>
                <p className="text-xs text-muted-foreground mt-1">
                  NSE &amp; BSE benchmark and equity coverage.
                </p>
              </Link>

              <Link
                href="/options-analysis"
                className="glass-card rounded-xl border p-4 hover:border-[var(--gold)] transition-colors group"
                style={{ borderColor: "var(--line)" }}
              >
                <h4 className="text-sm font-semibold text-foreground group-hover:text-[var(--gold)] transition-colors">
                  Options Analysis &rarr;
                </h4>
                <p className="text-xs text-muted-foreground mt-1">
                  Strike ladders, ATM discovery, and Greeks.
                </p>
              </Link>

              <Link
                href="/ai-stock-analyzer"
                className="glass-card rounded-xl border p-4 hover:border-[var(--gold)] transition-colors group"
                style={{ borderColor: "var(--line)" }}
              >
                <h4 className="text-sm font-semibold text-foreground group-hover:text-[var(--gold)] transition-colors">
                  AI Stock Analyzer &rarr;
                </h4>
                <p className="text-xs text-muted-foreground mt-1">
                  Multi-factor momentum and scoring engine.
                </p>
              </Link>
            </div>
          </section>

          {/* E-E-A-T Disclaimer */}
          <footer className="pt-8 border-t border-[var(--line)] text-xs text-muted-foreground space-y-2">
            <p>
              <strong>Disclaimer:</strong> NIFTY 50 is a trademark of NSE Indices Limited. Lumora AI is an educational research platform and is not affiliated with or endorsed by the National Stock Exchange of India.
            </p>
            <p>
              &copy; {new Date().getFullYear()} Lumora AI. Production Domain: https://www.lumoraai.in
            </p>
          </footer>
        </main>
      </div>
    </>
  )
}
