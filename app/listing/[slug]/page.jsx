'use client';

import { useParams } from 'next/navigation';
import { useQuery } from '@apollo/client';
import { GET_LISTING_BY_SLUG } from '@/graphql/queries/getListingBySlug';
import ProductShowcase from '@/components/product-showcase';

export default function ListingPage() {
  const { slug } = useParams();

  const { data, loading, error } = useQuery(GET_LISTING_BY_SLUG, {
    variables: { slug },
    skip: !slug,
  });

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error loading listing.</div>;

  const listing = data?.listings?.[0];

  if (!listing) {
    return <div>Listing not found.</div>;
  }

  return <ProductShowcase listing={listing} />;
} 