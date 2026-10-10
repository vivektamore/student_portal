"use client";

import React, { useState } from "react";
import {
  Building2,
  Plus,
  Edit,
  Trash2,
  GraduationCap,
  CheckCircle2,
  Search,
  Layers,
  Table as TableIcon,
  GitFork,
  Calendar,
  X,
  ShieldCheck,
  Users,
} from "lucide-react";

export default function AdminDepartmentsPage() {
  const [activeTab, setActiveTab] = useState<"departments" | "programs" | "sessions">("departments");
  const [viewMode, setViewMode] = useState<"table" | "hierarchy">("table");
  const [searchTerm, setSearchTerm] = useState("");
  const [facultyFilter, setFacultyFilter] = useState("ALL");
  const [showAddModal, setShowAddModal] = useState(false);

  const [departments, setDepartments] = useState([
    {
      id: "dept_1",
      code: "CSE",
      name: "Computer Science & Engineering",
      facultySchool: "Faculty of Engineering & Technology",
      head: "Prof. Rajesh Verma, Ph.D.",
      facultyCount: 38,
      intake: 480,
      programsCount: 4,
      status: "ACTIVE",
      accreditation: "NBA Tier-1 Accredited",
    },
    {
      id: "dept_2",
      code: "ECE",
      name: "Electronics & Communication Engineering",
      facultySchool: "Faculty of Engineering & Technology",
      head: "Dr. K. Swaminathan",
      facultyCount: 26,
      intake: 360,
      programsCount: 3,
      status: "ACTIVE",
      accreditation: "NBA Accredited",
    },
    {
      id: "dept_3",
      code: "ME",
      name: "Mechanical Engineering",
      facultySchool: "Faculty of Engineering & Technology",
      head: "Dr. Arvind Rao",
      facultyCount: 22,
      intake: 240,
      programsCount: 2,
      status: "ACTIVE",
      accreditation: "NAAC A++",
    },
    {
      id: "dept_4",
      code: "AI-DS",
      name: "Artificial Intelligence & Data Science",
      facultySchool: "Faculty of Engineering & Technology",
      head: "Dr. Meenakshi Sundaram",
      facultyCount: 18,
      intake: 180,
      programsCount: 2,
      status: "ACTIVE",
      accreditation: "AICTE Approved",
    },
    {
      id: "dept_5",
      code: "CIVIL",
      name: "Civil & Environmental Engineering",
      facultySchool: "Faculty of Engineering & Technology",
      head: "Dr. Sunil Khurana",
      facultyCount: 16,
      intake: 120,
      programsCount: 2,
      status: "ACTIVE",
      accreditation: "NBA Accredited",
    },
    {
      id: "dept_6",
      code: "MATH",
      name: "Applied Mathematics & Computational Sciences",
      facultySchool: "Faculty of Sciences",
      head: "Dr. Sangeeta Rao",
      facultyCount: 12,
      intake: 60,
      programsCount: 1,
      status: "ACTIVE",
      accreditation: "UGC Recognized",
    },
    {
      id: "dept_7",
      code: "PHY",
      name: "Department of Physics & Material Sciences",
      facultySchool: "Faculty of Sciences",
      head: "Dr. Alok Nath",
      facultyCount: 10,
      intake: 45,
      programsCount: 1,
      status: "ACTIVE",
      accreditation: "UGC Recognized",
    },
    {
      id: "dept_8",
      code: "DOMS",
      name: "Department of Management Studies",
      facultySchool: "Faculty of Management Studies",
      head: "Prof. Vikram Singhania",
      facultyCount: 14,
      intake: 120,
      programsCount: 2,
      status: "ACTIVE",
      accreditation: "AACSB Member",
    },
  ]);

  const [degreePrograms, setDegreePrograms] = useState([
    {
      code: "BTECH-CSE",
      name: "B.Tech in Computer Science & Engineering",
      department: "Computer Science & Engineering",
      duration: "4 Years (8 Semesters)",
      credits: 168,
      intake: 240,
      type: "Undergraduate",
    },
    {
      code: "BTECH-AI",
      name: "B.Tech in Artificial Intelligence & Machine Learning",
      department: "Artificial Intelligence & Data Science",
      duration: "4 Years (8 Semesters)",
      credits: 172,
      intake: 120,
      type: "Undergraduate",
    },
    {
      code: "BTECH-ECE",
      name: "B.Tech in Electronics & Communication",
      department: "Electronics & Communication Engineering",
      duration: "4 Years (8 Semesters)",
      credits: 165,
      intake: 180,
      type: "Undergraduate",
    },
    {
      code: "MTECH-DS",
      name: "M.Tech in Data Science & Cloud Computing",
      department: "Computer Science & Engineering",
      duration: "2 Years (4 Semesters)",
      credits: 84,
      intake: 60,
      type: "Postgraduate",
    },
  ]);

  const [newDeptForm, setNewDeptForm] = useState({
    code: "",
    name: "",
    facultySchool: "Faculty of Engineering & Technology",
    head: "",
    intake: 120,
  });

  const handleCreateDept = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDeptForm.code || !newDeptForm.name) return;
    setDepartments([
      ...departments,
      {
        id: `dept_${Date.now()}`,
        code: newDeptForm.code.toUpperCase(),
        name: newDeptForm.name,
        facultySchool: newDeptForm.facultySchool,
        head: newDeptForm.head || "Appointed by Dean",
        facultyCount: 10,
        intake: Number(newDeptForm.intake),
        programsCount: 1,
        status: "ACTIVE",
        accreditation: "AICTE Approved",
      },
    ]);
    setShowAddModal(false);
  };

  const filteredDepts = departments.filter((d) => {
    const matchesSearch =
      d.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      d.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      d.head.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFaculty =
      facultyFilter === "ALL" || d.facultySchool.includes(facultyFilter);
    return matchesSearch && matchesFaculty;
  });

  return (
    <div className="space-y-6">
      {/* 1. Header & Breadcrumbs (Stitch Screen 20) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <nav className="flex items-center gap-2 mb-1 text-slate-400 text-xs font-semibold uppercase tracking-wider">
            <span>Core Modules</span>
            <span>/</span>
            <span className="text-blue-700">Departments & Programs</span>
          </nav>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Departments & Degree Programs
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Organize academic schools, degree tracks, student intake caps, and faculty affiliations.
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="h-10 px-4 bg-blue-800 hover:bg-blue-900 text-white font-semibold text-xs rounded-lg shadow-sm inline-flex items-center gap-1.5 transition-colors self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>+ Add Department</span>
        </button>
      </div>

      {/* 2. Top Tabs (Screen 20: Departments 8, Degree Programs 24, Academic Years 4) */}
      <div className="flex border-b border-slate-200 overflow-x-auto justify-between items-center gap-4">
        <div className="flex gap-2">
          <button
            onClick={() => setActiveTab("departments")}
            className={`relative pb-3 px-3 text-xs font-bold transition-colors flex items-center gap-2 ${
              activeTab === "departments"
                ? "text-blue-800 border-b-2 border-blue-800"
                : "text-slate-500 hover:text-slate-800"
            }`}
          >
            <span>Departments</span>
            <span className="px-2 py-0.5 rounded-full bg-blue-50 text-blue-800 text-[10px] font-bold">
              {departments.length}
            </span>
          </button>
          <button
            onClick={() => setActiveTab("programs")}
            className={`relative pb-3 px-3 text-xs font-bold transition-colors flex items-center gap-2 ${
              activeTab === "programs"
                ? "text-blue-800 border-b-2 border-blue-800"
                : "text-slate-500 hover:text-slate-800"
            }`}
          >
            <span>Degree Programs</span>
            <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 text-[10px] font-bold">
              {degreePrograms.length}
            </span>
          </button>
          <button
            onClick={() => setActiveTab("sessions")}
            className={`relative pb-3 px-3 text-xs font-bold transition-colors flex items-center gap-2 ${
              activeTab === "sessions"
                ? "text-blue-800 border-b-2 border-blue-800"
                : "text-slate-500 hover:text-slate-800"
            }`}
          >
            <span>Academic Sessions</span>
            <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 text-[10px] font-bold">
              4
            </span>
          </button>
        </div>

        {/* View Switcher (Table vs Organizational Hierarchy) */}
        <div className="flex items-center gap-1 pb-2">
          <span className="text-[11px] text-slate-400 font-medium hidden sm:inline">View:</span>
          <button
            onClick={() => setViewMode("table")}
            className={`p-1.5 rounded-lg text-xs font-semibold ${
              viewMode === "table" ? "bg-blue-50 text-blue-800" : "text-slate-400 hover:text-slate-600"
            }`}
            title="Table View"
          >
            <TableIcon className="w-4 h-4" />
          </button>
          <button
            onClick={() => setViewMode("hierarchy")}
            className={`p-1.5 rounded-lg text-xs font-semibold ${
              viewMode === "hierarchy" ? "bg-blue-50 text-blue-800" : "text-slate-400 hover:text-slate-600"
            }`}
            title="Tree Hierarchy"
          >
            <GitFork className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* 3. Search & Filter Bar */}
      <div className="p-4 bg-white rounded-xl border border-slate-200/80 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            placeholder="Search by department code, title, HOD name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full h-10 pl-9 pr-4 rounded-lg bg-slate-50 text-slate-900 placeholder:text-slate-400 text-xs focus:outline-none focus:ring-2 focus:ring-blue-600 border border-slate-200 transition-all"
          />
        </div>

        <select
          value={facultyFilter}
          onChange={(e) => setFacultyFilter(e.target.value)}
          className="h-10 px-3 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold text-slate-700 cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-600 w-full sm:w-auto"
        >
          <option value="ALL">All Academic Faculties (3)</option>
          <option value="Engineering">Faculty of Engineering & Tech</option>
          <option value="Sciences">Faculty of Sciences</option>
          <option value="Management">Faculty of Management</option>
        </select>
      </div>

      {/* 4. Tab Contents */}
      {activeTab === "departments" && (
        <div className="bg-white rounded-xl border border-slate-200/80 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 border-b border-slate-200 uppercase text-[10px] font-bold tracking-wider">
                <tr>
                  <th className="py-3 px-4">Code</th>
                  <th className="py-3 px-4">Department & School</th>
                  <th className="py-3 px-4">Head of Department (HOD)</th>
                  <th className="py-3 px-4 text-center">Faculty</th>
                  <th className="py-3 px-4 text-center">Annual Intake</th>
                  <th className="py-3 px-4">Accreditation</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {filteredDepts.map((d) => (
                  <tr key={d.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-bold text-blue-900">{d.code}</td>
                    <td className="py-3.5 px-4">
                      <div className="flex flex-col">
                        <span className="font-bold text-slate-900 text-sm">{d.name}</span>
                        <span className="text-[11px] text-slate-400">{d.facultySchool}</span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 font-medium text-slate-800">{d.head}</td>
                    <td className="py-3.5 px-4 text-center font-bold text-slate-900">{d.facultyCount}</td>
                    <td className="py-3.5 px-4 text-center font-bold font-mono text-slate-900">
                      {d.intake} seats
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                        <ShieldCheck className="w-3.5 h-3.5" /> {d.accreditation}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={() => alert(`Department details drawer opened for ${d.name}`)}
                        className="text-xs text-blue-700 hover:text-blue-900 font-semibold"
                      >
                        Manage
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === "programs" && (
        <div className="bg-white rounded-xl border border-slate-200/80 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 border-b border-slate-200 uppercase text-[10px] font-bold tracking-wider">
                <tr>
                  <th className="py-3 px-4">Program Code</th>
                  <th className="py-3 px-4">Degree Track</th>
                  <th className="py-3 px-4">Affiliated Department</th>
                  <th className="py-3 px-4">Duration</th>
                  <th className="py-3 px-4 text-center">Required Credits</th>
                  <th className="py-3 px-4 text-center">Intake</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {degreePrograms.map((p, idx) => (
                  <tr key={idx} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-bold text-blue-900">{p.code}</td>
                    <td className="py-3.5 px-4 font-bold text-slate-900">{p.name}</td>
                    <td className="py-3.5 px-4 text-slate-500">{p.department}</td>
                    <td className="py-3.5 px-4">{p.duration}</td>
                    <td className="py-3.5 px-4 text-center font-mono font-bold text-slate-900">{p.credits}</td>
                    <td className="py-3.5 px-4 text-center font-mono font-bold text-slate-900">{p.intake}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === "sessions" && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-sm text-slate-900">Academic Year 2024–2025</span>
              <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-xs font-bold border border-emerald-200">
                ACTIVE
              </span>
            </div>
            <p className="text-xs text-slate-500">Term 1: Aug 2024 – Dec 2024 • Term 2: Jan 2025 – May 2025</p>
          </div>
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-sm text-slate-900">Academic Year 2023–2024</span>
              <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 text-xs font-bold">
                ARCHIVED
              </span>
            </div>
            <p className="text-xs text-slate-500">All transcripts and graduation audits permanently frozen.</p>
          </div>
        </div>
      )}

      {/* Add Department Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-bold text-slate-900">Add Academic Department</h3>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleCreateDept} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Department Code *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. CHE"
                  value={newDeptForm.code}
                  onChange={(e) => setNewDeptForm({ ...newDeptForm, code: e.target.value })}
                  className="portal-input text-xs"
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Department Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Chemical Engineering"
                  value={newDeptForm.name}
                  onChange={(e) => setNewDeptForm({ ...newDeptForm, name: e.target.value })}
                  className="portal-input text-xs"
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Head of Department (HOD)</label>
                <input
                  type="text"
                  placeholder="e.g. Dr. Ramesh Kumar"
                  value={newDeptForm.head}
                  onChange={(e) => setNewDeptForm({ ...newDeptForm, head: e.target.value })}
                  className="portal-input text-xs"
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Annual Intake Capacity</label>
                <input
                  type="number"
                  value={newDeptForm.intake}
                  onChange={(e) => setNewDeptForm({ ...newDeptForm, intake: Number(e.target.value) })}
                  className="portal-input text-xs"
                />
              </div>
              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-3 py-1.5 text-slate-600 hover:text-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-800 hover:bg-blue-900 text-white font-semibold rounded-lg shadow-sm"
                >
                  Save Department
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
