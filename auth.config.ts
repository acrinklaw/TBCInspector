import type { NextAuthConfig } from "next-auth";

export const authConfig = {
  trustHost: !!process.env.VERCEL,
  session: { strategy: "jwt" },
  pages: { signIn: "/sign-in" },
  providers: [],
  callbacks: {
    authorized({ auth }) {
      return !!auth?.user;
    },
  },
} satisfies NextAuthConfig;
