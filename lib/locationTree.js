import { 
  normalizeProvince, 
  provinceSynonyms, 
  getCityCoordinates, 
  DEFAULT_PROVINCES,
  matchesProvince,
  toTitleCase,
  normalizeCityName
} from '@/lib/locationHelpers';

/**
 * Builds a hierarchical location tree from listings
 * @param {Array} listings - Array of listing objects (with branches)
 * @returns {Array} - Hierarchical location data for FilterDropdown
 */
export function buildLocationTree(listings) {
  if (!Array.isArray(listings)) return [];

  const hierarchy = {};
  
  // Initialize with Any
  hierarchy['any'] = { name: 'Any', count: 0, cities: {} };

  // Initialize all default provinces with 0 count
  DEFAULT_PROVINCES.forEach(prov => {
    if (prov === 'Any') return;
    const provKey = normalizeProvince(prov);
    hierarchy[provKey] = { name: prov, count: 0, cities: {} };
  });

  // Process listings
  listings.forEach(listing => {
    const visited = {
      provinces: new Set(),
      cities: new Set(),
      towns: new Set()
    };
    let hasProvinceFromBranches = false;

    // Check branches
    if (Array.isArray(listing.branches)) {
      listing.branches.forEach(branch => {
        const loc = branch.location;
        if (loc?.province) {
           let provKey = normalizeProvince(loc.province);
           
           // Handle synonyms
           for (const [canonical, synonyms] of Object.entries(provinceSynonyms)) {
              if (synonyms.includes(provKey)) {
                provKey = canonical;
                break;
              }
           }

           // Create province entry if missing (should be initialized, but for safety)
           if (!hierarchy[provKey]) {
             const niceName = DEFAULT_PROVINCES.find(p => normalizeProvince(p) === provKey) || toTitleCase(loc.province.trim());
             hierarchy[provKey] = { name: niceName, count: 0, cities: {} };
           }

           // Increment province count (once per listing per province)
           if (!visited.provinces.has(provKey)) {
             hierarchy[provKey].count += 1;
             visited.provinces.add(provKey);
             hasProvinceFromBranches = true;
           }
           
           if (loc.city) {
             // Normalize city
             let cityRaw = normalizeCityName(loc.city);
             let cityKey = String(cityRaw).toLowerCase();
             let townRaw = loc.town ? toTitleCase(loc.town.trim()) : null;

             // Handle metros and suburbs
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
             
             // Increment city count (once per listing per city)
             if (!visited.cities.has(cityKey)) {
               hierarchy[provKey].cities[cityKey].count += 1;
               visited.cities.add(cityKey);
             }
             
             if (townRaw) {
               const townKey = townRaw.toLowerCase();
               if (!hierarchy[provKey].cities[cityKey].towns[townKey]) {
                  hierarchy[provKey].cities[cityKey].towns[townKey] = { name: townRaw, count: 0 };
               }

               // Increment town count (once per listing per town)
               if (!visited.towns.has(townKey)) {
                 hierarchy[provKey].cities[cityKey].towns[townKey].count += 1;
                 visited.towns.add(townKey);
               }
             }
           }
        }
      });
    }

    // Fallback to company location if no branches found
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

  // Convert to array structure for FilterDropdown
  const result = Object.values(hierarchy)
    .filter(prov => prov.name !== 'Any' && prov.count > 0) // Only return provinces with counts
    .map(prov => ({
      name: prov.name,
      count: prov.count,
      cities: Object.values(prov.cities).map(city => ({
        name: city.name,
        count: city.count,
        towns: Object.values(city.towns).map(town => ({
          name: town.name,
          count: town.count
        })).sort((a, b) => a.name.localeCompare(b.name))
      })).sort((a, b) => a.name.localeCompare(b.name))
    }))
    .sort((a, b) => a.name.localeCompare(b.name));
    
  // console.log('Location Tree Result:', result.map(r => `${r.name} (${r.count})`));
  return result;
}
