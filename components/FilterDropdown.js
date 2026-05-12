"use client"

import { ChevronDown, ChevronRight, Check, Square, X } from "lucide-react"
import { useRef, useState, useEffect, useMemo } from "react"
import Image from "next/image"
import { ICON_PATHS } from "@/app/manufacturers/manufacturers-Profile-Page/update-listing/constants/updateListingConstants";
import { useApolloClient } from "@apollo/client";
import { LISTING_SEARCH_INDEX_CONNECTION_QUERY } from "@/graphql/queries";

// Helper function to fix icon paths
const fixIconPath = (path) => {
  if (!path) return path;
  // Replace any instances of spaces or incorrect formatting in paths
  let fixedPath = path;
  
  // Remove port number if present (like :3000)
  fixedPath = fixedPath.replace(/:\d+\//, '/');
  
  // Ensure path starts with a slash
  if (!fixedPath.startsWith('/')) {
    fixedPath = '/' + fixedPath;
  }
  
  // Fix common path issues
  fixedPath = fixedPath
    .replace('/last icons/', '/last_icons/')
    .replace('/Adv_vpe_Icon_', '/AdvertCreator_StoneType_Icons/AdvertCreator_StoneType_Icon_')
    .replace('/public/', '/')
    .replace('//', '/')
    .replace(/_Mausoleum\.svg$/i, '_Mausolean.svg');
  
  // Fix nested directory structure issues
  if (
    fixedPath.includes('/AdvertCreator_StoneType_Icons/') &&
    !fixedPath.includes('/AdvertCreator_StoneType_Icons/AdvertCreator_StoneType_Icons/')
  ) {
    fixedPath = fixedPath.replace('/AdvertCreator_StoneType_Icons/', '/AdvertCreator_StoneType_Icons/AdvertCreator_StoneType_Icons/');
  }
  
  if (
    fixedPath.includes('/AdvertCreator_Head_Style_Icons/') &&
    !fixedPath.includes('/AdvertCreator_Head_Style_Icons/AdvertCreator_Head_Style_Icons/')
  ) {
    fixedPath = fixedPath.replace('/AdvertCreator_Head_Style_Icons/', '/AdvertCreator_Head_Style_Icons/AdvertCreator_Head_Style_Icons/');
  }
  
  if (
    fixedPath.includes('/AdvertCreator_SlabStyle_Icons/') &&
    !fixedPath.includes('/AdvertCreator_SlabStyle_Icons/AdvertCreator_SlabStyle_Icons/')
  ) {
    fixedPath = fixedPath.replace('/AdvertCreator_SlabStyle_Icons/', '/AdvertCreator_SlabStyle_Icons/AdvertCreator_SlabStyle_Icons/');
  }
  
  if (
    fixedPath.includes('/AdvertCreator_Icons_Customisation_Icons/') &&
    !fixedPath.includes('/AdvertCreator_Icons_Customisation_Icons/AdvertCreator_Icons_Customisation_Icons/')
  ) {
    fixedPath = fixedPath.replace('/AdvertCreator_Icons_Customisation_Icons/', '/AdvertCreator_Icons_Customisation_Icons/AdvertCreator_Icons_Customisation_Icons/');
  }
  
  if (fixedPath.includes('/AdvertCreator_Colour_Icons/')) {
    // Make sure color icons always point to the correct subdirectory
    if (!fixedPath.includes('/6_Colour_Icons/')) {
      fixedPath = fixedPath.replace('/AdvertCreator_Colour_Icons/', '/AdvertCreator_Colour_Icons/6_Colour_Icons/');
    }
  }
    
  return fixedPath;
}

const bodyTypeIcons = {
  "Full Tombstone": "/MainMenu_Icons_Tombstone.svg",
  "Headstone": "/MainMenu_Icons_Head.svg",
  "Double Headstone": "/MainMenu_Icons_Double.svg",
  "Cremation Memorial": "/MainMenu_Icons_Cremation.svg",
  "Family Monument": "/MainMenu_Icons_Family.svg",
  "Child Memorial": "/MainMenu_Icons_Child.svg",
  "Custom Design": "/MainMenu_Icons_Premium.svg"
}

const slabStyleIcons = {
  "Curved Slab": "/Icons&Lay-By2026/7%20MAy/Slab%20Styles/Slab_White_Curved.svg",
  "Frame with Infill": "/Icons&Lay-By2026/7%20MAy/Slab%20Styles/Slab_White_FrameWithInfill.svg",
  "Full Slab": "/Icons&Lay-By2026/7%20MAy/Slab%20Styles/Slab_White_FullSlab.svg",
  "Glass Slab": "/Icons&Lay-By2026/7%20MAy/Slab%20Styles/Slab_White_Glass.svg",
  "Half Slab": "/Icons&Lay-By2026/7%20MAy/Slab%20Styles/Slab_White_HalfSlab.svg",
  "Stepped Slab": "/Icons&Lay-By2026/7%20MAy/Slab%20Styles/Slab_White_Stepped.svg",
  "Tiled Slab": "/Icons&Lay-By2026/7%20MAy/Slab%20Styles/Slab_White_Tiled.svg",
  "Double": "/last_icons/AdvertCreator_SlabStyle_Icons/AdvertCreator_SlabStyle_Icons_Double.svg",
}

const isEncodedLocationValue = (value) => typeof value === "string" && /^[pct]\|/.test(value);

const decodeLocationValue = (value) => {
  if (!isEncodedLocationValue(value)) return null;
  const parts = value.split("|").map((p) => p.trim());
  const level = parts[0];
  if (level === "p") return { level: "province", province: parts[1] || "" };
  if (level === "c") return { level: "city", province: parts[1] || "", city: parts[2] || "" };
  if (level === "t")
    return { level: "town", province: parts[1] || "", city: parts[2] || "", town: parts[3] || "" };
  return null;
};

const encodeLocationValue = ({ level, province, city, town }) => {
  if (level === "province") return `p|${province}`;
  if (level === "city") return `c|${province}|${city}`;
  return `t|${province}|${city}|${town}`;
};

const getLocationLabel = (value) => {
  const decoded = decodeLocationValue(value);
  if (!decoded) return value;
  if (decoded.level === "town") return decoded.town;
  if (decoded.level === "city") return decoded.city;
  return decoded.province;
};

const HierarchyItem = ({ item, level = 0, locationState, onSelect, selectedLocationTotal, shouldFetchCounts, getCount, ensureCount }) => {
  const [isOpen, setIsOpen] = useState(false);
  const hasChildren = item.cities && item.cities.length > 0;
  const isSelected = locationState?.isProvinceSelected?.(item.name);
  const isDisabled = locationState?.isProvinceDisabled?.(item.name);
  const paddingLeft = `${level * 16 + 12}px`;
  const encodedSelf = encodeLocationValue({ level: "province", province: item.name });
  useEffect(() => {
    if (!shouldFetchCounts) return;
    ensureCount(encodedSelf);
  }, [encodedSelf, ensureCount, shouldFetchCounts]);
  const fetched = getCount(encodedSelf);
  const displayCount =
    typeof fetched === "number"
      ? fetched
      : isSelected && typeof selectedLocationTotal === "number"
        ? selectedLocationTotal
        : shouldFetchCounts
          ? "..."
          : item.count || 0;

  const toggleOpen = (e) => {
    e.stopPropagation();
    setIsOpen(!isOpen);
  };

  return (
    <div>
      <div 
        className={`px-3 py-2 text-sm transition-colors flex justify-between items-center ${
          isDisabled ? "text-gray-500 cursor-not-allowed" : "text-gray-300 hover:bg-[#111111] hover:text-[#D4AF37] cursor-pointer"
        }`}
        style={{ paddingLeft }}
        onClick={() => {
          if (isDisabled) return;
          onSelect(encodeLocationValue({ level: "province", province: item.name }));
        }}
      >
        <div className="flex items-center gap-2">
          <div className={`h-4 w-4 flex items-center justify-center border border-gray-500 rounded ${isSelected ? 'bg-[#D4AF37] border-[#D4AF37]' : ''}`}>
             {isSelected && <Check className="h-3 w-3 text-white" />}
          </div>
          
          <span>{item.name} {item.name !== 'Any' && `(${displayCount})`}</span>
        </div>

        {hasChildren && (
          <div onClick={toggleOpen} className="p-1 hover:bg-gray-700 rounded cursor-pointer">
            {isOpen ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
          </div>
        )}
      </div>

      {isOpen && hasChildren && (
        <div>
          {item.cities.map((city, idx) => (
             <CityItem 
               key={idx} 
               city={city} 
               provinceName={item.name}
               level={level + 1} 
               locationState={locationState}
               onSelect={onSelect}
                selectedLocationTotal={selectedLocationTotal}
                shouldFetchCounts={shouldFetchCounts}
                getCount={getCount}
                ensureCount={ensureCount}
             />
          ))}
        </div>
      )}
    </div>
  );
};

const CityItem = ({ city, provinceName, level, locationState, onSelect, selectedLocationTotal, shouldFetchCounts, getCount, ensureCount }) => {
  const [isOpen, setIsOpen] = useState(false);
  const hasChildren = city.towns && city.towns.length > 0;
  // Hide dropdown if only 1 town and its name matches the city name
  const showTownsDropdown = hasChildren && !(city.towns.length === 1 && city.towns[0].name === city.name);
  const isSelected = locationState?.isCitySelected?.(provinceName, city.name);
  const isDisabled = locationState?.isCityDisabled?.(provinceName, city.name);
  const paddingLeft = `${level * 16 + 12}px`;
  const encodedSelf = encodeLocationValue({ level: "city", province: provinceName, city: city.name });
  useEffect(() => {
    if (!shouldFetchCounts) return;
    ensureCount(encodedSelf);
  }, [encodedSelf, ensureCount, shouldFetchCounts]);
  const fetched = getCount(encodedSelf);
  const displayCount =
    typeof fetched === "number"
      ? fetched
      : isSelected && typeof selectedLocationTotal === "number"
        ? selectedLocationTotal
        : shouldFetchCounts
          ? "..."
          : city.count || 0;

  const toggleOpen = (e) => {
    e.stopPropagation();
    setIsOpen(!isOpen);
  };

  return (
    <div>
      <div 
        className={`px-3 py-2 text-sm transition-colors flex justify-between items-center ${
          isDisabled ? "text-gray-500 cursor-not-allowed" : "text-gray-300 hover:bg-[#111111] hover:text-[#D4AF37] cursor-pointer"
        }`}
        style={{ paddingLeft }}
        onClick={() => {
          if (isDisabled) return;
          onSelect(encodeLocationValue({ level: "city", province: provinceName, city: city.name }));
        }}
      >
         <div className="flex items-center gap-2">
          <div className={`h-4 w-4 flex items-center justify-center border border-gray-500 rounded ${isSelected ? 'bg-[#D4AF37] border-[#D4AF37]' : ''}`}>
             {isSelected && <Check className="h-3 w-3 text-white" />}
          </div>
          
          <span>{city.name} ({displayCount})</span>
        </div>

        {showTownsDropdown && (
          <div onClick={toggleOpen} className="p-1 hover:bg-gray-700 rounded cursor-pointer">
            {isOpen ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
          </div>
        )}
      </div>

      {isOpen && showTownsDropdown && (
        <div>
          {city.towns.map((town, idx) => (
             <TownItem 
               key={idx} 
               town={town} 
               provinceName={provinceName}
               cityName={city.name}
               level={level + 1} 
               locationState={locationState}
               onSelect={onSelect}
               selectedLocationTotal={selectedLocationTotal}
               shouldFetchCounts={shouldFetchCounts}
               getCount={getCount}
               ensureCount={ensureCount}
             />
          ))}
        </div>
      )}
    </div>
  );
}

const TownItem = ({ town, provinceName, cityName, level, locationState, onSelect, selectedLocationTotal, shouldFetchCounts, getCount, ensureCount }) => {
  const isSelected = locationState?.isTownSelected?.(provinceName, cityName, town.name);
  const isDisabled = locationState?.isTownDisabled?.(provinceName, cityName);
  const paddingLeft = `${level * 16 + 12}px`; // No extra indentation needed as arrow is gone
  const encodedSelf = encodeLocationValue({ level: "town", province: provinceName, city: cityName, town: town.name });
  useEffect(() => {
    if (!shouldFetchCounts) return;
    ensureCount(encodedSelf);
  }, [encodedSelf, ensureCount, shouldFetchCounts]);
  const fetched = getCount(encodedSelf);
  const displayCount =
    typeof fetched === "number"
      ? fetched
      : isSelected && typeof selectedLocationTotal === "number"
        ? selectedLocationTotal
        : shouldFetchCounts
          ? "..."
          : town.count || 0;

  return (
    <div 
      className={`px-3 py-2 text-sm transition-colors flex justify-between items-center ${
        isDisabled ? "text-gray-500 cursor-not-allowed" : "text-gray-300 hover:bg-[#111111] hover:text-[#D4AF37] cursor-pointer"
      }`}
      style={{ paddingLeft }}
      onClick={() => {
        if (isDisabled) return;
        onSelect(
          encodeLocationValue({ level: "town", province: provinceName, city: cityName, town: town.name })
        );
      }}
    >
      <div className="flex items-center gap-2">
        <div className={`h-4 w-4 flex items-center justify-center border border-gray-500 rounded ${isSelected ? 'bg-[#D4AF37] border-[#D4AF37]' : ''}`}>
            {isSelected && <Check className="h-3 w-3 text-white" />}
        </div>
        <span>{town.name} ({displayCount})</span>
      </div>
    </div>
  );
}


export default function FilterDropdown({
  name,
  label,
  options,
  openDropdown,
  toggleDropdown,
  selectOption,
  filters,
  dropdownRefs,
  selectedLocationTotal,
  locationCountBaseFilters
}) {
  const SORTED_MENUS = new Set(["style", "overallStyle", "slabStyle", "stoneType", "colour", "custom"]);
  const MULTI_SELECT_MENUS = new Set(["style", "overallStyle", "slabStyle", "stoneType", "colour", "custom", "location"]);
  
  // Determine if this is a hierarchical option list (contains objects)
  const isHierarchical = options.length > 0 && typeof options[0] === 'object';
  
  // Determine if multi-select is allowed
  const isMultiSelect = MULTI_SELECT_MENUS.has(name);

  const displayOptions = (!isHierarchical && SORTED_MENUS.has(name))
    ? [...options].sort((a, b) => {
        // Always keep "Any" at the top
        if (a === "Any") return -1;
        if (b === "Any") return 1;
        return a.localeCompare(b, undefined, { sensitivity: "base" });
      })
    : options;

  // Get icon src from pre-encoded paths
  const getIconSrc = (menuName, option) => {
    let iconPath = null;
    if (typeof option !== 'string') return null;

    if (menuName === "bodyType" && bodyTypeIcons[option]) iconPath = bodyTypeIcons[option];
    if (menuName === "style") iconPath = ICON_PATHS?.style?.[option] || null;
    if (menuName === "overallStyle") iconPath = ICON_PATHS?.overallStyle?.[option] || null;
    if (menuName === "slabStyle") iconPath = slabStyleIcons[option] || ICON_PATHS?.slabStyle?.[option] || null;
    if (menuName === "stoneType") iconPath = ICON_PATHS?.stoneType?.[option] || null;
    if (menuName === "custom") iconPath = ICON_PATHS?.customization?.[option] || null;
    if (menuName === "colour") iconPath = ICON_PATHS?.color?.[option] || null;
    
    // Apply path fixing to ensure correct format
    const fixedPath = iconPath ? fixIconPath(iconPath) : null;
    
    return fixedPath;
  };

  const currentVal = filters[name];
  // Parse current selected values into an array
  const getSelectedValues = () => {
    if (!currentVal || ['Any', 'All', 'All Categories'].includes(currentVal)) return [];
    return Array.isArray(currentVal) ? currentVal : [currentVal];
  };
  
  const selectedValues = getSelectedValues();

  const apolloClient = useApolloClient();
  const [locationCountMap, setLocationCountMap] = useState({});
  const locationCountPendingRef = useRef(new Set());
  useEffect(() => {
    setLocationCountMap({});
    locationCountPendingRef.current = new Set();
  }, [locationCountBaseFilters]);

  const normalizeLower = (v) => (typeof v === "string" ? v.trim().toLowerCase() : "");
  const packedTokenVariants = (raw) => {
    const base = normalizeLower(raw);
    if (!base) return [];
    const kebab = base.replace(/[^a-z0-9]+/g, "-").replace(/-+/g, "-").replace(/^-|-$/g, "");
    const variants = new Set([base, kebab]);
    return Array.from(variants).filter(Boolean).map((v) => `|${v}|`);
  };

  const shouldFetchCounts =
    name === "location" &&
    isHierarchical &&
    openDropdown === "location" &&
    locationCountBaseFilters &&
    Array.isArray(locationCountBaseFilters.and);

  const getCount = (encoded) => {
    const v = locationCountMap?.[encoded];
    return typeof v === "number" ? v : null;
  };

  const ensureCount = useMemo(() => {
    return async (encoded) => {
      if (!shouldFetchCounts) return;
      if (!encoded || typeof encoded !== "string") return;
      if (typeof locationCountMap?.[encoded] === "number") return;
      if (locationCountPendingRef.current.has(encoded)) return;
      locationCountPendingRef.current.add(encoded);

      try {
        const decoded = decodeLocationValue(encoded);
        if (!decoded) return;

        const and = Array.isArray(locationCountBaseFilters?.and) ? [...locationCountBaseFilters.and] : [];
        if (decoded.level === "province") {
          const toks = packedTokenVariants(decoded.province);
          if (toks.length) and.push({ or: toks.map((tok) => ({ provinces: { contains: tok } })) });
        } else if (decoded.level === "city") {
          const toks = packedTokenVariants(decoded.city);
          if (toks.length) and.push({ or: toks.map((tok) => ({ cities: { contains: tok } })) });
        } else if (decoded.level === "town") {
          const toks = packedTokenVariants(decoded.town);
          if (toks.length) and.push({ or: toks.map((tok) => ({ towns: { contains: tok } })) });
        }
        const filters = and.length ? { and } : undefined;

        const res = await apolloClient.query({
          query: LISTING_SEARCH_INDEX_CONNECTION_QUERY,
          variables: { filters, page: 1, pageSize: 1 },
          fetchPolicy: "cache-first",
        });

        const total = res?.data?.listingSearchIndices_connection?.pageInfo?.total;
        if (typeof total === "number") {
          setLocationCountMap((prev) => ({ ...(prev || {}), [encoded]: total }));
        }
      } finally {
        locationCountPendingRef.current.delete(encoded);
      }
    };
  }, [apolloClient, locationCountBaseFilters, shouldFetchCounts, locationCountMap]);

  const locationState = useMemo(() => {
    if (name !== "location" || !isHierarchical) return null;
    const normalizeKey = (v) => (typeof v === "string" ? v.trim().toLowerCase() : "");
    const decoded = selectedValues.map(decodeLocationValue).filter(Boolean);

    const selectedProvinceKeys = new Set(
      decoded
        .filter((d) => d.level === "province" && d.province)
        .map((d) => normalizeKey(d.province))
        .filter(Boolean)
    );
    const selectedCityKeys = new Set(
      decoded
        .filter((d) => d.level === "city" && d.province && d.city)
        .map((d) => `${normalizeKey(d.province)}|${normalizeKey(d.city)}`)
        .filter(Boolean)
    );
    const selectedTownKeys = new Set(
      decoded
        .filter((d) => d.level === "town" && d.province && d.city && d.town)
        .map((d) => `${normalizeKey(d.province)}|${normalizeKey(d.city)}|${normalizeKey(d.town)}`)
        .filter(Boolean)
    );

    const provinceHasCityOrTown = new Set();
    for (const cityKey of selectedCityKeys) provinceHasCityOrTown.add(cityKey.split("|")[0]);
    for (const townKey of selectedTownKeys) provinceHasCityOrTown.add(townKey.split("|")[0]);

    const cityHasTown = new Set();
    for (const townKey of selectedTownKeys) {
      const parts = townKey.split("|");
      cityHasTown.add(`${parts[0]}|${parts[1]}`);
    }

    return {
      isProvinceSelected: (province) => selectedProvinceKeys.has(normalizeKey(province)),
      isCitySelected: (province, city) =>
        selectedCityKeys.has(`${normalizeKey(province)}|${normalizeKey(city)}`),
      isTownSelected: (province, city, town) =>
        selectedTownKeys.has(`${normalizeKey(province)}|${normalizeKey(city)}|${normalizeKey(town)}`),
      isProvinceDisabled: (province) => provinceHasCityOrTown.has(normalizeKey(province)),
      isCityDisabled: (province, city) =>
        selectedProvinceKeys.has(normalizeKey(province)) ||
        cityHasTown.has(`${normalizeKey(province)}|${normalizeKey(city)}`),
      isTownDisabled: (province, city) =>
        selectedProvinceKeys.has(normalizeKey(province)) ||
        selectedCityKeys.has(`${normalizeKey(province)}|${normalizeKey(city)}`),
      getLabel: getLocationLabel,
    };
  }, [isHierarchical, name, selectedValues]);

  const handleSelect = (val) => {
    // console.log('FilterDropdown handleSelect called:', val, 'name:', name, 'isMultiSelect:', isMultiSelect);
    if (val === 'Any' || val === 'All' || val === 'All Categories') {
      // console.log('Selecting Any');
      selectOption(name, 'Any', false); // Close on 'Any'
      return;
    }

    if (name === "location" && isHierarchical && typeof val === "string" && isEncodedLocationValue(val)) {
      const decodedVal = decodeLocationValue(val);
      if (!decodedVal) return;

      const normalizeKey = (v) => (typeof v === "string" ? v.trim().toLowerCase() : "");
      const current = Array.isArray(selectedValues) ? [...selectedValues] : [];

      const decodedCurrent = current.map(decodeLocationValue).filter(Boolean);
      const keep = [];
      for (let i = 0; i < current.length; i += 1) {
        const d = decodedCurrent[i];
        keep.push({ raw: current[i], decoded: d });
      }

      const matchesProvince = (d, provinceName) =>
        d && d.province && normalizeKey(d.province) === normalizeKey(provinceName);
      const matchesCity = (d, provinceName, cityName) =>
        d &&
        d.province &&
        d.city &&
        normalizeKey(d.province) === normalizeKey(provinceName) &&
        normalizeKey(d.city) === normalizeKey(cityName);

      const isSameSelection = (d, target) => {
        if (!d) return false;
        if (target.level === "province")
          return d.level === "province" && matchesProvince(d, target.province);
        if (target.level === "city")
          return d.level === "city" && matchesCity(d, target.province, target.city);
        return (
          d.level === "town" &&
          matchesCity(d, target.province, target.city) &&
          normalizeKey(d.town) === normalizeKey(target.town)
        );
      };

      const alreadySelected = keep.some((k) => isSameSelection(k.decoded, decodedVal));
      let next = keep.filter((k) => !isSameSelection(k.decoded, decodedVal));

      if (!alreadySelected) {
        if (decodedVal.level === "province") {
          next = next.filter((k) => !(k.decoded && matchesProvince(k.decoded, decodedVal.province)));
          next.push({ raw: val, decoded: decodedVal });
        } else if (decodedVal.level === "city") {
          next = next.filter((k) => {
            if (!k.decoded) return true;
            if (k.decoded.level === "province" && matchesProvince(k.decoded, decodedVal.province)) return false;
            if (k.decoded.level === "town" && matchesCity(k.decoded, decodedVal.province, decodedVal.city))
              return false;
            return true;
          });
          next.push({ raw: val, decoded: decodedVal });
        } else {
          next = next.filter((k) => {
            if (!k.decoded) return true;
            if (k.decoded.level === "province" && matchesProvince(k.decoded, decodedVal.province)) return false;
            if (k.decoded.level === "city" && matchesCity(k.decoded, decodedVal.province, decodedVal.city)) return false;
            return true;
          });
          next.push({ raw: val, decoded: decodedVal });
        }
      }

      const nextRaw = next.map((k) => k.raw);
      if (nextRaw.length === 0) {
        selectOption(name, "Any", true);
      } else {
        selectOption(name, nextRaw, true);
      }
      return;
    }

    if (isMultiSelect) {
      // Ensure we start with a clean array
      let newValues = [];
      if (Array.isArray(selectedValues)) {
        newValues = [...selectedValues];
      } else if (selectedValues && !['Any', 'All', 'All Categories'].includes(selectedValues)) {
        newValues = [selectedValues];
      }

      // Always remove 'Any'/'All' from the array if we are selecting a specific value
      newValues = newValues.filter(v => !['Any', 'All', 'All Categories'].includes(v));
      
      if (newValues.includes(val)) {
        newValues = newValues.filter(v => v !== val);
      } else {
        newValues.push(val);
      }
      
      // If nothing selected, revert to 'Any'
      if (newValues.length === 0) {
        selectOption(name, 'Any', true);
      } else {
        // console.log('Selecting multi:', newValues);
        selectOption(name, newValues, true); // Keep open
      }
    } else {
      // Single-select (minPrice / maxPrice): allow toggle off by clicking again
      const current = currentVal;
      let nextValue = val;

      // If the same value is clicked again, reset to default placeholder
      if (current === val) {
        if (name === 'minPrice') {
          nextValue = 'Min Price';
        } else if (name === 'maxPrice') {
          nextValue = 'Max Price';
        } else {
          nextValue = null;
        }
      } else {
        // If selecting a specific value, ensure it's not null/Any
        nextValue = val;
      }

      // console.log('Selecting single:', nextValue);
      selectOption(name, nextValue, false); // Close for single select
    }
  };

  const getLabel = () => {
    if (!currentVal || currentVal === 'Any') return label;
    if (Array.isArray(currentVal)) {
      if (currentVal.length === 0) return label;
      // Also handle case where array contains only 'Any'
      if (currentVal.length === 1 && currentVal[0] === 'Any') return label;

      if (name === "location") return currentVal[currentVal.length - 1];
      
      // If single item selected, show its name
      if (currentVal.length === 1) return currentVal[0];
      // If multiple items, show count
      return `${currentVal.length} Selected`;
    }
    return currentVal || label;
  };

  const renderTriggerContent = () => {
    // Check if we have active selections (not empty, not just "Any")
    const hasActiveSelection = selectedValues.length > 0 && !selectedValues.includes('Any') && !selectedValues.includes('All') && !selectedValues.includes('All Categories');

    if (!hasActiveSelection) {
      return <span className="truncate">{label}</span>;
    }

    if (isMultiSelect) {
      return (
        <div className="flex flex-wrap gap-2 items-center py-0.5">
           <span className="font-bold text-white mr-1">{label}</span>
           {selectedValues.map((val) => (
             <span 
               key={val} 
               className="inline-flex items-center bg-[#074E61] text-white text-[11px] px-2 py-0.5 rounded border border-[#1687A7] shadow-sm whitespace-nowrap"
               onClick={(e) => e.stopPropagation()} 
             >
               {name === "location" ? getLocationLabel(val) : val}
               <span 
                 role="button"
                 onClick={(e) => {
                   e.stopPropagation();
                   handleSelect(val);
                 }}
                 className="ml-1.5 hover:text-red-400 flex items-center justify-center cursor-pointer"
               >
                 <X className="h-3 w-3" /> 
               </span>
             </span>
          ))}
        </div>
      );
    }
    
    return <span className="truncate">{getLabel()}</span>;
  };

  return (
    <div className="relative w-full" ref={(el) => (dropdownRefs.current[name] = el)}>
      <button
        type="button"
        onClick={() => toggleDropdown(name)}
        className="flex items-center justify-between w-full px-4 py-2 text-sm font-medium text-white bg-[#0D7C99] hover:bg-[#0D7C99]/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#0D7C99] min-h-[36px] h-auto shadow"
        style={{ borderRadius: '2px' }}
        aria-expanded={openDropdown === name}
        aria-haspopup="true"
      >
        <div className="flex-1 text-left overflow-hidden">
          {renderTriggerContent()}
        </div>
        <ChevronDown
          className={`h-4 w-4 transition-transform duration-200 flex-shrink-0 ml-2 ${openDropdown === name ? "transform rotate-180" : ""}`}
        />
      </button>

      {openDropdown === name && (
        <div
          className="absolute left-0 top-full z-[300] mt-1 w-full bg-[#2E2E30] shadow-lg border border-gray-700"
          style={{ borderRadius: '2px' }}
        >
          <ul className="py-1 max-h-80 overflow-auto" role="menu" aria-orientation="vertical">
            {isHierarchical ? (
               displayOptions.map((item, idx) => (
                 <HierarchyItem 
                   key={idx} 
                   item={item} 
                   locationState={locationState}
                   onSelect={handleSelect}
                   selectedLocationTotal={selectedLocationTotal}
                   shouldFetchCounts={shouldFetchCounts}
                   getCount={getCount}
                   ensureCount={ensureCount}
                 />
               ))
            ) : (
              displayOptions.map((option, index) => {
                const iconSrc = getIconSrc(name, option);
                const isSelected = selectedValues.includes(option);
                
                return (
                  <li
                    key={index}
                    onClick={() => handleSelect(option)}
                    className="px-3 py-2 text-sm text-gray-300 hover:bg-[#111111] hover:text-[#D4AF37] transition-colors flex justify-between items-center cursor-pointer"
                    role="menuitem"
                  >
                    <div className="flex items-center gap-3">
                      {/* Checkbox for all items */}
                      <div className={`h-4 w-4 flex items-center justify-center border border-gray-500 rounded ${isSelected ? 'bg-[#D4AF37] border-[#D4AF37]' : ''}`}>
                          {isSelected && <Check className="h-3 w-3 text-white" />}
                      </div>

                      <div className="h-5 w-5 flex items-center justify-center">
                        {option === 'Any' ? (
                          <Square className="h-5 w-5 text-gray-300" aria-hidden="true" />
                        ) : (
                          <img
                            src={iconSrc || '/placeholder.svg'}
                            alt={`${option} icon`}
                            width={20}
                            height={20}
                            className="h-5 w-5 object-contain inline-block visible opacity-100"
                            style={{ 
                              display: 'block',
                              filter: name === 'colour' || name === 'slabStyle' || name === 'overallStyle' ? 'none' : 'brightness(0) invert(0.9)'
                            }}
                            onError={(e) => {
                              if (name === 'colour') {
                                const colorPath = `/last_icons/AdvertCreator_Colour_Icons/6_Colour_Icons/Colour_Icon_${option}.svg`;
                                e.currentTarget.src = colorPath;
                              }
                            }}
                          />
                        )}
                      </div>
                      <span>{option}</span>
                    </div>
                  </li>
                );
              })
            )}
          </ul>
        </div>
      )}
    </div>
  );
}
