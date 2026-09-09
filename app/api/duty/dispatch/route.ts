import { NextResponse } from "next/server";
import { dispatchAutoDuty } from "@/lib/auto-dispatcher";

export async function POST(req: Request) {
  try {
    const { dutyTypeId, targetDate } = await req.json();
    const result = await dispatchAutoDuty({
      dutyTypeId,
      targetDate: new Date(targetDate),
    });
    return NextResponse.json(result);
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed to dispatch" }, { status: 400 });
  }
}