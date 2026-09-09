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

      // ตรวจสอบว่ามีอีเมลนี้ในฐานข้อมูลหรือยัง
      let dbUser = await db.user.findUnique({
        where: { email: user.email },
      });

      // ถ้ายังไม่เคยมีในระบบ ให้สร้างให้อัตโนมัติทันที
      if (!dbUser) {
        dbUser = await db.user.create({
          data: {
            email: user.email,
            name: user.name || "",
            role: "USER",     // สิทธิ์เริ่มต้นทั่วไป
            status: "ACTIVE", // เปิดใช้งานให้อัตโนมัติทันที ไม่ติด PENDING
          },
        });
      }

      // อนุญาตให้ทุก Gmail ผ่านเข้าสู่ระบบได้ทันที
      return true;
    },
    async session({ session }) {
      if (session.user?.email) {
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