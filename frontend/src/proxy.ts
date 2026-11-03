import { withAuth } from "next-auth/middleware";

export default withAuth({
  pages: { signIn: "/login" },
  callbacks: {
    authorized: ({ token }) => Date.now() < (token?.accessTokenExpires ?? 0),
  },
});

export const config = { matcher: ["/dashboard/:path*"] };
