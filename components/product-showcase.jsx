"use client"

import Image from "next/image"
import Link from "next/link"
import { Facebook, Twitter, Mail, MapPin, X, Whatsapp, FacebookMessenger, Heart, User2, Cross, Gem, Camera, Flower } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import React from "react"

export default function ProductShowcase({ listing }) {
  if (!listing) {
    return null;
  }

  return (
    <div className="max-w-6xl mx-auto bg-white">
      {/* Product Content */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left Column - Product Images and Details */}
        <div className="md:col-span-2">
          <div className="mb-4">
            <div className="relative h-[350px] w-full mb-4 border border-gray-200">
              <Image
                src={listing.thumbnailImages[0] || "/placeholder.svg"}
                alt={listing.title}
                fill
                className="object-contain"
              />
            </div>
            <div className="grid grid-cols-6 gap-2">
              {listing.thumbnailImages.map((image, index) => (
                <div
                  key={index}
                  className="relative h-16 w-full border cursor-pointer border-gray-200"
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

          {/* Product Metadata/Features */}
          <div className="border-y border-gray-200 py-4 mb-6">
            <div className="flex flex-wrap gap-x-4 gap-y-2 text-sm text-gray-700">
              {listing.tombstoneType && (
                <div className="flex items-center">
                  <User2 size={16} className="text-gray-500 mr-1" />
                  <span>Tombstone Type: <span className="font-semibold">{listing.tombstoneType}</span></span>
                  <span className="mx-1 text-gray-400">|</span>
                </div>
              )}
              {listing.style && (
                <div className="flex items-center">
                  <Cross size={16} className="text-gray-500 mr-1" />
                  <span>Style: <span className="font-semibold">{listing.style}</span></span>
                  <span className="mx-2 text-gray-400">|</span>
                </div>
              )}
              {listing.colour && (Object.values(listing.colour).some(val => val)) && (
                <div className="flex items-center">
                  <span>Colour:</span>
                  {listing.colour.black && <span className="w-4 h-4 bg-black rounded-sm border border-gray-300 ml-1"></span>}
                  {listing.colour.gold && <span className="w-4 h-4 bg-yellow-500 rounded-sm border border-gray-300 ml-1"></span>}
                  <span className="mx-1 text-gray-400">|</span>
                </div>
              )}
              {listing.culture && (
                <div className="flex items-center">
                  <Image src="/new files/newIcons/Culture_Icons/Culture_Icons-50.svg" alt="Culture Icon" width={16} height={16} className="text-gray-500 mr-1" />
                  <span>Culture: <span className="font-semibold">{listing.culture}</span></span>
                  <span className="mx-1 text-gray-400">|</span>
                </div>
              )}
              {listing.stoneType && (
                <div className="flex items-center">
                  <Gem size={16} className="text-gray-500 mr-1" />
                  <span>Stone Type: <span className="font-semibold">{listing.stoneType}</span></span>
                  <span className="mx-1 text-gray-400">|</span>
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
          <div className="mb-6">
            <h2 className="text-lg font-semibold mb-2">Tombstone Description</h2>
            <p className="text-sm text-gray-700 mb-4">{listing.description}</p>
          </div>

          {/* Additional Tombstone Details */}
          <div className="mb-6">
            <h2 className="text-lg font-semibold mb-2">Additional Tombstone Details</h2>
            <div className="space-y-2 text-sm">
              {listing.additionalDetails && listing.additionalDetails.map((detail, index) => (
                <div key={index} className="bg-gray-100 p-3 rounded-md border border-gray-200">
                  {detail}
                </div>
              ))}
            </div>
          </div>

          {/* Price and Notes Card */}
          <div className="border border-gray-200 rounded p-4 mb-6 bg-white shadow-sm">
            <h3 className="text-sm text-gray-700 font-semibold mb-1">Price</h3>
            <div className="text-blue-600 text-2xl font-bold mb-4">{listing.price}</div>

            <p className="text-xs text-gray-600 mb-2">
              <span className="font-semibold">Please note:</span> The data displayed above may not be the exact data for the actual Tombstone being offered for
              sale. We recommend that you always check the details with the seller prior to purchase.
            </p>
            <p className="text-xs text-gray-600">
              <span className="font-semibold">Please be aware</span> on all possible costs presented and possible hidden ones.
              T&C's apply.
            </p>
          </div>

          {/* Send Message Card */}
          <div className="border border-gray-200 rounded p-4 mb-6 bg-white shadow-sm">
            <h2 className="text-lg font-semibold mb-4">Send Message</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Left Column - Form */}
              <div>
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
                    <label className="text-sm text-gray-600 mb-1 block">Message *</label>
                    <Textarea
                      className="w-full h-24"
                      placeholder={`I would like to find out more about the ${listing.title} Tombstone for sale.`}
                    />
                  </div>

                  <button className="w-full bg-red-600 hover:bg-red-700 text-white py-2 rounded">Send Message</button>

                  <div className="text-xs text-gray-500 mt-4">
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

              {/* Right Column - Manufacturer Info */}
              <div className="flex flex-col items-center justify-start text-center">
                <div className="relative h-24 w-24 mb-2">
                  <Image src={listing.companyLogo || "/placeholder.svg?height=60&width=60"} alt="Company Logo" fill className="object-contain" />
                </div>
                <div className="text-lg font-semibold mb-1">{listing.manufacturer}</div>
                <div className="text-xs text-blue-500 mb-4">Current Google Rating: 4.7 out of 5</div>
                <button className="w-full bg-red-600 hover:bg-red-700 text-white py-2 rounded max-w-xs">
                  Show Contact Number
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column - Contact Form and Other Info */}
        <div className="md:col-span-1">
          {/* Main contact card container */}
          <div className="rounded mb-6 shadow-sm overflow-hidden">
            {/* Dark blue header */}
            <div className="bg-blue-900 text-white py-6 text-center px-4 rounded-t-lg">
              CONTACT THE MANUFACTURER
              <button className="w-full max-w-sm bg-red-600 hover:bg-red-700 text-white py-2 rounded mx-auto block mt-6">
                Show Contact Number
              </button>
            </div>
            {/* White content area */}
            <div className="bg-white rounded-b-lg">
              <div className="pt-4 px-4 mb-4">
                <button className="flex items-center text-blue-500 hover:underline text-sm">
                  <MapPin size={16} className="mr-1" /> View Manufacturers Address
                </button>
              </div>

              <form className="space-y-4 px-4 pb-4">
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
                  <label className="text-sm text-gray-600 mb-1 block">Message *</label>
                  <Textarea
                    className="w-full h-24"
                    placeholder={`I would like to find out more about the ${listing.title} Tombstone for sale.`}
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
            </div>
          </div>

          {/* Share with Friends */}
          <div className="border border-gray-200 rounded p-4 mb-6 bg-white shadow-sm">
            {/* Add to Favorites - moved to top */}
            <div className="mb-4">
              <button className="text-sm text-blue-500 hover:underline flex items-center justify-start">
                <Heart size={20} className="mr-1 text-gray-400" /> Add to Favourites
              </button>
            </div>

            <hr className="my-4 border-gray-200" />

            <h3 className="text-sm font-medium mb-2">Share with Friends</h3>
            <div className="flex space-x-2">
              <Link href="#" className="bg-blue-600 text-white p-2 rounded">
                <Image src="/new files/newIcons/Social Media Icons/Advert Set-Up-03.svg" alt="Facebook" width={24} height={24} />
              </Link>
              <Link href="#" className="bg-green-500 text-white p-2 rounded">
                <Image src="/new files/newIcons/Social Media Icons/Advert Set-Up-04.svg" alt="WhatsApp" width={24} height={24} />
              </Link>
              <Link href="#" className="bg-gray-800 text-white p-2 rounded">
                <Image src="/new files/newIcons/Social Media Icons/Advert Set-Up-05.svg" alt="X" width={24} height={24} />
              </Link>
              <Link href="#" className="bg-purple-600 text-white p-2 rounded">
                <Image src="/new files/newIcons/Social Media Icons/Advert Set-Up-06.svg" alt="Messenger" width={24} height={24} />
              </Link>
              <Link href="#" className="bg-blue-500 text-white p-2 rounded">
                <Image src="/new files/newIcons/Social Media Icons/Advert Set-Up-07.svg" alt="Telegram" width={24} height={24} />
              </Link>
            </div>
          </div>

          {/* Combined Company Info, Business Hours, and More Tombstones */}
          <div className="border border-gray-200 rounded p-4 mb-6 bg-white shadow-sm">
            {/* Company Info */}
            <div className="text-center mb-4">
              <div className="flex justify-center mb-2">
                <div className="relative h-16 w-16">
                  <Image src={listing.companyLogo || "/placeholder.svg?height=60&width=60"} alt="Company Logo" fill className="object-contain" />
                </div>
              </div>
              <div className="mb-1">{listing.manufacturer}</div>
              <div className="text-xs text-blue-500">Current Google Rating: 4.7 out of 5</div>
            </div>

            {/* Business Hours */}
            <div className="mb-4">
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

            {/* More Tombstones from this Manufacturer */}
            <div>
              <h3 className="text-sm font-medium mb-3">More Tombstones from this Manufacturer</h3>

              {listing.similarProducts && listing.similarProducts.length > 0 ? (
                listing.similarProducts.map((product) => (
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
                ))
              ) : (
                <div className="text-sm text-gray-600">No similar products available.</div>
              )}

              <div className="mt-3">
                <Link href="#" className="text-blue-500 hover:underline text-sm">
                  View all Tombstones
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
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