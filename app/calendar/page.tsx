"use client";

import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import Link from "next/link";

interface LeaveItem {
  id: string;
  type: string;
  reason: string | null;
  startDate: string;
  endDate: string;
  status: "PENDING" | "APPROVED" | "REJECTED";
  user: {
    id: string;
    officialName: string | null;
    name: string | null;
    rank: string | null;
  };
}

interface UserOption {
  id: string;
  officialName: string | null;
  name: string | null;
}

export default function CalendarPage() {
  const { data: session } = useSession();
  const currentUser = session?.user as any;
  const isAdmin = currentUser?.role === "ADMIN" || currentUser?.role === "SUPER_ADMIN";

  const [leaves, setLeaves] = useState<LeaveItem[]>([]);
  const [users, setUsers] = useState<UserOption[]>([]);
  const [loading, setLoading] = useState(true);

  // Form State
  const [type, setType] = useState("ANNUAL");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [reason, setReason] = useState("");
  const [targetUserId, setTargetUserId] = useState("");

  const fetchData = async () => {
    try {
      const res = await fetch("/api/leaves");
      if (res.ok) setLeaves(await res.json());

      if (isAdmin) {
        const uRes = await fetch("/api/admin/users");
        if (uRes.ok) setUsers(await uRes.json());
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [isAdmin]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!startDate || !endDate) return alert("กรุณาเลือกวันที่ให้ครบถ้วน");

    const res = await fetch("/api/leaves", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type, reason, startDate, endDate, targetUserId }),
    });

    if (res.ok) {
      alert(isAdmin ? "บันทึกข้อมูลสำเร็จ" : "ส่งคำขอลาเรียบร้อย รอแอดมินอนุมัติ");
      setReason("");
      fetchData();
    } else {
      alert("เกิดข้อผิดพลาดในการบันทึก");
    }
  };

  const handleApproval = async (id: string, status: "APPROVED" | "REJECTED") => {
    const res = await fetch("/api/leaves", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, status }),
    });
    if (res.ok) {
      fetchData();
    }
  };

  const leaveTypeMap: Record<string, string> = {
    ANNUAL: "ลาพักผ่อน",
    SICK: "ลาป่วย",
    BUSINESS: "ลากิจส่วนตัว",
    OFFICIAL_DUTY: "ปฏิบัติราชการ",
    OTHER: "อื่นๆ",
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-6 md:p-10 font-sans">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-5">
          <div>
            <div className="text-xs text-blue-400 font-mono mb-1">
              <Link href="/" className="hover:underline">DASHBOARD</Link> / CALENDAR & LEAVES
            </div>
            <h1 className="text-2xl font-bold text-white tracking-tight">
              ปฏิทินภารกิจและการลาประจำกอง
            </h1>
            <p className="text-xs text-slate-400 mt-1">
              ตรวจสอบสถานะกำลังพล ปฏิบัติราชการ และบันทึกคำขออนุมัติการลา
            </p>
          </div>
          <Link href="/" className="px-4 py-2 text-xs bg-slate-900 hover:bg-slate-800 border border-slate-700 rounded-lg transition">
            ← กลับหน้าหลัก
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Form ยื่นเรื่องลา */}
          <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-5 shadow-xl space-y-4">
            <h2 className="text-sm font-semibold text-white uppercase tracking-wider border-b border-slate-800 pb-3">
              {isAdmin ? "บันทึกการลา / ภารกิจ (สิทธิ์ Admin)" : "บันทึกคำขอลาตนเอง"}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-3 text-xs">
              {isAdmin && (
                <div>
                  <label className="block text-slate-400 mb-1">เลือกกำลังพล</label>
                  <select
                    value={targetUserId}
                    onChange={(e) => setTargetUserId(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-white"
                  >
                    <option value="">-- บันทึกของตนเอง --</option>
                    {users.map((u) => (
                      <option key={u.id} value={u.id}>
                        {u.officialName || u.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div>
                <label className="block text-slate-400 mb-1">ประเภทการลา / ภารกิจ</label>
                <select
                  value={type}
                  onChange={(e) => setType(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-white"
                >
                  <option value="ANNUAL">ลาพักผ่อน</option>
                  <option value="SICK">ลาป่วย</option>
                  <option value="BUSINESS">ลากิจส่วนตัว</option>
                  <option value="OFFICIAL_DUTY">ปฏิบัติราชการ / ภารกิจพิเศษ</option>
                  <option value="OTHER">อื่นๆ</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-slate-400 mb-1">ตั้งแต่วันที่</label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-white"
                    required
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">ถึงวันที่</label>
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-white"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-400 mb-1">เหตุผลประกอบ / หมายเหตุ</label>
                <textarea
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  rows={3}
                  className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-white"
                  placeholder="ระบุเหตุผลหรือภารกิจ..."
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-blue-600 hover:bg-blue-500 font-medium text-white rounded transition shadow-lg shadow-blue-600/20"
              >
                {isAdmin ? "บันทึกอนุมัติทันที" : "ส่งใบลาเพื่อรออนุมัติ"}
              </button>
            </form>
          </div>

          {/* รายการแสดงผลปฏิทิน / บันทึกกำลังพล */}
          <div className="lg:col-span-2 space-y-4">
            <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-5 shadow-xl">
              <h2 className="text-sm font-semibold text-white uppercase tracking-wider border-b border-slate-800 pb-3 mb-4">
                กำหนดการและการปฏิบัติภารกิจที่กำลังพลปฏิบัติ
              </h2>

              {loading ? (
                <div className="text-center py-10 text-xs text-slate-500">กำลังโหลดข้อมูล...</div>
              ) : leaves.length === 0 ? (
                <div className="text-center py-10 text-xs text-slate-500">ไม่มีรายการลาหรือภารกิจในช่วงนี้</div>
              ) : (
                <div className="space-y-2.5">
                  {leaves.map((item) => (
                    <div
                      key={item.id}
                      className="p-3 bg-slate-950 border border-slate-800 rounded-lg flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-white">
                            {item.user.officialName || item.user.name}
                          </span>
                          <span className="px-2 py-0.5 rounded text-[10px] bg-blue-950/60 text-blue-400 border border-blue-800 font-mono">
                            {leaveTypeMap[item.type] || item.type}
                          </span>
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                              item.status === "APPROVED"
                                ? "bg-emerald-950 text-emerald-400 border border-emerald-800"
                                : item.status === "PENDING"
                                ? "bg-amber-950 text-amber-400 border border-amber-800"
                                : "bg-red-950 text-red-400 border border-red-800"
                            }`}
                          >
                            {item.status}
                          </span>
                        </div>
                        <div className="text-slate-400 mt-1 font-mono text-[11px]">
                          {new Date(item.startDate).toLocaleDateString("th-TH")} ถึง{" "}
                          {new Date(item.endDate).toLocaleDateString("th-TH")}
                          {item.reason && ` • หมายเหตุ: ${item.reason}`}
                        </div>
                      </div>

                      {/* ส่วนการอนุมัติสำหรับ Admin */}
                      {isAdmin && item.status === "PENDING" && (
                        <div className="flex gap-2 shrink-0">
                          <button
                            onClick={() => handleApproval(item.id, "APPROVED")}
                            className="px-3 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded font-medium transition"
                          >
                            อนุมัติ
                          </button>
                          <button
                            onClick={() => handleApproval(item.id, "REJECTED")}
                            className="px-3 py-1 bg-red-600 hover:bg-red-500 text-white rounded font-medium transition"
                          >
                            ปฏิเสธ
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}