"use client";

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useQuery } from '@apollo/client';
import { GET_COMPANY_BY_USER } from '@/graphql/queries/getCompany';
import ManufacturerProfileEditor from './ManufacturerProfileEditor';
import Footer from '@/components/Footer';
import { PageLoader } from '@/components/ui/loader';

export default function OwnerProfilePage() {
  const { data: session } = useSession();
  const documentId = session?.user?.documentId;
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
  
  const { data, loading, error, refetch } = useQuery(GET_COMPANY_BY_USER, {
    variables: { documentId },
    skip: !documentId,
    fetchPolicy: 'cache-first', // Reduced network usage - rely on cache unless manual refresh
    notifyOnNetworkStatusChange: true,
  });

  // Auto-refresh data when page becomes visible (e.g., when navigating back)
  useEffect(() => {
    // Only set up listeners if auto-refresh is explicitly enabled
    if (!autoRefreshEnabled) return;
    
    const handleVisibilityChange = () => {
      if (!document.hidden && documentId) {
        refetch();
      }
    };

    // Only refresh on visibility change, not focus (too aggressive)
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [documentId, refetch, autoRefreshEnabled]);

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
  
  const company = data?.companies[0];
  if (!company) return <PageLoader text=" " />;
  const listings = company.listings || [];

  return (
    <div>
      <ManufacturerProfileEditor 
        isOwner={true} 
        company={company} 
        listings={listings} 
        onRefresh={refetch}
        isRefreshing={loading}
        autoRefreshEnabled={autoRefreshEnabled}
        onToggleAutoRefresh={() => setAutoRefreshEnabled(prev => !prev)}
      />
      <Footer />
    </div>
  );
}

