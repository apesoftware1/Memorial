"use client";

import { useState, useEffect, useMemo, useRef, useCallback } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { ChevronDown, X, Search } from "lucide-react";
import SearchForm from "@/components/SearchForm";
import FilterDropdown from "@/components/FilterDropdown";
import LocationModal from "@/components/LocationModal";
import CategoryTabs from "@/components/CategoryTabs.jsx";
import MobileFilterTags from "@/components/MobileFilterTags.jsx";
import { SearchLoader } from "@/components/ui/loader";
import { AnimatePresence, motion } from "framer-motion";
import { toTitleCase } from "@/lib/locationHelpers";
import { sanitizeLocationHierarchy } from "@/lib/locationHierarchySanitizer";
import { useQuery } from "@apollo/client";
import apolloClient from "@/lib/apolloClient";
import { LISTING_SEARCH_INDEX_CONNECTION_QUERY } from "@/graphql/queries";
import { trackAnalyticsEvent } from "@/lib/analytics";
import {
  STYLE_OPTIONS as MANUFACTURER_HEAD_STYLE_OPTIONS,
  SLAB_STYLE_OPTIONS as MANUFACTURER_SLAB_STYLE_OPTIONS,
  STONE_TYPE_OPTIONS as MANUFACTURER_STONE_TYPE_OPTIONS,
} from "@/app/manufacturers/manufacturers-Profile-Page/update-listing/constants/updateListingConstants";

const EMPTY_ARRAY = [];

