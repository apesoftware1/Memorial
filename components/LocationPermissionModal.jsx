"use client"

import { useState, useEffect } from 'react'
import Image from 'next/image'
import { X, MapPin, Loader, Navigation } from 'lucide-react'
import { useGuestLocation } from '@/hooks/useGuestLocation'

export default function LocationPermissionModal({ isOpen, onClose }) {
  const { location, error, loading, calculateDistanceFrom } = useGuestLocation()

  const [showManualInput, setShowManualInput] = useState(false)
  const [manualLocationInput, setManualLocationInput] = useState('')
  const [showSuccess, setShowSuccess] = useState(false)

  // Close modal when location is successfully detected
  useEffect(() => {
    if (location && isOpen && !loading) {
      setShowSuccess(true)
      setTimeout(() => {
        onClose()
        setShowSuccess(false)
      }, 1000) // Small delay to show success
    }
  }, [location, isOpen, loading, onClose])

  const handleDetectLocation = () => {
    // The hook will automatically detect location
    // We just need to wait for it to complete
  }

  const handleManualLocation = () => {
    if (manualLocationInput.trim()) {
      // For manual location, we'll store it in a different format
      const manualLocation = {
        lat: null,
        lng: null,
        manual: true,
        locationName: manualLocationInput.trim()
      }
      
      // Check if we're in the browser before accessing localStorage
      if (typeof window !== 'undefined') {
        localStorage.setItem('guestLocation', JSON.stringify(manualLocation))
      }
      
      // Close the modal
      onClose()
    }
  }

  const handleClose = (e) => {
    e.preventDefault()
    e.stopPropagation()
    onClose()
  }

  if (!isOpen) return null

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
      onClick={(e) => {
        e.preventDefault()
        e.stopPropagation()
        onClose()
      }}
    >
      <div 
        className="bg-white rounded-lg shadow-xl max-w-md w-full"
        onClick={(e) => {
          e.preventDefault()
          e.stopPropagation()
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <div className="flex items-center gap-2">
            <Navigation className="h-5 w-5 text-blue-600" />
            <span className="font-semibold text-gray-900">Set Your Location</span>
          </div>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4">
          <div className="mb-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Welcome to TombstoneFinder</h3>
            <p className="text-sm text-gray-600 mb-3">
              To see accurate distances from manufacturers and get the best experience, please set your current location.
            </p>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
              <div className="flex items-start gap-2">
                <MapPin className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                <div className="text-sm text-blue-800">
                  <p className="font-medium">Distance Calculations</p>
                  <p className="text-xs mt-1">We'll use your location to calculate distances from manufacturer locations and show you the closest options.</p>
                </div>
              </div>
            </div>
          </div>
          
          {/* Manual Input */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Enter your suburb or city
            </label>
            <div className="relative">
              <input
                type="text"
                placeholder="e.g., Pretoria, Johannesburg, Cape Town"
                value={manualLocationInput}
                onChange={(e) => setManualLocationInput(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
                <MapPin className="h-4 w-4 text-gray-400" />
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-3">
            <button
              onClick={handleDetectLocation}
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 text-blue-600 hover:text-blue-700 text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed py-2 border border-blue-200 rounded-lg hover:bg-blue-50 transition-colors"
            >
              {loading ? (
                <>
                  <Loader className="h-4 w-4 animate-spin" />
                  Detecting your location...
                </>
              ) : (
                <>
                  <Navigation className="h-4 w-4" />
                  Detect my location automatically
                </>
              )}
            </button>

            <button
              onClick={handleManualLocation}
              disabled={!manualLocationInput.trim()}
              className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Set My Location
            </button>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          {/* Success Message */}
          {showSuccess && (
            <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded-lg">
              <p className="text-sm text-green-600">Location set successfully! You can now see distances from manufacturers.</p>
            </div>
          )}

          {/* Browser Support Message */}
          {!navigator.geolocation && (
            <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="text-sm text-yellow-700">
                Location detection is not supported in your browser. Please enter your location manually above.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
} 