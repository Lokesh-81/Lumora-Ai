# Lumora Intelligence Agent — implementation notes

## Current repository fit

- Next.js App Router with TypeScript.
- Existing Gemini-backed provider abstraction in `lib/ai/provider.ts`.
- Existing market context builder in `lib/context.ts`.
- Existing per-user chat persistence in `chat_conversation` and `chat_message`.
- Existing Better Auth session and dashboard route group.

## First slice

The first slice adds an authenticated `/agent` workspace and `POST /api/agent` endpoint. It reuses Lumora's existing market context and provider rather than adding another model SDK. Conversations are scoped to the authenticated user and persisted in existing chat tables. The agent is read-only; no tool can place trades or mutate external state.

## Next phases

1. Add a dedicated agent-conversation discriminator and conversation history listing, rather than mixing agent and general chat conversations.
2. Add typed read-only tools with strict argument validation and data freshness metadata.
3. Add persisted approval requests with action hashes, expiry, one-time execution, and audit events.
4. Add source verification and scheduled watchlist briefs.
5. Add a controlled in-product entry point and evaluate prompt injection, authorization, stale data, and cost limits.

## Release note

This branch is an initial implementation slice. It has not been run through a local TypeScript build or deployed from this environment; run `bun run lint` and `bun test` in a checkout before merging.
