import { NextResponse } from 'next/server';

export async function GET(request, { params }) {
  try {
    const { documentId } = params;

    if (!documentId) {
      return NextResponse.json(
        { error: 'Branch ID is required' },
        { status: 400 }
      );
    }

    const graphqlUrl = process.env.NEXT_PUBLIC_STRAPI_GRAPHQL_URL;
    const query = `
      query GetBranchListings($documentId: ID!) {
        listings(
          filters: { branches: { documentId: { eq: $documentId } } }
          pagination: { limit: -1 }
        ) {
          documentId
          title
          price
          slug
          mainImageUrl
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
        variables: { documentId },
      }),
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
