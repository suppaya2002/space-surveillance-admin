"use client";

import { useSession } from "next-auth/react";
import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import {
  PlaneTakeoff,
  Plus,
  Filter,
  Calendar,
  Users,
  X,
  Search,
  Check,
  ShieldAlert,
  Building2,
  Navigation,
} from "lucide-react";

interface MemberItem {
  id: string;
  user: {
    id: string;
    officialName: string | null;
    name: string | null;
    officerType: "COMMISSIONED" | "NON_COMMISSIONED";
  };
}

interface DeploymentItem {
  id: string;
  location: "SAMUT_SONGKRAM" | "DON_MUEANG" | "OTHER";
  batchNumber: number;
  buddhistYear: number;
  startDate: string;
  endDate: string;
  note: string | null;
  members: MemberItem[];
}

interface UserOption {
  id: string;
  officialName: string | null;
  name: string | null;
  officerType: "COMMISSIONED" | "NON_COMMISSIONED";
}

export default function MissionDeploymentBoard() {
  const { data: session } = useSession();
  const currentUser = session?.user as any;
  const isAdmin = currentUser?.role === "ADMIN" || currentUser?.role === "SUPER_ADMIN";

  const [deployments, setDeployments] = useState<DeploymentItem[]>([]);
  const [users, setUsers] = useState<UserOption[]>([]);
  const [loading, setLoading] = useState(true);

  // Filter State
  const [activeTab, setActiveTab] = useState<"ALL" | "SAMUT_SONGKRAM" | "DON_MUEANG" | "OTHER">("ALL");
  const [searchQuery, setSearchQuery] = useState("");

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [location, setLocation] = useState<"SAMUT_SONGKRAM" | "DON_MUEANG" | "OTHER">("SAMUT_SONGKRAM");
  const [batchNumber, setBatchNumber] = useState("1");
  const [buddhistYear, setBuddhistYear] = useState(String(new Date().getFullYear() + 543));
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [note, setNote] = useState("");
  const [selectedUserIds, setSelectedUserIds] = useState<string[]>([]);
  const [personnelSearch, setPersonnelSearch] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const fetchData = async () => {
    try {
      const res = await fetch("/api/deployments");
      if (res.ok) setDeployments(await res.json());

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

  // คัดกรองตามแท็บและค้นหา
  const filteredDeployments = useMemo(() => {
    return deployments.filter((d) => {
      const matchTab = activeTab === "ALL" || d.location === activeTab;
      const matchSearch =
        searchQuery === "" ||
        `ผลัดที่ ${d.batchNumber}`.includes(searchQuery) ||
        String(d.buddhistYear).includes(searchQuery) ||
        d.members.some((m) =>
          (m.user.officialName || m.user.name || "").toLowerCase().includes(searchQuery.toLowerCase())
        );
      return matchTab && matchSearch;
    });
  }, [deployments, activeTab, searchQuery]);

  const toggleUserSelect = (id: string) => {
    setSelectedUserIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleCreateDeployment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!startDate || !endDate) return alert("กรุณาเลือกช่วงเวลาไป-กลับ");
    if (selectedUserIds.length === 0) return alert("กรุณาเลือกกำลังพลอย่างน้อย 1 นาย");

    setSubmitting(true);
    try {
      const res = await fetch("/api/deployments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          location,
          batchNumber,
          buddhistYear,
          startDate,
          endDate,
          note,
          userIds: selectedUserIds,
        }),
      });

      if (res.ok) {
        alert("บันทึกข้อมูลผลัดราชการสำเร็จ");
        setIsModalOpen(false);
        setNote("");
        setSelectedUserIds([]);
        fetchData();
      } else {
        const err = await res.json();
        alert(err.error || "เกิดข้อผิดพลาดในการบันทึก");
      }
    } finally {
      setSubmitting(false);
    }
  };

  const locationConfig = {
    SAMUT_SONGKRAM: {
      label: "ราชการ สฝอว.สม.",
      border: "border-sky-500/40",
      badge: "bg-sky-950/80 text-sky-400 border-sky-800",
      icon: Navigation,
    },
    DON_MUEANG: {
      label: "ราชการ สฝอว.ดน.",
      border: "border-indigo-500/40",
      badge: "bg-indigo-950/80 text-indigo-400 border-indigo-800",
      icon: Building2,
    },
    OTHER: {
      label: "ราชการอื่นๆ",
      border: "border-amber-500/40",
      badge: "bg-amber-950/80 text-amber-400 border-amber-800",
      icon: PlaneTakeoff,
    },
  };

  const filteredPersonnel = users.filter((u) =>
    (u.officialName || u.name || "").toLowerCase().includes(personnelSearch.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-[#020617] text-slate-100 p-4 md:p-8 font-sans">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-5">
          <div className="flex items-center space-x-3">
            <div className="h-10 w-10 rounded-lg bg-sky-950/80 border border-sky-500/30 flex items-center justify-center text-sky-400 shadow-[0_0_15px_rgba(56,189,248,0.2)]">
              <PlaneTakeoff className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono font-bold tracking-widest text-sky-400 uppercase bg-sky-950/60 px-2 py-0.5 rounded border border-sky-800/50">
                  SYSTEM MODULE 02
                </span>
                <span className="text-[10px] text-slate-500 font-mono">MISSION DEPLOYMENT BOARD</span>
              </div>
              <h1 className="text-xl md:text-2xl font-bold tracking-tight text-white mt-0.5">
                ทำเนียบผลัดราชการประจำกอง
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-3 self-start md:self-auto">
            {isAdmin && (
              <button
                onClick={() => setIsModalOpen(true)}
                className="px-4 py-2 text-xs font-semibold bg-blue-600 hover:bg-blue-500 text-white rounded-lg shadow-[0_0_15px_rgba(37,99,235,0.3)] transition flex items-center gap-1.5"
              >
                <Plus className="w-4 h-4" /> สร้างผลัดราชการใหม่
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

        {/* Tactical Control Bar (Filter Tabs & Search) */}
        <div className="bg-[#0f172a] border border-[#1e293b] rounded-xl p-3 flex flex-col md:flex-row items-center justify-between gap-3 shadow-xl">
          {/* Tabs */}
          <div className="flex flex-wrap items-center gap-1.5 w-full md:w-auto">
            <button
              onClick={() => setActiveTab("ALL")}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                activeTab === "ALL"
                  ? "bg-sky-600 text-white shadow-[0_0_10px_rgba(56,189,248,0.3)]"
                  : "bg-[#020617] text-slate-400 hover:text-white border border-slate-800"
              }`}
            >
              ทั้งหมด ({deployments.length})
            </button>
            <button
              onClick={() => setActiveTab("SAMUT_SONGKRAM")}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                activeTab === "SAMUT_SONGKRAM"
                  ? "bg-sky-600 text-white shadow-[0_0_10px_rgba(56,189,248,0.3)]"
                  : "bg-[#020617] text-slate-400 hover:text-white border border-slate-800"
              }`}
            >
              1. สฝอว.สม.
            </button>
            <button
              onClick={() => setActiveTab("DON_MUEANG")}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                activeTab === "DON_MUEANG"
                  ? "bg-indigo-600 text-white shadow-[0_0_10px_rgba(99,102,241,0.3)]"
                  : "bg-[#020617] text-slate-400 hover:text-white border border-slate-800"
              }`}
            >
              2. สฝอว.ดน.
            </button>
            <button
              onClick={() => setActiveTab("OTHER")}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                activeTab === "OTHER"
                  ? "bg-amber-600 text-white shadow-[0_0_10px_rgba(245,158,11,0.3)]"
                  : "bg-[#020617] text-slate-400 hover:text-white border border-slate-800"
              }`}
            >
              3. ราชการอื่นๆ
            </button>
          </div>

          {/* Search Bar */}
          <div className="relative w-full md:w-64">
            <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="ค้นหาผลัด, ปี พ.ศ., ชื่อกำลังพล..."
              className="w-full bg-[#020617] border border-[#1e293b] rounded-lg pl-8 pr-3 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-sky-500 font-sans"
            />
          </div>
        </div>

        {/* Grid Cards แสดงทีละผลัด */}
        {loading ? (
          <div className="text-center py-20 text-xs text-slate-500 font-mono">
            กำลังโหลดข้อมูลบอร์ดปฏิบัติราชการ...
          </div>
        ) : filteredDeployments.length === 0 ? (
          <div className="text-center py-20 bg-[#0f172a] border border-[#1e293b] rounded-xl text-slate-500 text-xs font-mono">
            ไม่พบข้อมูลผลัดราชการในหมวดหมู่นี้
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredDeployments.map((d) => {
              const conf = locationConfig[d.location];
              const LocationIcon = conf.icon;

              return (
                <div
                  key={d.id}
                  className={`bg-[#0f172a] border ${conf.border} rounded-xl p-5 shadow-2xl space-y-4 hover:border-sky-400/60 transition flex flex-col justify-between`}
                >
                  <div className="space-y-3">
                    {/* Card Header & Badge */}
                    <div className="flex items-center justify-between">
                      <span className={`px-2.5 py-1 rounded-md text-[11px] font-mono font-bold border flex items-center gap-1.5 ${conf.badge}`}>
                        <LocationIcon className="w-3.5 h-3.5" />
                        {conf.label}
                      </span>
                      <div className="text-right">
                        <span className="text-base font-extrabold text-white tracking-wider font-mono">
                          ผลัดที่ {d.batchNumber}
                        </span>
                        <div className="text-[10px] text-sky-400 font-mono">พ.ศ. {d.buddhistYear}</div>
                      </div>
                    </div>

                    {/* Timeline */}
                    <div className="bg-[#020617] border border-slate-800 rounded-lg p-2.5 flex items-center justify-between text-[11px] font-mono text-slate-300">
                      <div className="flex items-center gap-1.5 text-slate-400">
                        <Calendar className="w-3.5 h-3.5 text-sky-400" />
                        <span>ช่วงปฏิบัติราชการ:</span>
                      </div>
                      <div className="text-white font-semibold">
                        {new Date(d.startDate).toLocaleDateString("th-TH")} - {new Date(d.endDate).toLocaleDateString("th-TH")}
                      </div>
                    </div>

                    {d.note && (
                      <p className="text-[11px] text-slate-400 italic bg-[#020617]/50 p-2 rounded border border-slate-900">
                        "{d.note}"
                      </p>
                    )}

                    {/* Personnel Roster */}
                    <div className="space-y-1.5 pt-1">
                      <div className="flex items-center justify-between text-[10px] uppercase font-mono tracking-wider text-slate-400">
                        <span>กำลังพลประจำผลัด</span>
                        <span>{d.members.length} นาย</span>
                      </div>
                      <div className="space-y-1 max-h-48 overflow-y-auto pr-1">
                        {d.members.map((m) => {
                          const isCommissioned = m.user.officerType === "COMMISSIONED";
                          return (
                            <div
                              key={m.id}
                              className="p-2 bg-[#020617] border border-slate-800 rounded-lg flex items-center justify-between text-xs"
                            >
                              <span className="font-medium text-slate-200 truncate mr-2">
                                {m.user.officialName || m.user.name}
                              </span>
                              <span
                                className={`px-2 py-0.5 rounded text-[10px] font-mono font-semibold shrink-0 border ${
                                  isCommissioned
                                    ? "bg-purple-950/80 text-purple-300 border-purple-700/60"
                                    : "bg-blue-950/80 text-blue-300 border-blue-700/60"
                                }`}
                              >
                                {isCommissioned ? "สัญญาบัตร" : "ประทวน"}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-slate-800/80 text-[10px] text-slate-500 font-mono text-right">
                    DIVISION COMMAND CONTROL
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Modal สร้างผลัดราชการใหม่ (เฉพาะ Admin) */}
        {isModalOpen && (
          <div className="fixed inset-0 bg-black/75 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-[#0f172a] border border-[#1e293b] rounded-2xl w-full max-w-xl p-6 shadow-2xl space-y-5 animate-in fade-in zoom-in-95 duration-150">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="flex items-center space-x-2">
                  <PlaneTakeoff className="w-5 h-5 text-sky-400" />
                  <h3 className="text-sm font-bold text-white font-mono uppercase">
                    สร้างผลัดการไปราชการประจำกอง
                  </h3>
                </div>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="p-1 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleCreateDeployment} className="space-y-4 text-xs">
                <div>
                  <label className="block text-slate-400 mb-1">หมวดหมู่ราชการ</label>
                  <select
                    value={location}
                    onChange={(e) => setLocation(e.target.value as any)}
                    className="w-full bg-[#020617] border border-[#1e293b] rounded-lg p-2.5 text-slate-200 focus:outline-none focus:border-sky-500"
                  >
                    <option value="SAMUT_SONGKRAM">1. ราชการ สฝอว.สม.</option>
                    <option value="DON_MUEANG">2. ราชการ สฝอว.ดน.</option>
                    <option value="OTHER">3. ราชการอื่นๆ</option>
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-400 mb-1">ลำดับผลัดที่</label>
                    <input
                      type="number"
                      min="1"
                      value={batchNumber}
                      onChange={(e) => setBatchNumber(e.target.value)}
                      required
                      className="w-full bg-[#020617] border border-[#1e293b] rounded-lg p-2 text-slate-200 focus:outline-none focus:border-sky-500 font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-400 mb-1">ปี พ.ศ.</label>
                    <input
                      type="number"
                      value={buddhistYear}
                      onChange={(e) => setBuddhistYear(e.target.value)}
                      required
                      className="w-full bg-[#020617] border border-[#1e293b] rounded-lg p-2 text-slate-200 focus:outline-none focus:border-sky-500 font-mono"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-400 mb-1">วันที่เริ่มต้น</label>
                    <input
                      type="date"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      required
                      className="w-full bg-[#020617] border border-[#1e293b] rounded-lg p-2 text-slate-200 focus:outline-none focus:border-sky-500 font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-400 mb-1">วันที่สิ้นสุด</label>
                    <input
                      type="date"
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                      required
                      className="w-full bg-[#020617] border border-[#1e293b] rounded-lg p-2 text-slate-200 focus:outline-none focus:border-sky-500 font-mono"
                    />
                  </div>
                </div>

                {/* Personnel Selector with Live Search */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-slate-400">
                    <label>เลือกกำลังพลในผลัด ({selectedUserIds.length} นาย)</label>
                  </div>
                  <input
                    type="text"
                    value={personnelSearch}
                    onChange={(e) => setPersonnelSearch(e.target.value)}
                    placeholder="พิมพ์ชื่อค้นหากำลังพล..."
                    className="w-full bg-[#020617] border border-[#1e293b] rounded-lg px-2.5 py-1.5 text-xs text-slate-200 placeholder-slate-600 focus:outline-none focus:border-sky-500"
                  />
                  <div className="max-h-36 overflow-y-auto bg-[#020617] border border-[#1e293b] rounded-lg p-2 space-y-1">
                    {filteredPersonnel.map((u) => {
                      const isSelected = selectedUserIds.includes(u.id);
                      return (
                        <div
                          key={u.id}
                          onClick={() => toggleUserSelect(u.id)}
                          className={`p-2 rounded flex items-center justify-between cursor-pointer transition ${
                            isSelected
                              ? "bg-sky-950/80 border border-sky-600/60 text-sky-200"
                              : "hover:bg-slate-800 text-slate-300"
                          }`}
                        >
                          <span className="font-medium text-xs">{u.officialName || u.name}</span>
                          <span className="text-[10px] font-mono text-slate-400">
                            {u.officerType === "COMMISSIONED" ? "สัญญาบัตร" : "ประทวน"}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div>
                  <label className="block text-slate-400 mb-1">หมายเหตุ / คำสั่งแต่งตั้ง</label>
                  <input
                    type="text"
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    placeholder="เช่น ปฏิบัติราชการตามคำสั่ง ทอ. ที่ ..."
                    className="w-full bg-[#020617] border border-[#1e293b] rounded-lg p-2 text-slate-200 focus:outline-none focus:border-sky-500"
                  />
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
                    disabled={submitting}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-lg shadow-[0_0_15px_rgba(37,99,235,0.3)] transition"
                  >
                    {submitting ? "กำลังบันทึก..." : "ยืนยันการจัดผลัด"}
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