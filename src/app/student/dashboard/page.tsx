"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  BookOpen,
  CalendarCheck,
  Clock,
  FileText,
  Award,
  ArrowRight,
  Download,
  AlertCircle,
  CheckCircle2,
  Bell,
  ChevronRight,
  ExternalLink,
} from "lucide-react";
import { DataService, StudentRecord, SubjectRecord, TimetableSlot, AssignmentRecord, ExamRecord, NoticeRecord } from "@/lib/data-service";

export default function StudentDashboardPage() {
  const [student, setStudent] = useState<StudentRecord | null>(null);
  const [subjects, setSubjects] = useState<SubjectRecord[]>([]);
  const [timetable, setTimetable] = useState<TimetableSlot[]>([]);
  const [assignments, setAssignments] = useState<AssignmentRecord[]>([]);
  const [exams, setExams] = useState<ExamRecord[]>([]);
  const [notices, setNotices] = useState<NoticeRecord[]>([]);

  useEffect(() => {
    async function loadData() {
      const [s, sub, tt, asg, ex, not] = await Promise.all([
        DataService.getStudentProfile(),
        DataService.getSubjects(),
        DataService.getTimetable(),
        DataService.getAssignments(),
        DataService.getExams(),
        DataService.getNotices(),
      ]);
      setStudent(s);
      setSubjects(sub);
      setTimetable(tt.filter((t) => t.dayOfWeek === 4)); // Thursday schedule as per Stitch screen
      setAssignments(asg);
      setExams(ex);
      setNotices(not);
    }
    loadData();
  }, []);

  if (!student) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-8 h-8 border-4 border-blue-800 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  const pendingAssignments = assignments.filter((a) => a.status === "PENDING");

  return (
    <div className="space-y-6">
      {/* 1. Welcome & Student Metadata Banner */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative overflow-hidden">
        <div className="absolute -right-8 -top-8 w-56 h-56 bg-blue-50/60 rounded-full pointer-events-none" />
        <div className="flex flex-col gap-2 z-10">
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
              Good morning, {student.firstName}
            </h1>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 text-blue-800 text-xs font-semibold border border-blue-200">
              <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse"></span>
              Good Standing (CGPA: {student.cgpa})
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-y-2 gap-x-3 text-slate-600 text-xs">
            <span className="font-semibold text-slate-900 bg-slate-100 px-2.5 py-0.5 rounded">
              {student.enrollmentNumber}
            </span>
            <span className="text-slate-300">•</span>
            <span>{student.department}</span>
            <span className="text-slate-300">•</span>
            <span>Semester {student.currentSemester} (Spring)</span>
            <span className="text-slate-300">•</span>
            <span className="px-2 py-0.5 rounded bg-slate-100 font-medium">
              AY {student.academicYear}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3 z-10 shrink-0">
          <div className="bg-slate-50 border border-slate-200 px-4 py-2 rounded-xl text-xs">
            <span className="text-[11px] text-slate-500 uppercase font-semibold block">Academic Date</span>
            <span className="font-semibold text-slate-900">Thursday, April 10, 2025</span>
          </div>
          <Link
            href="/student/profile"
            className="portal-btn-primary h-10 text-xs"
          >
            <Download className="w-4 h-4" />
            <span>Digital ID</span>
          </Link>
        </div>
      </div>

      {/* 2. 4-Column KPI Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Subjects */}
        <div className="portal-card p-5 flex flex-col justify-between">
          <div className="flex items-start justify-between">
            <span className="text-[11px] uppercase font-bold text-slate-500 tracking-wider">Current Subjects</span>
            <span className="px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 text-[10px] font-semibold">Active Term</span>
          </div>
          <div className="my-3">
            <div className="text-2xl font-bold text-slate-900 tracking-tight leading-none">
              {subjects.length} Enrolled
            </div>
            <div className="text-xs text-slate-500 mt-1.5 flex items-center gap-1">
              <BookOpen className="w-3.5 h-3.5 text-blue-700" />
              <span>
                {subjects.reduce((sum, s) => sum + (Number(s.credits) || 0), 0)} Total Credit Units
              </span>
            </div>
          </div>
          <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
            <div className="bg-blue-800 h-full rounded-full" style={{ width: subjects.length > 0 ? "100%" : "0%" }}></div>
          </div>
        </div>

        {/* Card 2: Attendance */}
        <div className="portal-card p-5 flex flex-col justify-between">
          <div className="flex items-start justify-between">
            <span className="text-[11px] uppercase font-bold text-slate-500 tracking-wider">Overall Attendance</span>
            <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[10px] font-semibold flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
              {subjects.length > 0 ? "On Track" : "No Records"}
            </span>
          </div>
          <div className="my-3">
            <div className="text-2xl font-bold text-slate-900 tracking-tight leading-none">
              {subjects.length > 0 ? "88.5%" : "0.0%"}
            </div>
            <div className="text-xs text-slate-500 mt-1.5 flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              <span>Institutional Min: 75.0%</span>
            </div>
          </div>
          <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
            <div className="bg-emerald-600 h-full rounded-full" style={{ width: subjects.length > 0 ? "88.5%" : "0%" }}></div>
          </div>
        </div>

        {/* Card 3: Assignments */}
        <div className="portal-card p-5 flex flex-col justify-between">
          <div className="flex items-start justify-between">
            <span className="text-[11px] uppercase font-bold text-slate-500 tracking-wider">Pending Tasks</span>
            <span className="px-2 py-0.5 rounded-full bg-amber-50 text-amber-800 text-[10px] font-semibold">
              {pendingAssignments.length > 0 ? `${pendingAssignments.length} Due Soon` : "All Caught Up"}
            </span>
          </div>
          <div className="my-3">
            <div className="text-2xl font-bold text-slate-900 tracking-tight leading-none">
              {pendingAssignments.length} Pending
            </div>
            <div className="text-xs text-amber-700 mt-1.5 flex items-center gap-1 font-medium">
              <Clock className="w-3.5 h-3.5 text-amber-600" />
              <span>{pendingAssignments.length > 0 ? "Next deadline soon" : "No pending coursework"}</span>
            </div>
          </div>
          <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
            <div className="bg-amber-500 h-full rounded-full" style={{ width: pendingAssignments.length > 0 ? "60%" : "0%" }}></div>
          </div>
        </div>

        {/* Card 4: Upcoming Exams */}
        <div className="portal-card p-5 flex flex-col justify-between">
          <div className="flex items-start justify-between">
            <span className="text-[11px] uppercase font-bold text-slate-500 tracking-wider">Examinations</span>
            <span className="px-2 py-0.5 rounded-full bg-blue-50 text-blue-800 text-[10px] font-semibold">
              {exams.length > 0 ? "Schedule Out" : "No Exams"}
            </span>
          </div>
          <div className="my-3">
            <div className="text-2xl font-bold text-slate-900 tracking-tight leading-none">
              {exams.length} Scheduled
            </div>
            <div className="text-xs text-slate-500 mt-1.5 flex items-center gap-1">
              <Award className="w-3.5 h-3.5 text-blue-700" />
              <span>{exams.length > 0 ? "Mid-Term Examination" : "No active exam schedules"}</span>
            </div>
          </div>
          <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
            <div className="bg-blue-700 h-full rounded-full" style={{ width: exams.length > 0 ? "50%" : "0%" }}></div>
          </div>
        </div>
      </div>

      {/* 3. Main Dashboard 12-Column Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column (8 cols): Today's Schedule + Subject Overview */}
        <div className="lg:col-span-8 space-y-6">
          {/* Today's Timetable */}
          <div className="portal-card overflow-hidden">
            <div className="px-6 py-4 flex items-center justify-between bg-slate-50 border-b border-slate-200">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-blue-800" />
                <h2 className="text-sm font-bold text-slate-900">Today&apos;s Lectures</h2>
                <span className="text-[11px] bg-white border border-slate-200 text-slate-600 px-2 py-0.5 rounded-full font-medium ml-1">
                  {timetable.length} Sessions
                </span>
              </div>
              <Link href="/student/timetable" className="text-xs font-semibold text-blue-800 hover:underline flex items-center gap-1">
                View Weekly Timetable <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {timetable.length === 0 ? (
              <div className="p-8 text-center text-slate-500">
                <Clock className="w-8 h-8 mx-auto mb-2 text-slate-300 stroke-1" />
                <p className="font-semibold text-slate-700 text-sm">No lectures scheduled today</p>
                <p className="text-xs text-slate-400 mt-0.5">Your daily timetable will update once term sessions are finalized.</p>
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {timetable.map((slot) => (
                  <div key={slot.id} className="p-4 sm:px-6 hover:bg-slate-50/80 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-start gap-4">
                      <div className="w-20 shrink-0 text-xs font-mono font-bold text-blue-900 bg-blue-50 py-1.5 px-2 rounded text-center">
                        {slot.startTime}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-slate-900">{slot.subjectCode}</span>
                          <span className="text-slate-300">•</span>
                          <span className="text-xs font-medium text-slate-700">{slot.subjectName}</span>
                        </div>
                        <div className="text-[11px] text-slate-500 mt-0.5">
                          {slot.facultyName} • <span className="font-semibold text-slate-700">{slot.room}</span>
                        </div>
                      </div>
                    </div>
                    <span className="text-[11px] text-emerald-700 font-semibold bg-emerald-50 px-2.5 py-1 rounded-full self-start sm:self-center">
                      Confirmed
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Current Enrolled Subjects Quick View */}
          <div className="portal-card overflow-hidden">
            <div className="px-6 py-4 flex items-center justify-between bg-slate-50 border-b border-slate-200">
              <div className="flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-blue-800" />
                <h2 className="text-sm font-bold text-slate-900">Enrolled Courses & Attendance Status</h2>
              </div>
              <Link href="/student/subjects" className="text-xs font-semibold text-blue-800 hover:underline flex items-center gap-1">
                All Subjects <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {subjects.length === 0 ? (
              <div className="p-8 text-center text-slate-500">
                <BookOpen className="w-8 h-8 mx-auto mb-2 text-slate-300 stroke-1" />
                <p className="font-semibold text-slate-700 text-sm">No subjects enrolled</p>
                <p className="text-xs text-slate-400 mt-0.5">Courses added by administration in Course Management will appear here.</p>
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {subjects.map((sub) => {
                  const isWarning = sub.attendancePercent < 80;
                  return (
                    <div key={sub.id} className="p-4 sm:px-6 flex items-center justify-between gap-4 hover:bg-slate-50/60 transition-colors">
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-blue-900 bg-slate-100 px-2 py-0.5 rounded">
                            {sub.code}
                          </span>
                          <Link href={`/student/subjects/${sub.id}`} className="text-xs font-semibold text-slate-900 hover:text-blue-800 truncate">
                            {sub.name}
                          </Link>
                        </div>
                        <p className="text-[11px] text-slate-500 mt-1">{sub.facultyName} • {sub.credits} Credits</p>
                      </div>

                      <div className="text-right shrink-0">
                        <div className={`text-xs font-bold tabular-nums ${
                          sub.totalSessions === 0 ? "text-slate-400" : isWarning ? "text-amber-600" : "text-emerald-700"
                        }`}>
                          {sub.totalSessions === 0 ? "--" : `${sub.attendancePercent}%`}
                        </div>
                        <span className="text-[10px] text-slate-400">
                          {sub.totalSessions === 0 ? "0 sessions" : `${sub.attendedSessions}/${sub.totalSessions} sessions`}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Right Column (4 cols): Pending Submissions + Latest Bulletins */}
        <div className="lg:col-span-4 space-y-6">
          {/* Pending Coursework Tasks */}
          <div className="portal-card overflow-hidden">
            <div className="px-5 py-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-blue-800" />
                <h2 className="text-sm font-bold text-slate-900">Pending Assignments</h2>
              </div>
              <Link href="/student/assignments" className="text-xs font-semibold text-blue-800 hover:underline">
                View All
              </Link>
            </div>

            {pendingAssignments.length === 0 ? (
              <div className="p-6 text-center text-slate-500">
                <FileText className="w-8 h-8 mx-auto mb-2 text-slate-300 stroke-1" />
                <p className="font-semibold text-slate-700 text-xs">No pending assignments</p>
                <p className="text-[11px] text-slate-400 mt-0.5">You are all caught up with your coursework!</p>
              </div>
            ) : (
              <div className="p-4 space-y-3">
                {pendingAssignments.map((asg) => (
                  <div key={asg.id} className="p-3.5 rounded-xl border border-slate-200/80 bg-slate-50/50 hover:bg-white hover:shadow-sm transition-all space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold bg-blue-100 text-blue-800 px-2 py-0.5 rounded">
                        {asg.subjectCode}
                      </span>
                      <span className="text-[11px] font-semibold text-amber-700 flex items-center gap-1">
                        <Clock className="w-3 h-3" /> {asg.dueDate}
                      </span>
                    </div>
                    <h3 className="text-xs font-bold text-slate-900 leading-snug">{asg.title}</h3>
                    <Link
                      href={`/student/assignments/${asg.id}`}
                      className="portal-btn-primary w-full h-8 text-xs mt-1"
                    >
                      Submit Work
                    </Link>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Institutional Bulletins */}
          <div className="portal-card overflow-hidden">
            <div className="px-5 py-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Bell className="w-4 h-4 text-blue-800" />
                <h2 className="text-sm font-bold text-slate-900">Official Notices</h2>
              </div>
              <Link href="/student/notices" className="text-xs font-semibold text-blue-800 hover:underline">
                Notice Board
              </Link>
            </div>

            {notices.length === 0 ? (
              <div className="p-6 text-center text-slate-500">
                <Bell className="w-8 h-8 mx-auto mb-2 text-slate-300 stroke-1" />
                <p className="font-semibold text-slate-700 text-xs">No active notices</p>
                <p className="text-[11px] text-slate-400 mt-0.5">Official administrative bulletins will be posted here.</p>
              </div>
            ) : (
              <div className="p-4 space-y-3">
                {notices.map((notice) => (
                  <Link
                    key={notice.id}
                    href={`/student/notices/${notice.id}`}
                    className="block p-3 rounded-xl border border-slate-100 hover:border-slate-200 hover:bg-slate-50 transition-all"
                  >
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase ${
                        notice.priority === "CRITICAL"
                          ? "bg-red-50 text-red-700 border border-red-200"
                          : "bg-blue-50 text-blue-700"
                      }`}>
                        {notice.category}
                      </span>
                      <span className="text-[10px] text-slate-400">{notice.publishedAt}</span>
                    </div>
                    <h3 className="text-xs font-semibold text-slate-900 line-clamp-2 hover:text-blue-800">
                      {notice.title}
                    </h3>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
