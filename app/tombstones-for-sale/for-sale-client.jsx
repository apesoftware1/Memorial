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
  LISTINGS_CARDS_BY_DOCUMENT_IDS_QUERY,
  LISTINGS_BRANCH_COUNTS_BY_DOCUMENT_IDS_QUERY,
} from '@/graphql/queries';
import { useApolloClient, useQuery } from "@apollo/client";
import { useListingCategories } from "@/hooks/use-ListingCategories"
import { useLocationHierarchy } from '@/hooks/useLocationHierarchy';
import { checkListingLocation, toTitleCase, DEFAULT_PROVINCES, normalizeCityName } from '@/lib/locationHelpers';
import { useGuestLocation } from "@/hooks/useGuestLocation";
import { GET_LISTING_BRANCHES_FOR_MODAL } from "@/graphql/queries/getListingExtrasById";
import { trackAnalyticsEvent } from "@/lib/analytics";

const stableHash = (input) => {
  const s = String(input ?? "")
  let h = 2166136261
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i)
    h = Math.imul(h, 16777619)
  }
  return h >>> 0
}

const mulberry32 = (seed) => {
  let a = seed >>> 0
  return () => {
    a |= 0
    a = (a + 0x6d2b79f5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

const shuffleWithSeed = (arr, seedKey) => {
  const out = Array.isArray(arr) ? [...arr] : []
  const rand = mulberry32(stableHash(seedKey))
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1))
    const tmp = out[i]
    out[i] = out[j]
    out[j] = tmp
  }
  return out
}

const getCompanyKey = (listing) => {
  const doc =
    listing?.company?.documentId ??
    listing?.company?.id ??
    listing?.companyId ??
    null
  const name = typeof listing?.company?.name === "string" ? listing.company.name.trim() : ""
  if (doc) return String(doc)
  if (name) return name
  const fallback = listing?.documentId ?? listing?.id ?? ""
  return fallback ? `unknown:${String(fallback)}` : "unknown"
}

const DEFAULT_FOR_SALE_FILTERS = {
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
}

const coerceInitialForSaleFilters = (initial) => {
  if (!initial || typeof initial !== "object") return { ...DEFAULT_FOR_SALE_FILTERS }
  const out = { ...DEFAULT_FOR_SALE_FILTERS }
  for (const k of Object.keys(DEFAULT_FOR_SALE_FILTERS)) {
    if (Object.prototype.hasOwnProperty.call(initial, k)) {
      out[k] = initial[k]
    }
  }
  if (out.colour == null && out.color != null) out.colour = out.color
  if (out.color == null && out.colour != null) out.color = out.colour
  return out
}

const enforceNoAdjacentCompanies = (listings) => {
  const out = Array.isArray(listings) ? [...listings] : []
  if (out.length <= 1) return out

  const keyAt = (idx) => getCompanyKey(out[idx])
  for (let i = 1; i < out.length; i += 1) {
    const prevKey = keyAt(i - 1)
    const curKey = keyAt(i)
    if (prevKey !== curKey) continue

    let swapIdx = -1
    for (let j = i + 1; j < out.length; j += 1) {
      const nextKey = keyAt(j)
      if (nextKey !== prevKey) {
        swapIdx = j
        break
      }
    }

    if (swapIdx === -1) break
    const tmp = out[i]
    out[i] = out[swapIdx]
    out[swapIdx] = tmp
  }

  return out
}

const getDiverseInterleavedListingsSeeded = (listings, seedKey) => {
  if (!Array.isArray(listings) || listings.length === 0) return []

  const companyMap = new Map()
  for (const listing of listings) {
    const companyId = getCompanyKey(listing)
    const existing = companyMap.get(companyId) || []
    existing.push(listing)
    companyMap.set(companyId, existing)
  }

  let companyIds = Array.from(companyMap.keys())
  companyIds = companyIds.sort((a, b) => String(a).localeCompare(String(b)))
  companyIds = shuffleWithSeed(companyIds, seedKey)

  companyMap.forEach((list, key) => {
    const sorted = [...list].sort((a, b) =>
      String(a?.documentId || a?.id || "").localeCompare(String(b?.documentId || b?.id || ""))
    )
    companyMap.set(key, sorted)
  })

  let maxListings = 0
  companyMap.forEach((list) => {
    if (list.length > maxListings) maxListings = list.length
  })

  const result = []
  for (let i = 0; i < maxListings; i++) {
    for (const companyId of companyIds) {
      const list = companyMap.get(companyId)
      if (list && i < list.length) result.push(list[i])
    }
  }

  return result
}

const interleaveCompanyListingsNoAdjacent = (listings, seedKey) => {
  if (!Array.isArray(listings) || listings.length === 0) return []

  const companyMap = new Map()
  for (const listing of listings) {
    const companyId = getCompanyKey(listing)
    const existing = companyMap.get(companyId) || []
    existing.push(listing)
    companyMap.set(companyId, existing)
  }

  const companySortKey = (id) => stableHash(`${seedKey}|${String(id)}`)
  const companyIds = Array.from(companyMap.keys()).sort((a, b) => {
    const da = companySortKey(a)
    const db = companySortKey(b)
    if (da !== db) return da - db
    return String(a).localeCompare(String(b))
  })

  companyMap.forEach((list, key) => {
    const sorted = [...list].sort((a, b) =>
      String(a?.documentId || a?.id || "").localeCompare(String(b?.documentId || b?.id || ""))
    )
    companyMap.set(key, sorted)
  })

  let remaining = 0
  companyMap.forEach((list) => {
    remaining += Array.isArray(list) ? list.length : 0
  })

  if (!companyIds.length || remaining === 0) return []

  const result = []
  let lastCompanyId = null
  let pointer = 0

  while (remaining > 0) {
    let chosenId = null
    let candidateSameAsLast = null

    for (let tries = 0; tries < companyIds.length; tries += 1) {
      const id = companyIds[pointer % companyIds.length]
      pointer += 1
      const q = companyMap.get(id)
      if (!q || q.length === 0) continue

      if (id !== lastCompanyId) {
        chosenId = id
        break
      }

      if (!candidateSameAsLast) candidateSameAsLast = id
    }

    if (!chosenId) {
      const hasOther =
        lastCompanyId &&
        companyIds.some((id) => id !== lastCompanyId && (companyMap.get(id)?.length || 0) > 0)
      if (hasOther) {
        chosenId = companyIds.find(
          (id) => id !== lastCompanyId && (companyMap.get(id)?.length || 0) > 0
        )
      } else {
        chosenId = candidateSameAsLast
      }
    }

    if (!chosenId) break

    const q = companyMap.get(chosenId)
    if (!q || q.length === 0) continue

    result.push(q.shift())
    lastCompanyId = chosenId
    remaining -= 1
  }

  return result
}

