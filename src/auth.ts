import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { z } from "zod";

export const { handlers, auth, signIn, signOut } = NextAuth({
  trustHost: true,
  providers: [
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        const schema = z.object({
          email: z.string().email(),
          password: z.string().min(1)
        });
        const parsed = schema.safeParse(credentials);
        if (!parsed.success) {
          return null;
        }

        const { prisma } = await import("@/lib/prisma");
        const { verifyPassword } = await import("@/lib/password");

        const email = parsed.data.email.toLowerCase().trim();
        const user = await prisma.user.findFirst({
          where: {
            email: { equals: email, mode: "insensitive" }
          }
        });
        if (!user) {
          return null;
        }

        const match = await verifyPassword(parsed.data.password, user.passwordHash);
        if (!match) {
          return null;
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name
        };
      }
    })
  ],
  callbacks: {
    jwt({ token, user }) {
      if (user) {
        token.id = user.id;
      }
      return token;
    },
    session({ session, token }) {
      if (session.user && token.id) {
        session.user.id = token.id as string;
      }
      return session;
    }
  },
  pages: {
    signIn: "/login"
  }
});
