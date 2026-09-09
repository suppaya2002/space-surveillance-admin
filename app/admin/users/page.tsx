"use client";

import React, { useState, useEffect } from "react";
import { useSession } from "next-auth/react";

interface UserProfile {
  id: string;
  email: string;
  name: string | null;
  officialName: string | null;
  rankType: "COMMISSIONED" | "NON_COMMISSIONED" | null;
  role: "SUPER_ADMIN" | "ADMIN" | "USER";
  status: "PENDING" | "APPROVED" | "REJECTED";
}

export default function UserApprovalPage() {
  const { data: session } = useSession();
  const [users, setUsers] = useState<UserProfile[]>([]);
  const isSuperAdmin = (session?.user as any)?.role === "SUPER_ADMIN";

  const fetchUsers = async () => {
    const res = await fetch("/api/admin/users");
    if (res.ok) setUsers(await res.json());
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleUpdateUser = async (
    userId: string,
    updates: Partial<UserProfile>
  ) => {
    const res = await fetch(`/api/admin/users/${userId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updates),
    });

    if (res.ok) {
      alert("อัปเดตข้อมูลผู้ใช้เรียบร้อย");
      fetchUsers();
    } else {
      const err = await res.json();
      alert(`ไม่สามารถบันทึกได้: ${err.message}`);
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">
          การอนุมัติและจัดการสิทธิ์ผู้ใช้งาน
        </h1>
        <p className="text-sm text-slate-500">
          กำหนด ยศ-ชื่อ-นามสกุลจริง ให้กับบัญชี Gmail และแต่งตั้งบทบาทหน้าที่
        </p>
      </div>

      <div className="bg-white rounded-lg border shadow-sm overflow-hidden">
        <table className="min-w-full divide-y divide-slate-200 text-sm">
          <thead className="bg-slate-50">
            <tr>
              <th className="px-4 py-3 text-left font-semibold text-slate-700">บัญชี Gmail</th>
              <th className="px-4 py-3 text-left font-semibold text-slate-700">ยศ - ชื่อ - นามสกุล ทางราชการ</th>
              <th className="px-4 py-3 text-left font-semibold text-slate-700">ประเภทกำลังพล</th>
              <th className="px-4 py-3 text-left font-semibold text-slate-700">ระดับสิทธิ์</th>
              <th className="px-4 py-3 text-center font-semibold text-slate-700">สถานะ</th>
              <th className="px-4 py-3 text-center font-semibold text-slate-700">การจัดการ</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {users.map((u) => (
              <UserRowItem
                key={u.id}
                user={u}
                isSuperAdmin={isSuperAdmin}
                onSave={(updates) => handleUpdateUser(u.id, updates)}
              />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function UserRowItem({
  user,
  isSuperAdmin,
  onSave,
}: {
  user: UserProfile;
  isSuperAdmin: boolean;
  onSave: (updates: Partial<UserProfile>) => void;
}) {
  const [officialName, setOfficialName] = useState(user.officialName || "");
  const [rankType, setRankType] = useState(user.rankType || "NON_COMMISSIONED");
  const [role, setRole] = useState(user.role);

  const handleApprove = () => {
    if (!officialName.trim()) {
      return alert("กรุณาระบุยศ-ชื่อ-สกุล จริงก่อนทำการอนุมัติ");
    }
    onSave({
      officialName,
      rankType,
      role,
      status: "APPROVED",
    });
  };

  return (
    <tr className="hover:bg-slate-50">
      <td className="px-4 py-3">
        <div className="font-medium text-slate-800">{user.email}</div>
        <div className="text-xs text-slate-400">{user.name}</div>
      </td>
      <td className="px-4 py-3">
        <input
          type="text"
          placeholder="เช่น จ.อ.สมชาย ใจดี"
          className="border rounded px-2 py-1 text-sm w-full"
          value={officialName}
          onChange={(e) => setOfficialName(e.target.value)}
        />
      </td>
      <td className="px-4 py-3">
        <select
          className="border rounded px-2 py-1 text-sm bg-white"
          value={rankType}
          onChange={(e) => setRankType(e.target.value as any)}
        >
          <option value="NON_COMMISSIONED">นายทหารประทวน</option>
          <option value="COMMISSIONED">นายทหารสัญญาบัตร</option>
        </select>
      </td>
      <td className="px-4 py-3">
        <select
          disabled={!isSuperAdmin || user.role === "SUPER_ADMIN"}
          className="border rounded px-2 py-1 text-sm bg-white disabled:bg-slate-100"
          value={role}
          onChange={(e) => setRole(e.target.value as any)}
        >
          <option value="USER">User (ผู้ใช้ทั่วไป)</option>
          <option value="ADMIN">Admin (ผู้ดูแลระบบ)</option>
          {user.role === "SUPER_ADMIN" && <option value="SUPER_ADMIN">Super Admin</option>}
        </select>
      </td>
      <td className="px-4 py-3 text-center">
        <span
          className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
            user.status === "APPROVED"
              ? "bg-emerald-100 text-emerald-800"
              : user.status === "PENDING"
              ? "bg-amber-100 text-amber-800"
              : "bg-red-100 text-red-800"
          }`}
        >
          {user.status}
        </span>
      </td>
      <td className="px-4 py-3 text-center space-x-2">
        <button
          onClick={handleApprove}
          className="px-3 py-1 bg-blue-900 hover:bg-blue-800 text-white rounded text-xs font-medium"
        >
          บันทึก/อนุมัติ
        </button>
      </td>
    </tr>
  );
}