"use client";

import React from 'react';
import { useQuery } from '@apollo/client';
import { GET_DASHBOARD_DATA } from '@/graphql/queries/getDashboardData';
import ApolloWrapper from '@/app/ApolloWrapper';

function TestDashboardContent() {
  const { data, loading, error } = useQuery(GET_DASHBOARD_DATA, {
    fetchPolicy: 'cache-and-network',
    errorPolicy: 'all'
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading test data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-md mx-4 text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Error Loading Data</h1>
          <p className="text-gray-600 mb-4">{error.message}</p>
          <pre className="text-xs text-gray-500 bg-gray-100 p-2 rounded overflow-auto">
            {JSON.stringify(error, null, 2)}
          </pre>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Dashboard Connection Test</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Listings</h3>
            <p className="text-3xl font-bold text-blue-600">{data?.listings?.length || 0}</p>
            <p className="text-sm text-gray-500">Total listings</p>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Companies</h3>
            <p className="text-3xl font-bold text-green-600">{data?.companies?.length || 0}</p>
            <p className="text-sm text-gray-500">Total companies</p>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Inquiries</h3>
            <p className="text-3xl font-bold text-purple-600">{data?.inquiries?.length || 0}</p>
            <p className="text-sm text-gray-500">Total inquiries</p>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Raw Data Preview</h3>
          <div className="overflow-auto max-h-96">
            <pre className="text-xs text-gray-700 bg-gray-50 p-4 rounded">
              {JSON.stringify(data, null, 2)}
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function TestDashboard() {
  return (
    <ApolloWrapper>
      <TestDashboardContent />
    </ApolloWrapper>
  );
} 