import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET() {
  const users = await prisma.user.findMany({
    orderBy: [{ category: "asc" }, { firstName: "asc" }],
  });
  return NextResponse.json(users);
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { rank, firstName, lastName, category } = body;
    const email = `${Date.now()}@mil.rtaf`; // dummy unique email สำหรับ schema

    const newUser = await prisma.user.create({
      data: {
        email,
        rank,
        firstName,
        lastName,
        category: category || "NON_COMMISSIONED",
        status: "ACTIVE",
        role: "ADMIN",
      },
    });
    return NextResponse.json(newUser);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}