import type { Metadata } from "next"
import Link from "next/link"
import { ArrowRight, Building2, Globe, Landmark, PieChart, ShieldCheck, Zap } from "lucide-react"
import { LumoraMark } from "@/components/lumora-mark"

export const metadata: Metadata = {
  title: "Indian Stock Market AI & NIFTY Analysis | Lumora AI",
  description:
    "Analyze Indian equities, NSE benchmark indices (NIFTY 50, BANKNIFTY), BSE SENSEX, and top bluechip stocks with AI-powered technical models and strike discovery.",
  alternates: {
    canonical: "https://www.lumoraai.in/indian-stock-market-ai",
  },
  openGraph: {
    title: "Indian Stock Market AI & NIFTY Analysis | Lumora AI",
    description:
      "Institutional-grade AI stock analysis for Indian markets: NIFTY 50, BANKNIFTY, SENSEX, and NSE/BSE equities.",
    url: "https://www.lumoraai.in/indian-stock-market-ai",
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
      name: "Can AI analyze Indian stocks listed on NSE and BSE?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Yes. Lumora AI natively supports all major Indian equities listed on the National Stock Exchange (NSE) and Bombay Stock Exchange (BSE), including bluechips like Reliance Industries, TCS, HDFC Bank, ICICI Bank, and Infosys.",
      },
    },
    {
      "@type": "Question",
      name: "How does Lumora AI analyze NIFTY 50 and BANKNIFTY?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Lumora AI evaluates live spot feeds from NSE (^NSEI, ^NSEBANK), computing multi-timeframe moving averages, RSI momentum, Bollinger Band boundaries, and dynamically mapped option strike ladders with exact 50-point and 100-point strike steps.",
      },
    },
    {
      "@type": "Question",
      name: "What are the expiry days for Indian index options?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "NSE index and equity options (NIFTY, BANKNIFTY, FINNIFTY) expire on the last Thursday of the contract month. BSE index options (SENSEX, BANKEX) expire on the last Friday of the contract month.",
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
  ],
}

