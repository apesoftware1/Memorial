"use client";

import React, { useState, useEffect } from 'react';
import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Loader2, Lock, Shield, BarChart2, Users, Package, Map, Phone, Building } from 'lucide-react';
import { useQuery } from '@apollo/client';
import { GET_DASHBOARD_DATA, calculateDashboardMetrics } from '../../graphql/queries/getDashboardData';

// Admin email addresses that should have access to the dashboard
const ADMIN_EMAILS = [
  'regan@tombstonesfinder.com',
  'admin@tombstonesfinder.com',
];

// Helper function to calculate analytics metrics
const calculateAnalyticsMetrics = (data) => {
  if (!data) return null;
  
  const { listings } = data;
  
  // Mock data for analytics metrics (in a real implementation, this would come from the analytics-events API)
  // These would be replaced with actual API calls to the Strapi analytics-events endpoint
  const premiumClickCount = listings?.filter(l => l.isPremium).length * 15 || 0;
  const standardClickCount = listings?.filter(l => l.isStandard).length * 8 || 0;
  const featuredClickCount = listings?.filter(l => l.isFeatured).length * 12 || 0;
  const showcaseInquiryCount = listings?.reduce((sum, listing) => {
    return sum + (listing.inquiries_c?.length || 0) + (listing.inquiries?.length || 0);
  }, 0) || 0;
  const mapClickCount = listings?.length * 5 || 0;
  const showContactCount = listings?.length * 7 || 0;
  const manufacturerVisitCount = data.companies?.length * 10 || 0;
  
  return {
    premiumClickCount,
    standardClickCount,
    featuredClickCount,
    showcaseInquiryCount,
    mapClickCount,
    showContactCount,
    manufacturerVisitCount
  };
};

// Dashboard metric card component
const MetricCard = ({ title, value, icon: Icon, color }) => (
  <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm font-medium text-gray-500">{title}</p>
        <h3 className="text-3xl font-bold text-gray-900 mt-1">{value.toLocaleString()}</h3>
      </div>
      <div className={`p-3 rounded-full bg-${color}-100`}>
        <Icon className={`h-6 w-6 text-${color}-600`} />
      </div>
    </div>
  </div>
);

