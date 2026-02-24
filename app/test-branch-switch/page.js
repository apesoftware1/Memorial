"use client";

import { useState } from 'react';
import { useQuery, useLazyQuery } from '@apollo/client';
import { MANUFACTURERS_INITIAL_QUERY } from '@/graphql/queries/getManufacturers';
import { COMPANY_INITIAL_QUERY } from '@/graphql/queries/getCompanyById';

export default function TestBranchSwitchPage() {
  const [selectedCompanyId, setSelectedCompanyId] = useState(null);
  const [selectedBranchId, setSelectedBranchId] = useState(null);
  const [branchListings, setBranchListings] = useState([]);
  const [loadingListings, setLoadingListings] = useState(false);
  const [apiError, setApiError] = useState(null);

  // 1. Fetch list of companies to choose from
  const { data: manufacturersData, loading: loadingManufacturers } = useQuery(MANUFACTURERS_INITIAL_QUERY);

  // 2. Lazy query to fetch details of selected company
  const [getCompanyDetails, { data: companyData, loading: loadingCompany }] = useLazyQuery(COMPANY_INITIAL_QUERY);

  const handleCompanySelect = (documentId) => {
    setSelectedCompanyId(documentId);
    setSelectedBranchId(null);
    setBranchListings([]);
    setApiError(null);
    getCompanyDetails({ variables: { documentId } });
  };

  const handleBranchSelect = async (branchId) => {
    setSelectedBranchId(branchId);
    setLoadingListings(true);
    setApiError(null);
    setBranchListings([]);

    try {
      const response = await fetch(`/api/branches/${branchId}`);
      if (!response.ok) {
        throw new Error(`API Error: ${response.statusText}`);
      }
      const data = await response.json();
      if (data.error) {
        throw new Error(data.error);
      }
      setBranchListings(data.listings || []);
    } catch (err) {
      console.error("Failed to fetch branch listings:", err);
      setApiError(err.message);
    } finally {
      setLoadingListings(false);
    }
  };

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Branch Switching Test Page</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Left Column: Company List */}
        <div className="border p-4 rounded bg-gray-50">
          <h2 className="text-xl font-semibold mb-4">1. Select Company</h2>
          {loadingManufacturers ? (
            <p>Loading companies...</p>
          ) : (
            <ul className="space-y-2">
              {manufacturersData?.companies?.map((company) => (
                <li key={company.documentId}>
                  <button
                    onClick={() => handleCompanySelect(company.documentId)}
                    className={`w-full text-left p-2 rounded hover:bg-blue-100 transition-colors ${
                      selectedCompanyId === company.documentId ? 'bg-blue-200 font-bold' : ''
                    }`}
                  >
                    {company.name}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Middle Column: Company Details & Branches */}
        <div className="border p-4 rounded bg-white">
          <h2 className="text-xl font-semibold mb-4">2. Select Branch</h2>
          {!selectedCompanyId ? (
            <p className="text-gray-500">Please select a company first.</p>
          ) : loadingCompany ? (
            <p>Loading company details...</p>
          ) : companyData?.companies?.[0] ? (
            <div>
              <h3 className="font-bold text-lg mb-2">{companyData.companies[0].name}</h3>
              <p className="text-sm text-gray-600 mb-4">{companyData.companies[0].location}</p>
              
              <h4 className="font-semibold mb-2">Branches:</h4>
              {companyData.companies[0].branches && companyData.companies[0].branches.length > 0 ? (
                <ul className="space-y-2">
                  {companyData.companies[0].branches.map((branch) => (
                    <li key={branch.documentId}>
                      <button
                        onClick={() => handleBranchSelect(branch.documentId)}
                        className={`w-full text-left p-2 border rounded hover:bg-green-50 transition-colors ${
                          selectedBranchId === branch.documentId ? 'bg-green-100 border-green-500 ring-1 ring-green-500' : ''
                        }`}
                      >
                        <div className="font-medium">{branch.name}</div>
                        <div className="text-xs text-gray-500">
                          {branch.location?.city || branch.location?.town || "Location N/A"}
                        </div>
                      </button>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-red-500">No branches found for this company.</p>
              )}
            </div>
          ) : (
            <p className="text-red-500">Company data not found.</p>
          )}
        </div>

        {/* Right Column: Branch Listings (from API) */}
        <div className="border p-4 rounded bg-gray-50">
          <h2 className="text-xl font-semibold mb-4">3. Branch Listings (API)</h2>
          {!selectedBranchId ? (
            <p className="text-gray-500">Select a branch to fetch listings.</p>
          ) : loadingListings ? (
            <p className="animate-pulse">Fetching listings from /api/branches/...</p>
          ) : apiError ? (
            <div className="p-4 bg-red-100 text-red-700 rounded">
              <p className="font-bold">Error:</p>
              <p>{apiError}</p>
            </div>
          ) : branchListings.length > 0 ? (
            <div>
              <p className="mb-4 font-medium text-green-700">Found {branchListings.length} listings</p>
              <ul className="space-y-4 max-h-[600px] overflow-y-auto">
                {branchListings.map((listing) => (
                  <li key={listing.documentId} className="bg-white p-3 rounded shadow-sm border">
                    <div className="font-bold text-sm">{listing.title}</div>
                    <div className="text-xs text-gray-500 mb-1">Price: R {listing.price}</div>
                    <div className="text-xs text-blue-600 bg-blue-50 inline-block px-1 rounded">
                      {listing.listing_category?.name}
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          ) : (
            <p className="text-gray-500">No listings found for this branch.</p>
          )}
        </div>
      </div>
    </div>
  );
}