export default function IndianStockMarketAIPage() {
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
              <Landmark className="h-3.5 w-3.5 text-[var(--gold)]" />
              <span>NSE &amp; BSE Market Intelligence</span>
            </div>

            <h1 className="font-heading text-3xl sm:text-4xl lg:text-5xl font-semibold tracking-tight text-foreground leading-[1.15]">
              Indian Stock Market AI: NIFTY 50, SENSEX &amp; Equity Intelligence
            </h1>

            <p className="text-base sm:text-lg leading-relaxed text-muted-foreground max-w-3xl">
              Advanced computational analysis designed specifically for Indian capital markets. Synthesize live spot pricing, technical momentum, and derivative strike discovery for the National Stock Exchange of India (NSE) and Bombay Stock Exchange (BSE).
            </p>

            <div className="flex flex-wrap items-center gap-3 pt-2">
              <Link
                href="/markets?symbol=%5ENSEI"
                className="btn btn--primary rounded-xl px-5 py-2.5 text-sm font-semibold flex items-center gap-2"
              >
                Analyze NIFTY 50 <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/markets?symbol=%5ENSEBANK"
                className="btn rounded-xl border border-[var(--line)] bg-[var(--surface)] hover:bg-[var(--surface-alt)] px-5 py-2.5 text-sm font-semibold text-foreground flex items-center gap-2"
              >
                Analyze BANK NIFTY <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/markets?symbol=%5EBSESN"
                className="btn rounded-xl border border-[var(--line)] bg-[var(--surface)] hover:bg-[var(--surface-alt)] px-5 py-2.5 text-sm font-semibold text-foreground flex items-center gap-2"
              >
                Analyze BSE SENSEX <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </section>

          {/* Benchmark Coverage Grid */}
          <section className="space-y-6">
            <h2 className="font-heading text-2xl font-semibold text-foreground">
              Comprehensive Indian Index Coverage
            </h2>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <Link
                href="/nifty-50-ai-analysis"
                className="glass-card rounded-xl border p-5 space-y-2 hover:border-[var(--gold)] transition-colors group block"
                style={{ borderColor: "var(--line)" }}
              >
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-foreground group-hover:text-[var(--gold)] transition-colors">NIFTY 50 AI Analysis &rarr;</h3>
                  <span className="text-[10px] font-mono font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded">NSE Benchmark</span>
                </div>
                <p className="text-xs text-muted-foreground">
                  India&apos;s premier benchmark representing the 50 largest bluechip companies across 13 economic sectors. Explore support/resistance and the 50-point strike ladder.
                </p>
              </Link>

              <div className="glass-card rounded-xl border p-5 space-y-2" style={{ borderColor: "var(--line)" }}>
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-foreground">NIFTY BANK</h3>
                  <span className="text-[10px] font-mono font-bold text-blue-600 dark:text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded">Banking Sector</span>
                </div>
                <p className="text-xs text-muted-foreground">
                  The most liquid banking index comprised of top 12 public and private banking institutions in India. 100-point strike step interval.
                </p>
              </div>

              <div className="glass-card rounded-xl border p-5 space-y-2" style={{ borderColor: "var(--line)" }}>
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-foreground">BSE SENSEX</h3>
                  <span className="text-[10px] font-mono font-bold text-amber-600 dark:text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded">BSE 30</span>
                </div>
                <p className="text-xs text-muted-foreground">
                  The flagship index of the Bombay Stock Exchange, measuring the financial performance of 30 well-established companies. 100-point strike step interval.
                </p>
              </div>

              <div className="glass-card rounded-xl border p-5 space-y-2" style={{ borderColor: "var(--line)" }}>
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-foreground">FINNIFTY</h3>
                  <span className="text-[10px] font-mono font-bold text-muted-foreground bg-[var(--surface-alt)] px-2 py-0.5 rounded">Financials</span>
                </div>
                <p className="text-xs text-muted-foreground">
                  NIFTY Financial Services index encompassing banks, insurance companies, housing finance, and NBFCs. 50-point strike step.
                </p>
              </div>

              <div className="glass-card rounded-xl border p-5 space-y-2" style={{ borderColor: "var(--line)" }}>
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-foreground">MIDCPNIFTY</h3>
                  <span className="text-[10px] font-mono font-bold text-muted-foreground bg-[var(--surface-alt)] px-2 py-0.5 rounded">Midcap Growth</span>
                </div>
                <p className="text-xs text-muted-foreground">
                  NIFTY Midcap Select index focusing on high-growth mid-sized Indian enterprises. 25-point strike step interval.
                </p>
              </div>

              <div className="glass-card rounded-xl border p-5 space-y-2" style={{ borderColor: "var(--line)" }}>
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-foreground">Sectoral Indices</h3>
                  <span className="text-[10px] font-mono font-bold text-muted-foreground bg-[var(--surface-alt)] px-2 py-0.5 rounded">NSE Thematics</span>
                </div>
                <p className="text-xs text-muted-foreground">
                  Full coverage for NIFTY IT, NIFTY AUTO, NIFTY FMCG, NIFTY PHARMA, NIFTY METAL, and NIFTY PSU BANK.
                </p>
              </div>
            </div>
          </section>

          {/* Indian Equity Universe */}
          <section className="space-y-6">
            <h2 className="font-heading text-2xl font-semibold text-foreground">
              Top Indian Equities Supported
            </h2>
            <p className="text-sm text-muted-foreground">
              Seamlessly search and analyze top NSE and BSE constituents:
            </p>
            <div className="flex flex-wrap gap-2">
              {[
                { name: "Reliance Industries", code: "RELIANCE.NS" },
                { name: "Tata Consultancy Services", code: "TCS.NS" },
                { name: "HDFC Bank", code: "HDFCBANK.NS" },
                { name: "ICICI Bank", code: "ICICIBANK.NS" },
                { name: "Infosys Ltd", code: "INFY.NS" },
                { name: "State Bank of India", code: "SBIN.NS" },
                { name: "Bharti Airtel", code: "BHARTIARTL.NS" },
                { name: "Larsen & Toubro", code: "LT.NS" },
                { name: "ITC Ltd", code: "ITC.NS" },
                { name: "Tata Motors", code: "TATAMOTORS.NS" },
                { name: "Maruti Suzuki", code: "MARUTI.NS" },
                { name: "Sun Pharma", code: "SUNPHARMA.NS" },
                { name: "Titan Company", code: "TITAN.NS" },
                { name: "Bajaj Finance", code: "BAJFINANCE.NS" },
              ].map((stock) => (
                <Link
                  key={stock.code}
                  href={`/markets?symbol=${encodeURIComponent(stock.code)}`}
                  className="rounded-lg border border-[var(--line)] bg-[var(--surface)] px-3 py-1.5 text-xs font-medium text-foreground hover:border-[var(--gold)] hover:text-[var(--gold)] transition-colors"
                >
                  {stock.name} ({stock.code.replace(".NS", "")})
                </Link>
              ))}
            </div>
          </section>

          {/* High Intent FAQ Section */}
          <section className="space-y-6">
            <h2 className="font-heading text-2xl font-semibold text-foreground">
              Indian Market AI Questions Answered
            </h2>

            <div className="space-y-4">
              <div className="glass-card rounded-xl border p-5 space-y-2" style={{ borderColor: "var(--line)" }}>
                <h3 className="text-base font-semibold text-foreground">
                  How does Lumora AI resolve natural language queries like &quot;BANKNIFTY 55000 CE&quot;?
                </h3>
                <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                  Lumora AI uses an Indian derivative dictionary that maps &quot;BANKNIFTY&quot; to `^NSEBANK` (NFO segment), &quot;55000&quot; as the target strike, &quot;CE&quot; as Call option, and assigns the active monthly expiry, displaying the full contract chain around the live spot price.
                </p>
              </div>

              <div className="glass-card rounded-xl border p-5 space-y-2" style={{ borderColor: "var(--line)" }}>
                <h3 className="text-base font-semibold text-foreground">
                  Are market hours calibrated to Indian Standard Time (IST)?
                </h3>
                <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                  Yes. The platform recognizes NSE and BSE normal trading hours (09:15 to 15:30 IST) as well as the standard derivative expiry calendars.
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
              <strong>Indian Capital Markets Notice:</strong> Equity and derivative investments in Indian stock markets are subject to market risks. Read all scheme and contract-related documents carefully before investing. Lumora AI is strictly an educational research platform.
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
