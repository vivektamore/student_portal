"use client";

import React, { useState, useEffect } from "react";
import {
  CalendarCheck,
  AlertTriangle,
  CheckCircle2,
  Filter,
  Info,
  Calendar,
  Clock,
  ArrowUpRight,
} from "lucide-react";

export default function StudentAttendancePage() {
  const [subjects, setSubjects] = useState<any[]>([]);
  const [logs, setLogs] = useState<any[]>([]);
  const [totalAttended, setTotalAttended] = useState(0);
  const [totalConducted, setTotalConducted] = useState(0);
  const [overallPercentage, setOverallPercentage] = useState("0");
  const [isEligible, setIsEligible] = useState(true);
  const [selectedFilter, setSelectedFilter] = useState("ALL");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadAttendance() {
      try {
        const res = await fetch("/api/attendance");
        if (res.ok) {
          const json = await res.json();
          if (json.success) {
            setSubjects(json.subjects || []);
            setLogs(json.logs || []);
            setTotalAttended(json.totalAttended || 0);
            setTotalConducted(json.totalConducted || 0);
            setOverallPercentage(json.overallPercentage ? String(json.overallPercentage) : "0");
            setIsEligible(json.isEligible ?? true);
          }
        }
      } catch (err) {
        console.warn("Failed to load attendance:", err);
      } finally {
        setLoading(false);
      }
    }
    loadAttendance();
  }, []);

  const filteredLogs = logs.filter(
    (l) => selectedFilter === "ALL" || l.status === selectedFilter
  );

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Attendance Record & Analytics</h1>
          <p className="text-xs text-slate-500 mt-1">
            Official class session records, threshold compliance tracking, and absence audit history.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className={`text-xs font-semibold px-3 py-1 rounded-full border ${
            isEligible
              ? "bg-emerald-50 text-emerald-800 border-emerald-200"
              : "bg-red-50 text-red-800 border-red-200"
          }`}>
            Eligibility Status: {isEligible ? "Eligible for Examinations" : "Attendance Shortage (<75%)"}
          </span>
        </div>
      </div>

      {/* High-level Attendance KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="portal-card p-6 bg-white flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[11px] uppercase font-bold text-slate-500 tracking-wider">Overall Aggregate</span>
            <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
              Number(overallPercentage) >= 75 || totalConducted === 0
                ? "bg-emerald-50 text-emerald-700"
                : "bg-amber-50 text-amber-700"
            }`}>
              {totalConducted === 0 ? "No Sessions Yet" : Number(overallPercentage) >= 75 ? "Above Threshold" : "Action Needed"}
            </span>
          </div>
          <div className="my-3">
            <div className="text-4xl font-bold text-slate-900 tracking-tight tabular-nums">
              {totalConducted === 0 ? "--" : `${overallPercentage}%`}
            </div>
            <p className="text-xs text-slate-500 mt-1">
              {totalAttended} attended out of {totalConducted} conducted sessions
            </p>
          </div>
          <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
            <div className="bg-emerald-600 h-full rounded-full" style={{ width: `${overallPercentage}%` }}></div>
          </div>
        </div>

        <div className="portal-card p-6 bg-white flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[11px] uppercase font-bold text-slate-500 tracking-wider">University Policy</span>
            <Info className="w-4 h-4 text-blue-700" />
          </div>
          <div className="my-3">
            <div className="text-2xl font-bold text-slate-900 tracking-tight">75% Mandatory</div>
            <p className="text-xs text-slate-500 mt-1 leading-relaxed">
              Minimum aggregate attendance required to obtain university examination admit cards and exam eligibility.
            </p>
          </div>
          <span className="text-[11px] text-blue-700 font-semibold hover:underline cursor-pointer">
            Read Attendance Ordinance Guidelines →
          </span>
        </div>

        <div className="portal-card p-6 bg-white flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[11px] uppercase font-bold text-slate-500 tracking-wider">Academic Term</span>
            <Calendar className="w-4 h-4 text-slate-400" />
          </div>
          <div className="my-3">
            <div className="text-2xl font-bold text-slate-900 tracking-tight">Spring 2025</div>
            <p className="text-xs text-slate-500 mt-1">
              {subjects.length} registered academic courses
            </p>
          </div>
          <div className="text-[11px] text-slate-400">
            Attendance ledger synchronized with faculty class registries
          </div>
        </div>
      </div>

      {/* Subject-Wise Attendance Breakdown Table */}
      <div className="portal-card overflow-hidden">
        <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <h2 className="text-sm font-bold text-slate-900">Subject-Wise Attendance Breakdown</h2>
          <span className="text-xs text-slate-500">Live Course Register</span>
        </div>

        <div className="overflow-x-auto">
          {subjects.length === 0 ? (
            <div className="p-12 text-center text-slate-500">
              <CalendarCheck className="w-10 h-10 mx-auto mb-2 text-slate-300 stroke-1" />
              <p className="font-semibold text-slate-700">No attendance records available</p>
              <p className="text-xs text-slate-400 mt-1">
                Your subject attendance will appear once instructors conduct and record official lecture sessions.
              </p>
            </div>
          ) : (
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50/50 text-slate-500 font-semibold uppercase text-[10px]">
                  <th className="py-3 px-6">Subject Code & Name</th>
                  <th className="py-3 px-4 text-center">Conducted</th>
                  <th className="py-3 px-4 text-center">Attended</th>
                  <th className="py-3 px-4 text-center">Percentage</th>
                  <th className="py-3 px-6 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {subjects.map((s) => {
                  const isCaution = s.totalSessions > 0 && s.attendancePercent < 75;
                  return (
                    <tr key={s.id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="py-3.5 px-6">
                        <div className="font-bold text-slate-900">{s.code}</div>
                        <div className="text-[11px] text-slate-500">{s.name}</div>
                      </td>
                      <td className="py-3.5 px-4 text-center font-mono font-medium text-slate-700">{s.totalSessions}</td>
                      <td className="py-3.5 px-4 text-center font-mono font-medium text-slate-700">{s.attendedSessions}</td>
                      <td className="py-3.5 px-4 text-center">
                        <span className={`font-bold font-mono text-sm ${
                          s.totalSessions === 0 ? "text-slate-400" : isCaution ? "text-amber-600" : "text-emerald-700"
                        }`}>
                          {s.totalSessions === 0 ? "--" : `${s.attendancePercent}%`}
                        </span>
                      </td>
                      <td className="py-3.5 px-6 text-center">
                        {s.totalSessions === 0 ? (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-600 text-[11px] font-medium">
                            Pending First Session
                          </span>
                        ) : isCaution ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-800 text-[11px] font-semibold border border-amber-200">
                            <AlertTriangle className="w-3 h-3 text-amber-500" /> Caution
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 text-[11px] font-semibold border border-emerald-200">
                            <CheckCircle2 className="w-3 h-3 text-emerald-600" /> On Track
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Daily Session Roll-Call History Log */}
      <div className="portal-card overflow-hidden">
        <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <CalendarCheck className="w-4 h-4 text-blue-800" />
            <h2 className="text-sm font-bold text-slate-900">Recent Attendance Session Logs</h2>
          </div>
          <div className="flex items-center gap-2">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={selectedFilter}
              onChange={(e) => setSelectedFilter(e.target.value)}
              className="portal-input text-xs h-8 w-36"
            >
              <option value="ALL">All Records</option>
              <option value="PRESENT">Present Only</option>
              <option value="ABSENT">Absent Only</option>
            </select>
          </div>
        </div>

        {filteredLogs.length === 0 ? (
          <div className="p-8 text-center text-xs text-slate-500">
            No attendance session logs recorded yet.
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {filteredLogs.map((item, idx) => (
              <div key={item.id || idx} className="p-4 sm:px-6 flex items-center justify-between text-xs hover:bg-slate-50/50">
                <div className="flex items-center gap-4">
                  <div className="w-24 shrink-0 text-slate-500 font-mono text-[11px]">{item.date}</div>
                  <div>
                    <span className="font-bold text-slate-900">{item.code} — {item.subject}</span>
                    <p className="text-[11px] text-slate-400 mt-0.5">{item.time} • Room {item.room}</p>
                  </div>
                </div>
                <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-semibold ${
                  item.status === "PRESENT"
                    ? "bg-emerald-50 text-emerald-700"
                    : "bg-red-50 text-red-700"
                }`}>
                  {item.status}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
