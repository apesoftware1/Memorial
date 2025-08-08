"use client"

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'

export function useManufacturerLocation(company, onCompanyUpdate) {
  const { data: session } = useSession()
  const [showLocationModal, setShowLocationModal] = useState(false)
  const [hasCheckedLocation, setHasCheckedLocation] = useState(false)

  // Check if location is properly set
  const isLocationSet = (company) => {
    if (!company) return false
    
    // Check if location field exists and is not empty
    const hasLocation = company.location && company.location.trim() !== ''
    
    // Optionally check for coordinates (for more accurate distance calculations)
    const hasCoordinates = company.latitude && company.longitude
    
    return hasLocation // For now, just require location text. Add hasCoordinates for stricter validation
  }

  // Check location on mount and when company data changes
  useEffect(() => {
    if (!session || !company || hasCheckedLocation) return

    const locationIsSet = isLocationSet(company)
    
    if (!locationIsSet) {
      // Show modal after a short delay to ensure page is loaded
      const timer = setTimeout(() => {
        setShowLocationModal(true)
      }, 1000)
      
      return () => clearTimeout(timer)
    }
    
    setHasCheckedLocation(true)
  }, [session, company?.documentId, hasCheckedLocation]) // Use company.documentId instead of whole company object

  const handleLocationUpdate = (updatedCompany) => {
    setShowLocationModal(false)
    setHasCheckedLocation(true)
    
    // Call the callback to update parent component
    if (onCompanyUpdate) {
      onCompanyUpdate(updatedCompany)
    }
  }

  const openLocationModal = () => {
    setShowLocationModal(true)
  }

  const closeLocationModal = () => {
    setShowLocationModal(false)
    setHasCheckedLocation(true)
  }

  return {
    showLocationModal,
    openLocationModal,
    closeLocationModal,
    handleLocationUpdate,
    isLocationSet: isLocationSet(company)
  }
} 