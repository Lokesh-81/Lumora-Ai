import Link from "next/link"
import { ArrowLeft, Compass, Search } from "lucide-react"
import { LumoraMark } from "@/components/lumora-mark"

export default function GlobalNotFound() {
  return (
    <main className="scene relative flex min-h-[70vh] items-center justify-center overflow-hidden px-6 py-24">
      <div className="pointer-events-none absolute left-1/2 top-1/2 h-[28rem] w-[28rem] -translate-x-1/2 -translate-y-1/2 rounded-full bg-gold/[0.06] blur-3xl" />
      <div className="relative z-10 mx-auto flex max-w-xl flex-col items-center text-center">
        <Link href="/" aria-label="Lumora home" className="mb-12 inline-flex items-center gap-2.5 text-foreground">
          <LumoraMark className="h-8 w-8" />
          <span className="font-heading text-sm font-semibold tracking-tight">Lumora AI</span>
        </Link>
        <div className="mb-7 flex h-20 w-20 items-center justify-center rounded-3xl border border-[var(--line-strong)] bg-[var(--surface)] shadow-xl">
          <Compass className="h-9 w-9 text-gold" strokeWidth={1.3} />
        </div>
        <p className="meta mb-3">ERROR 404 · OFF THE MAP</p>
        <h1 className="font-heading text-balance text-4xl font-semibold tracking-tight text-foreground sm:text-5xl">
          This page isn’t in our orbit.
        </h1>
        <p className="body mt-5 max-w-md text-center">
          The address may be incorrect, or the page may have moved. Let’s get you back to the market.
        </p>
        <div className="mt-9 flex flex-wrap items-center justify-center gap-3">
          <Link href="/" className="btn btn--gold inline-flex items-center gap-2">
            <ArrowLeft className="h-4 w-4" /> Back to home
          </Link>
          <Link href="/markets" className="btn inline-flex items-center gap-2">
            <Search className="h-4 w-4" /> Explore markets
          </Link>
        </div>
        <p className="mt-12 text-xs text-muted-foreground">LUMORA AI · MARKET INTELLIGENCE</p>
      </div>
    </main>
  )
}
