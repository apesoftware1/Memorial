import { useMemo } from 'react';
import { buildLocationTree } from '@/lib/locationTree';

export function useLocationHierarchy(allListings, categories, activeTab) {
  return useMemo(() => {
    // Determine relevant listings based on current category (activeTab)
    let relevantListings = allListings;
    
    if (Array.isArray(allListings) && categories && categories.length > 0 && activeTab !== undefined) {
      const desiredOrder = [
        "SINGLE",
        "DOUBLE",
        "CHILD",
        "HEAD",
        "PLAQUES",
        "CREMATION",
      ];
      const sortedCategories = desiredOrder
        .map((name) =>
          categories.find((cat) => cat?.name && cat.name.toUpperCase() === name)
        )
        .filter(Boolean);
      const selectedCategoryObj = sortedCategories[activeTab];
      
      if (selectedCategoryObj) {
        relevantListings = allListings.filter(listing => 
          (listing?.listing_category?.name || "").toLowerCase() === selectedCategoryObj.name.toLowerCase()
        );
      }
    }

    return buildLocationTree(relevantListings);
  }, [allListings, activeTab, categories]);
}
