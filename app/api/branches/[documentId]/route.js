import { NextResponse } from 'next/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(request, { params }) {
  try {
    const { documentId } = await params;
    const { searchParams } = new URL(request.url);
    const limitParam = searchParams.get('limit');
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
      query GetBranchListingsConnection($documentId: ID!, $pageSize: Int!, $page: Int!) {
        listings_connection(
          filters: { 
            or: [
              { branches: { documentId: { eq: $documentId } } },
              { branch_listings: { branch: { documentId: { eq: $documentId } } } }
            ]
          }
          pagination: { page: $page, pageSize: $pageSize }
        ) {
          nodes {
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
            branches(pagination: { page: 1, pageSize: 200 }) {
              documentId
              name
              location {
                province
                city
                town
              }
            }
            branch_listings(pagination: { page: 1, pageSize: 500 }) {
              branch {
                documentId
                name
              }
              price
            }
          }
          pageInfo {
            page
            pageSize
            pageCount
            total
          }
        }
      }
    `;

    const PAGE_SIZE = 100;

    const firstPage = await fetch(graphqlUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        query,
        variables: { documentId, page: 1, pageSize: PAGE_SIZE },
      }),
      next: { revalidate: 15 },
    });

    const firstResult = await firstPage.json();
    if (firstResult.errors) {
      console.error('GraphQL errors:', JSON.stringify(firstResult.errors, null, 2));
      return NextResponse.json(
        { error: 'Failed to fetch listings from Strapi', details: firstResult.errors },
        { status: 500 }
      );
    }

    const connection = firstResult?.data?.listings_connection || {};
    const pageInfo = connection.pageInfo || null;
    const pageCount = Number.isFinite(Number(pageInfo?.pageCount)) ? Number(pageInfo.pageCount) : 1;
    const totalCount = Number.isFinite(Number(pageInfo?.total)) ? Number(pageInfo.total) : 0;

    const seen = new Set();
    const merged = [];
    const addNodes = (nodes) => {
      const list = Array.isArray(nodes) ? nodes : [];
      for (const node of list) {
        const id = String(node?.documentId ?? '');
        if (id && !seen.has(id)) {
          seen.add(id);
          merged.push(node);
        }
      }
    };
    addNodes(connection.nodes);

    if (pageCount > 1) {
      const pages = [];
      for (let p = 2; p <= pageCount; p++) pages.push(p);
      const rest = await Promise.all(
        pages.map((page) =>
          fetch(graphqlUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              query,
              variables: { documentId, page, pageSize: PAGE_SIZE },
            }),
            next: { revalidate: 15 },
          }).then((r) => (r.ok ? r.json() : null))
        )
      );
      for (const res of rest) {
        addNodes(res?.data?.listings_connection?.nodes);
      }
    }

    const payload = limit > 0 ? merged.slice(0, Math.min(limit, merged.length)) : merged;
    return NextResponse.json({
      listings: payload,
      meta: {
        pagination: {
          page: 1,
          pageSize: payload.length,
          pageCount: 1,
          total: totalCount,
        },
      },
    });
  } catch (error) {
    console.error('API route error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
