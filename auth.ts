import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import prisma from "@/lib/prisma";

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  session: { strategy: "jwt" },
  callbacks: {
    async signIn({ user }) {
      if (!user.email) return false;

      const userCount = await prisma.user.count();
      const existing = await prisma.user.findUnique({ where: { email: user.email } });

      if (!existing) {
        await prisma.user.create({
          data: {
            email: user.email,
            name: user.name,
            role: userCount === 0 ? "SUPER_ADMIN" : "USER",
            status: userCount === 0 ? "ACTIVE" : "PENDING",
          },
        });
      }
      return true;
    },
    async jwt({ token }) {
      if (token.email) {
        const dbUser = await prisma.user.findUnique({ where: { email: token.email } });
        if (dbUser) {
          (token as any).id = dbUser.id;
          (token as any).role = dbUser.role;
          (token as any).status = dbUser.status;
          (token as any).rank = dbUser.rank;
          (token as any).firstName = dbUser.firstName;
          (token as any).lastName = dbUser.lastName;
          (token as any).category = dbUser.category;
        }
      }
      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        const user = session.user as any;
        const t = token as any;
        user.id = t.id;
        user.role = t.role;
        user.status = t.status;
        user.rank = t.rank;
        user.firstName = t.firstName;
        user.lastName = t.lastName;
        user.category = t.category;
      }
      return session;
    },
  },
});