"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import BranchSelectorModal from "./BranchSelectorModal";

// SVG Branch Options icon component
const BranchOptionsIcon = (props) => (
  <svg
    width="18"
    height="18"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    <path
      d="M6 3v12"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <circle
      cx="6"
      cy="18"
      r="3"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <circle
      cx="18"
      cy="6"
      r="3"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M18 9v6a3 3 0 0 1-3 3H6"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

// Back arrow icon component
const BackArrowIcon = (props) => (
  <svg
    width="18"
    height="18"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    <path
      d="M19 12H5"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M12 19l-7-7 7-7"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

export default function BranchButton({ company }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const [showBranchSelectorModal, setShowBranchSelectorModal] = useState(false);
  const [selectedBranch, setSelectedBranch] = useState(null);
  const [branchSwitched, setBranchSwitched] = useState(false);
  
  // Check URL for branch parameter on component mount and updates
  useEffect(() => {
    if (searchParams.has('branch')) {
      setBranchSwitched(true);
    } else {
      setBranchSwitched(false);
    }
  }, [searchParams]);

  const handleBranchSelect = (branch) => {
    setSelectedBranch(branch);
    setBranchSwitched(true);
  };

  // Function to handle going back to previous state
  const handleBack = () => {
    setBranchSwitched(false);
    // If we're on a page with branch parameter, remove it
    if (searchParams.has('branch')) {
      const params = new URLSearchParams(searchParams.toString());
      params.delete('branch');
      router.push(`${pathname}?${params.toString()}`);
    }
  };

  // Function to handle non-logged-in users switching to main branch
  const handleSwitchToMainBranch = () => {
    // For non-logged-in users, redirect to the main branch
    if (company?.documentId) {
      // Check if we're already on a tombstone listing page
      if (pathname.includes('/tombstones-for-sale/')) {
        // Stay on the current page - we're already on a listing
        setBranchSwitched(true);
        return;
      } else {
        // Navigate to the main branch page
        router.push(`/manufacturers/manufacturers-Profile-Page/${company.documentId}`);
      }
    }
  };

  // Render back button if branch was switched
  if (branchSwitched) {
    return (
      <button
        onClick={handleBack}
        style={{
          background: "#4a6cf7",
          color: "#fff",
          borderRadius: 8,
          padding: "12px 16px",
          fontWeight: 700,
          fontSize: 15,
          border: "none",
          cursor: "pointer",
          boxShadow: "0 2px 8px rgba(0,0,0,0.07)",
          transition: "background 0.2s",
          marginBottom: 8,
          marginRight: 8,
          display: "flex",
          alignItems: "center",
          gap: "8px",
        }}
      >
        <BackArrowIcon />
        <span>Back</span>
      </button>
    );
  }

  // Render branch button if branch was not switched
  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button
            style={{
              background: "#4a6cf7",
              color: "#fff",
              borderRadius: 8,
              padding: "12px 16px",
              fontWeight: 700,
              fontSize: 15,
              border: "none",
              cursor: "pointer",
              boxShadow: "0 2px 8px rgba(0,0,0,0.07)",
              transition: "background 0.2s",
              marginBottom: 8,
              marginRight: 8,
              display: "flex",
              alignItems: "center",
              gap: "8px",
            }}
          >
            <BranchOptionsIcon />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem
            onClick={() => {
              // Check if user is logged in (based on branches availability)
              if (company?.branches && company.branches.length > 0) {
                setShowBranchSelectorModal(true);
              } else {
                // For non-logged-in users, go to main branch
                handleSwitchToMainBranch();
              }
            }}
          >
            Switch Branch
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Branch Selector Modal */}
      <BranchSelectorModal
        isOpen={showBranchSelectorModal}
        onClose={() => setShowBranchSelectorModal(false)}
        companyId={company?.documentId}
        branches={company?.branches}
        onBranchSelect={handleBranchSelect}
      />
    </>
  );
}
