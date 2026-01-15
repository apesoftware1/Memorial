// lib/createBranch.js
export async function createBranch(payload) {
  try {
    const baseUrl = process.env.STRAPI_API_URL || "https://api.tombstonesfinder.co.za";
    
    const response = await fetch(`${baseUrl}/api/branches`, {    
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
