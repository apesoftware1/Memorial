"use client"

import { ChevronDown, Check } from "lucide-react"
import { useRef } from "react"
import Image from "next/image"

const bodyTypeIcons = {
  "Full Tombstone": "/MainMenu_Icons_Tombstone.svg",
  "Headstone": "/MainMenu_Icons_Head.svg",
  "Double Headstone": "/MainMenu_Icons_Tombstone.svg",
  "Cremation Memorial": "/MainMenu_Icons_Cremation.svg",
  "Family Monument": "/MainMenu_Icons_family.svg",
  "Child Memorial": "/MainMenu_Icons_Child.svg",
  "Custom Design": "/MainMenu_Icons_Premium.svg"
}

export default function FilterDropdown({
  name,
  label,
  options,
  openDropdown,
  toggleDropdown,
  selectOption,
  filters,
  dropdownRefs
}) {
  return (
    <div className="relative w-full" ref={(el) => (dropdownRefs.current[name] = el)}>
      <button
        onClick={() => toggleDropdown(name)}
        className="flex items-center justify-between w-full px-4 py-2 text-sm font-medium text-white bg-gray-600 hover:bg-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-400 h-9"
        style={{ borderRadius: '2px' }}
        aria-expanded={openDropdown === name}
        aria-haspopup="true"
      >
        <span>{filters[name] || label}</span>
        <ChevronDown
          className={`h-4 w-4 transition-transform duration-200 ${openDropdown === name ? "transform rotate-180" : ""}`}
        />
      </button>

      {openDropdown === name && (
        <div className="absolute z-[100] mt-1 w-full bg-white shadow-lg border border-gray-200 animate-slide-in" style={{ borderRadius: '2px' }}>
          <ul className="py-1 max-h-60 overflow-auto" role="menu" aria-orientation="vertical">
            {options.map((option, index) => (
              <li
                key={index}
                onClick={() => selectOption(name, option)}
                className="px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 flex justify-between items-center cursor-pointer"
                role="menuitem"
              >
                <div className="flex items-center gap-2">
                  {name === "bodyType" && bodyTypeIcons[option] && (
                    <Image
                      src={bodyTypeIcons[option]}
                      alt={`${option} icon`}
                      width={16}
                      height={16}
                      className="h-4 w-4"
                    />
                  )}
                  <span>{option}</span>
                </div>
                {filters[name] === option && <Check className="h-4 w-4 text-green-500" />}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
} 