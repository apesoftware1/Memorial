"use client";

import { useState, useCallback, useRef, useEffect, useMemo } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { ChevronDown, X, Search } from "lucide-react";
import SearchForm from "@/components/SearchForm";
import FilterDropdown from "@/components/FilterDropdown";
import LocationModal from "@/components/LocationModal";
import CategoryTabs from "@/components/CategoryTabs.jsx";
import { SearchLoader } from "@/components/ui/loader";
import { AnimatePresence, motion } from "framer-motion";

// Default filter options with updated price ranges
const defaultFilterOptions = {
  minPrice: [
    "Min Price",
    ...Array.from(
      { length: 100 },
      (_, i) => `R ${(1000 + i * 2000).toLocaleString()}`
    ),
  ],
  maxPrice: [
    "Max Price",
    ...Array.from(
      { length: 100 },
      (_, i) => `R ${(3000 + i * 2000).toLocaleString()}`
    ),
    "R 200,000+",
  ],
  location: [
    "Any",
    "Gauteng",
    "Western Cape",
    "KwaZulu-Natal",
    "Eastern Cape",
    "Free State",
    "Limpopo",
    "Northern Cape",
    "Mpumalanga",
    "North west"

  ],
  style: [
    "Any",
    "Christian Cross",
    "Heart",
    "Bible",
    "Pillars",
    "Traditional African",
    "Abstract",
    "Praying Hands",
    "Scroll",
    "Angel",
    "Mausoleum",
    "Obelisk",
    "Plain",
    "Teddy Bear",
    "Butterfly",
    "Car",
    "Bike",
    "Sports",
  ],
  slabStyle: [
    "Any",
    "Curved Slab",
    "Frame with Infill",
    "Full Slab",
    "Glass Slab",
    "Half Slab",
    "Stepped Slab",
    "Tiled Slab",
  ],
  stoneType: [
    "Any",
    "Biodegradable",
    "Brass",
    "Ceramic/Porcelain",
    "Composite",
    "Concrete",
    "Copper",
    "Glass",
    "Granite",
    "Limestone",
    "Marble",
    "Perspex",
    "Quartzite",
    "Sandstone",
    "Slate",
    "Steel",
    "Stone",
    "Tile",
    "Wood",
  ],
  custom: [
    "Any",
    "Bronze/Stainless Plaques",
    "Ceramic Photo Plaques",
    "Flower Vases",
    "Gold Lettering",
    "Inlaid Glass",
    "Photo Laser-Edging",
    "QR Code",
  ],
  colour: [
    "Any",
    "Black",
    "Blue",
    "Green",
    "Grey-Dark",
    "Grey-Light",
    "Maroon",
    "Pearl",
    "Red",
    "White",
  ],
  bodyType: [
    "Full Tombstone",
    "Headstone",
    "Double Headstone",
    "Cremation Memorial",
    "Family Monument",
    "Child Memorial",
    "Custom Design",
  ],
};

