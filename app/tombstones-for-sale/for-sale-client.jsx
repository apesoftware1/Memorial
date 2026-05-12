"use client"

import { useState, useRef, useEffect, useMemo, useCallback } from "react"
import Link from "next/link"
import { ChevronDown, Search, ChevronRight, Menu, X } from "lucide-react"
import Header from "@/components/Header"
import Image from "next/image"
import { useFavorites } from "@/context/favorites-context.jsx"
import FeaturedListings from "@/components/FeaturedListings"
import { PremiumListingCard } from "@/components/premium-listing-card"
import { PremiumListingCardModal } from "@/components/premium-listing-card-modal"
import TombstonesForSaleFilters from "@/components/TombstonesForSaleFilters"
import FeaturedManufacturer from '@/components/FeaturedManufacturer';
import BannerAd from '@/components/BannerAd';
import Pagination from '@/components/Pagination';
import CategoryTabs from '@/components/CategoryTabs.jsx';
import MobileFilterTags from "@/components/MobileFilterTags";
import MobileResultsBar from "@/components/MobileResultsBar";
import { useSearchParams, useRouter } from 'next/navigation';
import { PageLoader, CardSkeleton } from "@/components/ui/loader";

import {
  LISTINGS_FEATURED_CARDS_QUERY,
  LISTING_SEARCH_INDEX_CONNECTION_QUERY,
  LISTING_SEARCH_LOCATION_OPTIONS_QUERY,
  LISTINGS_BY_DOCUMENT_IDS_QUERY,
} from '@/graphql/queries';
import { useApolloClient, useQuery } from "@apollo/client";
import { useListingCategories } from "@/hooks/use-ListingCategories"
import { useLocationHierarchy } from '@/hooks/useLocationHierarchy';
import { useHomepageAggregations } from '@/hooks/useHomepageAggregations';
import { checkListingLocation, toTitleCase, DEFAULT_PROVINCES, normalizeCityName } from '@/lib/locationHelpers';
import { useGuestLocation } from "@/hooks/useGuestLocation";

