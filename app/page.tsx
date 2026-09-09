"use client";

import { useSession, signOut } from "next-auth/react";
import { useState, useEffect, useMemo } from "react";
import {
  Calendar as CalendarIcon,
  Shield,
  Plane,
  Zap,
  BarChart3,
  Check,
  X,
  Plus,
  LogOut,
  Search,
  Download,
  AlertCircle,
  UserCheck,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

export default function MissionControlSPA() {
  const { data: session, status } = useSession();
  const [currentTab, setCurrentTab] = useState<"CALENDAR" | "DEPLOYMENT" | "DISPATCHER" | "ANALYTICS" | "ADMIN_USERS">("CALENDAR");

  // Global Datasets
  const [users, setUsers] = useState<any[]>([]);
  const [leaves, setLeaves] = useState<any[]>([]);
  const [missions, setMissions] = useState<any[]>([]);
  const [dutyTypes, setDutyTypes] = useState<any[]>([]);
  const [dutySchedules, setDutySchedules] = useState<any[]>([]);
  const [selectedYear, setSelectedYear] = useState(2569);

  // User Pending / Approved flags
  const currentUser = session?.user as any;
  const isPending = currentUser?.status === "PENDING";
  const isAdmin = currentUser?.role === "ADMIN" || currentUser?.role === "SUPER_ADMIN";

  const refreshAllData = async () => {
    if (!session || isPending) return;
    try {
      const [uRes, lRes, mRes, dtRes, dsRes] = await Promise.all([
        fetch("/api/users"),
        fetch("/api/leaves"),
        fetch("/api/missions"),
        fetch("/api/duty/types"),
        fetch("/api/duty/schedules"),
      ]);
      if (uRes.ok) setUsers(await uRes.json());
      if (lRes.ok) setLeaves(await lRes.json());
      if (mRes.ok) setMissions(await mRes.json());
      if (dtRes.ok) setDutyTypes(await dtRes.json());
      if (dsRes.ok) setDutySchedules(await dsRes.json());
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    refreshAllData();
  }, [session, isPending]);

  if (status === "loading") {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center text-sky-400 font-mono text-sm">
        [INITIALIZING COMMAND LINK...]
      </div>
    );
  }

  // หน้าจอแสดงผลกรณีผู้ใช้รอการอนุมัติ
  if (isPending) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-slate-900 border border-slate-800 rounded-xl p-6 text-center space-y-4 shadow-2xl">
          <div className="w-12 h-12 rounded-full bg-amber-500/10 border border-amber-500/30 flex items-center justify-center mx-auto text-amber-500">
            <AlertCircle className="w-6 h-6" />
          </div>
          <h2 className="text-lg font-bold text-white tracking-wide">รอการอนุมัติสิทธิ์เข้าใช้งาน</h2>
          <p className="text-xs text-slate-400 leading-relaxed">
            บัญชี Google ({session?.user?.email}) เข้าสู่ระบบแล้ว อยู่ระหว่างรอผู้ดูแลระบบตรวจสอบ ยืนยันยศ-ชื่อ-สกุลจริง และเปิดสิทธิ์การเข้าถึง
          </p>
          <button
            onClick={() => signOut()}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold rounded-lg transition"
          >
            ออกจากระบบ
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-50 font-sans flex flex-col">
      {/* Top Header Bar */}
      <header className="bg-slate-900 border-b border-slate-800 px-6 py-3.5 sticky top-0 z-30 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center space-x-3">
          <div className="h-9 w-9 rounded bg-sky-950 border border-sky-500/40 flex items-center justify-center text-sky-400 font-bold text-xs">
            SSD
          </div>
          <div>
            <h1 className="text-sm md:text-base font-bold text-white tracking-wide">
              กองเฝ้าระวังทางอวกาศ • ระบบบริหารงานธุรการและกำลังพล
            </h1>
            <p className="text-[10px] text-slate-400 font-mono">SPACE SURVEILLANCE DIVISION CONTROL PORTAL</p>
          </div>
        </div>

        {/* User Badge & Logout */}
        <div className="flex items-center space-x-3 text-xs">
          <div className="text-right hidden sm:block">
            <div className="font-semibold text-slate-200">
              {currentUser?.rank} {currentUser?.firstName} {currentUser?.lastName}
            </div>
            <div className="text-[10px] text-sky-400 font-mono">
              สิทธิ์: {currentUser?.role} | {currentUser?.category === "COMMISSIONED" ? "สัญญาบัตร" : "ประทวน"}
            </div>
          </div>
          <button
            onClick={() => signOut()}
            className="p-2 bg-slate-800 hover:bg-rose-950 hover:text-rose-400 rounded-lg border border-slate-700 transition"
            title="ออกจากระบบ"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* Main Tab Navigation */}
      <nav className="bg-slate-900/60 border-b border-slate-800 px-6 flex space-x-2 overflow-x-auto text-xs font-semibold">
        <button
          onClick={() => setCurrentTab("CALENDAR")}
          className={`py-3 px-4 flex items-center gap-2 border-b-2 transition ${
            currentTab === "CALENDAR"
              ? "border-sky-400 text-sky-400"
              : "border-transparent text-slate-400 hover:text-slate-200"
          }`}
        >
          <CalendarIcon className="w-4 h-4" /> 1. ปฏิทินปฏิบัติงาน & ขอลา
        </button>
        <button
          onClick={() => setCurrentTab("DEPLOYMENT")}
          className={`py-3 px-4 flex items-center gap-2 border-b-2 transition ${
            currentTab === "DEPLOYMENT"
              ? "border-sky-400 text-sky-400"
              : "border-transparent text-slate-400 hover:text-slate-200"
          }`}
        >
          <Plane className="w-4 h-4" /> 2. ทำเนียบผลัดราชการ
        </button>
        <button
          onClick={() => setCurrentTab("DISPATCHER")}
          className={`py-3 px-4 flex items-center gap-2 border-b-2 transition ${
            currentTab === "DISPATCHER"
              ? "border-sky-400 text-sky-400"
              : "border-transparent text-slate-400 hover:text-slate-200"
          }`}
        >
          <Zap className="w-4 h-4" /> 3. จัดสรรเวรอัตโนมัติ
        </button>
        <button
          onClick={() => setCurrentTab("ANALYTICS")}
          className={`py-3 px-4 flex items-center gap-2 border-b-2 transition ${
            currentTab === "ANALYTICS"
              ? "border-sky-400 text-sky-400"
              : "border-transparent text-slate-400 hover:text-slate-200"
          }`}
        >
          <BarChart3 className="w-4 h-4" /> 4. ศูนย์สถิติกำลังพล
        </button>
        {isAdmin && (
          <button
            onClick={() => setCurrentTab("ADMIN_USERS")}
            className={`py-3 px-4 flex items-center gap-2 border-b-2 transition ${
              currentTab === "ADMIN_USERS"
                ? "border-amber-400 text-amber-400"
                : "border-transparent text-slate-400 hover:text-slate-200"
            }`}
          >
            <UserCheck className="w-4 h-4" /> อนุมัติผู้ใช้งาน
          </button>
        )}
      </nav>

      {/* Viewport Panels */}
      <main className="flex-1 p-4 md:p-6 max-w-7xl w-full mx-auto">
        {currentTab === "CALENDAR" && (
          <TabCalendar leaves={leaves} missions={missions} duties={dutySchedules} isAdmin={isAdmin} onRefresh={refreshAllData} />
        )}
        {currentTab === "DEPLOYMENT" && (
          <TabDeployment missions={missions} users={users} isAdmin={isAdmin} onRefresh={refreshAllData} />
        )}
        {currentTab === "DISPATCHER" && (
          <TabDispatcher dutyTypes={dutyTypes} schedules={dutySchedules} isAdmin={isAdmin} onRefresh={refreshAllData} />
        )}
        {currentTab === "ANALYTICS" && (
          <TabAnalytics users={users} missions={missions} leaves={leaves} schedules={dutySchedules} year={selectedYear} setYear={setSelectedYear} />
        )}
        {currentTab === "ADMIN_USERS" && isAdmin && (
          <TabAdminUsers users={users} onRefresh={refreshAllData} />
        )}
      </main>
    </div>
  );
}

