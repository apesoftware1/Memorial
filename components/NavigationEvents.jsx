'use client';

import { useEffect } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';

export function NavigationEvents({ setIsLoading }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    const url = `${pathname}${searchParams ? `?${searchParams}` : ''}`;
    
    // Set loading to false when navigation is complete
    setIsLoading(false);
    
    // This function will run on component mount and when the URL changes
    const handleRouteChange = () => {
      setIsLoading(true);
    };

    // Add event listener for navigation
    window.addEventListener('beforeunload', handleRouteChange);
    
    return () => {
      window.removeEventListener('beforeunload', handleRouteChange);
    };
  }, [pathname, searchParams, setIsLoading]);

  return null;
}