"use client";

import React, { useState } from "react";
import { Header } from "@/components/layout/Header";
import { AdminSidebar } from "@/components/layout/AdminSidebar";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen flex flex-col bg-[#FAF8FF]">
      <Header
        onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
        userRole="ADMIN"
        userName="Dr. Eleanor Vance"
        userEmail="admin@college.edu"
        enrollmentNumber="ADM-001 • Chief Registrar"
      />
      <div className="flex-1 flex w-full">
        <AdminSidebar
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
