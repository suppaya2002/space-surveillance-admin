import { NextResponse } from "next/server";
import { auth } from "@/auth";
import prisma from "@/lib/prisma";

export async function GET() {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const schedules = await prisma.dutySchedule.findMany({
    include: {
      dutyType: true,
      staffs: { include: { user: true } },
    },
    orderBy: { dutyDate: "desc" },
  });
  return NextResponse.json(schedules);
}