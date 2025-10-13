import Link from "next/link"
import { FavoritesClientContent } from "./favorites-client.jsx"

export const metadata = {
  title: "Your Favorites | TombstonesFinder",
  description: "View and manage your favorite tombstones",
}

export default function FavoritesPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header Section */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-gray-900 mb-2">
              Your Favorites
            </h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
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