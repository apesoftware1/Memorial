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
import { useHomepageAggregations } from "@/hooks/useHomepageAggregations";
import { AnimatePresence, motion } from "framer-motion";
import { toTitleCase } from "@/lib/locationHelpers";

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
  const [filterVisibility, setFilterVisibility] = useState({ hidden: [], hiddenOptions: {}, updatedAt: "" });

  // State for location search
  const [searchTerm, setSearchTerm] = useState("");

  // Refs for dropdowns
  const dropdownRefs = useRef({});
  const [hasUserInteracted, setHasUserInteracted] = useState(false);
  const hasMountedRef = useRef(false);
  const prevActiveTabRef = useRef(activeTab);
  const [stickyLocationHierarchy, setStickyLocationHierarchy] = useState([]);

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

  const effectiveAggFilters = useMemo(() => {
    const loc = parseLocationSelection(filters?.location);
    const minPrice =
      filters?.minPrice && filters.minPrice !== "Min Price" ? parsePrice(filters.minPrice) : null;
    const maxPrice =
      filters?.maxPrice && filters.maxPrice !== "Max Price" ? parsePrice(filters.maxPrice) : null;

    const rawColor = pickMulti(filters?.colour || filters?.color);
    const rawStyle = pickMulti(filters?.style);
    const rawStoneType = pickMulti(filters?.stoneType);
    const rawCustomization = pickMulti(filters?.custom);
    const rawSlabStyle = pickMulti(filters?.slabStyle);

    return {
      province: loc.province,
      city: loc.city,
      town: loc.town,
      minPrice: Number.isFinite(minPrice) && minPrice > 0 ? minPrice : null,
      maxPrice: Number.isFinite(maxPrice) && maxPrice > 0 ? maxPrice : null,
      color: canonicalizeFromOptions(rawColor, filterOptions?.colour),
      style: canonicalizeFromOptions(rawStyle, filterOptions?.style),
      stoneType: canonicalizeFromOptions(rawStoneType, filterOptions?.stoneType),
      customization: canonicalizeFromOptions(rawCustomization, filterOptions?.custom),
      slabStyle: canonicalizeFromOptions(rawSlabStyle, filterOptions?.slabStyle),
    };
  }, [filters, parseLocationSelection, pickMulti, canonicalizeFromOptions, filterOptions]);

  const { data: homepageAggData, loading: aggLoading } = useHomepageAggregations({
    filters: effectiveAggFilters,
  });

  const homepageAggByCategory = useMemo(() => {
    const categories = homepageAggData?.homepageAggregations?.categories;
    if (!Array.isArray(categories)) return {};
    return categories.reduce((acc, c) => {
      const name = typeof c?.name === "string" ? c.name.toUpperCase() : "";
      if (name) acc[name] = c;
      return acc;
    }, {});
  }, [homepageAggData]);

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

  const currentCategoryAgg = useMemo(() => {
    const name = typeof currentCategoryName === "string" ? currentCategoryName.toUpperCase() : "";
    if (name) return homepageAggByCategory[name] || null;
    return homepageAggByCategory["SINGLE"] || null;
  }, [currentCategoryName, homepageAggByCategory]);

  const currentCategoryAggCount = useMemo(() => {
    const v = currentCategoryAgg?.count;
    return typeof v === "number" ? v : null;
  }, [currentCategoryAgg]);

  const homepageAggLocationHierarchy = useMemo(() => {
    const locations = currentCategoryAgg?.locations;
    if (!Array.isArray(locations)) return [];

    return locations
      .map((prov) => {
        const provinceName = typeof prov?.province === "string" ? prov.province : "";
        const provinceCount = typeof prov?.count === "number" ? prov.count : 0;
        const cities = Array.isArray(prov?.cities) ? prov.cities : [];

        return {
          name: provinceName,
          count: provinceCount,
          cities: cities
            .map((city) => {
              const cityName = typeof city?.city === "string" ? city.city : "";
              const cityCount = typeof city?.count === "number" ? city.count : 0;
              const towns = Array.isArray(city?.towns) ? city.towns : [];

              return {
                name: cityName,
                count: cityCount,
                towns: towns
                  .map((town) => ({
                    name: typeof town?.town === "string" ? town.town : "",
                    count: typeof town?.count === "number" ? town.count : 0,
                  }))
                  .filter((t) => t.name),
              };
            })
            .filter((c) => c.name),
        };
      })
      .filter((p) => p.name);
  }, [currentCategoryAgg]);

  const selectedLocationValues = useMemo(() => {
    const value = filters?.location;
    if (!value) return [];
    if (Array.isArray(value)) {
      return value
        .map((v) => (typeof v === "string" ? v.trim() : ""))
        .filter((v) => v && v.toLowerCase() !== "any" && v.toLowerCase() !== "all");
    }
    if (typeof value === "string") {
      const trimmed = value.trim();
      if (!trimmed) return [];
      const lowered = trimmed.toLowerCase();
      if (lowered === "any" || lowered === "all") return [];
      return [trimmed];
    }
    return [];
  }, [filters?.location]);

  const aggHasCategories = Array.isArray(homepageAggData?.homepageAggregations?.categories);
  const aggResolved = !aggLoading && aggHasCategories;
  const hasAggCount = typeof currentCategoryAggCount === "number";
  const hasLocationSelection = selectedLocationValues.length > 0;

  useEffect(() => {
    if (hasLocationSelection) return;
    if (
      Array.isArray(homepageAggLocationHierarchy) &&
      homepageAggLocationHierarchy.length > 0
    ) {
      setStickyLocationHierarchy(homepageAggLocationHierarchy);
    }
  }, [hasLocationSelection, homepageAggLocationHierarchy]);

  const locationHierarchy =
    hasLocationSelection &&
    Array.isArray(stickyLocationHierarchy) &&
    stickyLocationHierarchy.length > 0
      ? stickyLocationHierarchy
      : homepageAggLocationHierarchy;
  const filtersLoading = aggLoading || !aggResolved;

  const searchButtonCount = aggResolved ? (hasAggCount ? currentCategoryAggCount : 0) : 0;

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

  // Default functions if not provided
  const defaultHandleSearch = useCallback(() => {
    setInternalIsSearching(true);
    // Note: We no longer need to filter allListings locally for state
    // But we might simulate a delay for UX
    setTimeout(() => setInternalIsSearching(false), 300);
    
    // Navigate to results page with category parameter
    if (onNavigateToResults) {
      // Build query string from all active filters
      const params = new URLSearchParams();
      
      // Category
      if (selectedCategory) {
        params.set('category', selectedCategory);
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
           params.set('category', selectedCategoryObj.name);
        }
      }
      
      // Other filters
      if (filters) {
          if (filters.minPrice && filters.minPrice !== 'Min Price') params.set('minPrice', filters.minPrice);
          if (filters.maxPrice && filters.maxPrice !== 'Max Price') params.set('maxPrice', filters.maxPrice);
          if (filters.search) params.set('search', filters.search);
          
          // Multi-selects (arrays)
          if (Array.isArray(filters.location) && filters.location.length > 0) params.set('location', filters.location.join(','));
          else if (filters.location && filters.location !== 'Any') params.set('location', filters.location);

          if (Array.isArray(filters.style) && filters.style.length > 0) params.set('style', filters.style.join(','));
          else if (filters.style && filters.style !== 'Any') params.set('style', filters.style);

          if (Array.isArray(filters.slabStyle) && filters.slabStyle.length > 0) params.set('slabStyle', filters.slabStyle.join(','));
          else if (filters.slabStyle && filters.slabStyle !== 'Any') params.set('slabStyle', filters.slabStyle);

          if (Array.isArray(filters.stoneType) && filters.stoneType.length > 0) params.set('stoneType', filters.stoneType.join(','));
          else if (filters.stoneType && filters.stoneType !== 'Any') params.set('stoneType', filters.stoneType);

          if (Array.isArray(filters.colour) && filters.colour.length > 0) params.set('colour', filters.colour.join(','));
          else if (filters.colour && filters.colour !== 'Any') params.set('colour', filters.colour);

          if (Array.isArray(filters.custom) && filters.custom.length > 0) params.set('custom', filters.custom.join(','));
          else if (filters.custom && filters.custom !== 'Any') params.set('custom', filters.custom);
      }
      
      // Construct the full query string
      const queryString = params.toString();
      const finalParam = queryString ? `&${queryString}` : ""; // onNavigateToResults expects a string starting with & or empty? 
      // Checking usage in Home page... usually it expects just the params part.
      // But let's check how onNavigateToResults is used.
      
      // Include the category parameter in the navigation
      onNavigateToResults(finalParam);
    }
  }, [onNavigateToResults, selectedCategory, categories, activeTab, filters]);


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
        typeof currentCategoryAggCount === "number" ? currentCategoryAggCount : "100+";
      return `View ${initialCount} ${categoryName || "SINGLE"} tombstones`;
    }

    if (isCalculating) {
      return loadingIndicator;
    }
    
    // If we have a search term
    if (filters?.search && filters.search !== "") {
      if (categoryLabel) {
         return `Found ${searchButtonCount} ${categoryLabel}`;
      }
      return `Found ${searchButtonCount} results`;
    }

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
