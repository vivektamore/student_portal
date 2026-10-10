"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { FileText, Clock, CheckCircle2, ArrowRight, Filter, AlertCircle } from "lucide-react";
import { DataService, AssignmentRecord } from "@/lib/data-service";

export default function StudentAssignmentsPage() {
  const [assignments, setAssignments] = useState<AssignmentRecord[]>([]);
  const [filter, setFilter] = useState<"ALL" | "PENDING" | "SUBMITTED" | "GRADED">("ALL");

  useEffect(() => {
    DataService.getAssignments().then(setAssignments);
  }, []);

  const filtered = assignments.filter((a) => {
    if (filter === "ALL") return true;
    return a.status === filter;
  });

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Course Assignments & Lab Work</h1>
          <p className="text-xs text-slate-500 mt-1">
            Track coursework deadlines, submit verified problem sets, and review instructor feedback.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold px-3 py-1 bg-amber-50 text-amber-800 rounded-full border border-amber-200">
            {assignments.filter((a) => a.status === "PENDING").length} Tasks Due Soon
          </span>
        </div>
      </div>

      {/* Status Filter Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-1 overflow-x-auto">
        {(["ALL", "PENDING", "SUBMITTED", "GRADED"] as const).map((tab) => {
          const isActive = filter === tab;
          const count = tab === "ALL" ? assignments.length : assignments.filter((a) => a.status === tab).length;
          return (
            <button
              key={tab}
              type="button"
              onClick={() => setFilter(tab)}
              className={`px-4 py-2 text-xs font-semibold rounded-lg transition-all flex items-center gap-2 ${
                isActive
                  ? "bg-blue-800 text-white shadow-sm"
                  : "text-slate-600 hover:bg-slate-100"
              }`}
            >
              <span>{tab.charAt(0) + tab.slice(1).toLowerCase()}</span>
              <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                isActive ? "bg-blue-600 text-white" : "bg-slate-200 text-slate-700"
              }`}>
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Assignment List Cards */}
      <div className="space-y-4">
        {filtered.length === 0 ? (
          <div className="portal-card p-12 text-center text-slate-500">
            <FileText className="w-10 h-10 mx-auto mb-2 text-slate-300 stroke-1" />
            <p className="font-semibold text-slate-700">No coursework assignments found</p>
            <p className="text-xs text-slate-400 mt-1">
              There are currently no tasks matching the selected filter criteria.
            </p>
          </div>
        ) : (
          filtered.map((asg) => {
          const isPending = asg.status === "PENDING";
          const isGraded = asg.status === "GRADED";
          return (
            <div
              key={asg.id}
              className="portal-card p-5 sm:p-6 flex flex-col md:flex-row md:items-center justify-between gap-5 hover:border-blue-300 transition-all"
            >
              <div className="space-y-2 flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-mono text-xs font-bold text-blue-900 bg-blue-50 border border-blue-200 px-2 py-0.5 rounded">
                    {asg.subjectCode}
                  </span>
                  <span className="text-xs text-slate-500 font-medium">{asg.subjectName}</span>
                  <span className="text-slate-300">•</span>
                  <span className="text-[11px] text-slate-500 font-medium">Max Score: {asg.maxMarks}</span>
                </div>

                <h3 className="text-base font-bold text-slate-900 leading-snug">{asg.title}</h3>
                <p className="text-xs text-slate-600 line-clamp-2 max-w-3xl">{asg.description}</p>

                <div className="flex items-center gap-4 text-xs pt-1">
                  <span className="flex items-center gap-1.5 text-amber-700 font-medium">
                    <Clock className="w-3.5 h-3.5 text-amber-600" />
                    Due: {asg.dueDate}
                  </span>
                  {asg.submittedAt && (
                    <span className="text-slate-500">Submitted: {asg.submittedAt}</span>
                  )}
                </div>
              </div>

              <div className="flex flex-col sm:flex-row md:flex-col items-start sm:items-center md:items-end justify-between gap-3 shrink-0 pt-3 md:pt-0 border-t md:border-t-0 border-slate-100">
                {isGraded ? (
                  <div className="text-right">
                    <span className="text-[11px] font-semibold text-slate-400 block uppercase">Grade Released</span>
                    <span className="text-lg font-bold font-mono text-emerald-700">
                      {asg.marksObtained} / {asg.maxMarks}
                    </span>
                  </div>
                ) : (
                  <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
                    isPending
                      ? "bg-amber-50 text-amber-800 border border-amber-200"
                      : "bg-blue-50 text-blue-800 border border-blue-200"
                  }`}>
                    {asg.status}
                  </span>
                )}

                <Link
                  href={`/student/assignments/${asg.id}`}
                  className="portal-btn-primary h-9 text-xs"
                >
                  <span>{isPending ? "Submit Assignment" : "View Submission"}</span>
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
