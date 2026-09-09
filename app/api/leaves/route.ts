import { NextResponse } from "next/server";
import { auth } from "@/auth";
import prisma from "@/lib/prisma";

export async function GET() {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const leaves = await prisma.leaveRecord.findMany({
    include: { user: true },
    orderBy: { startDate: "desc" },
  });
  return NextResponse.json(leaves);
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { leaveType, startDate, endDate, reason } = await req.json();
  const currentUser = session.user as any;

  const newLeave = await prisma.leaveRecord.create({
    data: {
      userId: currentUser.id,
      leaveType,
      startDate: new Date(startDate),
      endDate: new Date(endDate),
      reason,
      isApproved: false,
    },
  });
  return NextResponse.json(newLeave);
}