import { NextResponse } from "next/server";
import { auth } from "@/auth";
import prisma from "@/lib/prisma";

export async function GET() {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const types = await prisma.dutyType.findMany({
    orderBy: { name: "asc" },
  });
  return NextResponse.json(types);
}

export async function POST(req: Request) {
  const session = await auth();
  const currentUser = session?.user as any;

  if (!currentUser || (currentUser.role !== "ADMIN" && currentUser.role !== "SUPER_ADMIN")) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const { name, requiredType, mainCount, backupCount } = await req.json();

    const newType = await prisma.dutyType.create({
      data: {
        name,
        requiredType: requiredType || null,
        mainCount: parseInt(mainCount, 10) || 1,
        backupCount: parseInt(backupCount, 10) || 1,
      },
    });

    return NextResponse.json(newType);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}