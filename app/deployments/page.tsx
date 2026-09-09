"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";

interface DeploymentItem {
  id: string;
  missionName: string;
  satelliteName: string;
  startDate: string;
  endDate: string;
  status: string;
  assignedTo?: string;
}

export default function DeploymentsPage() {
  const { data: session } = useSession();
  const [deployments, setDeployments] = useState<DeploymentItem[]>([]);
  const [loading, setLoading] = useState(true);

  // แก้ไข type casting ตรงนี้เพื่อไม่ให้ขึ้น Error
  const userRole = (session?.user as any)?.role;
  const isAdmin = userRole === "ADMIN" || userRole === "SUPER_ADMIN";

  useEffect(() => {
    const fetchDeployments = async () => {
      try {
        const res = await fetch("/api/deployments");
        if (res.ok) {
          const data = await res.json();
          setDeployments(data);
        }
      } catch (error) {
        console.error("Failed to fetch deployments:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDeployments();
  }, []);

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">
            ภารกิจและการปฏิบัติการ (Deployments)
          </h1>
          <p className="text-sm text-slate-500">
            ระบบติดตามสถานะและการมอบหมายภารกิจเฝ้าระวังทางอวกาศ
          </p>
        </div>
        {isAdmin && (
          <button className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg shadow transition">
            + สร้างภารกิจใหม่
          </button>
        )}
      </div>

      <div className="bg-white rounded-xl shadow border border-slate-200 overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-slate-500">กำลังโหลดข้อมูล...</div>
        ) : deployments.length === 0 ? (
          <div className="p-8 text-center text-slate-500">ไม่พบรายการภารกิจในระบบ</div>
        ) : (
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-xs font-semibold text-slate-600 uppercase tracking-wider">
                <th className="p-4">ชื่อภารกิจ</th>
                <th className="p-4">วัตถุอวกาศ / ดาวเทียม</th>
                <th className="p-4">ช่วงเวลา</th>
                <th className="p-4">สถานะ</th>
                {isAdmin && <th className="p-4 text-right">การจัดการ</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 text-sm">
              {deployments.map((item) => (
                <tr key={item.id} className="hover:bg-slate-50">
                  <td className="p-4 font-medium text-slate-800">{item.missionName}</td>
                  <td className="p-4 text-slate-600">{item.satelliteName}</td>
                  <td className="p-4 text-slate-600">
                    {new Date(item.startDate).toLocaleDateString("th-TH")} -{" "}
                    {new Date(item.endDate).toLocaleDateString("th-TH")}
                  </td>
                  <td className="p-4">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700 border border-blue-200">
                      {item.status}
                    </span>
                  </td>
                  {isAdmin && (
                    <td className="p-4 text-right">
                      <button className="text-slate-500 hover:text-blue-600 mr-3">แก้ไข</button>
                      <button className="text-slate-500 hover:text-red-600">ลบ</button>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}