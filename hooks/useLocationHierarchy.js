import { useMemo } from 'react';
import { 
  normalizeProvince, 
  provinceSynonyms, 
  getCityCoordinates, 
  DEFAULT_PROVINCES,
  matchesProvince,
  toTitleCase,
  normalizeCityName
} from '@/lib/locationHelpers';

export function useLocationHierarchy(allListings, categories, activeTab) {
  return useMemo(() => {
    const hierarchy = {};
    
    // Initialize with Any
    hierarchy['any'] = { name: 'Any', count: 0, cities: {} };

    // Initialize all default provinces with 0 count
    DEFAULT_PROVINCES.forEach(prov => {
      if (prov === 'Any') return;
      const provKey = normalizeProvince(prov);
      hierarchy[provKey] = { name: prov, count: 0, cities: {} };
    });

    // Determine relevant listings based on current category (activeTab)
    let relevantListings = allListings;
    let selectedCategoryObj = null;

    if (Array.isArray(allListings) && categories && categories.length > 0 && activeTab !== undefined) {
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
      selectedCategoryObj = sortedCategories[activeTab];
      
      if (selectedCategoryObj) {
        relevantListings = allListings.filter(listing => 
          (listing?.listing_category?.name || "").toLowerCase() === selectedCategoryObj.name.toLowerCase()
        );
      }
    }

    if (Array.isArray(relevantListings)) {
      // Debug logging
      console.log(`[useLocationHierarchy] Processing ${relevantListings.length} listings for category: ${selectedCategoryObj?.name || 'All'}`);
      
      relevantListings.forEach(listing => {
        const visited = {
          provinces: new Set(),
          cities: new Set(),
          towns: new Set()
        };
        let hasProvinceFromBranches = false;

        if (Array.isArray(listing.branches)) {
          listing.branches.forEach(branch => {
            const loc = branch.location;
            if (loc?.province) {
               let provKey = normalizeProvince(loc.province);
               
               for (const [canonical, synonyms] of Object.entries(provinceSynonyms)) {
                  if (synonyms.includes(provKey)) {
                    provKey = canonical;
                    break;
                  }
               }

               if (!hierarchy[provKey]) {
                 const niceName = DEFAULT_PROVINCES.find(p => normalizeProvince(p) === provKey) || toTitleCase(loc.province.trim());
                 hierarchy[provKey] = { name: niceName, count: 0, cities: {} };
               }

               if (!visited.provinces.has(provKey)) {
                 hierarchy[provKey].count += 1;
                 visited.provinces.add(provKey);
                 hasProvinceFromBranches = true;
               }
               
               if (loc.city) {
                 // Use centralized normalization
                 let cityRaw = normalizeCityName(loc.city);
                 let cityKey = String(cityRaw).toLowerCase();
                 let townRaw = loc.town ? toTitleCase(loc.town.trim()) : null;

                 const metros = ['durban', 'cape town', 'johannesburg', 'pretoria', 'bloemfontein', 'port elizabeth', 'east london'];
                 
                 for (const metro of metros) {
                    if (cityKey !== metro && cityKey.startsWith(metro + ' ')) {
                        // Extract suburb/town part from city name (e.g. "North" from "Durban North")
                        const suburbPart = cityRaw.substring(metro.length).trim();
                        
                        if (!townRaw) {
                            townRaw = suburbPart;
                        } else {
                            // If town already exists, keep it but normalize city to metro parent
                            // Only append if not redundant
                            if (!townRaw.toLowerCase().includes(suburbPart.toLowerCase())) {
                                townRaw = `${suburbPart} - ${townRaw}`;
                            }
                        }
                        cityRaw = toTitleCase(metro);
                        cityKey = metro;
                    }
                 }

                 if (!hierarchy[provKey].cities[cityKey]) {
                   hierarchy[provKey].cities[cityKey] = { name: cityRaw, count: 0, towns: {} };
                 }
                 
                 if (!visited.cities.has(cityKey)) {
                   hierarchy[provKey].cities[cityKey].count += 1;
                   visited.cities.add(cityKey);
                 }
                 
                 if (townRaw) {
                   const townKey = townRaw.toLowerCase();
                   if (!hierarchy[provKey].cities[cityKey].towns[townKey]) {
                      hierarchy[provKey].cities[cityKey].towns[townKey] = { name: townRaw, count: 0 };
                   }

                   if (!visited.towns.has(townKey)) {
                     hierarchy[provKey].cities[cityKey].towns[townKey].count += 1;
                     visited.towns.add(townKey);
                   }
                 }
               }
            }
          });
        }

        if (!hasProvinceFromBranches && listing?.company?.location) {
          const companyLocation = listing.company.location;
          let matchedProvKey = null;

          for (const prov of DEFAULT_PROVINCES) {
            if (prov === 'Any') continue;
            if (matchesProvince(companyLocation, prov)) {
              matchedProvKey = normalizeProvince(prov);
              break;
            }
          }

          if (matchedProvKey) {
            if (!hierarchy[matchedProvKey]) {
              const niceName = DEFAULT_PROVINCES.find(p => normalizeProvince(p) === matchedProvKey) || toTitleCase(companyLocation.trim());
              hierarchy[matchedProvKey] = { name: niceName, count: 0, cities: {} };
            }
            if (!visited.provinces.has(matchedProvKey)) {
              hierarchy[matchedProvKey].count += 1;
              visited.provinces.add(matchedProvKey);
            }
          }
        }
      });
    }

    // Convert to array structure for FilterDropdown
    return Object.values(hierarchy).map(prov => ({
      name: prov.name,
      count: prov.count,
      lat: getCityCoordinates(prov.name)?.lat,
      lng: getCityCoordinates(prov.name)?.lng,
      cities: Object.values(prov.cities).map(city => ({
        name: city.name,
        count: city.count,
        towns: Object.values(city.towns).sort((a, b) => a.name.localeCompare(b.name))
      })).sort((a, b) => a.name.localeCompare(b.name))
    }))
    // Filter out provinces with 0 count, but always keep 'Any'
    .filter(prov => prov.name === 'Any' || prov.count > 0)
    .sort((a, b) => {
      if (a.name === 'Any') return -1;
      if (b.name === 'Any') return 1;
      return a.name.localeCompare(b.name);
    });
  }, [allListings, activeTab, categories]);
}
