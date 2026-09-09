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
      `กำลังพลไม่เพียงพอสำหรับเข้าเวร (ต้องการ ${totalNeeded} นาย, พร้อมปฏิบัติการ ${availablePersonnel.length} นาย)`
    );
  }

  // Fair-share sort: เรียงลำดับคนที่ทำสถิติต่ำสุดขึ้นก่อน
  availablePersonnel.sort((a, b) => a.dutyStaff.length - b.dutyStaff.length);

  return await prisma.$transaction(async (tx) => {
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
      },
    });

    const selectedMain = availablePersonnel.slice(0, dutyType.mainCount);
    const selectedBackup = availablePersonnel.slice(
      dutyType.mainCount,
      dutyType.mainCount + dutyType.backupCount
    );

    for (const user of selectedMain) {
      await tx.dutyStaff.create({
        data: { scheduleId: schedule.id, userId: user.id, isBackup: false },
      });
    }

    for (const user of selectedBackup) {
      await tx.dutyStaff.create({
        data: { scheduleId: schedule.id, userId: user.id, isBackup: true },
      });
    }

    return tx.dutySchedule.findUnique({
      where: { id: schedule.id },
      include: { staffs: { include: { user: true } }, dutyType: true },
    });
  });
}