export default function TombstonesForSaleClient({ initialListings = [], initialCategories = [] }) {
  const [enableQueries, setEnableQueries] = useState(false);
  useEffect(() => {
    setEnableQueries(true);
  }, []);

  const { categories: fetchedCategories, loading: categoriesLoading } = useListingCategories({ skip: !enableQueries });
  const categories = fetchedCategories?.length ? fetchedCategories : initialCategories;
  const topFeaturedManufacturers = useMemo(() => [], []);

  const [activeTab, setActiveTab] = useState(0);
  const searchParams = useSearchParams();
  const searchParamsKey = searchParams ? searchParams.toString() : '';
  const [currentPage, setCurrentPage] = useState(1);
  const listingsPerPage = 20;
  const [sortOrder, setSortOrder] = useState("Default");

  const [featuredActiveIndex, setFeaturedActiveIndex] = useState(0);
  const featuredScrollRef = useRef(null);
  const router = useRouter();
  const { location: guestLocation } = useGuestLocation();

  const { data: listingSearchLocationOptionsData } = useQuery(LISTING_SEARCH_LOCATION_OPTIONS_QUERY, {
    skip: !enableQueries,
    fetchPolicy: "cache-first",
  });

  const locationOptionsHierarchy = useMemo(() => {
    const raw = listingSearchLocationOptionsData?.listingSearchLocationOptions;
    if (!Array.isArray(raw)) return [];
    return raw
      .map((prov) => {
        const provinceName = typeof prov?.province === "string" ? prov.province : "";
        const cities = Array.isArray(prov?.cities) ? prov.cities : [];
        return {
          name: provinceName,
          count: 0,
          cities: cities
            .map((city) => {
              const cityName = typeof city?.city === "string" ? city.city : "";
              const towns = Array.isArray(city?.towns) ? city.towns : [];
              return {
                name: cityName,
                count: 0,
                towns: towns
                  .map((town) => ({
                    name: typeof town?.town === "string" ? town.town : "",
                    count: 0,
                  }))
                  .filter((t) => t.name),
              };
            })
            .filter((c) => c.name),
        };
      })
      .filter((p) => p.name);
  }, [listingSearchLocationOptionsData]);
  
  const handleFeaturedScroll = () => {
    if (featuredScrollRef.current) {
      const scrollLeft = featuredScrollRef.current.scrollLeft;
      const cardWidth = 272;
      const newIndex = Math.round(scrollLeft / cardWidth);
      setFeaturedActiveIndex(Math.min(newIndex, 2));
    }
  };

  const scrollToFeaturedCard = (index) => {
    if (featuredScrollRef.current) {
      const cardWidth = 272;
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
  
  const listingsSort = useMemo(() => {
    if (sortOrder === "Price: Low to High") return ["price:asc"];
    if (sortOrder === "Price: High to Low") return ["price:desc"];
    if (sortOrder === "Newest First") return ["updatedAt:desc"];
    return undefined;
  }, [sortOrder]);

  const [showFilters, setShowFilters] = useState(null)

  const [activeFilters, setActiveFilters] = useState({
    minPrice: "Min Price",
    maxPrice: "Max Price",
    location: null,
    stoneType: null,
    color: null,
    style: null,
    overallStyle: null,
    slabStyle: null,
    custom: null,
    colour: null,
    category: null,
    search: null,
  })

  const [debouncedActiveFilters, setDebouncedActiveFilters] = useState(activeFilters);
  const debounceTimerRef = useRef(null);
  useEffect(() => {
    if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
    debounceTimerRef.current = setTimeout(() => {
      setDebouncedActiveFilters(activeFilters);
    }, 400);
    return () => {
      if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
    };
  }, [activeFilters]);

  const isUrlUpdating = useRef(false);
  const didInitUrlSync = useRef(false);
  const didEverSyncNonDefaultRef = useRef(false);

  useEffect(() => {
    if (!searchParams) return;
    if (isUrlUpdating.current) return;
    
    setActiveFilters(prev => {
      const newFilters = { ...prev };
      let hasChanges = false;

      const getParam = (key) => {
        const val = searchParams.get(key);
        if (!val) return null;
        return val.includes(',') ? val.split(',') : [val];
      };

      const isEncodedLocation = (v) => typeof v === "string" && /^[pct]\|/.test(v);
      const locationVal = searchParams.get('location');
      let locationNormalized = null;
      if (locationVal) {
        const raw = locationVal
          .split(';')
          .map(s => s.trim())
          .filter(Boolean);

        if (raw.length > 0 && raw.every(isEncodedLocation)) {
          locationNormalized = raw;
        } else {
          const legacyRaw = locationVal.split(',').map(s => s.trim()).filter(Boolean);
          locationNormalized = legacyRaw.map(l => {
            const knownProv = DEFAULT_PROVINCES.find(p => p.toLowerCase() === l.toLowerCase());
            if (knownProv) return knownProv;
            return normalizeCityName(l);
          });
        }

        if (Array.isArray(locationNormalized) && locationNormalized.length === 0) locationNormalized = null;
      }

      if (JSON.stringify(locationNormalized) !== JSON.stringify(prev.location)) {
        newFilters.location = locationNormalized;
        hasChanges = true;
      }

      const minPrice = searchParams.get('minPrice') || "Min Price";
      if (minPrice !== prev.minPrice) {
        newFilters.minPrice = minPrice;
        hasChanges = true;
      }

      const maxPrice = searchParams.get('maxPrice') || "Max Price";
      if (maxPrice !== prev.maxPrice) {
        newFilters.maxPrice = maxPrice;
        hasChanges = true;
      }
      
      const search = searchParams.get('search') || searchParams.get('query') || "";
      if (search !== prev.search) {
        newFilters.search = search;
        hasChanges = true;
      }

      const colorParam = searchParams.get('colour') || searchParams.get('color');
      const colorVal = colorParam ? (colorParam.includes(',') ? colorParam.split(',') : [colorParam]) : null;
      
      if (JSON.stringify(colorVal) !== JSON.stringify(prev.colour)) {
        newFilters.colour = colorVal;
        newFilters.color = colorVal;
        hasChanges = true;
      }

      const stoneType = getParam('stoneType') || getParam('material');
      if (JSON.stringify(stoneType) !== JSON.stringify(prev.stoneType)) {
        newFilters.stoneType = stoneType;
        hasChanges = true;
      }

      const custom = getParam('custom') || getParam('customization');
      if (JSON.stringify(custom) !== JSON.stringify(prev.custom)) {
        newFilters.custom = custom;
        hasChanges = true;
      }

      ['style', 'slabStyle'].forEach(key => {
        const val = getParam(key);
        if (JSON.stringify(val) !== JSON.stringify(prev[key])) {
          newFilters[key] = val;
          hasChanges = true;
        }
      });

      const overallStyle = getParam('overallStyle');
      if (JSON.stringify(overallStyle) !== JSON.stringify(prev.overallStyle)) {
        newFilters.overallStyle = overallStyle;
        hasChanges = true;
      }

      if (hasChanges) {
        return newFilters;
      }
      return prev;
    });
  }, [searchParamsKey]);

  useEffect(() => {
    if (!searchParams) return;
    if (isUrlUpdating.current) return;

    const isEmpty = (v) => {
      if (!v) return true;
      if (typeof v === "string") {
        const t = v.trim();
        if (!t) return true;
        return t === "Any" || t === "All" || t === "All Categories";
      }
      if (Array.isArray(v)) {
        if (v.length === 0) return true;
        return v.every((x) => {
          if (typeof x !== "string") return false;
          const t = x.trim();
          if (!t) return true;
          return t === "Any" || t === "All" || t === "All Categories";
        });
      }
      return false;
    };

    const isDefaultState =
      activeFilters.minPrice === "Min Price" &&
      activeFilters.maxPrice === "Max Price" &&
      isEmpty(activeFilters.location) &&
      isEmpty(activeFilters.stoneType) &&
      isEmpty(activeFilters.colour || activeFilters.color) &&
      isEmpty(activeFilters.style) &&
      isEmpty(activeFilters.overallStyle) &&
      isEmpty(activeFilters.slabStyle) &&
      isEmpty(activeFilters.custom) &&
      isEmpty(activeFilters.search);

    const hasUrlParams = 
        searchParams.has('minPrice') || 
        searchParams.has('maxPrice') || 
        searchParams.has('location') || 
        searchParams.has('stoneType') || 
        searchParams.has('colour') || 
        searchParams.has('style') || 
        searchParams.has('overallStyle') || 
        searchParams.has('slabStyle') || 
        searchParams.has('custom') ||
        searchParams.has('search');

    if (!didEverSyncNonDefaultRef.current && isDefaultState && hasUrlParams) {
      return;
    }

    if (!isDefaultState) {
      didEverSyncNonDefaultRef.current = true;
    }

    if (!didInitUrlSync.current) {
      didInitUrlSync.current = true;
      if (isDefaultState && hasUrlParams) return;
    }

    const params = new URLSearchParams(searchParams.toString());
    let hasUpdates = false;

    const updateParam = (key, value) => {
      const current = params.get(key);
      
      if (!value || value === 'Any' || value === 'All' || value === 'Min Price' || value === 'Max Price' || (Array.isArray(value) && value.length === 0)) {
        if (current) {
          params.delete(key);
          hasUpdates = true;
        }
      } else {
        const isEncodedLocation = (v) => typeof v === "string" && /^[pct]\|/.test(v);
        const strVal =
          key === "location" && Array.isArray(value) && value.length > 0 && value.every(isEncodedLocation)
            ? value.join(";")
            : Array.isArray(value)
              ? value.join(',')
              : value;
        if (current !== strVal) {
          params.set(key, strVal);
          hasUpdates = true;
        }
      }
    };

    updateParam('location', activeFilters.location);
    updateParam('minPrice', activeFilters.minPrice);
    updateParam('maxPrice', activeFilters.maxPrice);
    updateParam('search', activeFilters.search);
    updateParam('stoneType', activeFilters.stoneType);
    updateParam('colour', activeFilters.colour || activeFilters.color);
    if (params.has('color')) params.delete('color');
    
    updateParam('style', activeFilters.style);
    updateParam('overallStyle', activeFilters.overallStyle);
    updateParam('slabStyle', activeFilters.slabStyle);
    updateParam('custom', activeFilters.custom);
    
    if (activeFilters.category) {
        const currentCat = params.get('category');
        if (currentCat !== activeFilters.category) {
            params.set('category', activeFilters.category);
            hasUpdates = true;
        }
    }

    if (hasUpdates) {
      isUrlUpdating.current = true;
      router.replace(`?${params.toString()}`, { scroll: false });
      setTimeout(() => {
        isUrlUpdating.current = false;
      }, 100);
    }
  }, [activeFilters, router, searchParamsKey]);

  const [showBranchesModal, setShowBranchesModal] = useState(false);
  const [selectedListing, setSelectedListing] = useState(null);

  const desiredOrder = ["SINGLE", "DOUBLE", "CHILD", "HEAD", "PLAQUES", "CREMATION"];
  const sortedCategories = useMemo(() => {
    return (categories || [])
      .filter(cat => cat?.name)
      .map(cat => ({ ...cat, upper: cat.name.toUpperCase() }))
      .reduce((acc, cat) => {
        const idx = desiredOrder.indexOf(cat.upper);
        if (idx !== -1) acc[idx] = cat;
        return acc;
      }, Array(desiredOrder.length).fill(null))
      .filter(Boolean);
  }, [categories]);

  useEffect(() => {
    if (!sortedCategories.length) return;
    
    const categoryParam = searchParams?.get('category');
    
    if (categoryParam) {
      const idx = sortedCategories.findIndex(c => 
        c.name.toLowerCase() === categoryParam.toLowerCase()
      );
      
      if (idx >= 0) {
        setActiveTab(idx);
        setActiveFilters(prev => {
           if (prev.category !== sortedCategories[idx].name) {
               return { ...prev, category: sortedCategories[idx].name };
           }
           return prev;
        });
        return;
      }
    }
    
    const currentName = activeFilters.category;
    if (currentName) {
      const idx = sortedCategories.findIndex(c => c.name === currentName);
      if (idx >= 0) {
          setActiveTab(idx);
          return;
      }
    } 
    
    if (activeTab === 0 && !activeFilters.category) {
        setActiveFilters(prev => ({ ...prev, category: sortedCategories[0].name }));
    }
  }, [sortedCategories, searchParams]);

  const handleTabChange = (index) => {
    setActiveTab(index);
    const selected = sortedCategories[index];
    if (selected?.name) {
      setActiveFilters(prev => ({ ...prev, category: selected.name }));
    }
  };

  const activeCategory = sortedCategories[activeTab] || null;

  const getBranchesForListing = useCallback((listing) => {
    const map = new Map();

    const direct = Array.isArray(listing?.branches) ? listing.branches : [];
    for (const b of direct) {
      const id = b?.documentId || b?.id || b?.name;
      if (id) map.set(String(id), b);
    }

    const fromListings = Array.isArray(listing?.branch_listings) ? listing.branch_listings : [];
    for (const bl of fromListings) {
      const b = bl?.branch;
      if (!b) continue;
      const id = b?.documentId || b?.id || b?.name;
      if (id) map.set(String(id), b);
    }

    return Array.from(map.values());
  }, []);

  const normalizeLocationToken = useCallback((v) => {
    const s = typeof v === "string" ? v.trim() : "";
    if (!s) return "";
    const knownProv = DEFAULT_PROVINCES.find((p) => p.toLowerCase() === s.toLowerCase());
    if (knownProv) return knownProv.toLowerCase();
    return normalizeCityName(s).toLowerCase();
  }, []);

  const selectedLocationTokens = useMemo(() => {
    const loc = activeFilters?.location;
    if (!Array.isArray(loc) || loc.length === 0) return [];
    return loc.map(normalizeLocationToken).filter(Boolean);
  }, [activeFilters?.location, normalizeLocationToken]);

  const getBranchCoords = useCallback((branch) => {
    const lat = Number(
      branch?.location?.latitude ??
        branch?.location?.lat ??
        branch?.latitude ??
        branch?.lat
    );
    const lng = Number(
      branch?.location?.longitude ??
        branch?.location?.lng ??
        branch?.longitude ??
        branch?.lng
    );
    if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null;
    return { lat, lng };
  }, []);

  const haversineKm = useCallback((a, b) => {
    if (!a || !b) return null;
    const R = 6371;
    const toRad = (v) => (v * Math.PI) / 180;
    const dLat = toRad(b.lat - a.lat);
    const dLng = toRad(b.lng - a.lng);
    const aa =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(toRad(a.lat)) *
        Math.cos(toRad(b.lat)) *
        Math.sin(dLng / 2) *
        Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(aa), Math.sqrt(1 - aa));
    const km = R * c;
    return Number.isFinite(km) ? km : null;
  }, []);

  const branchMatchesSelectedLocations = useCallback(
    (branch) => {
      if (!branch) return false;
      if (selectedLocationTokens.length === 0) return true;
      const province = normalizeLocationToken(branch?.location?.province);
      const city = normalizeLocationToken(branch?.location?.city);
      const town = normalizeLocationToken(branch?.location?.town);
      return selectedLocationTokens.some(
        (t) => t && (t === town || t === city || t === province)
      );
    },
    [normalizeLocationToken, selectedLocationTokens]
  );

  const buildListingItem = useCallback(
    (listing) => {
      const listingId = listing?.documentId || listing?.id;
      const allBranches = getBranchesForListing(listing);
      const relevantBranches =
        selectedLocationTokens.length > 0
          ? allBranches.filter(branchMatchesSelectedLocations)
          : allBranches;

      const userCoords =
        guestLocation && Number.isFinite(guestLocation.lat) && Number.isFinite(guestLocation.lng)
          ? { lat: guestLocation.lat, lng: guestLocation.lng }
          : null;

      let primaryBranch = relevantBranches.length > 0 ? relevantBranches[0] : null;
      let primaryDistanceKm = null;
      let sortedBranches = relevantBranches;

      if (relevantBranches.length > 0 && userCoords) {
        let best = null;
        let bestKm = null;
        for (const b of relevantBranches) {
          const coords = getBranchCoords(b);
          const km = haversineKm(userCoords, coords);
          if (km === null) continue;
          if (bestKm === null || km < bestKm) {
            bestKm = km;
            best = b;
          }
        }
        if (best) {
          primaryBranch = best;
          primaryDistanceKm = bestKm;
        }

        sortedBranches = [...relevantBranches]
          .map((b) => {
            const coords = getBranchCoords(b);
            const km = haversineKm(userCoords, coords);
            return { b, km };
          })
          .sort((x, y) => {
            const ax = x.km;
            const by = y.km;
            if (ax === null && by === null) return 0;
            if (ax === null) return 1;
            if (by === null) return -1;
            return ax - by;
          })
          .map((x) => x.b);
      }

      const modalBranches = sortedBranches;
      let modalBranchesAll = allBranches;
      if (allBranches.length > 0 && userCoords) {
        modalBranchesAll = [...allBranches]
          .map((b) => {
            const coords = getBranchCoords(b);
            const km = haversineKm(userCoords, coords);
            return { b, km };
          })
          .sort((x, y) => {
            const ax = x.km;
            const by = y.km;
            if (ax === null && by === null) return 0;
            if (ax === null) return 1;
            if (by === null) return -1;
            return ax - by;
          })
          .map((x) => x.b);
      }

      const href = listingId
        ? primaryBranch?.name
          ? `/tombstones-for-sale/${listingId}?branch=${encodeURIComponent(primaryBranch.name)}`
          : `/tombstones-for-sale/${listingId}`
        : "#";

      const hideBranchesTag = selectedLocationTokens.length === 1;

      const listingForCard =
        relevantBranches.length > 0
          ? {
              ...listing,
              branches: relevantBranches,
              branch_listings: [],
              currentBranch: primaryBranch,
              __hideBranchesTag: hideBranchesTag,
            }
          : listing;

      return {
        id: listingId,
        href,
        listingForCard,
        primaryBranch,
        primaryDistanceKm,
        modalBranches,
        listingForModal:
          modalBranches.length > 1 ? { ...listing, __branchesOverride: modalBranches } : listing,
        modalBranchesAll,
        listingForModalAll:
          modalBranchesAll.length > 1
            ? { ...listing, __branchesOverride: modalBranchesAll }
            : listing,
      };
    },
    [
      branchMatchesSelectedLocations,
      getBranchCoords,
      getBranchesForListing,
      guestLocation,
      haversineKm,
      selectedLocationTokens.length,
    ]
  );

  const handleListingPrimaryClick = (listingItem) => {
    try {
      const modalBranches = Array.isArray(listingItem?.modalBranches) ? listingItem.modalBranches : [];
      if (modalBranches.length > 0) {
        setSelectedListing(listingItem.listingForModal);
        setShowBranchesModal(true);
        return true;
      }
    } catch (e) {
      console.error('Failed handling primary click for listing', e);
    }
    return false;
  };

  const handleListingViewMoreBranchesClick = (listingItem) => {
    try {
      const modalBranchesAll = Array.isArray(listingItem?.modalBranchesAll)
        ? listingItem.modalBranchesAll
        : [];
      if (modalBranchesAll.length > 1) {
        setSelectedListing(listingItem.listingForModalAll);
        setShowBranchesModal(true);
        return true;
      }
    } catch (e) {
      console.error("Failed handling view more branches for listing", e);
    }
    return false;
  };

  const handleBranchSelect = (branch) => {
    try {
      const listingId = selectedListing?.documentId || selectedListing?.id;
      const branchId = branch?.name || branch?.id || branch?.documentId;
      if (listingId && branchId) {
        setShowBranchesModal(false);
        const branchData = encodeURIComponent(JSON.stringify(branch));
        router.push(`/tombstones-for-sale/${listingId}?branch=${encodeURIComponent(branchId)}&branchData=${branchData}`);
      }
    } catch (e) {
      console.error('Failed to navigate to product showcase from branch selection', e);
    }
  };
  
  const getActiveCategory = () => {
    if (!categories || !categories.length) return '';
    if (activeFilters.category && activeFilters.category !== 'All Categories') return activeFilters.category;
    return '';
  };
  const didInitQueryPageRef = useRef(false);
  useEffect(() => {
    if (!didInitQueryPageRef.current) {
      didInitQueryPageRef.current = true;
      return;
    }
    setCurrentPage(1);
  }, [activeFilters, activeTab]);

  const isMeaningfulToken = (x) =>
    typeof x === "string" &&
    x.trim() !== "" &&
    x.trim().toLowerCase() !== "any" &&
    x.trim().toLowerCase() !== "all" &&
    x.trim().toLowerCase() !== "all categories";

  const getLocationTokensForServerFilter = (raw) => {
    if (!raw) return [];
    if (typeof raw === "string") {
      const v = raw.trim();
      if (!isMeaningfulToken(v) || v.toLowerCase() === "near me") return [];
      return [v];
    }

    if (Array.isArray(raw)) {
      const tokens = raw.map((x) => (typeof x === "string" ? x.trim() : String(x ?? "").trim())).filter(Boolean);
      if (tokens.length === 0) return [];

      const provinceSet = new Set([
        "gauteng",
        "western cape",
        "kwazulu-natal",
        "eastern cape",
        "free state",
        "limpopo",
        "northern cape",
        "mpumalanga",
        "north west",
        "northwest",
      ]);

      const firstLower = tokens[0]?.toLowerCase();
      const looksHierarchical = tokens.length === 3 && (provinceSet.has(firstLower) || firstLower === "any");
      if (looksHierarchical) {
        const mostSpecific = [tokens[2], tokens[1], tokens[0]].find((t) => isMeaningfulToken(t));
        return mostSpecific ? [mostSpecific] : [];
      }

      return tokens.filter(isMeaningfulToken);
    }

    return [];
  };

  const normalizeLower = (v) => (typeof v === "string" ? v.trim().toLowerCase() : "");

  const listTokens = (v) => {
    if (!v) return [];
    const arr = Array.isArray(v) ? v : [v];
    return arr
      .map((x) => (typeof x === "string" ? x.trim() : String(x ?? "").trim()))
      .filter(Boolean)
      .filter((x) => isMeaningfulToken(x));
  };

  const packedTokenVariants = (raw) => {
    const base = normalizeLower(raw);
    if (!base) return [];
    const kebab = base.replace(/[^a-z0-9]+/g, "-").replace(/-+/g, "-").replace(/^-|-$/g, "");
    const variants = new Set([base, kebab]);
    return Array.from(variants).filter(Boolean).map((v) => `|${v}|`);
  };

  const searchIndexFilters = useMemo(() => {
    const and = [];

    and.push({ published: { eq: true } });
    and.push({ is_on_special: { eq: false } });

    const categoryName =
      typeof debouncedActiveFilters?.category === "string" &&
      debouncedActiveFilters.category &&
      debouncedActiveFilters.category !== "All Categories"
        ? debouncedActiveFilters.category
        : activeCategory?.name;

    if (categoryName) {
      and.push({ category: { eq: normalizeLower(categoryName) } });
    }

    const locationRaw = debouncedActiveFilters?.location;
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
      const locationVals = listTokens(getLocationTokensForServerFilter(locationRaw));
      if (locationVals.length) {
        and.push({
          or: locationVals.flatMap((v) =>
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

    addPackedOr("stone_type", listTokens(debouncedActiveFilters?.stoneType));
    addPackedOr("head_style", listTokens(debouncedActiveFilters?.style));
    addPackedOr("style", listTokens(debouncedActiveFilters?.overallStyle));
    addPackedOr("slab_style", listTokens(debouncedActiveFilters?.slabStyle));
    addPackedOr("customization", listTokens(debouncedActiveFilters?.custom));
    addPackedOr("color", listTokens(debouncedActiveFilters?.colour || debouncedActiveFilters?.color));

    const searchRaw = typeof debouncedActiveFilters?.search === "string" ? debouncedActiveFilters.search.trim() : "";
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

    const minPrice =
      debouncedActiveFilters?.minPrice && debouncedActiveFilters.minPrice !== "Min Price"
        ? parsePrice(debouncedActiveFilters.minPrice)
        : null;
    const maxPrice =
      debouncedActiveFilters?.maxPrice && debouncedActiveFilters.maxPrice !== "Max Price"
        ? parsePrice(debouncedActiveFilters.maxPrice)
        : null;

    if (Number.isFinite(minPrice) && minPrice > 0) and.push({ price: { gte: minPrice } });
    if (Number.isFinite(maxPrice) && maxPrice > 0) and.push({ price: { lte: maxPrice } });

    return and.length ? { and } : undefined;
  }, [activeCategory?.name, debouncedActiveFilters]);

  const locationCountBaseFilters = useMemo(() => {
    if (!searchIndexFilters || !Array.isArray(searchIndexFilters.and)) return searchIndexFilters;
    const isLocObj = (obj) => {
      if (!obj || typeof obj !== "object") return false;
      if (obj.provinces || obj.cities || obj.towns) return true;
      if (obj.province || obj.city || obj.town) return true;
      if (Array.isArray(obj.or)) {
        return obj.or.some((o) => o && typeof o === "object" && (o.provinces || o.cities || o.towns || o.province || o.city || o.town));
      }
      return false;
    };
    const and = searchIndexFilters.and.filter((clause) => !isLocObj(clause));
    return { and };
  }, [searchIndexFilters]);

  const searchIndexQueryVars = useMemo(
    () => ({
      page: currentPage,
      pageSize: listingsPerPage,
      filters: searchIndexFilters,
    }),
    [currentPage, listingsPerPage, searchIndexFilters]
  );

  const {
    data: searchIndexConnData,
    loading: searchIndexLoading,
    error: searchIndexError,
  } = useQuery(LISTING_SEARCH_INDEX_CONNECTION_QUERY, {
    variables: searchIndexQueryVars,
    skip: !enableQueries,
    fetchPolicy: "cache-and-network",
  });

  const searchIndexPageInfo = searchIndexConnData?.listingSearchIndices_connection?.pageInfo;
  const searchIndexNodes = searchIndexConnData?.listingSearchIndices_connection?.nodes;

  const listingDocumentIds = useMemo(() => {
    if (!Array.isArray(searchIndexNodes)) return [];
    return searchIndexNodes
      .map((n) => (n?.listing_document_id ? String(n.listing_document_id) : ""))
      .filter(Boolean);
  }, [searchIndexNodes]);

  const listingsByIdsVars = useMemo(
    () => ({
      ids: listingDocumentIds,
      pageSize: Math.max(1, listingDocumentIds.length),
      branchesPageSize: 25,
      branchListingsPageSize: 25,
    }),
    [listingDocumentIds]
  );

  const {
    data: listingsByIdsData,
    loading: listingsByIdsLoading,
    error: listingsByIdsError,
  } = useQuery(LISTINGS_BY_DOCUMENT_IDS_QUERY, {
    variables: listingsByIdsVars,
    skip: !enableQueries || listingDocumentIds.length === 0,
    fetchPolicy: "cache-first",
  });

  const filteredListings = useMemo(() => {
    if (enableQueries && listingDocumentIds.length > 0) {
      const items = listingsByIdsData?.listings;
      const map = new Map();
      if (Array.isArray(items)) {
        for (const l of items) {
          const id = l?.documentId ? String(l.documentId) : "";
          if (id) map.set(id, l);
        }
      }
      const ordered = listingDocumentIds.map((id) => map.get(id)).filter(Boolean);
      if (ordered.length > 0) return ordered;
    }
    return Array.isArray(initialListings) ? initialListings : [];
  }, [enableQueries, initialListings, listingDocumentIds, listingsByIdsData]);

  const totalListingsCount = useMemo(() => {
    const t = searchIndexPageInfo?.total;
    return typeof t === "number" ? t : filteredListings.length;
  }, [filteredListings.length, searchIndexPageInfo?.total]);

  const listingsLoading = searchIndexLoading || listingsByIdsLoading;
  const listingsError = searchIndexError || listingsByIdsError;

  const { data: featuredListingsData } = useQuery(LISTINGS_FEATURED_CARDS_QUERY, {
    variables: { page: 1, pageSize: 3 },
    skip: !enableQueries,
    fetchPolicy: "cache-first",
  });

  const featuredListings = useMemo(() => {
    const items = featuredListingsData?.listings;
    if (Array.isArray(items)) return items;
    return Array.isArray(initialListings) ? initialListings.filter((l) => l?.isFeatured).slice(0, 3) : [];
  }, [featuredListingsData, initialListings]);

  const listingsForLocationCounts = useMemo(() => [], []);

  const pickScalar = (v) => {
    if (Array.isArray(v)) return v.length > 0 ? v[v.length - 1] : null;
    if (v === undefined || v === null) return null;
    if (v === "Any" || v === "All" || v === "") return null;
    return v;
  };

  const canonicalizeFromOptions = (value, options) => {
    if (!value || typeof value !== "string") return value;
    if (!Array.isArray(options) || options.length === 0) return value;
    const lowered = value.trim().toLowerCase();
    if (!lowered) return value;
    const match = options.find(
      (opt) => typeof opt === "string" && opt.trim().toLowerCase() === lowered
    );
    return typeof match === "string" ? match : value;
  };

  const stoneTypeOptions = [
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
  ];

  const slabStyleOptions = [
    "Curved Slab",
    "Frame with Infill",
    "Full Slab",
    "Glass Slab",
    "Half Slab",
    "Stepped Slab",
    "Tiled Slab",
    "Double",
  ];

  const provinces = new Set([
    "gauteng",
    "western cape",
    "kwazulu-natal",
    "eastern cape",
    "free state",
    "limpopo",
    "northern cape",
    "mpumalanga",
    "north west",
    "northwest", // tolerate variant
  ]);

  const norm = (v) => (typeof v === "string" ? v.trim() : null);
  const normLower = (v) => (typeof v === "string" ? v.trim().toLowerCase() : null);

  const parseLocationSelection = (value) => {
    if (!value) return { province: null, city: null, town: null };
    if (Array.isArray(value)) {
      if (value.some((v) => typeof v === "string" && /^[pct]\|/.test(v))) {
        return { province: null, city: null, town: null };
      }
      const province = norm(value[0]);
      const city = norm(value[1]);
      const town = norm(value[2]);
      return { province, city, town };
    }
    if (typeof value === "string") {
      if (/^[pct]\|/.test(value)) return { province: null, city: null, town: null };
      const lowered = normLower(value);
      if (lowered === "near me") return { province: null, city: null, town: null };
      if (provinces.has(lowered)) {
        return { province: norm(value), city: null, town: null };
      }
      return { province: null, city: norm(value), town: null };
    }
    return { province: null, city: null, town: null };
  };

  const effectiveAggFilters = useMemo(() => {
    const loc = parseLocationSelection(activeFilters?.location);
    const minPrice =
      activeFilters?.minPrice && activeFilters.minPrice !== "Min Price"
        ? parsePrice(activeFilters.minPrice)
        : null;
    const maxPrice =
      activeFilters?.maxPrice && activeFilters.maxPrice !== "Max Price"
        ? parsePrice(activeFilters.maxPrice)
        : null;

    return {
      province: loc.province,
      city: loc.city,
      town: loc.town,
      minPrice: Number.isFinite(minPrice) && minPrice > 0 ? minPrice : null,
      maxPrice: Number.isFinite(maxPrice) && maxPrice > 0 ? maxPrice : null,
      color: pickScalar(activeFilters?.colour || activeFilters?.color),
      style: pickScalar(activeFilters?.style),
      stoneType: canonicalizeFromOptions(pickScalar(activeFilters?.stoneType), stoneTypeOptions),
      customization: pickScalar(activeFilters?.custom),
      slabStyle: canonicalizeFromOptions(pickScalar(activeFilters?.slabStyle), slabStyleOptions),
    };
  }, [activeFilters]);

  const {
    data: homepageAggData,
    error: homepageAggError,
  } = useHomepageAggregations({ filters: effectiveAggFilters });

  const homepageAggByCategory = useMemo(() => {
    const cats = homepageAggData?.homepageAggregations?.categories;
    if (!Array.isArray(cats)) return {};
    return cats.reduce((acc, c) => {
      const name = typeof c?.name === "string" ? c.name.toUpperCase() : "";
      if (name) acc[name] = c;
      return acc;
    }, {});
  }, [homepageAggData]);

  const activeCategoryName = useMemo(() => {
    const name = sortedCategories?.[activeTab]?.name;
    return typeof name === "string" ? name.toUpperCase() : "";
  }, [sortedCategories, activeTab]);

  const activeCategoryAgg = useMemo(() => {
    if (activeCategoryName && homepageAggByCategory[activeCategoryName]) return homepageAggByCategory[activeCategoryName];
    if (homepageAggByCategory["SINGLE"]) return homepageAggByCategory["SINGLE"];
    return null;
  }, [activeCategoryName, homepageAggByCategory]);

  const activeCategoryAggCount = useMemo(() => {
    const v = activeCategoryAgg?.count;
    return typeof v === "number" ? v : null;
  }, [activeCategoryAgg]);

  const homepageAggLocationHierarchy = useMemo(() => {
    const locations = activeCategoryAgg?.locations;
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
  }, [activeCategoryAgg]);

  const computedLocationHierarchy = useLocationHierarchy(listingsForLocationCounts, categories, activeTab);

  const normalizeLocKey = useCallback((v) => {
    if (typeof v !== "string") return "";
    return v
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/-+/g, "-")
      .replace(/^-|-$/g, "");
  }, []);

  const mergeLocationCounts = useCallback(
    (structure, countsSource) => {
      if (!Array.isArray(structure) || structure.length === 0) return structure;
      if (!Array.isArray(countsSource) || countsSource.length === 0) return structure;

      const countsByProv = new Map();
      countsSource.forEach((p) => {
        const key = normalizeLocKey(p?.name);
        if (key) countsByProv.set(key, p);
      });

      return structure.map((prov) => {
        const provKey = normalizeLocKey(prov?.name);
        const provCounts = provKey ? countsByProv.get(provKey) : null;
        const provCount = typeof provCounts?.count === "number" ? provCounts.count : prov?.count || 0;

        const provCities = Array.isArray(prov?.cities) ? prov.cities : [];
        const countCities = Array.isArray(provCounts?.cities) ? provCounts.cities : [];
        const countsByCity = new Map();
        countCities.forEach((c) => {
          const key = normalizeLocKey(c?.name);
          if (key) countsByCity.set(key, c);
        });

        const mergedCities = provCities.map((city) => {
          const cityKey = normalizeLocKey(city?.name);
          const cityCounts = cityKey ? countsByCity.get(cityKey) : null;
          const cityCount = typeof cityCounts?.count === "number" ? cityCounts.count : city?.count || 0;

          const cityTowns = Array.isArray(city?.towns) ? city.towns : [];
          const countTowns = Array.isArray(cityCounts?.towns) ? cityCounts.towns : [];
          const countsByTown = new Map();
          countTowns.forEach((t) => {
            const key = normalizeLocKey(t?.name);
            if (key) countsByTown.set(key, t);
          });

          const mergedTowns = cityTowns.map((town) => {
            const townKey = normalizeLocKey(town?.name);
            const townCounts = townKey ? countsByTown.get(townKey) : null;
            const townCount = typeof townCounts?.count === "number" ? townCounts.count : town?.count || 0;
            return { ...town, count: townCount };
          });

          return { ...city, count: cityCount, towns: mergedTowns };
        });

        return { ...prov, count: provCount, cities: mergedCities };
      });
    },
    [normalizeLocKey]
  );

  const locationHierarchy = useMemo(() => {
    if (Array.isArray(locationOptionsHierarchy) && locationOptionsHierarchy.length > 0) {
      if (!homepageAggError && homepageAggLocationHierarchy.length > 0) {
        return mergeLocationCounts(locationOptionsHierarchy, homepageAggLocationHierarchy);
      }
      return locationOptionsHierarchy;
    }
    if (!homepageAggError && homepageAggLocationHierarchy.length > 0) return homepageAggLocationHierarchy;
    return computedLocationHierarchy;
  }, [
    computedLocationHierarchy,
    homepageAggError,
    homepageAggLocationHierarchy,
    locationOptionsHierarchy,
    mergeLocationCounts,
  ]);

  const apolloClient = useApolloClient()

  const categoryCountBaseFilters = useMemo(() => {
    if (!searchIndexFilters || !Array.isArray(searchIndexFilters.and)) return searchIndexFilters
    const and = searchIndexFilters.and.filter((clause) => {
      if (!clause || typeof clause !== "object") return true
      return !("category" in clause)
    })
    return { and }
  }, [searchIndexFilters])

  const categoryCountBaseKey = useMemo(() => {
    try {
      return JSON.stringify(categoryCountBaseFilters ?? null)
    } catch {
      return ""
    }
  }, [categoryCountBaseFilters])

  const [categoryBadgeCounts, setCategoryBadgeCounts] = useState({})
  const categoryCountsReqRef = useRef(0)

  useEffect(() => {
    if (!enableQueries) return
    if (!Array.isArray(sortedCategories) || sortedCategories.length === 0) return

    const categoryNames = sortedCategories
      .map((c) => (typeof c?.name === "string" ? c.name.trim().toUpperCase() : ""))
      .filter(Boolean)

    if (categoryNames.length === 0) return

    const reqId = (categoryCountsReqRef.current += 1)
    let cancelled = false

    ;(async () => {
      let parsedBase = null
      try {
        parsedBase = categoryCountBaseKey ? JSON.parse(categoryCountBaseKey) : null
      } catch {
        parsedBase = null
      }
      const baseAnd = Array.isArray(parsedBase?.and) ? [...parsedBase.and] : []

      const results = await Promise.all(
        categoryNames.map(async (name) => {
          const and = [...baseAnd, { category: { eq: normalizeLower(name) } }]
          try {
            const res = await apolloClient.query({
              query: LISTING_SEARCH_INDEX_CONNECTION_QUERY,
              variables: { filters: { and }, page: 1, pageSize: 1 },
              fetchPolicy: "network-only",
            })
            const total = res?.data?.listingSearchIndices_connection?.pageInfo?.total
            return [name, typeof total === "number" ? total : null]
          } catch {
            return [name, null]
          }
        })
      )

      if (cancelled) return
      if (reqId !== categoryCountsReqRef.current) return

      const next = {}
      for (const [name, total] of results) {
        if (typeof total === "number") next[name] = total
      }

      if (Object.keys(next).length) {
        setCategoryBadgeCounts((prev) => ({ ...(prev || {}), ...next }))
      }
    })()

    return () => {
      cancelled = true
    }
  }, [apolloClient, categoryCountBaseKey, enableQueries, sortedCategories])

  const homepageAggCategoryCounts = useMemo(() => {
    const cats = homepageAggData?.homepageAggregations?.categories;
    if (!Array.isArray(cats)) return null;
    return cats.reduce((acc, c) => {
      if (typeof c?.name !== "string") return acc;
      const count = typeof c?.count === "number" ? c.count : 0;
      acc[c.name] = count;
      return acc;
    }, {});
  }, [homepageAggData]);

  const hasSearchTerm = useMemo(() => {
    const s = activeFilters?.search;
    return typeof s === "string" && s.trim() !== "";
  }, [activeFilters?.search]);

  const categoryCounts = useMemo(() => {
    const base = categoryBadgeCounts || {};
    const agg = !homepageAggError && homepageAggCategoryCounts ? homepageAggCategoryCounts : null;
    const merged = agg ? { ...agg, ...base } : base;

    const activeCategoryLabel =
      typeof activeCategory?.name === "string" && activeCategory.name.trim()
        ? activeCategory.name.trim().toUpperCase()
        : null;

    if (activeCategoryLabel) {
      return { ...merged, [activeCategoryLabel]: totalListingsCount };
    }

    return merged;
  }, [
    activeCategory?.name,
    categoryBadgeCounts,
    homepageAggCategoryCounts,
    homepageAggError,
    totalListingsCount,
  ]);

  const handleSearch = () => {
    setCurrentPage(1);
  };

  const baseSortedListings = useMemo(() => {
    const next = [...filteredListings];
    if (sortOrder === "Price: Low to High") {
      next.sort((a, b) => {
        const priceA = a.price ? parsePrice(a.price) : 0;
        const priceB = b.price ? parsePrice(b.price) : 0;
        return priceA - priceB;
      });
    } else if (sortOrder === "Price: High to Low") {
      next.sort((a, b) => {
        const priceA = a.price ? parsePrice(a.price) : 0;
        const priceB = b.price ? parsePrice(b.price) : 0;
        return priceB - priceA;
      });
    } else if (sortOrder === "Newest First") {
      next.sort((a, b) => {
        const aT = a?.updatedAt ? Date.parse(a.updatedAt) : 0;
        const bT = b?.updatedAt ? Date.parse(b.updatedAt) : 0;
        return bT - aT;
      });
    }
    return next;
  }, [filteredListings, sortOrder]);

  const listingItems = useMemo(() => {
    const next = baseSortedListings.map(buildListingItem).filter((x) => x?.id);
    const hasMultiLocations = selectedLocationTokens.length >= 2;
    const hasUserCoords =
      guestLocation &&
      Number.isFinite(guestLocation.lat) &&
      Number.isFinite(guestLocation.lng);
    if (sortOrder === "Default" && hasMultiLocations && hasUserCoords) {
      next.sort(
        (a, b) =>
          (a.primaryDistanceKm ?? Infinity) - (b.primaryDistanceKm ?? Infinity)
      );
    }
    return next;
  }, [baseSortedListings, buildListingItem, guestLocation, selectedLocationTokens.length, sortOrder]);

  const fallbackCard = (type = "listing") => (
    <CardSkeleton className="h-full" />
  );

  function getCustomFlow(listingItems) {
    let idx = 0;
    const flow = [];
    flow.push(
      <div key="featured-listings" className="mb-8">
        <h2 className="text-center text-gray-600 border-b border-gray-300 pb-2 mb-4 mt-4">FEATURED LISTINGS</h2>
        <p className="text-center text-xs text-gray-500 -mt-3 mb-2">*Sponsored</p>

        <div className="md:hidden">
          <div className="flex overflow-x-auto gap-4 snap-x snap-mandatory scrollbar-hide" ref={featuredScrollRef}>
            
             {listingItems?.filter((x) => x?.listingForCard?.isFeatured).length > 0
               ? listingItems?.filter((x) => x?.listingForCard?.isFeatured).slice(0, 3).map((item, index) => (
                   Array.isArray(item.listingForCard.branches) && item.listingForCard.branches.length > 0 ? (
                     item.listingForCard.branches.map((branch) => (
                       <div key={`${item.listingForCard.documentId || item.listingForCard.id}-${branch.documentId || branch.id}`} className="flex-shrink-0 w-64 snap-start">
                         <FeaturedListings listing={{...item.listingForCard, currentBranch: branch}} />
                       </div>
                     ))
                   ) : (
                     <div key={item.listingForCard.id || index} className="flex-shrink-0 w-64 snap-start">
                       <FeaturedListings listing={item.listingForCard} />
                     </div>
                   )
                 ))
               : (
                 <div className="flex-shrink-0 w-64 snap-start flex justify-center">
                   {fallbackCard("featured listings")}
                 </div>
               )}
          </div>
          <div className="flex justify-center mt-4 space-x-2">
            {[0, 1, 2].map((index) => (
              <button
                key={index}
                onClick={() => scrollToFeaturedCard(index)}
                className={`w-3 h-3 rounded-full transition-colors duration-200 ${
                  index === featuredActiveIndex ? 'bg-blue-500' : 'bg-gray-300 hover:bg-gray-400'
                }`}
                aria-label={`Go to card ${index + 1}`}
              ></button>
            ))}
          </div>
        </div>

        <div className="hidden md:grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {listingItems?.filter((x) => x?.listingForCard?.isFeatured).length > 0
            ? listingItems?.filter((x) => x?.listingForCard?.isFeatured).slice(0, 3).map((item, index) => (
                <FeaturedListings key={item.listingForCard.id || index} listing={item.listingForCard} />
              ))
            : fallbackCard("featured listings")}
        </div>
      </div>
    );
    flow.push(<div key="banner-1" className="my-6"><BannerAd /></div>);
    flow.push(
      <div key="listings-1" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
        {listingItems.slice(idx, idx + 5).length > 0
          ? listingItems.slice(idx, idx + 5).map((item, i) => (
              <PremiumListingCard
                compact={true}
                key={item.id || i}
                listing={item.listingForCard}
                href={item.href}
                onPrimaryClick={() => handleListingPrimaryClick(item)}
                onViewMoreBranchesClick={() => handleListingViewMoreBranchesClick(item)}
              />
            ))
          : fallbackCard("listings")}
      </div>
    );
    idx += 5;
    flow.push(<div key="banner-2" className="my-6"><BannerAd /></div>);
    flow.push(
      <div key="listings-2" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
        {listingItems.slice(idx, idx + 5).length > 0
          ? listingItems.slice(idx, idx + 5).map((item, i) => (
              <PremiumListingCard
                compact={true}
                key={item.id || i}
                listing={item.listingForCard}
                href={item.href}
                onPrimaryClick={() => handleListingPrimaryClick(item)}
                onViewMoreBranchesClick={() => handleListingViewMoreBranchesClick(item)}
              />
            ))
           : fallbackCard("listings")}
      </div>
    );
    idx += 5;
    let randomFeaturedManufacturer = null;
    if (topFeaturedManufacturers.length > 0) {
      const randomIndex = Math.floor(Math.random() * topFeaturedManufacturers.length);
      randomFeaturedManufacturer = topFeaturedManufacturers[randomIndex];
    }
    if (randomFeaturedManufacturer) {
      flow.push(
        <FeaturedManufacturer key={`featured-manufacturer`} manufacturer={randomFeaturedManufacturer} />
      );
    } else {
      flow.push(
        <div key="fallback-featured-manufacturer" className="flex-1 flex justify-center">
          {fallbackCard("featured manufacturer")}
        </div>
      );
    }
    flow.push(
      <div key="listings-3" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
        {listingItems.slice(idx, idx + 5).length > 0
          ? listingItems.slice(idx, idx + 5).map((item, i) => (
              <PremiumListingCard
                compact={true}
                key={item.id || i}
                listing={item.listingForCard}
                href={item.href}
                onPrimaryClick={() => handleListingPrimaryClick(item)}
                onViewMoreBranchesClick={() => handleListingViewMoreBranchesClick(item)}
              />
            ))
           : fallbackCard("listings")}
      </div>
    );
    idx += 5;
    flow.push(<div key="banner-3" className="my-6"><BannerAd /></div>);
    flow.push(
      <div key="listings-4" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
        {listingItems.slice(idx, idx + 5).length > 0
          ? listingItems.slice(idx, idx + 5).map((item, i) => (
              <PremiumListingCard
                compact={true}
                key={item.id || i}
                listing={item.listingForCard}
                href={item.href}
                onPrimaryClick={() => handleListingPrimaryClick(item)}
                onViewMoreBranchesClick={() => handleListingViewMoreBranchesClick(item)}
              />
            ))
           : fallbackCard("listings")}
      </div>
    );
    return flow;
  }

  const totalPages = useMemo(() => {
    const pc = searchIndexPageInfo?.pageCount;
    if (typeof pc === "number" && pc > 0) return pc;
    return Math.max(1, Math.ceil(totalListingsCount / listingsPerPage));
  }, [searchIndexPageInfo?.pageCount, totalListingsCount, listingsPerPage]);
  
  const { totalFavorites } = useFavorites()

  const filterOptions = {
    location: ["Gauteng", "Western Cape", "KwaZulu-Natal", "Eastern Cape", "Free State"],
    stoneType: [
      "Biodegradable", "Brass", "Ceramic/Porcelain", "Composite", "Concrete", "Copper", "Glass", "Granite", "Limestone", "Marble", "Perspex", "Quartzite", "Sandstone", "Slate", "Steel", "Stone", "Tile", "Wood"
    ],
    slabStyle: [
      "Curved Slab", "Frame with Infill", "Full Slab", "Glass Slab", "Half Slab", "Stepped Slab", "Tiled Slab", "Double"
    ],
    style: [
      "Christian Cross", "Heart", "Bible", "Pillars", "Traditional African", "Abstract", "Praying Hands", "Scroll", "Angel", "Mausoleum", "Obelisk", "Plain", "Teddy Bear", "Butterfly", "Car", "Bike", "Sports",
      "Wave", "Church", "House", "Square", "Organic", "Arch"
    ],
    custom: [
      "Bronze/Stainless Plaques", "Ceramic Photo Plaques", "Flower Vases", "Gold Lettering", "Inlaid Glass", "Photo Laser-Edging", "QR Code"
    ],
    colour: [
      "Black", "Blue", "Green", "Grey-Dark", "Grey-Light", "Maroon", "Pearl", "Red", "White", "Gold", "Yellow", "Pink"
    ],
    color: ["Black", "White", "Grey", "Brown", "Blue Pearl", "Red"],
    culture: ["Christian", "Jewish", "Muslim", "Hindu", "Traditional African"],
    designTheme: ["Cross", "Angel", "Heart", "Book", "Traditional", "Modern", "Custom"],
  }

  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);
  const [mobileFilterOpening, setMobileFilterOpening] = useState(false);
  const [mobileFilterClosing, setMobileFilterClosing] = useState(false);
  const mobileFilterOpenTimerRef = useRef(null);
  const mobileFilterCloseTimerRef = useRef(null);

  const openMobileFilter = useCallback(() => {
    if (mobileFilterOpenTimerRef.current) {
      clearTimeout(mobileFilterOpenTimerRef.current);
      mobileFilterOpenTimerRef.current = null;
    }
    if (mobileFilterCloseTimerRef.current) {
      clearTimeout(mobileFilterCloseTimerRef.current);
      mobileFilterCloseTimerRef.current = null;
    }
    setMobileFilterClosing(false);
    setMobileFilterOpen(true);
    setMobileFilterOpening(true);
    mobileFilterOpenTimerRef.current = setTimeout(() => {
      setMobileFilterOpening(false);
      mobileFilterOpenTimerRef.current = null;
    }, 20);
  }, []);

  const closeMobileFilter = useCallback(() => {
    if (mobileFilterClosing) return;
    setMobileFilterClosing(true);
    if (mobileFilterCloseTimerRef.current) {
      clearTimeout(mobileFilterCloseTimerRef.current);
    }
    mobileFilterCloseTimerRef.current = setTimeout(() => {
      setMobileFilterOpen(false);
      setMobileFilterClosing(false);
      mobileFilterCloseTimerRef.current = null;
    }, 520);
  }, [mobileFilterClosing]);

  useEffect(() => {
    return () => {
      if (mobileFilterOpenTimerRef.current) {
        clearTimeout(mobileFilterOpenTimerRef.current);
        mobileFilterOpenTimerRef.current = null;
      }
      if (mobileFilterCloseTimerRef.current) {
        clearTimeout(mobileFilterCloseTimerRef.current);
        mobileFilterCloseTimerRef.current = null;
      }
    };
  }, []);
  const [showSortDropdown, setShowSortDropdown] = useState(false);

  const [isDesktopViewport, setIsDesktopViewport] = useState(false);
  useEffect(() => {
    const update = () => setIsDesktopViewport(window.innerWidth >= 640);
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  const sortModalRef = useRef();
  useEffect(() => {
    if (!showSortDropdown) return;
    function handleClick(e) {
      if (sortModalRef.current && !sortModalRef.current.contains(e.target)) {
        setShowSortDropdown(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [showSortDropdown]);

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mobileDropdown, setMobileDropdown] = useState(null);
  const handleMobileMenuToggle = () => setMobileMenuOpen((open) => !open);
  const handleMobileDropdownToggle = (section) => setMobileDropdown((prev) => prev === section ? null : section);

  function parsePrice(priceStr) {
    if (!priceStr) return 0;
    if (typeof priceStr === 'number') return priceStr;
    if (typeof priceStr === 'string') {
      return Number(priceStr.replace(/[^\d.]/g, ""));
    }
    try {
      const str = String(priceStr);
      return Number(str.replace(/[^\d.]/g, ""));
    } catch (error) {
      console.warn('Failed to parse price:', priceStr, error);
      return 0;
    }
  }

  if (enableQueries && listingsLoading && filteredListings.length === 0) return <PageLoader text="Loading listings..." />;
  if (listingsError && filteredListings.length === 0) return (
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

  function handleResetFilters() {
    setActiveFilters({
      minPrice: "Min Price",
      maxPrice: "Max Price",
      location: null,
      stoneType: null,
      color: null,
      style: null,
      custom: null,
      colour: null,
      category: null,
    });
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header
        mobileMenuOpen={mobileMenuOpen}
        handleMobileMenuToggle={handleMobileMenuToggle}
        mobileDropdown={mobileDropdown}
        handleMobileDropdownToggle={handleMobileDropdownToggle}
        onMobileFilterClick={openMobileFilter}
        autoHideOnScroll={true}
      />

      <MobileFilterTags activeFilters={activeFilters} setActiveFilters={setActiveFilters} />
      
      <MobileResultsBar 
        count={totalListingsCount} 
        onSortClick={() => setShowSortDropdown(true)}
        onFilterClick={openMobileFilter}
      />

      {showSortDropdown && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black bg-opacity-40 md:hidden" onClick={() => setShowSortDropdown(false)}>
          <div 
            ref={sortModalRef} 
            className="w-full max-w-md mx-auto rounded-t-2xl bg-[#232323] p-4 pb-8 animate-slide-in-up"
            onClick={(e) => e.stopPropagation()}
          >
            {['Default', 'Price: Low to High', 'Price: High to Low', 'Newest First'].map(option => (
              <div
                key={option}
                className={`flex items-center justify-between px-2 py-4 text-lg border-b border-[#333] last:border-b-0 cursor-pointer ${sortOrder === option ? 'text-white font-bold' : 'text-gray-200'}`}
                onClick={() => { setSortOrder(option); setShowSortDropdown(false); }}
              >
                <span>{option}</span>
                <span className={`ml-2 w-6 h-6 flex items-center justify-center rounded-full border-2 ${sortOrder === option ? 'border-blue-500' : 'border-gray-500'}`}
                      style={{ background: sortOrder === option ? '#2196f3' : 'transparent' }}>
                  {sortOrder === option && <span className="block w-3 h-3 bg-white rounded-full"></span>}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {showBranchesModal && selectedListing && (
        <PremiumListingCardModal
          listing={selectedListing}
          onClose={() => {
            setShowBranchesModal(false);
            setSelectedListing(null);
          }}
          onBranchSelect={handleBranchSelect}
        />
      )}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
          onClick={handleMobileMenuToggle}
        ></div>
      )}
      {mobileFilterOpen && (
        <div className="fixed inset-0 z-50 sm:hidden">
          <div
            className={`absolute inset-0 bg-black/40 transition-opacity duration-500 ${
              mobileFilterClosing || mobileFilterOpening ? "opacity-0" : "opacity-100"
            }`}
            onClick={closeMobileFilter}
          />
          <div
            className={`absolute inset-0 bg-white flex flex-col transition-all duration-500 ease-in-out will-change-transform origin-top-left ${
              mobileFilterClosing || mobileFilterOpening
                ? "-translate-y-20 -translate-x-20 opacity-0 scale-90"
                : "translate-y-0 translate-x-0 opacity-100 scale-100"
            }`}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center p-4 border-b border-gray-200 bg-white sticky top-0 z-10">
              <span className="font-bold text-lg">Filters</span>
              <button
                className="p-2 rounded-full hover:bg-gray-100 touch-manipulation"
                onClick={closeMobileFilter}
                aria-label="Close Filters"
                type="button"
              >
                <X className="h-6 w-6 text-gray-700" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto w-full p-0">
              <TombstonesForSaleFilters
                activeFilters={activeFilters}
                setActiveFilters={setActiveFilters}
                showFilters={showFilters}
                setShowFilters={setShowFilters}
                filterOptions={filterOptions}
                filteredListings={filteredListings}
                handleSearch={() => {
                  handleSearch();
                  closeMobileFilter();
                }}
                getActiveCategory={getActiveCategory}
                showCategoryDropdown={true}
                locationsData={locationHierarchy}
                initialCount={totalListingsCount}
                isBackgroundLoading={!enableQueries || listingsLoading}
                locationCountBaseFilters={locationCountBaseFilters}
              />
            </div>
          </div>
        </div>
      )}

      {sortedCategories.length > 0 && (
        <div className="hidden md:block relative w-full h-[120px] sm:h-[160px] md:h-[180px]">
          <div className="absolute inset-0 z-0 hidden sm:block">
            <Image
              src={activeCategory?.imageUrl || "/2560(w)x400px(h)_Banner_OldYoungCouple.jpg"}
              alt={activeCategory?.name || "Category background"}
              fill
              className="object-cover"
              priority
              fetchPriority="high"
              sizes="100vw"
            />
          </div>
          <div className="absolute inset-0 bg-black/20" aria-hidden="true"></div>
          <div className="absolute inset-x-0 bottom-0 px-4 z-10">
            <div className="max-w-6xl mx-auto">
              <div className="hidden md:block w-full md:w-[60%]">
                <CategoryTabs categories={sortedCategories} activeTab={activeTab} setActiveTab={handleTabChange} counts={categoryCounts} />
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="container mx-auto px-4 pt-0 pb-4">
        <div className="max-w-6xl mx-auto">
          
          <div className="flex flex-col md:flex-row gap-6">
            {isDesktopViewport && (
              <div className="w-full md:w-1/4 md:sticky md:top-0 md:self-start">
                <TombstonesForSaleFilters
                  activeFilters={activeFilters}
                  setActiveFilters={setActiveFilters}
                  showFilters={showFilters}
                  setShowFilters={setShowFilters}
                  filterOptions={filterOptions}
                  filteredListings={filteredListings}
                  handleSearch={handleSearch}
                  getActiveCategory={getActiveCategory}
                  showCategoryDropdown={true}
                  locationsData={locationHierarchy}
                  initialCount={totalListingsCount}
                  isBackgroundLoading={!enableQueries || listingsLoading}
                  locationCountBaseFilters={locationCountBaseFilters}
                />
              </div>
            )}

            <div className="w-full md:w-3/4">
              <div className="hidden sm:flex justify-between items-center mt-3 sm:mt-4 mb-4 bg-gray-100 rounded px-4 py-2 shadow-sm">
                <p className="text-gray-600">
                  {totalListingsCount === 0
                    ? `No results found for your filters.`
                    : `Showing ${filteredListings.length} of ${totalListingsCount}`}
                </p>
                <div className="flex items-center">
                  <div className="hidden sm:flex items-center">
                    <span className="text-sm text-gray-600 mr-2">Sort by</span>
                    <select
                      className="p-1 border border-gray-300 rounded text-sm"
                      value={sortOrder}
                      onChange={(e) => setSortOrder(e.target.value)}
                    >
                      <option>Default</option>
                      <option>Price: Low to High</option>
                      <option>Price: High to Low</option>
                      <option>Newest First</option>
                    </select>
                  </div>
                </div>
              </div>

              <div id="featured-listings" className="mb-8">
                <h2 className="text-center text-gray-600 border-b border-gray-300 pb-2 mb-4 mt-6">FEATURED LISTINGS</h2>
                <p className="text-center text-xs text-gray-500 -mt-3 mb-2">*Sponsored</p>

                <div className="md:hidden">
                  <div className="flex overflow-x-auto gap-4 snap-x snap-mandatory scrollbar-hide" ref={featuredScrollRef}>
                   
                    {featuredListings.length > 0
                      ? featuredListings.slice(0, 3).map((product, index) => (
                          <div key={product.documentId || index} className="flex-shrink-0 w-64 snap-start">
                            <FeaturedListings listing={product} />
                          </div>
                        ))
                      : (
                        <div className="flex-shrink-0 w-64 snap-start flex justify-center">
                          {fallbackCard("featured listings")}
                        </div>
                      )}
                  </div>
                  <div className="flex justify-center mt-4 space-x-2">
                    {[0, 1, 2].map((index) => (
                      <button
                        key={index}
                        onClick={() => scrollToFeaturedCard(index)}
                        className={`w-3 h-3 rounded-full transition-colors duration-200 ${
                          index === featuredActiveIndex ? 'bg-blue-500' : 'bg-gray-300 hover:bg-gray-400'
                        }`}
                        aria-label={`Go to card ${index + 1}`}
                      ></button>
                    ))}
                  </div>
                </div>

                <div className="hidden md:grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {featuredListings.length > 0
                    ? featuredListings.slice(0, 3).map((product, index) => (
                        <FeaturedListings key={product.documentId || index} listing={product} />
                      ))
                    : fallbackCard("featured listings")}
                </div>
              </div>

              <section className="py-4">
                <div className="container mx-auto px-4">
                  <div className="max-w-6xl mx-auto">
                    <h3 className="text-center text-gray-600 border-b border-gray-300 pb-2 mb-4 text-base font-bold">PREMIUM LISTINGS SPONSORED</h3>
                    <p className="text-center text-xs text-gray-500 -mt-2 mb-2">*Sponsored</p>

                    <div className="space-y-6">
                      {listingItems.length === 0 ? (
                        <div className="text-center text-gray-500 py-8">No tombstones found for your selected filters.</div>
                      ) : (
                        listingItems.map((item) => (
                          <PremiumListingCard
                            compact={true}
                            key={item.id}
                            listing={item.listingForCard}
                            href={item.href}
                            onPrimaryClick={() => handleListingPrimaryClick(item)}
                            onViewMoreBranchesClick={() => handleListingViewMoreBranchesClick(item)}
                          />
                        ))
                      )}
                    </div>
                  </div>
                </div>
              </section>

                <div className="mt-8 flex justify-center">
                  <Pagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={setCurrentPage}
                  />
                </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
