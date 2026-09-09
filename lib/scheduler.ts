import prisma from "@/lib/prisma";
import { OfficerType, AssignmentRole } from "@prisma/client";

interface GenerateDutyParams {
  dutyCategoryId: string;
  startDate: Date;
  endDate: Date;
}

export async function generateAutoDuty({
  dutyCategoryId,
  startDate,
  endDate,
}: GenerateDutyParams) {
  const category = await prisma.dutyCategory.findUnique({
    where: { id: dutyCategoryId },
  });

  if (!category) throw new Error("ไม่พบหมวดหมู่เวร");

  // 1. ดึงเฉพาะกำลังพลที่ APPROVED และตรงตามชั้นยศ (สัญญาบัตร หรือ ประทวน)
  const eligibleUsers = await prisma.user.findMany({
    where: {
      status: "APPROVED",
      officerType: category.targetOfficer,
    },
    include: {
      leaves: {
        where: {
          status: "APPROVED",
          startDate: { lte: endDate },
          endDate: { gte: startDate },
        },
      },
      deployments: {
        include: {
          deployment: true,
        },
      },
      dutyAssigns: true,
    },
  });

  // 2. กรองคนที่ไม่ติดลา และไม่ติดไปราชการในช่วงเวลาดังกล่าว
  const availableUsers = eligibleUsers.filter((u) => {
    const hasLeave = u.leaves.length > 0;
    const hasDeployment = u.deployments.some((d) => {
      const depStart = new Date(d.deployment.startDate);
      const depEnd = new Date(d.deployment.endDate);
      return depStart <= endDate && depEnd >= startDate;
    });
    return !hasLeave && !hasDeployment;
  });

  // 3. เรียงลำดับคนที่ทำสถิติเวรน้อยที่สุดขึ้นก่อน (Fair-Share)
  availableUsers.sort((a, b) => a.dutyAssigns.length - b.dutyAssigns.length);

  const neededTotal = category.slotsPrimary + category.slotsReserve;
  const selected = availableUsers.slice(0, neededTotal);

  const buddhistYear = startDate.getFullYear() + 543;
  const results = [];

  for (let i = 0; i < selected.length; i++) {
    const role: AssignmentRole =
      i < category.slotsPrimary ? AssignmentRole.PRIMARY : AssignmentRole.RESERVE;

    const assignment = await prisma.dutyAssignment.create({
      data: {
        dutyCategoryId: category.id,
        userId: selected[i].id,
        dutyDate: startDate,
        role,
        buddhistYear,
      },
      include: {
        user: true,
      },
    });
    results.push(assignment);
  }

  return results;
}