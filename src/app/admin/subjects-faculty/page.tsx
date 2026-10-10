"use client";

import React, { useState, useEffect } from "react";
import {
  GraduationCap,
  BookOpen,
  Plus,
  UserCheck,
  Search,
  Filter,
  CheckCircle2,
  Users,
  Award,
  Layers,
  X,
  Mail,
  Shield,
} from "lucide-react";
import { DataService, SubjectRecord } from "@/lib/data-service";

export default function AdminSubjectsFacultyPage() {
  const [subjects, setSubjects] = useState<SubjectRecord[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState("ALL");
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [showAddCourseModal, setShowAddCourseModal] = useState(false);
  const [showBulkUploadModal, setShowBulkUploadModal] = useState(false);
  const [selectedSubject, setSelectedSubject] = useState<SubjectRecord | null>(null);
  const [newFacultyName, setNewFacultyName] = useState("");
  const [newFacultyEmail, setNewFacultyEmail] = useState("");

  // New Course Form state
  const [newCourseCode, setNewCourseCode] = useState("");
  const [newCourseName, setNewCourseName] = useState("");
  const [newCourseCredits, setNewCourseCredits] = useState("4");
  const [newCourseSemester, setNewCourseSemester] = useState("1");
  const [newCourseType, setNewCourseType] = useState("THEORY");
  const [newCourseFaculty, setNewCourseFaculty] = useState("");
  const [newCourseFacultyEmail, setNewCourseFacultyEmail] = useState("");
  const [newCourseDesc, setNewCourseDesc] = useState("");

  // Bulk CSV state
  const [bulkCsvText, setBulkCsvText] = useState("");
  const [bulkSuccessMsg, setBulkSuccessMsg] = useState("");

  const facultyDirectory = [
    { name: "Dr. Ramesh Sharma, Ph.D.", email: "ramesh.sharma@apex.edu", dept: "CSE" },
    { name: "Prof. Priya Nair, M.Tech", email: "priya.nair@apex.edu", dept: "CSE" },
    { name: "Dr. Anand Kulkarni", email: "anand.kulkarni@apex.edu", dept: "CSE" },
    { name: "Prof. Sneha Gupta", email: "sneha.gupta@apex.edu", dept: "CSE" },
    { name: "Dr. Vikram Seth", email: "vikram.seth@apex.edu", dept: "ECE" },
  ];

  useEffect(() => {
    DataService.getSubjects().then(setSubjects);
  }, []);

  const handleOpenAssignModal = (subject: SubjectRecord) => {
    setSelectedSubject(subject);
    setNewFacultyName(subject.facultyName);
    setNewFacultyEmail(subject.facultyEmail || "faculty@apex.edu");
    setShowAssignModal(true);
  };

  const handleSaveAssignment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSubject) return;
    const updated = subjects.map((s) => {
      if (s.id === selectedSubject.id) {
        return {
          ...s,
          facultyName: newFacultyName,
          facultyEmail: newFacultyEmail,
        };
      }
      return s;
    });
    setSubjects(updated);
    setShowAssignModal(false);
  };

  const handleCreateCourse = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCourseCode || !newCourseName) return;

    const created = await DataService.createSubject({
      code: newCourseCode.trim().toUpperCase(),
      name: newCourseName.trim(),
      credits: Number(newCourseCredits) || 3,
      semester: Number(newCourseSemester) || 1,
      type: newCourseType,
      facultyName: newCourseFaculty.trim() || "Unassigned",
      facultyEmail: newCourseFacultyEmail.trim() || "",
      description: newCourseDesc.trim(),
    });

    setSubjects((prev) => [created, ...prev]);
    setShowAddCourseModal(false);
    // Reset form
    setNewCourseCode("");
    setNewCourseName("");
    setNewCourseCredits("4");
    setNewCourseSemester("1");
    setNewCourseFaculty("");
    setNewCourseFacultyEmail("");
    setNewCourseDesc("");
  };

  const handleBulkUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!bulkCsvText.trim()) return;

    const lines = bulkCsvText.trim().split("\n");
    const toCreate: Array<{
      code: string;
      name: string;
      credits: number;
      semester: number;
      type: string;
      facultyName: string;
      facultyEmail: string;
      description?: string;
    }> = [];

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line || line.toLowerCase().startsWith("code,")) continue;
      const parts = line.split(",").map((p) => p.trim());
      if (parts.length >= 2) {
        toCreate.push({
          code: parts[0].toUpperCase(),
          name: parts[1],
          credits: Number(parts[2]) || 3,
          semester: Number(parts[3]) || 1,
          type: (parts[4] || "THEORY").toUpperCase().includes("LAB") || (parts[4] || "").toUpperCase() === "PRACTICAL" ? "PRACTICAL" : "THEORY",
          facultyName: parts[5] || "Unassigned",
          facultyEmail: parts[6] || "",
        });
      }
    }

    if (toCreate.length > 0) {
      const created = await DataService.bulkCreateSubjects(toCreate);
      setSubjects((prev) => [...created, ...prev]);
      setBulkSuccessMsg(`Successfully imported ${created.length} course(s)!`);
      setTimeout(() => {
        setShowBulkUploadModal(false);
        setBulkSuccessMsg("");
        setBulkCsvText("");
      }, 1200);
    }
  };

  const filtered = subjects.filter((s) => {
    const matchesSearch =
      s.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.facultyName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = typeFilter === "ALL" || s.type === typeFilter;
    return matchesSearch && matchesType;
  });

  return (
    <div className="space-y-6">
      {/* 1. Header & Breadcrumbs (Stitch Screen 21) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <nav className="flex items-center gap-2 mb-1 text-slate-400 text-xs font-semibold uppercase tracking-wider">
            <span>Core Modules</span>
            <span>/</span>
            <span className="text-blue-700">Subjects & Faculty</span>
          </nav>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Subjects & Faculty Management
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Curriculum course directory, credit allocations, and designated teaching faculty assignments.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setShowBulkUploadModal(true)}
            className="px-3 py-2 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold rounded-lg border border-slate-200 shadow-sm flex items-center gap-1.5 transition-colors"
          >
            <Layers className="w-3.5 h-3.5 text-slate-500" />
            <span>Upload CSV</span>
          </button>
          <button
            onClick={() => setShowAddCourseModal(true)}
            className="px-3.5 py-2 bg-blue-800 hover:bg-blue-900 text-white text-xs font-semibold rounded-lg shadow-sm flex items-center gap-1.5 transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>+ Add Course</span>
          </button>
        </div>
      </div>

      {/* 2. Metric Strip (Screen 21) */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              Total Courses
            </span>
            <div className="text-2xl font-bold text-slate-900 font-mono mt-0.5">{subjects.length}</div>
          </div>
          <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-800 flex items-center justify-center">
            <BookOpen className="w-4 h-4" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              Assigned Faculty
            </span>
            <div className="text-2xl font-bold text-slate-900 font-mono mt-0.5">{facultyDirectory.length}</div>
          </div>
          <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-700 flex items-center justify-center">
            <Users className="w-4 h-4" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              Theory Courses
            </span>
            <div className="text-2xl font-bold text-slate-900 font-mono mt-0.5">
              {subjects.filter((s) => s.type === "THEORY").length}
            </div>
          </div>
          <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center">
            <GraduationCap className="w-4 h-4" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              Laboratory Courses
            </span>
            <div className="text-2xl font-bold text-slate-900 font-mono mt-0.5">
              {subjects.filter((s) => s.type !== "THEORY").length}
            </div>
          </div>
          <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-700 flex items-center justify-center">
            <Layers className="w-4 h-4" />
          </div>
        </div>
      </div>

      {/* 3. Search & Filter Bar */}
      <div className="p-4 bg-white rounded-xl border border-slate-200/80 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            placeholder="Search by course code, title, or assigned professor..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full h-10 pl-9 pr-4 rounded-lg bg-slate-50 text-slate-900 placeholder:text-slate-400 text-xs focus:outline-none focus:ring-2 focus:ring-blue-600 border border-slate-200 transition-all"
          />
        </div>

        <select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
          className="h-10 px-3 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold text-slate-700 cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-600 w-full sm:w-auto"
        >
          <option value="ALL">All Course Types</option>
          <option value="THEORY">Theory Only</option>
          <option value="PRACTICAL">Laboratories Only</option>
        </select>
      </div>

      {/* 4. Course Directory Table */}
      <div className="bg-white rounded-xl border border-slate-200/80 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 border-b border-slate-200 uppercase text-[10px] font-bold tracking-wider">
              <tr>
                <th className="py-3 px-4">Code</th>
                <th className="py-3 px-4">Course Title</th>
                <th className="py-3 px-4 text-center">Semester</th>
                <th className="py-3 px-4 text-center">Credits</th>
                <th className="py-3 px-4 text-center">Type</th>
                <th className="py-3 px-4">Assigned Professor</th>
                <th className="py-3 px-4 text-right">Faculty Allocation</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {filtered.map((s) => (
                <tr key={s.id} className="hover:bg-slate-50/60 transition-colors">
                  <td className="py-3.5 px-4 font-mono font-bold text-blue-900">{s.code}</td>
                  <td className="py-3.5 px-4 font-bold text-slate-900">{s.name}</td>
                  <td className="py-3.5 px-4 text-center font-medium">Sem {s.semester}</td>
                  <td className="py-3.5 px-4 text-center font-mono font-bold text-slate-900">
                    {s.credits} Credits
                  </td>
                  <td className="py-3.5 px-4 text-center">
                    <span
                      className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold ${
                        s.type === "THEORY"
                          ? "bg-blue-50 text-blue-700 border border-blue-200"
                          : "bg-emerald-50 text-emerald-700 border border-emerald-200"
                      }`}
                    >
                      {s.type}
                    </span>
                  </td>
                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-full bg-slate-100 flex items-center justify-center font-bold text-slate-700 text-[10px]">
                        {s.facultyName ? s.facultyName[0] : "P"}
                      </div>
                      <div className="flex flex-col">
                        <span className="font-semibold text-slate-900">{s.facultyName}</span>
                        <span className="text-[10px] text-slate-400">{s.facultyEmail || "faculty@apex.edu"}</span>
                      </div>
                    </div>
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <button
                      onClick={() => handleOpenAssignModal(s)}
                      className="px-2.5 py-1 rounded bg-blue-50 hover:bg-blue-100 text-blue-800 text-xs font-semibold border border-blue-200 transition-colors"
                    >
                      Reassign
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {filtered.length === 0 && (
            <div className="p-12 text-center bg-slate-50/30">
              <div className="w-12 h-12 rounded-full bg-blue-50 text-blue-800 flex items-center justify-center mx-auto mb-3">
                <BookOpen className="w-6 h-6" />
              </div>
              <h3 className="text-sm font-bold text-slate-900">No courses found</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1 mb-4">
                No courses currently match your criteria or none have been uploaded yet.
              </p>
              <div className="flex items-center justify-center gap-2">
                <button
                  onClick={() => setShowAddCourseModal(true)}
                  className="px-3.5 py-1.5 bg-blue-800 hover:bg-blue-900 text-white text-xs font-semibold rounded-lg shadow-sm"
                >
                  + Add New Course
                </button>
                <button
                  onClick={() => setShowBulkUploadModal(true)}
                  className="px-3 py-1.5 bg-white hover:bg-slate-100 text-slate-700 text-xs font-semibold rounded-lg border border-slate-200 shadow-sm"
                >
                  Upload CSV
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Add Course Modal */}
      {showAddCourseModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="font-bold text-slate-900 text-base">Add New Curriculum Course</h3>
                <p className="text-xs text-slate-500">Create a new subject module and allocate credits</p>
              </div>
              <button onClick={() => setShowAddCourseModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateCourse} className="space-y-3.5 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Course Code *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. CS-401"
                    value={newCourseCode}
                    onChange={(e) => setNewCourseCode(e.target.value)}
                    className="portal-input text-xs font-mono uppercase"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Semester Level *</label>
                  <select
                    value={newCourseSemester}
                    onChange={(e) => setNewCourseSemester(e.target.value)}
                    className="portal-input text-xs"
                  >
                    {[1, 2, 3, 4, 5, 6, 7, 8].map((sem) => (
                      <option key={sem} value={sem}>Semester {sem}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Course Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Cloud Computing & Distributed Systems"
                  value={newCourseName}
                  onChange={(e) => setNewCourseName(e.target.value)}
                  className="portal-input text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Credits *</label>
                  <input
                    type="number"
                    min="1"
                    max="8"
                    required
                    value={newCourseCredits}
                    onChange={(e) => setNewCourseCredits(e.target.value)}
                    className="portal-input text-xs font-mono"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Course Type *</label>
                  <select
                    value={newCourseType}
                    onChange={(e) => setNewCourseType(e.target.value)}
                    className="portal-input text-xs"
                  >
                    <option value="THEORY">Theory Only</option>
                    <option value="PRACTICAL">Laboratory / Practical</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Assigned Faculty Name</label>
                  <input
                    type="text"
                    placeholder="e.g. Dr. Rajesh Verma"
                    value={newCourseFaculty}
                    onChange={(e) => setNewCourseFaculty(e.target.value)}
                    className="portal-input text-xs"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Faculty Email</label>
                  <input
                    type="email"
                    placeholder="faculty@apex.edu"
                    value={newCourseFacultyEmail}
                    onChange={(e) => setNewCourseFacultyEmail(e.target.value)}
                    className="portal-input text-xs font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Course Description / Objectives</label>
                <textarea
                  rows={2}
                  placeholder="Brief syllabus outline and key learning outcomes..."
                  value={newCourseDesc}
                  onChange={(e) => setNewCourseDesc(e.target.value)}
                  className="portal-input text-xs"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddCourseModal(false)}
                  className="px-3 py-1.5 text-slate-600 hover:text-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-800 hover:bg-blue-900 text-white font-semibold rounded-lg shadow-sm"
                >
                  Save & Publish Course
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Bulk Upload CSV Modal */}
      {showBulkUploadModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="font-bold text-slate-900 text-base">Bulk Course Upload</h3>
                <p className="text-xs text-slate-500">Paste CSV rows to create multiple curriculum courses</p>
              </div>
              <button onClick={() => setShowBulkUploadModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleBulkUpload} className="space-y-3.5 text-xs">
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 font-mono text-[11px] text-slate-600 leading-relaxed">
                <span className="font-bold text-slate-800 block mb-1">CSV Format Template:</span>
                code,name,credits,semester,type,facultyName,facultyEmail<br />
                CS-401,Cloud Computing,4,7,THEORY,Dr. Rajesh Verma,rajesh@apex.edu<br />
                CS-402,Cloud Lab,2,7,PRACTICAL,Prof. Sneha Gupta,sneha@apex.edu
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Paste CSV Data</label>
                <textarea
                  rows={6}
                  required
                  placeholder="Paste CSV rows here..."
                  value={bulkCsvText}
                  onChange={(e) => setBulkCsvText(e.target.value)}
                  className="portal-input text-xs font-mono"
                />
              </div>

              {bulkSuccessMsg && (
                <div className="p-2.5 rounded bg-emerald-50 text-emerald-800 border border-emerald-200 font-semibold flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>{bulkSuccessMsg}</span>
                </div>
              )}

              <div className="pt-2 flex justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowBulkUploadModal(false)}
                  className="px-3 py-1.5 text-slate-600 hover:text-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-800 hover:bg-blue-900 text-white font-semibold rounded-lg shadow-sm"
                >
                  Import All Courses
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Reassign Faculty Modal */}
      {showAssignModal && selectedSubject && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="font-bold text-slate-900">Assign Course Instructor</h3>
                <p className="text-xs text-slate-500">{selectedSubject.code} • {selectedSubject.name}</p>
              </div>
              <button onClick={() => setShowAssignModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveAssignment} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Select from Department Faculty</label>
                <select
                  value={newFacultyName}
                  onChange={(e) => {
                    setNewFacultyName(e.target.value);
                    const match = facultyDirectory.find((f) => f.name === e.target.value);
                    if (match) setNewFacultyEmail(match.email);
                  }}
                  className="portal-input text-xs"
                >
                  {facultyDirectory.map((f, idx) => (
                    <option key={idx} value={f.name}>
                      {f.name} ({f.dept})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Institutional Email</label>
                <input
                  type="email"
                  value={newFacultyEmail}
                  onChange={(e) => setNewFacultyEmail(e.target.value)}
                  className="portal-input text-xs font-mono"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAssignModal(false)}
                  className="px-3 py-1.5 text-slate-600 hover:text-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-800 hover:bg-blue-900 text-white font-semibold rounded-lg shadow-sm"
                >
                  Confirm Allocation
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
