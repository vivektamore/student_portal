"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  ArrowLeft,
  FileText,
  Clock,
  Upload,
  CheckCircle2,
  Download,
  AlertCircle,
  FileCheck,
} from "lucide-react";
import { DataService, AssignmentRecord } from "@/lib/data-service";

export default function AssignmentDetailsPage() {
  const params = useParams();
  const assignmentId = params.assignmentId as string;
  const [assignment, setAssignment] = useState<AssignmentRecord | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [comments, setComments] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedSuccess, setSubmittedSuccess] = useState(false);

  useEffect(() => {
    DataService.getAssignmentById(assignmentId).then(setAssignment);
  }, [assignmentId]);

  if (!assignment) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-8 h-8 border-4 border-blue-800 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  const handleFileUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) {
      alert("Please choose a file to submit.");
      return;
    }
    setIsSubmitting(true);
    await DataService.submitAssignment(assignment.id, file.name, comments);
    const updated = await DataService.getAssignmentById(assignment.id);
    setAssignment(updated);
    setIsSubmitting(false);
    setSubmittedSuccess(true);
  };

  return (
    <div className="space-y-6">
      {/* Back button */}
      <div className="flex items-center gap-2 text-xs text-slate-500">
        <Link href="/student/assignments" className="hover:text-blue-800 flex items-center gap-1 font-medium">
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Assignments
        </Link>
        <span>/</span>
        <span className="text-slate-900 font-semibold">{assignment.subjectCode}</span>
      </div>

      {/* Header Banner */}
      <div className="portal-card p-6 bg-white">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="font-mono text-xs font-bold text-blue-900 bg-blue-50 border border-blue-200 px-2.5 py-0.5 rounded">
                {assignment.subjectCode}
              </span>
              <span className="text-xs text-slate-500 font-medium">{assignment.subjectName}</span>
            </div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">{assignment.title}</h1>
            <div className="flex items-center gap-4 text-xs text-slate-500 mt-2">
              <span className="flex items-center gap-1 text-amber-700 font-medium">
                <Clock className="w-3.5 h-3.5 text-amber-600" /> Due: {assignment.dueDate}
              </span>
              <span>•</span>
              <span>Maximum Score: <strong>{assignment.maxMarks} Points</strong></span>
            </div>
          </div>

          <span className={`px-3 py-1.5 rounded-full text-xs font-semibold self-start md:self-center ${
            assignment.status === "GRADED"
              ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
              : assignment.status === "SUBMITTED"
              ? "bg-blue-50 text-blue-800 border border-blue-200"
              : "bg-amber-50 text-amber-800 border border-amber-200"
          }`}>
            Status: {assignment.status}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column (7 cols): Instructions & Attachments */}
        <div className="lg:col-span-7 space-y-6">
          <div className="portal-card p-6 space-y-4">
            <h2 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-3">
              Task Guidelines & Instructions
            </h2>
            <p className="text-xs text-slate-700 leading-relaxed whitespace-pre-line">
              {assignment.description}
            </p>

            <div className="bg-slate-50 p-4 rounded-xl text-xs space-y-2 border border-slate-200/60">
              <h4 className="font-semibold text-slate-900">Submission Requirements:</h4>
              <ul className="list-disc list-inside text-slate-600 space-y-1">
                <li>Submit source code along with a brief PDF technical report.</li>
                <li>Archive format: <code className="font-mono bg-white px-1 py-0.5 rounded">.zip</code> or <code className="font-mono bg-white px-1 py-0.5 rounded">.tar.gz</code> (max 25MB).</li>
                <li>Plagiarism checks are automatically enforced using MOSS.</li>
              </ul>
            </div>
          </div>

          {/* Instructor Feedback if Graded */}
          {assignment.feedback && (
            <div className="portal-card p-6 bg-emerald-50/50 border-emerald-200 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-emerald-900 uppercase tracking-wider">
                  Instructor Evaluation & Feedback
                </span>
                {assignment.marksObtained && (
                  <span className="font-mono font-bold text-lg text-emerald-800">
                    {assignment.marksObtained} / {assignment.maxMarks}
                  </span>
                )}
              </div>
              <p className="text-xs text-emerald-900 leading-relaxed">{assignment.feedback}</p>
            </div>
          )}
        </div>

        {/* Right Column (5 cols): Submission Interface */}
        <div className="lg:col-span-5 space-y-6">
          <div className="portal-card p-6">
            <h2 className="text-sm font-bold text-slate-900 mb-4 pb-3 border-b border-slate-100">
              Your Submission
            </h2>

            {submittedSuccess || assignment.status === "SUBMITTED" || assignment.status === "GRADED" ? (
              <div className="space-y-4 text-xs">
                <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 mb-2" />
                  <p className="font-semibold text-slate-900">Work Submitted Successfully</p>
                  <p className="mt-1 text-slate-600">
                    Recorded at: {assignment.submittedAt || "April 09, 2025 at 08:34 PM"}
                  </p>
                </div>

                <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg flex items-center justify-between">
                  <div className="flex items-center gap-2 truncate">
                    <FileCheck className="w-4 h-4 text-blue-800 shrink-0" />
                    <span className="font-mono text-slate-800 truncate font-semibold">
                      {assignment.submissionFile || "student_submission_file.zip"}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => alert("Downloading submission receipt file...")}
                    className="text-blue-800 hover:underline font-semibold shrink-0 ml-2"
                  >
                    Download
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleFileUpload} className="space-y-4 text-xs">
                <div>
                  <label className="block font-semibold text-slate-800 mb-1.5">
                    Select File to Upload (.pdf, .zip, .tar.gz)
                  </label>
                  <input
                    type="file"
                    required
                    onChange={(e) => setFile(e.target.files ? e.target.files[0] : null)}
                    className="w-full text-slate-600 file:mr-3 file:py-2 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-blue-50 file:text-blue-800 hover:file:bg-blue-100 cursor-pointer"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-800 mb-1.5">
                    Optional Comments for Faculty
                  </label>
                  <textarea
                    rows={3}
                    value={comments}
                    onChange={(e) => setComments(e.target.value)}
                    placeholder="Provide any specific notes or compile instructions..."
                    className="portal-input h-auto py-2 text-xs"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="portal-btn-primary w-full h-10"
                >
                  {isSubmitting ? (
                    "Uploading & Verifying..."
                  ) : (
                    <>
                      <Upload className="w-4 h-4" />
                      <span>Submit Solution</span>
                    </>
                  )}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
