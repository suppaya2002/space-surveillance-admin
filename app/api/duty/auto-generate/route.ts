import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { generateAutoDutySchedule } from "@/lib/scheduler";

export async function POST(req: Request) {
  const session = await auth();

  // จำกัดให้เฉพาะระดับ Admin และ Super Admin สั่งรันระบบจัดเวร
  if (!session || (session.user.role !== "ADMIN" && session.user.role !== "SUPER_ADMIN")) {
    return NextResponse.json({ error: "ไม่ได้รับอนุญาต (Unauthorized)" }, { status: 403 });
  }

  try {
    const body = await req.json();
    const { taskTypeId, targetDate, primaryCount, reserveCount } = body;

    const result = await generateAutoDutySchedule({
      taskTypeId,
      targetDate: new Date(targetDate),
      primaryCount: Number(primaryCount),
      reserveCount: Number(reserveCount),
    });

    return NextResponse.json({ success: true, result });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "เกิดข้อผิดพลาดในการประมวลผล" }, { status: 400 });
  }
}