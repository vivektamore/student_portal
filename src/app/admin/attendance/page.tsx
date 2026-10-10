"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  CalendarCheck,
  Save,
  CheckCircle2,
  User,
  Clock,
  AlertCircle,
  Filter,
  Check,
  X,
  FileCheck,
  Shield,
  RotateCcw,
} from "lucide-react";
import { DataService } from "@/lib/data-service";

export default function AdminAttendancePage() {
  const [subject, setSubject] = useState("CS-301");
  const [date, setDate] = useState("2025-04-10");
  const [period, setPeriod] = useState("09:00 AM – 10:00 AM (Slot 1)");
  const [room, setRoom] = useState("Hall B-204");
  const [students, setStudents] = useState<any[]>([]);
  const [attendanceState, setAttendanceState] = useState<Record<string, "PRESENT" | "ABSENT" | "EXCUSED">>({});
  const [isSaved, setIsSaved] = useState(false);

  useEffect(() => {
    DataService.getAdminStudents().then((list) => {
      setStudents(list);
      const initial: Record<string, "PRESENT" | "ABSENT" | "EXCUSED"> = {};
      list.forEach((s: any, idx: number) => {
        initial[s.id] = idx === 2 ? "ABSENT" : "PRESENT";
      });
      setAttendanceState(initial);
    });
  }, []);

  const setStatus = (id: string, status: "PRESENT" | "ABSENT" | "EXCUSED") => {
    setAttendanceState((prev) => ({
      ...prev,
      [id]: status,
    }));
  };

  const markAll = (status: "PRESENT" | "ABSENT") => {
    const updated: Record<string, "PRESENT" | "ABSENT" | "EXCUSED"> = {};
    students.forEach((s) => {
      updated[s.id] = status;
    });
    setAttendanceState(updated);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const presentIds = Object.keys(attendanceState).filter(
      (id) => attendanceState[id] === "PRESENT"
    );
    await DataService.recordAttendance(subject, date, presentIds);
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000);
  };

  const presentCount = Object.values(attendanceState).filter((v) => v === "PRESENT").length;
  const absentCount = Object.values(attendanceState).filter((v) => v === "ABSENT").length;
  const excusedCount = Object.values(attendanceState).filter((v) => v === "EXCUSED").length;
  const totalCount = students.length || 1;
  const presentPct = Math.round((presentCount / totalCount) * 100);

  return (
    <div className="space-y-6">
      {/* 1. Header & Breadcrumbs (Stitch Screen 23) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <nav className="flex items-center gap-2 mb-1 text-slate-400 text-xs font-semibold uppercase tracking-wider">
            <span>Academic Ops</span>
            <span>/</span>
            <span className="text-blue-700">Attendance Management</span>
          </nav>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Class Session Roll-Call & Audit
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Conduct daily lecture attendance roll-calls, review threshold compliance, and correct disputed records.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {isSaved && (
            <span className="flex items-center gap-1.5 text-xs font-semibold text-emerald-700 bg-emerald-50 px-3 py-2 rounded-lg border border-emerald-200 animate-fadeIn">
              <CheckCircle2 className="w-4 h-4" /> Roll-Call Submitted
            </span>
          )}
          <button
            onClick={handleSave}
            className="px-4 py-2 bg-blue-800 hover:bg-blue-900 text-white font-semibold text-xs rounded-lg shadow-sm flex items-center gap-2 transition-colors"
          >
            <Save className="w-4 h-4" />
            <span>Submit Roll-Call</span>
          </button>
        </div>
      </div>

      {/* 2. Session Context Selectors & KPI Strip */}
      <div className="p-5 bg-white rounded-xl border border-slate-200/80 shadow-sm space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 text-xs">
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Subject Course</label>
            <select
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className="portal-input text-xs"
            >
              <option value="CS-301">CS-301: Design & Analysis of Algorithms</option>
              <option value="CS-302">CS-302: Database Management Systems</option>
              <option value="CS-303">CS-303: Operating Systems</option>
              <option value="CS-304">CS-304: Computer Networks</option>
            </select>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Session Date</label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="portal-input text-xs"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Time Period Slot</label>
            <select
              value={period}
              onChange={(e) => setPeriod(e.target.value)}
              className="portal-input text-xs"
            >
              <option>09:00 AM – 10:00 AM (Slot 1)</option>
              <option>10:15 AM – 11:15 AM (Slot 2)</option>
              <option>11:30 AM – 12:30 PM (Slot 3)</option>
              <option>02:00 PM – 03:00 PM (Slot 4)</option>
            </select>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Lecture Venue</label>
            <input
              type="text"
              value={room}
              onChange={(e) => setRoom(e.target.value)}
              className="portal-input text-xs"
            />
          </div>
        </div>

        {/* Live Stat Bar */}
        <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-4 text-xs">
            <span className="text-slate-500">
              Total Roster: <strong className="text-slate-900 font-mono">{students.length}</strong>
            </span>
            <span className="text-emerald-700 font-semibold flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span> Present: {presentCount} ({presentPct}%)
            </span>
            <span className="text-rose-700 font-semibold flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-rose-500"></span> Absent: {absentCount}
            </span>
            <span className="text-slate-500 font-medium">
              Excused: {excusedCount}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => markAll("PRESENT")}
              className="px-3 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 rounded-lg text-xs font-semibold border border-emerald-200 transition-colors"
            >
              Mark All Present
            </button>
            <button
              type="button"
              onClick={() => markAll("ABSENT")}
              className="px-3 py-1 bg-rose-50 hover:bg-rose-100 text-rose-800 rounded-lg text-xs font-semibold border border-rose-200 transition-colors"
            >
              Mark All Absent
            </button>
          </div>
        </div>
      </div>

      {/* 3. Roll-Call Roster Table */}
      <div className="bg-white rounded-xl border border-slate-200/80 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 border-b border-slate-200 uppercase text-[10px] font-bold tracking-wider">
              <tr>
                <th className="py-3 px-4">Roll Number</th>
                <th className="py-3 px-4">Student Name</th>
                <th className="py-3 px-4">Academic Program</th>
                <th className="py-3 px-4 text-center">Semester Average</th>
                <th className="py-3 px-4 text-center">Session Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {students.map((s) => {
                const status = attendanceState[s.id] || "PRESENT";
                return (
                  <tr key={s.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-bold text-blue-900">
                      {s.enrollmentNumber}
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-full bg-blue-100 text-blue-900 font-bold flex items-center justify-center text-[10px]">
                          {s.firstName[0]}
                          {s.lastName[0]}
                        </div>
                        <span className="font-bold text-slate-900">
                          {s.firstName} {s.lastName}
                        </span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-slate-500">{s.program}</td>
                    <td className="py-3.5 px-4 text-center font-mono font-semibold">
                      <span className={(s.attendancePercent || 88.5) >= 75 ? "text-emerald-700" : "text-amber-700"}>
                        {s.attendancePercent || 88.5}%
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <div className="inline-flex rounded-lg border border-slate-200 overflow-hidden text-xs">
                        <button
                          type="button"
                          onClick={() => setStatus(s.id, "PRESENT")}
                          className={`px-3 py-1 font-bold transition-colors ${
                            status === "PRESENT"
                              ? "bg-emerald-600 text-white"
                              : "bg-white text-slate-600 hover:bg-slate-50"
                          }`}
                        >
                          P
                        </button>
                        <button
                          type="button"
                          onClick={() => setStatus(s.id, "ABSENT")}
                          className={`px-3 py-1 font-bold border-l border-slate-200 transition-colors ${
                            status === "ABSENT"
                              ? "bg-rose-600 text-white"
                              : "bg-white text-slate-600 hover:bg-slate-50"
                          }`}
                        >
                          A
                        </button>
                        <button
                          type="button"
                          onClick={() => setStatus(s.id, "EXCUSED")}
                          className={`px-3 py-1 font-bold border-l border-slate-200 transition-colors ${
                            status === "EXCUSED"
                              ? "bg-amber-600 text-white"
                              : "bg-white text-slate-600 hover:bg-slate-50"
                          }`}
                        >
                          E
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
