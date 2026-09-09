import { NextResponse } from "next/server";
import { auth } from "@/auth";
import prisma from "@/lib/prisma";

// ดึงข้อมูลการลาและภารกิจที่ได้รับอนุมัติแล้วมาแสดงบนปฏิทิน (ถ้าเป็น Admin จะเห็นรายการรออนุมัติด้วย)
export async function GET() {
  const session = await auth();
  const currentUser = session?.user as any;

  if (!currentUser) {
    return NextResponse.json({ error: "กรุณาเข้าสู่ระบบ" }, { status: 401 });
  }

  const isAdmin = currentUser.role === "ADMIN" || currentUser.role === "SUPER_ADMIN";

  const leaves = await prisma.leaveRecord.findMany({
    where: isAdmin ? {} : { status: "APPROVED" },
    include: {
      user: {
        select: {
          id: true,
          officialName: true,
          name: true,
          rank: true,
          officerType: true,
        },
      },
    },
    orderBy: { startDate: "asc" },
  });

  return NextResponse.json(leaves);
}

// ส่งคำขอลา หรือ Admin บันทึกข้อมูล
export async function POST(req: Request) {
  const session = await auth();
  const currentUser = session?.user as any;

  if (!currentUser) {
    return NextResponse.json({ error: "กรุณาเข้าสู่ระบบ" }, { status: 401 });
  }

  const isAdmin = currentUser.role === "ADMIN" || currentUser.role === "SUPER_ADMIN";
  const body = await req.json();
  const { type, reason, startDate, endDate, targetUserId } = body;

  // User ธรรมดาบันทึกได้เฉพาะของตัวเอง และสถานะต้องเป็น PENDING
  // Admin สามารถบันทึกให้คนอื่นได้ และผ่านเป็น APPROVED ทันที
  const assignedUserId = isAdmin && targetUserId ? targetUserId : currentUser.id;
  const initialStatus = isAdmin ? "APPROVED" : "PENDING";

  const newLeave = await prisma.leaveRecord.create({
    data: {
      userId: assignedUserId,
      type,
      reason,
      startDate: new Date(startDate),
      endDate: new Date(endDate),
      status: initialStatus,
      approvedBy: isAdmin ? currentUser.email : null,
    },
  });

  return NextResponse.json(newLeave);
}

// อนุมัติ / ปฏิเสธคำขอลา (เฉพาะ Admin)
export async function PATCH(req: Request) {
  const session = await auth();
  const currentUser = session?.user as any;

  if (!currentUser || (currentUser.role !== "ADMIN" && currentUser.role !== "SUPER_ADMIN")) {
    return NextResponse.json({ error: "ไม่มีสิทธิ์ดำเนินการ" }, { status: 403 });
  }

  const body = await req.json();
  const { id, status } = body;

  const updated = await prisma.leaveRecord.update({
    where: { id },
    data: {
      status,
      approvedBy: currentUser.email,
    },
  });

  return NextResponse.json(updated);
}