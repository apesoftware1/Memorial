"use client"

import { useFavorites } from "@/context/favorites-context.jsx"
import Link from "next/link"
import Image from "next/image"
import { Heart, Trash2 } from "lucide-react"
import { cloudinaryOptimized } from "@/lib/cloudinary"

export function FavoritesContent() {
  const { favorites, removeFavorite, totalFavorites } = useFavorites()

  if (totalFavorites === 0) {
    return (
      <div className="text-center py-12">
        <Heart className="mx-auto h-16 w-16 text-gray-300 mb-4" />
        <h2 className="text-2xl font-semibold text-gray-700 mb-2">No favorites yet</h2>
        <p className="text-gray-500 mb-6">Start adding tombstones to your favorites to see them here</p>
        <Link
          href="/tombstones-for-sale"
          className="inline-block px-6 py-3 bg-amber-500 text-white rounded-md font-medium hover:bg-amber-600 transition-colors"
        >
          Browse Tombstones
        </Link>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {favorites.map((product) => (
        <div key={product.id} className="bg-white border border-gray-200 overflow-hidden hover:shadow-md transition-shadow relative">
          <Link href={`/tombstones-for-sale/${product.id}`}>
            {/* Image Container */}
            <div className="relative h-56 bg-gray-100">
              <Image 
                src={cloudinaryOptimized(product.image, 400) || "/placeholder.svg"} 
                alt={product.title} 
                fill 
                className="object-cover"
                unoptimized
              />
            </div>
            
            {/* Content */}
            <div className="p-4">
              {/* Product Title */}
              <h3 className="font-bold text-gray-800 mb-2 text-sm uppercase">
                {product.title}
              </h3>
              
              {/* Price */}
              <p className="font-bold text-blue-600 text-lg mb-2">
                {product.price}
              </p>
              
              {/* Product Details */}
              <p className="text-xs text-gray-600">
                {typeof product.details === 'string' 
                  ? product.details 
                  : product.details?.value || 
                    (product.details?.color?.value || product.details?.style?.value || product.details?.stoneType?.value || product.details?.customization?.value) ||
                    'Product Details'
                }
              </p>
            </div>
          </Link>
          
          {/* Remove Button */}
          <button
            onClick={() => removeFavorite(product.id)}
            className="absolute top-2 right-2 p-2 bg-white/80 rounded-full shadow-sm hover:bg-white transition-colors"
            aria-label="Remove from favorites"
          >
            <Trash2 className="h-5 w-5 text-red-500" />
          </button>
        </div>
      ))}
    </div>
  )
}