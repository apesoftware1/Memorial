"use client"

import { useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { ChevronRight, Phone, MapPin } from "lucide-react"

export default function TombstoneDetail({ params }) {
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
    id: "cathedral-c14",
    title: "CATHEDRAL C14 For Sale",
    price: "R 8 820",
    tag: "Unique Design",
    tagColor: "bg-red-600",
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
      "This beautiful granite full tombstone combines a sleek rectangular base with a curved cross and carefully angled headstone. The headstone has been designed to showcase a portrait photo and can be customized with your personal inscription. This tombstone is made from high-quality granite and is available in different colors and finishes.",
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
        id: "grey-memorial",
        image: "/placeholder.svg?height=150&width=150&text=Grey+Memorial",
        title: "GREY MEMORIAL",
        price: "R 6 500",
      },
      {
        id: "black-granite",
        image: "/placeholder.svg?height=150&width=150&text=Black+Granite",
        title: "BLACK GRANITE",
        price: "R 10 200",
      },
      {
        id: "white-marble",
        image: "/placeholder.svg?height=150&width=150&text=White+Marble",
        title: "WHITE MARBLE",
        price: "R 28 500",
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
                <Link href="/tombstones-for-sale" className="hover:text-gray-700 transition-colors">
                  Tombstones For Sale
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
            <p className="text-2xl font-bold text-blue-800">{product.price}</p>
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
                    placeholder="I would like to find out more about this tombstone..."
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
            <h2 className="text-xl font-bold text-gray-800 mb-4">View all Tombstones</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {product.relatedProducts.map((item, index) => (
                <Link key={index} href={`/tombstones-for-sale/${item.id}`} className="block">
                  <div className="border border-gray-300 rounded bg-white overflow-hidden hover:shadow-md transition-shadow">
                    <div className="relative h-40">
                      <Image src={item.image || "/placeholder.svg"} alt={item.title} fill className="object-cover" />
                    </div>
                    <div className="p-3">
                      <h4 className="font-bold text-gray-800 text-sm">{item.title}</h4>
                      <p className="font-bold text-blue-800 text-sm mt-1">{item.price}</p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
            <div className="mt-4 text-center">
              <Link href="/tombstones-for-sale" className="text-blue-600 hover:text-blue-800 text-sm hover:underline">
                View all Tombstones
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
