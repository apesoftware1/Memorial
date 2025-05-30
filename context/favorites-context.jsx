"use client"

import { createContext, useContext, useState, useEffect } from "react"
import PropTypes from "prop-types"

// Type definitions for JSDoc
/**
 * @typedef {Object} FavoriteProduct
 * @property {string} id - The product ID
 * @property {string} name - The product name
 * @property {string} price - The product price
 * @property {string} material - The product material
 * @property {string} image - The product image URL
 */

const FavoritesContext = createContext()

/**
 * @param {Object} props
 * @param {React.ReactNode} props.children
 */
export function FavoritesProvider({ children }) {
  const [favorites, setFavorites] = useState([])
  const [totalFavorites, setTotalFavorites] = useState(0)

  useEffect(() => {
    // Load favorites from localStorage on mount
    const storedFavorites = localStorage.getItem("favorites")
    if (storedFavorites) {
      setFavorites(JSON.parse(storedFavorites))
      setTotalFavorites(JSON.parse(storedFavorites).length)
    }
  }, [])

  /**
   * @param {FavoriteProduct} product
   */
  const addToFavorites = (product) => {
    const newFavorites = [...favorites, product]
    setFavorites(newFavorites)
    setTotalFavorites(newFavorites.length)
    localStorage.setItem("favorites", JSON.stringify(newFavorites))
  }

  /**
   * @param {string} productId
   */
  const removeFromFavorites = (productId) => {
    const newFavorites = favorites.filter((item) => item.id !== productId)
    setFavorites(newFavorites)
    setTotalFavorites(newFavorites.length)
    localStorage.setItem("favorites", JSON.stringify(newFavorites))
  }

  /**
   * @param {string} productId
   * @returns {boolean}
   */
  const isFavorite = (productId) => {
    return favorites.some((item) => item.id === productId)
  }

  return (
    <FavoritesContext.Provider
      value={{
        favorites,
        totalFavorites,
        addToFavorites,
        removeFromFavorites,
        isFavorite,
      }}
    >
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