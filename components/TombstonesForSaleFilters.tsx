import { useState } from "react"
import { ChevronDown } from "lucide-react"

interface TombstonesForSaleFiltersProps {
  activeFilters: any;
  setActiveFilters: (filters: any) => void;
  showFilters: any;
  setShowFilters: (show: any) => void;
  filterOptions: any;
}

// Use the same filter options as SearchContainer
const defaultFilterOptions = {
  minPrice: ["Min Price", ...Array.from({length: 100}, (_, i) => `R ${(1000 + i * 2000).toLocaleString()}`)],
  maxPrice: ["Max Price", ...Array.from({length: 100}, (_, i) => `R ${(3000 + i * 2000).toLocaleString()}`), "R 200,000+"],
  location: ["Gauteng", "Western Cape", "KwaZulu-Natal", "Eastern Cape", "Free State"],
  style: [
    "Christian Cross", "Heart", "Bible", "Pillars", "Traditional African", "Abstract", "Praying Hands", "Scroll", "Angel", "Mausoleum", "Obelisk", "Plain", "Teddy Bear", "Butterfly", "Car", "Bike", "Sports"
  ],
  stoneType: ["Granite", "Marble", "Sandstone", "Limestone", "Bronze"],
  custom: ["Engraving", "Photo", "Gold Leaf", "Special Shape", "Lighting"],
  colour: ["Black", "White", "Grey", "Brown", "Blue Pearl", "Red"],
};

export default function TombstonesForSaleFilters({ activeFilters, setActiveFilters, showFilters, setShowFilters, filterOptions }: TombstonesForSaleFiltersProps) {
  const [showMore, setShowMore] = useState(false);
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
        <div className="absolute left-0 top-full z-50 mt-1 w-full bg-[#2E2E30] rounded-md shadow-lg border border-gray-700 animate-slide-in">
          <ul className="py-1 max-h-60 overflow-auto" role="menu" aria-orientation="vertical">
            {options.map((option: string) => (
              <li
                key={option}
                onClick={() => setFilter(name, option)}
                className="px-3 py-2 text-sm text-gray-300 hover:bg-[#3E3E40] flex justify-between items-center cursor-pointer"
                role="menuitem"
              >
                {option}
                {activeFilters[name] === option && (
                  <svg className="h-4 w-4 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                )}
              </li>
            ))}
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
      <FilterDropdown name="location" label="Location" options={mergedOptions.location} />
      <div className="border-t border-gray-200 my-2"></div>
      <FilterDropdown name="style" label="Head Style" options={mergedOptions.style} />
      <div className="border-t border-gray-200 my-2"></div>
      <FilterDropdown name="stoneType" label="Material" options={mergedOptions.stoneType} />
      <div className="border-t border-gray-200 my-2"></div>
      <FilterDropdown name="custom" label="Customisation" options={mergedOptions.custom} />
      <div className="border-t border-gray-200 my-2"></div>
      <FilterDropdown name="colour" label="Colour" options={mergedOptions.colour} />
    </div>
  )
}