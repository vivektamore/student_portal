"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Users,
  Building2,
  BookOpen,
  AlertTriangle,
  Plus,
  Bell,
  Calendar,
  Download,
  ArrowUpRight,
  ShieldAlert,
  ArrowRight,
  CheckCircle2,
  Clock,
  Sparkles,
  Search,
  FileCheck,
  CreditCard,
  History,
} from "lucide-react";
import { DataService, SubjectRecord } from "@/lib/data-service";

export default function AdminDashboardPage() {
  const [academicYear, setAcademicYear] = useState("AY 2024–2025 (Active Term)");
  const [semesterCycle, setSemesterCycle] = useState("Spring Semester (Cycle 2)");
  const [isDataCleared, setIsDataCleared] = useState(false);
  const [subjectsList, setSubjectsList] = useState<SubjectRecord[]>([]);

  React.useEffect(() => {
    setIsDataCleared(DataService.isCleared());
    DataService.getSubjects().then(setSubjectsList);
  }, []);

  const pendingApprovals = [
    {
      title: "Mid-Term Examination Seating Approvals",
      department: "Controller of Examinations",
      urgency: "HIGH",
      due: "Today at 05:00 PM",
      action: "Review Seating",
      href: "/admin/exams",
    },
    {
      title: "Attendance Shortage De-barment List Moderation",
      department: "Academic Dean & Student Welfare",
      urgency: "URGENT",
      due: "Tomorrow, 11:00 AM",
      action: "Verify Shortage",
      href: "/admin/attendance",
    },
    {
      title: "Hostel Fee Clearance Reconciliation",
      department: "Accounts & Bursar",
      urgency: "NORMAL",
      due: "Apr 15, 2025",
      action: "Clear Dues",
      href: "/admin/fees",
    },
    {
      title: "Syllabus Revision Approval for CS-306 (AI Systems)",
      department: "Board of Studies",
      urgency: "NORMAL",
      due: "Apr 18, 2025",
      action: "Approve Syllabus",
      href: "/admin/subjects-faculty",
    },
  ];

  const recentAuditTrail = [
    {
      actor: "Prof. Rajesh Verma",
      action: "Published Assignment 1 Evaluation for CS-301",
      timestamp: "18 mins ago",
      target: "CS-301 Algorithms",
    },
    {
      actor: "Finance Office (Bursar)",
      action: "Reconciled NEFT payment of ₹75,000 for Student VU-2022-CSE-0142",
      timestamp: "1 hr ago",
      target: "Fee Record #RCPT-2025-0142",
    },
    {
      actor: "Registrar Office",
      action: "Enrolled new candidate Diya Patel (VU-2022-CSE-0143) to B.Tech CSE",
      timestamp: "3 hrs ago",
      target: "Student Directory",
    },
    {
      actor: "Controller of Examinations",
      action: "Finalized Spring 2025 Mid-Semester Date Sheet & Hall Allocations",
      timestamp: "Yesterday at 04:30 PM",
      target: "Exam Schedule",
    },
  ];

  return (
    <div className="space-y-6">
      {/* 1. Page Header & Stitch Screen 17 Quick Controls */}
      <div className="flex flex-col xl:flex-row xl:items-end justify-between gap-4">
        <div>
          {/* Breadcrumbs */}
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
            <span className="text-blue-700">Institution Administration</span>
            <span className="text-slate-300">/</span>
            <span>Overview & Governance</span>
          </div>
          <h1 className="text-2xl lg:text-3xl font-bold tracking-tight text-slate-900">
            College Administration
          </h1>
          <p className="text-sm text-slate-500 mt-1 max-w-3xl">
            Real-time institutional metrics, academic lifecycle monitoring, and cross-departmental operations.
          </p>
        </div>

        {/* Governance Filter & Action Toolbar */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Academic Year Dropdown */}
          <select
            value={academicYear}
            onChange={(e) => setAcademicYear(e.target.value)}
            className="h-10 px-3 bg-white border border-slate-200 rounded-lg text-xs font-semibold text-slate-700 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-600 cursor-pointer"
          >
            <option>AY 2024–2025 (Active Term)</option>
            <option>AY 2023–2024</option>
            <option>AY 2022–2023</option>
          </select>

          {/* Term Selector */}
          <select
            value={semesterCycle}
            onChange={(e) => setSemesterCycle(e.target.value)}
            className="h-10 px-3 bg-white border border-slate-200 rounded-lg text-xs font-semibold text-slate-700 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-600 cursor-pointer"
          >
            <option>Spring Semester (Cycle 2)</option>
            <option>Fall Semester (Cycle 1)</option>
            <option>Summer Session</option>
          </select>

          {/* Action Buttons */}
          <Link
            href="/admin/students/new"
            className="h-10 px-4 bg-blue-800 hover:bg-blue-900 text-white font-semibold text-xs rounded-lg shadow-sm inline-flex items-center gap-1.5 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Add Student
          </Link>

          <Link
            href="/admin/notices"
            className="h-10 px-3.5 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 font-semibold text-xs rounded-lg shadow-sm inline-flex items-center gap-1.5 transition-colors"
          >
            <Bell className="w-4 h-4 text-slate-500" />
            Create Notice
          </Link>

          <Link
            href="/admin/timetable"
            className="h-10 px-3.5 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 font-semibold text-xs rounded-lg shadow-sm inline-flex items-center gap-1.5 transition-colors"
          >
            <Calendar className="w-4 h-4 text-slate-500" />
            Timetable
          </Link>

          <button
            onClick={() => alert("Generating Institutional Academic Term Report (PDF)...")}
            className="h-10 w-10 bg-white hover:bg-slate-50 text-slate-600 border border-slate-200 rounded-lg shadow-sm flex items-center justify-center transition-colors"
            title="Download Term Report (PDF)"
          >
            <Download className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* 2. KPI Cards Row (Matching Screen 17 tokens & values) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {/* Card 1: Total Active Students */}
        <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-[0_1px_3px_rgba(15,23,42,0.04)] flex flex-col justify-between hover:shadow-md transition-shadow">
          <div className="flex items-start justify-between">
            <div>
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                Total Active Students
              </span>
              <div className="text-3xl font-bold text-slate-900 font-mono tracking-tight mt-1">
                {isDataCleared ? "0" : "4,820"}
              </div>
            </div>
            <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center text-blue-800">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <div className="pt-3 border-t border-slate-100 mt-2 space-y-1">
            <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
              <ArrowUpRight className="w-3 h-3" /> {isDataCleared ? "Awaiting enrollments" : "+142 vs previous AY (+3.0%)"}
            </span>
            <p className="text-xs text-slate-500">{isDataCleared ? "Enroll via Student Management" : "4,150 Undergrad • 670 Postgrad"}</p>
          </div>
        </div>

        {/* Card 2: Active Programs */}
        <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-[0_1px_3px_rgba(15,23,42,0.04)] flex flex-col justify-between hover:shadow-md transition-shadow">
          <div className="flex items-start justify-between">
            <div>
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                Active Programs
              </span>
              <div className="text-3xl font-bold text-slate-900 font-mono tracking-tight mt-1">
                {isDataCleared ? "0" : "38"}
              </div>
            </div>
            <div className="w-10 h-10 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-700">
              <Building2 className="w-5 h-5" />
            </div>
          </div>
          <div className="pt-3 border-t border-slate-100 mt-2 space-y-1">
            <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-full">
              <CheckCircle2 className="w-3 h-3" /> {isDataCleared ? "Configure in Departments" : "100% Accredited (NBA & NAAC)"}
            </span>
            <p className="text-xs text-slate-500">{isDataCleared ? "Academic Schools" : "Across 6 Academic Schools"}</p>
          </div>
        </div>

        {/* Card 3: Subjects & Courses */}
        <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-[0_1px_3px_rgba(15,23,42,0.04)] flex flex-col justify-between hover:shadow-md transition-shadow">
          <div className="flex items-start justify-between">
            <div>
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                Subjects & Courses
              </span>
              <div className="text-3xl font-bold text-slate-900 font-mono tracking-tight mt-1">
                {isDataCleared ? subjectsList.length : "312"}
              </div>
            </div>
            <div className="w-10 h-10 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-700">
              <BookOpen className="w-5 h-5" />
            </div>
          </div>
          <div className="pt-3 border-t border-slate-100 mt-2 space-y-1">
            <span className="text-xs font-semibold text-slate-800">
              {isDataCleared ? `${subjectsList.length} Active Courses` : "148 Active Faculty (1:32 Ratio)"}
            </span>
            <p className="text-xs text-slate-500">{isDataCleared ? "Upload courses in Subjects & Faculty" : "284 Theory • 28 Laboratory / Capstone"}</p>
          </div>
        </div>

        {/* Card 4: Pending Administrative Tasks */}
        <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-[0_1px_3px_rgba(15,23,42,0.04)] flex flex-col justify-between hover:shadow-md transition-shadow">
          <div className="flex items-start justify-between">
            <div>
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                Action Required
              </span>
              <div className="text-3xl font-bold text-slate-900 font-mono tracking-tight mt-1">
                {isDataCleared ? "0" : "18"}
              </div>
            </div>
            <div className="w-10 h-10 rounded-lg bg-rose-50 flex items-center justify-center text-rose-700">
              <AlertTriangle className="w-5 h-5" />
            </div>
          </div>
          <div className="pt-3 border-t border-slate-100 mt-2 space-y-1">
            <div className="flex items-center justify-between">
              <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-800 bg-amber-50 px-2 py-0.5 rounded-full">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span> {isDataCleared ? "All Queues Cleared" : "7 Require Immediate Action"}
              </span>
              {!isDataCleared && (
                <Link href="/admin/exams" className="text-[11px] font-bold text-blue-700 hover:underline">
                  Review →
                </Link>
              )}
            </div>
            <p className="text-xs text-slate-500">{isDataCleared ? "No pending actions" : "4 Grade Reviews • 9 Fee Waivers • 5 Rosters"}</p>
          </div>
        </div>
      </div>

      {/* 3. Operational Quick Modules Strip */}
      <div className="p-4 bg-white rounded-xl border border-slate-200/80 shadow-sm flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-xs font-semibold text-slate-700">
          <Sparkles className="w-4 h-4 text-blue-700" />
          <span>Quick Administrative Jump:</span>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Link
            href="/admin/students"
            className="px-3 py-1.5 rounded-lg bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 text-xs font-semibold transition-colors flex items-center gap-1.5"
          >
            <Users className="w-3.5 h-3.5 text-blue-700" /> Student Directory
          </Link>
          <Link
            href="/admin/attendance"
            className="px-3 py-1.5 rounded-lg bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 text-xs font-semibold transition-colors flex items-center gap-1.5"
          >
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Class Roll-Call
          </Link>
          <Link
            href="/admin/results"
            className="px-3 py-1.5 rounded-lg bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 text-xs font-semibold transition-colors flex items-center gap-1.5"
          >
            <FileCheck className="w-3.5 h-3.5 text-indigo-600" /> Grade Moderation
          </Link>
          <Link
            href="/admin/fees"
            className="px-3 py-1.5 rounded-lg bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 text-xs font-semibold transition-colors flex items-center gap-1.5"
          >
            <CreditCard className="w-3.5 h-3.5 text-amber-600" /> Fee Receipts
          </Link>
        </div>
      </div>

      {/* 4. Two-Column Dashboard Split: Approvals & Audit Trail */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column (7 cols): Pending Action Approvals */}
        <div className="lg:col-span-7 bg-white rounded-xl border border-slate-200/80 shadow-sm overflow-hidden">
          <div className="p-5 border-b border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShieldAlert className="w-5 h-5 text-amber-600" />
              <div>
                <h2 className="text-sm font-bold text-slate-900">Pending Administrative Approvals</h2>
                <p className="text-xs text-slate-500">Cross-departmental clearance items awaiting registrar action.</p>
              </div>
            </div>
            <span className="text-xs font-semibold text-amber-800 bg-amber-50 px-2.5 py-1 rounded-full border border-amber-200">
              {isDataCleared ? "0 Queued" : "4 Queued"}
            </span>
          </div>

          <div className="divide-y divide-slate-100">
            {isDataCleared ? (
              <div className="p-8 text-center text-slate-500">
                <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto mb-2" />
                <p className="text-sm font-semibold text-slate-800">All Clearance Queues Clear</p>
                <p className="text-xs text-slate-400 mt-0.5">No administrative approvals pending action.</p>
              </div>
            ) : (
              pendingApprovals.map((task, idx) => (
                <div key={idx} className="p-4 hover:bg-slate-50/70 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-sm font-semibold text-slate-900">{task.title}</span>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          task.urgency === "URGENT"
                            ? "bg-rose-50 text-rose-700 border border-rose-200"
                            : task.urgency === "HIGH"
                            ? "bg-amber-50 text-amber-700 border border-amber-200"
                            : "bg-slate-100 text-slate-700"
                        }`}
                      >
                        {task.urgency}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500">
                      Dept: <span className="font-medium text-slate-700">{task.department}</span> • Target: {task.due}
                    </p>
                  </div>

                  <Link
                    href={task.href}
                    className="px-3 py-1.5 rounded-lg bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200 text-xs font-semibold transition-colors self-start sm:self-auto shrink-0 flex items-center gap-1"
                  >
                    {task.action} <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Right Column (5 cols): Institutional Audit Stream */}
        <div className="lg:col-span-5 bg-white rounded-xl border border-slate-200/80 shadow-sm overflow-hidden">
          <div className="p-5 border-b border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <History className="w-5 h-5 text-blue-800" />
              <div>
                <h2 className="text-sm font-bold text-slate-900">Recent Audit Trail</h2>
                <p className="text-xs text-slate-500">Real-time system mutations.</p>
              </div>
            </div>
            <span className="text-[11px] font-medium text-slate-500">{isDataCleared ? "Standby" : "Live feed"}</span>
          </div>

          <div className="divide-y divide-slate-100">
            {isDataCleared ? (
              <div className="p-8 text-center text-slate-500">
                <Clock className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                <p className="text-sm font-semibold text-slate-700">Audit Trail Cleared</p>
                <p className="text-xs text-slate-400 mt-0.5">System ready for live operation mutations.</p>
              </div>
            ) : (
              recentAuditTrail.map((log, idx) => (
                <div key={idx} className="p-4 hover:bg-slate-50/50 transition-colors space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-slate-900">{log.actor}</span>
                    <span className="text-slate-400 text-[11px] flex items-center gap-1">
                      <Clock className="w-3 h-3" /> {log.timestamp}
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 leading-snug">{log.action}</p>
                  <div className="text-[10px] text-blue-700 font-medium bg-blue-50/50 px-2 py-0.5 rounded inline-block">
                    Scope: {log.target}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
