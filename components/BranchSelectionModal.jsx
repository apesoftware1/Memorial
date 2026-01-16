import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { addListingToBranchListing } from "@/lib/addListingToBranch";

export default function BranchSelectionModal({
  isOpen,
  onClose,
  branches = [],
  listingId,
  onSuccess,
}) {
  const [showMessage, setShowMessage] = useState(false);
  const [message, setMessage] = useState("");
  const [isSuccess, setIsSuccess] = useState(true);
  const [selectedBranch, setSelectedBranch] = useState(null);
  const [price, setPrice] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleBranchSelect = (branch) => {
    setSelectedBranch(branch);
  };

  const handleConfirm = async () => {
    if (!selectedBranch || !listingId) {
      return;
    }

    const numericPrice = Number(price);

    if (!price || Number.isNaN(numericPrice) || numericPrice < 0) {
      setMessage("Please enter a valid price.");
      setIsSuccess(false);
      setShowMessage(true);
      return;
    }

    try {
      setIsSubmitting(true);
      setMessage(
        `Adding listing to ${selectedBranch.name} branch with price ${numericPrice}...`
      );
      setIsSuccess(true);
      setShowMessage(true);

      await addListingToBranchListing({
        listingDocumentId: listingId,
        branchDocumentId: selectedBranch.documentId || selectedBranch.id,
        price: numericPrice,
      });

      if (onSuccess) {
        onSuccess(selectedBranch);
      }

      onClose();

      setTimeout(() => {
        setMessage(
          `Listing added to ${selectedBranch.name} branch successfully.`
        );
        setIsSuccess(true);
        setShowMessage(true);

        setTimeout(() => {
          setShowMessage(false);
        }, 5000);
      }, 800);
    } catch (error) {
      setMessage(
        `Error: ${error.message || "Failed to add listing to branch"}`
      );
      setIsSuccess(false);
      setShowMessage(true);

      setTimeout(() => {
        setShowMessage(false);
      }, 3000);

      console.error("Error adding listing to branch:", error);
      console.error("Error details:", {
        branchId: selectedBranch?.documentId || selectedBranch?.id,
        listingId: listingId,
        error: error.message,
      });
    } finally {
      setIsSubmitting(false);
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
            {!selectedBranch && (
              <>
                <h3 className="font-medium text-gray-700 mb-2">
                  Select a branch:
                </h3>
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
                              {[branch.city, branch.province]
                                .filter(Boolean)
                                .join(", ")}
                            </div>
                          )}
                        </li>
                      ))
                    ) : (
                      <p className="text-gray-500 italic">
                        No branches available
                      </p>
                    )}
                  </ul>
                </div>
              </>
            )}

            {selectedBranch && (
              <div className="space-y-4">
                <div>
                  <p className="font-medium text-gray-700">
                    Selected branch: {selectedBranch.name}
                  </p>
                  {selectedBranch.city && (
                    <p className="text-sm text-gray-500">
                      {[selectedBranch.city, selectedBranch.province]
                        .filter(Boolean)
                        .join(", ")}
                    </p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Price for this branch
                  </label>
                  <input
                    type="number"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    min="0"
                    step="0.01"
                  />
                </div>
                <div className="flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedBranch(null);
                      setPrice("");
                    }}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
                  >
                    Back
                  </button>
                  <button
                    type="button"
                    onClick={handleConfirm}
                    disabled={isSubmitting}
                    className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-60"
                  >
                    {isSubmitting ? "Saving..." : "Confirm"}
                  </button>
                </div>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
