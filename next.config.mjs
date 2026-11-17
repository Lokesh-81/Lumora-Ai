/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: false,
  },
  images: {
    unoptimized: true,
    remotePatterns: [{ protocol: "https", hostname: "**" }],
  },
  allowedDevOrigins: [
    "localhost:3000",
    "*.run.app",
    "*.google.com",
    "*.aistudio.google.com",
    "*.googleusercontent.com",
    "ais-dev-nayfrieg7sduc55hfultrv-1073623778064.asia-southeast1.run.app",
    "ais-pre-nayfrieg7sduc55hfultrv-1073623778064.asia-southeast1.run.app",
  ],
  // Lumora is a same-origin web application. Do not emit wildcard CORS
  // headers: they unnecessarily expose API responses to arbitrary websites.
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "DENY" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), payment=()" },
          { key: "Cross-Origin-Opener-Policy", value: "same-origin" },
          { key: "X-Permitted-Cross-Domain-Policies", value: "none" },
          { key: "X-DNS-Prefetch-Control", value: "off" },
          { key: "Origin-Agent-Cluster", value: "?1" },
          { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
        ],
      },
      {
        source: "/api/:path*",
        headers: [
          { key: "Cache-Control", value: "no-store" },
          { key: "X-Robots-Tag", value: "noindex, nofollow" },
        ],
      },
    ]
  },
}


export default nextConfig
