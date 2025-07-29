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
        try {
          const res = await fetch("https://balanced-sunrise-2fce1c3d37.strapiapp.com/api/auth/local", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              identifier: credentials.email,
              password: credentials.password
            }),
          });
          
          if (!res.ok) {
            return null;
          }
          
          const user = await res.json();
          if (user.jwt) {
            return {
              id: user.user.id,
              documentId: user.user.documentId || user.user.id,
              name: user.user.username,
              email: user.user.email,
              jwt: user.jwt
            };
          }
          return null;
        } catch (error) {
          console.error("Auth error:", error);
          return null;
        }
      }
    })
  ],
  session: {
    strategy: "jwt",
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
      if (token) {
        session.jwt = token.jwt;
        session.user.documentId = token.documentId;
      }
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