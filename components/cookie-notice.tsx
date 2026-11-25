"use client"

import Link from "next/link"
import { useEffect, useState } from "react"
import { Cookie, X } from "lucide-react"

const CONSENT_COOKIE = "lumora-cookie-notice"
const MAX_AGE = 60 * 60 * 24 * 180

function hasAcknowledged() {
  return document.cookie.split(";").some((part) => part.trim().startsWith(`${CONSENT_COOKIE}=v1`))
}

function acknowledge() {
  const secure = window.location.protocol === "https:" ? "; Secure" : ""
  document.cookie = `${CONSENT_COOKIE}=v1; Path=/; Max-Age=${MAX_AGE}; SameSite=Lax${secure}`
}

export function CookieNotice() {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    try {
      setVisible(!hasAcknowledged())
    } catch {
      setVisible(false)
    }
  }, [])

  if (!visible) return null

  const dismiss = () => {
    try {
      acknowledge()
    } finally {
      setVisible(false)
    }
  }

  return (
    <aside
      role="dialog"
      aria-label="Cookie notice"
      aria-describedby="lumora-cookie-description"
      className="fixed inset-x-3 bottom-3 z-[10000] mx-auto max-w-3xl rounded-2xl border border-[var(--line-strong)] bg-[var(--bg-elevated)]/95 p-4 shadow-2xl backdrop-blur-xl sm:inset-x-6 sm:bottom-6 sm:p-5"
    >
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex min-w-0 gap-3">
          <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-[var(--line)] bg-[var(--surface-alt)]">
            <Cookie className="h-4 w-4 text-gold" />
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-foreground">A small note about cookies</p>
            <p id="lumora-cookie-description" className="mt-1 text-xs leading-relaxed text-muted-foreground">
              Lumora uses essential cookies for sign-in, security and your saved preferences. We do not currently use advertising or analytics cookies. Read our{" "}
              <Link href="/cookies" className="font-medium text-gold underline underline-offset-2 hover:opacity-80">Cookie Policy</Link>.
            </p>
          </div>
        </div>
        <div className="flex shrink-0 items-center justify-end gap-2 sm:pl-4">
          <button onClick={dismiss} className="btn btn--gold px-4 py-2 text-xs">Got it</button>
          <button onClick={dismiss} aria-label="Close cookie notice" className="rounded-lg p-2 text-muted-foreground transition-colors hover:bg-foreground/5 hover:text-foreground">
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>
    </aside>
  )
}
