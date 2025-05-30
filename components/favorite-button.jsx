/*
 * This file is temporarily disabled as it's not part of the homepage functionality
 * Original file: [filename]
 * Disabled on: [date]
 */

"use client"

import { useState, useEffect } from "react"
import { Heart } from "lucide-react"
import { useFavorites } from "@/context/favorites-context"

/**
 * @typedef {Object} FavoriteButtonProps
 * @property {string} productId - The ID of the product
 * @property {string} name - The name of the product
 * @property {string} price - The price of the product
 * @property {string} material - The material of the product
 * @property {string} image - The image URL of the product
 */

/**
 * @param {FavoriteButtonProps} props
 */
export function FavoriteButton({ productId, name, price, material, image }) {
  const { isFavorite, addToFavorites, removeFromFavorites } = useFavorites()
  const [isFavorited, setIsFavorited] = useState(false)

  useEffect(() => {
    setIsFavorited(isFavorite(productId))
  }, [isFavorite, productId])

  const toggleFavorite = () => {
    if (isFavorited) {
      removeFromFavorites(productId)
    } else {
      addToFavorites({ id: productId, name, price, material, image })
    }
    setIsFavorited(!isFavorited)
  }

  return (
    <button
      onClick={toggleFavorite}
      className={`p-2 rounded-full transition-colors ${
        isFavorited ? "text-red-500" : "text-gray-400 hover:text-red-500"
      }`}
    >
      <Heart size={20} fill={isFavorited ? "currentColor" : "none"} />
    </button>
  )
}
