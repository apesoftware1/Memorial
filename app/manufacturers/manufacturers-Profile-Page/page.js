"use client";

import { useEffect, useState, Suspense } from 'react';
import { useSession } from 'next-auth/react';
import { useQuery } from '@apollo/client';
import { GET_COMPANY_ID_BY_USER } from '@/graphql/queries/getCompany';
import {
  COMPANY_INITIAL_QUERY,
  COMPANY_FULL_QUERY,
  COMPANY_DELTA_QUERY,
} from '@/graphql/queries/getCompanyById';
import { useProgressiveQuery } from "@/hooks/useProgressiveQuery";
import dynamic from 'next/dynamic';
import Footer from '@/components/Footer';
import { PageLoader } from '@/components/ui/loader';

const ManufacturerProfileEditor = dynamic(() => import('./ManufacturerProfileEditor'), { 
  ssr: false,
  loading: () => <PageLoader text="Loading editor..." />
});

export default function OwnerProfilePage() {
  const { data: session } = useSession();
  const userDocumentId = session?.user?.documentId;
  // Add state to control auto-refresh behavior
  const [autoRefreshEnabled, setAutoRefreshEnabled] = useState(false);
  const [isMobileSmall, setIsMobileSmall] = useState(false);
  
  // Check if screen is too small
  useEffect(() => {
    const checkScreenSize = () => {
      setIsMobileSmall(window.innerWidth < 640);
    };
    
    // Initial check
    checkScreenSize();
    
    // Add event listener for resize
    window.addEventListener('resize', checkScreenSize);
    
    // Cleanup
    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);
  
  // 1. First, get the company ID associated with the user
  const { 
    data: idData, 
    loading: idLoading,
    refetch: refetchId
  } = useQuery(GET_COMPANY_ID_BY_USER, {
    variables: { documentId: userDocumentId },
    skip: !userDocumentId,
    fetchPolicy: 'cache-first',
  });

  const companyDocumentId = idData?.companies?.[0]?.documentId;

  // 2. Then use progressive loading with the company ID
  const { 
    data, 
    loading: companyLoading, 
    error, 
    isFullLoaded 
  } = useProgressiveQuery({
    initialQuery: COMPANY_INITIAL_QUERY,
    fullQuery: COMPANY_FULL_QUERY,
    deltaQuery: COMPANY_DELTA_QUERY,
    variables: { documentId: companyDocumentId },
    skip: !companyDocumentId,
    storageKey: `companyProfile:${companyDocumentId}:lastUpdated`,
    refreshInterval: 60000,
    staleTime: 1000 * 60 * 5,
  });

  const loading = idLoading || (companyLoading && !data);

  // Auto-refresh data when page becomes visible (e.g., when navigating back)
  useEffect(() => {
    // Only set up listeners if auto-refresh is explicitly enabled
    if (!autoRefreshEnabled) return;
    
    const handleVisibilityChange = () => {
      if (!document.hidden && userDocumentId) {
        refetchId();
        // useProgressiveQuery handles its own refreshing via refreshInterval and internal logic
        // but we might want to force a refetch if needed, though the hook doesn't expose a simple refetch for everything
      }
    };

    // Only refresh on visibility change, not focus (too aggressive)
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [userDocumentId, refetchId, autoRefreshEnabled]);

  // Display warning for small mobile screens
  if (isMobileSmall) {
    return (
      <div className="fixed inset-0 bg-white p-6 flex flex-col items-center justify-center text-center z-50">
        <div className="bg-amber-100 border-l-4 border-amber-500 text-amber-700 p-4 mb-4 rounded shadow-md">
          <h2 className="text-lg font-bold mb-2">⚠️ Screen Size Warning</h2>
          <p>This page is not optimized for small mobile screens.</p>
          <p className="mt-2">Please use a tablet, desktop, or larger mobile device for the best experience.</p>
        </div>
       
      </div>
    );
  }

  if (loading) return <PageLoader text="Loading company data..." />;
  if (error) return <div>Error loading company data.</div>;
  
  const company = data?.companies?.[0];
  if (!company) return <PageLoader text=" " />;
  const listings = company.listings || [];

  return (
    <div>
      <Suspense fallback={<PageLoader text="Loading profile editor..." />}>
        <ManufacturerProfileEditor 
          isOwner={true} 
          company={company} 
          listings={listings} 
          onRefresh={refetchId} // Note: This might need adjustment as refetchId only gets ID, but progressive query updates automatically
          isRefreshing={loading}
          autoRefreshEnabled={autoRefreshEnabled}
          onToggleAutoRefresh={() => setAutoRefreshEnabled(prev => !prev)}
          isFullLoaded={isFullLoaded}
        />
      </Suspense>
      <Footer />
    </div>
  );
}

