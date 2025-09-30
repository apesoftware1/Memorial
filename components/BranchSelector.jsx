"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import BranchDropdown from "@/components/BranchDropdown";

/**
 * BranchSelector - A reusable component for selecting branches and updating URL query parameters
 * 
 * @param {Object} props
 * @param {string} props.companyId - The ID of the company
 * @param {Array} props.branches - Array of branch objects with at least id and name properties
 * @param {string} [props.paramKey="Branch"] - The query parameter key to use (defaults to "Branch")
 * @param {string} [props.basePath="/manufacturers/manufacturers-Profile-Page"] - Base path for navigation
 * @param {Function} [props.onBranchSelect] - Optional callback when a branch is selected
 * @param {Object} [props.styles] - Optional styles for the container
 * @param {boolean} [props.preservePathname=false] - Whether to preserve the current pathname when switching branches
 * @param {boolean} [props.showMainBranchOption=true] - Whether to show the "Main Branch" option
 * @param {string} [props.mainBranchLabel="Main Branch"] - Label for the main branch option
 */
export default function BranchSelector({
  companyId,
  branches = [],
  paramKey = "Branch",
  basePath = "/manufacturers/manufacturers-Profile-Page",
  onBranchSelect,
  styles = {},
  preservePathname = false,
  showMainBranchOption = true,
  mainBranchLabel = "Main Branch",
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const [selectedBranch, setSelectedBranch] = useState(null);
  
  // Determine if we're in the editor or slug page
  const isInSlugPage = pathname.includes(`/[slug]`) || pathname.includes(`/${companyId}`);
  const isInEditorPage = pathname.includes(`/manufacturers-Profile-Page`) && !pathname.includes(`/${companyId}`);

  // Effect to handle direct navigation if only one branch exists
  useEffect(() => {
    if (branches?.length === 1 && !searchParams.get(paramKey)) {
      handleBranchSelect(branches[0]);
    }
  }, [branches]);

  // Handle branch selection
  const handleBranchSelect = (branch) => {
    if (!branch) return;
    
    setSelectedBranch(branch);
    
    // Check if this is the "Main Branch" option (has isMainBranch flag)
    if (branch.isMainBranch) {
      // Create new URL without the branch parameter but preserving all other parameters
      const params = new URLSearchParams(searchParams.toString());
      
      // Specifically remove the Branch parameter (case-insensitive)
      Array.from(params.keys()).forEach(key => {
        if (key.toLowerCase() === paramKey.toLowerCase()) {
          params.delete(key);
        }
      });
      
      // Determine the base path to navigate to
      let basePart;
      
      if (preservePathname) {
        // If preservePathname is true, stay on current pathname
        basePart = pathname;
      } else if (isInEditorPage) {
        // If in editor page, stay on editor page
        basePart = pathname;
      } else {
        // Otherwise, go to the base path
        basePart = `${basePath}`;
      }
      
      // Add company ID if needed and not already in the path
      const newPath = params.toString() 
        ? `${basePart}?${params.toString()}`
        : basePart;
      
      router.push(newPath);
    } else {
      // Regular branch selection
      // Create new URL with updated query parameter
      const params = new URLSearchParams(searchParams.toString());
      params.set(paramKey, branch.name || `Branch ${branch.id}`);
      
      // Determine the path to navigate to based on context
      let newPath;
      
      if (preservePathname || (isInEditorPage && !isInSlugPage)) {
        // If in editor page or preservePathname is true, stay on current page
        newPath = `${pathname}?${params.toString()}`;
      } else {
        // Otherwise, use the standard path with companyId
        newPath = `${basePath}/${companyId}?${params.toString()}`;
      }
      
      router.push(newPath);
    }
    
    // Call optional callback if provided
    if (typeof onBranchSelect === 'function') {
      onBranchSelect(branch);
    }
  };

  // If there are no branches, don't render anything
  if (!branches || branches.length === 0) {
    return null;
  }

  // If there's only one branch and it's already selected, don't show dropdown
  if (branches.length === 1 && selectedBranch && !showMainBranchOption) {
    return (
      <div style={{ ...styles }}>
        <div>Current Branch: {branches[0].name || `Branch ${branches[0].id}`}</div>
      </div>
    );
  }

  // Add Main Branch option to branches if enabled
  const branchesWithMainOption = showMainBranchOption 
    ? [{ id: 'main', name: mainBranchLabel, isMainBranch: true }, ...branches]
    : branches;

  // Render dropdown for multiple branches
  return (
    <div style={{ ...styles }}>
      <BranchDropdown
        branches={branchesWithMainOption}
        onSelect={(branch) => handleBranchSelect(branch)}
      />
    </div>
  );
}