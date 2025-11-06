'use client';

import React, { useEffect, useState } from 'react';
import { ApolloClient, ApolloProvider, NormalizedCacheObject } from '@apollo/client';
import client, { initializeApolloClient, createApolloClient } from '@/lib/apolloClient';

export default function ApolloWrapper({ children }: { children: React.ReactNode }) {
  const [readyClient, setReadyClient] = useState<ApolloClient<NormalizedCacheObject> | null>(null);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const c = await initializeApolloClient();
        if (mounted) setReadyClient(c);
      } catch {
        // Fallback: ensure we still render with a working client
        if (mounted) setReadyClient(createApolloClient());
      }
    })();
    return () => { mounted = false; };
  }, []);

  // If persistence hasn't completed yet, render children with the synchronous client
  // to avoid a blank screen. This still allows queries to resolve, and the cache
  // will hydrate as soon as persistence finishes.
  const providerClient = readyClient ?? client;
  return <ApolloProvider client={providerClient}>{children}</ApolloProvider>;
}
