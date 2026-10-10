"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  ArrowLeft,
  BookOpen,
  User,
  Download,
  FileText,
  CheckCircle2,
  Calendar,
  Layers,
  Clock,
} from "lucide-react";
import { DataService, SubjectRecord, AssignmentRecord } from "@/lib/data-service";

export default function SubjectDetailsPage() {
  const params = useParams();
  const subjectId = params.subjectId as string;
  const [subject, setSubject] = useState<SubjectRecord | null>(null);
  const [assignments, setAssignments] = useState<AssignmentRecord[]>([]);

  useEffect(() => {
    async function load() {
      const sub = await DataService.getSubjectById(subjectId);
      const asgs = await DataService.getAssignments();
      setSubject(sub);
      setAssignments(asgs.filter((a) => a.subjectCode === sub?.code));
    }
    load();
  }, [subjectId]);

  if (!subject) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-8 h-8 border-4 border-blue-800 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  const syllabusUnits = [
    { unit: "Unit 1", title: "Foundations & Asymptotic Analysis", topics: "Recurrences, Master theorem, Amortized complexity, Divide-and-conquer recurrences." },
    { unit: "Unit 2", title: "Advanced Dynamic Programming", topics: "Matrix chain multiplication, Longest common subsequence, Bellman-Ford, Floyd-Warshall." },
    { unit: "Unit 3", title: "Greedy Strategies & Graph Algorithms", topics: "Huffman coding, Fractional knapsack, Minimum spanning trees (Prim/Kruskal), Max flow." },
    { unit: "Unit 4", title: "Intractability & NP-Completeness", topics: "Polynomial time reductions, Circuit-SAT, 3-CNF SAT, Clique, Vertex Cover, TSP approximations." },
  ];

  const materials = [
    { title: "Course Syllabus & Recommended Readings", type: "PDF", size: "1.4 MB", date: "Jan 08, 2025" },
    { title: "Lecture Notes — Dynamic Programming Proofs", type: "PDF", size: "3.8 MB", date: "Feb 14, 2025" },
    { title: "Graph Algorithms Problem Set & Solutions", type: "ZIP", size: "8.2 MB", date: "Mar 02, 2025" },
    { title: "Lab Manual & Benchmark Evaluation Framework", type: "PDF", size: "2.1 MB", date: "Jan 12, 2025" },
  ];

  return (
    <div className="space-y-6">
      {/* Back button & Breadcrumb */}
      <div className="flex items-center gap-2 text-xs text-slate-500">
        <Link href="/student/subjects" className="hover:text-blue-800 flex items-center gap-1 font-medium">
          <ArrowLeft className="w-3.5 h-3.5" /> Back to My Subjects
        </Link>
        <span>/</span>
        <span className="text-slate-900 font-semibold">{subject.code}</span>
      </div>

      {/* Main Banner */}
      <div className="portal-card p-6 relative overflow-hidden bg-white">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="font-mono text-xs font-bold text-blue-900 bg-blue-50 border border-blue-200 px-2.5 py-1 rounded">
                {subject.code}
              </span>
              <span className="text-xs bg-slate-100 text-slate-700 px-2.5 py-0.5 rounded font-medium">
                {subject.credits} Credits • {subject.type}
              </span>
            </div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">{subject.name}</h1>
            <p className="text-xs text-slate-500 mt-2 max-w-2xl leading-relaxed">{subject.description}</p>
          </div>

          <div className="bg-slate-50 border border-slate-200 p-4 rounded-xl shrink-0 text-right">
            <span className="text-[11px] text-slate-500 uppercase font-bold block">Current Attendance</span>
            <div className="text-2xl font-bold text-emerald-700 tabular-nums mt-0.5">
              {subject.attendancePercent}%
            </div>
            <span className="text-[11px] text-slate-400">
              {subject.attendedSessions} of {subject.totalSessions} sessions attended
            </span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column (8 cols): Syllabus + Course Materials */}
        <div className="lg:col-span-8 space-y-6">
          {/* Syllabus Modules */}
          <div className="portal-card p-6">
            <div className="flex items-center gap-2 pb-4 mb-4 border-b border-slate-100">
              <Layers className="w-4 h-4 text-blue-800" />
              <h2 className="text-sm font-bold text-slate-900">Syllabus Breakdown</h2>
            </div>

            <div className="space-y-3">
              {syllabusUnits.map((u, i) => (
                <div key={i} className="p-3.5 rounded-xl border border-slate-200/80 bg-slate-50/50">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-bold text-blue-900">{u.unit}: {u.title}</span>
                    <span className="text-[10px] bg-slate-200/60 text-slate-700 px-2 py-0.5 rounded">Active</span>
                  </div>
                  <p className="text-xs text-slate-600">{u.topics}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Authorized Study Materials */}
          <div className="portal-card p-6">
            <div className="flex items-center gap-2 pb-4 mb-4 border-b border-slate-100">
              <Download className="w-4 h-4 text-blue-800" />
              <h2 className="text-sm font-bold text-slate-900">Authorized Study Materials & Lecture Notes</h2>
            </div>

            <div className="divide-y divide-slate-100">
              {materials.map((m, i) => (
                <div key={i} className="py-3 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-800 flex items-center justify-center text-xs font-bold font-mono">
                      {m.type}
                    </div>
                    <div>
                      <h4 className="text-xs font-semibold text-slate-900">{m.title}</h4>
                      <p className="text-[11px] text-slate-400">{m.size} • Published {m.date}</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => alert(`Downloading ${m.title}`)}
                    className="portal-btn-secondary h-8 text-xs shrink-0"
                  >
                    <Download className="w-3.5 h-3.5" /> Download
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column (4 cols): Faculty Info & Related Assignments */}
        <div className="lg:col-span-4 space-y-6">
          {/* Faculty Card */}
          <div className="portal-card p-5">
            <div className="text-[11px] uppercase font-bold text-slate-400 mb-3 tracking-wider">
              Course Instructor
            </div>
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-900 flex items-center justify-center font-bold text-sm">
                {subject.facultyName?.charAt(0) || "P"}
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900">{subject.facultyName}</h3>
                <p className="text-xs text-slate-500">Department of CSE</p>
              </div>
            </div>
            <div className="text-xs text-slate-600 space-y-1.5 pt-3 border-t border-slate-100">
              <p>Email: <a href={`mailto:${subject.facultyEmail}`} className="text-blue-800 hover:underline">{subject.facultyEmail}</a></p>
              <p>Office: Academic Block 4, Room 302</p>
              <p>Office Hours: Tue & Thu (03:00 PM – 05:00 PM)</p>
            </div>
          </div>

          {/* Related Assignments */}
          <div className="portal-card p-5">
            <div className="text-[11px] uppercase font-bold text-slate-400 mb-3 tracking-wider">
              Related Assignments
            </div>
            {assignments.length === 0 ? (
              <p className="text-xs text-slate-500">No active assignments for this course.</p>
            ) : (
              <div className="space-y-3">
                {assignments.map((asg) => (
                  <div key={asg.id} className="p-3 rounded-lg border border-slate-200 bg-slate-50 text-xs space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-slate-900 truncate">{asg.title}</span>
                    </div>
                    <p className="text-[11px] text-amber-700 font-medium">Due: {asg.dueDate}</p>
                    <Link
                      href={`/student/assignments/${asg.id}`}
                      className="text-[11px] font-bold text-blue-800 hover:underline inline-block pt-1"
                    >
                      View Assignment & Submit →
                    </Link>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
