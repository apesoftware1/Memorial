export async function updateCompanyField(documentId, updateObj) {
    if (!documentId || !updateObj || typeof updateObj !== 'object') {
      console.error('Invalid input to updateCompanyField');
      return;
    }
  
    try {
      const res = await fetch(`https://balanced-sunrise-2fce1c3d37.strapiapp.com/api/companies/${documentId}`, {
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