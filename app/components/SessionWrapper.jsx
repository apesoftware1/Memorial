"use client";
import { SessionProvider } from 'next-auth/react';

export default function SessionWrapper({ children }) {
  return (
    <SessionProvider
      refetchInterval={0} // Disable automatic refetching to prevent errors
    >
      {children}
    </SessionProvider>
  );
} 