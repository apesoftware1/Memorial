import { ApolloClient, InMemoryCache, createHttpLink, NormalizedCacheObject } from '@apollo/client';
import { persistCache, LocalStorageWrapper } from 'apollo3-cache-persist';

// Shared cache instance so persistence can hydrate it before client creation
const cache = new InMemoryCache({
  // Type policies can be added here if needed
});

export function createApolloClient(): ApolloClient<NormalizedCacheObject> {
  return new ApolloClient({
    link: createHttpLink({
      uri: 'https://typical-car-e0b66549b3.strapiapp.com/graphql',
      headers: {
        'Content-Type': 'application/json',
      },
    }),
    cache,
    defaultOptions: {
      watchQuery: { fetchPolicy: 'cache-first' },
      query: { fetchPolicy: 'cache-first' },
      mutate: { errorPolicy: 'all' },
    },
  });
}

// Initialize Apollo Client with persisted cache (browser-only)
export async function initializeApolloClient(): Promise<ApolloClient<NormalizedCacheObject>> {
  if (typeof window !== 'undefined') {
    try {
      await persistCache({
        cache,
        storage: new LocalStorageWrapper(window.localStorage),
        key: 'apollo-cache',
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