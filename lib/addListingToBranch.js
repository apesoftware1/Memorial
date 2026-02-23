export async function addListingToBranch(branchDocumentId, listingDocumentId) {
  try {
    const apiUrl =
      process.env.NEXT_PUBLIC_STRAPI_API_URL ||
      process.env.STRAPI_API_URL ||
      "https://api.tombstonesfinder.co.za/api";
    const url = `${apiUrl}/branches/${branchDocumentId}`;

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
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      throw new Error(
        `Failed to add listing to branch: ${response.statusText}`
      );
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error in addListingToBranch:", error);
    throw error;
  }
}

export async function addListingToBranchListing({
  listingDocumentId,
  branchDocumentId,
  price,
}) {
  const apiUrl =
    process.env.NEXT_PUBLIC_STRAPI_API_URL;

  const response = await fetch(`${apiUrl}/branch-listings`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(process.env.NEXT_PUBLIC_STRAPI_API_TOKEN && {
        Authorization: `Bearer ${process.env.NEXT_PUBLIC_STRAPI_API_TOKEN}`,
      }),
    },
    body: JSON.stringify({
      data: {
        price,
        listing: {
          connect: [{ documentId: listingDocumentId }],
        },
        branch: {
          connect: [{ documentId: branchDocumentId }],
        },
      },
    }),
  });

  if (!response.ok) {
    throw new Error("Failed to add listing to branch");
  }

  return response.json();
}

export async function updateBranchListing({ branchListingDocumentId, price }) {
  const apiUrl =
    process.env.NEXT_PUBLIC_STRAPI_API_URL;

  const response = await fetch(`${apiUrl}/branch-listings/${branchListingDocumentId}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      ...(process.env.NEXT_PUBLIC_STRAPI_API_TOKEN && {
        Authorization: `Bearer ${process.env.NEXT_PUBLIC_STRAPI_API_TOKEN}`,
      }),
    },
    body: JSON.stringify({
      data: {
        price,
      },
    }),
  });

  if (!response.ok) {
    throw new Error("Failed to update branch listing price");
  }

  return response.json();
}
