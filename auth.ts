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

      // ค้นหาว่ามีผู้ใช้งานนี้ในฐานข้อมูลหรือยัง
      let existingUser = await prisma.user.findUnique({
        where: { email: user.email },
      });

      // ถ้ายังไม่มี ให้สร้างขึ้นใหม่ในฐานข้อมูลอัตโนมัติ
      if (!existingUser) {
        // ตรวจสอบว่าระบบมีผู้ใช้งานคนแรกหรือยัง (ถ้าเป็นคนแรกให้สิทธิ์ SUPER_ADMIN ทันที)
        const userCount = await prisma.user.count();
        const role = userCount === 0 ? "SUPER_ADMIN" : "USER";

        existingUser = await prisma.user.create({
          data: {
            email: user.email,
            name: user.name || "Unknown",
            officialName: user.name || "Unknown",
            image: user.image,
            role: role,
            status: userCount === 0 ? "APPROVED" : "PENDING",
          },
        });
      }

      return true;
    },
    async jwt({ token, user }) {
      if (user?.email) {
        const dbUser = await prisma.user.findUnique({
          where: { email: user.email },
        });
        if (dbUser) {
          token.role = dbUser.role;
          token.status = dbUser.status;
          token.officialName = dbUser.officialName;
        }
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as any).role = token.role;
        (session.user as any).status = token.status;
        (session.user as any).officialName = token.officialName;
      }
      return session;
    },
  },
});