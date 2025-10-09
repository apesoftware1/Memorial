"use client"

import { useState, useEffect } from "react"
import { Heart } from "lucide-react"
import { useFavorites } from "@/context/favorites-context"

/**
 * @typedef {Object} FavoriteButtonProps
 * @property {string} productId - The ID of the product
 * @property {string} title - The title of the product
 * @property {string} price - The price of the product
 * @property {string} details - The details of the product
 * @property {string} image - The image URL of the product
 * @property {string} [manufacturer] - The manufacturer of the product
 * @property {string} [location] - The location of the product
 * @property {string} [tag] - The tag of the product
 * @property {string} [tagColor] - The tag color of the product
 */

/**
 * @param {FavoriteButtonProps} props
 */
export function FavoriteButton({ 
  productId, 
  title, 
  price, 
  details, 
  image,
  manufacturer,
  location,
  tag,
  tagColor
}) {
  const { isFavorite, addFavorite, removeFavorite } = useFavorites()
  const [isFavorited, setIsFavorited] = useState(false)

  useEffect(() => {
    setIsFavorited(isFavorite(productId))
  }, [isFavorite, productId])

  const toggleFavorite = (e) => {
    // Prevent event from bubbling up to parent elements
    e.preventDefault()
    e.stopPropagation()
    
    if (isFavorited) {
      removeFavorite(productId)
    } else {
      addFavorite({ 
        id: productId, 
        title, 
        price, 
        details, 
        image,
        manufacturer,
        location,
        tag,
        tagColor
      })
    }
    
    // No need to manually set state as it will update via the useEffect
  }

  return (
    <button
      onClick={toggleFavorite}
      aria-label={isFavorited ? "Remove from favorites" : "Add to favorites"}
      className={`p-2 rounded-full transition-colors ${
        isFavorited ? "text-amber-500" : "text-gray-400 hover:text-amber-500"
      }`}
    >
      <Heart size={20} fill={isFavorited ? "currentColor" : "none"} />
    </button>
  )
}
