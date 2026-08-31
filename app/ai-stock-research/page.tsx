import type { Metadata } from "next"
import Link from "next/link"
import {
  ArrowRight,
  BookOpen,
  BrainCircuit,
  CheckCircle2,
  FileText,
  Globe,
  Layers,
  Search,
  ShieldCheck,
  Sparkles,
  TrendingUp,
  Zap,
} from "lucide-react"
import { LumoraMark } from "@/components/lumora-mark"

export const metadata: Metadata = {
  title: "AI Stock Research & Financial Market Intelligence | Lumora AI",
  description:
    "Conduct deep equity research with Lumora AI. Synthesize corporate fundamentals, financial statements, multi-timeframe technical momentum, and live valuation ratios.",
  alternates: {
    canonical: "https://www.lumoraai.in/ai-stock-research",
  },
  openGraph: {
    title: "AI Stock Research & Financial Market Intelligence | Lumora AI",
    description:
      "Institutional-grade fundamental and technical equity synthesis powered by artificial intelligence.",
    url: "https://www.lumoraai.in/ai-stock-research",
    type: "article",
    images: [{ url: "https://www.lumoraai.in/lumora-logo.png" }],
  },
}

const researchFaqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "What is the difference between stock analysis and stock research?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Stock analysis typically focuses on mathematical and technical price action, momentum indicators, and chart structures. Stock research encompasses a broader fundamental investigation including business models, revenue quality, macroeconomic context, management execution, and comparative industry valuations.",
      },
    },
    {
      "@type": "Question",
      name: "How does Lumora AI assist in stock research?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Lumora AI bridges quantitative technical data with qualitative financial summaries. It aggregates financial ratios, trailing P/E, EPS, market capitalization, sector peers, and technical trends into a single structured research canvas.",
      },
    },
    {
      "@type": "Question",
      name: "Does Lumora AI provide personalized financial advisory services?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "No. Lumora AI is strictly an educational research and market intelligence tool. It does not provide personalized investment advice or fiduciary recommendations.",
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
      name: "AI Stock Research",
      item: "https://www.lumoraai.in/ai-stock-research",
    },
  ],
}

