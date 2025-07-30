import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";

// Admin credentials - you can change these
const ADMIN_CREDENTIALS = {
  email: "regan@tombstonesfinder.com",
  password: "admin123", // Change this to your desired admin password
  name: "Regan",
  role: "admin"
};

// Admin email addresses that should have access to the dashboard
const ADMIN_EMAILS = [
  'regan@tombstonesfinder.com',
  'admin@tombstonesfinder.com',
  // Add any other admin emails here
];

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
          // Check if this is an admin login
          if (credentials.email === ADMIN_CREDENTIALS.email && 
              credentials.password === ADMIN_CREDENTIALS.password) {
            return {
              id: "admin-1",
              documentId: "admin-1",
              name: ADMIN_CREDENTIALS.name,
              email: ADMIN_CREDENTIALS.email,
              role: ADMIN_CREDENTIALS.role,
              isAdmin: true,
              jwt: "admin-jwt-token"
            };
          }

          // Regular user authentication via Strapi
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
              role: "manufacturer",
              isAdmin: ADMIN_EMAILS.includes(user.user.email.toLowerCase()),
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
        token.role = user.role;
        token.isAdmin = user.isAdmin;
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.jwt = token.jwt;
        session.user.documentId = token.documentId;
        session.user.role = token.role;
        session.user.isAdmin = token.isAdmin;
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