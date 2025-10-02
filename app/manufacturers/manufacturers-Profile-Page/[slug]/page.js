"use client";

import { useParams } from "next/navigation";
import { useQuery } from "@apollo/client";
import { useState } from "react";
import { GET_COMPANY_BY_ID } from '@/graphql/queries/getCompanyById';
import ManufacturerProfileEditor from '../ManufacturerProfileEditor';
import BranchButton from '@/components/BranchButton';
import VideoModal from '@/components/VideoModal';

export default function ManufacturerProfilePage() {
  const { slug: documentId } = useParams();
  const [showVideoModal, setShowVideoModal] = useState(false);
  
  const { data, loading, error } = useQuery(GET_COMPANY_BY_ID, {
    variables: { documentId: documentId },
    skip: !documentId,
  });

  if (loading) return <div>Loading company data...</div>;
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
      <div style={{ display: 'flex', justifyContent: 'flex-end', padding: '16px' }}>
        <BranchButton company={company} />
      </div>
      
      {/* Pass the click handler to the profile editor */}
      <ManufacturerProfileEditor 
        isOwner={false} 
        company={company} 
        listings={listings} 
        onVideoClick={handleVideoClick}
      />
      
      {/* Video Modal */}
      <VideoModal 
        isOpen={showVideoModal} 
        onClose={() => setShowVideoModal(false)} 
        videoUrl={company?.videoUrl} 
      />
    </div>
  );
}