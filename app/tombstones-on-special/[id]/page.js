"use client"

import { useState, use } from "react"
import { useQuery } from "@apollo/client"
import { GET_LISTING_BY_ID } from "@/graphql/queries/getListingById"
import Image from "next/image"
import Link from "next/link"
import { ChevronRight, Phone, MapPin, ChevronDown } from "lucide-react"
import CountdownTimer from "@/components/countdown-timer"
import ProductShowcase from "@/components/product-showcase"

export default function SpecialTombstoneDetail({ params }) {
  const { id } = use(params)

  // Fetch listing data
  const { data, loading, error } = useQuery(GET_LISTING_BY_ID, {
    variables: { documentID: id }
  })

  // State for selected thumbnail
  const [selectedImage, setSelectedImage] = useState(0)

  // State for message form
  const [message, setMessage] = useState("")
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [phone, setPhone] = useState("")

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading special offer details...</p>
        </div>
      </div>
    )
  }

  if (error || !data?.listing) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Special Offer Not Found</h1>
          <p className="text-gray-600 mb-4">The special offer you're looking for doesn't exist or has been removed.</p>
          <Link href="/tombstones-on-special" className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700">
            Back to Special Offers
          </Link>
        </div>
      </div>
    )
  }

  const listing = data.listing

  // Transform listing data to include special pricing
  const transformedListing = {
    ...listing,
    // Add special pricing information
    originalPrice: listing.specials?.[0]?.active ? `R ${listing.price}` : null,
    price: listing.specials?.[0]?.active && listing.specials[0].sale_price 
      ? listing.specials[0].sale_price 
      : listing.price,
    badge: listing.specials?.[0]?.active ? "SPECIAL OFFER" : null,
    // Add main image and thumbnails
    image: listing.mainImageUrl || "/placeholder.svg",
    mainImageUrl: listing.mainImageUrl || "/placeholder.svg",
    thumbnailUrls: listing.thumbnailUrls || []
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    // In a real app, this would send the message to the server
    alert("Message sent! The manufacturer will contact you shortly.")
    setMessage("")
    setName("")
    setEmail("")
    setPhone("")
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <ProductShowcase listing={transformedListing} id={id} />
    </div>
  )
}
