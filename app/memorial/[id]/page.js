"use client"

import { use, useState, useCallback, useEffect } from "react"
import Image from "next/image"
import Link from "next/link"
import { Heart, Share2, Phone, MessageSquare, MapPin, Star, ChevronLeft, X, ChevronDown, User2, Cross } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import ProductShowcase from "@/components/product-showcase"
import FeaturedProducts from "@/components/featured-products"
import ContactForm from "@/components/contact-form"
import ProductPage from "@/components/product-page"
import Header from "@/components/Header.jsx"

// Import specific icons for product metadata
import Camera from 'lucide-react/dist/esm/icons/camera';
import Flower from 'lucide-react/dist/esm/icons/flower';

// Import premiumListings data
import { premiumListings } from '@/lib/data';

export default function MemorialPage({ params }) {
  const { id } = use(params)

  // Find the product from premiumListings
  const listing = premiumListings.find(item => item.id === id);

  // If no listing is found, display a message
  if (!listing) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-900">Listing Not Found</h1>
            <p className="mt-4 text-gray-600">The memorial listing you're looking for doesn't exist.</p>
            <Link
              href="/tombstones-on-special"
              className="mt-6 inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
            >
              Back to Special Offers
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // State for UI controls (for Header component)
  const [uiState, setUiState] = useState({
    mobileMenuOpen: false,
    mobileDropdown: null,
  });

  // Handlers for Header component
  const handleMobileMenuToggle = useCallback(() => {
    setUiState(prev => ({ ...prev, mobileMenuOpen: !prev.mobileMenuOpen }))
  }, []);

  const handleMobileDropdownToggle = useCallback((section) => {
    setUiState(prev => ({ ...prev, mobileDropdown: prev.mobileDropdown === section ? null : section }))
  }, []);

  // Close mobile menu when clicking outside (basic implementation, may need refinement)
  useEffect(() => {
    const handleClickOutside = (event) => {
      // Implement logic to close dropdowns/menus when clicking outside if needed
      // Currently, only closes the main mobile menu overlay
      if (uiState.mobileMenuOpen && !event.target.closest('.fixed.top-0.right-0.bottom-0.w-3/4')) {
         // Check if the click is outside the mobile menu itself
         // This might need a ref on the mobile menu div for more robust handling
         // For now, we'll rely on the overlay click to close it.
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [uiState.mobileMenuOpen]); // Depend on mobileMenuOpen state

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header Section */}
      <Header
        mobileMenuOpen={uiState.mobileMenuOpen}
        handleMobileMenuToggle={handleMobileMenuToggle}
        mobileDropdown={uiState.mobileDropdown}
        handleMobileDropdownToggle={handleMobileDropdownToggle}
      />
      {/* Overlay when mobile menu is open */}
      {uiState.mobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
          onClick={handleMobileMenuToggle}
        ></div>
      )}

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <Link href="/tombstones-on-special" className="text-blue-600 hover:underline mb-4 block">Back to Special Offers</Link>
          <h1 className="text-3xl font-bold mb-6">{listing.title}</h1>

          <ProductShowcase listing={listing} />

          <div className="mt-6">
            <h2 className="text-2xl font-bold mb-4">Product Details</h2>
            <div className="flex items-center">
              {listing.stoneType && (
                <div className="flex items-center">
                  <Image src="/new files/newIcons/Material_Icons/Material_Icons-40.svg" alt="Stone Type Icon" width={16} height={16} className="text-gray-500 mr-1" />
                  <span>Stone Type: <span className="font-semibold">{listing.stoneType}</span></span>
                  <span className="mx-2 text-gray-400">|</span>
                </div>
              )}
              {listing.culture && (
                <div className="flex items-center">
                  <Image src="/new files/newIcons/Culture_Icons/Culture_Icons-50.svg" alt="Culture Icon" width={16} height={16} className="text-gray-500 mr-1" />
                  <span>Culture: <span className="font-semibold">{listing.culture}</span></span>
                  <span className="mx-2 text-gray-400">|</span>
                </div>
              )}
              {listing.customisation && (listing.customisation.photoEngraving || listing.customisation.builtInFlowerVase) && (
                <div className="flex items-center">
                  <span>Customisation:</span>
                  {listing.customisation.photoEngraving && 
                    <span className="flex items-center ml-1">
                      <Camera size={16} className="text-gray-500 mr-1" /> 
                      <span className="font-semibold">Photo Engraving</span>
                    </span>
                  }
                  {listing.customisation.builtInFlowerVase && 
                    <span className="flex items-center ml-1">
                      <Flower size={16} className="text-gray-500 mr-1" /> 
                      <span className="font-semibold">Built-In Flower Vase</span>
                    </span>
                  }
                </div>
              )}
            </div>
          </div>

          {/* Product Description */}
          {/* ... existing code ... */}
        </div>
      </div>
    </div>
  )
} 