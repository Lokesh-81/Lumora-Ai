import { NextResponse } from "next/server"
import { getQuotes } from "@/lib/market"
import { enforceRateLimit, clientIp } from "@/lib/ratelimit"

export const runtime = "nodejs"

export async function GET(req: Request) {
  const rateLimitResponse1 = await enforceRateLimit(`quote:${clientIp(req)}`, 30, 60_000)
  if (rateLimitResponse1) return rateLimitResponse1