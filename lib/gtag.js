// Google Analytics measurement ID
// Paste your GA4 Measurement ID into NEXT_PUBLIC_GA_ID in .env.local
// Example:
// NEXT_PUBLIC_GA_ID=G-XXXXXXXXXX
export const GA_MEASUREMENT_ID = process.env.NEXT_PUBLIC_GA_ID

// Log page views
export const pageview = (url) => {
  if (typeof window !== 'undefined' && window.gtag && GA_MEASUREMENT_ID) {
    window.gtag('config', GA_MEASUREMENT_ID, {
      page_path: url,
    })
  }
}

// Log specific events
export const event = ({ action, category, label, value }) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', action, {
      event_category: category,
      event_label: label,
      value: value,
    })
  }
}