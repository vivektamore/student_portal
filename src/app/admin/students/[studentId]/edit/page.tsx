"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Save, User } from "lucide-react";
import { DataService } from "@/lib/data-service";

export default function EditStudentPage() {
  const router = useRouter();
  const params = useParams();
  const studentId = params.studentId as string;

  const [student, setStudent] = useState<any | null>(null);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phone, setPhone] = useState("+91 98765 43210");
  const [status, setStatus] = useState("ACTIVE");

  useEffect(() => {
    DataService.getAdminStudents().then((list) => {
      const found = list.find((s: any) => s.id === studentId) || list[0];
      if (found) {
        setStudent(found);
        setFirstName(found.firstName);
        setLastName(found.lastName);
        setStatus(found.status);
      }
    });
  }, [studentId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (student) {
      student.firstName = firstName;
      student.lastName = lastName;
      student.status = status;
      await DataService.updateStudentStatus(student.id, status as any);
    }
    router.push("/admin/students");
  };

  if (!student) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-8 h-8 border-4 border-blue-800 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      <div className="flex items-center gap-2 text-xs text-slate-500">
        <Link href="/admin/students" className="hover:text-blue-800 flex items-center gap-1 font-medium">
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Student Directory
        </Link>
      </div>

      <div className="portal-card p-6 sm:p-8 bg-white">
        <div className="flex items-center gap-3 pb-4 mb-6 border-b border-slate-100">
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-900 flex items-center justify-center">
            <User className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-900">
              Edit Student: {student.enrollmentNumber}
            </h1>
            <p className="text-xs text-slate-500">Update permitted administrative parameters and account status.</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold text-slate-800 mb-1">First Name</label>
              <input
                type="text"
                required
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                className="portal-input"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-800 mb-1">Last Name</label>
              <input
                type="text"
                required
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                className="portal-input"
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-800 mb-1">Account Standing</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="portal-input text-xs"
            >
              <option value="ACTIVE">ACTIVE (Good Standing)</option>
              <option value="SUSPENDED">SUSPENDED (Registration Hold)</option>
            </select>
          </div>

          <div className="pt-4 flex items-center justify-end gap-3 border-t border-slate-100">
            <Link href="/admin/students" className="portal-btn-secondary h-9">
              Cancel
            </Link>
            <button type="submit" className="portal-btn-primary h-9">
              <Save className="w-3.5 h-3.5" /> Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
