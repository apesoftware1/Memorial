"use client";

import React from "react";
import { useRouter } from "next/navigation";
import BranchCard from "./BranchCard";

// Custom wrapper component for BranchCard with sticky branches label
const PremiumBranchCard = ({ 
  branch,
  listing,
  onSelect,
  branchCount 
}: {
  branch: any;
  listing: any;
  onSelect: (branch: any) => void;
  branchCount: number;
}) => {
  const router = useRouter();
  
  const handleBranchSelect = (selectedBranch: any, listingData: any = null) => {
    // First call the provided onSelect function
    onSelect(selectedBranch);
    
    // Then navigate to the product showcase page
    // Use the passed listing data or fall back to the component's listing prop
    const targetListing = listingData || listing;
    if (targetListing && targetListing.documentId) {
      router.push(`/tombstones-for-sale/${targetListing.documentId}?branch=${selectedBranch.name}`);
    }
  };
  
  return (
    <div className="relative mt-0">
      <BranchCard 
        branch={branch}
        listing={listing}
        onSelect={handleBranchSelect}
      />
    </div>
  );
};

interface PremiumListingCardModalProps {
  listing: any;
  onClose: () => void;
  onBranchSelect: (branch: any) => void;
}

export function PremiumListingCardModal({
  listing,
  onClose,
  onBranchSelect,
}: PremiumListingCardModalProps): React.ReactElement {
  if (!listing) return <></>;

  // Get branches array
  const branches = Array.isArray(listing?.branches) ? listing.branches : [];
  
  // Only show this component if there are multiple branches
  if (branches.length <= 1) return <></>;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-auto">
        {/* Header with close button */}
        <div className="flex justify-between items-center p-4 border-b">
          <h2 className="text-xl font-bold">{listing.title}</h2>
          <button 
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
            aria-label="Close modal"
          >
            ✕
          </button>
        </div>
        
        {/* Branch cards */}
        <div className="p-4">
          <div className="grid grid-cols-1 gap-4 mt-7">
            {branches.map((branch: any, index: number) => (
                <PremiumBranchCard 
                  key={branch.id || branch.documentId || index}
                  branch={branch}
                  listing={listing}
                  onSelect={onBranchSelect}
                  branchCount={branches.length}
                />
              ))}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300 transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
