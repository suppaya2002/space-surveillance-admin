"use client";

import React, { useState, useEffect } from "react";

interface TaskType {
  id: string;
  name: string;
  allowedRankType: "COMMISSIONED" | "NON_COMMISSIONED" | null;
}

export default function DutyGeneratorPage() {
  const [taskTypes, setTaskTypes] = useState<TaskType[]>([]);
  const [newTaskName, setNewTaskName] = useState("");
  const [rankFilter, setRankFilter] = useState<string>("ALL");

  // Runner State
  const [selectedTaskId, setSelectedTaskId] = useState("");
  const [targetDate, setTargetDate] = useState("");
  const [primaryCount, setPrimaryCount] = useState(1);
  const [reserveCount, setReserveCount] = useState(1);
  const [resultMessage, setResultMessage] = useState<string | null>(null);

  const fetchTasks = async () => {
    const res = await fetch("/api/task-types");
    if (res.ok) {
      const data = await res.json();
      setTaskTypes(data);
      if (data.length > 0 && !selectedTaskId) setSelectedTaskId(data[0].id);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  const handleCreateTaskType = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch("/api/task-types", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: newTaskName,
        allowedRankType: rankFilter === "ALL" ? null : rankFilter,
      }),
    });
    if (res.ok) {
      alert("เพิ่มประเภทเวรเรียบร้อย");
      setNewTaskName("");
      fetchTasks();
    }
  };

  const handleRunAutoAssign = async (e: React.FormEvent) => {
    e.preventDefault();
    setResultMessage(null);

    const res = await fetch("/api/duty/auto-generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        taskTypeId: selectedTaskId,
        targetDate,
        primaryCount,
        reserveCount,
      }),
    });

    const data = await res.json();
    if (res.ok) {
      setResultMessage(`จัดเวรสำเร็จ: บันทึกตัวจริง ${primaryCount} นาย และตัวสำรอง ${reserveCount} นาย เรียบร้อยแล้ว`);
    } else {
      setResultMessage(`ข้อผิดพลาด: ${data.error}`);
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">
          ระบบจัดเวรและภารกิจอัตโนมัติ
        </h1>
        <p className="text-sm text-slate-500">
          คำนวณกำลังพลว่าง ตัดเงื่อนไขการลาและราชการ พร้อมเลือกผู้มีสถิติการปฏิบัติหน้าที่น้อยที่สุด
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* กล่องรันระบบจัดเวรอัตโนมัติ */}
        <div className="bg-white rounded-lg border shadow-sm p-5 space-y-4">
          <h2 className="text-lg font-semibold text-slate-700 border-b pb-2">
            ประมวลผลจัดเวรอัตโนมัติ
          </h2>

          <form onSubmit={handleRunAutoAssign} className="space-y-4 text-sm">
            <div>
              <label className="block text-slate-600 mb-1">เลือกประเภทเวร/ภารกิจ</label>
              <select
                className="w-full border rounded p-2 bg-white"
                value={selectedTaskId}
                onChange={(e) => setSelectedTaskId(e.target.value)}
              >
                {taskTypes.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name}{" "}
                    {t.allowedRankType === "COMMISSIONED"
                      ? "(เฉพาะสัญญาบัตร)"
                      : t.allowedRankType === "NON_COMMISSIONED"
                      ? "(เฉพาะประทวน)"
                      : "(ทุกชั้นยศ)"}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-slate-600 mb-1">วันที่ต้องการจัดเวร</label>
              <input
                type="date"
                required
                className="w-full border rounded p-2"
                value={targetDate}
                onChange={(e) => setTargetDate(e.target.value)}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-slate-600 mb-1">จำนวนตัวจริง (นาย)</label>
                <input
                  type="number"
                  min="1"
                  className="w-full border rounded p-2"
                  value={primaryCount}
                  onChange={(e) => setPrimaryCount(parseInt(e.target.value))}
                />
              </div>
              <div>
                <label className="block text-slate-600 mb-1">จำนวนตัวสำรอง (นาย)</label>
                <input
                  type="number"
                  min="0"
                  className="w-full border rounded p-2"
                  value={reserveCount}
                  onChange={(e) => setReserveCount(parseInt(e.target.value))}
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-2 bg-blue-900 hover:bg-blue-800 text-white rounded font-medium transition"
            >
              คำนวณและยืนยันการจัดเวร
            </button>
          </form>

          {resultMessage && (
            <div
              className={`p-3 rounded text-sm ${
                resultMessage.startsWith("ข้อผิดพลาด")
                  ? "bg-red-50 text-red-700 border border-red-200"
                  : "bg-emerald-50 text-emerald-800 border border-emerald-200"
              }`}
            >
              {resultMessage}
            </div>
          )}
        </div>

        {/* เพิ่มประเภทภารกิจใหม่ และกำหนดชั้นยศ */}
        <div className="bg-white rounded-lg border shadow-sm p-5 space-y-4">
          <h2 className="text-lg font-semibold text-slate-700 border-b pb-2">
            กำหนดประเภทเวรและภารกิจ
          </h2>

          <form onSubmit={handleCreateTaskType} className="space-y-3 text-sm">
            <div>
              <label className="block text-slate-600 mb-1">ชื่อเวร/ภารกิจ</label>
              <input
                type="text"
                placeholder="เช่น เวรนำแถว, เวรบรรยายสรุป, เวรพูดหน้าแถว"
                required
                className="w-full border rounded p-2"
                value={newTaskName}
                onChange={(e) => setNewTaskName(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-slate-600 mb-1">จำกัดชั้นยศ</label>
              <select
                className="w-full border rounded p-2 bg-white"
                value={rankFilter}
                onChange={(e) => setRankFilter(e.target.value)}
              >
                <option value="ALL">ไม่จำกัด (สัญญาบัตรและประทวน)</option>
                <option value="COMMISSIONED">เฉพาะนายทหารสัญญาบัตร</option>
                <option value="NON_COMMISSIONED">เฉพาะนายทหารประทวน</option>
              </select>
            </div>

            <button
              type="submit"
              className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded text-sm font-medium transition"
            >
              บันทึกประเภทเวร
            </button>
          </form>

          <div className="mt-4 border-t pt-3">
            <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
              รายการเวรที่ตั้งค่าไว้
            </h3>
            <ul className="divide-y text-sm">
              {taskTypes.map((t) => (
                <li key={t.id} className="py-2 flex justify-between items-center">
                  <span className="font-medium text-slate-800">{t.name}</span>
                  <span className="text-xs px-2 py-0.5 rounded bg-slate-100 text-slate-600">
                    {t.allowedRankType === "COMMISSIONED"
                      ? "สัญญาบัตร"
                      : t.allowedRankType === "NON_COMMISSIONED"
                      ? "ประทวน"
                      : "ทั่วไป"}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}