import type React from "react"
import "@/styles/globals.css"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import { ThemeProvider } from "@/components/theme-provider"
import { FavoritesProvider } from "@/context/favorites-context"
import Script from "next/script"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "MemorialHub - Find a Tombstone",
  description: "Find a fitting Tribute for your Loved One",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* Prevent service worker registration */}
        <Script id="disable-service-worker" strategy="beforeInteractive">
          {`
            // Immediately unregister any existing service workers
            if ('serviceWorker' in navigator) {
              navigator.serviceWorker.getRegistrations().then(function(registrations) {
                for(let registration of registrations) {
                  registration.unregister();
                  console.log('ServiceWorker unregistered');
                }
              }).catch(function(err) {
                console.log('ServiceWorker unregistration failed: ', err);
              });
              
              // Override the register function to prevent new registrations
              const originalRegister = navigator.serviceWorker.register;
              navigator.serviceWorker.register = function() {
                console.log('ServiceWorker registration prevented');
                return Promise.reject(new Error('ServiceWorker registration prevented by MemorialHub'));
              };
            }
          `}
        </Script>
      </head>
      <body className={inter.className}>
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem disableTransitionOnChange>
          <FavoritesProvider>{children}</FavoritesProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
