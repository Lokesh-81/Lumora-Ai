import type { MetadataRoute } from "next"

export default function robots(): MetadataRoute.Robots {
  const baseUrl = "https://www.lumoraai.in"

  return {
    rules: [
      {
        userAgent: "*",
        allow: [
          "/",
          "/markets",
          "/ai-stock-analysis",
          "/options-analysis",
          "/indian-stock-market-ai",
          "/about",
          "/faq",
          "/privacy",
          "/terms",
        ],
        disallow: [
          "/api/",
          "/dashboard/",
          "/portfolio/",
          "/watchlist/",
          "/trade-planner/",
          "/activity/",
          "/profile/",
          "/saved-analysis/",
          "/admin/",
          "/chat/",
          "/compare/",
          "/notifications/",
          "/login",
          "/sign-up",
          "/forgot-password",
          "/reset-password",
        ],
      },
      {
        userAgent: ["Googlebot", "Bingbot", "Google-Extended", "GPTBot", "PerplexityBot", "ClaudeBot", "Applebot-Extended"],
        allow: [
          "/",
          "/markets",
          "/ai-stock-analysis",
          "/options-analysis",
          "/indian-stock-market-ai",
          "/about",
          "/faq",
          "/privacy",
          "/terms",
        ],
        disallow: [
          "/api/",
          "/dashboard/",
          "/portfolio/",
          "/watchlist/",
          "/trade-planner/",
          "/activity/",
          "/profile/",
          "/saved-analysis/",
          "/admin/",
          "/chat/",
          "/compare/",
        ],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
    host: baseUrl,
  }
}
