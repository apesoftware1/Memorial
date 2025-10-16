import type React from "react"
import "./globals.css"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import ApolloWrapper from "./ApolloWrapper";
import SessionWrapper from "./components/SessionWrapper";
import { FavoritesProvider } from "@/context/favorites-context.jsx";

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "TombstoneFinder - Find a Tombstone",
  description: "Find a fitting Tribute for your Loved One",
}

import { Toaster } from "@/components/ui/toaster";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.className} bg-gray-50`}>
        {/* Localize theme handling to regan-dashboard pages only */}
        <SessionWrapper>
          <ApolloWrapper>
            <FavoritesProvider>
              {children}
              <Toaster />
            </FavoritesProvider>
          </ApolloWrapper>
        </SessionWrapper>
      </body>
    </html>
  );
}
