
export const DEFAULT_PROVINCES = [
  "Any",
  "Gauteng",
  "Western Cape",
  "KwaZulu-Natal",
  "Eastern Cape",
  "Free State",
  "Limpopo",
  "Northern Cape",
  "Mpumalanga",
  "North West"
];

// Helper: normalize province name for consistent lookups
export const normalizeProvince = (name) =>
  (name || '').replace(/_/g, ' ').toLowerCase().trim().replace(/\s+/g, ' ');

// Helper: proper capitalization for city/town names
export const toTitleCase = (str) => {
  if (!str) return '';
  return str.toLowerCase().replace(/(?:^|[\s-'])(\w)/g, (match) => match.toUpperCase());
};

// Helper: Normalize specific city names to match hierarchy conventions
export const normalizeCityName = (name) => {
  if (!name) return name;
  const raw = name.trim();
  const key = raw.toLowerCase();
  
  if (key === 'new castle' || key === 'newcastle') return 'Newcastle';
  if (key === 'eshawe' || key === 'ehowa' || key === 'eshowe') return 'Eshowe';
  if (key.startsWith('umlazi')) return 'Umlazi';
  
  // Default to Title Case
  return toTitleCase(raw);
};

// Province synonyms to match common abbreviations and variants
export const provinceSynonyms = {
  'gauteng': ['gauteng', 'gp', 'johannesburg', 'jhb', 'pretoria', 'centurion', 'sandton', 'midrand', 'soweto', 'randburg', 'roodepoort', 'krugersdorp', 'benoni', 'boksburg', 'kempton park', 'alberton', 'germiston', 'springs', 'brakpan', 'vanderbijlpark', 'vereeniging', 'meyerton', 'heidelberg', 'bronkhorstspruit', 'cullinan', 'hammanskraal'],
  'western cape': ['western cape', 'wc', 'cape town', 'ct', 'stellenbosch', 'paarl', 'george', 'knysna', 'mossel bay', 'worcester', 'hermanus', 'oudtshoorn', 'bellville', 'durbanville', 'somerset west', 'strand', 'gordons bay', 'fish hoek', 'simons town', 'houte bay', 'camps bay', 'sea point', 'milnerton', 'table view', 'bloubergstrand', 'brackenfell', 'kraaifontein', 'kuils river', 'goodwood', 'parow'],
  'kwazulu-natal': ['kwazulu-natal', 'kwazulu natal', 'kzn', 'durban', 'pietermaritzburg', 'pmb', 'richards bay', 'uvongo', 'kwamashu', 'newcastle', 'port shepstone', 'amanzimtoti', 'ballito', 'empangeni', 'esikhawini', 'estcourt', 'hillcrest', 'howick', 'kokstad', 'ladysmith', 'margate', 'mtunzini', 'phoenix', 'pinetown', 'pongola', 'port edward', 'scottburgh', 'stanger', 'kwadukuza', 'tongaat', 'ulundi', 'umhlanga', 'umdloti', 'umkomaas', 'underberg', 'verulam', 'vryheid', 'westville', 'kloof', 'chatsworth', 'umlazi', 'dalton', 'greytown', 'mooi river', 'dundee', 'glencoe', 'paulpietersburg', 'ehowa', 'mandini', 'mtubatuba', 'st lucia', 'hluhluwe', 'melmoth', 'eshawe', 'nkandla', 'ixopo', 'richmond', 'wartburg', 'harding', 'hibberdene', 'shelly beach', 'ramsia', 'southbroom', 'port edward'],
  'eastern cape': ['eastern cape', 'ec', 'port elizabeth', 'pe', 'gqeberha', 'east london', 'el', 'mtatha', 'grahamstown', 'makhanda', 'uitenhage', 'kariega', 'king williams town', 'qonce', 'jeffreys bay', 'graaff-reinet', 'cradock', 'aliwal north', 'queenstown', 'komani', 'butterworth', 'mnquma'],
  'free state': ['free state', 'fs', 'bloemfontein', 'welkom', 'sasolburg', 'kroonstad', 'bethlehem', 'harrismith', 'ficksburg', 'parys', 'virginia', 'odendaalsrus', 'phuthaditjhaba'],
  'north west': ['north west', 'nw', 'rustenburg', 'mahikeng', 'mafikeng', 'klerksdorp', 'potchefstroom', 'brits', 'lichtenburg', 'vryburg', 'orkney', 'stilfontein', 'fiesland'],
  'limpopo': ['limpopo', 'lp', 'polokwane', 'tzaneen', 'mokopane', 'thohoyandou', 'louis trichardt', 'phalaborwa', 'bela-bela', 'warmbaths', 'modimolle', 'nylstroom', 'lephalale', 'ellisras', 'musina'],
  'mpumalanga': ['mpumalanga', 'mp', 'nelspruit', 'mbombela', 'witbank', 'emalahleni', 'middelburg', 'secunda', 'ermelo', 'standerton', 'piet retief', 'barberton', 'white river', 'lydenburg', 'mashishing', 'malelane', 'komatipoort'],
  'northern cape': ['northern cape', 'nc', 'kimberley', 'upington', 'springbok', 'kuruman', 'de aar', 'kathu', 'postmasburg', 'calvinia', 'colesberg']
};

// Helper function to get coordinates for major South African provinces (normalized keys)
export const getCityCoordinates = (cityName) => {
  const byProvince = {
    'gauteng': { lat: -26.2041, lng: 28.0473 },
    'western cape': { lat: -33.9249, lng: 18.4241 },
    'kwazulu-natal': { lat: -29.8587, lng: 31.0218 },
    'eastern cape': { lat: -32.2968, lng: 26.4194 },
    'free state': { lat: -28.4545, lng: 26.7968 },
    'mpumalanga': { lat: -25.4753, lng: 30.9694 },
    'limpopo': { lat: -23.4013, lng: 29.4179 },
    'north west': { lat: -25.4753, lng: 25.4753 },
    'northern cape': { lat: -30.5595, lng: 22.9375 },
  };
  const key = normalizeProvince(cityName);
  return byProvince[key] || null;
};

export const matchesProvince = (companyLocation, selectedProvince) => {
  if (!companyLocation || !selectedProvince) return false;
  
  // Normalize both inputs to ensure consistent matching
  const normalizedLoc = normalizeProvince(companyLocation);
  const key = normalizeProvince(selectedProvince);
  
  // Direct match check (e.g. "north west" === "north west")
  if (normalizedLoc === key) return true;
  
  // Get synonyms for the selected province
  const terms = provinceSynonyms[key] || (key ? [key] : []);
  
  if (!terms.length) return normalizedLoc.includes(key);
  
  // Check if any synonym matches the normalized location
  // We check both directions to handle partial matches safely
  return terms.some(term => normalizedLoc.includes(term) || (normalizedLoc.length > 2 && term.includes(normalizedLoc)));
};

// Helper to check if listing matches location (strictly checks branch locations)
export const checkListingLocation = (listing, locationFilter) => {
  if (!locationFilter || locationFilter === 'Any' || (Array.isArray(locationFilter) && locationFilter.length === 0)) return true;
  
  const filters = Array.isArray(locationFilter) ? locationFilter : [locationFilter];

  return filters.some(filter => {
    if (filter === 'Any') return true;
    
    // Normalize filter for city/town matching
    const normFilter = normalizeCityName(filter).toLowerCase().trim();
    
    let matchFound = false;

    // Check branches first
    if (Array.isArray(listing?.branches) && listing.branches.length > 0) {
      const branchMatch = listing.branches.some(branch => {
        // Use matchesProvince for the province field
        const pMatch = matchesProvince(branch?.location?.province, filter);
        
        // Normalize city/town for comparison
        const c = normalizeCityName(branch?.location?.city || "").toLowerCase();
        const t = normalizeCityName(branch?.location?.town || "").toLowerCase();
        const filterLower = filter.toLowerCase().trim();
        
        return pMatch || c === filterLower || t === filterLower;
      });
      if (branchMatch) matchFound = true;
    }

    // Check new system branch_listings
    if (!matchFound && Array.isArray(listing?.branch_listings) && listing.branch_listings.length > 0) {
       const blMatch = listing.branch_listings.some(bl => {
          const branch = bl.branch;
          if (!branch?.location) return false;

          const pMatch = matchesProvince(branch.location.province, filter);
          const c = normalizeCityName(branch.location.city || "").toLowerCase();
          const t = normalizeCityName(branch.location.town || "").toLowerCase();
          const filterLower = filter.toLowerCase().trim();
          
          return pMatch || c === filterLower || t === filterLower;
       });
       if (blMatch) matchFound = true;
    }
    
    // If no match found in branches (or no branches), check company location as fallback
    if (!matchFound) {
       // Check if company location matches normalized filter OR province synonyms
       const compLoc = listing.company?.location || "";
       
       // Use raw filter for province matching (matchesProvince handles normalization)
       // Use lowercase filter for string inclusion
       const filterLower = filter.toLowerCase().trim();
       
       // 1. Try matching as a province (using synonyms)
       if (matchesProvince(compLoc, filter)) {
           matchFound = true;
       } 
       // 2. Try matching as a direct city/town inclusion
       else {
           // We normalize the company location string but also check the raw string
           // e.g. "Rustenburg, North West"
           const rawCompLoc = compLoc.toLowerCase();
           const normCompLoc = normalizeCityName(compLoc).toLowerCase();
           
           // Check if the filter string exists in the location string
           // e.g. filter "rustenburg" in "rustenburg, north west" -> true
           if (rawCompLoc.includes(filterLower) || normCompLoc.includes(filterLower)) {
               matchFound = true;
           }
       }
    }
    
    return matchFound;
  });
};
