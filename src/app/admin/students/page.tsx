"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Users,
  Search,
  Plus,
  Filter,
  Edit,
  CheckCircle2,
  AlertTriangle,
  FileSpreadsheet,
  Upload,
  Download,
  GraduationCap,
  Calendar,
  MoreVertical,
  Check,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { DataService } from "@/lib/data-service";
import { SITE_CONFIG } from "@/lib/site-config";

export default function AdminStudentsPage() {
  const [students, setStudents] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [departmentFilter, setDepartmentFilter] = useState("ALL");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isDataCleared, setIsDataCleared] = useState(false);

  useEffect(() => {
    setIsDataCleared(DataService.isCleared());
    DataService.getAdminStudents().then(setStudents);
  }, []);

  const handleToggleStatus = async (id: string, currentStatus: string) => {
    const nextStatus = currentStatus === "ACTIVE" ? "SUSPENDED" : "ACTIVE";
    await DataService.updateStudentStatus(id, nextStatus as any);
    const updated = await DataService.getAdminStudents();
    setStudents([...updated]);
  };

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedIds(filtered.map((s) => s.id));
    } else {
      setSelectedIds([]);
    }
  };

  const handleToggleSelect = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const filtered = students.filter((s) => {
    const matchesSearch =
      (s.enrollmentNumber?.toLowerCase() || "").includes(searchTerm.toLowerCase()) ||
      `${s.firstName || ""} ${s.lastName || ""}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (s.email?.toLowerCase() || "").includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "ALL" || s.status === statusFilter;
    const matchesDept =
      departmentFilter === "ALL" ||
      (s.department?.toLowerCase() || "").includes(departmentFilter.toLowerCase());
    return matchesSearch && matchesStatus && matchesDept;
  });

  return (
    <div className="space-y-6">
      {/* 1. Top Breadcrumbs & Page Header Section (Stitch Screen 18) */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <nav className="flex items-center gap-2 mb-1.5 text-slate-400 text-xs font-semibold uppercase tracking-wider">
            <Link href="/admin/dashboard" className="hover:text-blue-700 transition-colors">
              Home
            </Link>
            <span>/</span>
            <span>Academic Ops</span>
            <span>/</span>
            <span className="text-blue-700">Students</span>
          </nav>

          <div className="flex items-baseline gap-3">
            <h1 className="text-2xl lg:text-3xl font-bold tracking-tight text-slate-900">
              Students
            </h1>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 font-semibold border border-blue-200/60">
              {SITE_CONFIG.academicYear} Cohort
            </span>
          </div>
          <p className="text-sm text-slate-500 mt-1">
            Directory and record lifecycle management for enrolled and prospective students.
          </p>
        </div>

        {/* Action Toolbar Buttons */}
        <div className="flex items-center flex-wrap gap-2.5">
          <button
            onClick={() => alert("Batch Student Import Modal opened (CSV / Excel format).")}
            className="h-10 px-3.5 bg-white hover:bg-slate-50 text-slate-700 font-semibold text-xs rounded-lg border border-slate-200 shadow-sm flex items-center gap-2 transition-all"
          >
            <Upload className="w-4 h-4 text-blue-700" />
            <span>Import Students</span>
          </button>

          <button
            onClick={() => alert("Exporting student directory as CSV...")}
            className="h-10 px-3.5 bg-white hover:bg-slate-50 text-slate-700 font-semibold text-xs rounded-lg border border-slate-200 shadow-sm flex items-center gap-2 transition-all"
          >
            <Download className="w-4 h-4 text-slate-500" />
            <span>Export CSV</span>
          </button>

          <Link
            href="/admin/students/new"
            className="h-10 px-4 bg-blue-800 hover:bg-blue-900 text-white font-semibold text-xs rounded-lg shadow-sm flex items-center gap-2 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>+ Add Student</span>
          </Link>
        </div>
      </div>

      {/* 2. Summary KPI Metric Strip (Screen 18) */}
      <section className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5">
        <div className="p-4 bg-white rounded-xl border border-slate-200/80 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              Total Registered
            </span>
            <div className="w-7 h-7 rounded-lg bg-blue-50 flex items-center justify-center text-blue-700">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2">
            <span className="text-2xl font-bold text-slate-900 font-mono">{students.length}</span>
            <p className="text-[11px] text-slate-500 mt-0.5">Active Roster</p>
          </div>
        </div>

        <div className="p-4 bg-white rounded-xl border border-slate-200/80 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              Active Full-Time
            </span>
            <div className="w-7 h-7 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-700">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2">
            <span className="text-2xl font-bold text-slate-900 font-mono">
              {students.filter((s) => s.status === "ACTIVE").length}
            </span>
            <p className="text-[11px] text-emerald-700 font-medium mt-0.5">
              Enrolled Students
            </p>
          </div>
        </div>

        <div className="p-4 bg-white rounded-xl border border-slate-200/80 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              Probation / Risk
            </span>
            <div className="w-7 h-7 rounded-lg bg-amber-50 flex items-center justify-center text-amber-700">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2">
            <span className="text-2xl font-bold text-slate-900 font-mono">
              {students.filter((s) => s.status === "SUSPENDED" || (s.cgpa && s.cgpa < 2.0)).length}
            </span>
            <p className="text-[11px] text-amber-700 font-medium mt-0.5">Academic Intervention</p>
          </div>
        </div>

        <div className="p-4 bg-white rounded-xl border border-slate-200/80 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              Graduating Cohort
            </span>
            <div className="w-7 h-7 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-700">
              <GraduationCap className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2">
            <span className="text-2xl font-bold text-slate-900 font-mono">
              {students.filter((s) => s.semester >= 8).length}
            </span>
            <p className="text-[11px] text-slate-500 mt-0.5">Final Semester (AY 25)</p>
          </div>
        </div>

        <div className="p-4 bg-white rounded-xl border border-slate-200/80 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow col-span-2 sm:col-span-1">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              Leave of Absence
            </span>
            <div className="w-7 h-7 rounded-lg bg-slate-50 flex items-center justify-center text-slate-600">
              <Calendar className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2">
            <span className="text-2xl font-bold text-slate-900 font-mono">
              {students.filter((s) => s.status === "INACTIVE").length}
            </span>
          </div>
        </div>
      </section>

      {/* 3. Search & Multi-Filter Bar */}
      <div className="p-4 bg-white rounded-xl border border-slate-200/80 shadow-sm flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
        <div className="relative flex-1 min-w-[280px]">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            placeholder="Search by student name, enrollment PRN, email, or roll number..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full h-10 pl-9 pr-4 rounded-lg bg-slate-50 text-slate-900 placeholder:text-slate-400 text-xs focus:outline-none focus:ring-2 focus:ring-blue-600 border border-slate-200 transition-all"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Department Filter */}
          <select
            value={departmentFilter}
            onChange={(e) => setDepartmentFilter(e.target.value)}
            className="h-10 px-3 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold text-slate-700 cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-600"
          >
            <option value="ALL">All Departments</option>
            <option value="Computer Science">Computer Science & Engineering</option>
            <option value="Electronics">Electronics & Communication</option>
            <option value="Mechanical">Mechanical Engineering</option>
          </select>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="h-10 px-3 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold text-slate-700 cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-600"
          >
            <option value="ALL">All Statuses</option>
            <option value="ACTIVE">Active Status</option>
            <option value="SUSPENDED">Suspended Status</option>
          </select>

          {selectedIds.length > 0 && (
            <button
              onClick={() => alert(`Batch action executed on ${selectedIds.length} students.`)}
              className="h-10 px-3 rounded-lg bg-blue-50 text-blue-800 border border-blue-200 text-xs font-semibold flex items-center gap-1.5"
            >
              <span>Batch ({selectedIds.length})</span>
            </button>
          )}
        </div>
      </div>

      {/* 4. Student Directory Table */}
      <div className="bg-white rounded-xl border border-slate-200/80 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 border-b border-slate-200 uppercase text-[10px] font-bold tracking-wider">
              <tr>
                <th className="py-3 px-4 w-10 text-center">
                  <input
                    type="checkbox"
                    onChange={handleSelectAll}
                    checked={selectedIds.length === filtered.length && filtered.length > 0}
                    className="rounded border-slate-300 accent-blue-700 cursor-pointer"
                  />
                </th>
                <th className="py-3 px-4">Student Profile</th>
                <th className="py-3 px-4">Program & Department</th>
                <th className="py-3 px-4">Current Term</th>
                <th className="py-3 px-4">Attendance</th>
                <th className="py-3 px-4">CGPA</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-500">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <GraduationCap className="w-10 h-10 text-slate-300 stroke-1" />
                      <p className="font-semibold text-slate-700">No student records found</p>
                      <p className="text-xs text-slate-400">
                        {isDataCleared
                          ? "All sample data has been cleared. Use '+ Enroll Student' to register new student records."
                          : "No students matching the current filter query."}
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                filtered.map((s) => {
                  const isSelected = selectedIds.includes(s.id);
                  return (
                    <tr key={s.id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="py-3.5 px-4 text-center">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => handleToggleSelect(s.id)}
                          className="rounded border-slate-300 accent-blue-700 cursor-pointer"
                        />
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-blue-100 text-blue-900 font-bold flex items-center justify-center shrink-0 text-xs">
                            {s.firstName[0]}
                            {s.lastName[0]}
                          </div>
                          <div className="flex flex-col">
                            <span className="font-bold text-slate-900">
                              {s.firstName} {s.lastName}
                            </span>
                            <span className="text-[11px] font-mono text-slate-500">
                              {s.enrollmentNumber}
                            </span>
                            <span className="text-[10px] text-slate-400">{s.email}</span>
                          </div>
                        </div>
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="flex flex-col">
                          <span className="font-semibold text-slate-900">{s.program}</span>
                          <span className="text-[11px] text-slate-500">{s.department}</span>
                        </div>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="inline-block px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-semibold text-[11px]">
                          Semester {s.currentSemester}
                        </span>
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-slate-900">
                            {s.attendancePercent || 88.5}%
                          </span>
                          <div className="w-12 h-1.5 rounded-full bg-slate-100 overflow-hidden">
                            <div
                              className={`h-full ${
                                (s.attendancePercent || 88.5) >= 75 ? "bg-emerald-500" : "bg-amber-500"
                              }`}
                              style={{ width: `${s.attendancePercent || 88.5}%` }}
                            />
                          </div>
                        </div>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="font-mono font-bold text-slate-900 text-xs">
                          {s.cgpa ? Number(s.cgpa).toFixed(2) : "8.74"}
                        </span>
                      </td>
                      <td className="py-3.5 px-4">
                        <span
                          className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                            s.status === "ACTIVE"
                              ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                              : "bg-rose-50 text-rose-700 border border-rose-200"
                          }`}
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${
                              s.status === "ACTIVE" ? "bg-emerald-500" : "bg-rose-500"
                            }`}
                          />
                          {s.status}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Link
                            href={`/admin/students/${s.id}/edit`}
                            className="px-2.5 py-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-[11px] transition-colors flex items-center gap-1"
                          >
                            <Edit className="w-3 h-3 text-slate-500" /> Edit
                          </Link>
                          <button
                            onClick={() => handleToggleStatus(s.id, s.status)}
                            className={`px-2 py-1 rounded text-[11px] font-semibold transition-colors ${
                              s.status === "ACTIVE"
                                ? "bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200"
                                : "bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200"
                            }`}
                          >
                            {s.status === "ACTIVE" ? "Suspend" : "Activate"}
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* 5. Pagination Bar */}
        <div className="p-4 bg-slate-50/70 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
          <div>
            Showing <span className="font-semibold text-slate-900">{filtered.length > 0 ? "1" : "0"}</span> to{" "}
            <span className="font-semibold text-slate-900">{filtered.length}</span> of{" "}
            <span className="font-semibold text-slate-900">{isDataCleared ? filtered.length : "4,280"}</span> students
          </div>
          <div className="flex items-center gap-1">
            <button className="p-1.5 rounded bg-white border border-slate-200 text-slate-400 cursor-not-allowed">
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button className="px-2.5 py-1 rounded bg-blue-800 text-white font-bold text-xs">
              1
            </button>
            <button className="px-2.5 py-1 rounded bg-white border border-slate-200 text-slate-700 hover:bg-slate-100 text-xs">
              2
            </button>
            <button className="px-2.5 py-1 rounded bg-white border border-slate-200 text-slate-700 hover:bg-slate-100 text-xs">
              3
            </button>
            <button className="p-1.5 rounded bg-white border border-slate-200 text-slate-700 hover:bg-slate-100">
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
