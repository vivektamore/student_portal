"use client";

import React, { useState, useEffect } from "react";
import { Award, Plus, Calendar, Clock, MapPin, CheckCircle2 } from "lucide-react";
import { DataService, ExamRecord } from "@/lib/data-service";

export default function AdminExamsPage() {
  const [exams, setExams] = useState<ExamRecord[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [subjectCode, setSubjectCode] = useState("CS-304");
  const [title, setTitle] = useState("Spring 2025 Mid-Semester Exam");
  const [type, setType] = useState("MID_TERM");
  const [date, setDate] = useState("Monday, Apr 21, 2025");
  const [startTime, setStartTime] = useState("10:00 AM");
  const [endTime, setEndTime] = useState("12:00 PM");
  const [room, setRoom] = useState("Exam Hall 2");

  useEffect(() => {
    DataService.getExams().then(setExams);
  }, []);

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    const newEx: ExamRecord = {
      id: `ex_${Date.now()}`,
      title,
      type,
      subjectCode,
      subjectName: subjectCode === "CS-304" ? "Computer Networks" : "Software Engineering",
      date,
      startTime,
      endTime,
      room,
      maxMarks: 50,
      status: "UPCOMING",
    };
    setExams([...exams, newEx]);
    setShowModal(false);
  };

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Examination Schedule Coordination</h1>
          <p className="text-xs text-slate-500 mt-1">
            Build examination sessions, allocate venues, validate invigilator duties, and publish official date sheets.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setShowModal(true)}
          className="portal-btn-primary h-9 text-xs"
        >
          <Plus className="w-4 h-4" /> Schedule Exam
        </button>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-xl border border-slate-200">
            <h2 className="text-base font-bold text-slate-900 mb-1">Schedule Examination Session</h2>
            <form onSubmit={handleCreate} className="space-y-3 text-xs mt-4">
              <div>
                <label className="block font-semibold text-slate-800 mb-1">Subject</label>
                <select
                  value={subjectCode}
                  onChange={(e) => setSubjectCode(e.target.value)}
                  className="portal-input text-xs"
                >
                  <option value="CS-301">CS-301: Algorithms</option>
                  <option value="CS-302">CS-302: DBMS</option>
                  <option value="CS-303">CS-303: Operating Systems</option>
                  <option value="CS-304">CS-304: Computer Networks</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-800 mb-1">Examination Title</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="portal-input"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-800 mb-1">Date String</label>
                  <input
                    type="text"
                    required
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="portal-input"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-800 mb-1">Venue / Room</label>
                  <input
                    type="text"
                    required
                    value={room}
                    onChange={(e) => setRoom(e.target.value)}
                    className="portal-input"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-800 mb-1">Start Time</label>
                  <input
                    type="text"
                    required
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    className="portal-input font-mono"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-800 mb-1">End Time</label>
                  <input
                    type="text"
                    required
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                    className="portal-input font-mono"
                  />
                </div>
              </div>

              <div className="pt-3 flex items-center justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="portal-btn-secondary h-8 text-xs"
                >
                  Cancel
                </button>
                <button type="submit" className="portal-btn-primary h-8 text-xs">
                  Save Exam
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Table */}
      <div className="portal-card overflow-hidden">
        <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Award className="w-4 h-4 text-blue-800" />
            <h3 className="text-sm font-bold text-slate-900">Configured Examination Timetable ({exams.length})</h3>
          </div>
          <span className="text-xs text-emerald-700 font-semibold bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
            Official Timetable Published
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/50 text-slate-500 font-semibold uppercase text-[10px]">
                <th className="py-3 px-6">Subject Code & Course</th>
                <th className="py-3 px-4">Date</th>
                <th className="py-3 px-4">Timings</th>
                <th className="py-3 px-4">Exam Hall</th>
                <th className="py-3 px-6 text-center">Desk Capacity</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {exams.map((ex) => (
                <tr key={ex.id} className="hover:bg-slate-50/60 transition-colors">
                  <td className="py-4 px-6 font-bold text-slate-900">
                    <span className="font-mono text-xs font-bold text-blue-900 bg-blue-50 px-2 py-0.5 rounded mr-2 border border-blue-200">
                      {ex.subjectCode}
                    </span>
                    {ex.subjectName}
                  </td>
                  <td className="py-4 px-4 text-slate-700">{ex.date}</td>
                  <td className="py-4 px-4 font-mono text-slate-600">{ex.startTime} – {ex.endTime}</td>
                  <td className="py-4 px-4 font-semibold text-slate-800">{ex.room}</td>
                  <td className="py-4 px-6 text-center">
                    <span className="text-emerald-700 font-semibold bg-emerald-50 px-2 py-0.5 rounded">
                      Allocated (60 Desks)
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
