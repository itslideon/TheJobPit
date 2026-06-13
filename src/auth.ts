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

        const { syncAdminRoleForEmail } = await import("@/lib/admin");
        await syncAdminRoleForEmail(user.id, user.email);

        const refreshed = await prisma.user.findUnique({
          where: { id: user.id },
          select: { id: true, email: true, name: true, role: true }
        });

        return {
          id: refreshed!.id,
          email: refreshed!.email,
          name: refreshed!.name,
          role: refreshed!.role
        };
      }
    })
  ],
  callbacks: {
    jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = (user as { role?: string }).role ?? "USER";
      }
      return token;
    },
    session({ session, token }) {
      if (session.user && token.id) {
        session.user.id = token.id as string;
        session.user.role = (token.role as "USER" | "ADMIN") ?? "USER";
      }
      return session;
    }
  },
  pages: {
    signIn: "/login"
  }
});
