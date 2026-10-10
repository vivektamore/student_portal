"use client";

import React, { useState, useEffect } from "react";
import { GraduationCap, Save, CheckCircle2, AlertTriangle, ShieldCheck, FileSpreadsheet } from "lucide-react";
import { DataService, ResultRecord } from "@/lib/data-service";

export default function AdminResultsPage() {
  const [results, setResults] = useState<ResultRecord[]>([]);
  const [semester, setSemester] = useState(5);
  const [isPublished, setIsPublished] = useState(true);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [publishMessage, setPublishMessage] = useState<string | null>(null);

  useEffect(() => {
    DataService.getResults().then(setResults);
  }, []);

  const handlePublishOfficial = async () => {
    await DataService.publishExamResults(semester);
    setIsPublished(true);
    setShowConfirmModal(false);
    setPublishMessage("Semester 5 official examination results have been published to student portals.");
    setTimeout(() => setPublishMessage(null), 4000);
  };

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Grade Entry & Result Publication</h1>
          <p className="text-xs text-slate-500 mt-1">
            Moderation of internal/external marks, grading scale computation, draft verification, and statutory publishing.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setShowConfirmModal(true)}
            className="portal-btn-primary h-9 text-xs bg-emerald-700 hover:bg-emerald-800"
          >
            <ShieldCheck className="w-4 h-4" /> Publish Official Results
          </button>
        </div>
      </div>

      {publishMessage && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>{publishMessage}</span>
        </div>
      )}

      {/* Confirmation Modal */}
      {showConfirmModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-xl border border-slate-200">
            <div className="flex items-center gap-2 text-amber-600 mb-2">
              <AlertTriangle className="w-5 h-5" />
              <h2 className="text-base font-bold text-slate-900">Confirm Official Result Publication</h2>
            </div>
            <p className="text-xs text-slate-600 mb-4 leading-relaxed">
              Publishing marks will make grade cards, credit points, and SGPA calculations immediately visible on all verified student portals. This action generates a permanent institutional audit log.
            </p>
            <div className="flex items-center justify-end gap-2 border-t border-slate-100 pt-3">
              <button
                type="button"
                onClick={() => setShowConfirmModal(false)}
                className="portal-btn-secondary h-8 text-xs"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handlePublishOfficial}
                className="portal-btn-primary h-8 text-xs bg-emerald-700 hover:bg-emerald-800"
              >
                Yes, Authorize & Publish
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Marks Sheet Table */}
      <div className="portal-card overflow-hidden">
        <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <GraduationCap className="w-4 h-4 text-blue-800" />
            <h3 className="text-sm font-bold text-slate-900">Marks Moderation Sheet (Semester 5)</h3>
          </div>
          <span className="text-xs text-emerald-700 font-semibold bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
            Status: Officially Published
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/50 text-slate-500 font-semibold uppercase text-[10px]">
                <th className="py-3 px-6">Subject Code & Course</th>
                <th className="py-3 px-4 text-center">Internal (30)</th>
                <th className="py-3 px-4 text-center">Exam (70)</th>
                <th className="py-3 px-4 text-center">Total (100)</th>
                <th className="py-3 px-4 text-center">Grade</th>
                <th className="py-3 px-6 text-center">Publish Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {results.map((r) => (
                <tr key={r.id} className="hover:bg-slate-50/60 transition-colors">
                  <td className="py-4 px-6">
                    <span className="font-mono text-xs font-bold text-blue-900 bg-blue-50 px-2 py-0.5 rounded mr-2 border border-blue-200">
                      {r.subjectCode}
                    </span>
                    <span className="font-bold text-slate-900">{r.subjectName}</span>
                  </td>
                  <td className="py-4 px-4 text-center font-mono font-medium">{r.internalMarks}</td>
                  <td className="py-4 px-4 text-center font-mono font-medium">{r.examMarks}</td>
                  <td className="py-4 px-4 text-center font-mono font-bold text-slate-900">{r.totalMarks}</td>
                  <td className="py-4 px-4 text-center font-bold text-blue-900 font-mono">{r.grade}</td>
                  <td className="py-4 px-6 text-center">
                    <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full">
                      <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Published
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
