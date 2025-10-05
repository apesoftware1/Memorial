import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { addListingToBranch } from "@/lib/addListingToBranch";

export default function BranchSelectionModal({ 
  isOpen, 
  onClose, 
  branches = [], 
  listingId,
  onSuccess
}) {
  const [showMessage, setShowMessage] = useState(false);
  const [message, setMessage] = useState("");
  const [isSuccess, setIsSuccess] = useState(true);

  const handleBranchSelect = async (branch) => {
    try {
      // Show immediate toast notification that the process has started
      setMessage(`Adding listing to ${branch.name} branch...`);
      setIsSuccess(true);
      setShowMessage(true);
      
      // Call the addListingToBranch function with branch.documentId and listingId
      await addListingToBranch(branch.documentId, listingId);
      
      // Call onSuccess callback if provided
      if (onSuccess) {
        onSuccess(branch);
      }
      
      // Close the modal first
      onClose();
      
      // Show success message after a short delay (after modal closes)
      setTimeout(() => {
        setMessage(`Listing added to ${branch.name} branch successfully!`);
        setIsSuccess(true);
        setShowMessage(true);
        
        // Auto-close the message after 2 seconds
        setTimeout(() => {
          setShowMessage(false);
        }, 5000);
      }, 800);
    } catch (error) {
      // Show error message
      setMessage(`Error: ${error.message || "Failed to add listing to branch"}`);
      setIsSuccess(false);
      setShowMessage(true);
      
      // Auto-hide error message after 3 seconds
      setTimeout(() => {
        setShowMessage(false);
      }, 3000);
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
    <>
      {showMessage && (
        <div 
          className={`fixed top-4 right-4 z-50 p-4 rounded-md shadow-md flex items-center space-x-2 ${
            isSuccess ? 'bg-green-500 text-white' : 'bg-red-500 text-white'
          }`}
        >
          <div className="flex-1">
            <p className="font-medium">{message}</p>
          </div>
          <button 
            onClick={() => setShowMessage(false)}
            className="text-white hover:text-gray-200"
          >
            ×
          </button>
        </div>
      )}
      
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader className="bg-black rounded-t-lg p-2">
            <DialogTitle className="text-white">Add to Branch</DialogTitle>
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
    </>
  );
}