import { NextResponse } from "next/server";
import { auth } from "@/auth";
import prisma from "@/lib/prisma";

// อนุมัติผู้ใช้ พร้อมระบุ ยศ ชื่อ นามสกุลจริง และชั้นยศ (Admin เท่านั้น)
export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const session = await auth();
  const currentUser = session?.user as any;

  if (!currentUser || (currentUser.role !== "ADMIN" && currentUser.role !== "SUPER_ADMIN")) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { rank, firstName, lastName, category } = await req.json();

  if (!rank || !firstName || !lastName) {
    return NextResponse.json({ error: "กรุณาระบุยศ ชื่อ และนามสกุลจริง" }, { status: 400 });
  }

  const updated = await prisma.user.update({
    where: { id: params.id },
    data: {
      rank,
      firstName,
      lastName,
      category,
      status: "ACTIVE",
    },
  });

  return NextResponse.json(updated);
}