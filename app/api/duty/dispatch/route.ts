import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { dispatchAutoDuty } from "@/lib/auto-dispatcher";
import { db } from "@/lib/db";

export async function POST(req: Request) {
  const session = await auth();
  const currentUser = session?.user as any;

  if (!currentUser || (currentUser.role !== "ADMIN" && currentUser.role !== "SUPER_ADMIN")) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const { dutyTypeId, startDate, endDate } = await req.json();

    if (!dutyTypeId || !startDate || !endDate) {
      return NextResponse.json({ error: "ข้อมูลไม่ครบถ้วน" }, { status: 400 });
    }

    const start = new Date(startDate);
    const end = new Date(endDate);
    
    if (start > end) {
      return NextResponse.json({ error: "วันสิ้นสุดต้องมากกว่าหรือเท่ากับวันเริ่มต้น" }, { status: 400 });
    }

    const results = [];

    // วนลูปจัดเวรทีละวันอย่างปลอดภัย
    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
      const targetDateStr = new Date(d);
      try {
        const result = await dispatchAutoDuty({
          dutyTypeId,
          targetDate: targetDateStr,
        });
        results.push(result);
      } catch (err: any) {
        throw new Error(`ไม่สามารถจัดเวรวันที่ ${targetDateStr.toLocaleDateString('th-TH')} ได้: ${err.message}`);
      }
    }

    return NextResponse.json({ message: "Success", results });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed to dispatch" }, { status: 400 });
  }
}