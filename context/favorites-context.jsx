"use client"

import { createContext, useContext, useState, useEffect, useCallback, useMemo } from "react"
import PropTypes from "prop-types"

// Type definitions for JSDoc
/**
 * @typedef {Object} FavoriteProduct
 * @property {string} id - The product ID
 * @property {string} name - The product name
 * @property {string} price - The product price
 * @property {string} material - The product material
 * @property {string} image - The product image URL
 * @property {number} addedAt - Timestamp when added to favorites
 */

/**
 * @typedef {Object} FavoritesCache
 * @property {FavoriteProduct[]} data - The cached favorites data
 * @property {number} timestamp - When the cache was last updated
 * @property {number} version - Cache version for invalidation
 */

const FavoritesContext = createContext()

// Constants for cache management
const STORAGE_KEY = "favorites"
const CACHE_KEY = "favorites_cache"
const BACKUP_KEY = "favorites_backup"
const CACHE_DURATION = 24 * 60 * 60 * 1000 // 24 hours
const CACHE_VERSION = 1

// Utility functions for storage management
const storageUtils = {
  /**
   * Safely get data from localStorage with error handling
   * @param {string} key - Storage key
   * @param {any} defaultValue - Default value if key doesn't exist
   * @returns {any} Parsed data or default value
   */
  getItem: (key, defaultValue = null) => {
    try {
      if (typeof window === 'undefined') return defaultValue
      const item = localStorage.getItem(key)
      return item ? JSON.parse(item) : defaultValue
    } catch (error) {
      console.warn(`Failed to get ${key} from localStorage:`, error)
      return defaultValue
    }
  },

  /**
   * Safely set data to localStorage with error handling
   * @param {string} key - Storage key
   * @param {any} value - Value to store
   * @returns {boolean} Success status
   */
  setItem: (key, value) => {
    try {
      if (typeof window === 'undefined') return false
      localStorage.setItem(key, JSON.stringify(value))
      return true
    } catch (error) {
      console.warn(`Failed to set ${key} in localStorage:`, error)
      return false
    }
  },

  /**
   * Remove item from localStorage
   * @param {string} key - Storage key
   */
  removeItem: (key) => {
    try {
      if (typeof window === 'undefined') return
      localStorage.removeItem(key)
    } catch (error) {
      console.warn(`Failed to remove ${key} from localStorage:`, error)
    }
  },

  /**
   * Get available storage space (approximate)
   * @returns {number} Available space in bytes
   */
  getAvailableSpace: () => {
    try {
      if (typeof window === 'undefined') return 0
      const testKey = '__storage_test__'
      const testData = '0'.repeat(1024) // 1KB
      let size = 0
      
      while (size < 10240) { // Test up to 10MB
        try {
          localStorage.setItem(testKey, testData.repeat(size))
          size++
        } catch {
          break
        }
      }
      
      localStorage.removeItem(testKey)
      return size * 1024
    } catch {
      return 0
    }
  }
}

// Cache management utilities
const cacheUtils = {
  /**
   * Get cached favorites data
   * @returns {FavoriteProduct[]|null} Cached data or null if invalid
   */
  getCache: () => {
    const cache = storageUtils.getItem(CACHE_KEY)
    if (!cache || !cache.data || !cache.timestamp || cache.version !== CACHE_VERSION) {
      return null
    }
    
    // Check if cache is expired
    if (Date.now() - cache.timestamp > CACHE_DURATION) {
      storageUtils.removeItem(CACHE_KEY)
      return null
    }
    
    return cache.data
  },

  /**
   * Set cache data
   * @param {FavoriteProduct[]} data - Data to cache
   */
  setCache: (data) => {
    const cache = {
      data,
      timestamp: Date.now(),
      version: CACHE_VERSION
    }
    storageUtils.setItem(CACHE_KEY, cache)
  },

  /**
   * Clear cache
   */
  clearCache: () => {
    storageUtils.removeItem(CACHE_KEY)
  }
}

/**
 * @param {Object} props
 * @param {React.ReactNode} props.children
 */
