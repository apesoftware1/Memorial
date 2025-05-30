"use client"

import { useEffect, useState, type ReactNode } from "react"

export function ClientOnly({
  children,
  fallback = null,
}: {
  children: ReactNode
  fallback?: ReactNode
}) {
  // Use a ref to track if the component has mounted
  const [hasMounted, setHasMounted] = useState(false)

  useEffect(() => {
    // Set mounted state
    setHasMounted(true)

    // Cleanup function
    return () => {
      setHasMounted(false)
    }
  }, [])

  // If we're not mounted yet, return the fallback
  if (!hasMounted) {
    return <>{fallback}</>
  }

  // Otherwise, return children
  return <>{children}</>
}
