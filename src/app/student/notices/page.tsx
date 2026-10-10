"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Bell, Search, Filter, Calendar, FileText, ArrowRight, AlertTriangle } from "lucide-react";
import { DataService, NoticeRecord } from "@/lib/data-service";

export default function StudentNoticesPage() {
  const [notices, setNotices] = useState<NoticeRecord[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("ALL");

  useEffect(() => {
    DataService.getNotices().then(setNotices);
  }, []);

  const filtered = notices.filter((n) => {
    const matchesSearch =
      n.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      n.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
      n.publishedBy.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === "ALL" || n.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Notices & Campus Announcements</h1>
          <p className="text-xs text-slate-500 mt-1">
            Official circulars, academic notices, event bulletins, and administrative orders.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold px-3 py-1 bg-blue-50 text-blue-800 rounded-full border border-blue-200">
            {notices.length} Published Circulars
          </span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="portal-card p-4 flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
          <input
            type="text"
            placeholder="Search circulars, topics, or circular issuing authority..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="portal-input pl-9 text-xs"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Filter className="w-4 h-4 text-slate-400" />
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="portal-input text-xs w-full sm:w-44"
          >
            <option value="ALL">All Categories</option>
            <option value="EXAM">Examination</option>
            <option value="ACADEMIC">Academic</option>
            <option value="EVENT">Events & Hackathons</option>
            <option value="GENERAL">General Circular</option>
          </select>
        </div>
      </div>

      {/* Notices List */}
      <div className="space-y-4">
        {filtered.length === 0 ? (
          <div className="portal-card p-12 text-center text-slate-500">
            <Bell className="w-10 h-10 mx-auto mb-2 text-slate-300 stroke-1" />
            <p className="font-semibold text-slate-700">No active circulars or notices</p>
            <p className="text-xs text-slate-400 mt-1">
              Official university circulars and administrative bulletins will be posted here.
            </p>
          </div>
        ) : (
          filtered.map((notice) => {
          const isCritical = notice.priority === "CRITICAL";
          return (
            <div
              key={notice.id}
              className={`portal-card p-5 sm:p-6 transition-all hover:border-blue-300 ${
                isCritical ? "border-l-4 border-l-red-600" : ""
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                <div className="flex items-center gap-2">
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider ${
                    isCritical
                      ? "bg-red-50 text-red-700 border border-red-200"
                      : "bg-blue-50 text-blue-700 border border-blue-200"
                  }`}>
                    {notice.category}
                  </span>
                  {isCritical && (
                    <span className="text-[10px] bg-red-600 text-white font-bold px-2 py-0.5 rounded uppercase flex items-center gap-1">
                      <AlertTriangle className="w-3 h-3" /> Urgent Priority
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-1 text-xs text-slate-400">
                  <Calendar className="w-3.5 h-3.5" />
                  <span>{notice.publishedAt}</span>
                </div>
              </div>

              <h2 className="text-base font-bold text-slate-900 leading-snug mb-2">
                <Link href={`/student/notices/${notice.id}`} className="hover:text-blue-800">
                  {notice.title}
                </Link>
              </h2>

              <p className="text-xs text-slate-600 line-clamp-2 mb-4 leading-relaxed">
                {notice.content}
              </p>

              <div className="pt-3 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                <span className="text-slate-500 font-medium">
                  Issued by: <strong className="text-slate-700">{notice.publishedBy}</strong>
                </span>

                <Link
                  href={`/student/notices/${notice.id}`}
                  className="text-xs font-bold text-blue-800 hover:underline flex items-center gap-1 self-start sm:self-center"
                >
                  Read Full Notice & Attachments <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          );
        }))}
      </div>
    </div>
  );
}
