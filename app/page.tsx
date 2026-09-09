"use client";

import { useSession, signIn, signOut } from "next-auth/react";
import Link from "next/link";

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const user = session?.user as any;
  const isAdmin = user?.role === "ADMIN" || user?.role === "SUPER_ADMIN";

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      {/* Top Navigation Bar */}
      <header className="border-b border-slate-800 bg-slate-900/80 backdrop-blur sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-lg bg-blue-600 flex items-center justify-center font-bold text-white shadow-lg shadow-blue-500/30">
              SSA
            </div>
            <div>
              <div className="font-semibold text-sm tracking-wide text-white">
                กองเฝ้าระวังทางอวกาศ
              </div>
              <div className="text-[11px] text-slate-400">
                Space Surveillance Operation Center
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            {status === "loading" ? (
              <span className="text-xs text-slate-400">กำลังโหลด...</span>
            ) : session ? (
              <div className="flex items-center space-x-3">
                <div className="text-right hidden sm:block">
                  <div className="text-xs font-medium text-slate-200">
                    {user?.officialName || user?.name}
                  </div>
                  <div className="text-[10px] text-emerald-400 font-mono">
                    [{user?.role || "USER"}]
                  </div>
                </div>
                <button
                  onClick={() => signOut()}
                  className="px-3 py-1.5 text-xs bg-slate-800 hover:bg-red-950/60 hover:text-red-400 border border-slate-700 hover:border-red-800 rounded-md transition"
                >
                  ออกจากระบบ
                </button>
              </div>
            ) : (
              <button
                onClick={() => signIn("google")}
                className="px-4 py-1.5 text-xs font-medium bg-blue-600 hover:bg-blue-500 text-white rounded-md shadow transition"
              >
                เข้าสู่ระบบ
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-6 py-8 space-y-8">
        {/* Banner Section */}
        <div className="relative rounded-2xl bg-gradient-to-r from-blue-950/70 via-slate-900 to-slate-900 border border-slate-800 p-6 sm:p-8 overflow-hidden shadow-xl">
          <div className="relative z-10 max-w-2xl">
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-500/10 text-blue-400 border border-blue-500/20 mb-3">
              ระบบศูนย์ข้อมูลและการปฏิบัติการส่วนกลาง
            </span>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white mb-2">
              ระบบบริหารจัดการเวรและภารกิจธุรการ
            </h1>
            <p className="text-sm text-slate-400 leading-relaxed">
              ควบคุม ติดตามสถานะวงโคจรวัตถุอวกาศ และบริหารการจัดเวรประจำการตามลำดับสายการบังคับบัญชา
            </p>
          </div>
        </div>

        {/* Quick Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-slate-900/60 border border-slate-800/80 rounded-xl p-5">
            <div className="text-xs text-slate-400 font-medium">สถานะระบบเครือข่าย</div>
            <div className="mt-2 flex items-baseline space-x-2">
              <span className="text-2xl font-bold text-white tracking-tight">ONLINE</span>
              <span className="inline-block w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            </div>
            <div className="text-[11px] text-slate-500 mt-1">Supabase DB Connected</div>
          </div>

          <div className="bg-slate-900/60 border border-slate-800/80 rounded-xl p-5">
            <div className="text-xs text-slate-400 font-medium">เวรประจำการปัจจุบัน</div>
            <div className="mt-2 text-2xl font-bold text-slate-200 tracking-tight">
              ผลัดกลางวัน
            </div>
            <div className="text-[11px] text-blue-400 mt-1">08:00 - 16:00 น.</div>
          </div>

          <div className="bg-slate-900/60 border border-slate-800/80 rounded-xl p-5">
            <div className="text-xs text-slate-400 font-medium">การติดตามดาวเทียม</div>
            <div className="mt-2 text-2xl font-bold text-cyan-400 tracking-tight">
              NORMAL
            </div>
            <div className="text-[11px] text-slate-500 mt-1">LEO / GEO Track Active</div>
          </div>

          <div className="bg-slate-900/60 border border-slate-800/80 rounded-xl p-5">
            <div className="text-xs text-slate-400 font-medium">ระดับสิทธิ์ของคุณ</div>
            <div className="mt-2 text-2xl font-bold text-amber-400 tracking-tight">
              {user?.role || "GUEST"}
            </div>
            <div className="text-[11px] text-slate-500 mt-1">
              สถานะ: {user?.status || "WAITING"}
            </div>
          </div>
        </div>

        {/* Modules Section */}
        <div>
          <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-4">
            ระบบงานหลัก (Operational Modules)
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {/* Module 1 */}
            <Link
              href="/duty-generator"
              className="group bg-slate-900/50 hover:bg-slate-900 border border-slate-800 hover:border-blue-500/50 rounded-xl p-6 transition-all duration-200 flex flex-col justify-between shadow-lg"
            >
              <div>
                <div className="text-blue-400 font-mono text-xs mb-1">MODULE 01</div>
                <h3 className="text-lg font-semibold text-white group-hover:text-blue-400 transition">
                  จัดตารางเวรปฏิบัติการ
                </h3>
                <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                  ระบบคำนวณและสุ่มจัดผลัดเวรเจ้าหน้าที่ตามเงื่อนไขวันหยุดและวันราชการ
                </p>
              </div>
              <div className="mt-6 flex items-center text-xs text-blue-400 font-medium group-hover:translate-x-1 transition-transform">
                เข้าสู่ระบบจัดเวร →
              </div>
            </Link>

            {/* Module 2 */}
            <Link
              href="/deployments"
              className="group bg-slate-900/50 hover:bg-slate-900 border border-slate-800 hover:border-cyan-500/50 rounded-xl p-6 transition-all duration-200 flex flex-col justify-between shadow-lg"
            >
              <div>
                <div className="text-cyan-400 font-mono text-xs mb-1">MODULE 02</div>
                <h3 className="text-lg font-semibold text-white group-hover:text-cyan-400 transition">
                  ภารกิจและการปฏิบัติการ
                </h3>
                <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                  ทะเบียนรายการภารกิจ มอบหมายงานเฝ้าระวัง และประวัติการสังเกตการณ์
                </p>
              </div>
              <div className="mt-6 flex items-center text-xs text-cyan-400 font-medium group-hover:translate-x-1 transition-transform">
                ดูบันทึกภารกิจ →
              </div>
            </Link>

            {/* Module 3 */}
            <Link
              href="/statistics"
              className="group bg-slate-900/50 hover:bg-slate-900 border border-slate-800 hover:border-indigo-500/50 rounded-xl p-6 transition-all duration-200 flex flex-col justify-between shadow-lg"
            >
              <div>
                <div className="text-indigo-400 font-mono text-xs mb-1">MODULE 03</div>
                <h3 className="text-lg font-semibold text-white group-hover:text-indigo-400 transition">
                  สถิติและรายงานสรุป
                </h3>
                <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                  สรุปชั่วโมงการเข้าเวร จำนวนครั้งสะสม และส่งออกเอกสารรายงานธุรการ
                </p>
              </div>
              <div className="mt-6 flex items-center text-xs text-indigo-400 font-medium group-hover:translate-x-1 transition-transform">
                ดูสถิติภาพรวม →
              </div>
            </Link>
          </div>
        </div>

        {/* Administration Section */}
        {isAdmin && (
          <div className="border-t border-slate-800/80 pt-6">
            <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-4">
              ส่วนงานผู้ดูแลระบบ (Administration)
            </h2>
            <div className="bg-slate-900/40 border border-slate-800 rounded-xl p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <div className="font-medium text-slate-200 text-sm">
                  การอนุมัติและจัดการสิทธิ์ผู้ใช้งาน (User Access Control)
                </div>
                <div className="text-xs text-slate-400 mt-0.5">
                  ตรวจสอบคำขอใช้งาน อนุมัติสิทธิ์ และกำหนดระดับชั้นความลับของกำลังพล
                </div>
              </div>
              <Link
                href="/admin/users"
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium rounded-lg border border-slate-700 transition"
              >
                จัดการผู้ใช้งาน
              </Link>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-900 bg-slate-950 py-4 text-center text-[11px] text-slate-600">
        กองเฝ้าระวังทางอวกาศ • Space Surveillance Command and Control Portal • Confidential & Official Use Only
      </footer>
    </div>
  );
}