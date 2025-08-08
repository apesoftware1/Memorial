'use client';

import { ApolloProvider } from '@apollo/client';
import client from '@/lib/apolloClient';
import React from 'react';

export default function ApolloWrapper({ children }: { children: React.ReactNode }) {
  return <ApolloProvider client={client}>{children}</ApolloProvider>;
}
