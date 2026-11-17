import Link from "next/link"
import { ArrowLeft, Shield, Database, Cookie, Users, Lock, Mail, Eye, Clock, Globe } from "lucide-react"
import { LumoraMark } from "@/components/lumora-mark"

export const metadata = {
  title: "Privacy Policy — Lumora AI",
  description: "Learn what information Lumora AI processes, why it is used, and how to contact us about your privacy.",
}

const lastUpdated = "November 17, 2026"

const SECTIONS = [
  { id: "scope", title: "1. Scope" },
  { id: "information", title: "2. Information We Process" },
  { id: "use", title: "3. How We Use Information" },
  { id: "ai", title: "4. AI and Market Data Processing" },
  { id: "providers", title: "5. Service Providers" },
  { id: "cookies", title: "6. Cookies and Local Storage" },
  { id: "sharing", title: "7. Disclosure and Sharing" },
  { id: "retention", title: "8. Retention and Deletion" },
  { id: "security", title: "9. Security" },
  { id: "rights", title: "10. Your Choices and Rights" },
  { id: "children", title: "11. Children" },
  { id: "changes", title: "12. Policy Changes" },
  { id: "contact", title: "13. Contact" },
]

export default function PrivacyPage() {
  return (
    <>
      <header className="relative z-30 mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-6">
        <Link href="/" className="flex items-center gap-2.5 text-foreground">
          <LumoraMark className="h-7 w-7" />
          <span className="font-heading font-semibold tracking-tight">Lumora</span>
        </Link>
        <Link href="/" className="glass-card flex items-center gap-1.5 rounded-full px-4 py-2 text-sm text-muted-foreground transition-colors hover:text-foreground">
          <ArrowLeft className="h-3.5 w-3.5" />
          Back to Lumora
        </Link>
      </header>

      <main className="relative z-10 mx-auto max-w-6xl px-6 pb-32 pt-8">
        <div className="lg:grid lg:grid-cols-[260px_1fr] lg:gap-14">
          <nav className="relative mb-10 lg:mb-0">
            <div className="lg:sticky lg:top-24">
              <p className="mb-4 text-[11px] font-semibold uppercase tracking-[0.15em] text-muted-foreground/50">On this page</p>
              <ul className="space-y-1.5">
                {SECTIONS.map((section) => (
                  <li key={section.id}>
                    <a href={`#${section.id}`} className="block rounded-lg px-3 py-1.5 text-sm text-muted-foreground transition-colors hover:bg-foreground/[0.05] hover:text-foreground">
                      {section.title}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </nav>

          <div className="min-w-0">
            <article className="relative overflow-hidden rounded-3xl border border-[var(--line-strong)] bg-[var(--surface)] p-6 shadow-xl sm:p-10 lg:p-12">
              <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-gold/[0.03] via-transparent to-gold/[0.02]" />
              <div className="relative">
                <p className="text-xs font-medium uppercase tracking-[0.3em] text-emerald">Privacy &amp; data</p>
                <h1 className="font-heading mt-3 text-balance text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">Privacy Policy</h1>
                <p className="mt-2 text-sm text-muted-foreground">Last updated: {lastUpdated}</p>
                <p className="mt-6 max-w-3xl text-sm leading-relaxed text-foreground/75">
                  This policy explains how Lumora AI ("Lumora", "we", "us") handles information when you visit or use our website, account features, market tools, and AI research features (the "Service"). Please read it before submitting information to the Service.
                </p>

                <div className="mt-12 space-y-10 text-sm leading-relaxed text-foreground/80">
                  <Section id="scope" title="1. Scope" icon={Shield}>
                    <p>Lumora is an informational market research and analysis service. This policy applies to information processed through the Lumora website and Service. It does not govern third-party websites or services that you access through external links; those providers publish their own privacy terms.</p>
                  </Section>

                  <Section id="information" title="2. Information We Process" icon={Database}>
                    <p className="mb-3">Depending on the features you use, Lumora may process the following categories:</p>
                    <ul className="list-disc space-y-2 pl-5">
                      <li><strong>Account information:</strong> email address, display name, profile details, password hash, verification state, and authentication/session records.</li>
                      <li><strong>Information you add:</strong> portfolio holdings, symbols, quantities, prices, watchlists, saved research, preferences, and other content you submit.</li>
                      <li><strong>AI interactions:</strong> prompts, chat messages, selected symbols, and the context needed to produce the analysis you request.</li>
                      <li><strong>Usage and security information:</strong> activity events, request timestamps, IP address information used for abuse prevention and rate limiting, and technical error information.</li>
                      <li><strong>Device and preference information:</strong> browser-provided request information and your selected interface theme.</li>
                    </ul>
                    <p className="mt-4">Please do not submit passwords for other services, payment-card details, government identifiers, broker login credentials, or other highly sensitive information in prompts or profile fields.</p>
                  </Section>

                  <Section id="use" title="3. How We Use Information" icon={Eye}>
                    <ul className="list-disc space-y-2 pl-5">
                      <li>Create and maintain your account, authenticate you, and provide account-related functions.</li>
                      <li>Display the portfolio, watchlist, saved research, and preferences that you choose to maintain.</li>
                      <li>Respond to market searches and generate requested AI-assisted research and explanations.</li>
                      <li>Send essential service emails such as verification codes and password-reset messages.</li>
                      <li>Protect the Service, enforce usage limits, investigate abuse, troubleshoot faults, and maintain reliability.</li>
                      <li>Meet legal obligations and respond to valid legal requests.</li>
                    </ul>
                    <p className="mt-4">We do not sell personal information. We do not use account information to build third-party advertising profiles.</p>
                  </Section>

                  <Section id="ai" title="4. AI and Market Data Processing" icon={Eye}>
                    <p>When you request an AI feature, the relevant prompt, selected instrument or symbol, and supporting market information may be sent to the AI model provider configured for that feature. Chat messages are processed to generate replies. Market-data requests may be sent to external market-data sources using the requested symbols.</p>
                    <p className="mt-3">AI-generated output can be inaccurate or incomplete. Do not treat it as financial, investment, tax, or legal advice. Avoid including personal or confidential information in AI prompts. The privacy and retention practices of the external AI or market-data provider may also apply to information it receives.</p>
                  </Section>

                  <Section id="providers" title="5. Service Providers" icon={Globe}>
                    <p className="mb-4">We use service providers to host, secure, and operate Lumora. Depending on the deployment configuration and the feature used, these may include:</p>
                    <div className="space-y-3">
                      <Provider name="Vercel" purpose="Website hosting, deployment, and delivery of the Service." />
                      <Provider name="Neon / PostgreSQL" purpose="Database infrastructure for account and application data." />
                      <Provider name="Better Auth" purpose="Authentication and session management within the application." />
                      <Provider name="Google Gemini and other configured AI providers" purpose="Processing prompts and relevant market context to generate requested AI output. The provider used can depend on the active server configuration." />
                      <Provider name="Yahoo Finance and configured market-data or broker data sources" purpose="Retrieving market quotes, charts, company information, news, and supported instrument data." />
                      <Provider name="Configured email delivery provider" purpose="Sending transactional account emails to the address associated with your account." />
                    </div>
                    <p className="mt-4">These providers process information under their own service terms and privacy policies. We do not publish API credentials in the browser; service credentials are intended to remain in server-side environment configuration.</p>
                  </Section>

                  <Section id="cookies" title="6. Cookies and Local Storage" icon={Cookie}>
                    <p>Lumora uses essential authentication/session cookies to keep account features working. The interface theme preference may be stored in your browser's local storage or a preference cookie. These are used for application functionality. You can manage or clear cookies and local storage through your browser, but doing so may sign you out or reset preferences.</p>
                    <p className="mt-3">This policy does not claim that Lumora operates third-party advertising cookies or analytics tracking. If that changes, this policy should be updated before those technologies are enabled.</p>
                  </Section>

                  <Section id="sharing" title="7. Disclosure and Sharing" icon={Users}>
                    <p>We share information only as reasonably needed to operate the Service with the providers described above, to protect Lumora and its users, to comply with applicable law, or as part of a business transfer where permitted by law. We do not sell your personal information. We do not make your private portfolio, saved research, or chat history public by default.</p>
                  </Section>

                  <Section id="retention" title="8. Retention and Deletion" icon={Clock}>
                    <p>We retain account and Service information for as long as reasonably necessary to provide the Service, maintain security, resolve disputes, and meet legal obligations. Retention periods can vary by data type and by the backup or retention practices of infrastructure providers.</p>
                    <p className="mt-3">To request access, correction, export, or deletion of information associated with your account, contact <a className="font-medium text-foreground underline underline-offset-4" href="mailto:support@lumoraai.in">support@lumoraai.in</a> from your account email. We may need to verify your request. Some information may need to be retained where required or permitted by law.</p>
                  </Section>

                  <Section id="security" title="9. Security" icon={Lock}>
                    <p>We use technical and organisational safeguards intended to protect information, including HTTPS, access controls, authentication protections, server-side handling of service credentials, security response headers, and request rate limiting. No internet transmission or storage system can be guaranteed completely secure. You are responsible for protecting your account credentials and notifying us if you suspect unauthorised access.</p>
                  </Section>

                  <Section id="rights" title="10. Your Choices and Rights" icon={Users}>
                    <p>Depending on your location and applicable law, you may have rights to request access to, correction of, or deletion of personal information, raise a grievance, or withdraw consent where processing is based on consent. You can also manage certain profile and preference information through available account settings. Contact us using the details below to submit a privacy request.</p>
                  </Section>

                  <Section id="children" title="11. Children" icon={Shield}>
                    <p>The Service is intended for people aged 18 or older and is not directed to children. If you believe a child has provided personal information to Lumora, contact us so we can review the request and take appropriate steps.</p>
                  </Section>

                  <Section id="changes" title="12. Policy Changes" icon={Clock}>
                    <p>We may update this policy when the Service, our processing practices, or applicable requirements change. We will update the date shown at the top of this page. Where required, we will provide additional notice through the Service or by email.</p>
                  </Section>

                  <Section id="contact" title="13. Contact" icon={Mail}>
                    <p>For privacy questions, data requests, or grievances relating to this policy, contact:</p>
                    <div className="mt-4 flex items-center gap-3 rounded-xl border border-[var(--line)] bg-[var(--surface-alt)] px-4 py-3">
                      <Mail className="h-4 w-4 text-muted-foreground" />
                      <a href="mailto:support@lumoraai.in" className="text-sm font-medium text-foreground hover:text-gold transition-colors">support@lumoraai.in</a>
                    </div>
                  </Section>
                </div>

                <div className="mt-12 flex items-center gap-4 border-t border-[var(--line)] pt-6">
                  <Link href="/terms" className="text-sm text-muted-foreground underline underline-offset-4 hover:text-foreground transition-colors">Terms &amp; Conditions</Link>
                  <span className="text-muted-foreground/30">·</span>
                  <Link href="/" className="text-sm text-muted-foreground underline underline-offset-4 hover:text-foreground transition-colors">Return home</Link>
                </div>
                <p className="mt-6 text-xs leading-relaxed text-muted-foreground/70">This page is a general description of Lumora's privacy practices and is not legal advice. The operator should obtain legal review to confirm that the policy matches the actual deployment, contracts, retention settings, and applicable law.</p>
              </div>
            </article>
          </div>
        </div>
      </main>
    </>
  )
}

function Section({ id, title, icon: Icon, children }: { id: string; title: string; icon: React.ElementType; children: React.ReactNode }) {
  return (
    <section id={id} className="scroll-mt-24 min-w-0 break-words">
      <div className="mb-4 flex items-center gap-2.5">
        <div className="shrink-0 rounded-lg bg-foreground/[0.05] p-1.5">
          <Icon className="h-4 w-4 text-muted-foreground" />
        </div>
        <h2 className="font-heading text-base font-semibold tracking-tight text-foreground">{title}</h2>
      </div>
      <div className="min-w-0 break-words">{children}</div>
    </section>
  )
}

function Provider({ name, purpose }: { name: string; purpose: string }) {
  return (
    <div className="rounded-xl border border-[var(--line)] bg-[var(--surface-alt)] px-4 py-3">
      <p className="text-xs font-medium text-foreground">{name}</p>
      <p className="mt-1 text-xs text-muted-foreground">{purpose}</p>
    </div>
  )
}
