import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  const session = await auth();
  const currentUser = session?.user as any;

  if (!currentUser || currentUser.role !== "SUPER_ADMIN") {
    return NextResponse.json({ error: "เฉพาะ Super Admin เท่านั้นที่สามารถลบผู้ใช้งานได้" }, { status: 403 });
  }

  try {
    const userId = params.id;

    // ป้องกันไม่ให้ลบตัวเอง
    if (currentUser.id === userId) {
      return NextResponse.json({ error: "ไม่สามารถลบบัญชีของตนเองได้" }, { status: 400 });
    }

    await prisma.user.delete({
      where: { id: userId },
    });

    return NextResponse.json({ message: "Deleted successfully" });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed to delete user" }, { status: 500 });
  }
}