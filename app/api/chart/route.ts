import { NextResponse } from "next/server"
import { getChart } from "@/lib/market"
import { enforceRateLimit, clientIp } from "@/lib/ratelimit"

export const runtime = "nodejs"

const RANGE_INTERVAL: Record<string, string> = {
  "1d": "5m",
  "5d": "30m",
  "1mo": "1d",
  "3mo": "1d",
  "6mo": "1d",
  ytd: "1d",
  "1y": "1d",
  "5y": "1wk",
  max: "1mo",
}

export async function GET(req: Request) {
  const rateLimitResponse1 = await enforceRateLimit(`chart:${clientIp(req)}`, 30, 60_000)
  if (rateLimitResponse1) return rateLimitResponse1