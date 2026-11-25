import { NextRequest, NextResponse } from "next/server"

// Lightweight application-layer filter for common automated exploit probes.
// This complements (but does not replace) Vercel's edge Firewall/WAF rules.
const blockedPath = /(?:^|\/)(?:\.env(?:\.[^/]*)?|\.git|\.svn|wp-admin|wp-login\.php|xmlrpc\.php|phpmyadmin|pma|cgi-bin|vendor\/phpunit)(?:\/|$)/i

export function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname
  let decodedPath = pathname
  try {
    decodedPath = decodeURIComponent(pathname)
  } catch {
    return new NextResponse("Not Found", { status: 404, headers: { "Cache-Control": "no-store" } })
  }

  if (blockedPath.test(decodedPath) || /(?:^|\/)\.\.(?:\/|$)/.test(decodedPath) || decodedPath.includes("\\0")) {
    return new NextResponse("Not Found", {
      status: 404,
      headers: { "Cache-Control": "no-store", "X-Content-Type-Options": "nosniff" },
    })
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml).*)"],
}
