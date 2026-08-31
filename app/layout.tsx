import type { Metadata, Viewport } from "next"
import { cookies } from "next/headers"
import { Sora, Inter, JetBrains_Mono, Instrument_Serif } from "next/font/google"
import { ThemeProvider } from "@/components/theme-provider"
import { AmbientBackground } from "@/components/ambient-background"
import { PageTransition } from "@/components/page-transition"
import { EntranceScreen } from "@/components/entrance-screen"
import { getFullUser } from "@/lib/session"
import type { ReactNode } from "react"
import "./globals.css"

const sora = Sora({
  subsets: ["latin"],
  variable: "--font-heading",
  display: "swap",
  weight: ["300", "400", "500", "600", "700"],
})

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
  weight: ["300", "400", "500", "600"],
})

const mono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  display: "swap",
  weight: ["400", "500"],
})

const instrument = Instrument_Serif({
  subsets: ["latin"],
  weight: "400",
  style: "italic",
  variable: "--font-serif",
  display: "swap",
})

export const metadata: Metadata = {
  metadataBase: new URL("https://www.lumoraai.in"),
  title: {
    default: "Lumora AI — AI Stock Analysis & Market Intelligence",
    template: "%s | Lumora AI",
  },
  description:
    "Analyze global stocks, Indian equities, NIFTY options, and market signals with AI-powered quantitative research, live charts, and technical intelligence.",
  keywords: [
    "Lumora AI",
    "AI stock analysis",
    "AI stock analyzer",
    "NIFTY option chain",
    "Indian stock market AI",
    "stock research AI",
    "quantitative technical analysis",
    "options analysis AI",
    "NSE BSE stock analysis",
  ],
  authors: [{ name: "Lumora AI Research", url: "https://www.lumoraai.in" }],
  creator: "Lumora AI",
  publisher: "Lumora AI",
  alternates: {
    canonical: "https://www.lumoraai.in",
  },
  icons: {
    icon: [
      { url: "/lumora-logo.png", type: "image/png" },
      { url: "/favicon.ico", sizes: "any" },
    ],
    shortcut: "/lumora-logo.png",
    apple: "/lumora-logo.png",
  },
  openGraph: {
    title: "Lumora AI — AI Stock Analysis & Market Intelligence",
    description:
      "Real-time market intelligence, institutional AI technical analysis, and multi-exchange option chains for global and Indian equities.",
    url: "https://www.lumoraai.in",
    siteName: "Lumora AI",
    locale: "en_US",
    type: "website",
    images: [
      {
        url: "https://www.lumoraai.in/lumora-logo.png",
        width: 1200,
        height: 630,
        alt: "Lumora AI — AI Stock Analysis & Market Intelligence",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Lumora AI — AI Stock Analysis & Market Intelligence",
    description:
      "Real-time market intelligence, institutional AI technical analysis, and multi-exchange option chains for global and Indian equities.",
    images: ["https://www.lumoraai.in/lumora-logo.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
}

const siteStructuredData = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      "@id": "https://www.lumoraai.in/#organization",
      name: "Lumora AI",
      url: "https://www.lumoraai.in",
      logo: {
        "@type": "ImageObject",
        "@id": "https://www.lumoraai.in/#logo",
        url: "https://www.lumoraai.in/lumora-logo.png",
        caption: "Lumora AI Logo",
      },
      description:
        "Lumora AI provides next-generation artificial intelligence for market intelligence, stock analysis, and multi-exchange derivative visualization.",
      contactPoint: {
        "@type": "ContactPoint",
        contactType: "customer support",
        email: "support@lumoraai.in",
      },
      sameAs: [
        "https://twitter.com/LumoraAI",
        "https://github.com/lumoraai",
      ],
    },
    {
      "@type": "WebSite",
      "@id": "https://www.lumoraai.in/#website",
      url: "https://www.lumoraai.in",
      name: "Lumora AI",
      publisher: {
        "@id": "https://www.lumoraai.in/#organization",
      },
      potentialAction: {
        "@type": "SearchAction",
        target: "https://www.lumoraai.in/markets?symbol={search_term_string}",
        "query-input": "required name=search_term_string",
      },
    },
    {
      "@type": "SoftwareApplication",
      "@id": "https://www.lumoraai.in/#software",
      name: "Lumora AI Terminal",
      applicationCategory: "FinanceApplication",
      operatingSystem: "Web",
      url: "https://www.lumoraai.in",
      offers: {
        "@type": "Offer",
        price: "0",
        priceCurrency: "USD",
        description: "Free tier with full AI stock analysis, interactive charts, and option chains.",
      },
      description:
        "Interactive financial intelligence platform providing AI technical analysis, indicators, and options strike discovery.",
    },
  ],
}

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f4f1ea" },
    { media: "(prefers-color-scheme: dark)", color: "#0c0d0f" },
  ],
}

export default async function RootLayout({
  children,
}: {
  children: ReactNode
}) {
  const cookieTheme = (await cookies()).get("lumora-theme")?.value
  const fullUser = await getFullUser().catch(() => null)

  let activeTheme: "dark" | "light" = "light"

  if (fullUser?.theme && (fullUser.theme === "dark" || fullUser.theme === "light")) {
    activeTheme = fullUser.theme as "dark" | "light"
  } else if (cookieTheme === "dark" || cookieTheme === "light") {
    activeTheme = cookieTheme as "dark" | "light"
  } else {
    activeTheme = "light"
  }

  return (
    <html
      lang="en"
      className={`${sora.variable} ${inter.variable} ${mono.variable} ${instrument.variable}`}
      suppressHydrationWarning
    >
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(siteStructuredData) }}
        />
      </head>
      <body className="antialiased" suppressHydrationWarning>
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=(document.cookie.match(/(?:^|; )lumora-theme=([^;]+)/)||[])[1]||localStorage.getItem("lumora-theme")||"${activeTheme}";if(t==="dark"){document.documentElement.classList.add("dark");document.documentElement.classList.add("dark-root");document.documentElement.classList.remove("light-root");}else{document.documentElement.classList.remove("dark");document.documentElement.classList.remove("dark-root");document.documentElement.classList.add("light-root");}}catch(e){}})();`,
          }}
        />
        <ThemeProvider initial={activeTheme}>
          <EntranceScreen />
          <AmbientBackground />
          <PageTransition>{children}</PageTransition>
        </ThemeProvider>
      </body>
    </html>
  )
}
