import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { prisma } from "@/lib/prisma";

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  callbacks: {
    async signIn({ user }) {
      if (!user.email) return false;

      try {
        let existingUser = await prisma.user.findUnique({
          where: { email: user.email },
        });

        if (!existingUser) {
          const userCount = await prisma.user.count();
          const role = userCount === 0 ? "SUPER_ADMIN" : "USER";

          await prisma.user.create({
            data: {
              email: user.email,
              name: user.name || "User",
              officialName: user.name || "User",
              image: user.image,
              role: role,
              status: userCount === 0 ? "APPROVED" : "PENDING",
            },
          });
        }
      } catch (err) {
        console.error("Prisma signIn error:", err);
      }

      // คืนค่า true เสมอเพื่อให้ผ่านการ Auth สำเร็จ ไม่ติด Access Denied
      return true;
    },
    async jwt({ token, user }) {
      if (user?.email) {
        try {
          const dbUser = await prisma.user.findUnique({
            where: { email: user.email },
          });
          if (dbUser) {
            token.role = dbUser.role;
            token.status = dbUser.status;
            token.officialName = dbUser.officialName;
          }
        } catch (e) {
          console.error("Prisma jwt error:", e);
        }
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as any).role = token.role || "USER";
        (session.user as any).status = token.status || "PENDING";
        (session.user as any).officialName = token.officialName || session.user.name;
      }
      return session;
    },
  },
  secret: process.env.AUTH_SECRET,
});