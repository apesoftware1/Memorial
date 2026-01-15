export async function updateCompanyField(documentId, updateObj) {
    if (!documentId || !updateObj || typeof updateObj !== 'object') {
      console.error('Invalid input to updateCompanyField');
      return;
    }
    
    // Handle logo update with logoUrl and logoUrlPublicId
    if (updateObj.logoUrl && updateObj.logoUrlPublicId) {
      // Transform the logoUrl and logoUrlPublicId into the format expected by the backend
      updateObj = {
        logoUrl: updateObj.logoUrl,
        logoUrlPublicId: updateObj.logoUrlPublicId
      };
    }
  
    try {
      const baseUrl = process.env.NEXT_PUBLIC_STRAPI_API_URL || 'https://api.tombstonesfinder.co.za/api';
      const res = await fetch(`${baseUrl}/companies/${documentId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ data: updateObj }),
      });
  
      if (!res.ok) {
        throw new Error(`Failed to update company: ${res.status}`);
      }
  
      const json = await res.json();
      return json.data;
    } catch (err) {
      console.error('Error updating company field:', err);
      return null;
    }
  }
