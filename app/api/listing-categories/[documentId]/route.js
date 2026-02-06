import { NextResponse } from 'next/server';

export async function PUT(request, { params }) {
  try {
    const { documentId } = params;
    const body = await request.json();
    
    // Construct Strapi payload
    // We expect body to contain imageUrl and imagePublicId
    const strapiPayload = {
        data: {
            imageUrl: body.imageUrl,
            imagePublicId: body.imagePublicId
        }
    };

    const baseUrl = process.env.STRAPI_API_URL || "https://api.tombstonesfinder.co.za";
    const response = await fetch(`${baseUrl}/api/listing-categories/${documentId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(strapiPayload)
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error('Strapi API error:', errorData);
      return NextResponse.json(
        { error: `Failed to update listing category: ${response.status}` },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);

  } catch (error) {
    console.error('Error updating listing category:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
