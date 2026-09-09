import Link from "next/link";

export default function HomePage() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-6 bg-slate-50 text-slate-800">
      <h1 className="text-3xl font-bold mb-4">ระบบธุรการกองเฝ้าระวังทางอวกาศ</h1>
      <p className="text-slate-600 mb-8">ยินดีต้อนรับเข้าสู่ระบบจัดการและบริหารเวรปฏิบัติการ</p>
      <div className="flex gap-4">
        <Link
          href="/deployments"
          className="px-5 py-2.5 bg-blue-600 text-white font-medium rounded-lg shadow hover:bg-blue-700 transition"
        >
          ไปหน้ารายการภารกิจ
        </Link>
        <Link
          href="/admin/users"
          className="px-5 py-2.5 bg-slate-200 text-slate-800 font-medium rounded-lg hover:bg-slate-300 transition"
        >
          จัดการผู้ใช้งาน
        </Link>
      </div>
    </main>
  );
}