"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  BookOpen,
  CalendarCheck,
  Clock,
  FileText,
  Award,
  GraduationCap,
  CreditCard,
  BellRing,
  User,
  X,
  Video,
} from "lucide-react";
import { DataService } from "@/lib/data-service";

interface StudentSidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

const navItems = [
  { name: "Dashboard", href: "/student/dashboard", icon: LayoutDashboard },
  { name: "My Subjects", href: "/student/subjects", icon: BookOpen },
  { name: "Video Lectures", href: "/student/lectures", icon: Video },
  { name: "Attendance", href: "/student/attendance", icon: CalendarCheck },
  { name: "Timetable", href: "/student/timetable", icon: Clock },
  { name: "Assignments", href: "/student/assignments", icon: FileText },
  { name: "Examinations", href: "/student/exams", icon: Award },
  { name: "Results & Grades", href: "/student/results", icon: GraduationCap },
  { name: "Fees & Dues", href: "/student/fees", icon: CreditCard },
  { name: "Notices & Bulletins", href: "/student/notices", icon: BellRing },
  { name: "Profile & Settings", href: "/student/profile", icon: User },
];

export function StudentSidebar({ isOpen, onClose }: StudentSidebarProps) {
  const pathname = usePathname();
  const [isCleared, setIsCleared] = useState(false);
  const [pendingCount, setPendingCount] = useState<number>(0);

  useEffect(() => {
    setIsCleared(DataService.isCleared());
    DataService.getAssignments().then((asgs) => {
      setPendingCount(asgs.filter((a) => a.status === "PENDING").length);
    });
  }, [pathname]);

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-40 lg:hidden transition-opacity"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 w-64 bg-white border-r border-slate-200 flex flex-col transition-transform duration-200 ease-in-out lg:translate-x-0 lg:static lg:z-30 ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Mobile Header in Drawer */}
        <div className="h-16 flex items-center justify-between px-5 border-b border-slate-100 lg:hidden">
          <span className="font-semibold text-slate-900 text-sm">Student Navigation</span>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-500 hover:bg-slate-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Section Heading */}
        <div className="px-5 pt-5 pb-2 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
          Academic Portal
        </div>

        {/* Navigation Link List */}
        <nav className="flex-1 px-3 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href || (item.href !== "/student/dashboard" && pathname.startsWith(item.href));

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onClose}
                className={`flex items-center justify-between px-3.5 py-2.5 rounded-lg text-xs font-medium transition-all ${
                  isActive
                    ? "bg-blue-800 text-white font-semibold shadow-sm"
                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`w-4 h-4 ${isActive ? "text-white" : "text-slate-400"}`} />
                  <span>{item.name}</span>
                </div>
                {item.name === "Assignments" && pendingCount > 0 && (
                  <span
                    className={`px-1.5 py-0.5 rounded text-[10px] font-semibold ${
                      isActive
                        ? "bg-blue-600 text-white"
                        : "bg-blue-50 text-blue-700"
                    }`}
                  >
                    {pendingCount}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Footer info box */}
        <div className="p-4 m-3 rounded-xl bg-slate-50 border border-slate-200/60 text-xs text-slate-600">
          <div className="font-medium text-slate-900 mb-0.5">Need Academic Help?</div>
          <p className="text-[11px] text-slate-500 mb-2">Academic advisory is available Monday through Friday.</p>
          <a
            href="mailto:support@college.edu"
            className="text-[11px] font-semibold text-blue-700 hover:underline inline-block"
          >
            Contact Advisor →
          </a>
        </div>
      </aside>
    </>
  );
}
