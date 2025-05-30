"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { ChevronLeft, ChevronRight, Facebook, Twitter, Linkedin, Mail } from "lucide-react"
import { useFavorites } from "@/context/favorites-context"
import { ProductCard } from "@/components/product-card"

export function FavoritesClientContent() {
  const { favorites, totalFavorites } = useFavorites()
  const [isClient, setIsClient] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 6

  // Set client state
  useEffect(() => {
    setIsClient(true)
  }, [])

  // Don't render anything until client-side
  if (!isClient) {
    return (
      <div className="text-center py-12">
        <p>Loading favorites...</p>
      </div>
    )
  }

  // Calculate pagination
  const totalPages = Math.ceil(totalFavorites / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const currentFavorites = favorites.slice(startIndex, endIndex)

  const goToNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1)
    }
  }

  const goToPrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1)
    }
  }

  if (totalFavorites === 0) {
    return (
      <div className="text-center py-12 bg-gray-50 rounded-lg border border-gray-200">
        <div className="mb-4">
          <Image
            src="/placeholder.svg?height=100&width=100&text=Empty"
            alt="No favorites"
            width={100}
            height={100}
            className="mx-auto"
          />
        </div>
        <h2 className="text-xl font-semibold text-gray-700 mb-2">No Favourites Yet</h2>
        <p className="text-gray-600 mb-6 max-w-md mx-auto">
          Browse our tombstone listings and click the heart icon to add items to your favourites.
        </p>
        <Link
          href="/tombstones-for-sale"
          className="bg-amber-500 hover:bg-amber-600 text-white px-6 py-2 rounded-md transition-colors"
        >
          Browse Tombstones
        </Link>
      </div>
    )
  }

  return (
    <>
      <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-6">
        <h2 className="text-amber-800 font-semibold mb-2">FAVOURITES PAGE</h2>
        <p className="text-amber-700 text-sm">
          When searching for a tombstone, a browser can click the heart icon to add that particular tombstone to his or
          her FAVOURITES PAGE. This page is designed to list tombstones from those that the browser has shown interest
          in. This is for people who want to have a list of all the ones they fancy and bring them closer to making a
          decision.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 mb-8">
        {currentFavorites.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-between items-center">
          <button
            onClick={goToPrevPage}
            disabled={currentPage === 1}
            className="flex items-center text-gray-600 hover:text-amber-600 disabled:text-gray-400 disabled:cursor-not-allowed"
          >
            <ChevronLeft className="h-4 w-4 mr-1" />
            Previous
          </button>

          <div className="text-sm text-gray-600">
            Page {currentPage} of {totalPages}
          </div>

          <button
            onClick={goToNextPage}
            disabled={currentPage === totalPages}
            className="flex items-center text-gray-600 hover:text-amber-600 disabled:text-gray-400 disabled:cursor-not-allowed"
          >
            Next
            <ChevronRight className="h-4 w-4 ml-1" />
          </button>
        </div>
      )}

      <div className="mt-8 flex justify-center">
        <div className="flex items-center space-x-2">
          <span className="text-sm text-gray-600">Share with Friends</span>
          <div className="flex space-x-1">
            <button className="p-1 rounded-full bg-blue-600 text-white hover:bg-blue-700">
              <Facebook className="h-4 w-4" />
            </button>
            <button className="p-1 rounded-full bg-blue-400 text-white hover:bg-blue-500">
              <Twitter className="h-4 w-4" />
            </button>
            <button className="p-1 rounded-full bg-blue-700 text-white hover:bg-blue-800">
              <Linkedin className="h-4 w-4" />
            </button>
            <button className="p-1 rounded-full bg-red-500 text-white hover:bg-red-600">
              <Mail className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </>
  )
}
