import { useState, useEffect, useRef } from "react"
import { ChevronDown, Search, X } from "lucide-react"
import { useListingCategories } from "@/hooks/use-ListingCategories"
import Image from "next/image"
import FilterDropdown from "./FilterDropdown"
import LocationModal from "./LocationModal"

interface TombstonesForSaleFiltersProps {
  activeFilters: any;
  setActiveFilters: (filters: any) => void;
  showFilters: any;
  setShowFilters: (show: any) => void;
  filterOptions: any;
  filteredListings?: any[];
  handleSearch?: () => void;
  getActiveCategory?: () => string;
  showCategoryDropdown?: boolean;
  locationsData?: any[];
}

// Use the same filter options as SearchContainer
const defaultFilterOptions = {
  minPrice: ["Min Price", "R 1,000", ...Array.from({length: 40}, (_, i) => `R ${(5000 + i * 5000).toLocaleString()}`)],
  maxPrice: ["Max Price", "R 1,000", ...Array.from({length: 40}, (_, i) => `R ${(5000 + i * 5000).toLocaleString()}`), "R 200,000+"],
  location: ["Gauteng", "Western Cape", "KwaZulu-Natal", "Eastern Cape", "Free State"],
  style: [
    "Christian Cross", "Heart", "Bible", "Pillars", "Traditional African", "Abstract", "Praying Hands", "Scroll", "Angel", "Mausoleum", "Obelisk", "Plain", "Teddy Bear", "Butterfly", "Car", "Bike", "Sports",
    "Wave", "Church", "House", "Square", "Organic", "Arch"
  ],
  slabStyle: [
    "Curved Slab", "Frame with Infill", "Full Slab", "Glass Slab", "Half Slab", "Stepped Slab", "Tiled Slab", "Double"
  ],
  stoneType: [
    "Biodegradable", "Brass", "Ceramic/Porcelain", "Composite", "Concrete", "Copper", "Glass", "Granite", "Limestone", "Marble", "Perspex", "Quartzite", "Sandstone", "Slate", "Steel", "Stone", "Tile", "Wood"
  ],
  custom: [
    "Bronze/Stainless Plaques", "Ceramic Photo Plaques", "Flower Vases", "Gold Lettering", "Inlaid Glass", "Photo Laser-Edging", "QR Code"
  ],
  colour: [
    "Black", "Blue", "Green", "Grey-Dark", "Grey-Light", "Maroon", "Pearl", "Red", "White", "Gold", "Yellow", "Pink"
  ],
};

// Icon mappings for filter options
// Category icons for tombstone types
const categoryIcons = {
  "Single": "/last_icons/MainCatergories_Icons_X6/MainCatergories_Icons_X6/MainCatergories_Icons_1_Single.svg",
  "Double": "/last_icons/MainCatergories_Icons_X6/MainCatergories_Icons_X6/MainCatergories_Icons_2_Double.svg",
  "Child": "/last_icons/MainCatergories_Icons_X6/MainCatergories_Icons_X6/MainCatergories_Icons_3_Child.svg",
  "Head": "/last_icons/MainCatergories_Icons_X6/MainCatergories_Icons_X6/MainCatergories_Icons_4_Head.svg",
  "Plaque": "/last_icons/MainCatergories_Icons_X6/MainCatergories_Icons_X6/MainCatergories_Icons_5_Plaque.svg",
  "Cremation": "/last_icons/MainCatergories_Icons_X6/MainCatergories_Icons_X6/MainCatergories_Icons_6_Cremation.svg"
};

// Location icons - using a generic location pin for all provinces
const locationIcons = {};


