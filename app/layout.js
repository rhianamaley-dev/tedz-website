/* ────────────────────────────────────────────
   ROOT LAYOUT
   Handles SEO, favicons, mobile icons, Open Graph,
   Twitter cards, structured data, and PWA basics.
   
   Place this file at: app/layout.js
   ──────────────────────────────────────────── */

export const metadata = {
  // ── Core SEO ──
  title: {
    default: "TEDZ Integrative Systems | AI Websites for Local Business",
    template: "%s | TEDZ Integrative Systems",
  },
  description:
    "We build, deploy, and manage AI-powered websites for local businesses. Capture leads, book appointments, and answer questions 24/7. Built for HVAC, roofing, plumbing, dental, and more.",

  // ── Keywords (Google ignores these but Bing, Yahoo, DuckDuckGo, Baidu still use them) ──
  keywords: [
    "TEDZ",
    "TEDZ Integrative Systems",
    "Tedz",
    "Ted",
    "AI chat for small business",
    "AI lead capture",
    "AI receptionist",
    "AI chatbot for website",
    "AI website builder",
    "24/7 lead capture",
    "HVAC AI chat",
    "HVAC website",
    "roofing website",
    "plumbing website",
    "dental AI chat",
    "small business AI",
    "automated lead capture",
    "AI website assistant",
    "lead capture software",
    "website for contractors",
    "website for plumbers",
    "website for roofers",
    "Texas AI chatbot",
    "Royse City AI",
    "DFW small business",
    "done for you website",
    "AI for trades",
    "blue collar AI",
    "service business website",
  ],

  // ── Author and publisher ──
  authors: [{ name: "TEDZ Integrative Systems" }],
  creator: "TEDZ Integrative Systems",
  publisher: "TEDZ Integrative Systems LLC",

  // ── Canonical URL ──
  metadataBase: new URL("https://tedzintegrativesystems.com"),
  alternates: {
    canonical: "/",
  },

  // ── Open Graph (Facebook, LinkedIn, WhatsApp, Slack, iMessage link previews) ──
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://tedzintegrativesystems.com",
    siteName: "TEDZ Integrative Systems",
    title: "TEDZ Integrative Systems | AI Websites for Local Business",
    description:
      "Stop losing leads while you're on the job. We build AI-powered websites that capture leads, book appointments, and answer questions 24/7.",
    images: [
      {
        url: "/tedz_og_1200x630.jpg",
        width: 1200,
        height: 630,
        alt: "TEDZ Integrative Systems — AI Websites for Local Business",
      },
    ],
  },

  // ── Twitter / X card ──
  twitter: {
    card: "summary_large_image",
    title: "TEDZ Integrative Systems | AI Websites for Local Business",
    description:
      "Stop losing leads while you're on the job. AI-powered websites that capture leads, book appointments, and answer questions 24/7.",
    images: ["/tedz_og_1200x630.jpg"],
  },

  // ── Search engine instructions ──
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

  // ── Favicons + Mobile Icons ──
  icons: {
    icon: [
      { url: "/tedz_favicon_32.png", sizes: "32x32", type: "image/png" },
      { url: "/tedz_favicon_64.png", sizes: "64x64", type: "image/png" },
      { url: "/tedz_favicon_256.png", sizes: "256x256", type: "image/png" },
    ],
    // Apple touch icon — this is what shows on iPhone/iPad home screens
    // and in Safari mobile tabs
    apple: [
      { url: "/tedz_favicon_256.png", sizes: "256x256", type: "image/png" },
    ],
    // Shortcut icon — fallback for older browsers
    shortcut: "/tedz_favicon_64.png",
  },

  // ── PWA / App-like behavior ──
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "TEDZ",
  },
  formatDetection: {
    telephone: true,
    email: true,
  },

  // ── Verification for search engines ──
  // Uncomment and add your verification codes when you register with each:
  // verification: {
  //   google: "your-google-verification-code",
  //   yandex: "your-yandex-verification-code",
  //   yahoo: "your-yahoo-verification-code",
  //   bing: "your-bing-verification-code",
  // },

  // ── Category ──
  category: "technology",
};

export default function RootLayout({ children }) {
  // ── Structured data (Schema.org) — helps ALL search engines show rich results ──
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "TEDZ Integrative Systems",
    alternateName: ["TEDZ", "Tedz", "Ted", "TEDZ AI"],
    url: "https://tedzintegrativesystems.com",
    logo: "https://tedzintegrativesystems.com/tedz_logo_transparent.png",
    description:
      "We build, deploy, and manage AI-powered websites for local service businesses. HVAC, roofing, plumbing, dental, and more. Capture every lead, book every appointment, answer every question 24/7.",
    sameAs: [
      // Add your social profiles here as you create them:
      // "https://www.linkedin.com/company/tedz-integrative-systems",
      // "https://twitter.com/tedzsystems",
      // "https://www.facebook.com/tedzsystems",
      // "https://www.instagram.com/tedzsystems",
    ],
    address: {
      "@type": "PostalAddress",
      addressLocality: "Royse City",
      addressRegion: "TX",
      addressCountry: "US",
    },
    contactPoint: {
      "@type": "ContactPoint",
      contactType: "Sales",
      email: "info@tedzintegrativesystems.com",
      availableLanguage: "English",
    },
  };

  const serviceLd = {
    "@context": "https://schema.org",
    "@type": "Service",
    serviceType: "AI Website and Lead Capture Platform",
    provider: {
      "@type": "Organization",
      name: "TEDZ Integrative Systems",
    },
    areaServed: {
      "@type": "Country",
      name: "United States",
    },
    description:
      "Done-for-you AI-powered websites for local businesses. Custom branded, mobile-first, with a 24/7 AI chat assistant that captures leads and books appointments.",
    offers: {
      "@type": "Offer",
      availability: "https://schema.org/InStock",
    },
  };

  return (
    <html lang="en">
      <head>
        {/* Theme color for mobile browser chrome (address bar color) */}
        <meta name="theme-color" content="#0a0a0a" />
        <meta name="msapplication-TileColor" content="#0a0a0a" />
        <meta name="msapplication-TileImage" content="/tedz_favicon_256.png" />

        {/* Structured data for search engines */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(serviceLd) }}
        />
      </head>
      <body style={{ margin: 0, padding: 0 }}>{children}</body>
    </html>
  );
}