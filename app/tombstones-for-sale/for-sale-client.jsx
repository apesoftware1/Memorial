"use client"

import { useState, useRef, useEffect, useMemo } from "react"
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

import { useProgressiveQuery } from '@/hooks/useProgressiveQuery';
import {
  LISTINGS_INITIAL_QUERY,
  LISTINGS_FULL_QUERY,
  LISTINGS_DELTA_QUERY,
} from '@/graphql/queries';
import { useListingCategories } from "@/hooks/use-ListingCategories"
import { useLocationHierarchy } from '@/hooks/useLocationHierarchy';
import { useHomepageAggregations } from '@/hooks/useHomepageAggregations';
import { checkListingLocation, toTitleCase, DEFAULT_PROVINCES, normalizeCityName } from '@/lib/locationHelpers';

export default function TombstonesForSaleClient({ initialListings = [], initialCategories = [] }) {
  const [enableQueries, setEnableQueries] = useState(false);
  useEffect(() => {
    setEnableQueries(true);
  }, []);

  const { categories: fetchedCategories, loading: categoriesLoading } = useListingCategories({ skip: !enableQueries });
  const categories = fetchedCategories?.length ? fetchedCategories : initialCategories;

  const [activeTab, setActiveTab] = useState(0);
  const searchParams = useSearchParams();
  const searchParamsKey = searchParams ? searchParams.toString() : '';
  const queryVariables = useMemo(() => ({}), []);
  
  const { data,loading, error } = useProgressiveQuery({
    initialQuery: LISTINGS_INITIAL_QUERY,
    fullQuery: LISTINGS_FULL_QUERY,
    deltaQuery: LISTINGS_DELTA_QUERY,
    variables: queryVariables,
    storageKey: 'listings:lastUpdated',
    refreshInterval: 0,
    staleTime: 1000 * 60 * 5,
    skip: !enableQueries,
  });

  const listings = useMemo(() => {
    const fromQuery = data?.listings;
    if (Array.isArray(fromQuery) && fromQuery.length > 0) return fromQuery;
    return Array.isArray(initialListings) ? initialListings : [];
  }, [data, initialListings]);

  const [featuredActiveIndex, setFeaturedActiveIndex] = useState(0);
  const featuredScrollRef = useRef(null);
  const router = useRouter();
  
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
  
  const allListings = useMemo(() => {
    return Array.isArray(listings) 
      ? listings.filter(listing => {
          return !(listing.specials && Array.isArray(listing.specials) && 
                  listing.specials.some(special => special.active === true));
        })
      : [];
  }, [listings]);

  const featuredManufacturers = [];
  const seenManufacturers = new Set();
  if (Array.isArray(listings)) {
    listings.forEach(l => {
      if (l.company?.isFeatured && !seenManufacturers.has(l.company.name)) {
        featuredManufacturers.push(l.company);
        seenManufacturers.add(l.company.name);
      }
    });
  }
  const topFeaturedManufacturers = featuredManufacturers.slice(0, 3);

  const [showFilters, setShowFilters] = useState(null)

  const [activeFilters, setActiveFilters] = useState({
    minPrice: "Min Price",
    maxPrice: "Max Price",
    location: null,
    stoneType: null,
    color: null,
    style: null,
    slabStyle: null,
    custom: null,
    colour: null,
    category: null,
    search: null,
  })

  const isUrlUpdating = useRef(false);

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

    const locationVal = searchParams.get('location');
    let locationNormalized = null;
    if (locationVal) {
      const raw = locationVal.split(',').map(s => s.trim()).filter(Boolean);
      
      locationNormalized = raw.map(l => {
        const knownProv = DEFAULT_PROVINCES.find(p => p.toLowerCase() === l.toLowerCase());
        if (knownProv) return knownProv;
        
        return normalizeCityName(l);
      });
      
      if (locationNormalized.length === 0) locationNormalized = null;
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

      if (hasChanges) {
        return newFilters;
      }
      return prev;
    });
  }, [searchParamsKey]);

  useEffect(() => {
    if (!searchParams) return;

    const isDefaultState = 
        activeFilters.minPrice === "Min Price" &&
        activeFilters.maxPrice === "Max Price" &&
        !activeFilters.location &&
        !activeFilters.stoneType &&
        !activeFilters.colour &&
        !activeFilters.style &&
        !activeFilters.slabStyle &&
        !activeFilters.custom &&
        !activeFilters.search;

    const hasUrlParams = 
        searchParams.has('minPrice') || 
        searchParams.has('maxPrice') || 
        searchParams.has('location') || 
        searchParams.has('stoneType') || 
        searchParams.has('colour') || 
        searchParams.has('style') || 
        searchParams.has('slabStyle') || 
        searchParams.has('custom') ||
        searchParams.has('search');

    if (isDefaultState && hasUrlParams) {
        return;
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
        const strVal = Array.isArray(value) ? value.join(',') : value;
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
  }, [activeFilters, router]);

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
      
      const params = new URLSearchParams(searchParams.toString());
      params.set('category', selected.name);
      router.push(`?${params.toString()}`, { scroll: false });
    }
  };

  const activeCategory = sortedCategories[activeTab] || null;

  const handleListingPrimaryClick = (listing) => {
    try {
      console.log(listing.branch_listings)
      
      let branches = [];
      if (Array.isArray(listing?.branch_listings) && listing.branch_listings.length > 0) {
        branches = listing.branch_listings.map(bl => bl.branch).filter(Boolean);
      } else {
        branches = Array.isArray(listing?.branches) ? listing.branches : [];
      }

      if (branches.length > 1) {
        setSelectedListing(listing);
        setShowBranchesModal(true);
        return true;
      }
      if (branches.length === 1) {
        const branchId = branches[0]?.id || branches[0]?.documentId;
        const listingId = listing?.documentId || listing?.id;
        if (listingId && branchId) {
          router.push(`/tombstones-for-sale/${listingId}?branch=${branchId}`);
          return true;
        }
      }
    } catch (e) {
      console.error('Failed handling primary click for listing', e);
    }
    return false;
  };

  const handleBranchSelect = (branch) => {
    try {
      const listingId = selectedListing?.documentId || selectedListing?.id;
      const branchId = branch?.id || branch?.documentId;
      if (listingId && branchId) {
        setShowBranchesModal(false);
        const branchData = encodeURIComponent(JSON.stringify(branch));
        router.push(`/tombstones-for-sale/${listingId}?branch=${branchId}&branchData=${branchData}`);
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

  const filterListingsFrom = (filtersObj) => {
    let filtered = [...allListings];
    const f = filtersObj || activeFilters;

    const checkMatch = (itemVal, filterVal, exact = false) => {
      if (!filterVal || filterVal === 'All' || filterVal === '' || filterVal === 'Any' || filterVal === 'All Categories' || filterVal === 'Min Price' || filterVal === 'Max Price') return true;
      
      if (Array.isArray(filterVal)) {
        if (filterVal.length === 0) return true;
        if (filterVal.includes('All') || filterVal.includes('Any') || filterVal.includes('All Categories')) return true;
        
        return filterVal.some(fv => {
           if (!fv) return false;
           const fStr = fv.toString().toLowerCase();
           const iStr = (itemVal || '').toString().toLowerCase();
           return exact ? iStr === fStr : iStr.includes(fStr);
        });
      }
      
      const fStr = filterVal.toString().toLowerCase();
      const iStr = (itemVal || '').toString().toLowerCase();
      return exact ? iStr === fStr : iStr.includes(fStr);
    };
    
    if (f.search && f.search !== '') {
      const searchQuery = f.search.toLowerCase();
      filtered = filtered.filter(listing => {
        const title = (listing?.title || '').toLowerCase();
        const companyName = (listing?.company?.name || '').toLowerCase();
        const documentId = (listing?.documentId || '').toLowerCase();
        const id = (listing?.id || '').toString().toLowerCase();
        const productId = (listing?.productDetails?.id || '').toLowerCase();
        const listingSlug = (listing?.slug || '').toLowerCase();
        
        return title.includes(searchQuery) || 
               companyName.includes(searchQuery) || 
               documentId.includes(searchQuery) ||
               id.includes(searchQuery) ||
               productId.includes(searchQuery) ||
               listingSlug.includes(searchQuery);
      });
    }
    
    if (f.category && f.category !== 'All Categories' && f.category !== '') {
      filtered = filtered.filter(listing => (listing.listing_category?.name || '').toLowerCase() === f.category.toLowerCase());
    }

    if (f.location) {
       if (Array.isArray(f.location) && f.location.length > 0 && !f.location.includes('All')) {
          filtered = filtered.filter(listing => f.location.some(loc => checkListingLocation(listing, loc)));
       } else if (f.location && f.location !== 'All' && !Array.isArray(f.location) && f.location !== '') {
          filtered = filtered.filter(listing => checkListingLocation(listing, f.location));
       }
    }

    filtered = filtered.filter(listing => {
        const values = listing.productDetails?.stoneType?.map(v => v.value) || [];
        if (values.length === 0) return checkMatch(null, f.stoneType);
        return values.some(val => checkMatch(val, f.stoneType));
    });

    const colorQuery = f.color || f.colour;
    filtered = filtered.filter(listing => {
        const values = listing.productDetails?.color?.map(v => v.value) || [];
        if (values.length === 0) return checkMatch(null, colorQuery);
        return values.some(val => checkMatch(val, colorQuery));
    });

    filtered = filtered.filter(listing => {
        const values = listing.productDetails?.style?.map(v => v.value) || [];
        if (values.length === 0) return checkMatch(null, f.style);
        return values.some(val => checkMatch(val, f.style));
    });

    filtered = filtered.filter(listing => {
        const values = listing.productDetails?.slabStyle?.map(v => v.value) || [];
        if (values.length === 0) return checkMatch(null, f.slabStyle);
        return values.some(val => checkMatch(val, f.slabStyle));
    });

    filtered = filtered.filter(listing => {
        const values = listing.productDetails?.customization?.map(v => v.value) || [];
        if (values.length === 0) return checkMatch(null, f.custom);
        return values.some(val => checkMatch(val, f.custom));
    });

    if (f.minPrice && f.minPrice !== 'Min Price' && f.minPrice !== '') {
      const min = parsePrice(f.minPrice);
      console.log('Filtering Min Price:', min, 'Raw:', f.minPrice);
      filtered = filtered.filter(listing => {
        if (!listing.price && listing.price !== 0) return false;
        const price = parsePrice(listing.price);
        return price >= min;
      });
    }

    if (f.maxPrice && f.maxPrice !== 'Max Price' && f.maxPrice !== '') {
      const max = parsePrice(f.maxPrice);
      console.log('Filtering Max Price:', max, 'Raw:', f.maxPrice);
      filtered = filtered.filter(listing => {
        if (!listing.price && listing.price !== 0) return false;
        const price = parsePrice(listing.price);
        return price <= max;
      });
    }
    return filtered;
  };

  const filteredListings = useMemo(() => filterListingsFrom(activeFilters), [activeFilters, allListings]);

  const listingsForLocationCounts = useMemo(() => {
    const filtersForCounts = { ...activeFilters, location: null }; 
    return filterListingsFrom(filtersForCounts);
  }, [activeFilters, allListings]);

  const { data: homepageAggData } = useHomepageAggregations();

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

  const locationHierarchy = useMemo(() => {
    const showAggCounts = !enableQueries || loading;
    if (showAggCounts && homepageAggLocationHierarchy.length > 0) return homepageAggLocationHierarchy;
    return computedLocationHierarchy;
  }, [enableQueries, loading, homepageAggLocationHierarchy, computedLocationHierarchy]);

  const computedCategoryCounts = useMemo(() => {
    const filtersNoCategory = { ...activeFilters, category: 'All Categories' };
    const potentialListings = filterListingsFrom(filtersNoCategory);
    
    const counts = {};
    potentialListings.forEach(listing => {
      const catName = listing?.listing_category?.name;
      if (catName) {
        counts[catName] = (counts[catName] || 0) + 1;
      }
    });
    
    return counts;
  }, [activeFilters, allListings]);

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

  const categoryCounts = useMemo(() => {
    const showAggCounts = !enableQueries || loading;
    if (showAggCounts && homepageAggCategoryCounts) return homepageAggCategoryCounts;
    return computedCategoryCounts;
  }, [enableQueries, loading, homepageAggCategoryCounts, computedCategoryCounts]);

  const handleSearch = () => {
    setCurrentPage(1);
  };

  const [sortOrder, setSortOrder] = useState("Default");

  let sortedListings = [...filteredListings];
  if (sortOrder === "Price: Low to High") {
    sortedListings.sort((a, b) => {
      const priceA = a.price ? parsePrice(a.price) : 0;
      const priceB = b.price ? parsePrice(b.price) : 0;
      return priceA - priceB;
    });
  } else if (sortOrder === "Price: High to Low") {
    sortedListings.sort((a, b) => {
      const priceA = a.price ? parsePrice(a.price) : 0;
      const priceB = b.price ? parsePrice(b.price) : 0;
      return priceB - priceA;
    });
  } else if (sortOrder === "Newest First") {
    sortedListings.sort((a, b) => (b.id > a.id ? 1 : -1));
  }

  const [currentPage, setCurrentPage] = useState(1);
  const listingsPerPage = 20;

  function getPageListings(listings, page) {
    const start = (page - 1) * listingsPerPage;
    const end = start + listingsPerPage;
    return listings.slice(start, end);
  }

  const paginatedListings = getPageListings(sortedListings, currentPage);

  const fallbackCard = (type = "listing") => (
    <CardSkeleton className="h-full" />
  );

  function getCustomFlow(listings) {
    let idx = 0;
    const flow = [];
    flow.push(
      <div key="featured-listings" className="mb-8">
        <h2 className="text-center text-gray-600 border-b border-gray-300 pb-2 mb-4 mt-4">FEATURED LISTINGS</h2>
        <p className="text-center text-xs text-gray-500 -mt-3 mb-2">*Sponsored</p>

        <div className="md:hidden">
          <div className="flex overflow-x-auto gap-4 snap-x snap-mandatory scrollbar-hide" ref={featuredScrollRef}>
            
             {listings?.filter(l => l.isFeatured).length > 0
               ? listings?.filter(l => l.isFeatured).slice(0, 3).map((product, index) => (
                   Array.isArray(product.branches) && product.branches.length > 0 ? (
                     product.branches.map((branch) => (
                       <div key={`${product.documentId || product.id}-${branch.documentId || branch.id}`} className="flex-shrink-0 w-64 snap-start">
                         <FeaturedListings listing={{...product, currentBranch: branch}} />
                       </div>
                     ))
                   ) : (
                     <div key={product.id || index} className="flex-shrink-0 w-64 snap-start">
                       <FeaturedListings listing={product} />
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
          {listings?.filter(l => l.isFeatured).length > 0
            ? listings?.filter(l => l.isFeatured).slice(0, 3).map((product, index) => (
                <FeaturedListings key={product.id || index} listing={product} />
              ))
            : fallbackCard("featured listings")}
        </div>
      </div>
    );
    flow.push(<div key="banner-1" className="my-6"><BannerAd /></div>);
    flow.push(
      <div key="listings-1" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
        {listings.slice(idx, idx + 5).length > 0
          ? listings.slice(idx, idx + 5).map((listing, i) => <PremiumListingCard compact={true} key={listing.id || i} listing={listing} href={`/tombstones-for-sale/${listing.documentId || listing.id}`} onPrimaryClick={(e) => handleListingPrimaryClick(listing, e)} />)
          : fallbackCard("listings")}
      </div>
    );
    idx += 5;
    flow.push(<div key="banner-2" className="my-6"><BannerAd /></div>);
    flow.push(
      <div key="listings-2" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
        {listings.slice(idx, idx + 5).length > 0
          ? listings.slice(idx, idx + 5).map((listing, i) => (
              <PremiumListingCard
                compact={true}
                key={listing.id || i}
                listing={listing}
                href={`/tombstones-for-sale/${listing.documentId || listing.id}`}
                onPrimaryClick={() => handleListingPrimaryClick(listing)}
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
        {listings.slice(idx, idx + 5).length > 0
          ? listings.slice(idx, idx + 5).map((listing, i) => (
              <PremiumListingCard
                compact={true}
                key={listing.id || i}
                listing={listing}
                href={`/tombstones-for-sale/${listing.documentId || listing.id}`}
                onPrimaryClick={() => handleListingPrimaryClick(listing)}
              />
            ))
           : fallbackCard("listings")}
      </div>
    );
    idx += 5;
    flow.push(<div key="banner-3" className="my-6"><BannerAd /></div>);
    flow.push(
      <div key="listings-4" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
        {listings.slice(idx, idx + 5).length > 0
          ? listings.slice(idx, idx + 5).map((listing, i) => (
              <PremiumListingCard
                compact={true}
                key={listing.id || i}
                listing={listing}
                href={`/tombstones-for-sale/${listing.documentId || listing.id}`}
                onPrimaryClick={() => handleListingPrimaryClick(listing)}
              />
            ))
           : fallbackCard("listings")}
      </div>
    );
    return flow;
  }

  const customFlow = getCustomFlow(paginatedListings);

  const totalPages = Math.ceil(sortedListings.length / listingsPerPage);
  
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
  const [showSortDropdown, setShowSortDropdown] = useState(false);

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

  const totalListingsCount = filteredListings.length;
  
  if (enableQueries && loading && allListings.length === 0) return <PageLoader text="Loading listings..." />;
  if (error && allListings.length === 0) return (
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

  const filteredPremiumListings = filteredListings.filter(listing => {
    if (activeFilters.location && activeFilters.location !== "All" && activeFilters.location !== "") {
      const selectedLocations = Array.isArray(activeFilters.location) 
        ? activeFilters.location 
        : [activeFilters.location];
      
      const listingLocation = listing.location?.toLowerCase() || "";
      const hasMatch = selectedLocations.some(loc => 
        listingLocation.includes(loc.toLowerCase())
      );
      
      if (!hasMatch) return false;
    }
    if (activeFilters.stoneType && activeFilters.stoneType !== "All" && activeFilters.stoneType !== "") {
      const selectedTypes = Array.isArray(activeFilters.stoneType)
        ? activeFilters.stoneType
        : [activeFilters.stoneType];
        
      const stoneType = listing.stoneType || listing.details || "";
      const hasMatch = selectedTypes.some(type => 
        stoneType.toLowerCase().includes(type.toLowerCase())
      );
      
      if (!hasMatch) return false;
    }
    if (activeFilters.colour && activeFilters.colour !== "All" && activeFilters.colour !== "") {
      const selectedColors = Array.isArray(activeFilters.colour)
        ? activeFilters.colour
        : [activeFilters.colour];
        
      const hasMatch = selectedColors.some(color => {
        const c = color.toLowerCase();
        if (typeof listing.colour === 'object' && listing.colour !== null) {
          return listing.colour[color] || listing.colour[c];
        }
        return (listing.colour || "").toLowerCase().includes(c);
      });
      
      if (!hasMatch) return false;
    }
    if (activeFilters.color && activeFilters.color !== "All" && activeFilters.color !== "") {
      const selectedColors = Array.isArray(activeFilters.color)
        ? activeFilters.color
        : [activeFilters.color];
        
      const hasMatch = selectedColors.some(color => {
        const c = color.toLowerCase();
        if (typeof listing.colour === 'object' && listing.colour !== null) {
          return listing.colour[color] || listing.colour[c];
        }
        return (listing.colour || "").toLowerCase().includes(c);
      });
      
      if (!hasMatch) return false;
    }
    if (activeFilters.culture && activeFilters.culture !== "All" && activeFilters.culture !== "") {
      if (!listing.culture || !listing.culture.toLowerCase().includes(activeFilters.culture.toLowerCase())) return false;
    }
    if (activeFilters.style && activeFilters.style !== "All" && activeFilters.style !== "") {
      const selectedStyles = Array.isArray(activeFilters.style)
        ? activeFilters.style
        : [activeFilters.style];
        
      const theme = listing.details || listing.style || "";
      const hasMatch = selectedStyles.some(style => 
        theme.toLowerCase().includes(style.toLowerCase())
      );
      
      if (!hasMatch) return false;
    }
    if (activeFilters.designTheme && activeFilters.designTheme !== "All" && activeFilters.designTheme !== "") {
      const theme = listing.details || listing.style || "";
      if (!theme.toLowerCase().includes(activeFilters.designTheme.toLowerCase())) return false;
    }
    if (activeFilters.custom && activeFilters.custom !== "All" && activeFilters.custom !== "") {
      const selectedCustom = Array.isArray(activeFilters.custom)
        ? activeFilters.custom
        : [activeFilters.custom];
        
      const features = listing.features || "";
      const hasMatch = selectedCustom.some(cust => 
        features.toLowerCase().includes(cust.toLowerCase())
      );
      
      if (!hasMatch) return false;
    }
    if (activeFilters.minPrice && activeFilters.minPrice !== "Min Price" && activeFilters.minPrice !== "") {
      const min = parsePrice(activeFilters.minPrice);
      if (!listing.price || parsePrice(listing.price) < min) return false;
    }
    if (activeFilters.maxPrice && activeFilters.maxPrice !== "Max Price" && activeFilters.maxPrice !== "") {
      const max = parsePrice(activeFilters.maxPrice);
      if (!listing.price || parsePrice(listing.price) > max) return false;
    }
    if (activeFilters.slabStyle && activeFilters.slabStyle !== "All" && activeFilters.slabStyle !== "") {
      const selectedSlabStyles = Array.isArray(activeFilters.slabStyle)
        ? activeFilters.slabStyle
        : [activeFilters.slabStyle];
        
      const slabStyle = listing.slabStyle || "";
      const hasMatch = selectedSlabStyles.some(style => 
        slabStyle.toLowerCase().includes(style.toLowerCase())
      );
      
      if (!hasMatch) return false;
    }
    return true;
  });

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
        onMobileFilterClick={() => setMobileFilterOpen(true)}
        autoHideOnScroll={true}
      />

      <MobileFilterTags activeFilters={activeFilters} setActiveFilters={setActiveFilters} />
      
      <MobileResultsBar 
        count={(!enableQueries || loading) && typeof activeCategoryAggCount === "number" ? activeCategoryAggCount : filteredListings.length} 
        onSortClick={() => setShowSortDropdown(true)}
        onFilterClick={() => setMobileFilterOpen(true)}
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
        <div className="fixed inset-0 z-50 bg-white flex flex-col sm:hidden">
          <div className="flex justify-between items-center p-4 border-b border-gray-200 bg-white sticky top-0 z-10">
            <span className="font-bold text-lg">Filters</span>
            <button
              className="p-2 rounded-full hover:bg-gray-100 touch-manipulation"
              onClick={() => setMobileFilterOpen(false)}
              aria-label="Close Filters"
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
            handleSearch={handleSearch}
            getActiveCategory={getActiveCategory}
            showCategoryDropdown={true}
            locationsData={locationHierarchy}
          />
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
            <div className="w-full md:w-1/4 hidden sm:block md:sticky md:top-0 md:self-start">
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
          />
            </div>

            <div className="w-full md:w-3/4">
              <div className="hidden sm:flex justify-between items-center mt-3 sm:mt-4 mb-4 bg-gray-100 rounded px-4 py-2 shadow-sm">
                <p className="text-gray-600">
                  {filteredListings.length === 0 && !((!enableQueries || loading) && typeof activeCategoryAggCount === "number")
                    ? `No results found for your filters.`
                    : (!enableQueries || loading) && typeof activeCategoryAggCount === "number"
                    ? `${activeCategoryAggCount} Listings For Sale`
                    : filteredListings.length === allListings.length
                    ? `${allListings.length} Listings For Sale`
                    : `${filteredListings.length} Results (of ${allListings.length})`}
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
                   
                    {listings?.filter(l => l.isFeatured).length > 0
                      ? listings?.filter(l => l.isFeatured).slice(0, 3).map((product, index) => (
                          Array.isArray(product.branches) && product.branches.length > 0 ? (
                            product.branches.map((branch, branchIndex) => (
                              <div key={`${product.documentId || product.id}-${branch.documentId || branch.id || branchIndex}`} className="flex-shrink-0 w-64 snap-start">
                                <FeaturedListings listing={{...product, currentBranch: branch}} />
                              </div>
                            ))
                          ) : (
                            <div key={product.id || index} className="flex-shrink-0 w-64 snap-start">
                              <FeaturedListings listing={product} />
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
                  {listings?.filter(l => l.isFeatured).length > 0
                    ? listings?.filter(l => l.isFeatured).slice(0, 3).map((product, index) => (
                        <FeaturedListings key={product.id || index} listing={product} />
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
                      {paginatedListings.length === 0 ? (
                        <div className="text-center text-gray-500 py-8">No tombstones found for your selected filters.</div>
                      ) : (
                        paginatedListings.map((listing) => (
                          <PremiumListingCard compact={true} key={listing.documentId} listing={listing} href={`/tombstones-for-sale/${listing.documentId || listing.id}`} onPrimaryClick={(e) => handleListingPrimaryClick(listing, e)} />
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
