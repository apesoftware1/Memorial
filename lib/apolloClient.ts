import { ApolloClient, InMemoryCache, createHttpLink, NormalizedCacheObject, from } from '@apollo/client';
import { persistCache, LocalStorageWrapper } from 'apollo3-cache-persist';
import { onError } from '@apollo/client/link/error';

// Shared cache instance so persistence can hydrate it before client creation
const cache = new InMemoryCache({
  typePolicies: {
    Listing: {
      keyFields: "documentId",
    },
    Company: {
      keyFields: "documentId",
    },
    Branch: {
      keyFields: "documentId",
    },
    ListingCategory: {
      keyFields: "documentId",
    },
    BlogPost: {
      keyFields: "documentId",
    },
    UsersPermissionsUser: {
      keyFields: "documentId",
    },
    InquiryC: {
      keyFields: "documentId",
    },
    Inquiry: {
      keyFields: "documentId",
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
    uri,
    headers: {
      'Content-Type': 'application/json',
    },
  });

  return new ApolloClient({
    link: from([errorLink, httpLink]),
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
