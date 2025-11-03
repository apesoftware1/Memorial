// lib/createBranch.js
export async function createBranch(payload) {
  try {
    const STRAPI_API_URL = process.env.STRAPI_API_URL || "https://typical-car-e0b66549b3.strapiapp.com/api/branches";
    
    const response = await fetch(STRAPI_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData?.error?.message || "Failed to create branch");
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error creating branch:", error);
    throw error;
  }
}