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
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "Access-Control-Allow-Origin", value: "*" },
          { key: "Access-Control-Allow-Methods", value: "GET,OPTIONS,PATCH,DELETE,POST,PUT" },
          { key: "Access-Control-Allow-Headers", value: "X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version" },
        ],
      },
    ]
  },
}

// Build-time env diagnostic — logs SMTP key names only (never values)
const smtpKeys = Object.keys(process.env).filter((key) => key.startsWith("SMTP"))
console.log("[BUILD:DENV] SMTP keys present:", JSON.stringify(smtpKeys))
console.log("[BUILD:DENV] VERCEL_ENV:", process.env.VERCEL_ENV ?? "not set")
console.log("[BUILD:DENV] NODE_ENV:", process.env.NODE_ENV ?? "not set")

export default nextConfig
