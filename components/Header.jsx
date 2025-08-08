"use client"

import { useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { ChevronDown, X } from "lucide-react"
import { useFavorites } from "@/context/favorites-context"
import { usePathname } from "next/navigation"
import { useSession, signOut } from "next-auth/react";

export default function Header({
  mobileMenuOpen,
  handleMobileMenuToggle,
  mobileDropdown,
  handleMobileDropdownToggle,
  onMobileFilterClick,
  showLogout = false,
}) {
  const { totalFavorites } = useFavorites();
  const pathname = usePathname();
  const { data: session } = useSession();

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm">
      <div className="container mx-auto px-0 max-w-4xl">
        <div className="py-3 flex justify-between items-center">
          <div className="flex items-center">
            {/* Mobile Filter Button (left) */}
            {onMobileFilterClick && pathname !== "/" && (
              <button
                className="sm:hidden mr-2 p-2 rounded-md text-gray-700 hover:bg-gray-100 transition-colors"
                onClick={onMobileFilterClick}
                aria-label="Open Filters"
              >
                <Image src="/align-left-svgrepo-com.svg" alt="Open Filters" width={16} height={16} />
              </button>
            )}
            <Link href="/" className="flex items-center -ml-3 px-2 w-full justify-center sm:justify-start">
              <Image
                src="/new files/company logos/TombstonesFinder_logo.svg"
                alt="TombstonesFinder Logo"
                width={464}
                height={70}
                className="h-10 w-auto"
                priority
                unoptimized
              />
            </Link>

            {/* Desktop Navigation with Dropdowns */}
            <nav className="ml-1 hidden md:flex whitespace-nowrap">
              {/* Find a Tombstone Dropdown */}
              <div className="relative group">
                <button className="px-1 py-2 text-xs md:text-sm text-gray-700 hover:text-gray-900 transition-colors flex items-center">
                  Find a Tombstone
                  <ChevronDown className="ml-1 h-3 w-3 md:h-4 md:w-4" />
                </button>
                <div className="absolute left-0 mt-1 min-w-max bg-white rounded-md shadow-lg border border-gray-200 hidden group-hover:block animate-slide-in z-50 px-0 origin-top-left">
                  <div className="py-1 px-0">
                    <Link
                      href="/tombstones-for-sale"
                      className="block px-0 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors whitespace-nowrap"
                    >
                      TOMBSTONES FOR SALE
                    </Link>
                    <Link
                      href="/tombstones-on-special"
                      className="block px-0 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors whitespace-nowrap"
                    >
                      TOMBSTONES ON SPECIAL
                    </Link>
                  </div>
                </div>
              </div>

              {/* Find a Manufacturer Dropdown */}
              <div className="relative group">
                <button className="px-1 py-2 text-xs md:text-sm text-gray-700 hover:text-gray-900 transition-colors flex items-center">
                  Find a Manufacturer
                  <ChevronDown className="ml-1 h-3 w-3 md:h-4 md:w-4" />
                </button>
                <div className="absolute left-0 mt-1 w-48 bg-white rounded-md shadow-lg border border-gray-200 hidden group-hover:block animate-slide-in z-50">
                  <div className="py-1">
                    <Link
                      href="/manufacturers"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                    >
                      MANUFACTURERS
                    </Link>
                  </div>
                </div>
              </div>

              {/* Services Dropdown */}
              <div className="relative group">
                <button className="px-1 py-2 text-xs md:text-sm text-gray-700 hover:text-gray-900 transition-colors flex items-center">
                  Services
                  <ChevronDown className="ml-1 h-3 w-3 md:h-4 md:w-4" />
                </button>
                <div className="absolute left-0 mt-1 min-w-max bg-white rounded-md shadow-lg border border-gray-200 hidden group-hover:block animate-slide-in z-50 px-0 origin-top-left">
                  <div className="py-1 px-0">
                    <Link
                      href="#"
                      className="block px-0 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors whitespace-nowrap"
                    >
                      LET US HANDLE EVERYTHING
                    </Link>
                    <Link
                      href="#"
                      className="block px-0 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors whitespace-nowrap"
                    >
                      TOMBSTONE FINANCE
                    </Link>
                    <Link
                      href="#"
                      className="block px-0 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors whitespace-nowrap"
                    >
                      TOMBSTONE INSTALLATION GUIDE
                    </Link>
                  </div>
                </div>
              </div>

              {/* Favourites Dropdown */}
              <div className="relative group">
                <button className="px-1 py-2 text-xs md:text-sm text-gray-700 hover:text-gray-900 transition-colors flex items-center">
                  Favourites
                  <ChevronDown className="ml-1 h-3 w-3 md:h-4 md:w-4" />
                </button>
                <div className="absolute left-0 mt-1 w-48 bg-white rounded-md shadow-lg border border-gray-200 hidden group-hover:block animate-slide-in z-50">
                  <div className="py-1">
                    <Link
                      href="/favorites"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors flex items-center justify-between"
                    >
                      <span>FAVOURITES</span>
                      {totalFavorites > 0 ? (
                        <span className="bg-amber-500 text-white text-xs px-2 py-0.5 rounded-full">
                          {totalFavorites}
                        </span>
                      ) : null}
                    </Link>
                  </div>
                </div>
              </div>
            </nav>
          </div>

          {/* Log Out Button (if showLogout and authenticated) */}
          {showLogout && session && (
            <button
              className="hidden md:block text-teal-500 text-xs md:text-sm hover:text-teal-600 transition-colors flex items-center"
              onClick={() => signOut({ callbackUrl: '/' })}
            >
              Log Out
            </button>
          )}

          {/* Login/Register Dropdown (default, only if not showLogout) */}
          {!showLogout && (
            <div className="hidden md:block relative group">
              <button className="text-teal-500 text-xs md:text-sm hover:text-teal-600 transition-colors flex items-center">
                Login / Register
                <ChevronDown className="ml-1 h-3 w-3 md:h-4 md:w-4" />
              </button>
              <div className="absolute right-0 mt-1 w-64 bg-white rounded-md shadow-lg border border-gray-200 hidden group-hover:block animate-slide-in z-50">
                <div className="py-1">
                  <Link
                    href="/manufacturers/login-page"
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                  >
                    MANUFACTURER LOGIN PORTAL
                  </Link>
                </div>
              </div>
            </div>
          )}

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2 rounded-md text-gray-700 hover:bg-gray-100 transition-colors"
            onClick={handleMobileMenuToggle}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile Navigation - Slide from right */}
      <nav
        className={`fixed top-0 right-0 bottom-0 w-3/4 max-w-xs bg-white px-4 py-16 md:hidden border-l border-gray-200 shadow-lg z-50 transform transition-transform duration-300 ease-in-out ${mobileMenuOpen ? "translate-x-0" : "translate-x-full"}`}
      >
        <button
          className="absolute top-4 right-4 p-2 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors"
          onClick={handleMobileMenuToggle}
        >
          <X className="h-4 w-4 text-gray-600" />
        </button>

        {/* Mobile Find a Tombstone */}
        <div className="py-2">
          <button
            className="flex justify-between items-center w-full text-gray-700 hover:text-gray-900 transition-colors"
            onClick={() => handleMobileDropdownToggle("tombstone")}
          >
            <span>Find a Tombstone</span>
            <ChevronDown
              className={`h-4 w-4 transition-transform duration-200 ${mobileDropdown === "tombstone" ? "transform rotate-180" : ""}`}
            />
          </button>
          {mobileDropdown === "tombstone" && (
            <div className="pl-4 mt-2 space-y-2">
              <Link
                href="/tombstones-for-sale"
                className="block py-1 text-gray-600 hover:text-gray-900 transition-colors"
              >
                TOMBSTONES FOR SALE
              </Link>
              <Link
                href="/tombstones-on-special"
                className="block py-1 text-gray-600 hover:text-gray-900 transition-colors"
              >
                TOMBSTONES ON SPECIAL
              </Link>
            </div>
          )}
        </div>

        {/* Mobile Find a Manufacturer */}
        <div className="py-2">
          <button
            className="flex justify-between items-center w-full text-gray-700 hover:text-gray-900 transition-colors"
            onClick={() => handleMobileDropdownToggle("manufacturer")}
          >
            <span>Find a Manufacturer</span>
            <ChevronDown
              className={`h-4 w-4 transition-transform duration-200 ${mobileDropdown === "manufacturer" ? "transform rotate-180" : ""}`}
            />
          </button>
          {mobileDropdown === "manufacturer" && (
            <div className="pl-4 mt-2">
              <Link href="/manufacturers" className="block py-1 text-gray-600 hover:text-gray-900 transition-colors">
                MANUFACTURERS
              </Link>
            </div>
          )}
        </div>

        {/* Mobile Services */}
        <div className="py-2">
          <button
            className="flex justify-between items-center w-full text-gray-700 hover:text-gray-900 transition-colors"
            onClick={() => handleMobileDropdownToggle("services")}
          >
            <span>Services</span>
            <ChevronDown
              className={`h-4 w-4 transition-transform duration-200 ${mobileDropdown === "services" ? "transform rotate-180" : ""}`}
            />
          </button>
          {mobileDropdown === "services" && (
            <div className="pl-4 mt-2 space-y-2">
              <Link href="#" className="block py-1 text-gray-600 hover:text-gray-900 transition-colors">
                LET US HANDLE EVERYTHING
              </Link>
              <Link href="#" className="block py-1 text-gray-600 hover:text-gray-900 transition-colors">
                TOMBSTONE FINANCE
              </Link>
              <Link
                href="#"
                className="block py-1 text-gray-600 hover:text-gray-900 transition-colors"
              >
                TOMBSTONE INSTALLATION GUIDE
              </Link>
            </div>
          )}
        </div>

        {/* Mobile Favourites */}
        <div className="py-2">
          <button
            className="flex justify-between items-center w-full text-gray-700 hover:text-gray-900 transition-colors"
            onClick={() => handleMobileDropdownToggle("favourites")}
          >
            <span>Favourites</span>
            {totalFavorites > 0 ? (
              <span className="bg-amber-500 text-white text-xs px-2 py-0.5 rounded-full mr-2">
                {totalFavorites}
              </span>
            ) : (
              <ChevronDown
                className={`h-4 w-4 transition-transform duration-200 ${mobileDropdown === "favourites" ? "transform rotate-180" : ""}`}
              />
            )}
          </button>
        </div>
      </nav>
    </header>
  )
}