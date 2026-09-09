import prisma from "@/lib/prisma";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function StatisticsPage() {
  const currentBuddhistYear = new Date().getFullYear() + 543;

  const users = await prisma.user.findMany({
    where: { status: "APPROVED" },
    include: {
      leaves: {
        where: { status: "APPROVED" },
      },
      deployments: {
        include: {
          deployment: true,
        },
      },
      dutyAssigns: true,
    },
    orderBy: { officialName: "asc" },
  });

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-6 md:p-10 font-sans">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex items-center justify-between border-b border-slate-800 pb-5">
          <div>
            <div className="text-xs text-blue-400 font-mono mb-1">
              <Link href="/" className="hover:underline">DASHBOARD</Link> / STATISTICS
            </div>
            <h1 className="text-2xl font-bold text-white tracking-tight">
              สถิติการปฏิบัติราชการและประวัติการจัดเวร
            </h1>
            <p className="text-xs text-slate-400 mt-1">
              ข้อมูลสรุปการลา ราชการสนาม และจำนวนครั้งการเข้าเวรประจำปี พ.ศ. {currentBuddhistYear}
            </p>
          </div>
          <Link
            href="/"
            className="px-4 py-2 text-xs bg-slate-900 hover:bg-slate-800 border border-slate-700 rounded-lg transition"
          >
            ← กลับหน้าหลัก
          </Link>
        </div>

        <div className="bg-slate-900/60 border border-slate-800 rounded-xl overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-900 text-slate-400 border-b border-slate-800 font-semibold uppercase tracking-wider">
                <tr>
                  <th className="p-4">ยศ - ชื่อ สกุล</th>
                  <th className="p-4">ชั้นยศ</th>
                  <th className="p-4 text-center">สถิติการลา (ครั้ง)</th>
                  <th className="p-4 text-center">ไปราชการประจำ (ครั้ง)</th>
                  <th className="p-4 text-center">เข้าเวรทั้งหมด (ครั้ง)</th>
                  <th className="p-4 text-center">เวรปี พ.ศ. {currentBuddhistYear}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {users.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="text-center py-8 text-slate-500">
                      ไม่พบข้อมูลกำลังพลที่ได้รับการอนุมัติ
                    </td>
                  </tr>
                ) : (
                  users.map((u) => {
                    const leavesCount = u.leaves.length;
                    const depCount = u.deployments.length;
                    const dutyTotal = u.dutyAssigns.length;
                    const dutyThisYear = u.dutyAssigns.filter(
                      (d) => d.buddhistYear === currentBuddhistYear
                    ).length;

                    return (
                      <tr key={u.id} className="hover:bg-slate-800/30 transition">
                        <td className="p-4 font-medium text-slate-200">
                          {u.officialName || u.name || u.email}
                        </td>
                        <td className="p-4 text-slate-400">
                          {u.officerType === "COMMISSIONED" ? "สัญญาบัตร" : "ประทวน"}
                        </td>
                        <td className="p-4 text-center font-mono text-amber-400">
                          {leavesCount}
                        </td>
                        <td className="p-4 text-center font-mono text-blue-400">
                          {depCount}
                        </td>
                        <td className="p-4 text-center font-mono text-emerald-400 font-semibold">
                          {dutyTotal}
                        </td>
                        <td className="p-4 text-center font-mono text-slate-300">
                          {dutyThisYear}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}