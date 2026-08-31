import type { Metadata } from "next"
import Link from "next/link"
import { ArrowRight, Layers, Sliders, Target, TrendingUp, Zap } from "lucide-react"
import { LumoraMark } from "@/components/lumora-mark"

export const metadata: Metadata = {
  title: "AI Options Analysis & Option Chain Intelligence | Lumora AI",
  description:
    "Master options chain dynamics with AI: understand strike ladders, At-The-Money (ATM) detection, Option Greeks (Delta, Gamma, Theta, Vega), and contract discovery.",
  alternates: {
    canonical: "https://www.lumoraai.in/options-analysis",
  },
  openGraph: {
    title: "AI Options Analysis & Option Chain Intelligence | Lumora AI",
    description:
      "Explore dynamic strike ladder resolution, Greeks computation, and multi-exchange option chains across US equities and Indian benchmark indices.",
    url: "https://www.lumoraai.in/options-analysis",
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
      name: "What is an At-The-Money (ATM) option strike?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "An At-The-Money (ATM) option strike is the listed contract strike price closest to the current live spot price of the underlying asset. For example, if NIFTY 50 is trading at 24,090, the nearest 50-point interval strike (24,100) is considered At-The-Money.",
      },
    },
    {
      "@type": "Question",
      name: "What are the Option Greeks?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Option Greeks measure the sensitivity of an option's premium to key market variables: Delta measures price change per $1 or ₹1 move in the underlying; Gamma measures the rate of change of Delta; Theta measures daily time decay; and Vega measures sensitivity to changes in implied volatility (IV).",
      },
    },
    {
      "@type": "Question",
      name: "How does Lumora AI discover Indian option contracts like NIFTY 24150 CE?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Lumora AI utilizes a multi-token canonical derivative resolver that parses underlying index roots (e.g. NIFTY, BANKNIFTY, SENSEX), target expiry calendars (monthly last Thursday/Friday), numeric strike levels, and contract rights (Call/CE or Put/PE) into canonical exchange instruments anchored directly to live spot price feeds.",
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
      name: "Options Analysis",
      item: "https://www.lumoraai.in/options-analysis",
    },
  ],
}

