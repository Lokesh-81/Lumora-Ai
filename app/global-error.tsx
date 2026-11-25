"use client"

import Link from "next/link"

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <html lang="en" className="dark">
      <body className="min-h-screen bg-[#08090c] p-6 text-white antialiased">
        <main className="mx-auto flex min-h-screen max-w-md flex-col items-center justify-center text-center">
          <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.04] text-2xl font-semibold text-[#d6b879]">L</div>
          <p className="mb-3 font-mono text-[11px] uppercase tracking-[0.24em] text-[#d6b879]">Lumora system notice</p>
          <h1 className="mb-4 font-serif text-3xl font-semibold">We hit an unexpected issue.</h1>
          <p className="mb-7 text-sm leading-6 text-slate-400">Your request could not be completed. Your account data has not been exposed on this screen. Please try again, or return to the Lumora home page.</p>
          {error.digest ? <p className="mb-6 rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2 font-mono text-[11px] text-slate-500">Reference: {error.digest}</p> : null}
          <div className="flex flex-wrap justify-center gap-3">
            <button onClick={() => reset()} className="rounded-xl bg-[#d6b879] px-5 py-2.5 text-sm font-semibold text-[#17130c] transition-opacity hover:opacity-90">Try again</button>
            <Link href="/" className="rounded-xl border border-white/15 px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-white/[0.06]">Back to home</Link>
          </div>
          <p className="mt-10 text-xs text-slate-600">If this keeps happening, contact support@lumoraai.in.</p>
        </main>
      </body>
    </html>
  )
}
