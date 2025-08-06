"use client"

import Image from "next/image"
import Link from "next/link"
import { Facebook, Twitter, Mail, MapPin, X, Whatsapp, FacebookMessenger, Heart, User2, Cross, Gem, Camera, Flower, Truck, Info, CircleX } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import React, { useEffect, useState } from "react"
import { FavoriteButton } from "./favorite-button"
import Header from "@/components/Header";
import ProductContactForm from "./product-contact-form";
import { calculateDistanceFrom } from "@/lib/locationUtil";
import { trackAnalyticsEvent } from "@/lib/analytics";



export default function ProductShowcase({ listing,id }) {
  if (!listing) {
    return null;
  }
  const [distance, setDistance] = useState(null);
  const [showContact, setShowContact] = useState(false);
  // Prepare images: main image + thumbnails (all as URLs, no duplicates)
  const mainImageUrl = listing.mainImageUrl || listing.image || "/placeholder.svg";
  const thumbnailUrls = Array.isArray(listing.thumbnailUrls)
    ? listing.thumbnailUrls.filter(url => url && url !== mainImageUrl)
    : [];
  const allImages = [mainImageUrl, ...thumbnailUrls];
  const [selectedImageIndex, setSelectedImageIndex] = React.useState(0);

  // Helper to extract first value from array fields
  const getFirstValue = arr => Array.isArray(arr) && arr.length > 0 ? arr[0].value : undefined;
  const getAllValues = arr => Array.isArray(arr) ? arr.map(item => item.value) : [];

  // Product details
  const productDetails = listing.productDetails || {};
  const additionalDetails = listing.additionalProductDetails || {};

  // Manufacturer info fallback
  const info = { logo: listing.company?.logo?.url || "/placeholder-logo.svg", rating: listing.company?.googleRating || 4.7, hours: [] };
  useEffect(() => {
    const fetchDistance = async () => {
      // Check if we're in the browser before accessing localStorage
      if (typeof window === 'undefined') {
        return;
      }
      
      const storedLocation = localStorage.getItem("guestLocation");
      if (!storedLocation) return;

      try {
        const { lat: userLat, lng: userLng } = JSON.parse(storedLocation);

        if (listing?.company?.latitude && listing?.company?.longitude) {
          const lat = parseFloat(listing.company.latitude);
          const lng = parseFloat(listing.company.longitude);
          const dist = calculateDistanceFrom({ lat, lng });
          setDistance(dist);
        }
      } catch (error) {
        console.error("Error calculating distance:", error);
      }
    };

    fetchDistance();
  }, [listing]);

  const handleShowContact = () => {
    setShowContact(!showContact);
    // Debug: Log the company data to see what's available
    console.log('Company data:', listing.company);
    console.log('Phone:', listing.company?.phone);
    console.log('Mobile:', listing.company?.mobile);
    console.log('Email:', listing.company?.email);
  };

  return (
    <>
      <Header />
      {/* Breadcrumbs (outside the main container) */}
      <nav className="text-sm text-gray-600 mb-4 max-w-6xl mx-auto px-4 md:px-0 pt-6">
        <Link href="/" className="text-blue-600 hover:text-blue-800 transition-colors">Home</Link>
        <span className="mx-1">&gt;</span>
        <Link href="/tombstones-for-sale" className="hover:underline">Tombstones For Sale</Link>
        <span className="mx-1">&gt;</span>
        <span>{listing.company?.location || 'N/A'}</span>
        <span className="mx-1">&gt;</span>
        <span className="text-gray-900 font-semibold">{listing.title}</span>
      </nav>
      <div className="bg-white rounded shadow max-w-6xl mx-auto px-0 mt-2">
      {/* Product Header */}
        <div className="px-4">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4 mt-4">
            <div className="w-full">
          {listing.badge && (
            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-red-600 text-white mb-2">
              {listing.badge}
            </span>
          )}
              {/* Title and Price on the same horizontal line */}
              <div className="flex flex-row items-center justify-between w-full mb-0">
                <h1 className="text-2xl font-bold text-gray-900 ">{listing.title}</h1>
                <span className="text-blue-600 text-3xl font-bold">R{listing.price}</span>
              </div>
              {/* Location and navigation links on the same horizontal line */}
              <div className="flex flex-row items-center justify-between w-full mb-1">
                <p className="text-sm text-gray-700 mt-2">
                  {listing.company?.location || 'N/A'} |
                  {distance ? (
                    <>
                      <span>{distance} </span><span className="text-blue-600">km from you</span>
                    </>
                  ) : (
                    <span className="text-blue-600">from you</span>
                  )}
                </p>
                <div className="text-sm text-gray-600 flex items-center gap-2 mt-2">
                  <Link href="#" className="hover:underline">&lt; Previous</Link>
                  <span className="mx-1">|</span>
                  <Link href="#" className="hover:underline">Next &gt;</Link>
                </div>
              </div>
        </div>
        <div className="md:text-right mt-4 md:mt-0">
          <div className="flex items-center gap-3 mb-2">
            {listing.originalPrice && (
              <span className="text-gray-500 text-xl line-through">{listing.originalPrice}</span>
            )}
          </div>
          </div>
        </div>
      </div>

      {/* Product Content */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left Column - Product Images and Details */}
        <div className="md:col-span-2">
            {/* Main image edge-to-edge, outside of padded card */}
            <div className="relative w-full h-[400px] overflow-hidden mb-2 px-2 sm:px-0 ">
                <Image
                  src={allImages[selectedImageIndex] || "/placeholder.svg"}
                  alt={listing.title}
                  fill
                  className="object-cover"
                />
                {/* Favorite Button Overlay */}
                <div className="absolute top-3 right-3 z-10">
                  <FavoriteButton product={listing} size="md" />
                </div>
              </div>
            {/* Thumbnails row below main image */}
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 mt-1 mb-4 px-2 sm:px-0">
                {allImages.map((image, index) => (
                  <div
                    key={index}
                    className={`relative h-16 w-full border cursor-pointer border-gray-200 ${selectedImageIndex === index ? "ring-2 ring-blue-500" : ""}`}
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
            {/* Product Metadata/Features */}
            <div className="border-y border-gray-200 py-2 mb-4">
              <div className="flex flex-wrap gap-2 text-sm text-gray-700">
                  {getFirstValue(productDetails.stoneType) && (
                    <div className="flex items-center border border-gray-300 rounded px-3 py-1.5 font-medium bg-white">
                      <Gem size={16} className="text-gray-500 mr-2" />
                      <span>Stone Type: <span className="font-semibold">{getFirstValue(productDetails.stoneType)}</span></span>
                  </div>
                )}
                  {getFirstValue(productDetails.style) && (
                    <div className="flex items-center border border-gray-300 rounded px-3 py-1.5 font-medium bg-white">
                    <Cross size={16} className="text-gray-500 mr-2" />
                      <span>Style: <span className="font-semibold">{getFirstValue(productDetails.style)}</span></span>
                  </div>
                )}
                  {getFirstValue(productDetails.color) && (
                    <div className="flex items-center border border-gray-300 rounded px-3 py-1.5 font-medium bg-white">
                      <span>Colour: <span className="font-semibold">{getFirstValue(productDetails.color)}</span></span>
                  </div>
                )}
                  {getFirstValue(productDetails.culture) && (
                    <div className="flex items-center border border-gray-300 rounded px-3 py-1.5 font-medium bg-white">
                    <Image src="/new files/newIcons/Culture_Icons/Culture_Icons-50.svg" alt="Culture Icon" width={16} height={16} className="text-gray-500 mr-2" />
                      <span>Culture: <span className="font-semibold">{getFirstValue(productDetails.culture)}</span></span>
                  </div>
                )}
                  {getFirstValue(productDetails.customization) && (
                    <div className="flex items-center border border-gray-300 rounded px-3 py-1.5 font-medium bg-white">
                          <Camera size={16} className="text-gray-500 mr-2" />
                      <span>Customisation: <span className="font-semibold">{getFirstValue(productDetails.customization)}</span></span>
                  </div>
                )}
              </div>
            </div>
            {/* Product Description */}
            <div className="mb-4">
              <h2 className="text-lg font-semibold mb-2">Tombstone Description</h2>
              <p className="text-sm text-gray-700 mb-4">{listing.description}</p>
            </div>
            {/* Additional Tombstone Details */}
            <div className="mb-4">
              <h2 className="text-lg font-semibold mb-2">Additional Tombstone Details</h2>
              <div className="space-y-2 text-sm">
                {getAllValues(additionalDetails.transportAndInstallation).map((detail, index) => (
                  <div key={index} className="bg-gray-100 p-3 rounded-md border border-gray-200 flex items-center">
                    <Truck size={30} className="mr-2 text-gray-600 md:size-[15px] md:text-gray-600" />
                    <span>{detail}</span>
                  </div>
                ))}
                {getAllValues(additionalDetails.foundationOptions).map((detail, index) => (
                  <div key={index} className="bg-gray-100 p-3 rounded-md border border-gray-200 flex items-center">
                    <Info size={30} className="mr-2 text-gray-600 md:size-[15px] md:text-gray-600" />
                    <span>{detail}</span>
                  </div>
                ))}
                {getAllValues(additionalDetails.warrantyOrGuarantee).map((detail, index) => (
                  <div key={index} className="bg-gray-100 p-3 rounded-md border border-gray-200 flex items-center">
                    <CircleX size={20} className="mr-2 text-gray-600 md:size-[15px] md:text-gray-600" />
                    <span>{detail}</span>
                  </div>
                ))}
              </div>
            </div>
            {/* Price and Notes Card (directly under Additional Tombstone Details) */}
          <div className="border border-gray-200 rounded p-4 mb-6 bg-white shadow-sm">
            <h3 className="text-sm text-gray-700 font-semibold mb-1">Price</h3>
            <div className="flex items-center gap-3 mb-4">
                <span className="text-blue-600 text-2xl font-bold">R{listing.price}</span>
              {listing.originalPrice && (
                <span className="text-gray-500 text-lg line-through">{listing.originalPrice}</span>
              )}
            </div>
            <p className="text-xs text-gray-600 mb-2">
                <span className="font-semibold">Please note:</span> The data displayed above may not be the exact data for the actual Tombstone being offered for sale. We recommend that you always check the details with the seller prior to purchase.
            </p>
            <p className="text-xs text-gray-600">
                <span className="font-semibold">Please be aware</span> on all possible costs presented and possible hidden ones. T&C's apply.
            </p>
          </div>
            {/* Send Message Card (under Price and Notes Card) */}
            <div className="border border-gray-200 rounded p-4 mb-6 bg-white shadow-sm">
            <h2 className="text-lg font-semibold mb-4">Send Message</h2>
              <div className="flex flex-col md:flex-row md:gap-6">
                {/* Left: Contact Form */}
                <div className="flex-1">
                  <ProductContactForm documentId={id} className="space-y-4 px-4 pb-4" />
                  </div>
                {/* Right: Logo, Rating, Show Contact Number */}
                <div className="flex flex-col items-center justify-start text-center md:w-64 md:ml-4 md:mt-0 mt-8">
                <div className="relative h-24 w-48 mb-2">
                    <Image src={info.logo} alt={listing.company?.name || "Manufacturer Logo"} fill className="object-contain" />
                </div>
                <div className="text-xs text-blue-500 mb-4">Current Google Rating: {info.rating} out of 5</div>
                <button 
                  onClick={() => {handleShowContact(); trackAnalyticsEvent('contact_view', listing.documentId)}}
                  className="w-full bg-red-600 hover:bg-red-700 text-white py-2 rounded max-w-xs transition-colors"
                >
                  {showContact ? 'Hide Contact Number' : 'Show Contact Number'}
                </button>
                {showContact && (
                  <div className="mt-4 p-4 bg-gray-50 rounded-lg border max-w-xs w-full">
                    <div className="text-center space-y-2">
                      {listing.company?.phone && (
                        <div>
                          <span className="text-sm font-semibold text-gray-700">Phone:</span>
                          <div className="text-lg font-bold text-blue-600">
                            <a href={`tel:${listing.company.phone}`} className="hover:underline">
                              {listing.company.phone}
                            </a>
                          </div>
                        </div>
                      )}
                      {listing.company?.mobile && (
                        <div>
                          <span className="text-sm font-semibold text-gray-700">Mobile:</span>
                          <div className="text-lg font-bold text-blue-600">
                            <a href={`tel:${listing.company.mobile}`} className="hover:underline">
                              {listing.company.mobile}
                            </a>
                          </div>
                        </div>
                      )}
                      {listing.company?.email && (
                        <div>
                          <span className="text-sm font-semibold text-gray-700">Email:</span>
                          <div className="text-sm text-blue-600">
                            <a href={`mailto:${listing.company.email}`} className="hover:underline">
                              {listing.company.email}
                            </a>
                          </div>
                        </div>
                      )}
                      {!listing.company?.phone && !listing.company?.mobile && !listing.company?.email && (
                        <div className="text-sm text-gray-500">
                          Contact information not available
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
        {/* Right Column - Contact Form and Other Info */}
          <div className="md:col-span-1 px-4">
          {/* Main contact card container */}
          <div className="rounded mb-6 shadow-sm overflow-hidden">
            {/* Dark blue header */}
            <div className="bg-[#1F2B45] text-white py-6 text-center px-4 rounded-t-lg">
              CONTACT THE MANUFACTURER
              <button 
                onClick={() => {handleShowContact(); trackAnalyticsEvent('contact_view', listing.documentId)}} 
                className="w-full max-w-sm bg-red-600 hover:bg-red-700 text-white py-2 rounded mx-auto block mt-6 transition-colors"
              >
                {showContact ? 'Hide Contact Number' : 'Show Contact Number'}
              </button>
              {showContact && (
                <div className="mt-4 p-4 bg-white text-gray-800 rounded-lg mx-auto max-w-sm">
                  <div className="text-center space-y-2">
                    {listing.company?.phone && (
                      <div>
                        <span className="text-sm font-semibold text-gray-700">Phone:</span>
                        <div className="text-lg font-bold text-blue-600">
                          <a href={`tel:${listing.company.phone}`} className="hover:underline">
                            {listing.company.phone}
                          </a>
                        </div>
                      </div>
                    )}
                    {listing.company?.mobile && (
                      <div>
                        <span className="text-sm font-semibold text-gray-700">Mobile:</span>
                        <div className="text-lg font-bold text-blue-600">
                          <a href={`tel:${listing.company.mobile}`} className="hover:underline">
                            {listing.company.mobile}
                          </a>
                        </div>
                      </div>
                    )}
                    {listing.company?.email && (
                      <div>
                        <span className="text-sm font-semibold text-gray-700">Email:</span>
                        <div className="text-sm text-blue-600">
                          <a href={`mailto:${listing.company.email}`} className="hover:underline">
                            {listing.company.email}
                          </a>
                        </div>
                      </div>
                    )}
                    {!listing.company?.phone && !listing.company?.mobile && !listing.company?.email && (
                      <div className="text-sm text-gray-500">
                        Contact information not available
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
            {/* White content area */}
            <div className="bg-white rounded-b-lg">
              <div className="pt-4 px-4 mb-4">
                <button className="flex items-center text-blue-500 hover:underline text-sm">
                  <Image
                    src="/new files/newIcons/GooglePin_Icon.svg"
                    alt="Location Pin Icon"
                    width={16}
                    height={16}
                    className="mr-1 object-contain"
                  /> View Manufacturer's Address
                </button>
              </div>

              <ProductContactForm documentId={id} className="space-y-4 px-4 pb-4" />
            </div>
          </div>
          {/* Share with Friends */}
            <div className="flex flex-col items-center">
              <div className="border border-gray-200 rounded p-4 mb-6 bg-white shadow-sm w-full md:max-w-xs">
            {/* Add to Favorites - moved to top */}
            <div className="mb-4">
              <FavoriteButton product={listing} size="md" />
            </div>
            <hr className="my-4 border-gray-200" />
            <h3 className="text-sm font-medium mb-2">Share with Friends</h3>
            <div className="flex space-x-2">
                  <Link href={listing.company?.socialLinks?.facebook || "#"}>
                <Image src="/new files/newIcons/Social Media Icons/Advert Set-Up-03.svg" alt="Facebook" width={40} height={40} />
              </Link>
                  <Link href={listing.company?.socialLinks?.whatsapp || "#"}>
                <Image src="/new files/newIcons/Social Media Icons/Advert Set-Up-04.svg" alt="WhatsApp" width={40} height={40} />
              </Link>
                  <Link href={listing.company?.socialLinks?.x || "#"}>
                    <Image src="/new files/newIcons/Social Media Icons/Advert Set-Up-05.svg" alt="Twitter/X" width={40} height={40} />
              </Link>
                  <Link href={listing.company?.socialLinks?.messenger || "#"}>
                <Image src="/new files/newIcons/Social Media Icons/Advert Set-Up-06.svg" alt="Messenger" width={40} height={40} />
              </Link>
                  <Link href={listing.company?.socialLinks?.instagram || "#"}>
                    <Image src="/new files/newIcons/Social Media Icons/Advert Set-Up-07.svg" alt="Instagram" width={40} height={40} />
              </Link>
            </div>
          </div>
            </div>
          {/* Combined Company Info, Business Hours, and More Tombstones */}
          <div className="border border-gray-200 rounded p-4 mb-6 bg-white shadow-sm">
            {/* Company Info */}
            <div className="text-center mb-4">
              <div className="flex justify-center mb-2">
                <div className="relative h-32 w-64">
                    <Image src={info.logo} alt={listing.company?.name || "Manufacturer Logo"} fill className="object-contain" />
                  </div>
                </div>
                <div className="text-xs text-blue-500">Current Google Rating: {info.rating} out of 5</div>
              </div>
            {/* Business Hours */}
            <div className="mb-4">
              <div className="grid grid-cols-2 gap-1 text-sm">
                  <div className="font-medium">Monday to Friday</div>
                  <div>{listing.company?.operatingHours?.monToFri || 'N/A'}</div>
                  <div className="font-medium">Saturday</div>
                  <div>{listing.company?.operatingHours?.saturday || 'N/A'}</div>
                  <div className="font-medium">Sunday</div>
                  <div>{listing.company?.operatingHours?.sunday || 'N/A'}</div>
                  <div className="font-medium">Public Holiday</div>
                  <div>{listing.company?.operatingHours?.publicHoliday || 'N/A'}</div>
                </div>
              </div>
            {/* More Tombstones from this Manufacturer */}
            <div>
              <h3 className="text-sm font-medium mb-3">More Tombstones from this Manufacturer</h3>
                {listing.company?.listings && listing.company.listings.length > 0 ? (
                  listing.company?.listings?.slice(0, 3).map((product) => (
                    <Link key={product.documentId} href={`/tombstones-for-sale/${product.documentId}`} className="block">
                      <div className="flex border-b border-gray-200 py-3 hover:bg-gray-50 transition">
                    <div className="relative h-20 w-20 flex-shrink-0">
                      <Image
                            src={product.mainImageUrl || "/placeholder.svg"}
                            alt={product.title}
                        fill
                        className="object-contain"
                      />
                    </div>
                    <div className="ml-3 flex-grow">
                          <div className="text-blue-600 font-medium">R{product.price}</div>
                          <div className="text-sm">{product.title}</div>
                          <div className="text-xs text-gray-600">{listing.productDetails?.stoneType?.[0]?.value || 'N/A'}</div>
                    </div>
                  </div>
                    </Link>
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
    </>
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