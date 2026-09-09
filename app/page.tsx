"use client";

import { useState, useEffect } from "react";
import {
  Calendar as CalendarIcon,
  Plane,
  Zap,
  BarChart3,
  Users,
  Plus,
  Check,
  X,
  ChevronLeft,
  ChevronRight,
  Clock,
  User as UserIcon,
  Download,
  Shield,
  Layers,
} from "lucide-react";

export default function AdministrativeDashboard() {
  const [currentTab, setCurrentTab] = useState<
    "CALENDAR" | "DEPLOYMENT" | "DISPATCHER" | "ANALYTICS" | "PERSONNEL"
  >("CALENDAR");

  // Datasets
  const [users, setUsers] = useState<any[]>([]);
  const [leaves, setLeaves] = useState<any[]>([]);
  const [missions, setMissions] = useState<any[]>([]);
  const [dutyTypes, setDutyTypes] = useState<any[]>([]);
  const [dutySchedules, setDutySchedules] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const refreshAllData = async () => {
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
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshAllData();
  }, []);

  return (
    <div className="min-h-screen flex bg-slate-50 text-slate-800 font-sans antialiased">
      {/* 1. Sidebar ด้านซ้าย สีน้ำเงินกรมท่า */}
      <aside className="w-64 bg-[#0a192f] text-slate-300 flex flex-col justify-between shrink-0 shadow-2xl border-r border-blue-950/40">
        <div>
          {/* Logo & หน่วยงาน */}
          <div className="p-5 border-b border-blue-900/40 flex items-center space-x-3">
            <div className="h-10 w-10 rounded-xl bg-blue-600 flex items-center justify-center text-white font-black text-sm shadow-md shadow-blue-500/30">
              กฝอ.
            </div>
            <div>
              <div className="font-bold text-white text-sm leading-snug tracking-wide">
                กองเฝ้าระวังทางอวกาศ
              </div>
              <div className="text-[10px] text-blue-300/80 font-mono tracking-wider">
                ระบบธุรการ & กำลังพล
              </div>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="p-3 space-y-1 text-xs font-medium">
            <button
              onClick={() => setCurrentTab("CALENDAR")}
              className={`w-full flex items-center gap-3 px-3.5 py-3 rounded-xl transition ${
                currentTab === "CALENDAR"
                  ? "bg-blue-600 text-white font-semibold shadow-lg shadow-blue-600/30"
                  : "text-slate-400 hover:bg-slate-800/60 hover:text-white"
              }`}
            >
              <CalendarIcon className="w-4 h-4" />
              <span>1. ปฏิทินและการลา</span>
            </button>

            <button
              onClick={() => setCurrentTab("DEPLOYMENT")}
              className={`w-full flex items-center gap-3 px-3.5 py-3 rounded-xl transition ${
                currentTab === "DEPLOYMENT"
                  ? "bg-blue-600 text-white font-semibold shadow-lg shadow-blue-600/30"
                  : "text-slate-400 hover:bg-slate-800/60 hover:text-white"
              }`}
            >
              <Plane className="w-4 h-4" />
              <span>2. ไปราชการประจำกอง</span>
            </button>

            <button
              onClick={() => setCurrentTab("DISPATCHER")}
              className={`w-full flex items-center gap-3 px-3.5 py-3 rounded-xl transition ${
                currentTab === "DISPATCHER"
                  ? "bg-blue-600 text-white font-semibold shadow-lg shadow-blue-600/30"
                  : "text-slate-400 hover:bg-slate-800/60 hover:text-white"
              }`}
            >
              <Zap className="w-4 h-4" />
              <span>3. จัดเวร/ผลัดอัตโนมัติ</span>
            </button>

            <button
              onClick={() => setCurrentTab("ANALYTICS")}
              className={`w-full flex items-center gap-3 px-3.5 py-3 rounded-xl transition ${
                currentTab === "ANALYTICS"
                  ? "bg-blue-600 text-white font-semibold shadow-lg shadow-blue-600/30"
                  : "text-slate-400 hover:bg-slate-800/60 hover:text-white"
              }`}
            >
              <BarChart3 className="w-4 h-4" />
              <span>4. สถิติ & Export รายงาน</span>
            </button>

            <button
              onClick={() => setCurrentTab("PERSONNEL")}
              className={`w-full flex items-center gap-3 px-3.5 py-3 rounded-xl transition mt-4 ${
                currentTab === "PERSONNEL"
                  ? "bg-sky-600 text-white font-semibold shadow-lg shadow-sky-600/30"
                  : "text-sky-300 hover:bg-slate-800/60"
              }`}
            >
              <Users className="w-4 h-4" />
              <span>ทำเนียบกำลังพล</span>
            </button>
          </nav>
        </div>

        {/* Footer Sidebar */}
        <div className="p-4 border-t border-blue-900/40 bg-[#061122]/60">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-xs text-slate-300 font-medium">เข้าถึงโหมดควบคุมส่วนกลาง</span>
          </div>
        </div>
      </aside>

      {/* 2. พื้นที่การทำงานหลัก สีขาว-เทาอ่อน */}
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        <header className="bg-white border-b border-slate-200 px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-xs font-semibold text-slate-700">
              ระบบงานธุรการ กองเฝ้าระวังทางอวกาศ (Space Surveillance Division)
            </span>
            <span className="text-slate-300">|</span>
            <span className="text-xs font-medium text-slate-500 font-mono">
              ปีงบประมาณ 2569
            </span>
          </div>
          <span className="text-xs font-semibold px-3 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-lg">
            ระบบออนไลน์ (พร้อมปฏิบัติการ)
          </span>
        </header>

        <main className="p-8 max-w-7xl w-full mx-auto space-y-6">
          {currentTab === "CALENDAR" && (
            <LightCalendarView
              leaves={leaves}
              duties={dutySchedules}
              users={users}
              onRefresh={refreshAllData}
            />
          )}

          {currentTab === "DEPLOYMENT" && (
            <LightDeploymentView
              missions={missions}
              users={users}
              onRefresh={refreshAllData}
            />
          )}

          {currentTab === "DISPATCHER" && (
            <LightDispatcherView
              dutyTypes={dutyTypes}
              schedules={dutySchedules}
              onRefresh={refreshAllData}
            />
          )}

          {currentTab === "ANALYTICS" && (
            <LightAnalyticsView
              users={users}
              missions={missions}
              leaves={leaves}
              schedules={dutySchedules}
            />
          )}

          {currentTab === "PERSONNEL" && (
            <LightPersonnelView users={users} onRefresh={refreshAllData} />
          )}
        </main>
      </div>
    </div>
  );
}

