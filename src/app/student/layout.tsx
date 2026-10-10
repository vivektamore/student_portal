"use client";

import React, { useState, useEffect } from "react";
import { Header } from "@/components/layout/Header";
import { StudentSidebar } from "@/components/layout/StudentSidebar";
import { DataService } from "@/lib/data-service";

export default function StudentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [studentInfo, setStudentInfo] = useState({
    name: "Student",
    email: "student@college.edu",
    enrollment: "NOT-ENROLLED",
  });

  useEffect(() => {
    DataService.getStudentProfile().then((profile) => {
      if (profile) {
        setStudentInfo({
          name: `${profile.firstName} ${profile.lastName}`.trim() || "Student",
          email: profile.email || "student@college.edu",
          enrollment: profile.enrollmentNumber || "NOT-ENROLLED",
        });
      }
    });
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-[#FAF8FF]">
      <Header
        onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
        userRole="STUDENT"
        userName={studentInfo.name}
        userEmail={studentInfo.email}
        enrollmentNumber={studentInfo.enrollment}
      />
      <div className="flex-1 flex w-full">
        <StudentSidebar
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
        />
        <main className="flex-1 p-4 lg:p-8 max-w-7xl mx-auto w-full overflow-x-hidden">
          {children}
        </main>
      </div>
    </div>
  );
}
