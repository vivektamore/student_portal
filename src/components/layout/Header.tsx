"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Bell, Menu, User as UserIcon, LogOut, ChevronDown, CheckCircle, ShieldCheck } from "lucide-react";
import { SITE_CONFIG } from "@/lib/site-config";

interface HeaderProps {
  onToggleSidebar?: () => void;
  userRole?: "STUDENT" | "ADMIN";
  userName?: string;
  userEmail?: string;
  enrollmentNumber?: string;
}

export function Header({
  onToggleSidebar,
  userRole = "STUDENT",
  userName = "Aarav Sharma",
  userEmail = "aarav.sharma@college.edu",
  enrollmentNumber = "VU-2022-CSE-0142",
}: HeaderProps) {
  const router = useRouter();
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } catch {
      // ignore
    }
    router.push("/login");
  };

  return (
    <header className="sticky top-0 z-40 w-full h-16 bg-white/95 backdrop-blur border-b border-slate-200 px-4 lg:px-6 flex items-center justify-between">
      {/* Left side: Hamburger + Institutional Crest & Title */}
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onToggleSidebar}
          className="lg:hidden p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors"
          aria-label="Toggle navigation menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        <Link href={userRole === "ADMIN" ? "/admin/dashboard" : "/student/dashboard"} className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-lg bg-blue-900 flex items-center justify-center text-white font-bold text-sm shadow-sm">
            {SITE_CONFIG.universityShort}
          </div>
          <div className="flex flex-col">
            <span className="font-semibold text-slate-900 text-sm tracking-tight leading-none">
              {SITE_CONFIG.universityName}
            </span>
            <span className="text-[11px] text-slate-500 font-medium">
              {userRole === "ADMIN" ? SITE_CONFIG.adminPortalTitle : SITE_CONFIG.studentPortalTitle}
            </span>
          </div>
        </Link>

        <span className="hidden md:inline-flex items-center ml-3 px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 font-medium text-xs">
          {SITE_CONFIG.academicYear}
        </span>
      </div>

      {/* Right side: Actions, Notifications, Profile */}
      <div className="flex items-center gap-3">
        {/* Help & Status links */}
        <div className="hidden md:flex items-center gap-4 text-xs font-medium text-slate-600 mr-2">
          <Link href="/student/notices" className="hover:text-blue-700 transition-colors">
            Bulletin Board
          </Link>
          <span className="text-slate-300">•</span>
          <span className="flex items-center gap-1 text-emerald-600">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
            Campus Online
          </span>
        </div>

        {/* Notification Bell */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setShowNotifications(!showNotifications)}
            className="p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 relative transition-colors"
            aria-label="Notifications"
          >
            <Bell className="w-4 h-4" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-red-600"></span>
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-lg border border-slate-200 p-3 z-50">
              <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-100">
                <span className="text-xs font-semibold text-slate-900">Notifications</span>
                <span className="text-[10px] bg-blue-50 text-blue-700 font-semibold px-1.5 py-0.5 rounded">
                  2 New
                </span>
              </div>
              <div className="space-y-2">
                <div className="p-2 rounded-lg bg-slate-50 text-xs">
                  <p className="font-medium text-slate-900">Mid-Sem Examination Schedule Published</p>
                  <p className="text-[11px] text-slate-500 mt-0.5">Desk allocations for CS-301 are ready.</p>
                </div>
                <div className="p-2 rounded-lg bg-slate-50 text-xs">
                  <p className="font-medium text-slate-900">Assignment 1 Graded</p>
                  <p className="text-[11px] text-slate-500 mt-0.5">Prof. Vikram Sen awarded 94/100.</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Profile Menu Dropdown */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setShowProfileMenu(!showProfileMenu)}
            className="flex items-center gap-2 p-1.5 pl-2.5 rounded-lg border border-slate-200 hover:bg-slate-50 transition-colors"
          >
            <div className="w-7 h-7 rounded-full bg-blue-800 text-white flex items-center justify-center text-xs font-semibold">
              {userName?.charAt(0) || "U"}
            </div>
            <div className="hidden sm:flex flex-col text-left">
              <span className="text-xs font-semibold text-slate-900 leading-tight">{userName}</span>
              <span className="text-[10px] text-slate-500">{userRole === "ADMIN" ? "Administrator" : enrollmentNumber}</span>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
          </button>

          {showProfileMenu && (
            <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-lg border border-slate-200 py-1.5 z-50">
              <div className="px-3 py-2 border-b border-slate-100 mb-1">
                <p className="text-xs font-semibold text-slate-900">{userName}</p>
                <p className="text-[11px] text-slate-500 truncate">{userEmail}</p>
                <span className="inline-block mt-1 text-[10px] bg-slate-100 text-slate-700 px-1.5 py-0.5 rounded font-medium">
                  {userRole}
                </span>
              </div>

              {userRole === "STUDENT" && (
                <Link
                  href="/student/profile"
                  onClick={() => setShowProfileMenu(false)}
                  className="flex items-center gap-2 px-3 py-2 text-xs text-slate-700 hover:bg-slate-50"
                >
                  <UserIcon className="w-3.5 h-3.5 text-slate-400" />
                  My Profile & Settings
                </Link>
              )}

              {userRole === "ADMIN" && (
                <Link
                  href="/admin/settings"
                  onClick={() => setShowProfileMenu(false)}
                  className="flex items-center gap-2 px-3 py-2 text-xs text-slate-700 hover:bg-slate-50"
                >
                  <ShieldCheck className="w-3.5 h-3.5 text-slate-400" />
                  Portal Settings
                </Link>
              )}

              <button
                type="button"
                onClick={handleLogout}
                className="w-full text-left flex items-center gap-2 px-3 py-2 text-xs text-red-600 hover:bg-red-50 transition-colors border-t border-slate-100 mt-1"
              >
                <LogOut className="w-3.5 h-3.5" />
                Sign Out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
