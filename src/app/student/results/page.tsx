"use client";

import React, { useState, useEffect } from "react";
import { GraduationCap, Award, Download, CheckCircle, FileText, ChevronRight } from "lucide-react";
import { DataService, ResultRecord, StudentRecord } from "@/lib/data-service";

export default function StudentResultsPage() {
  const [results, setResults] = useState<ResultRecord[]>([]);
  const [student, setStudent] = useState<StudentRecord | null>(null);
  const [activeSemester, setActiveSemester] = useState(1);

  useEffect(() => {
    DataService.getStudentProfile().then((s) => {
      setStudent(s);
      if (s?.currentSemester) {
        setActiveSemester(s.currentSemester > 1 ? s.currentSemester - 1 : 1);
      }
    });
    DataService.getResults().then(setResults);
  }, []);

  const publishedResults = results.filter((r) => r.isPublished && r.semester === activeSemester);

  const totalCredits = publishedResults.reduce((acc, r) => acc + r.credits, 0);
  const weightedPoints = publishedResults.reduce((acc, r) => acc + r.gradePoints * r.credits, 0);
  const sgpa = totalCredits > 0 ? (weightedPoints / totalCredits).toFixed(2) : "0.00";
  const cgpa = student?.cgpa && Number(student.cgpa) > 0 ? Number(student.cgpa).toFixed(2) : sgpa;

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Academic Results & Transcripts</h1>
          <p className="text-xs text-slate-500 mt-1">
            Officially verified grade sheets, semester credits, SGPA/CGPA transcripts.
          </p>
        </div>
        <button
          type="button"
          onClick={() => {
            if (publishedResults.length === 0) {
              alert("No published academic results available to download transcript.");
              return;
            }
            alert("Downloading Official Semester Grade Transcript...");
          }}
          className="portal-btn-primary h-9 text-xs"
        >
          <Download className="w-4 h-4" /> Download Grade Transcript (PDF)
        </button>
      </div>

      {/* GPA Score Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <div className="portal-card p-6 bg-white flex flex-col justify-between">
          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
            Cumulative GPA (CGPA)
          </span>
          <div className="my-2">
            <span className="text-4xl font-bold text-blue-900 font-mono tracking-tight">
              {Number(cgpa) > 0 ? cgpa : "--"}
            </span>
            <span className="text-xs text-slate-400 ml-2">/ 10.0 Scale</span>
          </div>
          <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded self-start">
            {Number(cgpa) >= 8.5 ? "First Class with Distinction" : Number(cgpa) >= 6.5 ? "First Class" : "Good Academic Standing"}
          </span>
        </div>

        <div className="portal-card p-6 bg-white flex flex-col justify-between">
          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
            Semester {activeSemester} GPA (SGPA)
          </span>
          <div className="my-2">
            <span className="text-4xl font-bold text-blue-900 font-mono tracking-tight">
              {publishedResults.length > 0 ? sgpa : "--"}
            </span>
            <span className="text-xs text-slate-400 ml-2">/ 10.0 Scale</span>
          </div>
          <span className="text-xs font-semibold text-blue-800 bg-blue-50 px-2 py-0.5 rounded self-start">
            {totalCredits} Total Credits Completed
          </span>
        </div>

        <div className="portal-card p-6 bg-white flex flex-col justify-between">
          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
            Publication Status
          </span>
          <div className="my-2 flex items-center gap-2">
            {publishedResults.length > 0 ? (
              <>
                <CheckCircle className="w-5 h-5 text-emerald-600" />
                <span className="text-sm font-bold text-slate-900">Official Result Published</span>
              </>
            ) : (
              <span className="text-sm font-semibold text-slate-500">Awaiting Grade Entry</span>
            )}
          </div>
          <span className="text-[11px] text-slate-500">
            Validated by Office of Controller of Examinations
          </span>
        </div>
      </div>

      {/* Semester Switcher Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-1 overflow-x-auto">
        {[1, 2, 3, 4, 5, 6, 7, 8].map((sem) => (
          <button
            key={sem}
            type="button"
            onClick={() => setActiveSemester(sem)}
            className={`px-4 py-2 text-xs font-semibold rounded-lg transition-all whitespace-nowrap ${
              activeSemester === sem
                ? "bg-blue-800 text-white shadow-sm"
                : "text-slate-600 hover:bg-slate-100"
            }`}
          >
            Semester {sem}
          </button>
        ))}
      </div>

      {/* Results Grade Table */}
      <div className="portal-card overflow-hidden">
        <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <GraduationCap className="w-4 h-4 text-blue-800" />
            <h3 className="text-sm font-bold text-slate-900">Semester {activeSemester} Subject Marks & Grades</h3>
          </div>
          <span className="text-xs text-slate-500 font-mono font-medium">AY 2024–2025</span>
        </div>

        <div className="overflow-x-auto">
          {publishedResults.length === 0 ? (
            <div className="p-12 text-center text-slate-500">
              <GraduationCap className="w-10 h-10 mx-auto mb-2 text-slate-300 stroke-1" />
              <p className="font-semibold text-slate-700">No results published yet for Semester {activeSemester}</p>
              <p className="text-xs text-slate-400 mt-1">
                Official grades will appear here once verified and released by the Office of the Controller of Examinations.
              </p>
            </div>
          ) : (
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50/50 text-slate-500 font-semibold uppercase text-[10px]">
                  <th className="py-3 px-6">Subject Code & Title</th>
                  <th className="py-3 px-4 text-center">Credits</th>
                  <th className="py-3 px-4 text-center">Internal</th>
                  <th className="py-3 px-4 text-center">Exam</th>
                  <th className="py-3 px-4 text-center">Total</th>
                  <th className="py-3 px-4 text-center">Letter Grade</th>
                  <th className="py-3 px-6 text-center">Grade Points</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {publishedResults.map((res) => (
                  <tr key={res.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-4 px-6">
                      <span className="font-mono text-xs font-bold text-blue-900 bg-blue-50 px-2 py-0.5 rounded mr-2">
                        {res.subjectCode}
                      </span>
                      <span className="font-semibold text-slate-900">{res.subjectName}</span>
                    </td>
                    <td className="py-4 px-4 text-center font-mono font-medium text-slate-700">{res.credits}</td>
                    <td className="py-4 px-4 text-center font-mono text-slate-600">{res.internalMarks}</td>
                    <td className="py-4 px-4 text-center font-mono text-slate-600">{res.examMarks}</td>
                    <td className="py-4 px-4 text-center font-mono font-bold text-slate-900">{res.totalMarks}</td>
                    <td className="py-4 px-4 text-center">
                      <span className="font-bold text-blue-900 bg-blue-50 px-2.5 py-0.5 rounded border border-blue-200">
                        {res.grade}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-center font-mono font-bold text-slate-800">{res.gradePoints.toFixed(1)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Grading Scale Legend */}
      <div className="portal-card p-5 bg-slate-50/60 border-slate-200 text-xs">
        <h4 className="font-bold text-slate-900 mb-2">University 10-Point Absolute Grading Scheme</h4>
        <div className="grid grid-cols-2 sm:grid-cols-6 gap-2 text-slate-600 font-mono text-[11px]">
          <div>A+ (90-100): 10.0</div>
          <div>A  (80-89): 9.0</div>
          <div>B+ (70-79): 8.0</div>
          <div>B  (60-69): 7.0</div>
          <div>C  (50-59): 6.0</div>
          <div>F  (&lt;50): 0.0 (Fail)</div>
        </div>
      </div>
    </div>
  );
}