export default function TombstonesForSaleClient({
  initialListings = [],
  initialCategories = [],
  initialFilters = null,
  disableLocationUrlSync = false,
}) {
  const [enableQueries, setEnableQueries] = useState(false);
  useEffect(() => {
    setEnableQueries(true);
  }, []);

  const { categories: fetchedCategories, loading: categoriesLoading } = useListingCategories({ skip: !enableQueries });
  const categories = fetchedCategories?.length ? fetchedCategories : initialCategories;
  const topFeaturedManufacturers = useMemo(() => [], []);

  const [activeTab, setActiveTab] = useState(0);
  const [draftTab, setDraftTab] = useState(0);
  const searchParams = useSearchParams();
  const searchParamsKey = searchParams ? searchParams.toString() : '';
  const [currentPage, setCurrentPage] = useState(1);
  const listingsPerPage = 20;
  const [sortOrder, setSortOrder] = useState("Default");

  const [featuredActiveIndex, setFeaturedActiveIndex] = useState(0);
  const featuredScrollRef = useRef(null);
  const router = useRouter();
  const { location: guestLocation } = useGuestLocation();
  const apolloClient = useApolloClient()
  const poolFetchRef = useRef({ key: "", inFlight: false });
  const [isPoolFetching, setIsPoolFetching] = useState(false);
  const [companyOrderPoolIds, setCompanyOrderPoolIds] = useState([]);
  const [companyOrderPoolMap, setCompanyOrderPoolMap] = useState({});
  const [companyOrderPoolNextPage, setCompanyOrderPoolNextPage] = useState(1);
  const [companyOrderPoolPageCount, setCompanyOrderPoolPageCount] = useState(null);

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

  const [activeFilters, setActiveFilters] = useState(() => coerceInitialForSaleFilters(initialFilters))
  const [draftFilters, setDraftFilters] = useState(() => coerceInitialForSaleFilters(initialFilters))

  const serializeFiltersForCompare = useCallback((filters) => {
    const normalizeVal = (v) => {
      if (v == null) return null;
      if (Array.isArray(v)) {
        const arr = v
          .map((x) => (typeof x === "string" ? x.trim() : x))
          .filter((x) => x != null && x !== "");
        return arr.slice().sort();
      }
      if (typeof v === "string") return v.trim();
      return v;
    };

    const out = {
      minPrice: normalizeVal(filters?.minPrice),
      maxPrice: normalizeVal(filters?.maxPrice),
      location: normalizeVal(filters?.location),
      stoneType: normalizeVal(filters?.stoneType),
      colour: normalizeVal(filters?.colour ?? filters?.color),
      style: normalizeVal(filters?.style),
      overallStyle: normalizeVal(filters?.overallStyle),
      slabStyle: normalizeVal(filters?.slabStyle),
      custom: normalizeVal(filters?.custom),
      search: normalizeVal(filters?.search),
    };

    return JSON.stringify(out);
  }, []);

  const hasPendingFilterChanges = useMemo(() => {
    return (
      serializeFiltersForCompare(draftFilters) !== serializeFiltersForCompare(activeFilters) ||
      draftTab !== activeTab
    );
  }, [activeFilters, activeTab, draftFilters, draftTab, serializeFiltersForCompare]);

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

      const shouldSyncLocation = !disableLocationUrlSync || Boolean(locationVal);
      if (shouldSyncLocation && JSON.stringify(locationNormalized) !== JSON.stringify(prev.location)) {
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
        setDraftFilters(newFilters);
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
  const [branchesModalLoading, setBranchesModalLoading] = useState(false);
  const branchesModalCacheRef = useRef(new Map());
  const branchesModalActiveListingIdRef = useRef(null);
  const branchCountsCacheRef = useRef(new Map());
  const [branchCountsVersion, setBranchCountsVersion] = useState(0);

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
        setDraftTab(idx);
        setActiveFilters(prev => {
           if (prev.category !== sortedCategories[idx].name) {
               const next = { ...prev, category: sortedCategories[idx].name };
               setDraftFilters(next);
               return next;
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
          if (draftFilters.category == null) setDraftTab(idx);
          return;
      }
    } 
    
    if (activeTab === 0 && !activeFilters.category) {
        setActiveFilters(prev => {
          const next = { ...prev, category: sortedCategories[0].name };
          setDraftFilters(next);
          setDraftTab(0);
          return next;
        });
    }
  }, [sortedCategories, searchParams]);

  const handleTabChange = (index) => {
    const selected = sortedCategories[index];
    if (!selected?.name) return;

    const nextCategory = selected.name;
    setActiveTab(index);
    setDraftTab(index);
    setActiveFilters((prev) => ({ ...prev, category: nextCategory }));
    setDraftFilters((prev) => ({ ...prev, category: nextCategory }));
    setCurrentPage(1);
  };

  const activeCategory = sortedCategories[activeTab] || null;

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
    const isEncodedLocation = (v) => typeof v === "string" && /^[pct]\|/.test(v);
    const isIgnorable = (v) => {
      const s = typeof v === "string" ? v.trim().toLowerCase() : "";
      return !s || s === "any" || s === "all";
    };

    let rawTokens = [];
    if (loc.length > 0 && loc.every(isEncodedLocation)) {
      for (const v of loc) {
        const parts = String(v).split("|").map((p) => p.trim());
        const level = parts[0];
        if (level === "p") {
          if (parts[1] && !isIgnorable(parts[1])) rawTokens.push(parts[1]);
        } else if (level === "c") {
          if (parts[1] && !isIgnorable(parts[1])) rawTokens.push(parts[1]);
          if (parts[2] && !isIgnorable(parts[2])) rawTokens.push(parts[2]);
        } else if (level === "t") {
          if (parts[1] && !isIgnorable(parts[1])) rawTokens.push(parts[1]);
          if (parts[2] && !isIgnorable(parts[2])) rawTokens.push(parts[2]);
          if (parts[3] && !isIgnorable(parts[3])) rawTokens.push(parts[3]);
        }
      }
    } else {
      rawTokens = loc.filter((v) => !isIgnorable(v));
    }

    const normalized = rawTokens.map(normalizeLocationToken).filter(Boolean);
    return Array.from(new Set(normalized));
  }, [activeFilters?.location, normalizeLocationToken]);

  const selectedLocationSelection = useMemo(() => {
    const loc = activeFilters?.location;
    const provinces = [];
    const cities = [];
    const towns = [];

    const add = (arr, v) => {
      const n = normalizeLocationToken(v);
      if (n) arr.push(n);
    };

    const isEncodedLocation = (v) => typeof v === "string" && /^[pct]\|/.test(v);
    const isIgnorable = (v) => {
      const s = typeof v === "string" ? v.trim().toLowerCase() : "";
      return !s || s === "any" || s === "all" || s === "near me";
    };

    if (Array.isArray(loc) && loc.length > 0) {
      const encoded = loc.every(isEncodedLocation);
      if (encoded) {
        for (const token of loc) {
          const parts = String(token).split("|").map((p) => p.trim());
          const level = parts[0];
          if (level === "p") {
            if (!isIgnorable(parts[1])) add(provinces, parts[1]);
          } else if (level === "c") {
            if (!isIgnorable(parts[1])) add(provinces, parts[1]);
            if (!isIgnorable(parts[2])) add(cities, parts[2]);
          } else if (level === "t") {
            if (!isIgnorable(parts[1])) add(provinces, parts[1]);
            if (!isIgnorable(parts[2])) add(cities, parts[2]);
            if (!isIgnorable(parts[3])) add(towns, parts[3]);
          }
        }
      } else if (loc.length === 3) {
        if (!isIgnorable(loc[0])) add(provinces, loc[0]);
        if (!isIgnorable(loc[1])) add(cities, loc[1]);
        if (!isIgnorable(loc[2])) add(towns, loc[2]);
      } else {
        for (const v of loc) {
          if (!isIgnorable(v)) add(cities, v);
        }
      }
    } else if (typeof loc === "string" && !isIgnorable(loc)) {
      const lowered = loc.trim().toLowerCase();
      const isProv = DEFAULT_PROVINCES.some((p) => p.toLowerCase() === lowered);
      if (isProv) add(provinces, loc);
      else add(cities, loc);
    }

    const uniq = (arr) => Array.from(new Set(arr.filter(Boolean)));
    return { provinces: uniq(provinces), cities: uniq(cities), towns: uniq(towns) };
  }, [activeFilters?.location, normalizeLocationToken]);

  const hasScopedLocation = useMemo(() => {
    return (
      (selectedLocationSelection?.towns?.length || 0) > 0 ||
      (selectedLocationSelection?.cities?.length || 0) > 0 ||
      (selectedLocationSelection?.provinces?.length || 0) > 0
    );
  }, [selectedLocationSelection]);

  const countPackedMatches = useCallback(
    (packed, selectedSet) => {
      if (!selectedSet || selectedSet.size === 0) return 0;
      if (typeof packed !== "string" || !packed) return 0;
      return packed
        .split("|")
        .map((t) => normalizeLocationToken(t))
        .filter(Boolean)
        .reduce((acc, tok) => acc + (selectedSet.has(tok) ? 1 : 0), 0);
    },
    [normalizeLocationToken]
  );

  const getScopedBranchCountFromIndex = useCallback(
    (indexFields) => {
      if (!hasScopedLocation || !indexFields) return null;
      const selectedTowns = new Set(selectedLocationSelection.towns || []);
      const selectedCities = new Set(selectedLocationSelection.cities || []);
      const selectedProvinces = new Set(selectedLocationSelection.provinces || []);

      if (selectedTowns.size > 0) {
        const n = countPackedMatches(indexFields.towns, selectedTowns);
        return n > 0 ? n : null;
      }
      if (selectedCities.size > 0) {
        const n = countPackedMatches(indexFields.cities, selectedCities);
        return n > 0 ? n : null;
      }
      if (selectedProvinces.size > 0) {
        const n = countPackedMatches(indexFields.provinces, selectedProvinces);
        return n > 0 ? n : null;
      }
      return null;
    },
    [countPackedMatches, hasScopedLocation, selectedLocationSelection]
  );

  const buildListingItem = useCallback(
    (listing) => {
      const listingId = listing?.documentId || listing?.id;
      const href = listingId ? `/tombstones-for-sale/${listingId}` : "#";

      const hideBranchesTag = selectedLocationTokens.length === 1;
      const listingForCard = { ...listing, __hideBranchesTag: hideBranchesTag };

      return {
        id: listingId,
        href,
        listingForCard,
        listingForModal: listingForCard,
        listingForModalAll: listingForCard,
      };
    },
    [
      selectedLocationTokens.length,
    ]
  );

  const openBranchesModalForListing = useCallback(
    async (listing) => {
      const listingId = listing?.documentId || listing?.id;
      if (!listingId) return false;
      const listingIdStr = String(listingId);
      branchesModalActiveListingIdRef.current = listingIdStr;

      const locationSelectionSnapshot = selectedLocationSelection;
      const hasLocationSelection =
        (locationSelectionSnapshot?.towns?.length || 0) > 0 ||
        (locationSelectionSnapshot?.cities?.length || 0) > 0 ||
        (locationSelectionSnapshot?.provinces?.length || 0) > 0;
      const filterBranchesForLocation = (branches, branchListings) => {
        if (!Array.isArray(branches) || branches.length === 0) return [];
        if (!hasLocationSelection) return branches;

        const selectedTowns = new Set(locationSelectionSnapshot.towns || []);
        const selectedCities = new Set(locationSelectionSnapshot.cities || []);
        const selectedProvinces = new Set(locationSelectionSnapshot.provinces || []);

        const getLocForBranch = (branch) => {
          const direct = branch?.location || null;
          if (direct) return direct;
          const branchId = branch?.documentId || branch?.id || null;
          if (!branchId || !Array.isArray(branchListings)) return null;
          const match = branchListings.find((bl) => {
            const blId = bl?.branch?.documentId || bl?.branch?.id || null;
            return blId && String(blId) === String(branchId);
          });
          return match?.branch?.location || null;
        };

        const match = (branch) => {
          const loc = getLocForBranch(branch);
          if (!loc) return false;
          const bProv = normalizeLocationToken(loc?.province);
          const bCity = normalizeLocationToken(loc?.city);
          const bTown = normalizeLocationToken(loc?.town);

          if (selectedTowns.size > 0) return bTown && selectedTowns.has(bTown);
          if (selectedCities.size > 0) return bCity && selectedCities.has(bCity);
          if (selectedProvinces.size > 0) return bProv && selectedProvinces.has(bProv);
          return true;
        };

        const filtered = branches.filter(match);
        if (filtered.length > 0) return filtered;
        return branches;
      };

      const cached = branchesModalCacheRef.current.get(listingIdStr);
      if (cached && Array.isArray(cached.branches) && cached.branches.length > 1) {
        const displayBranches = filterBranchesForLocation(
          cached.branches,
          Array.isArray(cached.branch_listings) ? cached.branch_listings : []
        );
        setSelectedListing({
          ...listing,
          __branchesOverride: displayBranches,
          branch_listings: Array.isArray(cached.branch_listings) ? cached.branch_listings : [],
        });
        setShowBranchesModal(true);
        return true;
      }

      setBranchesModalLoading(true);
      try {
        const PAGE_SIZE = 15;
        const fetchPage = async (page) => {
          const res = await apolloClient.query({
            query: GET_LISTING_BRANCHES_FOR_MODAL,
            variables: { documentID: listingIdStr, page, pageSize: PAGE_SIZE },
            fetchPolicy: "network-only",
          });
          const extraListing = res?.data?.listing;
          const rawBranches = Array.isArray(extraListing?.branches) ? extraListing.branches : [];
          const branchListings = Array.isArray(extraListing?.branch_listings) ? extraListing.branch_listings : [];
          const branchesFromBranchListings = branchListings.map((bl) => bl?.branch).filter(Boolean);

          const uniqueBranches = new Map();
          rawBranches.forEach((b) => {
            const id = b?.documentId || b?.id;
            if (id) uniqueBranches.set(String(id), b);
          });
          branchesFromBranchListings.forEach((b) => {
            const id = b?.documentId || b?.id;
            if (id) uniqueBranches.set(String(id), b);
          });

          const branches = Array.from(uniqueBranches.values());
          return {
            branches,
            branchListings,
            rawBranchesCount: rawBranches.length,
            rawBranchListingsCount: branchListings.length,
          };
        };

        const first = await fetchPage(1);
        if (first.branches.length <= 0) return false;
        const displayFirstBranches = filterBranchesForLocation(first.branches, first.branchListings);

        setSelectedListing({
          ...listing,
          __branchesOverride: displayFirstBranches,
          branch_listings: first.branchListings,
        });
        setShowBranchesModal(true);
        try {
          branchCountsCacheRef.current.set(listingIdStr, first.branches.length);
          setCompanyOrderPoolMap((prev) => {
            const base = prev || {};
            if (!base[listingIdStr]) return prev;
            const displayCount =
              Array.isArray(displayFirstBranches) && displayFirstBranches.length > 0
                ? displayFirstBranches.length
                : first.branches.length;
            const nextApprox = hasLocationSelection ? displayCount : first.branches.length;
            if (
              base[listingIdStr]?.__approxBranchCount === nextApprox &&
              base[listingIdStr]?.__totalBranchCount === first.branches.length
            )
              return prev;
            return {
              ...base,
              [listingIdStr]: {
                ...base[listingIdStr],
                __approxBranchCount: nextApprox,
                __totalBranchCount: first.branches.length,
              },
            };
          });
          setBranchCountsVersion((v) => v + 1);
        } catch {
        }
        setBranchesModalLoading(false);

        let page = 2;
        let allBranches = first.branches;
        let allBranchListings = first.branchListings;

        while (true) {
          if (branchesModalActiveListingIdRef.current !== listingIdStr) break;
          const next = await fetchPage(page);
          if (next.rawBranchesCount === 0 && next.rawBranchListingsCount === 0) break;

          const seenBranches = new Set(allBranches.map((b) => String(b?.documentId || b?.id || "")));
          const mergedBranches = [...allBranches];
          for (const b of next.branches) {
            const key = String(b?.documentId || b?.id || "");
            if (key && !seenBranches.has(key)) {
              seenBranches.add(key);
              mergedBranches.push(b);
            }
          }

          const seenBL = new Set(allBranchListings.map((bl) => String(bl?.documentId || bl?.id || "")));
          const mergedBL = [...allBranchListings];
          for (const bl of next.branchListings) {
            const key = String(bl?.documentId || bl?.id || "");
            if (key && !seenBL.has(key)) {
              seenBL.add(key);
              mergedBL.push(bl);
            }
          }

          allBranches = mergedBranches;
          allBranchListings = mergedBL;

          const displayBranches = filterBranchesForLocation(mergedBranches, mergedBL);
          setSelectedListing((prev) => {
            const prevId = prev?.documentId || prev?.id;
            if (!prevId || String(prevId) !== listingIdStr) return prev;
            return { ...prev, __branchesOverride: displayBranches, branch_listings: mergedBL };
          });

          if (next.rawBranchesCount < PAGE_SIZE && next.rawBranchListingsCount < PAGE_SIZE) break;
          page += 1;
        }

        branchesModalCacheRef.current.set(listingIdStr, {
          branches: allBranches,
          branch_listings: allBranchListings,
        });
        try {
          branchCountsCacheRef.current.set(listingIdStr, allBranches.length);
          const displayAllBranches = filterBranchesForLocation(allBranches, allBranchListings);
          const displayCount =
            Array.isArray(displayAllBranches) && displayAllBranches.length > 0
              ? displayAllBranches.length
              : allBranches.length;
          const nextApprox = hasLocationSelection ? displayCount : allBranches.length;
          setCompanyOrderPoolMap((prev) => {
            const base = prev || {};
            if (!base[listingIdStr]) return prev;
            if (
              base[listingIdStr]?.__approxBranchCount === nextApprox &&
              base[listingIdStr]?.__totalBranchCount === allBranches.length
            )
              return prev;
            return {
              ...base,
              [listingIdStr]: {
                ...base[listingIdStr],
                __approxBranchCount: nextApprox,
                __totalBranchCount: allBranches.length,
              },
            };
          });
          setBranchCountsVersion((v) => v + 1);
        } catch {
        }

        return true;
      } catch {
        return false;
      } finally {
        setBranchesModalLoading(false);
      }
    },
    [apolloClient, normalizeLocationToken, selectedLocationSelection]
  );

  const handleListingPrimaryClick = useCallback(
    (listingItem) => {
      const listing = listingItem?.listingForCard || listingItem?.listingForModal || null;
      if (!listing) return false;
      openBranchesModalForListing(listing);
      return true;
    },
    [openBranchesModalForListing]
  );

  const handleListingViewMoreBranchesClick = useCallback(
    (listingItem) => {
      const listing = listingItem?.listingForCard || listingItem?.listingForModalAll || null;
      if (!listing) return false;
      openBranchesModalForListing(listing);
      return true;
    },
    [openBranchesModalForListing]
  );

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
    const byTab = sortedCategories?.[activeTab]?.name;
    const raw =
      typeof activeFilters.category === "string" && activeFilters.category !== "All Categories"
        ? activeFilters.category
        : byTab;
    if (!raw) return "";
    return String(raw).toUpperCase();
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
      const unique = (arr) => Array.from(new Set(arr.map((x) => String(x).trim()).filter(Boolean)));

      const provinceVals = decoded
        .filter((d) => d.level === "province" && d.province)
        .map((d) => d.province);
      if (provinceVals.length) {
        const toks = unique(provinceVals).flatMap((v) => packedTokenVariants(v));
        if (toks.length) and.push({ or: toks.map((tok) => ({ provinces: { contains: tok } })) });
      }

      const cityPairs = decoded
        .filter((d) => d.level === "city" && d.province && d.city)
        .map((d) => ({ province: d.province, city: d.city }));
      if (cityPairs.length) {
        and.push({
          or: cityPairs.map((p) => {
            const provToks = packedTokenVariants(p.province);
            const cityToks = packedTokenVariants(p.city);
            const clauseAnd = [];
            if (provToks.length) clauseAnd.push({ or: provToks.map((tok) => ({ provinces: { contains: tok } })) });
            if (cityToks.length) clauseAnd.push({ or: cityToks.map((tok) => ({ cities: { contains: tok } })) });
            return clauseAnd.length > 1 ? { and: clauseAnd } : clauseAnd[0];
          }).filter(Boolean),
        });
      }

      const townTriples = decoded
        .filter((d) => d.level === "town" && d.province && d.city && d.town)
        .map((d) => ({ province: d.province, city: d.city, town: d.town }));
      if (townTriples.length) {
        and.push({
          or: townTriples.map((t) => {
            const provToks = packedTokenVariants(t.province);
            const cityToks = packedTokenVariants(t.city);
            const townToks = packedTokenVariants(t.town);
            const clauseAnd = [];
            if (provToks.length) clauseAnd.push({ or: provToks.map((tok) => ({ provinces: { contains: tok } })) });
            if (cityToks.length) clauseAnd.push({ or: cityToks.map((tok) => ({ cities: { contains: tok } })) });
            if (townToks.length) clauseAnd.push({ or: townToks.map((tok) => ({ towns: { contains: tok } })) });
            return clauseAnd.length > 1 ? { and: clauseAnd } : clauseAnd[0];
          }).filter(Boolean),
        });
      }
    } else if (Array.isArray(locationRaw) && locationRaw.length === 3) {
      const [prov, city, town] = locationRaw;
      const townV = normalizeLower(town);
      const cityV = normalizeLower(city);
      const provV = normalizeLower(prov);
      if (provV && provV !== "any") {
        const toks = packedTokenVariants(provV);
        if (toks.length) and.push({ or: toks.map((tok) => ({ provinces: { contains: tok } })) });
      }
      if (cityV && cityV !== "any") {
        const toks = packedTokenVariants(cityV);
        if (toks.length) and.push({ or: toks.map((tok) => ({ cities: { contains: tok } })) });
      }
      if (townV && townV !== "any") {
        const toks = packedTokenVariants(townV);
        if (toks.length) and.push({ or: toks.map((tok) => ({ towns: { contains: tok } })) });
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
      if (Array.isArray(obj.and)) return obj.and.some((o) => isLocObj(o));
      if (Array.isArray(obj.or)) return obj.or.some((o) => isLocObj(o));
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
    fetchPolicy: "network-only",
    notifyOnNetworkStatusChange: true,
  });

  const searchIndexPageInfo = searchIndexConnData?.listingSearchIndices_connection?.pageInfo;
  const searchIndexNodes = searchIndexConnData?.listingSearchIndices_connection?.nodes;
  const companyOrderFiltersKey = useMemo(() => {
    try {
      return JSON.stringify(searchIndexFilters ?? null);
    } catch {
      return "";
    }
  }, [searchIndexFilters]);

  useEffect(() => {
    if (!enableQueries) return;
    if (sortOrder !== "Default") return;

    if (poolFetchRef.current.key !== companyOrderFiltersKey) {
      poolFetchRef.current.key = companyOrderFiltersKey;
      poolFetchRef.current.inFlight = false;
      setCompanyOrderPoolIds([]);
      setCompanyOrderPoolMap({});
      setCompanyOrderPoolNextPage(1);
      setCompanyOrderPoolPageCount(null);
    }
  }, [companyOrderFiltersKey, enableQueries, sortOrder]);

  useEffect(() => {
    if (!enableQueries) return;
    if (sortOrder !== "Default") return;

    const POOL_PAGE_SIZE = 100;
    const IDS_BATCH_SIZE = 40;
    const MAX_INDEX_PAGES_PER_RUN = 5;

    const desiredVisible = Math.max(1, currentPage + 1) * listingsPerPage;
    const poolCompanies = new Set(
      Object.values(companyOrderPoolMap || {})
        .map((l) => getCompanyKey(l))
        .filter(Boolean)
    );
    const needCompanies = poolCompanies.size < listingsPerPage;
    const needItems = companyOrderPoolIds.length < desiredVisible;
    const noMorePages =
      typeof companyOrderPoolPageCount === "number" &&
      companyOrderPoolNextPage > companyOrderPoolPageCount;

    if ((!needItems && !needCompanies) || noMorePages) return;
    if (poolFetchRef.current.inFlight) return;

    poolFetchRef.current.inFlight = true;
    setIsPoolFetching(true);
    let cancelled = false;

    const run = async () => {
      let nextPage = companyOrderPoolNextPage;
      let pageCount = companyOrderPoolPageCount;
      let pagesFetched = 0;

      const appendIds = [];
      const approxById = {};
      const indexFieldsById = {};
      const hasEnoughCompanies = !needCompanies;
      while (!cancelled && pagesFetched < MAX_INDEX_PAGES_PER_RUN) {
        const res = await apolloClient.query({
          query: LISTING_SEARCH_INDEX_CONNECTION_QUERY,
          variables: {
            filters: searchIndexFilters,
            page: nextPage,
            pageSize: POOL_PAGE_SIZE,
          },
          fetchPolicy: "network-only",
        });

        const conn = res?.data?.listingSearchIndices_connection;
        const nodes = Array.isArray(conn?.nodes) ? conn.nodes : [];
        const info = conn?.pageInfo;
        if (typeof info?.pageCount === "number") pageCount = info.pageCount;

        const ids = nodes
          .map((n) => (n?.listing_document_id ? String(n.listing_document_id) : ""))
          .filter(Boolean);
        for (const n of nodes) {
          const id = n?.listing_document_id ? String(n.listing_document_id) : "";
          if (!id) continue;
          const provinces = typeof n?.provinces === "string" ? n.provinces : "";
          const towns = typeof n?.towns === "string" ? n.towns : "";
          const townTokens = towns
            .split("|")
            .map((t) => t.trim())
            .filter(Boolean);
          const cities = typeof n?.cities === "string" ? n.cities : "";
          const cityTokens = cities
            .split("|")
            .map((t) => t.trim())
            .filter(Boolean);
          indexFieldsById[id] = { provinces, cities, towns };

          const scoped = getScopedBranchCountFromIndex(indexFieldsById[id]);
          if (typeof scoped === "number" && scoped > 0) {
            approxById[id] = scoped;
          } else {
            const approx = Math.max(townTokens.length, cityTokens.length);
            if (approx > 0) approxById[id] = approx;
          }
        }

        if (ids.length === 0) {
          nextPage += 1;
          pagesFetched += 1;
          if (typeof pageCount === "number" && nextPage > pageCount) break;
          continue;
        }

        appendIds.push(...ids);
        nextPage += 1;
        pagesFetched += 1;

        if (typeof pageCount === "number" && nextPage > pageCount) break;
        if (hasEnoughCompanies && companyOrderPoolIds.length + appendIds.length >= desiredVisible) break;
      }

      if (cancelled) return;

      if (appendIds.length > 0) {
        const existing = new Set(companyOrderPoolIds);
        const uniqueNew = appendIds.filter((id) => !existing.has(id));

        if (uniqueNew.length > 0) {
          const batches = [];
          for (let i = 0; i < uniqueNew.length; i += IDS_BATCH_SIZE) {
            batches.push(uniqueNew.slice(i, i + IDS_BATCH_SIZE));
          }

          const results = await Promise.all(
            batches.map(async (ids) => {
              const resp = await apolloClient.query({
                query: LISTINGS_CARDS_BY_DOCUMENT_IDS_QUERY,
                variables: {
                  ids,
                  pageSize: Math.max(1, ids.length),
                },
                fetchPolicy: "network-only",
              });
              return Array.isArray(resp?.data?.listings) ? resp.data.listings : [];
            })
          );

          if (cancelled) return;

          const nextMap = {};
          for (const arr of results) {
            for (const l of arr) {
              const id = l?.documentId ? String(l.documentId) : "";
              if (!id) continue;
              const cachedCount = branchCountsCacheRef.current.get(id);
              const indexFields = indexFieldsById[id] || null;
              const scopedCount = getScopedBranchCountFromIndex(indexFields);
              const baseCount =
                typeof cachedCount === "number"
                  ? cachedCount
                  : typeof approxById[id] === "number"
                    ? approxById[id]
                    : null;
              const count = hasScopedLocation ? (scopedCount ?? baseCount) : baseCount;

              nextMap[id] = {
                ...l,
                __approxBranchCount: count,
                __totalBranchCount: typeof cachedCount === "number" ? cachedCount : undefined,
                __indexProvinces: indexFields?.provinces || "",
                __indexCities: indexFields?.cities || "",
                __indexTowns: indexFields?.towns || "",
              };
            }
          }

          if (Object.keys(nextMap).length > 0) {
            setCompanyOrderPoolMap((prev) => ({ ...(prev || {}), ...nextMap }));
          }

          setCompanyOrderPoolIds((prev) => {
            const base = Array.isArray(prev) ? prev : [];
            const baseSet = new Set(base);
            const merged = [...base];
            for (const id of uniqueNew) {
              if (!baseSet.has(id)) {
                baseSet.add(id);
                merged.push(id);
              }
            }
            return merged;
          });
        }
      }

      setCompanyOrderPoolNextPage(nextPage);
      setCompanyOrderPoolPageCount(pageCount);
    };

    run()
      .catch(() => {
      })
      .finally(() => {
        if (!cancelled) {
          poolFetchRef.current.inFlight = false;
          setIsPoolFetching(false);
        }
      });

    return () => {
      cancelled = true;
      poolFetchRef.current.inFlight = false;
      setIsPoolFetching(false);
    };
  }, [
    apolloClient,
    companyOrderPoolIds.length,
    companyOrderPoolNextPage,
    companyOrderPoolPageCount,
    currentPage,
    enableQueries,
    listingsPerPage,
    searchIndexFilters,
    sortOrder,
  ]);

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
    }),
    [listingDocumentIds]
  );

  const {
    data: listingsByIdsData,
    loading: listingsByIdsLoading,
    error: listingsByIdsError,
  } = useQuery(LISTINGS_CARDS_BY_DOCUMENT_IDS_QUERY, {
    variables: listingsByIdsVars,
    skip: !enableQueries || listingDocumentIds.length === 0,
    fetchPolicy: "network-only",
    notifyOnNetworkStatusChange: true,
  });

  const filteredListings = useMemo(() => {
    if (sortOrder === "Default" && enableQueries) {
      const orderedRaw = companyOrderPoolIds
        .map((id) => companyOrderPoolMap?.[id])
        .filter(Boolean);
      const ordered = !hasScopedLocation
        ? orderedRaw
        : orderedRaw.map((l) => {
            const scoped = getScopedBranchCountFromIndex({
              provinces: l?.__indexProvinces,
              cities: l?.__indexCities,
              towns: l?.__indexTowns,
            });
            if (typeof scoped === "number" && scoped > 0) {
              return { ...l, __approxBranchCount: scoped };
            }
            return l;
          });
      if (ordered.length > 0) {
        const dayKey = new Date().toISOString().slice(0, 10);
        const seedKey = `for-sale|company-rotation|${dayKey}`;
        const rotated = enforceNoAdjacentCompanies(
          interleaveCompanyListingsNoAdjacent(ordered, seedKey)
        );
        const start = Math.max(0, (currentPage - 1) * listingsPerPage);
        return rotated.slice(start, start + listingsPerPage);
      }
    }
    if (enableQueries && listingDocumentIds.length > 0 && !searchIndexLoading && !listingsByIdsLoading) {
      const approxById = new Map();
      const indexById = new Map();
      if (Array.isArray(searchIndexNodes)) {
        for (const n of searchIndexNodes) {
          const id = n?.listing_document_id ? String(n.listing_document_id) : "";
          if (!id) continue;
          const indexFields = {
            provinces: typeof n?.provinces === "string" ? n.provinces : "",
            cities: typeof n?.cities === "string" ? n.cities : "",
            towns: typeof n?.towns === "string" ? n.towns : "",
          };
          indexById.set(id, indexFields);

          const scoped = getScopedBranchCountFromIndex(indexFields);
          if (typeof scoped === "number" && scoped > 0) {
            approxById.set(id, scoped);
            continue;
          }
          const towns = typeof n?.towns === "string" ? n.towns : "";
          const townTokens = towns
            .split("|")
            .map((t) => t.trim())
            .filter(Boolean);
          const cities = typeof n?.cities === "string" ? n.cities : "";
          const cityTokens = cities
            .split("|")
            .map((t) => t.trim())
            .filter(Boolean);
          const approx = Math.max(townTokens.length, cityTokens.length);
          if (approx > 0) approxById.set(id, approx);
        }
      }

      const items = listingsByIdsData?.listings;
      const map = new Map();
      if (Array.isArray(items)) {
        for (const l of items) {
          const id = l?.documentId ? String(l.documentId) : "";
          if (!id) continue;
          const cachedCount = branchCountsCacheRef.current.get(id);
          const approx = typeof approxById.get(id) === "number" ? approxById.get(id) : null;
          const baseCount = typeof cachedCount === "number" ? cachedCount : approx;
          const count = hasScopedLocation ? (approx ?? baseCount) : baseCount;
          const indexFields = indexById.get(id) || null;
          map.set(id, {
            ...l,
            __approxBranchCount: count,
            __totalBranchCount: typeof cachedCount === "number" ? cachedCount : undefined,
            __indexProvinces: indexFields?.provinces || "",
            __indexCities: indexFields?.cities || "",
            __indexTowns: indexFields?.towns || "",
          });
        }
      }
      const ordered = listingDocumentIds.map((id) => map.get(id)).filter(Boolean);
      if (ordered.length > 0) return ordered;
    }
    return [];
  }, [
    branchCountsVersion,
    companyOrderFiltersKey,
    companyOrderPoolIds,
    companyOrderPoolMap,
    currentPage,
    enableQueries,
    listingDocumentIds,
    listingsByIdsData,
    listingsByIdsLoading,
    listingsPerPage,
    searchIndexLoading,
    searchIndexNodes,
    hasScopedLocation,
    getScopedBranchCountFromIndex,
    sortOrder,
  ]);

  const visibleListingIds = useMemo(() => {
    const ids = filteredListings
      .map((l) => l?.documentId || l?.id)
      .filter(Boolean)
      .map((v) => String(v));
    return Array.from(new Set(ids));
  }, [filteredListings]);

  const visibleListingIdsKey = useMemo(() => visibleListingIds.join("|"), [visibleListingIds]);

  useEffect(() => {
    if (!enableQueries) return;
    if (!visibleListingIdsKey) return;

    const missing = visibleListingIds.filter((id) => !branchCountsCacheRef.current.has(id));
    if (missing.length === 0) return;

    let cancelled = false;
    const run = async () => {
      try {
        const resp = await apolloClient.query({
          query: LISTINGS_BRANCH_COUNTS_BY_DOCUMENT_IDS_QUERY,
          variables: { ids: missing, pageSize: Math.max(1, missing.length) },
          fetchPolicy: "network-only",
        });

        const items = Array.isArray(resp?.data?.listings) ? resp.data.listings : [];
        const nextCounts = new Map();
        for (const l of items) {
          const id = l?.documentId ? String(l.documentId) : "";
          if (!id) continue;
          const branchIds = new Set();
          if (Array.isArray(l?.branches)) {
            for (const b of l.branches) {
              const bid = b?.documentId || b?.id;
              if (bid) branchIds.add(String(bid));
            }
          }
          if (Array.isArray(l?.branch_listings)) {
            for (const bl of l.branch_listings) {
              const bid = bl?.branch?.documentId || bl?.branch?.id;
              if (bid) branchIds.add(String(bid));
            }
          }
          if (branchIds.size > 0) nextCounts.set(id, branchIds.size);
        }

        if (cancelled) return;
        if (nextCounts.size === 0) return;

        for (const [id, count] of nextCounts.entries()) {
          branchCountsCacheRef.current.set(id, count);
        }

        setCompanyOrderPoolMap((prev) => {
          const base = prev || {};
          let changed = false;
          const next = { ...base };
          for (const [id, count] of nextCounts.entries()) {
            if (!next[id]) continue;
            const shouldUpdateApprox = !hasScopedLocation;
            const prevApprox = next[id]?.__approxBranchCount;
            const prevTotal = next[id]?.__totalBranchCount;
            if (prevTotal === count && (!shouldUpdateApprox || prevApprox === count)) continue;

            next[id] = {
              ...next[id],
              __totalBranchCount: count,
              ...(shouldUpdateApprox ? { __approxBranchCount: count } : {}),
            };
            changed = true;
          }
          return changed ? next : prev;
        });

        setBranchCountsVersion((v) => v + 1);
      } catch {
      }
    };

    run();
    return () => {
      cancelled = true;
    };
  }, [apolloClient, enableQueries, hasScopedLocation, visibleListingIds, visibleListingIdsKey]);

  const totalListingsCount = useMemo(() => {
    const t = searchIndexPageInfo?.total;
    return typeof t === "number" ? t : filteredListings.length;
  }, [filteredListings.length, searchIndexPageInfo?.total]);

  const listingsLoading = searchIndexLoading || listingsByIdsLoading;
  const listingsError = searchIndexError || listingsByIdsError;
  const listingsUiLoading = useMemo(() => {
    if (!enableQueries) return true;
    if (sortOrder === "Default") {
      if (filteredListings.length > 0) return false;
      if (isPoolFetching) return true;
      const loadedCount = companyOrderPoolIds
        .map((id) => companyOrderPoolMap?.[id])
        .filter(Boolean).length;
      return loadedCount === 0;
    }
    return listingsLoading;
  }, [
    companyOrderPoolIds,
    companyOrderPoolMap,
    enableQueries,
    filteredListings.length,
    isPoolFetching,
    listingsLoading,
    sortOrder,
  ]);

  const { data: featuredListingsData } = useQuery(LISTINGS_FEATURED_CARDS_QUERY, {
    variables: { page: 1, pageSize: 3 },
    skip: !enableQueries,
    fetchPolicy: "cache-first",
  });

  const featuredListings = useMemo(() => {
    const items = featuredListingsData?.listings;
    if (Array.isArray(items)) return items;
    return [];
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

  const parseLocationSelection = useCallback((value) => {
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
  }, []);

  const buildAnalyticsFilterPayload = useCallback((filters) => {
    const loc = parseLocationSelection(filters?.location);
    const minPrice = typeof filters?.minPrice === "string" ? filters.minPrice : null;
    const maxPrice = typeof filters?.maxPrice === "string" ? filters.maxPrice : null;
    const search = typeof filters?.search === "string" ? filters.search.trim() : "";

    const normalized = {
      province: loc?.province || null,
      city: loc?.city || null,
      town: loc?.town || null,
      price: {
        min: minPrice && minPrice !== "Min Price" ? minPrice : null,
        max: maxPrice && maxPrice !== "Max Price" ? maxPrice : null,
      },
      category: filters?.category || null,
      stoneType: filters?.stoneType || null,
      colour: filters?.colour || filters?.color || null,
      style: filters?.style || null,
      overallStyle: filters?.overallStyle || null,
      slabStyle: filters?.slabStyle || null,
      custom: filters?.custom || null,
      search: search || null,
    };

    const paired = [];
    if (normalized.province && normalized.city) paired.push(`${normalized.province} > ${normalized.city}`);
    if (normalized.city && normalized.town) paired.push(`${normalized.city} > ${normalized.town}`);
    if (normalized.price.min || normalized.price.max) {
      paired.push(`price:${normalized.price.min || "any"}-${normalized.price.max || "any"}`);
    }
    if (normalized.category) paired.push(`category:${normalized.category}`);
    if (normalized.stoneType) paired.push(`stoneType:${normalized.stoneType}`);
    if (normalized.style) paired.push(`style:${normalized.style}`);

    return { filters: normalized, paired };
  }, [parseLocationSelection]);

  const activeCategoryName = useMemo(() => {
    const name = sortedCategories?.[activeTab]?.name;
    return typeof name === "string" ? name.toUpperCase() : "";
  }, [sortedCategories, activeTab]);

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
      return locationOptionsHierarchy;
    }
    return computedLocationHierarchy;
  }, [computedLocationHierarchy, locationOptionsHierarchy]);

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

  const hasSearchTerm = useMemo(() => {
    const s = activeFilters?.search;
    return typeof s === "string" && s.trim() !== "";
  }, [activeFilters?.search]);

  const categoryCounts = useMemo(() => {
    const base = categoryBadgeCounts || {};
    const merged = base;

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
    totalListingsCount,
  ]);

  const handleApplyFilters = useCallback(() => {
    const selected = sortedCategories[draftTab] || null;
    const nextCategoryName = selected?.name || draftFilters?.category || activeFilters?.category || null;
    const nextApplied = { ...draftFilters, category: nextCategoryName };
    setActiveTab(draftTab);
    setDraftTab(draftTab);
    setActiveFilters(nextApplied);
    setDraftFilters(nextApplied);
    setCurrentPage(1);
    try {
      const filterPayload = buildAnalyticsFilterPayload(nextApplied);
      trackAnalyticsEvent("filter_apply", null, {
        pagePath: "/search",
        metadata: { filters: filterPayload.filters, paired: filterPayload.paired },
      });
      if (typeof nextApplied?.search === "string" && nextApplied.search.trim()) {
        trackAnalyticsEvent("search", null, {
          pagePath: "/search",
          searchQuery: nextApplied.search.trim(),
          metadata: { filters: filterPayload.filters },
        });
      }
    } catch {
    }
  }, [activeFilters?.category, buildAnalyticsFilterPayload, draftFilters, draftTab, sortedCategories]);

  const handleClearAll = useCallback(() => {
    const defaultCategoryName = sortedCategories?.[0]?.name || null;
    const next = {
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
      category: defaultCategoryName,
      search: null,
    };
    setActiveTab(0);
    setDraftTab(0);
    setActiveFilters(next);
    setDraftFilters(next);
    setCurrentPage(1);
  }, [sortedCategories]);

  const handleSearch = useCallback(() => {
    setCurrentPage(1);
  }, []);

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
  }, [currentPage, filteredListings, sortOrder]);

  const listingItems = useMemo(() => {
    const next = baseSortedListings.map(buildListingItem).filter((x) => x?.id);
    return next;
  }, [baseSortedListings, buildListingItem]);

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

      {branchesModalLoading ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded shadow p-6">
            <PageLoader text="Loading branches..." />
          </div>
        </div>
      ) : null}

      {showBranchesModal && selectedListing && (
        <PremiumListingCardModal
          listing={selectedListing}
          onClose={() => {
            setShowBranchesModal(false);
            setSelectedListing(null);
            branchesModalActiveListingIdRef.current = null;
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
                activeFilters={draftFilters}
                setActiveFilters={setDraftFilters}
                showFilters={showFilters}
                setShowFilters={setShowFilters}
                filterOptions={filterOptions}
                filteredListings={filteredListings}
                applyMode={hasPendingFilterChanges}
                onApplyFilter={() => {
                  handleApplyFilters();
                  closeMobileFilter();
                }}
                onClearAll={handleClearAll}
                handleSearch={handleSearch}
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
                <CategoryTabs categories={sortedCategories} activeTab={draftTab} setActiveTab={handleTabChange} counts={categoryCounts} />
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
                  activeFilters={draftFilters}
                  setActiveFilters={setDraftFilters}
                  showFilters={showFilters}
                  setShowFilters={setShowFilters}
                  filterOptions={filterOptions}
                  filteredListings={filteredListings}
                  applyMode={hasPendingFilterChanges}
                  onApplyFilter={handleApplyFilters}
                  onClearAll={handleClearAll}
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
                      {listingsUiLoading && listingItems.length === 0 ? (
                        <div className="py-10">
                          <PageLoader text="Loading listings..." />
                        </div>
                      ) : listingItems.length === 0 ? (
                        <div className="text-center text-gray-500 py-8">No tombstones found for your selected filters.</div>
                      ) : (
                        <>
                          {listingItems.map((item) => (
                            <PremiumListingCard
                              compact={true}
                              key={item.id}
                              listing={item.listingForCard}
                              href={item.href}
                              onPrimaryClick={() => handleListingPrimaryClick(item)}
                              onViewMoreBranchesClick={() => handleListingViewMoreBranchesClick(item)}
                            />
                          ))}
                        </>
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
