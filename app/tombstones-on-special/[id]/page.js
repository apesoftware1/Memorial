"use client"

import { useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { ChevronRight, Phone, MapPin, ChevronDown } from "lucide-react"
import CountdownTimer from "@/components/countdown-timer"

export default function SpecialTombstoneDetail({ params }) {
  const { id } = params

  // State for selected thumbnail
  const [selectedImage, setSelectedImage] = useState(0)

  // State for message form
  const [message, setMessage] = useState("")
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [phone, setPhone] = useState("")

  // Product data - in a real app, this would be fetched from an API
  const product = {
    id: "cathedral-c14-special",
    title: "CATHEDRAL C14 For Sale",
    originalPrice: "R 10 500",
    price: "R 8 820",
    discount: "16% OFF",
    tag: "SPECIAL OFFER",
    tagColor: "bg-red-600",
    specialOfferEnds: "2025-06-30T23:59:59",
    images: [
      "/placeholder.svg?height=400&width=600&text=Cathedral+C14+Main",
      "/placeholder.svg?height=100&width=100&text=Thumbnail+1",
      "/placeholder.svg?height=100&width=100&text=Thumbnail+2",
      "/placeholder.svg?height=100&width=100&text=Thumbnail+3",
      "/placeholder.svg?height=100&width=100&text=Thumbnail+4",
      "/placeholder.svg?height=100&width=100&text=Thumbnail+5",
    ],
    manufacturer: {
      name: "Example Tombstone Co.",
      rating: 4.7,
      totalRatings: 9,
      phone: "087 555 5628",
      address: "10 Main Road, Durban North, KZN, 4051",
      hours: {
        weekdays: "08:00 - 16:00",
        saturday: "09:00 - 13:00",
        sunday: "Closed",
      },
    },
    features: [
      "Full Tombstone",
      "Granite",
      "Cross Theme",
      "Photo Engraving Available",
      "Self Install & Pick-Up Available",
    ],
    description:
      "This beautiful granite full tombstone combines a sleek rectangular base with a curved cross and carefully angled headstone. The headstone has been designed to showcase a portrait photo and can be customized with your personal inscription. This tombstone is made from high-quality granite and is available in different colors and finishes. LIMITED TIME SPECIAL OFFER!",
    details: {
      base: "2 Unit Block Foundation",
      material: "Granite",
      color: "Black",
      extras: "Photo Engraving + Flower Vase",
      installation: "FREE with a 50 km Radius of Factory",
      warranty: "25 yrs Manufacturer Warranty",
    },
    relatedProducts: [
      {
        id: "grey-memorial-special",
        image: "/placeholder.svg?height=150&width=150&text=Grey+Memorial",
        title: "GREY MEMORIAL",
        originalPrice: "R 7 800",
        price: "R 6 500",
        discount: "17% OFF",
        endDate: "2025-07-15T23:59:59",
      },
      {
        id: "black-granite-special",
        image: "/placeholder.svg?height=150&width=150&text=Black+Granite",
        title: "BLACK GRANITE",
        originalPrice: "R 12 500",
        price: "R 10 200",
        discount: "18% OFF",
        endDate: "2025-06-15T23:59:59",
      },
      {
        id: "white-marble-special",
        image: "/placeholder.svg?height=150&width=150&text=White+Marble",
        title: "WHITE MARBLE",
        originalPrice: "R 32 000",
        price: "R 28 500",
        discount: "11% OFF",
        endDate: "2025-05-20T23:59:59",
      },
    ],
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
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-3 flex justify-between items-center">
          <div className="flex items-center">
            <Link href="/" className="text-2xl font-bold text-gray-800">
              MemorialHub
            </Link>

            {/* Desktop Navigation with Dropdowns */}
            <nav className="ml-8 hidden md:flex">
              {/* Find a Tombstone Dropdown */}
              <div className="relative group">
                <button className="px-3 py-2 text-sm text-gray-700 hover:text-gray-900 transition-colors flex items-center">
                  Find a Tombstone
                  <ChevronDown className="ml-1 h-4 w-4" />
                </button>
                <div className="absolute left-0 mt-1 w-48 bg-white rounded-md shadow-lg border border-gray-200 hidden group-hover:block animate-slide-in z-50">
                  <div className="py-1">
                    <Link
                      href="/tombstones-for-sale"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                    >
                      TOMBSTONES FOR SALE
                    </Link>
                    <Link
                      href="/tombstones-on-special"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors bg-amber-50"
                    >
                      TOMBSTONES ON SPECIAL
                    </Link>
                  </div>
                </div>
              </div>

              {/* Find a Manufacturer Dropdown */}
              <div className="relative group">
                <button className="px-3 py-2 text-sm text-gray-700 hover:text-gray-900 transition-colors flex items-center">
                  Find a Manufacturer
                  <ChevronDown className="ml-1 h-4 w-4" />
                </button>
                <div className="absolute left-0 mt-1 w-48 bg-white rounded-md shadow-lg border border-gray-200 hidden group-hover:block animate-slide-in z-50">
                  <div className="py-1">
                    <Link
                      href="#"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                    >
                      MANUFACTURERS
                    </Link>
                  </div>
                </div>
              </div>

              {/* Services Dropdown */}
              <div className="relative group">
                <button className="px-3 py-2 text-sm text-gray-700 hover:text-gray-900 transition-colors flex items-center">
                  Services
                  <ChevronDown className="ml-1 h-4 w-4" />
                </button>
                <div className="absolute left-0 mt-1 w-64 bg-white rounded-md shadow-lg border border-gray-200 hidden group-hover:block animate-slide-in z-50">
                  <div className="py-1">
                    <Link
                      href="#"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                    >
                      LET US HANDLE EVERYTHING
                    </Link>
                    <Link
                      href="#"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                    >
                      TOMBSTONE FINANCE
                    </Link>
                    <Link
                      href="#"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                    >
                      TOMBSTONE INSTALLATION GUIDE
                    </Link>
                  </div>
                </div>
              </div>

              {/* Favourites Dropdown */}
              <div className="relative group">
                <button className="px-3 py-2 text-sm text-gray-700 hover:text-gray-900 transition-colors flex items-center">
                  Favourites
                  <ChevronDown className="ml-1 h-4 w-4" />
                </button>
                <div className="absolute left-0 mt-1 w-48 bg-white rounded-md shadow-lg border border-gray-200 hidden group-hover:block animate-slide-in z-50">
                  <div className="py-1">
                    <Link
                      href="#"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                    >
                      FAVOURITES
                    </Link>
                  </div>
                </div>
              </div>
            </nav>
          </div>

          {/* Login/Register Dropdown */}
          <div className="hidden md:block relative group">
            <button className="text-teal-500 text-sm hover:text-teal-600 transition-colors flex items-center">
              Login / Register
              <ChevronDown className="ml-1 h-4 w-4" />
            </button>
            <div className="absolute right-0 mt-1 w-64 bg-white rounded-md shadow-lg border border-gray-200 hidden group-hover:block animate-slide-in z-50">
              <div className="py-1">
                <Link href="#" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors">
                  MANUFACTURERS LOGIN PORTAL
                </Link>
              </div>
            </div>
          </div>
        </div>
      </header>
      {/* Breadcrumb */}
      <div className="container mx-auto px-4 py-4">
        <div className="max-w-4xl mx-auto">
          <nav className="text-sm text-gray-500 mb-4" aria-label="Breadcrumb">
            <ol className="flex items-center space-x-1">
              <li>
                <Link href="/" className="hover:text-gray-700 transition-colors">
                  Home
                </Link>
              </li>
              <li className="flex items-center">
                <ChevronRight className="h-4 w-4 mx-1" />
                <Link href="/tombstones-on-special" className="hover:text-gray-700 transition-colors">
                  Tombstone Specials
                </Link>
              </li>
              <li className="flex items-center">
                <ChevronRight className="h-4 w-4 mx-1" />
                <span className="text-gray-700">{product.title}</span>
              </li>
            </ol>
          </nav>

          {/* Product Title and Price */}
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold text-gray-800">{product.title}</h1>
            <div className="text-right">
              <p className="text-2xl font-bold text-blue-800">{product.price}</p>
              <p className="text-sm text-gray-500 line-through">{product.originalPrice}</p>
              <p className="text-sm font-semibold text-green-600">{product.discount}</p>
            </div>
          </div>

          {/* Countdown Timer Banner */}
          <div className="bg-red-50 border border-red-100 rounded-md p-4 mb-6">
            <CountdownTimer endDate={product.specialOfferEnds} className="w-full" />
          </div>

          <div className="bg-white border border-gray-300 rounded-lg p-6 mb-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Product Images */}
              <div>
                <div className="relative h-80 mb-4 border border-gray-200 rounded">
                  <Image
                    src={product.images[selectedImage] || "/placeholder.svg"}
                    alt={product.title}
                    fill
                    className="object-contain"
                  />
                  <div className={`absolute top-2 left-2 ${product.tagColor} text-white text-xs px-2 py-1 rounded`}>
                    {product.tag}
                  </div>
                  <div className="absolute top-2 right-2 bg-green-600 text-white text-xs px-2 py-1 rounded">
                    {product.discount}
                  </div>
                </div>
                <div className="grid grid-cols-6 gap-2">
                  {product.images.map((image, index) => (
                    <div
                      key={index}
                      className={`border cursor-pointer ${selectedImage === index ? "border-blue-500" : "border-gray-200"}`}
                      onClick={() => setSelectedImage(index)}
                    >
                      <Image
                        src={image || "/placeholder.svg"}
                        alt={`${product.title} thumbnail ${index + 1}`}
                        width={80}
                        height={80}
                        className="object-cover w-full h-full"
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* Product Info and Contact */}
              <div>
                <div className="mb-6">
                  <h2 className="text-lg font-semibold mb-2">Tombstone Description</h2>
                  <p className="text-gray-600 text-sm">{product.description}</p>
                </div>

                <div className="mb-6">
                  <h2 className="text-lg font-semibold mb-2">Tombstone Details</h2>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    {Object.entries(product.details).map(([key, value]) => (
                      <div key={key} className="py-2 border-b border-gray-200">
                        <span className="font-medium text-gray-700">
                          {key.replace(/([A-Z])/g, " $1").replace(/^./, (str) => str.toUpperCase())}:{" "}
                        </span>
                        <span className="text-gray-600">{value}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="mb-6">
                  <h2 className="text-lg font-semibold mb-2">Features</h2>
                  <ul className="grid grid-cols-2 gap-2">
                    {product.features.map((feature, index) => (
                      <li key={index} className="flex items-center text-sm text-gray-600">
                        <svg
                          className="h-4 w-4 text-green-500 mr-2"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        {feature}
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="bg-blue-50 p-4 rounded-lg mb-6">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-semibold text-gray-800">{product.manufacturer.name}</h3>
                      <div className="flex items-center mt-1">
                        <div className="flex">
                          {[...Array(5)].map((_, i) => (
                            <svg
                              key={i}
                              className={`h-4 w-4 ${i < Math.floor(product.manufacturer.rating) ? "text-yellow-400" : "text-gray-300"}`}
                              fill="currentColor"
                              viewBox="0 0 20 20"
                            >
                              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                            </svg>
                          ))}
                        </div>
                        <span className="text-sm text-gray-600 ml-1">{product.manufacturer.rating} out of 5</span>
                      </div>
                    </div>
                    <Link
                      href="#contact"
                      className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded text-sm transition-colors"
                    >
                      Contact Now
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Contact the Manufacturer */}
          <div id="contact" className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
            <div className="bg-white border border-gray-300 rounded-lg p-6">
              <h2 className="text-xl font-bold text-gray-800 mb-4">CONTACT THE MANUFACTURER</h2>
              <div className="flex items-center mb-4">
                <Phone className="h-5 w-5 text-blue-600 mr-2" />
                <span className="text-xl font-bold">{product.manufacturer.phone}</span>
              </div>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                    Name & Surname
                  </label>
                  <input
                    type="text"
                    id="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                    Email
                  </label>
                  <input
                    type="email"
                    id="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                    Phone
                  </label>
                  <input
                    type="tel"
                    id="phone"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1">
                    Message
                  </label>
                  <textarea
                    id="message"
                    rows={4}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="I would like to find out more about this special offer..."
                    required
                  ></textarea>
                </div>
                <div className="text-xs text-gray-500">
                  I agree for my data to be used and stored by MemorialHub. I understand my data will be shared with the
                  manufacturer.
                </div>
                <button
                  type="submit"
                  className="w-full bg-red-600 hover:bg-red-700 text-white py-2 rounded transition-colors"
                >
                  SEND MESSAGE
                </button>
              </form>
            </div>

            <div className="bg-white border border-gray-300 rounded-lg p-6">
              <h2 className="text-xl font-bold text-gray-800 mb-4">Manufacturer Details</h2>
              <div className="mb-4">
                <h3 className="font-semibold text-gray-800">{product.manufacturer.name}</h3>
                <div className="flex items-center mt-1">
                  <div className="flex">
                    {[...Array(5)].map((_, i) => (
                      <svg
                        key={i}
                        className={`h-4 w-4 ${i < Math.floor(product.manufacturer.rating) ? "text-yellow-400" : "text-gray-300"}`}
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    ))}
                  </div>
                  <span className="text-sm text-gray-600 ml-1">{product.manufacturer.rating} out of 5</span>
                </div>
              </div>

              <div className="mb-4">
                <h3 className="font-semibold text-gray-800 mb-2">Address</h3>
                <div className="flex items-start">
                  <MapPin className="h-5 w-5 text-gray-500 mr-2 mt-0.5" />
                  <p className="text-gray-600">{product.manufacturer.address}</p>
                </div>
              </div>

              <div className="mb-4">
                <h3 className="font-semibold text-gray-800 mb-2">Business Hours</h3>
                <div className="text-sm">
                  <div className="flex justify-between py-1 border-b border-gray-200">
                    <span className="text-gray-600">Monday to Friday</span>
                    <span className="font-medium">{product.manufacturer.hours.weekdays}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-gray-200">
                    <span className="text-gray-600">Saturday</span>
                    <span className="font-medium">{product.manufacturer.hours.saturday}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-gray-200">
                    <span className="text-gray-600">Sunday</span>
                    <span className="font-medium">{product.manufacturer.hours.sunday}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-gray-200">
                    <span className="text-gray-600">Public Holidays</span>
                    <span className="font-medium">Closed</span>
                  </div>
                </div>
              </div>

              <div className="bg-gray-100 p-4 rounded-lg">
                <h3 className="font-semibold text-gray-800 mb-2">Payment Options</h3>
                <p className="text-sm text-gray-600 mb-2">We accept the following payment methods:</p>
                <div className="flex space-x-2">
                  <div className="bg-white p-1 rounded border border-gray-300">
                    <span className="text-xs font-medium">Cash</span>
                  </div>
                  <div className="bg-white p-1 rounded border border-gray-300">
                    <span className="text-xs font-medium">EFT</span>
                  </div>
                  <div className="bg-white p-1 rounded border border-gray-300">
                    <span className="text-xs font-medium">Credit Card</span>
                  </div>
                  <div className="bg-white p-1 rounded border border-gray-300">
                    <span className="text-xs font-medium">Financing</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Related Products */}
          <div className="mb-8">
            <h2 className="text-xl font-bold text-gray-800 mb-4">More Special Offers</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {product.relatedProducts.map((item, index) => (
                <Link key={index} href={`/tombstones-on-special/${item.id}`} className="block">
                  <div className="border border-gray-300 rounded bg-white overflow-hidden hover:shadow-md transition-shadow">
                    <div className="relative h-40">
                      <Image src={item.image || "/placeholder.svg"} alt={item.title} fill className="object-cover" />
                      <div className="absolute top-2 right-2 bg-green-600 text-white text-xs px-2 py-1 rounded">
                        {item.discount}
                      </div>
                    </div>
                    <div className="p-3">
                      <h4 className="font-bold text-gray-800 text-sm">{item.title}</h4>
                      <div className="mt-1">
                        <p className="font-bold text-blue-800 text-sm">{item.price}</p>
                        <p className="text-xs text-gray-500 line-through">{item.originalPrice}</p>
                      </div>
                      <div className="mt-2">
                        <CountdownTimer endDate={item.endDate} compact={true} />
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
            <div className="mt-4 text-center">
              <Link href="/tombstones-on-special" className="text-blue-600 hover:text-blue-800 text-sm hover:underline">
                View all Special Offers
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
