import Link from "next/link"
import { Navbar } from "@/components/navbar"
import { HeroParallax } from "@/components/hero-parallax"
import { StatsSection } from "@/components/stats-section"
import { HowItWorks } from "@/components/how-it-works"
import { MarketMarquee } from "@/components/market-marquee"
import { MarketFocus } from "@/app/(dashboard)/dashboard/market-focus"
import { AiDemo } from "@/components/landing/ai-demo"
import { Testimonials } from "@/components/landing/testimonials"
import { Pricing } from "@/components/landing/pricing"
import { FadeUp, FadeScale, CardReveal } from "@/components/reveal"
import { getQuotes } from "@/lib/market"
import { LumoraMark } from "@/components/lumora-mark"
import { StartFreeButton } from "@/components/start-free-button"

const EXCHANGES = [
  ["NYSE", "USA"], ["NASDAQ", "USA"], ["NSE", "India"], ["BSE", "India"],
  ["LSE", "UK"], ["TSE", "Japan"], ["FSE", "Germany"], ["HKEX", "HK"],
  ["ASX", "Australia"], ["SSE", "China"], ["TSX", "Canada"], ["Euronext", "EU"],
]

const CAPABILITIES = [
  { number: "01", title: "Multi-Exchange Data", desc: "Real-time feeds from 60+ exchanges across 40+ countries. One connection." },
  { number: "02", title: "AI-Powered Analysis", desc: "Every insight explained in plain language. Know why behind the move." },
  { number: "03", title: "Portfolio Oversight", desc: "Track holdings, watchlists, and risk — all in one place." },
  { number: "04", title: "Smart Trade Planning", desc: "AI-assisted plans with clear risk/reward and confidence scoring." },
]

