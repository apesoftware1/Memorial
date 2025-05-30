"use client"

import { useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { Facebook, Twitter, Mail, MapPin, X } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import ProductDetailsFooter from "./product-details-footer"

export default function ProductPage({ images, hideHeader }: { images: string[], hideHeader?: boolean }) {
  const [showMap, setShowMap] = useState(false)
  const [selectedImageIndex, setSelectedImageIndex] = useState(0)

  const similarProducts = [
    {
      id: 1,
      name: "Full Tombstone",
      price: "R 12 900",
      material: "Marble",
      image: "/placeholder.svg?height=100&width=80",
    },
    {
      id: 2,
      name: "Premium",
      price: "R 35 000",
      material: "Granite",
      image: "/placeholder.svg?height=100&width=80",
    },
    {
      id: 3,
      name: "Double",
      price: "R 28 600",
      material: "Marble",
      image: "/placeholder.svg?height=100&width=80",
    },
  ]

  return (
    <div className="max-w-6xl mx-auto bg-white">
      {/* Header */}
      {!hideHeader && (
      <header className="border-b border-gray-200">
        <div className="container mx-auto px-4 py-3 flex justify-between items-center">
          <div className="font-serif text-xl font-bold">TombstoneFinder.CO.ZA</div>
          <nav className="hidden md:flex space-x-8">
            <Link href="#" className="text-sm hover:text-blue-500">
              Find a Tombstone
            </Link>
            <Link href="#" className="text-sm hover:text-blue-500">
              Find a Manufacturer
            </Link>
            <Link href="#" className="text-sm hover:text-blue-500">
              Services
            </Link>
            <Link href="#" className="text-sm hover:text-blue-500">
              Favourites
            </Link>
          </nav>
          <div className="text-blue-500 text-sm">
            <Link href="#" className="hover:underline">
              Login
            </Link>{" "}
            /{" "}
            <Link href="#" className="hover:underline">
              Register
            </Link>
          </div>
        </div>
      </header>
      )}

      {/* Main Content */}
      <div className="container mx-auto px-4 py-4">
        {/* Product Title and Price */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4">
          <h1 className="text-2xl font-bold text-gray-800">CATHEDRAL C14 For Sale</h1>
          <div className="text-2xl font-bold text-blue-600">R 8 820</div>
        </div>

        {/* Unique Design Badge */}
        <div className="mb-4">
          <span className="bg-red-600 text-white px-3 py-1 text-sm rounded">Unique Design</span>
        </div>

        {/* Location */}
        <div className="text-sm text-gray-600 mb-6">Durban North, KZN | 38 km from you</div>

        {/* Product Content */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Left Column - Product Images */}
          <div className="md:col-span-2">
            <div className="mb-4">
              <div className="relative h-[350px] w-full mb-4 border border-gray-200">
                <Image
                  src={images[selectedImageIndex] || "/placeholder.svg"}
                  alt="CATHEDRAL C14 Tombstone"
                  fill
                  className="object-contain"
                />
              </div>
              <div className="grid grid-cols-6 gap-2">
                {images.map((image, index) => (
                  <div
                    key={index}
                    className={`relative h-16 w-full border cursor-pointer ${selectedImageIndex === index ? "border-blue-500" : "border-gray-200"}`}
                    onClick={() => setSelectedImageIndex(index)}
                  >
                    <Image
                      src={image || "/placeholder.svg"}
                      alt={`Thumbnail ${index + 1}`}
                      fill
                      className="object-cover"
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Product Features */}
            <div className="flex flex-wrap gap-4 mb-6 text-sm text-gray-700">
              <div className="flex flex-col items-center">
                <span className="mb-1">🏛️</span>
                <span>Full Tombstone</span>
              </div>
              <div className="flex flex-col items-center">
                <span className="mb-1">🪨</span>
                <span>Granite</span>
              </div>
              <div className="flex flex-col items-center">
                <span className="mb-1">⬛</span>
                <span>Black in Colour</span>
              </div>
              <div className="flex flex-col items-center">
                <span className="mb-1">✝️</span>
                <span>Cross Theme</span>
              </div>
              <div className="flex flex-col items-center">
                <span className="mb-1">✝️</span>
                <span>Christian</span>
              </div>
              <div className="flex flex-col items-center">
                <span className="mb-1">📷</span>
                <span>Photo Engraving Possible</span>
              </div>
            </div>

            {/* Product Description */}
            <div className="mb-6">
              <h2 className="text-lg font-semibold mb-2">Tombstone Description</h2>
              <p className="text-sm text-gray-700 mb-4">
                Crafted from high-quality polished granite, this timeless tombstone features a sleek rectangular base
                with a raised center slab and a striking upright headstone. The beautiful two-tone design is accented
                with black and brown granite, creating an elegant memorial. With its sophisticated appearance, durable
                patterns and durable construction, this monument is designed to honor your loved one with grace and
                permanence.
              </p>
            </div>

            {/* Tombstone Details */}
            <div className="mb-6">
              <h2 className="text-lg font-semibold mb-2">Tombstone Details</h2>
              <div className="grid grid-cols-2 gap-2 text-sm border-t border-gray-200">
                <div className="py-2 border-b border-gray-200 font-medium">Base 2 Line Brick Foundation</div>
                <div className="py-2 border-b border-gray-200">Included in Price</div>

                <div className="py-2 border-b border-gray-200 font-medium">Stone Type</div>
                <div className="py-2 border-b border-gray-200">Granite & Marble</div>

                <div className="py-2 border-b border-gray-200 font-medium">Colour</div>
                <div className="py-2 border-b border-gray-200">Black and Marble Tones</div>

                <div className="py-2 border-b border-gray-200 font-medium">Extra Custom Options</div>
                <div className="py-2 border-b border-gray-200">Photo Engraving + Flower Vase</div>

                <div className="py-2 border-b border-gray-200 font-medium">Transport & Installation</div>
                <div className="py-2 border-b border-gray-200">FREE with a 25 km Radius of Factory</div>

                <div className="py-2 border-b border-gray-200 font-medium">Warranty</div>
                <div className="py-2 border-b border-gray-200">25 yrs Manufacturers Warranty</div>
              </div>
            </div>

            {/* Tombstone Price */}
            <div className="mb-6">
              <h2 className="text-lg font-semibold mb-2">Tombstone Details</h2>
              <div className="text-2xl font-bold text-blue-600 mb-2">R 8 820</div>
              <div className="text-xs text-gray-500">
                Note: This is the Listing Price without the full Transport Fee and accessories.
              </div>
            </div>

            {/* Send Message Form (Bottom) */}
            <div className="mb-6">
              <h2 className="text-lg font-semibold mb-4">Send Message</h2>
              <form className="space-y-4">
                <div>
                  <label className="text-sm text-gray-600 mb-1 block">Name & Surname *</label>
                  <Input className="w-full" />
                </div>

                <div>
                  <label className="text-sm text-gray-600 mb-1 block">Mobile Number *</label>
                  <Input className="w-full" />
                </div>

                <div>
                  <label className="text-sm text-gray-600 mb-1 block">Email</label>
                  <Input className="w-full" />
                </div>

                <div>
                  <label className="text-sm text-gray-600 mb-1 block">Email</label>
                  <Textarea
                    className="w-full h-32"
                    placeholder="I would like to find out more about the CATHEDRAL C14 Tombstone for sale."
                  />
                </div>

                <div className="flex justify-between items-center">
                  <div className="relative w-16 h-16">
                    <Image
                      src="/placeholder.svg?height=60&width=60"
                      alt="Company Logo"
                      fill
                      className="object-contain"
                    />
                  </div>
                  <div className="text-sm">
                    Example Tombstone Co. 1
                    <div className="text-xs text-blue-500">Current Google Rating: 4.7 out of 5</div>
                  </div>
                </div>

                <button className="w-full bg-red-600 hover:bg-red-700 text-white py-2 rounded">Send Message</button>

                <div className="text-xs text-gray-500">
                  By continuing I understand and agree with Memorial Hub's{" "}
                  <Link href="#" className="text-blue-500 hover:underline">
                    Terms & Conditions
                  </Link>{" "}
                  and{" "}
                  <Link href="#" className="text-blue-500 hover:underline">
                    Privacy Policy
                  </Link>
                  .
                </div>
              </form>
            </div>
          </div>

          {/* Right Column - Contact Form */}
          <div className="md:col-span-1">
            <div className="bg-gray-800 text-white p-3 text-center mb-4">CONTACT THE MANUFACTURER</div>

            <button className="w-full bg-red-600 hover:bg-red-700 text-white py-2 rounded mb-4">
              Show Contact Number
            </button>

            <div className="mb-4">
              <button
                className="flex items-center text-blue-500 hover:underline text-sm"
                onClick={() => setShowMap(!showMap)}
              >
                <MapPin size={16} className="mr-1" /> View Manufacturers Address
              </button>
            </div>

            {showMap && (
              <div className="relative mb-4 border border-gray-200">
                <div
                  className="absolute top-2 right-2 z-10 bg-white rounded-full p-1 cursor-pointer"
                  onClick={() => setShowMap(false)}
                >
                  <X size={16} />
                </div>
                <div className="p-2 bg-blue-500 text-white text-sm">View Manufacturer Address</div>
                <div className="p-2 text-xs">16 North Coast Road, Durban North, Durban, KZN, 4051</div>
                <div className="h-48 relative">
                  <Image src="/placeholder.svg?height=200&width=300" alt="Map" fill className="object-cover" />
                </div>
                <div className="p-2 text-xs text-gray-500">
                  When clicked a Google Pop-Up window appears with background "Greyed" out.
                </div>
              </div>
            )}

            <form className="space-y-4 mb-6">
              <div>
                <label className="text-sm text-gray-600 mb-1 block">Name & Surname *</label>
                <Input className="w-full" />
              </div>

              <div>
                <label className="text-sm text-gray-600 mb-1 block">Mobile Number *</label>
                <Input className="w-full" />
              </div>

              <div>
                <label className="text-sm text-gray-600 mb-1 block">Email</label>
                <Input className="w-full" />
              </div>

              <div>
                <label className="text-sm text-gray-600 mb-1 block">Email</label>
                <Textarea
                  className="w-full h-24"
                  placeholder="I would like to find out more about the CATHEDRAL C14 Tombstone for sale."
                />
              </div>

              <button className="w-full bg-red-600 hover:bg-red-700 text-white py-2 rounded">Send Message</button>

              <div className="text-xs text-gray-500">
                By continuing I understand and agree with Memorial Hub's{" "}
                <Link href="#" className="text-blue-500 hover:underline">
                  Terms & Conditions
                </Link>{" "}
                and{" "}
                <Link href="#" className="text-blue-500 hover:underline">
                  Privacy Policy
                </Link>
                .
              </div>
            </form>

            {/* Share with Friends */}
            <div className="mb-6">
              <h3 className="text-sm font-medium mb-2">Share with Friends</h3>
              <div className="flex space-x-2">
                <Link href="#" className="bg-blue-600 text-white p-1 rounded">
                  <Facebook size={16} />
                </Link>
                <Link href="#" className="bg-green-600 text-white p-1 rounded">
                  <span className="text-xs font-bold">W</span>
                </Link>
                <Link href="#" className="bg-blue-400 text-white p-1 rounded">
                  <Twitter size={16} />
                </Link>
                <Link href="#" className="bg-red-500 text-white p-1 rounded">
                  <Mail size={16} />
                </Link>
                <Link href="#" className="bg-blue-500 text-white p-1 rounded">
                  <Telegram size={16} />
                </Link>
              </div>
            </div>

            {/* Add to Favorites */}
            <div className="mb-6">
              <button className="text-sm text-blue-500 hover:underline flex items-center">
                <span className="mr-1">+</span> Add to Favourites
              </button>
            </div>

            {/* Company Info */}
            <div className="border border-gray-200 rounded p-4 mb-6 text-center">
              <div className="flex justify-center mb-2">
                <div className="relative h-16 w-16">
                  <Image src="/placeholder.svg?height=60&width=60" alt="Company Logo" fill className="object-contain" />
                </div>
              </div>
              <div className="mb-1">Example Tombstone Co. 1</div>
              <div className="text-xs text-blue-500 mb-4">Current Google Rating: 4.7 out of 5</div>
            </div>

            {/* Business Hours */}
            <div className="mb-6">
              <div className="grid grid-cols-2 gap-1 text-sm">
                <div className="font-medium">Monday to Friday</div>
                <div>09:00 - 16:00</div>

                <div className="font-medium">Saturday</div>
                <div>09:00 - 14:00</div>

                <div className="font-medium">Sundays</div>
                <div>Closed</div>

                <div className="font-medium">Public Holidays</div>
                <div>09:30 - 14:00</div>
              </div>
            </div>

            {/* More Tombstones */}
            <div className="mb-6">
              <h3 className="text-sm font-medium mb-3">More Tombstones from this Manufacturer</h3>

              {similarProducts.map((product) => (
                <div key={product.id} className="flex border-b border-gray-200 py-3">
                  <div className="relative h-20 w-20 flex-shrink-0">
                    <Image
                      src={product.image || "/placeholder.svg"}
                      alt={product.name}
                      fill
                      className="object-contain"
                    />
                  </div>
                  <div className="ml-3 flex-grow">
                    <div className="text-blue-600 font-medium">{product.price}</div>
                    <div className="text-sm">{product.name}</div>
                    <div className="text-xs text-gray-600">{product.material}</div>
                  </div>
                </div>
              ))}

              <div className="mt-3">
                <Link href="#" className="text-blue-500 hover:underline text-sm">
                  View all Tombstones
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <ProductDetailsFooter />
    </div>
  )
}

// Custom Telegram icon since it's not in lucide-react
function Telegram({ size = 24, className = "" }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M22 2L11 13"></path>
      <path d="M22 2L15 22L11 13L2 9L22 2Z"></path>
    </svg>
  )
} 