export default function OptionsAnalysisPage() {
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
              <Layers className="h-3.5 w-3.5 text-[var(--gold)]" />
              <span>Multi-Exchange Derivative Intelligence</span>
            </div>

            <h1 className="font-heading text-3xl sm:text-4xl lg:text-5xl font-semibold tracking-tight text-foreground leading-[1.15]">
              AI Options Analysis: Dynamic Strike Discovery &amp; Volatility Architecture
            </h1>

            <p className="text-base sm:text-lg leading-relaxed text-muted-foreground max-w-3xl">
              Deconstruct option chains with mathematical precision. Explore how dynamic strike ladders, At-The-Money (ATM) detection, and Option Greeks provide structured visibility into market positioning.
            </p>

            <div className="flex flex-wrap items-center gap-3 pt-2">
              <Link
                href="/markets?symbol=AAPL"
                className="btn btn--primary rounded-xl px-5 py-2.5 text-sm font-semibold flex items-center gap-2"
              >
                Inspect AAPL Options <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/markets?symbol=%5ENSEI"
                className="btn rounded-xl border border-[var(--line)] bg-[var(--surface)] hover:bg-[var(--surface-alt)] px-5 py-2.5 text-sm font-semibold text-foreground flex items-center gap-2"
              >
                Inspect NIFTY 50 Chain <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </section>

          {/* Answer Box for AEO */}
          <section className="glass-card rounded-2xl border p-6 sm:p-8 space-y-4" style={{ borderColor: "var(--line)" }}>
            <h2 className="font-heading text-xl font-semibold text-foreground flex items-center gap-2.5">
              <Target className="h-5 w-5 text-[var(--gold)]" />
              Understanding the Option Strike Ladder
            </h2>
            <p className="text-sm sm:text-base leading-relaxed text-muted-foreground">
              An <strong>Option Chain</strong> (or strike ladder) is a structured matrix displaying all available Call (CE) and Put (PE) contracts for a given underlying asset across designated expiry dates. Contracts are organized around the <strong>At-The-Money (ATM) strike</strong>, which reflects the strike nearest to the current underlying market spot quote.
            </p>
          </section>

          {/* Canonical Indian Derivative Contract Routes */}
          <section className="space-y-6">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <h2 className="font-heading text-2xl font-semibold text-foreground flex items-center gap-2">
                <Layers className="h-5 w-5 text-[var(--gold)]" />
                Featured Indian Index Option Contracts
              </h2>
              <span className="text-xs text-muted-foreground">
                Canonical strike pages with live underlying spot feeds
              </span>
            </div>

            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {[
                { name: "NIFTY 50 24150 CE", href: "/options/nifty-50/24150-ce", desc: "NIFTY 50 Call Strike" },
                { name: "NIFTY 50 24150 PE", href: "/options/nifty-50/24150-pe", desc: "NIFTY 50 Put Strike" },
                { name: "NIFTY 50 24250 CE", href: "/options/nifty-50/24250-ce", desc: "NIFTY 50 Call Strike" },
                { name: "NIFTY 50 24250 PE", href: "/options/nifty-50/24250-pe", desc: "NIFTY 50 Put Strike" },
                { name: "SENSEX 77400 CE", href: "/options/sensex/77400-ce", desc: "BSE SENSEX Call Strike" },
                { name: "SENSEX 77400 PE", href: "/options/sensex/77400-pe", desc: "BSE SENSEX Put Strike" },
                { name: "BANKNIFTY 55000 CE", href: "/options/banknifty/55000-ce", desc: "NIFTY Bank Call Strike" },
                { name: "BANKNIFTY 55000 PE", href: "/options/banknifty/55000-pe", desc: "NIFTY Bank Put Strike" },
              ].map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="glass-card rounded-xl border p-4 hover:border-[var(--gold)] transition-colors group flex items-center justify-between"
                  style={{ borderColor: "var(--line)" }}
                >
                  <div>
                    <h3 className="text-sm font-semibold text-foreground group-hover:text-[var(--gold)] transition-colors">
                      {item.name}
                    </h3>
                    <p className="text-[11px] text-muted-foreground">{item.desc}</p>
                  </div>
                  <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-[var(--gold)] transition-colors" />
                </Link>
              ))}
            </div>
          </section>

          {/* Core Greeks Explained */}
          <section className="space-y-6">
            <h2 className="font-heading text-2xl font-semibold text-foreground">
              The Option Greeks Deconstructed
            </h2>
            <p className="text-sm text-muted-foreground">
              Quantitative derivative pricing relies on the Black-Scholes model and its fundamental sensitivities:
            </p>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="glass-card rounded-xl border p-5 space-y-2.5" style={{ borderColor: "var(--line)" }}>
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-foreground text-base">Delta (&Delta;)</h3>
                  <span className="text-[11px] font-mono rounded bg-[var(--surface-alt)] px-2 py-0.5 text-muted-foreground">0.0 to 1.0</span>
                </div>
                <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                  Measures the expected change in option premium for every 1-point change in the underlying asset. ATM calls typically possess a delta of ~0.50.
                </p>
              </div>

              <div className="glass-card rounded-xl border p-5 space-y-2.5" style={{ borderColor: "var(--line)" }}>
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-foreground text-base">Gamma (&Gamma;)</h3>
                  <span className="text-[11px] font-mono rounded bg-[var(--surface-alt)] px-2 py-0.5 text-muted-foreground">Acceleration</span>
                </div>
                <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                  Measures the rate of change in Delta per 1-point move in the underlying price. Gamma peaks for At-The-Money options near expiration.
                </p>
              </div>

              <div className="glass-card rounded-xl border p-5 space-y-2.5" style={{ borderColor: "var(--line)" }}>
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-foreground text-base">Theta (&Theta;)</h3>
                  <span className="text-[11px] font-mono rounded bg-[var(--surface-alt)] px-2 py-0.5 text-muted-foreground">Time Decay</span>
                </div>
                <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                  Represents the daily mathematical erosion of an option&apos;s extrinsic value as expiration approaches, accelerating in the final 30 days.
                </p>
              </div>

              <div className="glass-card rounded-xl border p-5 space-y-2.5" style={{ borderColor: "var(--line)" }}>
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-foreground text-base">Vega (&nu;)</h3>
                  <span className="text-[11px] font-mono rounded bg-[var(--surface-alt)] px-2 py-0.5 text-muted-foreground">IV Sensitivity</span>
                </div>
                <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                  Quantifies the option premium&apos;s sensitivity to a 1% shift in Implied Volatility (IV), reflecting market sentiment and expected volatility.
                </p>
              </div>
            </div>
          </section>

          {/* Transparency & Architecture Disclosure */}
          <section className="glass-card rounded-2xl border p-6 sm:p-8 space-y-4" style={{ borderColor: "var(--gold-line)", background: "var(--surface)" }}>
            <h2 className="font-heading text-lg font-semibold text-foreground flex items-center gap-2">
              <Sliders className="h-5 w-5 text-[var(--gold)]" />
              Derivative Data Feed Architecture &amp; Transparency
            </h2>
            <p className="text-xs sm:text-sm leading-relaxed text-muted-foreground">
              Lumora AI maintains strict data integrity standards:
            </p>
            <ul className="space-y-2 text-xs sm:text-sm text-muted-foreground">
              <li className="flex items-start gap-2">
                <span className="text-[var(--gold)] font-bold">&bull;</span>
                <span><strong>US Listed Options (NYSE/NASDAQ):</strong> Powered by live exchange feeds providing bid/ask premiums, implied volatility, and volume indicators.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-[var(--gold)] font-bold">&bull;</span>
                <span><strong>Indian Derivatives (NSE NFO / BSE BFO):</strong> Dynamically resolved based on official exchange strike intervals and active calendar expiries, grounded strictly in live underlying spot quotes. Real-time derivative quote streaming requires direct broker API connectivity.</span>
              </li>
            </ul>
          </section>

          {/* High Intent FAQ Section */}
          <section className="space-y-6">
            <h2 className="font-heading text-2xl font-semibold text-foreground">
              Options Analysis Questions Answered
            </h2>

            <div className="space-y-4">
              <div className="glass-card rounded-xl border p-5 space-y-2" style={{ borderColor: "var(--line)" }}>
                <h3 className="text-base font-semibold text-foreground">
                  What is Put-Call Ratio (PCR) and why does it matter?
                </h3>
                <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                  The Put-Call Ratio (PCR) compares the trading volume or open interest of Put options relative to Call options. A high PCR (&gt;1.2) often indicates bearish positioning or contrarian oversold conditions, whereas a low PCR (&lt;0.7) reflects heavy bullish speculation.
                </p>
              </div>

              <div className="glass-card rounded-xl border p-5 space-y-2" style={{ borderColor: "var(--line)" }}>
                <h3 className="text-base font-semibold text-foreground">
                  How does Lumora handle contract discovery for search queries like &quot;NIFTY 24150 CE&quot;?
                </h3>
                <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                  Our canonical resolver decomposes the search query into its underlying asset (`NIFTY 50`), target expiry (`Current Monthly Thursday`), strike price (`24150`), and contract type (`CE - Call Option`), seamlessly mapping it to the active option chain matrix.
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
                  Quantitative algorithms, indicators, and risk scoring.
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
                  NSE &amp; BSE index research and stock intelligence.
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
                  Full library of answer-first market questions.
                </p>
              </Link>
            </div>
          </section>

          {/* E-E-A-T Disclaimer */}
          <footer className="pt-8 border-t border-[var(--line)] text-xs text-muted-foreground space-y-2">
            <p>
              <strong>Options Risk Disclosure:</strong> Options trading involves significant risk and is not suitable for all investors. Option contracts are wasting assets subject to time decay. Lumora AI provides educational data aggregation and analytical modeling only.
            </p>
            <p>
              &copy; {new Date().getFullYear()} Lumora AI. All rights reserved.
            </p>
          </footer>
        </main>
      </div>
    </>
  )
}