export default async function HomePage() {
  const quotes = await getQuotes(["AAPL", "MSFT", "NVDA", "TSLA", "RELIANCE.NS", "TCS.NS", "HDFCBANK.NS", "GOOGL", "AMZN", "META"]).catch(() => [])

  return (
    <>
      <Navbar />

      {/* HERO */}
      <HeroParallax />

      {/* MARKET TICKER */}
      <section className="relative z-10">
        <MarketMarquee quotes={quotes} />
      </section>

      {/* INTERACTIVE VISUAL / DASHBOARD PREVIEW */}
      <section className="scene relative z-10 px-4 py-24 sm:px-6 lg:px-10">
        <FadeUp>
          <p className="subheading text-center">Live workspace</p>
          <h2 className="title mt-3 text-center">Your markets, composed</h2>
          <p className="body mx-auto mt-4 text-center">A calm, editorial view of any instrument — chart, AI read, and news in one surface.</p>
        </FadeUp>
        <FadeScale delay={0.1}>
          <div className="mx-auto mt-10 max-w-5xl">
            <MarketFocus initialSymbol="AAPL" />
          </div>
        </FadeScale>
      </section>

      {/* HOW IT WORKS */}
      <section className="scene relative z-10" style={{ background: "var(--bg-alt)" }}>
        <FadeScale>
          <HowItWorks />
        </FadeScale>
      </section>

      {/* AI DEMO */}
      <section className="scene relative z-10 px-4 py-24 sm:px-6 lg:px-10">
        <AiDemo />
      </section>

      {/* STATS + EXCHANGES */}
      <section className="scene relative z-10 px-4 sm:px-6 lg:px-10" id="reach">
        <FadeScale>
          <p className="subheading mb-6 text-center">Global coverage</p>
          <div className="flex justify-center">
            <StatsSection />
          </div>
        </FadeScale>
        <FadeUp delay={0.2}>
          <div className="mt-10">
            <p className="meta mb-4 text-center">Supported exchanges</p>
            <div className="flex flex-wrap justify-center gap-2">
              {EXCHANGES.map(([ex, country]) => (
                <span key={ex} className="chip">
                  <span className="text-xs font-semibold" style={{ color: "var(--text-primary)" }}>{ex}</span>
                  <span className="text-[10px]">{country}</span>
                </span>
              ))}
            </div>
          </div>
        </FadeUp>
      </section>

      {/* CAPABILITIES — asymmetric editorial grid */}
      <section className="scene relative z-10 px-4 py-24 sm:px-6 lg:px-10" id="offerings" style={{ background: "var(--bg-alt)" }}>
        <FadeUp>
          <p className="subheading">Platform capabilities</p>
          <h2 className="title mt-3">Built for the modern desk</h2>
        </FadeUp>
        <div className="relative mt-10 grid grid-cols-1 gap-4 md:grid-cols-2">
          {CAPABILITIES.map((item, i) => (
            <CardReveal key={item.number} delay={0.1 + i * 0.08} index={i}>
              <div className="editorial-card flex h-full flex-col gap-3 p-7 transition-colors duration-300 hover:border-[var(--gold-line)]">
                <div className="flex items-center justify-between">
                  <span className="meta" style={{ color: "var(--gold)" }}>{item.number}</span>
                  <span className="h-px flex-1 ml-4" style={{ background: "linear-gradient(90deg, var(--gold-line), transparent)" }} />
                </div>
                <h3 className="heading-sm mt-2">{item.title}</h3>
                <p className="body mt-1">{item.desc}</p>
              </div>
            </CardReveal>
          ))}
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section className="scene relative z-10 px-4 py-24 sm:px-6 lg:px-10">
        <Testimonials />
      </section>

      {/* AI KNOWLEDGE & PILLAR CLUSTERS (SEO / AEO) */}
      <section className="scene relative z-10 px-4 py-24 sm:px-6 lg:px-10" style={{ background: "var(--bg-alt)" }}>
        <div className="mx-auto max-w-5xl space-y-12">
          <FadeUp>
            <p className="subheading text-center">Market Intelligence Architecture</p>
            <h2 className="title mt-3 text-center">Understanding AI-Powered Market Research</h2>
            <p className="body mx-auto mt-4 text-center max-w-2xl">
              Objective mathematical modeling meets real-time market microstructure across US and Indian exchanges.
            </p>
          </FadeUp>

          <div className="grid gap-6 sm:grid-cols-3">
            <div className="glass-card rounded-2xl border p-6 space-y-3" style={{ borderColor: "var(--line)" }}>
              <h3 className="font-heading text-base font-semibold text-foreground">
                Quantitative AI Stock Analysis
              </h3>
              <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                Synthesize RSI momentum, multi-timeframe EMAs, and Bollinger Band compressions into structured, probabilistic research briefings.
              </p>
              <Link
                href="/ai-stock-analysis"
                className="inline-flex items-center text-xs font-semibold text-[var(--gold)] hover:underline pt-2"
              >
                Explore AI Analysis &rarr;
              </Link>
            </div>

            <div className="glass-card rounded-2xl border p-6 space-y-3" style={{ borderColor: "var(--line)" }}>
              <h3 className="font-heading text-base font-semibold text-foreground">
                Options Analysis &amp; Strike Ladders
              </h3>
              <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                Dynamic contract discovery for At-The-Money (ATM) strikes, Put-Call Ratio (PCR), and Option Greeks across multi-exchange ladders.
              </p>
              <Link
                href="/options-analysis"
                className="inline-flex items-center text-xs font-semibold text-[var(--gold)] hover:underline pt-2"
              >
                Explore Options AI &rarr;
              </Link>
            </div>

            <div className="glass-card rounded-2xl border p-6 space-y-3" style={{ borderColor: "var(--line)" }}>
              <h3 className="font-heading text-base font-semibold text-foreground">
                Indian Equities &amp; NIFTY 50
              </h3>
              <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                Native coverage for National Stock Exchange (NSE) and Bombay Stock Exchange (BSE), including NIFTY 50, BANKNIFTY, and SENSEX.
              </p>
              <Link
                href="/indian-stock-market-ai"
                className="inline-flex items-center text-xs font-semibold text-[var(--gold)] hover:underline pt-2"
              >
                Explore Indian Equities &rarr;
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* PRICING */}
      <section className="scene relative z-10 px-4 py-24 sm:px-6 lg:px-10">
        <Pricing />
      </section>

      {/* CTA */}
      <section className="scene relative z-10 px-4 py-24 sm:px-6 lg:px-10" style={{ background: "var(--bg-alt)" }}>
        <FadeScale delay={0.1}>
          <div className="glass relative mx-auto flex w-full max-w-2xl flex-col items-center overflow-hidden px-10 py-16 text-center">
            <div className="pointer-events-none absolute -inset-24 opacity-50" style={{ background: "radial-gradient(circle at 50% 0%, var(--gold-glow-strong), transparent 60%)" }} />
            <h2 className="title mt-4">Ready to see clearly?</h2>
            <p className="body mt-4 text-center">Join Lumora and transform how you understand global markets.</p>
            <div className="mt-8 flex flex-wrap justify-center gap-3">
              <StartFreeButton className="btn btn--gold">Get started free</StartFreeButton>
              <Link href="/markets" className="btn">Explore dashboard</Link>
            </div>
          </div>
        </FadeScale>
      </section>

      {/* FOOTER */}
      <footer className="relative z-10 border-t border-[var(--line)] bg-[var(--bg)]">
        <div className="mx-auto max-w-6xl px-6 py-16">
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4 pb-12 border-b border-[var(--line)]">
            <div className="space-y-3">
              <LumoraMark className="h-8 w-8" showText />
              <p className="text-xs text-muted-foreground leading-relaxed">
                Institutional-grade AI stock analysis and multi-exchange market intelligence.
              </p>
              <p className="text-xs text-muted-foreground">
                Direct Contact: <a href="mailto:support@lumoraai.in" className="text-foreground hover:underline">support@lumoraai.in</a>
              </p>
            </div>

            <div className="space-y-2.5">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-foreground">Terminal &amp; Research</h4>
              <ul className="space-y-1.5 text-xs text-muted-foreground">
                <li><Link href="/markets" className="hover:text-foreground transition-colors">Markets Terminal</Link></li>
                <li><Link href="/ai-stock-analysis" className="hover:text-foreground transition-colors">AI Stock Analysis</Link></li>
                <li><Link href="/ai-stock-analyzer" className="hover:text-foreground transition-colors">AI Stock Analyzer</Link></li>
                <li><Link href="/ai-stock-research" className="hover:text-foreground transition-colors">AI Stock Research</Link></li>
                <li><Link href="/options-analysis" className="hover:text-foreground transition-colors">Options Intelligence</Link></li>
                <li><Link href="/indian-stock-market-ai" className="hover:text-foreground transition-colors">Indian Stock Market AI</Link></li>
                <li><Link href="/nifty-50-ai-analysis" className="hover:text-foreground transition-colors">NIFTY 50 AI Analysis</Link></li>
              </ul>
            </div>

            <div className="space-y-2.5">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-foreground">Knowledge &amp; Support</h4>
              <ul className="space-y-1.5 text-xs text-muted-foreground">
                <li><Link href="/faq" className="hover:text-foreground transition-colors">Knowledge Base &amp; FAQ</Link></li>
                <li><Link href="/about" className="hover:text-foreground transition-colors">About &amp; Methodology</Link></li>
                <li><Link href="/privacy" className="hover:text-foreground transition-colors">Privacy Policy</Link></li>
                <li><Link href="/terms" className="hover:text-foreground transition-colors">Terms of Service</Link></li>
              </ul>
            </div>

            <div className="space-y-2.5">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-foreground">Compliance &amp; Risk</h4>
              <p className="text-[11px] leading-relaxed text-muted-foreground">
                Lumora AI provides algorithmic data synthesis for educational purposes only. Not a registered investment advisor. Trading involves substantial risk of capital loss.
              </p>
            </div>
          </div>

          <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-muted-foreground">
            <p>&copy; {new Date().getFullYear()} Lumora AI. All rights reserved. Production Domain: https://www.lumoraai.in</p>
            <div className="flex gap-4">
              <Link href="/privacy" className="hover:text-foreground transition-colors">Privacy</Link>
              <Link href="/terms" className="hover:text-foreground transition-colors">Terms</Link>
              <Link href="/faq" className="hover:text-foreground transition-colors">FAQ</Link>
            </div>
          </div>
        </div>
      </footer>
    </>
  )
}
