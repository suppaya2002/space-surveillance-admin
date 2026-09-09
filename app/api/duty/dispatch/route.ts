import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { dispatchAutoDuty } from "@/lib/auto-dispatcher";

export async function POST(req: Request) {
  const session = await auth();
  const currentUser = session?.user as any;

  if (!currentUser || (currentUser.role !== "ADMIN" && currentUser.role !== "SUPER_ADMIN")) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

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