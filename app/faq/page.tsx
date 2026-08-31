import type { Metadata } from "next"
import Link from "next/link"
import { ArrowRight, HelpCircle, Search, ShieldAlert, Sparkles } from "lucide-react"
import { LumoraMark } from "@/components/lumora-mark"

export const metadata: Metadata = {
  title: "Frequently Asked Questions — AI Stock Analysis & Market Data | Lumora AI",
  description:
    "Get immediate answers about AI stock analysis, NIFTY options chain discovery, Option Greeks, data feed architecture, and algorithmic research methods.",
  alternates: {
    canonical: "https://www.lumoraai.in/faq",
  },
  openGraph: {
    title: "Lumora AI Knowledge Base & FAQ",
    description:
      "Direct answers on AI-powered equity analysis, Indian derivative contracts, and market intelligence.",
    url: "https://www.lumoraai.in/faq",
    type: "article",
    images: [{ url: "https://www.lumoraai.in/lumora-logo.png" }],
  },
}

const FAQ_ITEMS = [
  {
    q: "What is AI stock analysis?",
    a: "AI stock analysis is the computational evaluation of financial markets using machine learning models to synthesize technical momentum (RSI, Stochastic), trend structure (multi-timeframe EMAs), volatility metrics (Bollinger Bands, ATR), and price action patterns into structured, objective research summaries.",
  },
  {
    q: "How does Lumora AI analyze stocks and market instruments?",
    a: "When you enter a ticker symbol or natural language contract query, Lumora AI gathers live market quotes, computes multi-period technical indicators, cross-validates support and resistance boundaries, and evaluates the probability of trend continuation or mean reversion.",
  },
  {
    q: "Can AI analyze Indian stocks and benchmark indices like NIFTY 50 and SENSEX?",
    a: "Yes. Lumora AI provides complete coverage of Indian equities listed on the National Stock Exchange (NSE) and Bombay Stock Exchange (BSE), including NIFTY 50 (^NSEI), NIFTY BANK (^NSEBANK), BSE SENSEX (^BSESN), FINNIFTY, MIDCPNIFTY, and large-cap bluechips like Reliance, TCS, and HDFC Bank.",
  },
  {
    q: "What is the difference between spot market data and derivative data?",
    a: "Spot market data represents the current cash price at which an asset is immediately bought or sold on the primary exchange. Derivative data relates to contracts (such as Futures and Options) whose values derive from the spot price. In Lumora AI, underlying spot pricing is live and active, while derivative strike ladders are dynamically constructed around the live spot price.",
  },
  {
    q: "What is an At-The-Money (ATM) option strike?",
    a: "An At-The-Money (ATM) option strike is the listed contract strike price closest to the current underlying market spot price. For instance, if NIFTY 50 trades at 24,090, the closest standard 50-point strike (24,100) is designated as ATM.",
  },
  {
    q: "How does Lumora AI resolve queries like 'NIFTY 24150 CE' or 'BANKNIFTY 55000 PE'?",
    a: "Lumora AI's canonical derivative resolver parses the input tokens into their canonical root index, active calendar expiry, strike price, and option type (Call/CE or Put/PE), dynamically mapping the contract to the official exchange strike ladder.",
  },
  {
    q: "What data sources and providers does Lumora AI use?",
    a: "Lumora AI utilizes public market quotes from Yahoo Finance for global and Indian equities, combined with native computational models for mathematical indicator calculation and Google Gemini AI for qualitative technical synthesis.",
  },
  {
    q: "Does Lumora AI execute automated trades or offer financial advice?",
    a: "No. Lumora AI is strictly an educational research and market intelligence terminal. It does not execute automated trades on your behalf and does not provide individualized financial or investment advice. All analysis is probabilistic and informational.",
  },
  {
    q: "Is Lumora AI free to use?",
    a: "Yes. Lumora AI provides free access to search global tickers, view interactive candlestick charts, generate AI synthesis reports, and inspect multi-exchange option chains.",
  },
]

const faqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: FAQ_ITEMS.map((item) => ({
    "@type": "Question",
    name: item.q,
    acceptedAnswer: {
      "@type": "Answer",
      text: item.a,
    },
  })),
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
      name: "FAQ",
      item: "https://www.lumoraai.in/faq",
    },
  ],
}

export default function FAQPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
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

        {/* Main Content */}
        <main className="relative z-10 mx-auto max-w-4xl px-6 py-12 lg:py-16 space-y-12">
          <section className="space-y-4 text-center max-w-2xl mx-auto">
            <div className="inline-flex items-center gap-2 rounded-full border border-[var(--line)] bg-[var(--surface)] px-3.5 py-1 text-xs font-medium text-muted-foreground">
              <HelpCircle className="h-3.5 w-3.5 text-[var(--gold)]" />
              <span>Answer Engine Knowledge Base</span>
            </div>

            <h1 className="font-heading text-3xl sm:text-4xl font-semibold tracking-tight text-foreground">
              Frequently Asked Questions About Lumora AI
            </h1>

            <p className="text-sm sm:text-base leading-relaxed text-muted-foreground">
              Direct, transparent answers regarding algorithmic stock analysis, derivative contract resolution, and market data architecture.
            </p>
          </section>

          {/* Q&A List */}
          <section className="space-y-4">
            {FAQ_ITEMS.map((item, idx) => (
              <div
                key={idx}
                className="glass-card rounded-2xl border p-6 space-y-2.5 transition-all hover:border-[var(--gold)]/40"
                style={{ borderColor: "var(--line)" }}
              >
                <h2 className="font-heading text-base sm:text-lg font-semibold text-foreground flex items-start gap-2.5">
                  <span className="text-[var(--gold)] font-mono text-sm">Q{idx + 1}.</span>
                  <span>{item.q}</span>
                </h2>
                <p className="text-xs sm:text-sm leading-relaxed text-muted-foreground pl-6 sm:pl-7">
                  {item.a}
                </p>
              </div>
            ))}
          </section>

          {/* Interactive CTA */}
          <section className="glass-card rounded-2xl border p-8 text-center space-y-4" style={{ borderColor: "var(--gold-line)", background: "var(--surface)" }}>
            <h3 className="font-heading text-xl font-semibold text-foreground">
              Ready to Explore Real-Time Market Intelligence?
            </h3>
            <p className="text-xs sm:text-sm text-muted-foreground max-w-md mx-auto">
              Search any global equity, Indian benchmark, or option contract in the live terminal.
            </p>
            <div className="pt-2 flex justify-center gap-3">
              <Link
                href="/markets"
                className="btn btn--primary rounded-xl px-6 py-2.5 text-sm font-semibold flex items-center gap-2"
              >
                Open Markets Terminal <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </section>

          {/* Internal Links Cluster */}
          <section className="rounded-2xl border border-[var(--line)] bg-[var(--surface-alt)] p-6 space-y-4">
            <h3 className="font-heading text-sm font-semibold uppercase tracking-wider text-muted-foreground">
              Explore Pillar Guides
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
                  NSE &amp; BSE index research and stock intelligence.
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
              &copy; {new Date().getFullYear()} Lumora AI. All rights reserved.
            </p>
          </footer>
        </main>
      </div>
    </>
  )
}
