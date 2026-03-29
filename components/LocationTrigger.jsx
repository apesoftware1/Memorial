"use client"

import { useState, useEffect } from 'react'
import Image from 'next/image'
import { useGuestLocation } from '@/hooks/useGuestLocation'
import LocationPermissionModal from './LocationPermissionModal'

export default function LocationTrigger({ listing, className = "" }) {
  const { location, error, loading, refreshLocation } = useGuestLocation()
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [hasCheckedFirstVisit, setHasCheckedFirstVisit] = useState(false)

  // Auto-show modal on first visit if no location is set
  useEffect(() => {
    if (hasCheckedFirstVisit) return
    
    // Check if we're in the browser
    if (typeof window === 'undefined') return
    
    // Don't show if still loading
    if (loading) return
    
    // Don't show if location is already set
    if (location) {
      setHasCheckedFirstVisit(true)
      return
    }
    
    // Check if user has dismissed the modal before
    const hasDismissed = localStorage.getItem('locationModalDismissed')
    if (hasDismissed) {
      setHasCheckedFirstVisit(true)
      return
    }
    
    // Show modal after a short delay to ensure page is loaded
    const timer = setTimeout(() => {
      setIsModalOpen(true)
      setHasCheckedFirstVisit(true)
    }, 1500) // 1.5 second delay
    
    return () => clearTimeout(timer)
  }, [location, loading, hasCheckedFirstVisit])

  // Get coordinates from the listing or its company
  const listingLat = listing?.latitude || listing?.company?.latitude
  const listingLon = listing?.longitude || listing?.company?.longitude

  const handleLocationClick = (e) => {
    e.preventDefault()
    e.stopPropagation()
    e.nativeEvent.stopImmediatePropagation()
    setIsModalOpen(true)
  }

  const getDistanceText = () => {
    if (!listingLat || !listingLon) {
      return 'location not set'
    }
    
    if (location) {
      const toRad = (v) => (v * Math.PI) / 180
      const R = 6371
      const lat1 = Number(location.lat)
      const lon1 = Number(location.lng)
      const lat2 = Number(listingLat)
      const lon2 = Number(listingLon)
      if (Number.isFinite(lat1) && Number.isFinite(lon1) && Number.isFinite(lat2) && Number.isFinite(lon2)) {
        const dLat = toRad(lat2 - lat1)
        const dLon = toRad(lon2 - lon1)
        const a =
          Math.sin(dLat / 2) * Math.sin(dLat / 2) +
          Math.cos(toRad(lat1)) *
            Math.cos(toRad(lat2)) *
            Math.sin(dLon / 2) *
            Math.sin(dLon / 2)
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
        const km = R * c
        if (Number.isFinite(km)) return `${Math.round(km)} km from you`
      }
    }
    
    if (loading) {
      return 'detecting location...'
    }
    
    if (error) {
      return 'location error'
    }
    
    return 'from you'
  }

  return (
    <>
      <div 
        className={`flex items-center gap-1 text-xs text-blue-600 cursor-pointer hover:text-blue-700 transition-colors ${className}`}
        onClick={handleLocationClick}
        title="Click to set your location"
      >
        <Image
          src="/new files/newIcons/Google_Pin_Icon/GooglePin_Icon.svg"
          alt="Location Pin Icon"
          width={14}
          height={14}
          className="object-contain"
          style={{ width: "14px", height: "auto" }}
        />
        <span>{getDistanceText()}</span>
      </div>

      <LocationPermissionModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </>
  )
} 
