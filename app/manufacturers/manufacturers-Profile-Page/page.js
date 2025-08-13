"use client";

import { useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useQuery } from '@apollo/client';
import { GET_COMPANY_BY_USER } from '@/graphql/queries/getCompany';
import ManufacturerProfileEditor from './ManufacturerProfileEditor';

export default function OwnerProfilePage() {
  const { data: session } = useSession();
  const documentId = session?.user?.documentId;
  
  const { data, loading, error, refetch } = useQuery(GET_COMPANY_BY_USER, {
    variables: { documentId },
    skip: !documentId,
    fetchPolicy: 'cache-and-network', // Always check for updates
    notifyOnNetworkStatusChange: true,
  });

  // Auto-refresh data when page becomes visible (e.g., when navigating back)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden && documentId) {
        refetch();
      }
    };

    const handleFocus = () => {
      if (documentId) {
        refetch();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('focus', handleFocus);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('focus', handleFocus);
    };
  }, [documentId, refetch]);

  if (loading) return <div>Loading company data...</div>;
  if (error) return <div>Error loading company data.</div>;
  
  const company = data?.companies[0];
  if (!company) return <div>No company data found.</div>;
  const listings = company.listings || [];

  return (
    <ManufacturerProfileEditor
      isOwner={!!session}
      company={company}
      listings={listings}
    />
  );
}

