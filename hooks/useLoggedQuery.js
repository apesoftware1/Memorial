import { useEffect, useRef } from 'react';
import { useQuery } from '@apollo/client';

/**
 * Custom hook that wraps Apollo's useQuery and logs timing + payload details.
 * @param {import('@apollo/client').DocumentNode} query - GraphQL query document
 * @param {object} options - Apollo useQuery options
 * @param {string} label - Optional label for console logs
 * @returns {import('@apollo/client').QueryResult<any>} The full useQuery result
 */
export function useLoggedQuery(query, options = {}, label = 'GraphQL Query') {
  const startRef = useRef(null);

  const result = useQuery(query, options);
  const { loading, error, data } = result;

  // Capture start time when a fetch starts (initial or refetch)
  useEffect(() => {
    if (loading) {
      startRef.current = performance.now();
      if (options && options.variables) {
        try {
          const size = JSON.stringify(options.variables).length;
          console.log(`[${label}] variables size ~${size} chars`);
        } catch (_) {
          // ignore serialization errors
        }
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loading]);

  // Log when loading completes (success or error)
  useEffect(() => {
    if (!loading) {
      const end = performance.now();
      const duration = Math.round(end - (startRef.current ?? end));
      console.log(`[${label}] finished in ${duration}ms`);

      if (data !== undefined) {
        try {
          const serialized = JSON.stringify(data);
          console.log(`[${label}] data size ~${serialized.length} chars`);
        } catch (_) {
          // ignore serialization errors
        }
        console.log(`[${label}] data:`, data);
      }
      if (error) {
        console.error(`[${label}] error:`, error);
      }
    }
  }, [loading, data, error, label]);

  return result; // return the full useQuery result
}