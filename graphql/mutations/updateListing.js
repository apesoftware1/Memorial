export async function updateListingField(documentId, updateObj) {
  if (!documentId || !updateObj || typeof updateObj !== 'object') {
    console.error('Invalid input to updateListingField');
    return;
  }
  
  try {
    // For debugging purposes, log the payload
    console.log('Updating listing with payload:', { documentId, data: updateObj });
    
    const res = await fetch(`https://typical-car-e0b66549b3.strapiapp.com/api/listings/${documentId}`, {
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
    // For debugging purposes, log the payload
    console.log('Updating listing image with payload:', { documentId, imageType, data: updateObj });
    
    const res = await fetch(`https://typical-car-e0b66549b3.strapiapp.com/api/listings/${documentId}`, {
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