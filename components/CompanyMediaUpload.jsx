"use client"; 
 
import { useState, useEffect, useRef } from "react";
import { updateCompanyField } from "@/graphql/mutations/updateCompany";
 
/** 
 * Generic uploader for company media (video or profile picture) 
 * 
 * @param {Object} props 
 * @param {Object} props.company - Company object with documentId + existing URLs 
 * @param {"video" | "image"} props.type - Type of file to upload 
 */ 
export default function CompanyMediaUpload({ company, type = "video" }) { 
  const [file, setFile] = useState(null); 
  const [previewUrl, setPreviewUrl] = useState(""); 
  const [uploading, setUploading] = useState(false); 
  const [error, setError] = useState("");
  const [blobUrl, setBlobUrl] = useState(null);
  const [showUploadButton, setShowUploadButton] = useState(false);
  const [fileDialogOpen, setFileDialogOpen] = useState(false);
  
  // Check if video slot is available for this company
  const hasVideoSlot = type === "video" ? !!company?.videoSlot : true;

  // Pick which backend fields to use 
  const fieldUrl = type === "video" ? "videoUrl" : "profilePicUrl"; 
  const fieldPublicId = 
    type === "video" ? "videoPublicId" : "profilePicPublicId"; 

  // Set initial preview from backend 
  useEffect(() => { 
    if (company?.[fieldUrl]) { 
      setPreviewUrl(company[fieldUrl]); 
    } 
  }, [company, fieldUrl]);
  
  // Clean up blob URLs when component unmounts or when a new blob is created
  useEffect(() => {
    return () => {
      if (blobUrl) {
        URL.revokeObjectURL(blobUrl);
      }
    };
  }, [blobUrl]);
  
  // Track when file dialog is opened/closed
  useEffect(() => {
    const handleFocus = () => {
      // Dialog was closed
      if (fileDialogOpen) {
        setFileDialogOpen(false);
      }
    };
    
    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, [fileDialogOpen]); 

  const handleFileChange = (e) => { 
    const selected = e.target.files[0]; 
    if (!selected) return; 

    // Clear any previous errors
    setError("");
    
    // Validation 
    if (type === "video") { 
      const maxSize = 50 * 1024 * 1024; // 50MB 
      if (selected.size > maxSize) { 
        setError("File too large. Max 50MB allowed."); 
        e.target.value = ""; // Reset input on error
        return; 
      } 
      if (!selected.type.startsWith("video/")) { 
        setError("Please upload a valid video file."); 
        e.target.value = ""; // Reset input on error
        return; 
      }
    } else if (type === "image") { 
      const maxSize = 5 * 1024 * 1024; // 5MB 
      if (selected.size > maxSize) { 
        setError("Image too large. Max 5MB allowed."); 
        e.target.value = ""; // Reset input on error
        return; 
      } 
      if (!selected.type.startsWith("image/")) { 
        setError("Please upload a valid image file."); 
        e.target.value = ""; // Reset input on error
        return; 
      }
    } 

    // Clean up previous blob URL if it exists
    if (blobUrl) {
      URL.revokeObjectURL(blobUrl);
    }

    // Create new blob URL and store it
    const newBlobUrl = URL.createObjectURL(selected);
    setBlobUrl(newBlobUrl);
    
    // Set the preview URL directly to the blob URL
    setPreviewUrl(newBlobUrl);
    
    // Set file state
    setFile(selected);
    
    // Show upload button after file is selected
    setShowUploadButton(true);
    
    // Mark file dialog as closed
    setFileDialogOpen(false);
  }; 

  const handleUpload = async () => { 
    if (!file) return; 

    setUploading(true); 
    setError(""); 
    // Hide upload button during upload
    setShowUploadButton(false);

    try { 
      const formData = new FormData(); 
      formData.append("file", file); 
      formData.append( 
        "upload_preset", 
        process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET 
      ); 
      formData.append("folder", company.name.replace(/\s+/g, "_")); 

      // Cloudinary endpoint changes depending on type 
      const resourceType = type === "video" ? "video" : "image"; 

      const uploadRes = await fetch( 
        `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/${resourceType}/upload`, 
        { 
          method: "POST", 
          body: formData, 
        } 
      ); 

      const uploadData = await uploadRes.json(); 
      if (uploadData.error) throw new Error(uploadData.error.message); 

      // Update Strapi 
      const updateResult = await updateCompanyField(company.documentId, { 
        [fieldUrl]: uploadData.secure_url, 
        [fieldPublicId]: uploadData.public_id, 
      }); 
      
      if (!updateResult) {
        throw new Error("Failed to update company record");
      }

      // Update preview immediately 
      setPreviewUrl(uploadData.secure_url); 
      setFile(null);
      
      // Force refresh to show the updated content
      if (type === "video") {
        const videoElement = document.querySelector("video");
        if (videoElement) {
          videoElement.load();
        }
      }
      
      // Reset file input to ensure it can be used again
      const fileInput = document.getElementById(`file-input-${type}`);
      if (fileInput) {
        fileInput.value = "";
      }
    } catch (err) { 
      console.error("Upload failed:", err); 
      setError("Upload failed. Please try again."); 
    } finally { 
      setUploading(false); 
    } 
  }; 

  // Handle opening the file dialog
  const fileInputRef = useRef(null);
  
  const openFileDialog = () => {
    setFileDialogOpen(true);
    fileInputRef.current?.click();
  };

  return (
    <div className="mb-4">
      <div className="flex items-center justify-between">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {type === "video" ? "Company Video" : "Profile Picture"}
        </label>
        
        {/* Video Slot Status Indicator */}
        {type === "video" && (
          <div className={`text-xs font-medium px-2 py-1 rounded ${hasVideoSlot ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
            {hasVideoSlot ? 'Video Slot Active' : 'Video Slot Inactive'}
          </div>
        )}
      </div>

      {/* Preview or Locked State */}
      {type === "video" && !hasVideoSlot ? (
        <div className="mb-3 border rounded p-4 bg-gray-50">
          <div className="flex flex-col items-center justify-center text-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-gray-400 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
            <h3 className="text-gray-700 font-medium mb-1">Video Upload Locked</h3>
            <p className="text-gray-500 text-sm">Your account does not have an active video slot. Please contact support to enable this feature.</p>
          </div>
        </div>
      ) : (
        <>
          {/* Preview */}
          {previewUrl && (
            <div className="mb-3">
              {type === "video" ? (
                <video
                  src={previewUrl}
                  controls
                  className="w-full max-h-64 object-contain border rounded"
                />
              ) : (
                <img
                  src={previewUrl}
                  alt="Profile"
                  className="w-32 h-32 object-cover border rounded"
                  loading="lazy"
                />
              )}
            </div>
          )}

          {/* Upload input - hidden but referenced */}
          <input
            ref={fileInputRef}
            type="file"
            accept={type === "video" ? "video/*" : "image/*"}
            onChange={handleFileChange}
            className="hidden"
            disabled={type === "video" && !hasVideoSlot}
          />

          {/* Buttons outside cards */}
          <div className="flex items-center space-x-3 mt-4">
            <button
              type="button"
              onClick={openFileDialog}
              className={`py-2 px-4 text-sm font-semibold rounded focus:outline-none focus:ring-2 ${
                type === "video" && !hasVideoSlot 
                  ? "bg-gray-100 text-gray-400 cursor-not-allowed" 
                  : "bg-blue-50 text-blue-700 hover:bg-blue-100 focus:ring-blue-500"
              }`}
              disabled={uploading || (type === "video" && !hasVideoSlot)}
            >
              {type === "video" ? "Select Video" : "Select Image"}
            </button>
            
            {/* Upload button - only shown when file is selected and not uploading */}
            {showUploadButton && !uploading && (
              <button
                type="button"
                onClick={handleUpload}
                className="py-2 px-4 bg-green-600 text-white text-sm font-semibold rounded hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500"
                disabled={type === "video" && !hasVideoSlot}
              >
                Upload {type === "video" ? "Video" : "Image"}
              </button>
            )}
            
            {uploading && (
              <span className="ml-3 text-blue-600 font-medium">Uploading...</span>
            )}
          </div>
        </>
      )}

      {/* Error message */}
      {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
    </div>
  ); 
}