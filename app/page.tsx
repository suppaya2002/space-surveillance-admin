"use client";

import { useSession, signOut } from "next-auth/react";
import { useState, useEffect, useMemo } from "react";
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
  User,
  Phone,
  MapPin,
  Search,
  Download,
  AlertCircle,
  FileText,
} from "lucide-react";

export default function AdministrativeDashboard() {
  const { data: session, status } = useSession();
  const [currentTab, setCurrentTab] = useState<
    "CALENDAR" | "DEPLOYMENT" | "DISPATCHER" | "ANALYTICS" | "ADMIN_USERS"
  >("CALENDAR");

  // Datasets
  const [users, setUsers] = useState<any[]>([]);
  const [leaves, setLeaves] = useState<any[]>([]);
  const [missions, setMissions] = useState<any[]>([]);
  const [dutyTypes, setDutyTypes] = useState<any[]>([]);
  const [dutySchedules, setDutySchedules] = useState<any[]>([]);

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
      <div className="min-h-screen bg-slate-900 flex items-center justify-center text-blue-300 font-mono text-sm">
        กำลังโหลดระบบธุรการ กองเฝ้าระวังทางอวกาศ...
      </div>
    );
  }

  if (isPending) {
    return (
      <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white border border-slate-200 rounded-2xl p-8 text-center space-y-4 shadow-xl">
          <div className="w-14 h-14 rounded-full bg-amber-50 border border-amber-200 flex items-center justify-center mx-auto text-amber-500">
            <AlertCircle className="w-7 h-7" />
          </div>
          <h2 className="text-xl font-bold text-slate-800">รอการอนุมัติสิทธิ์เข้าใช้งาน</h2>
          <p className="text-sm text-slate-500 leading-relaxed">
            บัญชี Google ({session?.user?.email}) บันทึกข้อมูลแล้ว อยู่ระหว่างรอผู้ดูแลระบบกำหนด ยศ-ชื่อจริง และเปิดสิทธิ์การใช้งาน
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

  const pendingLeavesCount = leaves.filter((l: any) => !l.isApproved).length;

  return (
    <div className="min-h-screen flex bg-slate-50 text-slate-800 font-sans antialiased">
      {/* 1. Sidebar ด้านซ้าย: พื้นหลังสีน้ำเงินกรมท่าเข้ม */}
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

          {/* เมนูนำทางด้านซ้าย */}
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
                <span>1. ปฏิทินและการลา</span>
              </div>
              {pendingLeavesCount > 0 && (
                <span className="px-2 py-0.5 text-[10px] bg-amber-500 text-slate-950 font-bold rounded-full">
                  {pendingLeavesCount}
                </span>
              )}
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

        {/* ข้อมูลโปรไฟล์ด้านล่าง Sidebar */}
        <div className="p-4 border-t border-blue-900/40 bg-[#061122]/60">
          <div className="flex items-center justify-between">
            <div className="truncate">
              <div className="text-xs font-bold text-white truncate">
                {currentUser?.rank} {currentUser?.firstName || currentUser?.name}
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

      {/* 2. พื้นที่การทำงานหลัก: พื้นหลังสีขาว-เทาอ่อน */}
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        {/* Top Header Bar */}
        <header className="bg-white border-b border-slate-200 px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-xs font-semibold text-slate-600">
              ระบบงานธุรการ กองเฝ้าระวังทางอวกาศ (Space Surveillance Division)
            </span>
            <span className="text-slate-300">|</span>
            <span className="text-xs font-medium text-slate-500 font-mono">
              ปีงบประมาณ 2569
            </span>
          </div>

          <div className="flex items-center gap-2">
            <span className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-blue-50 text-blue-700 border border-blue-200">
              {currentUser?.rank} {currentUser?.firstName} {currentUser?.lastName}
            </span>
          </div>
        </header>

        {/* Dynamic Tab Body */}
        <main className="p-8 max-w-7xl w-full mx-auto space-y-6">
          {currentTab === "CALENDAR" && (
            <LightCalendarView
              leaves={leaves}
              missions={missions}
              duties={dutySchedules}
              isAdmin={isAdmin}
              onRefresh={refreshAllData}
            />
          )}

          {currentTab === "DEPLOYMENT" && (
            <LightDeploymentView
              missions={missions}
              users={users}
              isAdmin={isAdmin}
              onRefresh={refreshAllData}
            />
          )}

          {currentTab === "DISPATCHER" && (
            <LightDispatcherView
              dutyTypes={dutyTypes}
              schedules={dutySchedules}
              isAdmin={isAdmin}
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

          {currentTab === "ADMIN_USERS" && isAdmin && (
            <LightAdminUsersView users={users} onRefresh={refreshAllData} />
          )}
        </main>
      </div>
    </div>
  );
}

// ------------------------------------------------------------------------------------------------
// Tab 1: ปฏิทินและการลา (Light Theme แบบภาพที่ 3)
// ------------------------------------------------------------------------------------------------
function LightCalendarView({ leaves, missions, duties, isAdmin, onRefresh }: any) {
  const [subTab, setSubTab] = useState<"CALENDAR" | "PENDING" | "MY_LEAVES">("CALENDAR");
  const [selectedDay, setSelectedDay] = useState<number>(8); // Default วันที่ตามภาพ
  const [isApplyModalOpen, setIsApplyModalOpen] = useState(false);

  // Form State
  const [leaveType, setLeaveType] = useState("VACATION");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [reason, setReason] = useState("");

  const handleApply = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch("/api/leaves", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ leaveType, startDate, endDate, reason }),
    });
    if (res.ok) {
      alert("ส่งคำขอลาสำเร็จ");
      setIsApplyModalOpen(false);
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

  const pendingLeaves = leaves.filter((l: any) => !l.isApproved);

  return (
    <div className="space-y-6">
      {/* Top Banner Card */}
      <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center space-x-4">
          <div className="h-12 w-12 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600">
            <CalendarIcon className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-900 tracking-tight">
              หน้า 1: ปฏิทินและคำขอลา
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              แสดงภาพรวมการลากลุ่มกำลังพลทุกประเภท และเวรผลัดประจำวัน
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="bg-slate-100 p-1 rounded-xl flex text-xs font-semibold text-slate-600">
            <button
              onClick={() => setSubTab("CALENDAR")}
              className={`px-3.5 py-1.5 rounded-lg transition ${
                subTab === "CALENDAR" ? "bg-white text-slate-900 shadow-sm" : "hover:text-slate-900"
              }`}
            >
              ปฏิทิน
            </button>
            <button
              onClick={() => setSubTab("PENDING")}
              className={`px-3.5 py-1.5 rounded-lg transition flex items-center gap-1.5 ${
                subTab === "PENDING" ? "bg-white text-slate-900 shadow-sm" : "hover:text-slate-900"
              }`}
            >
              <span>คำขอรออนุมัติ</span>
              {pendingLeaves.length > 0 && (
                <span className="w-4 h-4 rounded-full bg-amber-500 text-white text-[10px] flex items-center justify-center">
                  {pendingLeaves.length}
                </span>
              )}
            </button>
          </div>

          <button
            onClick={() => setIsApplyModalOpen(true)}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs rounded-xl transition shadow-md shadow-blue-600/20 flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" /> ยื่นคำขอลา
          </button>
        </div>
      </div>

      {subTab === "CALENDAR" ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* ปฏิทินฝั่งซ้าย */}
          <div className="lg:col-span-8 bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <h3 className="text-base font-bold text-slate-900">กันยายน พ.ศ. 2569</h3>
                <div className="flex items-center border border-slate-200 rounded-lg overflow-hidden text-xs">
                  <button className="px-2 py-1 hover:bg-slate-50 text-slate-600"><ChevronLeft className="w-3.5 h-3.5" /></button>
                  <span className="px-2.5 py-1 font-medium bg-slate-50 text-slate-700">วันนี้</span>
                  <button className="px-2 py-1 hover:bg-slate-50 text-slate-600"><ChevronRight className="w-3.5 h-3.5" /></button>
                </div>
              </div>

              <div className="flex items-center gap-2 text-xs">
                <select className="bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1 text-slate-700">
                  <option>แสดงทั้งหมด (ลา/เวร)</option>
                </select>
                <select className="bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1 text-slate-700">
                  <option>กำลังพลทุกคน</option>
                </select>
              </div>
            </div>

            {/* ตารางวัน 7 วัน */}
            <div className="grid grid-cols-7 gap-1 text-center text-xs font-semibold py-2 border-b border-slate-100">
              <span className="text-rose-500">อา.</span>
              <span className="text-slate-600">จ.</span>
              <span className="text-slate-600">อ.</span>
              <span className="text-slate-600">พ.</span>
              <span className="text-slate-600">พฤ.</span>
              <span className="text-slate-600">ศ.</span>
              <span className="text-blue-500">ส.</span>
            </div>

            {/* Grid วันที่ */}
            <div className="grid grid-cols-7 gap-2">
              {Array.from({ length: 35 }).map((_, i) => {
                const dayNumber = i - 1; // จำลองเริ่มต้นเดือน
                const isValidDay = dayNumber >= 1 && dayNumber <= 30;
                const isSelected = dayNumber === selectedDay;

                return (
                  <div
                    key={i}
                    onClick={() => isValidDay && setSelectedDay(dayNumber)}
                    className={`min-h-[96px] rounded-xl p-2 border transition flex flex-col justify-between cursor-pointer ${
                      !isValidDay
                        ? "bg-slate-50/50 border-transparent text-slate-300"
                        : isSelected
                        ? "bg-blue-50/30 border-blue-500 shadow-sm"
                        : "bg-white border-slate-200 hover:border-blue-300"
                    }`}
                  >
                    <span
                      className={`text-xs font-mono font-bold ${
                        isSelected ? "text-blue-600" : "text-slate-700"
                      }`}
                    >
                      {isValidDay ? dayNumber : ""}
                    </span>

                    {isValidDay && (
                      <div className="space-y-1">
                        {dayNumber === 8 && (
                          <>
                            <div className="text-[10px] bg-amber-50 border border-amber-200 text-amber-800 px-1.5 py-0.5 rounded font-medium truncate">
                              ลา: ร.ต. กษิดิส
                            </div>
                            <div className="text-[10px] bg-amber-50 border border-amber-200 text-amber-800 px-1.5 py-0.5 rounded font-medium truncate">
                              ลา: จ.อ. ณัฐพล
                            </div>
                            <div className="text-[10px] bg-blue-50 border border-blue-200 text-blue-700 px-1.5 py-0.5 rounded font-medium truncate">
                              เวร: นำแถว
                            </div>
                          </>
                        )}
                        {dayNumber === 5 && (
                          <div className="text-[10px] bg-blue-50 border border-blue-200 text-blue-700 px-1.5 py-0.5 rounded font-medium truncate">
                            เวร: นำแถว
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* รายละเอียดประจำวันฝั่งขวา (เหมือนภาพที่ 3) */}
          <div className="lg:col-span-4 bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div>
                <h3 className="text-sm font-bold text-slate-900">รายละเอียดประจำวัน</h3>
                <p className="text-xs font-semibold text-blue-600 mt-0.5">{selectedDay} กันยายน 2569</p>
              </div>
              <button
                onClick={() => setIsApplyModalOpen(true)}
                className="px-3 py-1.5 bg-blue-50 text-blue-600 hover:bg-blue-100 border border-blue-200 rounded-lg text-xs font-semibold transition"
              >
                + บันทึกการลา
              </button>
            </div>

            {/* รายชื่อกำลังพลที่ลา */}
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-slate-700 flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-amber-500" /> กำลังพลที่ลา (2 นาย)
                </span>
              </div>

              <div className="space-y-3">
                <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/50 space-y-2 text-xs">
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="font-bold text-slate-800">ร.ต. กษิดิส รัตนโชติ</div>
                      <div className="text-[10px] text-slate-500">นายทหารตรวจการณ์อวกาศ</div>
                    </div>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200">
                      ลาพักผ่อน
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-600">
                    เหตุผล: พักผ่อนประจำปีกับครอบครัวต่างจังหวัด
                  </p>
                  <div className="text-[10px] text-slate-500 space-y-0.5 pt-1 border-t border-slate-200/60">
                    <div className="flex items-center gap-1"><MapPin className="w-3 h-3" /> อ.เมือง จ.พิษณุโลก</div>
                    <div className="flex items-center gap-1"><Phone className="w-3 h-3" /> 086-778-9901</div>
                  </div>
                </div>

                <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/50 space-y-2 text-xs">
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="font-bold text-slate-800">จ.อ. ณัฐพล มงคลกุล</div>
                      <div className="text-[10px] text-slate-500">เสมียนธุรการและสารบรรณ</div>
                    </div>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-rose-100 text-rose-800 border border-rose-200">
                      ลาป่วย
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-600">
                    เหตุผล: เป็นไข้หวัดใหญ่ แพทย์สั่งให้พักรักษาตัว 2 วัน
                  </p>
                  <div className="text-[10px] text-slate-500 space-y-0.5 pt-1 border-t border-slate-200/60">
                    <div className="flex items-center gap-1"><MapPin className="w-3 h-3" /> บ้านพักข้าราชการ ทอ. ดอนเมือง</div>
                    <div className="flex items-center gap-1"><Phone className="w-3 h-3" /> 084-556-7890</div>
                  </div>
                </div>
              </div>
            </div>

            {/* รายชื่อเวรผลัดประจำวัน */}
            <div className="space-y-3 pt-2 border-t border-slate-100">
              <span className="font-bold text-slate-700 text-xs flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-blue-500" /> เวรผลัดประจำวัน (2 รายการ)
              </span>

              <div className="space-y-2 text-xs">
                <div className="p-3 rounded-xl border border-blue-100 bg-blue-50/40 space-y-1">
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-blue-900">เวรนำแถว</span>
                    <span className="text-[10px] font-mono text-blue-700">07:45 - 08:30 น.</span>
                  </div>
                  <div className="text-[11px] text-slate-700">
                    <span className="font-semibold text-blue-800">ตัวจริง:</span> จ.ต. ภาคิน ศรีสวัสดิ์
                  </div>
                  <div className="text-[11px] text-slate-500">
                    <span className="font-semibold">ตัวสำรอง:</span> พ.อ.ท. สุริยะ แก้วอำไพ
                  </div>
                </div>

                <div className="p-3 rounded-xl border border-blue-100 bg-blue-50/40 space-y-1">
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-blue-900">เวรบรรยายสรุป</span>
                    <span className="text-[10px] font-mono text-blue-700">09:00 - 10:00 น.</span>
                  </div>
                  <div className="text-[11px] text-slate-700">
                    <span className="font-semibold text-blue-800">ตัวจริง:</span> ร.ท. ธนกร ชัยชนะ
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* กล่องรายการคำขอรออนุมัติ */
        <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm space-y-4">
          <h3 className="text-sm font-bold text-slate-900">รายการคำขอลาที่รอการอนุมัติ</h3>
          {pendingLeaves.length === 0 ? (
            <p className="text-xs text-slate-500 py-8 text-center">ไม่มีรายการค้างอนุมัติ</p>
          ) : (
            <div className="space-y-2">
              {pendingLeaves.map((item: any) => (
                <div key={item.id} className="p-4 rounded-xl border border-slate-200 flex justify-between items-center text-xs">
                  <div>
                    <div className="font-bold text-slate-800">{item.user.rank} {item.user.firstName} {item.user.lastName}</div>
                    <div className="text-slate-500 mt-0.5">
                      ประเภท: {item.leaveType} • {new Date(item.startDate).toLocaleDateString("th-TH")} ถึง {new Date(item.endDate).toLocaleDateString("th-TH")}
                    </div>
                    {item.reason && <p className="text-slate-600 mt-1 italic">"{item.reason}"</p>}
                  </div>
                  {isAdmin && (
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleApprove(item.id, true)}
                        className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg font-semibold flex items-center gap-1"
                      >
                        <Check className="w-3.5 h-3.5" /> อนุมัติ
                      </button>
                      <button
                        onClick={() => handleApprove(item.id, false)}
                        className="px-3 py-1.5 bg-rose-600 hover:bg-rose-500 text-white rounded-lg font-semibold flex items-center gap-1"
                      >
                        <X className="w-3.5 h-3.5" /> ปฏิเสธ
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Modal ยื่นคำขอลา */}
      {isApplyModalOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-slate-200 max-w-md w-full p-6 space-y-4 shadow-2xl">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-slate-900">ยื่นคำขอลาประจำบุคคล</h3>
              <button onClick={() => setIsApplyModalOpen(false)}><X className="w-4 h-4 text-slate-400" /></button>
            </div>
            <form onSubmit={handleApply} className="space-y-3 text-xs">
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
                  placeholder="ระบุเหตุผล..."
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
                  ส่งใบลา
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
// Tab 2: ไปราชการประจำกอง (Light Theme)
// ------------------------------------------------------------------------------------------------
function LightDeploymentView({ missions, users, isAdmin, onRefresh }: any) {
  const [filterLoc, setFilterLoc] = useState("ALL");
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
        <div className="flex gap-2">
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
// Tab 3: จัดสรรเวรอัตโนมัติ (Light Theme)
// ------------------------------------------------------------------------------------------------
function LightDispatcherView({ dutyTypes, schedules, isAdmin, onRefresh }: any) {
  const [selectedType, setSelectedType] = useState("");
  const [targetDate, setTargetDate] = useState("");
  const [loading, setLoading] = useState(false);

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
      alert("จัดเวรอัตโนมัติสำเร็จ");
      onRefresh();
    } else {
      const err = await res.json();
      alert(err.error || "เกิดข้อผิดพลาด");
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
      <div className="lg:col-span-5 bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm space-y-4">
        <h2 className="text-sm font-bold text-slate-900">แผงควบคุมการคำนวณเวร</h2>
        <form onSubmit={handleDispatch} className="space-y-3 text-xs">
          <div>
            <label className="text-slate-600 block mb-1">เลือกประเภทเวร</label>
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="w-full border border-slate-300 rounded-lg p-2.5 text-slate-800"
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
    </div>
  );
}

// ------------------------------------------------------------------------------------------------
// Tab 4: สถิติกำลังพล & Export (Light Theme)
// ------------------------------------------------------------------------------------------------
function LightAnalyticsView({ users }: any) {
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
            {filtered.map((u: any, idx: number) => (
              <tr key={u.id} className="hover:bg-slate-50/60">
                <td className="p-3 font-mono text-slate-400">{idx + 1}</td>
                <td className="p-3 font-semibold text-slate-800">{u.rank} {u.firstName} {u.lastName}</td>
                <td className="p-3 text-slate-500">{u.category === "COMMISSIONED" ? "สัญญาบัตร" : "ประทวน"}</td>
                <td className="p-3 text-center font-mono">0</td>
                <td className="p-3 text-center font-mono">0</td>
                <td className="p-3 text-center font-mono">0</td>
                <td className="p-3 text-center font-mono">0</td>
                <td className="p-3 text-center font-mono font-bold text-blue-600">0</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ------------------------------------------------------------------------------------------------
// Tab 5: อนุมัติสิทธิ์กำลังพล (Admin)
// ------------------------------------------------------------------------------------------------
function LightAdminUsersView({ users, onRefresh }: any) {
  const [editId, setEditId] = useState<string | null>(null);
  const [rank, setRank] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [category, setCategory] = useState("NON_COMMISSIONED");

  const handleApprove = async (id: string) => {
    await fetch(`/api/users/${id}/approve`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ rank, firstName, lastName, category }),
    });
    setEditId(null);
    onRefresh();
  };

  return (
    <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm space-y-4">
      <h2 className="text-base font-bold text-slate-900">จัดการกำลังพล & อนุมัติสิทธิ์เข้าใช้งาน</h2>
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
            <tr>
              <th className="p-3">อีเมล Google</th>
              <th className="p-3">ยศ - ชื่อ สกุลจริง</th>
              <th className="p-3">ชั้นยศ</th>
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
                        className="w-16 border rounded p-1"
                      />
                      <input
                        placeholder="ชื่อ"
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                        className="w-24 border rounded p-1"
                      />
                      <input
                        placeholder="นามสกุล"
                        value={lastName}
                        onChange={(e) => setLastName(e.target.value)}
                        className="w-24 border rounded p-1"
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
                      className="px-3 py-1 bg-emerald-600 text-white rounded font-medium"
                    >
                      บันทึก
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