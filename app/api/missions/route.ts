import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET() {
  const batches = await prisma.missionBatch.findMany({
    include: {
      staffs: { include: { user: true } },
    },
    orderBy: [{ year: "desc" }, { batchNumber: "desc" }],
  });
  return NextResponse.json(batches);
}

export async function POST(req: Request) {
  try {
    const { location, batchNumber, year, startDate, endDate, staffIds, otherDetail } = await req.json();

    const batch = await prisma.missionBatch.create({
      data: {
        location,
        batchNumber: parseInt(batchNumber, 10),
        year: parseInt(year, 10),
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        otherDetail,
        staffs: {
          create: (staffIds || []).map((userId: string) => ({ userId })),
        },
      },
      include: { staffs: { include: { user: true } } },
    });
    return NextResponse.json(batch);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}