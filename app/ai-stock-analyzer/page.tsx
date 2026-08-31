import type { Metadata } from "next"
import Link from "next/link"
import {
  ArrowRight,
  BarChart3,
  CheckCircle2,
  Cpu,
  Layers,
  LineChart,
  PieChart,
  ShieldCheck,
  Sparkles,
  TrendingUp,
  Zap,
} from "lucide-react"
import { LumoraMark } from "@/components/lumora-mark"

export const metadata: Metadata = {
  title: "AI Stock Analyzer — Multi-Factor Algorithmic Technical Engine | Lumora AI",
  description:
    "Evaluate global equities and Indian stocks with Lumora AI's real-time stock analyzer. Discover momentum scores, multi-timeframe moving averages, Bollinger Band squeeze detection, and AI synthesis.",
  alternates: {
    canonical: "https://www.lumoraai.in/ai-stock-analyzer",
  },
  openGraph: {
    title: "AI Stock Analyzer — Algorithmic Market Intelligence | Lumora AI",
    description:
      "Instant quantitative technical analysis and probabilistic risk scoring for US and Indian equities.",
    url: "https://www.lumoraai.in/ai-stock-analyzer",
    type: "article",
    images: [{ url: "https://www.lumoraai.in/lumora-logo.png" }],
  },
}

const analyzerFaqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "What is an AI stock analyzer?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "An AI stock analyzer is an algorithmic software application that ingests real-time price feeds, calculates multi-period technical indicators (such as RSI, MACD, Stochastic, ATR), and applies machine learning language models to synthesize technical structures into actionable market briefings with quantitative risk scores.",
      },
    },
    {
      "@type": "Question",
      name: "How does the Lumora AI Stock Analyzer work?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Lumora AI combines live exchange tick data with client-side mathematical indicator engines and server-side Google Gemini AI. It identifies support/resistance pivots, evaluates trend strength, computes volatility envelopes, and generates structured probabilistic summaries.",
      },
    },
    {
      "@type": "Question",
      name: "Does an AI stock analyzer predict future stock prices with certainty?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "No. Capital markets are non-deterministic. An institutional AI stock analyzer evaluates statistical probabilities, historical mean reversion, and momentum exhaustion, rather than claiming guaranteed price predictions.",
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
      name: "AI Stock Analyzer",
      item: "https://www.lumoraai.in/ai-stock-analyzer",
    },
  ],
}

