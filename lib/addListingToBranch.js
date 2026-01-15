export async function addListingToBranch(branchDocumentId, listingDocumentId) {
  try {
    const STRAPI_API_URL = process.env.STRAPI_API_URL || "https://api.tombstonesfinder.co.za";
    const url = `${STRAPI_API_URL}/api/branches/${branchDocumentId}`;

    const payload = {
      data: {
        listings: {
          connect: [{ documentId: listingDocumentId }],
        },
      },
    };

    const response = await fetch(url, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        // Authorization: `Bearer ${process.env.STRAPI_API_TOKEN}`, // needs admin/user token
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      throw new Error(`Failed to add listing to branch: ${response.statusText}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error in addListingToBranch:", error);
    throw error;
  }
}
