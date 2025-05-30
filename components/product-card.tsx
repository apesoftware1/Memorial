"use client"

import Image from "next/image"
import Link from "next/link"
import { FavoriteButton } from "./favorite-button"
import type { FavoriteProduct } from "@/context/favorites-context"

type ProductCardProps = {
  product: FavoriteProduct
  href?: string
}

export function ProductCard({ product, href = "#" }: ProductCardProps) {
  // Ensure product has an id
  const productWithId = {
    ...product,
    id: product.id || product.title.replace(/\s+/g, "-").toLowerCase(),
  }

  return (
    <div className="border border-gray-300 rounded bg-white overflow-hidden hover:shadow-md transition-shadow">
      <Link href={href} className="block">
        <div className="relative h-48">
          <Image src={product.image || "/placeholder.svg"} alt={product.title} fill className="object-cover" />
          <div className="absolute top-2 right-2">
            <FavoriteButton product={productWithId} />
          </div>
        </div>
        <div className="p-3">
          <div className="flex justify-between items-center mb-2">
            <p className="font-bold text-blue-800">{product.price}</p>
            <span className="bg-green-500 text-white text-xs px-2 py-1 rounded">{product.tag}</span>
          </div>
          <h4 className="font-bold text-gray-800 mb-1">{product.title}</h4>
          <p className="text-xs text-gray-600">{product.details}</p>
        </div>
      </Link>
    </div>
  )
}
