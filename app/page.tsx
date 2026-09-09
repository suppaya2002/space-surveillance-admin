"use client";

import { useSession, signOut, signIn } from "next-auth/react";
import { useState, useEffect } from "react";
import {
  Calendar as CalendarIcon,
  Plane,
  Zap,
  BarChart3,
  UserCheck,
  LogOut,
  Plus,
  Check,
  X,
  ChevronLeft,
  ChevronRight,
  Clock,
  User as UserIcon,
  Download,
  AlertCircle,
  Shield,
} from "lucide-react";

export default function SpaceSurveillanceDashboard() {
  const { data: session, status } = useSession();
  const [currentTab, setCurrentTab] = useState<
    "CALENDAR" | "DEPLOYMENT" | "DISPATCHER" | "ANALYTICS" | "ADMIN_USERS"
  >("CALENDAR");

  const [users, setUsers] = useState<any[]>([]);
  const [leaves, setLeaves] = useState<any[]>([]);
  const [missions, setMissions] = useState<any[]>([]);
  const [dutyTypes, setDutyTypes] = useState<any[]>([]);
  const [dutySchedules, setDutySchedules] = useState<any[]>([]);

  const currentUser = session?.user as any;
  const isPending = currentUser?.status === "PENDING";
  const isAdmin = currentUser?.role === "ADMIN" || currentUser?.role === "SUPER_ADMIN";
  const isSuperAdmin = currentUser?.role === "SUPER_ADMIN";

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
      <div className="min-h-screen bg-slate-900 flex items-center justify-center text-blue-400 font-mono text-sm">
        กำลังโหลดระบบธุรการ กองเฝ้าระวังทางอวกาศ...
      </div>
    );
  }

  // หน้าต่างเมื่อยังไม่ได้ล็อกอิน
  if (!session) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-2xl p-8 text-center space-y-5 shadow-2xl">
          <div className="h-14 w-14 rounded-2xl bg-blue-600 text-white flex items-center justify-center font-bold text-xl mx-auto shadow-lg shadow-blue-500/30">
            กฝอ.
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-800">กองเฝ้าระวังทางอวกาศ</h1>
            <p className="text-xs text-slate-500 mt-1">ระบบบริหารงานธุรการ กำลังพล และการจัดเวร</p>
          </div>
          <button
            onClick={() => signIn("google")}
            className="w-full py-3 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-xl text-xs transition shadow-md shadow-blue-600/30"
          >
            เข้าสู่ระบบด้วย Google Account
          </button>
        </div>
      </div>
    );
  }

  // หน้าต่างรอแอดมินอนุมัติสิทธิ์
  if (isPending) {
    return (
      <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white border border-slate-200 rounded-2xl p-8 text-center space-y-4 shadow-xl">
          <div className="w-14 h-14 rounded-full bg-amber-50 border border-amber-200 flex items-center justify-center mx-auto text-amber-500">
            <AlertCircle className="w-7 h-7" />
          </div>
          <h2 className="text-xl font-bold text-slate-800">รอผู้ดูแลระบบตรวจสอบ</h2>
          <p className="text-sm text-slate-500 leading-relaxed">
            บัญชี Google ({currentUser?.email}) บันทึกข้อมูลแล้ว อยู่ระหว่างรอผู้ดูแลระบบระบุ ยศ-ชื่อ-นามสกุลจริง และเปิดสิทธิ์การใช้งาน
          </p>
          <button
            onClick={() => signOut()}
            className="px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold rounded-xl transition shadow"
          >
            ออกจากระบบ
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex bg-slate-50 text-slate-800 font-sans antialiased">
      {/* 1. Sidebar ด้านซ้าย: สีกรมท่าทางการ */}
      <aside className="w-64 bg-[#0a192f] text-slate-300 flex flex-col justify-between shrink-0 shadow-2xl border-r border-blue-950/40">
        <div>
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

          <nav className="p-3 space-y-1 text-xs font-medium">
            <button
              onClick={() => setCurrentTab("CALENDAR")}
              className={`w-full flex items-center justify-between px-3.5 py-3 rounded-xl transition ${
                currentTab === "CALENDAR"
                  ? "bg-blue-600 text-white font-semibold shadow-lg shadow-blue-600/30"
                  : "text-slate-400 hover:bg-slate-800/60 hover:text-white"
              }`}
            >
              <div className="flex items-center gap-3">
                <CalendarIcon className="w-4 h-4" />
                <span>1. ปฏิทินและคำขอลา</span>
              </div>
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

            {isAdmin && (
              <button
                onClick={() => setCurrentTab("ADMIN_USERS")}
                className={`w-full flex items-center gap-3 px-3.5 py-3 rounded-xl transition mt-4 ${
                  currentTab === "ADMIN_USERS"
                    ? "bg-amber-600 text-white font-semibold shadow-lg shadow-amber-600/30"
                    : "text-amber-300 hover:bg-slate-800/60"
                }`}
              >
                <UserCheck className="w-4 h-4" />
                <span>กำลังพล & อนุมัติสิทธิ์</span>
              </button>
            )}
          </nav>
        </div>

        <div className="p-4 border-t border-blue-900/40 bg-[#061122]/60">
          <div className="flex items-center justify-between">
            <div className="truncate">
              <div className="text-xs font-bold text-white truncate">
                {currentUser?.rank} {currentUser?.firstName} {currentUser?.lastName}
              </div>
              <div className="text-[10px] text-blue-300 font-mono">
                {currentUser?.role} • {currentUser?.category === "COMMISSIONED" ? "สัญญาบัตร" : "ประทวน"}
              </div>
            </div>
            <button
              onClick={() => signOut()}
              className="p-1.5 hover:bg-red-900/40 text-slate-400 hover:text-red-400 rounded-lg transition"
              title="ออกจากระบบ"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* 2. พื้นที่การทำงานหลัก สีขาว-เทาอ่อน */}
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        <header className="bg-white border-b border-slate-200 px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-xs font-semibold text-slate-700">
              กองเฝ้าระวังทางอวกาศ (Space Surveillance Division)
            </span>
            <span className="text-slate-300">|</span>
            <span className="text-xs font-medium text-slate-500 font-mono">ปี พ.ศ. 2569</span>
          </div>
          <span className="text-xs font-semibold px-3 py-1 bg-blue-50 text-blue-700 border border-blue-200 rounded-lg">
            {currentUser?.rank} {currentUser?.firstName} ({currentUser?.role})
          </span>
        </header>

        <main className="p-8 max-w-7xl w-full mx-auto space-y-6">
          {currentTab === "CALENDAR" && (
            <Tab1Calendar
              leaves={leaves}
              duties={dutySchedules}
              currentUser={currentUser}
              isAdmin={isAdmin}
              users={users}
              onRefresh={refreshAllData}
            />
          )}

          {currentTab === "DEPLOYMENT" && (
            <Tab2MissionRecords
              missions={missions}
              users={users}
              isAdmin={isAdmin}
              onRefresh={refreshAllData}
            />
          )}

          {currentTab === "DISPATCHER" && (
            <Tab3Dispatcher
              dutyTypes={dutyTypes}
              schedules={dutySchedules}
              isAdmin={isAdmin}
              onRefresh={refreshAllData}
            />
          )}

          {currentTab === "ANALYTICS" && (
            <Tab4Analytics
              users={users}
              missions={missions}
              leaves={leaves}
              schedules={dutySchedules}
            />
          )}

          {currentTab === "ADMIN_USERS" && isAdmin && (
            <TabAdminUsers
              users={users}
              isSuperAdmin={isSuperAdmin}
              onRefresh={refreshAllData}
            />
          )}
        </main>
      </div>
    </div>
  );
}

