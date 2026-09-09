import { prisma } from "@/lib/prisma";

export default async function StatisticsPage({
  searchParams,
}: {
  searchParams: Promise<{ year?: string }>;
}) {
  const resolvedParams = await searchParams;
  const currentYearBe = resolvedParams.year
    ? parseInt(resolvedParams.year)
    : new Date().getFullYear() + 543;

  // ดึงรายชื่อกำลังพลทั้งหมด พร้อมยอดรวมภารกิจ
  const users = await prisma.user.findMany({
    where: { status: "APPROVED" },
    include: {
      leaves: {
        where: { isApproved: true },
      },
      deployments: {
        where: {
          deployment: { yearBe: currentYearBe },
        },
        include: { deployment: true },
      },
      dutyAssignees: {
        where: { isPrimary: true },
      },
    },
  });

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex justify-between items-center border-b pb-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">
            สถิติการปฏิบัติภารกิจและการลา
          </h1>
          <p className="text-sm text-slate-500">
            ระบบสรุปยอดรวมราชการสนามและเวรยาม ประจำปี พ.ศ. {currentYearBe}
          </p>
        </div>
        <form method="GET" className="flex items-center space-x-2">
          <label className="text-sm font-medium text-slate-600">เลือกปี พ.ศ.:</label>
          <input
            type="number"
            name="year"
            defaultValue={currentYearBe}
            className="border rounded px-3 py-1 text-sm w-24"
          />
          <button
            type="submit"
            className="px-3 py-1 bg-slate-800 text-white rounded text-sm hover:bg-slate-700"
          >
            ค้นหา
          </button>
        </form>
      </div>

      <div className="bg-white rounded-lg border shadow-sm overflow-hidden">
        <table className="min-w-full divide-y divide-slate-200 text-sm">
          <thead className="bg-slate-50">
            <tr>
              <th className="px-4 py-3 text-left font-semibold text-slate-700">ยศ - ชื่อ - นามสกุล</th>
              <th className="px-4 py-3 text-left font-semibold text-slate-700">ประเภทกำลังพล</th>
              <th className="px-4 py-3 text-center font-semibold text-slate-700">ราชการ สฝอว.สม.</th>
              <th className="px-4 py-3 text-center font-semibold text-slate-700">ราชการ สฝอว.ดน.</th>
              <th className="px-4 py-3 text-center font-semibold text-slate-700">ราชการอื่นๆ</th>
              <th className="px-4 py-3 text-center font-semibold text-slate-700">เวรปฏิบัติหน้าที่ (ตัวจริง)</th>
              <th className="px-4 py-3 text-center font-semibold text-slate-700">ยอดวันลาสะสม</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {users.map((u) => {
              const suratCount = u.deployments.filter(
                (d) => d.deployment.station === "SURAT_THANI"
              ).length;
              const donmueangCount = u.deployments.filter(
                (d) => d.deployment.station === "DON_MUEANG"
              ).length;
              const otherCount = u.deployments.filter(
                (d) => d.deployment.station === "OTHER"
              ).length;

              return (
                <tr key={u.id} className="hover:bg-slate-50 transition">
                  <td className="px-4 py-3 font-medium text-slate-900">
                    {u.officialName || u.name || u.email}
                  </td>
                  <td className="px-4 py-3 text-slate-500">
                    {u.rankType === "COMMISSIONED" ? "สัญญาบัตร" : "ประทวน"}
                  </td>
                  <td className="px-4 py-3 text-center font-semibold text-blue-800">
                    {suratCount} ครั้ง
                  </td>
                  <td className="px-4 py-3 text-center font-semibold text-blue-800">
                    {donmueangCount} ครั้ง
                  </td>
                  <td className="px-4 py-3 text-center text-slate-600">
                    {otherCount} ครั้ง
                  </td>
                  <td className="px-4 py-3 text-center font-semibold text-emerald-700">
                    {u.dutyAssignees.length} ครั้ง
                  </td>
                  <td className="px-4 py-3 text-center text-amber-700 font-semibold">
                    {u.leaves.length} รายการ
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}