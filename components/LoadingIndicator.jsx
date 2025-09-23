'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function LoadingIndicator() {
  const [loading, setLoading] = useState(false);
  
  useEffect(() => {
    const handleStart = () => setLoading(true);
    const handleComplete = () => setLoading(false);

    // Add event listeners for route changes
    document.addEventListener('routeChangeStart', handleStart);
    document.addEventListener('routeChangeComplete', handleComplete);
    document.addEventListener('routeChangeError', handleComplete);

    return () => {
      document.removeEventListener('routeChangeStart', handleStart);
      document.removeEventListener('routeChangeComplete', handleComplete);
      document.removeEventListener('routeChangeError', handleComplete);
    };
  }, []);

  if (!loading) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="flex flex-col items-center">
        <div className="h-12 w-12 animate-spin rounded-full border-b-2 border-t-2 border-blue-500"></div>
        <p className="mt-4 text-lg font-semibold text-white">Loading...</p>
      </div>
    </div>
  );
}