import Link from "next/link"
import { ArrowLeft, Cookie, ShieldCheck, SlidersHorizontal, Clock, Mail } from "lucide-react"
import { LumoraMark } from "@/components/lumora-mark"

export const metadata = {
  title: "Cookie Policy — Lumora AI",
  description: "How Lumora AI uses essential cookies and browser storage to operate the service and remember preferences.",
}

const lastUpdated = "November 25, 2026"

export default function CookiePolicyPage() {
  return (
    <>
      <header className="relative z-30 mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-6">
        <Link href="/" className="flex items-center gap-2.5 text-foreground">
          <LumoraMark className="h-7 w-7" />
          <span className="font-heading font-semibold tracking-tight">Lumora</span>
        </Link>
        <Link href="/" className="glass-card flex items-center gap-1.5 rounded-full px-4 py-2 text-sm text-muted-foreground transition-colors hover:text-foreground">
          <ArrowLeft className="h-3.5 w-3.5" /> Back to Lumora
        </Link>
      </header>
      <main className="relative z-10 mx-auto max-w-4xl px-6 pb-32 pt-8">
        <article className="relative overflow-hidden rounded-3xl border border-[var(--line-strong)] bg-[var(--surface)] p-6 shadow-xl sm:p-10 lg:p-12">
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-gold/[0.04] via-transparent to-gold/[0.02]" />
          <div className="relative">
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-[var(--line)] bg-[var(--surface-alt)] px-3 py-1.5 text-xs text-muted-foreground"><Cookie className="h-3.5 w-3.5 text-gold" /> Privacy &amp; browser storage</div>
            <h1 className="font-heading text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">Cookie Policy</h1>
            <p className="mt-2 text-sm text-muted-foreground">Last updated: {lastUpdated}</p>
            <p className="mt-6 text-sm leading-relaxed text-foreground/75">This policy explains how Lumora AI uses cookies and similar browser storage when you visit the website or sign in. It should be read together with our <Link href="/privacy" className="font-medium text-gold underline underline-offset-4">Privacy Policy</Link>.</p>
            <div className="mt-10 space-y-9 text-sm leading-relaxed text-foreground/80">
              <section>
                <div className="mb-3 flex items-center gap-2"><ShieldCheck className="h-4 w-4 text-gold" /><h2 className="font-heading text-base font-semibold text-foreground">1. What cookies are</h2></div>
                <p>Cookies are small text values stored by your browser. Similar technologies, such as local storage, can remember settings on your device. Lumora uses these technologies to keep core features reliable and remember your interface preferences.</p>
              </section>
              <section>
                <div className="mb-3 flex items-center gap-2"><Cookie className="h-4 w-4 text-gold" /><h2 className="font-heading text-base font-semibold text-foreground">2. Cookies used by Lumora</h2></div>
                <div className="overflow-x-auto rounded-xl border border-[var(--line)]">
                  <table className="w-full min-w-[34rem] text-left text-xs sm:text-sm">
                    <thead className="bg-[var(--surface-alt)] text-foreground"><tr><th className="px-4 py-3 font-semibold">Cookie / storage</th><th className="px-4 py-3 font-semibold">Purpose</th><th className="px-4 py-3 font-semibold">Category</th></tr></thead>
                    <tbody className="divide-y divide-[var(--line)] text-muted-foreground">
                      <tr><td className="px-4 py-3 font-mono text-foreground">Better Auth session cookies</td><td className="px-4 py-3">Keep you signed in and protect authenticated requests.</td><td className="px-4 py-3">Strictly necessary</td></tr>
                      <tr><td className="px-4 py-3 font-mono text-foreground">lumora-theme</td><td className="px-4 py-3">Remember your light or dark theme selection; the app also mirrors this preference in local storage.</td><td className="px-4 py-3">Preference</td></tr>
                      <tr><td className="px-4 py-3 font-mono text-foreground">lumora-cookie-notice</td><td className="px-4 py-3">Remember that this cookie notice has been acknowledged so it is not shown on every visit.</td><td className="px-4 py-3">Preference</td></tr>
                    </tbody>
                  </table>
                </div>
                <p className="mt-3 text-xs text-muted-foreground">Authentication cookie names and lifetimes are managed by Better Auth and may vary by environment or configuration. The cookie notice acknowledgement is stored for up to 180 days.</p>
              </section>
              <section>
                <div className="mb-3 flex items-center gap-2"><SlidersHorizontal className="h-4 w-4 text-gold" /><h2 className="font-heading text-base font-semibold text-foreground">3. Analytics and advertising</h2></div>
                <p>At the date above, Lumora does not intentionally set advertising cookies or analytics-tracking cookies. We do not sell personal information or use advertising cookies to build advertising profiles. If optional analytics or advertising technologies are introduced, this policy and the consent experience will be updated before they are enabled.</p>
              </section>
              <section>
                <div className="mb-3 flex items-center gap-2"><Clock className="h-4 w-4 text-gold" /><h2 className="font-heading text-base font-semibold text-foreground">4. Managing cookies</h2></div>
                <p>You can block or delete cookies through your browser settings. Blocking strictly necessary authentication cookies may prevent sign-in and account features from working. Clearing the theme cookie or local storage may reset your display preference. Browser controls differ, so consult your browser's help pages for instructions.</p>
              </section>
              <section>
                <div className="mb-3 flex items-center gap-2"><Mail className="h-4 w-4 text-gold" /><h2 className="font-heading text-base font-semibold text-foreground">5. Contact</h2></div>
                <p>For questions about this policy or a privacy request, contact <a href="mailto:support@lumoraai.in" className="font-medium text-foreground underline underline-offset-4">support@lumoraai.in</a>.</p>
              </section>
            </div>
            <div className="mt-10 flex flex-wrap items-center gap-4 border-t border-[var(--line)] pt-6 text-sm">
              <Link href="/privacy" className="text-muted-foreground underline underline-offset-4 hover:text-foreground">Privacy Policy</Link>
              <Link href="/terms" className="text-muted-foreground underline underline-offset-4 hover:text-foreground">Terms &amp; Conditions</Link>
              <Link href="/" className="text-muted-foreground underline underline-offset-4 hover:text-foreground">Return home</Link>
            </div>
          </div>
        </article>
      </main>
    </>
  )
}
