import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import { db } from "@/lib/db";

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    Google({
      clientId: process.env.AUTH_GOOGLE_ID,
      clientSecret: process.env.AUTH_GOOGLE_SECRET,
    }),
  ],
  callbacks: {
    async signIn({ user }) {
      if (!user.email) return false;

      // บังคับให้อีเมลแอดมินหลักของคุณผ่านการตรวจสอบได้ทันที
      if (user.email === "suppaya32353@gmail.com") {
        return true;
      }

      // ตรวจสอบข้อมูลผู้ใช้ในฐานข้อมูลตามปกติสำหรับบัญชีอื่นๆ
      const dbUser = await db.user.findUnique({
        where: { email: user.email },
      });

      if (!dbUser || dbUser.status !== "ACTIVE") {
        return false; 
      }

      return true;
    },
    async session({ session }) {
      if (session.user?.email) {
        // บังคับกำหนดสถานะและสิทธิ์ให้แอดมินหลักเป็น SUPER_ADMIN และ ACTIVE เสมอ
        if (session.user.email === "suppaya32353@gmail.com") {
          (session.user as any).role = "SUPER_ADMIN";
          (session.user as any).status = "ACTIVE";
          return session;
        }

        const dbUser = await db.user.findUnique({
          where: { email: session.user.email },
        });
        if (dbUser) {
          (session.user as any).id = dbUser.id;
          (session.user as any).role = dbUser.role;
          (session.user as any).status = dbUser.status;
        }
      }
      return session;
    },
  },
  pages: {
    signIn: "/auth/signin",
    error: "/auth/error",
  },
});