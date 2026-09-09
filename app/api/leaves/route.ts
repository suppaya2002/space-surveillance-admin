import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET() {
  const leaves = await prisma.leaveRecord.findMany({
    include: { user: true },
    orderBy: { startDate: "desc" },
  });
  return NextResponse.json(leaves);
}

export async function POST(req: Request) {
  try {
    const { userId, leaveType, startDate, endDate, reason } = await req.json();
    if (!userId || !startDate || !endDate) {
      return NextResponse.json({ error: "ข้อมูลไม่ครบถ้วน" }, { status: 400 });
    }

    const newLeave = await prisma.leaveRecord.create({
      data: {
        userId,
        leaveType,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        reason,
        isApproved: true, // ไม่ต้องรอ Login อนุมัติ เป็น Active ทันที
      },
      include: { user: true },
    });
    return NextResponse.json(newLeave);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}