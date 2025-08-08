import React from 'react';

interface LoaderProps {
  size?: 'sm' | 'md' | 'lg';
  variant?: 'spinner' | 'dots' | 'pulse' | 'skeleton';
  className?: string;
  text?: string;
}

export const Loader: React.FC<LoaderProps> = ({ 
  size = 'md', 
  variant = 'spinner', 
  className = '',
  text
}) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8'
  };

  const SpinnerLoader = () => (
    <div className={`animate-spin rounded-full border-2 border-gray-300 border-t-blue-600 ${sizeClasses[size]} ${className}`} />
  );

  const DotsLoader = () => (
    <div className={`flex space-x-1 ${className}`}>
      <div className={`${sizeClasses[size]} bg-blue-600 rounded-full animate-bounce`} style={{ animationDelay: '0ms' }} />
      <div className={`${sizeClasses[size]} bg-blue-600 rounded-full animate-bounce`} style={{ animationDelay: '150ms' }} />
      <div className={`${sizeClasses[size]} bg-blue-600 rounded-full animate-bounce`} style={{ animationDelay: '300ms' }} />
    </div>
  );

  const PulseLoader = () => (
    <div className={`animate-pulse bg-blue-600 rounded-full ${sizeClasses[size]} ${className}`} />
  );

  const SkeletonLoader = () => (
    <div className={`animate-pulse bg-gray-300 rounded ${sizeClasses[size]} ${className}`} />
  );

  const renderLoader = () => {
    switch (variant) {
      case 'dots':
        return <DotsLoader />;
      case 'pulse':
        return <PulseLoader />;
      case 'skeleton':
        return <SkeletonLoader />;
      default:
        return <SpinnerLoader />;
    }
  };

  return (
    <div className="flex flex-col items-center justify-center space-y-2">
      {renderLoader()}
      {text && (
        <p className="text-sm text-gray-600 animate-pulse">{text}</p>
      )}
    </div>
  );
};

// Card skeleton loader for listings
export const CardSkeleton: React.FC<{ className?: string }> = ({ className = '' }) => (
  <div className={`bg-white border border-gray-200 overflow-hidden ${className}`}>
    <div className="animate-pulse">
      {/* Image skeleton */}
      <div className="h-56 bg-gray-200" />
      {/* Content skeleton */}
      <div className="p-4 space-y-3">
        <div className="flex justify-between items-center">
          <div className="h-6 bg-gray-200 rounded w-20" />
          <div className="h-5 bg-gray-200 rounded w-16" />
        </div>
        <div className="h-4 bg-gray-200 rounded w-3/4" />
        <div className="h-3 bg-gray-200 rounded w-1/2" />
      </div>
    </div>
  </div>
);

// Page loader for full page loading
export const PageLoader: React.FC<{ text?: string }> = ({ text = 'Loading...' }) => (
  <div className="min-h-screen flex items-center justify-center bg-gray-50">
    <div className="text-center">
      <Loader size="lg" variant="spinner" className="mx-auto mb-4" />
      <p className="text-gray-600 font-medium">{text}</p>
    </div>
  </div>
);

// Search loader for search button states
export const SearchLoader: React.FC = () => (
  <div className="flex items-center space-x-2">
    <Loader size="sm" variant="dots" />
    <span className="text-sm text-gray-600">Searching...</span>
  </div>
);

// Button loader for loading states in buttons
export const ButtonLoader: React.FC<{ size?: 'sm' | 'md' | 'lg' }> = ({ size = 'sm' }) => (
  <Loader size={size} variant="spinner" className="text-white" />
); 