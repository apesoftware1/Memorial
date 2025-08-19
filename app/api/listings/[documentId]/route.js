import { NextResponse } from 'next/server';

export async function PATCH(request, { params }) {
  try {
    const { documentId } = params;
    const body = await request.json();

    // Make the PATCH request to Strapi using hardcoded URL like auth route
    const response = await fetch(`https://typical-car-e0b66549b3.strapiapp.com/api/listings/${documentId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        // Note: You may need to add proper authorization header here
        // 'Authorization': `Bearer ${process.env.STRAPI_API_TOKEN}`,
      },
      body: JSON.stringify(body)
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error('Strapi API error:', errorData);
      return NextResponse.json(
        { error: `Failed to update listing: ${response.status}` },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);

  } catch (error) {
    console.error('Error updating listing:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}