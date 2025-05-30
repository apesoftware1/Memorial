"use client"

import { useState } from 'react'
import { Search } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function SearchForm() {
  const [searchQuery, setSearchQuery] = useState('')

  const handleSubmit = (e) => {
    e.preventDefault()
    // Handle search submission
    console.log('Searching for:', searchQuery)
  }

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-2xl mx-auto">
      <div className="relative flex items-center">
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search for tombstones, memorials, or manufacturers..."
          className="w-full px-4 py-3 pr-12 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
        <Button
          type="submit"
          className="absolute right-2 p-2 text-gray-500 hover:text-blue-600"
        >
          <Search className="w-5 h-5" />
        </Button>
      </div>
    </form>
  )
} 