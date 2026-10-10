"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  Building2,
  GraduationCap,
  Calendar,
  CheckCircle2,
  FileText,
  Award,
  BarChart3,
  CreditCard,
  Bell,
  Settings,
  X,
  Shield,
  Layers,
  BookOpen,
  Video,
} from "lucide-react";
import { SITE_CONFIG } from "@/lib/site-config";

interface AdminSidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

const coreNavItems = [
  { name: "Dashboard", href: "/admin/dashboard", icon: LayoutDashboard },
  { name: "Students", href: "/admin/students", icon: Users },
  { name: "Departments & Programs", href: "/admin/departments", icon: Building2 },
  { name: "Subjects & Faculty", href: "/admin/subjects-faculty", icon: GraduationCap },
];

const academicOpsItems = [
  { name: "Learning Content", href: "/admin/learning-content", icon: Video },
  { name: "Timetable", href: "/admin/timetable", icon: Calendar },
  { name: "Attendance", href: "/admin/attendance", icon: CheckCircle2 },
  { name: "Assignments", href: "/admin/assignments", icon: FileText },
  { name: "Exams", href: "/admin/exams", icon: Award },
  { name: "Results", href: "/admin/results", icon: BarChart3 },
];

const administrationItems = [
  { name: "Fees & Billing", href: "/admin/fees", icon: CreditCard },
  { name: "Notices & Circulars", href: "/admin/notices", icon: Bell },
  { name: "Settings & Users", href: "/admin/settings", icon: Settings },
];

export function AdminSidebar({ isOpen, onClose }: AdminSidebarProps) {
  const pathname = usePathname();

  const renderNavGroup = (items: typeof coreNavItems) => (
    <div className="space-y-0.5">
      {items.map((item) => {
        const Icon = item.icon;
        const isActive =
          pathname === item.href ||
          (item.href !== "/admin/dashboard" && pathname.startsWith(item.href));

        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onClose}
            className={`flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-medium transition-all ${
              isActive
                ? "bg-blue-800 text-white font-semibold shadow-sm"
                : "text-slate-600 hover:text-slate-900 hover:bg-slate-100/80"
            }`}
          >
            <Icon className={`w-4 h-4 shrink-0 ${isActive ? "text-white" : "text-slate-500"}`} />
            <span className="truncate">{item.name}</span>
          </Link>
        );
      })}
    </div>
  );

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
        className={`fixed top-0 bottom-0 left-0 z-50 w-64 bg-white border-r border-slate-200/80 flex flex-col justify-between shadow-[0_1px_8px_rgba(0,0,0,0.03)] transition-transform duration-200 ease-in-out lg:translate-x-0 lg:static lg:z-30 ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex flex-col h-full overflow-hidden">
          {/* Mobile Header in Drawer (Hidden on Desktop to prevent duplicate navbar) */}
          <div className="h-16 flex items-center justify-between px-5 border-b border-slate-100 bg-white shrink-0 lg:hidden">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-8 h-8 rounded-lg bg-blue-900 flex items-center justify-center shrink-0 shadow-sm text-white font-bold text-xs">
                {SITE_CONFIG.universityShort}
              </div>
              <div className="flex flex-col min-w-0">
                <span className="font-bold text-sm text-slate-900 tracking-tight truncate leading-tight">
                  {SITE_CONFIG.universityName}
                </span>
                <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                  Admin Console
                </span>
              </div>
            </div>
            {/* Mobile close button */}
            <button
              type="button"
              onClick={onClose}
              className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              aria-label="Close navigation"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Term Indicator Pill (Mobile only, desktop is shown in top Header) */}
          <div className="px-4 py-2.5 bg-slate-50/70 border-b border-slate-100 lg:hidden">
            <div className="flex items-center justify-between text-xs font-medium text-slate-700">
              <span className="text-[11px] text-slate-500">AY 2024–25 (Spring)</span>
              <span className="inline-flex items-center gap-1 text-[10px] font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-200/60">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-600 animate-pulse"></span>
                Active Term
              </span>
            </div>
          </div>

          {/* Navigation Links Grouped by Stitch Sections */}
          <nav className="flex-1 overflow-y-auto px-3 py-3 space-y-4">
            {/* Section 1: Core */}
            <div>
              <p className="px-3 pb-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Core Modules
              </p>
              {renderNavGroup(coreNavItems)}
            </div>

            {/* Section 2: Academic Ops */}
            <div>
              <p className="px-3 pb-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Academic Operations
              </p>
              {renderNavGroup(academicOpsItems)}
            </div>

            {/* Section 3: Administration */}
            <div>
              <p className="px-3 pb-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Administration & Access
              </p>
              {renderNavGroup(administrationItems)}
            </div>
          </nav>

          {/* System Status Footer */}
          <div className="p-3.5 bg-slate-50/80 border-t border-slate-100 shrink-0">
            <div className="flex items-center gap-2 mb-1">
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
              <span className="text-[11px] font-semibold text-slate-800">System Status: Operational</span>
            </div>
            <div className="flex items-center justify-between text-[10px] text-slate-500">
              <span>Registrar Clearance</span>
              <span className="font-semibold text-blue-700">Tier 1 Admin</span>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
