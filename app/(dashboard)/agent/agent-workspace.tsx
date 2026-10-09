"use client"

import { useState } from "react"
import ReactMarkdown from "react-markdown"
import { Activity, ArrowUpRight, Bot, ChartNoAxesCombined, LoaderCircle, Plus, ShieldCheck, Sparkles } from "lucide-react"

type Message = { role: "user" | "assistant"; content: string; sources?: string[] }
const STARTERS = [
  { title: "Analyse a market", prompt: "Analyse RELIANCE.NS and explain the current trend, key indicators, risks, and what data supports your view.", icon: ChartNoAxesCombined },
  { title: "Explain a market move", prompt: "Help me understand the key factors that could explain a recent market move. Tell me what data you need if no instrument is specified.", icon: Activity },
  { title: "Research Lumora", prompt: "Explain how Lumora AI should present evidence, uncertainty, and market-data freshness in a useful research workflow.", icon: Sparkles },
]

export function AgentWorkspace() {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState("")
  const [symbol, setSymbol] = useState("")
  const [conversationId, setConversationId] = useState<number | undefined>()
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState("")

  async function sendMessage(value = input) {
    const message = value.trim()
    if (!message || busy) return
    setInput("")
    setError("")
    setMessages((current) => [...current, { role: "user", content: message }])
    setBusy(true)
    try {
      const response = await fetch("/api/agent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message, symbol: symbol.trim() || undefined, conversationId }),
      })
      const data = await response.json()
      if (!response.ok) throw new Error(data.error || "Agent request failed.")
      setConversationId(data.conversationId)
      setMessages((current) => [...current, { role: "assistant", content: data.answer, sources: data.sources }])
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.")
      setMessages((current) => current.filter((item, index) => !(index === current.length - 1 && item.role === "user" && item.content === message)))
    } finally {
      setBusy(false)
    }
  }

  function newSession() {
    setMessages([])
    setConversationId(undefined)
    setError("")
    setInput("")
  }

  return (
    <div className="mx-auto flex min-h-[calc(100vh-8rem)] max-w-6xl flex-col gap-6">
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-[var(--line)] bg-[var(--panel-2)] px-3 py-1.5 text-xs text-[var(--text-secondary)]">
            <span className="h-1.5 w-1.5 rounded-full bg-[var(--gold)]" />
            LUMORA INTELLIGENCE · PRIVATE WORKSPACE
          </div>
          <h1 className="text-3xl font-semibold tracking-tight text-[var(--text-primary)] sm:text-4xl">Your market research desk.</h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-[var(--text-secondary)]">
            A dedicated Lumora agent for market context, technical research, and product intelligence — grounded in the data Lumora can verify.
          </p>
        </div>
        <button onClick={newSession} className="inline-flex items-center gap-2 rounded-xl border border-[var(--line)] px-3 py-2 text-sm text-[var(--text-secondary)] transition hover:bg-[var(--panel-2)]">
          <Plus className="h-4 w-4" /> New session
        </button>
      </header>

      <div className="grid gap-3 sm:grid-cols-3">
        <div className="rounded-2xl border border-[var(--line)] bg-[var(--panel)] p-4">
          <Bot className="mb-3 h-5 w-5 text-[var(--gold)]" />
          <p className="text-sm font-medium text-[var(--text-primary)]">Purpose-built</p>
          <p className="mt-1 text-xs leading-5 text-[var(--text-secondary)]">Focused on Lumora and market research, not general-purpose tasks.</p>
        </div>
        <div className="rounded-2xl border border-[var(--line)] bg-[var(--panel)] p-4">
          <Activity className="mb-3 h-5 w-5 text-[var(--gold)]" />
          <p className="text-sm font-medium text-[var(--text-primary)]">Evidence first</p>
          <p className="mt-1 text-xs leading-5 text-[var(--text-secondary)]">Uses available Lumora market context and clearly identifies missing evidence.</p>
        </div>
        <div className="rounded-2xl border border-[var(--line)] bg-[var(--panel)] p-4">
          <ShieldCheck className="mb-3 h-5 w-5 text-[var(--gold)]" />
          <p className="text-sm font-medium text-[var(--text-primary)]">Read-only beta</p>
          <p className="mt-1 text-xs leading-5 text-[var(--text-secondary)]">No trades or external changes. Approval-gated actions will be a separate phase.</p>
        </div>
      </div>

      <section className="flex min-h-[460px] flex-1 flex-col overflow-hidden rounded-3xl border border-[var(--line)] bg-[var(--panel)]">
        {messages.length === 0 ? (
          <div className="flex flex-1 flex-col justify-center p-6 sm:p-10">
            <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-2xl border border-[var(--line)] bg-[var(--panel-2)]">
              <Sparkles className="h-5 w-5 text-[var(--gold)]" />
            </div>
            <h2 className="text-xl font-semibold text-[var(--text-primary)]">What should we investigate?</h2>
            <p className="mt-2 max-w-xl text-sm leading-6 text-[var(--text-secondary)]">Ask about an instrument, a market event, or Lumora's research experience. You can optionally pin a symbol to the context.</p>
            <div className="mt-6 grid gap-3 md:grid-cols-3">
              {STARTERS.map((item) => (
                <button key={item.title} onClick={() => sendMessage(item.prompt)} className="rounded-2xl border border-[var(--line)] p-4 text-left transition hover:border-[var(--gold)]/50 hover:bg-[var(--panel-2)]">
                  <item.icon className="mb-4 h-5 w-5 text-[var(--gold)]" />
                  <span className="block text-sm font-medium text-[var(--text-primary)]">{item.title}</span>
                  <span className="mt-1 block text-xs leading-5 text-[var(--text-secondary)]">{item.prompt}</span>
                  <ArrowUpRight className="mt-4 h-4 w-4 text-[var(--text-tertiary)]" />
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="flex-1 space-y-6 p-5 sm:p-8">
            {messages.map((message, index) => (
              <article key={index} className={message.role === "user" ? "ml-auto max-w-3xl rounded-2xl bg-[var(--panel-2)] p-4" : "max-w-4xl p-1"}>
                <div className="mb-2 flex items-center gap-2 text-xs font-medium uppercase tracking-wider text-[var(--text-tertiary)]">
                  {message.role === "assistant" ? <Bot className="h-4 w-4 text-[var(--gold)]" /> : null}
                  {message.role === "assistant" ? "Lumora Intelligence" : "You"}
                </div>
                {message.role === "assistant" ? (
                  <div className="md-prose text-sm leading-7 text-[var(--text-primary)]"><ReactMarkdown>{message.content}</ReactMarkdown></div>
                ) : <p className="whitespace-pre-wrap text-sm leading-6 text-[var(--text-primary)]">{message.content}</p>}
                {message.sources?.length ? <p className="mt-3 text-xs text-[var(--text-tertiary)]">Context: {message.sources.join(" · ")}</p> : null}
              </article>
            ))}
            {busy ? <div className="flex items-center gap-2 text-sm text-[var(--text-secondary)]"><LoaderCircle className="h-4 w-4 animate-spin" /> Researching with Lumora context…</div> : null}
          </div>
        )}
        {error ? <div role="alert" className="mx-5 mb-3 rounded-xl border border-red-500/30 bg-red-500/5 px-4 py-3 text-sm text-red-500">{error}</div> : null}
        <form onSubmit={(event) => { event.preventDefault(); void sendMessage() }} className="border-t border-[var(--line)] p-4 sm:p-5">
          <div className="mb-3 flex flex-wrap items-center gap-2">
            <label htmlFor="agent-symbol" className="text-xs text-[var(--text-secondary)]">Context symbol</label>
            <input id="agent-symbol" value={symbol} onChange={(event) => setSymbol(event.target.value)} placeholder="e.g. RELIANCE.NS" maxLength={100} className="w-44 rounded-lg border border-[var(--line)] bg-transparent px-3 py-1.5 text-xs text-[var(--text-primary)] outline-none focus:border-[var(--gold)]" />
            <span className="text-xs text-[var(--text-tertiary)]">Optional · adds market data when available</span>
          </div>
          <div className="flex items-end gap-3">
            <textarea value={input} onChange={(event) => setInput(event.target.value)} onKeyDown={(event) => { if (event.key === "Enter" && !event.shiftKey) { event.preventDefault(); void sendMessage() } }} placeholder="Ask Lumora Intelligence…" rows={2} maxLength={4000} disabled={busy} className="min-h-12 flex-1 resize-y rounded-xl border border-[var(--line)] bg-transparent px-4 py-3 text-sm text-[var(--text-primary)] outline-none placeholder:text-[var(--text-tertiary)] focus:border-[var(--gold)] disabled:opacity-60" />
            <button type="submit" disabled={busy || !input.trim()} className="inline-flex h-12 items-center gap-2 rounded-xl bg-[var(--gold)] px-4 text-sm font-semibold text-black transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40">
              {busy ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <ArrowUpRight className="h-4 w-4" />} <span className="hidden sm:inline">Ask agent</span>
            </button>
          </div>
          <p className="mt-3 text-[11px] leading-5 text-[var(--text-tertiary)]">Research only. The beta does not place trades or execute account changes. Market data availability and delay depend on the underlying provider.</p>
        </form>
      </section>
    </div>
  )
}
