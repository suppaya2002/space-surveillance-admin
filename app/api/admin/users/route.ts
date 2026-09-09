import { NextResponse } from "next/server";
import { auth } from "@/auth";
import prisma from "@/lib/prisma";

// ดึงรายชื่อผู้ใช้ทั้งหมด
export async function GET() {
  const session = await auth();
  const currentUser = session?.user as any;

  if (!currentUser || (currentUser.role !== "SUPER_ADMIN" && currentUser.role !== "ADMIN")) {
    return NextResponse.json({ error: "ไม่ได้รับอนุญาต" }, { status: 403 });
  }

  const users = await prisma.user.findMany({
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(users);
}

// อัปเดตข้อมูล, ยศ-ชื่อสกุล, ระดับชั้นยศ, สิทธิ์ และการอนุมัติ
export async function PATCH(req: Request) {
  const session = await auth();
  const currentUser = session?.user as any;

  if (!currentUser || (currentUser.role !== "SUPER_ADMIN" && currentUser.role !== "ADMIN")) {
    return NextResponse.json({ error: "ไม่ได้รับอนุญาต" }, { status: 403 });
  }

  const body = await req.json();
  const { id, officialName, rank, officerType, role, status } = body;

  // เฉพาะ SUPER_ADMIN เท่านั้นที่สามารถแต่งตั้งหรือปลด ADMIN / SUPER_ADMIN ได้
  if ((role === "ADMIN" || role === "SUPER_ADMIN") && currentUser.role !== "SUPER_ADMIN") {
    return NextResponse.json({ error: "สิทธิ์ไม่เพียงพอในการแต่งตั้ง Admin" }, { status: 403 });
  }

  const updatedUser = await prisma.user.update({
    where: { id },
    data: {
      officialName,
      rank,
      officerType,
      role,
      status,
    },
  });

  return NextResponse.json(updatedUser);
}