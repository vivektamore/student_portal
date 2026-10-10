"use client";

import React, { useState, useEffect } from "react";
import { Award, Calendar, Clock, MapPin, Download, AlertCircle, CheckCircle2 } from "lucide-react";
import { DataService, ExamRecord, StudentRecord } from "@/lib/data-service";

export default function StudentExamsPage() {
  const [exams, setExams] = useState<ExamRecord[]>([]);
  const [student, setStudent] = useState<StudentRecord | null>(null);

  useEffect(() => {
    DataService.getExams().then(setExams);
    DataService.getStudentProfile().then(setStudent);
  }, []);

  const candidateName = student?.firstName ? `${student.firstName} ${student.lastName}`.trim() : "Enrolled Student";
  const candidateId = student?.enrollmentNumber || "NOT-ENROLLED";
  const programSemester = student ? `${student.program} Semester ${student.currentSemester}` : "Academic Term";

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Examinations & Hall Ticket</h1>
          <p className="text-xs text-slate-500 mt-1">
            Official examination timetable, venue allocations, desk numbering, and digital hall ticket.
          </p>
        </div>
        <button
          type="button"
          onClick={() => {
            if (exams.length === 0) {
              alert("No published examination schedules available to generate Hall Ticket.");
              return;
            }
            alert(`Generating Official Hall Ticket PDF for ${candidateName} (${candidateId})...`);
          }}
          className="portal-btn-primary h-9 text-xs"
        >
          <Download className="w-4 h-4" /> Download Official Hall Ticket
        </button>
      </div>

      {/* Hall Ticket Meta Card */}
      <div className="portal-card p-6 bg-gradient-to-r from-blue-900 to-indigo-900 text-white rounded-2xl relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 z-10 relative">
          <div>
            <span className="text-[11px] font-semibold tracking-wider text-blue-200 uppercase">
              {exams.length > 0 ? "Hall Ticket Ready • Spring Term 2025" : "Examination Schedule Status"}
            </span>
            <h2 className="text-xl font-bold mt-1">
              {exams.length > 0 ? "Semester Examination Schedule" : "No Active Examination Cycles Published"}
            </h2>
            <div className="flex flex-wrap items-center gap-3 text-xs text-blue-100 mt-2">
              <span>Candidate: <strong>{candidateName}</strong></span>
              <span>•</span>
              <span>ID: <strong>{candidateId}</strong></span>
              <span>•</span>
              <span>Center: <strong>Main University Academic Block</strong></span>
            </div>
          </div>

          <div className="bg-white/10 backdrop-blur border border-white/20 p-3 rounded-xl text-center shrink-0">
            <span className="text-[10px] text-blue-200 block uppercase font-medium">Reporting Time</span>
            <span className="text-base font-bold font-mono">09:30 AM (30 min prior)</span>
          </div>
        </div>
      </div>

      {/* Exam Timetable Schedule Table */}
      <div className="portal-card overflow-hidden">
        <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-blue-800" />
            <h3 className="text-sm font-bold text-slate-900">Scheduled Exam Date Sheet</h3>
          </div>
          <span className="text-xs text-slate-500 font-medium">{programSemester}</span>
        </div>

        <div className="overflow-x-auto">
          {exams.length === 0 ? (
            <div className="p-12 text-center text-slate-500">
              <Award className="w-10 h-10 mx-auto mb-2 text-slate-300 stroke-1" />
              <p className="font-semibold text-slate-700">No examinations scheduled</p>
              <p className="text-xs text-slate-400 mt-1">
                Official examination dates and venue rosters will be published here by the Controller of Examinations.
              </p>
            </div>
          ) : (
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50/50 text-slate-500 font-semibold uppercase text-[10px]">
                  <th className="py-3 px-6">Subject Code & Course</th>
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4">Time Window</th>
                  <th className="py-3 px-4">Examination Room / Desk</th>
                  <th className="py-3 px-6 text-center">Publication Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {exams.map((ex) => (
                  <tr key={ex.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-4 px-6">
                      <span className="font-mono text-xs font-bold text-blue-900 bg-blue-50 px-2 py-0.5 rounded mr-2">
                        {ex.subjectCode}
                      </span>
                      <span className="font-semibold text-slate-900">{ex.subjectName}</span>
                    </td>
                    <td className="py-4 px-4 font-medium text-slate-700 whitespace-nowrap">{ex.date}</td>
                    <td className="py-4 px-4 font-mono text-slate-600 whitespace-nowrap">
                      {ex.startTime} – {ex.endTime}
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-1.5 font-semibold text-slate-800">
                        <MapPin className="w-3.5 h-3.5 text-blue-700" />
                        {ex.room}
                      </div>
                    </td>
                    <td className="py-4 px-6 text-center">
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-800 text-[11px] font-semibold border border-blue-200">
                        <CheckCircle2 className="w-3 h-3 text-blue-600" /> Confirmed
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Guidelines Accordion / Box */}
      <div className="portal-card p-6 bg-slate-50/60 border-slate-200 text-xs space-y-3">
        <h4 className="font-bold text-slate-900 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-blue-800" />
          Instructions for Candidates
        </h4>
        <ul className="list-disc list-inside text-slate-600 space-y-1.5">
          <li>Candidates must produce a printed Hall Ticket alongside the Physical Student ID Card upon entering the hall.</li>
          <li>No candidate shall be allowed inside the venue after 15 minutes past the scheduled commencement time.</li>
          <li>Smartwatches, mobile phones, or programmable calculators are prohibited.</li>
        </ul>
      </div>
    </div>
  );
}
