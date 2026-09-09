import { NextResponse } from "next/server";
import { auth } from "@/auth";
import prisma from "@/lib/prisma";

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const session = await auth();
  const currentUser = session?.user as any;

  if (!currentUser || (currentUser.role !== "ADMIN" && currentUser.role !== "SUPER_ADMIN")) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { isApproved } = await req.json();

  const updated = await prisma.leaveRecord.update({
    where: { id: params.id },
    data: { isApproved },
  });
  return NextResponse.json(updated);
}