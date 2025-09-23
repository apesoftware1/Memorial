"use client";

import { useParams } from "next/navigation";
import { useQuery } from "@apollo/client";
import { GET_COMPANY_BY_ID } from '@/graphql/queries/getCompanyById';
import ManufacturerProfileEditor from '../ManufacturerProfileEditor';

export default function ManufacturerProfilePage() {
  const { slug: documentId } = useParams();
  
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

  // Render the profile page as a guest (no edit or modal buttons)
  return <ManufacturerProfileEditor isOwner={false} company={company} listings={listings} />;
} 