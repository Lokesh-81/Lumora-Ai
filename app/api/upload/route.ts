import { NextRequest, NextResponse } from "next/server"
import { getUserId } from "@/lib/session"
import { enforceRateLimit, clientIp } from "@/lib/ratelimit"

export const runtime = "nodejs"

const MAX_FILE_SIZE = 5 * 1024 * 1024

function detectImageType(bytes: Uint8Array): "image/jpeg" | "image/png" | "image/webp" | null {
  if (bytes.length >= 3 && bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff) {
    return "image/jpeg"
  }
  if (
    bytes.length >= 8 &&
    bytes[0] === 0x89 && bytes[1] === 0x50 && bytes[2] === 0x4e && bytes[3] === 0x47 &&
    bytes[4] === 0x0d && bytes[5] === 0x0a && bytes[6] === 0x1a && bytes[7] === 0x0a
  ) {
    return "image/png"
  }
  if (
    bytes.length >= 12 &&
    String.fromCharCode(...bytes.slice(0, 4)) === "RIFF" &&
    String.fromCharCode(...bytes.slice(8, 12)) === "WEBP"
  ) {
    return "image/webp"
  }
  return null
}

export async function POST(req: NextRequest) {
  try {
    const userId = await getUserId()
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const rateLimitResponse1 = await enforceRateLimit(`upload:${userId}:${clientIp(req)}`, 8, 60_000)
    if (rateLimitResponse1) return rateLimitResponse1

    const declaredLength = Number(req.headers.get("content-length") || 0)
    if (declaredLength > MAX_FILE_SIZE + 64 * 1024) {
      return NextResponse.json({ error: "File too large (max 5MB)" }, { status: 413 })
    }

    const formData = await req.formData()
    const file = formData.get("file")
    if (!(file instanceof File)) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 })
    }

    if (file.size === 0 || file.size > MAX_FILE_SIZE) {
      return NextResponse.json({ error: "File must be between 1 byte and 5MB" }, { status: 413 })
    }

    const buffer = Buffer.from(await file.arrayBuffer())
    const mimeType = detectImageType(buffer)
    if (!mimeType) {
      return NextResponse.json(
        { error: "Unsupported or invalid image. Upload a genuine JPEG, PNG, or WebP file." },
        { status: 415 },
      )
    }

    const dataUrl = `data:${mimeType};base64,${buffer.toString("base64")}`
    return NextResponse.json({ url: dataUrl, success: true }, { headers: { "Cache-Control": "no-store" } })
  } catch (err) {
    console.error("[Upload] Request failed")
    return NextResponse.json({ error: "Upload failed. Please try again." }, { status: 500 })
  }
}
