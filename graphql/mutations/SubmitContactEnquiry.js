export async function submitContactEnquiry(payload) {
  try {
    // Use the public Next.js environment variable
    const apiUrl = process.env.NEXT_PUBLIC_STRAPI_API_URL || 'https://typical-car-e0b66549b3.strapiapp.com/api';
    
    const response = await fetch(`${apiUrl}/enquiries`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        // If you're sending from frontend and it's public, no token needed.
        // If authenticated route, include Bearer token.
      },
      body: JSON.stringify({ data: payload }),
    });

    if (!response.ok) {
      const error = await response.json();
      console.error("❌ Failed to submit inquiry:", error);
      throw new Error(error?.error?.message || "Something went wrong");
    }

    const result = await response.json();
    console.log("✅ Inquiry submitted:", result);
    return result;
  } catch (err) {
    console.error("🚨 Error submitting inquiry:", err);
    throw err;
  }
}