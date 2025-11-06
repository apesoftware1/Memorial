import { useEffect, useMemo, useRef, useState } from 'react';
import { useApolloClient, useQuery } from '@apollo/client';

/**
 * useProgressiveQuery
 * 
 * A universal, cache-aware, progressive data fetching hook for Apollo GraphQL.
 *
 * Features:
 * 1️⃣ Instant initial render (minimal query).
 * 2️⃣ Background full data fetch & cache population.
 * 3️⃣ Automatic delta refresh every few seconds.
 * 4️⃣ Persistent localStorage timestamp (for incremental syncs).
 *
 * @param {Object} options
 * @param {DocumentNode} options.initialQuery - Lightweight query for first render.
 * @param {DocumentNode} options.fullQuery - Full data query for background caching.
 * @param {DocumentNode} [options.deltaQuery] - Optional delta query for incremental updates.
 * @param {Object} [options.variables] - Base query variables.
 * @param {string} [options.storageKey='data:lastUpdated'] - Key for localStorage persistence.
 * @param {number} [options.refreshInterval=3000] - Background sync interval in ms.
 * @returns {Object} { data, loading, error }
 */
export function useProgressiveQuery({
  initialQuery,
  fullQuery,
  deltaQuery,
  variables = {},
  storageKey = 'data:lastUpdated',
  refreshInterval = 3000,
}) {
  const client = useApolloClient();
  const mountedRef = useRef(true);
  const [fullData, setFullData] = useState(null);

  // Initial lightweight query for fast render
  const {
    data: initialData,
    loading: initialLoading,
    error: initialError,
  } = useQuery(initialQuery, {
    variables,
    fetchPolicy: 'cache-first',
    nextFetchPolicy: 'cache-first',
  });

  // Subscribe to Apollo cache for live updates
  useEffect(() => {
    mountedRef.current = true;
    const observable = client.watchQuery({
      query: fullQuery,
      fetchPolicy: 'cache-first',
    });
    const sub = observable.subscribe({
      next: ({ data }) => {
        if (mountedRef.current) setFullData(data);
      },
      error: (err) => console.error('[watchQuery error]', err),
    });
    return () => {
      mountedRef.current = false;
      sub.unsubscribe();
    };
  }, [client, fullQuery]);

  // Background full data fetch to populate cache
  useEffect(() => {
    if (!initialLoading && initialData) {
      (async () => {
        const start = performance.now();
        try {
          const { data } = await client.query({
            query: fullQuery,
            fetchPolicy: 'network-only',
          });

          // Track last updated timestamp for delta refresh
          const maxUpdated = getMaxUpdatedTime(data);
          if (maxUpdated && typeof window !== 'undefined') {
            window.localStorage.setItem(storageKey, String(maxUpdated));
          }

          console.log(`[Background Fetch] ${(performance.now() - start).toFixed(0)} ms`);
        } catch (err) {
          console.error('[Full Fetch Error]', err);
        }
      })();
    }
  }, [initialData, initialLoading, client, fullQuery, storageKey]);

  // Silent background delta refresh
  useEffect(() => {
    if (!deltaQuery) return;

    const interval = setInterval(async () => {
      try {
        const sinceMs =
          typeof window !== 'undefined'
            ? Number(window.localStorage.getItem(storageKey) || 0)
            : 0;

        const sinceIso = sinceMs > 0 ? new Date(sinceMs).toISOString() : null;

        if (!sinceIso) {
          // No timestamp yet — perform full sync
          await client.query({ query: fullQuery, fetchPolicy: 'network-only' });
          return;
        }

        const { data: delta } = await client.query({
          query: deltaQuery,
          variables: { since: sinceIso },
          fetchPolicy: 'network-only',
        });

        // Merge new updates into cache
        mergeQueryCache(client, fullQuery, delta);

        // Update timestamp
        const maxUpdated = getMaxUpdatedTime(delta);
        if (maxUpdated && typeof window !== 'undefined') {
          window.localStorage.setItem(storageKey, String(maxUpdated));
        }
      } catch (err) {
        console.error('[Silent Refresh Error]', err);
      }
    }, refreshInterval);

    return () => clearInterval(interval);
  }, [client, deltaQuery, fullQuery, refreshInterval, storageKey]);

  // Choose best available data source
  const data = useMemo(() => fullData || initialData, [fullData, initialData]);

  return { data, loading: initialLoading, error: initialError };
}

/** Helpers **/

function getMaxUpdatedTime(data) {
  if (!data) return 0;
  const timestamps = extractUpdatedAtValues(data);
  return timestamps.length ? Math.max(...timestamps) : 0;
}

function extractUpdatedAtValues(obj) {
  if (!obj) return [];
  const timestamps = [];
  const collect = (value) => {
    if (Array.isArray(value)) value.forEach(collect);
    else if (value && typeof value === 'object') {
      if (value.updatedAt) {
        const time = new Date(value.updatedAt).getTime();
        if (!isNaN(time)) timestamps.push(time);
      }
      Object.values(value).forEach(collect);
    }
  };
  collect(obj);
  return timestamps;
}

function mergeQueryCache(client, query, newData) {
  if (!newData) return;
  try {
    const existing = client.readQuery({ query }) || {};
    const merged = deepMerge(existing, newData);
    client.writeQuery({ query, data: merged });
  } catch (err) {
    console.error('[Cache Merge Error]', err);
  }
}

function deepMerge(target, source) {
  if (Array.isArray(target) && Array.isArray(source)) {
    const map = new Map();
    [...target, ...source].forEach((item) => {
      const id = item?.documentId || item?.id || JSON.stringify(item);
      map.set(id, item);
    });
    return Array.from(map.values());
  } else if (target && typeof target === 'object' && source && typeof source === 'object') {
    const result = { ...target };
    for (const key of Object.keys(source)) {
      result[key] = deepMerge(target[key], source[key]);
    }
    return result;
  }
  return source;
}