const headStyleIcons = {
  "Christian Cross": "/last_icons/AdvertCreator_Head_Style_Icons/AdvertCreator_Head_Style_Icons/AdvertCreator_HeadStyle_Icon_ChristianCross.svg",
  "Heart": "/last_icons/AdvertCreator_Head_Style_Icons/AdvertCreator_Head_Style_Icons/AdvertCreator_HeadStyle_Icon_Heart.svg",
  "Bible": "/last_icons/AdvertCreator_Head_Style_Icons/AdvertCreator_Head_Style_Icons/AdvertCreator_HeadStyle_Icon_Bible.svg",
  "Pillars": "/last_icons/AdvertCreator_Head_Style_Icons/AdvertCreator_Head_Style_Icons/AdvertCreator_HeadStyle_Icon_Pillars.svg",
  "Traditional African": "/last_icons/AdvertCreator_Head_Style_Icons/AdvertCreator_Head_Style_Icons/AdvertCreator_HeadStyle_Icon_TraditionalAfrican.svg",
  "Abstract": "/last_icons/AdvertCreator_Head_Style_Icons/AdvertCreator_Head_Style_Icons/AdvertCreator_HeadStyle_Icon_Abstract.svg",
  "Praying Hands": "/last_icons/AdvertCreator_Head_Style_Icons/AdvertCreator_Head_Style_Icons/AdvertCreator_HeadStyle_Icon_PrayingHands.svg",
  "Scroll": "/last_icons/AdvertCreator_Head_Style_Icons/AdvertCreator_Head_Style_Icons/AdvertCreator_HeadStyle_Icon_Scroll.svg",
  "Angel": "/last_icons/AdvertCreator_Head_Style_Icons/AdvertCreator_Head_Style_Icons/AdvertCreator_HeadStyle_Icon_Angel.svg",
  "Mausoleum": "/last_icons/AdvertCreator_Head_Style_Icons/AdvertCreator_Head_Style_Icons/AdvertCreator_HeadStyle_Icon_Mausolean.svg",
  "Obelisk": "/last_icons/AdvertCreator_Head_Style_Icons/AdvertCreator_Head_Style_Icons/AdvertCreator_HeadStyle_Icon_Obelisk.svg",
  "Plain": "/last_icons/AdvertCreator_Head_Style_Icons/AdvertCreator_Head_Style_Icons/AdvertCreator_HeadStyle_Icon_Plain.svg",
  "Teddy Bear": "/last_icons/AdvertCreator_Head_Style_Icons/AdvertCreator_Head_Style_Icons/AdvertCreator_HeadStyle_Icon_TeddyBear.svg",
  "Butterfly": "/last_icons/AdvertCreator_Head_Style_Icons/AdvertCreator_Head_Style_Icons/AdvertCreator_HeadStyle_Icon_Butterfly.svg",
  "Car": "/last_icons/AdvertCreator_Head_Style_Icons/AdvertCreator_Head_Style_Icons/AdvertCreator_HeadStyle_Icon_Car.svg",
  "Bike": "/last_icons/AdvertCreator_Head_Style_Icons/AdvertCreator_Head_Style_Icons/AdvertCreator_HeadStyle_Icon_Bike.svg",
  "Sports": "/last_icons/AdvertCreator_Head_Style_Icons/AdvertCreator_Head_Style_Icons/AdvertCreator_HeadStyle_Icon_Sport.svg"
};

const slabStyleIcons = {
  "Curved Slab": "/last_icons/AdvertCreator_SlabStyle_Icons/AdvertCreator_SlabStyle_Icons/AdvertCreator_SlabStyle_Icons_CurvedSlab.svg",
  "Frame with Infill": "/last_icons/AdvertCreator_SlabStyle_Icons/AdvertCreator_SlabStyle_Icons/AdvertCreator_SlabStyle_Icons_FramewithInfill.svg",
  "Full Slab": "/last_icons/AdvertCreator_SlabStyle_Icons/AdvertCreator_SlabStyle_Icons/AdvertCreator_SlabStyle_Icons_FullSlab.svg",
  "Glass Slab": "/last_icons/AdvertCreator_SlabStyle_Icons/AdvertCreator_SlabStyle_Icons/AdvertCreator_SlabStyle_Icons_GlassSlab.svg",
  "Half Slab": "/last_icons/AdvertCreator_SlabStyle_Icons/AdvertCreator_SlabStyle_Icons/AdvertCreator_SlabStyle_Icons_HalfSlab.svg",
  "Stepped Slab": "/last_icons/AdvertCreator_SlabStyle_Icons/AdvertCreator_SlabStyle_Icons/AdvertCreator_SlabStyle_Icons_Stepped.svg",
  "Tiled Slab": "/last_icons/AdvertCreator_SlabStyle_Icons/AdvertCreator_SlabStyle_Icons/AdvertCreator_SlabStyle_Icons_Tiled.svg"
};

