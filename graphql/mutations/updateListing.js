export async function updateListingField(documentId, updateObj) {
  if (!documentId || !updateObj || typeof updateObj !== 'object') {
    console.error('Invalid input to updateListingField');
    return;
  }
  
  try {
    const baseUrl = process.env.NEXT_PUBLIC_STRAPI_API_URL;
    const res = await fetch(`${baseUrl}/listings/${documentId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      mode: 'cors', // Enable CORS for cross-origin requests
      body: JSON.stringify({ data: updateObj }),
    });

    if (!res.ok) {
      throw new Error(`Failed to update listing: ${res.status}`);
    }

    const json = await res.json();
    return json.data;
  } catch (err) {
    console.error('Error updating listing field:', err);
    return null;
  }
}

export async function updateListingImage(documentId, imageType, imageUrl, imagePublicId) {
  if (!documentId || !imageUrl || !imagePublicId) {
    console.error('Invalid input to updateListingImage');
    return;
  }
  
  let updateObj = {};
  
  // Handle different image types (main image or thumbnails)
  if (imageType === 'main') {
    updateObj = {
      mainImageUrl: imageUrl,
      mainImagePublicId: imagePublicId
    };
  } else if (imageType === 'thumbnail') {
    // For thumbnail updates, we need to specify which thumbnail is being updated
    // This assumes the thumbnails are stored in an array or with indexed fields
    // Adjust according to your actual data structure
    updateObj = {
      thumbnailUrl: imageUrl,
      thumbnailPublicId: imagePublicId
    };
  }
  
  try {
    const baseUrl = process.env.NEXT_PUBLIC_STRAPI_API_URL || 'https://api.tombstonesfinder.co.za/api';
    const res = await fetch(`${baseUrl}/listings/${documentId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      mode: 'cors', // Enable CORS for cross-origin requests
      body: JSON.stringify({ data: updateObj }),
    });

    if (!res.ok) {
      throw new Error(`Failed to update listing image: ${res.status}`);
    }

    const json = await res.json();
    return json.data;
  } catch (err) {
    console.error('Error updating listing image:', err);
    return null;
  }
}
