import { NextResponse } from "next/server";
import { auth } from "@/auth";
import prisma from "@/lib/prisma";

// ดึงทำเนียบผลัดราชการทั้งหมด
export async function GET() {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const batches = await prisma.missionBatch.findMany({
    include: {
      staffs: { include: { user: true } },
    },
    orderBy: [{ year: "desc" }, { batchNumber: "desc" }],
  });
  return NextResponse.json(batches);
}

// สร้างผลัดราชการใหม่ (เฉพาะ Admin)
export async function POST(req: Request) {
  const session = await auth();
  const currentUser = session?.user as any;

  if (!currentUser || (currentUser.role !== "ADMIN" && currentUser.role !== "SUPER_ADMIN")) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const { location, batchNumber, year, startDate, endDate, staffIds, otherDetail } = await req.json();

    const batch = await prisma.missionBatch.create({
      data: {
        location,
        batchNumber: parseInt(batchNumber, 10),
        year: parseInt(year, 10),
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        otherDetail: location === "OTHER" ? otherDetail : null,
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