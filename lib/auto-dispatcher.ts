import prisma from "@/lib/prisma";

interface DispatchParams {
  dutyTypeId: string;
  targetDate: Date;
}

export async function dispatchAutoDuty({ dutyTypeId, targetDate }: DispatchParams) {
  const dutyType = await prisma.dutyType.findUnique({ where: { id: dutyTypeId } });
  if (!dutyType) throw new Error("ไม่พบประเภทเวร");

  const startOfDay = new Date(targetDate);
  startOfDay.setHours(0, 0, 0, 0);
  const endOfDay = new Date(targetDate);
  endOfDay.setHours(23, 59, 59, 999);
  const buddhistYear = targetDate.getFullYear() + 543;

  // 1. ดึงกำลังพลที่ ACTIVE และตรงตามชั้นยศ (สัญญาบัตร/ประทวน)
  const candidateFilter: any = { status: "ACTIVE" };
  if (dutyType.requiredType) {
    candidateFilter.category = dutyType.requiredType;
  }

  const candidates = await prisma.user.findMany({
    where: candidateFilter,
    include: {
      leaves: {
        where: {
          isApproved: true,
          startDate: { lte: endOfDay },
          endDate: { gte: startOfDay },
        },
      },
      missionStaff: {
        include: { batch: true },
      },
      dutyStaff: {
        where: {
          schedule: { dutyTypeId: dutyType.id },
        },
      },
    },
  });

  // 2. ตัดคนที่ไม่ว่างออก: ติดลาที่อนุมัติแล้ว หรือติดผลัดราชการในวันนั้น
  const availablePersonnel = candidates.filter((u) => {
    const isLeaving = u.leaves.length > 0;
    const isDeploying = u.missionStaff.some((ms) => {
      const msStart = new Date(ms.batch.startDate);
      const msEnd = new Date(ms.batch.endDate);
      return startOfDay <= msEnd && endOfDay >= msStart;
    });
    return !isLeaving && !isDeploying;
  });

  const totalNeeded = dutyType.mainCount + dutyType.backupCount;
  if (availablePersonnel.length < totalNeeded) {
    throw new Error(
      `กำลังพลว่างไม่เพียงพอ (ต้องการ ${totalNeeded} นาย, ว่าง ${availablePersonnel.length} นาย)`
    );
  }

  // 3. เรียงลำดับ Fair-Share: คนที่เข้าเวรประเภทนี้น้อยที่สุดขึ้นก่อน
  availablePersonnel.sort((a, b) => a.dutyStaff.length - b.dutyStaff.length);

  return await prisma.$transaction(async (tx) => {
    // ล้างเวรเดิมในวันเดียวกันหากมี
    const existing = await tx.dutySchedule.findFirst({
      where: {
        dutyTypeId,
        dutyDate: { gte: startOfDay, lte: endOfDay },
      },
    });
    if (existing) {
      await tx.dutySchedule.delete({ where: { id: existing.id } });
    }

    const schedule = await tx.dutySchedule.create({
      data: {
        dutyTypeId,
        dutyDate: startOfDay,
        year: buddhistYear,
      },
    });

    const selectedMain = availablePersonnel.slice(0, dutyType.mainCount);
    const selectedBackup = availablePersonnel.slice(
      dutyType.mainCount,
      dutyType.mainCount + dutyType.backupCount
    );

    for (const u of selectedMain) {
      await tx.dutyStaff.create({
        data: { scheduleId: schedule.id, userId: u.id, isBackup: false },
      });
    }

    for (const u of selectedBackup) {
      await tx.dutyStaff.create({
        data: { scheduleId: schedule.id, userId: u.id, isBackup: true },
      });
    }

    return tx.dutySchedule.findUnique({
      where: { id: schedule.id },
      include: { staffs: { include: { user: true } }, dutyType: true },
    });
  });
}