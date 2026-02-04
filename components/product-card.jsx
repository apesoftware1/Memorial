"use client"

import Image from "next/image"
import Link from "next/link"
import { cloudinaryOptimized } from "@/lib/cloudinary"
import { FavoriteButton } from "./favorite-button"
import { useFavorites } from "@/context/favorites-context.jsx"
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
 * @param {ProductCardProps | {product: ProductCardProps}} props
 */
export function ProductCard(props) {
  // Handle both individual props and product object
  const product = props.product || props;
  const { id, name, price, material, image, tag, details } = product;

  // Ensure we have required fields
  if (!id || !name) {
    console.warn('ProductCard: Missing required fields (id, name)', product);
    return null;
  }

  return (
    <div 
      className="bg-white rounded-lg shadow-md overflow-hidden transition-transform hover:shadow-lg"
      onContextMenu={(e) => e.preventDefault()}
      onDragStart={(e) => e.preventDefault()}
    >
      <Link href={`/product/${id}`} className="block">
        <div className="relative h-48 w-full">
          <Image 
            src={cloudinaryOptimized(image, 400) || "/placeholder.jpg"} 
            alt={name}
            fill
            className="object-cover"
            unoptimized
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
        <FavoriteButton 
          product={product}
        />
      </div>
    </div>
  )
}

