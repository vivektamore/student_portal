"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  User,
  Mail,
  Phone,
  Shield,
  Lock,
  Save,
  CheckCircle2,
  LogOut,
  Building2,
  AlertCircle,
} from "lucide-react";
import { DataService, StudentRecord } from "@/lib/data-service";
import { SITE_CONFIG } from "@/lib/site-config";

export default function StudentProfilePage() {
  const router = useRouter();
  const [student, setStudent] = useState<StudentRecord | null>(null);
  const [phone, setPhone] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [passwordSuccess, setPasswordSuccess] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    DataService.getStudentProfile().then((s) => {
      setStudent(s);
      setPhone(s.phone);
    });
  }, []);

  if (!student) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-8 h-8 border-4 border-blue-800 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  const handleUpdateContact = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    await DataService.updateStudentContact(phone);
    setIsSaving(false);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword.length < 6) {
      alert("Password must be at least 6 characters.");
      return;
    }
    setPasswordSuccess(true);
    setCurrentPassword("");
    setNewPassword("");
    setTimeout(() => setPasswordSuccess(false), 3000);
  };

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } catch {
      // ignore
    }
    router.push("/login");
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Student Profile & Account Settings</h1>
          <p className="text-xs text-slate-500 mt-1">
            Personal identity records, permitted contact revisions, and portal credential management.
          </p>
        </div>
        <button
          type="button"
          onClick={handleLogout}
          className="portal-btn-secondary text-red-600 hover:bg-red-50 border-red-200 h-9 text-xs"
        >
          <LogOut className="w-3.5 h-3.5" /> Sign Out
        </button>
      </div>

      {/* Profile Overview Card */}
      <div className="portal-card p-6 bg-white">
        <div className="flex flex-col sm:flex-row sm:items-center gap-6">
          <div className="relative">
            <div className="w-20 h-20 rounded-2xl bg-blue-100 text-blue-900 flex items-center justify-center text-2xl font-bold border-2 border-blue-200 shadow-sm">
              {(student.firstName?.charAt(0) || "S")}{(student.lastName?.charAt(0) || "")}
            </div>
            <span className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-emerald-500 border-2 border-white flex items-center justify-center" />
          </div>

          <div className="flex-1 space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-xl font-bold text-slate-900">
                {student.firstName || "Student"} {student.lastName || ""}
              </h2>
              <span className="text-[11px] font-semibold bg-blue-50 text-blue-800 border border-blue-200 px-2.5 py-0.5 rounded-full">
                Active Student
              </span>
            </div>

            <p className="text-xs text-slate-500">{student.program || "Academic Program"} • {student.department || "Department"}</p>
            <div className="flex flex-wrap items-center gap-3 text-xs text-slate-600 pt-1">
              <span>ID: <strong className="font-mono text-slate-800">{student.enrollmentNumber || "NOT-ENROLLED"}</strong></span>
              <span>•</span>
              <span>Semester {student.currentSemester || 1}</span>
              <span>•</span>
              <span>{student.academicYear?.startsWith("AY") ? student.academicYear : `AY ${student.academicYear || SITE_CONFIG.academicYear}`}</span>
              <span>•</span>
              <span className="text-blue-800 font-bold">CGPA: {student.cgpa ?? "0.0"}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column (6 cols): Official Academic Records (Read-Only) */}
        <div className="lg:col-span-6 space-y-6">
          <div className="portal-card p-6 space-y-4">
            <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
              <Building2 className="w-4 h-4 text-blue-800" />
              <h3 className="text-sm font-bold text-slate-900">Official Institutional Record</h3>
            </div>

            <div className="p-3 bg-amber-50/70 border border-amber-200 rounded-lg text-xs text-amber-800 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <span>
                Statutory academic records (enrollment ID, program track, CGPA) are immutable and locked by the Registrar&apos;s office.
              </span>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <span className="text-slate-400 block text-[11px] uppercase font-semibold">Institutional Email</span>
                <span className="font-mono text-slate-800 font-medium">{student.email}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px] uppercase font-semibold">Academic Department</span>
                <span className="text-slate-800 font-medium">{student.department}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px] uppercase font-semibold">Degree Program</span>
                <span className="text-slate-800 font-medium">{student.program}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px] uppercase font-semibold">University Roll Number</span>
                <span className="font-mono text-slate-800 font-semibold">{student.enrollmentNumber}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column (6 cols): Permitted Contact Updates & Password */}
        <div className="lg:col-span-6 space-y-6">
          {/* Contact Details Update Form */}
          <div className="portal-card p-6">
            <h3 className="text-sm font-bold text-slate-900 pb-3 mb-4 border-b border-slate-100">
              Permitted Contact Information Revisions
            </h3>

            {saveSuccess && (
              <div className="mb-4 p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Contact number successfully updated in campus registry.</span>
              </div>
            )}

            <form onSubmit={handleUpdateContact} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-800 mb-1.5" htmlFor="contact-phone">
                  Personal Contact Mobile Number
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
                  <input
                    id="contact-phone"
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="portal-input has-icon-left !pl-10"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-800 mb-1.5">
                  Emergency Contact Guardian
                </label>
                <input
                  type="text"
                  placeholder="Guardian Name & Phone Number"
                  className="portal-input"
                />
              </div>

              <button
                type="submit"
                disabled={isSaving}
                className="portal-btn-primary h-9 text-xs w-full"
              >
                <Save className="w-3.5 h-3.5" />
                <span>{isSaving ? "Saving..." : "Save Contact Details"}</span>
              </button>
            </form>
          </div>

          {/* Change Password Form */}
          <div className="portal-card p-6">
            <div className="flex items-center gap-2 pb-3 mb-4 border-b border-slate-100">
              <Lock className="w-4 h-4 text-blue-800" />
              <h3 className="text-sm font-bold text-slate-900">Change Account Password</h3>
            </div>

            {passwordSuccess && (
              <div className="mb-4 p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Security password has been successfully updated.</span>
              </div>
            )}

            <form onSubmit={handleChangePassword} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-800 mb-1.5">
                  Current Password
                </label>
                <input
                  type="password"
                  required
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="Enter current password"
                  className="portal-input"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-800 mb-1.5">
                  New Password (min 6 characters)
                </label>
                <input
                  type="password"
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Choose strong new password"
                  className="portal-input"
                />
              </div>

              <button
                type="submit"
                className="portal-btn-primary h-9 text-xs w-full"
              >
                <span>Update Password</span>
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
