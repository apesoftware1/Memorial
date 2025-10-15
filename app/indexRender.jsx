import React from "react";
import { useRouter, useSearchParams } from 'next/navigation';
import { PremiumListingCard } from "@/components/premium-listing-card";
import { StandardListingCard } from "@/components/standard-listing-card";
import BannerAd from "@/components/BannerAd";
import FeaturedListings from "@/components/FeaturedListings";
import { useState, useRef, useEffect, useMemo } from "react";
import { PageLoader, CardSkeleton } from "@/components/ui/loader";
import { useQuery } from "@apollo/client";
import { GET_MANUFACTURERS } from "@/graphql/queries/getManufacturers";

const IndexRender = ({
   
    premListings = [],
    featuredListings = [],
    stdListings = [],
  loading = false,
  error = null,
  currentPage = 1,
  setCurrentPage = () => {},
}) => {
  // State for featured listings pagination
  const [featuredActiveIndex, setFeaturedActiveIndex] = useState(0);
  const featuredScrollRef = useRef(null);
  const listingsSectionRef = useRef(null);
  const router = useRouter();
  const searchParams = useSearchParams();

  // Function to handle featured listings scroll
  const handleFeaturedScroll = () => {
    if (featuredScrollRef.current) {
      const scrollLeft = featuredScrollRef.current.scrollLeft;
      const cardWidth = 320; // Card width + gap
      const newIndex = Math.round(scrollLeft / cardWidth);
      setFeaturedActiveIndex(Math.min(newIndex, 2)); // Max 3 cards (0, 1, 2)
    }
  };

  // Function to scroll to specific featured card
  const scrollToFeaturedCard = (index) => {
    if (featuredScrollRef.current) {
      const cardWidth = 320;
      featuredScrollRef.current.scrollTo({
        left: index * cardWidth,
        behavior: 'smooth'
      });
    }
  };

  useEffect(() => {
    const container = featuredScrollRef.current;
    if (container) {
      container.addEventListener('scroll', handleFeaturedScroll);
      return () => {
        container.removeEventListener('scroll', handleFeaturedScroll);
      };
    }
  }, []);

  // Initialize page from URL on mount only
  useEffect(() => {
    if (!searchParams) return;
    const pageFromUrl = parseInt(searchParams.get('page') || '1', 10);
    setCurrentPage(pageFromUrl);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Only run on mount

  // Helper to change page and scroll to top of listings section
  const goToPage = (nextPage) => {
    const clamped = Math.max(1, nextPage); // allow moving beyond local dataset; parent can fetch
    setCurrentPage(clamped);
    
    // Update URL with page parameter without full navigation
    const url = new URL(window.location.href);
    url.searchParams.set('page', clamped.toString());
    window.history.pushState({}, '', url.toString());
    
    // Delay scroll to ensure DOM has updated with new page content
    setTimeout(() => {
      // Scroll to the top of the listings section using the ref
      if (listingsSectionRef.current) {
        listingsSectionRef.current.scrollIntoView({ behavior: 'smooth' });
      } else {
        // Fallback to scrolling to top of page
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    }, 100); // Small delay to ensure DOM updates
  };

  // PAGINATION LOGIC (all from strapiListings)
  const premiumPerPage = 10;
  const standardPerPage = 5;
  const featuredPerPage = 3;

  
  // Featured listings are always shown on all pages (not paginated)
  const featuredToShow = featuredListings.slice(0, featuredPerPage);
  
  // Premium Listings (paginated)
  const premiumStart = (currentPage - 1) * premiumPerPage;
  const premiumEnd = premiumStart + premiumPerPage;
  const premiumToShow = premListings.slice(premiumStart, premiumEnd);
  const premiumFirstHalf = premiumToShow.slice(0, 5);
  const premiumSecondHalf = premiumToShow.slice(5, 10);
  const totalPremiumPages = Math.max(1, Math.ceil(premListings.length / premiumPerPage));

  // Standard Listings (paginated)
  const standardStart = (currentPage - 1) * standardPerPage;
  const standardEnd = standardStart + standardPerPage;
  const standardToShow = stdListings.slice(standardStart, standardEnd);
  
  // Calculate total pages based on both premium and standard listings
  const totalStandardPages = Math.max(1, Math.ceil(stdListings.length / standardPerPage));
  const totalPages = Math.max(totalPremiumPages, totalStandardPages);
  

  // Featured Manufacturer (pick first from premium listings)
  const featuredManufacturer = premiumToShow[0]?.company || null;
  const manufacturerListings = premListings
    .filter((l) => l.company?.name === featuredManufacturer?.name)
    .slice(0, 3);

  // Fetch companies to build a banner pool
  const { data: manufacturersData } = useQuery(GET_MANUFACTURERS);
  // Build a pool of usable banner URLs from company.bannerAd.url (trim to avoid empty strings)
  const bannerPool = useMemo(
    () =>
      (manufacturersData?.companies || [])
        .map((c) => {
          const u = c.bannerAd?.url;
          return typeof u === "string" ? u.trim() : null;
        })
        .filter((u) => typeof u === "string" && u.length > 0),
    [manufacturersData]
  );

  // Randomly select a banner when the pool changes
  const [selectedBanner, setSelectedBanner] = useState(null);
  useEffect(() => {
    if (bannerPool.length > 0) {
      const randomIndex = Math.floor(Math.random() * bannerPool.length);
      setSelectedBanner(bannerPool[randomIndex]); // selectedBanner is a non-empty string URL
    } else {
      setSelectedBanner(null);
    }
  }, [bannerPool]);

  // Fallback card generator
  const fallbackCard = (type = "listing") => (
    <CardSkeleton className="h-full" />
  );

  if (loading) return <PageLoader text="Loading listings..." />;
  if (error) {
  }
  if (error) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <p className="text-red-600 font-medium mb-4">Error loading listings</p>
        <button 
          onClick={() => window.location.reload()} 
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          Refresh Page
        </button>
      </div>
    </div>
  );

  // Inside the IndexRender component's return JSX
  return (
    <>
      {/* 4. Featured Listings Section */}
      <section ref={listingsSectionRef} className="mt-0 bg-gray-50 pb-0 mb-0 pt-2">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="flex items-center mb-0">
              <div className="flex-grow border-t border-gray-300"></div>
              <h3 className="flex-shrink-0 mx-4 text-center text-gray-600 text-xs font-bold uppercase">FEATURED LISTINGS</h3>
              <div className="flex-grow border-t border-gray-300"></div>
            </div>
            <div className="w-full flex justify-center">
              <span className="text-xs text-gray-500 mt-0 font-bold mb-6" style={{marginTop: '-2px'}}>*Sponsored</span>
            </div>
            
            {/* Mobile: Horizontal scrolling cards */}
            <div className="md:hidden">
              <div className="flex overflow-x-auto gap-4 snap-x snap-mandatory scrollbar-hide" ref={featuredScrollRef}>
                {[0, 1, 2].map(idx =>
                  featuredListings && featuredListings[idx] ? (
                    <div key={featuredListings[idx].id || idx} className="flex-shrink-0 w-80 snap-start">
                      <FeaturedListings listing={featuredListings[idx]} />
                    </div>
                  ) : (
                    <div key={"fallback-" + idx} className="flex-shrink-0 w-80 snap-start flex justify-center">
                      {fallbackCard("featured listings")}
                    </div>
                  )
                )}
              </div>
              {/* Pagination Dots - Mobile only */}
              <div className="flex justify-center mt-4 space-x-4 mb-4">
                {[0, 1, 2].map((index) => (
                  <button
                    key={index}
                    onClick={() => scrollToFeaturedCard(index)}
                    className={`w-5 h-5 rounded-full transition-colors duration-200 shadow-md ${
                      featuredActiveIndex === index ? 'bg-blue-700 ring-4 ring-blue-300' : 'bg-gray-400 hover:bg-blue-500'
                    }`}
                    aria-label={`Go to card ${index + 1}`}
                  ></button>
                ))}
              </div>
            </div>

            {/* Desktop: Grid layout */}
            <div className="hidden md:grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[0, 1, 2].map(idx =>
                featuredListings && featuredListings[idx] ? (
                  <FeaturedListings key={featuredListings[idx].id || idx} listing={featuredListings[idx]} />
                ) : (
                  <div key={"fallback-" + idx} className="flex-1 flex justify-center">
                    {fallbackCard("featured listings")}
                  </div>
                )
              )}
            </div>
          </div>
        </div>
      </section>
.
      {/* 5. Premium Listings Section (Part 1) */}
      <section className="w-full bg-gray-50 py-2 mb-0 mt-0 pt-0">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center mb-0">
            <div className="flex-grow border-t border-gray-300"></div>
            <h3 className="flex-shrink-0 mx-4 text-center text-gray-600 text-xs font-bold uppercase">PREMIUM LISTINGS</h3>
            <div className="flex-grow border-t border-gray-300"></div>
          </div>
          <div className="w-full flex justify-center">
            <span className="text-xs text-gray-500 mt-0 font-bold mb-0" style={{marginTop: '-2px'}}>*Sponsored</span>
          </div>
        </div>
        {premiumFirstHalf.length > 0
          ? premiumFirstHalf.map((item, idx) => (
              <div key={item.id || idx} className={`${idx === 0 ? 'mb-4 -mt-2' : idx === 1 ? 'mb-6 mt-2' : 'mb-6'}`}>
                <PremiumListingCard listing={item} />
              </div>
            ))
          : fallbackCard("premium listings")}
      </section>

      {/* 6. second Banner Advertisement */}
      <div className="w-full bg-gray-50 py-4 mt-0 mb-0 pt-0">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            {selectedBanner && (
              <BannerAd
                bannerAd={selectedBanner}
                mobileContainerClasses="w-full h-28"
                desktopContainerClasses="max-w-4xl h-24"
              />
            )}
          </div>
        </div>
      </div>

      {/* 7. Premium Listings Section (Part 2) */}
      <section className="mt-0 pt-0 pb-2 mb-0 bg-gray-50">
        {premiumSecondHalf.length > 0
          ? premiumSecondHalf.map((item, idx) => (
              <div 
                key={item.id || idx} 
                className={idx === 0 ? "mb-4 -mt-2" : idx === 1 ? "mb-6 mt-2" : "mb-6"}
              >
                <PremiumListingCard listing={item} />
              </div>
            ))
          : fallbackCard("premium listings")}
      </section>

      {/* 8. Featured Manufacturer Section */}
      <section className="mt-0 pt-2 bg-gray-50 mb-0 pb-8">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center mb-0">
            <div className="flex-grow border-t border-gray-300"></div>
            <h3 className="flex-shrink-0 mx-4 text-center text-gray-600 text-xs font-bold uppercase">FEATURED MANUFACTURER</h3>
            <div className="flex-grow border-t border-gray-300"></div>
          </div>
          <div className="w-full flex justify-center">
            <span className="text-xs text-gray-500 mt-0 font-bold mb-6" style={{marginTop: '-2px'}}>*Sponsored</span>
          </div>
          <div className="border border-gray-300 rounded bg-white p-4">
            {featuredManufacturer ? (
              <>
                <div className="flex flex-col sm:flex-row justify-between items-center gap-4 sm:gap-0 mb-4">
                  <div>
                    <h4 className="font-bold text-gray-800 text-xl mb-1">{featuredManufacturer.name}</h4>
                  </div>
                  <div>
                    <img
                      src={featuredManufacturer.logoUrl || "/placeholder-logo.svg"}
                      alt={`${featuredManufacturer.name} Logo`}
                      width={80}
                      height={80}
                      className="rounded-full"
                    />
                  </div>
                </div>
                <div className="text-blue-600 text-sm mb-4">{featuredManufacturer.location}</div>
              </>
            ) : fallbackCard("manufacturer")}
            
            {/* Mobile: Horizontal scrolling cards */}
            <div className="md:hidden">
              <div className="flex overflow-x-auto gap-4 snap-x snap-mandatory scrollbar-hide">
                {[0, 1, 2].map(idx =>
                  manufacturerListings && manufacturerListings[idx] ? (
                    <div key={manufacturerListings[idx].id || idx} className="flex-shrink-0 w-80 snap-start">
                      <FeaturedListings listing={manufacturerListings[idx]} />
                    </div>
                  ) : (
                    <div key={"fallback-manufacturer-" + idx} className="flex-shrink-0 w-80 snap-start flex justify-center">
                      {fallbackCard("manufacturer listings")}
                    </div>
                  )
                )}
              </div>
              {/* Pagination Dots - Mobile only */}
              <div className="flex justify-center mt-4 space-x-2">
                {[0, 1, 2].map((index) => (
                  <div 
                    key={index} 
                    className="w-3 h-3 rounded-full bg-gray-300"
                  ></div>
                ))}
              </div>
            </div>

            {/* Desktop: Grid layout */}
            <div className="hidden md:grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[0, 1, 2].map(idx =>
                manufacturerListings && manufacturerListings[idx] ? (
                  <FeaturedListings key={manufacturerListings[idx].id || idx} listing={manufacturerListings[idx]} />
                ) : (
                  <div key={"fallback-manufacturer-" + idx} className="flex-1 flex justify-center">
                    {fallbackCard("manufacturer listings")}
                  </div>
                )
              )}
            </div>
          </div>
        </div>
      </section>

      {/* 9. Standard Listings Section */}
      <section className="mt-0 pt-2 bg-gray-50 mb-8">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center mb-0">
            <div className="flex-grow border-t border-gray-300"></div>
            <h3 className="flex-shrink-0 mx-4 text-center text-gray-600 text-xs font-bold uppercase">STANDARD LISTINGS</h3>
            <div className="flex-grow border-t border-gray-300"></div>
          </div>
          <div className="w-full flex justify-center">
            <span className="text-xs text-gray-500 mt-0 font-bold mb-6" style={{marginTop: '-2px'}}>*Sponsored</span>
          </div>
        </div>
        {standardToShow.length > 0 ? (
          <div className="space-y-6">
            {standardToShow.map((item, idx) => (
              <StandardListingCard key={item.id || idx} listing={item} />
            ))}
          </div>
        ) : (
          fallbackCard("standard listings")
        )}
      </section>

      {/* 10. Pagination Controls */}
      <div className="flex flex-col items-center my-8">
        {/* Page indicator */}
        <div className="mb-4 text-sm text-gray-600">
          Page {currentPage} of {totalPages}
        </div>
        <nav className="inline-flex rounded-md shadow">
          <button
            onClick={() => goToPage(currentPage - 1)}
            disabled={currentPage === 1}
            className="py-2 px-4 border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:text-blue-600 disabled:text-gray-300 disabled:cursor-not-allowed"
            aria-label="Previous page"
          >
            Previous
          </button>
          {totalPages <= 5 ? (
            // Show all page numbers if 5 or fewer pages
            [...Array(totalPages)].map((_, idx) => (
              <button
                key={idx + 1}
                onClick={() => goToPage(idx + 1)}
                className={`py-2 px-4 border border-gray-300 bg-white text-sm font-medium ${
                  currentPage === idx + 1 ? "text-blue-600 font-bold bg-blue-50" : "text-gray-500 hover:text-blue-600"
                }`}
                aria-label={`Page ${idx + 1}`}
                aria-current={currentPage === idx + 1 ? "page" : undefined}
              >
                {idx + 1}
              </button>
            ))
          ) : (
            // Show limited page numbers with ellipsis for more than 5 pages
            <>
              {/* First page always shown */}
              <button
                onClick={() => goToPage(1)}
                className={`py-2 px-4 border border-gray-300 bg-white text-sm font-medium ${
                  currentPage === 1 ? "text-blue-600 font-bold bg-blue-50" : "text-gray-500 hover:text-blue-600"
                }`}
                aria-label="Page 1"
                aria-current={currentPage === 1 ? "page" : undefined}
              >
                1
              </button>
              
              {/* Show ellipsis if not near the start */}
              {currentPage > 3 && (
                <span className="py-2 px-4 border border-gray-300 bg-white text-sm text-gray-500">
                  ...
                </span>
              )}
              
              {/* Pages around current page */}
              {[...Array(totalPages)].map((_, idx) => {
                const pageNum = idx + 1;
                // Show current page and one page before/after
                if (
                  (pageNum > 1 && pageNum < totalPages) && // Not first or last page
                  (Math.abs(pageNum - currentPage) <= 1) // Within 1 of current page
                ) {
                  return (
                    <button
                      key={pageNum}
                      onClick={() => goToPage(pageNum)}
                      className={`py-2 px-4 border border-gray-300 bg-white text-sm font-medium ${
                        currentPage === pageNum ? "text-blue-600 font-bold bg-blue-50" : "text-gray-500 hover:text-blue-600"
                      }`}
                      aria-label={`Page ${pageNum}`}
                      aria-current={currentPage === pageNum ? "page" : undefined}
                    >
                      {pageNum}
                    </button>
                  );
                }
                return null;
              })}
              
              {/* Show ellipsis if not near the end */}
              {currentPage < totalPages - 2 && (
                <span className="py-2 px-4 border border-gray-300 bg-white text-sm text-gray-500">
                  ...
                </span>
              )}
              
              {/* Last page always shown */}
              <button
                onClick={() => goToPage(totalPages)}
                className={`py-2 px-4 border border-gray-300 bg-white text-sm font-medium ${
                  currentPage === totalPages ? "text-blue-600 font-bold bg-blue-50" : "text-gray-500 hover:text-blue-600"
                }`}
                aria-label={`Page ${totalPages}`}
                aria-current={currentPage === totalPages ? "page" : undefined}
              >
                {totalPages}
              </button>
            </>
          )}
          <button
            onClick={() => goToPage(currentPage + 1)}
            disabled={currentPage >= totalPages}
            className="py-2 px-4 border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:text-blue-600 disabled:text-gray-300 disabled:cursor-not-allowed"
            aria-label="Next page"
          >
            Next
          </button>
        </nav>
      </div>
    </>
  );
};

export default IndexRender;