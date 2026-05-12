import { ApolloClient, InMemoryCache, createHttpLink, NormalizedCacheObject, from } from '@apollo/client';
import { persistCache, LocalStorageWrapper } from 'apollo3-cache-persist';
import { onError } from '@apollo/client/link/error';

const APOLLO_CACHE_VERSION = '2026-05-12-1';
const APOLLO_CACHE_META_KEY = 'apollo-cache-meta';

// Shared cache instance so persistence can hydrate it before client creation
const cache = new InMemoryCache({
  typePolicies: {
    Listing: {
      keyFields: ["documentId"],
    },
    Company: {
      keyFields: ["documentId"],
    },
    Branch: {
      keyFields: ["documentId"],
    },
    ListingCategory: {
      keyFields: ["documentId"],
    },
    BlogPost: {
      keyFields: ["documentId"],
    },
    UsersPermissionsUser: {
      keyFields: ["documentId"],
    },
    InquiryC: {
      keyFields: ["documentId"],
    },
    Inquiry: {
      keyFields: ["documentId"],
    },
  },
});

export function createApolloClient(): ApolloClient<NormalizedCacheObject> {
  const uri = process.env.NEXT_PUBLIC_STRAPI_GRAPHQL_URL;
  if (!uri) {
    console.error('NEXT_PUBLIC_STRAPI_GRAPHQL_URL is not defined');
  }

  const errorLink = onError(({ graphQLErrors, networkError }) => {
    if (graphQLErrors)
      graphQLErrors.forEach(({ message, locations, path }) =>
        console.error(
          `[GraphQL error]: Message: ${message}, Location: ${locations}, Path: ${path}`
        )
      );
    if (networkError) console.error(`[Network error]: ${networkError}`);
  });

  const httpLink = createHttpLink({
    uri: uri || 'https://api.tombstonesfinder.co.za/graphql', // Fallback if env var missing
    fetchOptions: {
      timeout: 300000, // 300 seconds (5 minutes) timeout
    },
    headers: {
      'Content-Type': 'application/json',
    },
  });

  return new ApolloClient({
    link: from([errorLink, httpLink]),
    cache,
    defaultOptions: {
      watchQuery: { fetchPolicy: 'cache-and-network', nextFetchPolicy: 'cache-first' },
      query: { fetchPolicy: 'network-only' },
      mutate: { errorPolicy: 'all' },
    },
  });
}

// Initialize Apollo Client with persisted cache (browser-only)
export async function initializeApolloClient(): Promise<ApolloClient<NormalizedCacheObject>> {
  if (typeof window !== 'undefined') {
    try {
      const storage = window.localStorage;
      const desiredCacheKey = `apollo-cache:${APOLLO_CACHE_VERSION}`;

      const existingMetaRaw = storage.getItem(APOLLO_CACHE_META_KEY);
      const existingMeta = existingMetaRaw ? JSON.parse(existingMetaRaw) : null;

      if (!existingMeta || existingMeta.version !== APOLLO_CACHE_VERSION) {
        if (existingMeta?.cacheKey) storage.removeItem(existingMeta.cacheKey);
        storage.removeItem('apollo-cache');
        storage.setItem(
          APOLLO_CACHE_META_KEY,
          JSON.stringify({ version: APOLLO_CACHE_VERSION, cacheKey: desiredCacheKey })
        );
        await cache.reset();
      }

      await persistCache({
        cache,
        storage: new LocalStorageWrapper(storage),
        key: desiredCacheKey,
      });
    } catch (e) {
      console.warn('Apollo cache persistence failed; proceeding without persisted cache.', e);
    }
  }
  return createApolloClient();
}

// Fallback synchronous client for modules that import default client directly
const client = createApolloClient();
export default client;
