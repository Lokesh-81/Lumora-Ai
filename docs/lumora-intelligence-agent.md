# Lumora Options Trading Intelligence Agent

## Product definition

Build Lumora Intelligence as a research and paper-trading agent for **Indian exchange-listed options and US-listed options**, supporting **intraday and positional** horizons. This is not a prompt-only chatbot: market-data adapters, deterministic financial calculations, validation rules, source metadata, and an LLM explanation layer have separate responsibilities.

## Non-negotiable correctness rules

1. **Never describe a quote as live without evidence.** Every market snapshot must carry provider, instrument/contract identity, exchange/session, source timestamp, retrieval timestamp, currency, and freshness status. If entitlement, timestamp, or feed status cannot be verified, label it delayed, indicative, theoretical, or unavailable—never live.
2. **Do not treat public Yahoo Finance endpoints as an exchange-authorized real-time options feed.** They may be used only with honest provenance and coverage/delay caveats. Production options quotes require a provider whose contract, exchange coverage, data rights, and freshness are verified. NSE documents paid real-time feeds and authorized vendors: https://www.nseindia.com/static/market-data/real-time-data-subscription and https://www.nseindia.com/static/market-data/analytical-products.
3. **Calculate; do not ask the LLM to do arithmetic.** Option payoff, contract multipliers, breakeven, fees, and simulated P&L belong in deterministic typed code. The LLM explains those outputs but cannot overwrite them.
4. **Never invent contract metadata.** Strike, expiry, option right, multiplier/lot size, currency, and contract style must come from a verified contract master or explicit user input. Reject incomplete contracts rather than guessing.
5. **Cite evidence at claim level.** Each sourced claim should point to the exact provider/page or news article and show source time. A generic label such as “market data” is not a citation.
6. **Fail closed on stale or contradictory data.** If required fields are absent, feeds disagree beyond a configured tolerance, the market is closed, or data is stale, state the limitation and suppress actionable-looking predictions.
7. **Predictions are hypotheses, not facts.** Do not emit numerical probabilities until a defined model has been out-of-sample calibrated. Track calibration, drawdown, costs, slippage, and performance by market/horizon. Backtests must avoid look-ahead and survivorship bias.
8. **Paper mode only.** No broker credentials, live order endpoints, or live order placement. Simulated fills must declare their fill model and include spread/slippage assumptions. Persist immutable input snapshots and results for auditability.

## Existing repository fit

- Next.js App Router and TypeScript.
- Existing market/context layer in \`lib/market.ts\` and \`lib/context.ts\`; core quotes currently use Yahoo Finance public endpoints and the app contains a derivatives abstraction.
- Existing theoretical Black–Scholes module at \`lib/derivatives/black-scholes.ts\`; its outputs remain explicitly modelled unless fed verified market inputs.
- Existing AI provider abstraction in \`lib/ai/provider.ts\` and Better Auth + Drizzle/Postgres persistence.
- Draft PR #12 adds the authenticated agent workspace and initial API. It is **not merged, not deployed, and has not been validated by a local build/test run**.

## Architecture

\`\`\`text
Question -> intent/router -> typed tool schema + authorization + validation
  -> market/news adapters -> provenance, freshness, and conflict checks
  -> deterministic options analytics -> calibrated model outputs (only if validated)
  -> LLM explanation grounded in structured evidence
  -> response validator (citations, timestamps, unsupported claims)
  -> answer + sources + assumptions + freshness + uncertainty
\`\`\`

## Market coverage and data adapters

### India
- Contract master from a verified exchange or licensed vendor; refresh and version expiry/lot-size changes.
- Option chain: bid/ask, last trade, volume, OI and changes, IV/Greeks where included in the entitled feed.
- Spot/index and futures context, India VIX, exchange calendar and relevant events.
- NSE's official pages describe paid real-time F&O feeds and real-time option Greeks/analytics. Do not scrape exchange pages as a substitute for licensed data.

### United States
- Options chain and quotes from a provider with explicit US options exchange coverage and entitlement; retain quote conditions, bid/ask, last trade, underlying timestamp, Greeks/IV provenance.
- Corporate actions, dividends, earnings calendar, and trading calendar from cited sources.
- US equity options often use a 100-share multiplier, but adjusted contracts exist. Never hard-code 100 for every contract.

### Normalized provider contract
Preserve provider/data tier, instrument ID, underlying, option right, strike, expiry, multiplier, exercise/settlement style, bid/ask/last, volume, OI, IV/Greeks, currency, market session, exchange/source timestamp, retrievedAt, freshness state, and source URL/reference. Fields can have distinct timestamps; don't assign one timestamp to everything.

## Deterministic analytics

The initial reusable expiry-payoff engine is \`lib/options/pnl.ts\`. It calculates single- and multi-leg expiry P&L from explicit contract legs and an explicit total cost. It deliberately does not infer multipliers, fees, live prices, probabilities, or fill prices. Unit tests are in \`tests/options-pnl.test.ts\`.

Next analytics:
- Breakeven and maximum profit/loss only when mathematically bounded and assumptions are known.
- Mark-to-market paper P&L using a documented fill model and fresh bid/ask marks, distinct from expiry payoff.
- Explicit commissions, exchange fees, taxes, regulatory fees, and FX conversion where applicable; never silently assume zero.
- Strategy-level Greeks aggregated from verified inputs, with source/model labels.
- Scenario grid for spot, IV, time, spread widening, and gaps.

## Paper trading

- A paper order is simulated intent, not a real broker order.
- Require contract, side, quantity, limit/assumed fill, multiplier, currency, and fill model.
- Don't fill buys at stale last prices when fresh asks are available, or sells at stale last prices when fresh bids are available. If no valid quote exists, reject or leave pending rather than fabricate a fill.
- Record quote snapshot/source timestamps, order intent, simulated fill, estimated fees/slippage, strategy legs, and deterministic P&L. Separate realized, unrealized, and expiry-scenario P&L.
- No live trading. A future broker execution feature requires separate approval and compliance/security review.

## Prediction validation

- Use walk-forward, time-split evaluation; never leak future information.
- Establish no-change, simple-trend, and volatility-aware baselines before fitting complex models.
- Report coverage and abstention rate as well as directional accuracy; calibration and net-of-cost performance matter more than win rate alone.
- Do not display “confidence” as probability unless calibration is measured and the metric definition is shown.
- Say “insufficient evidence” when a model is not validated for that market, strategy, or horizon.

## Phased delivery

1. **Foundation (this change):** deterministic expiry-payoff module + tests, product requirements and source/freshness rules.
2. **Data integrity:** normalized provider interface, contract master, source citations, freshness thresholds, provider health and conflict detection. Audit existing timestamps and don't call the current Yahoo-based feed exchange-authorized live options data.
3. **Paper-trading ledger:** migration, authenticated user-scoped paper orders/positions/fills, immutable quote snapshots, idempotency and audit trail.
4. **Options research UI/tools:** chain explorer, strategy builder, payoff curve, Greeks, scenario analysis and cited research answers.
5. **Prediction evaluation:** historical dataset pipeline, walk-forward backtests, calibration, net-of-cost results and drift monitoring.
6. **Hardening:** prompt-injection tests, per-user isolation, rate/cost limits, malformed-data tests, observability and release review.

## Validation status

The GitHub integration can commit changes, but this environment has not run the TypeScript compiler, database migrations, or tests. Before merge, run \`bun run lint\` and \`bun test\` from a clean checkout and review migrations against a non-production database. No merge or deployment is authorized by this task.
