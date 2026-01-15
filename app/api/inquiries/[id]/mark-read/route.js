export async function POST(request, { params }) {
  try {
    const { id } = params;
    const body = await request.json();
    const { isRead, isNew } = body;
    const baseUrl = process.env.STRAPI_API_URL || "https://api.tombstonesfinder.co.za";
    const response = await fetch(`${baseUrl}/api/inquiries/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer 4eb9b8bc7b0a21d6b5e2d2f6e2b2c6e8b5f5d5c5b5e5f5b5e5f5b5e5f5b5e5f5b5e5f5b5e5f5b5e5f5b5e5f5b5e5f5b5e5f5b5e5f5b5e5f5b5e5f5b5e5f5b5e5f5b5e5f5`,
      },
      body: JSON.stringify({
        data: {
          isRead: isRead,
          isNew: isNew
        }
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Strapi error:', response.status, errorText);
      throw new Error(`Failed to update inquiry status: ${response.status}`);
    }

    const updatedInquiry = await response.json();
    console.log('API: Successfully updated inquiry:', updatedInquiry);

    return Response.json({ 
      success: true, 
      inquiry: updatedInquiry 
    });

  } catch (error) {
    console.error('Error updating inquiry status:', error);
    return Response.json(
      { error: 'Failed to update inquiry status', details: error.message },
      { status: 500 }
    );
  }
}
