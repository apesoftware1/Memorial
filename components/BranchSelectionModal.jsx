import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { addListingToBranch } from "@/lib/addListingToBranch";

export default function BranchSelectionModal({ 
  isOpen, 
  onClose, 
  branches = [], 
  listingId,
  onSuccess
}) {
  const handleBranchSelect = async (branch) => {
    try {
      // Log the values for testing
      console.log('Branch documentId:', branch.documentId);
      console.log('Listing ID:', listingId);
      
      // Call the addListingToBranch function with branch.documentId and listingId
      await addListingToBranch(branch.documentId, listingId);
      
      // Log success message
      console.log('Successfully added listing to branch:', {
        branchId: branch.documentId,
        branchName: branch.name,
        listingId: listingId
      });
      
      // Call onSuccess callback if provided
      if (onSuccess) {
        onSuccess(branch);
      }
      
      // Close the modal
      onClose();
    } catch (error) {
      console.error("Error adding listing to branch:", error);
      console.error("Error details:", {
        branchId: branch?.documentId,
        listingId: listingId,
        error: error.message
      });
      // You could add error handling UI here
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add to Branch</DialogTitle>
        </DialogHeader>
        <div className="py-4">
          <h3 className="font-medium text-gray-700 mb-2">Select a branch:</h3>
          <div className="max-h-[300px] overflow-y-auto">
            <ul className="space-y-2">
              {branches.length > 0 ? (
                branches.map((branch) => (
                  <li 
                    key={branch.documentId || branch.id}
                    onClick={() => handleBranchSelect(branch)}
                    className="p-3 border rounded-md cursor-pointer hover:bg-blue-50 transition-colors"
                  >
                    <div className="font-medium">{branch.name}</div>
                    {branch.city && (
                      <div className="text-sm text-gray-500 mt-1">
                        {[branch.city, branch.province].filter(Boolean).join(", ")}
                      </div>
                    )}
                  </li>
                ))
              ) : (
                <p className="text-gray-500 italic">No branches available</p>
              )}
            </ul>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}