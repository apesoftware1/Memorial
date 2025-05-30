"use client"

import Link from "next/link"
import { ClientOnly } from "./client-only"
import { FavoritesCount } from "./favorites-count"

export function Navigation() {
  return (
    <nav className="flex items-center justify-between p-4 bg-white shadow-sm">
      <Link href="/" className="text-xl font-bold text-amber-600">
        TombstoneFinder.CO.ZA
      </Link>

      <div className="flex items-center space-x-4">
        <Link href="/tombstones-for-sale" className="text-gray-700 hover:text-amber-600">
          Tombstones
        </Link>
        <Link href="/tombstones-on-special" className="text-gray-700 hover:text-amber-600">
          Specials
        </Link>
        <Link href="/manufacturers" className="text-gray-700 hover:text-amber-600">
          Manufacturers
        </Link>
        <ClientOnly>
          <FavoritesCount />
        </ClientOnly>
      </div>
    </nav>
  )
}