export default function AIStockResearchPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(researchFaqSchema) }}
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
              href="/ai-stock-analysis"
              className="text-xs font-semibold uppercase tracking-wider text-muted-foreground hover:text-foreground transition-colors hidden sm:block"
            >
              Technical Analysis
            </Link>
            <Link
              href="/markets"
              className="btn btn--primary rounded-full px-4 py-1.5 text-xs font-semibold"
            >
              Launch Research Terminal
            </Link>
          </div>
        </header>

        {/* Hero Section */}
        <main className="relative z-10 mx-auto max-w-4xl px-6 py-12 lg:py-16 space-y-16">
          <section className="space-y-6">
            <div className="inline-flex items-center gap-2 rounded-full border border-[var(--line)] bg-[var(--surface)] px-3.5 py-1 text-xs font-medium text-muted-foreground">
              <Search className="h-3.5 w-3.5 text-[var(--gold)]" />
              <span>Fundamental &amp; Quantitative Synthesis</span>
            </div>

            <h1 className="font-heading text-3xl sm:text-4xl lg:text-5xl font-semibold tracking-tight text-foreground leading-[1.15]">
              AI Stock Research: Comprehensive Market &amp; Valuation Intelligence
            </h1>

            <p className="text-base sm:text-lg leading-relaxed text-muted-foreground max-w-3xl">
              Transform raw market feeds into coherent investment research. Discover how Lumora AI synthesizes valuation multiples, technical structures, and multi-asset intelligence across global and Indian exchanges.
            </p>

            <div className="flex flex-wrap items-center gap-3 pt-2">
              <Link
                href="/markets?symbol=TCS.NS"
                className="btn btn--primary rounded-xl px-5 py-2.5 text-sm font-semibold flex items-center gap-2"
              >
                Research TCS (NSE) <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/markets?symbol=MSFT"
                className="btn rounded-xl border border-[var(--line)] bg-[var(--surface)] hover:bg-[var(--surface-alt)] px-5 py-2.5 text-sm font-semibold text-foreground flex items-center gap-2"
              >
                Research Microsoft (NASDAQ) <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </section>

          {/* Research Architecture Matrix */}
          <section className="space-y-6">
            <h2 className="font-heading text-2xl font-semibold text-foreground">
              The 4 Pillars of AI-Powered Equity Research
            </h2>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="glass-card rounded-xl border p-5 space-y-2.5" style={{ borderColor: "var(--line)" }}>
                <div className="flex items-center gap-2 text-foreground font-semibold">
                  <BookOpen className="h-4 w-4 text-[var(--gold)]" />
                  <h3>Valuation &amp; Fundamentals</h3>
                </div>
                <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                  Calculates trailing and forward Price-to-Earnings (P/E), Enterprise Value, Earnings Per Share (EPS), and dividend yield benchmarks.
                </p>
              </div>

              <div className="glass-card rounded-xl border p-5 space-y-2.5" style={{ borderColor: "var(--line)" }}>
                <div className="flex items-center gap-2 text-foreground font-semibold">
                  <BrainCircuit className="h-4 w-4 text-[var(--gold)]" />
                  <h3>Natural Language Synthesis</h3>
                </div>
                <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                  Generates executive market summaries grounded strictly in real-time price quotes, removing subjective speculation and marketing hype.
                </p>
              </div>

              <div className="glass-card rounded-xl border p-5 space-y-2.5" style={{ borderColor: "var(--line)" }}>
                <div className="flex items-center gap-2 text-foreground font-semibold">
                  <Globe className="h-4 w-4 text-[var(--gold)]" />
                  <h3>Sector &amp; Macro Context</h3>
                </div>
                <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                  Cross-references individual equities with benchmark sector indices (e.g. NIFTY IT, NIFTY AUTO, S&amp;P 500 Technology) to assess relative strength.
                </p>
              </div>

              <div className="glass-card rounded-xl border p-5 space-y-2.5" style={{ borderColor: "var(--line)" }}>
                <div className="flex items-center gap-2 text-foreground font-semibold">
                  <ShieldCheck className="h-4 w-4 text-[var(--gold)]" />
                  <h3>Transparent Limitations</h3>
                </div>
                <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                  Clearly marks automated outputs as probabilistic research rather than predictive guarantees, upholding strict E-E-A-T standards.
                </p>
              </div>
            </div>
          </section>

          {/* High Intent FAQ Section */}
          <section className="space-y-6">
            <h2 className="font-heading text-2xl font-semibold text-foreground">
              Frequently Asked Questions About AI Stock Research
            </h2>

            <div className="space-y-4">
              <div className="glass-card rounded-xl border p-5 space-y-2" style={{ borderColor: "var(--line)" }}>
                <h3 className="text-base font-semibold text-foreground">
                  Can AI stock research replace financial analysts?
                </h3>
                <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                  AI stock research serves as an assistive intelligence copilot. It dramatically accelerates data collection, indicator calculation, and cross-asset correlation, empowering investors to make well-informed decisions faster.
                </p>
              </div>

              <div className="glass-card rounded-xl border p-5 space-y-2" style={{ borderColor: "var(--line)" }}>
                <h3 className="text-base font-semibold text-foreground">
                  What data feeds does Lumora use for research?
                </h3>
                <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                  Lumora AI ingests tick and candle data directly from public financial endpoints and exchange feeds, covering global indices, US equities, Indian NSE/BSE securities, forex, crypto, and commodities.
                </p>
              </div>
            </div>
          </section>

          {/* Internal Links Cluster */}
          <section className="rounded-2xl border border-[var(--line)] bg-[var(--surface-alt)] p-6 space-y-4">
            <h3 className="font-heading text-sm font-semibold uppercase tracking-wider text-muted-foreground">
              Related Research Clusters
            </h3>
            <div className="grid gap-3 sm:grid-cols-3">
              <Link
                href="/ai-stock-analyzer"
                className="glass-card rounded-xl border p-4 hover:border-[var(--gold)] transition-colors group"
                style={{ borderColor: "var(--line)" }}
              >
                <h4 className="text-sm font-semibold text-foreground group-hover:text-[var(--gold)] transition-colors">
                  AI Stock Analyzer &rarr;
                </h4>
                <p className="text-xs text-muted-foreground mt-1">
                  Algorithmic multi-factor momentum and scoring.
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
                  NSE &amp; BSE stock intelligence and index research.
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
                  Benchmark momentum, support/resistance, and options.
                </p>
              </Link>
            </div>
          </section>

          {/* E-E-A-T Disclaimer */}
          <footer className="pt-8 border-t border-[var(--line)] text-xs text-muted-foreground space-y-2">
            <p>
              <strong>Disclaimer:</strong> Lumora AI provides market research and educational tools. All calculations are algorithmic estimations and do not constitute financial advice.
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
