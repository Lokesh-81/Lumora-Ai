import type { MetadataRoute } from "next"
import { TOP_CANONICAL_CONTRACT_SLUGS } from "@/lib/contract-seo"

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = "https://www.lumoraai.in"
  const lastModified = new Date("2026-08-27")

  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: `${baseUrl}/`,
      lastModified,
      changeFrequency: "daily",
      priority: 1.0,
    },
    {
      url: `${baseUrl}/markets`,
      lastModified,
      changeFrequency: "hourly",
      priority: 0.9,
    },
    {
      url: `${baseUrl}/ai-stock-analysis`,
      lastModified,
      changeFrequency: "weekly",
      priority: 0.9,
    },
    {
      url: `${baseUrl}/ai-stock-analyzer`,
      lastModified,
      changeFrequency: "weekly",
      priority: 0.9,
    },
    {
      url: `${baseUrl}/ai-stock-research`,
      lastModified,
      changeFrequency: "weekly",
      priority: 0.9,
    },
    {
      url: `${baseUrl}/options-analysis`,
      lastModified,
      changeFrequency: "weekly",
      priority: 0.9,
    },
    {
      url: `${baseUrl}/indian-stock-market-ai`,
      lastModified,
      changeFrequency: "weekly",
      priority: 0.9,
    },
    {
      url: `${baseUrl}/nifty-50-ai-analysis`,
      lastModified,
      changeFrequency: "weekly",
      priority: 0.9,
    },
    {
      url: `${baseUrl}/faq`,
      lastModified,
      changeFrequency: "weekly",
      priority: 0.8,
    },
    {
      url: `${baseUrl}/about`,
      lastModified,
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      url: `${baseUrl}/privacy`,
      lastModified,
      changeFrequency: "monthly",
      priority: 0.4,
    },
    {
      url: `${baseUrl}/terms`,
      lastModified,
      changeFrequency: "monthly",
      priority: 0.4,
    },
  ]

  const contractRoutes: MetadataRoute.Sitemap = TOP_CANONICAL_CONTRACT_SLUGS.map((c) => ({
    url: `${baseUrl}/options/${c.underlying}/${c.contract}`,
    lastModified,
    changeFrequency: "daily",
    priority: 0.8,
  }))

  return [...staticRoutes, ...contractRoutes]
}
