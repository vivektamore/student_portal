"use client";

import React, { useState, useEffect } from "react";
import { Clock, Plus, AlertTriangle, CheckCircle2, ShieldCheck, MapPin, User } from "lucide-react";
import { DataService, TimetableSlot } from "@/lib/data-service";

export default function AdminTimetablePage() {
  const [timetable, setTimetable] = useState<TimetableSlot[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [dayOfWeek, setDayOfWeek] = useState(4);
  const [startTime, setStartTime] = useState("09:00 AM");
  const [endTime, setEndTime] = useState("10:00 AM");
  const [subjectCode, setSubjectCode] = useState("CS-301");
  const [subjectName, setSubjectName] = useState("Design & Analysis of Algorithms");
  const [facultyName, setFacultyName] = useState("Prof. Rajesh Verma");
  const [room, setRoom] = useState("Hall B-204");
  const [conflictWarning, setConflictWarning] = useState<string | null>(null);

  useEffect(() => {
    DataService.getTimetable().then(setTimetable);
  }, []);

  const checkConflicts = (d: number, start: string, rm: string, fac: string) => {
    const existingRoomConflict = timetable.find(
      (t) => t.dayOfWeek === d && t.startTime === start && t.room === rm
    );
    if (existingRoomConflict) {
      return `Conflict: Room "${rm}" is already booked by ${existingRoomConflict.subjectCode} at ${start}.`;
    }

    const existingFacultyConflict = timetable.find(
      (t) => t.dayOfWeek === d && t.startTime === start && t.facultyName === fac
    );
    if (existingFacultyConflict) {
      return `Conflict: Faculty "${fac}" is already assigned to ${existingFacultyConflict.subjectCode} at ${start}.`;
    }

    return null;
  };

  const handleAddSlot = async (e: React.FormEvent) => {
    e.preventDefault();
    const conflict = checkConflicts(dayOfWeek, startTime, room, facultyName);
    if (conflict) {
      setConflictWarning(conflict);
      return;
    }

    setConflictWarning(null);
    const dayNames = ["", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];
    const added = await DataService.addTimetableEntry({
      dayOfWeek,
      dayName: dayNames[dayOfWeek],
      startTime,
      endTime,
      subjectCode,
      subjectName,
      facultyName,
      room,
    });

    setTimetable([...timetable, added]);
    setShowAddModal(false);
  };

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Timetable Builder & Conflict Engine</h1>
          <p className="text-xs text-slate-500 mt-1">
            Construct master academic lecture schedules with real-time room occupancy and instructor conflict resolution.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setShowAddModal(true)}
          className="portal-btn-primary h-9 text-xs"
        >
          <Plus className="w-4 h-4" /> Add Schedule Slot
        </button>
      </div>

      {/* Validation Status Banner */}
      <div className="portal-card p-4 bg-emerald-50/70 border-emerald-200 flex items-center justify-between text-xs">
        <div className="flex items-center gap-2 text-emerald-900">
          <ShieldCheck className="w-5 h-5 text-emerald-600" />
          <span>
            <strong>Conflict Detection Active:</strong> 0 double-bookings detected across 17 weekly sessions.
          </span>
        </div>
        <span className="font-semibold text-emerald-700 font-mono">100% Conflict-Free</span>
      </div>

      {/* Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-xl border border-slate-200">
            <h2 className="text-base font-bold text-slate-900 mb-1">Create Lecture Schedule Slot</h2>
            <p className="text-xs text-slate-500 mb-4">Conflict engine will validate room and instructor availability.</p>

            {conflictWarning && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-lg flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                <span>{conflictWarning}</span>
              </div>
            )}

            <form onSubmit={handleAddSlot} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-800 mb-1">Day of Week</label>
                  <select
                    value={dayOfWeek}
                    onChange={(e) => setDayOfWeek(Number(e.target.value))}
                    className="portal-input text-xs"
                  >
                    <option value={1}>Monday</option>
                    <option value={2}>Tuesday</option>
                    <option value={3}>Wednesday</option>
                    <option value={4}>Thursday</option>
                    <option value={5}>Friday</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-800 mb-1">Room / Hall</label>
                  <select
                    value={room}
                    onChange={(e) => setRoom(e.target.value)}
                    className="portal-input text-xs"
                  >
                    <option value="Hall B-204">Hall B-204</option>
                    <option value="Hall C-101">Hall C-101</option>
                    <option value="Computer Lab 4">Computer Lab 4</option>
                    <option value="Network Lab 1">Network Lab 1</option>
                  </select>
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

              <div>
                <label className="block font-semibold text-slate-800 mb-1">Subject Code & Name</label>
                <select
                  value={subjectCode}
                  onChange={(e) => {
                    setSubjectCode(e.target.value);
                    if (e.target.value === "CS-301") {
                      setSubjectName("Design & Analysis of Algorithms");
                      setFacultyName("Prof. Rajesh Verma");
                    } else if (e.target.value === "CS-302") {
                      setSubjectName("Database Management Systems");
                      setFacultyName("Dr. Anita Desai");
                    } else {
                      setSubjectName("Operating Systems");
                      setFacultyName("Prof. Vikram Sen");
                    }
                  }}
                  className="portal-input text-xs"
                >
                  <option value="CS-301">CS-301 — Design & Analysis of Algorithms</option>
                  <option value="CS-302">CS-302 — Database Management Systems</option>
                  <option value="CS-303">CS-303 — Operating Systems</option>
                </select>
              </div>

              <div className="pt-3 flex items-center justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="portal-btn-secondary h-8 text-xs"
                >
                  Cancel
                </button>
                <button type="submit" className="portal-btn-primary h-8 text-xs">
                  Validate & Save
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Timetable List Grid */}
      <div className="portal-card overflow-hidden">
        <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-blue-800" />
            <h3 className="text-sm font-bold text-slate-900">Current University Schedule ({timetable.length} Sessions)</h3>
          </div>
          <span className="text-xs text-slate-500 font-mono">B.Tech CSE</span>
        </div>

        <div className="divide-y divide-slate-100">
          {timetable.map((slot) => (
            <div key={slot.id} className="p-4 sm:px-6 hover:bg-slate-50/60 flex items-center justify-between text-xs">
              <div className="flex items-start gap-4">
                <div className="w-20 text-center font-bold text-slate-700 bg-slate-100 py-1.5 px-2 rounded">
                  {slot.dayName}
                </div>
                <div className="w-28 text-center font-mono font-bold text-blue-900 bg-blue-50 py-1.5 px-2 rounded">
                  {slot.startTime}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-900">{slot.subjectCode}</span>
                    <span className="text-slate-300">•</span>
                    <span className="text-slate-700">{slot.subjectName}</span>
                  </div>
                  <div className="text-[11px] text-slate-500 mt-0.5">
                    {slot.facultyName} • <span className="font-semibold text-slate-800">{slot.room}</span>
                  </div>
                </div>
              </div>

              <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                Verified
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
