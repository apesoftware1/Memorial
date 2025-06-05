"use client"

import React from 'react';
import { useRouter } from 'next/navigation';
import { premiumListings } from '@/lib/data';
import Image from 'next/image';
import Link from 'next/link';
import { ChevronRight, Heart, MapPin, Camera, Check, Phone } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export default function TombstoneDetail({ params }) {
  const router = useRouter();
  const unwrappedParams = React.use(params);
  const id = unwrappedParams.id;
  
  const listing = premiumListings.find(listing => listing.id === id);

  if (!listing) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-900">Listing Not Found</h1>
            <p className="mt-4 text-gray-600">The tombstone listing you're looking for doesn't exist.</p>
            <Link 
              href="/tombstones-for-sale"
              className="mt-6 inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
            >
              Back to Listings
            </Link>
          </div>
        </div>
      </div>
    );
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
                <span className="text-gray-700">{listing.title}</span>
              </li>
            </ol>
          </nav>

          {/* Main Content */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            <div className="flex min-h-[500px]">
              {/* Left side - Main Image */}
              <div className="w-1/2 flex-shrink-0 flex flex-col">
                <div className="relative flex-1">
                  <div className="relative w-full h-full min-h-[500px]">
                  <Image
                      src={listing.image}
                      alt={listing.title}
                    fill
                      className="object-cover"
                      priority
                    />

                    {/* Heart Icon */}
                    <button className="absolute top-3 right-3 p-2 bg-white/90 rounded-full hover:bg-white transition-colors shadow-sm">
                      <Heart className="w-5 h-5 text-gray-600" />
                    </button>

                    {/* Photo Count */}
                    <div className="absolute bottom-3 left-3 flex items-center gap-1 bg-black/70 text-white px-2 py-1 rounded text-sm">
                      <Camera className="w-4 h-4" />
                      <span>{listing.thumbnailImages.length}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right side - Content */}
              <div className="w-1/2 p-6 bg-gray-50 flex flex-col">
                {/* Price and Heart */}
                <div className="flex justify-between items-start mb-3">
                  <div className="text-3xl font-bold text-blue-600">{listing.price}</div>
                  <Heart className="w-6 h-6 text-gray-400" />
                </div>

                {/* Badge */}
                <div className="mb-3">
                  <Badge className={cn("text-white text-sm px-3 py-1", listing.tagColor)}>
                    {listing.tag}
                  </Badge>
                      </div>

                {/* Title */}
                <h1 className="text-2xl font-bold text-gray-900 mb-3">{listing.title}</h1>

                {/* Details */}
                <div className="text-sm text-gray-600 mb-3">
                  {listing.details}
                </div>

                {/* Features */}
                <div className="text-sm text-gray-600 mb-6">
                  {listing.features}
                </div>

                {/* Manufacturer Information */}
                <div className="space-y-2 mt-auto">
                  <div className="font-medium text-gray-900 text-lg">{listing.manufacturer}</div>

                  {/* Enquiries */}
                  <div className="flex items-center text-green-600">
                    <Check className="w-4 h-4 mr-1" />
                    <span className="text-sm">{listing.enquiries} enquiries to this Manufacturer</span>
                        </div>

                  {/* Location */}
                  <div className="text-sm text-gray-600">{listing.location}</div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1 text-sm text-blue-600">
                      <MapPin className="w-4 h-4" />
                      <span>{listing.distance}</span>
                      </div>

                    {/* Logo */}
                    <div className="flex items-center gap-3">
                      <div className="text-gray-400 text-sm font-medium">MEMORIAL</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Thumbnails */}
            <div className="p-4 bg-white border-t border-gray-100">
              <div className="grid grid-cols-6 gap-3">
                {listing.thumbnailImages.map((src, index) => (
                  <button
                    key={index}
                    className={cn(
                      "relative aspect-[4/3] rounded overflow-hidden border-2 transition-colors",
                      "border-gray-200 hover:border-gray-300"
                    )}
                    onClick={() => router.push(`/tombstones-for-sale/${listing.id}`)}
                  >
                    <Image
                      src={src}
                      alt={`View ${index + 1}`}
                      fill
                      className="object-cover"
                      sizes="(max-width: 768px) 50vw, 200px"
                    />
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Contact Form */}
          <div className="mt-8 bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Contact the Manufacturer</h2>
              <div className="flex items-center mb-4">
                <Phone className="h-5 w-5 text-blue-600 mr-2" />
              <span className="text-xl font-bold">{listing.phone || "087 555 5628"}</span>
              </div>
            <form onSubmit={(e) => {
              e.preventDefault();
              alert("Message sent! The manufacturer will contact you shortly.");
              router.push('/tombstones-for-sale');
            }} className="space-y-4">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                    Name & Surname
                  </label>
                  <input
                    type="text"
                    id="name"
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
        </div>
      </div>
    </div>
  );
}