export default function AIStockAnalyzerPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(analyzerFaqSchema) }}
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
              href="/markets"
              className="text-xs font-semibold uppercase tracking-wider text-muted-foreground hover:text-foreground transition-colors"
            >
              Markets Terminal
            </Link>
            <Link
              href="/markets"
              className="btn btn--primary rounded-full px-4 py-1.5 text-xs font-semibold"
            >
              Launch Analyzer
            </Link>
          </div>
        </header>

        {/* Hero Section */}
        <main className="relative z-10 mx-auto max-w-4xl px-6 py-12 lg:py-16 space-y-16">
          <section className="space-y-6">
            <div className="inline-flex items-center gap-2 rounded-full border border-[var(--line)] bg-[var(--surface)] px-3.5 py-1 text-xs font-medium text-muted-foreground">
              <Cpu className="h-3.5 w-3.5 text-[var(--gold)]" />
              <span>Algorithmic Equity Intelligence</span>
            </div>

            <h1 className="font-heading text-3xl sm:text-4xl lg:text-5xl font-semibold tracking-tight text-foreground leading-[1.15]">
              AI Stock Analyzer: Multi-Factor Technical Modeling &amp; Risk Scoring
            </h1>

            <p className="text-base sm:text-lg leading-relaxed text-muted-foreground max-w-3xl">
              Eliminate emotional bias with automated technical decomposition. Ingest live market quotes, detect momentum inflection zones, and evaluate multi-timeframe trend structures with institutional clarity.
            </p>

            <div className="flex flex-wrap items-center gap-3 pt-2">
              <Link
                href="/markets?symbol=NVDA"
                className="btn btn--primary rounded-xl px-5 py-2.5 text-sm font-semibold flex items-center gap-2"
              >
                Analyze NVDA <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/markets?symbol=RELIANCE.NS"
                className="btn rounded-xl border border-[var(--line)] bg-[var(--surface)] hover:bg-[var(--surface-alt)] px-5 py-2.5 text-sm font-semibold text-foreground flex items-center gap-2"
              >
                Analyze Reliance (NSE) <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </section>

          {/* Core Feature Matrix */}
          <section className="space-y-6">
            <h2 className="font-heading text-2xl font-semibold text-foreground">
              Core Capabilities of the Lumora Stock Analyzer
            </h2>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="glass-card rounded-xl border p-5 space-y-2.5" style={{ borderColor: "var(--line)" }}>
                <div className="flex items-center gap-2 text-foreground font-semibold">
                  <BarChart3 className="h-4 w-4 text-[var(--gold)]" />
                  <h3>Multi-Timeframe Trend Alignment</h3>
                </div>
                <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                  Evaluates exponential moving averages (EMA 20, 50, 200) across daily, weekly, and intraday horizons to determine underlying trend strength.
                </p>
              </div>

              <div className="glass-card rounded-xl border p-5 space-y-2.5" style={{ borderColor: "var(--line)" }}>
                <div className="flex items-center gap-2 text-foreground font-semibold">
                  <LineChart className="h-4 w-4 text-[var(--gold)]" />
                  <h3>Momentum &amp; Oscillators</h3>
                </div>
                <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                  Calculates Relative Strength Index (RSI 14), Stochastic Oscillator, and MACD divergence to highlight overbought or oversold conditions.
                </p>
              </div>

              <div className="glass-card rounded-xl border p-5 space-y-2.5" style={{ borderColor: "var(--line)" }}>
                <div className="flex items-center gap-2 text-foreground font-semibold">
                  <PieChart className="h-4 w-4 text-[var(--gold)]" />
                  <h3>Volatility &amp; Squeeze Detection</h3>
                </div>
                <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                  Monitors Bollinger Band bandwidth and Average True Range (ATR) to identify periods of low-volatility compression preceding directional expansion.
                </p>
              </div>

              <div className="glass-card rounded-xl border p-5 space-y-2.5" style={{ borderColor: "var(--line)" }}>
                <div className="flex items-center gap-2 text-foreground font-semibold">
                  <Sparkles className="h-4 w-4 text-[var(--gold)]" />
                  <h3>AI Qualitative Synthesis</h3>
                </div>
                <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                  Synthesizes technical data into structured executive summaries, outlining key pivot levels, risk factors, and institutional positioning.
                </p>
              </div>
            </div>
          </section>

          {/* High Intent AEO Section */}
          <section className="space-y-6">
            <h2 className="font-heading text-2xl font-semibold text-foreground">
              Frequently Asked Questions About AI Stock Analyzers
            </h2>

            <div className="space-y-4">
              <div className="glass-card rounded-xl border p-5 space-y-2" style={{ borderColor: "var(--line)" }}>
                <h3 className="text-base font-semibold text-foreground">
                  How does an AI stock analyzer differ from traditional screening tools?
                </h3>
                <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                  Traditional screeners filter stocks based on static thresholds (e.g. P/E &lt; 20). An AI stock analyzer synthesizes multi-dimensional technical metrics concurrently, understanding contextual relationships between volume, volatility, momentum, and support zones.
                </p>
              </div>

              <div className="glass-card rounded-xl border p-5 space-y-2" style={{ borderColor: "var(--line)" }}>
                <h3 className="text-base font-semibold text-foreground">
                  Which markets and exchanges does the analyzer support?
                </h3>
                <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                  Lumora AI supports US equities (NYSE, NASDAQ), Indian equities and benchmark indices (NSE, BSE), major cryptocurrencies, global forex pairs, and commodities.
                </p>
              </div>
            </div>
          </section>

          {/* Internal Links Cluster */}
          <section className="rounded-2xl border border-[var(--line)] bg-[var(--surface-alt)] p-6 space-y-4">
            <h3 className="font-heading text-sm font-semibold uppercase tracking-wider text-muted-foreground">
              Related Financial Intelligence Topics
            </h3>
            <div className="grid gap-3 sm:grid-cols-3">
              <Link
                href="/ai-stock-analysis"
                className="glass-card rounded-xl border p-4 hover:border-[var(--gold)] transition-colors group"
                style={{ borderColor: "var(--line)" }}
              >
                <h4 className="text-sm font-semibold text-foreground group-hover:text-[var(--gold)] transition-colors">
                  AI Stock Analysis &rarr;
                </h4>
                <p className="text-xs text-muted-foreground mt-1">
                  Methodology, indicator math, and scoring pillars.
                </p>
              </Link>

              <Link
                href="/nifty-50-ai-analysis"
                className="glass-card rounded-xl border p-4 hover:border-[var(--gold)] transition-colors group"
                style={{ borderColor: "var(--line)" }}
              >
                <h4 className="text-sm font-semibold text-foreground group-hover:text-[var(--gold)] transition-colors">
                  NIFTY 50 AI Analysis &rarr;
                </h4>
                <p className="text-xs text-muted-foreground mt-1">
                  NSE index momentum, support/resistance, and options.
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
            </div>
          </section>

          {/* E-E-A-T Disclaimer */}
          <footer className="pt-8 border-t border-[var(--line)] text-xs text-muted-foreground space-y-2">
            <p>
              <strong>Disclaimer:</strong> Lumora AI provides educational market research tools. All outputs are algorithmic estimations and do not constitute financial advice.
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
