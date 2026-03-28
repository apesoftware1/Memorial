"use client";

import React from 'react';
import { X } from 'lucide-react';
import { usePathname } from 'next/navigation';

const MobileFilterTags = ({ activeFilters, setActiveFilters }) => {
  const pathname = usePathname();

  if (!activeFilters) return null;

  // Helper to remove a filter
  const removeFilter = (key, itemToRemove = undefined) => {
    setActiveFilters((prev) => {
      const current = prev?.[key];
      if (Array.isArray(current) && itemToRemove !== undefined) {
        const nextArr = current.filter((v) => String(v) !== String(itemToRemove));
        return {
          ...prev,
          [key]: nextArr.length > 0 ? nextArr : null,
        };
      }
      return {
        ...prev,
        [key]:
          key === "minPrice"
            ? "Min Price"
            : key === "maxPrice"
            ? "Max Price"
            : null,
      };
    });
  };

  const removePriceFilter = () => {
    setActiveFilters(prev => ({
      ...prev,
      minPrice: 'Min Price',
      maxPrice: 'Max Price'
    }));
  };

  // Helper to check if a value is effectively empty
  const isEmpty = (value) => {
    if (value === null || value === undefined) return true;
    if (Array.isArray(value) && value.length === 0) return true;
    if (typeof value === 'object' && Object.keys(value).length === 0) return true;
    if (typeof value === 'string') {
      const trimmed = value.trim();
      return trimmed === '' || trimmed.toLowerCase() === 'null' || trimmed === 'Min Price' || trimmed === 'Max Price';
    }
    return false;
  };

  // Check if any filter is active (excluding category which is always set to something, usually)
  const hasActiveFilters = () => {
    const keys = Object.keys(activeFilters);
    return keys.some(key => {
        if (key === 'category') return false; // Category is shown separately or always present
        if (key === 'minPrice' || key === 'maxPrice') {
           return !isEmpty(activeFilters[key]);
        }
        return !isEmpty(activeFilters[key]) && activeFilters[key] !== 'All' && activeFilters[key] !== 'Any';
    });
  };

  // Construct price label
  let priceLabel = '';
  const minVal = activeFilters.minPrice;
  const maxVal = activeFilters.maxPrice;

  if (!isEmpty(minVal) || !isEmpty(maxVal)) {
    const min = isEmpty(minVal) ? '0' : minVal;
    const max = isEmpty(maxVal) ? '+' : maxVal;
    priceLabel = `${min} - ${max}`;
  }

  if (!hasActiveFilters()) return null;

  return (
    <div className={`md:hidden mb-2 rounded-lg ${
      // If we are on homepage, remove background to just overlay tags
      // Otherwise use the default teal background
      pathname === '/' 
        ? 'bg-transparent w-full px-0 py-0' 
        : 'bg-[#0D7C99] w-full px-4 py-2'
    } text-white transition-all`}>
      <div className={`flex flex-wrap items-center gap-2 ${pathname === '/' ? 'justify-start' : 'justify-center'}`}>
        {/* Filter Tags */}
        {priceLabel && (
          <div className="flex items-center bg-[#095c72] rounded px-2 py-1 text-xs border border-[#1a8dae] shadow-sm">
            <span>{priceLabel}</span>
            <button onClick={removePriceFilter} className="ml-2 text-white/80 hover:text-white">
              <X size={12} />
            </button>
          </div>
        )}

        {Object.entries(activeFilters).map(([key, value]) => {
          if (key === 'category' || key === 'minPrice' || key === 'maxPrice' || !value || value === 'All' || value === 'Any') return null;

          if (Array.isArray(value)) {
            const items = value.map((v) => (typeof v === "string" ? v.trim() : String(v))).filter(Boolean);
            if (items.length === 0) return null;
            return items.map((item) => (
              <div
                key={`${key}:${item}`}
                className="flex items-center bg-[#095c72] rounded px-2 py-1 text-xs border border-[#1a8dae] shadow-sm"
              >
                <span className="min-w-0 truncate max-w-[220px]">{item}</span>
                <button
                  type="button"
                  onClick={() => removeFilter(key, item)}
                  className="ml-2 text-white/80 hover:text-white flex items-center justify-center"
                  aria-label={`Remove ${key} ${item}`}
                >
                  <X size={12} />
                </button>
              </div>
            ));
          }

          const displayValue = typeof value === "string" ? value : String(value);
          return (
            <div key={key} className="flex items-center bg-[#095c72] rounded px-2 py-1 text-xs border border-[#1a8dae] shadow-sm">
              <span className="min-w-0 truncate max-w-[220px]">{displayValue}</span>
              <button type="button" onClick={() => removeFilter(key)} className="ml-2 text-white/80 hover:text-white flex items-center justify-center" aria-label={`Remove ${key}`}>
                <X size={12} />
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default MobileFilterTags;
