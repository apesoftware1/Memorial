"use client"

import Image from "next/image"
import Link from "next/link"
import { FavoriteButton } from "./favorite-button"
import { useFavorites } from "@/context/favorites-context"
import { formatPrice } from "@/lib/priceUtils"

/**
 * @typedef {Object} ProductCardProps
 * @property {string} id - The product ID
 * @property {string} name - The product name
 * @property {string} price - The product price
 * @property {string} material - The product material
 * @property {string} image - The product image URL
 * @property {string} [tag] - Optional tag for the product
 * @property {string} [details] - Optional details for the product
 */

/**
 * @param {ProductCardProps} props
 */
export function ProductCard({ id, name, price, material, image, tag, details }) {
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden transition-transform hover:shadow-lg">
      <Link href={`/product/${id}`} className="block">
        <div className="relative h-48 w-full">
          <Image 
            src={image || "/placeholder.jpg"} 
            alt={name}
            fill
            className="object-cover"
          />
          {tag && (
            <span className="absolute top-2 left-2 bg-red-600 text-white text-xs px-2 py-1 rounded">
              {tag}
            </span>
          )}
        </div>
        <div className="p-4">
          <h3 className="text-lg font-semibold text-gray-800 mb-1">{name}</h3>
          <p className="text-blue-600 font-bold mb-2">{formatPrice(price)}</p>
          {material && <p className="text-sm text-gray-600 mb-2">{material}</p>}
          {details && <p className="text-sm text-gray-500">{details}</p>}
        </div>
      </Link>
      <div className="px-4 pb-3">
        <FavoriteButton productId={id} />
      </div>
    </div>
  )
}
