"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { ArrowLeft, Bell, Calendar, Download, FileText, Building2, Share2 } from "lucide-react";
import { DataService, NoticeRecord } from "@/lib/data-service";

export default function NoticeDetailsPage() {
  const params = useParams();
  const noticeId = params.noticeId as string;
  const [notice, setNotice] = useState<NoticeRecord | null>(null);

  useEffect(() => {
    DataService.getNoticeById(noticeId).then(setNotice);
  }, [noticeId]);

  if (!notice) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-8 h-8 border-4 border-blue-800 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Back button */}
      <div className="flex items-center gap-2 text-xs text-slate-500">
        <Link href="/student/notices" className="hover:text-blue-800 flex items-center gap-1 font-medium">
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Circulars & Notices
        </Link>
      </div>

      {/* Main Notice Document Card */}
      <article className="portal-card p-6 sm:p-10 bg-white space-y-6 shadow-sm">
        {/* Notice Meta Headers */}
        <div className="border-b border-slate-100 pb-5 space-y-3">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-[11px] font-bold bg-blue-50 text-blue-800 border border-blue-200 px-2.5 py-0.5 rounded uppercase">
              {notice.category}
            </span>
            {notice.priority === "CRITICAL" && (
              <span className="text-[11px] bg-red-600 text-white font-bold px-2 py-0.5 rounded uppercase">
                High Priority
              </span>
            )}
          </div>

          <h1 className="text-2xl font-bold text-slate-900 leading-tight">
            {notice.title}
          </h1>

          <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 pt-1">
            <span className="flex items-center gap-1.5">
              <Building2 className="w-4 h-4 text-slate-400" />
              Office: <strong className="text-slate-700">{notice.publishedBy}</strong>
            </span>
            <span>•</span>
            <span className="flex items-center gap-1.5">
              <Calendar className="w-4 h-4 text-slate-400" />
              Published: {notice.publishedAt}
            </span>
          </div>
        </div>

        {/* Notice Text Content */}
        <div className="text-xs sm:text-sm text-slate-800 leading-relaxed whitespace-pre-line space-y-4">
          <p>{notice.content}</p>

          <p className="text-slate-600">
            All departments, faculty coordinators, and student section representatives are advised to note these statutory directives and comply accordingly. For clarifications or formal inquiries, please contact the issuing office during administrative working hours.
          </p>
        </div>

        {/* Attachment Card */}
        {notice.attachmentName && (
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-red-50 text-red-700 flex items-center justify-center font-bold text-xs">
                PDF
              </div>
              <div>
                <h4 className="text-xs font-semibold text-slate-900">{notice.attachmentName}</h4>
                <p className="text-[11px] text-slate-400">Official Digitally Signed Document • 1.2 MB</p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => alert(`Downloading attachment: ${notice.attachmentName}`)}
              className="portal-btn-primary h-8 text-xs shrink-0"
            >
              <Download className="w-3.5 h-3.5" /> Download
            </button>
          </div>
        )}

        {/* Footer Authority Signature block */}
        <div className="pt-6 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs text-slate-500">
          <div>
            <p className="font-semibold text-slate-800">{notice.publishedBy}</p>
            <p className="text-[11px] text-slate-400">Vanguard University Campus Administration</p>
          </div>

          <button
            type="button"
            onClick={() => {
              if (navigator.clipboard) {
                navigator.clipboard.writeText(window.location.href);
                alert("Notice URL copied to clipboard!");
              }
            }}
            className="portal-btn-secondary h-8 text-xs self-start sm:self-center"
          >
            <Share2 className="w-3.5 h-3.5" /> Copy Notice Link
          </button>
        </div>
      </article>
    </div>
  );
}
