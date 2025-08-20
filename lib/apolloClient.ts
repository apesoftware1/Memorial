import { ApolloClient, InMemoryCache, createHttpLink } from '@apollo/client';

const client = new ApolloClient({
  link: createHttpLink({
    uri: 'https://typical-car-e0b66549b3.strapiapp.com/graphql',
    // credentials: 'include', // include cookies if needed
    headers: {
      'Content-Type': 'application/json',
    },
  }),
  cache: new InMemoryCache(),
});
export default client;