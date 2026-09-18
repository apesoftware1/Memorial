import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import BranchSelector from "@/components/BranchSelector";

export default function BranchSelectorModal({ 
  isOpen, 
  onClose, 
  companyId, 
  branches, 
  onBranchSelect,
  paramKey,
  basePath,
  preservePathname,
  showMainBranchOption = false,
  mainBranchLabel,
}) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Switch Branch</DialogTitle>
          <DialogDescription>
            Select a branch from the list below.
          </DialogDescription>
        </DialogHeader>
        <div className="py-4">
          <BranchSelector
            companyId={companyId}
            branches={branches}
            showMainBranchOption={showMainBranchOption}
            mainBranchLabel={mainBranchLabel}
            paramKey={paramKey}
            basePath={basePath}
            preservePathname={preservePathname}
            onBranchSelect={(branch) => {
              onBranchSelect(branch);
              onClose(false);
            }}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}