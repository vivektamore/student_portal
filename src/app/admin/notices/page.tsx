"use client";

import React, { useState, useEffect } from "react";
import { Bell, Plus, Calendar, CheckCircle2, AlertTriangle, Users } from "lucide-react";
import { DataService, NoticeRecord } from "@/lib/data-service";

export default function AdminNoticesPage() {
  const [notices, setNotices] = useState<NoticeRecord[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [category, setCategory] = useState<NoticeRecord["category"]>("GENERAL");
  const [priority, setPriority] = useState<NoticeRecord["priority"]>("NORMAL");
  const [targetAudience, setTargetAudience] = useState("ALL");

  useEffect(() => {
    DataService.getNotices().then(setNotices);
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    const created = await DataService.publishNotice(title, content, category, priority);
    setNotices([created, ...notices]);
    setShowModal(false);
    setTitle("");
    setContent("");
  };

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Institutional Circular & Notice Broadcast</h1>
          <p className="text-xs text-slate-500 mt-1">
            Dispatch announcements with cohort audience targeting (all students, specific departments, or semesters).
          </p>
        </div>
        <button
          type="button"
          onClick={() => setShowModal(true)}
          className="portal-btn-primary h-9 text-xs"
        >
          <Plus className="w-4 h-4" /> Broadcast Notice
        </button>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-lg w-full shadow-xl border border-slate-200">
            <h2 className="text-base font-bold text-slate-900 mb-1">Compose Campus Circular</h2>
            <p className="text-xs text-slate-500 mb-4">Broadcast to all students or target specific academic cohorts.</p>
            <form onSubmit={handleCreate} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-800 mb-1">Target Audience Cohort *</label>
                <select
                  value={targetAudience}
                  onChange={(e) => setTargetAudience(e.target.value)}
                  className="portal-input text-xs"
                >
                  <option value="ALL">All Enrolled Students & Faculty</option>
                  <option value="CSE">Department of Computer Science Only</option>
                  <option value="SEM6">Semester 6 Cohort Only</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-800 mb-1">Category</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as any)}
                    className="portal-input text-xs"
                  >
                    <option value="GENERAL">General Bulletin</option>
                    <option value="ACADEMIC">Academic</option>
                    <option value="EXAM">Examination</option>
                    <option value="EVENT">Event</option>
                    <option value="URGENT">Urgent Circular</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-800 mb-1">Priority</label>
                  <select
                    value={priority}
                    onChange={(e) => setPriority(e.target.value as any)}
                    className="portal-input text-xs"
                  >
                    <option value="NORMAL">Normal Priority</option>
                    <option value="IMPORTANT">Important</option>
                    <option value="CRITICAL">Critical (High Alert)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-800 mb-1">Circular Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Schedule for Annual Technical Symposium"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="portal-input"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-800 mb-1">Circular Content *</label>
                <textarea
                  rows={4}
                  required
                  placeholder="Provide full statutory circular announcement..."
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  className="portal-input h-auto py-2 text-xs"
                />
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
                  Broadcast Notice
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Notices List */}
      <div className="portal-card overflow-hidden">
        <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Bell className="w-4 h-4 text-blue-800" />
            <h3 className="text-sm font-bold text-slate-900">Broadcast Bulletins ({notices.length})</h3>
          </div>
        </div>

        <div className="divide-y divide-slate-100">
          {notices.map((n) => (
            <div key={n.id} className="p-5 sm:px-6 hover:bg-slate-50/60 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-[10px] px-2 py-0.5 rounded uppercase bg-blue-50 text-blue-800 border border-blue-200">
                    {n.category}
                  </span>
                  <span className="text-[11px] text-slate-400 font-medium">{n.publishedAt}</span>
                </div>
                <h4 className="text-sm font-bold text-slate-900">{n.title}</h4>
                <p className="text-xs text-slate-500 line-clamp-1">{n.content}</p>
              </div>

              <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full self-start sm:self-center border border-emerald-200">
                <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Active Broadcast
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