const SearchContainer = ({
  selectedCategory,
  setSelectedCategory,
  filters,
  setFilters,
  setSelectedTown,
  handleSearch,
  locationsData,
  filterOptions = defaultFilterOptions,
  isSearching = false,
  getSearchButtonText,
  locationModalOpen,
  handleLocationModalClose,
  parentToggleDropdown,
  categories,
  activeTab,
  setActiveTab,
  totalListings = 0, // Add total listings count
  onNavigateToResults = null, // Add navigation callback
  allListings = [], // Add all listings for filtering
}) => {
  const router = useRouter();
  const [currentQuery, setCurrentQuery] = useState("");
  const [isSearchFormFocused, setIsSearchFormFocused] = useState(false);
  // Modal functionality disabled - no longer needed
  // const [showFullScreenModal, setShowFullScreenModal] = useState(false);
  const searchFormRef = useRef(null);
  // State for UI controls
  const [uiState, setUiState] = useState({
    openDropdown: null,
    showAllOptions: false,
  });

  // State for location search
  const [searchTerm, setSearchTerm] = useState("");

  // Refs for dropdowns
  const dropdownRefs = useRef({});

  // Check if screen is desktop/laptop
  const [moreOptionsOpen, setMoreOptionsOpen] = useState(false);
  const [isDesktop, setIsDesktop] = useState(false);

  // Internal state for search functionality if not provided
  const [internalIsSearching, setInternalIsSearching] = useState(false);

  // Read URL query params and keep a filtered listings array in state
  const searchParams = useSearchParams();
  const [filteredListings, setFilteredListings] = useState([]);

  // Helper: safely get array of values from productDetails field
  const getDetailValues = (listing, key) => {
    const arr = listing?.productDetails?.[key];
    if (Array.isArray(arr)) {
      return arr
        .map((item) => (item?.value || "").toString().toLowerCase())
        .filter(Boolean);
    }
    return [];
  };

  // Helper: normalize province name for consistent lookups
  const normalizeProvince = (name) =>
    (name || '').toLowerCase().trim().replace(/\s+/g, ' ');

  // Helper function to get coordinates for major South African provinces (normalized keys)
  const getCityCoordinates = (cityName) => {
    const byProvince = {
      'gauteng': { lat: -26.2041, lng: 28.0473 },
      'western cape': { lat: -33.9249, lng: 18.4241 },
      'kwazulu-natal': { lat: -29.8587, lng: 31.0218 },
      'eastern cape': { lat: -32.2968, lng: 26.4194 },
      'free state': { lat: -28.4545, lng: 26.7968 },
      'mpumalanga': { lat: -25.4753, lng: 30.9694 },
      'limpopo': { lat: -23.4013, lng: 29.4179 },
      'north west': { lat: -25.4753, lng: 25.4753 },
      'northern cape': { lat: -30.5595, lng: 22.9375 },
    };
    const key = normalizeProvince(cityName);
    return byProvince[key] || null;
  };

  // Province synonyms to match common abbreviations and variants
  const provinceSynonyms = {
    'gauteng': ['gauteng', 'gp'],
    'western cape': ['western cape', 'wc'],
    'kwazulu-natal': ['kwazulu-natal', 'kwazulu natal', 'kzn'],
    'eastern cape': ['eastern cape', 'ec'],
    'free state': ['free state', 'fs'],
    'north west': ['north west', 'nw'],
    'limpopo': ['limpopo', 'lp'],
    'mpumalanga': ['mpumalanga', 'mp'],
    'northern cape': ['northern cape', 'nc']
  };

  const matchesProvince = (companyLocation, selectedProvince) => {
    const lowerLoc = (companyLocation || '').toLowerCase();
    const key = normalizeProvince(selectedProvince);
    const terms = provinceSynonyms[key] || (key ? [key] : []);
    if (!terms.length) return true;
    return terms.some(term => lowerLoc.includes(term));
  };

  // Local state to control mobile-only location modal
  const [showLocationModal, setShowLocationModal] = useState(false);
  const mobileLocationsData = useMemo(() => {
    const list = (filterOptions?.location || []).filter(Boolean);

    // Pre-compute counts per province from all listings
    const totalCount = Array.isArray(allListings) ? allListings.length : 0;

    const countForProvince = (provinceName) => {
      if (!Array.isArray(allListings) || !provinceName) return 0;
      const key = normalizeProvince(provinceName);
      if (key === 'any') return totalCount;
      return allListings.reduce((acc, listing) => {
        const locStr = listing?.company?.location || '';
        return matchesProvince(locStr, provinceName) ? acc + 1 : acc;
      }, 0);
    };

    return list.map((name, index) => {
      const coords = getCityCoordinates(name);
      return {
        id: normalizeProvince(name) === 'any' ? 'all' : String(index),
        name,
        count: countForProvince(name),
        lat: coords?.lat || null,
        lng: coords?.lng || null,
      };
    });
  }, [filterOptions, allListings]);

  // Effect: filter allListings based on URL params on load and whenever params change
  useEffect(() => {
    // If there are no listings yet, skip
    if (!Array.isArray(allListings) || allListings.length === 0) {
      setFilteredListings([]);
      return;
    }

    // Read params (supporting both US and UK spellings where applicable)
    const paramCategory =
      searchParams.get("category") || searchParams.get("category_listing.name");
    const paramColor = searchParams.get("color") || searchParams.get("colour");
    const paramStyle = searchParams.get("style");
    const paramSlabStyle = searchParams.get("slabStyle");
    const paramMaterial =
      searchParams.get("material") || searchParams.get("stoneType");
    const paramCustomization =
      searchParams.get("customization") || searchParams.get("custom");
    const paramLocation = searchParams.get("location");
    const paramMinPrice = searchParams.get("minPrice");
    const paramMaxPrice = searchParams.get("maxPrice");
    const paramSearch = searchParams.get("search");

    // Build filtered array using case-insensitive partial matches and numeric ranges
    let next = [...allListings];

    // Search content (against title and company name)
    if (paramSearch) {
      const q = paramSearch.toLowerCase();
      next = next.filter((listing) => {
        const title = (listing?.title || "").toLowerCase();
        const companyName = (listing?.company?.name || "").toLowerCase();
        return title.includes(q) || companyName.includes(q);
      });
    }

    // Category (exact or partial, case-insensitive)
    if (paramCategory) {
      const q = paramCategory.toLowerCase();
      next = next.filter((listing) => {
        const cat = (listing?.listing_category?.name || "")
          .toString()
          .toLowerCase();
        return cat.includes(q);
      });
    }

    // Color (array in productDetails.color)
    if (paramColor) {
      const q = paramColor.toLowerCase();
      next = next.filter((listing) => {
        const colors = getDetailValues(listing, "color");
        // Also allow fallback to title text search
        const title = (listing?.title || "").toLowerCase();
        return colors.some((c) => c.includes(q)) || title.includes(q);
      });
    }

    // Style (array in productDetails.style)
    if (paramStyle) {
      const q = paramStyle.toLowerCase();
      next = next.filter((listing) => {
        const styles = getDetailValues(listing, "style");
        const title = (listing?.title || "").toLowerCase();
        return styles.some((s) => s.includes(q)) || title.includes(q);
      });
    }

    // Slab Style (array in productDetails.slabStyle)
    if (paramSlabStyle) {
      const q = paramSlabStyle.toLowerCase();
      next = next.filter((listing) => {
        const styles = getDetailValues(listing, "slabStyle");
        const title = (listing?.title || "").toLowerCase();
        return styles.some((s) => s.includes(q)) || title.includes(q);
      });
    }

    // Material (stoneType array)
    if (paramMaterial) {
      const q = paramMaterial.toLowerCase();
      next = next.filter((listing) => {
        const materials = getDetailValues(listing, "stoneType");
        const title = (listing?.title || "").toLowerCase();
        return materials.some((m) => m.includes(q)) || title.includes(q);
      });
    }

    // Customization (customization array)
    if (paramCustomization) {
      const q = paramCustomization.toLowerCase();
      next = next.filter((listing) => {
        const customs = getDetailValues(listing, "customization");
        const title = (listing?.title || "").toLowerCase();
        return customs.some((c) => c.includes(q)) || title.includes(q);
      });
    }

    // Location (company.location, partial)
    if (paramLocation) {
      next = next.filter((listing) =>
        matchesProvince(listing?.company?.location, paramLocation)
      );
    }

    // Price min
    if (paramMinPrice && paramMinPrice !== "Min Price") {
      const minNum = parseInt(paramMinPrice.replace(/[^\d]/g, ""), 10);
      if (!Number.isNaN(minNum)) {
        next = next.filter((listing) => Number(listing?.price) >= minNum);
      }
    }

    // Price max
    if (paramMaxPrice && paramMaxPrice !== "Max Price") {
      const maxNum = parseInt(paramMaxPrice.replace(/[^\d]/g, ""), 10);
      if (!Number.isNaN(maxNum)) {
        next = next.filter((listing) => Number(listing?.price) <= maxNum);
      }
    }

    setFilteredListings(next);

    // Optionally sync UI filters state with params so the dropdowns reflect the URL
    if (setFilters) {
      setFilters((prev) => ({
        ...prev,
        // Keep existing keys but update if present in URL
        search: paramSearch || prev?.search || null,
        colour: paramColor || prev?.colour || null,
        style: paramStyle || prev?.style || null,
        slabStyle: paramSlabStyle || prev?.slabStyle || null,
        stoneType: paramMaterial || prev?.stoneType || null,
        custom: paramCustomization || prev?.custom || null,
        location: paramLocation || prev?.location || null,
        minPrice: paramMinPrice || prev?.minPrice || null,
        maxPrice: paramMaxPrice || prev?.maxPrice || null,
      }));
    }
  }, [allListings, searchParams, setFilters]);

  // Shared filtering logic (same as TombstonesForSale): derive category and apply filters
  const filterListingsFrom = useCallback(
    (sourceListings, currentFilters) => {
      if (!Array.isArray(sourceListings) || sourceListings.length === 0)
        return [];
      const f = currentFilters || filters || {};

      // Determine selected category from tabs
      let selectedCategoryName = "";
      if (Array.isArray(categories) && categories.length > 0) {
        const desiredOrder = [
          "SINGLE",
          "DOUBLE",
          "CHILD",
          "HEAD",
          "PLAQUES",
          "CREMATION",
        ];
        const sortedCategories = desiredOrder
          .map((name) =>
            categories.find(
              (cat) => cat?.name && cat.name.toUpperCase() === name
            )
          )
          .filter(Boolean);
        const selectedCategoryObj = sortedCategories[activeTab];
        selectedCategoryName = selectedCategoryObj?.name || "";
      }

      return (
        sourceListings
          // Search content (against title and company name)
          .filter((listing) =>
            f.search && f.search !== ""
              ? (listing?.title || "")
                  .toLowerCase()
                  .includes(f.search.toLowerCase()) ||
                (listing?.company?.name || "")
                  .toLowerCase()
                  .includes(f.search.toLowerCase())
              : true
          )
          // Category
          .filter((listing) =>
            selectedCategoryName
              ? (listing?.listing_category?.name || "").toLowerCase() ===
                selectedCategoryName.toLowerCase()
              : true
          )
          // Location (partial)
          .filter((listing) =>
            f.location && f.location !== "All" && f.location !== ""
              ? matchesProvince(listing?.company?.location, f.location)
              : true
          )
          // Stone Type (partial)
          .filter((listing) =>
            f.stoneType && f.stoneType !== "All" && f.stoneType !== ""
              ? (listing?.productDetails?.stoneType?.[0]?.value || "")
                  .toLowerCase()
                  .includes(f.stoneType.toLowerCase())
              : true
          )
          // Colour/Color (partial)
          .filter((listing) => {
            const query = f.color || f.colour;
            if (!query || query === "All" || query === "") return true;
            const colour = (
              listing?.productDetails?.color?.[0]?.value || ""
            ).toLowerCase();
            return colour.includes(query.toLowerCase());
          })
          // Head style (partial)
          .filter((listing) =>
            f.style && f.style !== "All" && f.style !== ""
              ? (listing?.productDetails?.style?.[0]?.value || "")
                  .toLowerCase()
                  .includes(f.style.toLowerCase())
              : true
          )
          // Slab style (partial)
          .filter((listing) =>
            f.slabStyle && f.slabStyle !== "All" && f.slabStyle !== ""
              ? (listing?.productDetails?.slabStyle?.[0]?.value || "")
                  .toLowerCase()
                  .includes(f.slabStyle.toLowerCase())
              : true
          )
          // Customization (partial)
          .filter((listing) =>
            f.custom && f.custom !== "All" && f.custom !== ""
              ? (listing?.productDetails?.customization?.[0]?.value || "")
                  .toLowerCase()
                  .includes(f.custom.toLowerCase())
              : true
          )
          // Min Price
          .filter((listing) =>
            f.minPrice && f.minPrice !== "Min Price" && f.minPrice !== ""
              ? Number(listing?.price ?? 0) >=
                Number(String(f.minPrice).replace(/[^\d]/g, ""))
              : true
          )
          // Max Price
          .filter((listing) =>
            f.maxPrice && f.maxPrice !== "Max Price" && f.maxPrice !== ""
              ? Number(listing?.price ?? 0) <=
                Number(String(f.maxPrice).replace(/[^\d]/g, ""))
              : true
          )
      );
    },
    [categories, activeTab, filters]
  );

  // Calculate filtered count for search button using the shared filter logic
  const searchButtonCount = useMemo(() => {
    const filteredListings = filterListingsFrom(allListings, filters);
    
    // If a category is selected, only count listings in that category
    if (selectedCategory) {
      return filteredListings.filter(listing => 
        listing.category?.toUpperCase() === selectedCategory
      ).length;
    } else if (activeTab !== undefined) {
      // If we're on a specific category tab, filter by that category
      const desiredOrder = [
        "SINGLE",
        "DOUBLE",
        "CHILD",
        "HEAD",
        "PLAQUES",
        "CREMATION"
      ];
      const categoryName = categories?.[activeTab]?.name;
      if (categoryName) {
        return filteredListings.filter(listing => 
          listing.listing_category?.name === categoryName
        ).length;
      }
    }
    
    return filteredListings.length;
  }, [allListings, filters, filterListingsFrom, selectedCategory, activeTab, categories]);

  // Calculate filtered count based on current filters and category (for actual filtering)
  const filteredCount = useMemo(() => {
    if (!allListings.length) return 0;

    let filtered = [...allListings];
    
    // First filter by current category if we're on a specific category page
    if (activeTab !== undefined && categories && categories.length > 0) {
      const desiredOrder = [
        "SINGLE",
        "DOUBLE",
        "CHILD",
        "HEAD",
        "PLAQUES",
        "CREMATION",
      ];
      const sortedCategories = desiredOrder
        .map((name) =>
          categories.find((cat) => cat.name && cat.name.toUpperCase() === name)
        )
        .filter(Boolean);
        
      if (sortedCategories[activeTab]) {
        const categoryName = sortedCategories[activeTab].name;
        filtered = filtered.filter(listing => 
          listing.category?.toUpperCase() === categoryName.toUpperCase()
        );
      }
    }

    // Filter by search (add this before other filters)
    if (filters?.search && filters.search !== "") {
      filtered = filtered.filter((listing) => {
        const title = (listing?.title || "").toLowerCase();
        const companyName = (listing?.company?.name || "").toLowerCase();
        return (
          title.includes(filters.search.toLowerCase()) ||
          companyName.includes(filters.search.toLowerCase())
        );
      });
    }

    // Filter by category - activeTab corresponds directly to category index
    if (categories && categories.length > 0) {
      // Use the same sorting logic as CategoryTabs
      const desiredOrder = [
        "SINGLE",
        "DOUBLE",
        "CHILD",
        "HEAD",
        "PLAQUES",
        "CREMATION",
      ];
      const sortedCategories = desiredOrder
        .map((name) =>
          categories.find((cat) => cat.name && cat.name.toUpperCase() === name)
        )
        .filter(Boolean);

      const selectedCategory = sortedCategories[activeTab];

      if (selectedCategory) {
        const categoryName = selectedCategory.name;
        filtered = filtered.filter((listing) => {
          // Use the actual listing_category.name from the backend
          const listingCategory = listing.listing_category?.name;

          // Exact match for category names
          return listingCategory === categoryName;
        });
      }
    }

    // Filter by color
    if (filters?.colour) {
      filtered = filtered.filter((listing) => {
        const listingColor =
          listing.productDetails?.color?.[0]?.value ||
          listing.title?.toLowerCase();

        return listingColor
          ?.toLowerCase()
          .includes(filters.colour.toLowerCase());
      });
    }

    // Filter by material (stoneType)
    if (filters?.stoneType) {
      filtered = filtered.filter((listing) => {
        const listingMaterial =
          listing.productDetails?.stoneType?.[0]?.value ||
          listing.title?.toLowerCase();

        return listingMaterial
          ?.toLowerCase()
          .includes(filters.stoneType.toLowerCase());
      });
    }

    // Filter by head style
    if (filters?.style) {
      filtered = filtered.filter((listing) => {
        const listingStyle =
          listing.productDetails?.style?.[0]?.value ||
          listing.title?.toLowerCase();
        return listingStyle
          ?.toLowerCase()
          .includes(filters.style.toLowerCase());
      });
    }

    // Filter by slab style
    if (filters?.slabStyle) {
      filtered = filtered.filter((listing) => {
        const listingSlabStyle =
          listing.productDetails?.slabStyle?.[0]?.value ||
          listing.title?.toLowerCase();
        return listingSlabStyle
          ?.toLowerCase()
          .includes(filters.slabStyle.toLowerCase());
      });
    }

    // Filter by customisation
    if (filters?.custom) {
      filtered = filtered.filter((listing) => {
        const listingCustom =
          listing.productDetails?.customization?.[0]?.value ||
          listing.title?.toLowerCase();

        return listingCustom
          ?.toLowerCase()
          .includes(filters.custom.toLowerCase());
      });
    }

    // Filter by location
    if (filters?.location) {
      filtered = filtered.filter((listing) =>
        matchesProvince(listing.company?.location, filters.location)
      );
    }

    // Filter by price range
    if (filters?.minPrice && filters.minPrice !== "Min Price") {
      const minPriceNum = parseInt(filters.minPrice.replace(/[^\d]/g, ""));
      filtered = filtered.filter((listing) => listing.price >= minPriceNum);
    }

    if (filters?.maxPrice && filters.maxPrice !== "Max Price") {
      const maxPriceNum = parseInt(filters.maxPrice.replace(/[^\d]/g, ""));
      filtered = filtered.filter((listing) => listing.price <= maxPriceNum);
    }

    return filtered.length;
  }, [allListings, activeTab, categories, filters]);

  // Default functions if not provided
  const defaultHandleSearch = useCallback(() => {
    setInternalIsSearching(true);
    // Recompute filtered list locally to ensure parity with TombstonesForSale
    const next = filterListingsFrom(allListings, filters);
    setFilteredListings(next);
    setTimeout(() => setInternalIsSearching(false), 300);
    
    // Navigate to results page with category parameter
    if (onNavigateToResults) {
      // Get the current category if available
      let categoryParam = "";
      if (selectedCategory) {
        categoryParam = `&category=${encodeURIComponent(selectedCategory)}`;
      } else if (categories && categories.length > 0 && activeTab !== undefined) {
        const desiredOrder = [
          "SINGLE",
          "DOUBLE",
          "CHILD",
          "HEAD",
          "PLAQUES",
          "CREMATION",
        ];
        const sortedCategories = desiredOrder
          .map((name) =>
            categories.find((cat) => cat?.name && cat.name.toUpperCase() === name)
          )
          .filter(Boolean);
        const selectedCategoryObj = sortedCategories[activeTab];
        if (selectedCategoryObj) {
          categoryParam = `&category=${encodeURIComponent(selectedCategoryObj.name)}`;
        }
      }
      
      // Include the category parameter in the navigation
      onNavigateToResults(categoryParam);
    }
  }, [onNavigateToResults, filterListingsFrom, allListings, filters, selectedCategory, categories, activeTab]);

  const defaultGetSearchButtonText = useCallback(() => {
    const searching =
      isSearching !== undefined ? isSearching : internalIsSearching;
    if (searching) return "Searching...";
    return searchButtonCount > 0 ? `Search ${searchButtonCount}` : "Search";
  }, [isSearching, internalIsSearching, searchButtonCount]);

  const renderSearchButtonContent = () => {
    const searching =
      isSearching !== undefined ? isSearching : internalIsSearching;
    if (searching) {
      return <SearchLoader />;
    }
    
    // If we have a search term, show "Found X abstracts"
    if (filters?.search && filters.search !== "") {
      // If we're on a specific category tab, show that category's results
      if (categories && categories.length > 0 && activeTab !== undefined) {
        const desiredOrder = [
          "SINGLE",
          "DOUBLE",
          "CHILD",
          "HEAD",
          "PLAQUES",
          "CREMATION",
        ];
        const sortedCategories = desiredOrder
          .map((name) =>
            categories.find((cat) => cat.name && cat.name.toUpperCase() === name)
          )
          .filter(Boolean);
        const selectedCategoryObj = sortedCategories[activeTab];
        if (selectedCategoryObj) {
          return `Found ${searchButtonCount} ${selectedCategoryObj.name} abstracts`;
        }
      }
      return `Found ${searchButtonCount} results`;
    }
    
    // Always show count and category, even if 0
    let categoryLabel = "";
    if (categories && categories.length > 0) {
      const desiredOrder = [
        "SINGLE",
        "DOUBLE",
        "CHILD",
        "HEAD",
        "PLAQUES",
        "CREMATION",
      ];
      const sortedCategories = desiredOrder
        .map((name) =>
          categories.find((cat) => cat.name && cat.name.toUpperCase() === name)
        )
        .filter(Boolean);
      const selectedCategoryObj = sortedCategories[activeTab];
      if (selectedCategoryObj) {
        categoryLabel = selectedCategoryObj.name + " Results ";
      }
    }
    return `Search (${searchButtonCount})${
      categoryLabel ? " " + categoryLabel : ""
    }`;
  };

  // Use provided functions or defaults
  const finalHandleSearch = handleSearch || defaultHandleSearch;
  const finalGetSearchButtonText =
    getSearchButtonText || defaultGetSearchButtonText;
  const finalIsSearching =
    isSearching !== undefined ? isSearching : internalIsSearching;

  // Check if screen is desktop/laptop
  useEffect(() => {
    const checkScreenSize = () => {
      setIsDesktop(window.innerWidth >= 768);
    };
    checkScreenSize();
    window.addEventListener("resize", checkScreenSize);
    return () => window.removeEventListener("resize", checkScreenSize);
  }, []);

  // Click outside functionality to close dropdowns
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (uiState.openDropdown) {
        const dropdownRef = dropdownRefs.current[uiState.openDropdown];
        if (dropdownRef && !dropdownRef.contains(event.target)) {
          setUiState((prev) => ({
            ...prev,
            openDropdown: null,
          }));
        }
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [uiState.openDropdown]);

  // Toggle dropdown
  const toggleDropdown = useCallback((name) => {
    if (
      name === "location" &&
      typeof window !== "undefined" &&
      window.innerWidth < 768
    ) {
      setShowLocationModal(true);
      return;
    }
    setUiState((prev) => ({
      ...prev,
      openDropdown: prev.openDropdown === name ? null : name,
    }));
  }, []);

  // Select option from dropdown
  const selectOption = useCallback(
    (name, value) => {
      if (setFilters) {
        setFilters((prev) => {
          const newFilters = {
            ...prev,
            [name]: value,
          };

          return newFilters;
        });
      }
      setUiState((prev) => ({
        ...prev,
        openDropdown: null,
      }));
    },
    [setFilters]
  );

  return (
    <div className="w-full mt-0 md:mt-20">
      <div className="container mx-auto px-0 max-w-4xl">
        <div className="w-full md:max-w-lg flex flex-col justify-between relative bg-[#005D77]">
          {/* CategoryTabs - flush with top and sides */}
          <div className="w-full">
            <CategoryTabs
              categories={categories}
              activeTab={activeTab}
              setActiveTab={setActiveTab}
            />
          </div>

          {/* Removed duplicate heading + search + reset + first filters grid */}
          {/* (We keep the later single instance that includes action buttons) */}

          {/* Main content with padding below tabs (single instance kept) */}
          <div className="flex flex-col gap-3 sm:gap-4 p-4 sm:p-6">
            {/* Search Heading */}
            <h2 className="text-xl sm:text-2xl text-[#D4AF37] font-semibold mb-0 tracking-wide leading-tight">
              Find Your Loved One A Tombstone!
            </h2>

            {/* Search Form - Modal functionality disabled */}
            <div 
              ref={searchFormRef}
              className="relative w-full"
            >
              <SearchForm
                onSearch={(searchTerm) => {
                  const searchTermLower = searchTerm.toLowerCase();
                  setCurrentQuery(searchTerm);
                  setIsSearchFormFocused(true);

                  // Update search filter in real-time as user types
                  if (setFilters) {
                    setFilters((prev) => ({ ...prev, search: searchTerm }));
                  }

                  if (setSelectedCategory) {
                    if (searchTermLower.includes("premium")) {
                      setSelectedCategory("PREMIUM");
                    } else if (searchTermLower.includes("family")) {
                      setSelectedCategory("FAMILY");
                    } else if (searchTermLower.includes("child")) {
                      setSelectedCategory("CHILD");
                    } else if (searchTermLower.includes("head")) {
                      setSelectedCategory("HEAD");
                    } else if (searchTermLower.includes("cremation")) {
                      setSelectedCategory("CREMATION");
                    }
                  }

                  if (setFilters) {
                    const newFilters = { ...filters };

                    if (
                      searchTermLower.includes("cheap") ||
                      searchTermLower.includes("affordable")
                    ) {
                      newFilters.minPrice = "R 5,001";
                      newFilters.maxPrice = "R 15,000";
                    }

                    if (searchTermLower.includes("granite")) {
                      newFilters.stoneType = "Granite";
                    } else if (searchTermLower.includes("marble")) {
                      newFilters.stoneType = "Marble";
                    }

                    setFilters(newFilters);
                  }
                }}
                onSubmit={(searchContent) => {
                  // Add search content to filters for URL params and immediate filtering
                  if (setFilters) {
                    setFilters((prev) => ({ ...prev, search: searchContent }));
                  }
                  
                  // Navigate to search page with query and category
                  if (router && searchContent.trim()) {
                    let searchUrl = `/tombstones-for-sale?search=${encodeURIComponent(searchContent)}`;
                    
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
                }}
                // Pass additional props for navigation
                router={router}
                selectedCategory={selectedCategory}
                categories={categories}
                activeTab={activeTab}
                currentQuery={currentQuery}
                onQueryChange={(q) => setCurrentQuery(q)}
                onTypingChange={(typing) => setIsSearchFormFocused(typing)}
              />
            </div>
            
            {/* Full Screen Modal - Disabled */}
            {/* Modal functionality removed - no longer needed */}

            {/* Reset Link */}
            <div className="flex justify-end mb-0">
              <button
                onClick={() => {
                  // Removed unintended navigation on reset per user request
                  if (setFilters) {
                    setFilters({
                      
                      search: "",
                      minPrice: "",
                      maxPrice: "",
                      location: "",
                      style: "",
                      slabStyle: "",
                      stoneType: "",
                      custom: "",
                      colour: "",
                    });
                  }
                  if (setSelectedCategory) setSelectedCategory(null);
                  setCurrentQuery("");
                  setIsSearchFormFocused(false);
                  setUiState((prev) => ({ ...prev, openDropdown: null, showAllOptions: false }));
                  setMoreOptionsOpen(false);
                  if (setSelectedTown) setSelectedTown(null);
                  setSearchTerm("");
                  if (typeof window !== "undefined") {
                    window.dispatchEvent(new Event("searchform:reset"));
                  }
                }}
                className="text-[#D4AF37] hover:text-[#C4A027] font-medium text-sm tracking-wide transition-colors"
              >
                Reset
              </button>
            </div>

            {/* All Filters Grid */}
            <div className="grid grid-cols-2 gap-1 sm:gap-2 relative mb-2">
              <FilterDropdown
                name="minPrice"
                label="Min Price"
                options={filterOptions.minPrice}
                openDropdown={uiState.openDropdown}
                toggleDropdown={toggleDropdown}
                selectOption={selectOption}
                filters={filters || {}}
                dropdownRefs={dropdownRefs}
              />
              <FilterDropdown
                name="maxPrice"
                label="Max Price"
                options={filterOptions.maxPrice}
                openDropdown={uiState.openDropdown}
                toggleDropdown={toggleDropdown}
                selectOption={selectOption}
                filters={filters || {}}
                dropdownRefs={dropdownRefs}
              />
              <FilterDropdown
                name="location"
                label="Location"
                options={filterOptions.location}
                openDropdown={uiState.openDropdown}
                toggleDropdown={toggleDropdown}
                selectOption={selectOption}
                filters={filters || {}}
                dropdownRefs={dropdownRefs}
              />
              <FilterDropdown
                name="style"
                label="Head Style"
                options={filterOptions.style}
                openDropdown={uiState.openDropdown}
                toggleDropdown={toggleDropdown}
                selectOption={selectOption}
                filters={filters || {}}
                dropdownRefs={dropdownRefs}
              />
              {/* NOTE: Slab Style intentionally NOT here anymore */}
            </div>

            {/* Mobile-only Location Modal (full-screen handled inside modal) */}
            {showLocationModal && (
              <LocationModal
                isOpen={showLocationModal}
                onClose={() => setShowLocationModal(false)}
                locationsData={mobileLocationsData}
                onSelectLocation={(loc) => {
                  if (setFilters) {
                    setFilters((prev) => ({
                      ...prev,
                      location: typeof loc === "string" ? loc : "Near me",
                    }));
                  }
                  setShowLocationModal(false);
                }}
              />
            )}

            {/* Action Buttons Container */}
            <div className="flex flex-col sm:flex-row gap-2 sm:gap-4 mt-8 w-full">
              {/* More Options Button */}
              {isDesktop ? (
                <button
                  onClick={() => setMoreOptionsOpen(!moreOptionsOpen)}
                  className="w-full sm:w-[180px] bg-[#0D7C99] text-white font-bold text-sm h-9 transition-colors hover:bg-[#0D7C99]/90 whitespace-nowrap shadow"
                  style={{ borderRadius: "2px" }}
                >
                  {moreOptionsOpen ? "- Less Options" : "+ More Options"}
                </button>
              ) : (
                <button
                  onClick={() =>
                    setUiState((prev) => ({
                      ...prev,
                      showAllOptions: !prev.showAllOptions,
                    }))
                  }
                  className="w-full sm:w-[180px] bg-[#0D7C99] text-white font-bold text-sm h-9 transition-colors hover:bg-[#0D7C99]/90 whitespace-nowrap shadow"
                  style={{ borderRadius: "2px" }}
                >
                  {uiState.showAllOptions ? "- Less Options" : "+ More Options"}
                </button>
              )}
              {/* Mobile-only: showAllOptions tray (acts like more options) */}
              {!isDesktop && uiState.showAllOptions && (
                <>
                  <FilterDropdown
                    name="slabStyle"
                    label="Slab Style"
                    options={filterOptions.slabStyle}
                    openDropdown={uiState.openDropdown}
                    toggleDropdown={toggleDropdown}
                    selectOption={selectOption}
                    filters={filters || {}}
                    dropdownRefs={dropdownRefs}
                  />
                  <FilterDropdown
                    name="stoneType"
                    label="Stone Type"
                    options={filterOptions.stoneType}
                    openDropdown={uiState.openDropdown}
                    toggleDropdown={toggleDropdown}
                    selectOption={selectOption}
                    filters={filters || {}}
                    dropdownRefs={dropdownRefs}
                  />
                  <FilterDropdown
                    name="colour"
                    label="Colour"
                    options={filterOptions.colour}
                    openDropdown={uiState.openDropdown}
                    toggleDropdown={toggleDropdown}
                    selectOption={selectOption}
                    filters={filters || {}}
                    dropdownRefs={dropdownRefs}
                  />
                  <FilterDropdown
                    name="custom"
                    label="Customisation"
                    options={filterOptions.custom}
                    openDropdown={uiState.openDropdown}
                    toggleDropdown={toggleDropdown}
                    selectOption={selectOption}
                    filters={filters || {}}
                    dropdownRefs={dropdownRefs}
                  />
                </>
              )}
              {/* Search Button */}
              {(!isDesktop && (
                <div
                  className={`w-full sm:w-[220px] sm:ml-auto transition-transform duration-300 ease-in-out ${
                    moreOptionsOpen ? "translate-x-[233%]" : "translate-x-0"
                  } relative z-[5] mb-4 md:mb-0`}
                >
                  <button
                    type="button"
                    onClick={finalHandleSearch}
                    disabled={finalIsSearching}
                    className={`w-full bg-[#D4AF37] text-white rounded font-bold text-sm h-9 transition-colors ${
                      finalIsSearching
                        ? "opacity-75 cursor-not-allowed"
                        : "hover:bg-[#C4A027]"
                    }`}
                    style={{ borderRadius: "2px" }}
                  >
                    {renderSearchButtonContent()}
                  </button>
                </div>
              )) ||
                (isDesktop &&
                  uiState.openDropdown !== "custom" &&
                  uiState.openDropdown !== "stoneType" && (
                    <div
                      className={`w-full sm:w-[220px] sm:ml-auto transition-transform duration-300 ease-in-out ${
                        moreOptionsOpen ? "translate-x-[233%]" : "translate-x-0"
                      } relative z-[5] mb-4 md:mb-0`}
                    >
                      <button
                        type="button"
                        onClick={finalHandleSearch}
                        disabled={finalIsSearching}
                        className={`w-full bg-[#D4AF37] text-white rounded font-bold text-sm h-9 transition-colors ${
                          finalIsSearching
                            ? "opacity-75 cursor-not-allowed"
                            : "hover:bg-[#C4A027]"
                        }`}
                        style={{ borderRadius: "2px" }}
                      >
                        {renderSearchButtonContent()}
                      </button>
                    </div>
                  ))}
            </div>
          </div>

          {/* Desktop More Options Container */}
          {isDesktop && (
            <div
              className={`absolute left-0 w-full md:max-w-lg bg-[#005D77] p-4 sm:p-6 flex flex-col transition-all duration-300 ease-in-out z-[1] 
                ${
                  moreOptionsOpen
                    ? "translate-x-[100%] opacity-100 pointer-events-auto"
                    : "translate-x-0 opacity-0 pointer-events-none"
                }`}
              style={{
                top: "56px",
                bottom: 0,
                width: "100%",
                maxWidth: "32rem",
                boxShadow: "0 0 10px rgba(0, 0, 0, 0.1)",
              }}
            >
              {/* Header */}
              <div className="flex justify-between items-center mb-2">
                <h3 className="text-xl text-[#D4AF37] font-semibold">
                  More Options
                </h3>
                <button
                  onClick={() => setMoreOptionsOpen(false)}
                  className="p-2 rounded-full hover:bg-gray-700 transition-colors"
                  aria-label="Close more options"
                >
                  <X className="h-5 w-5 text-white" />
                </button>
              </div>
              {/* Additional Filters - Reordered as requested */}
              <div
                className="grid grid-cols-2 gap-1 mb-2 sm:gap-2"
                style={{ marginTop: "102px" }}
              >
                <FilterDropdown
                  name="slabStyle"
                  label="Slab Style"
                  options={filterOptions.slabStyle}
                  openDropdown={uiState.openDropdown}
                  toggleDropdown={toggleDropdown}
                  selectOption={selectOption}
                  filters={filters || {}}
                  dropdownRefs={dropdownRefs}
                />
                <FilterDropdown
                  name="stoneType"
                  label="Stone Type"
                  options={filterOptions.stoneType}
                  openDropdown={uiState.openDropdown}
                  toggleDropdown={toggleDropdown}
                  selectOption={selectOption}
                  filters={filters || {}}
                  dropdownRefs={dropdownRefs}
                />
                <FilterDropdown
                  name="colour"
                  label="Colour"
                  options={filterOptions.colour}
                  openDropdown={uiState.openDropdown}
                  toggleDropdown={toggleDropdown}
                  selectOption={selectOption}
                  filters={filters || {}}
                  dropdownRefs={dropdownRefs}
                />
                <FilterDropdown
                  name="custom"
                  label="Customisation"
                  options={filterOptions.custom}
                  openDropdown={uiState.openDropdown}
                  toggleDropdown={toggleDropdown}
                  selectOption={selectOption}
                  filters={filters || {}}
                  dropdownRefs={dropdownRefs}
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SearchContainer;