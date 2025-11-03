export async function updateBranch(branchDocumentId, data) {
  if (!branchDocumentId) {
    throw new Error("Branch documentId is required");
  }

  try {
    const response = await fetch(
`https://typical-car-e0b66549b3.strapiapp.com/api/branches/${branchDocumentId}`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        //   Authorization: `Bearer ${process.env.NEXT_PUBLIC_STRAPI_TOKEN}`,
        },
        body: JSON.stringify({ data }),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Strapi update failed: ${errorText}`);
    }

    const result = await response.json();
    return result;
  } catch (error) {
    console.error("❌ Error updating branch:", error.message);
    throw error;
  }
}