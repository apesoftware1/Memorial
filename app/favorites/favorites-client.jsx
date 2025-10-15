"use client"

import { useState, useEffect, useMemo, useCallback } from "react"
import Link from "next/link"
import Image from "next/image"
import { Facebook, Twitter, Linkedin, Mail, Loader2, AlertCircle, RefreshCw, Trash2, MessageCircle, Instagram } from "lucide-react"
import { useFavorites } from "@/context/favorites-context.jsx"
import { ConfirmationModal } from "@/components/ConfirmationModal.jsx"

// Constants for pagination
const ITEMS_PER_PAGE = 12
const MOBILE_ITEMS_PER_PAGE = 6

export function FavoritesClientContent() {
  const { 
    favorites, 
    totalFavorites, 
    isLoading, 
    error, 
    getSortedFavorites,
    clearAllFavorites,
    refreshCache,
    removeFavorite
  } = useFavorites()

  const [currentPage, setCurrentPage] = useState(1)
  const [sortOrder, setSortOrder] = useState('newest') // 'newest', 'oldest', 'name'
  const [isMobile, setIsMobile] = useState(false)
  const [showClearConfirmation, setShowClearConfirmation] = useState(false)

  // Detect mobile screen size
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }
    
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  // Reset to first page when favorites change
  useEffect(() => {
    setCurrentPage(1)
  }, [totalFavorites, sortOrder])

  // Get items per page based on screen size
  const itemsPerPage = useMemo(() => {
    return isMobile ? MOBILE_ITEMS_PER_PAGE : ITEMS_PER_PAGE
  }, [isMobile])

  // Get sorted favorites based on current sort order
  const sortedFavorites = useMemo(() => {
    switch (sortOrder) {
      case 'oldest':
        return getSortedFavorites(true)
      case 'newest':
        return getSortedFavorites(false)
      case 'name':
        return [...favorites].sort((a, b) => {
          const nameA = a.title || a.name || ''
          const nameB = b.title || b.name || ''
          return nameA.localeCompare(nameB)
        })
      default:
        return favorites
    }
  }, [favorites, sortOrder, getSortedFavorites])

  // Get paginated data
  const paginationData = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage
    const endIndex = startIndex + itemsPerPage
    const paginatedItems = sortedFavorites.slice(startIndex, endIndex)
    
    return {
      items: paginatedItems,
      currentPage,
      totalPages: Math.ceil(sortedFavorites.length / itemsPerPage),
      totalItems: sortedFavorites.length,
      hasNextPage: endIndex < sortedFavorites.length,
      hasPrevPage: currentPage > 1
    }
  }, [sortedFavorites, currentPage, itemsPerPage])

  // Navigation handlers
  const goToNextPage = useCallback(() => {
    if (paginationData.hasNextPage) {
      setCurrentPage(prev => prev + 1)
      // Scroll to top on page change
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }, [paginationData.hasNextPage])

  const goToPrevPage = useCallback(() => {
    if (paginationData.hasPrevPage) {
      setCurrentPage(prev => prev - 1)
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }, [paginationData.hasPrevPage])

  const goToPage = useCallback((page) => {
    if (page >= 1 && page <= paginationData.totalPages) {
      setCurrentPage(page)
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }, [paginationData.totalPages])

  // Handle sort change
  const handleSortChange = useCallback((newSortOrder) => {
    setSortOrder(newSortOrder)
  }, [])

  // Handle clear all favorites
  const handleClearAll = useCallback(() => {
    setShowClearConfirmation(true)
  }, [])

  // Handle confirm clear all
  const handleConfirmClearAll = useCallback(() => {
    clearAllFavorites()
    setShowClearConfirmation(false)
  }, [clearAllFavorites])

  // Handle refresh cache
  const handleRefreshCache = useCallback(() => {
    refreshCache()
    window.location.reload()
  }, [refreshCache])

  // Loading state
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
        <Loader2 className="h-8 w-8 animate-spin text-amber-600" />
        <p className="text-gray-600">Loading your favorites...</p>
      </div>
    )
  }

  // Error state
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
        <AlertCircle className="h-12 w-12 text-red-500" />
        <div className="text-center">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Something went wrong</h3>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={handleRefreshCache}
            className="inline-flex items-center px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Try Again
          </button>
        </div>
      </div>
    )
  }

  // Empty state
  if (totalFavorites === 0) {
    return (
      <div className="text-center py-16">
        <div className="mb-8">
          <div className="mx-auto h-24 w-24 bg-gradient-to-br from-amber-100 to-amber-200 rounded-full flex items-center justify-center mb-6">
            <svg className="h-12 w-12 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
          </div>
        </div>
        <h2 className="text-3xl font-bold text-gray-900 mb-4">No Favorites Yet</h2>
        <p className="text-xl text-gray-600 mb-8 max-w-md mx-auto">
          Start exploring our collection and add items to your favorites to see them here.
        </p>
        <Link
          href="/tombstones-for-sale"
          className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-amber-600 to-amber-700 text-white text-lg font-semibold rounded-xl hover:from-amber-700 hover:to-amber-800 transform hover:scale-105 transition-all duration-200 shadow-lg hover:shadow-xl"
        >
          <svg className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          Browse Tombstones
        </Link>
      </div>
    )
  }

  return (
    <>
      {/* Header with controls */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
              <div className="h-8 w-8 bg-gradient-to-br from-amber-500 to-amber-600 rounded-lg flex items-center justify-center">
                <svg className="h-5 w-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
              </div>
              My Favorites ({totalFavorites})
            </h2>
            <p className="text-gray-600 mt-2">
              Showing {paginationData.items.length} of {totalFavorites} items
            </p>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
            {/* Sort dropdown */}
            <select
              value={sortOrder}
              onChange={(e) => handleSortChange(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent bg-white shadow-sm"
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="name">Name A-Z</option>
            </select>
            
            {/* Clear all button */}
            {totalFavorites > 0 && (
              <button
                onClick={handleClearAll}
                className="px-4 py-2 text-red-600 border border-red-300 rounded-lg hover:bg-red-50 transition-colors shadow-sm"
              >
                Clear All
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Favorites grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
        {paginationData.items.map((favorite) => (
          <div key={favorite.id} className="group">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-lg transition-all duration-300">
              {/* Product Image */}
              <div className="relative w-full h-48 bg-gray-50">
                <Image
                  src={favorite.mainImageUrl || favorite.image || "/placeholder.svg"}
                  alt={favorite.title || favorite.name || "Product"}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-300"
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, (max-width: 1280px) 33vw, 25vw"
                />
                
                {/* Remove button overlay */}
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    removeFavorite(favorite.id);
                  }}
                  className="absolute top-3 right-3 p-2 bg-white/90 backdrop-blur-sm rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-all duration-200 hover:bg-red-50 hover:text-red-600"
                  title="Remove from favorites"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
              
              {/* Product Info */}
              <Link href={`/tombstones-for-sale/${favorite.id}`} className="block">
                <div className="p-4">
                  <h3 className="font-bold text-gray-900 text-lg mb-3 group-hover:text-amber-600 transition-colors uppercase">
                    {favorite.title || favorite.name || "Untitled Product"}
                  </h3>
                  
                  <div className="space-y-2">
                    <div className="flex items-center justify-between gap-2 w-full">
                      <p className="text-xl font-bold text-blue-600 flex-shrink-0">
                        R {favorite.price?.toLocaleString() || 'Price on request'}
                      </p>
                      {favorite.adFlasher && (
                        <span 
                          className="inline-block px-2 py-1 text-xs font-bold rounded-full text-white whitespace-nowrap flex-shrink-0 ml-auto"
                          style={{ backgroundColor: favorite.adFlasherColor || '#005bac' }}
                        >
                          {favorite.adFlasher}
                        </span>
                      )}
                    </div>
                    
                    {favorite.details && (
                      <p className="text-sm text-gray-600">
                        {typeof favorite.details === 'string' 
                          ? favorite.details 
                          : favorite.details.value || 
                            (favorite.details.color?.value || favorite.details.style?.value || favorite.details.stoneType?.value || favorite.details.customization?.value) 
                        }
                      </p>
                    )}
                    
                    {favorite.manufacturer && (
                      <p className="text-sm text-gray-500">
                        made by: {favorite.manufacturer}
                      </p>
                    )}
                    
                    {favorite.location && (
                      <p className="text-xs text-gray-400 flex items-center gap-1">
                        <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        {favorite.location}
                      </p>
                    )}
                    
                    {favorite.tag && (
                      <span 
                        className="inline-block px-2 py-1 text-xs font-medium rounded-full text-white"
                        style={{ backgroundColor: favorite.tagColor || '#f59e0b' }}
                      >
                        {favorite.tag}
                      </span>
                    )}
                  </div>
                  
                  {/* View details button */}
                  <div className="mt-4 pt-3 border-t border-gray-100">
                    <span className="text-amber-600 font-medium text-sm group-hover:text-amber-700 transition-colors">
                      View Details →
                    </span>
                  </div>
                </div>
              </Link>
            </div>
          </div>
        ))}
      </div>

      {/* Pagination */}
      {paginationData.totalPages > 1 && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mt-8">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            <div className="text-sm text-gray-600">
              Page {paginationData.currentPage} of {paginationData.totalPages}
            </div>
            
            <div className="flex gap-2">
              <button
                onClick={goToPrevPage}
                disabled={!paginationData.hasPrevPage}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Previous
              </button>
              
              {/* Page numbers */}
              <div className="flex gap-1">
                {Array.from({ length: Math.min(5, paginationData.totalPages) }, (_, i) => {
                  const pageNum = i + 1;
                  const isActive = pageNum === paginationData.currentPage;
                  
                  return (
                    <button
                      key={pageNum}
                      onClick={() => goToPage(pageNum)}
                      className={`px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                        isActive
                          ? 'bg-amber-600 text-white'
                          : 'text-gray-700 bg-white border border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      {pageNum}
                    </button>
                  );
                })}
              </div>
              
              <button
                onClick={goToNextPage}
                disabled={!paginationData.hasNextPage}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Next
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Social sharing */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mt-8">
        <div className="text-center">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Share Your Favorites</h3>
          <p className="text-gray-600 mb-6">Let others know about the tombstones you've selected</p>
          <div className="flex justify-center flex-wrap gap-2">
            <button 
              className="flex items-center gap-1 px-3 py-1.5 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-sm"
              onClick={() => {
                const url = window.location.href;
                const text = `Check out my favorite tombstones on TombstonesFinder`;
                window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}&quote=${encodeURIComponent(text)}`, '_blank');
              }}
            >
              <Facebook className="h-3 w-3" />
              Facebook
            </button>
            <button 
              className="flex items-center gap-1 px-3 py-1.5 bg-sky-500 text-white rounded-md hover:bg-sky-600 transition-colors text-sm"
              onClick={() => {
                const url = window.location.href;
                const text = `Check out my favorite tombstones on TombstonesFinder`;
                window.open(`https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(text)}`, '_blank');
              }}
            >
              <Twitter className="h-3 w-3" />
              Twitter
            </button>
            <button 
              className="flex items-center gap-1 px-3 py-1.5 bg-blue-700 text-white rounded-md hover:bg-blue-800 transition-colors text-sm"
              onClick={() => {
                const url = window.location.href;
                const text = `Check out my favorite tombstones on TombstonesFinder`;
                window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`, '_blank');
              }}
            >
              <Linkedin className="h-3 w-3" />
              LinkedIn
            </button>
            <button 
              className="flex items-center gap-1 px-3 py-1.5 bg-green-500 text-white rounded-md hover:bg-green-600 transition-colors text-sm"
              onClick={() => {
                const url = window.location.href;
                const text = `Check out my favorite tombstones on TombstonesFinder`;
                window.open(`https://wa.me/?text=${encodeURIComponent(text + ' ' + url)}`, '_blank');
              }}
            >
              <MessageCircle className="h-3 w-3" />
              WhatsApp
            </button>
            <button 
              className="flex items-center gap-1 px-3 py-1.5 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-md hover:from-purple-600 hover:to-pink-600 transition-colors text-sm"
              onClick={() => {
                const url = window.location.href;
                const text = `Check out my favorite tombstones on TombstonesFinder ${url}`;
                navigator.clipboard.writeText(text);
                alert('Link copied to clipboard! You can now paste it in your Instagram story or post.');
              }}
            >
              <Instagram className="h-3 w-3" />
              Instagram
            </button>
            <button 
              className="flex items-center gap-1 px-3 py-1.5 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors text-sm"
              onClick={() => {
                const url = window.location.href;
                const subject = 'My Favorite Tombstones';
                const body = `I wanted to share my favorite tombstones with you: ${url}`;
                window.location.href = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
              }}
            >
              <Mail className="h-3 w-3" />
              Email
            </button>
          </div>
        </div>
      </div>

      {/* Confirmation Modal */}
      <ConfirmationModal
        isOpen={showClearConfirmation}
        onClose={() => setShowClearConfirmation(false)}
        onConfirm={handleConfirmClearAll}
        title="Clear All Favorites"
        message="Are you sure you want to clear all favorites? This action cannot be undone."
        confirmText="Clear All"
        cancelText="Cancel"
        type="danger"
      />
    </>
  )
}