import React, { useState, useEffect } from "react"
import { AlertTriangle, X } from "lucide-react"
import { updateBranch } from "@/graphql/mutations/updateBranch"

export function ConfirmationModal({ 
  isOpen, 
  onClose, 
  onConfirm, 
  title = "Confirm Action", 
  message = "Are you sure you want to proceed?",
  confirmText = "Confirm",
  cancelText = "Cancel",
  type = "danger", // "danger", "warning", "info"
  // --- Added optional props to support removing a listing from a branch ---
  branches = [], // Array of branch objects with { documentId, name }
  listingId, // The listing documentId to disconnect
  onBranchRemoved // callback(branchId) after successful removal
}) {
  if (!isOpen) return null

  // --- Local state for branch removal ---
  const [selectedBranchId, setSelectedBranchId] = useState("")
  const [removing, setRemoving] = useState(false)
  const [removeError, setRemoveError] = useState("")
  const [removeSuccess, setRemoveSuccess] = useState(false)

  // Accessibility: close on Escape, confirm on Enter
  useEffect(() => {
    if (!isOpen) return
    const onKey = (e) => {
      if (e.key === "Escape") onClose?.()
      if (e.key === "Enter") {
        e.preventDefault()
        onConfirm?.()
        onClose?.()
      }
    }
    document.addEventListener("keydown", onKey)
    return () => document.removeEventListener("keydown", onKey)
  }, [isOpen, onClose, onConfirm])

  const getTypeStyles = () => {
    switch (type) {
      case "danger":
        return {
          iconBg: "bg-red-100",
          iconColor: "text-red-600",
          confirmBtn: "bg-red-600 hover:bg-red-700 focus:ring-red-500"
        }
      case "warning":
        return {
          iconBg: "bg-amber-100",
          iconColor: "text-amber-600",
          confirmBtn: "bg-amber-600 hover:bg-amber-700 focus:ring-amber-500"
        }
      case "info":
        return {
          iconBg: "bg-blue-100",
          iconColor: "text-blue-600",
          confirmBtn: "bg-blue-600 hover:bg-blue-700 focus:ring-blue-500"
        }
      default:
        return {
          iconBg: "bg-red-100",
          iconColor: "text-red-600",
          confirmBtn: "bg-red-600 hover:bg-red-700 focus:ring-red-500"
        }
    }
  }

  const styles = getTypeStyles()

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose()
    }
  }

  const handleConfirm = () => {
    onConfirm()
    onClose()
  }

  // --- Removal handler ---
  const handleRemoveFromBranch = async () => {
    if (!selectedBranchId || !listingId) return
    setRemoving(true)
    setRemoveError("")
    setRemoveSuccess(false)
    try {
      await updateBranch(selectedBranchId, { listings: { disconnect: [listingId] } })
      setRemoveSuccess(true)
      if (typeof onBranchRemoved === "function") {
        onBranchRemoved(selectedBranchId)
      }
      // Close and reload to reflect changes
      onClose?.()
      setTimeout(() => {
        if (typeof window !== "undefined") {
          window.location.reload()
        }
      }, 500)
    } catch (err) {
      setRemoveError(err?.message || "Failed to remove listing from branch")
    } finally {
      setRemoving(false)
    }
  }

  return (
    <div 
      className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50"
      onClick={handleBackdropClick}
    >
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full mx-4 overflow-hidden ring-1 ring-black/5">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className={`flex-shrink-0 w-10 h-10 rounded-full ${styles.iconBg} flex items-center justify-center`}>
              <AlertTriangle className={`w-5 h-5 ${styles.iconColor}`} />
            </div>
            <h3 className="text-lg font-semibold text-gray-900">
              {title}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          <p className="text-gray-600 leading-relaxed">
            {message}
          </p>

          {/* --- Added: Remove listing from branch section --- */}
          {Array.isArray(branches) && branches.length > 0 && listingId && (
            <div className="mt-4 p-3 border border-gray-200 rounded-xl bg-gray-50">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Remove listing from a branch
              </label>
              <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
                <select
                  className="flex-1 min-w-0 px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-amber-400"
                  value={selectedBranchId}
                  onChange={(e) => setSelectedBranchId(e.target.value)}
                >
                  <option value="">Select a branch</option>
                  {branches.map((b) => {
                    const bid = b?.documentId || b?.id || ""
                    const name = b?.name || b?.branchName || "Unnamed Branch"
                    return (
                      <option key={bid} value={bid}>
                        {name}
                      </option>
                    )
                  })}
                </select>
              </div>
              {removeError && (
                <p className="text-sm text-red-600 mt-2">{removeError}</p>
              )}
              {removeSuccess && (
                <p className="text-sm text-green-600 mt-2">Listing removed from branch.</p>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end space-x-3 p-6 border-t border-gray-200 bg-gray-50">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-colors"
          >
            {cancelText}
          </button>
          {Array.isArray(branches) && branches.length > 0 && listingId && (
            <button
              onClick={handleRemoveFromBranch}
              disabled={!selectedBranchId || removing}
              className="px-4 py-2 text-sm font-medium text-white rounded-lg bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 whitespace-nowrap"
            >
              {removing ? "Removing…" : "Remove From Branch"}
            </button>
          )}
          <button
            onClick={handleConfirm}
            className={`px-4 py-2 text-sm font-medium text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2 transition-colors ${styles.confirmBtn}`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  )
}
