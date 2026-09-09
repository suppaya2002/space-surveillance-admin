import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET() {
  const types = await prisma.dutyType.findMany({
    orderBy: { name: "asc" },
  });
  return NextResponse.json(types);
}

export async function POST(req: Request) {
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