const stoneTypeIcons = {
  "Biodegradable": "/last_icons/AdvertCreator_StoneType_Icons/AdvertCreator_StoneType_Icons/AdvertCreator_StoneType_Icon_Biodegradable.svg",
  "Brass": "/last_icons/AdvertCreator_StoneType_Icons/AdvertCreator_StoneType_Icons/AdvertCreator_StoneType_Icon_Brass.svg",
  "Ceramic/Porcelain": "/last_icons/AdvertCreator_StoneType_Icons/AdvertCreator_StoneType_Icons/AdvertCreator_StoneType_Icon_Ceramic_Porcelain.svg",
  "Composite": "/last_icons/AdvertCreator_StoneType_Icons/AdvertCreator_StoneType_Icons/AdvertCreator_StoneType_Icon_Composite.svg",
  "Concrete": "/last_icons/AdvertCreator_StoneType_Icons/AdvertCreator_StoneType_Icons/AdvertCreator_StoneType_Icon_Concrete.svg",
  "Copper": "/last_icons/AdvertCreator_StoneType_Icons/AdvertCreator_StoneType_Icons/AdvertCreator_StoneType_Icon_Copper.svg",
  "Glass": "/last_icons/AdvertCreator_StoneType_Icons/AdvertCreator_StoneType_Icons/AdvertCreator_StoneType_Icon_Glass.svg",
  "Granite": "/last_icons/AdvertCreator_StoneType_Icons/AdvertCreator_StoneType_Icons/AdvertCreator_StoneType_Icon_Granite.svg",
  "Limestone": "/last_icons/AdvertCreator_StoneType_Icons/AdvertCreator_StoneType_Icons/AdvertCreator_StoneType_Icon_Limestone.svg",
  "Marble": "/last_icons/AdvertCreator_StoneType_Icons/AdvertCreator_StoneType_Icons/AdvertCreator_StoneType_Icon_Marble.svg",
  "Perspex": "/last_icons/AdvertCreator_StoneType_Icons/AdvertCreator_StoneType_Icons/AdvertCreator_StoneType_Icon_Perspex.svg",
  "Quartzite": "/last_icons/AdvertCreator_StoneType_Icons/AdvertCreator_StoneType_Icons/AdvertCreator_StoneType_Icon_Quartzite.svg",
  "Sandstone": "/last_icons/AdvertCreator_StoneType_Icons/AdvertCreator_StoneType_Icons/AdvertCreator_StoneType_Icon_Sandstone.svg",
  "Slate": "/last_icons/AdvertCreator_StoneType_Icons/AdvertCreator_StoneType_Icons/AdvertCreator_StoneType_Icon_Slate.svg",
  "Steel": "/last_icons/AdvertCreator_StoneType_Icons/AdvertCreator_StoneType_Icons/AdvertCreator_StoneType_Icon_Steel.svg",
  "Stone": "/last_icons/AdvertCreator_StoneType_Icons/AdvertCreator_StoneType_Icons/AdvertCreator_StoneType_Icon_Stone.svg",
  "Tile": "/last_icons/AdvertCreator_StoneType_Icons/AdvertCreator_StoneType_Icons/AdvertCreator_StoneType_Icon_Tile.svg",
  "Wood": "/last_icons/AdvertCreator_StoneType_Icons/AdvertCreator_StoneType_Icons/AdvertCreator_StoneType_Icon_Wood.svg"
};

const colourIcons = {
  "Black": "/last_icons/AdvertCreator_Colour_Icons/6_Colour_Icons/Colour_Icon_Black.svg",
  "Blue": "/last_icons/AdvertCreator_Colour_Icons/6_Colour_Icons/Colour_Icon_Blue.svg",
  "Green": "/last_icons/AdvertCreator_Colour_Icons/6_Colour_Icons/Colour_Icon_Green.svg",
  "Grey-Dark": "/last_icons/AdvertCreator_Colour_Icons/6_Colour_Icons/Colour_Icon_Grey-Dark.svg",
  "Grey-Light": "/last_icons/AdvertCreator_Colour_Icons/6_Colour_Icons/Colour_Icon_Grey-Light.svg",
  "Maroon": "/last_icons/AdvertCreator_Colour_Icons/6_Colour_Icons/Colour_Icon_Maroon.svg",
  "Pearl": "/last_icons/AdvertCreator_Colour_Icons/6_Colour_Icons/Colour_Icon_Pearl.svg",
  "Red": "/last_icons/AdvertCreator_Colour_Icons/6_Colour_Icons/Colour_Icon_Red.svg",
  "White": "/last_icons/AdvertCreator_Colour_Icons/6_Colour_Icons/Colour_Icon_White.svg"
};

