"use client";

import React, { useState, useEffect } from "react";
import {
  Settings,
  Shield,
  GraduationCap,
  Users,
  AlertTriangle,
  Save,
  CheckCircle2,
  Lock,
  UserPlus,
  Sliders,
  Database,
  RefreshCw,
  Trash2,
} from "lucide-react";
import { DataService } from "@/lib/data-service";
import { SITE_CONFIG } from "@/lib/site-config";

interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: "ADMIN" | "FACULTY" | "EXAM_CONTROLLER";
  status: "ACTIVE" | "INACTIVE";
  lastLogin: string;
}

export default function AdminSettingsPage() {
  const [activeTab, setActiveTab] = useState<"academic" | "grading" | "users" | "security">("academic");
  const [isSaved, setIsSaved] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [confirmAction, setConfirmAction] = useState<string | null>(null);
  const [isDataCleared, setIsDataCleared] = useState(false);

  useEffect(() => {
    setIsDataCleared(DataService.isCleared());
  }, []);

  // Academic Settings Form State
  const [academicSettings, setAcademicSettings] = useState({
    academicYear: SITE_CONFIG.academicYear,
    currentTerm: "Even Semester (Spring 2026)",
    attendanceThreshold: 75,
    passingPercentage: 40,
    maxCredits: 28,
    lateSubmissionPenalty: 10,
    allowStudentPhotoUpload: true,
    maintenanceMode: false,
  });

  // Grading Thresholds State
  const [gradingRules, setGradingRules] = useState([
    { grade: "O (Outstanding)", minMark: 90, maxMark: 100, gradePoints: 10 },
    { grade: "A+ (Excellent)", minMark: 80, maxMark: 89, gradePoints: 9 },
    { grade: "A (Very Good)", minMark: 70, maxMark: 79, gradePoints: 8 },
    { grade: "B+ (Good)", minMark: 60, maxMark: 69, gradePoints: 7 },
    { grade: "B (Above Average)", minMark: 50, maxMark: 59, gradePoints: 6 },
    { grade: "C (Pass)", minMark: 40, maxMark: 49, gradePoints: 5 },
    { grade: "F (Fail)", minMark: 0, maxMark: 39, gradePoints: 0 },
  ]);

  // Admin Users List
  const [users, setUsers] = useState<AdminUser[]>([
    {
      id: "usr_adm_1",
      name: "Dean of Academic Affairs",
      email: "admin@apex.edu",
      role: "ADMIN",
      status: "ACTIVE",
      lastLogin: "Today at 09:15 AM",
    },
    {
      id: "usr_adm_2",
      name: "Registrar Office",
      email: "registrar@apex.edu",
      role: "ADMIN",
      status: "ACTIVE",
      lastLogin: "Yesterday at 04:30 PM",
    },
    {
      id: "usr_adm_3",
      name: "Dr. Ramesh Sharma",
      email: "ramesh.sharma@apex.edu",
      role: "EXAM_CONTROLLER",
      status: "ACTIVE",
      lastLogin: "2 days ago",
    },
    {
      id: "usr_adm_4",
      name: "Prof. Priya Nair",
      email: "priya.nair@apex.edu",
      role: "FACULTY",
      status: "ACTIVE",
      lastLogin: "Today at 08:00 AM",
    },
  ]);

  const handleSave = () => {
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000);
  };

  const executeDangerousAction = (action: string) => {
    setConfirmAction(action);
    setShowConfirmModal(true);
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
            <Settings className="w-6 h-6 text-indigo-600" />
            Portal Settings & Administration
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Configure institutional policies, academic thresholds, grading scales, and administrative accounts.
          </p>
        </div>
        <div className="flex items-center gap-3">
          {isSaved && (
            <span className="flex items-center gap-1.5 text-xs font-semibold text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-md border border-emerald-200 animate-fadeIn">
              <CheckCircle2 className="w-4 h-4" /> Changes Applied
            </span>
          )}
          <button
            onClick={handleSave}
            className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-semibold shadow-sm transition-all"
          >
            <Save className="w-4 h-4" />
            Save Configuration
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200 overflow-x-auto gap-2">
        <button
          onClick={() => setActiveTab("academic")}
          className={`flex items-center gap-2 py-3 px-4 text-sm font-semibold border-b-2 transition-colors whitespace-nowrap ${
            activeTab === "academic"
              ? "border-indigo-600 text-indigo-700"
              : "border-transparent text-slate-500 hover:text-slate-700"
          }`}
        >
          <GraduationCap className="w-4 h-4" />
          Academic Policy & Thresholds
        </button>
        <button
          onClick={() => setActiveTab("grading")}
          className={`flex items-center gap-2 py-3 px-4 text-sm font-semibold border-b-2 transition-colors whitespace-nowrap ${
            activeTab === "grading"
              ? "border-indigo-600 text-indigo-700"
              : "border-transparent text-slate-500 hover:text-slate-700"
          }`}
        >
          <Sliders className="w-4 h-4" />
          Grading System & CGPA Scale
        </button>
        <button
          onClick={() => setActiveTab("users")}
          className={`flex items-center gap-2 py-3 px-4 text-sm font-semibold border-b-2 transition-colors whitespace-nowrap ${
            activeTab === "users"
              ? "border-indigo-600 text-indigo-700"
              : "border-transparent text-slate-500 hover:text-slate-700"
          }`}
        >
          <Users className="w-4 h-4" />
          User Accounts & Roles ({users.length})
        </button>
        <button
          onClick={() => setActiveTab("security")}
          className={`flex items-center gap-2 py-3 px-4 text-sm font-semibold border-b-2 transition-colors whitespace-nowrap ${
            activeTab === "security"
              ? "border-indigo-600 text-indigo-700"
              : "border-transparent text-slate-500 hover:text-slate-700"
          }`}
        >
          <Shield className="w-4 h-4" />
          Security & Maintenance
        </button>
      </div>

      {/* TAB 1: Academic Settings */}
      {activeTab === "academic" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm space-y-5">
            <h3 className="font-semibold text-slate-900 flex items-center gap-2 text-base border-b border-slate-100 pb-3">
              <GraduationCap className="w-5 h-5 text-indigo-600" />
              Session & Term Identification
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Active Academic Year</label>
                <input
                  type="text"
                  value={academicSettings.academicYear}
                  onChange={(e) => setAcademicSettings({ ...academicSettings, academicYear: e.target.value })}
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
                <p className="text-xs text-slate-400 mt-1">Appears on transcripts, grade sheets, and portal headers.</p>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Current Academic Term</label>
                <input
                  type="text"
                  value={academicSettings.currentTerm}
                  onChange={(e) => setAcademicSettings({ ...academicSettings, currentTerm: e.target.value })}
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Maximum Credits / Semester</label>
                <input
                  type="number"
                  value={academicSettings.maxCredits}
                  onChange={(e) => setAcademicSettings({ ...academicSettings, maxCredits: Number(e.target.value) })}
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
                <p className="text-xs text-slate-400 mt-1">Maximum allowable enrollment credits per student semester.</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm space-y-5">
            <h3 className="font-semibold text-slate-900 flex items-center gap-2 text-base border-b border-slate-100 pb-3">
              <AlertTriangle className="w-5 h-5 text-amber-500" />
              Regulatory Thresholds
            </h3>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="text-xs font-semibold text-slate-700">Minimum Mandatory Attendance (%)</label>
                  <span className="text-xs font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded">
                    {academicSettings.attendanceThreshold}%
                  </span>
                </div>
                <input
                  type="range"
                  min="50"
                  max="90"
                  step="5"
                  value={academicSettings.attendanceThreshold}
                  onChange={(e) => setAcademicSettings({ ...academicSettings, attendanceThreshold: Number(e.target.value) })}
                  className="w-full accent-indigo-600"
                />
                <p className="text-xs text-slate-400 mt-1">Students below this percentage receive debarment warnings.</p>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Passing Mark Threshold (%)</label>
                <input
                  type="number"
                  value={academicSettings.passingPercentage}
                  onChange={(e) => setAcademicSettings({ ...academicSettings, passingPercentage: Number(e.target.value) })}
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Late Assignment Deduction (%)</label>
                <input
                  type="number"
                  value={academicSettings.lateSubmissionPenalty}
                  onChange={(e) => setAcademicSettings({ ...academicSettings, lateSubmissionPenalty: Number(e.target.value) })}
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
                <p className="text-xs text-slate-400 mt-1">Automatic penalty applied to unexcused late assignment submissions.</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: Grading System */}
      {activeTab === "grading" && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-slate-900">10-Point Relative Grading System</h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Configured grade boundaries applied to semester exam calculations and SGPA generation.
              </p>
            </div>
            <button
              onClick={() => {
                const newRule = { grade: "New Grade", minMark: 0, maxMark: 10, gradePoints: 1 };
                setGradingRules([...gradingRules, newRule]);
              }}
              className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 bg-indigo-50 px-3 py-1.5 rounded-lg border border-indigo-200"
            >
              + Add Tier
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-slate-600 border-b border-slate-200 text-xs font-semibold uppercase">
                <tr>
                  <th className="py-3 px-6">Grade & Description</th>
                  <th className="py-3 px-6">Min Marks (%)</th>
                  <th className="py-3 px-6">Max Marks (%)</th>
                  <th className="py-3 px-6">Grade Point Value</th>
                  <th className="py-3 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {gradingRules.map((rule, idx) => (
                  <tr key={idx} className="hover:bg-slate-50/50">
                    <td className="py-3.5 px-6 font-medium text-slate-900">
                      <input
                        type="text"
                        value={rule.grade}
                        onChange={(e) => {
                          const updated = [...gradingRules];
                          updated[idx].grade = e.target.value;
                          setGradingRules(updated);
                        }}
                        className="px-2 py-1 border border-slate-200 rounded text-sm w-44 font-medium"
                      />
                    </td>
                    <td className="py-3.5 px-6">
                      <input
                        type="number"
                        value={rule.minMark}
                        onChange={(e) => {
                          const updated = [...gradingRules];
                          updated[idx].minMark = Number(e.target.value);
                          setGradingRules(updated);
                        }}
                        className="px-2 py-1 border border-slate-200 rounded text-sm w-20 text-center"
                      />
                    </td>
                    <td className="py-3.5 px-6">
                      <input
                        type="number"
                        value={rule.maxMark}
                        onChange={(e) => {
                          const updated = [...gradingRules];
                          updated[idx].maxMark = Number(e.target.value);
                          setGradingRules(updated);
                        }}
                        className="px-2 py-1 border border-slate-200 rounded text-sm w-20 text-center"
                      />
                    </td>
                    <td className="py-3.5 px-6 font-semibold text-indigo-700">
                      <input
                        type="number"
                        value={rule.gradePoints}
                        onChange={(e) => {
                          const updated = [...gradingRules];
                          updated[idx].gradePoints = Number(e.target.value);
                          setGradingRules(updated);
                        }}
                        className="px-2 py-1 border border-slate-200 rounded text-sm w-20 text-center font-bold text-indigo-600"
                      />
                    </td>
                    <td className="py-3.5 px-6 text-right">
                      <button
                        onClick={() => setGradingRules(gradingRules.filter((_, i) => i !== idx))}
                        className="text-xs text-rose-600 hover:text-rose-800 font-semibold"
                      >
                        Remove
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: User Accounts & Roles */}
      {activeTab === "users" && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="font-semibold text-slate-900">Institutional Administrators & Staff</h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Staff accounts with administrative elevated permissions for portal operations.
              </p>
            </div>
            <button
              onClick={() => alert("Administrative user invitation dialog opened.")}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold shadow-sm self-start"
            >
              <UserPlus className="w-3.5 h-3.5" />
              Invite Administrator
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-slate-600 border-b border-slate-200 text-xs font-semibold uppercase">
                <tr>
                  <th className="py-3 px-6">Name</th>
                  <th className="py-3 px-6">Email Address</th>
                  <th className="py-3 px-6">System Role</th>
                  <th className="py-3 px-6">Status</th>
                  <th className="py-3 px-6">Last Login</th>
                  <th className="py-3 px-6 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {users.map((usr) => (
                  <tr key={usr.id} className="hover:bg-slate-50/50">
                    <td className="py-3.5 px-6 font-semibold text-slate-900">{usr.name}</td>
                    <td className="py-3.5 px-6 text-slate-600 text-xs font-mono">{usr.email}</td>
                    <td className="py-3.5 px-6">
                      <span className="inline-block px-2.5 py-0.5 text-xs font-bold rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200">
                        {usr.role}
                      </span>
                    </td>
                    <td className="py-3.5 px-6">
                      <span className="inline-flex items-center gap-1.5 text-xs font-medium text-emerald-700">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                        {usr.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-6 text-xs text-slate-500">{usr.lastLogin}</td>
                    <td className="py-3.5 px-6 text-right">
                      <button
                        onClick={() => alert(`Reset password link triggered for ${usr.email}`)}
                        className="text-xs text-indigo-600 hover:text-indigo-800 font-medium"
                      >
                        Reset Access
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 4: Security & Dangerous Operations */}
      {activeTab === "security" && (
        <div className="space-y-6">
          <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm space-y-4">
            <h3 className="font-semibold text-slate-900 flex items-center gap-2 text-base border-b border-slate-100 pb-3">
              <Lock className="w-5 h-5 text-indigo-600" />
              Portal Access & Maintenance Mode
            </h3>
            <div className="flex items-center justify-between py-2">
              <div>
                <p className="text-sm font-semibold text-slate-800">Maintenance Mode</p>
                <p className="text-xs text-slate-500">
                  When enabled, only Administrators can log in. Students will see a scheduled maintenance notice.
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={academicSettings.maintenanceMode}
                  onChange={(e) => setAcademicSettings({ ...academicSettings, maintenanceMode: e.target.checked })}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-amber-600"></div>
              </label>
            </div>
            <div className="flex items-center justify-between py-2 border-t border-slate-100">
              <div>
                <p className="text-sm font-semibold text-slate-800">Student Profile Photo Edits</p>
                <p className="text-xs text-slate-500">Allow students to update their profile photo without admin approval.</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={academicSettings.allowStudentPhotoUpload}
                  onChange={(e) => setAcademicSettings({ ...academicSettings, allowStudentPhotoUpload: e.target.checked })}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
              </label>
            </div>
          </div>

          {/* Danger Zone */}
          <div className="bg-rose-50/50 rounded-xl border border-rose-200 p-6 shadow-sm space-y-4">
            <h3 className="font-semibold text-rose-900 flex items-center gap-2 text-base border-b border-rose-100 pb-3">
              <AlertTriangle className="w-5 h-5 text-rose-600" />
              Administrative Danger Zone
            </h3>
            <p className="text-xs text-rose-700">
              The following actions affect portal sessions and student security. Every action requires explicit two-step confirmation.
            </p>
            <div className="space-y-3 pt-2">
              <div className="flex items-center justify-between p-3 bg-white border border-rose-200 rounded-lg">
                <div>
                  <p className="text-sm font-semibold text-slate-900">Terminate All Active Student Sessions</p>
                  <p className="text-xs text-slate-500">Forces every student currently logged into the portal to sign in again.</p>
                </div>
                <button
                  onClick={() => executeDangerousAction("terminate_sessions")}
                  className="px-3 py-1.5 text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-300 rounded-lg hover:bg-rose-100"
                >
                  Terminate Sessions
                </button>
              </div>
              <div className="flex items-center justify-between p-3 bg-white border border-rose-200 rounded-lg">
                <div>
                  <p className="text-sm font-semibold text-slate-900">Purge Expired Password Tokens</p>
                  <p className="text-xs text-slate-500">Clear temporary security tokens older than 24 hours.</p>
                </div>
                <button
                  onClick={() => executeDangerousAction("purge_tokens")}
                  className="px-3 py-1.5 text-xs font-semibold bg-slate-50 text-slate-700 border border-slate-300 rounded-lg hover:bg-slate-100"
                >
                  Purge Expired Tokens
                </button>
              </div>

              <div className="flex items-center justify-between p-3 bg-white border border-rose-200 rounded-lg">
                <div>
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-semibold text-rose-900">Purge & Clear All Dummy Records</p>
                    {isDataCleared && (
                      <span className="px-2 py-0.5 text-[10px] font-bold bg-amber-100 text-amber-800 rounded-full border border-amber-300">
                        CLEARED / EMPTY DB
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-500">
                    Removes all sample students, courses, assignments, and test data from MySQL database and portal cache.
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  {isDataCleared && (
                    <button
                      onClick={() => executeDangerousAction("restore_dummy_data")}
                      className="px-3 py-1.5 text-xs font-semibold bg-slate-100 text-slate-700 border border-slate-300 rounded-lg hover:bg-slate-200 shadow-sm"
                    >
                      Restore Demo Data
                    </button>
                  )}
                  <button
                    onClick={() => executeDangerousAction("clear_dummy_data")}
                    className="px-3 py-1.5 text-xs font-semibold bg-rose-600 text-white rounded-lg hover:bg-rose-700 shadow-sm flex items-center gap-1.5"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>{isDataCleared ? "Re-Purge Dummy Data" : "Clear Dummy Data"}</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Modal */}
      {showConfirmModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center gap-3 text-rose-600">
              <div className="w-10 h-10 rounded-full bg-rose-100 flex items-center justify-center">
                <AlertTriangle className="w-5 h-5 text-rose-600" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900">Confirm Administrative Action</h3>
                <p className="text-xs text-slate-500">This action will be logged in the system audit trail.</p>
              </div>
            </div>
            <p className="text-sm text-slate-600">
              Are you sure you want to proceed with:{" "}
              <strong className="text-slate-900 font-semibold">
                {confirmAction === "clear_dummy_data"
                  ? "Purging all sample/dummy records and truncating MySQL tables"
                  : confirmAction === "restore_dummy_data"
                  ? "Restoring sample demo records for testing"
                  : confirmAction}
              </strong>?
            </p>
            <div className="flex justify-end gap-3 pt-2">
              <button
                onClick={() => setShowConfirmModal(false)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800"
              >
                Cancel
              </button>
              <button
                onClick={async () => {
                  setShowConfirmModal(false);
                  if (confirmAction === "clear_dummy_data") {
                    await DataService.clearAllDummyData();
                    setIsDataCleared(true);
                    alert("✅ All dummy records (courses, students, timetable, assignments, exams) have been cleared from both MySQL database and portal cache. The portal is now in a clean production-ready state!");
                    window.location.reload();
                  } else if (confirmAction === "restore_dummy_data") {
                    await DataService.restoreSampleData();
                    setIsDataCleared(false);
                    alert("🔄 Sample demo data has been restored for testing.");
                    window.location.reload();
                  } else {
                    alert(`Confirmed and executed action: ${confirmAction}`);
                  }
                }}
                className={`px-4 py-2 text-white text-xs font-semibold rounded-lg shadow-sm ${
                  confirmAction === "restore_dummy_data"
                    ? "bg-indigo-600 hover:bg-indigo-700"
                    : "bg-rose-600 hover:bg-rose-700"
                }`}
              >
                Confirm & Execute
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
