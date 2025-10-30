"use client";

import { useState, useEffect, useRef } from "react";
import { Search } from "lucide-react";
import { useRouter } from "next/navigation";

export default function SearchForm({ 
  onQueryChange, 
  onSearchResults, 
  onSubmit,
  router: passedRouter,
  selectedCategory,
  categories,
  activeTab,
  currentQuery: passedCurrentQuery,
  onTypingChange // notify parent to hide/show surrounding UI
}) {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const router = useRouter();
  const formRef = useRef(null);

  // Use passed currentQuery if available, otherwise use local state
  const currentQuery = passedCurrentQuery || searchQuery;

  // Filter criteria for mock search
  const filterCriteria = [
    "title",
    "company",
    "style",
    "slabStyle",
    "stoneType",
    "color",
    "customization",
  ];

  // Mock listings (replace with real API later)
  const mockListings = Array(30)
    .fill()
    .map((_, i) => ({
      id: i + 1,
      title: i % 5 === 0 ? `Mausoleum Design ${i + 1}` : `Tombstone Design ${i + 1}`,
      company: { name: `Company ${Math.floor(i / 3) + 1}` },
      style: i % 3 === 0 ? "Modern" : i % 3 === 1 ? "Traditional" : "Contemporary",
      slabStyle: i % 4 === 0 ? "Flat" : i % 4 === 1 ? "Slant" : i % 4 === 2 ? "Upright" : "Bevel",
      stoneType: i % 3 === 0 ? "Granite" : i % 3 === 1 ? "Marble" : "Bronze",
      color: i % 5 === 0 ? "Black" : i % 5 === 1 ? "Gray" : i % 5 === 2 ? "White" : i % 5 === 3 ? "Blue" : "Red",
      customization: i % 2 === 0 ? "Available" : "Limited",
    }));

  // Filter listings based on query
  const filterListings = (query) => {
    if (!query.trim()) return mockListings;

    const lowerQuery = query.toLowerCase();

    return mockListings.filter((listing) =>
      filterCriteria.some((criteria) => {
        if (criteria === "company") return listing.company.name.toLowerCase().includes(lowerQuery);
        return listing[criteria] && listing[criteria].toLowerCase().includes(lowerQuery);
      })
    );
  };

  // Perform search and update results
  const performSearch = (query) => {
    setIsSearching(true);

    setTimeout(() => {
      const filtered = filterListings(query).slice(0, 19); // limit to 19 results
      setSearchResults(filtered);

      if (onSearchResults) onSearchResults(filtered);
      setIsSearching(false);
    }, 300);
  };

  // Handle form submission (Enter key)
  const handleSubmit = (e) => {
    e.preventDefault();
    if (onQueryChange) onQueryChange(searchQuery); // update parent with current query
    performSearch(searchQuery);
    
    // Call onSubmit handler if provided (for navigation)
    if (onSubmit) {
      onSubmit(searchQuery);
    }
  };

  // Live search as user types (debounced)
  useEffect(() => {
    const timer = setTimeout(() => {
      performSearch(searchQuery);
      if (onQueryChange) onQueryChange(searchQuery); // notify parent of current query
    }, 500);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Derived typing state
  const isTyping = searchQuery.trim().length > 0;

  // Notify parent of typing state instead of manipulating DOM directly
  useEffect(() => {
    if (typeof onTypingChange === 'function') {
      onTypingChange(isTyping);
    }
  }, [isTyping, onTypingChange]);

  // Listen for external reset requests from the search container
  useEffect(() => {
    const handleExternalReset = () => {
      setSearchQuery("");
      setSearchResults([]);
      setIsSearching(false);
      if (onQueryChange) onQueryChange("");
    };
    if (typeof window !== "undefined") {
      window.addEventListener("searchform:reset", handleExternalReset);
    }
    return () => {
      if (typeof window !== "undefined") {
        window.removeEventListener("searchform:reset", handleExternalReset);
      }
    };
  }, [onQueryChange]);

  // Hide specified elements when the button appears below the form
  // useEffect(() => {
  //   const labelsToHide = [
  //     "Min Price",
  //     "Max Price",
  //     "Location",
  //     "Head Style",
  //     "+ More Options",
  //   ];
  //
  //   const toggleElements = (hide) => {
  //     try {
  //       const all = Array.from(document.querySelectorAll('*'));
  //       for (const el of all) {
  //         const txt = (el.textContent || '').trim();
  //         if (
  //           labelsToHide.includes(txt) ||
  //           (/Search.*Results/i.test(txt))
  //         ) {
  //           el.style.display = hide ? 'none' : '';
  //         }
  //       }
  //     } catch (_) {
  //       // no-op in case DOM isn't available
  //     }
  //   };
  //
  //   toggleElements(isTyping);
  //   return () => toggleElements(false);
  // }, [isTyping]);

  // Shared click handler for magnifying glass button
  const handleSearchClick = (e) => {
    e.preventDefault();
    if (currentQuery.trim()) {
      // Include category in URL if selected
      let searchUrl = `/tombstones-for-sale?search=${encodeURIComponent(currentQuery)}`;
      
      // Add category parameter if available
      if (selectedCategory) {
        searchUrl += `&category=${encodeURIComponent(selectedCategory)}`;
      } else if (categories && categories.length > 0 && activeTab !== undefined) {
        const desiredOrder = [
          "SINGLE",
          "DOUBLE",
          "CHILD",
          "HEAD",
          "PLAQUES",
          "CREMATION"
        ];
        const sortedCategories = desiredOrder
          .map((name) =>
            categories.find((cat) => cat?.name && cat.name.toUpperCase() === name)
          )
          .filter(Boolean);
        const selectedCategoryObj = sortedCategories[activeTab];
        if (selectedCategoryObj) {
          searchUrl += `&category=${encodeURIComponent(selectedCategoryObj.name)}`;
        }
      }
      
      router.push(searchUrl);
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto">
      <form onSubmit={handleSubmit} className="w-full" ref={formRef}>
        <div className="relative flex items-center">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search for tombstones, mausoleum, granite..."
            className="w-full px-4 py-3 pr-12 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#D4AF37] focus:border-transparent"
          />
          {/* Initially inside the form; fades out when typing starts */}
          {!isTyping && (
            <button
              type="submit"
              className="absolute right-2 p-2 bg-white rounded-lg text-gray-700 hover:text-gray-900 transition-all duration-300"
              disabled={isSearching}
              onClick={handleSearchClick}
            >
              <Search className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Searching status */}
        {isSearching && <div className="mt-2 text-sm text-gray-500">Searching...</div>}

        {/* Search results count */}
        {!isSearching && searchQuery.trim() && (
          <div className="mt-2 text-sm text-[#1A1D23]">
            Found {searchResults.length} results for "{searchQuery}"
          </div>
        )}
      </form>

      {/* Animated button below the form when typing */}
      <div
        className={`mt-2 flex justify-start transition-all duration-300 ${
          isTyping ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-2 pointer-events-none h-0 overflow-hidden'
        }`}
      >
        {isTyping && (
          <button
            type="button"
            className="flex items-center justify-center w-full h-10 bg-[#D4AF37] text-white rounded-none transition duration-300 hover:brightness-95"
            disabled={isSearching}
            onClick={handleSearchClick}
          >
            Custom Search
          </button>
        )}
      </div>
    </div>
  );
}