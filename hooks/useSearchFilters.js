import { useState, useEffect, useMemo, useCallback } from 'react';
import { useApolloClient } from '@apollo/client';
import { 
  GET_LISTINGS, 
  GET_BRANCH_LISTINGS, 
  GET_LOCATION_LISTINGS 
} from '@/graphql/queries/filterQueries';
import { provinceSynonyms, toTitleCase } from '@/lib/locationHelpers';

// --- usePagedQuery Hook ---
const usePagedQuery = (query, keyName) => {
  const client = useApolloClient();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let isMounted = true;
    const fetchData = async () => {
      let allItems = [];
      let page = 1;
      let hasMore = true;

      try {
        while (hasMore) {
          const { data: queryData } = await client.query({
            query,
            variables: { pageSize: 100, page },
            fetchPolicy: 'cache-first', 
          });

          const items = queryData[keyName];

          if (!items || items.length < 100) {
            hasMore = false;
          }
          
          if (items) {
            allItems = [...allItems, ...items];
          }
          page++;
        }
        if (isMounted) {
            setData(allItems);
            setLoading(false);
        }
      } catch (err) {
        console.error(`Error fetching ${keyName}:`, err);
        if (isMounted) {
            setError(err);
            setLoading(false);
        }
      }
    };

    fetchData();

    return () => { isMounted = false; };
  }, [query, keyName, client]);

  return { items: data, loading, error };
};

// --- Specialized Hooks ---
const useListings = () => usePagedQuery(GET_LISTINGS, 'listings');
const useBranchListings = () => usePagedQuery(GET_BRANCH_LISTINGS, 'branchListings');
const useLocationListings = () => usePagedQuery(GET_LOCATION_LISTINGS, 'locationListings');

