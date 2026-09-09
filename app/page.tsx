import { auth, signIn, signOut } from "@/auth";
import Link from "next/link";

export default async function HomePage() {
  const session = await auth();
  const user = session?.user as any;

  const isAdmin = user?.role === "ADMIN" || user?.role === "SUPER_ADMIN";
  const isApproved = user?.status === "APPROVED";

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 font-sans">
      {/* ส่วนหัวทางการ */}
      <header className="border-b border-slate-700 bg-slate-950 px-6 py-4 shadow-sm">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center space-x-3 text-center md:text-left">
            <div className="h-10 w-10 rounded bg-blue-900 border border-blue-600 flex items-center justify-center font-bold text-sm tracking-widest text-white shadow">
              กฝอ.
            </div>
            <div>
              <h1 className="text-base md:text-lg font-bold text-white tracking-wide">
                ระบบธุรการ กองเฝ้าระวังทางอวกาศ
              </h1>
              <p className="text-xs text-slate-400">
                Space Surveillance Division Administrative Management System
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-4 text-xs">
            {session ? (
              <div className="flex items-center space-x-3 bg-slate-900 px-3 py-2 rounded border border-slate-800">
                <div className="text-right">
                  <div className="font-semibold text-slate-200">
                    {user?.officialName || user?.name || "กำลังพล"}
                  </div>
                  <div className="text-[11px] text-slate-400 font-mono">
                    สิทธิ์: {user?.role || "USER"} | สถานะ: {user?.status || "PENDING"}
                  </div>
                </div>
                <form
                  action={async () => {
                    "use server";
                    await signOut();
                  }}
                >
                  <button
                    type="submit"
                    className="px-3 py-1.5 bg-red-950 hover:bg-red-900 text-red-200 border border-red-800 rounded transition"
                  >
                    ออกจากระบบ
                  </button>
                </form>
              </div>
            ) : (
              <form
                action={async () => {
                  "use server";
                  await signIn("google");
                }}
              >
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-700 hover:bg-blue-600 text-white font-semibold rounded shadow transition"
                >
                  เข้าสู่ระบบด้วย Google
                </button>
              </form>
            )}
          </div>
        </div>
      </header>

      {/* เนื้อหาหลัก */}
      <main className="max-w-6xl mx-auto p-6 md:p-8 space-y-6">
        {/* กล่องแจ้งเตือนสถานะอนุมัติ */}
        {session && !isApproved && (
          <div className="bg-amber-950/40 border border-amber-800/80 p-4 rounded text-xs text-amber-200 flex items-center justify-between">
            <div>
              <span className="font-bold">สถานะบัญชี: รอการอนุมัติ (PENDING)</span>
              <p className="text-[11px] text-amber-300/80 mt-0.5">
                บัญชีของคุณอยู่ระหว่างรอผู้ดูแลระบบตรวจสอบ ยืนยันยศ-ชื่อ-สกุลจริง และเปิดสิทธิ์การใช้งาน
              </p>
            </div>
            {isAdmin && (
              <Link
                href="/admin/users"
                className="px-3 py-1 bg-amber-600 hover:bg-amber-500 text-white font-medium rounded transition"
              >
                ไปหน้าอนุมัติสิทธิ์
              </Link>
            )}
          </div>
        )}

        {/* ตารางเมนูงานธุรการหลัก 4 ระบบ */}
        <div>
          <div className="border-b border-slate-800 pb-2 mb-4 flex justify-between items-end">
            <div>
              <h2 className="text-sm font-bold uppercase tracking-wider text-slate-300">
                ระบบงานธุรการและสารบรรณ
              </h2>
              <p className="text-xs text-slate-400">
                เลือกส่วนงานที่ต้องการเข้าดำเนินการหรือตรวจสอบข้อมูล
              </p>
            </div>
            {isAdmin && (
              <Link
                href="/admin/users"
                className="text-xs text-blue-400 hover:text-blue-300 underline font-medium"
              >
                [ จัดการรายชื่อและอนุมัติผู้ใช้งาน ]
              </Link>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* เมนู 1 */}
            <div className="bg-slate-950 border border-slate-800 rounded p-5 flex flex-col justify-between hover:border-slate-700 transition">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-mono text-blue-400 font-semibold uppercase">
                    ระบบที่ 1
                  </span>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-slate-900 border border-slate-700 text-slate-300">
                    เปิดใช้งาน
                  </span>
                </div>
                <h3 className="text-base font-bold text-white">
                  ปฏิทินภารกิจและการลา
                </h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  ตรวจสอบตารางภารกิจประจำวันของกอง บันทึกคำขอลาตามระเบียบราชการ (ลาพักผ่อน, ลาป่วย, ลากิจ) และระบบอนุมัติใบลา
                </p>
              </div>
              <div className="pt-4 mt-4 border-t border-slate-900">
                <Link
                  href="/calendar"
                  className="inline-flex items-center text-xs font-semibold text-blue-400 hover:text-blue-300"
                >
                  เข้าสู่ปฏิทินและบันทึกการลา →
                </Link>
              </div>
            </div>

            {/* เมนู 2 */}
            <div className="bg-slate-950 border border-slate-800 rounded p-5 flex flex-col justify-between hover:border-slate-700 transition">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-mono text-blue-400 font-semibold uppercase">
                    ระบบที่ 2
                  </span>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-slate-900 border border-slate-700 text-slate-300">
                    เปิดใช้งาน
                  </span>
                </div>
                <h3 className="text-base font-bold text-white">
                  ทะเบียนไปราชการประจำกอง
                </h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  ทะเบียนประวัติผลัดไปราชการ: สฝอว.สม., สฝอว.ดน. และราชการอื่นๆ ติดตามรายชื่อกำลังพลและรอบผลัดประจำปีงบประมาณ/พ.ศ.
                </p>
              </div>
              <div className="pt-4 mt-4 border-t border-slate-900">
                <Link
                  href="/deployments"
                  className="inline-flex items-center text-xs font-semibold text-blue-400 hover:text-blue-300"
                >
                  ตรวจสอบทะเบียนราชการ →
                </Link>
              </div>
            </div>

            {/* เมนู 3 */}
            <div className="bg-slate-950 border border-slate-800 rounded p-5 flex flex-col justify-between hover:border-slate-700 transition">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-mono text-blue-400 font-semibold uppercase">
                    ระบบที่ 3
                  </span>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-slate-900 border border-slate-700 text-slate-300">
                    ระบบคำนวณอัตโนมัติ
                  </span>
                </div>
                <h3 className="text-base font-bold text-white">
                  ระบบจัดผลัดและเวรปฏิบัติการอัตโนมัติ
                </h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  จัดผลัดราชการ, เวรนำแถว 1-5, เวรบรรยายสรุป, เวรพูดหน้าแถว พร้อมกำหนดตัวจริง/สำรอง โดยคำนวณจากผู้มีสถิติน้อยสุดและไม่ติดภารกิจ/การลา
                </p>
              </div>
              <div className="pt-4 mt-4 border-t border-slate-900">
                <Link
                  href="/duty-generator"
                  className="inline-flex items-center text-xs font-semibold text-blue-400 hover:text-blue-300"
                >
                  เข้าสู่ระบบจัดเวรอัตโนมัติ →
                </Link>
              </div>
            </div>

            {/* เมนู 4 */}
            <div className="bg-slate-950 border border-slate-800 rounded p-5 flex flex-col justify-between hover:border-slate-700 transition">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-mono text-blue-400 font-semibold uppercase">
                    ระบบที่ 4
                  </span>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-slate-900 border border-slate-700 text-slate-300">
                    รายงานสถิติ
                  </span>
                </div>
                <h3 className="text-base font-bold text-white">
                  สถิติการปฏิบัติราชการและประวัติเวร
                </h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  สรุปสถิติการลาประเภทต่างๆ จำนวนครั้งการไปราชการประจำ และจำนวนครั้งการเข้าเวรสะสมแยกรายปี พ.ศ. ข้อมูลจัดเก็บต่อเนื่องไม่สูญหาย
                </p>
              </div>
              <div className="pt-4 mt-4 border-t border-slate-900">
                <Link
                  href="/statistics"
                  className="inline-flex items-center text-xs font-semibold text-blue-400 hover:text-blue-300"
                >
                  ดูรายงานและสถิติสะสม →
                </Link>
              </div>
            </div>
          </div>
        </div>
      </main>

      <footer className="border-t border-slate-800 py-6 text-center text-[11px] text-slate-500">
        ระบบธุรการ กองเฝ้าระวังทางอวกาศ • สำหรับใช้งานภายในหน่วยงานราชการเท่านั้น
      </footer>
    </div>
  );
}