export function FavoritesProvider({ children }) {
  const [favorites, setFavorites] = useState([])
  const [totalFavorites, setTotalFavorites] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)

  // Initialize favorites from storage
  useEffect(() => {
    const initializeFavorites = async () => {
      try {
        setIsLoading(true)
        setError(null)

        // Try to get from cache first
        let favoritesData = cacheUtils.getCache()
        
        if (!favoritesData) {
          // Fallback to localStorage
          favoritesData = storageUtils.getItem(STORAGE_KEY, [])
          
          // If we got data from localStorage, update cache
          if (favoritesData.length > 0) {
            cacheUtils.setCache(favoritesData)
          }
        }

        // Ensure all favorites have required fields
        const validatedFavorites = favoritesData.map(fav => ({
          ...fav,
          addedAt: fav.addedAt || Date.now()
        }))

        setFavorites(validatedFavorites)
        setTotalFavorites(validatedFavorites.length)

        // Create backup
        if (validatedFavorites.length > 0) {
          storageUtils.setItem(BACKUP_KEY, {
            data: validatedFavorites,
            timestamp: Date.now()
          })
        }

      } catch (err) {
        console.error('Failed to initialize favorites:', err)
        setError('Failed to load favorites')
        
        // Try to restore from backup
        const backup = storageUtils.getItem(BACKUP_KEY)
        if (backup && backup.data) {
          setFavorites(backup.data)
          setTotalFavorites(backup.data.length)
        }
      } finally {
        setIsLoading(false)
      }
    }

    initializeFavorites()
  }, [])

  // Sync favorites across tabs
  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key === STORAGE_KEY && e.newValue) {
        try {
          const newFavorites = JSON.parse(e.newValue)
          setFavorites(newFavorites)
          setTotalFavorites(newFavorites.length)
          cacheUtils.setCache(newFavorites)
        } catch (error) {
          console.warn('Failed to sync favorites across tabs:', error)
        }
      }
    }

    if (typeof window !== 'undefined') {
      window.addEventListener('storage', handleStorageChange)
      return () => window.removeEventListener('storage', handleStorageChange)
    }
  }, [])

  /**
   * Update storage with new favorites data
   * @param {FavoriteProduct[]} newFavorites - New favorites array
   */
  const updateStorage = useCallback((newFavorites) => {
    try {
      // Update localStorage
      const success = storageUtils.setItem(STORAGE_KEY, newFavorites)
      if (!success) {
        throw new Error('Failed to save to localStorage')
      }

      // Update cache
      cacheUtils.setCache(newFavorites)

      // Update backup periodically
      const lastBackup = storageUtils.getItem(BACKUP_KEY)
      if (!lastBackup || Date.now() - lastBackup.timestamp > 60000) { // 1 minute
        storageUtils.setItem(BACKUP_KEY, {
          data: newFavorites,
          timestamp: Date.now()
        })
      }

      setError(null)
    } catch (err) {
      console.error('Failed to update storage:', err)
      setError('Failed to save favorites')
    }
  }, [])

  /**
   * @param {FavoriteProduct} product
   */
  const addToFavorites = useCallback((product) => {
    try {
      const productWithTimestamp = {
        ...product,
        addedAt: Date.now()
      }
      
      const newFavorites = [...favorites, productWithTimestamp]
      setFavorites(newFavorites)
      setTotalFavorites(newFavorites.length)
      updateStorage(newFavorites)
    } catch (err) {
      console.error('Failed to add to favorites:', err)
      setError('Failed to add to favorites')
    }
  }, [favorites, updateStorage])

  /**
   * @param {string} productId
   */
  const removeFromFavorites = useCallback((productId) => {
    try {
      const newFavorites = favorites.filter((item) => item.id !== productId)
      setFavorites(newFavorites)
      setTotalFavorites(newFavorites.length)
      updateStorage(newFavorites)
    } catch (err) {
      console.error('Failed to remove from favorites:', err)
      setError('Failed to remove from favorites')
    }
  }, [favorites, updateStorage])

  /**
   * Clear all favorites
   */
  const clearAllFavorites = useCallback(() => {
    try {
      setFavorites([])
      setTotalFavorites(0)
      updateStorage([])
    } catch (err) {
      console.error('Failed to clear favorites:', err)
      setError('Failed to clear favorites')
    }
  }, [updateStorage])

  /**
   * @param {string} productId
   * @returns {boolean}
   */
  const isFavorite = useCallback((productId) => {
    return favorites.some((item) => item.id === productId)
  }, [favorites])

  /**
   * Get paginated favorites
   * @param {number} page - Page number (1-based)
   * @param {number} limit - Items per page
   * @returns {Object} Paginated results
   */
  const getPaginatedFavorites = useCallback((page = 1, limit = 12) => {
    const startIndex = (page - 1) * limit
    const endIndex = startIndex + limit
    const paginatedItems = favorites.slice(startIndex, endIndex)
    
    return {
      items: paginatedItems,
      currentPage: page,
      totalPages: Math.ceil(favorites.length / limit),
      totalItems: favorites.length,
      hasNextPage: endIndex < favorites.length,
      hasPrevPage: page > 1
    }
  }, [favorites])

  /**
   * Get favorites sorted by date added
   * @param {boolean} ascending - Sort order
   * @returns {FavoriteProduct[]} Sorted favorites
   */
  const getSortedFavorites = useCallback((ascending = false) => {
    return [...favorites].sort((a, b) => {
      const aTime = a.addedAt || 0
      const bTime = b.addedAt || 0
      return ascending ? aTime - bTime : bTime - aTime
    })
  }, [favorites])

  // Memoized context value to prevent unnecessary re-renders
  const contextValue = useMemo(() => ({
    favorites,
    totalFavorites,
    isLoading,
    error,
    addFavorite: addToFavorites,  // Alias for compatibility
    addToFavorites,
    removeFavorite: removeFromFavorites,  // Alias for compatibility
    removeFromFavorites,
    clearAllFavorites,
    isFavorite,
    getPaginatedFavorites,
    getSortedFavorites,
    // Utility functions
    refreshCache: () => cacheUtils.clearCache(),
    getStorageInfo: () => ({
      availableSpace: storageUtils.getAvailableSpace(),
      favoritesSize: JSON.stringify(favorites).length,
      cacheValid: !!cacheUtils.getCache()
    })
  }), [
    favorites,
    totalFavorites,
    isLoading,
    error,
    addToFavorites,
    removeFromFavorites,
    clearAllFavorites,
    isFavorite,
    getPaginatedFavorites,
    getSortedFavorites
  ])

  return (
    <FavoritesContext.Provider value={contextValue}>
      {children}
    </FavoritesContext.Provider>
  )
}

FavoritesProvider.propTypes = {
  children: PropTypes.node.isRequired,
}

export function useFavorites() {
  const context = useContext(FavoritesContext)
  if (context === undefined) {
    throw new Error("useFavorites must be used within a FavoritesProvider")
  }
  return context
}