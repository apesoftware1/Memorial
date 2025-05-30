"use client"

import { useState, useRef } from 'react'
import SearchForm from './SearchForm'
import FilterDropdown from './FilterDropdown'

export default function SearchContainer() {
  const [openDropdown, setOpenDropdown] = useState<string | null>(null)
  const [filters, setFilters] = useState({
    bodyType: '',
    material: '',
    color: '',
    designTheme: '',
    location: '',
    priceRange: ''
  })
  const dropdownRefs = useRef({})

  const toggleDropdown = (name: string) => {
    setOpenDropdown(openDropdown === name ? null : name)
  }

  const selectOption = (name: string, option: string) => {
    setFilters(prev => ({
      ...prev,
      [name]: option
    }))
    setOpenDropdown(null)
  }

  const filterOptions = {
    bodyType: ["Full Tombstone", "Headstone", "Double Headstone", "Cremation Memorial", "Family Monument", "Child Memorial", "Custom Design"],
    material: ["Granite", "Marble", "Sandstone", "Limestone", "Bronze"],
    color: ["Black", "White", "Grey", "Brown", "Blue Pearl", "Red"],
    designTheme: ["Cross", "Angel", "Heart", "Book", "Traditional", "Modern", "Custom"],
    location: ["Gauteng", "Western Cape", "KwaZulu-Natal", "Eastern Cape", "Free State"],
    priceRange: ["Under R10,000", "R10,000 - R20,000", "R20,000 - R30,000", "R30,000 - R50,000", "Over R50,000"]
  }

  return (
    <div className="w-full bg-white py-6">
      <div className="container mx-auto px-4">
        <div className="space-y-4">
          <SearchForm />
          <div className="flex flex-wrap gap-2 justify-center">
            {Object.entries(filterOptions).map(([name, options]) => (
              <FilterDropdown
                key={name}
                name={name}
                label={name.charAt(0).toUpperCase() + name.slice(1).replace(/([A-Z])/g, ' $1')}
                options={options}
                openDropdown={openDropdown}
                toggleDropdown={toggleDropdown}
                selectOption={selectOption}
                filters={filters}
                dropdownRefs={dropdownRefs}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  )
} 