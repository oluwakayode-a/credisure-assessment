import type { NextAuthOptions } from "next-auth";
import Credentials from "next-auth/providers/credentials";

export const authOptions: NextAuthOptions = {
  session: { strategy: "jwt", maxAge: 60 * 60 },
  pages: { signIn: "/login" },
  providers: [
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const email = String(credentials?.email ?? "");
        const password = String(credentials?.password ?? "");
        if (!email || !password) return null;
        try {
          const response = await fetch(
            `${process.env.API_URL ?? "http://localhost:8000"}/auth/login`,
            {
              method: "POST",
              headers: { "Content-Type": "application/x-www-form-urlencoded" },
              body: new URLSearchParams({ username: email, password }),
              cache: "no-store",
            },
          );
          if (!response.ok) return null;
          const result = await response.json();
          return {
            id: String(result.user.id),
            name: result.user.full_name,
            email: result.user.email,
            role: result.user.role,
            accessToken: result.access_token,
            accessTokenExpires: Date.now() + result.expires_in * 1000,
          };
        } catch {
          return null;
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.accessToken = user.accessToken;
        token.role = user.role;
        token.accessTokenExpires = user.accessTokenExpires;
      }
      if (Date.now() >= (token.accessTokenExpires ?? 0))
        throw new Error("API access token expired");
      return token;
    },
    async session({ session, token }) {
      session.accessToken = token.accessToken;
      if (session.user) {
        session.user.id = token.sub ?? "";
        session.user.role = token.role;
      }
      return session;
    },
  },
};
