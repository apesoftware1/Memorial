import "./globals.css"
import { Inter } from "next/font/google"
import { ThemeProvider } from "@/components/theme-provider"
import { FavoritesProvider } from "@/context/favorites-context"
import Script from "next/script"
import PropTypes from "prop-types"
import { GA_MEASUREMENT_ID } from "@/lib/gtag"

const inter = Inter({ subsets: ["latin"] })

export const metadata = {
  title: "TombstoneFinder.CO.ZA - Find a Tombstone",
  description: "Find and compare tombstones from trusted manufacturers across South Africa",
}

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* Google Analytics */}
        <Script
          strategy="afterInteractive"
          src={`https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`}
        />
        <Script
          id="google-analytics"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', '${GA_MEASUREMENT_ID}', {
                page_path: window.location.pathname,
              });
            `,
          }}
        />
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
                return Promise.reject(new Error('ServiceWorker registration prevented by TombstoneFinder.CO.ZA'));
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

RootLayout.propTypes = {
  children: PropTypes.node.isRequired,
} 