"use client"

import { useState, useEffect, useRef } from "react"
import Image from "next/image"
import Link from "next/link"
import { ChevronDown, X, Filter, Heart } from "lucide-react"
import { useFavorites } from "@/context/favorites-context.jsx"
import { usePathname } from "next/navigation"
import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function Header({
  mobileMenuOpen,
  handleMobileMenuToggle,
  mobileDropdown,
  handleMobileDropdownToggle,
  onMobileFilterClick,
  showLogout = false,
  autoHideOnScroll = false,
}) {
  const { totalFavorites } = useFavorites();
  const pathname = usePathname();
  const { data: session } = useSession();
  const router = useRouter();
  
  const showMobileFilter = onMobileFilterClick && pathname !== "/";
  
  // Scroll behavior state
  const [isVisible, setIsVisible] = useState(true);
  const lastScrollY = useRef(0);

  useEffect(() => {
    if (!autoHideOnScroll) {
      setIsVisible(true);
      return;
    }

    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      
      // Always show at the top
      if (currentScrollY < 50) {
        setIsVisible(true);
        lastScrollY.current = currentScrollY;
        return;
      }

      // Hide when scrolling down, show when scrolling up
      if (currentScrollY > lastScrollY.current && currentScrollY > 50) {
        setIsVisible(false);
      } else {
        setIsVisible(true);
      }
      lastScrollY.current = currentScrollY;
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [autoHideOnScroll]);

  // Custom logout function to ensure proper cleanup
  const handleLogout = async () => {
    try {
      // Clear any localStorage data
      localStorage.removeItem("manufacturerSession");
      localStorage.removeItem("advertCreatorCompany");
      
      // Clear sessionStorage data
      sessionStorage.removeItem("advertCreatorCompany");
      
      // Sign out with NextAuth (this will automatically clear the session cookies)
      await signOut({ 
        callbackUrl: '/',
        redirect: true 
      });
    } catch (error) {
      console.error('Logout error:', error);
      // Fallback: force redirect to home page
      router.push('/');
    }
  };

  return (
    <>
      <header 
        className={`bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm transition-transform duration-300 ease-in-out ${
          !isVisible ? '-translate-y-full' : 'translate-y-0'
        }`}
      >
        <div className="container mx-auto px-0 max-w-6xl">
          <div className="py-3 flex justify-between items-center relative min-h-[64px]">
            
            {/* Left Side Container: Mobile Filter & Desktop Logo/Nav */}
            <div className="flex items-center">
              {/* Mobile Filter Button */}
              {showMobileFilter && (
                <button
                  className="sm:hidden mr-2 p-2 rounded-md text-[#005D77] hover:bg-gray-100 transition-colors z-20 relative"
                  onClick={onMobileFilterClick}
                  aria-label="Open Filters"
                >
                  <Filter className="h-5 w-5" />
                </button>
              )}
              
              {/* Desktop Logo & Navigation */}
              <div className="hidden md:flex items-center gap-6">
                 <Link href="/" className="flex items-center px-0">
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
                
                <nav className="flex whitespace-nowrap items-center gap-1">
                  {/* Find a Tombstone Dropdown */}
                  <div className="relative group">
                    <button className="px-3 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 transition-colors flex items-center">
                      Find a Tombstone
                      <ChevronDown className="ml-1 h-4 w-4" />
                    </button>
                    <div className="absolute left-0 top-full min-w-max bg-white rounded-none overflow-hidden shadow-xl hidden group-hover:block animate-slide-in z-50 px-0 origin-top-left">
                      <div className="p-0">
                        <Link
                          href="/tombstones-for-sale"
                          className="block w-full px-4 py-2 text-sm text-gray-700 hover:bg-amber-500 hover:text-white transition-colors whitespace-nowrap"
                        >
                          TOMBSTONES
                        </Link>
                        <Link
                          href="/tombstones-on-special"
                          className="block w-full px-4 py-2 text-sm text-gray-700 hover:bg-amber-500 hover:text-white transition-colors whitespace-nowrap"
                        >
                          TOMBSTONES ON SPECIAL
                        </Link>
                      </div>
                    </div>
                  </div>

                  {/* Find a Manufacturer Dropdown */}
                  <div className="relative group">
                    <button className="px-3 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 transition-colors flex items-center">
                      Find a Manufacturer
                      <ChevronDown className="ml-1 h-4 w-4" />
                    </button>
                    <div className="absolute left-0 top-full w-48 bg-white rounded-none overflow-hidden shadow-xl hidden group-hover:block animate-slide-in z-50">
                      <div className="p-0">
                        <Link
                          href="/manufacturers"
                          className="block w-full px-4 py-2 text-sm text-gray-700 hover:bg-amber-500 hover:text-white transition-colors"
                        >
                          MANUFACTURERS
                        </Link>
                      </div>
                    </div>
                  </div>

                  {/* Services Dropdown */}
                  <div className="relative group">
                    <button className="px-3 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 transition-colors flex items-center">
                      Services
                      <ChevronDown className="ml-1 h-4 w-4" />
                    </button>
                    <div className="absolute left-0 top-full min-w-max bg-white rounded-none overflow-hidden shadow-xl hidden group-hover:block animate-slide-in z-50 px-0 origin-top-left">
                      <div className="p-0">
                        <Link
                          href="/blog"
                          className="block w-full px-4 py-2 text-sm text-gray-700 hover:bg-amber-500 hover:text-white transition-colors whitespace-nowrap"
                        >
                          INSIGHTS , GUIDES & BLOGS
                        </Link>
                        <Link
                          href="/services/tombstone-finance"
                          className="block w-full px-4 py-2 text-sm text-gray-700 hover:bg-amber-500 hover:text-white transition-colors whitespace-nowrap"
                        >
                          TOMBSTONE FINANCE
                        </Link>
                        <Link
                          href="/services/installation-guide"
                          className="block w-full px-4 py-2 text-sm text-gray-700 hover:bg-amber-500 hover:text-white transition-colors whitespace-nowrap"
                        >
                          TOMBSTONE INSTALLATION GUIDE
                        </Link>
                        <Link
                          href="/services/life-insurance"
                          className="block w-full px-4 py-2 text-sm text-gray-700 hover:bg-amber-500 hover:text-white transition-colors"
                        >
                          LIFE INSURANCE
                        </Link>
                      </div>
                    </div>
                  </div>

                  {/* Favourites Dropdown */}
                  <div className="relative group">
                    <button className="px-3 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 transition-colors flex items-center">
                      Favourites
                      <ChevronDown className="ml-1 h-4 w-4" />
                    </button>
                    <div className="absolute left-0 top-full w-48 bg-white rounded-none overflow-hidden shadow-xl hidden group-hover:block animate-slide-in z-50">
                      <div className="p-0">
                        <Link
                          href="/favorites"
                          className="flex w-full px-4 py-2 text-sm text-gray-700 hover:bg-amber-500 hover:text-white transition-colors items-center justify-between"
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
            </div>

            {/* Center: Logo (Mobile Only) */}
            <div className={`absolute top-1/2 transform -translate-y-1/2 md:hidden ${
              showMobileFilter 
                ? "left-[40%] -translate-x-1/2" 
                : "left-4"
            }`}>
              <Link href="/" className="flex items-center justify-center">
                <Image
                  src="/new files/company logos/TombstonesFinder_logo.svg"
                  alt="TombstonesFinder Logo"
                  width={464}
                  height={70}
                  className={showMobileFilter ? "h-8 w-auto" : "h-10 w-auto"} // Slightly smaller on mobile when centered, larger when on left
                  priority
                  unoptimized
                />
              </Link>
            </div>

            {/* Right Side: Actions */}
            <div className="flex items-center gap-4 ml-auto z-10">
              {/* Mobile Heart Icon (Conditional) */}
              {totalFavorites > 0 && (
                <Link href="/favorites" className="md:hidden text-gray-700 flex items-center relative mr-2">
                  <Heart className="h-5 w-5 text-amber-500 fill-amber-500" />
                  <span className="absolute -bottom-1 -right-1 text-[#005D77] text-[11px] font-bold leading-none">
                    {totalFavorites}
                  </span>
                </Link>
              )}

              {/* Log Out Button (if showLogout and authenticated) */}
              {showLogout && session && (
                <button
                  className="hidden md:block text-teal-500 text-xs md:text-sm hover:text-teal-600 transition-colors flex items-center"
                  onClick={handleLogout}
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
                  <div className="absolute right-0 top-full w-64 bg-white rounded-none overflow-hidden shadow-xl hidden group-hover:block animate-slide-in z-50">
                    <div className="p-0">
                      <Link
                        href="/manufacturers/login-page"
                        className="block w-full px-4 py-2 text-sm text-gray-700 hover:bg-amber-500 hover:text-white transition-colors"
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
        </div>
      </header>

      {/* Mobile Navigation - Slide from right */}
      <nav
        className={`fixed top-0 right-0 bottom-0 w-3/4 max-w-xs bg-white px-4 py-16 md:hidden border-l border-gray-200 shadow-lg z-[60] transform transition-transform duration-300 ease-in-out ${mobileMenuOpen ? "translate-x-0" : "translate-x-full"}`}
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
                TOMBSTONES
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
              <Link href="/blog" className="block py-1 text-gray-600 hover:text-gray-900 transition-colors">
                Insights, Guides & blogs
              </Link>
              <Link href="#" className="block py-1 text-gray-600 hover:text-gray-900 transition-colors">
                LET US HANDLE EVERYTHING
              </Link>
              <Link href="/services/tombstone-finance" className="block py-1 text-gray-600 hover:text-gray-900 transition-colors">
                TOMBSTONE FINANCE
              </Link>
              <Link
                href="/services/installation-guide"
                className="block py-1 text-gray-600 hover:text-gray-900 transition-colors"
              >
                TOMBSTONE INSTALLATION GUIDE
              </Link>
              <Link
                href="/services/life-insurance"
                className="block py-1 text-gray-600 hover:text-gray-900 transition-colors"
              >
                LIFE INSURANCE
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
          {mobileDropdown === "favourites" && (
            <div className="pl-4 mt-2">
              <Link
                href="/favorites"
                className="block py-1 text-gray-600 hover:text-gray-900 transition-colors"
                onClick={handleMobileMenuToggle}
              >
                MY FAVORITES ({totalFavorites})
              </Link>
            </div>
          )}
        </div>
      </nav>
    </>
  )
}