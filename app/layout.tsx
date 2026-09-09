import type { Metadata } from "next";
import "./globals.css";
import SessionProvider from "@/components/SessionProvider";

export const metadata: Metadata = {
  title: "ระบบธุรการกองเฝ้าระวังทางอวกาศ",
  description: "ระบบบริหารจัดการเวรและธุรการ กองเฝ้าระวังทางอวกาศ",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="th">
      <body>
        <SessionProvider>{children}</SessionProvider>
      </body>
    </html>
  );
}