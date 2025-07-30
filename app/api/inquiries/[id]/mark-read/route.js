export async function POST(request, { params }) {
  try {
    const { id } = params;
    const body = await request.json();
    const { isRead, isNew } = body;

    // Update the inquiry in Strapi
    const response = await fetch(`${process.env.STRAPI_API_URL}/api/inquiries/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.STRAPI_API_TOKEN}`,
      },
      body: JSON.stringify({
        data: {
          isRead: isRead,
          isNew: isNew
        }
      })
    });

    if (!response.ok) {
      throw new Error('Failed to update inquiry status');
    }

    const updatedInquiry = await response.json();

    return Response.json({ 
      success: true, 
      inquiry: updatedInquiry 
    });

  } catch (error) {
    console.error('Error updating inquiry status:', error);
    return Response.json(
      { error: 'Failed to update inquiry status' },
      { status: 500 }
    );
  }
}