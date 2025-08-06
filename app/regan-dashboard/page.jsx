"use client";

import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Loader2, Lock, Shield } from 'lucide-react';

// Admin email addresses that should have access to the dashboard
const ADMIN_EMAILS = [
  'regan@tombstonesfinder.com',
  'admin@tombstonesfinder.com',
];

export default function ReganDashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();

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

  // Show loading while checking authentication
  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading dashboard...</p>
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
            onClick={() => router.push('/')}
            className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 transition-colors"
          >
            Return to Home
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
                onClick={() => router.push('/')}
                className="bg-gray-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-gray-700"
              >
                Back to Site
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
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
      </div>
    </div>
  );
}