"use client"; 
 
import { useState, useEffect } from "react"; 
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

  const handleFileChange = (e) => { 
    const selected = e.target.files[0]; 
    if (!selected) return; 

    // Validation 
    if (type === "video") { 
      const maxSize = 50 * 1024 * 1024; // 50MB 
      if (selected.size > maxSize) { 
        setError("File too large. Max 50MB allowed."); 
        return; 
      } 
      if (!selected.type.startsWith("video/")) { 
        setError("Please upload a valid video file."); 
        return; 
      } 
    } else if (type === "image") { 
      const maxSize = 5 * 1024 * 1024; // 5MB 
      if (selected.size > maxSize) { 
        setError("Image too large. Max 5MB allowed."); 
        return; 
      } 
      if (!selected.type.startsWith("image/")) { 
        setError("Please upload a valid image file."); 
        return; 
      } 
    } 

    setFile(selected); 
    setError(""); 
  }; 

  const handleUpload = async () => { 
    if (!file) return; 

    setUploading(true); 
    setError(""); 

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
      await updateCompanyField(company.documentId, { 
        [fieldUrl]: uploadData.secure_url, 
        [fieldPublicId]: uploadData.public_id, 
      }); 

      // Update preview immediately 
      setPreviewUrl(uploadData.secure_url); 
      setFile(null); 
    } catch (err) { 
      console.error("Upload failed:", err); 
      setError("Upload failed. Please try again."); 
    } finally { 
      setUploading(false); 
    } 
  }; 

  return (
    <div style={{ position: "relative", width: "100%", height: "100%" }}>
      {previewUrl ? (
        <div 
          style={{ 
            position: "relative", 
            width: "100%", 
            height: "100%", 
            cursor: "pointer" 
          }}
          onClick={() => document.getElementById(`file-input-${type}`).click()}
        >
          {type === "video" ? (
            <video
              src={previewUrl}
              style={{
                objectFit: "cover",
                width: "100%",
                height: "100%",
                borderRadius: 6,
              }}
            />
          ) : (
            <img
              src={`${previewUrl}?t=${Date.now()}`}
              alt="Profile"
              style={{
                objectFit: "cover",
                width: "100%",
                height: "100%",
                borderRadius: 6,
              }}
            />
          )}
          
          {/* Overlay on hover */}
          <div
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              opacity: 0,
              transition: "opacity 0.2s",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              backgroundColor: "rgba(0,0,0,0.3)",
              borderRadius: 6,
            }}
            className="hover:opacity-100"
          >
            <svg 
              width="24" 
              height="24" 
              viewBox="0 0 24 24" 
              fill="none" 
              stroke="white" 
              strokeWidth="2" 
              strokeLinecap="round" 
              strokeLinejoin="round"
            >
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
              <polyline points="17 8 12 3 7 8"></polyline>
              <line x1="12" y1="3" x2="12" y2="15"></line>
            </svg>
          </div>
        </div>
      ) : (
        <div 
          style={{ 
            width: "100%", 
            height: "100%", 
            display: "flex", 
            alignItems: "center", 
            justifyContent: "center",
            cursor: "pointer",
            border: "1px dashed #ccc",
            borderRadius: 6,
          }}
          onClick={() => document.getElementById(`file-input-${type}`).click()}
        >
          <svg 
            width="24" 
            height="24" 
            viewBox="0 0 24 24" 
            fill="none" 
            stroke="#666" 
            strokeWidth="2" 
            strokeLinecap="round" 
            strokeLinejoin="round"
          >
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
            <polyline points="17 8 12 3 7 8"></polyline>
            <line x1="12" y1="3" x2="12" y2="15"></line>
          </svg>
        </div>
      )}
      
      {/* Hidden file input */}
      <input
        id={`file-input-${type}`}
        type="file"
        accept={type === "video" ? "video/*" : "image/*"}
        onChange={(e) => {
          handleFileChange(e);
          if (e.target.files[0]) {
            handleUpload();
          }
        }}
        style={{ display: "none" }}
        disabled={uploading}
      />
      
      {uploading && (
        <div 
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: "rgba(255,255,255,0.7)",
            borderRadius: 6,
          }}
        >
          <div>Uploading...</div>
        </div>
      )}
      
      {error && (
        <div 
          style={{
            position: "absolute",
            bottom: 0,
            left: 0,
            right: 0,
            padding: "4px",
            backgroundColor: "rgba(220,38,38,0.8)",
            color: "white",
            fontSize: "12px",
            textAlign: "center",
            borderBottomLeftRadius: 6,
            borderBottomRightRadius: 6,
          }}
        >
          {error}
        </div>
      )}
    </div>
  ); 
}