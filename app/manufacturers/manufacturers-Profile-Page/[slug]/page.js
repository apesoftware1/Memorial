"use client";

import { useParams } from "next/navigation";
import { useQuery } from "@apollo/client";
import { useState, Suspense } from "react";
import dynamic from 'next/dynamic';
import { GET_COMPANY_BY_ID } from '@/graphql/queries/getCompanyById';
import BranchButton from '@/components/BranchButton';
import VideoModal from '@/components/VideoModal';
import Footer from '@/components/Footer';
import { PageLoader } from '@/components/ui/loader';
import { useProgressiveQuery } from "@/hooks/useProgressiveQuery";

const ManufacturerProfileEditor = dynamic(() => import('../ManufacturerProfileEditor'), { 
  ssr: false,
  loading: () => <PageLoader text="Loading profile..." />
});
import {
  COMPANY_INITIAL_QUERY,
  COMPANY_FULL_QUERY,
  COMPANY_DELTA_QUERY,
} from '@/graphql/queries/getCompanyById';
export default function ManufacturerProfilePage() {
  const { slug: documentId } = useParams();
  const [showVideoModal, setShowVideoModal] = useState(false);
  
  const { loading, error, data } = useProgressiveQuery({
    initialQuery: COMPANY_INITIAL_QUERY,
    fullQuery: COMPANY_FULL_QUERY,
    deltaQuery: COMPANY_DELTA_QUERY,
    variables: { documentId },
    storageKey: 'companyProfile:lastUpdated',
    refreshInterval: 60000,
    staleTime: 1000 * 60 * 5,
  });

  if (loading) return <PageLoader text="Loading company data..." />;
  if (error) return <div>Error loading company data.</div>;
  const company = data?.companies[0];
  
 
  if (!company) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24, color: '#888' }}>
        404 | This manufacturer profile could not be found.
      </div>
    );
  }
  const listings = company.listings || [];

  // Function to handle video click
  const handleVideoClick = () => {
    setShowVideoModal(true);
  };

  return (
    <div>
      {/* Pass the click handler to the profile editor */}
      <Suspense fallback={<PageLoader text="Loading profile..." />}>
        <ManufacturerProfileEditor 
          isOwner={false} 
          company={company} 
          listings={listings} 
          onVideoClick={handleVideoClick}
          branchButton={<BranchButton company={company} />}
        />
      </Suspense>
      
      {/* Video Modal */}
      <VideoModal 
        isOpen={showVideoModal} 
        onClose={() => setShowVideoModal(false)} 
        videoUrl={company?.videoUrl} 
      />
      
      <Footer />
    </div>
  );
}
