"use client";

import { useSession } from "next-auth/react";
import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import {
  ChevronLeft,
  ChevronRight,
  Calendar as CalendarIcon,
  CheckCircle2,
  XCircle,
  Clock,
  ShieldAlert,
  PlaneTakeoff,
  Users,
  Send,
  X,
} from "lucide-react";

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

interface DeploymentItem {
  id: string;
  location: "SAMUT_SONGKRAM" | "DON_MUEANG" | "OTHER";
  batchNumber: number;
  startDate: string;
  endDate: string;
  members: { user: { officialName: string | null; name: string | null } }[];
}

interface DutyItem {
  id: string;
  dutyDate: string;
  role: "PRIMARY" | "RESERVE";
  dutyCategory: { name: string };
  user: { officialName: string | null; name: string | null };
}

export default function TacticalCalendarPage() {
  const { data: session } = useSession();
  const currentUser = session?.user as any;
  const isAdmin = currentUser?.role === "ADMIN" || currentUser?.role === "SUPER_ADMIN";

  const [currentDate, setCurrentDate] = useState(new Date());
  const [leaves, setLeaves] = useState<LeaveItem[]>([]);
  const [deployments, setDeployments] = useState<DeploymentItem[]>([]);
  const [duties, setDuties] = useState<DutyItem[]>([]);
  const [selectedDay, setSelectedDay] = useState<Date | null>(null);

  // Form State
  const [leaveType, setLeaveType] = useState("ANNUAL");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [reason, setReason] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const fetchAllData = async () => {
    try {
      const [lRes, dRes] = await Promise.all([
        fetch("/api/leaves"),
        fetch("/api/deployments"),
      ]);
      if (lRes.ok) setLeaves(await lRes.json());
      if (dRes.ok) setDeployments(await dRes.json());
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchAllData();
  }, []);

  // คำนวณวันในเดือนสำหรับ Grid
  const { daysInMonth, startDayOffset, monthLabel, yearLabel } = useMemo(() => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const monthsTh = [
      "มกราคม", "กุมภาพันธ์", "มีนาคม", "เมษายน", "พฤษภาคม", "มิถุนายน",
      "กรกฎาคม", "สิงหาคม", "กันยายน", "ตุลาคม", "พฤศจิกายน", "ธันวาคม"
    ];
    return {
      daysInMonth: lastDay.getDate(),
      startDayOffset: firstDay.getDay(),
      monthLabel: monthsTh[month],
      yearLabel: year + 543,
    };
  }, [currentDate]);

  const handlePrevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };
  const handleNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  // ตรวจสอบภารกิจในแต่ละวัน
  const getEventsForDay = (day: number) => {
    const target = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
    target.setHours(0, 0, 0, 0);

    const dayLeaves = leaves.filter((l) => {
      if (l.status !== "APPROVED") return false;
      const s = new Date(l.startDate); s.setHours(0, 0, 0, 0);
      const e = new Date(l.endDate); e.setHours(23, 59, 59, 999);
      return target >= s && target <= e;
    });

    const dayDeps = deployments.filter((d) => {
      const s = new Date(d.startDate); s.setHours(0, 0, 0, 0);
      const e = new Date(d.endDate); e.setHours(23, 59, 59, 999);
      return target >= s && target <= e;
    });

    return { dayLeaves, dayDeps };
  };

  const handleCreateLeave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!startDate || !endDate) return alert("กรุณาเลือกช่วงเวลา");
    setSubmitting(true);
    try {
      const res = await fetch("/api/leaves", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: leaveType, startDate, endDate, reason }),
      });
      if (res.ok) {
        alert(isAdmin ? "อนุมัติบันทึกเรียบร้อย" : "ส่งคำขอลาสำเร็จ รออนุมัติ");
        setReason("");
        setStartDate("");
        setEndDate("");
        fetchAllData();
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleQuickApprove = async (id: string, status: "APPROVED" | "REJECTED") => {
    const res = await fetch("/api/leaves", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, status }),
    });
    if (res.ok) fetchAllData();
  };

  const pendingLeaves = leaves.filter((l) => l.status === "PENDING");

  const leaveTypeTranslate: Record<string, string> = {
    ANNUAL: "ลาพักผ่อน",
    SICK: "ลาป่วย",
    BUSINESS: "ลากิจ",
    OFFICIAL_DUTY: "ปฏิบัติราชการ",
    OTHER: "อื่นๆ",
  };

  return (
    <div className="min-h-screen bg-[#020617] text-slate-100 p-4 md:p-8 font-sans">
      {/* Top Header - Mission Control Status */}
      <div className="max-w-7xl mx-auto space-y-6">
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800/80 pb-5">
          <div className="flex items-center space-x-3">
            <div className="h-10 w-10 rounded-lg bg-sky-950/80 border border-sky-500/30 flex items-center justify-center text-sky-400 shadow-[0_0_15px_rgba(56,189,248,0.2)]">
              <CalendarIcon className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono font-bold tracking-widest text-sky-400 uppercase bg-sky-950/60 px-2 py-0.5 rounded border border-sky-800/50">
                  SYSTEM MODULE 01
                </span>
                <span className="text-[10px] text-slate-500 font-mono">TACTICAL CALENDAR & LEAVE TRACKER</span>
              </div>
              <h1 className="text-xl md:text-2xl font-bold tracking-tight text-white mt-0.5">
                ปฏิทินปฏิบัติงาน & ระบบคำขอลา
              </h1>
            </div>
          </div>
          <Link
            href="/"
            className="px-4 py-2 text-xs font-semibold bg-[#0f172a] hover:bg-slate-800 text-slate-300 border border-slate-800 rounded-lg transition self-start md:self-auto flex items-center gap-2"
          >
            ← กลับศูนย์บัญชาการ
          </Link>
        </header>

        {/* Tactical Layout: 2 Columns */}
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
          {/* ฝั่งซ้าย: Monthly Interactive Grid (8 cols) */}
          <div className="xl:col-span-8 bg-[#0f172a] border border-[#1e293b] rounded-xl p-5 shadow-2xl space-y-4">
            {/* Header เดือน และปุ่มเลื่อน */}
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div>
                <h2 className="text-lg font-bold text-white tracking-wide">
                  {monthLabel} <span className="text-sky-400 font-mono">พ.ศ. {yearLabel}</span>
                </h2>
                <div className="flex items-center gap-3 text-[11px] text-slate-400 mt-1">
                  <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-emerald-500" /> ลาอนุมัติ</span>
                  <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-sky-500" /> ผลัดราชการ</span>
                  <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-purple-500" /> เวรประจำวัน</span>
                </div>
              </div>

              <div className="flex items-center space-x-1.5 bg-[#020617] p-1 rounded-lg border border-slate-800">
                <button
                  onClick={handlePrevMonth}
                  className="p-1.5 hover:bg-slate-800 rounded text-slate-400 hover:text-white transition"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setCurrentDate(new Date())}
                  className="px-2.5 py-1 text-[11px] font-mono font-semibold text-slate-300 hover:text-white"
                >
                  วันนี้
                </button>
                <button
                  onClick={handleNextMonth}
                  className="p-1.5 hover:bg-slate-800 rounded text-slate-400 hover:text-white transition"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* ตารางวัน 7 วัน */}
            <div className="grid grid-cols-7 gap-1 text-center font-mono text-[11px] font-semibold text-slate-400 py-1 border-b border-slate-800/60">
              <span className="text-rose-400">อา.</span>
              <span>จ.</span>
              <span>อ.</span>
              <span>พ.</span>
              <span>พฤ.</span>
              <span>ศ.</span>
              <span className="text-sky-400">ส.</span>
            </div>

            {/* Grid วันที่ */}
            <div className="grid grid-cols-7 gap-1.5">
              {/* ช่องว่างต้นเดือน */}
              {Array.from({ length: startDayOffset }).map((_, i) => (
                <div key={`empty-${i}`} className="min-h-[90px] rounded-lg bg-slate-950/30 border border-transparent" />
              ))}

              {/* วันในเดือน */}
              {Array.from({ length: daysInMonth }).map((_, i) => {
                const day = i + 1;
                const { dayLeaves, dayDeps } = getEventsForDay(day);
                const isToday =
                  new Date().getDate() === day &&
                  new Date().getMonth() === currentDate.getMonth() &&
                  new Date().getFullYear() === currentDate.getFullYear();

                return (
                  <div
                    key={`day-${day}`}
                    onClick={() =>
                      setSelectedDay(new Date(currentDate.getFullYear(), currentDate.getMonth(), day))
                    }
                    className={`min-h-[90px] p-2 rounded-lg border transition cursor-pointer flex flex-col justify-between group ${
                      isToday
                        ? "bg-sky-950/20 border-sky-500/50 shadow-[inset_0_0_12px_rgba(56,189,248,0.15)]"
                        : "bg-[#020617]/70 border-[#1e293b] hover:border-sky-500/40 hover:bg-[#020617]"
                    }`}
                  >
                    <div className="flex justify-between items-start">
                      <span
                        className={`text-xs font-mono font-bold ${
                          isToday ? "text-sky-400" : "text-slate-400 group-hover:text-slate-200"
                        }`}
                      >
                        {day}
                      </span>
                      {(dayLeaves.length > 0 || dayDeps.length > 0) && (
                        <span className="w-1.5 h-1.5 rounded-full bg-sky-400 animate-pulse" />
                      )}
                    </div>

                    {/* Pills รายการ */}
                    <div className="space-y-1 mt-1 overflow-hidden">
                      {dayLeaves.slice(0, 2).map((l) => (
                        <div
                          key={l.id}
                          className="px-1.5 py-0.5 rounded text-[9px] bg-emerald-950/80 border border-emerald-700/60 text-emerald-300 truncate font-mono"
                        >
                          ลา: {l.user.officialName || l.user.name}
                        </div>
                      ))}
                      {dayDeps.slice(0, 1).map((d) => (
                        <div
                          key={d.id}
                          className="px-1.5 py-0.5 rounded text-[9px] bg-sky-950/80 border border-sky-700/60 text-sky-300 truncate font-mono"
                        >
                          ราชการผลัด {d.batchNumber}
                        </div>
                      ))}
                      {dayLeaves.length + dayDeps.length > 2 && (
                        <div className="text-[8px] text-slate-500 font-mono text-center">
                          +{dayLeaves.length + dayDeps.length - 2} รายการ
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* ฝั่งขวา: คำขอลา & กล่องอนุมัติ (4 cols) */}
          <div className="xl:col-span-4 space-y-6">
            {/* ฟอร์มยื่นคำขอลา */}
            <div className="bg-[#0f172a] border border-[#1e293b] rounded-xl p-5 shadow-xl space-y-4">
              <div className="flex items-center space-x-2 border-b border-slate-800 pb-3">
                <Send className="w-4 h-4 text-sky-400" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-white">
                  ยื่นคำขอลาประจำบุคคล
                </h3>
              </div>

              <form onSubmit={handleCreateLeave} className="space-y-3 text-xs">
                <div>
                  <label className="block text-slate-400 mb-1">ประเภทการลา</label>
                  <select
                    value={leaveType}
                    onChange={(e) => setLeaveType(e.target.value)}
                    className="w-full bg-[#020617] border border-[#1e293b] rounded-lg p-2.5 text-slate-200 focus:outline-none focus:border-sky-500"
                  >
                    <option value="ANNUAL">ลาพักผ่อนประจำปี</option>
                    <option value="SICK">ลาป่วย</option>
                    <option value="BUSINESS">ลากิจส่วนตัว</option>
                    <option value="OFFICIAL_DUTY">ไปราชการ/ปฏิบัติภารกิจพิเศษ</option>
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-slate-400 mb-1">วันที่เริ่มต้น</label>
                    <input
                      type="date"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      required
                      className="w-full bg-[#020617] border border-[#1e293b] rounded-lg p-2 text-slate-200 focus:outline-none focus:border-sky-500 font-mono text-[11px]"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-400 mb-1">วันที่สิ้นสุด</label>
                    <input
                      type="date"
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                      required
                      className="w-full bg-[#020617] border border-[#1e293b] rounded-lg p-2 text-slate-200 focus:outline-none focus:border-sky-500 font-mono text-[11px]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-slate-400 mb-1">เหตุผล / บันทึกชี้แจง</label>
                  <textarea
                    rows={2}
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    placeholder="ระบุวัตถุประสงค์หรือความจำเป็น..."
                    className="w-full bg-[#020617] border border-[#1e293b] rounded-lg p-2 text-slate-200 focus:outline-none focus:border-sky-500"
                  />
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-lg shadow-[0_0_15px_rgba(37,99,235,0.3)] transition"
                >
                  {submitting ? "กำลังส่งบันทึก..." : "ส่งใบลาเข้าระบบ"}
                </button>
              </form>
            </div>

            {/* กล่องอนุมัติสำหรับ Admin */}
            {isAdmin && (
              <div className="bg-[#0f172a] border border-[#1e293b] rounded-xl p-5 shadow-xl space-y-4">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <div className="flex items-center space-x-2">
                    <ShieldAlert className="w-4 h-4 text-amber-500" />
                    <h3 className="text-xs font-bold uppercase tracking-wider text-white">
                      กล่องอนุมัติคำขอลา (ADMIN)
                    </h3>
                  </div>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-amber-500/10 text-amber-400 border border-amber-500/30">
                    {pendingLeaves.length} รายการรอ
                  </span>
                </div>

                {pendingLeaves.length === 0 ? (
                  <div className="text-center py-6 text-xs text-slate-500 font-mono">
                    ไม่มีคำขอรอการอนุมัติ
                  </div>
                ) : (
                  <div className="space-y-2.5 max-h-72 overflow-y-auto pr-1">
                    {pendingLeaves.map((item) => (
                      <div
                        key={item.id}
                        className="p-3 bg-[#020617] border border-slate-800 rounded-lg text-xs space-y-2"
                      >
                        <div className="flex justify-between items-start">
                          <div>
                            <div className="font-bold text-slate-100">
                              {item.user.officialName || item.user.name}
                            </div>
                            <div className="text-[10px] font-mono text-amber-400">
                              {leaveTypeTranslate[item.type]}
                            </div>
                          </div>
                          <div className="flex items-center space-x-1">
                            <button
                              onClick={() => handleQuickApprove(item.id, "APPROVED")}
                              className="p-1.5 bg-emerald-950/80 hover:bg-emerald-900 border border-emerald-600 text-emerald-300 rounded transition"
                              title="อนุมัติ"
                            >
                              <CheckCircle2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleQuickApprove(item.id, "REJECTED")}
                              className="p-1.5 bg-rose-950/80 hover:bg-rose-900 border border-rose-600 text-rose-300 rounded transition"
                              title="ปฏิเสธ"
                            >
                              <XCircle className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                        <div className="text-[10px] font-mono text-slate-400">
                          {new Date(item.startDate).toLocaleDateString("th-TH")} -{" "}
                          {new Date(item.endDate).toLocaleDateString("th-TH")}
                          {item.reason && <p className="text-slate-500 mt-1 italic">"{item.reason}"</p>}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Modal แสดงรายละเอียดเมื่อคลิกวันที่ */}
        {selectedDay && (
          <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-[#0f172a] border border-[#1e293b] rounded-2xl w-full max-w-lg p-6 shadow-2xl space-y-5 animate-in fade-in zoom-in-95 duration-150">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="flex items-center space-x-2">
                  <Clock className="w-4 h-4 text-sky-400" />
                  <h3 className="text-sm font-bold text-white font-mono">
                    ภารกิจประจำวัน: {selectedDay.toLocaleDateString("th-TH", { dateStyle: "long" })}
                  </h3>
                </div>
                <button
                  onClick={() => setSelectedDay(null)}
                  className="p-1 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-4 text-xs">
                {/* กำลังพลที่ลา */}
                <div>
                  <h4 className="text-[11px] font-mono font-bold text-emerald-400 uppercase mb-2 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-500" /> กำลังพลลาปฏิบัติงาน
                  </h4>
                  {leaves.filter((l) => {
                    if (l.status !== "APPROVED") return false;
                    const s = new Date(l.startDate); s.setHours(0,0,0,0);
                    const e = new Date(l.endDate); e.setHours(23,59,59,999);
                    return selectedDay >= s && selectedDay <= e;
                  }).length === 0 ? (
                    <p className="text-slate-500 font-mono text-[11px]">ไม่มีกำลังพลลาในวันนี้</p>
                  ) : (
                    <div className="space-y-1.5">
                      {leaves.filter((l) => {
                        if (l.status !== "APPROVED") return false;
                        const s = new Date(l.startDate); s.setHours(0,0,0,0);
                        const e = new Date(l.endDate); e.setHours(23,59,59,999);
                        return selectedDay >= s && selectedDay <= e;
                      }).map((l) => (
                        <div key={l.id} className="p-2.5 bg-[#020617] border border-slate-800 rounded-lg flex justify-between">
                          <span className="font-semibold text-slate-200">{l.user.officialName || l.user.name}</span>
                          <span className="text-emerald-400 font-mono text-[11px]">{leaveTypeTranslate[l.type]}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* กำลังพลที่ไปราชการ */}
                <div>
                  <h4 className="text-[11px] font-mono font-bold text-sky-400 uppercase mb-2 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-sky-500" /> ติดผลัดไปราชการประจำกอง
                  </h4>
                  {deployments.filter((d) => {
                    const s = new Date(d.startDate); s.setHours(0,0,0,0);
                    const e = new Date(d.endDate); e.setHours(23,59,59,999);
                    return selectedDay >= s && selectedDay <= e;
                  }).length === 0 ? (
                    <p className="text-slate-500 font-mono text-[11px]">ไม่มีกำลังพลไปราชการสนามในวันนี้</p>
                  ) : (
                    <div className="space-y-1.5">
                      {deployments.filter((d) => {
                        const s = new Date(d.startDate); s.setHours(0,0,0,0);
                        const e = new Date(d.endDate); e.setHours(23,59,59,999);
                        return selectedDay >= s && selectedDay <= e;
                      }).map((d) => (
                        <div key={d.id} className="p-2.5 bg-[#020617] border border-slate-800 rounded-lg space-y-1">
                          <div className="font-semibold text-sky-300">ผลัดที่ {d.batchNumber} ({d.location})</div>
                          <div className="text-slate-400 text-[11px]">
                            {d.members.map((m) => m.user.officialName || m.user.name).join(", ")}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div className="pt-3 border-t border-slate-800 text-right">
                <button
                  onClick={() => setSelectedDay(null)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-lg transition"
                >
                  ปิดหน้าต่าง
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}