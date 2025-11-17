'use client'

import { useAnalytics } from '@/hooks/useAnalytics'

export default function GAEvents() {
  // Track page views on client-side route changes in App Router
  useAnalytics()
  return null
}