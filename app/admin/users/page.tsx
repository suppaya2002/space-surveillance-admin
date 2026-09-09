"use client";

import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import Link from "next/link";

interface UserItem {
  id: string;
  email: string;
  name: string | null;
  officialName: string | null;
  rank: string | null;
  officerType: "COMMISSIONED" | "NON_COMMISSIONED";
  role: "SUPER_ADMIN" | "ADMIN" | "USER";
  status: "PENDING" | "APPROVED" | "SUSPENDED";
}

export default function AdminUsersPage() {
  const { data: session } = useSession();
  const currentUser = session?.user as any;
  const isSuperAdmin = currentUser?.role === "SUPER_ADMIN";

  const [users, setUsers] = useState<UserItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState<string | null>(null);

  const fetchUsers = async () => {
    try {
      const res = await fetch("/api/admin/users");
      if (res.ok) {
        const data = await res.json();
        setUsers(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleUpdate = async (user: UserItem) => {
    setSavingId(user.id);
    try {
      const res = await fetch("/api/admin/users", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(user),
      });
      if (res.ok) {
        alert("บันทึกข้อมูลเรียบร้อย");
        fetchUsers();
      } else {
        const err = await res.json();
        alert(err.error || "เกิดข้อผิดพลาด");
      }
    } catch {
      alert("เชื่อมต่อเซิร์ฟเวอร์ล้มเหลว");
    } finally {
      setSavingId(null);
    }
  };

  const handleFieldChange = (id: string, field: keyof UserItem, value: any) => {
    setUsers((prev) =>
      prev.map((u) => (u.id === id ? { ...u, [field]: value } : u))
    );
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans p-6 md:p-10">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-5">
          <div>
            <div className="flex items-center space-x-2 text-xs text-blue-400 font-mono mb-1">
              <Link href="/" className="hover:underline">DASHBOARD</Link>
              <span>/</span>
              <span>ADMINISTRATION</span>
            </div>
            <h1 className="text-2xl font-bold text-white tracking-tight">
              จัดการและอนุมัติสิทธิ์ผู้ใช้งาน
            </h1>
            <p className="text-xs text-slate-400 mt-1">
              กำหนด ยศ-ชื่อ-สกุลจริง ประเภทชั้นยศ และควบคุมสิทธิ์การเข้าถึงระบบ
            </p>
          </div>
          <Link
            href="/"
            className="px-4 py-2 text-xs bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-700 rounded-lg transition self-start sm:self-auto"
          >
            ← กลับหน้าหลัก
          </Link>
        </div>

        {/* User Table */}
        <div className="bg-slate-900/60 border border-slate-800 rounded-xl overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-900 text-slate-400 border-b border-slate-800 font-semibold uppercase tracking-wider">
                <tr>
                  <th className="p-4">ผู้ใช้งาน (Google)</th>
                  <th className="p-4">ยศ - ชื่อ สกุลจริง</th>
                  <th className="p-4">ชั้นยศ</th>
                  <th className="p-4">ระดับสิทธิ์</th>
                  <th className="p-4">สถานะอนุมัติ</th>
                  <th className="p-4 text-center">การกระทำ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {loading ? (
                  <tr>
                    <td colSpan={6} className="text-center py-8 text-slate-500">
                      กำลังโหลดข้อมูล...
                    </td>
                  </tr>
                ) : users.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="text-center py-8 text-slate-500">
                      ไม่พบข้อมูลผู้ใช้งาน
                    </td>
                  </tr>
                ) : (
                  users.map((u) => (
                    <tr key={u.id} className="hover:bg-slate-800/30 transition">
                      <td className="p-4">
                        <div className="font-medium text-slate-200">{u.name || "-"}</div>
                        <div className="text-[11px] text-slate-400 font-mono">{u.email}</div>
                      </td>

                      <td className="p-4">
                        <input
                          type="text"
                          value={u.officialName || ""}
                          placeholder="เช่น จ.อ.สัญญา บุวงศ์"
                          onChange={(e) => handleFieldChange(u.id, "officialName", e.target.value)}
                          className="bg-slate-950 border border-slate-700 rounded px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-blue-500 w-48"
                        />
                      </td>

                      <td className="p-4">
                        <select
                          value={u.officerType}
                          onChange={(e) => handleFieldChange(u.id, "officerType", e.target.value)}
                          className="bg-slate-950 border border-slate-700 rounded px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-blue-500"
                        >
                          <option value="NON_COMMISSIONED">ประทวน</option>
                          <option value="COMMISSIONED">สัญญาบัตร</option>
                        </select>
                      </td>

                      <td className="p-4">
                        <select
                          value={u.role}
                          disabled={!isSuperAdmin && (u.role === "ADMIN" || u.role === "SUPER_ADMIN")}
                          onChange={(e) => handleFieldChange(u.id, "role", e.target.value)}
                          className="bg-slate-950 border border-slate-700 rounded px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-blue-500 disabled:opacity-50"
                        >
                          <option value="USER">USER</option>
                          <option value="ADMIN">ADMIN</option>
                          {isSuperAdmin && <option value="SUPER_ADMIN">SUPER_ADMIN</option>}
                        </select>
                      </td>

                      <td className="p-4">
                        <select
                          value={u.status}
                          onChange={(e) => handleFieldChange(u.id, "status", e.target.value)}
                          className={`border rounded px-2.5 py-1.5 text-xs font-semibold focus:outline-none ${
                            u.status === "APPROVED"
                              ? "bg-emerald-950/40 text-emerald-400 border-emerald-800"
                              : u.status === "PENDING"
                              ? "bg-amber-950/40 text-amber-400 border-amber-800"
                              : "bg-red-950/40 text-red-400 border-red-800"
                          }`}
                        >
                          <option value="PENDING">PENDING (รออนุมัติ)</option>
                          <option value="APPROVED">APPROVED (อนุมัติแล้ว)</option>
                          <option value="SUSPENDED">SUSPENDED (ระงับ)</option>
                        </select>
                      </td>

                      <td className="p-4 text-center">
                        <button
                          onClick={() => handleUpdate(u)}
                          disabled={savingId === u.id}
                          className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 disabled:bg-slate-700 text-white font-medium rounded transition"
                        >
                          {savingId === u.id ? "กำลังบันทึก..." : "บันทึก"}
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}