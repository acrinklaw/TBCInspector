import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { compare } from "bcryptjs";
import { authConfig } from "./auth.config";

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  providers: [
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const email = credentials?.email as string | undefined;
        const password = credentials?.password as string | undefined;

        if (!email || !password) {
          console.log("[auth] Missing email or password");
          return null;
        }

        const adminEmail = process.env.ADMIN_EMAIL;
        const adminHash = process.env.ADMIN_PASSWORD_HASH;

        console.log("[auth] ADMIN_EMAIL set:", !!adminEmail);
        console.log("[auth] ADMIN_PASSWORD_HASH set:", !!adminHash);
        console.log("[auth] ADMIN_PASSWORD_HASH starts with $2b:", adminHash?.startsWith("$2b"));
        console.log("[auth] ADMIN_PASSWORD_HASH length:", adminHash?.length);

        if (!adminEmail || !adminHash) return null;
        if (email.toLowerCase() !== adminEmail.toLowerCase()) {
          console.log("[auth] Email mismatch");
          return null;
        }

        const valid = await compare(password, adminHash);
        console.log("[auth] bcrypt compare result:", valid);
        if (!valid) return null;

        return { id: "1", email: adminEmail, name: "Admin" };
      },
    }),
  ],
});
