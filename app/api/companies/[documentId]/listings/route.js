import { NextResponse } from 'next/server';

export async function GET(request, { params }) {
  try {
    const { documentId } = await params;
    const { searchParams } = new URL(request.url);
    const limitParam = searchParams.get('limit');
    const limit = limitParam ? parseInt(limitParam) : -1;

    if (!documentId) {
      return NextResponse.json(
        { error: 'Company ID is required' },
        { status: 400 }
      );
    }

    const graphqlUrl = process.env.NEXT_PUBLIC_STRAPI_GRAPHQL_URL;
    const query = `
      query GetCompanyListings($documentId: ID!, $limit: Int) {
        listings(
          filters: { company: { documentId: { eq: $documentId } } }
          pagination: { limit: $limit }
        ) {
          documentId
          title
          slug
          price
          adFlasher
          isFeatured
          isOnSpecial
          isPremium
          isStandard
          manufacturingTimeframe
          mainImageUrl
          mainImagePublicId
          thumbnailUrls
          thumbnailPublicIds
          listing_category {
            name
          }
          branches {
            documentId
            name
            location {
              province
              city
              town
            }
          }
          branch_listings {
            branch {
              documentId
              name
            }
            price
          }
          inquiries {
            documentId
          }
          inquiries_c {
            documentId
          }
        }
      }
    `;

    const response = await fetch(graphqlUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        query,
        variables: { documentId, limit },
      }),
      next: { revalidate: 3600 },
    });

    const result = await response.json();

    if (result.errors) {
      console.error('GraphQL errors:', result.errors);
      return NextResponse.json(
        { error: 'Failed to fetch listings from Strapi' },
        { status: 500 }
      );
    }

    return NextResponse.json(result.data);
  } catch (error) {
    console.error('API route error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
