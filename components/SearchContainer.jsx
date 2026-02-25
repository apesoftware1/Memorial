"use client";

import { useState, useCallback, useRef, useEffect, useMemo } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { ChevronDown, X, Search } from "lucide-react";
import SearchForm from "@/components/SearchForm";
import FilterDropdown from "@/components/FilterDropdown";
import LocationModal from "@/components/LocationModal";
import CategoryTabs from "@/components/CategoryTabs.jsx";
import MobileFilterTags from "@/components/MobileFilterTags.jsx";
import { SearchLoader } from "@/components/ui/loader";
import { AnimatePresence, motion } from "framer-motion";
import { useLocationHierarchy } from "@/hooks/useLocationHierarchy";
import { checkListingLocation, toTitleCase } from "@/lib/locationHelpers";

// Default filter options with updated price ranges
const defaultFilterOptions = {
  minPrice: [
    "Min Price",
    ...Array.from(
      { length: 40 },
      (_, i) => `R ${(5000 + i * 5000).toLocaleString()}`
    ),
  ],
  maxPrice: [
    "Max Price",
    ...Array.from(
      { length: 40 },
      (_, i) => `R ${(5000 + i * 5000).toLocaleString()}`
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
    "Wave",
    "Church",
    "House",
    "Square",
    "Organic",
    "Arch",
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
    "Double",
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
    "Gold",
    "Yellow",
    "Pink",
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

const parsePrice = (priceStr) => {
  if (!priceStr) return 0;
  if (typeof priceStr === "number") return priceStr;
  if (typeof priceStr === "string") {
    return Number(priceStr.replace(/[^\d]/g, ""));
  }
  try {
    const str = String(priceStr);
    return Number(str.replace(/[^\d]/g, ""));
  } catch {
    return 0;
  }
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
  isFullLoaded = false, // Add this
}) => {
  const router = useRouter();
  const [currentQuery, setCurrentQuery] = useState("");
  const [isCalculating, setIsCalculating] = useState(false);
  const [isSearchFormFocused, setIsSearchFormFocused] = useState(false);
  const [showLocationModal, setShowLocationModal] = useState(false);
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

  // Build hierarchical location options from listings
  const locationHierarchy = useLocationHierarchy(allListings, categories, activeTab);


  // Local state to control mobile-only location modal

  // Effect to simulate calculation loading state when filters or activeTab change
  useEffect(() => {
    setIsCalculating(true);
    const timer = setTimeout(() => {
      setIsCalculating(false);
    }, 500);
    return () => clearTimeout(timer);
  }, [filters, activeTab]);

  const mobileLocationsData = useMemo(() => {
    return locationHierarchy.map((prov, index) => ({
      id: prov.name === 'Any' ? 'all' : String(index),
      name: prov.name,
      count: prov.count,
      lat: prov.lat || null,
      lng: prov.lng || null
    }));
  }, [locationHierarchy]);


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

    // Search content (against title, company name, and product IDs)
    if (paramSearch) {
      const q = paramSearch.toLowerCase();
      next = next.filter((listing) => {
        const title = (listing?.title || "").toLowerCase();
        const companyName = (listing?.company?.name || "").toLowerCase();
        const documentId = (listing?.documentId || "").toLowerCase();
        const id = (listing?.id || "").toString().toLowerCase();
        const productId = (listing?.productDetails?.id || "").toLowerCase();
        const listingSlug = (listing?.slug || "").toLowerCase();
        return (
          title.includes(q) || 
          companyName.includes(q) || 
          documentId.includes(q) || 
          id.includes(q) ||
          productId.includes(q) ||
          listingSlug.includes(q)
        );
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

    // Location (company.location OR branches, partial)
    if (paramLocation) {
      next = next.filter((listing) =>
        checkListingLocation(listing, paramLocation)
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
        location: paramLocation ? toTitleCase(paramLocation) : (prev?.location || null),
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
          // Search content (against title, company name, ID, and documentId)
          .filter((listing) => {
            if (!f.search || f.search === "") return true;
            
            const searchQuery = String(f.search).toLowerCase();
            const title = (listing?.title || "").toLowerCase();
            const companyName = (listing?.company?.name || "").toLowerCase();
            const documentId = (listing?.documentId || "").toLowerCase();
          const id = (listing?.id || "").toString().toLowerCase();
          const productId = (listing?.productDetails?.id || "").toLowerCase();
          const listingSlug = (listing?.slug || "").toLowerCase();

          return (
            title.includes(searchQuery) ||
            companyName.includes(searchQuery) ||
            documentId.includes(searchQuery) ||
            id.includes(searchQuery) ||
            productId.includes(searchQuery) ||
            listingSlug.includes(searchQuery)
          );
        })
          // Category
          .filter((listing) =>
            selectedCategoryName
              ? (listing?.listing_category?.name || "").toLowerCase() ===
                selectedCategoryName.toLowerCase()
              : true
          )
          // Location (partial)
          .filter((listing) =>
            f.location &&
            f.location !== "All" &&
            f.location !== "Any" &&
            f.location !== ""
              ? checkListingLocation(listing, f.location)
              : true
          )
          // Stone Type (partial)
          .filter((listing) => {
            const filterVal = f.stoneType;
            if (
              !filterVal ||
              filterVal === "All" ||
              filterVal === "Any" ||
              filterVal === ""
            )
              return true;
            const itemVal = (listing?.productDetails?.stoneType?.[0]?.value || "").toLowerCase();
            if (Array.isArray(filterVal)) return filterVal.some(v => itemVal.includes(String(v).toLowerCase()));
            return itemVal.includes(String(filterVal).toLowerCase());
          })
          // Colour/Color (partial)
          .filter((listing) => {
            const query = f.color || f.colour;
            if (
              !query ||
              query === "All" ||
              query === "Any" ||
              query === ""
            )
              return true;
            const colour = (listing?.productDetails?.color?.[0]?.value || "").toLowerCase();
            if (Array.isArray(query)) return query.some(v => colour.includes(String(v).toLowerCase()));
            return colour.includes(String(query).toLowerCase());
          })
          // Head style (partial)
          .filter((listing) => {
            const filterVal = f.style;
            if (
              !filterVal ||
              filterVal === "All" ||
              filterVal === "Any" ||
              filterVal === ""
            )
              return true;
            const itemVal = (listing?.productDetails?.style?.[0]?.value || "").toLowerCase();
            if (Array.isArray(filterVal)) return filterVal.some(v => itemVal.includes(String(v).toLowerCase()));
            return itemVal.includes(String(filterVal).toLowerCase());
          })
          // Slab style (partial)
          .filter((listing) => {
            const filterVal = f.slabStyle;
            if (
              !filterVal ||
              filterVal === "All" ||
              filterVal === "Any" ||
              filterVal === ""
            )
              return true;
            const itemVal = (listing?.productDetails?.slabStyle?.[0]?.value || "").toLowerCase();
            if (Array.isArray(filterVal)) return filterVal.some(v => itemVal.includes(String(v).toLowerCase()));
            return itemVal.includes(String(filterVal).toLowerCase());
          })
          // Customization (partial)
          .filter((listing) => {
            const filterVal = f.custom;
            if (
              !filterVal ||
              filterVal === "All" ||
              filterVal === "Any" ||
              filterVal === ""
            )
              return true;
            const itemVal = (listing?.productDetails?.customization?.[0]?.value || "").toLowerCase();
            if (Array.isArray(filterVal)) return filterVal.some(v => itemVal.includes(String(v).toLowerCase()));
            return itemVal.includes(String(filterVal).toLowerCase());
          })
          // Min Price
          .filter((listing) => {
            if (!f.minPrice || f.minPrice === "Min Price" || f.minPrice === "") {
              return true;
            }
            const min = parsePrice(f.minPrice);
            if (!listing.price) return false;
            return parsePrice(listing.price) >= min;
          })
          // Max Price
          .filter((listing) => {
            if (!f.maxPrice || f.maxPrice === "Max Price" || f.maxPrice === "") {
              return true;
            }
            const max = parsePrice(f.maxPrice);
            if (!listing.price) return false;
            return parsePrice(listing.price) <= max;
          })
      );
    },
    [categories, activeTab, filters]
  );

  // Calculate filtered count for search button using the shared filter logic
  const searchButtonCount = useMemo(() => {
    const filteredListings = filterListingsFrom(allListings, filters);
    
    // If a category is selected via prop (and not activeTab handling it), filter here.
    // filterListingsFrom handles activeTab category filtering, so we don't need to re-filter for activeTab.
    if (selectedCategory && activeTab === undefined) {
      return filteredListings.filter(listing => 
        listing.category?.toUpperCase() === selectedCategory
      ).length;
    }
    
    return filteredListings.length;
  }, [allListings, filters, filterListingsFrom, selectedCategory, activeTab]);

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
        const documentId = (listing?.documentId || "").toLowerCase();
        const id = (listing?.id || "").toString().toLowerCase();
        const productId = (listing?.productDetails?.id || "").toLowerCase();
        const listingSlug = (listing?.slug || "").toLowerCase();
        
        const searchQuery = String(filters.search).toLowerCase();

        return (
          title.includes(searchQuery) ||
          companyName.includes(searchQuery) ||
          documentId.includes(searchQuery) ||
          id.includes(searchQuery) ||
          productId.includes(searchQuery) ||
          listingSlug.includes(searchQuery)
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
          .includes(String(filters.colour).toLowerCase());
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
          .includes(String(filters.stoneType).toLowerCase());
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
          .includes(String(filters.style).toLowerCase());
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
          .includes(String(filters.slabStyle).toLowerCase());
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
          .includes(String(filters.custom).toLowerCase());
      });
    }

    // Filter by location
    if (filters?.location) {
      filtered = filtered.filter((listing) =>
        checkListingLocation(listing, filters.location)
      );
    }

    if (filters?.minPrice && filters.minPrice !== "Min Price") {
      const min = parsePrice(filters.minPrice);
      filtered = filtered.filter((listing) => {
        if (!listing.price) return false;
        return parsePrice(listing.price) >= min;
      });
    }

    if (filters?.maxPrice && filters.maxPrice !== "Max Price") {
      const max = parsePrice(filters.maxPrice);
      filtered = filtered.filter((listing) => {
        if (!listing.price) return false;
        return parsePrice(listing.price) <= max;
      });
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
    if (searching || isCalculating) {
      return <SearchLoader />;
    }
    
    // Always calculate category label if available
    let categoryLabel = "";
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
        categoryLabel = selectedCategoryObj.name + " tombstones";
      }
    }
    
    // If we have a search term
    if (filters?.search && filters.search !== "") {
      if (categoryLabel) {
         return `Found ${searchButtonCount} ${categoryLabel}`;
      }
      return `Found ${searchButtonCount} results`;
    }

    // Default state: "View 19 SINGLE tombstones"
    // Show 100+ on initial load before data is populated
    const displayCount = isFullLoaded ? searchButtonCount : "100+";
    return `View ${displayCount}${categoryLabel ? " " + categoryLabel : ""}`;
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
    (name, value, keepOpen = false) => {
    
      if (setFilters) {
        setFilters((prev) => {
        
          const newFilters = {
            ...prev,
            [name]: value,
          };

          return newFilters;
        });
      }
      if (!keepOpen) {
        setUiState((prev) => ({
          ...prev,
          openDropdown: null,
        }));
      }
    },
    [setFilters]
  );

  return (
    <div className="w-full mt-28 md:mt-20">
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
          <div className="flex flex-col gap-3 sm:gap-4 px-4 pb-4 pt-4 sm:p-6">
            
            {/* Mobile Filter Tags */}
            {!isDesktop && (
              <MobileFilterTags 
                activeFilters={filters} 
                setActiveFilters={setFilters} 
              />
            )}

            {/* Search Heading */}
            <h2 className="text-xl sm:text-2xl text-[#D4AF37] font-semibold mb-0 tracking-wide leading-tight whitespace-nowrap">
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
                options={locationHierarchy}
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
                locationsData={locationHierarchy}
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
                style={{ marginTop: "126px" }}
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
