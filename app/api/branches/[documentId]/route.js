import { NextResponse } from 'next/server';

export const runtime = 'nodejs';

export async function GET(request, { params }) {
  try {
    const { documentId } = await params;
    const { searchParams } = new URL(request.url);
    const limitParam = searchParams.get('limit');
    // Use a large number for "all" because GraphQL limit must be positive
    const limit = limitParam && parseInt(limitParam) > 0 ? parseInt(limitParam) : 2000;

    console.log(`[API] Fetching listings for branch: ${documentId}, limit: ${limit}`);

    if (!documentId) {
      return NextResponse.json(
        { error: 'Branch ID is required' },
        { status: 400 }
      );
    }

    const graphqlUrl = process.env.NEXT_PUBLIC_STRAPI_GRAPHQL_URL;
    const query = `
      query GetBranchListings($documentId: ID!, $limit: Int) {
        listings(
          filters: { 
            or: [
              { branches: { documentId: { eq: $documentId } } },
              { branch_listings: { branch: { documentId: { eq: $documentId } } } }
            ]
          }
          pagination: { limit: $limit }
        ) {
          documentId
          title
          price
          slug
          mainImageUrl
          publishedAt
          updatedAt
          listing_category {
            name
          }
          company {
            name
            location
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
        }
      }
    `;

    const response = await fetch(graphqlUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        // Add Authorization if needed, but public listings should be accessible
      },
      body: JSON.stringify({
        query,
        variables: { documentId, limit },
      }),
      next: { revalidate: 60 },
    });

    const result = await response.json();

    if (result.errors) {
      console.error('GraphQL errors:', JSON.stringify(result.errors, null, 2));
      return NextResponse.json(
        { error: 'Failed to fetch listings from Strapi', details: result.errors },
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
