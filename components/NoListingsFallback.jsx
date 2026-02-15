import React from 'react';
import { PackageOpen } from 'lucide-react';

const NoListingsFallback = ({ 
  message = "No listings available at the moment.",
  subMessage = "Please check back later or try adjusting your filters.",
  className = ""
}) => {
  return (
    <div 
      className={`w-full flex flex-col items-center justify-center py-12 px-4 text-center bg-white rounded-lg border border-gray-100 shadow-sm transition-opacity duration-500 ease-in-out ${className}`}
      role="status"
      aria-live="polite"
    >
      <div className="bg-gray-50 p-4 rounded-full mb-4">
        <PackageOpen className="w-8 h-8 text-gray-400" aria-hidden="true" />
      </div>
      
      <h3 className="text-lg font-semibold text-gray-700 mb-2">
        {message}
      </h3>
      
      <p className="text-sm text-gray-500 max-w-md">
        {subMessage}
      </p>
    </div>
  );
};

export default NoListingsFallback;