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
      // For debugging purposes, log the payload
      console.log('Updating company with payload:', { documentId, data: updateObj });
      
      const res = await fetch(`https://typical-car-e0b66549b3.strapiapp.com/api/companies/${documentId}`, {
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