"use client"

import { useState } from "react"
import Link from "next/link"
import { Menu, X } from "lucide-react"

export default function ProductDetailsHeader() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen)
  }

  return (
    <header className="bg-gray-900 text-white shadow-md">
      <div className="container mx-auto px-4 py-6">
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <Link href="/" className="text-xl font-bold">
              Memorial Products
            </Link>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex space-x-6">
            <Link href="/" className="hover:text-gray-300">
              Home
            </Link>
            <Link href="#products" className="hover:text-gray-300">
              Products
            </Link>
            <Link href="#featured" className="hover:text-gray-300">
              Featured
            </Link>
            <Link href="#about" className="hover:text-gray-300">
              About
            </Link>
            <Link href="#contact" className="hover:text-gray-300">
              Contact
            </Link>
          </nav>

          {/* Mobile Menu Button */}
          <button className="md:hidden text-white focus:outline-none" onClick={toggleMenu}>
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <nav className="md:hidden mt-4 space-y-3 pb-3">
            <Link href="/" className="block hover:text-gray-300">
              Home
            </Link>
            <Link href="#products" className="block hover:text-gray-300">
              Products
            </Link>
            <Link href="#featured" className="block hover:text-gray-300">
              Featured
            </Link>
            <Link href="#about" className="block hover:text-gray-300">
              About
            </Link>
            <Link href="#contact" className="block hover:text-gray-300">
              Contact
            </Link>
          </nav>
        )}
      </div>
    </header>
  )
} 