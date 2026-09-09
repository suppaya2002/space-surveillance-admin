import { NextResponse } from "next/server";
import { auth } from "@/auth";
import prisma from "@/lib/prisma";

// ดึงรายการลาทั้งหมด
export async function GET() {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const leaves = await prisma.leaveRecord.findMany({
    include: { user: true },
    orderBy: { startDate: "desc" },
  });
  return NextResponse.json(leaves);
}

// บันทึกคำขอลา (User ลาได้เฉพาะตัวเอง, Admin เลือกลาให้ใครก็ได้)
export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const currentUser = session.user as any;
  const isAdmin = currentUser.role === "ADMIN" || currentUser.role === "SUPER_ADMIN";

  const { userId, leaveType, startDate, endDate, reason, isApproved } = await req.json();

  // ป้องกันไม่ให้ User ทั่วไปส่ง userId ของคนอื่น
  const targetUserId = isAdmin && userId ? userId : currentUser.id;

  const newLeave = await prisma.leaveRecord.create({
    data: {
      userId: targetUserId,
      leaveType,
      startDate: new Date(startDate),
      endDate: new Date(endDate),
      reason,
      isApproved: isAdmin ? Boolean(isApproved) : false, // User ทั่วไปต้องรออนุมัติเสมอ
    },
    include: { user: true },
  });

  return NextResponse.json(newLeave);
}