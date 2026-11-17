import { NextResponse } from "next/server"
import { derivativeManager } from "@/lib/derivatives/manager"
import { enforceRateLimit, clientIp } from "@/lib/ratelimit"

export const runtime = "nodejs"
export const maxDuration = 10

export async function GET(req: Request) {
  const rateLimitResponse1 = await enforceRateLimit(`options-health:${clientIp(req)}`, 30, 60_000)
  if (rateLimitResponse1) return rateLimitResponse1
}
