import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";

const handler = NextAuth({
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        const res = await fetch("https://balanced-sunrise-2fce1c3d37.strapiapp.com/api/auth/local", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            identifier: credentials.email,
            password: credentials.password
          }),
        });
        const user = await res.json();
        if (res.ok && user.jwt) {
          return {
            id: user.user.id,
            documentId: user.user.documentId || user.user.id,
            name: user.user.username,
            email: user.user.email,
            jwt: user.jwt
          };
        }
        return null;
      }
    })
  ],
  session: {
    strategy: "jwt",
    maxAge: 24 * 60 * 60, // 24 hours (1 day)
    updateAge: 60 * 60, // 1 hour
  },
  jwt: {
    maxAge: 24 * 60 * 60, // 24 hours (1 day)
  },
  cookies: {
    sessionToken: {
      name: `next-auth.session-token`,
      options: {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        secure: process.env.NODE_ENV === 'production',
        maxAge: 24 * 60 * 60, // 24 hours (1 day)
      },
    },
    callbackUrl: {
      name: `next-auth.callback-url`,
      options: {
        sameSite: 'lax',
        path: '/',
        secure: process.env.NODE_ENV === 'production',
      },
    },
    csrfToken: {
      name: `next-auth.csrf-token`,
      options: {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        secure: process.env.NODE_ENV === 'production',
      },
    },
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.jwt = user.jwt;
        token.documentId = user.documentId;
      }
      return token;
    },
    async session({ session, token }) {
      session.jwt = token.jwt;
      session.user.documentId = token.documentId;
      return session;
    }
  },
  pages: {
    signIn: '/manufacturers/login-page',
    signOut: '/manufacturers/login-page',
    error: '/manufacturers/login-page',
  },
});

export { handler as GET, handler as POST }; 