import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";

const handler = NextAuth({
  cookies: {
    sessionToken: {
      name: `next-auth.session-token`,
      options: {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        secure: process.env.NODE_ENV === 'production'
      }
    }
  },
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        try {
          // Regular user authentication via Strapi
          try {
            const res = await fetch("https://typical-car-e0b66549b3.strapiapp.com/api/auth/local", {
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
            
            const contentType = res.headers.get("content-type");
            if (!contentType || !contentType.includes("application/json")) {
             
              return null;
            }
            
            const user = await res.json();
            if (user.jwt) {
              const isAdmin = String(user?.user?.username || "").toLowerCase() === "superadmin";
              return {
                id: user.user.id,
                documentId: user.user.documentId || user.user.id,
                name: user.user.username,
                email: user.user.email,
                role: isAdmin ? "admin" : "manufacturer",
                isAdmin,
                jwt: user.jwt
              };
            }
            return null;
          } catch (error) {
           
            return null;
          }
        } catch (error) {
         
          return null;
        }
      }
    })
  ],
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  events: {
    async signIn({ user, account, profile }) {
      // Session token will be automatically stored in cookies by NextAuth
      
    },
    async signOut({ session, token }) {
      // Session token will be automatically removed from cookies by NextAuth
     
    }
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
  debug: false,
});

export { handler as GET, handler as POST };