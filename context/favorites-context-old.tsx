"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"

// Define the product type
export type FavoriteProduct = {
  id: string
  title: string
  price: string
  image: string
  details: string
  features?: string
  manufacturer?: string
  location?: string
  tag?: string
  tagColor?: string
  colour?: { [key: string]: boolean }
}

type FavoritesContextType = {
  favorites: FavoriteProduct[]
  addFavorite: (product: FavoriteProduct) => void
  removeFavorite: (productId: string) => void
  isFavorite: (productId: string) => boolean
  totalFavorites: number
}

// Create a default context value
const defaultContextValue: FavoritesContextType = {
  favorites: [],
  addFavorite: () => {},
  removeFavorite: () => {},
  isFavorite: () => false,
  totalFavorites: 0,
}

const FavoritesContext = createContext<FavoritesContextType>(defaultContextValue)

// Safe localStorage wrapper functions
const safeGetItem = (key: string): string | null => {
  if (typeof window === "undefined") return null
  try {
    return localStorage.getItem(key)
  } catch (error) {
    console.error("Error accessing localStorage:", error)
    return null
  }
}

const safeSetItem = (key: string, value: string): boolean => {
  if (typeof window === "undefined") return false
  try {
    localStorage.setItem(key, value)
    return true
  } catch (error) {
    console.error("Error writing to localStorage:", error)
    return false
  }
}

export function FavoritesProvider({ children }: { children: ReactNode }) {
  // Initialize with empty array
  const [favorites, setFavorites] = useState<FavoriteProduct[]>([])
  const [isInitialized, setIsInitialized] = useState(false)

  // Load favorites from localStorage only once after component mounts
  useEffect(() => {
    // Skip if already initialized or not in browser
    if (isInitialized || typeof window === "undefined") return
    
    const storedFavorites = safeGetItem("tombstoneFinderFavorites")
    if (storedFavorites) {
      try {
        const parsedFavorites = JSON.parse(storedFavorites)
        if (Array.isArray(parsedFavorites)) {
          setFavorites(parsedFavorites)
        }
      } catch (error) {
        console.error("Failed to parse favorites:", error)
      }
    }

    setIsInitialized(true)
  }, [isInitialized])

  // Save favorites to localStorage whenever they change
  useEffect(() => {
    // Only save if initialized and in browser
    if (!isInitialized || typeof window === "undefined") return

    safeSetItem("tombstoneFinderFavorites", JSON.stringify(favorites))
  }, [favorites, isInitialized])

  const addFavorite = (product: FavoriteProduct) => {
    setFavorites((prev) => {
      // Check if product already exists in favorites
      if (prev.some((item) => item.id === product.id)) {
        return prev
      }
      return [...prev, product]
    })
  }

  const removeFavorite = (productId: string) => {
    setFavorites((prev) => prev.filter((item) => item.id !== productId))
  }

  const isFavorite = (productId: string) => {
    return favorites.some((item) => item.id === productId)
  }

  return (
    <FavoritesContext.Provider
      value={{
        favorites,
        addFavorite,
        removeFavorite,
        isFavorite,
        totalFavorites: favorites.length,
      }}
    >
      {children}
    </FavoritesContext.Provider>
  )
}

export function useFavorites() {
  return useContext(FavoritesContext)
}