import type { Metadata } from "next"
import Link from "next/link"
import { ArrowRight, BarChart3, Brain, CheckCircle2, Cpu, LineChart, Shield, Zap } from "lucide-react"
import { LumoraMark } from "@/components/lumora-mark"

export const metadata: Metadata = {
  title: "AI Stock Analysis — Real-Time Equity & Technical Intelligence",
  description:
    "Discover how AI stock analysis evaluates market momentum, technical indicators, moving average structures, and quantitative risk to empower smarter market decisions.",
  alternates: {
    canonical: "https://www.lumoraai.in/ai-stock-analysis",
  },
  openGraph: {
    title: "AI Stock Analysis Tool & Quantitative Intelligence | Lumora AI",
    description:
      "Understand the mechanics of AI-powered stock research. Synthesize RSI, MACD, Bollinger Bands, and trend momentum instantly with Lumora AI.",
    url: "https://www.lumoraai.in/ai-stock-analysis",
    type: "article",
    images: [{ url: "https://www.lumoraai.in/lumora-logo.png" }],
  },
}

const pageFaqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "What is AI stock analysis?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "AI stock analysis is the computational synthesis of financial market data—including technical momentum indicators, price action patterns, volume dynamics, and quantitative metrics—using advanced machine learning and large language models to generate structured market research and objective trading insights.",
      },
    },
    {
      "@type": "Question",
      name: "How does Lumora AI analyze stocks?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Lumora AI evaluates live multi-period market data across 4 core dimensions: Technical Momentum (RSI, Stochastic), Trend Structure (Exponential Moving Averages 20/50/200), Volatility Boundaries (Bollinger Bands, ATR), and Volume Accumulation. The AI synthesizes these signals into clear risk-reward frameworks without subjective human bias.",
      },
    },
    {
      "@type": "Question",
      name: "Can AI stock analysis predict exact future stock prices?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "No algorithm or AI model can guarantee future price predictions. Lumora AI is designed for probabilistic technical evaluation, risk-reward assessment, and scenario analysis, providing educational and informational clarity rather than deterministic forecasts or automated execution.",
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
      name: "AI Stock Analysis",
      item: "https://www.lumoraai.in/ai-stock-analysis",
    },
  ],
}

