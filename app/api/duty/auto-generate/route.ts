import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { generateAutoDuty } from "@/lib/scheduler";

export async function POST(req: Request) {
  const session = await auth();
  const userRole = (session?.user as any)?.role;

  // เฉพาะ Admin และ Super Admin ที่สั่งรันระบบจัดเวรอัตโนมัติได้
  if (!userRole || (userRole !== "ADMIN" && userRole !== "SUPER_ADMIN")) {
    return NextResponse.json({ error: "ไม่ได้รับอนุญาต" }, { status: 403 });
  }

  try {
    const body = await req.json();
    const { dutyCategoryId, startDate, endDate } = body;

    if (!dutyCategoryId || !startDate) {
      return NextResponse.json(
        { error: "กรุณาระบุหมวดหมู่เวรและวันที่ให้ครบถ้วน" },
        { status: 400 }
      );
    }

    const start = new Date(startDate);
    const end = endDate ? new Date(endDate) : start;

    const result = await generateAutoDuty({
      dutyCategoryId,
      startDate: start,
      endDate: end,
    });

    return NextResponse.json({
      success: true,
      message: "จัดเวรอัตโนมัติสำเร็จ",
      data: result,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "เกิดข้อผิดพลาดในการคำนวณจัดเวร" },
      { status: 500 }
    );
  }
}