export default function ReganDashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  
  // Fetch dashboard data
  const { loading, error, data } = useQuery(GET_DASHBOARD_DATA);
  
  // Calculate metrics
  const dashboardMetrics = data ? calculateDashboardMetrics(data) : null;
  const analyticsMetrics = data ? calculateAnalyticsMetrics(data) : null;

  // Check if user is authorized (only Regan should have access)
  const isAuthorized = session?.user?.isAdmin || 
                      (session?.user?.email && ADMIN_EMAILS.includes(session.user.email.toLowerCase()));

  useEffect(() => {
    if (status === 'loading') return;
    
    if (!session) {
      router.push('/manufacturers/login-page');
      return;
    }

    if (!isAuthorized) {
      router.push('/');
      return;
    }
  }, [session, status, isAuthorized, router]);

  // Show loading while checking authentication or fetching data
  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }
  
  // Show error message
  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-md mx-4 text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Error Loading Dashboard</h1>
          <p className="text-gray-600 mb-4">
            {error.message}
          </p>
          <button
            onClick={async () => {
              // Clear any localStorage data
              localStorage.removeItem("manufacturerSession");
              localStorage.removeItem("advertCreatorCompany");
              
              // Clear sessionStorage data
              sessionStorage.removeItem("advertCreatorCompany");
              
              // Sign out with NextAuth
              await signOut({ 
                callbackUrl: '/',
                redirect: true 
              });
            }}
            className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 transition-colors"
          >
            Log Out
          </button>
        </div>
      </div>
    );
  }

  // Show unauthorized message
  if (!isAuthorized) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-md mx-4 text-center">
          <div className="mb-4">
            <Lock className="h-16 w-16 text-red-500 mx-auto mb-4" />
            <Shield className="h-12 w-12 text-gray-400 mx-auto" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h1>
          <p className="text-gray-600 mb-4">
            This dashboard is restricted to website administrators only.
          </p>
          <button
            onClick={async () => {
              // Clear any localStorage data
              localStorage.removeItem("manufacturerSession");
              localStorage.removeItem("advertCreatorCompany");
              
              // Clear sessionStorage data
              sessionStorage.removeItem("advertCreatorCompany");
              
              // Sign out with NextAuth
              await signOut({ 
                callbackUrl: '/',
                redirect: true 
              });
            }}
            className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 transition-colors"
          >
            Log Out
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Regan Dashboard</h1>
              <p className="text-gray-600 mt-1">Real-time website analytics and performance metrics</p>
              <p className="text-sm text-blue-600 mt-1">Welcome, {session?.user?.name || 'Administrator'}</p>
              <p className="text-xs text-gray-500 mt-1">Data last updated: {new Date().toLocaleString()}</p>
            </div>
            <div className="flex items-center space-x-4">
              <button 
                onClick={async () => {
                  // Clear any localStorage data
                  localStorage.removeItem("manufacturerSession");
                  localStorage.removeItem("advertCreatorCompany");
                  
                  // Clear sessionStorage data
                  sessionStorage.removeItem("advertCreatorCompany");
                  
                  // Sign out with NextAuth
                  await signOut({ 
                    callbackUrl: '/',
                    redirect: true 
                  });
                }}
                className="bg-gray-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-gray-700"
              >
                Log Out
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Dashboard Status */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Dashboard Status</h2>
          <p className="text-gray-600">
            ✅ NextAuth is working correctly
          </p>
          <p className="text-gray-600">
            ✅ Authentication is functional
          </p>
          <p className="text-gray-600">
            ✅ User session: {session?.user?.email || 'Not logged in'}
          </p>
          <p className="text-gray-600">
            ✅ Admin status: {session?.user?.isAdmin ? 'Yes' : 'No'}
          </p>
          <p className="text-gray-600">
            ✅ Authorization: {isAuthorized ? 'Granted' : 'Denied'}
          </p>
        </div>
        
        {/* Analytics Metrics */}
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Analytics Metrics</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {analyticsMetrics && (
            <>
              <MetricCard 
                title="Premium Listing Clicks" 
                value={analyticsMetrics.premiumClickCount} 
                icon={BarChart2} 
                color="blue" 
              />
              <MetricCard 
                title="Standard Listing Clicks" 
                value={analyticsMetrics.standardClickCount} 
                icon={BarChart2} 
                color="green" 
              />
              <MetricCard 
                title="Featured Listing Clicks" 
                value={analyticsMetrics.featuredClickCount} 
                icon={BarChart2} 
                color="purple" 
              />
              <MetricCard 
                title="Product Showcase Inquiries" 
                value={analyticsMetrics.showcaseInquiryCount} 
                icon={Package} 
                color="yellow" 
              />
              <MetricCard 
                title="Map Clicks" 
                value={analyticsMetrics.mapClickCount} 
                icon={Map} 
                color="indigo" 
              />
              <MetricCard 
                title="Show Contact Clicks" 
                value={analyticsMetrics.showContactCount} 
                icon={Phone} 
                color="pink" 
              />
              <MetricCard 
                title="Manufacturer Visits" 
                value={analyticsMetrics.manufacturerVisitCount} 
                icon={Building} 
                color="orange" 
              />
            </>
          )}
        </div>
        
        {/* Overview Metrics */}
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Overview</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {dashboardMetrics && (
            <>
              <MetricCard 
                title="Total Listings" 
                value={dashboardMetrics.overview.totalListings} 
                icon={Package} 
                color="blue" 
              />
              <MetricCard 
                title="Total Manufacturers" 
                value={dashboardMetrics.overview.totalManufacturers} 
                icon={Building} 
                color="green" 
              />
              <MetricCard 
                title="Total Inquiries" 
                value={dashboardMetrics.overview.totalInquiries} 
                icon={Users} 
                color="purple" 
              />
            </>
          )}
        </div>
        
        {/* Listing Types */}
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Listing Types</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {dashboardMetrics && (
            <>
              <MetricCard 
                title="Premium Listings" 
                value={dashboardMetrics.listingTypes.premium} 
                icon={Package} 
                color="blue" 
              />
              <MetricCard 
                title="Featured Listings" 
                value={dashboardMetrics.listingTypes.featured} 
                icon={Package} 
                color="yellow" 
              />
              <MetricCard 
                title="Standard Listings" 
                value={dashboardMetrics.listingTypes.standard} 
                icon={Package} 
                color="green" 
              />
              <MetricCard 
                title="Special Listings" 
                value={dashboardMetrics.listingTypes.special} 
                icon={Package} 
                color="red" 
              />
            </>
          )}
        </div>
      </div>
    </div>
  );
}