// Default filter options with updated price ranges
const defaultFilterOptions = {
  minPrice: [
    "Min Price",
    "R 1,000",
    ...Array.from(
      { length: 40 },
      (_, i) => `R ${(5000 + i * 5000).toLocaleString()}`
    ),
  ],
  maxPrice: [
    "Max Price",
    "R 1,000",
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
    "North west",
    "North West"

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
    ...MANUFACTURER_HEAD_STYLE_OPTIONS.filter(
      (s) => ![
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
      ].includes(s)
    ),
  ],
  overallStyle: [
    "Any",
    "Traditional",
    "Modern",
    "Simple",
    "Decorative",
    "Religious",
    "Premium",
    "Traditional African Style",
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
    ...MANUFACTURER_SLAB_STYLE_OPTIONS.filter(
      (s) => !["Any", "Curved Slab", "Frame with Infill", "Full Slab", "Glass Slab", "Half Slab", "Stepped Slab", "Tiled Slab", "Double"].includes(s)
    ),
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
    ...MANUFACTURER_STONE_TYPE_OPTIONS.filter(
      (s) =>
        ![
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
        ].includes(s)
    ),
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
  allListings = EMPTY_ARRAY, // Add all listings for filtering
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
  const [filterVisibility, setFilterVisibility] = useState({ hidden: [], hiddenOptions: {}, updatedAt: "" });

  // State for location search
  const [searchTerm, setSearchTerm] = useState("");

  // Refs for dropdowns
  const dropdownRefs = useRef({});
  const [hasUserInteracted, setHasUserInteracted] = useState(false);
  const hasMountedRef = useRef(false);
  const prevActiveTabRef = useRef(activeTab);

  // Check if screen is desktop/laptop
  const [moreOptionsOpen, setMoreOptionsOpen] = useState(false);
  const [isDesktop, setIsDesktop] = useState(false);

  const provinceOptionSet = useMemo(() => {
    const raw = Array.isArray(filterOptions?.location) ? filterOptions.location : [];
    const set = new Set();
    raw.forEach((v) => {
      if (typeof v !== "string") return;
      const trimmed = v.trim();
      if (!trimmed) return;
      const lowered = trimmed.toLowerCase();
      if (lowered === "any" || lowered === "all" || lowered === "near me") return;
      set.add(lowered);
    });
    return set;
  }, [filterOptions?.location]);

  const normalizeScalar = useCallback((v) => {
    if (typeof v !== "string") return null;
    const trimmed = v.trim();
    if (!trimmed) return null;
    const lowered = trimmed.toLowerCase();
    if (lowered === "any" || lowered === "all") return null;
    return trimmed;
  }, []);

  const pickScalar = useCallback(
    (v) => {
      if (Array.isArray(v)) {
        for (let i = v.length - 1; i >= 0; i -= 1) {
          const normalized = normalizeScalar(v[i]);
          if (normalized) return normalized;
        }
        return null;
      }
      return normalizeScalar(v);
    },
    [normalizeScalar]
  );

  const pickMulti = useCallback(
    (v) => {
      if (Array.isArray(v)) {
        const out = v
          .map(normalizeScalar)
          .filter(Boolean)
          .filter((x, idx, arr) => arr.indexOf(x) === idx);
        return out.length > 0 ? out : null;
      }
      return normalizeScalar(v);
    },
    [normalizeScalar]
  );

  const canonicalizeFromOptions = useCallback((value, options) => {
    if (!value) return value;
    if (!Array.isArray(options) || options.length === 0) return value;

    const canonicalizeOne = (v) => {
      if (!v || typeof v !== "string") return v;
      const lowered = v.trim().toLowerCase();
      if (!lowered) return v;
      const match = options.find(
        (opt) => typeof opt === "string" && opt.trim().toLowerCase() === lowered
      );
      return typeof match === "string" ? match : v;
    };

    if (Array.isArray(value)) {
      const out = value
        .map(canonicalizeOne)
        .filter((v) => typeof v === "string" && v.trim() !== "")
        .filter((x, idx, arr) => arr.indexOf(x) === idx);
      return out.length > 0 ? out : null;
    }

    return canonicalizeOne(value);
  }, []);

  const parseLocationSelection = useCallback(
    (value) => {
      if (!value) return { province: null, city: null, town: null };
      if (Array.isArray(value)) {
        if (value.some((v) => typeof v === "string" && /^[pct]\|/.test(v))) {
          return { province: null, city: null, town: null };
        }
        const arr = value.map(normalizeScalar).filter(Boolean);
        if (arr.length === 0) return { province: null, city: null, town: null };
        const provinces = arr.filter((v) => provinceOptionSet.has(v.toLowerCase()));
        const others = arr.filter((v) => !provinceOptionSet.has(v.toLowerCase()));

        if (others.length > 0) {
          return {
            province:
              provinces.length === 0
                ? null
                : provinces.length === 1
                ? provinces[0]
                : provinces,
            city: others.length === 1 ? others[0] : others,
            town: null,
          };
        }

        return {
          province:
            provinces.length === 0
              ? null
              : provinces.length === 1
              ? provinces[0]
              : provinces,
          city: null,
          town: null,
        };
      }
      if (typeof value === "string") {
        if (/^[pct]\|/.test(value)) return { province: null, city: null, town: null };
        const lowered = value.trim().toLowerCase();
        if (lowered === "near me") return { province: null, city: null, town: null };
        const normalized = normalizeScalar(value);
        if (!normalized) return { province: null, city: null, town: null };
        if (provinceOptionSet.has(normalized.toLowerCase())) {
          return { province: normalized, city: null, town: null };
        }
        return { province: null, city: normalized, town: null };
      }
      return { province: null, city: null, town: null };
    },
    [normalizeScalar, provinceOptionSet]
  );

  // Internal state for search functionality if not providedd
  const [internalIsSearching, setInternalIsSearching] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        const res = await fetch("/api/filter-visibility", { cache: "no-store" });
        if (!res.ok) return;
        const json = await res.json();
        if (cancelled) return;
        setFilterVisibility({
          hidden: Array.isArray(json?.hidden) ? json.hidden : [],
          hiddenOptions:
            json?.hiddenOptions && typeof json.hiddenOptions === "object"
              ? json.hiddenOptions
              : {},
          updatedAt: typeof json?.updatedAt === "string" ? json.updatedAt : "",
        });
      } catch {
      }
    };
    load();
    return () => {
      cancelled = true;
    };
  }, []);

  const hiddenSet = useMemo(
    () => new Set(Array.isArray(filterVisibility.hidden) ? filterVisibility.hidden : []),
    [filterVisibility.hidden]
  );
  const hiddenOptions = useMemo(() => {
    return filterVisibility?.hiddenOptions && typeof filterVisibility.hiddenOptions === "object"
      ? filterVisibility.hiddenOptions
      : {};
  }, [filterVisibility.hiddenOptions]);

  const normalizeOption = useCallback((value) => {
    if (typeof value !== "string") return "";
    return value.trim().toLowerCase();
  }, []);

  const getHiddenOptionSet = useCallback(
    (key) =>
      new Set(
        (Array.isArray(hiddenOptions?.[key]) ? hiddenOptions[key] : [])
          .map(normalizeOption)
          .filter(Boolean)
      ),
    [hiddenOptions, normalizeOption]
  );

  const filterSimpleOptions = useCallback((options, key, alwaysKeep = []) => {
    if (!Array.isArray(options)) return options;
    const hidden = getHiddenOptionSet(key);
    const keep = new Set(alwaysKeep.map(normalizeOption).filter(Boolean));
    return options.filter((opt) => {
      if (typeof opt !== "string") return true;
      const normalized = normalizeOption(opt);
      if (keep.has(normalized)) return true;
      return !hidden.has(normalized);
    });
  }, [getHiddenOptionSet, normalizeOption]);

  const filterLocationHierarchy = useCallback((hierarchy) => {
    const hidden = getHiddenOptionSet("location");
    const isHiddenName = (name) => hidden.has(normalizeOption(name));
    const pruneTowns = (towns) =>
      Array.isArray(towns)
        ? towns.filter((t) => t && !isHiddenName(t.name))
        : towns;
    const pruneCities = (cities) =>
      Array.isArray(cities)
        ? cities
            .filter((c) => c && !isHiddenName(c.name))
            .map((c) => ({ ...c, towns: pruneTowns(c.towns) }))
        : cities;
    return Array.isArray(hierarchy)
      ? hierarchy
          .filter((p) => p && !isHiddenName(p.name))
          .map((p) => ({ ...p, cities: pruneCities(p.cities) }))
      : hierarchy;
  }, [getHiddenOptionSet, normalizeOption]);
  const showMinPrice = !hiddenSet.has("minPrice");
  const showMaxPrice = !hiddenSet.has("maxPrice");
  const showLocation = !hiddenSet.has("location");
  const showStyle = !hiddenSet.has("style");
  const showOverallStyle = !hiddenSet.has("overallStyle");
  const showSlabStyle = !hiddenSet.has("slabStyle");
  const showStoneType = !hiddenSet.has("stoneType");
  const showColour = !hiddenSet.has("colour");
  const showCustom = !hiddenSet.has("custom");
  const hasMoreOptions = showSlabStyle || showStoneType || showColour || showCustom;

  const minPriceOptions = useMemo(
    () => filterSimpleOptions(filterOptions?.minPrice, "minPrice", ["Min Price"]),
    [filterOptions?.minPrice, filterSimpleOptions]
  );
  const maxPriceOptions = useMemo(
    () => filterSimpleOptions(filterOptions?.maxPrice, "maxPrice", ["Max Price"]),
    [filterOptions?.maxPrice, filterSimpleOptions]
  );
  const styleOptions = useMemo(
    () => filterSimpleOptions(filterOptions?.style, "style", ["Any"]),
    [filterOptions?.style, filterSimpleOptions]
  );
  const overallStyleOptions = useMemo(
    () => filterSimpleOptions(filterOptions?.overallStyle, "overallStyle", ["Any"]),
    [filterOptions?.overallStyle, filterSimpleOptions]
  );
  const slabStyleOptions = useMemo(
    () => filterSimpleOptions(filterOptions?.slabStyle, "slabStyle", ["Any"]),
    [filterOptions?.slabStyle, filterSimpleOptions]
  );
  const stoneTypeOptions = useMemo(
    () => filterSimpleOptions(filterOptions?.stoneType, "stoneType", ["Any"]),
    [filterOptions?.stoneType, filterSimpleOptions]
  );
  const colourOptions = useMemo(
    () => filterSimpleOptions(filterOptions?.colour, "colour", ["Any"]),
    [filterOptions?.colour, filterSimpleOptions]
  );
  const customOptions = useMemo(
    () => filterSimpleOptions(filterOptions?.custom, "custom", ["Any"]),
    [filterOptions?.custom, filterSimpleOptions]
  );

  // Read URL query params and keep a filtered listings array in state
  const searchParams = useSearchParams();
  const [filteredListings, setFilteredListings] = useState([]);

  // Calculate filtered listings for location counts (apply all filters EXCEPT location)
  // const listingsForLocationCounts = useMemo(() => {
  //   // Create a filter object that excludes location
  //   // const filtersForLocation = { ...(filters || {}), location: null };
  //   // return filterListings(allListings, filtersForLocation, categories, activeTab);
  //   return [];
  // }, [allListings, filters, categories, activeTab]);

  // Build hierarchical location options from listings
  // const locationHierarchy = useMemo(() => {
  //   return buildLocationTree(listingsForLocationCounts);
  // }, [listingsForLocationCounts]);


  // Local state to control mobile-only location modal

  // Effect to simulate calculation loading state when filters or activeTab change
  useEffect(() => {
    if (!hasMountedRef.current) {
      hasMountedRef.current = true;
      return;
    }
    if (!hasUserInteracted) return;
    setIsCalculating(true);
    const timer = setTimeout(() => {
      setIsCalculating(false);
    }, 500);
    return () => clearTimeout(timer);
  }, [filters, activeTab, hasUserInteracted]);

  useEffect(() => {
    if (!hasMountedRef.current) return;
    if (prevActiveTabRef.current !== activeTab) {
      prevActiveTabRef.current = activeTab;
      setHasUserInteracted(true);
    }
  }, [activeTab]);

  const searchParamsKey = searchParams ? searchParams.toString() : "";

  // Effect: filter allListings based on URL params on load and whenever params change
  useEffect(() => {
    // If there are no listings yet, skip
    if (!Array.isArray(allListings) || allListings.length === 0) {
      setFilteredListings((prev) => (Array.isArray(prev) && prev.length === 0 ? prev : []));
      return;
    }

    // Read params (supporting both US and UK spellings where applicable)
    const paramCategory =
      searchParams.get("category") || searchParams.get("category_listing.name");
    const paramColor = searchParams.get("color") || searchParams.get("colour");
    const paramStyle = searchParams.get("style");
    const paramOverallStyle = searchParams.get("overallStyle");
    const paramSlabStyle = searchParams.get("slabStyle");
    const paramMaterial =
      searchParams.get("material") || searchParams.get("stoneType");
    const paramCustomization =
      searchParams.get("customization") || searchParams.get("custom");
    const paramLocation = searchParams.get("location");
    const paramMinPrice = searchParams.get("minPrice");
    const paramMaxPrice = searchParams.get("maxPrice");
    const paramSearch = searchParams.get("search");

    const parseMultiParam = (val) => {
      if (!val || typeof val !== "string") return null;
      const parts = val.split(",").map((s) => s.trim()).filter(Boolean);
      return parts.length > 0 ? parts : null;
    };

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
      const qs = parseMultiParam(paramColor) || [paramColor];
      const qLower = qs.map((q) => q.toLowerCase());
      next = next.filter((listing) => {
        const colors = getDetailValues(listing, "color");
        // Also allow fallback to title text search
        const title = (listing?.title || "").toLowerCase();
        return (
          qLower.some((q) => colors.some((c) => c.includes(q))) ||
          qLower.some((q) => title.includes(q))
        );
      });
    }

    // Style (array in productDetails.style)
    if (paramStyle) {
      const qs = parseMultiParam(paramStyle) || [paramStyle];
      const qLower = qs.map((q) => q.toLowerCase());
      next = next.filter((listing) => {
        const styles = getDetailValues(listing, "style");
        const title = (listing?.title || "").toLowerCase();
        return (
          qLower.some((q) => styles.some((s) => s.includes(q))) ||
          qLower.some((q) => title.includes(q))
        );
      });
    }

    // Overall Style (array in productDetails.overallStyle)
    if (paramOverallStyle) {
      const qs = parseMultiParam(paramOverallStyle) || [paramOverallStyle];
      const qLower = qs.map((q) => q.toLowerCase());
      next = next.filter((listing) => {
        const styles = getDetailValues(listing, "overallStyle");
        const title = (listing?.title || "").toLowerCase();
        return (
          qLower.some((q) => styles.some((s) => s.includes(q))) ||
          qLower.some((q) => title.includes(q))
        );
      });
    }

    // Slab Style (array in productDetails.slabStyle)
    if (paramSlabStyle) {
      const qs = parseMultiParam(paramSlabStyle) || [paramSlabStyle];
      const qLower = qs.map((q) => q.toLowerCase());
      next = next.filter((listing) => {
        const styles = getDetailValues(listing, "slabStyle");
        const title = (listing?.title || "").toLowerCase();
        return (
          qLower.some((q) => styles.some((s) => s.includes(q))) ||
          qLower.some((q) => title.includes(q))
        );
      });
    }

    // Material (stoneType array)
    if (paramMaterial) {
      const qs = parseMultiParam(paramMaterial) || [paramMaterial];
      const qLower = qs.map((q) => q.toLowerCase());
      next = next.filter((listing) => {
        const materials = getDetailValues(listing, "stoneType");
        const title = (listing?.title || "").toLowerCase();
        return (
          qLower.some((q) => materials.some((m) => m.includes(q))) ||
          qLower.some((q) => title.includes(q))
        );
      });
    }

    // Customization (customization array)
    if (paramCustomization) {
      const qs = parseMultiParam(paramCustomization) || [paramCustomization];
      const qLower = qs.map((q) => q.toLowerCase());
      next = next.filter((listing) => {
        const customs = getDetailValues(listing, "customization");
        const title = (listing?.title || "").toLowerCase();
        return (
          qLower.some((q) => customs.some((c) => c.includes(q))) ||
          qLower.some((q) => title.includes(q))
        );
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
        colour: parseMultiParam(paramColor) || paramColor || prev?.colour || null,
        style: parseMultiParam(paramStyle) || paramStyle || prev?.style || null,
        overallStyle: parseMultiParam(paramOverallStyle) || paramOverallStyle || prev?.overallStyle || null,
        slabStyle: parseMultiParam(paramSlabStyle) || paramSlabStyle || prev?.slabStyle || null,
        stoneType: parseMultiParam(paramMaterial) || paramMaterial || prev?.stoneType || null,
        custom: parseMultiParam(paramCustomization) || paramCustomization || prev?.custom || null,
        location: paramLocation ? toTitleCase(paramLocation) : (prev?.location || null),
        minPrice: paramMinPrice || prev?.minPrice || null,
        maxPrice: paramMaxPrice || prev?.maxPrice || null,
      }));
    }
  }, [allListings, searchParamsKey, setFilters]);

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
          const categoryName = (listing?.listing_category?.name || "").toLowerCase();
          const pd = listing?.productDetails || {};
          const arrVals = [
            ...(Array.isArray(pd.style) ? pd.style.map(v => v?.value || "") : []),
            ...(Array.isArray(pd.slabStyle) ? pd.slabStyle.map(v => v?.value || "") : []),
            ...(Array.isArray(pd.stoneType) ? pd.stoneType.map(v => v?.value || "") : []),
            ...(Array.isArray(pd.color) ? pd.color.map(v => v?.value || "") : []),
            ...(Array.isArray(pd.customization) ? pd.customization.map(v => v?.value || "") : []),
          ].map(s => (s || "").toLowerCase());

          return (
            title.includes(searchQuery) ||
            companyName.includes(searchQuery) ||
            documentId.includes(searchQuery) ||
            id.includes(searchQuery) ||
            productId.includes(searchQuery) ||
            listingSlug.includes(searchQuery) ||
            categoryName.includes(searchQuery) ||
            arrVals.some(s => s.includes(searchQuery))
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
          // Style (overallStyle) (partial)
          .filter((listing) => {
            const filterVal = f.overallStyle;
            if (
              !filterVal ||
              filterVal === "All" ||
              filterVal === "Any" ||
              filterVal === ""
            )
              return true;
            const itemVal = (listing?.productDetails?.overallStyle?.[0]?.value || "").toLowerCase();
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

  // Determine current category name from activeTab
  const currentCategoryName = useMemo(() => {
    if (activeTab === undefined || !categories || !categories.length) return null;
    const desiredOrder = [
      "SINGLE", "DOUBLE", "CHILD", "HEAD", "PLAQUES", "CREMATION"
    ];
    const sortedCategories = desiredOrder
      .map((name) =>
        categories.find((cat) => cat?.name && cat.name.toUpperCase() === name)
      )
      .filter(Boolean);
    return sortedCategories[activeTab]?.name;
  }, [categories, activeTab]);

  const categoryForIndexCount = useMemo(() => {
    if (typeof selectedCategory === "string" && selectedCategory.trim()) return selectedCategory;
    if (typeof currentCategoryName === "string" && currentCategoryName.trim()) return currentCategoryName;
    return "";
  }, [currentCategoryName, selectedCategory]);

  const normalizeLower = useCallback((v) => (typeof v === "string" ? v.trim().toLowerCase() : ""), []);

  const packedTokenVariants = useCallback(
    (raw) => {
      const base = normalizeLower(raw);
      if (!base) return [];
      const kebab = base.replace(/[^a-z0-9]+/g, "-").replace(/-+/g, "-").replace(/^-|-$/g, "");
      const variants = new Set([base, kebab]);
      return Array.from(variants).filter(Boolean).map((v) => `|${v}|`);
    },
    [normalizeLower]
  );

  const listTokens = useCallback(
    (v) => {
      if (!v) return [];
      const arr = Array.isArray(v) ? v : [v];
      return arr
        .map((x) => (typeof x === "string" ? x.trim() : String(x ?? "").trim()))
        .filter(Boolean)
        .filter((x) => {
          const lowered = x.toLowerCase();
          return lowered !== "any" && lowered !== "all" && lowered !== "all categories";
        });
    },
    []
  );

  const searchIndexCountFilters = useMemo(() => {
    const and = [];
    and.push({ published: { eq: true } });
    and.push({ is_on_special: { eq: false } });

    if (categoryForIndexCount) {
      and.push({ category: { eq: normalizeLower(categoryForIndexCount) } });
    }

    const locationRaw = filters?.location;
    const isEncodedLocation = (v) => typeof v === "string" && /^[pct]\|/.test(v);
    const decodeEncodedLocation = (v) => {
      if (!isEncodedLocation(v)) return null;
      const parts = v.split("|").map((p) => p.trim());
      const level = parts[0];
      if (level === "p") return { level: "province", province: parts[1] || "" };
      if (level === "c") return { level: "city", province: parts[1] || "", city: parts[2] || "" };
      if (level === "t")
        return { level: "town", province: parts[1] || "", city: parts[2] || "", town: parts[3] || "" };
      return null;
    };

    const encodedSelections = Array.isArray(locationRaw) ? locationRaw.filter(isEncodedLocation) : [];
    if (encodedSelections.length) {
      const decoded = encodedSelections.map(decodeEncodedLocation).filter(Boolean);
      const provinceVals = decoded
        .filter((d) => d.level === "province" && d.province)
        .map((d) => d.province);
      const cityVals = decoded
        .filter((d) => d.level === "city" && d.city)
        .map((d) => d.city);
      const townVals = decoded
        .filter((d) => d.level === "town" && d.town)
        .map((d) => d.town);

      const unique = (arr) => Array.from(new Set(arr.map((x) => String(x).trim()).filter(Boolean)));

      if (townVals.length) {
        const toks = unique(townVals).flatMap((v) => packedTokenVariants(v));
        if (toks.length) and.push({ or: toks.map((tok) => ({ towns: { contains: tok } })) });
      } else if (cityVals.length) {
        const toks = unique(cityVals).flatMap((v) => packedTokenVariants(v));
        if (toks.length) and.push({ or: toks.map((tok) => ({ cities: { contains: tok } })) });
      } else if (provinceVals.length) {
        const toks = unique(provinceVals).flatMap((v) => packedTokenVariants(v));
        if (toks.length) and.push({ or: toks.map((tok) => ({ provinces: { contains: tok } })) });
      }
    } else if (Array.isArray(locationRaw) && locationRaw.length === 3) {
      const [prov, city, town] = locationRaw;
      const townV = normalizeLower(town);
      const cityV = normalizeLower(city);
      const provV = normalizeLower(prov);
      if (townV && townV !== "any") {
        const toks = packedTokenVariants(townV);
        if (toks.length) and.push({ or: toks.map((tok) => ({ towns: { contains: tok } })) });
      } else if (cityV && cityV !== "any") {
        const toks = packedTokenVariants(cityV);
        if (toks.length) and.push({ or: toks.map((tok) => ({ cities: { contains: tok } })) });
      } else if (provV && provV !== "any") {
        const toks = packedTokenVariants(provV);
        if (toks.length) and.push({ or: toks.map((tok) => ({ provinces: { contains: tok } })) });
      }
    } else {
      const locVals = listTokens(locationRaw);
      if (locVals.length) {
        and.push({
          or: locVals.flatMap((v) =>
            packedTokenVariants(v).flatMap((tok) => [
              { provinces: { contains: tok } },
              { cities: { contains: tok } },
              { towns: { contains: tok } },
            ])
          ),
        });
      }
    }

    const addPackedOr = (field, values) => {
      const all = values.flatMap((v) => packedTokenVariants(v));
      const unique = Array.from(new Set(all));
      if (!unique.length) return;
      and.push({ or: unique.map((tok) => ({ [field]: { contains: tok } })) });
    };

    addPackedOr("stone_type", listTokens(filters?.stoneType));
    addPackedOr("head_style", listTokens(filters?.style));
    addPackedOr("style", listTokens(filters?.overallStyle));
    addPackedOr("slab_style", listTokens(filters?.slabStyle));
    addPackedOr("customization", listTokens(filters?.custom));
    addPackedOr("color", listTokens(filters?.colour || filters?.color));

    const searchRaw = typeof filters?.search === "string" ? filters.search.trim() : "";
    if (searchRaw) {
      const term = normalizeLower(searchRaw);
      const packed = packedTokenVariants(term);
      const or = [];
      for (const tok of packed) {
        or.push({ stone_type: { contains: tok } });
        or.push({ color: { contains: tok } });
        or.push({ head_style: { contains: tok } });
        or.push({ style: { contains: tok } });
        or.push({ customization: { contains: tok } });
        or.push({ provinces: { contains: tok } });
        or.push({ cities: { contains: tok } });
        or.push({ towns: { contains: tok } });
      }
      if (or.length) and.push({ or });
    }

    const minPrice = filters?.minPrice && filters.minPrice !== "Min Price" ? parsePrice(filters.minPrice) : null;
    const maxPrice = filters?.maxPrice && filters.maxPrice !== "Max Price" ? parsePrice(filters.maxPrice) : null;
    if (Number.isFinite(minPrice) && minPrice > 0) and.push({ price: { gte: minPrice } });
    if (Number.isFinite(maxPrice) && maxPrice > 0) and.push({ price: { lte: maxPrice } });

    return and.length ? { and } : undefined;
  }, [categoryForIndexCount, filters, listTokens, normalizeLower, packedTokenVariants]);

  const [debouncedSearchIndexCountFilters, setDebouncedSearchIndexCountFilters] = useState(searchIndexCountFilters);
  const searchIndexCountTimerRef = useRef(null);
  useEffect(() => {
    if (searchIndexCountTimerRef.current) clearTimeout(searchIndexCountTimerRef.current);
    searchIndexCountTimerRef.current = setTimeout(() => {
      setDebouncedSearchIndexCountFilters(searchIndexCountFilters);
    }, 400);
    return () => {
      if (searchIndexCountTimerRef.current) clearTimeout(searchIndexCountTimerRef.current);
    };
  }, [searchIndexCountFilters]);

  const locationCountBaseFilters = useMemo(() => {
    if (!debouncedSearchIndexCountFilters || !Array.isArray(debouncedSearchIndexCountFilters.and)) return debouncedSearchIndexCountFilters;
    const isLocObj = (obj) => {
      if (!obj || typeof obj !== "object") return false;
      if (obj.provinces || obj.cities || obj.towns) return true;
      if (obj.province || obj.city || obj.town) return true;
      if (Array.isArray(obj.and)) return obj.and.some((o) => isLocObj(o));
      if (Array.isArray(obj.or)) return obj.or.some((o) => isLocObj(o));
      return false;
    };
    return { and: debouncedSearchIndexCountFilters.and.filter((c) => !isLocObj(c)) };
  }, [debouncedSearchIndexCountFilters]);

  const [searchIndexTotal, setSearchIndexTotal] = useState(null);
  const [searchIndexTotalLoading, setSearchIndexTotalLoading] = useState(false);
  useEffect(() => {
    let cancelled = false;
    const run = async () => {
      setSearchIndexTotalLoading(true);
      try {
        const res = await apolloClient.query({
          query: LISTING_SEARCH_INDEX_CONNECTION_QUERY,
          variables: { filters: debouncedSearchIndexCountFilters, page: 1, pageSize: 1 },
          fetchPolicy: "network-only",
        });
        const total = res?.data?.listingSearchIndices_connection?.pageInfo?.total;
        if (!cancelled) setSearchIndexTotal(typeof total === "number" ? total : null);
      } catch {
        if (!cancelled) setSearchIndexTotal(null);
      } finally {
        if (!cancelled) setSearchIndexTotalLoading(false);
      }
    };
    run();
    return () => {
      cancelled = true;
    };
  }, [debouncedSearchIndexCountFilters]);

  const shouldFetchLocationOptions =
    uiState.openDropdown === "location" || showLocationModal;
  const locationOptionsPageSize = shouldFetchLocationOptions ? 5000 : 1;
  const { data: searchIndexOptionsData, loading: searchIndexOptionsLoading } = useQuery(
    LISTING_SEARCH_INDEX_CONNECTION_QUERY,
    {
      variables: { filters: locationCountBaseFilters, page: 1, pageSize: locationOptionsPageSize },
      fetchPolicy: "no-cache",
      nextFetchPolicy: "no-cache",
      errorPolicy: "all",
    }
  );

  const locationHierarchy = useMemo(() => {
    const fallbackProvinces = Array.isArray(filterOptions?.location)
      ? filterOptions.location
          .filter((v) => typeof v === "string")
          .map((v) => v.trim())
          .filter((v) => v && v.toLowerCase() !== "any" && v.toLowerCase() !== "all" && v.toLowerCase() !== "near me")
      : [];

    const nodes = searchIndexOptionsData?.listingSearchIndices_connection?.nodes;
    if (!shouldFetchLocationOptions || !Array.isArray(nodes) || nodes.length === 0) {
      return fallbackProvinces.map((p) => ({ name: p, count: 0, cities: [] }));
    }

    const unpackPacked = (packed) => {
      if (typeof packed !== "string") return [];
      return packed
        .split("|")
        .map((s) => s.trim())
        .filter(Boolean);
    };
    const tokenLabel = (token) => {
      const raw = String(token ?? "").trim();
      if (!raw) return "";
      const withSpaces = raw.replace(/-/g, " ").replace(/\s+/g, " ").trim();
      return toTitleCase(withSpaces);
    };

    const provinceCityCounts = new Map();
    const cityTownCounts = new Map();
    const provinceSet = new Set();
    const citySet = new Set();
    const townSet = new Set();

    for (const n of nodes) {
      const provinces = unpackPacked(n?.provinces);
      const cities = unpackPacked(n?.cities);
      const towns = unpackPacked(n?.towns);

      provinces.forEach((p) => provinceSet.add(p));
      cities.forEach((c) => citySet.add(c));
      towns.forEach((t) => townSet.add(t));

      for (const p of provinces) {
        if (!provinceCityCounts.has(p)) provinceCityCounts.set(p, new Map());
        const map = provinceCityCounts.get(p);
        for (const c of cities) {
          map.set(c, (map.get(c) || 0) + 1);
        }
      }

      for (const c of cities) {
        if (!cityTownCounts.has(c)) cityTownCounts.set(c, new Map());
        const map = cityTownCounts.get(c);
        for (const t of towns) {
          map.set(t, (map.get(t) || 0) + 1);
        }
      }
    }

    const allProvinces = Array.from(provinceSet).sort((a, b) => a.localeCompare(b));
    const allCities = Array.from(citySet).sort((a, b) => a.localeCompare(b));
    const allTowns = Array.from(townSet).sort((a, b) => a.localeCompare(b));

    const cityToProvince = new Map();
    for (const c of allCities) {
      let bestProv = null;
      let bestCount = -1;
      for (const p of allProvinces) {
        const cnt = provinceCityCounts.get(p)?.get(c) || 0;
        if (cnt > bestCount || (cnt === bestCount && bestProv && p.localeCompare(bestProv) < 0)) {
          bestCount = cnt;
          bestProv = p;
        }
      }
      if (bestProv && bestCount > 0) cityToProvince.set(c, bestProv);
    }

    const townToCity = new Map();
    for (const t of allTowns) {
      if (citySet.has(t)) {
        townToCity.set(t, t);
        continue;
      }

      let bestCity = null;
      let bestCount = -1;
      for (const c of allCities) {
        const cnt = cityTownCounts.get(c)?.get(t) || 0;
        if (cnt > bestCount || (cnt === bestCount && bestCity && c.localeCompare(bestCity) < 0)) {
          bestCount = cnt;
          bestCity = c;
        }
      }
      if (bestCity && bestCount > 0) townToCity.set(t, bestCity);
    }

    const citiesByProvince = new Map();
    for (const c of allCities) {
      const p = cityToProvince.get(c) || null;
      if (!p) continue;
      if (!citiesByProvince.has(p)) citiesByProvince.set(p, []);
      citiesByProvince.get(p).push(c);
    }
    for (const [p, list] of citiesByProvince.entries()) list.sort((a, b) => a.localeCompare(b));

    const townsByCity = new Map();
    for (const t of allTowns) {
      const c = townToCity.get(t) || null;
      if (!c) continue;
      if (!townsByCity.has(c)) townsByCity.set(c, []);
      townsByCity.get(c).push(t);
    }
    for (const [c, list] of townsByCity.entries()) list.sort((a, b) => a.localeCompare(b));

    const hierarchy = allProvinces
      .map((p) => {
        const cities = (citiesByProvince.get(p) || []).map((c) => {
          const towns = (townsByCity.get(c) || [])
            .map((t) => ({ name: tokenLabel(t), count: 0 }))
            .filter((x) => x.name);
          return { name: tokenLabel(c), count: 0, towns };
        });
        return { name: tokenLabel(p), count: 0, cities };
      })
      .filter((p) => p.name);

    if (hierarchy.length > 0) return sanitizeLocationHierarchy(hierarchy);
    return fallbackProvinces.map((p) => ({ name: p, count: 0, cities: [] }));
  }, [filterOptions?.location, searchIndexOptionsData, shouldFetchLocationOptions]);

  const searchButtonCount = typeof searchIndexTotal === "number" ? searchIndexTotal : 0;
  const filtersLoading = searchIndexTotalLoading || searchIndexOptionsLoading;

  const visibleLocationHierarchy = useMemo(
    () => filterLocationHierarchy(locationHierarchy),
    [filterLocationHierarchy, locationHierarchy]
  );

  const mobileLocationsData = useMemo(() => {
    return locationHierarchy.map((prov, index) => ({
      id: prov.name === "Any" ? "all" : String(index),
      name: prov.name,
      count: prov.count,
      lat: prov.lat || null,
      lng: prov.lng || null,
    }));
  }, [locationHierarchy]);

  const inMemoryApproxCount = null;

  /* 
  // OLD CLIENT-SIDE LOGIC (Replaced by useSearchFilters)
  // Calculate filtered count for search button using the shared filter logic
  const searchButtonCount_OLD = useMemo(() => {
    // ... (old logic removed)
    return 0;
  }, []);
  */

  const buildResultsQueryString = useCallback(
    (overrideFilters) => {
      const params = new URLSearchParams();

      if (selectedCategory) {
        params.set("category", selectedCategory);
      } else if (categories && categories.length > 0 && activeTab !== undefined) {
        const desiredOrder = ["SINGLE", "DOUBLE", "CHILD", "HEAD", "PLAQUES", "CREMATION"];
        const sortedCategories = desiredOrder
          .map((name) => categories.find((cat) => cat?.name && cat.name.toUpperCase() === name))
          .filter(Boolean);
        const selectedCategoryObj = sortedCategories[activeTab];
        if (selectedCategoryObj) {
          params.set("category", selectedCategoryObj.name);
        }
      }

      const f = overrideFilters || filters;
      if (f) {
        if (f.minPrice && f.minPrice !== "Min Price") params.set("minPrice", f.minPrice);
        if (f.maxPrice && f.maxPrice !== "Max Price") params.set("maxPrice", f.maxPrice);
        if (f.search) params.set("search", f.search);

        if (Array.isArray(f.location) && f.location.length > 0) {
          const isEncodedLocation = (v) => typeof v === "string" && /^[pct]\|/.test(v);
          params.set("location", f.location.every(isEncodedLocation) ? f.location.join(";") : f.location.join(","));
        }
        else if (f.location && f.location !== "Any") params.set("location", f.location);

        if (Array.isArray(f.style) && f.style.length > 0) params.set("style", f.style.join(","));
        else if (f.style && f.style !== "Any") params.set("style", f.style);

        if (Array.isArray(f.overallStyle) && f.overallStyle.length > 0)
          params.set("overallStyle", f.overallStyle.join(","));
        else if (f.overallStyle && f.overallStyle !== "Any") params.set("overallStyle", f.overallStyle);

        if (Array.isArray(f.slabStyle) && f.slabStyle.length > 0) params.set("slabStyle", f.slabStyle.join(","));
        else if (f.slabStyle && f.slabStyle !== "Any") params.set("slabStyle", f.slabStyle);

        if (Array.isArray(f.stoneType) && f.stoneType.length > 0) params.set("stoneType", f.stoneType.join(","));
        else if (f.stoneType && f.stoneType !== "Any") params.set("stoneType", f.stoneType);

        if (Array.isArray(f.colour) && f.colour.length > 0) params.set("colour", f.colour.join(","));
        else if (f.colour && f.colour !== "Any") params.set("colour", f.colour);

        if (Array.isArray(f.custom) && f.custom.length > 0) params.set("custom", f.custom.join(","));
        else if (f.custom && f.custom !== "Any") params.set("custom", f.custom);
      }

      return params.toString();
    },
    [activeTab, categories, filters, selectedCategory]
  );

  // Default functions if not provided
  const defaultHandleSearch = useCallback(() => {
    setInternalIsSearching(true);
    setTimeout(() => setInternalIsSearching(false), 300);
    
    const qs = buildResultsQueryString();
    try {
      const baseFilters = filters && typeof filters === "object" ? filters : {};
      const searchQuery =
        typeof baseFilters.search === "string" && baseFilters.search.trim()
          ? baseFilters.search.trim()
          : null;

      const parseLocationSelection = (value) => {
        if (!value) return { province: null, city: null, town: null };
        if (Array.isArray(value)) {
          if (value.some((v) => typeof v === "string" && /^[pct]\|/.test(v))) {
            return { province: null, city: null, town: null };
          }
          return { province: value[0] || null, city: value[1] || null, town: value[2] || null };
        }
        if (typeof value === "string") {
          if (/^[pct]\|/.test(value)) return { province: null, city: null, town: null };
          if (value === "Any") return { province: null, city: null, town: null };
          return { province: value, city: null, town: null };
        }
        return { province: null, city: null, town: null };
      };

      const loc = parseLocationSelection(baseFilters.location);
      const normalizedFilters = {
        province: loc.province,
        city: loc.city,
        town: loc.town,
        price: {
          min: baseFilters.minPrice && baseFilters.minPrice !== "Min Price" ? baseFilters.minPrice : null,
          max: baseFilters.maxPrice && baseFilters.maxPrice !== "Max Price" ? baseFilters.maxPrice : null,
        },
        category: selectedCategory || null,
        stoneType: baseFilters.stoneType || null,
        colour: baseFilters.colour || baseFilters.color || null,
        style: baseFilters.style || null,
        overallStyle: baseFilters.overallStyle || null,
        slabStyle: baseFilters.slabStyle || null,
        custom: baseFilters.custom || null,
        search: searchQuery,
      };

      const paired = [];
      if (normalizedFilters.province && normalizedFilters.city) paired.push(`${normalizedFilters.province} > ${normalizedFilters.city}`);
      if (normalizedFilters.city && normalizedFilters.town) paired.push(`${normalizedFilters.city} > ${normalizedFilters.town}`);
      if (normalizedFilters.price.min || normalizedFilters.price.max) {
        paired.push(`price:${normalizedFilters.price.min || "any"}-${normalizedFilters.price.max || "any"}`);
      }

      trackAnalyticsEvent("filter_apply", null, {
        pagePath: "/search",
        metadata: {
          filters: normalizedFilters,
          paired,
        },
      });

      if (searchQuery) {
        trackAnalyticsEvent("search", null, {
          pagePath: "/search",
          searchQuery,
          metadata: { filters: normalizedFilters },
        });
      }
    } catch {
    }
    if (onNavigateToResults) {
      onNavigateToResults(qs);
    } else if (router) {
      router.push(qs ? `/tombstones-for-sale?${qs}` : "/tombstones-for-sale");
    }
  }, [buildResultsQueryString, filters, onNavigateToResults, router, selectedCategory]);


  const defaultGetSearchButtonText = useCallback(() => {
    const searching =
      isSearching !== undefined ? isSearching : internalIsSearching;
    if (searching) return "Searching...";
    return searchButtonCount > 0 ? `Search ${searchButtonCount}` : "Search";
  }, [isSearching, internalIsSearching, searchButtonCount]);

  const renderSearchButtonContent = () => {
    const searching =
      isSearching !== undefined ? isSearching : internalIsSearching;

    const loadingIndicator = (
      <div className="flex items-center justify-center gap-2">
        <div className="flex space-x-1">
          <div className="w-2 h-2 bg-white rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
          <div className="w-2 h-2 bg-white rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
          <div className="w-2 h-2 bg-white rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
        </div>
        <span>Loading...</span>
      </div>
    );
    
    // Always calculate category label if available
    let categoryName = "";
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
        categoryName = selectedCategoryObj.name;
        categoryLabel = categoryName + " tombstones";
      }
    }

    if (searching) {
      return <SearchLoader />;
    }
    
    if (filtersLoading) {
      if (isCalculating) return loadingIndicator;
      if (hasUserInteracted) {
        if (typeof inMemoryApproxCount === "number") {
          return `View ${inMemoryApproxCount} ${categoryName || "SINGLE"} tombstones`;
        }
        return loadingIndicator;
      }
      const initialCount =
        typeof searchIndexTotal === "number" ? searchIndexTotal : "100+";
      return `View ${initialCount} ${categoryName || "SINGLE"} tombstones`;
    }

    if (isCalculating) {
      return loadingIndicator;
    }
    
    // If we have a search term
    // (removed specific search override text so the main button behaves normally)

    const displayCount = searchButtonCount;
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
      const forceKeepOpen =
        name === "location" &&
        typeof window !== "undefined" &&
        window.innerWidth >= 768;

      setHasUserInteracted(true);
      setIsCalculating(true);
    
      if (setFilters) {
        setFilters((prev) => {
        
          const newFilters = {
            ...prev,
            [name]: value,
          };

          return newFilters;
        });
      }
      if (!(keepOpen || forceKeepOpen)) {
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
                  setHasUserInteracted(true);
                  const searchTermLower = searchTerm.toLowerCase();
                  setCurrentQuery(searchTerm);
                  setIsSearchFormFocused(true);

                  // Update search filter in real-time as user types
                  if (setFilters) {
                    setFilters((prev) => {
                      const next = { ...prev, search: searchTerm };

                      if (
                        searchTermLower.includes("cheap") ||
                        searchTermLower.includes("affordable")
                      ) {
                        next.minPrice = "R 5,001";
                        next.maxPrice = "R 15,000";
                      }

                      if (searchTermLower.includes("granite")) {
                        next.stoneType = "Granite";
                      } else if (searchTermLower.includes("marble")) {
                        next.stoneType = "Marble";
                      }

                      return next;
                    });
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
                }}
                onSubmit={(searchContent) => {
                  const q = String(searchContent || "").trim();
                  if (setFilters) {
                    setFilters((prev) => ({ ...prev, search: q }));
                  }

                  if (q) {
                    const qs = buildResultsQueryString({ ...(filters || {}), search: q });
                    if (onNavigateToResults) {
                      onNavigateToResults(qs);
                    } else if (router) {
                      router.push(qs ? `/tombstones-for-sale?${qs}` : "/tombstones-for-sale");
                    }
                  }
                }}
                // Pass additional props for navigation
                selectedCategory={selectedCategory}
                categories={categories}
                activeTab={activeTab}
                currentQuery={currentQuery}
                searchButtonCount={searchButtonCount}
                onQueryChange={(q) => setCurrentQuery(q)}
                onTypingChange={useCallback((typing) => setIsSearchFormFocused(typing), [])}
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
              {showMinPrice && (
                <FilterDropdown
                  name="minPrice"
                  label="Min Price"
                  options={minPriceOptions}
                  openDropdown={uiState.openDropdown}
                  toggleDropdown={toggleDropdown}
                  selectOption={selectOption}
                  filters={filters || {}}
                  dropdownRefs={dropdownRefs}
                />
              )}
              {showMaxPrice && (
                <FilterDropdown
                  name="maxPrice"
                  label="Max Price"
                  options={maxPriceOptions}
                  openDropdown={uiState.openDropdown}
                  toggleDropdown={toggleDropdown}
                  selectOption={selectOption}
                  filters={filters || {}}
                  dropdownRefs={dropdownRefs}
                />
              )}
              {showLocation && (
                <FilterDropdown
                  name="location"
                  label="Location"
                  options={visibleLocationHierarchy}
                  openDropdown={uiState.openDropdown}
                  toggleDropdown={toggleDropdown}
                  selectOption={selectOption}
                  filters={filters || {}}
                  dropdownRefs={dropdownRefs}
                  selectedLocationTotal={searchButtonCount}
                  locationCountBaseFilters={locationCountBaseFilters}
                />
              )}
              {showOverallStyle && (
                <FilterDropdown
                  name="overallStyle"
                  label="Style"
                  options={overallStyleOptions}
                  openDropdown={uiState.openDropdown}
                  toggleDropdown={toggleDropdown}
                  selectOption={selectOption}
                  filters={filters || {}}
                  dropdownRefs={dropdownRefs}
                />
              )}
              {showStyle && (
                <FilterDropdown
                  name="style"
                  label="Head Style"
                  options={styleOptions}
                  openDropdown={uiState.openDropdown}
                  toggleDropdown={toggleDropdown}
                  selectOption={selectOption}
                  filters={filters || {}}
                  dropdownRefs={dropdownRefs}
                />
              )}
              {/* NOTE: Slab Style intentionally NOT here anymore */}
            </div>

            {/* Mobile-only Location Modal (full-screen handled inside modal) */}
            {showLocationModal && (
              <LocationModal
                isOpen={showLocationModal}
                onClose={() => setShowLocationModal(false)}
                locationsData={visibleLocationHierarchy}
                locationCountBaseFilters={locationCountBaseFilters}
                selectedLocations={filters?.location}
                onSelectLocation={(loc) => {
                  if (setFilters) {
                    setFilters((prev) => ({
                      ...prev,
                      location: Array.isArray(loc) ? loc : typeof loc === "string" ? loc : "Near me",
                    }));
                  }
                  setShowLocationModal(false);
                }}
              />
            )}

            {/* Action Buttons Container */}
            <div className="flex flex-col sm:flex-row gap-2 sm:gap-4 mt-8 w-full">
              {/* More Options Button */}
              {hasMoreOptions ? (
                isDesktop ? (
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
                )
              ) : null}
              {/* Mobile-only: showAllOptions tray (acts like more options) */}
              {!isDesktop && uiState.showAllOptions && (
                <>
                  {showSlabStyle && (
                    <FilterDropdown
                      name="slabStyle"
                      label="Slab Style"
                      options={slabStyleOptions}
                      openDropdown={uiState.openDropdown}
                      toggleDropdown={toggleDropdown}
                      selectOption={selectOption}
                      filters={filters || {}}
                      dropdownRefs={dropdownRefs}
                    />
                  )}
                  {showStoneType && (
                    <FilterDropdown
                      name="stoneType"
                      label="Stone Type"
                      options={stoneTypeOptions}
                      openDropdown={uiState.openDropdown}
                      toggleDropdown={toggleDropdown}
                      selectOption={selectOption}
                      filters={filters || {}}
                      dropdownRefs={dropdownRefs}
                    />
                  )}
                  {showColour && (
                    <FilterDropdown
                      name="colour"
                      label="Colour"
                      options={colourOptions}
                      openDropdown={uiState.openDropdown}
                      toggleDropdown={toggleDropdown}
                      selectOption={selectOption}
                      filters={filters || {}}
                      dropdownRefs={dropdownRefs}
                    />
                  )}
                  {showCustom && (
                    <FilterDropdown
                      name="custom"
                      label="Customisation"
                      options={customOptions}
                      openDropdown={uiState.openDropdown}
                      toggleDropdown={toggleDropdown}
                      selectOption={selectOption}
                      filters={filters || {}}
                      dropdownRefs={dropdownRefs}
                    />
                  )}
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
          {isDesktop && hasMoreOptions && (
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
                {showSlabStyle && (
                  <FilterDropdown
                    name="slabStyle"
                    label="Slab Style"
                    options={slabStyleOptions}
                    openDropdown={uiState.openDropdown}
                    toggleDropdown={toggleDropdown}
                    selectOption={selectOption}
                    filters={filters || {}}
                    dropdownRefs={dropdownRefs}
                  />
                )}
                {showStoneType && (
                  <FilterDropdown
                    name="stoneType"
                    label="Stone Type"
                    options={stoneTypeOptions}
                    openDropdown={uiState.openDropdown}
                    toggleDropdown={toggleDropdown}
                    selectOption={selectOption}
                    filters={filters || {}}
                    dropdownRefs={dropdownRefs}
                  />
                )}
                {showColour && (
                  <FilterDropdown
                    name="colour"
                    label="Colour"
                    options={colourOptions}
                    openDropdown={uiState.openDropdown}
                    toggleDropdown={toggleDropdown}
                    selectOption={selectOption}
                    filters={filters || {}}
                    dropdownRefs={dropdownRefs}
                  />
                )}
                {showCustom && (
                  <FilterDropdown
                    name="custom"
                    label="Customisation"
                    options={customOptions}
                    openDropdown={uiState.openDropdown}
                    toggleDropdown={toggleDropdown}
                    selectOption={selectOption}
                    filters={filters || {}}
                    dropdownRefs={dropdownRefs}
                  />
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SearchContainer;
