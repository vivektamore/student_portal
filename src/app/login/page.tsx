"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { BadgeAlert, Lock, ArrowRight, Eye, EyeOff, Building2, CheckCircle2, Shield } from "lucide-react";
import { SITE_CONFIG } from "@/lib/site-config";

export default function LoginPage() {
  const router = useRouter();
  const [identifier, setIdentifier] = useState("VU-2022-CSE-0142");
  const [password, setPassword] = useState("Student@123456");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const setStudentDemo = () => {
    setIdentifier("VU-2022-CSE-0142");
    setPassword("Student@123456");
    setError(null);
  };

  const setAdminDemo = () => {
    setIdentifier("admin@college.edu");
    setPassword("Admin@123456");
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ identifier, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Invalid credentials. Please verify your Student ID and password.");
        setIsLoading(false);
        return;
      }

      router.push(data.redirectTo || (data.role === "ADMIN" ? "/admin/dashboard" : "/student/dashboard"));
    } catch {
      setError("An error occurred connecting to the server. Please try again.");
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FAF8FF] flex flex-col justify-between">
      {/* Top Navigation Bar */}
      <header className="w-full bg-white/90 backdrop-blur border-b border-slate-200">
        <div className="max-w-7xl mx-auto h-16 px-4 sm:px-8 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img
              src={SITE_CONFIG.logoUrl}
              alt={SITE_CONFIG.universityName}
              className="w-10 h-10 object-contain drop-shadow-sm"
            />
            <div className="flex flex-col">
              <span className="font-bold text-slate-900 text-sm sm:text-base tracking-tight leading-tight">
                {SITE_CONFIG.universityName}
              </span>
              <span className="text-[10px] text-amber-700 font-semibold hidden sm:inline">
                {SITE_CONFIG.tagline}
              </span>
            </div>
            <span className="hidden lg:inline-flex items-center px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-600 font-medium text-xs">
              Academic Year {SITE_CONFIG.academicYear}
            </span>
          </div>
          <div className="flex items-center gap-4 text-xs font-medium text-slate-600">
            <Link href="/forgot-password" className="hover:text-blue-700 transition-colors hidden sm:inline">
              Account Recovery
            </Link>
            <span className="flex items-center gap-1.5 text-emerald-600">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              Portal Systems Normal
            </span>
          </div>
        </div>
      </header>

      {/* Main Login Container */}
      <main className="flex-1 flex items-center justify-center px-4 py-10 relative overflow-hidden">
        {/* Ambient background glows */}
        <div className="absolute -top-32 -left-32 w-96 h-96 rounded-full bg-blue-100/60 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-32 -right-32 w-96 h-96 rounded-full bg-indigo-100/60 blur-3xl pointer-events-none" />

        <div className="w-full max-w-[460px] relative z-10">
          {/* Demo Account Quick Buttons */}
          <div className="mb-4 bg-white/80 backdrop-blur p-3 rounded-xl border border-blue-200/60 shadow-sm flex items-center justify-between gap-2">
            <span className="text-xs font-semibold text-slate-700">Quick Demo Access:</span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={setStudentDemo}
                className="px-2.5 py-1 text-xs font-medium bg-blue-50 text-blue-800 hover:bg-blue-100 rounded-lg transition-colors border border-blue-200"
              >
                Student Login
              </button>
              <button
                type="button"
                onClick={setAdminDemo}
                className="px-2.5 py-1 text-xs font-medium bg-slate-900 text-white hover:bg-slate-800 rounded-lg transition-colors flex items-center gap-1"
              >
                <Shield className="w-3 h-3 text-emerald-400" />
                Admin Login
              </button>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 sm:p-10 flex flex-col">
            {/* Header / Crest */}
            <div className="flex flex-col items-center text-center">
              <div className="w-16 h-16 rounded-2xl bg-white border border-slate-200 flex items-center justify-center p-2 mb-3 shadow-sm">
                <img
                  src={SITE_CONFIG.logoUrl}
                  alt={SITE_CONFIG.universityName}
                  className="w-full h-full object-contain"
                />
              </div>
              <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">Academic Portal Login</h1>
              <p className="text-xs text-slate-500 mt-1 max-w-xs">
                {SITE_CONFIG.affiliation}
              </p>
            </div>

            {/* Error Notification Banner */}
            {error && (
              <div className="mt-5 p-3.5 rounded-lg bg-red-50 border border-red-200 text-red-700 text-xs flex items-start gap-2.5">
                <BadgeAlert className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                <span className="flex-1 font-medium">{error}</span>
                <button
                  type="button"
                  onClick={() => setError(null)}
                  className="text-red-500 hover:text-red-700 font-bold ml-1"
                >
                  ✕
                </button>
              </div>
            )}

            {/* Login Form */}
            <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-800 mb-1.5" htmlFor="identifier">
                  Email or Student ID <span className="text-red-600">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <span className="text-sm font-mono font-bold">@</span>
                  </div>
                  <input
                    id="identifier"
                    name="identifier"
                    type="text"
                    required
                    value={identifier}
                    onChange={(e) => setIdentifier(e.target.value)}
                    placeholder="e.g. MDSMC-2025-BCOM-0001 or admin@college.edu"
                    className="portal-input has-icon-left !pl-11"
                  />
                </div>
                <p className="text-[11px] text-slate-400 mt-1">Use your official institutional credentials</p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-800 mb-1.5" htmlFor="password">
                  Password <span className="text-red-600">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Lock className="w-4 h-4 text-slate-400" />
                  </div>
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter account password"
                    className="portal-input has-icon-left has-icon-right !pl-11 !pr-11"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between text-xs pt-1">
                <label className="flex items-center gap-2 cursor-pointer text-slate-600 select-none">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="w-4 h-4 rounded text-blue-700 accent-blue-700"
                  />
                  <span>Remember me</span>
                </label>
                <Link
                  href="/forgot-password"
                  className="font-semibold text-blue-700 hover:text-blue-800 hover:underline"
                >
                  Forgot Password?
                </Link>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="portal-btn-primary w-full mt-2 h-11"
              >
                {isLoading ? (
                  <span className="flex items-center gap-2">
                    <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                    Authenticating...
                  </span>
                ) : (
                  <>
                    <span>Sign In to Portal</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>

            {/* SSO Partition */}
            <div className="relative my-6 flex items-center justify-center">
              <div className="w-full h-px bg-slate-200"></div>
              <span className="absolute px-3 bg-white text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                Institutional Access
              </span>
            </div>

            <button
              type="button"
              onClick={setStudentDemo}
              className="w-full h-10 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold flex items-center justify-center gap-2 transition-all"
            >
              <Building2 className="w-4 h-4 text-blue-700" />
              <span>Campus Single Sign-On (Microsoft 365)</span>
            </button>

            {/* Footer Notice */}
            <div className="mt-6 pt-4 border-t border-slate-100 text-center text-xs text-slate-500">
              Need assistance? Contact{" "}
              <a href="mailto:it-helpdesk@college.edu" className="text-blue-700 font-semibold hover:underline">
                Campus IT Helpdesk
              </a>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full py-4 text-center text-xs text-slate-400 border-t border-slate-200/60 bg-white">
        © {new Date().getFullYear()} {SITE_CONFIG.universityName}. Secure Student Academic Information Management System.
      </footer>
    </div>
  );
}
