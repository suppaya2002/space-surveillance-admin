"use client";

import React, { useState, useEffect } from "react";
import { useSession } from "next-auth/react";

interface UserOption {
  id: string;
  officialName: string | null;
  name: string | null;
}

interface DeploymentRecord {
  id: string;
  station: "SURAT_THANI" | "DON_MUEANG" | "OTHER";
  batchNumber: number;
  yearBe: number;
  startDate: string;
  endDate: string;
  description: string | null;
  members: { user: { officialName: string | null; name: string | null } }[];
}

export default function DeploymentsPage() {
  const { data: session } = useSession();
  const isAdmin = session?.user?.role === "ADMIN" || session?.user?.role === "SUPER_ADMIN";

  const [deployments, setDeployments] = useState<DeploymentRecord[]>([]);
  const [users, setUsers] = useState<UserOption[]>([]);
  const [loading, setLoading] = useState(true);

  // Form State
  const [formData, setFormData] = useState({
    station: "SURAT_THANI",
    batchNumber: 1,
    yearBe: new Date().getFullYear() + 543,
    startDate: "",
    endDate: "",
    description: "",
    memberIds: [] as string[],
  });

  const fetchData = async () => {
    setLoading(true);
    const [depRes, userRes] = await Promise.all([
      fetch("/api/deployments"),
      fetch("/api/users?status=APPROVED"),
    ]);
    if (depRes.ok) setDeployments(await depRes.json());
    if (userRes.ok) setUsers(await userRes.json());
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleMemberToggle = (id: string) => {
    setFormData((prev) => ({
      ...prev,
      memberIds: prev.memberIds.includes(id)
        ? prev.memberIds.filter((mId) => mId !== id)
        : [...prev.memberIds, id],
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAdmin) return alert("เฉพาะผู้ดูแลระบบเท่านั้นที่สามารถบันทึกได้");

    const res = await fetch("/api/deployments", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(formData),
    });

    if (res.ok) {
      alert("บันทึกผลัดไปราชการสำเร็จ");
      fetchData();
      setFormData({
        station: "SURAT_THANI",
        batchNumber: 1,
        yearBe: new Date().getFullYear() + 543,
        startDate: "",
        endDate: "",
        description: "",
        memberIds: [],
      });
    }
  };

  const stationLabel = (station: string) => {
    switch (station) {
      case "SURAT_THANI":
        return { label: "ราชการ สฝอว.สม.", color: "bg-blue-100 text-blue-800" };
      case "DON_MUEANG":
        return { label: "ราชการ สฝอว.ดน.", color: "bg-emerald-100 text-emerald-800" };
      default:
        return { label: "ราชการอื่นๆ", color: "bg-purple-100 text-purple-800" };
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">
          ทะเบียนการไปปฏิบัติราชการประจำกอง
        </h1>
        <p className="text-sm text-slate-500">
          บันทึกและแสดงรายชื่อผลัดราชการ สฝอว.สม., สฝอว.ดน. และภารกิจราชการสนาม
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* รายการผลัดราชการทั้งหมด */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white rounded-lg border shadow-sm p-4">
            <h2 className="font-semibold text-lg mb-4 text-slate-700">
              ทำเนียบผลัดราชการปัจจุบัน/ที่ผ่านมา
            </h2>

            {loading ? (
              <p className="text-sm text-slate-400">กำลังโหลดข้อมูล...</p>
            ) : deployments.length === 0 ? (
              <p className="text-sm text-slate-400 text-center py-6">ยังไม่มีประวัติการส่งผลัดราชการ</p>
            ) : (
              <div className="space-y-3">
                {deployments.map((d) => {
                  const tag = stationLabel(d.station);
                  return (
                    <div key={d.id} className="border rounded-md p-4 hover:border-slate-400 transition">
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex items-center space-x-2">
                          <span className={`px-2 py-0.5 rounded text-xs font-semibold ${tag.color}`}>
                            {tag.label}
                          </span>
                          <span className="font-bold text-slate-800">
                            ผลัดที่ {d.batchNumber} / ปี พ.ศ. {d.yearBe}
                          </span>
                        </div>
                        <span className="text-xs text-slate-500">
                          {new Date(d.startDate).toLocaleDateString("th-TH")} -{" "}
                          {new Date(d.endDate).toLocaleDateString("th-TH")}
                        </span>
                      </div>

                      <div className="text-sm text-slate-600 mb-2">
                        <span className="font-medium text-slate-700">รายชื่อกำลังพล: </span>
                        {d.members.length === 0 ? (
                          <span className="text-slate-400">ไม่มียอดกำลังพล</span>
                        ) : (
                          d.members
                            .map((m) => m.user.officialName || m.user.name)
                            .join(", ")
                        )}
                      </div>

                      {d.description && (
                        <p className="text-xs text-slate-500 bg-slate-50 p-2 rounded">
                          หมายเหตุ: {d.description}
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* ฟอร์มเพิ่มผลัด (Admin Only) */}
        {isAdmin && (
          <div className="bg-white rounded-lg border shadow-sm p-4 h-fit">
            <h2 className="font-semibold text-lg mb-4 text-slate-700">
              ลงทะเบียนผลัดราชการใหม่
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4 text-sm">
              <div>
                <label className="block text-slate-600 mb-1">สังกัด/สถานีราชการ</label>
                <select
                  className="w-full border rounded p-2 bg-white"
                  value={formData.station}
                  onChange={(e) => setFormData({ ...formData, station: e.target.value })}
                >
                  <option value="SURAT_THANI">ราชการ สฝอว.สม.</option>
                  <option value="DON_MUEANG">ราชการ สฝอว.ดน.</option>
                  <option value="OTHER">ราชการอื่นๆ</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-slate-600 mb-1">ผลัดที่</label>
                  <input
                    type="number"
                    min="1"
                    required
                    className="w-full border rounded p-2"
                    value={formData.batchNumber}
                    onChange={(e) => setFormData({ ...formData, batchNumber: parseInt(e.target.value) })}
                  />
                </div>
                <div>
                  <label className="block text-slate-600 mb-1">ปี พ.ศ.</label>
                  <input
                    type="number"
                    required
                    className="w-full border rounded p-2"
                    value={formData.yearBe}
                    onChange={(e) => setFormData({ ...formData, yearBe: parseInt(e.target.value) })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-slate-600 mb-1">วันเริ่มปฏิบัติหน้าที่</label>
                  <input
                    type="date"
                    required
                    className="w-full border rounded p-2"
                    value={formData.startDate}
                    onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-slate-600 mb-1">ถึงวันที่</label>
                  <input
                    type="date"
                    required
                    className="w-full border rounded p-2"
                    value={formData.endDate}
                    onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-600 mb-1">เลือกกำลังพลเข้าผลัด</label>
                <div className="max-h-40 overflow-y-auto border rounded p-2 space-y-1 bg-slate-50">
                  {users.map((u) => (
                    <label key={u.id} className="flex items-center space-x-2 text-xs cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.memberIds.includes(u.id)}
                        onChange={() => handleMemberToggle(u.id)}
                      />
                      <span>{u.officialName || u.name}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-slate-600 mb-1">บันทึกช่วยจำ/ภารกิจย่อ</label>
                <textarea
                  rows={2}
                  className="w-full border rounded p-2"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                />
              </div>

              <button
                type="submit"
                className="w-full py-2 bg-slate-800 hover:bg-slate-700 text-white rounded font-medium transition"
              >
                บันทึกคำสั่งผลัดราชการ
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}