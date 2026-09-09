import { prisma } from "@/lib/prisma";
import { RankType } from "@prisma/client";

interface AutoScheduleParams {
  taskTypeId: string;
  targetDate: Date;
  primaryCount: number;
  reserveCount: number;
}

export async function generateAutoDutySchedule({
  taskTypeId,
  targetDate,
  primaryCount,
  reserveCount,
}: AutoScheduleParams) {
  const task = await prisma.taskType.findUnique({
    where: { id: taskTypeId },
  });

  if (!task) throw new Error("ไม่พบประเภทเวรที่ระบุ");

  // 1. ดึงรายชื่อข้าราชการที่ได้รับอนุมัติ และมีชั้นยศตรงตามกำหนด
  const eligibleUsers = await prisma.user.findMany({
    where: {
      status: "APPROVED",
      ...(task.allowedRankType ? { rankType: task.allowedRankType } : {}),
    },
    include: {
      leaves: {
        where: {
          isApproved: true,
          startDate: { lte: targetDate },
          endDate: { gte: targetDate },
        },
      },
      deployments: {
        where: {
          deployment: {
            startDate: { lte: targetDate },
            endDate: { gte: targetDate },
          },
        },
      },
      dutyAssignees: {
        where: {
          dutySchedule: {
            date: targetDate,
          },
        },
      },
    },
  });

  // 2. คัดกรองผู้ที่ไม่ติดภารกิจอื่นและไม่ลาในวันดังกล่าว
  const availableUsers = eligibleUsers.filter((u) => {
    const isFreeFromLeave = u.leaves.length === 0;
    const isFreeFromDeployment = u.deployments.length === 0;
    const isFreeFromOtherDuty = u.dutyAssignees.length === 0;
    return isFreeFromLeave && isFreeFromDeployment && isFreeFromOtherDuty;
  });

  // 3. ดึงประวัติสถิติการเข้าเวรประเภทนี้ในอดีตเพื่อนับคะแนนถ่วงน้ำหนัก
  const userScores = await Promise.all(
    availableUsers.map(async (user) => {
      const pastDutyCount = await prisma.dutyAssignment.count({
        where: {
          userId: user.id,
          isPrimary: true,
          dutySchedule: { taskTypeId: task.id },
        },
      });
      return { user, score: pastDutyCount };
    })
  );

  // เรียงลำดับจากผู้ที่เคยเข้าเวรน้อยที่สุดไปมากที่สุด
  userScores.sort((a, b) => a.score - b.score);

  const totalNeeded = primaryCount + reserveCount;
  if (userScores.length < totalNeeded) {
    throw new Error(
      `กำลังพลว่างไม่เพียงพอ (ต้องการ ${totalNeeded} นาย, ว่าง ${userScores.length} นาย)`
    );
  }

  const selected = userScores.slice(0, totalNeeded);
  const primaries = selected.slice(0, primaryCount).map((s) => s.user.id);
  const reserves = selected.slice(primaryCount).map((s) => s.user.id);

  // 4. บันทึกลงฐานข้อมูล
  return await prisma.$transaction(async (tx) => {
    const schedule = await tx.dutySchedule.create({
      data: {
        taskTypeId: task.id,
        date: targetDate,
      },
    });

    const assignmentData = [
      ...primaries.map((uid) => ({
        dutyScheduleId: schedule.id,
        userId: uid,
        isPrimary: true,
      })),
      ...reserves.map((uid) => ({
        dutyScheduleId: schedule.id,
        userId: uid,
        isPrimary: false,
      })),
    ];

    await tx.dutyAssignment.createMany({
      data: assignmentData,
    });

    return schedule;
  });
}