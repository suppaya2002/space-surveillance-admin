"use client";

import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Zap,
  Plus,
  Calendar,
  Layers,
  Terminal,
  RefreshCw,
  X,
  AlertCircle,
  Radio,
  ArrowUpDown,
} from "lucide-react";

interface CategoryItem {
  id: string;
  name: string;
  targetOfficer: "COMMISSIONED" | "NON_COMMISSIONED";
  slotsPrimary: number;
  slotsReserve: number;
  assignments: {
    id: string;
    dutyDate: string;
    role: "PRIMARY" | "RESERVE";
    buddhistYear: number;
    user: {
      id: string;
      officialName: string | null;
      name: string | null;
      officerType: string;
    };
  }[];
}

export default function AutoDutyDispatcherPage() {
  const { data: session } = useSession();
  const currentUser = session?.user as any;
  const isAdmin = currentUser?.role === "ADMIN" || currentUser?.role === "SUPER_ADMIN";

  const [categories, setCategories] = useState<CategoryItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Dispatcher State
  const [selectedCatId, setSelectedCatId] = useState("");
  const [dutyDate, setDutyDate] = useState("");
  const [dispatching, setDispatching] = useState(false);
  const [auditLogs, setAuditLogs] = useState<string[]>([]);

  // Modal Create Category State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [catName, setCatName] = useState("");
  const [targetOfficer, setTargetOfficer] = useState<"COMMISSIONED" | "NON_COMMISSIONED">("NON_COMMISSIONED");
  const [slotsPrimary, setSlotsPrimary] = useState("1");
  const [slotsReserve, setSlotsReserve] = useState("1");
  const [creatingCat, setCreatingCat] = useState(false);

  const fetchCategories = async () => {
    try {
      const res = await fetch("/api/duty/categories");
      if (res.ok) {
        const data = await res.json();
        setCategories(data);
        if (data.length > 0 && !selectedCatId) {
          setSelectedCatId(data[0].id);
        }
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleAutoDispatch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCatId || !dutyDate) return alert("กรุณาเลือกประเภทเวรและวันที่");

    setDispatching(true);
    setAuditLogs(["เริ่มต้นกระบวนการ Tactical Fair-Share Dispatcher..."]);

    try {
      const res = await fetch("/api/duty/auto-generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          dutyCategoryId: selectedCatId,
          startDate: dutyDate,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        setAuditLogs(data.logs || []);
        fetchCategories();
      } else {
        setAuditLogs(data.logs || [data.error]);
        alert(data.error || "เกิดข้อผิดพลาดในการจัดเวร");
      }
    } finally {
      setDispatching(false);
    }
  };

  const handleCreateCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!catName) return alert("กรุณาระบุชื่อเวร");

    setCreatingCat(true);
    try {
      const res = await fetch("/api/duty/categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: catName,
          targetOfficer,
          slotsPrimary,
          slotsReserve,
        }),
      });

      if (res.ok) {
        alert("เพิ่มประเภทภารกิจเวรสำเร็จ");
        setIsModalOpen(false);
        setCatName("");
        fetchCategories();
      } else {
        const err = await res.json();
        alert(err.error || "เกิดข้อผิดพลาด");
      }
    } finally {
      setCreatingCat(false);
    }
  };

  const currentCategory = categories.find((c) => c.id === selectedCatId);

  return (
    <div className="min-h-screen bg-[#020617] text-slate-100 p-4 md:p-8 font-sans">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-5">
          <div className="flex items-center space-x-3">
            <div className="h-10 w-10 rounded-lg bg-sky-950/80 border border-sky-500/30 flex items-center justify-center text-sky-400 shadow-[0_0_15px_rgba(56,189,248,0.2)]">
              <Zap className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono font-bold tracking-widest text-sky-400 uppercase bg-sky-950/60 px-2 py-0.5 rounded border border-sky-800/50">
                  SYSTEM MODULE 03
                </span>
                <span className="text-[10px] text-slate-500 font-mono">AUTOMATED DUTY DISPATCHER</span>
              </div>
              <h1 className="text-xl md:text-2xl font-bold tracking-tight text-white mt-0.5">
                ระบบจัดสรรเวรและผลัดอัตโนมัติ
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-3 self-start md:self-auto">
            {isAdmin && (
              <button
                onClick={() => setIsModalOpen(true)}
                className="px-4 py-2 text-xs font-semibold bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-200 rounded-lg transition flex items-center gap-1.5"
              >
                <Plus className="w-4 h-4 text-sky-400" /> สร้างประเภทเวรใหม่
              </button>
            )}
            <Link
              href="/"
              className="px-4 py-2 text-xs font-semibold bg-[#0f172a] hover:bg-slate-800 text-slate-300 border border-slate-800 rounded-lg transition"
            >
              ← กลับศูนย์บัญชาการ
            </Link>
          </div>
        </header>

        {/* Master Dispatcher Control Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Main Control Panel (5 cols) */}
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-[#0f172a] border border-[#1e293b] rounded-xl p-5 shadow-2xl space-y-4">
              <div className="flex items-center space-x-2 border-b border-slate-800 pb-3">
                <Radio className="w-4 h-4 text-amber-400 animate-pulse" />
                <h2 className="text-xs font-bold uppercase tracking-wider text-white">
                  แผงควบคุมการคำนวณเวร (Command Panel)
                </h2>
              </div>

              {isAdmin ? (
                <form onSubmit={handleAutoDispatch} className="space-y-4 text-xs">
                  <div>
                    <label className="block text-slate-400 mb-1">เลือกประเภทเวร / ภารกิจ</label>
                    <select
                      value={selectedCatId}
                      onChange={(e) => setSelectedCatId(e.target.value)}
                      className="w-full bg-[#020617] border border-[#1e293b] rounded-lg p-2.5 text-slate-200 focus:outline-none focus:border-sky-500 font-sans"
                    >
                      {categories.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.name} ({c.targetOfficer === "COMMISSIONED" ? "สัญญาบัตร" : "ประทวน"} • จริง {c.slotsPrimary} / รอง {c.slotsReserve})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-slate-400 mb-1">ระบุวันที่ต้องการจัดเวร</label>
                    <input
                      type="date"
                      value={dutyDate}
                      onChange={(e) => setDutyDate(e.target.value)}
                      required
                      className="w-full bg-[#020617] border border-[#1e293b] rounded-lg p-2.5 text-slate-200 focus:outline-none focus:border-sky-500 font-mono text-[12px]"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={dispatching || categories.length === 0}
                    className="w-full py-3 bg-gradient-to-r from-blue-600 to-sky-600 hover:from-blue-500 hover:to-sky-500 text-white font-bold rounded-lg shadow-[0_0_20px_rgba(56,189,248,0.3)] transition flex items-center justify-center gap-2"
                  >
                    <Zap className="w-4 h-4 text-amber-300" />
                    {dispatching ? "กำลังประมวลผล Fair-Share..." : "⚡ จัดเวรอัตโนมัติ (AUTO-ASSIGN)"}
                  </button>
                </form>
              ) : (
                <div className="p-4 bg-[#020617] border border-slate-800 rounded-lg text-xs text-slate-400 leading-relaxed">
                  สิทธิ์การสั่งคำนวณและจัดสรรเวรอัตโนมัติสงวนไว้เฉพาะ Admin เท่านั้น
                </div>
              )}
            </div>

            {/* Tactical Screening Audit Log */}
            <div className="bg-[#0f172a] border border-[#1e293b] rounded-xl p-5 shadow-2xl space-y-3">
              <div className="flex items-center space-x-2 border-b border-slate-800 pb-2.5">
                <Terminal className="w-4 h-4 text-sky-400" />
                <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-300">
                  Tactical Screening Audit Log
                </h3>
              </div>
              <div className="bg-[#020617] border border-slate-900 rounded-lg p-3 max-h-56 overflow-y-auto font-mono text-[11px] space-y-1.5 text-slate-400">
                {auditLogs.length === 0 ? (
                  <p className="text-slate-600 italic">พร้อมรับคำสั่งประมวลผล...</p>
                ) : (
                  auditLogs.map((log, index) => (
                    <div key={index} className="flex items-start gap-2">
                      <span className="text-sky-500 select-none">❯</span>
                      <span className={log.includes("ตัดชื่อ") ? "text-rose-400" : log.includes("จัดสรร") ? "text-emerald-400 font-semibold" : "text-slate-300"}>
                        {log}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Table แสดงผลเวรที่จัดสำเร็จ (7 cols) */}
          <div className="lg:col-span-7 space-y-4">
            <div className="bg-[#0f172a] border border-[#1e293b] rounded-xl p-5 shadow-2xl space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div>
                  <h2 className="text-sm font-bold uppercase tracking-wider text-white">
                    ตารางเวรที่จัดสรรแล้ว
                  </h2>
                  <p className="text-[11px] text-slate-400">
                    {currentCategory ? currentCategory.name : "กรุณาเลือกประเภทเวร"}
                  </p>
                </div>
                <button
                  onClick={fetchCategories}
                  className="p-1.5 bg-[#020617] hover:bg-slate-800 border border-slate-800 rounded-lg text-slate-400 hover:text-white transition"
                  title="รีเฟรชข้อมูล"
                >
                  <RefreshCw className="w-4 h-4" />
                </button>
              </div>

              {loading ? (
                <div className="text-center py-16 text-xs text-slate-500 font-mono">
                  กำลังโหลดข้อมูลตารางเวร...
                </div>
              ) : !currentCategory || currentCategory.assignments.length === 0 ? (
                <div className="text-center py-16 text-xs text-slate-500 font-mono">
                  ยังไม่มีประวัติการจัดเวรในหมวดนี้
                </div>
              ) : (
                <div className="space-y-2.5 max-h-[500px] overflow-y-auto pr-1">
                  {currentCategory.assignments.map((assign) => {
                    const isPrimary = assign.role === "PRIMARY";
                    return (
                      <div
                        key={assign.id}
                        className={`p-3 bg-[#020617] rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs transition ${
                          isPrimary
                            ? "border-sky-500/50 shadow-[inset_0_0_10px_rgba(56,189,248,0.05)]"
                            : "border-amber-500/50 shadow-[inset_0_0_10px_rgba(245,158,11,0.05)]"
                        }`}
                      >
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span
                              className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold border ${
                                isPrimary
                                  ? "bg-sky-950/80 text-sky-300 border-sky-700/60"
                                  : "bg-amber-950/80 text-amber-300 border-amber-700/60"
                              }`}
                            >
                              {isPrimary ? "[ ตัวจริง ]" : "[ ตัวสำรอง ]"}
                            </span>
                            <span className="font-bold text-slate-100">
                              {assign.user.officialName || assign.user.name}
                            </span>
                          </div>
                          <div className="text-[11px] font-mono text-slate-400">
                            วันที่เข้าเวร: {new Date(assign.dutyDate).toLocaleDateString("th-TH")} (พ.ศ. {assign.buddhistYear})
                          </div>
                        </div>

                        {isAdmin && (
                          <div className="flex items-center gap-2 self-end sm:self-auto">
                            <span className="text-[10px] text-slate-500 font-mono">STATUS: CONFIRMED</span>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Modal เพิ่มประเภทเวรใหม่ (Admin) */}
        {isModalOpen && (
          <div className="fixed inset-0 bg-black/75 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-[#0f172a] border border-[#1e293b] rounded-2xl w-full max-w-lg p-6 shadow-2xl space-y-5 animate-in fade-in zoom-in-95 duration-150">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="flex items-center space-x-2">
                  <Layers className="w-5 h-5 text-sky-400" />
                  <h3 className="text-sm font-bold text-white font-mono uppercase">
                    สร้างประเภทเวร / ภารกิจใหม่
                  </h3>
                </div>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="p-1 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleCreateCategory} className="space-y-4 text-xs">
                <div>
                  <label className="block text-slate-400 mb-1">ชื่อเวร / ภารกิจ</label>
                  <input
                    type="text"
                    value={catName}
                    onChange={(e) => setCatName(e.target.value)}
                    placeholder="เช่น เวรนำแถว 1-5, เวรบรรยายสรุป, เวรพูดหน้าแถว"
                    required
                    className="w-full bg-[#020617] border border-[#1e293b] rounded-lg p-2.5 text-slate-200 focus:outline-none focus:border-sky-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 mb-1">กลุ่มเป้าหมายชั้นยศ</label>
                  <select
                    value={targetOfficer}
                    onChange={(e) => setTargetOfficer(e.target.value as any)}
                    className="w-full bg-[#020617] border border-[#1e293b] rounded-lg p-2.5 text-slate-200 focus:outline-none focus:border-sky-500"
                  >
                    <option value="NON_COMMISSIONED">นายทหารประทวน</option>
                    <option value="COMMISSIONED">นายทหารสัญญาบัตร</option>
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-400 mb-1">จำนวนตัวจริง (คน)</label>
                    <input
                      type="number"
                      min="1"
                      value={slotsPrimary}
                      onChange={(e) => setSlotsPrimary(e.target.value)}
                      required
                      className="w-full bg-[#020617] border border-[#1e293b] rounded-lg p-2 text-slate-200 focus:outline-none focus:border-sky-500 font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-400 mb-1">จำนวนตัวสำรอง (คน)</label>
                    <input
                      type="number"
                      min="0"
                      value={slotsReserve}
                      onChange={(e) => setSlotsReserve(e.target.value)}
                      required
                      className="w-full bg-[#020617] border border-[#1e293b] rounded-lg p-2 text-slate-200 focus:outline-none focus:border-sky-500 font-mono"
                    />
                  </div>
                </div>

                <div className="pt-2 flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold rounded-lg transition"
                  >
                    ยกเลิก
                  </button>
                  <button
                    type="submit"
                    disabled={creatingCat}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-lg shadow-[0_0_15px_rgba(37,99,235,0.3)] transition"
                  >
                    {creatingCat ? "กำลังบันทึก..." : "ยืนยันสร้างประเภทเวร"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}