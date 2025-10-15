import { useState } from "react"
import { ChevronDown, Search } from "lucide-react"
import { useListingCategories } from "@/hooks/use-ListingCategories"
import Image from "next/image"

interface TombstonesForSaleFiltersProps {
  activeFilters: any;
  setActiveFilters: (filters: any) => void;
  showFilters: any;
  setShowFilters: (show: any) => void;
  filterOptions: any;
  filteredListings?: any[];
  handleSearch?: () => void;
  getActiveCategory?: () => string;
}

// Use the same filter options as SearchContainer
const defaultFilterOptions = {
  minPrice: ["Min Price", ...Array.from({length: 100}, (_, i) => `R ${(1000 + i * 2000).toLocaleString()}`)],
  maxPrice: ["Max Price", ...Array.from({length: 100}, (_, i) => `R ${(3000 + i * 2000).toLocaleString()}`), "R 200,000+"],
  location: ["Gauteng", "Western Cape", "KwaZulu-Natal", "Eastern Cape", "Free State"],
  style: [
    "Christian Cross", "Heart", "Bible", "Pillars", "Traditional African", "Abstract", "Praying Hands", "Scroll", "Angel", "Mausoleum", "Obelisk", "Plain", "Teddy Bear", "Butterfly", "Car", "Bike", "Sports"
  ],
  slabStyle: [
    "Curved Slab", "Frame with Infill", "Full Slab", "Glass Slab", "Half Slab", "Stepped Slab", "Tiled Slab"
  ],
  stoneType: [
    "Biodegradable", "Brass", "Ceramic/Porcelain", "Composite", "Concrete", "Copper", "Glass", "Granite", "Limestone", "Marble", "Perspex", "Quartzite", "Sandstone", "Slate", "Steel", "Stone", "Tile", "Wood"
  ],
  custom: [
    "Bronze/Stainless Plaques", "Ceramic Photo Plaques", "Flower Vases", "Gold Lettering", "Inlaid Glass", "Photo Laser-Edging", "QR Code"
  ],
  colour: [
    "Black", "Blue", "Green", "Grey-Dark", "Grey-Light", "Maroon", "Pearl", "Red", "White"
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
const locationIcons = {
  "Gauteng": "/last_icons/Marble_Icon_TEST.svg", // Using available icon as placeholder
  "Western Cape": "/last_icons/Marble_Icon_TEST.svg",
  "KwaZulu-Natal": "/last_icons/Marble_Icon_TEST.svg",
  "Eastern Cape": "/last_icons/Marble_Icon_TEST.svg",
  "Free State": "/last_icons/Marble_Icon_TEST.svg"
};

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
  "Biodegradable": "/last_icons/AdvertCreator_StoneType_Icons/AdvertCreator_StoneType_Icon_Biodegradable.svg",
  "Brass": "/last_icons/AdvertCreator_StoneType_Icons/AdvertCreator_StoneType_Icon_Brass.svg",
  "Ceramic/Porcelain": "/last_icons/AdvertCreator_StoneType_Icons/AdvertCreator_StoneType_Icon_Ceramic_Porcelain.svg",
  "Composite": "/last_icons/AdvertCreator_StoneType_Icons/AdvertCreator_StoneType_Icon_Composite.svg",
  "Concrete": "/last_icons/AdvertCreator_StoneType_Icons/AdvertCreator_StoneType_Icon_Concrete.svg",
  "Copper": "/last_icons/AdvertCreator_StoneType_Icons/AdvertCreator_StoneType_Icon_Copper.svg",
  "Glass": "/last_icons/AdvertCreator_StoneType_Icons/AdvertCreator_StoneType_Icon_Glass.svg",
  "Granite": "/last_icons/AdvertCreator_StoneType_Icons/AdvertCreator_StoneType_Icon_Granite.svg",
  "Limestone": "/last_icons/AdvertCreator_StoneType_Icons/AdvertCreator_StoneType_Icon_Limestone.svg",
  "Marble": "/last_icons/AdvertCreator_StoneType_Icons/AdvertCreator_StoneType_Icon_Marble.svg",
  "Perspex": "/last_icons/AdvertCreator_StoneType_Icons/AdvertCreator_StoneType_Icon_Perspex.svg",
  "Quartzite": "/last_icons/AdvertCreator_StoneType_Icons/AdvertCreator_StoneType_Icon_Quartzite.svg",
  "Sandstone": "/last_icons/AdvertCreator_StoneType_Icons/AdvertCreator_StoneType_Icon_Sandstone.svg",
  "Slate": "/last_icons/AdvertCreator_StoneType_Icons/AdvertCreator_StoneType_Icon_Slate.svg",
  "Steel": "/last_icons/AdvertCreator_StoneType_Icons/AdvertCreator_StoneType_Icon_Steel.svg",
  "Stone": "/last_icons/AdvertCreator_StoneType_Icons/AdvertCreator_StoneType_Icon_Stone.svg",
  "Tile": "/last_icons/AdvertCreator_StoneType_Icons/AdvertCreator_StoneType_Icon_Tile.svg",
  "Wood": "/last_icons/AdvertCreator_StoneType_Icons/AdvertCreator_StoneType_Icon_Wood.svg"
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
  "Bronze/Stainless Plaques": "/last_icons/AdvertCreator_Icons_Customisation_Icons/AdvertCreator_Customisation_Icon_Bronze_Stainless_Plaque.svg",
  "Ceramic Photo Plaques": "/last_icons/AdvertCreator_Icons_Customisation_Icons/AdvertCreator_Customisation_Icon_CeramicPhotoPlaque.svg",
  "Flower Vases": "/last_icons/AdvertCreator_Icons_Customisation_Icons/AdvertCreator_Customisation_Icon_FlowerVase.svg",
  "Gold Lettering": "/last_icons/AdvertCreator_Icons_Customisation_Icons/AdvertCreator_Customisation_Icon_GoldLettering.svg",
  "Inlaid Glass": "/last_icons/AdvertCreator_Icons_Customisation_Icons/AdvertCreator_Customisation_Icon_InlaidGlass.svg",
  "Photo Laser-Edging": "/last_icons/AdvertCreator_Icons_Customisation_Icons/AdvertCreator_Customisation_Icon_PhotoLaserEdginhg.svg",
  "QR Code": "/last_icons/AdvertCreator_Icons_Customisation_Icons/AdvertCreator_Customisation_Icon_QRCode.svg"
};

// Helper function to get icon for a filter option
const getIconForOption = (filterName: string, option: string) => {
  switch (filterName) {
    case 'location':
      return locationIcons[option as keyof typeof locationIcons];
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

export default function TombstonesForSaleFilters({ activeFilters, setActiveFilters, showFilters, setShowFilters, filterOptions, filteredListings, handleSearch, getActiveCategory }: TombstonesForSaleFiltersProps) {
  const [showMore, setShowMore] = useState(false);
  const { categories, loading } = useListingCategories();
  const mergedOptions = { ...defaultFilterOptions, ...filterOptions };

  // Toggle filter dropdown
  const toggleFilter = (filter: string) => {
    setShowFilters(showFilters === filter ? null : filter)
  }

  // Set filter value
  const setFilter = (category: string, value: string) => {
    setActiveFilters({
      ...activeFilters,
      [category]: value,
    })
    setShowFilters(null)
  }

  // FilterDropdown component
  const FilterDropdown = ({ name, label, options }: { name: string; label: string; options: string[] }) => (
    <div className="mb-2 relative w-full sm:rounded-none sm:border-b sm:border-gray-200">
      <button
        onClick={() => toggleFilter(name)}
        className="w-full flex justify-between items-center py-2 px-2 bg-white text-gray-800 font-semibold text-sm border border-gray-200 sm:border-0 rounded sm:rounded-none focus:outline-none focus:ring-2 focus:ring-amber-400 min-h-[36px] h-[36px] sm:min-h-[56px] sm:h-[56px]"
        aria-expanded={showFilters === name}
        aria-haspopup="true"
        style={{ textAlign: 'left' }}
      >
        <span className="text-gray-700 font-semibold">{label}</span>
        <ChevronDown
          className={`h-4 w-4 text-gray-500 transition-transform duration-200 ${showFilters === name ? "transform rotate-180" : ""}`}
        />
      </button>
      {showFilters === name && (
        <div className="absolute left-0 top-full z-[100] mt-1 w-full bg-[#2E2E30] rounded-md shadow-lg border border-gray-700 animate-slide-in">
          <ul className="py-1 max-h-60 overflow-auto" role="menu" aria-orientation="vertical">
            {options.map((option: string) => {
              const iconPath = getIconForOption(name, option);
              return (
                <li
                  key={option}
                  onClick={() => setFilter(name, option)}
                  className="px-3 py-2 text-sm text-gray-300 hover:bg-[#3E3E40] flex items-center cursor-pointer"
                  role="menuitem"
                >
                  <div className="flex items-center flex-1">
                    {iconPath && (
                      <div className="w-6 h-6 mr-3 flex-shrink-0">
                        <Image
                          src={iconPath}
                          alt={`${option} icon`}
                          width={24}
                          height={24}
                          className={`w-full h-full object-contain ${
                            name !== 'slabStyle' && name !== 'colour' 
                              ? 'filter brightness-0 invert opacity-80' 
                              : ''
                          }`}
                        />
                      </div>
                    )}
                    <span>{option}</span>
                  </div>
                  {activeFilters[name] === option && (
                    <svg className="h-4 w-4 text-green-500 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </div>
  )

  return (
    <div className="w-full">
      {/* Price Section */}
      <div className="mb-4">
        <div className="bg-white sm:rounded-none sm:shadow-sm sm:border sm:border-gray-200 p-4 sm:p-4">
          <div className="font-bold text-xs text-gray-700 mb-3 tracking-wide">PRICE</div>
          <div className="grid grid-cols-2 gap-2">
            <select
              className="w-full p-2 border border-gray-300 rounded text-sm min-h-[36px] h-[36px] sm:min-h-[56px] sm:h-[56px]"
              value={activeFilters.minPrice}
              onChange={(e) => setActiveFilters({ ...activeFilters, minPrice: e.target.value })}
            >
              {mergedOptions.minPrice.map((option: string) => (
                <option key={option}>{option}</option>
              ))}
            </select>
            <select
              className="w-full p-2 border border-gray-300 rounded text-sm min-h-[36px] h-[36px] sm:min-h-[56px] sm:h-[56px]"
              value={activeFilters.maxPrice}
              onChange={(e) => setActiveFilters({ ...activeFilters, maxPrice: e.target.value })}
            >
              {mergedOptions.maxPrice.map((option: string) => (
                <option key={option}>{option}</option>
              ))}
            </select>
          </div>
        </div>
      </div>
      <div className="border-t border-gray-200 my-2"></div>
      
      {/* Category Filter */}
      <FilterDropdown 
        name="category" 
        label="Category" 
        options={loading ? ["Loading..."] : ["All Categories", ...categories.map((cat: any) => cat.name)]} 
      />
      <div className="border-t border-gray-200 my-2"></div>
      
      <FilterDropdown name="location" label="Location" options={mergedOptions.location} />
      <div className="border-t border-gray-200 my-2"></div>
      <FilterDropdown name="style" label="Head Style" options={mergedOptions.style} />
      <div className="border-t border-gray-200 my-2"></div>
      <FilterDropdown name="slabStyle" label="Slab Style" options={mergedOptions.slabStyle} />
      <div className="border-t border-gray-200 my-2"></div>
      <FilterDropdown name="stoneType" label="Stone Type" options={mergedOptions.stoneType} />
      <div className="border-t border-gray-200 my-2"></div>
      <FilterDropdown name="colour" label="Colour" options={mergedOptions.colour} />
      <div className="border-t border-gray-200 my-2"></div>
      <FilterDropdown name="custom" label="Customisation" options={mergedOptions.custom} />
      
      {/* Duplicate Search Button */}
      {handleSearch && filteredListings && getActiveCategory && (
        <div className="mt-4 px-2 sm:px-0">
          <button 
            className="w-full bg-amber-500 hover:bg-amber-600 active:bg-amber-700 text-white p-3 px-4 rounded transition-colors flex items-center justify-center gap-2 focus:outline-none focus:ring-2 focus:ring-amber-400 text-sm font-medium min-h-[44px] touch-manipulation"
            onClick={handleSearch}
          >
            <Search className="h-4 w-4 flex-shrink-0" />
            <span className="truncate">{`Search (${filteredListings.length}) ${getActiveCategory()} Tombstones`}</span>
          </button>
        </div>
      )}
    </div>
  )
}