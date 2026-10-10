"use client";

import React, { useState, useEffect } from "react";
import { FileText, Plus, CheckCircle2, Clock, Download, Award, Save } from "lucide-react";
import { DataService, AssignmentRecord } from "@/lib/data-service";

export default function AdminAssignmentsPage() {
  const [assignments, setAssignments] = useState<AssignmentRecord[]>([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [title, setTitle] = useState("");
  const [subjectCode, setSubjectCode] = useState("CS-301");
  const [description, setDescription] = useState("");
  const [dueDate, setDueDate] = useState("Tomorrow at 11:59 PM");
  const [maxMarks, setMaxMarks] = useState(100);

  // Review modal state
  const [selectedAsg, setSelectedAsg] = useState<AssignmentRecord | null>(null);
  const [gradeScore, setGradeScore] = useState<number>(90);
  const [feedback, setFeedback] = useState("");

  useEffect(() => {
    DataService.getAssignments().then(setAssignments);
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    const created = await DataService.createAssignment({
      subjectCode,
      title,
      description,
      dueDate,
      maxMarks: Number(maxMarks),
    });
    if (created) {
      setAssignments([created, ...assignments.filter((a) => a.id !== created.id)]);
    }
    setShowCreateModal(false);
    setTitle("");
    setDescription("");
  };

  const handleGrade = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedAsg) {
      selectedAsg.status = "GRADED";
      selectedAsg.marksObtained = Number(gradeScore);
      selectedAsg.feedback = feedback || "Evaluation recorded by faculty instructor.";
      setSelectedAsg(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Assignment Publisher & Grading Workbench</h1>
          <p className="text-xs text-slate-500 mt-1">
            Dispatch coursework tasks, review submissions, and enter authorized grades and qualitative feedback.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setShowCreateModal(true)}
          className="portal-btn-primary h-9 text-xs"
        >
          <Plus className="w-4 h-4" /> Create Assignment
        </button>
      </div>

      {/* Create Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-lg w-full shadow-xl border border-slate-200">
            <h2 className="text-base font-bold text-slate-900 mb-1">Create Course Assignment</h2>
            <p className="text-xs text-slate-500 mb-4">Define topic, instructions, deadline, and total score.</p>
            <form onSubmit={handleCreate} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-800 mb-1">Subject</label>
                  <select
                    value={subjectCode}
                    onChange={(e) => setSubjectCode(e.target.value)}
                    className="portal-input text-xs"
                  >
                    <option value="CS-301">CS-301 Algorithms</option>
                    <option value="CS-302">CS-302 DBMS</option>
                    <option value="CS-303">CS-303 Operating Systems</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-800 mb-1">Maximum Marks</label>
                  <input
                    type="number"
                    required
                    value={maxMarks}
                    onChange={(e) => setMaxMarks(Number(e.target.value))}
                    className="portal-input"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-800 mb-1">Assignment Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Graph Traversal & Cycle Detection"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="portal-input"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-800 mb-1">Instructions & Guidelines</label>
                <textarea
                  rows={3}
                  required
                  placeholder="Provide detailed submission requirements..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="portal-input h-auto py-2"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-800 mb-1">Due Deadline</label>
                <input
                  type="text"
                  required
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  className="portal-input"
                />
              </div>

              <div className="pt-3 flex items-center justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="portal-btn-secondary h-8 text-xs"
                >
                  Cancel
                </button>
                <button type="submit" className="portal-btn-primary h-8 text-xs">
                  Publish Task
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Grade Modal */}
      {selectedAsg && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-xl border border-slate-200">
            <h2 className="text-base font-bold text-slate-900 mb-1">Enter Grade: {selectedAsg.title}</h2>
            <p className="text-xs text-slate-500 mb-4">{selectedAsg.subjectCode}</p>
            <form onSubmit={handleGrade} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-800 mb-1">
                  Marks Awarded (out of {selectedAsg.maxMarks})
                </label>
                <input
                  type="number"
                  required
                  min={0}
                  max={selectedAsg.maxMarks}
                  value={gradeScore}
                  onChange={(e) => setGradeScore(Number(e.target.value))}
                  className="portal-input font-mono font-bold"
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-800 mb-1">Qualitative Feedback</label>
                <textarea
                  rows={3}
                  value={feedback}
                  onChange={(e) => setFeedback(e.target.value)}
                  placeholder="Provide comments on solution architecture..."
                  className="portal-input h-auto py-2"
                />
              </div>
              <div className="pt-3 flex items-center justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setSelectedAsg(null)}
                  className="portal-btn-secondary h-8 text-xs"
                >
                  Cancel
                </button>
                <button type="submit" className="portal-btn-primary h-8 text-xs">
                  Commit Grade
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Assignment List Table */}
      <div className="portal-card overflow-hidden">
        <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileText className="w-4 h-4 text-blue-800" />
            <h3 className="text-sm font-bold text-slate-900">Coursework Assignments ({assignments.length})</h3>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/50 text-slate-500 font-semibold uppercase text-[10px]">
                <th className="py-3 px-6">Subject & Title</th>
                <th className="py-3 px-4">Due Date</th>
                <th className="py-3 px-4 text-center">Max Marks</th>
                <th className="py-3 px-4 text-center">Status</th>
                <th className="py-3 px-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {assignments.map((asg) => (
                <tr key={asg.id} className="hover:bg-slate-50/60 transition-colors">
                  <td className="py-4 px-6">
                    <span className="font-mono text-xs font-bold text-blue-900 bg-blue-50 px-2 py-0.5 rounded mr-2 border border-blue-200">
                      {asg.subjectCode}
                    </span>
                    <span className="font-bold text-slate-900">{asg.title}</span>
                  </td>
                  <td className="py-4 px-4 text-slate-600">{asg.dueDate}</td>
                  <td className="py-4 px-4 text-center font-mono font-bold text-slate-700">{asg.maxMarks}</td>
                  <td className="py-4 px-4 text-center">
                    <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-blue-50 text-blue-800">
                      {asg.status}
                    </span>
                  </td>
                  <td className="py-4 px-6 text-right">
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedAsg(asg);
                        setGradeScore(asg.marksObtained || 90);
                        setFeedback(asg.feedback || "");
                      }}
                      className="portal-btn-secondary h-7 text-xs px-2.5 py-1"
                    >
                      <Award className="w-3.5 h-3.5 text-blue-700" /> Grade Submissions
                    </button>
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