// --- Main Filter Hook ---
export function useSearchFilters(initialFilters = {}) {
  const { items: listings, loading: loadingListings } = useListings();
  const { items: branchListings, loading: loadingBranchListings } = useBranchListings();
  const { items: locationListings, loading: loadingLocationListings } = useLocationListings();

  // Helper: Normalize ID to string for Sets
  const getId = (item) => String(item.documentId || item.id);

  const getProvinceName = useCallback((str) => {
    if (!str) return "Unknown";
    const lower = str.toLowerCase().trim();
    // Special handling for hyphenated or specific names
    if (lower === 'kwazulu-natal' || lower === 'kzn' || lower === 'kwazulu_natal') return 'KwaZulu-Natal';
    if (lower === 'eastern cape') return 'Eastern Cape';
    if (lower === 'western cape') return 'Western Cape';
    if (lower === 'northern cape') return 'Northern Cape';
    if (lower === 'free state') return 'Free State';
    if (lower === 'north west' || lower === 'north_west') return 'North West';
    if (lower === 'gauteng') return 'Gauteng';
    if (lower === 'limpopo') return 'Limpopo';
    if (lower === 'mpumalanga') return 'Mpumalanga';
    
    // Default title casing
    return toTitleCase(lower);
  }, []);

  const findProvince = useCallback((loc) => {
      if (!loc) return "Unknown";
      const normalized = loc.toLowerCase().trim();
      
      // Check synonyms
      for (const [prov, synonyms] of Object.entries(provinceSynonyms)) {
          // Check if the location string matches the province key itself
          if (normalized === prov) return getProvinceName(prov);
          
          // Check if any synonym is found in the location string
          if (synonyms.some(s => normalized.includes(s) || s.includes(normalized))) {
               return getProvinceName(prov);
          }
      }
      return "Unknown";
  }, [getProvinceName]);

  // Combine location sources: legacy locationListings AND new branchListings AND direct listings
  const unifiedLocations = useMemo(() => {
    const combined = [];
    
    // 1. Add from locationListings (legacy/direct)
    locationListings.forEach(ll => {
      if(ll.listing) {
        combined.push({
          listingId: getId(ll.listing),
          province: getProvinceName(ll.province),
          city: toTitleCase(ll.city),
          town: toTitleCase(ll.town)
        });
      }
    });

    // 2. Add from branchListings (new system)
    branchListings.forEach(bl => {
      if(bl.listing && bl.branch?.location) {
        combined.push({
          listingId: getId(bl.listing),
          province: getProvinceName(bl.branch.location.province),
          city: toTitleCase(bl.branch.location.city),
          town: toTitleCase(bl.branch.location.town)
        });
      }
    });

    // 3. Add from direct listings (Relation & Company fallback)
    listings.forEach(l => {
        const lId = getId(l);
        
        // A. Direct Branches Relation
        if (Array.isArray(l.branches)) {
            l.branches.forEach(b => {
                if (b.location) {
                    combined.push({
                        listingId: lId,
                        province: getProvinceName(b.location.province),
                        city: toTitleCase(b.location.city),
                        town: toTitleCase(b.location.town)
                    });
                }
            });
        }

        // B. Company Location Fallback
        // Only if no branches found? Or always add company location as an option?
        // User said: "Company location (existing fallback)"
        // Let's add it. If it's a duplicate of a branch location, Set logic will handle it.
        if (l.company && l.company.location) {
            const locStr = l.company.location;
            const provName = findProvince(locStr);
            if (provName !== "Unknown") {
                // Try to extract city from location string if possible
                let city = "";
                const lowerLoc = locStr.toLowerCase();
                
                // Specific fix for "37 Esther Roberts Road, Glenwood, Durban , 4000, Durban, South Africa"
                if (lowerLoc.includes("durban")) {
                    city = "Durban";
                } else if (lowerLoc.includes("pinetown")) {
                    city = "Pinetown";
                } else if (lowerLoc.includes("empangeni")) {
                    city = "Empangeni";
                } else if (lowerLoc.includes("eshowe")) {
                    city = "Eshowe";
                } else if (lowerLoc.includes("newcastle")) {
                    city = "Newcastle";
                } else if (lowerLoc.includes("pietermaritzburg") || lowerLoc.includes("pmb")) {
                    city = "Pietermaritzburg";
                } else if (lowerLoc.includes("umlazi")) {
                    city = "Umlazi";
                } else if (lowerLoc.includes("richards bay")) {
                    city = "Richards Bay";
                } else if (lowerLoc.includes("greytown")) {
                    city = "Greytown";
                } else if (lowerLoc.includes("dalton")) {
                    city = "Dalton";
                } else if (lowerLoc.includes("bhamshela")) {
                    city = "Bhamshela";
                } else {
                    // Fallback: use the first part of the comma-separated string if it looks like a city, 
                    // or just title case the whole thing if short.
                    // But usually addresses are long.
                    // If address contains commas, maybe take the city part? 
                    // It's hard to parse reliably without a geocoder.
                    // For now, if we found the province, let's try to match against known cities in that province?
                    // Or just default to the Province name as the "City" bucket if we can't find a specific city?
                    // User request specifically mentioned cleaning up the long address.
                    
                    // Simple heuristic: check against known cities in our synonyms list for the found province
                    const synonyms = provinceSynonyms[provName.toLowerCase()];
                    if (synonyms) {
                        // Exclude province name and common abbreviations to avoid matching them as "City"
                        // e.g. "Rustenburg, North West" should match "Rustenburg", not "North West"
                        const citySynonyms = synonyms.filter(s => {
                            const p = provName.toLowerCase();
                            return s !== p && 
                                   s !== 'nw' && s !== 'gp' && s !== 'wc' && 
                                   s !== 'ec' && s !== 'fs' && s !== 'lp' && 
                                   s !== 'mp' && s !== 'nc' && s !== 'kzn' && 
                                   s !== 'kwazulu-natal';
                        });

                        const foundCity = citySynonyms.find(s => lowerLoc.includes(s));
                        if (foundCity) {
                            city = toTitleCase(foundCity);
                        } else {
                             // If no city found in synonyms, use the raw string but maybe truncated?
                             // Or just skip adding it if it's an address?
                             // User wants to merge it into "Durban".
                             city = toTitleCase(locStr.split(',')[0].trim());
                        }
                    } else {
                         city = toTitleCase(locStr.split(',')[0].trim());
                    }
                }

                if (city) {
                    combined.push({
                        listingId: lId,
                        province: provName,
                        city: city,
                        town: null
                    });
                }
            }
        }
    });

    return combined;
  }, [locationListings, branchListings, listings, findProvince, getProvinceName]);

  // 1. Filter Functions (Wrapped in useCallback to stabilize references)
  const filterByProduct = useCallback((filters) => {
    const matchingIds = new Set();
    
    listings.forEach(l => {
        const id = getId(l);
        let match = true;

        // Category (Strict)
        if (filters.category && filters.category !== 'Any') {
             const catName = l.listing_category?.name || "";
             if (catName.toLowerCase() !== filters.category.toLowerCase()) match = false;
        }

        // Text Search (Partial)
        if (match && filters.search) {
            const search = filters.search.toLowerCase();
            const title = (l.title || "").toLowerCase();
            if (!title.includes(search)) match = false;
        }

        // Attributes (Partial/Array)
        const checkAttribute = (attrKey, filterValue) => {
            if (!filterValue || filterValue === 'Any' || filterValue === 'All') return true;
            const values = l.productDetails?.[attrKey]?.map(v => v.value) || [];
            if (Array.isArray(filterValue)) {
                if (filterValue.length === 0) return true;
                return filterValue.some(fv => values.some(v => v.toLowerCase().includes(fv.toLowerCase())));
            }
            return values.some(v => v.toLowerCase().includes(String(filterValue).toLowerCase()));
        };

        if (match && !checkAttribute('color', filters.color || filters.colour)) match = false;
        if (match && !checkAttribute('style', filters.style)) match = false;
        if (match && !checkAttribute('stoneType', filters.stoneType)) match = false;
        if (match && !checkAttribute('slabStyle', filters.slabStyle)) match = false;
        if (match && !checkAttribute('customization', filters.customization || filters.custom)) match = false;

        if (match) matchingIds.add(id);
    });
    return matchingIds;
  }, [listings]);

  const filterByPrice = useCallback((filters) => {
      const hasMin = filters.minPrice && filters.minPrice !== 'Min Price';
      const hasMax = filters.maxPrice && filters.maxPrice !== 'Max Price';

      if (!hasMin && !hasMax) {
          // If no price filter is applied, return null to indicate "pass all"
          // This prevents excluding listings that might be missing from BranchListings
          return null;
      }

      const matchingIds = new Set();
      
      const parsePrice = (p) => {
        if (typeof p === 'number') return p;
        if (typeof p === 'string') return Number(p.replace(/[^0-9.]/g, ''));
        return 0;
      };

      const min = hasMin ? parsePrice(filters.minPrice) : 0;
      const max = hasMax ? parsePrice(filters.maxPrice) : Infinity;

      branchListings.forEach(bl => {
          if (!bl.listing) return;
          const price = parsePrice(bl.price);
          if (price >= min && price <= max) {
              matchingIds.add(getId(bl.listing));
          }
      });

      return matchingIds;
  }, [branchListings]);

  const filterByLocation = useCallback((filters) => {
      // Support both structured filters (province/city/town) AND generic 'location' filter
      const hasProv = filters.province && filters.province !== 'Any';
      const hasCity = filters.city && filters.city !== 'Any';
      const hasTown = filters.town && filters.town !== 'Any';
      
      // genericLoc can be a string OR an array of strings (for multi-select)
      let genericLoc = filters.location;
      if (genericLoc === 'Any' || (Array.isArray(genericLoc) && genericLoc.length === 0)) {
          genericLoc = null;
      }
      
      if (!hasProv && !hasCity && !hasTown && !genericLoc) {
           // Return all IDs present in unifiedLocations
           const allIds = new Set();
           unifiedLocations.forEach(ll => {
               if (ll.listingId) allIds.add(ll.listingId);
           });
           return allIds;
      }

      const matchingIds = new Set();

      unifiedLocations.forEach(ll => {
          if (!ll.listingId) return;
          let match = true;

          if (hasProv && ll.province !== filters.province) match = false;
          if (match && hasCity && ll.city !== filters.city) match = false;
          if (match && hasTown && ll.town !== filters.town) match = false;
          
          // If generic location is provided, check if it matches ANY level
          if (match && genericLoc) {
              const p = ll.province || "";
              const c = ll.city || "";
              const t = ll.town || "";
              
              // Normalize for comparison
              const normP = p.toLowerCase().trim();
              const normC = c.toLowerCase().trim();
              const normT = t.toLowerCase().trim();

              if (Array.isArray(genericLoc)) {
                  // If multi-select, check if ANY of the selected locations match the listing's location
                  const isMatch = genericLoc.some(loc => {
                      const normLoc = String(loc).toLowerCase().trim();
                      return normP === normLoc || normC === normLoc || normT === normLoc;
                  });
                  if (!isMatch) match = false;
              } else {
                  // Exact match on any level (case-insensitive)
                  const normLoc = String(genericLoc).toLowerCase().trim();
                  if (normP !== normLoc && normC !== normLoc && normT !== normLoc) {
                      match = false;
                  }
              }
          }

          if (match) matchingIds.add(ll.listingId);
      });

      return matchingIds;
  }, [unifiedLocations]);

  // Wrap computeFilteredResults in useCallback
  const computeFilteredResults = useCallback((filters) => {
      // If data is loading, return empty
      if (loadingListings || loadingBranchListings || loadingLocationListings) {
          return new Set();
      }

      const productSet = filterByProduct(filters);
      const priceSet = filterByPrice(filters);
      
      const hasLocationFilter = (filters.province && filters.province !== 'Any') || 
                                (filters.city && filters.city !== 'Any') || 
                                (filters.town && filters.town !== 'Any') ||
                                (filters.location && filters.location !== 'Any');

      const locationSet = hasLocationFilter ? filterByLocation(filters) : null;

      const finalIds = new Set();
      
      for (const id of productSet) {
          if (priceSet && !priceSet.has(id)) continue;
          if (locationSet && !locationSet.has(id)) continue;

          finalIds.add(id);
      }
      return finalIds;
  }, [loadingListings, loadingBranchListings, loadingLocationListings, filterByProduct, filterByPrice, filterByLocation]);
  
  // Wrap buildLocationTree in useCallback
  const buildLocationTree = useCallback((filteredIds) => {
      // Tree structure: { [Province]: { count, cities: { [City]: { count, towns: { [Town]: count } } } } }
      const tree = {};

      // We iterate over unifiedLocations, but only process those whose listingId is in filteredIds
      unifiedLocations.forEach(ll => {
          if (!ll.listingId) return;
          const id = ll.listingId;
          
          if (filteredIds.has(id)) {
              // Normalize province to ensure merging (e.g. Kwazulu-natal vs KwaZulu-Natal)
              const p = getProvinceName(ll.province || "Unknown");
              const c = ll.city;
              const t = ll.town;

              if (!tree[p]) tree[p] = { count: 0, cities: {}, listings: new Set() };
              
              if (!tree[p].listings.has(id)) {
                  tree[p].listings.add(id);
                  tree[p].count++;
              }

              if (c) {
                  // Normalize city if needed (though already title-cased in unifiedLocations)
                  if (!tree[p].cities[c]) tree[p].cities[c] = { count: 0, towns: {}, listings: new Set() };
                  
                  if (!tree[p].cities[c].listings.has(id)) {
                      tree[p].cities[c].listings.add(id);
                      tree[p].cities[c].count++;
                  }

                  if (t) {
                      if (!tree[p].cities[c].towns[t]) tree[p].cities[c].towns[t] = { count: 0, listings: new Set() };
                      
                      if (!tree[p].cities[c].towns[t].listings.has(id)) {
                          tree[p].cities[c].towns[t].listings.add(id);
                          tree[p].cities[c].towns[t].count++;
                      }
                  }
              }
          }
      });

      // console.log('Location Tree Keys:', Object.keys(tree));

      // Convert to array structure for FilterDropdown
      return Object.entries(tree).map(([provName, provData]) => ({
          name: provName,
          count: provData.count,
          cities: Object.entries(provData.cities).map(([cityName, cityData]) => ({
              name: cityName,
              count: cityData.count,
              towns: Object.entries(cityData.towns).map(([townName, townData]) => ({
                  name: townName,
                  count: townData.count
              })).sort((a, b) => a.name.localeCompare(b.name))
          })).sort((a, b) => a.name.localeCompare(b.name))
      })).sort((a, b) => a.name.localeCompare(b.name));
  }, [unifiedLocations]);

  return {
    loading: loadingListings || loadingBranchListings || loadingLocationListings,
    computeFilteredResults,
    buildLocationTree
  };
}
