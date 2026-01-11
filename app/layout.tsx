import type React from "react"
import { Suspense } from 'react'
import "./globals.css"
import type { Metadata } from "next"
import Script from 'next/script'
import { Inter } from "next/font/google"
import ApolloWrapper from "./ApolloWrapper";
import SessionWrapper from "./components/SessionWrapper";
import { FavoritesProvider } from "@/context/favorites-context.jsx";

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3001"),
  title: {
    default: "TombstoneFinder – Find Tombstones Near You",
    template: "%s | TombstoneFinder",
  },
  description: "Discover tombstones, compare prices, and find local manufacturers.",
  keywords: [
    "tombstones",
    "gravestones",
    "headstones",
    "memorials",
    "monuments",
    "finder",
    "South Africa",
    "burial",
    "cemetery",
  ],
  authors: [{ name: "TombstoneFinder" }],
  creator: "TombstoneFinder",
  publisher: "TombstoneFinder",
  alternates: {
    canonical: "/",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      noimageindex: false,
      maxSnippet: -1,
      maxImagePreview: "large",
      maxVideoPreview: -1,
    },
  },
  openGraph: {
    type: "website",
    siteName: "TombstoneFinder",
    title: "TombstoneFinder – Find Tombstones Near You",
    description: "Discover tombstones, compare prices, and find local manufacturers.",
    url: process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3001",
    images: [
      {
        url:
          (process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3001") +
          "/og-image.png",
        width: 1200,
        height: 630,
        alt: "TombstoneFinder preview",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "TombstoneFinder – Find Tombstones Near You",
    description: "Discover tombstones, compare prices, and find local manufacturers.",
    images: [
      (process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3001") +
        "/og-image.png",
    ],
    creator: "@TombstoneFinder",
  },
  icons: {
    icon: "/icon.svg",
  },
}

import { Toaster } from "@/components/ui/toaster";
import GAEvents from './components/GAEvents'
import ImageProtection from "@/components/ImageProtection";
import MaintenanceBanner from "@/components/MaintenanceBanner";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* Preconnect to media origins to speed up image loading */}
        <link rel="preconnect" href="https://typical-car-e0b66549b3.media.strapiapp.com" crossOrigin="anonymous" />
        <link rel="preconnect" href="https://res.cloudinary.com" crossOrigin="anonymous" />
        {/* Google Analytics – paste your GA4 Measurement ID in NEXT_PUBLIC_GA_ID inside .env.local */}
        <Script
          src={`https://www.googletagmanager.com/gtag/js?id=${process.env.NEXT_PUBLIC_GA_ID ?? 'G-PASTE_MEASUREMENT_ID_HERE'}`}
          strategy="afterInteractive"
        />
        <Script id="ga-init" strategy="afterInteractive">
          {`
            // Paste your GA4 Measurement ID into NEXT_PUBLIC_GA_ID in .env.local
            // Example:
            // NEXT_PUBLIC_GA_ID=G-XXXXXXXXXX
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', '${process.env.NEXT_PUBLIC_GA_ID ?? 'G-PASTE_MEASUREMENT_ID_HERE'}', {
              page_path: window.location.pathname,
            });
          `}
        </Script>
      </head>
      <body className={inter.className}>
        <ImageProtection />
        <SessionWrapper>
          <ApolloWrapper>
            <FavoritesProvider>
              {children}
            </FavoritesProvider>
          </ApolloWrapper>
        </SessionWrapper>
        <Toaster />
        <Suspense fallback={null}>
          <GAEvents />
        </Suspense>
      </body>
    </html>
  )
}