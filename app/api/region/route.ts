import { NextResponse } from "next/server"
import { headers } from "next/headers"
import { regionFromCountry, REGION_CONFIG } from "@/lib/market"
import { enforceRateLimit, clientIp } from "@/lib/ratelimit"

export const runtime = "nodejs"

export async function GET(req: Request) {
  const rateLimitResponse1 = await enforceRateLimit(`region:${clientIp(req)}`, 30, 60_000)
  if (rateLimitResponse1) return rateLimitResponse1