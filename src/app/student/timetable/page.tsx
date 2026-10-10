"use client";

import React, { useState, useEffect } from "react";
import { Clock, Calendar, ChevronLeft, ChevronRight, MapPin, User, Download } from "lucide-react";
import { DataService, TimetableSlot } from "@/lib/data-service";

export default function StudentTimetablePage() {
  const [timetable, setTimetable] = useState<TimetableSlot[]>([]);
  const [activeDay, setActiveDay] = useState(4); // 1 = Mon, 2 = Tue, 3 = Wed, 4 = Thu, 5 = Fri

  useEffect(() => {
    DataService.getTimetable().then(setTimetable);
  }, []);

  const days = [
    { id: 1, name: "Monday" },
    { id: 2, name: "Tuesday" },
    { id: 3, name: "Wednesday" },
    { id: 4, name: "Thursday" },
    { id: 5, name: "Friday" },
  ];

  const currentSlots = timetable.filter((t) => t.dayOfWeek === activeDay);

  return (
    <div className="space-y-6">
      {/* Title & Week Selector */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Student Academic Timetable</h1>
          <p className="text-xs text-slate-500 mt-1">
            Weekly lecture timetable, laboratory sessions, and room allocations.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 bg-white border border-slate-200 rounded-lg p-1 text-xs">
            <button
              type="button"
              className="p-1 text-slate-500 hover:text-slate-800 hover:bg-slate-50 rounded"
              aria-label="Previous week"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="font-semibold text-slate-800 px-2">Week 14 (Spring 2025)</span>
            <button
              type="button"
              className="p-1 text-slate-500 hover:text-slate-800 hover:bg-slate-50 rounded"
              aria-label="Next week"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
          <button
            type="button"
            onClick={() => window.print()}
            className="portal-btn-secondary h-8 text-xs hidden sm:inline-flex"
          >
            <Download className="w-3.5 h-3.5" /> Export PDF
          </button>
        </div>
      </div>

      {/* Weekday Switcher Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-1 overflow-x-auto">
        {days.map((day) => {
          const isActive = activeDay === day.id;
          const count = timetable.filter((t) => t.dayOfWeek === day.id).length;
          return (
            <button
              key={day.id}
              type="button"
              onClick={() => setActiveDay(day.id)}
              className={`px-4 py-2 text-xs font-semibold rounded-lg transition-all flex items-center gap-2 whitespace-nowrap ${
                isActive
                  ? "bg-blue-800 text-white shadow-sm"
                  : "text-slate-600 hover:bg-slate-100"
              }`}
            >
              <span>{day.name}</span>
              <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                isActive ? "bg-blue-600 text-white" : "bg-slate-200 text-slate-700"
              }`}>
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Time Slot Schedule List */}
      <div className="portal-card overflow-hidden">
        <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-blue-800" />
            <h2 className="text-sm font-bold text-slate-900">
              {days.find((d) => d.id === activeDay)?.name} Schedule ({currentSlots.length} Classes)
            </h2>
          </div>
          <span className="text-xs text-slate-500 font-mono">B.Tech CSE — Semester VI</span>
        </div>

        {currentSlots.length === 0 ? (
          <div className="p-12 text-center text-xs text-slate-500">
            No lectures scheduled for this day.
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {currentSlots.map((slot) => (
              <div
                key={slot.id}
                className="p-5 sm:px-6 hover:bg-slate-50/70 transition-colors flex flex-col md:flex-row md:items-center justify-between gap-4"
              >
                <div className="flex items-start gap-4">
                  <div className="w-28 shrink-0">
                    <span className="font-mono text-xs font-bold text-blue-900 bg-blue-50 py-1.5 px-2.5 rounded-lg block text-center border border-blue-100">
                      {slot.startTime} – {slot.endTime}
                    </span>
                  </div>

                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono font-bold text-slate-900 bg-slate-100 px-2 py-0.5 rounded">
                        {slot.subjectCode}
                      </span>
                      <h3 className="text-sm font-bold text-slate-900">{slot.subjectName}</h3>
                    </div>

                    <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 mt-1.5">
                      <span className="flex items-center gap-1 text-slate-600">
                        <User className="w-3.5 h-3.5 text-slate-400" />
                        {slot.facultyName}
                      </span>
                      <span className="text-slate-300">•</span>
                      <span className="flex items-center gap-1 text-slate-700 font-semibold">
                        <MapPin className="w-3.5 h-3.5 text-blue-700" />
                        {slot.room}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-start md:self-center">
                  <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                    Scheduled
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
