"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Save,
  CheckCircle2,
  User,
  GraduationCap,
  Shield,
  FileCheck,
  ChevronRight,
  Upload,
  Calendar,
  Mail,
  Phone,
  Home,
  AlertCircle,
  Sparkles,
  RefreshCw,
} from "lucide-react";
import { DataService } from "@/lib/data-service";
import { generateRollNumber } from "@/lib/roll-generator";

export default function NewStudentPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"personal" | "academic" | "guardian" | "documents">("personal");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isAutoGenerating, setIsAutoGenerating] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    dob: "2004-05-14",
    gender: "MALE",
    bloodGroup: "O+",
    personalEmail: "",
    phone: "",
    address: "",
    pincode: "",
    department: "Computer Science & Engineering",
    program: "B.Tech Computer Science",
    currentSemester: 1,
    batch: "2024–2028",
    enrollmentNumber: "",
    institutionalEmail: "",
    guardianName: "",
    guardianRelation: "Father",
    guardianPhone: "",
    docHighSchool: true,
    docIntermediate: true,
    docTransferCert: true,
    docIdProof: true,
  });

  // Fetch or calculate next roll number from server
  const fetchNextRollNumber = async (dept: string, prog: string) => {
    setIsAutoGenerating(true);
    try {
      const res = await fetch(
        `/api/students/generate-roll?department=${encodeURIComponent(dept)}&program=${encodeURIComponent(prog)}&year=2024`
      );
      if (res.ok) {
        const data = await res.json();
        if (data.rollNumber) {
          setFormData((prev) => {
            const roll = data.rollNumber;
            const rollSeq = roll.split("-").pop() || "0001";
            const first = prev.firstName.toLowerCase().replace(/[^a-z0-9]/g, "") || "student";
            const last = prev.lastName.toLowerCase().replace(/[^a-z0-9]/g, "");
            const email = last ? `${first}.${last}.${rollSeq}@college.edu` : `${first}.${rollSeq}@college.edu`;
            return {
              ...prev,
              enrollmentNumber: roll,
              institutionalEmail: prev.institutionalEmail && !prev.institutionalEmail.includes("college.edu") ? prev.institutionalEmail : email,
            };
          });
          return;
        }
      }
    } catch (err) {
      console.warn("Could not query server roll generator, generating client-side:", err);
    } finally {
      setIsAutoGenerating(false);
    }

    // Client-side fallback
    const fallbackRoll = generateRollNumber(dept, prog, 2024, 1);
    setFormData((prev) => ({
      ...prev,
      enrollmentNumber: fallbackRoll,
      institutionalEmail: prev.institutionalEmail || `student.${fallbackRoll.split("-").pop()}@college.edu`,
    }));
  };

  // Auto-generate on initial mount and when department / program changes
  React.useEffect(() => {
    fetchNextRollNumber(formData.department, formData.program);
  }, [formData.department, formData.program]);

  // Update email suggestion when name changes
  const handleNameChange = (first: string, last: string) => {
    const rollSeq = formData.enrollmentNumber ? formData.enrollmentNumber.split("-").pop() : "0001";
    const cleanFirst = first.toLowerCase().replace(/[^a-z0-9]/g, "");
    const cleanLast = last.toLowerCase().replace(/[^a-z0-9]/g, "");
    const generatedEmail = cleanFirst
      ? cleanLast
        ? `${cleanFirst}.${cleanLast}.${rollSeq}@college.edu`
        : `${cleanFirst}.${rollSeq}@college.edu`
      : "";

    setFormData((prev) => ({
      ...prev,
      firstName: first,
      lastName: last,
      institutionalEmail: generatedEmail || prev.institutionalEmail,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await DataService.createStudent({
        enrollmentNumber: formData.enrollmentNumber || generateRollNumber(formData.department, formData.program, 2024, 1),
        firstName: formData.firstName.trim() || "Student",
        lastName: formData.lastName.trim() || "",
        email: formData.institutionalEmail.trim() || `student.${Date.now()}@college.edu`,
        department: formData.department,
        program: formData.program,
        semester: Number(formData.currentSemester),
      });
      router.push("/admin/students");
    } catch (err) {
      console.error("Failed to create student:", err);
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* 1. Top Context & Mode Switcher Bar (Stitch Screen 19) */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-2 flex-wrap">
          <nav className="flex items-center gap-1.5 text-xs text-slate-500 font-medium">
            <Link href="/admin/students" className="hover:text-blue-700">
              Students
            </Link>
            <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
            <span className="text-slate-900 font-semibold">New Student Record</span>
          </nav>
          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 text-[11px] font-semibold border border-blue-200">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-600 animate-pulse"></span>
            Creating New Record
          </span>
        </div>

        {/* Top Action Toolbar */}
        <div className="flex items-center gap-2">
          <Link
            href="/admin/students"
            className="px-3.5 py-2 rounded-lg bg-white border border-slate-200 text-slate-700 text-xs font-semibold hover:bg-slate-50 transition-colors shadow-sm"
          >
            Cancel
          </Link>
          <button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="px-4 py-2 rounded-lg bg-blue-800 hover:bg-blue-900 text-white text-xs font-semibold shadow-sm inline-flex items-center gap-1.5 transition-colors disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            <span>{isSubmitting ? "Saving..." : "Save Student Record"}</span>
          </button>
        </div>
      </div>

      {/* 2. Header Title Banner */}
      <div className="p-6 bg-white rounded-xl border border-slate-200/80 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Add Student</h1>
          <p className="text-xs text-slate-500 mt-1 max-w-2xl">
            Register a new student enrollment record, provision institutional Single Sign-On credentials, and allocate academic cohorts.
          </p>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-50 border border-slate-200 text-slate-700 text-xs">
          <Shield className="w-4 h-4 text-blue-700" />
          <span>Audit ID: <strong className="font-semibold text-slate-900">ADM-REG-2024</strong></span>
        </div>
      </div>

      {/* 3. Multi-Section Form Tabs */}
      <div className="flex border-b border-slate-200 overflow-x-auto gap-2">
        <button
          type="button"
          onClick={() => setActiveTab("personal")}
          className={`flex items-center gap-2 py-3 px-4 text-xs font-semibold border-b-2 transition-colors whitespace-nowrap ${
            activeTab === "personal"
              ? "border-blue-800 text-blue-800"
              : "border-transparent text-slate-500 hover:text-slate-700"
          }`}
        >
          <User className="w-4 h-4" />
          1. Personal & Contact Details
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("academic")}
          className={`flex items-center gap-2 py-3 px-4 text-xs font-semibold border-b-2 transition-colors whitespace-nowrap ${
            activeTab === "academic"
              ? "border-blue-800 text-blue-800"
              : "border-transparent text-slate-500 hover:text-slate-700"
          }`}
        >
          <GraduationCap className="w-4 h-4" />
          2. Academic Enrollment & Cohort
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("guardian")}
          className={`flex items-center gap-2 py-3 px-4 text-xs font-semibold border-b-2 transition-colors whitespace-nowrap ${
            activeTab === "guardian"
              ? "border-blue-800 text-blue-800"
              : "border-transparent text-slate-500 hover:text-slate-700"
          }`}
        >
          <Home className="w-4 h-4" />
          3. Guardian & Emergency
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("documents")}
          className={`flex items-center gap-2 py-3 px-4 text-xs font-semibold border-b-2 transition-colors whitespace-nowrap ${
            activeTab === "documents"
              ? "border-blue-800 text-blue-800"
              : "border-transparent text-slate-500 hover:text-slate-700"
          }`}
        >
          <FileCheck className="w-4 h-4" />
          4. Verification Checklist
        </button>
      </div>

      {/* 4. Tab Contents */}
      <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-slate-200/80 shadow-sm p-6 sm:p-8 space-y-6">
        {/* TAB 1: Personal Details */}
        {activeTab === "personal" && (
          <div className="space-y-5">
            <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-3 flex items-center gap-2">
              <User className="w-4 h-4 text-blue-800" /> Personal Identity & Contact
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">First Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Aarav"
                  value={formData.firstName}
                  onChange={(e) => handleNameChange(e.target.value, formData.lastName)}
                  className="portal-input text-xs"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Last Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Sharma"
                  value={formData.lastName}
                  onChange={(e) => handleNameChange(formData.firstName, e.target.value)}
                  className="portal-input text-xs"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Date of Birth</label>
                <input
                  type="date"
                  value={formData.dob}
                  onChange={(e) => setFormData({ ...formData, dob: e.target.value })}
                  className="portal-input text-xs"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Gender</label>
                <select
                  value={formData.gender}
                  onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                  className="portal-input text-xs"
                >
                  <option value="MALE">Male</option>
                  <option value="FEMALE">Female</option>
                  <option value="OTHER">Other / Prefer not to say</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Blood Group</label>
                <select
                  value={formData.bloodGroup}
                  onChange={(e) => setFormData({ ...formData, bloodGroup: e.target.value })}
                  className="portal-input text-xs"
                >
                  <option>O+</option>
                  <option>O-</option>
                  <option>A+</option>
                  <option>A-</option>
                  <option>B+</option>
                  <option>B-</option>
                  <option>AB+</option>
                  <option>AB-</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Personal Contact Number</label>
                <input
                  type="tel"
                  placeholder="+91 98765 43210"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="portal-input text-xs"
                />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-slate-700 mb-1">Permanent Residential Address</label>
                <textarea
                  rows={2}
                  placeholder="Street address, city, state..."
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  className="w-full p-2.5 rounded-lg border border-slate-300 text-xs focus:ring-2 focus:ring-blue-600 focus:outline-none"
                />
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: Academic Details */}
        {activeTab === "academic" && (
          <div className="space-y-5">
            <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-3 flex items-center gap-2">
              <GraduationCap className="w-4 h-4 text-blue-800" /> Academic Enrollment & University Identity
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Academic Department</label>
                <select
                  value={formData.department}
                  onChange={(e) => {
                    const nextDept = e.target.value;
                    let nextProg = "B.Tech Computer Science";
                    if (nextDept.includes("Electronics")) nextProg = "B.Tech Electronics & Comm.";
                    else if (nextDept.includes("Mechanical")) nextProg = "B.Tech Mechanical Engineering";
                    else if (nextDept.includes("Civil")) nextProg = "B.Tech Civil Engineering";
                    else if (nextDept.includes("Management")) nextProg = "Master of Business Administration (MBA)";

                    setFormData((prev) => ({ ...prev, department: nextDept, program: nextProg }));
                  }}
                  className="portal-input text-xs"
                >
                  <option>Computer Science & Engineering</option>
                  <option>Electronics & Communication Engineering</option>
                  <option>Mechanical Engineering</option>
                  <option>Civil Engineering</option>
                  <option>Management Studies</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Degree Program</label>
                <select
                  value={formData.program}
                  onChange={(e) => setFormData({ ...formData, program: e.target.value })}
                  className="portal-input text-xs"
                >
                  {formData.department.includes("Electronics") ? (
                    <>
                      <option>B.Tech Electronics & Comm.</option>
                      <option>M.Tech VLSI Design</option>
                    </>
                  ) : formData.department.includes("Mechanical") ? (
                    <>
                      <option>B.Tech Mechanical Engineering</option>
                      <option>M.Tech Thermal Engineering</option>
                    </>
                  ) : formData.department.includes("Civil") ? (
                    <>
                      <option>B.Tech Civil Engineering</option>
                      <option>M.Tech Structural Engineering</option>
                    </>
                  ) : formData.department.includes("Management") ? (
                    <>
                      <option>Master of Business Administration (MBA)</option>
                      <option>Bachelor of Business Administration (BBA)</option>
                    </>
                  ) : (
                    <>
                      <option>B.Tech Computer Science</option>
                      <option>B.Tech Artificial Intelligence</option>
                      <option>M.Tech Software Systems</option>
                    </>
                  )}
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Enrollment Semester</label>
                <select
                  value={formData.currentSemester}
                  onChange={(e) => setFormData({ ...formData, currentSemester: Number(e.target.value) })}
                  className="portal-input text-xs"
                >
                  {[1, 2, 3, 4, 5, 6, 7, 8].map((sem) => (
                    <option key={sem} value={sem}>
                      Semester {sem}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Academic Cohort Batch</label>
                <input
                  type="text"
                  value={formData.batch}
                  onChange={(e) => setFormData({ ...formData, batch: e.target.value })}
                  className="portal-input text-xs font-mono"
                />
              </div>
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-semibold text-slate-700">Permanent Roll / PRN *</label>
                  <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                    <Sparkles className="w-2.5 h-2.5" /> Auto-Generated
                  </span>
                </div>
                <div className="relative">
                  <input
                    type="text"
                    required
                    value={formData.enrollmentNumber}
                    onChange={(e) => setFormData({ ...formData, enrollmentNumber: e.target.value })}
                    className="portal-input text-xs font-mono font-bold text-blue-900 pr-9 bg-slate-50/50"
                  />
                  <button
                    type="button"
                    onClick={() => fetchNextRollNumber(formData.department, formData.program)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-blue-700 hover:bg-slate-100 rounded transition-colors"
                    title="Regenerate Roll Number based on Department & Program"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${isAutoGenerating ? "animate-spin text-blue-700" : ""}`} />
                  </button>
                </div>
                <p className="text-[10px] text-slate-400 mt-1">
                  Derived from University Code + Cohort Year + Program Track + Sequential ID.
                </p>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Institutional SSO Email</label>
                <input
                  type="email"
                  value={formData.institutionalEmail}
                  onChange={(e) => setFormData({ ...formData, institutionalEmail: e.target.value })}
                  className="portal-input text-xs font-mono"
                />
                <p className="text-[10px] text-slate-400 mt-1">
                  Auto-populated for campus Single Sign-On credentials.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: Guardian Details */}
        {activeTab === "guardian" && (
          <div className="space-y-5">
            <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-3 flex items-center gap-2">
              <Home className="w-4 h-4 text-blue-800" /> Guardian & Emergency Contacts
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Primary Guardian Name</label>
                <input
                  type="text"
                  placeholder="e.g. Ramesh Sharma"
                  value={formData.guardianName}
                  onChange={(e) => setFormData({ ...formData, guardianName: e.target.value })}
                  className="portal-input text-xs"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Relationship</label>
                <select
                  value={formData.guardianRelation}
                  onChange={(e) => setFormData({ ...formData, guardianRelation: e.target.value })}
                  className="portal-input text-xs"
                >
                  <option>Father</option>
                  <option>Mother</option>
                  <option>Legal Guardian</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Guardian Phone Number</label>
                <input
                  type="tel"
                  placeholder="+91 98765 00000"
                  value={formData.guardianPhone}
                  onChange={(e) => setFormData({ ...formData, guardianPhone: e.target.value })}
                  className="portal-input text-xs"
                />
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: Document Verification Checklist */}
        {activeTab === "documents" && (
          <div className="space-y-5">
            <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-3 flex items-center gap-2">
              <FileCheck className="w-4 h-4 text-blue-800" /> Document Verification & Compliance
            </h3>
            <div className="space-y-3">
              <label className="flex items-center gap-3 p-3 rounded-lg border border-slate-200 hover:bg-slate-50 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.docHighSchool}
                  onChange={(e) => setFormData({ ...formData, docHighSchool: e.target.checked })}
                  className="w-4 h-4 rounded text-blue-700 accent-blue-700"
                />
                <span className="text-xs text-slate-700 font-medium">
                  Secondary School (Class X) Original Certificate Verified
                </span>
              </label>

              <label className="flex items-center gap-3 p-3 rounded-lg border border-slate-200 hover:bg-slate-50 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.docIntermediate}
                  onChange={(e) => setFormData({ ...formData, docIntermediate: e.target.checked })}
                  className="w-4 h-4 rounded text-blue-700 accent-blue-700"
                />
                <span className="text-xs text-slate-700 font-medium">
                  Higher Secondary (Class XII) Marksheet & Cumulative Scores Verified
                </span>
              </label>

              <label className="flex items-center gap-3 p-3 rounded-lg border border-slate-200 hover:bg-slate-50 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.docTransferCert}
                  onChange={(e) => setFormData({ ...formData, docTransferCert: e.target.checked })}
                  className="w-4 h-4 rounded text-blue-700 accent-blue-700"
                />
                <span className="text-xs text-slate-700 font-medium">
                  Migration / Transfer Certificate Received and Archived
                </span>
              </label>

              <label className="flex items-center gap-3 p-3 rounded-lg border border-slate-200 hover:bg-slate-50 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.docIdProof}
                  onChange={(e) => setFormData({ ...formData, docIdProof: e.target.checked })}
                  className="w-4 h-4 rounded text-blue-700 accent-blue-700"
                />
                <span className="text-xs text-slate-700 font-medium">
                  Government Photo ID (Aadhaar / Passport) Authenticated
                </span>
              </label>
            </div>
          </div>
        )}

        {/* Bottom Form Actions */}
        <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
          <button
            type="button"
            onClick={() => {
              if (activeTab === "academic") setActiveTab("personal");
              else if (activeTab === "guardian") setActiveTab("academic");
              else if (activeTab === "documents") setActiveTab("guardian");
            }}
            disabled={activeTab === "personal"}
            className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 disabled:opacity-30"
          >
            ← Previous Section
          </button>

          <div className="flex items-center gap-3">
            {activeTab !== "documents" ? (
              <button
                type="button"
                onClick={() => {
                  if (activeTab === "personal") setActiveTab("academic");
                  else if (activeTab === "academic") setActiveTab("guardian");
                  else if (activeTab === "guardian") setActiveTab("documents");
                }}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg text-xs font-semibold"
              >
                Next Section →
              </button>
            ) : (
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-5 py-2 bg-blue-800 hover:bg-blue-900 text-white rounded-lg text-xs font-semibold shadow-sm flex items-center gap-2"
              >
                <Save className="w-4 h-4" />
                {isSubmitting ? "Enrolling Candidate..." : "Complete Student Enrollment"}
              </button>
            )}
          </div>
        </div>
      </form>
    </div>
  );
}
