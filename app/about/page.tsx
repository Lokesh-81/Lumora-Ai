import type { Metadata } from "next"
import Link from "next/link"
import { ArrowRight, CheckCircle2, Compass, Cpu, Database, Eye, Globe2, Shield, Sparkles } from "lucide-react"
import { LumoraMark } from "@/components/lumora-mark"

export const metadata: Metadata = {
  title: "About Lumora AI — Mission, Methodology & Market Data Intelligence",
  description:
    "Learn about Lumora AI's mission to bring transparent, institutional-grade market intelligence and quantitative technical analysis to modern traders.",
  alternates: {
    canonical: "https://www.lumoraai.in/about",
  },
  openGraph: {
    title: "About Lumora AI — Mission & Quantitative Architecture",
    description:
      "Empowering traders with algorithmic clarity, objective indicator synthesis, and multi-exchange derivative visualization.",
    url: "https://www.lumoraai.in/about",
    type: "website",
    images: [{ url: "https://www.lumoraai.in/lumora-logo.png" }],
  },
}

const aboutSchema = {
  "@context": "https://schema.org",
  "@type": "AboutPage",
  mainEntity: {
    "@type": "Organization",
    name: "Lumora AI",
    url: "https://www.lumoraai.in",
    logo: "https://www.lumoraai.in/lumora-logo.png",
    description:
      "Lumora AI builds computational intelligence tools, technical chart visualizers, and derivative analysis platforms for global and Indian equities.",
    contactPoint: {
      "@type": "ContactPoint",
      email: "support@lumoraai.in",
      contactType: "customer support",
    },
  },
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
      name: "About",
      item: "https://www.lumoraai.in/about",
    },
  ],
}

export default function AboutPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(aboutSchema) }}
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
              <Compass className="h-3.5 w-3.5 text-[var(--gold)]" />
              <span>Platform Mission &amp; Principles</span>
            </div>

            <h1 className="font-heading text-3xl sm:text-4xl lg:text-5xl font-semibold tracking-tight text-foreground leading-[1.15]">
              Bringing Institutional Market Clarity to Every Desk
            </h1>

            <p className="text-base sm:text-lg leading-relaxed text-muted-foreground max-w-3xl">
              Lumora AI was founded on a simple principle: modern market intelligence should be transparent, mathematically rigorous, and accessible without cognitive overload or sensationalism.
            </p>
          </section>

          {/* Philosophy Section */}
          <section className="glass-card rounded-2xl border p-6 sm:p-8 space-y-4" style={{ borderColor: "var(--line)" }}>
            <h2 className="font-heading text-xl font-semibold text-foreground flex items-center gap-2.5">
              <Eye className="h-5 w-5 text-[var(--gold)]" />
              Our Non-Predictive Philosophy
            </h2>
            <p className="text-sm sm:text-base leading-relaxed text-muted-foreground">
              Financial markets are inherently non-deterministic. We reject black-box &quot;get-rich-quick&quot; algorithms that claim to predict tomorrow&apos;s closing prices. Instead, Lumora AI focuses on <strong>probabilistic technical structures</strong>: measuring trend momentum, identifying mean-reversion inflection zones, mapping options positioning, and calculating statistical support and resistance levels.
            </p>
          </section>

          {/* Core Technical Pillars */}
          <section className="space-y-6">
            <h2 className="font-heading text-2xl font-semibold text-foreground">
              How Lumora AI Works
            </h2>

            <div className="grid gap-4 sm:grid-cols-3">
              <div className="glass-card rounded-xl border p-5 space-y-2.5" style={{ borderColor: "var(--line)" }}>
                <div className="flex items-center gap-2 text-foreground font-semibold text-base">
                  <Database className="h-4 w-4 text-[var(--gold)]" />
                  <h3>1. Live Market Feeds</h3>
                </div>
                <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                  Aggregates real-time price quotes, historical candle bars, and volume data across US and Indian exchanges.
                </p>
              </div>

              <div className="glass-card rounded-xl border p-5 space-y-2.5" style={{ borderColor: "var(--line)" }}>
                <div className="flex items-center gap-2 text-foreground font-semibold text-base">
                  <Cpu className="h-4 w-4 text-[var(--gold)]" />
                  <h3>2. Quantitative Math</h3>
                </div>
                <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                  Calculates RSI, MACD, Bollinger Bands, ATR, and dynamic strike interval ladders client- and server-side.
                </p>
              </div>

              <div className="glass-card rounded-xl border p-5 space-y-2.5" style={{ borderColor: "var(--line)" }}>
                <div className="flex items-center gap-2 text-foreground font-semibold text-base">
                  <Sparkles className="h-4 w-4 text-[var(--gold)]" />
                  <h3>3. AI Synthesis</h3>
                </div>
                <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                  Leverages Gemini AI to synthesize technical data into coherent, structured research briefings with clear risk scores.
                </p>
              </div>
            </div>
          </section>

          {/* Trust & E-E-A-T */}
          <section className="glass-card rounded-2xl border p-6 sm:p-8 space-y-4" style={{ borderColor: "var(--gold-line)", background: "var(--surface)" }}>
            <h2 className="font-heading text-lg font-semibold text-foreground flex items-center gap-2">
              <Shield className="h-5 w-5 text-[var(--gold)]" />
              Commitment to Transparency &amp; Data Integrity
            </h2>
            <div className="space-y-3 text-xs sm:text-sm text-muted-foreground">
              <p>
                &bull; <strong>No Fabricated Live Data:</strong> If a real-time derivative quote feed is not connected for Indian derivatives, we explicitly disclose it and render derivative pricing fields as &quot;—&quot; while providing live underlying spot pricing.
              </p>
              <p>
                &bull; <strong>Strict Privacy:</strong> We do not sell user data. Your research watchlists and trade setups remain strictly confidential.
              </p>
              <p>
                &bull; <strong>Direct Support:</strong> Contact our team anytime at <code className="text-foreground">support@lumoraai.in</code> for questions, feedback, or integration inquiries.
              </p>
            </div>
          </section>

          {/* Internal Links Cluster */}
          <section className="rounded-2xl border border-[var(--line)] bg-[var(--surface-alt)] p-6 space-y-4">
            <h3 className="font-heading text-sm font-semibold uppercase tracking-wider text-muted-foreground">
              Platform Features &amp; Research
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
                  How our quantitative scoring engine works.
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
                href="/indian-stock-market-ai"
                className="glass-card rounded-xl border p-4 hover:border-[var(--gold)] transition-colors group"
                style={{ borderColor: "var(--line)" }}
              >
                <h4 className="text-sm font-semibold text-foreground group-hover:text-[var(--gold)] transition-colors">
                  Indian Market AI &rarr;
                </h4>
                <p className="text-xs text-muted-foreground mt-1">
                  NIFTY 50, BANKNIFTY, and NSE/BSE coverage.
                </p>
              </Link>
            </div>
          </section>

          {/* E-E-A-T Disclaimer */}
          <footer className="pt-8 border-t border-[var(--line)] text-xs text-muted-foreground space-y-2">
            <p>
              <strong>Disclaimer:</strong> Lumora AI is a market intelligence software suite designed for educational and informational analysis only. Lumora AI is not a SEBI/SEC registered investment advisor.
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