const customIcons = {
  "Bronze/Stainless Plaques": "/last_icons/AdvertCreator_Icons_Customisation_Icons/AdvertCreator_Icons_Customisation_Icons/AdvertCreator_Customisation_Icon_Bronze_Stainless Plaque.svg",
  "Ceramic Photo Plaques": "/last_icons/AdvertCreator_Icons_Customisation_Icons/AdvertCreator_Icons_Customisation_Icons/AdvertCreator_Customisation_Icon_CeramicPhotoPlaque.svg",
  "Flower Vases": "/last_icons/AdvertCreator_Icons_Customisation_Icons/AdvertCreator_Icons_Customisation_Icons/AdvertCreator_Customisation_Icon_FlowerVase.svg",
  "Gold Lettering": "/last_icons/AdvertCreator_Icons_Customisation_Icons/AdvertCreator_Icons_Customisation_Icons/AdvertCreator_Customisation_Icon_GoldLettering.svg",
  "Inlaid Glass": "/last_icons/AdvertCreator_Icons_Customisation_Icons/AdvertCreator_Icons_Customisation_Icons/AdvertCreator_Customisation_Icon_InlaidGlass.svg",
  "Photo Laser-Edging": "/last_icons/AdvertCreator_Icons_Customisation_Icons/AdvertCreator_Icons_Customisation_Icons/AdvertCreator_Customisation_Icon_PhotoLaserEdginhg.svg",
  "QR Code": "/last_icons/AdvertCreator_Icons_Customisation_Icons/AdvertCreator_Icons_Customisation_Icons/AdvertCreator_Customisation_Icon_QR Code.svg"
};

// Helper function to get icon for a filter option
const getIconForOption = (filterName: string, option: string) => {
  switch (filterName) {
    case 'location':
      return locationIcons[option as keyof typeof locationIcons];
    case 'category':
      // Try direct match
      if (categoryIcons[option as keyof typeof categoryIcons]) return categoryIcons[option as keyof typeof categoryIcons];
      // Try matching start
      const key = Object.keys(categoryIcons).find(k => option.startsWith(k));
      if (key) return categoryIcons[key as keyof typeof categoryIcons];
      // Try special cases
      if (option.includes('Headstone')) return categoryIcons['Head'];
      if (option.includes('Plaques')) return categoryIcons['Plaque'];
      return null;
    case 'style':
      return headStyleIcons[option as keyof typeof headStyleIcons];
    case 'slabStyle':
      return slabStyleIcons[option as keyof typeof slabStyleIcons];
    case 'stoneType':
      return stoneTypeIcons[option as keyof typeof stoneTypeIcons];
    case 'colour':
      return colourIcons[option as keyof typeof colourIcons];
    case 'custom':
      return customIcons[option as keyof typeof customIcons];
    default:
      return null;
  }
};

