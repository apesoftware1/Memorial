"use client";

import React, { useState, useMemo } from 'react';
import SearchContainer from '@/components/SearchContainer';
import { buildLocationTree } from '@/lib/locationTree';
import { filterListings } from '@/lib/filterListings';
import { useProgressiveQuery } from '@/hooks/useProgressiveQuery';
import {
  LISTINGS_INITIAL_QUERY,
  LISTINGS_FULL_QUERY,
  LISTINGS_DELTA_QUERY,
} from '@/graphql/queries';
import { useListingCategories } from "@/hooks/use-ListingCategories";
import { normalizeCityName } from '@/lib/locationHelpers';

export default function TestSearchCountsPage() {
  const { categories, loading: categoriesLoading } = useListingCategories();
  const [activeTab, setActiveTab] = useState(0); // 0 = Single, 1 = Double, 2 = Child
  const [filters, setFilters] = useState({});

  // Fetch real data
  const queryVariables = useMemo(() => ({}), []);
  const { data, loading: listingsLoading } = useProgressiveQuery({
    initialQuery: LISTINGS_INITIAL_QUERY,
    fullQuery: LISTINGS_FULL_QUERY,
    deltaQuery: LISTINGS_DELTA_QUERY,
    variables: queryVariables,
    storageKey: 'listings:lastUpdated',
    refreshInterval: 0, 
    staleTime: 1000 * 60 * 5, 
  });
  
  const listings = data?.listings || [];

  // Filter out listings where specials.active is true (matching main page logic)
  const allListings = useMemo(() => {
    return Array.isArray(listings) 
      ? listings.filter(listing => {
          return !(listing.specials && Array.isArray(listing.specials) && 
                  listing.specials.some(special => special.active === true));
        })
      : [];
  }, [listings]);

  // DEBUG: Find listings missing "Newcastle"
  const newcastleDebugInfo = useMemo(() => {
    if (!categories || categories.length === 0) return { missing: [], present: [] };
    const selectedCat = categories[activeTab]?.name || "";
    
    // Get all listings for current category
    const catListings = allListings.filter(l => 
      (l.listing_category?.name || "").toLowerCase().trim() === selectedCat.toLowerCase().trim()
    );

    const present = [];
    const missing = [];

    catListings.forEach(l => {
      let hasNewcastle = false;
      if (Array.isArray(l.branches)) {
        hasNewcastle = l.branches.some(b => {
          const city = b?.location?.city || "";
          return normalizeCityName(city).toLowerCase() === "newcastle";
        });
      }
      
      if (hasNewcastle) {
        present.push(l);
      } else {
        missing.push(l);
      }
    });
    
    return { missing, present };
  }, [allListings, categories, activeTab]);

  // Calculate hierarchy using the hook, with filtering applied (EXCEPT location)
  // This replicates what SearchContainer does internally
  const listingsForLocationCounts = useMemo(() => {
    const filtersForLocation = { ...filters, location: null };
    return filterListings(allListings, filtersForLocation, categories, activeTab);
  }, [filters, activeTab, allListings, categories]);

  const locationHierarchy = useMemo(() => {
    return buildLocationTree(listingsForLocationCounts);
  }, [listingsForLocationCounts]);

  if (categoriesLoading || listingsLoading) {
    return <div className="p-8 text-center">Loading data...</div>;
  }

  return (
    <div style={{ padding: 20 }}>
      <h1 className="text-2xl font-bold mb-4">Search Container Count Test (Real Data)</h1>
      
      <div className="mb-8 border p-4 rounded bg-gray-50 border-red-200">
        <h2 className="text-xl font-bold mb-2 text-red-700">Newcastle Debugger</h2>
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-red-50 p-4 rounded">
            <h3 className="font-bold">Listings MISSING "Newcastle" Branch ({newcastleDebugInfo.missing.length})</h3>
            {newcastleDebugInfo.missing.length > 0 ? (
              <ul className="list-disc pl-5 mt-2 max-h-60 overflow-auto text-sm">
                {newcastleDebugInfo.missing.map(l => (
                  <li key={l.id} className="mb-2">
                    <strong>ID: {l.id}</strong> - {l.title}
                    <br/>
                    <span className="text-xs text-gray-600">
                      Branches: {l.branches?.map(b => b?.location?.city).join(', ') || "None"}
                    </span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-green-600">All listings have Newcastle!</p>
            )}
          </div>
          
          <div className="bg-green-50 p-4 rounded">
             <h3 className="font-bold">Listings WITH "Newcastle" Branch ({newcastleDebugInfo.present.length})</h3>
             {newcastleDebugInfo.present.length > 0 ? (
               <ul className="list-disc pl-5 mt-2 max-h-60 overflow-auto text-sm">
                 {newcastleDebugInfo.present.map(l => (
                   <li key={l.id} className="mb-1">
                     <strong>ID: {l.id}</strong> - {l.title}
                   </li>
                 ))}
               </ul>
             ) : (
               <p className="text-red-600">No listings have Newcastle!</p>
             )}
          </div>
        </div>
      </div>

      <div className="mb-8 border p-4 rounded bg-gray-50">
        <h2 className="text-xl font-bold mb-2">Debug Info</h2>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <h3 className="font-bold">Active Tab (Category)</h3>
            <p>{categories?.[activeTab]?.name || 'Unknown'}</p>
          </div>
          <div>
             <h3 className="font-bold">Total Real Listings</h3>
             <p>{allListings.length}</p>
          </div>
        </div>
        
        <div className="mt-4">
          <h3 className="font-bold">Location Hierarchy Counts (from hook)</h3>
          <pre className="bg-white p-2 border rounded overflow-auto max-h-60 text-xs">
            {JSON.stringify(locationHierarchy, null, 2)}
          </pre>
        </div>
      </div>

      <div className="border p-4 rounded">
        <h2 className="text-xl font-bold mb-4">Search Container Component</h2>
        <SearchContainer
          categories={categories}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          allListings={allListings}
          filters={filters}
          setFilters={setFilters}
          handleSearch={() => console.log('Search triggered')}
          // Pass minimal required props
          selectedCategory={categories?.[activeTab]?.name}
          setSelectedCategory={() => {}}
          setSelectedTown={() => {}}
          locationsData={locationHierarchy}
          isFullLoaded={!listingsLoading}
          totalListings={allListings.length}
        />
      </div>
    </div>
  );
}

