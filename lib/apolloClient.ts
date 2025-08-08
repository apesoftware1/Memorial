import { ApolloClient, InMemoryCache, createHttpLink } from '@apollo/client';

const client = new ApolloClient({
  link: createHttpLink({
    uri: 'https://balanced-sunrise-2fce1c3d37.strapiapp.com/graphql',
    // credentials: 'include', // include cookies if needed
    headers: {
      'Content-Type': 'application/json',
    },
  }),
  cache: new InMemoryCache(),
});
export default client; 