export default function AIStockAnalysisPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(pageFaqSchema) }}
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
              Launch Terminal
            </Link>
          </div>
        </header>

        {/* Hero Section */}
        <main className="relative z-10 mx-auto max-w-4xl px-6 py-12 lg:py-16 space-y-16">
          <section className="space-y-6">
            <div className="inline-flex items-center gap-2 rounded-full border border-[var(--line)] bg-[var(--surface)] px-3.5 py-1 text-xs font-medium text-muted-foreground">
              <Brain className="h-3.5 w-3.5 text-[var(--gold)]" />
              <span>Quantitative AI Research Architecture</span>
            </div>

            <h1 className="font-heading text-3xl sm:text-4xl lg:text-5xl font-semibold tracking-tight text-foreground leading-[1.15]">
              AI Stock Analysis: Next-Generation Market Intelligence for Modern Traders
            </h1>

            <p className="text-base sm:text-lg leading-relaxed text-muted-foreground max-w-3xl">
              Understand the core mechanics behind algorithmic stock analysis. Lumora AI transforms complex technical indicators, multi-timeframe moving averages, and market microstructure into actionable, objective research frameworks.
            </p>

            <div className="flex flex-wrap items-center gap-3 pt-2">
              <Link
                href="/markets?symbol=NVDA"
                className="btn btn--primary rounded-xl px-5 py-2.5 text-sm font-semibold flex items-center gap-2"
              >
                Analyze NVDA Live <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/markets?symbol=%5ENSEI"
                className="btn rounded-xl border border-[var(--line)] bg-[var(--surface)] hover:bg-[var(--surface-alt)] px-5 py-2.5 text-sm font-semibold text-foreground flex items-center gap-2"
              >
                Analyze NIFTY 50 <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </section>

          {/* Core Concept Answer Box for AEO */}
          <section className="glass-card rounded-2xl border p-6 sm:p-8 space-y-4" style={{ borderColor: "var(--line)" }}>
            <h2 className="font-heading text-xl font-semibold text-foreground flex items-center gap-2.5">
              <Cpu className="h-5 w-5 text-[var(--gold)]" />
              What is AI Stock Analysis?
            </h2>
            <p className="text-sm sm:text-base leading-relaxed text-muted-foreground">
              <strong>AI Stock Analysis</strong> is the systematic application of machine learning models and quantitative algorithms to financial market data. Rather than relying solely on subjective human chart reading, AI algorithms simultaneously compute dozens of mathematical indicators—including Relative Strength Index (RSI), Moving Average Convergence Divergence (MACD), Bollinger Band bandwidths, and Average True Range (ATR)—to identify statistical imbalances, breakout probabilities, and structural support and resistance levels.
            </p>
          </section>

          {/* The 4 Pillars of Analysis */}
          <section className="space-y-6">
            <h2 className="font-heading text-2xl font-semibold text-foreground">
              The 4 Pillars of Lumora AI Market Analysis
            </h2>
            <p className="text-sm text-muted-foreground">
              Every security analyzed in Lumora undergoes a rigorous 4-step quantitative evaluation pipeline:
            </p>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="glass-card rounded-xl border p-5 space-y-2.5" style={{ borderColor: "var(--line)" }}>
                <div className="flex items-center gap-2 text-foreground font-semibold text-base">
                  <Zap className="h-4 w-4 text-[var(--gold)]" />
                  <h3>1. Momentum & Mean Reversion</h3>
                </div>
                <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                  Evaluates overbought/oversold boundaries using standard 14-period RSI, Stochastic oscillators, and price deviation from key volume-weighted anchors.
                </p>
              </div>

              <div className="glass-card rounded-xl border p-5 space-y-2.5" style={{ borderColor: "var(--line)" }}>
                <div className="flex items-center gap-2 text-foreground font-semibold text-base">
                  <LineChart className="h-4 w-4 text-[var(--gold)]" />
                  <h3>2. Trend & Moving Average Structure</h3>
                </div>
                <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                  Maps Exponential Moving Averages (EMA 20, 50, 200) to classify whether an asset is in an expansive bull trend, range-bound consolidation, or structural distribution.
                </p>
              </div>

              <div className="glass-card rounded-xl border p-5 space-y-2.5" style={{ borderColor: "var(--line)" }}>
                <div className="flex items-center gap-2 text-foreground font-semibold text-base">
                  <BarChart3 className="h-4 w-4 text-[var(--gold)]" />
                  <h3>3. Volatility & Channel Geometry</h3>
                </div>
                <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                  Measures Bollinger Band standard deviations and ATR volatility to identify compression squeezes before significant directional expansions occur.
                </p>
              </div>

              <div className="glass-card rounded-xl border p-5 space-y-2.5" style={{ borderColor: "var(--line)" }}>
                <div className="flex items-center gap-2 text-foreground font-semibold text-base">
                  <Shield className="h-4 w-4 text-[var(--gold)]" />
                  <h3>4. Quantitative Risk Scoring</h3>
                </div>
                <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                  Synthesizes all technical signals into an objective Risk/Reward framework, highlighting key support invalidation levels and calculated upside resistance targets.
                </p>
              </div>
            </div>
          </section>

          {/* Comparison Table */}
          <section className="space-y-6">
            <h2 className="font-heading text-2xl font-semibold text-foreground">
              Traditional Research vs. AI-Powered Analysis
            </h2>
            <div className="overflow-x-auto rounded-xl border border-[var(--line)]">
              <table className="w-full text-left text-xs sm:text-sm border-collapse">
                <thead className="bg-[var(--surface-alt)] border-b border-[var(--line)] text-muted-foreground">
                  <tr>
                    <th className="p-3.5 font-semibold">Feature</th>
                    <th className="p-3.5 font-semibold">Traditional Manual Analysis</th>
                    <th className="p-3.5 font-semibold text-[var(--gold)]">Lumora AI Platform</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--line)]">
                  <tr>
                    <td className="p-3.5 font-medium text-foreground">Analysis Latency</td>
                    <td className="p-3.5 text-muted-foreground">15–45 minutes per chart</td>
                    <td className="p-3.5 text-foreground font-medium">Sub-second computational synthesis</td>
                  </tr>
                  <tr>
                    <td className="p-3.5 font-medium text-foreground">Indicator Synthesis</td>
                    <td className="p-3.5 text-muted-foreground">Limited by human cognitive capacity</td>
                    <td className="p-3.5 text-foreground font-medium">Multi-indicator cross-validation (RSI, MACD, EMA, ATR)</td>
                  </tr>
                  <tr>
                    <td className="p-3.5 font-medium text-foreground">Emotional Bias</td>
                    <td className="p-3.5 text-muted-foreground">High (FOMO, confirmation bias)</td>
                    <td className="p-3.5 text-foreground font-medium">Zero emotional distortion; purely mathematical</td>
                  </tr>
                  <tr>
                    <td className="p-3.5 font-medium text-foreground">Options Integration</td>
                    <td className="p-3.5 text-muted-foreground">Disconnected strike calculations</td>
                    <td className="p-3.5 text-foreground font-medium">Native strike ladder discovery &amp; ATM mapping</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          {/* High Intent FAQ Section */}
          <section className="space-y-6">
            <h2 className="font-heading text-2xl font-semibold text-foreground">
              Frequently Asked Questions About AI Stock Analysis
            </h2>

            <div className="space-y-4">
              <div className="glass-card rounded-xl border p-5 space-y-2" style={{ borderColor: "var(--line)" }}>
                <h3 className="text-base font-semibold text-foreground">
                  Can AI analyze both US equities and Indian stocks like NIFTY 50?
                </h3>
                <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                  Yes. Lumora AI natively supports global equities across US exchanges (NASDAQ, NYSE) as well as the National Stock Exchange of India (NSE) and Bombay Stock Exchange (BSE), including benchmark indices like NIFTY 50, BANK NIFTY, and SENSEX.
                </p>
              </div>

              <div className="glass-card rounded-xl border p-5 space-y-2" style={{ borderColor: "var(--line)" }}>
                <h3 className="text-base font-semibold text-foreground">
                  Is Lumora AI stock analysis free to use?
                </h3>
                <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                  Yes. Lumora AI provides free access to search global tickers, view live interactive technical charts, generate AI synthesis reports, and inspect multi-exchange option chains.
                </p>
              </div>

              <div className="glass-card rounded-xl border p-5 space-y-2" style={{ borderColor: "var(--line)" }}>
                <h3 className="text-base font-semibold text-foreground">
                  What is the difference between AI stock analysis and automated trading bots?
                </h3>
                <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                  Lumora AI is an institutional research and intelligence engine designed to provide human traders with deep clarity and probabilistic risk assessments. It does not execute automated trades on your brokerage account or make discretionary trading decisions on your behalf.
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
                href="/options-analysis"
                className="glass-card rounded-xl border p-4 hover:border-[var(--gold)] transition-colors group"
                style={{ borderColor: "var(--line)" }}
              >
                <h4 className="text-sm font-semibold text-foreground group-hover:text-[var(--gold)] transition-colors">
                  AI Options Analysis &rarr;
                </h4>
                <p className="text-xs text-muted-foreground mt-1">
                  Learn how strike ladders, Greeks, and ATM options are resolved.
                </p>
              </Link>

              <Link
                href="/indian-stock-market-ai"
                className="glass-card rounded-xl border p-4 hover:border-[var(--gold)] transition-colors group"
                style={{ borderColor: "var(--line)" }}
              >
                <h4 className="text-sm font-semibold text-foreground group-hover:text-[var(--gold)] transition-colors">
                  Indian Market AI &rarr;
                </h4>
                <p className="text-xs text-muted-foreground mt-1">
                  Explore NIFTY 50, BANKNIFTY, and NSE/BSE equity research.
                </p>
              </Link>

              <Link
                href="/faq"
                className="glass-card rounded-xl border p-4 hover:border-[var(--gold)] transition-colors group"
                style={{ borderColor: "var(--line)" }}
              >
                <h4 className="text-sm font-semibold text-foreground group-hover:text-[var(--gold)] transition-colors">
                  Knowledge Base &amp; FAQ &rarr;
                </h4>
                <p className="text-xs text-muted-foreground mt-1">
                  Full library of answer-first market questions and guides.
                </p>
              </Link>
            </div>
          </section>

          {/* E-E-A-T Disclaimer */}
          <footer className="pt-8 border-t border-[var(--line)] text-xs text-muted-foreground space-y-2">
            <p>
              <strong>Regulatory &amp; Research Disclaimer:</strong> Lumora AI provides algorithmic technical summaries and market data aggregation for informational and educational purposes only. Lumora AI is not a registered investment advisor (RIA) or broker-dealer. Nothing on this website constitutes financial, investment, legal, or tax advice. Market trading involves substantial risk of loss.
            </p>
            <p>
              &copy; {new Date().getFullYear()} Lumora AI. All rights reserved. Built for global and Indian market intelligence.
            </p>
          </footer>
        </main>
      </div>
    </>
  )
}
