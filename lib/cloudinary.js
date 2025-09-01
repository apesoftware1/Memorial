/**
 * Upload a file to Cloudinary
 * @param {File} file - The image file to upload
 * @param {string} companyName - The company name to create a folder
 * @returns {Promise<Object>} Cloudinary upload response
 */
export const uploadToCloudinary = async (file, companyName) => {
  if (!file) throw new Error("No file provided for upload");
  if (!companyName) throw new Error("Company name is required");

  const CLOUD_NAME = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
  const UPLOAD_PRESET = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;

  if (!CLOUD_NAME || !UPLOAD_PRESET) {
    throw new Error("Cloudinary environment variables are missing");
  }

  try {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", UPLOAD_PRESET);
    formData.append("folder", companyName.replace(/\s+/g, "_"));

    const res = await fetch(
      `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`,
      {
        method: "POST",
        mode: "cors",
        body: formData,
      }
    );

    if (!res.ok) {
      const errorText = await res.text();
      throw new Error(`Cloudinary upload failed: ${res.status} - ${errorText}`);
    }

    const data = await res.json();
    return data; // { secure_url, public_id, etc. }
  } catch (error) {
    console.error("Cloudinary upload error:", error);
    throw error;
  }
};