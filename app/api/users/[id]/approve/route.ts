import { NextResponse } from "next/server";
import { auth } from "@/auth";
import prisma from "@/lib/prisma";

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const session = await auth();
  const currentUser = session?.user as any;

  if (!currentUser || (currentUser.role !== "ADMIN" && currentUser.role !== "SUPER_ADMIN")) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { rank, firstName, lastName, category } = await req.json();

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