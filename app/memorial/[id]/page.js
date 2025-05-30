"use client"

import { use, useState, useCallback, useEffect } from "react"
import Image from "next/image"
import Link from "next/link"
import { Heart, Share2, Phone, MessageSquare, MapPin, Star, ChevronLeft, X, ChevronDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import ProductShowcase from "@/components/product-showcase"
import FeaturedProducts from "@/components/featured-products"
import ContactForm from "@/components/contact-form"
import ProductPage from "@/components/product-page"
import Header from "@/components/Header.jsx"

import { BuildingIcon, SquareIcon, PaletteIcon, CrossIcon, CameraIcon } from "lucide-react"

export default function MemorialPage({ params }) {
  const { id } = use(params)

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


  // Static data for demonstration
  const memorial = {
    id: "traditional-double",
    title: "TRADITIONAL DOUBLE HEADSTONE",
    price: "R 22 980",
    tag: "Family Option",
    enquiries: "18",
    details: "Double Tombstone | Granite | Traditional Theme",
    description: "A traditional double headstone with dual inscriptions. Perfect for families seeking a meaningful and lasting memorial.",
    specifications: {
      material: "Granite",
      dimensions: "150cm x 70cm x 20cm",
      weight: "Approximately 200kg",
      finish: "Polished",
      warranty: "5 years"
    },
    manufacturer: {
      name: "Family Memorials Ltd",
      rating: "4.9/5",
      totalSales: "250",
      responseTime: "Within 48 hours"
    },
    images: [
      "/X20Tombstone_Pic Sets/mausoleam2/mausoleam2_main.jpg",
      "/X20Tombstone_Pic Sets/mausoleam2/mausoleam2_1.jpg",
      "/X20Tombstone_Pic Sets/mausoleam2/mausoleam2_2.jpg",
      "/X20Tombstone_Pic Sets/mausoleam2/mausoleam2_3.jpg"
    ],
    features: [
      { name: "Full Tombstone", icon: BuildingIcon },
      { name: "Granite", icon: SquareIcon },
      { name: "Black in Colour", icon: PaletteIcon },
      { name: "Cross Theme", icon: CrossIcon },
      { name: "Christian", icon: CrossIcon },
      { name: "Photo Engraving Possible", icon: CameraIcon },
    ]
  }

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
        <div className="max-w-5xl mx-auto">
          <Link href="/" className="text-blue-600 hover:underline mb-4 block">Back to Search</Link>
          <h1 className="text-3xl font-bold mb-6">{memorial.title}</h1>

          <Tabs defaultValue="products" className="w-full">
            <TabsList className="mb-6">
              <TabsTrigger value="products" className="px-4 py-2 rounded-md hover:bg-blue-50">Products</TabsTrigger>
              <TabsTrigger value="featured" className="px-4 py-2 rounded-md hover:bg-blue-50">Featured</TabsTrigger>
              <TabsTrigger value="contact" className="px-4 py-2 rounded-md hover:bg-blue-50">Contact Us</TabsTrigger>
            </TabsList>

            <TabsContent value="products" className="space-y-8">
              <ProductPage images={memorial.images} hideHeader={true} />
            </TabsContent>

            <TabsContent value="featured" className="space-y-8">
              <FeaturedProducts />
            </TabsContent>

            <TabsContent value="contact" className="space-y-8">
              <ContactForm />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  )
} 