// "use client";

// import React from "react";
// import BranchCard from "@/components/BranchCard";

// export default function ViewListingByBranchesModal({ listing, onClose, onSelectBranch }) {
//   if (!listing) return null;
//   const branches = Array.isArray(listing.branches) ? listing.branches : [];

//   return (
//     <div className="fixed inset-0 z-50 flex items-center justify-center">
//       <div
//         className="absolute inset-0 bg-black/50"
//         onClick={onClose}
//         aria-label="Close Modal"
//       />
//       <div className="relative bg-white w-full max-w-2xl mx-4 rounded-lg shadow-xl overflow-hidden">
//         <div className="flex items-center justify-between px-4 py-3 border-b">
//           <h3 className="text-base font-semibold text-gray-800">Select Branch</h3>
//           <button
//             onClick={onClose}
//             className="text-gray-500 hover:text-gray-700"
//             aria-label="Close"
//           >
//             ✕
//           </button>
//         </div>

//         <div className="p-4 grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[70vh] overflow-y-auto">
//           {branches.length === 0 && (
//             <p className="text-sm text-gray-500">No branches found.</p>
//           )}
//           {branches.map((branch) => (
//             <BranchCard key={branch.id || branch.documentId} branch={branch} onSelect={onSelectBranch} />
//           ))}
//         </div>
//       </div>
//     </div>
//   );
// }