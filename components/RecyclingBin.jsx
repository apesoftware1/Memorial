import React from 'react';
import { Trash2, X, Activity, RefreshCw } from 'lucide-react';

/**
 * RecyclingBin Component
 * Displays a floating action button for the recycling bin with an options drawer.
 * 
 * @param {boolean} isOwner - Whether the current user is the owner (to show/hide)
 * @param {boolean} isOpen - Whether the options drawer is open
 * @param {function} onToggleOpen - Handler to toggle drawer state
 * @param {string} viewMode - Current view mode ('active' | 'bin')
 * @param {function} onViewModeChange - Handler to change view mode
 * @param {number} binCount - Number of items in the bin
 * @param {function} onEmptyBin - Handler for emptying the bin
 */
const RecyclingBin = ({
  isOwner,
  isOpen,
  onToggleOpen,
  viewMode,
  onViewModeChange,
  binCount,
  onEmptyBin
}) => {
  if (!isOwner) return null;

  return (
    <div style={{ position: "fixed", bottom: "24px", right: "24px", zIndex: 1000 }}>
      
      {/* Bin Options Menu */}
      {isOpen && (
        <div 
          style={{
            position: "absolute",
            bottom: "70px",
            right: "0",
            backgroundColor: "white",
            borderRadius: "8px",
            boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
            padding: "8px 0",
            minWidth: "180px",
            overflow: "hidden",
            marginBottom: "8px",
            border: "1px solid #e5e7eb",
            animation: "slideIn 0.2s ease-out"
          }}
        >
           {viewMode === "bin" ? (
             <button
               onClick={() => {
                 onViewModeChange("active");
                 onToggleOpen(false);
               }}
               style={{
                 display: "flex",
                 alignItems: "center",
                 width: "100%",
                 textAlign: "left",
                 padding: "12px 16px",
                 background: "none",
                 border: "none",
                 cursor: "pointer",
                 fontSize: "14px",
                 fontWeight: "500",
                 color: "#374151",
                 transition: "background 0.1s"
               }}
               onMouseOver={(e) => e.currentTarget.style.backgroundColor = "#f3f4f6"}
               onMouseOut={(e) => e.currentTarget.style.backgroundColor = "transparent"}
             >
               <Activity size={16} style={{ marginRight: "8px" }} />
               Back to Active
             </button>
           ) : (
             <button
               onClick={() => {
                 onViewModeChange("bin");
                 // Keep open as requested
               }}
               style={{
                 display: "flex",
                 alignItems: "center",
                 width: "100%",
                 textAlign: "left",
                 padding: "12px 16px",
                 background: "none",
                 border: "none",
                 cursor: "pointer",
                 fontSize: "14px",
                 fontWeight: "500",
                 color: "#374151",
                 transition: "background 0.1s"
               }}
               onMouseOver={(e) => e.currentTarget.style.backgroundColor = "#f3f4f6"}
               onMouseOut={(e) => e.currentTarget.style.backgroundColor = "transparent"}
             >
               <Trash2 size={16} style={{ marginRight: "8px" }} />
               Open Recycling Bin
             </button>
           )}
           
           <button
             onClick={onEmptyBin}
             style={{
               display: "flex",
               alignItems: "center",
               width: "100%",
               textAlign: "left",
               padding: "12px 16px",
               background: "none",
               border: "none",
               cursor: "pointer",
               fontSize: "14px",
               fontWeight: "500",
               color: "#dc2626",
               transition: "background 0.1s",
               borderTop: "1px solid #f3f4f6"
             }}
             onMouseOver={(e) => e.currentTarget.style.backgroundColor = "#fee2e2"}
             onMouseOut={(e) => e.currentTarget.style.backgroundColor = "transparent"}
           >
             <Trash2 size={16} style={{ marginRight: "8px" }} />
             Empty Bin
           </button>
        </div>
      )}

      <button
        onClick={() => onToggleOpen(!isOpen)}
        title="Recycling Bin Options"
        style={{
          width: "56px",
          height: "56px",
          borderRadius: "50%",
          backgroundColor: viewMode === "bin" ? "#4b5563" : "#dc2626", // Gray (bin open) or Red (bin closed)
          color: "#fff",
          border: "none",
          boxShadow: "0 4px 12px rgba(0,0,0,0.3)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          cursor: "pointer",
          transition: "all 0.3s ease",
          transform: isOpen ? "rotate(45deg)" : "rotate(0deg)",
          position: "relative"
        }}
      >
         {isOpen ? <X size={24} /> : (viewMode === "bin" ? <RefreshCw size={24} /> : <Trash2 size={24} />)}
         
         {/* Badge for bin count */}
         {binCount > 0 && (
            <span
              style={{
                position: "absolute",
                top: "-5px",
                right: "-5px",
                backgroundColor: "#fff",
                color: "#dc2626",
                fontSize: "12px",
                fontWeight: "bold",
                minWidth: "20px",
                height: "20px",
                borderRadius: "10px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                padding: "0 4px",
                border: "2px solid #dc2626",
              }}
            >
              {binCount}
            </span>
         )}
      </button>
    </div>
  );
};

export default RecyclingBin;
