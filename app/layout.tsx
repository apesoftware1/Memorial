import type React from "react"
import "./globals.css"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import ApolloWrapper from "./ApolloWrapper";
import SessionWrapper from "./components/SessionWrapper";

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "MemorialHub - Find a Tombstone",
  description: "Find a fitting Tribute for your Loved One",
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.className} bg-gray-50`}>
        {/* Localize theme handling to regan-dashboard pages only */}
        <SessionWrapper>
          <ApolloWrapper>
            {children}
          </ApolloWrapper>
        </SessionWrapper>
      </body>
    </html>
  );
}
