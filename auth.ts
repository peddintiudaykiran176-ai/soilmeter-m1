import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { allowAuthAttempt } from "@/lib/auth/rate-limit";
import { authenticateUser } from "@/lib/auth/users";
import { loginSchema } from "@/lib/auth/schemas";

export const { handlers, auth, signIn, signOut } = NextAuth({
  secret: process.env.AUTH_SECRET,
  trustHost:
    process.env.AUTH_TRUST_HOST === "true" ||
    process.env.NODE_ENV === "development",
  useSecureCookies: process.env.NODE_ENV === "production",
  pages: {
    signIn: "/login",
  },
  session: {
    strategy: "jwt",
    maxAge: 60 * 60 * 8,
  },
  providers: [
    Credentials({
      credentials: {
        email: { label: "Email address", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials, request) {
        const parsed = loginSchema.safeParse(credentials);
        if (!parsed.success) {
          return null;
        }

        const clientIp = request.headers.get("x-nf-client-connection-ip");
        const allowed = await allowAuthAttempt(
          "login",
          parsed.data.email,
          clientIp,
        );
        if (!allowed) {
          return null;
        }

        return authenticateUser(parsed.data.email, parsed.data.password);
      },
    }),
  ],
  callbacks: {
    session({ session, token }) {
      if (session.user && token.sub) {
        session.user.id = token.sub;
      }
      return session;
    },
  },
});
