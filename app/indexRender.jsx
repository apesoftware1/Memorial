import React from "react";
import { PremiumListingCard } from "@/components/premium-listing-card";
import { StandardListingCard } from "@/components/standard-listing-card";
import BannerAd from "@/components/BannerAd";
import FeaturedListings from "@/components/FeaturedListings";

const IndexRender = ({
   
    premListings = [],
    featuredListings = [],
    stdListings = [],
  loading = false,
  error = null,
  currentPage = 1,
  setCurrentPage = () => {},
}) => {
  // PAGINATION LOGIC (all from strapiListings)
  const premiumPerPage = 10;
  const standardPerPage = 5;
  const featuredPerPage = 3;

  
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

  // Featured Manufacturer (pick first from premium listings)
  const featuredManufacturer = premiumToShow[0]?.company || null;
  const manufacturerListings = premListings
    .filter((l) => l.company?.name === featuredManufacturer?.name)
    .slice(0, 3);

  // Fallback card generator
  const fallbackCard = (type = "listing") => (
    <div className="border border-gray-300 rounded bg-white p-6 text-center text-gray-500">
      <div className="mb-2 font-bold">No {type} available</div>
      <div className="text-xs">Please check back later or adjust your filters.</div>
    </div>
  );

  if (loading) return <p>Loading...</p>;
  if (error) {
    console.log("GraphQL Errors:", error.graphQLErrors);  // Errors returned by the server
    console.log("Network Error:", error.networkError);     // E.g. CORS or connection failure
    console.log("Extra Info:", error.extraInfo);           // Sometimes available
  }if (error) return <p>Error loading listings, refresh page</p>;

  return (
    <>
      {/* 4. Featured Listings Section */}
      <section className="bg-gray-50 mb-8">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="flex items-center mb-0">
              <div className="flex-grow border-t border-gray-300"></div>
              <h3 className="flex-shrink-0 mx-4 text-center text-gray-600 text-xs font-bold uppercase">FEATURED LISTINGS</h3>
              <div className="flex-grow border-t border-gray-300"></div>
            </div>
            <div className="w-full flex justify-center">
              <span className="text-xs text-gray-500 mt-0 font-bold mb-2" style={{marginTop: '-2px'}}>*Sponsored</span>
            </div>
            <div className="flex overflow-x-auto gap-4 sm:grid sm:grid-cols-2 md:grid-cols-3 snap-x snap-mandatory">
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

      {/* 5. Premium Listings Section (Part 1) */}
      <section className="mb-8">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center mb-0">
            <div className="flex-grow border-t border-gray-300"></div>
            <h3 className="flex-shrink-0 mx-4 text-center text-gray-600 text-xs font-bold uppercase">PREMIUM LISTINGS</h3>
            <div className="flex-grow border-t border-gray-300"></div>
          </div>
          <div className="w-full flex justify-center">
            <span className="text-xs text-gray-500 mt-0 font-bold mb-2" style={{marginTop: '-2px'}}>*Sponsored</span>
          </div>
        </div>
        {premiumFirstHalf.length > 0
          ? premiumFirstHalf.map((item, idx) => (
              <div key={item.id || idx} className="mb-6">
                <PremiumListingCard listing={item} />
              </div>
            ))
          : fallbackCard("premium listings")}
      </section>

      {/* 6. Banner Advertisement */}
      <div className="container mx-auto px-4 mb-8">
        <div className="max-w-4xl mx-auto">
          <BannerAd />
        </div>
      </div>

      {/* 7. Premium Listings Section (Part 2) */}
      <section className="mb-8">
        {premiumSecondHalf.length > 0
          ? premiumSecondHalf.map((item, idx) => (
              <div key={item.id || idx} className="mb-6">
                <PremiumListingCard listing={item} />
              </div>
            ))
          : fallbackCard("premium listings")}
      </section>

      {/* 8. Featured Manufacturer Section */}
      <section className="mb-8">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center mb-0">
            <div className="flex-grow border-t border-gray-300"></div>
            <h3 className="flex-shrink-0 mx-4 text-center text-gray-600 text-xs font-bold uppercase">FEATURED MANUFACTURER</h3>
            <div className="flex-grow border-t border-gray-300"></div>
          </div>
          <div className="w-full flex justify-center">
            <span className="text-xs text-gray-500 mt-0 font-bold mb-2" style={{marginTop: '-2px'}}>*Sponsored</span>
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
                      src={featuredManufacturer.logo?.url || "/placeholder-logo.svg"}
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
            <div className="gap-1 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3">
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
      <section className="mb-8">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center mb-0">
            <div className="flex-grow border-t border-gray-300"></div>
            <h3 className="flex-shrink-0 mx-4 text-center text-gray-600 text-xs font-bold uppercase">STANDARD LISTINGS</h3>
            <div className="flex-grow border-t border-gray-300"></div>
          </div>
          <div className="w-full flex justify-center">
            <span className="text-xs text-gray-500 mt-0 font-bold mb-2" style={{marginTop: '-2px'}}>*Sponsored</span>
          </div>
        </div>
        {standardToShow.length > 0
          ? standardToShow.map((item, idx) => (
              <StandardListingCard key={item.id || idx} listing={item} />
            ))
          : fallbackCard("standard listings")}
      </section>

      {/* 10. Pagination Controls */}
      <div className="flex justify-center my-8">
        <nav className="inline-flex rounded-md shadow">
          <button
            onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
            disabled={currentPage === 1}
            className="py-2 px-4 border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:text-blue-600 disabled:text-gray-300 disabled:cursor-not-allowed"
          >
            Previous
          </button>
          {[...Array(totalPremiumPages)].map((_, idx) => (
            <button
              key={idx + 1}
              onClick={() => setCurrentPage(idx + 1)}
              className={`py-2 px-4 border border-gray-300 bg-white text-sm font-medium ${
                currentPage === idx + 1 ? "text-blue-600 font-bold" : "text-gray-500 hover:text-blue-600"
              }`}
            >
              {idx + 1}
            </button>
          ))}
          <button
            onClick={() => setCurrentPage(Math.min(totalPremiumPages, currentPage + 1))}
            disabled={currentPage === totalPremiumPages}
            className="py-2 px-4 border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:text-blue-600 disabled:text-gray-300 disabled:cursor-not-allowed"
          >
            Next
          </button>
        </nav>
      </div>
    </>
  );
};

export default IndexRender; 