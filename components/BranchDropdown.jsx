"use client";
import { useState } from "react";

export default function BranchDropdown({ branches = [], onSelect }) {
  const [selected, setSelected] = useState("");

  const handleSelect = (branch) => {
    const branchId = branch.id || branch.documentId;
    setSelected(branchId);

    if (onSelect && branch) {
      onSelect(branch);
    }
  };

  return (
    <div className="w-full">
      <h3 className="font-medium text-gray-700 mb-2">Available Branches</h3>
      <div className="max-h-[300px] overflow-y-auto">
        <ul className="space-y-2">
          {branches.map((branch) => (
            <li 
              key={branch.id || branch.documentId}
              onClick={() => handleSelect(branch)}
              className={`p-3 border rounded-md cursor-pointer hover:bg-blue-50 transition-colors ${
                selected === (branch.id || branch.documentId) ? 'bg-blue-100 border-blue-300' : 'bg-white'
              }`}
            >
              <div className="font-medium">{branch.name}</div>
              {branch.city && (
                <div className="text-sm text-gray-500 mt-1">
                  {[branch.city, branch.province].filter(Boolean).join(", ")}
                </div>
              )}
            </li>
          ))}
        </ul>
      </div>
      {branches.length === 0 && (
        <p className="text-gray-500 italic">No branches available</p>
      )}
    </div>
  );
}