<div align="center">

# Lumora AI

### Institutional-Grade Market Intelligence & Quantitative AI Analysis Platform

[![TypeScript](https://img.shields.io/badge/TypeScript-5.7-blue.svg?logo=typescript)](https://www.typescriptlang.org/)
[![Next.js](https://img.shields.io/badge/Next.js-15-black.svg?logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19-61DAFB.svg?logo=react)](https://react.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-4.0-38B2AC.svg?logo=tailwind-css)](https://tailwindcss.com/)
[![Drizzle ORM](https://img.shields.io/badge/Drizzle-ORM-C5F74F.svg?logo=drizzle)](https://orm.drizzle.team/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Database-336791.svg?logo=postgresql)](https://www.postgresql.org/)
[![Google Gemini](https://img.shields.io/badge/Google_Gemini-3.1_Flash_Lite-4285F4.svg?logo=google)](https://ai.google.dev/)

<p align="center">
  <strong>Grounded Quantitative Analytics • Multi-Model AI Reasoning • Automated Target Validation • Global & Indian Markets</strong>
</p>

---

</div>

## Table of Contents

- [1. Lumora AI — Executive Overview](#1-lumora-ai--executive-overview)
  - [Core Philosophy & Disclaimers](#core-philosophy--disclaimers)
  - [What Lumora Is (and Is Not)](#what-lumora-is-and-is-not)
- [2. What Lumora Can Do (Feature Matrix)](#2-what-lumora-can-do-feature-matrix)
  - [Fully Implemented](#fully-implemented)
  - [Partially Implemented](#partially-implemented)
  - [Experimental & Theoretical Capabilities](#experimental--theoretical-capabilities)
  - [Currently Unavailable / Out of Scope](#currently-unavailable--out-of-scope)
- [3. AI Architecture & Multi-Model Engine](#3-ai-architecture--multi-model-engine)
  - [Model Inventory & Provider Matrix](#model-inventory--provider-matrix)
  - [Provider Hierarchy, Circuit Breakers & Cooldowns](#provider-hierarchy-circuit-breakers--cooldowns)
  - [Anti-Hallucination & Strict Grounding Architecture](#anti-hallucination--strict-grounding-architecture)
  - [Output Validation, Regeneration & Deterministic Fallbacks](#output-validation-regeneration--deterministic-fallbacks)
- [4. How AI Analysis Works (End-to-End Pipeline)](#4-how-ai-analysis-works-end-to-end-pipeline)
  - [System Flow Diagram](#system-flow-diagram)
  - [Detailed Step-by-Step Processing](#detailed-step-by-step-processing)
- [5. Market Data Architecture & Provider Failover](#5-market-data-architecture--provider-failover)
  - [Yahoo Finance Dual Host & Cookie+Crumb Handshake](#yahoo-finance-dual-host--cookiecrumb-handshake)
  - [Symbol Normalization & Universal Aliasing](#symbol-normalization--universal-aliasing)
  - [Derivatives Architecture & Indian Broker Gateways](#derivatives-architecture--indian-broker-gateways)
  - [Black-Scholes Theoretical Pricing Fallback Engine](#black-scholes-theoretical-pricing-fallback-engine)
- [6. Technical Analysis Engine](#6-technical-analysis-engine)
  - [Mathematical Formulations](#mathematical-formulations)
  - [Market Regime, Trend & Momentum Classification](#market-regime-trend--momentum-classification)
  - [Algorithmic Risk Scoring & Confidence Calculation](#algorithmic-risk-scoring--confidence-calculation)
- [7. Complete Application & Directory Structure](#7-complete-application--directory-structure)
- [8. Database Architecture & Drizzle Schema](#8-database-architecture--drizzle-schema)
  - [Entity Relationship Overview](#entity-relationship-overview)
  - [Table Definitions](#table-definitions)
- [9. Authentication, Security & Email Engine](#9-authentication-security--email-engine)
  - [Better Auth Architecture](#better-auth-architecture)
  - [Email OTP & Dual-Provider Email Adapter](#email-otp--dual-provider-email-adapter)
  - [Rate Limiting & Defensive Measures](#rate-limiting--defensive-measures)
- [10. API Route Reference](#10-api-route-reference)
- [11. Environment Configuration Guide](#11-environment-configuration-guide)
- [12. Installation, Running & Deployment](#12-installation-running--deployment)
  - [Prerequisites](#prerequisites)
  - [Step-by-Step Setup](#step-by-step-setup)
  - [Database Migrations](#database-migrations)
  - [Automated Tests & Quality Assurance](#automated-tests--quality-assurance)
- [13. Regulatory Compliance & Disclaimer](#13-regulatory-compliance--disclaimer)

---

## 1. Lumora AI — Executive Overview

**Lumora AI** is a professional-grade financial intelligence and quantitative stock analysis platform engineered to deliver institutional research calibre to individual investors, swing traders, and market analysts. Built on a full-stack Next.js and TypeScript architecture, Lumora bridges the gap between raw market data feeds and complex multi-horizon market decisions. Rather than relying on speculative AI summaries or opaque black-box indicators, the platform operates as an evidence-grounded research desk: fetching live global exchange quotes, calculating a mathematical suite of technical indicators, building structured market contexts, and orchestrating Large Language Models (LLMs) to synthesize structured, defensible investment theses.

The core purpose of Lumora AI is to demystify market mechanics and eliminate emotional bias. It processes equities across major global markets (NYSE, NASDAQ, LSE, TSX) and Indian exchanges (NSE, BSE), indices, forex, commodities, crypto, and derivatives. For any selected instrument, Lumora performs deep quantitative evaluation: deriving multi-timeframe trend structures, support and resistance levels, volatility regimes, volume ratios, and fundamental valuation multiples. This real-world quantitative context is subsequently synthesized into actionable insights: buy/sell/wait biases, conviction scores, mathematically validated trade boundaries (entry, targets, stop-loss), risk/reward matrices, and scenario-based breakdowns.

Crucially, Lumora incorporates a conversational intelligence interface grounded in live market feeds. Users can converse with the engine to evaluate trading concepts, dissect macroeconomic news headlines, or test custom position sizing strategies in the Trade Planner. Every price reference, metric, and ratio presented in the UI or cited by the AI is tied back to authentic, verifiable market data.

### Core Philosophy & Disclaimers

1. **Evidence Before Opinion**: No LLM prompt is executed in a vacuum. The model is forbidden from answering until live quotes, computed technicals, and filtered financial news headlines are assembled into an immutable context payload.
2. **Deterministic Mathematics Over Machine Guesswork**: Trading levels (stop-loss, target 1, target 2) undergo rigorous mathematical direction validation. If generated levels fail mechanical rules, the system initiates self-healing or computes deterministic targets from support, resistance, and Average True Range (ATR).
3. **Transparent Data Provenance**: When premium exchange feeds (e.g., live Indian options order books) are unconfigured, Lumora explicitly marks data fields as unavailable and computes theoretical valuations via the Black-Scholes model, clearly labeling them as `[MODELLED]` rather than hallucinating live transactions.

### What Lumora Is (and Is Not)

- **Lumora IS**: An institutional-calibre market research terminal, quantitative indicator calculator, AI-assisted trade planner, portfolio risk tracker, and market intelligence assistant.
- **Lumora IS NOT**: An automated trading bot, an algorithmic execution broker, or an autonomous order-routing system. Lumora does not hold custody of funds, does not manage brokerage accounts directly, and does not execute buy or sell orders on exchange matching engines.
- **NO Guaranteed Returns**: Lumora never guarantees financial outcomes, profit probabilities, or price predictions. All analytical outputs are strictly for research, educational, and workflow acceleration purposes.

---

## 2. What Lumora Can Do (Feature Matrix)

This feature matrix reflects **only the functionality implemented in the Lumora codebase**.

### Fully Implemented

| Capability | Module / Implementation | Technical Details |
|---|---|---|
| **Universal Symbol Resolution** | `lib/market.ts`, `lib/instrument.ts` | Resolves 200+ global & Indian aliases (e.g. `RELIANCE` → `RELIANCE.NS`, `NIFTY` → `^NSEI`, `GOLD` → `GC=F`, `BTC` → `BTC-USD`). Parses complex option query formats (e.g., `NIFTY 24000 CE`, `NIFTY24072424000CE`). |
| **Real-Time Global Market Quotes** | `lib/market.ts` (`fetchQuoteV7`, `fetchChartMeta`) | Live and delayed quotes from Yahoo Finance v7/v8 APIs with automated cookie+crumb session handshake and round-robin host failover. |
| **Interactive Candlestick & Price Charts** | `components/price-chart.tsx`, `app/api/chart/route.ts` | Multi-interval OHLCV candle rendering (1d, 5d, 1m, 3m, 6m, 1y, 5y) with dynamic tooltips, volume bars, and market state detection (PRE, REGULAR, POST, CLOSED). |
| **Comprehensive Technical Indicators** | `lib/indicators.ts` | Pure mathematical computation from OHLCV series: SMA, EMA (20/50/200), RSI(14), Stochastic RSI, MACD (12, 26, 9), Bollinger Bands (20, 2σ), ATR(14), VWAP, ADX(14) with +DI/-DI, 60-day Support & Resistance swing extremes, and Fibonacci Retracement levels (0.0 to 1.0). |
| **Grounded Institutional AI Analysis** | `lib/ai/provider.ts` (`generateAnalysis`) | Server-side LLM analysis generating 35+ structured data points: recommendation, confidence score (30–95), entry, targets, stop-loss, probability of profit/loss, scenarios (best/likely/worst), position sizing, and beginner breakdowns. |
| **Streaming AI Analysis (SSE)** | `app/api/analyze/route.ts` | Server-Sent Events stream delivering lifecycle phases (`started` → `loading` with context metrics → `complete` with payload or `error`) for zero-perceived-latency UI rendering. |
| **Trade Direction Validation & Self-Healing** | `lib/ai/provider.ts` (`validateTradingTargets`, `computeDeterministicTargets`) | Enforces mathematical order rules ($Target_2 > Target_1 > Entry > StopLoss$ for BUY; inverse for SELL). Automatically prompts LLM for regeneration on violation; falls back to deterministic local math if AI fails twice. |
| **Algorithmic Risk & Conviction Engine** | `lib/ai/engine/risk.ts`, `lib/ai/engine/confidence.ts` | Computes deterministic risk scores (Low/Medium/High) and confidence factors based on ATR % of price, volume/average volume ratio, ADX trend strength, market cap, and data completeness. |
| **Grounded AI Market Chat** | `app/api/chat/route.ts`, `lib/ai/provider.ts` (`streamChat`) | Conversational interface with token-by-token streaming. Parses incoming user messages for company names and tickers, queries live market quotes, and injects live quotes directly into the model's system grounding context. |
| **Trade Planner** | `app/api/trade-planner/route.ts`, `app/(dashboard)/trade-planner/` | Calculates capital requirements, profit/loss projections, risk/reward ratios, and position sizing guidance. Generates structured AI critiques based on planned budget and holding horizons. |
| **Institutional Investment Research** | `app/api/research/route.ts`, `lib/ai/provider.ts` (`generateInvestmentResearch`) | Generates long-form equity research notes: investment thesis, fundamental catalysts, risk factors, short-term, swing, and long-term outlooks. |
| **Company News & Sentiment Engine** | `lib/news.ts`, `lib/ai/provider.ts` (`generateNewsSentiment`) | Fetches publisher news from Yahoo Finance, filters noise using ticker and company name heuristics, and classifies sentiment impact into positive/negative/neutral. |
| **Regional Market Desks & Explorer** | `app/api/market-summary/route.ts`, `components/market-explorer.tsx` | Instant regional snapshots across US, India, Europe, Asia, Crypto, and Commodities with AI-generated 3-sentence macro summaries cached in-memory. |
| **Portfolio Management** | `app/actions/portfolio.ts`, `app/(dashboard)/portfolio/` | User-scoped database tracking of asset holdings, share counts, average purchase costs, total portfolio valuation, and live unrealized profit/loss. |
| **Watchlist Tracking** | `app/actions/watchlist.ts`, `app/(dashboard)/watchlist/` | Persisted user watchlists with real-time quote refresh and one-click transition into the deep analysis desk. |
| **Saved Analysis Archive** | `app/actions/saved-analysis.ts`, `app/(dashboard)/saved-analysis/` | Archive AI-generated analysis notes to PostgreSQL (JSONB payload) for retrospective review and performance tracking. |
| **User Activity Audit Trail** | `app/actions/activity.ts`, `app/(dashboard)/activity/` | Tracks analytical actions, ticker searches, trade planning events, and chat sessions in an append-only PostgreSQL log. |
| **Authentication & User Profiles** | `lib/auth.ts`, `lib/auth-client.ts`, `app/(dashboard)/profile/` | Better Auth integration with email/password, 6-digit email OTP verification, session cookies, legal consent tracking, and profile customization (timezone, theme, bio). |
| **Dual Email Delivery Engine** | `lib/email/index.ts`, `lib/email/providers/` | Unified email adapter routing to Gmail/SMTP in production or a structured Console logger in development, complete with correlation IDs, latency tracking, and circular log history. |

### Partially Implemented

- **Option Chain Analysis (US vs. Indian Derivatives)**:
  - *US Equities & ETFs*: **Fully operational**. Queries real option chains from Yahoo Finance (`/v7/finance/options`), parsing real bids, asks, implied volatility, Greeks, Open Interest (OI), Volume, Put/Call Ratio (PCR), and Max Pain.
  - *Indian Derivatives (NSE/BSE)*: Real contract universe generation and spot price tracking are fully operational. However, tick-by-tick exchange options data (LTP, exchange OI, order book depth) requires active Indian broker credentials (`UPSTOX_ACCESS_TOKEN`, `ZERODHA_KITE_API_KEY`, `DHAN_ACCESS_TOKEN`, `ANGEL_ONE_API_KEY`, or `FYERS_ACCESS_TOKEN`). When unconfigured, Lumora seamlessly falls back to Free Market-Data Mode with the Black-Scholes theoretical model.
- **Social OAuth Authentication**:
  - The Better Auth configuration supports Google, Yahoo, and Apple OAuth (`GOOGLE_CLIENT_ID`, `YAHOO_CLIENT_ID`, `APPLE_CLIENT_ID`). These buttons conditionally activate in the UI only when credentials exist in the server environment.
- **Automated Scheduled Notifications**:
  - The cron endpoint `/api/cron/notifications/route.ts` contains complete business logic to generate stock digests and "What's New" platform notifications. Execution requires an external HTTP scheduler (e.g. Vercel Cron, Cloud Scheduler) configured with `CRON_SECRET`.

### Experimental & Theoretical Capabilities

- **Black-Scholes Theoretical Option Pricing Model** (`lib/derivatives/black-scholes.ts`):
  - Used strictly when broker API keys are absent. Computes theoretical fair value, Delta, Gamma, Theta decay, Vega, and break-even levels assuming a risk-free rate of 6.5% and historical volatility of 15%. All outputs are labeled `[MODELLED]` in prompts and UI to prevent confusion with real exchange trades.
- **Isolated Trade Plan Recommendation Demo** (`lib/ai/engine/demo-trade-recommendation.ts`):
  - An offline verification script and harness showcasing how technical indicators, risk scores, and AI reasoning unite into a single normalized `TradePlan` contract.

### Currently Unavailable / Out of Scope

- **Direct Order Routing & Broker Execution**: Lumora contains no API routines to execute live orders, place bracket orders, or debit funds with any broker.
- **High-Frequency WebSocket Ticks**: Market quotes are retrieved via low-latency HTTP REST polling with TTL caching; raw millisecond exchange multicast/WebSocket streams are not implemented.
- **Automated Algorithmic Trading Bots**: Lumora does not feature unattended automated trade management.

---

## 3. AI Architecture & Multi-Model Engine

Lumora AI implements a decoupled, server-side multi-provider AI gateway in `lib/ai/provider.ts`. The rest of the codebase imports generic operational methods (`generateAnalysis`, `streamChat`, `generateInvestmentResearch`, `generateNewsSentiment`, `generateMarketSummary`, `generateText`) without dependency on any single vendor SDK.

```
                      ┌─────────────────────────────────────────┐
                      │           Application Request           │
                      │  (Analysis, Chat, Research, Sentiment)  │
                      └────────────────────┬────────────────────┘
                                           │
                                           ▼
                      ┌─────────────────────────────────────────┐
                      │    lib/ai/provider.ts (AI Gateway)      │
                      │  - Diagnostic Logger & Key Evaluator    │
                      │  - Circuit Breaker / Model Cooldown     │
                      │  - Health-Sorted Candidate Pool Builder │
                      └────────────────────┬────────────────────┘
                                           │
                 ┌─────────────────────────┼─────────────────────────┐
                 │ (1. Primary Provider)   │ (2. Fallback Provider)  │ (3. Fallback Provider)
                 ▼                         ▼                         ▼
      ┌─────────────────────┐   ┌─────────────────────┐   ┌─────────────────────┐
      │    Google Gemini    │   │     OpenAI GPT      │   │   Anthropic Claude  │
      │  (@google/genai)    │   │  (Chat Completions) │   │     (Messages API)  │
      ├─────────────────────┤   ├─────────────────────┤   ├─────────────────────┤
      │ gemini-3.1-flash-lite│  │ gpt-4o-mini         │   │ claude-3-5-haiku    │
      │ gemini-3.7-flash    │   │ gpt-4o              │   │ claude-3-5-sonnet   │
      │ gemini-3.5-flash    │   │                     │   │                     │
      └─────────────────────┘   └─────────────────────┘   └─────────────────────┘
```

### Model Inventory & Provider Matrix

The table below catalogs every model, configuration location, endpoint, and function present in the code:

| AI Provider | Exact Model Name | Purpose in Code | Input Context | Output Format | Used Where |
|---|---|---|---|---|---|
| **Google Gemini** *(Primary)* | `gemini-3.1-flash-lite` | Default primary model for deep stock analysis, chat streaming, research, summaries, and trade planner. | Structured OHLCV metrics, technical indicators, fundamentals, news headlines, and user messages. | JSON schema matching `Analysis`, SSE text deltas, or raw text. | `lib/ai/provider.ts` (`PRODUCTION_GEMINI_MODEL`, `MODEL`, `MODEL_FAST`) |
| **Google Gemini** *(Fallback 1)* | `gemini-3.7-flash` | Secondary fallback model when primary experiences 503 high demand, rate limits (429), or timeouts. | Identical prompt context payload. | JSON schema or text stream. | `lib/ai/provider.ts` (`GEMINI_FALLBACK_CHAIN[1]`) |
| **Google Gemini** *(Fallback 2)* | `gemini-3.5-flash` | Tertiary Gemini fallback model for upstream capacity resilience. | Identical prompt context payload. | JSON schema or text stream. | `lib/ai/provider.ts` (`GEMINI_FALLBACK_CHAIN[2]`) |
| **OpenAI** *(Multi-Cloud Fallback)* | `gpt-4o-mini` | Cost-effective fallback when all Gemini endpoints are cooling down or exhausted. | Formatted chat messages with system instructions. | JSON or SSE chunks. | `lib/ai/provider.ts` (`openaiChat`, `openaiStreamChat`) |
| **OpenAI** *(High-Capacity Fallback)* | `gpt-4o` | Secondary OpenAI fallback for complex structural reasoning if mini fails. | Formatted chat messages with system instructions. | JSON or SSE chunks. | `lib/ai/provider.ts` (`getCandidateProviders`) |
| **Anthropic** *(Multi-Cloud Fallback)* | `claude-3-5-haiku-20241022` | Ultra-fast Claude fallback model invoked if Gemini and OpenAI are unavailable. | Formatted system and user messages. | JSON or SSE chunks (`content_block_delta`). | `lib/ai/provider.ts` (`anthropicChat`, `anthropicStreamChat`) |
| **Anthropic** *(Deep Reasoning Fallback)* | `claude-3-5-sonnet-20241022` | Premium Claude fallback model for institutional analysis resilience. | Formatted system and user messages. | JSON or SSE chunks. | `lib/ai/provider.ts` (`getCandidateProviders`) |

### Provider Hierarchy, Circuit Breakers & Cooldowns

1. **Candidate Pool Construction**:
   When an AI request is initiated, `getCandidateProviders()` inspects active environment variables. If `GEMINI_API_KEY` is present, Gemini models are placed at the top of the queue (`gemini-3.1-flash-lite` → `gemini-3.7-flash` → `gemini-3.5-flash`). If `OPENAI_API_KEY` is configured, `gpt-4o-mini` and `gpt-4o` are appended. If `ANTHROPIC_API_KEY` is configured, Claude models are added.
2. **Circuit Breaker & Cooldown Tracking**:
   The gateway maintains an in-memory `modelCooldowns = new Map<string, number>()`. When a model returns a retryable error (HTTP 503, high demand, server overloaded, 429 quota exhaustion, or timeout), it is quarantined for **90 seconds**. Healthy models are always evaluated before cooling models.
3. **Fail-Fast Key Invalidation**:
   If a provider returns an unauthenticated error (HTTP 401, `API_KEY_INVALID`, `authentication_error`), the loop identifies that the entire key is invalid and skips all remaining models for that vendor, preventing unnecessary latency.

### Anti-Hallucination & Strict Grounding Architecture

To eradicate LLM hallucinations, Lumora enforces four strict architectural barriers:

1. **System Instruction Boundaries (`GROUNDING`)**:
   Every prompt contains an immutable constraint block:
   ```text
   You must analyze ONLY the real data provided in the prompt (Yahoo Finance quotes,
   computed technical indicators, and real news headlines). NEVER invent, estimate,
   or hallucinate prices, financial figures, or news events. If a value is marked "n/a",
   state that the data is unavailable rather than guessing. Every conclusion must
   reference specific data points from the prompt.
   ```
2. **Banned Cliché Expressions**:
   The engine explicitly forbids generic model filler phrases such as *"Based on the technical setup"*, *"The RSI indicates"*, *"The data suggests"*, or *"The market is showing"*. The model is mandated to write with the objective tone of a senior quantitative desk strategist.
3. **Contract Identity Mandate (Options Mode)**:
   When evaluating derivatives, the system injects a lock on contract parameters:
   ```text
   CRITICAL CONTRACT MANDATE (DO NOT CHANGE OR DRIFT):
   Target Contract: [Underlying] [Strike] [Type] (Expiry: [Date])
   Under NO circumstances may you substitute, invent, or analyze any other strike.
   ```
4. **Chat Live Market Injection**:
   In `chatMarketContext()` (`lib/ai/provider.ts`), regex scanners parse incoming chat messages for company names (e.g. *Reliance*, *Apple*, *Tesla*, *HDFC*) and ticker formats. The server fetches quotes for these entities in real time and injects them under a mandatory `LIVE MARKET DATA` block before passing the conversation to the LLM. If data retrieval fails, the model is commanded to state that data is unavailable rather than guessing prices.

### Output Validation, Regeneration & Deterministic Fallbacks

Generating trading targets via an LLM presents risks of mathematical inversion (e.g., placing a BUY stop-loss above the entry price). Lumora addresses this with an automated multi-stage validation pipeline:

```
                  ┌─────────────────────────────────────────┐
                  │          AI Generates Response          │
                  └────────────────────┬────────────────────┘
                                       │
                                       ▼
                  ┌─────────────────────────────────────────┐
                  │       sanitizeAnalysis(response)        │
                  │ Removes placeholders ("N/A", "Pending") │
                  └────────────────────┬────────────────────┘
                                       │
                                       ▼
                  ┌─────────────────────────────────────────┐
                  │         validateTradingTargets()        │
                  │   Checks: Target 2 > Target 1 > Entry   │
                  │   Checks: Entry > Stop Loss (for BUY)   │
                  └────────────────────┬────────────────────┘
                                       │
                     ┌─────────────────┴─────────────────┐
                     │                                   │
              [Is Valid: YES]                     [Is Valid: NO]
                     │                                   │
                     │                                   ▼
                     │                 ┌───────────────────────────────────┐
                     │                 │     Stage 2: Automatic Retry      │
                     │                 │   Low-temp prompt explaining fix  │
                     │                 └─────────────────┬─────────────────┘
                     │                                   │
                     │                        ┌──────────┴──────────┐
                     │                        │                     │
                     │                 [Retry Valid: YES]    [Retry Valid: NO]
                     │                        │                     │
                     │                        │                     ▼
                     │                        │     ┌───────────────────────────────┐
                     │                        │     │  Stage 3: Local Deterministic │
                     │                        │     │    computeDeterministicTargets│
                     │                        │     │  Derives from S/R & ATR math  │
                     │                        │     └───────────────┬───────────────┘
                     │                        │                     │
                     ▼                        ▼                     ▼
             ═════════════════════════════════════════════════════════════════
                   Final Sanitized, Consistent & Validated Analysis Object
             ═════════════════════════════════════════════════════════════════
```

1. **Sanitization (`sanitizeAnalysis`)**: Cleanses raw JSON of invalid placeholder strings (`"N/A"`, `"Pending"`, `"None"`), substituting real price levels from support/resistance calculations.
2. **Direction Validation (`validateTradingTargets`)**:
   - For **BUY / CE / Accumulate**: Requires $Target_1 > Entry$, $Target_2 > Target_1$, and $StopLoss < Entry$.
   - For **SELL / PE**: Requires $Target_1 < Entry$, $Target_2 < Target_1$, and $StopLoss > Entry$.
3. **Automated AI Regeneration**:
   If targets violate directional rules, the system fires an immediate retry request at a lower temperature (`0.2`), injecting explicit correction instructions into the prompt.
4. **Deterministic Local Math Fallback (`computeDeterministicTargets`)**:
   If the second AI generation remains invalid, the engine takes control away from the LLM and calculates mathematically sound levels using verified technical pivots:
   - $Entry = BasePrice$
   - $Target_1 = Resistance > Entry \ ? \ Resistance : Entry \times 1.055$
   - $Target_2 = Target_1 \times 1.065$
   - $StopLoss = Support < Entry \ ? \ Support \times 0.99 : Entry \times 0.955$
   - $Risk:Reward = \frac{|Target_1 - Entry|}{|Entry - StopLoss|}$

---

## 4. How AI Analysis Works (End-to-End Pipeline)

### System Flow Diagram

```text
               User Requests Analysis in UI (/markets?symbol=AAPL)
                                       │
                                       ▼
                       Symbol Normalization & Aliasing
                         (resolveSymbol: AAPL → AAPL)
                                       │
                                       ▼
          ┌─────────────────────────────────────────────────────────┐
          │     Parallel Market Data Fetching (Promise.all)         │
          │   1. getQuote(symbol, withFundamentals=true)            │
          │   2. getChart(symbol, range="1y", interval="1d")        │
          │   3. getNews(symbol, count=8)                           │
          └────────────────────────────┬────────────────────────────┘
                                       │
                                       ▼
                       Quantitative Indicator Calculation
                          computeIndicators(1y Candles)
                     [RSI, MACD, Bollinger, ATR, VWAP, ADX,
                      Support, Resistance, EMAs, Fibonacci]
                                       │
                                       ▼
                         Reasoning Object Construction
                           buildReasoningObject(...)
                                       │
                    ┌──────────────────┴──────────────────┐
                    ▼                                     ▼
         Algorithmic Risk Scoring             Algorithmic Confidence
           computeRiskScores(...)              computeConfidence(...)
                    │                                     │
                    └──────────────────┬──────────────────┘
                                       │
                                       ▼
                       Context Assembly & Prompt Encoding
                           reasoningToPrompt(...)
                                       │
                                       ▼
                      Server-Sent Events (SSE) Stream Open
                                       │
                                       ▼
                      Multi-Model LLM Execution (aiChat)
                   [Primary: Gemini 3.1 Flash Lite (JSON mode)]
                                       │
                                       ▼
                      JSON Parsing & Schema Decoupling
                                       │
                                       ▼
                     Deterministic Overrides & Injection
                   (Inject verified risk levels & confidence)
                                       │
                                       ▼
                   Sanitization & Target Direction Validation
                    [Automatic Retry → Local Math Fallback]
                                       │
                                       ▼
                    Append Activity Log (Asynchronous Task)
                                       │
                                       ▼
                 SSE Complete Event Dispatched & Rendered in UI
```

### Detailed Step-by-Step Processing

1. **User Action**: The user inputs a ticker, company name, or index into the Search Bar or visits `/markets?symbol=RELIANCE`.
2. **Symbol Resolution**: `resolveSymbol()` normalizes the input, converting human aliases (e.g. "Tata Motors", "Nifty", "Crude Oil") into standardized symbols (`TATAMOTORS.NS`, `^NSEI`, `CL=F`).
3. **Data Ingestion**: `buildInstrumentContext()` executes parallel requests to Yahoo Finance for:
   - Real-time/closing quote with fundamental ratios.
   - 1 year of daily historical candles (OHLCV).
   - Filtered, company-specific news headlines.
4. **Indicator Mathematics**: The raw daily candles are fed into `computeIndicators()`, calculating EMAs (20, 50, 200), SMA 50, RSI(14), Stochastic RSI, MACD, Bollinger Bands, ATR, VWAP, ADX, 60-day support/resistance swing levels, and Fibonacci retracements.
5. **Reasoning Object Assembly**: `buildReasoningObject()` standardizes market data, technical indicators, volume analysis (volume vs. 3-month average), and volatility metrics into a strongly typed `ReasoningObject`.
6. **Algorithmic Risk & Confidence Scoring**:
   - `computeRiskScores()` scores Volatility, Liquidity, Trend, and Fundamentals, outputting an overall profile (`Low`, `Medium`, `High`) and a conviction percentage.
   - `computeConfidence()` calculates a multi-factor score (20–95) based on data availability, trend clarity, and volume behavior.
7. **Prompt Construction**: `reasoningToPrompt()` translates the numerical reasoning object into a dense, institutional prompt text block, detailing all facts without editorial distortion.
8. **LLM Orchestration**: The prompt is submitted to the AI Gateway with strict JSON output specifications. The primary model (`gemini-3.1-flash-lite`) parses the context, formulates trade theses, and generates a structured response.
9. **Mechanical Validation**: The JSON is parsed and post-processed:
   - Algorithmic risk scores and confidence numbers override the LLM's subjective guesses.
   - Price targets are evaluated against mathematical direction rules. If invalid, the system retries with the LLM or applies deterministic technical pivots.
10. **Delivery & Persistence**: The completed analysis payload is streamed to the frontend client over SSE and rendered across analytical widgets (Summary, Trading Levels, Scenario Breakdown, Position Sizing, Beginner Overview). The user can optionally save the analysis to PostgreSQL with a single click.

---

## 5. Market Data Architecture & Provider Failover

### Yahoo Finance Dual Host & Cookie+Crumb Handshake

To prevent IP blocks and rate limits, Lumora's market data client (`lib/market.ts`) implements dual-host load balancing between `query1.finance.yahoo.com` and `query2.finance.yahoo.com` with rotating User-Agent headers.

For fundamental metrics (P/E ratios, forward P/E, EPS, market cap, dividend yield), Yahoo Finance requires an authorized crumb and cookie session. Lumora handles this via `getCrumb()`:
1. Performs an initial request to `https://fc.yahoo.com` or `https://finance.yahoo.com` to capture the HTTP session cookie (`set-cookie`).
2. Requests an authorized crumb token from `https://query1.finance.yahoo.com/v1/test/getcrumb` using the session cookie.
3. Caches the cookie and crumb in memory for 30 minutes, automatically refreshing upon expiration.

### Symbol Normalization & Universal Aliasing

The platform includes an extensive dictionary (`ALIASES`) mapping colloquial names, indices, commodities, forex pairs, and crypto assets directly to market tickers:

- **US Indices**: `S&P 500` / `SPX` → `^GSPC`, `NASDAQ` → `^IXIC`, `DOW` → `^DJI`, `VIX` → `^VIX`, `RUSSELL 2000` → `^RUT`
- **Indian Indices**: `NIFTY` / `NIFTY 50` → `^NSEI`, `BANK NIFTY` → `^NSEBANK`, `SENSEX` → `^BSESN`, `FINNIFTY` → `NIFTY_FIN_SERVICE.NS`, `MIDCPNIFTY` → `^NSMIDCP`, sectoral indices (`^CNXIT`, `^CNXAUTO`, `^CNXPHARMA`, etc.)
- **Indian Large-Caps**: `RELIANCE` → `RELIANCE.NS`, `TCS` → `TCS.NS`, `INFY` → `INFY.NS`, `HDFC BANK` → `HDFCBANK.NS`, `TATA MOTORS` → `TATAMOTORS.NS`, `ITC` → `ITC.NS`
- **Commodities**: `GOLD` → `GC=F`, `SILVER` → `SI=F`, `CRUDE OIL` → `CL=F`, `NATURAL GAS` → `NG=F`
- **Crypto & Forex**: `BITCOIN` / `BTC` → `BTC-USD`, `ETH` → `ETH-USD`, `SOL` → `SOL-USD`, `USDINR` → `INR=X`, `EURUSD` → `EURUSD=X`

### Derivatives Architecture & Indian Broker Gateways

Derivatives logic is coordinated by the `DerivativesManager` (`lib/derivatives/manager.ts`).

```
                              ┌─────────────────────────┐
                              │  Option Chain Request   │
                              └────────────┬────────────┘
                                           │
                                           ▼
                              ┌─────────────────────────┐
                              │   DerivativesManager    │
                              │ (Registered Providers)  │
                              └────────────┬────────────┘
                                           │
          ┌────────────────────────────────┼────────────────────────────────┐
          │                                │                                │
          ▼                                ▼                                ▼
┌──────────────────┐             ┌──────────────────┐             ┌──────────────────┐
│  UpstoxProvider  │             │   KiteProvider   │             │   DhanProvider   │
│ (UPSTOX_API_KEY) │             │ (KITE_API_KEY)   │             │ (DHAN_CLIENT_ID) │
└──────────────────┘             └──────────────────┘             └──────────────────┘
          │                                │                                │
          └────────────────────────────────┼────────────────────────────────┘
                                           │
                        [Any Broker Configured & Live?]
                                           │
                         ┌─────────────────┴─────────────────┐
                         │                                   │
                       [YES]                                [NO]
                         │                                   │
                         ▼                                   ▼
             ┌───────────────────────┐           ┌───────────────────────┐
             │ Return Live Exchange  │           │ Fallback: Free Mode   │
             │ Order Book, OI & IV   │           │ - Real Expiries & S/R │
             └───────────────────────┘           │ - Live Spot Price     │
                                                 │ - Exchange LTP = NULL │
                                                 │ - Black-Scholes Model │
                                                 └───────────────────────┘
```

The system registers five major Indian broker adapters:
1. **Upstox** (`UpstoxOptionsProvider`): Detects `UPSTOX_ACCESS_TOKEN` / `UPSTOX_API_KEY`.
2. **Zerodha Kite Connect** (`KiteConnectOptionsProvider`): Detects `ZERODHA_KITE_API_KEY` and `ZERODHA_KITE_ACCESS_TOKEN`.
3. **Dhan** (`DhanOptionsProvider`): Detects `DHAN_ACCESS_TOKEN` and `DHAN_CLIENT_ID`.
4. **Angel One SmartAPI** (`AngelOneSmartApiProvider`): Detects `ANGEL_ONE_API_KEY` and `ANGEL_ONE_JWT_TOKEN` / PIN.
5. **Fyers** (`FyersOptionsProvider`): Detects `FYERS_APP_ID` and `FYERS_ACCESS_TOKEN`.

### Black-Scholes Theoretical Pricing Fallback Engine

When no broker credentials are configured, Lumora activates its **Free Market-Data Mode**:
- Official strike grids and weekly/monthly expiry schedules are generated from exchange specifications (`lib/instrument.ts`).
- Real-time underlying spot prices are pulled from Yahoo Finance.
- Real exchange traded prices (LTP), Open Interest (OI), and Implied Volatility (IV) are marked as `null` / `UNAVAILABLE`.
- Theoretical metrics are computed using the Black-Scholes options pricing formula (`lib/derivatives/black-scholes.ts`):

$$\begin{aligned}
d_1 &= \frac{\ln(S / K) + (r + \sigma^2 / 2)T}{\sigma \sqrt{T}} \\
d_2 &= d_1 - \sigma \sqrt{T} \\
C &= S \cdot N(d_1) - K \cdot e^{-rT} \cdot N(d_2) \\
P &= K \cdot e^{-rT} \cdot N(-d_2) - S \cdot N(-d_1)
\end{aligned}$$

Where:
- $S$ = Live Underlying Spot Price
- $K$ = Strike Price
- $T$ = Time to Expiration in Years
- $r$ = Risk-free Interest Rate (default 6.5%)
- $\sigma$ = Volatility (default 15% annualized)

Greeks are mathematically derived from standard normal distribution densities ($N'(x)$):
- **Delta ($\Delta$)**: $N(d_1)$ for Calls, $N(d_1) - 1$ for Puts
- **Gamma ($\Gamma$)**: $\frac{N'(d_1)}{S \sigma \sqrt{T}}$
- **Theta ($\Theta$)**: Daily decay computed via the partial derivative with respect to $T$
- **Vega ($\nu$)**: $\frac{S \sqrt{T} N'(d_1)}{100}$ (1% volatility sensitivity)

---

## 6. Technical Analysis Engine

### Mathematical Formulations

All technical indicators in `lib/indicators.ts` operate defensively on OHLCV series. Missing or incomplete data yields safe nulls.

1. **Simple Moving Average (SMA)**:
   $$\text{SMA}_n = \frac{1}{n} \sum_{i=0}^{n-1} P_{t-i}$$
2. **Exponential Moving Average (EMA)**:
   $$\alpha = \frac{2}{n + 1}, \quad \text{EMA}_t = \alpha \cdot P_t + (1 - \alpha) \cdot \text{EMA}_{t-1}$$
3. **Relative Strength Index (RSI - 14 Periods)**:
   $$\text{RS} = \frac{\text{Smoothed Average Gain}}{\text{Smoothed Average Loss}}, \quad \text{RSI} = 100 - \frac{100}{1 + \text{RS}}$$
4. **Stochastic RSI**:
   $$\text{StochRSI} = \frac{\text{RSI} - \min(\text{RSI}_{14})}{\max(\text{RSI}_{14}) - \min(\text{RSI}_{14})} \times 100, \quad \%K = \text{SMA}_3(\text{StochRSI}), \quad \%D = \text{SMA}_3(\%K)$$
5. **Moving Average Convergence Divergence (MACD)**:
   $$\text{MACD Line} = \text{EMA}_{12}(P) - \text{EMA}_{26}(P), \quad \text{Signal Line} = \text{EMA}_9(\text{MACD Line}), \quad \text{Histogram} = \text{MACD} - \text{Signal}$$
6. **Bollinger Bands (20-Day, 2 Standard Deviations)**:
   $$\text{Middle} = \text{SMA}_{20}(P), \quad \sigma = \sqrt{\frac{1}{20}\sum (P_i - \bar{P})^2}, \quad \text{Upper} = \text{Middle} + 2\sigma, \quad \text{Lower} = \text{Middle} - 2\sigma$$
7. **Average True Range (ATR - 14 Periods)**:
   $$\text{TR} = \max\Big(H_t - L_t, \ |H_t - C_{t-1}|, \ |L_t - C_{t-1}|\Big), \quad \text{ATR}_{14} = \text{SMA}_{14}(\text{TR})$$
8. **Volume Weighted Average Price (VWAP)**:
   $$\text{VWAP} = \frac{\sum (P_{\text{typical}} \times V)}{\sum V}, \quad \text{where } P_{\text{typical}} = \frac{H + L + C}{3}$$
9. **Average Directional Index (ADX - 14 Periods)**:
   Evaluates directional movement ($+DM$, $-DM$) against True Range, calculating smoothed $+DI_{14}$, $-DI_{14}$, Directional Index ($DX$), and smoothed $ADX$.
10. **Support & Resistance**:
    Calculated across a rolling 60-day window identifying structural swing lows (Support) and swing highs (Resistance).
11. **Fibonacci Retracements**:
    Derived between the 60-day low ($0.0$) and high ($1.0$): levels at $0.236$, $0.382$, $0.500$, $0.618$, and $0.786$.

### Market Regime, Trend & Momentum Classification

- **Trend Direction**:
  - `bullish`: $Price > EMA_{50}$ and $EMA_{20} > EMA_{50}$.
  - `bearish`: $Price < EMA_{50}$ and $EMA_{20} < EMA_{50}$.
  - `neutral`: Mixed moving average alignment.
- **Trend Strength**:
  - `strong`: $ADX \ge 25$ or divergence between $EMA_{20}$ and $EMA_{50} > 3\%$.
  - `moderate`: $ADX \ge 18$.
  - `weak`: $ADX < 18$.
- **Momentum Regime**:
  - `accelerating`: RSI between 55 and 70 with positive MACD histogram.
  - `fading`: RSI > 70 (overbought) or RSI < 30 (oversold) with decelerating MACD histogram.
  - `steady`: Balanced momentum profile.

### Algorithmic Risk Scoring & Confidence Calculation

In `lib/ai/engine/risk.ts`, risk is calculated via four weighted sub-scores (0–100):
- **Volatility Score**: Derived from ATR as a percentage of share price ($>3\% \to 90$, $>1.5\% \to 60$, $\le1.5\% \to 30$).
- **Liquidity Score**: Derived from current volume versus average 3-month volume ($<30\% \to 80$, $<70\% \to 50$, $\ge70\% \to 20$).
- **Trend Risk Score**: Derived from ADX strength ($\ge40 \to 20$, $\ge25 \to 40$, $<20 \to 80$).
- **Fundamental Risk Score**: Penalties applied for micro-caps ($<1\text{B} \to +20$), high beta ($>2 \to +15$), and missing earnings data ($+10$).
- **Overall Rating**: $\ge70 \to \text{"High Risk"}$, $\ge40 \to \text{"Medium Risk"}$, $<40 \to \text{"Low Risk"}$. Conviction is mathematically set to $100 - \text{Overall Score}$.

---

## 7. Complete Application & Directory Structure

```text
lumora/
├── app/                                 # Next.js App Router root
│   ├── (dashboard)/                     # Authenticated dashboard route group
│   │   ├── activity/                    # User audit trail & past action history
│   │   ├── admin/                       # Administrative oversight view
│   │   ├── chat/                        # Grounded conversational AI workspace
│   │   ├── compare/                     # Multi-ticker quantitative comparison
│   │   ├── dashboard/                   # Main terminal desk & MarketFocus widget
│   │   ├── notifications/               # In-app digest & system notification center
│   │   ├── portfolio/                   # Asset holdings & P&L tracking desk
│   │   ├── profile/                     # Profile info, legal history, preferences
│   │   ├── saved-analysis/              # Archived AI research notes & snapshots
│   │   ├── trade-planner/               # Capital sizing & trade critique calculator
│   │   ├── watchlist/                   # User-curated ticker watchlist
│   │   ├── layout.tsx                   # Dashboard shell, responsive sidebar, navigation
│   │   └── error.tsx                    # Route-level error boundary
│   ├── actions/                         # Next.js Server Actions (PostgreSQL transactions)
│   │   ├── activity.ts                  # Activity log operations
│   │   ├── agreement.ts                 # Legal consent records
│   │   ├── chat.ts                      # Conversation and message CRUD
│   │   ├── notifications.ts             # Notification status management
│   │   ├── portfolio.ts                 # Portfolio holdings CRUD & valuations
│   │   ├── profile.ts                   # User profile & notification preferences
│   │   ├── saved-analysis.ts            # Saved analysis archive operations
│   │   └── watchlist.ts                 # Watchlist CRUD operations
│   ├── api/                             # Serverless REST & SSE API endpoints
│   │   ├── analyze/                     # Streaming SSE & JSON AI analysis endpoint
│   │   ├── auth/[...all]/               # Better Auth catch-all API handler
│   │   ├── chart/                       # Historical OHLCV candle query endpoint
│   │   ├── chat/                        # Streaming grounded AI chat endpoint
│   │   ├── cron/notifications/          # Scheduled stock digest and update runner
│   │   ├── debug/env/                   # Environment diagnostic route (non-production)
│   │   ├── email-history/               # Circular in-memory email log viewer
│   │   ├── market-summary/              # Regional market desk overview endpoint
│   │   ├── news/                        # Financial news & publisher headline endpoint
│   │   ├── options/                     # Option chains, diagnostics, and broker health
│   │   ├── quote/                       # Live single and multi-quote endpoint
│   │   ├── region/                      # Geo-IP detection & market defaulting
│   │   ├── research/                    # Long-form equity research note endpoint
│   │   ├── search/                      # Real-time symbol search & alias resolver
│   │   ├── trade-planner/               # Trade plan calculation & critique endpoint
│   │   └── upload/                      # User avatar & profile image upload endpoint
│   ├── about/                           # Public platform about page
│   ├── faq/                             # Frequently asked questions
│   ├── privacy/                         # Privacy policy & data practices
│   ├── terms/                           # Terms of service & trading disclaimers
│   ├── markets/                         # Deep interactive instrument analysis page
│   ├── options/                         # Dynamic options routes ([underlying]/[contract])
│   ├── options-analysis/                # Dedicated options market landing page
│   ├── ai-stock-analysis/               # Programmatic SEO landing page
│   ├── ai-stock-analyzer/               # Programmatic SEO landing page
│   ├── ai-stock-research/               # Programmatic SEO landing page
│   ├── indian-stock-market-ai/          # Dedicated Indian equity SEO page
│   ├── nifty-50-ai-analysis/            # Dedicated NIFTY 50 SEO page
│   ├── layout.tsx                       # Root layout with fonts, themes, metadata
│   ├── page.tsx                         # High-impact landing page & product preview
│   ├── robots.ts                        # Search engine crawling directives
│   └── sitemap.ts                       # Dynamic multi-page search sitemap
├── components/                          # React client & server components
│   ├── auth/                            # Account menus, auth modal, provider icons
│   ├── landing/                         # Hero parallax, feature demos, pricing, testimonials
│   ├── ui/                              # Empty states, buttons, badges, primitives
│   ├── ai-analysis.tsx                  # Deep analysis presentation terminal
│   ├── ambient-background.tsx           # Subtle geometric canvas mesh background
│   ├── count-up.tsx                     # Animated numerical counter
│   ├── dashboard-shell.tsx              # Top navigation bar, mobile menu, search
│   ├── dashboard-sidebar.tsx            # Desktop sidebar with active route states
│   ├── email-history-widget.tsx         # In-memory email diagnostic visualizer
│   ├── entrance-screen.tsx              # Initial asset preloader
│   ├── hero-parallax.tsx                # Dynamic perspective landing hero
│   ├── how-it-works.tsx                 # Platform workflow visualization
│   ├── indicator-panel.tsx              # Technical indicator metrics display
│   ├── market-explorer.tsx              # Multi-asset class overview grid
│   ├── market-marquee.tsx               # Infinite live quote ticker tape
│   ├── navbar.tsx                       # Public navigation header
│   ├── news-panel.tsx                   # Filtered news & sentiment impact display
│   ├── option-chain.tsx                 # Interactive option chain table (calls/puts)
│   ├── price-chart.tsx                  # Interactive SVG candlestick & area chart
│   ├── reveal.tsx                       # Motion animation wrappers (FadeUp, FadeScale)
│   ├── symbol-search.tsx                # Auto-completing global ticker search bar
│   └── theme-provider.tsx               # Light/dark mode context provider
├── drizzle/                             # SQL migrations generated by Drizzle Kit
├── lib/                                 # Shared business logic, engines & utilities
│   ├── ai/                              # AI subsystem
│   │   ├── cache/                       # In-memory TTL cache for model outputs
│   │   ├── engine/                      # Trade recommendations, risk, confidence, validation
│   │   ├── providers/                   # Market data provider registry & fallback
│   │   └── provider.ts                  # Multi-model AI gateway (Gemini/OpenAI/Anthropic)
│   ├── db/                              # Database subsystem
│   │   ├── index.ts                     # PostgreSQL connection pool via node-postgres
│   │   └── schema.ts                    # Drizzle ORM schema definitions
│   ├── derivatives/                     # Derivatives subsystem
│   │   ├── providers/                   # Indian broker adapters (Upstox, Kite, Dhan, etc.)
│   │   ├── black-scholes.ts             # Black-Scholes theoretical pricing & Greeks engine
│   │   ├── instruments.ts               # Option chain instrument generator
│   │   ├── manager.ts                   # Derivatives failover & cache manager
│   │   └── types.ts                     # TypeScript definitions for option contracts
│   ├── email/                           # Email subsystem
│   │   ├── providers/                   # Gmail SMTP & Console fallback providers
│   │   ├── adapter.ts                   # Standardized email interface & logging
│   │   └── index.ts                     # Email routing, correlation IDs & retry loop
│   ├── notifications/                   # Notification generation logic & stock digests
│   ├── auth.ts                          # Better Auth server configuration
│   ├── auth-client.ts                   # Better Auth React client hooks
│   ├── context.ts                       # Instrument context builder for AI prompts
│   ├── currency.ts                      # Multi-currency symbols & formatters
│   ├── indicators.ts                    # Pure technical indicator calculations
│   ├── instrument.ts                    # Universal symbol parser & options rules
│   ├── market.ts                        # Real market data layer (Yahoo Finance)
│   ├── news.ts                          # News fetching & company filtering
│   ├── options.ts                       # US options provider & chain calculator
│   ├── portfolio.ts                     # Portfolio calculation helpers
│   ├── ratelimit.ts                     # In-memory sliding-window rate limiter
│   ├── regions.ts                       # Geographic region definitions
│   ├── session.ts                       # Server-side auth session utilities
│   └── utils.ts                         # Formatting & class merging utilities
├── public/                              # Static public assets (icons, manifest, logo)
├── scripts/                             # Operational, migration & diagnostic CLI scripts
│   ├── check-db.mjs                     # Database connectivity tester
│   ├── cleanup.mjs                      # Test artifact cleaner
│   ├── direct-auth-test.mjs             # Direct Better Auth API tester
│   ├── e2e-all.mjs                      # Full system end-to-end verification
│   ├── migrate-app.mjs                  # Standalone database migration runner
│   ├── test-derivatives-pipeline.ts     # Options pipeline verification script
│   └── test-gmail-smtp.ts               # Live SMTP delivery diagnostic
├── tests/                               # Automated unit & integration tests
│   ├── auth-flow.test.ts                # Authentication & OTP unit tests
│   ├── contract-identity.test.ts        # Option parsing & contract mandate tests
│   └── derivatives-pipeline.test.ts     # Options chain & Black-Scholes tests
├── drizzle.config.ts                    # Drizzle Kit migration configuration
├── metadata.json                        # AI Studio applet capabilities & metadata
├── next.config.mjs                      # Next.js build & runtime configuration
├── package.json                         # Project dependencies, scripts & metadata
└── tsconfig.json                        # Strict TypeScript configuration
```

---

## 8. Database Architecture & Drizzle Schema

Lumora utilizes a relational PostgreSQL database managed via **Drizzle ORM** (`lib/db/schema.ts`). Connection pooling is handled by `pg.Pool` (`lib/db/index.ts`).

### Entity Relationship Overview

```text
 ┌────────────────────────────────────────────────────────┐
 │                         user                           │
 │  id (PK), name, email, emailVerified, timezone,        │
 │  theme, notification_prefs, accepted_terms...          │
 └───────┬──────────────┬──────────────┬───────────┬──────┘
         │ 1            │ 1            │ 1         │ 1
         │              │              │           │
         ▼ *            ▼ *            ▼ *         ▼ *
   ┌───────────┐  ┌───────────┐  ┌───────────┐  ┌──────────────┐
   │  session  │  │  account  │  │activity_  │  │user_         │
   │  (Auth)   │  │  (OAuth)  │  │log        │  │agreement     │
   └───────────┘  └───────────┘  └───────────┘  └──────────────┘

 ┌────────────────────────────────────────────────────────┐
 │     App Data Tables (Scoped by userId text column)     │
 ├────────────────────────────┬───────────────────────────┤
 │ portfolio_holding          │ watchlist_item            │
 │ (symbol, qty, avgPrice)    │ (symbol, assetType)       │
 ├────────────────────────────┼───────────────────────────┤
 │ saved_analysis             │ notification              │
 │ (symbol, data JSONB)       │ (type, title, body, read) │
 └────────────────────────────┴───────────────────────────┘

 ┌───────────────────────────┐           ┌───────────────────────────┐
 │     chat_conversation     │ 1       * │       chat_message        │
 │  id (PK), userId, title   ├──────────►│  id (PK), conversation_id │
 │                           │ (Cascade) │  role, content, tokens    │
 └───────────────────────────┘           └───────────────────────────┘
```

### Table Definitions

1. **`user`**: Stores user identity, verified email status, preferences (timezone, country, theme), notification settings (`jsonb`), and legal consent timestamps.
2. **`session`**: Tracks active authenticated sessions with IP address, user-agent, token, and expiration timestamp (foreign key to `user.id` on cascade delete).
3. **`account`**: Stores OAuth link records (Google, Yahoo, Apple) or hashed passwords for credentials-based sign-in.
4. **`verification`**: Manages temporary validation tokens, including 6-digit email OTPs.
5. **`portfolio_holding`**: Tracks user investment holdings (symbol, company name, asset type, quantity, average purchase price). Scoped by `userId`.
6. **`watchlist_item`**: Stores favorite assets for rapid dashboard monitoring. Scoped by `userId`.
7. **`notification`**: In-app alerts, market movement digests, and platform notices. Scoped by `userId`.
8. **`saved_analysis`**: Archives full quantitative AI analysis responses (JSONB data, direction, confidence, summary).
9. **`chat_conversation`**: Organizes chat sessions per user with timestamps and custom titles.
10. **`chat_message`**: Stores individual conversation turns (user/assistant), role, content, and token counts (foreign key to `chat_conversation.id` on cascade delete).
11. **`user_agreement`**: Legal compliance log recording terms acceptance, privacy policy consent, IP address, and browser agent.
12. **`activity_log`**: Append-only user activity log tracking ticker searches, analyses, and trade planning usage.

---

## 9. Authentication, Security & Email Engine

### Better Auth Architecture

Authentication is powered by **Better Auth** (`better-auth` v1.6.23) configured in `lib/auth.ts`:
- **Session Lifespan**: 7-day session validity with a 24-hour sliding update window.
- **Dynamic Origin Resolution**: Automatically derives trusted origins across production (`https://www.lumoraai.in`), preview deployments (`*.vercel.app`), and local development environments (`localhost:3000`).
- **Cookie Security**: Employs `SameSite=None` with `Secure=true` in development to ensure seamless operation across iframes and previews.

### Email OTP & Dual-Provider Email Adapter

User verification utilizes a 6-digit Email OTP pattern via the Better Auth `emailOTP` plugin:
- When a user signs up or requests a password reset, a 600-second expiring OTP is generated.
- The dispatch routine routes through `sendEmail()` (`lib/email/index.ts`):
  - **Production (Gmail / SMTP)**: When `SMTP_USER` and `SMTP_PASS` (or `GMAIL_APP_PASSWORD`) are present, emails are delivered over secure SMTP (default port `465`).
  - **Development / Fallback (Console Provider)**: When SMTP credentials are unconfigured, the system routes emails to `lib/email/providers/console.ts`. The OTP is logged clearly to the server console and saved to an in-memory circular buffer (`_emailLogs`), ensuring login workflows are never blocked by missing credentials.

### Rate Limiting & Defensive Measures

To safeguard against abuse and upstream denial-of-service, all sensitive API endpoints implement an in-memory sliding-window rate limiter (`lib/ratelimit.ts`):
- `/api/analyze`: Max 15 requests per 60 seconds per IP.
- `/api/chat`: Max 5 messages per 60 seconds per IP.
- `/api/trade-planner`: Max 10 requests per 60 seconds per IP.
- `/api/research`: Max 10 requests per 60 seconds per IP.
- `/api/options`: Max 20 requests per 60 seconds per IP.

---

## 10. API Route Reference

| Endpoint | Method | Payload / Query | Response Type | Purpose |
|---|---|---|---|---|
| `/api/analyze` | `POST` | `{ "symbol": "AAPL", "horizon": "swing" }` | `text/event-stream` or `JSON` | Generates full institutional AI analysis. Supports SSE streaming or direct JSON. |
| `/api/chat` | `POST` | `{ "conversationId"?: number, "message": "...", "symbol"?: "TSLA" }` | `text/event-stream` | Streams AI responses grounded in live market quotes and conversation history. |
| `/api/quote` | `GET` | `?symbol=NVDA` or `?symbols=AAPL,MSFT` | `JSON` | Returns real-time quotes, 24h change, OHLC, volume, and fundamental ratios. |
| `/api/chart` | `GET` | `?symbol=MSFT&range=1y&interval=1d` | `JSON` | Returns historical OHLCV candles for interactive chart rendering. |
| `/api/search` | `GET` | `?q=reliance` | `JSON` | Searches global instruments, resolves aliases, and returns matching symbols. |
| `/api/news` | `GET` | `?symbol=AAPL&count=8` | `JSON` | Fetches filtered, company-specific publisher news stories. |
| `/api/trade-planner` | `POST` | `{ "symbol": "AAPL", "buyPrice": 180, "quantity": 10, ... }` | `JSON` | Computes investment metrics and generates an AI trade plan evaluation. |
| `/api/research` | `POST` | `{ "symbol": "GOOGL" }` | `JSON` | Produces an institutional equity research note (thesis, catalysts, risks). |
| `/api/market-summary` | `GET` | `?region=US` | `JSON` | Delivers regional index snapshots and an AI macroeconomic summary. |
| `/api/options` | `GET` | `?symbol=AAPL&expiry=2025-01-17` | `JSON` | Returns option chain (calls, puts, Greeks, PCR, Max Pain) or Black-Scholes model. |
| `/api/options/health` | `GET` | None | `JSON` | Returns operational health and configuration status of derivative broker feeds. |
| `/api/options/diagnostics` | `GET` | None | `JSON` | Provides diagnostic telemetry on option resolution, strike count, and cache entries. |
| `/api/region` | `GET` | None | `JSON` | Infers user geographic region from request headers (`x-vercel-ip-country`). |
| `/api/cron/notifications` | `GET`/`POST` | Header: `Bearer <CRON_SECRET>` | `JSON` | Executes background digest generation and dispatches notification emails. |
| `/api/email-history` | `GET` | None | `JSON` | Returns circular buffer of recent email dispatch attempts and latency logs. |
| `/api/upload` | `POST` | `FormData` (image file) | `JSON` | Validates and converts user profile avatar into base64 data URI. |

---

## 11. Environment Configuration Guide

Create a `.env` file in the project root. Below is a comprehensive specification of all environment variables supported across the platform:

```bash
# ==============================================================================
# 1. DATABASE CONFIGURATION (Required for Persistence & Auth)
# ==============================================================================
# PostgreSQL connection URI (Neon, Supabase, Cloud SQL, or local Postgres)
DATABASE_URL="postgresql://user:password@localhost:5432/lumora?sslmode=require"

# ==============================================================================
# 2. BETTER AUTH CONFIGURATION (Required for Authentication)
# ==============================================================================
# Random 32+ character secret used to sign session cookies and tokens
BETTER_AUTH_SECRET="your-super-secret-random-key-min-32-chars-long"

# The canonical public URL of your Lumora deployment
BETTER_AUTH_URL="http://localhost:3000"
NEXT_PUBLIC_APP_URL="http://localhost:3000"

# Optional comma-separated list of additional trusted origins
BETTER_AUTH_TRUSTED_ORIGINS="http://localhost:3000,http://127.0.0.1:3000"

# ==============================================================================
# 3. AI PROVIDER CONFIGURATION (At least GEMINI_API_KEY recommended)
# ==============================================================================
# Primary AI Provider: Google Gemini API Key
GEMINI_API_KEY="AIzaSy..."

# Multi-Cloud Fallback: OpenAI API Key (Optional)
OPENAI_API_KEY="sk-..."

# Multi-Cloud Fallback: Anthropic API Key (Optional)
ANTHROPIC_API_KEY="sk-ant-..."

# ==============================================================================
# 4. EMAIL / SMTP CONFIGURATION (Required for Live Verification Emails)
# If omitted, OTPs log to the server console and login remains fully functional.
# ==============================================================================
SMTP_HOST="smtp.gmail.com"
SMTP_PORT="465"
SMTP_SECURE="true"
SMTP_USER="notifications@yourdomain.com"
SMTP_PASS="your-16-char-gmail-app-password"
SMTP_FROM="\"Lumora AI\" <notifications@yourdomain.com>"

# ==============================================================================
# 5. OAUTH SOCIAL PROVIDERS (Optional)
# ==============================================================================
GOOGLE_CLIENT_ID=""
GOOGLE_CLIENT_SECRET=""

YAHOO_CLIENT_ID=""
YAHOO_CLIENT_SECRET=""

APPLE_CLIENT_ID=""
APPLE_CLIENT_SECRET=""
APPLE_APP_BUNDLE_IDENTIFIER=""

# ==============================================================================
# 6. INDIAN BROKER DERIVATIVES API KEYS (Optional)
# If omitted, Indian options run in Free Mode with Black-Scholes modeling.
# ==============================================================================
UPSTOX_ACCESS_TOKEN=""
UPSTOX_API_KEY=""

ZERODHA_KITE_API_KEY=""
ZERODHA_KITE_ACCESS_TOKEN=""

DHAN_ACCESS_TOKEN=""
DHAN_CLIENT_ID=""

ANGEL_ONE_API_KEY=""
ANGEL_ONE_JWT_TOKEN=""
ANGEL_ONE_PIN=""

FYERS_APP_ID=""
FYERS_ACCESS_TOKEN=""

# ==============================================================================
# 7. CRON SCHEDULER SECURITY (Optional)
# ==============================================================================
CRON_SECRET="your-high-entropy-cron-secret"
```

---

## 12. Installation, Running & Deployment

### Prerequisites

- **Node.js**: `v20.x` or later (Node.js 22 LTS recommended)
- **Package Manager**: `npm`, `pnpm`, or `bun`
- **PostgreSQL Database**: A running instance (local, Supabase, Neon, or Cloud SQL)

### Step-by-Step Setup

1. **Clone the Repository**:
   ```bash
   git clone https://github.com/Lokesh-81/Lumora-Ai.git
   cd Lumora-Ai
   ```

2. **Install Dependencies**:
   ```bash
   npm install
   ```

3. **Configure Environment**:
   Copy `.env.example` to `.env` and populate your database and API credentials:
   ```bash
   cp .env.example .env
   ```

### Database Migrations

Apply the database schema to your PostgreSQL database:

```bash
# Generate SQL migrations (if schema was modified)
npx drizzle-kit generate

# Execute migrations against DATABASE_URL
npm run db:migrate

# Alternatively, run the migration helper script
node scripts/migrate-app.mjs
```

### Running the Development Server

Start Next.js on port `3000`:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Automated Tests & Quality Assurance

Run the test suite using Node's native test runner via `tsx`:

```bash
# Execute unit and integration tests
npm test

# Run specific test suites
npx tsx --test tests/auth-flow.test.ts
npx tsx --test tests/contract-identity.test.ts
npx tsx --test tests/derivatives-pipeline.test.ts

# Type-check the entire codebase without emitting build artifacts
npm run lint
```

### Production Build & Deployment

To build the optimized production bundle:

```bash
npm run build
npm run start
```

When deploying to **Vercel**:
- Set the framework preset to **Next.js**.
- Configure the environment variables in the Vercel dashboard.
- Set the build command to `npm run build` or `npm run vercel-build`.

---

## 13. Regulatory Compliance & Disclaimer

```text
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
                            REGULATORY DISCLAIMER
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Lumora AI is an informational and technological market-intelligence tool designed
exclusively for financial research, quantitative analysis, and educational
purposes.

1. NOT FINANCIAL ADVICE: Lumora AI is NOT a registered investment advisor,
   broker-dealer, or portfolio manager under SEBI (Securities and Exchange Board
   of India), SEC (U.S. Securities and Exchange Commission), FCA (Financial
   Conduct Authority), or any other financial regulatory authority.
2. NO RECOMMENDATION TO TRANSACT: Content generated by the platform—including
   recommendation ratings (Buy, Sell, Wait), confidence scores, price targets,
   and stop-loss levels—does NOT constitute a solicitation, recommendation,
   or endorsement to buy, sell, or hold any security, derivative, or financial
   instrument.
3. CAPITAL AT RISK: Trading in equities, foreign exchange, commodities, crypto,
   and particularly derivative contracts (futures and options) involves
   substantial risk of loss and is not suitable for all investors. Derivative
   traders can lose an amount exceeding their initial investment.
4. MODELLED VALUATIONS: Theoretical prices and Greeks calculated via the
   Black-Scholes model are mathematical estimates based on constant volatility
   assumptions and do NOT represent actual executable exchange quotes.
5. INDEPENDENT DUE DILIGENCE: Users are advised to perform independent research
   and consult with certified, licensed financial advisors before making any
   investment decisions.
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

---

<div align="center">
  <sub>Engineered by the Lumora AI Research & Engineering Team. Built with Next.js, TypeScript, and Google Gemini.</sub>
</div>
