"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { BookOpen, Search, Filter, User, ArrowRight, CheckCircle2, AlertTriangle } from "lucide-react";
import { DataService, SubjectRecord } from "@/lib/data-service";

export default function StudentSubjectsPage() {
  const [subjects, setSubjects] = useState<SubjectRecord[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedSemester, setSelectedSemester] = useState("ALL");

  useEffect(() => {
    DataService.getSubjects().then(setSubjects);
  }, []);

  const totalCredits = subjects.reduce((sum, s) => sum + (Number(s.credits) || 0), 0);

  const filteredSubjects = subjects.filter((s) => {
    const matchesSearch =
      s.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.facultyName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSem = selectedSemester === "ALL" || s.semester.toString() === selectedSemester;
    return matchesSearch && matchesSem;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">My Subjects</h1>
          <p className="text-xs text-slate-500 mt-1">
            Registered courses, credit values, assigned faculty, and syllabus guides.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold px-3 py-1 bg-blue-50 text-blue-800 rounded-full border border-blue-200">
            Total Enrolled: {subjects.length} Subjects ({totalCredits} Credits)
          </span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="portal-card p-4 flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
          <input
            type="text"
            placeholder="Search by code, subject name, or instructor..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="portal-input pl-9 text-xs"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Filter className="w-4 h-4 text-slate-400" />
          <select
            value={selectedSemester}
            onChange={(e) => setSelectedSemester(e.target.value)}
            className="portal-input text-xs w-full sm:w-44"
          >
            <option value="ALL">All Semesters</option>
            <option value="1">Semester 1</option>
            <option value="2">Semester 2</option>
            <option value="3">Semester 3</option>
            <option value="4">Semester 4</option>
            <option value="5">Semester 5</option>
            <option value="6">Semester 6</option>
            <option value="7">Semester 7</option>
            <option value="8">Semester 8</option>
          </select>
        </div>
      </div>

      {/* Subjects Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredSubjects.length === 0 ? (
          <div className="col-span-full portal-card p-12 text-center text-slate-500">
            <BookOpen className="w-10 h-10 mx-auto mb-2 text-slate-300 stroke-1" />
            <p className="font-semibold text-slate-700">No courses found</p>
            <p className="text-xs text-slate-400 mt-1">
              Courses added by administration in Course Management will appear here.
            </p>
          </div>
        ) : (
          filteredSubjects.map((sub) => {
          const isWarning = sub.attendancePercent < 80;
          return (
            <div key={sub.id} className="portal-card p-5 flex flex-col justify-between hover:border-blue-300 transition-all">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="font-mono text-xs font-bold text-blue-900 bg-blue-50 border border-blue-200 px-2.5 py-1 rounded-md">
                    {sub.code}
                  </span>
                  <span className="text-[11px] font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                    {sub.credits} Credits • {sub.type}
                  </span>
                </div>

                <h3 className="font-bold text-slate-900 text-sm leading-snug mb-2">
                  {sub.name}
                </h3>
                <p className="text-xs text-slate-500 line-clamp-2 mb-4">
                  {sub.description}
                </p>
              </div>

              <div className="pt-4 border-t border-slate-100 space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="flex items-center gap-1.5 text-slate-600">
                    <User className="w-3.5 h-3.5 text-slate-400" />
                    {sub.facultyName}
                  </span>
                </div>

                <div className="bg-slate-50 p-2.5 rounded-lg flex items-center justify-between text-xs">
                  <span className="text-[11px] text-slate-500">Attendance:</span>
                  <div className="flex items-center gap-1 font-bold tabular-nums">
                    {sub.totalSessions === 0 ? (
                      <span className="text-slate-400 font-medium text-[11px]">-- (0 sessions conducted)</span>
                    ) : (
                      <>
                        {isWarning ? (
                          <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
                        ) : (
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                        )}
                        <span className={isWarning ? "text-amber-700" : "text-emerald-700"}>
                          {sub.attendancePercent}% ({sub.attendedSessions}/{sub.totalSessions})
                        </span>
                      </>
                    )}
                  </div>
                </div>

                <Link
                  href={`/student/subjects/${sub.id}`}
                  className="portal-btn-primary w-full h-9 text-xs"
                >
                  <span>Course Syllabus & Files</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          );
        }))}
      </div>
    </div>
  );
}