// ------------------------------------------------------------------------------------------------
// Tab 1: ปฏิทินและการลา
// ------------------------------------------------------------------------------------------------
function LightCalendarView({ leaves, duties, users, onRefresh }: any) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [isApplyModalOpen, setIsApplyModalOpen] = useState(false);

  // Form State
  const [selectedUserId, setSelectedUserId] = useState("");
  const [leaveType, setLeaveType] = useState("VACATION");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [reason, setReason] = useState("");

  const thaiMonths = [
    "มกราคม", "กุมภาพันธ์", "มีนาคม", "เมษายน", "พฤษภาคม", "มิถุนายน",
    "กรกฎาคม", "สิงหาคม", "กันยายน", "ตุลาคม", "พฤศจิกายน", "ธันวาคม"
  ];

  const currentYear = currentDate.getFullYear();
  const currentMonth = currentDate.getMonth();
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const startDayOfWeek = new Date(currentYear, currentMonth, 1).getDay();

  const handlePrevMonth = () => setCurrentDate(new Date(currentYear, currentMonth - 1, 1));
  const handleNextMonth = () => setCurrentDate(new Date(currentYear, currentMonth + 1, 1));

  const handleApply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUserId) return alert("กรุณาเลือกรายชื่อกำลังพล");
    const res = await fetch("/api/leaves", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId: selectedUserId, leaveType, startDate, endDate, reason }),
    });
    if (res.ok) {
      alert("บันทึกการลาสำเร็จ");
      setIsApplyModalOpen(false);
      setReason("");
      onRefresh();
    }
  };

  const targetDateStr = selectedDate.toISOString().split("T")[0];

  const activeLeavesForDay = leaves.filter((l: any) => {
    const s = new Date(l.startDate).toISOString().split("T")[0];
    const e = new Date(l.endDate).toISOString().split("T")[0];
    return targetDateStr >= s && targetDateStr <= e;
  });

  const activeDutiesForDay = duties.filter((d: any) => {
    const dutyDate = new Date(d.dutyDate).toISOString().split("T")[0];
    return dutyDate === targetDateStr;
  });

  const leaveTypeMap: Record<string, { label: string; badge: string }> = {
    VACATION: { label: "ลาพักผ่อน", badge: "bg-emerald-50 text-emerald-700 border-emerald-200" },
    SICK: { label: "ลาป่วย", badge: "bg-rose-50 text-rose-700 border-rose-200" },
    BUSINESS: { label: "ลากิจ", badge: "bg-amber-50 text-amber-700 border-amber-200" },
    OTHER: { label: "อื่นๆ", badge: "bg-slate-50 text-slate-700 border-slate-200" },
  };

  return (
    <div className="space-y-6">
      <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center space-x-4">
          <div className="h-12 w-12 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600">
            <CalendarIcon className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-900 tracking-tight">หน้า 1: ปฏิทินและคำขอลา</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              ตรวจสอบสถานะกำลังพลปฏิบัติหน้าที่ การลา และเวรผลัดประจำวัน
            </p>
          </div>
        </div>

        <button
          onClick={() => setIsApplyModalOpen(true)}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs rounded-xl transition shadow-md shadow-blue-600/20 flex items-center gap-1.5"
        >
          <Plus className="w-4 h-4" /> บันทึกการลา
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* ปฏิทินฝั่งซ้าย */}
        <div className="lg:col-span-8 bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <h3 className="text-base font-bold text-slate-900">
                {thaiMonths[currentMonth]} พ.ศ. {currentYear + 543}
              </h3>
              <div className="flex items-center border border-slate-200 rounded-lg overflow-hidden text-xs">
                <button onClick={handlePrevMonth} className="p-1.5 hover:bg-slate-50 text-slate-600">
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  onClick={() => {
                    const now = new Date();
                    setCurrentDate(now);
                    setSelectedDate(now);
                  }}
                  className="px-3 py-1 font-medium bg-slate-50 text-slate-700 hover:bg-slate-100"
                >
                  วันนี้
                </button>
                <button onClick={handleNextMonth} className="p-1.5 hover:bg-slate-50 text-slate-600">
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-7 gap-1 text-center text-xs font-semibold py-2 border-b border-slate-100">
            <span className="text-rose-500">อา.</span>
            <span className="text-slate-600">จ.</span>
            <span className="text-slate-600">อ.</span>
            <span className="text-slate-600">พ.</span>
            <span className="text-slate-600">พฤ.</span>
            <span className="text-slate-600">ศ.</span>
            <span className="text-blue-500">ส.</span>
          </div>

          <div className="grid grid-cols-7 gap-2">
            {Array.from({ length: startDayOfWeek }).map((_, i) => (
              <div key={`empty-${i}`} className="min-h-[96px] rounded-xl bg-slate-50/40 border border-transparent" />
            ))}

            {Array.from({ length: daysInMonth }).map((_, i) => {
              const dayNumber = i + 1;
              const cellDate = new Date(currentYear, currentMonth, dayNumber);
              const cellDateStr = cellDate.toISOString().split("T")[0];
              const isSelected = selectedDate.toDateString() === cellDate.toDateString();

              const dayLeaves = leaves.filter((l: any) => {
                const s = new Date(l.startDate).toISOString().split("T")[0];
                const e = new Date(l.endDate).toISOString().split("T")[0];
                return cellDateStr >= s && cellDateStr <= e;
              });

              const dayDuties = duties.filter((d: any) => {
                const dutyDate = new Date(d.dutyDate).toISOString().split("T")[0];
                return dutyDate === cellDateStr;
              });

              return (
                <div
                  key={`day-${dayNumber}`}
                  onClick={() => setSelectedDate(cellDate)}
                  className={`min-h-[96px] rounded-xl p-2 border transition flex flex-col justify-between cursor-pointer ${
                    isSelected
                      ? "bg-blue-50/40 border-blue-500 shadow-sm ring-1 ring-blue-500"
                      : "bg-white border-slate-200 hover:border-blue-300"
                  }`}
                >
                  <span className={`text-xs font-mono font-bold ${isSelected ? "text-blue-600" : "text-slate-700"}`}>
                    {dayNumber}
                  </span>

                  <div className="space-y-1 overflow-hidden">
                    {dayLeaves.slice(0, 2).map((l: any) => (
                      <div key={l.id} className="text-[10px] bg-amber-50 border border-amber-200 text-amber-800 px-1.5 py-0.5 rounded font-medium truncate">
                        ลา: {l.user?.rank} {l.user?.firstName}
                      </div>
                    ))}
                    {dayDuties.slice(0, 1).map((d: any) => (
                      <div key={d.id} className="text-[10px] bg-blue-50 border border-blue-200 text-blue-700 px-1.5 py-0.5 rounded font-medium truncate">
                        เวร: {d.dutyType.name}
                      </div>
                    ))}
                    {dayLeaves.length + dayDuties.length > 2 && (
                      <div className="text-[9px] text-slate-400 font-mono text-center">
                        +{dayLeaves.length + dayDuties.length - 2} รายการ
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* รายละเอียดประจำวันฝั่งขวา */}
        <div className="lg:col-span-4 bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900">รายละเอียดประจำวัน</h3>
              <p className="text-xs font-semibold text-blue-600 mt-0.5">
                {selectedDate.getDate()} {thaiMonths[selectedDate.getMonth()]} พ.ศ. {selectedDate.getFullYear() + 543}
              </p>
            </div>
            <button
              onClick={() => setIsApplyModalOpen(true)}
              className="px-3 py-1.5 bg-blue-50 text-blue-600 hover:bg-blue-100 border border-blue-200 rounded-lg text-xs font-semibold transition"
            >
              + บันทึกการลา
            </button>
          </div>

          {/* รายชื่อคนลา */}
          <div className="space-y-3">
            <span className="font-bold text-slate-700 text-xs flex items-center gap-1.5">
              <UserIcon className="w-3.5 h-3.5 text-amber-500" /> กำลังพลที่ลา ({activeLeavesForDay.length} นาย)
            </span>

            {activeLeavesForDay.length === 0 ? (
              <div className="p-4 bg-slate-50 border border-slate-100 rounded-xl text-center text-xs text-slate-400">
                ไม่มีกำลังพลลาในวันนี้
              </div>
            ) : (
              <div className="space-y-2.5 max-h-56 overflow-y-auto pr-1">
                {activeLeavesForDay.map((l: any) => {
                  const info = leaveTypeMap[l.leaveType] || leaveTypeMap.OTHER;
                  return (
                    <div key={l.id} className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/50 space-y-1.5 text-xs">
                      <div className="flex justify-between items-start">
                        <div className="font-bold text-slate-800">
                          {l.user?.rank} {l.user?.firstName} {l.user?.lastName}
                        </div>
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold border ${info.badge}`}>
                          {info.label}
                        </span>
                      </div>
                      {l.reason && <p className="text-[11px] text-slate-600">เหตุผล: {l.reason}</p>}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* รายชื่อเวร */}
          <div className="space-y-3 pt-2 border-t border-slate-100">
            <span className="font-bold text-slate-700 text-xs flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-blue-500" /> เวรผลัดประจำวัน ({activeDutiesForDay.length} รายการ)
            </span>

            {activeDutiesForDay.length === 0 ? (
              <div className="p-4 bg-slate-50 border border-slate-100 rounded-xl text-center text-xs text-slate-400">
                ไม่มีการจัดเวรในวันนี้
              </div>
            ) : (
              <div className="space-y-2.5 max-h-56 overflow-y-auto pr-1">
                {activeDutiesForDay.map((d: any) => (
                  <div key={d.id} className="p-3 rounded-xl border border-blue-100 bg-blue-50/40 space-y-1.5 text-xs">
                    <div className="font-bold text-blue-900">{d.dutyType.name}</div>
                    <div className="space-y-1">
                      {d.staffs.map((st: any) => (
                        <div key={st.id} className="flex justify-between items-center text-[11px]">
                          <span className="text-slate-700">
                            {st.user.rank} {st.user.firstName} {st.user.lastName}
                          </span>
                          <span
                            className={`px-1.5 py-0.5 rounded text-[9px] font-semibold font-mono ${
                              st.isBackup ? "bg-amber-100 text-amber-800" : "bg-blue-100 text-blue-800"
                            }`}
                          >
                            {st.isBackup ? "ตัวสำรอง" : "ตัวจริง"}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modal บันทึกการลา */}
      {isApplyModalOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-slate-200 max-w-md w-full p-6 space-y-4 shadow-2xl">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-slate-900">บันทึกการลากำลังพล</h3>
              <button onClick={() => setIsApplyModalOpen(false)}><X className="w-4 h-4 text-slate-400" /></button>
            </div>
            <form onSubmit={handleApply} className="space-y-3 text-xs">
              <div>
                <label className="text-slate-600 block mb-1 font-medium">เลือกกำลังพล</label>
                <select
                  value={selectedUserId}
                  onChange={(e) => setSelectedUserId(e.target.value)}
                  className="w-full border border-slate-300 rounded-lg p-2.5 text-slate-800"
                  required
                >
                  <option value="">-- เลือกกำลังพล --</option>
                  {users.map((u: any) => (
                    <option key={u.id} value={u.id}>
                      {u.rank} {u.firstName} {u.lastName} ({u.category === "COMMISSIONED" ? "สัญญาบัตร" : "ประทวน"})
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-slate-600 block mb-1 font-medium">ประเภทการลา</label>
                <select
                  value={leaveType}
                  onChange={(e) => setLeaveType(e.target.value)}
                  className="w-full border border-slate-300 rounded-lg p-2.5 text-slate-800"
                >
                  <option value="VACATION">ลาพักผ่อนประจำปี</option>
                  <option value="BUSINESS">ลากิจส่วนตัว</option>
                  <option value="SICK">ลาป่วย</option>
                  <option value="OTHER">อื่นๆ</option>
                </select>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-slate-600 block mb-1 font-medium">เริ่ม</label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full border border-slate-300 rounded-lg p-2 text-slate-800"
                    required
                  />
                </div>
                <div>
                  <label className="text-slate-600 block mb-1 font-medium">สิ้นสุด</label>
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full border border-slate-300 rounded-lg p-2 text-slate-800"
                    required
                  />
                </div>
              </div>
              <div>
                <label className="text-slate-600 block mb-1 font-medium">เหตุผลความจำเป็น</label>
                <textarea
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  rows={2}
                  className="w-full border border-slate-300 rounded-lg p-2 text-slate-800"
                  placeholder="ระบุเหตุผลประกอบการลา..."
                />
              </div>
              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsApplyModalOpen(false)}
                  className="px-4 py-2 border border-slate-300 rounded-lg text-slate-600"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white font-semibold rounded-lg shadow"
                >
                  บันทึก
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

// ------------------------------------------------------------------------------------------------
// Tab 2: ไปราชการประจำกอง
// ------------------------------------------------------------------------------------------------
function LightDeploymentView({ missions, users, onRefresh }: any) {
  const [filterLoc, setFilterLoc] = useState("ALL");
  const [isModalOpen, setIsModalOpen] = useState(false);

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
        batchNumber: parseInt(batchNumber, 10),
        year: parseInt(year, 10),
        startDate,
        endDate,
        staffIds: selectedStaffs,
      }),
    });
    setIsModalOpen(false);
    onRefresh();
  };

  const filtered = missions.filter((m: any) => filterLoc === "ALL" || m.location === filterLoc);

  return (
    <div className="space-y-6">
      <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900">หน้า 2: ทะเบียนไปราชการประจำกอง</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            สฝอว.สม., สฝอว.ดน. และราชการอื่นๆ ประจำปี พ.ศ. 2569
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex gap-1.5">
            {["ALL", "SAM_MO", "DON_MUEANG", "OTHER"].map((loc) => (
              <button
                key={loc}
                onClick={() => setFilterLoc(loc)}
                className={`px-3 py-1.5 text-xs font-semibold rounded-xl border transition ${
                  filterLoc === loc
                    ? "bg-blue-600 text-white border-blue-600 shadow-sm"
                    : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
                }`}
              >
                {loc === "ALL" ? "ทั้งหมด" : loc === "SAM_MO" ? "สฝอว.สม." : loc === "DON_MUEANG" ? "สฝอว.ดน." : "ราชการอื่น"}
              </button>
            ))}
          </div>
          <button
            onClick={() => setIsModalOpen(true)}
            className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-semibold flex items-center gap-1 shadow-sm"
          >
            <Plus className="w-3.5 h-3.5" /> เพิ่มผลัด
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {filtered.map((m: any) => (
          <div key={m.id} className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-3">
            <div className="flex justify-between items-start">
              <span className="px-2.5 py-1 text-xs font-bold font-mono bg-blue-50 text-blue-700 border border-blue-200 rounded-lg">
                ผลัดที่ {m.batchNumber} / {m.year}
              </span>
              <span className="text-xs font-semibold text-slate-500">
                {m.location === "SAM_MO" ? "สฝอว.สม." : m.location === "DON_MUEANG" ? "สฝอว.ดน." : "ราชการอื่น"}
              </span>
            </div>
            <div className="text-xs text-slate-600 font-mono">
              {new Date(m.startDate).toLocaleDateString("th-TH")} - {new Date(m.endDate).toLocaleDateString("th-TH")}
            </div>
            <div className="pt-2 border-t border-slate-100 space-y-1 text-xs">
              <span className="text-[10px] text-slate-400 font-medium uppercase">กำลังพลประจำผลัด:</span>
              <div className="flex flex-wrap gap-1">
                {m.staffs?.map((s: any) => (
                  <span key={s.id} className="px-2 py-0.5 bg-slate-100 text-slate-700 rounded text-[11px]">
                    {s.user?.rank} {s.user?.firstName}
                  </span>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-slate-200 max-w-md w-full p-6 space-y-4 shadow-2xl">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-slate-900">สร้างผลัดการไปราชการ</h3>
              <button onClick={() => setIsModalOpen(false)}><X className="w-4 h-4 text-slate-400" /></button>
            </div>
            <form onSubmit={handleCreate} className="space-y-3 text-xs">
              <div>
                <label className="text-slate-600 block mb-1">สถานที่ราชการ</label>
                <select
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="w-full border rounded-lg p-2 text-slate-800"
                >
                  <option value="SAM_MO">1. สฝอว.สม.</option>
                  <option value="DON_MUEANG">2. สฝอว.ดน.</option>
                  <option value="OTHER">3. ราชการอื่นๆ</option>
                </select>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-slate-600 block mb-1">ผลัดที่</label>
                  <input
                    type="number"
                    value={batchNumber}
                    onChange={(e) => setBatchNumber(e.target.value)}
                    className="w-full border rounded-lg p-2 text-slate-800"
                    required
                  />
                </div>
                <div>
                  <label className="text-slate-600 block mb-1">ปี พ.ศ.</label>
                  <input
                    type="number"
                    value={year}
                    onChange={(e) => setYear(e.target.value)}
                    className="w-full border rounded-lg p-2 text-slate-800"
                    required
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-slate-600 block mb-1">เริ่ม</label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full border rounded-lg p-2 text-slate-800"
                    required
                  />
                </div>
                <div>
                  <label className="text-slate-600 block mb-1">สิ้นสุด</label>
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full border rounded-lg p-2 text-slate-800"
                    required
                  />
                </div>
              </div>
              <div>
                <label className="text-slate-600 block mb-1">เลือกกำลังพล</label>
                <div className="max-h-32 overflow-y-auto border rounded-lg p-2 space-y-1">
                  {users.map((u: any) => (
                    <label key={u.id} className="flex items-center gap-2 cursor-pointer text-slate-700">
                      <input
                        type="checkbox"
                        checked={selectedStaffs.includes(u.id)}
                        onChange={(e) => {
                          if (e.target.checked) setSelectedStaffs([...selectedStaffs, u.id]);
                          else setSelectedStaffs(selectedStaffs.filter((id) => id !== u.id));
                        }}
                      />
                      <span>{u.rank} {u.firstName} {u.lastName}</span>
                    </label>
                  ))}
                </div>
              </div>
              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border rounded-lg text-slate-600"
                >
                  ยกเลิก
                </button>
                <button type="submit" className="px-4 py-2 bg-blue-600 text-white font-semibold rounded-lg">
                  บันทึก
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

// ------------------------------------------------------------------------------------------------
// Tab 3: จัดสรรเวรอัตโนมัติ
// ------------------------------------------------------------------------------------------------
function LightDispatcherView({ dutyTypes, schedules, onRefresh }: any) {
  const [selectedType, setSelectedType] = useState("");
  const [targetDate, setTargetDate] = useState("");
  const [loading, setLoading] = useState(false);

  const [isTypeModalOpen, setIsTypeModalOpen] = useState(false);
  const [typeName, setTypeName] = useState("");
  const [requiredType, setRequiredType] = useState<string>("");
  const [mainCount, setMainCount] = useState("1");
  const [backupCount, setBackupCount] = useState("1");

  const handleDispatch = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const res = await fetch("/api/duty/dispatch", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ dutyTypeId: selectedType, targetDate }),
    });
    setLoading(false);
    if (res.ok) {
      alert("จัดสรรเวรอัตโนมัติสำเร็จ");
      onRefresh();
    } else {
      const err = await res.json();
      alert(err.error || "เกิดข้อผิดพลาด");
    }
  };

  const handleCreateType = async (e: React.FormEvent) => {
    e.preventDefault();
    await fetch("/api/duty/types", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: typeName,
        requiredType: requiredType || null,
        mainCount,
        backupCount,
      }),
    });
    setIsTypeModalOpen(false);
    setTypeName("");
    onRefresh();
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
      <div className="lg:col-span-5 bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="text-sm font-bold text-slate-900">แผงควบคุมการคำนวณเวร</h2>
          <button
            onClick={() => setIsTypeModalOpen(true)}
            className="text-xs text-blue-600 hover:underline font-semibold"
          >
            + เพิ่มประเภทเวร
          </button>
        </div>
        <form onSubmit={handleDispatch} className="space-y-3 text-xs">
          <div>
            <label className="text-slate-600 block mb-1">เลือกประเภทเวร</label>
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="w-full border border-slate-300 rounded-lg p-2.5 text-slate-800"
              required
            >
              <option value="">-- เลือกประเภทเวร --</option>
              {dutyTypes.map((t: any) => (
                <option key={t.id} value={t.id}>
                  {t.name} (จริง {t.mainCount} / สำรอง {t.backupCount})
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-slate-600 block mb-1">ระบุวันที่</label>
            <input
              type="date"
              value={targetDate}
              onChange={(e) => setTargetDate(e.target.value)}
              className="w-full border border-slate-300 rounded-lg p-2 text-slate-800"
              required
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 bg-blue-600 hover:bg-blue-500 font-semibold text-white rounded-xl shadow transition"
          >
            {loading ? "กำลังคำนวณ..." : "⚡ จัดสรรเวรอัตโนมัติ"}
          </button>
        </form>
      </div>

      <div className="lg:col-span-7 bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm space-y-3">
        <h2 className="text-sm font-bold text-slate-900">รายการเวรที่จัดสรรแล้ว</h2>
        <div className="space-y-2 max-h-96 overflow-y-auto">
          {schedules.map((s: any) => (
            <div key={s.id} className="p-3.5 border border-slate-200 rounded-xl space-y-2 text-xs">
              <div className="flex justify-between items-center">
                <span className="font-bold text-blue-700">{s.dutyType.name}</span>
                <span className="font-mono text-slate-500">{new Date(s.dutyDate).toLocaleDateString("th-TH")}</span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {s.staffs.map((st: any) => (
                  <span
                    key={st.id}
                    className={`px-2 py-0.5 rounded text-[11px] font-medium ${
                      st.isBackup ? "bg-amber-50 text-amber-800 border border-amber-200" : "bg-blue-50 text-blue-800 border border-blue-200"
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

      {isTypeModalOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-slate-200 max-w-md w-full p-6 space-y-4 shadow-2xl">
            <div className="flex justify-between items-center border-b pb-3">
              <h3 className="text-base font-bold text-slate-900">สร้างประเภทเวรใหม่</h3>
              <button onClick={() => setIsTypeModalOpen(false)}><X className="w-4 h-4 text-slate-400" /></button>
            </div>
            <form onSubmit={handleCreateType} className="space-y-3 text-xs">
              <div>
                <label className="text-slate-600 block mb-1">ชื่อเวร</label>
                <input
                  type="text"
                  placeholder="เช่น เวรนำแถว, เวรบรรยายสรุป"
                  value={typeName}
                  onChange={(e) => setTypeName(e.target.value)}
                  className="w-full border rounded-lg p-2 text-slate-800"
                  required
                />
              </div>
              <div>
                <label className="text-slate-600 block mb-1">คุณสมบัติชั้นยศ</label>
                <select
                  value={requiredType}
                  onChange={(e) => setRequiredType(e.target.value)}
                  className="w-full border rounded-lg p-2 text-slate-800"
                >
                  <option value="">ทั้งหมด (ใครก็ได้)</option>
                  <option value="COMMISSIONED">เฉพาะสัญญาบัตร</option>
                  <option value="NON_COMMISSIONED">เฉพาะประทวน</option>
                </select>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-slate-600 block mb-1">ตัวจริง (นาย)</label>
                  <input
                    type="number"
                    value={mainCount}
                    onChange={(e) => setMainCount(e.target.value)}
                    className="w-full border rounded-lg p-2 text-slate-800"
                    required
                  />
                </div>
                <div>
                  <label className="text-slate-600 block mb-1">ตัวสำรอง (นาย)</label>
                  <input
                    type="number"
                    value={backupCount}
                    onChange={(e) => setBackupCount(e.target.value)}
                    className="w-full border rounded-lg p-2 text-slate-800"
                    required
                  />
                </div>
              </div>
              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsTypeModalOpen(false)}
                  className="px-4 py-2 border rounded-lg text-slate-600"
                >
                  ยกเลิก
                </button>
                <button type="submit" className="px-4 py-2 bg-blue-600 text-white font-semibold rounded-lg">
                  สร้างประเภทเวร
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

// ------------------------------------------------------------------------------------------------
// Tab 4: สถิติกำลังพล & Export
// ------------------------------------------------------------------------------------------------
function LightAnalyticsView({ users, missions, leaves, schedules }: any) {
  const [search, setSearch] = useState("");
  const filtered = users.filter((u: any) =>
    `${u.rank} ${u.firstName} ${u.lastName}`.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm space-y-4">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-slate-100 pb-4">
        <div>
          <h2 className="text-base font-bold text-slate-900">ศูนย์รวมสถิติกำลังพลประจำปี 2569</h2>
          <p className="text-xs text-slate-500">รายงานสรุปวันลา ราชการสนาม และการปฏิบัติหน้าที่เวร</p>
        </div>
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="ค้นหาชื่อกำลังพล..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="border border-slate-300 rounded-xl px-3 py-1.5 text-xs"
          />
          <button
            onClick={() => window.print()}
            className="px-3.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold rounded-xl flex items-center gap-1.5 shadow"
          >
            <Download className="w-3.5 h-3.5" /> พิมพ์รายงาน
          </button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
            <tr>
              <th className="p-3">ลำดับ</th>
              <th className="p-3">ยศ - ชื่อ สกุล</th>
              <th className="p-3">ชั้นยศ</th>
              <th className="p-3 text-center">สฝอว.สม.</th>
              <th className="p-3 text-center">สฝอว.ดน.</th>
              <th className="p-3 text-center">ลาพักผ่อน</th>
              <th className="p-3 text-center">ลาป่วย</th>
              <th className="p-3 text-center">เข้าเวรรวม</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filtered.map((u: any, idx: number) => {
              const depSM = missions.filter((m: any) => m.location === "SAM_MO" && m.staffs?.some((s: any) => s.userId === u.id)).length;
              const depDN = missions.filter((m: any) => m.location === "DON_MUEANG" && m.staffs?.some((s: any) => s.userId === u.id)).length;
              const leaveVac = leaves.filter((l: any) => l.userId === u.id && l.leaveType === "VACATION").length;
              const leaveSick = leaves.filter((l: any) => l.userId === u.id && l.leaveType === "SICK").length;
              const dutyCount = schedules.reduce((acc: number, cur: any) => acc + (cur.staffs?.filter((st: any) => st.userId === u.id).length || 0), 0);

              return (
                <tr key={u.id} className="hover:bg-slate-50/60">
                  <td className="p-3 font-mono text-slate-400">{idx + 1}</td>
                  <td className="p-3 font-semibold text-slate-800">{u.rank} {u.firstName} {u.lastName}</td>
                  <td className="p-3 text-slate-500">{u.category === "COMMISSIONED" ? "สัญญาบัตร" : "ประทวน"}</td>
                  <td className="p-3 text-center font-mono">{depSM}</td>
                  <td className="p-3 text-center font-mono">{depDN}</td>
                  <td className="p-3 text-center font-mono text-amber-600">{leaveVac}</td>
                  <td className="p-3 text-center font-mono text-rose-600">{leaveSick}</td>
                  <td className="p-3 text-center font-mono font-bold text-blue-600">{dutyCount}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ------------------------------------------------------------------------------------------------
// Tab 5: ทำเนียบกำลังพล (เพิ่ม/จัดการข้อมูลกำลังพลในกอง)
// ------------------------------------------------------------------------------------------------
function LightPersonnelView({ users, onRefresh }: any) {
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [rank, setRank] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [category, setCategory] = useState("NON_COMMISSIONED");

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch("/api/users", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ rank, firstName, lastName, category }),
    });
    if (res.ok) {
      alert("เพิ่มกำลังพลสำเร็จ");
      setIsAddOpen(false);
      setFirstName("");
      setLastName("");
      onRefresh();
    }
  };

  return (
    <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm space-y-4">
      <div className="flex justify-between items-center border-b border-slate-100 pb-4">
        <div>
          <h2 className="text-base font-bold text-slate-900">ทำเนียบกำลังพล กองเฝ้าระวังทางอวกาศ</h2>
          <p className="text-xs text-slate-500">รายชื่อกำลังพลทั้งหมดในฐานข้อมูลสำหรับจัดผลัดและเวร</p>
        </div>
        <button
          onClick={() => setIsAddOpen(true)}
          className="px-3.5 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold rounded-xl flex items-center gap-1 shadow-sm"
        >
          <Plus className="w-3.5 h-3.5" /> เพิ่มกำลังพล
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
            <tr>
              <th className="p-3">ลำดับ</th>
              <th className="p-3">ยศ - ชื่อ สกุล</th>
              <th className="p-3">ประเภทชั้นยศ</th>
              <th className="p-3">สถานะ</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {users.length === 0 ? (
              <tr>
                <td colSpan={4} className="text-center py-8 text-slate-400">
                  ยังไม่มีรายชื่อกำลังพล กดปุ่ม "+ เพิ่มกำลังพล" ด้านบนเพื่อเริ่มต้น
                </td>
              </tr>
            ) : (
              users.map((u: any, idx: number) => (
                <tr key={u.id} className="hover:bg-slate-50/60">
                  <td className="p-3 font-mono text-slate-400">{idx + 1}</td>
                  <td className="p-3 font-semibold text-slate-800">
                    {u.rank} {u.firstName} {u.lastName}
                  </td>
                  <td className="p-3">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-mono border ${
                        u.category === "COMMISSIONED"
                          ? "bg-purple-50 text-purple-700 border-purple-200"
                          : "bg-blue-50 text-blue-700 border-blue-200"
                      }`}
                    >
                      {u.category === "COMMISSIONED" ? "สัญญาบัตร" : "ประทวน"}
                    </span>
                  </td>
                  <td className="p-3">
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                      พร้อมปฏิบัติการ
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {isAddOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-slate-200 max-w-md w-full p-6 space-y-4 shadow-2xl">
            <div className="flex justify-between items-center border-b pb-3">
              <h3 className="text-base font-bold text-slate-900">เพิ่มรายชื่อกำลังพล</h3>
              <button onClick={() => setIsAddOpen(false)}><X className="w-4 h-4 text-slate-400" /></button>
            </div>
            <form onSubmit={handleAdd} className="space-y-3 text-xs">
              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="text-slate-600 block mb-1">ยศ</label>
                  <input
                    placeholder="เช่น จ.อ., น.ต."
                    value={rank}
                    onChange={(e) => setRank(e.target.value)}
                    className="w-full border rounded-lg p-2"
                    required
                  />
                </div>
                <div>
                  <label className="text-slate-600 block mb-1">ชื่อ</label>
                  <input
                    placeholder="ชื่อจริง"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    className="w-full border rounded-lg p-2"
                    required
                  />
                </div>
                <div>
                  <label className="text-slate-600 block mb-1">นามสกุล</label>
                  <input
                    placeholder="นามสกุล"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    className="w-full border rounded-lg p-2"
                    required
                  />
                </div>
              </div>
              <div>
                <label className="text-slate-600 block mb-1">ประเภทชั้นยศ</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full border rounded-lg p-2 text-slate-800"
                >
                  <option value="NON_COMMISSIONED">นายทหารประทวน</option>
                  <option value="COMMISSIONED">นายทหารสัญญาบัตร</option>
                </select>
              </div>
              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddOpen(false)}
                  className="px-4 py-2 border rounded-lg text-slate-600"
                >
                  ยกเลิก
                </button>
                <button type="submit" className="px-4 py-2 bg-blue-600 text-white font-semibold rounded-lg">
                  บันทึกกำลังพล
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}