// ------------------------------------------------------------------------------------------------
// หน้าที่ 1: ปฏิทินปฏิบัติงาน & คำขอลา
// ------------------------------------------------------------------------------------------------
function Tab1Calendar({ leaves, duties, currentUser, isAdmin, users, onRefresh }: any) {
  const [subTab, setSubTab] = useState<"CALENDAR" | "PENDING">("CALENDAR");
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form State: User ล็อกอินจะถูกล็อกชื่อตัวเอง แอดมินสามารถเลือกใครก็ได้
  const [targetUserId, setTargetUserId] = useState(currentUser.id);
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

  const handleApplyLeave = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch("/api/leaves", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        userId: isAdmin ? targetUserId : currentUser.id,
        leaveType,
        startDate,
        endDate,
        reason,
        isApproved: isAdmin, // Admin บันทึกจะอนุมัติทันที ถ้า User ทั่วไปจะเป็น false
      }),
    });
    if (res.ok) {
      alert(isAdmin ? "บันทึกการลาสำเร็จ" : "ส่งคำขอลาเรียบร้อย รอแอดมินอนุมัติ");
      setIsModalOpen(false);
      setReason("");
      onRefresh();
    }
  };

  const handleApproveLeave = async (id: string, isApproved: boolean) => {
    await fetch(`/api/leaves/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isApproved }),
    });
    onRefresh();
  };

  const targetDateStr = selectedDate.toISOString().split("T")[0];

  const approvedLeavesForDay = leaves.filter((l: any) => {
    if (!l.isApproved) return false;
    const s = new Date(l.startDate).toISOString().split("T")[0];
    const e = new Date(l.endDate).toISOString().split("T")[0];
    return targetDateStr >= s && targetDateStr <= e;
  });

  const dutiesForDay = duties.filter((d: any) => {
    const dutyDate = new Date(d.dutyDate).toISOString().split("T")[0];
    return dutyDate === targetDateStr;
  });

  const pendingLeaves = leaves.filter((l: any) => !l.isApproved);

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
            <h1 className="text-base font-bold text-slate-900">ปฏิทินและคำขอลา</h1>
            <p className="text-xs text-slate-500">ตรวจสอบสถานะกำลังพลปฏิบัติหน้าที่ การลา และเวรผลัดประจำวัน</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {isAdmin && (
            <div className="bg-slate-100 p-1 rounded-xl flex text-xs font-semibold text-slate-600">
              <button
                onClick={() => setSubTab("CALENDAR")}
                className={`px-3.5 py-1.5 rounded-lg transition ${subTab === "CALENDAR" ? "bg-white text-slate-900 shadow-sm" : ""}`}
              >
                ปฏิทิน
              </button>
              <button
                onClick={() => setSubTab("PENDING")}
                className={`px-3.5 py-1.5 rounded-lg transition flex items-center gap-1.5 ${subTab === "PENDING" ? "bg-white text-slate-900 shadow-sm" : ""}`}
              >
                <span>คำขอรออนุมัติ</span>
                {pendingLeaves.length > 0 && (
                  <span className="w-4 h-4 rounded-full bg-amber-500 text-white text-[10px] flex items-center justify-center">
                    {pendingLeaves.length}
                  </span>
                )}
              </button>
            </div>
          )}

          <button
            onClick={() => {
              setTargetUserId(currentUser.id);
              setIsModalOpen(true);
            }}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs rounded-xl transition shadow-md shadow-blue-600/20 flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" /> {isAdmin ? "บันทึกการลา" : "ยื่นคำขอลาตนเอง"}
          </button>
        </div>
      </div>

      {subTab === "CALENDAR" ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* ปฏิทินรายเดือน */}
          <div className="lg:col-span-8 bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-slate-900">
                {thaiMonths[currentMonth]} พ.ศ. {currentYear + 543}
              </h3>
              <div className="flex items-center border border-slate-200 rounded-lg overflow-hidden text-xs">
                <button onClick={handlePrevMonth} className="p-1.5 hover:bg-slate-50 text-slate-600">
                  <ChevronLeft className="w-3.5 h-3.5" />
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
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
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
                  if (!l.isApproved) return false;
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
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* รายละเอียดประจำวันที่กดเลือก */}
          <div className="lg:col-span-4 bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm space-y-6">
            <div className="border-b border-slate-100 pb-4">
              <h3 className="text-sm font-bold text-slate-900">รายละเอียดประจำวัน</h3>
              <p className="text-xs font-semibold text-blue-600 mt-0.5">
                {selectedDate.getDate()} {thaiMonths[selectedDate.getMonth()]} พ.ศ. {selectedDate.getFullYear() + 543}
              </p>
            </div>

            <div className="space-y-3">
              <span className="font-bold text-slate-700 text-xs flex items-center gap-1.5">
                <UserIcon className="w-3.5 h-3.5 text-amber-500" /> กำลังพลที่ลา ({approvedLeavesForDay.length} นาย)
              </span>

              {approvedLeavesForDay.length === 0 ? (
                <div className="p-4 bg-slate-50 border border-slate-100 rounded-xl text-center text-xs text-slate-400">
                  ไม่มีกำลังพลลาในวันนี้
                </div>
              ) : (
                <div className="space-y-2.5 max-h-56 overflow-y-auto pr-1">
                  {approvedLeavesForDay.map((l: any) => {
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

            <div className="space-y-3 pt-2 border-t border-slate-100">
              <span className="font-bold text-slate-700 text-xs flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-blue-500" /> เวรผลัดประจำวัน ({dutiesForDay.length} รายการ)
              </span>

              {dutiesForDay.length === 0 ? (
                <div className="p-4 bg-slate-50 border border-slate-100 rounded-xl text-center text-xs text-slate-400">
                  ไม่มีการจัดเวรในวันนี้
                </div>
              ) : (
                <div className="space-y-2.5 max-h-56 overflow-y-auto pr-1">
                  {dutiesForDay.map((d: any) => (
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
      ) : (
        /* แถบพิจารณาอนุมัติคำขอลา (เฉพาะแอดมิน) */
        <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm space-y-4">
          <h3 className="text-sm font-bold text-slate-900">รายการคำขอลาที่รอการอนุมัติ</h3>
          {pendingLeaves.length === 0 ? (
            <p className="text-xs text-slate-500 py-8 text-center">ไม่มีรายการค้างอนุมัติ</p>
          ) : (
            <div className="space-y-2">
              {pendingLeaves.map((item: any) => (
                <div key={item.id} className="p-4 rounded-xl border border-slate-200 flex justify-between items-center text-xs">
                  <div>
                    <div className="font-bold text-slate-800">
                      {item.user.rank} {item.user.firstName} {item.user.lastName}
                    </div>
                    <div className="text-slate-500 mt-0.5">
                      ประเภท: {leaveTypeMap[item.leaveType]?.label || item.leaveType} •{" "}
                      {new Date(item.startDate).toLocaleDateString("th-TH")} ถึง{" "}
                      {new Date(item.endDate).toLocaleDateString("th-TH")}
                    </div>
                    {item.reason && <p className="text-slate-600 mt-1 italic">"{item.reason}"</p>}
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleApproveLeave(item.id, true)}
                      className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg font-semibold flex items-center gap-1"
                    >
                      <Check className="w-3.5 h-3.5" /> อนุมัติ
                    </button>
                    <button
                      onClick={() => handleApproveLeave(item.id, false)}
                      className="px-3 py-1.5 bg-rose-600 hover:bg-rose-500 text-white rounded-lg font-semibold flex items-center gap-1"
                    >
                      <X className="w-3.5 h-3.5" /> ปฏิเสธ
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Modal ยื่นคำขอลา */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-slate-200 max-w-md w-full p-6 space-y-4 shadow-2xl">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-slate-900">
                {isAdmin ? "บันทึกการลา" : "ยื่นคำขอลาตนเอง"}
              </h3>
              <button onClick={() => setIsModalOpen(false)}><X className="w-4 h-4 text-slate-400" /></button>
            </div>
            <form onSubmit={handleApplyLeave} className="space-y-3 text-xs">
              {isAdmin ? (
                <div>
                  <label className="text-slate-600 block mb-1 font-medium">เลือกกำลังพล</label>
                  <select
                    value={targetUserId}
                    onChange={(e) => setTargetUserId(e.target.value)}
                    className="w-full border border-slate-300 rounded-lg p-2.5 text-slate-800"
                    required
                  >
                    {users.map((u: any) => (
                      <option key={u.id} value={u.id}>
                        {u.rank} {u.firstName} {u.lastName}
                      </option>
                    ))}
                  </select>
                </div>
              ) : (
                <div>
                  <label className="text-slate-600 block mb-1 font-medium">ผู้ขอยื่นลา</label>
                  <input
                    disabled
                    value={`${currentUser.rank || ""} ${currentUser.firstName || ""} ${currentUser.lastName || ""}`}
                    className="w-full border border-slate-200 bg-slate-100 rounded-lg p-2.5 text-slate-600 cursor-not-allowed"
                  />
                </div>
              )}

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
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border border-slate-300 rounded-lg text-slate-600"
                >
                  ยกเลิก
                </button>
                <button type="submit" className="px-4 py-2 bg-blue-600 text-white font-semibold rounded-lg shadow">
                  {isAdmin ? "บันทึกข้อมูล" : "ส่งคำขอลา"}
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
// หน้าที่ 2: บันทึกราชการประจำกอง (Division Official Records)
// ------------------------------------------------------------------------------------------------
function Tab2MissionRecords({ missions, isAdmin, onRefresh }: any) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [missionName, setMissionName] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [selectedStaffIds, setSelectedStaffIds] = useState<string[]>([]);
  const [users, setUsers] = useState<any[]>([]);

  // ดึงรายชื่อกำลังพลทั้งหมดสำหรับเลือกไปปฏิบัติราชการ
  useEffect(() => {
    if (isAdmin) {
      fetch("/api/users")
        .then((res) => res.json())
        .then((data) => {
          if (Array.isArray(data)) setUsers(data);
        })
        .catch((err) => console.error("Failed to fetch users", err));
    }
  }, [isAdmin]);

  const handleCreateMission = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!missionName || !startDate || !endDate) {
      return alert("กรุณากรอกข้อมูลให้ครบถ้วน");
    }

    const res = await fetch("/api/missions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: missionName,
        startDate,
        endDate,
        staffIds: selectedStaffIds,
      }),
    });

    if (res.ok) {
      alert("บันทึกราชการประจำกองสำเร็จ");
      setIsModalOpen(false);
      setMissionName("");
      setStartDate("");
      setEndDate("");
      setSelectedStaffIds([]);
      onRefresh();
    } else {
      const err = await res.json();
      alert(err.error || "เกิดข้อผิดพลาดในการบันทึกราชการ");
    }
  };

  const handleDeleteMission = async (missionId: string) => {
    if (!confirm("คุณต้องการลบบันทึกราชการนี้ใช่หรือไม่?")) return;

    const res = await fetch(`/api/missions/${missionId}`, {
      method: "DELETE",
    });

    if (res.ok) {
      alert("ลบรายการสำเร็จ");
      onRefresh();
    } else {
      const err = await res.json();
      alert(err.error || "ไม่สามารถลบรายการได้");
    }
  };

  const toggleStaffSelection = (userId: string) => {
    if (selectedStaffIds.includes(userId)) {
      setSelectedStaffIds(selectedStaffIds.filter((id) => id !== userId));
    } else {
      setSelectedStaffIds([...selectedStaffIds, userId]);
    }
  };

  return (
    <div className="space-y-6">
      {/* ส่วนหัวข้อหน้า */}
      <div className="flex justify-between items-center bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm">
        <div>
           <h1 className="text-base font-bold text-slate-900">บันทึกราชการประจำกอง</h1>
           <p className="text-xs text-slate-500">สฝอว.สม., สฝอว.ดน. และราชการอื่นๆ ประจำปี พ.ศ. 2569</p>
        </div>
        {isAdmin && (
          <button
            onClick={() => setIsModalOpen(true)}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold rounded-xl shadow transition"
          >
            + บันทึกราชการใหม่
          </button>
        )}
      </div>

      {/* ตารางแสดงรายการบันทึกราชการ */}
      <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm space-y-4">
        <h2 className="text-sm font-bold text-slate-900">รายการไปราชการและปฏิบัติภารกิจ</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-200 text-slate-500">
                <th className="py-3 px-4 font-semibold">ชื่อภารกิจ / ราชการ</th>
                <th className="py-3 px-4 font-semibold">ช่วงเวลา</th>
                <th className="py-3 px-4 font-semibold">กำลังพลที่ปฏิบัติหน้าที่</th>
                {isAdmin && <th className="py-3 px-4 font-semibold text-right">จัดการ</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {missions && missions.length > 0 ? (
                missions.map((m: any) => (
                  <tr key={m.id} className="hover:bg-slate-50/50">
                    <td className="py-3.5 px-4 font-medium text-slate-800">{m.name}</td>
                    <td className="py-3.5 px-4 text-slate-600 font-mono">
                      {new Date(m.startDate).toLocaleDateString("th-TH")} - {new Date(m.endDate).toLocaleDateString("th-TH")}
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="flex flex-wrap gap-1">
                        {m.staffs && m.staffs.length > 0 ? (
                          m.staffs.map((st: any) => (
                            <span key={st.id} className="px-2 py-0.5 bg-slate-100 text-slate-700 rounded text-[11px]">
                              {st.user.rank} {st.user.firstName} {st.user.lastName}
                            </span>
                          ))
                        ) : (
                          <span className="text-slate-400 italic">ไม่มีกำลังพลระบุ</span>
                        )}
                      </div>
                    </td>
                    {isAdmin && (
                      <td className="py-3.5 px-4 text-right">
                        <button
                          onClick={() => handleDeleteMission(m.id)}
                          className="px-2.5 py-1 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded text-xs border border-rose-200 font-medium"
                        >
                          ลบ
                        </button>
                      </td>
                    )}
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={isAdmin ? 4 : 3} className="py-8 text-center text-slate-400">
                    ยังไม่มีข้อมูลบันทึกราชการประจำกอง
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal สำหรับสร้างบันทึกราชการใหม่ */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-slate-200 max-w-lg w-full p-6 space-y-4 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center border-b pb-3">
              <h3 className="text-base font-bold text-slate-900">บันทึกราชการประจำกองใหม่</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600 font-bold">✕</button>
            </div>
            
            <form onSubmit={handleCreateMission} className="space-y-3 text-xs">
              <div>
                <label className="text-slate-600 block mb-1 font-medium">ชื่อภารกิจ / ราชการ</label>
                <input
                  type="text"
                  placeholder="เช่น ไปราชการ สฝอว.สม. ณ กองบิน 1"
                  value={missionName}
                  onChange={(e) => setMissionName(e.target.value)}
                  className="w-full border border-slate-300 rounded-lg p-2.5 text-slate-800"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-slate-600 block mb-1 font-medium">ตั้งแต่วันที่</label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full border border-slate-300 rounded-lg p-2 text-slate-800"
                    required
                  />
                </div>
                <div>
                  <label className="text-slate-600 block mb-1 font-medium">ถึงวันที่</label>
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
                <label className="text-slate-600 block mb-1 font-medium">เลือกกำลังพลที่ร่วมปฏิบัติราชการ</label>
                <div className="border border-slate-200 rounded-xl max-h-48 overflow-y-auto p-2 space-y-1.5 bg-slate-50">
                  {users.map((u: any) => (
                    <label key={u.id} className="flex items-center gap-2 p-1.5 hover:bg-white rounded cursor-pointer">
                      <input
                        type="checkbox"
                        checked={selectedStaffIds.includes(u.id)}
                        onChange={() => toggleStaffSelection(u.id)}
                        className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="text-slate-700 font-medium">
                        {u.rank} {u.firstName} {u.lastName} <span className="text-slate-400">({u.email})</span>
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="pt-3 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border border-slate-300 rounded-lg text-slate-600 font-medium"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-lg shadow"
                >
                  บันทึกข้อมูล
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
// หน้าที่ 3: ระบบจัดผลัดและเวรอัตโนมัติ (Fair-Share Dispatcher)
// ------------------------------------------------------------------------------------------------
function Tab3Dispatcher({ dutyTypes, schedules, isAdmin, onRefresh }: any) {
  const [selectedType, setSelectedType] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [loading, setLoading] = useState(false);

  const [isTypeModalOpen, setIsTypeModalOpen] = useState(false);
  const [typeName, setTypeName] = useState("");
  const [requiredType, setRequiredType] = useState<string>("");
  const [mainCount, setMainCount] = useState("1");
  const [backupCount, setBackupCount] = useState("1");

  const handleDispatch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!startDate || !endDate) return alert("กรุณาระบุวันเริ่มต้นและสิ้นสุด");
    if (new Date(startDate) > new Date(endDate)) return alert("วันสิ้นสุดต้องมากกว่าหรือเท่ากับวันเริ่มต้น");

    setLoading(true);
    const res = await fetch("/api/duty/dispatch", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ dutyTypeId: selectedType, startDate, endDate }),
    });
    setLoading(false);
    
    if (res.ok) {
      alert("จัดเวรอัตโนมัติตามช่วงเวลาที่กำหนดสำเร็จ (คำนวณตามสถิติน้อยสุดและไม่ติดภารกิจ)");
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
          <h2 className="text-sm font-bold text-slate-900">แผงควบคุมการจัดเวรอัตโนมัติ</h2>
          {isAdmin && (
            <button
              onClick={() => setIsTypeModalOpen(true)}
              className="text-xs text-blue-600 hover:underline font-semibold"
            >
              + เพิ่มประเภทเวร
            </button>
          )}
        </div>

        {isAdmin ? (
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
                    {t.name} (
                    {t.requiredType === "COMMISSIONED"
                      ? "สัญญาบัตร"
                      : t.requiredType === "NON_COMMISSIONED"
                      ? "ประทวน"
                      : "ทั้งหมด"}{" "}
                    • จริง {t.mainCount} / สำรอง {t.backupCount})
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-slate-600 block mb-1">ตั้งแต่วันที่</label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full border border-slate-300 rounded-lg p-2 text-slate-800"
                  required
                />
              </div>
              <div>
                <label className="text-slate-600 block mb-1">ถึงวันที่</label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full border border-slate-300 rounded-lg p-2 text-slate-800"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 bg-blue-600 hover:bg-blue-500 font-semibold text-white rounded-xl shadow transition mt-2"
            >
              {loading ? "กำลังคำนวณตามสถิติ..." : "⚡ จัดสรรเวรอัตโนมัติ"}
            </button>
          </form>
        ) : (
          <p className="text-xs text-slate-500">ฟังก์ชันนี้สงวนไว้สำหรับผู้ดูแลระบบ</p>
        )}
      </div>

      <div className="lg:col-span-7 bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm space-y-3">
        <h2 className="text-sm font-bold text-slate-900">รายการเวรที่จัดสรรแล้ว</h2>
        <div className="space-y-2 max-h-96 overflow-y-auto pr-1">
          {schedules.map((s: any) => (
            <div key={s.id} className="p-3.5 border border-slate-200 rounded-xl space-y-2 text-xs">
              <div className="flex justify-between items-center">
                <span className="font-bold text-blue-700">{s.dutyType.name}</span>
                <span className="font-mono text-slate-500">{new Date(s.dutyDate).toLocaleDateString("th-TH")} (พ.ศ. {s.year})</span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {s.staffs.map((st: any) => (
                  <span
                    key={st.id}
                    className={`px-2 py-0.5 rounded text-[11px] font-medium ${
                      st.isBackup ? "bg-amber-50 text-amber-800 border border-amber-200" : "bg-blue-50 text-blue-800 border border-blue-200"
                    }`}
                  >
                    {st.isBackup ? "[ตัวสำรอง]" : "[ตัวจริง]"} {st.user.rank} {st.user.firstName} {st.user.lastName}
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
              <h3 className="text-base font-bold text-slate-900">สร้างประเภทเวร / ภารกิจใหม่</h3>
              <button onClick={() => setIsTypeModalOpen(false)}><X className="w-4 h-4 text-slate-400" /></button>
            </div>
            <form onSubmit={handleCreateType} className="space-y-3 text-xs">
              <div>
                <label className="text-slate-600 block mb-1">ชื่อเวร</label>
                <input
                  type="text"
                  placeholder="เช่น เวรนำแถว, เวรบรรยายสรุป, เวรพูดหน้าแถว"
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
                  <option value="COMMISSIONED">เฉพาะนายทหารสัญญาบัตร</option>
                  <option value="NON_COMMISSIONED">เฉพาะนายทหารประทวน</option>
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
                  บันทึกประเภทเวร
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
// หน้าที่ 4: ศูนย์รวมสถิติการลา ราชการ และการเข้าเวรสะสม
// ------------------------------------------------------------------------------------------------
function Tab4Analytics({ users, missions, leaves, schedules }: any) {
  const [selectedYear, setSelectedYear] = useState<number>(2569);
  const [search, setSearch] = useState("");

  const filtered = users.filter((u: any) =>
    `${u.rank} ${u.firstName} ${u.lastName}`.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm space-y-4">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-slate-100 pb-4">
        <div>
          <h2 className="text-base font-bold text-slate-900">ศูนย์รวมสถิติกำลังพลประจำปี</h2>
          <p className="text-xs text-slate-500">ข้อมูลสถิติผลัดราชการ วันลา และการจัดเวรย้อนหลังไม่สูญหาย</p>
        </div>

        <div className="flex gap-2 items-center">
          <div className="flex items-center gap-1.5 text-xs">
            <span className="text-slate-500">เลือกปี:</span>
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(parseInt(e.target.value, 10))}
              className="border border-slate-300 rounded-lg px-2.5 py-1 text-xs text-slate-700"
            >
              {[2568, 2569, 2570].map((y) => (
                <option key={y} value={y}>พ.ศ. {y}</option>
              ))}
            </select>
          </div>

          <input
            type="text"
            placeholder="ค้นหาชื่อกำลังพล..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="border border-slate-300 rounded-xl px-3 py-1 text-xs"
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
              <th className="p-3 text-center">สฝอว.สม. ({selectedYear})</th>
              <th className="p-3 text-center">สฝอว.ดน. ({selectedYear})</th>
              <th className="p-3 text-center">ราชการอื่น ({selectedYear})</th>
              <th className="p-3 text-center">ลาพักผ่อน</th>
              <th className="p-3 text-center">ลาป่วย</th>
              <th className="p-3 text-center">ลากิจ</th>
              <th className="p-3 text-center">เข้าเวรปี {selectedYear}</th>
              <th className="p-3 text-center">เข้าเวรสะสมทั้งหมด</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filtered.map((u: any, idx: number) => {
              // นับผลัดราชการตามปีที่เลือก
              const depSM = missions.filter(
                (m: any) => m.location === "SAM_MO" && m.year === selectedYear && m.staffs?.some((s: any) => s.userId === u.id)
              ).length;
              const depDN = missions.filter(
                (m: any) => m.location === "DON_MUEANG" && m.year === selectedYear && m.staffs?.some((s: any) => s.userId === u.id)
              ).length;
              const depOther = missions.filter(
                (m: any) => m.location === "OTHER" && m.year === selectedYear && m.staffs?.some((s: any) => s.userId === u.id)
              ).length;

              // สถิติวันลา
              const leaveVac = leaves.filter((l: any) => l.userId === u.id && l.leaveType === "VACATION" && l.isApproved).length;
              const leaveSick = leaves.filter((l: any) => l.userId === u.id && l.leaveType === "SICK" && l.isApproved).length;
              const leaveBus = leaves.filter((l: any) => l.userId === u.id && l.leaveType === "BUSINESS" && l.isApproved).length;

              // สถิติการเข้าเวรปีนี้ และสะสมทั้งหมด
              const dutyThisYear = schedules.filter((sc: any) => sc.year === selectedYear).reduce(
                (acc: number, cur: any) => acc + (cur.staffs?.filter((st: any) => st.userId === u.id).length || 0), 0
              );
              const dutyTotal = schedules.reduce(
                (acc: number, cur: any) => acc + (cur.staffs?.filter((st: any) => st.userId === u.id).length || 0), 0
              );

              return (
                <tr key={u.id} className="hover:bg-slate-50/60">
                  <td className="p-3 font-mono text-slate-400">{idx + 1}</td>
                  <td className="p-3 font-semibold text-slate-800">{u.rank} {u.firstName} {u.lastName}</td>
                  <td className="p-3 text-slate-500">{u.category === "COMMISSIONED" ? "สัญญาบัตร" : "ประทวน"}</td>
                  <td className="p-3 text-center font-mono text-blue-600 font-medium">{depSM}</td>
                  <td className="p-3 text-center font-mono text-indigo-600 font-medium">{depDN}</td>
                  <td className="p-3 text-center font-mono text-slate-500 font-medium">{depOther}</td>
                  <td className="p-3 text-center font-mono text-amber-600">{leaveVac}</td>
                  <td className="p-3 text-center font-mono text-rose-600">{leaveSick}</td>
                  <td className="p-3 text-center font-mono text-slate-600">{leaveBus}</td>
                  <td className="p-3 text-center font-mono font-bold text-blue-600">{dutyThisYear}</td>
                  <td className="p-3 text-center font-mono font-bold text-emerald-600">{dutyTotal}</td>
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
// เมนูกำลังพล & อนุมัติผู้ใช้งาน (สำหรับ Admin และ Super Admin)
// ------------------------------------------------------------------------------------------------
function TabAdminUsers({ users, isSuperAdmin, onRefresh }: any) {
  const [editId, setEditId] = useState<string | null>(null);
  const [rank, setRank] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [category, setCategory] = useState("NON_COMMISSIONED");

  const handleApprove = async (id: string) => {
    if (!rank || !firstName || !lastName) {
      return alert("กรุณาระบุ ยศ ชื่อ และนามสกุลจริงก่อนอนุมัติ");
    }
    await fetch(`/api/users/${id}/approve`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ rank, firstName, lastName, category }),
    });
    setEditId(null);
    onRefresh();
  };

  const handleChangeRole = async (id: string, role: string) => {
    await fetch(`/api/users/${id}/role`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ role }),
    });
    onRefresh();
  };

  return (
    <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm space-y-4">
      <div>
        <h2 className="text-base font-bold text-slate-900">จัดการกำลังพล & อนุมัติสิทธิ์เข้าใช้งาน</h2>
        <p className="text-xs text-slate-500">
          ผู้ใช้งานที่ล็อกอินผ่าน Google จะต้องได้รับการกรอก ยศ-ชื่อจริง และอนุมัติสถานะก่อนจึงจะเข้าใช้งานได้
        </p>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
            <tr>
              <th className="p-3">อีเมล Google</th>
              <th className="p-3">ยศ - ชื่อ สกุลจริง</th>
              <th className="p-3">ชั้นยศ</th>
              <th className="p-3">สิทธิ์</th>
              <th className="p-3">สถานะ</th>
              <th className="p-3 text-center">จัดการ</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {users.map((u: any) => (
              <tr key={u.id}>
                <td className="p-3 font-mono text-slate-500">{u.email}</td>
                <td className="p-3 font-semibold text-slate-800">
                  {editId === u.id ? (
                    <div className="flex gap-1">
                      <input
                        placeholder="ยศ"
                        value={rank}
                        onChange={(e) => setRank(e.target.value)}
                        className="w-16 border rounded p-1 text-slate-800"
                      />
                      <input
                        placeholder="ชื่อจริง"
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                        className="w-24 border rounded p-1 text-slate-800"
                      />
                      <input
                        placeholder="นามสกุล"
                        value={lastName}
                        onChange={(e) => setLastName(e.target.value)}
                        className="w-24 border rounded p-1 text-slate-800"
                      />
                    </div>
                  ) : (
                    `${u.rank || "-"} ${u.firstName || "-"} ${u.lastName || ""}`
                  )}
                </td>
                <td className="p-3">
                  {editId === u.id ? (
                    <select
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      className="border rounded p-1"
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
                  {isSuperAdmin && u.role !== "SUPER_ADMIN" ? (
                    <select
                      value={u.role}
                      onChange={(e) => handleChangeRole(u.id, e.target.value)}
                      className="border rounded px-2 py-0.5 text-xs font-semibold"
                    >
                      <option value="USER">USER</option>
                      <option value="ADMIN">ADMIN</option>
                    </select>
                  ) : (
                    <span className="font-mono font-bold text-blue-700">{u.role}</span>
                  )}
                </td>
                <td className="p-3">
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                      u.status === "ACTIVE"
                        ? "bg-emerald-100 text-emerald-800"
                        : "bg-amber-100 text-amber-800"
                    }`}
                  >
                    {u.status}
                  </span>
                </td>
                <td className="p-3 text-center">
                  {editId === u.id ? (
                    <button
                      onClick={() => handleApprove(u.id)}
                      className="px-3 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded font-medium"
                    >
                      บันทึก & อนุมัติ
                    </button>
                  ) : (
                    <button
                      onClick={() => {
                        setEditId(u.id);
                        setRank(u.rank || "");
                        setFirstName(u.firstName || "");
                        setLastName(u.lastName || "");
                        setCategory(u.category || "NON_COMMISSIONED");
                      }}
                      className="px-3 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded font-medium"
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