"use client"

import { useEffect, useState } from "react"
import { Heart } from "lucide-react"
import Link from "next/link"
import { useFavorites } from "@/context/favorites-context.jsx"

export function FavoritesCount() {
  const { totalFavorites } = useFavorites()
  const [count, setCount] = useState(0)
  const [isClient, setIsClient] = useState(false)

  // Handle client-side rendering and update count
  useEffect(() => {
    setIsClient(true)
    setCount(totalFavorites)
  }, [totalFavorites])

  // Don't render anything during SSR
  if (!isClient) return null
  
  // Don't show the count if there are no favorites
  if (count === 0) return null

  return (
    <Link 
      href="/favorites" 
      className="relative flex items-center justify-center transition-transform hover:scale-110"
      aria-label={`View your ${count} favorites`}
    >
      <Heart className="h-6 w-6 text-amber-500" />
      <span className="absolute -top-2 -right-2 flex h-5 w-5 items-center justify-center rounded-full bg-amber-500 text-xs font-bold text-white">
        {count}
      </span>
    </Link>
  )
}