export default function TombstonesForSaleFilters({ activeFilters, setActiveFilters, showFilters, setShowFilters, filterOptions, filteredListings, handleSearch, getActiveCategory, showCategoryDropdown = true, locationsData }: TombstonesForSaleFiltersProps) {
  const [showMore, setShowMore] = useState(false);
  const [showLocationModal, setShowLocationModal] = useState(false);
  const { categories, loading } = useListingCategories();
  const dropdownRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});

  // Handle click outside to close dropdowns
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (showFilters) {
        const dropdownRef = dropdownRefs.current[showFilters];
        if (dropdownRef && !dropdownRef.contains(event.target as Node)) {
          setShowFilters(null);
        }
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showFilters, setShowFilters]);

  const mergedOptions = { ...defaultFilterOptions, ...filterOptions };
  
  // Use locationsData if provided (hierarchical) - check for existence, not just non-empty, to allow empty overrides
    if (locationsData) {
      mergedOptions.location = locationsData;
    }

  // Toggle filter dropdown
  const toggleFilter = (filter: string) => {
    if (filter === 'location' && typeof window !== 'undefined' && window.innerWidth < 768) {
      setShowLocationModal(true);
      return;
    }
    setShowFilters(showFilters === filter ? null : filter)
  }

  // Helper for multi-select
  const isMultiSelect = (name: string) => ['style', 'slabStyle', 'stoneType', 'colour', 'custom', 'location'].includes(name);

  // New selectOption for FilterDropdown.js
  const selectOption = (name: string, value: any, keepOpen: boolean = false) => {
    // If selecting 'Any', handle clearing logic
    if (value === 'Any' || value === 'All' || value === 'All Categories' || (Array.isArray(value) && value.length === 0)) {
       // Check if it's location to clear specific fields if needed
       if (name === 'location') {
         setActiveFilters({
           ...activeFilters,
           location: null // Clear location
         });
       } else {
         setActiveFilters({
           ...activeFilters,
           [name]: null
         });
       }
    } else {
       // Set the new value directly
       // FilterDropdown.js passes the *next state* for multi-select arrays, or the single value for single-select
       // So we just set it.
       setActiveFilters({
         ...activeFilters,
         [name]: value
       });
    }

    if (!keepOpen) {
      setShowFilters(null);
    }
  };

  // Helper to remove a specific filter tag
  const removeFilterTag = (category: string, value: string) => {
    if (category === 'minPrice') {
      setActiveFilters({ ...activeFilters, minPrice: "Min Price" });
    } else if (category === 'maxPrice') {
      setActiveFilters({ ...activeFilters, maxPrice: "Max Price" });
    } else if (isMultiSelect(category)) {
      // For multi-select, value is the item to remove.
      // But we need to update the array.
      const current = activeFilters[category];
      if (Array.isArray(current)) {
        const newValues = current.filter((v: string) => v !== value);
        // If array becomes empty, set to null or 'Any' (handled by selectOption)
        selectOption(category, newValues.length > 0 ? newValues : 'Any', true);
      } else if (current === value) {
         // Single value match (if stored as string despite being multi-select type)
         selectOption(category, 'Any', false);
      }
    } else {
      // Single select (category)
      selectOption(category, null, false);
    }
  };

  // Component to render a single tag
  const FilterTag = ({ label, onRemove }: { label: string, onRemove: () => void }) => (
    <div className="flex items-center bg-[#004d63] text-white text-xs px-2 py-1 rounded-sm border border-teal-700/50" onClick={(e) => e.stopPropagation()}>
      <span className="mr-1">{label}</span>
      <button 
        onClick={(e) => { e.stopPropagation(); onRemove(); }}
        className="hover:text-red-300 focus:outline-none"
      >
        <div className="text-[10px]">✕</div>
      </button>
    </div>
  );


  return (
    <div
      className="w-full bg-[#005D77] text-white min-h-full"
    >
      <div className="p-4 sm:p-6 space-y-4">
      {/* Price Section */}
      <div className="mb-4">
        <div className="grid grid-cols-2 gap-2">
          <select
            className="w-full p-2 border border-teal-700/60 bg-[#0D7C99] text-white rounded-none text-sm min-h-[36px] h-[36px] sm:min-h-[56px] sm:h-[56px]"
            value={activeFilters.minPrice}
            onChange={(e) => setActiveFilters({ ...activeFilters, minPrice: e.target.value })}
          >
            {mergedOptions.minPrice.map((option: string) => (
              <option key={option}>{option}</option>
            ))}
          </select>
          <select
            className="w-full p-2 border border-teal-700/60 bg-[#0D7C99] text-white rounded-none text-sm min-h-[36px] h-[36px] sm:min-h-[56px] sm:h-[56px]"
            value={activeFilters.maxPrice}
            onChange={(e) => setActiveFilters({ ...activeFilters, maxPrice: e.target.value })}
          >
            {mergedOptions.maxPrice.map((option: string) => (
              <option key={option}>{option}</option>
            ))}
          </select>
        </div>
        {/* Price Tags */}
        <div className="flex flex-wrap mt-2 gap-2">
          {activeFilters.minPrice && activeFilters.minPrice !== "Min Price" && (
             <FilterTag label={activeFilters.minPrice} onRemove={() => removeFilterTag('minPrice', activeFilters.minPrice)} />
          )}
          {activeFilters.maxPrice && activeFilters.maxPrice !== "Max Price" && (
             <FilterTag label={activeFilters.maxPrice} onRemove={() => removeFilterTag('maxPrice', activeFilters.maxPrice)} />
          )}
        </div>
      </div>
      
      {/* Category Filter (optional) */}
      {showCategoryDropdown && (
        <div className="md:hidden">
          <FilterDropdown 
            name="category" 
            label="Category" 
            options={loading ? ["Loading..."] : ["All Categories", ...categories.map((cat: any) => cat.name)]}
            openDropdown={showFilters}
            toggleDropdown={toggleFilter}
            selectOption={selectOption}
            filters={activeFilters}
            dropdownRefs={dropdownRefs}
          />
        </div>
      )}
      
      {/* Location Filter */}
      <FilterDropdown
        name="location"
        label="Location"
        options={mergedOptions.location}
        openDropdown={showFilters}
        toggleDropdown={toggleFilter}
        selectOption={selectOption}
        filters={activeFilters}
        dropdownRefs={dropdownRefs}
      />

      <FilterDropdown name="style" label="Head Style" options={mergedOptions.style} openDropdown={showFilters} toggleDropdown={toggleFilter} selectOption={selectOption} filters={activeFilters} dropdownRefs={dropdownRefs} />
      <FilterDropdown name="slabStyle" label="Slab Style" options={mergedOptions.slabStyle} openDropdown={showFilters} toggleDropdown={toggleFilter} selectOption={selectOption} filters={activeFilters} dropdownRefs={dropdownRefs} />
      <FilterDropdown name="stoneType" label="Stone Type" options={mergedOptions.stoneType} openDropdown={showFilters} toggleDropdown={toggleFilter} selectOption={selectOption} filters={activeFilters} dropdownRefs={dropdownRefs} />
      <FilterDropdown name="colour" label="Colour" options={mergedOptions.colour} openDropdown={showFilters} toggleDropdown={toggleFilter} selectOption={selectOption} filters={activeFilters} dropdownRefs={dropdownRefs} />
      <FilterDropdown name="custom" label="Customisation" options={mergedOptions.custom} openDropdown={showFilters} toggleDropdown={toggleFilter} selectOption={selectOption} filters={activeFilters} dropdownRefs={dropdownRefs} />
      
      {/* Search Button */}
      {handleSearch && filteredListings && getActiveCategory && (
        <div className="mt-4 px-2 sm:px-0">
          <button 
            className="w-full bg-amber-500 hover:bg-amber-600 active:bg-amber-700 text-white p-3 px-4 rounded transition-colors flex items-center justify-center gap-2 focus:outline-none focus:ring-2 focus:ring-amber-400 text-sm font-medium min-h-[44px] touch-manipulation"
            onClick={handleSearch}
          >
            <Search className="h-4 w-4 flex-shrink-0" />
            <span className="truncate">{`Search (${filteredListings.length}) ${getActiveCategory()} Tombstones`}</span>
          </button>
          {/* Clear All button */}
          <button
            className="mt-3 w-full bg-transparent border border-white/40 text-white hover:bg-white/10 active:bg-white/20 p-2 rounded text-sm"
            onClick={() => {
              setActiveFilters({
                minPrice: "Min Price",
                maxPrice: "Max Price",
                location: null,
                stoneType: null,
                color: null,
                style: null,
                slabStyle: null,
                custom: null,
                colour: null,
                category: activeFilters.category || null,
                search: null,
              });
            }}
          >
            Clear All
          </button>
        </div>
      )}
      </div>

      {/* Location Modal for Mobile */}
      {showLocationModal && (
        <LocationModal
          isOpen={showLocationModal}
          onClose={() => setShowLocationModal(false)}
          locationsData={locationsData}
          onSelectLocation={(loc: string | { type: string, lat: number, lng: number }) => {
            if (typeof loc === 'string') {
               // Single select for mobile modal
               selectOption('location', loc);
            } else if (typeof loc === 'object' && loc.type === 'coords') {
               // Handle "Near me" or coords if supported, or just ignore/fallback
               // For now, let's map "Near me" to string if possible or just use "Near me" text
               selectOption('location', "Near me");
            }
            setShowLocationModal(false);
          }}
        />
      )}
    </div>
  )
}