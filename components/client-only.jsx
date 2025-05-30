"use client"

import { useEffect, useState } from "react"
import PropTypes from 'prop-types'

export function ClientOnly({ children, fallback = null }) {
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

ClientOnly.propTypes = {
  children: PropTypes.node.isRequired,
  fallback: PropTypes.node
} 