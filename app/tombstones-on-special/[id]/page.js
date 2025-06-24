"use client"

import { useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { ChevronRight, Phone, MapPin, ChevronDown } from "lucide-react"
import CountdownTimer from "@/components/countdown-timer"
import ProductShowcase from "@/components/product-showcase"

export default function SpecialTombstoneDetail({ params }) {
  const { id } = params

  // State for selected thumbnail
  const [selectedImage, setSelectedImage] = useState(0)

  // State for message form
  const [message, setMessage] = useState("")
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [phone, setPhone] = useState("")

  // Example data for WHITE ANGEL SPECIAL OFFER
  const listing = {
    id: "white-angel-special",
    title: "WHITE ANGEL",
    price: "R 10 200",
    originalPrice: "R 12 500",
    discount: "18% OFF",
    tag: "SPECIAL OFFER",
    tagColor: "bg-red-600",
    badge: "SPECIAL OFFER",
    image: "/placeholder.svg?height=200&width=300",
    thumbnailImages: [
      "/placeholder.svg?height=200&width=300",
      "/placeholder.svg?height=100&width=100&text=Thumbnail+1",
      "/placeholder.svg?height=100&width=100&text=Thumbnail+2"
    ],
    tombstoneType: "Full Tombstone",
    stoneType: "Granite",
    designTheme: "Bible Theme",
    description: "Full Tombstone | Granite | Bible Theme",
    additionalDetails: [
      "Offer expired",
      "View Details"
    ],
    features: [
      "Full Tombstone",
      "Granite",
      "Bible Theme"
    ],
    location: "",
    distance: "",
    culture: "",
    style: "",
    colour: {},
    customisation: {},
    manufacturer: {
      name: "",
      rating: 0,
      totalRatings: 0,
      phone: "",
      address: "",
      hours: {}
    }
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
      <ProductShowcase listing={listing} />
    </div>
  )
}
