import { NextResponse } from "next/server";
import { auth } from "@/auth";
import prisma from "@/lib/prisma";

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const session = await auth();
  const currentUser = session?.user as any;

  if (currentUser?.role !== "SUPER_ADMIN") {
    return NextResponse.json({ error: "เฉพาะ Super Admin เท่านั้น" }, { status: 403 });
  }

  const { role } = await req.json();

  const updated = await prisma.user.update({
    where: { id: params.id },
    data: { role },
  });

  return NextResponse.json(updated);
}