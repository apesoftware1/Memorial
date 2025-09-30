import React, { useState } from "react";
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

export default function BranchButton({ company }) {
  const [showBranchSelectorModal, setShowBranchSelectorModal] = useState(false);
  const [selectedBranch, setSelectedBranch] = useState(null);

  const handleBranchSelect = (branch) => {
    setSelectedBranch(branch);
  };

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
            onClick={() => setShowBranchSelectorModal(true)}
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