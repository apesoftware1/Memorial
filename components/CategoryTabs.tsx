"use client"

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

const categories = [
  { id: 'tombstones', name: 'TOMBSTONES', href: '/category/tombstones' },
  { id: 'premium', name: 'PREMIUM', href: '/category/premium' },
  { id: 'family', name: 'FAMILY', href: '/category/family' },
  { id: 'child', name: 'CHILD', href: '/category/child' },
  { id: 'head', name: 'HEAD', href: '/category/head' },
  { id: 'cremation', name: 'CREMATION', href: '/category/cremation' },
]

export default function CategoryTabs() {
  const pathname = usePathname()
  const [activeCategory, setActiveCategory] = useState('tombstones')

  return (
    <div className="w-full bg-[#2E2E30] border-b border-gray-200">
      <div className="container mx-auto px-4">
        <div className="flex space-x-8 overflow-x-auto py-4">
          {categories.map((category) => {
            const isActive = activeCategory === category.id
            return (
              <Link
                key={category.id}
                href={category.href}
                className={`whitespace-nowrap text-sm font-medium transition-colors hover:text-[#E6E7E8] ${
                  isActive ? 'text-[#D4AF37] border-b-2 border-[#58585B]' : 'text-[#D4AF37]'
                }`}
                onClick={() => setActiveCategory(category.id)}
              >
                <span className="text-[0.7rem] leading-tight w-full">{category.name}</span>
              </Link>
            )
          })}
        </div>
      </div>
    </div>
  )
} 