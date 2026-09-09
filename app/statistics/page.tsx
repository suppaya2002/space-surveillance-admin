"use client";

import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import {
  BarChart3,
  Users,
  PlaneTakeoff,
  Clock,
  ShieldCheck,
  Search,
  Download,
  Calendar,
  Layers,
} from "lucide-react";

interface StatUser {
  id: string;
  officialName: string | null;
  name: string | null;
  rank: string | null;
  officerType: "COMMISSIONED" | "NON_COMMISSIONED";
  leaves: {
    type: string;
    startDate: string;
    endDate: string;
  }[];
  deployments: {
    deployment: {
      location: "SAMUT_SONGKRAM" | "DON_MUEANG" | "OTHER";
      buddhistYear: number;
    };
  }[];
  dutyAssigns: {
    buddhistYear: number;
    role: "PRIMARY" | "RESERVE";
    dutyCategory: { name: string };
  }[];
}

export default function PersonnelAnalyticsPage() {
  const currentYear = new Date().getFullYear() + 543;
  const [selectedYear, setSelectedYear] = useState(currentYear);
  const [users, setUsers] = useState<StatUser[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [officerFilter, setOfficerFilter] = useState<"ALL" | "COMMISSIONED" | "NON_COMMISSIONED">("ALL");

  const fetchStats = async () => {
    try {
      const res = await fetch("/api/admin/users");
      if (res.ok) {
        const uList = await res.json();
        // ดึงความสัมพันธ์ที่ครบถ้วนผ่าน API stats
        const sRes = await fetch("/api/leaves");
        const dRes = await fetch("/api/deployments");
        const cRes = await fetch("/api/duty/categories");

        const [leaves, deployments, categories] = await Promise.all([
          sRes.ok ? sRes.json() : [],
          dRes.ok ? dRes.json() : [],
          cRes.ok ? cRes.json() : [],
        ]);

        const mapped: StatUser[] = uList.map((u: any) => ({
          ...u,
          leaves: leaves.filter((l: any) => l.user?.id === u.id && l.status === "APPROVED"),
          deployments: deployments.flatMap((d: any) =>
            d.members.some((m: any) => m.user?.id === u.id) ? [{ deployment: d }] : []
          ),
          dutyAssigns: categories.flatMap((c: any) =>
            (c.assignments || [])
              .filter((a: any) => a.user?.id === u.id)
              .map((a: any) => ({ ...a, dutyCategory: { name: c.name } }))
          ),
        }));
        setUsers(mapped);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  // คำนวณสถิติตามปี พ.ศ.
  const analyticsData = useMemo(() => {
    return users.map((u) => {
      // นับผลัดราชการแยกสถานที่
      const depSM = u.deployments.filter(
        (d) => d.deployment.location === "SAMUT_SONGKRAM" && d.deployment.buddhistYear === selectedYear
      ).length;
      const depDN = u.deployments.filter(
        (d) => d.deployment.location === "DON_MUEANG" && d.deployment.buddhistYear === selectedYear
      ).length;
      const depOther = u.deployments.filter(
        (d) => d.deployment.location === "OTHER" && d.deployment.buddhistYear === selectedYear
      ).length;

      // วันลาแยกตามประเภท (คำนวณตามปี พ.ศ.)
      const leaveSick = u.leaves.filter(
        (l) => l.type === "SICK" && new Date(l.startDate).getFullYear() + 543 === selectedYear
      ).length;
      const leaveBusiness = u.leaves.filter(
        (l) => l.type === "BUSINESS" && new Date(l.startDate).getFullYear() + 543 === selectedYear
      ).length;
      const leaveAnnual = u.leaves.filter(
        (l) => l.type === "ANNUAL" && new Date(l.startDate).getFullYear() + 543 === selectedYear
      ).length;

      // เวรในปีนั้น
      const dutyCount = u.dutyAssigns.filter((d) => d.buddhistYear === selectedYear).length;
      const dutyTotalAllTime = u.dutyAssigns.length;

      return {
        ...u,
        depSM,
        depDN,
        depOther,
        leaveSick,
        leaveBusiness,
        leaveAnnual,
        totalLeavesThisYear: leaveSick + leaveBusiness + leaveAnnual,
        dutyCount,
        dutyTotalAllTime,
      };
    });
  }, [users, selectedYear]);

  // กรองตามคำค้นหาและชั้นยศ
  const filteredUsers = useMemo(() => {
    return analyticsData.filter((u) => {
      const matchSearch =
        searchQuery === "" ||
        (u.officialName || u.name || "").toLowerCase().includes(searchQuery.toLowerCase());
      const matchOfficer = officerFilter === "ALL" || u.officerType === officerFilter;
      return matchSearch && matchOfficer;
    });
  }, [analyticsData, searchQuery, officerFilter]);

  // KPI Calculations
  const totalPersonnel = users.length;
  const totalDeploymentsInYear = analyticsData.reduce((acc, curr) => acc + curr.depSM + curr.depDN + curr.depOther, 0);
  const totalLeavesInYear = analyticsData.reduce((acc, curr) => acc + curr.totalLeavesThisYear, 0);
  const avgDutiesInYear = totalPersonnel > 0
    ? (analyticsData.reduce((acc, curr) => acc + curr.dutyCount, 0) / totalPersonnel).toFixed(1)
    : "0";

  // Export CSV Function
  const exportToCSV = () => {
    const headers = [
      "ลำดับ",
      "ยศ-ชื่อ สกุล",
      "ชั้นยศ",
      `ราชการ สฝอว.สม. (${selectedYear})`,
      `ราชการ สฝอว.ดน. (${selectedYear})`,
      `ลาป่วย`,
      `ลากิจ`,
      `ลาพักผ่อน`,
      `เข้าเวรปี ${selectedYear}`,
      "เข้าเวรสะสมทั้งหมด",
    ];

    const rows = filteredUsers.map((u, i) => [
      i + 1,
      `"${u.officialName || u.name || "-"}"`,
      u.officerType === "COMMISSIONED" ? "สัญญาบัตร" : "ประทวน",
      u.depSM,
      u.depDN,
      u.leaveSick,
      u.leaveBusiness,
      u.leaveAnnual,
      u.dutyCount,
      u.dutyTotalAllTime,
    ]);

    const csvContent = "\uFEFF" + [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `สถิติกำลังพล_กองเฝ้าระวังทางอวกาศ_พศ_${selectedYear}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="min-h-screen bg-[#020617] text-slate-100 p-4 md:p-8 font-sans">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-5">
          <div className="flex items-center space-x-3">
            <div className="h-10 w-10 rounded-lg bg-sky-950/80 border border-sky-500/30 flex items-center justify-center text-sky-400 shadow-[0_0_15px_rgba(56,189,248,0.2)]">
              <BarChart3 className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono font-bold tracking-widest text-sky-400 uppercase bg-sky-950/60 px-2 py-0.5 rounded border border-sky-800/50">
                  SYSTEM MODULE 04
                </span>
                <span className="text-[10px] text-slate-500 font-mono">PERSONNEL ANALYTICS & HISTORY</span>
              </div>
              <h1 className="text-xl md:text-2xl font-bold tracking-tight text-white mt-0.5">
                ศูนย์รวมสถิติกำลังพลประจำปี
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-3 self-start md:self-auto">
            {/* Year Selector Dropdown */}
            <div className="flex items-center bg-[#0f172a] border border-[#1e293b] rounded-lg px-3 py-1.5 space-x-2">
              <Calendar className="w-4 h-4 text-sky-400" />
              <span className="text-xs text-slate-400">ปี พ.ศ.</span>
              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(parseInt(e.target.value, 10))}
                className="bg-transparent text-white font-mono font-bold text-xs focus:outline-none cursor-pointer"
              >
                {[currentYear + 1, currentYear, currentYear - 1, currentYear - 2].map((y) => (
                  <option key={y} value={y} className="bg-slate-900 text-white">
                    {y}
                  </option>
                ))}
              </select>
            </div>

            <button
              onClick={exportToCSV}
              className="px-3.5 py-2 text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg shadow-[0_0_15px_rgba(16,185,129,0.3)] transition flex items-center gap-1.5"
            >
              <Download className="w-4 h-4" /> ส่งออก Excel (CSV)
            </button>

            <Link
              href="/"
              className="px-4 py-2 text-xs font-semibold bg-[#0f172a] hover:bg-slate-800 text-slate-300 border border-slate-800 rounded-lg transition"
            >
              ← กลับศูนย์บัญชาการ
            </Link>
          </div>
        </header>

        {/* 4 Tactical KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-[#0f172a] border border-[#1e293b] rounded-xl p-4 shadow-xl flex items-center justify-between">
            <div>
              <span className="text-[11px] font-mono text-slate-400 uppercase tracking-wider">กำลังพลในระบบ</span>
              <div className="text-2xl font-extrabold text-white font-mono mt-1">{totalPersonnel} นาย</div>
              <span className="text-[10px] text-emerald-400 font-mono">พร้อมปฏิบัติการ</span>
            </div>
            <div className="h-10 w-10 rounded-lg bg-sky-950/60 border border-sky-800/50 flex items-center justify-center text-sky-400">
              <Users className="w-5 h-5" />
            </div>
          </div>

          <div className="bg-[#0f172a] border border-[#1e293b] rounded-xl p-4 shadow-xl flex items-center justify-between">
            <div>
              <span className="text-[11px] font-mono text-slate-400 uppercase tracking-wider">ผลัดราชการสะสม ({selectedYear})</span>
              <div className="text-2xl font-extrabold text-sky-400 font-mono mt-1">{totalDeploymentsInYear} ครั้ง</div>
              <span className="text-[10px] text-slate-400 font-mono">สฝอว.สม. / ดน. / อื่นๆ</span>
            </div>
            <div className="h-10 w-10 rounded-lg bg-blue-950/60 border border-blue-800/50 flex items-center justify-center text-blue-400">
              <PlaneTakeoff className="w-5 h-5" />
            </div>
          </div>

          <div className="bg-[#0f172a] border border-[#1e293b] rounded-xl p-4 shadow-xl flex items-center justify-between">
            <div>
              <span className="text-[11px] font-mono text-slate-400 uppercase tracking-wider">สถิติการลาสะสม ({selectedYear})</span>
              <div className="text-2xl font-extrabold text-amber-400 font-mono mt-1">{totalLeavesInYear} ครั้ง</div>
              <span className="text-[10px] text-slate-400 font-mono">ป่วย / กิจ / พักผ่อน</span>
            </div>
            <div className="h-10 w-10 rounded-lg bg-amber-950/60 border border-amber-800/50 flex items-center justify-center text-amber-400">
              <Clock className="w-5 h-5" />
            </div>
          </div>

          <div className="bg-[#0f172a] border border-[#1e293b] rounded-xl p-4 shadow-xl flex items-center justify-between">
            <div>
              <span className="text-[11px] font-mono text-slate-400 uppercase tracking-wider">เข้าเวรเฉลี่ย/นาย ({selectedYear})</span>
              <div className="text-2xl font-extrabold text-purple-400 font-mono mt-1">{avgDutiesInYear} ครั้ง</div>
              <span className="text-[10px] text-purple-400 font-mono">Fair-Share Ratio</span>
            </div>
            <div className="h-10 w-10 rounded-lg bg-purple-950/60 border border-purple-800/50 flex items-center justify-center text-purple-400">
              <ShieldCheck className="w-5 h-5" />
            </div>
          </div>
        </div>

        {/* Master Control Bar (Search & Filter) */}
        <div className="bg-[#0f172a] border border-[#1e293b] rounded-xl p-3 flex flex-col md:flex-row items-center justify-between gap-3 shadow-xl">
          <div className="flex items-center gap-1.5 w-full md:w-auto">
            <button
              onClick={() => setOfficerFilter("ALL")}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                officerFilter === "ALL"
                  ? "bg-sky-600 text-white"
                  : "bg-[#020617] text-slate-400 hover:text-white border border-slate-800"
              }`}
            >
              กำลังพลทั้งหมด ({analyticsData.length})
            </button>
            <button
              onClick={() => setOfficerFilter("COMMISSIONED")}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                officerFilter === "COMMISSIONED"
                  ? "bg-purple-600 text-white"
                  : "bg-[#020617] text-slate-400 hover:text-white border border-slate-800"
              }`}
            >
              สัญญาบัตร
            </button>
            <button
              onClick={() => setOfficerFilter("NON_COMMISSIONED")}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                officerFilter === "NON_COMMISSIONED"
                  ? "bg-blue-600 text-white"
                  : "bg-[#020617] text-slate-400 hover:text-white border border-slate-800"
              }`}
            >
              ประทวน
            </button>
          </div>

          <div className="relative w-full md:w-72">
            <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="ค้นหาชื่อกำลังพล..."
              className="w-full bg-[#020617] border border-[#1e293b] rounded-lg pl-8 pr-3 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-sky-500 font-sans"
            />
          </div>
        </div>

        {/* Master Data Table */}
        <div className="bg-[#0f172a] border border-[#1e293b] rounded-xl overflow-hidden shadow-2xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#020617] text-slate-400 border-b border-slate-800 font-mono uppercase tracking-wider text-[11px]">
                <tr>
                  <th className="p-4 w-12 text-center">#</th>
                  <th className="p-4">ยศ - ชื่อ สกุล</th>
                  <th className="p-4">ชั้นยศ</th>
                  <th className="p-4 text-center">สฝอว.สม.</th>
                  <th className="p-4 text-center">สฝอว.ดน.</th>
                  <th className="p-4 text-center">ลาป่วย</th>
                  <th className="p-4 text-center">ลากิจ</th>
                  <th className="p-4 text-center">ลาพักผ่อน</th>
                  <th className="p-4 text-center text-sky-400 font-bold">เวรปี {selectedYear}</th>
                  <th className="p-4 text-center text-emerald-400 font-bold">เวรสะสมทั้งหมด</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-sans">
                {loading ? (
                  <tr>
                    <td colSpan={10} className="text-center py-16 text-slate-500 font-mono">
                      กำลังประมวลผลฐานข้อมูลกำลังพล...
                    </td>
                  </tr>
                ) : filteredUsers.length === 0 ? (
                  <tr>
                    <td colSpan={10} className="text-center py-16 text-slate-500 font-mono">
                      ไม่พบข้อมูลกำลังพลตามเงื่อนไขที่เลือก
                    </td>
                  </tr>
                ) : (
                  filteredUsers.map((u, index) => {
                    const isCommissioned = u.officerType === "COMMISSIONED";
                    return (
                      <tr key={u.id} className="hover:bg-[#020617]/50 transition">
                        <td className="p-4 text-center font-mono text-slate-500">{index + 1}</td>
                        <td className="p-4 font-semibold text-slate-100">
                          {u.officialName || u.name || "-"}
                        </td>
                        <td className="p-4">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-mono border ${
                              isCommissioned
                                ? "bg-purple-950/80 text-purple-300 border-purple-700/60"
                                : "bg-blue-950/80 text-blue-300 border-blue-700/60"
                            }`}
                          >
                            {isCommissioned ? "สัญญาบัตร" : "ประทวน"}
                          </span>
                        </td>
                        <td className="p-4 text-center font-mono text-slate-300">{u.depSM}</td>
                        <td className="p-4 text-center font-mono text-slate-300">{u.depDN}</td>
                        <td className="p-4 text-center font-mono text-amber-400">{u.leaveSick}</td>
                        <td className="p-4 text-center font-mono text-amber-400">{u.leaveBusiness}</td>
                        <td className="p-4 text-center font-mono text-amber-400">{u.leaveAnnual}</td>
                        <td className="p-4 text-center font-mono text-sky-400 font-bold bg-sky-950/20">
                          {u.dutyCount}
                        </td>
                        <td className="p-4 text-center font-mono text-emerald-400 font-bold bg-emerald-950/20">
                          {u.dutyTotalAllTime}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}