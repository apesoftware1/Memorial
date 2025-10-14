"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Heart } from "lucide-react"
import { useFavorites, type FavoriteProduct } from "@/context/favorites-context.jsx"

type FavoriteButtonProps = {
  product: FavoriteProduct
  className?: string
  size?: "sm" | "md" | "lg"
}

export function FavoriteButton({ product, className = "", size = "md" }: FavoriteButtonProps) {
  const { isFavorite, addFavorite, removeFavorite } = useFavorites()
  const [isClient, setIsClient] = useState(false)
  const [isFav, setIsFav] = useState(false)

  // Set client state and check favorite status
  useEffect(() => {
    setIsClient(true)
    setIsFav(isFavorite(product.id))
  }, [isFavorite, product.id])

  // Update favorite status when it changes in context
  useEffect(() => {
    if (isClient) {
      setIsFav(isFavorite(product.id))
    }
  }, [isClient, isFavorite, product.id])

  const handleToggleFavorite = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()

    if (!isClient) return

    if (isFav) {
      removeFavorite(product.id)
      setIsFav(false)
    } else {
      addFavorite(product)
      setIsFav(true)
    }
  }

  const sizeClasses = {
    sm: "h-4 w-4",
    md: "h-5 w-5",
    lg: "h-6 w-6",
  }

  // Don't render anything until client-side
  if (!isClient) return null

  return (
    <button
      onClick={handleToggleFavorite}
      className={`bg-white hover:bg-gray-100 rounded-full p-1 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-300 ${className}`}
      aria-label={isFav ? "Remove from favorites" : "Add to favorites"}
    >
      <Heart
        className={`${sizeClasses[size]} transition-colors ${isFav ? "text-red-500 fill-red-500" : "text-gray-400"}`}
        strokeWidth={3}
      />
    </button>
  )
}
