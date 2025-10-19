import Link from "next/link"
import { FavoritesClientContent } from "./favorites-client.jsx"
import HeaderClient from "./header-client.jsx"

export const metadata = {
  title: "Your Favorites | TombstonesFinder",
  description: "View and manage your favorite tombstones",
}

export default function FavoritesPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header Component */}
      <HeaderClient />
      
      {/* Background Image Section */}
      <div 
        className="h-64 bg-cover bg-center bg-no-repeat relative"
        style={{
          backgroundImage: "url('/2560(w)x400px(h)_Banner_OldYoungCouple.jpg')"
        }}
      >
        <div className="absolute inset-0 bg-black bg-opacity-40"></div>
        <div className="relative z-10 flex items-center justify-center h-full">
          <div className="text-center text-white">
            <h1 className="text-5xl font-bold mb-4">Your Favorites</h1>
            <p className="text-xl max-w-2xl mx-auto">
              Keep track of the tombstones that caught your attention. Your personal collection of meaningful memorials.
            </p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <FavoritesClientContent />
      </div>
    </div>
  )
}