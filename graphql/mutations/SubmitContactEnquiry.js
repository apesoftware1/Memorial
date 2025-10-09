export async function submitContactEnquiry(payload) {
  try {
    const response = await fetch(`${process.env.STRAPI_API_URL}/enquiries`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        // If you’re sending from frontend and it’s public, no token needed.
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