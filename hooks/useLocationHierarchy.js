import { useMemo } from 'react';
import { 
  normalizeProvince, 
  provinceSynonyms, 
  getCityCoordinates, 
  DEFAULT_PROVINCES 
} from '@/lib/locationHelpers';

export function useLocationHierarchy(allListings, categories, activeTab) {
  return useMemo(() => {
    const hierarchy = {};
    
    // Initialize with Any
    hierarchy['any'] = { name: 'Any', count: 0, cities: {} };

    // Determine relevant listings based on current category (activeTab)
    let relevantListings = allListings;
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
      const selectedCategoryObj = sortedCategories[activeTab];
      
      if (selectedCategoryObj) {
        relevantListings = allListings.filter(listing => 
          (listing?.listing_category?.name || "").toLowerCase() === selectedCategoryObj.name.toLowerCase()
        );
      }
    }

    if (Array.isArray(relevantListings)) {
      relevantListings.forEach(listing => {
        const visited = {
          provinces: new Set(),
          cities: new Set(),
          towns: new Set()
        };

        // Strict: Only use branches for location options
        if (Array.isArray(listing.branches)) {
          listing.branches.forEach(branch => {
            const loc = branch.location;
            if (loc?.province) {
               let provKey = normalizeProvince(loc.province);
               
               // Try to map to canonical province if it's a synonym
               for (const [canonical, synonyms] of Object.entries(provinceSynonyms)) {
                  if (synonyms.includes(provKey)) {
                    provKey = canonical;
                    break;
                  }
               }

               // Add province if not exists
               if (!hierarchy[provKey]) {
                 const niceName = DEFAULT_PROVINCES.find(p => normalizeProvince(p) === provKey) || loc.province.trim();
                 hierarchy[provKey] = { name: niceName, count: 0, cities: {} };
               }

               // Increment province count
               if (!visited.provinces.has(provKey)) {
                 hierarchy[provKey].count += 1;
                 visited.provinces.add(provKey);
               }
               
               if (loc.city) {
                 let cityRaw = loc.city.trim();
                 let cityKey = String(cityRaw).toLowerCase();
                 let townRaw = loc.town ? loc.town.trim() : null;

                 // Metro grouping
                 const metros = ['durban', 'cape town', 'johannesburg', 'pretoria', 'bloemfontein', 'port elizabeth', 'east london'];
                 
                 for (const metro of metros) {
                    if (cityKey !== metro && cityKey.startsWith(metro + ' ')) {
                        if (!townRaw) {
                            townRaw = cityRaw; 
                            cityRaw = metro.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
                            cityKey = metro;
                        }
                    }
                 }

                 if (!hierarchy[provKey].cities[cityKey]) {
                   hierarchy[provKey].cities[cityKey] = { name: cityRaw, count: 0, towns: {} };
                 }
                 
                 // Increment city count
                 if (!visited.cities.has(cityKey)) {
                   hierarchy[provKey].cities[cityKey].count += 1;
                   visited.cities.add(cityKey);
                 }
                 
                 if (townRaw) {
                   const townKey = townRaw.toLowerCase();
                   if (!hierarchy[provKey].cities[cityKey].towns[townKey]) {
                      hierarchy[provKey].cities[cityKey].towns[townKey] = { name: townRaw, count: 0 };
                   }

                   // Increment town count
                   if (!visited.towns.has(townKey)) {
                     hierarchy[provKey].cities[cityKey].towns[townKey].count += 1;
                     visited.towns.add(townKey);
                   }
                 }
               }
            }
          });
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
    })).sort((a, b) => {
      if (a.name === 'Any') return -1;
      if (b.name === 'Any') return 1;
      return a.name.localeCompare(b.name);
    });
  }, [allListings, activeTab, categories]);
}