// ------------------------------------------------------------------------------------------------
// Tab 1: ปฏิทินปฏิบัติงาน & คำขอลา
// ------------------------------------------------------------------------------------------------
function TabCalendar({ leaves, missions, duties, isAdmin, onRefresh }: any) {
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [currentMonth, setCurrentMonth] = useState(new Date());

  // Form State
  const [leaveType, setLeaveType] = useState("VACATION");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [reason, setReason] = useState("");

  const handleApplyLeave = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch("/api/leaves", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ leaveType, startDate, endDate, reason }),
    });
    if (res.ok) {
      alert("ส่งคำขอลาเรียบร้อย อยู่ระหว่างรอผู้ดูแลระบบอนุมัติ");
      setReason("");
      onRefresh();
    }
  };

  const handleApprove = async (id: string, isApproved: boolean) => {
    await fetch(`/api/leaves/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isApproved }),
    });
    onRefresh();
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
      {/* ฝั่งซ้าย: Monthly Grid */}
      <div className="lg:col-span-8 bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-xl space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <h2 className="text-sm font-bold text-white uppercase tracking-wider">
            ปฏิทินปฏิบัติการประจำเดือน
          </h2>
          <div className="flex items-center gap-2 text-[11px] text-slate-400 font-mono">
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded bg-emerald-500" /> ลาอนุมัติ</span>
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded bg-sky-500" /> ผลัดราชการ</span>
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded bg-purple-500" /> เวรประจำวัน</span>
          </div>
        </div>

        {/* ตัวปฏิทิน 30 วันจำลอง Interactive */}
        <div className="grid grid-cols-7 gap-1.5 text-center text-xs">
          {["อา", "จ", "อ", "พ", "พฤ", "ศ", "ส"].map((d) => (
            <div key={d} className="font-mono text-slate-500 py-1 font-bold">{d}</div>
          ))}
          {Array.from({ length: 31 }).map((_, i) => {
            const day = i + 1;
            return (
              <div
                key={day}
                onClick={() => setSelectedDate(new Date(2026, 8, day))}
                className="min-h-[75px] bg-slate-950 border border-slate-800/80 hover:border-sky-500 rounded p-1.5 text-left cursor-pointer transition flex flex-col justify-between"
              >
                <span className="font-mono text-[11px] text-slate-400">{day}</span>
                <div className="space-y-0.5">
                  <div className="text-[9px] bg-emerald-950/80 border border-emerald-700/60 text-emerald-300 px-1 rounded truncate">
                    ลา: 1 นาย
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ฝั่งขวา: Forms & Pending Approvals */}
      <div className="lg:col-span-4 space-y-5">
        {/* ฟอร์มยื่นคำขอลา */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-xl space-y-3">
          <h3 className="text-xs font-bold uppercase text-white tracking-wider">ยื่นคำขอลาประจำบุคคล</h3>
          <form onSubmit={handleApplyLeave} className="space-y-3 text-xs">
            <div>
              <label className="text-slate-400 block mb-1">ประเภทการลา</label>
              <select
                value={leaveType}
                onChange={(e) => setLeaveType(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-white"
              >
                <option value="VACATION">ลาพักผ่อนประจำปี</option>
                <option value="BUSINESS">ลากิจส่วนตัว</option>
                <option value="SICK">ลาป่วย</option>
                <option value="OTHER">อื่นๆ</option>
              </select>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-slate-400 block mb-1">เริ่ม</label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded p-1.5 text-white"
                  required
                />
              </div>
              <div>
                <label className="text-slate-400 block mb-1">สิ้นสุด</label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded p-1.5 text-white"
                  required
                />
              </div>
            </div>
            <div>
              <label className="text-slate-400 block mb-1">เหตุผล</label>
              <textarea
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                rows={2}
                placeholder="ระบุเหตุผลประกอบการลา..."
                className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-white"
              />
            </div>
            <button
              type="submit"
              className="w-full py-2 bg-blue-600 hover:bg-blue-500 font-semibold rounded text-white transition"
            >
              ส่งคำขอลา
            </button>
          </form>
        </div>

        {/* กล่องพิจารณาอนุมัติสำหรับ Admin */}
        {isAdmin && (
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-xl space-y-3">
            <h3 className="text-xs font-bold uppercase text-amber-400 tracking-wider flex items-center justify-between">
              <span>คำขอรอดำเนินการ (ADMIN)</span>
              <span className="text-[10px] bg-amber-950 text-amber-300 px-1.5 py-0.5 rounded border border-amber-800">
                {leaves.filter((l: any) => !l.isApproved).length} รายการ
              </span>
            </h3>
            <div className="space-y-2 max-h-56 overflow-y-auto text-xs pr-1">
              {leaves.filter((l: any) => !l.isApproved).map((item: any) => (
                <div key={item.id} className="p-2.5 bg-slate-950 border border-slate-800 rounded flex justify-between items-center">
                  <div>
                    <div className="font-semibold text-slate-200">
                      {item.user.rank} {item.user.firstName}
                    </div>
                    <div className="text-[10px] text-slate-400">
                      {item.leaveType} • {new Date(item.startDate).toLocaleDateString("th-TH")}
                    </div>
                  </div>
                  <div className="flex gap-1.5">
                    <button
                      onClick={() => handleApprove(item.id, true)}
                      className="p-1 bg-emerald-950 border border-emerald-800 text-emerald-400 rounded hover:bg-emerald-900"
                    >
                      <Check className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleApprove(item.id, false)}
                      className="p-1 bg-rose-950 border border-rose-800 text-rose-400 rounded hover:bg-rose-900"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ------------------------------------------------------------------------------------------------
// Tab 2: ทำเนียบผลัดราชการประจำกอง
// ------------------------------------------------------------------------------------------------
function TabDeployment({ missions, users, isAdmin, onRefresh }: any) {
  const [filterLocation, setFilterLocation] = useState<string>("ALL");
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Modal State
  const [location, setLocation] = useState("SAM_MO");
  const [batchNumber, setBatchNumber] = useState("1");
  const [year, setYear] = useState("2569");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [selectedStaffs, setSelectedStaffs] = useState<string[]>([]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    await fetch("/api/missions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        location,
        batchNumber: parseInt(batchNumber),
        year: parseInt(year),
        startDate,
        endDate,
        staffIds: selectedStaffs,
      }),
    });
    setIsModalOpen(false);
    onRefresh();
  };

  const filteredMissions = missions.filter(
    (m: any) => filterLocation === "ALL" || m.location === filterLocation
  );

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-900 border border-slate-800 p-3 rounded-xl">
        <div className="flex gap-1.5 text-xs font-semibold">
          <button
            onClick={() => setFilterLocation("ALL")}
            className={`px-3 py-1.5 rounded ${filterLocation === "ALL" ? "bg-sky-600 text-white" : "text-slate-400 bg-slate-950"}`}
          >
            ทั้งหมด
          </button>
          <button
            onClick={() => setFilterLocation("SAM_MO")}
            className={`px-3 py-1.5 rounded ${filterLocation === "SAM_MO" ? "bg-sky-600 text-white" : "text-slate-400 bg-slate-950"}`}
          >
            1. สฝอว.สม.
          </button>
          <button
            onClick={() => setFilterLocation("DON_MUEANG")}
            className={`px-3 py-1.5 rounded ${filterLocation === "DON_MUEANG" ? "bg-sky-600 text-white" : "text-slate-400 bg-slate-950"}`}
          >
            2. สฝอว.ดน.
          </button>
          <button
            onClick={() => setFilterLocation("OTHER")}
            className={`px-3 py-1.5 rounded ${filterLocation === "OTHER" ? "bg-sky-600 text-white" : "text-slate-400 bg-slate-950"}`}
          >
            3. ราชการอื่นๆ
          </button>
        </div>

        {isAdmin && (
          <button
            onClick={() => setIsModalOpen(true)}
            className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded text-xs font-semibold flex items-center gap-1"
          >
            <Plus className="w-3.5 h-3.5" /> สร้างผลัดราชการใหม่
          </button>
        )}
      </div>

      {/* Grid Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredMissions.map((m: any) => (
          <div key={m.id} className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-3 shadow-lg">
            <div className="flex justify-between items-start">
              <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-sky-950 border border-sky-800 text-sky-400">
                ผลัดที่ {m.batchNumber} / {m.year}
              </span>
              <span className="text-[11px] text-slate-400 font-mono">
                {m.location === "SAM_MO" ? "สฝอว.สม." : m.location === "DON_MUEANG" ? "สฝอว.ดน." : "ราชการอื่นๆ"}
              </span>
            </div>
            <div className="text-xs text-slate-300 font-mono">
              {new Date(m.startDate).toLocaleDateString("th-TH")} - {new Date(m.endDate).toLocaleDateString("th-TH")}
            </div>
            <div className="pt-2 border-t border-slate-800 space-y-1">
              <span className="text-[10px] text-slate-500 uppercase font-mono">รายชื่อกำลังพล ({m.staffs?.length || 0} นาย):</span>
              <div className="flex flex-wrap gap-1">
                {m.staffs?.map((s: any) => (
                  <span key={s.id} className="text-[10px] bg-slate-950 border border-slate-800 px-1.5 py-0.5 rounded text-slate-300">
                    {s.user.rank} {s.user.firstName}
                  </span>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ------------------------------------------------------------------------------------------------
// Tab 3: ระบบจัดสรรเวรอัตโนมัติ Fair-Share Engine
// ------------------------------------------------------------------------------------------------
function TabDispatcher({ dutyTypes, schedules, isAdmin, onRefresh }: any) {
  const [selectedDutyType, setSelectedDutyType] = useState("");
  const [targetDate, setTargetDate] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);

  const handleAutoDispatch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDutyType || !targetDate) return alert("กรุณาเลือกข้อมูลให้ครบถ้วน");

    setIsProcessing(true);
    const res = await fetch("/api/duty/dispatch", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ dutyTypeId: selectedDutyType, targetDate }),
    });

    setIsProcessing(false);
    if (res.ok) {
      alert("ประมวลผลจัดเวรสำเร็จ");
      onRefresh();
    } else {
      const err = await res.json();
      alert(err.error || "เกิดข้อผิดพลาด");
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
      <div className="lg:col-span-5 space-y-4">
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-xl space-y-4">
          <h2 className="text-xs font-bold uppercase text-white tracking-wider flex items-center gap-2">
            <Zap className="w-4 h-4 text-amber-400" /> แผงควบคุมการคำนวณเวร
          </h2>
          {isAdmin ? (
            <form onSubmit={handleAutoDispatch} className="space-y-3 text-xs">
              <div>
                <label className="text-slate-400 block mb-1">เลือกประเภทเวร</label>
                <select
                  value={selectedDutyType}
                  onChange={(e) => setSelectedDutyType(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-white"
                >
                  <option value="">-- เลือกประเภทเวร --</option>
                  {dutyTypes.map((dt: any) => (
                    <option key={dt.id} value={dt.id}>
                      {dt.name} (จริง {dt.mainCount} / สำรอง {dt.backupCount})
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-slate-400 block mb-1">วันที่ต้องการจัดเวร</label>
                <input
                  type="date"
                  value={targetDate}
                  onChange={(e) => setTargetDate(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-white font-mono"
                  required
                />
              </div>
              <button
                type="submit"
                disabled={isProcessing}
                className="w-full py-2.5 bg-gradient-to-r from-blue-600 to-sky-600 hover:from-blue-500 hover:to-sky-500 font-bold rounded text-white shadow-lg transition"
              >
                {isProcessing ? "กำลังประมวลผล Fair-Share..." : "⚡ ประมวลผลจัดเวรอัตโนมัติ"}
              </button>
            </form>
          ) : (
            <p className="text-xs text-slate-500">ฟังก์ชันนี้สงวนไว้สำหรับผู้ดูแลระบบ</p>
          )}
        </div>
      </div>

      <div className="lg:col-span-7 bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-xl space-y-3">
        <h2 className="text-xs font-bold uppercase text-white tracking-wider">รายการเวรที่จัดสรรแล้ว</h2>
        <div className="space-y-2 max-h-96 overflow-y-auto pr-1">
          {schedules.map((s: any) => (
            <div key={s.id} className="p-3 bg-slate-950 border border-slate-800 rounded-lg text-xs space-y-2">
              <div className="flex justify-between items-center">
                <span className="font-bold text-sky-400">{s.dutyType.name}</span>
                <span className="font-mono text-[10px] text-slate-400">{new Date(s.dutyDate).toLocaleDateString("th-TH")}</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {s.staffs.map((st: any) => (
                  <span
                    key={st.id}
                    className={`px-2 py-0.5 rounded text-[10px] font-mono border ${
                      st.isBackup
                        ? "bg-amber-950 text-amber-300 border-amber-800"
                        : "bg-blue-950 text-blue-300 border-blue-800"
                    }`}
                  >
                    {st.isBackup ? "[สำรอง]" : "[ตัวจริง]"} {st.user.rank} {st.user.firstName}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ------------------------------------------------------------------------------------------------
// Tab 4: ศูนย์สถิติกำลังพลประจำปี
// ------------------------------------------------------------------------------------------------
function TabAnalytics({ users, missions, leaves, schedules, year, setYear }: any) {
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("ALL");

  const filteredData = users.filter((u: any) => {
    const fullName = `${u.rank} ${u.firstName} ${u.lastName}`.toLowerCase();
    const matchSearch = fullName.includes(search.toLowerCase());
    const matchCat = categoryFilter === "ALL" || u.category === categoryFilter;
    return matchSearch && matchCat;
  });

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-900 border border-slate-800 p-3 rounded-xl">
        <div className="flex items-center gap-2 text-xs">
          <span className="text-slate-400">เลือกปี พ.ศ.:</span>
          <select
            value={year}
            onChange={(e) => setYear(parseInt(e.target.value))}
            className="bg-slate-950 border border-slate-800 rounded p-1.5 text-white font-mono"
          >
            {[2568, 2569, 2570].map((y) => (
              <option key={y} value={y}>{y}</option>
            ))}
          </select>
        </div>

        <div className="flex gap-2">
          <input
            type="text"
            placeholder="ค้นหาชื่อกำลังพล..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="bg-slate-950 border border-slate-800 rounded px-2.5 py-1 text-xs text-white"
          />
          <button
            onClick={() => window.print()}
            className="px-3 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs rounded border border-slate-700 flex items-center gap-1"
          >
            <Download className="w-3.5 h-3.5" /> พิมพ์รายงาน
          </button>
        </div>
      </div>

      {/* Master Data Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-x-auto shadow-xl">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-950 text-slate-400 font-mono uppercase text-[10px] border-b border-slate-800">
            <tr>
              <th className="p-3">ลำดับ</th>
              <th className="p-3">ยศ - ชื่อ สกุล</th>
              <th className="p-3">สายงาน</th>
              <th className="p-3 text-center">สฝอว.สม.</th>
              <th className="p-3 text-center">สฝอว.ดน.</th>
              <th className="p-3 text-center">ราชการอื่น</th>
              <th className="p-3 text-center">ลาสะสม (วัน)</th>
              <th className="p-3 text-center">เข้าเวรรวม (ครั้ง)</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800 text-slate-200">
            {filteredData.map((u: any, idx: number) => (
              <tr key={u.id} className="hover:bg-slate-950/40 transition">
                <td className="p-3 font-mono text-slate-500">{idx + 1}</td>
                <td className="p-3 font-semibold">{u.rank} {u.firstName} {u.lastName}</td>
                <td className="p-3 text-slate-400">{u.category === "COMMISSIONED" ? "สัญญาบัตร" : "ประทวน"}</td>
                <td className="p-3 text-center font-mono">0</td>
                <td className="p-3 text-center font-mono">0</td>
                <td className="p-3 text-center font-mono">0</td>
                <td className="p-3 text-center font-mono text-amber-400">0</td>
                <td className="p-3 text-center font-mono text-sky-400 font-bold">0</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ------------------------------------------------------------------------------------------------
// Tab เพิ่มเติม: อนุมัติผู้ใช้งานและกำหนด ยศ-ชื่อจริง (สำหรับ Admin)
// ------------------------------------------------------------------------------------------------
function TabAdminUsers({ users, onRefresh }: any) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [rank, setRank] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [category, setCategory] = useState("NON_COMMISSIONED");

  const handleApprove = async (id: string) => {
    if (!rank || !firstName || !lastName) {
      return alert("กรุณากรอก ยศ ชื่อ และนามสกุลจริงก่อนอนุมัติ");
    }
    await fetch(`/api/users/${id}/approve`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ rank, firstName, lastName, category }),
    });
    setEditingId(null);
    onRefresh();
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4 shadow-xl">
      <h2 className="text-xs font-bold uppercase text-white tracking-wider">
        รายชื่อและสถานะกำลังพลในระบบ
      </h2>
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-950 text-slate-400 font-mono text-[10px] border-b border-slate-800">
            <tr>
              <th className="p-3">อีเมล Google</th>
              <th className="p-3">ยศ - ชื่อ สกุลจริง</th>
              <th className="p-3">ชั้นยศ</th>
              <th className="p-3">สถานะ</th>
              <th className="p-3 text-center">จัดการ</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800 text-slate-200">
            {users.map((u: any) => (
              <tr key={u.id}>
                <td className="p-3 font-mono text-slate-400">{u.email}</td>
                <td className="p-3 font-semibold">
                  {editingId === u.id ? (
                    <div className="flex gap-1">
                      <input
                        type="text"
                        placeholder="ยศ"
                        value={rank}
                        onChange={(e) => setRank(e.target.value)}
                        className="w-16 bg-slate-950 border border-slate-700 p-1 rounded"
                      />
                      <input
                        type="text"
                        placeholder="ชื่อ"
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                        className="w-24 bg-slate-950 border border-slate-700 p-1 rounded"
                      />
                      <input
                        type="text"
                        placeholder="สกุล"
                        value={lastName}
                        onChange={(e) => setLastName(e.target.value)}
                        className="w-24 bg-slate-950 border border-slate-700 p-1 rounded"
                      />
                    </div>
                  ) : (
                    `${u.rank || "-"} ${u.firstName || "-"} ${u.lastName || ""}`
                  )}
                </td>
                <td className="p-3">
                  {editingId === u.id ? (
                    <select
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      className="bg-slate-950 border border-slate-700 p-1 rounded"
                    >
                      <option value="NON_COMMISSIONED">ประทวน</option>
                      <option value="COMMISSIONED">สัญญาบัตร</option>
                    </select>
                  ) : u.category === "COMMISSIONED" ? (
                    "สัญญาบัตร"
                  ) : (
                    "ประทวน"
                  )}
                </td>
                <td className="p-3">
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-mono ${
                      u.status === "ACTIVE"
                        ? "bg-emerald-950 text-emerald-400 border border-emerald-800"
                        : "bg-amber-950 text-amber-400 border border-amber-800"
                    }`}
                  >
                    {u.status}
                  </span>
                </td>
                <td className="p-3 text-center">
                  {editingId === u.id ? (
                    <button
                      onClick={() => handleApprove(u.id)}
                      className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded text-[11px]"
                    >
                      บันทึก & อนุมัติ
                    </button>
                  ) : (
                    <button
                      onClick={() => {
                        setEditingId(u.id);
                        setRank(u.rank || "");
                        setFirstName(u.firstName || "");
                        setLastName(u.lastName || "");
                        setCategory(u.category || "NON_COMMISSIONED");
                      }}
                      className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded text-[11px]"
                    >
                      แก้ไข/อนุมัติ
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}