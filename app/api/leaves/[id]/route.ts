import { NextResponse } from "next/server";
import { auth } from "@/auth";
import prisma from "@/lib/prisma";

// อนุมัติ / ปฏิเสธการลา (เฉพาะ Admin)
export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const session = await auth();
  const currentUser = session?.user as any;

  if (!currentUser || (currentUser.role !== "ADMIN" && currentUser.role !== "SUPER_ADMIN")) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { isApproved } = await req.json();

  if (isApproved === false) {
    // หากกดปฏิเสธ ให้ลบคำขอหรืออัปเดตเป็นไม่อนุมัติ
    await prisma.leaveRecord.delete({ where: { id: params.id } });
    return NextResponse.json({ message: "คำขอถูกปฏิเสธและลบออกจากระบบ" });
  }

  const updated = await prisma.leaveRecord.update({
    where: { id: params.id },
    data: { isApproved: true },
  });

  return NextResponse.json(updated);
}