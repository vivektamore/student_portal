"use client";

import React, { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { Lock, CheckCircle2, ArrowRight, ShieldCheck, Eye, EyeOff } from "lucide-react";
import { SITE_CONFIG } from "@/lib/site-config";

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [token, setToken] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const t = searchParams.get("token");
    if (t) setToken(t);
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (password.length < 6) {
      setError("Password must be at least 6 characters long.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match. Please re-enter.");
      return;
    }

    setIsLoading(true);

    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token: token || "manual_token", password }),
      });

      if (res.ok) {
        setIsSuccess(true);
      } else {
        const data = await res.json();
        setError(data.error || "Failed to reset password.");
      }
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FAF8FF] flex flex-col justify-between">
      <header className="w-full bg-white/90 backdrop-blur border-b border-slate-200">
        <div className="max-w-7xl mx-auto h-16 px-4 sm:px-8 flex items-center justify-between">
          <Link href="/login" className="flex items-center gap-3">
            <img
              src={SITE_CONFIG.logoUrl}
              alt={SITE_CONFIG.universityName}
              className="w-9 h-9 object-contain"
            />
            <span className="font-semibold text-slate-900 text-sm sm:text-base line-clamp-1">
              {SITE_CONFIG.universityName}
            </span>
          </Link>
          <Link href="/login" className="text-xs font-semibold text-blue-700 hover:underline">
            Back to Sign In
          </Link>
        </div>
      </header>

      <main className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-[460px]">
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 sm:p-10">
            <div className="flex flex-col items-center text-center">
              <div className="w-14 h-14 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-900 mb-3 shadow-inner">
                <ShieldCheck className="w-7 h-7" />
              </div>
              <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Create New Password</h1>
              <p className="text-sm text-slate-500 mt-1">
                Your new password must be distinct from previously used credentials.
              </p>
            </div>

            {error && (
              <div className="mt-4 p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-xs font-medium">
                {error}
              </div>
            )}

            {isSuccess ? (
              <div className="mt-6 text-center space-y-4">
                <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs">
                  <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto mb-2" />
                  <p className="font-semibold text-sm text-emerald-900">Password Successfully Updated</p>
                  <p className="mt-1">You may now sign in using your new credentials.</p>
                </div>
                <Link
                  href="/login"
                  className="portal-btn-primary w-full"
                >
                  Proceed to Sign In <ArrowRight className="w-4 h-4 ml-1" />
                </Link>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-800 mb-1.5" htmlFor="token">
                    Verification Token
                  </label>
                  <input
                    id="token"
                    type="text"
                    value={token}
                    onChange={(e) => setToken(e.target.value)}
                    placeholder="Enter security token"
                    className="portal-input font-mono text-xs"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-800 mb-1.5" htmlFor="new-password">
                    New Password <span className="text-red-600">*</span>
                  </label>
                  <div className="relative">
                    <input
                      id="new-password"
                      type={showPassword ? "text" : "password"}
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="At least 6 characters"
                      className="portal-input has-icon-right !pr-11"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-800 mb-1.5" htmlFor="confirm-password">
                    Confirm New Password <span className="text-red-600">*</span>
                  </label>
                  <input
                    id="confirm-password"
                    type={showPassword ? "text" : "password"}
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Repeat password"
                    className="portal-input"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="portal-btn-primary w-full mt-2 h-11"
                >
                  {isLoading ? "Updating..." : "Update Password"}
                </button>
              </form>
            )}
          </div>
        </div>
      </main>

      <footer className="w-full py-4 text-center text-xs text-slate-400 border-t border-slate-200/60 bg-white">
        © 2025 Vanguard University. Student Portal Account Recovery.
      </footer>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-slate-50 text-slate-500 text-sm">
          Loading recovery session...
        </div>
      }
    >
      <ResetPasswordForm />
    </Suspense>
  );
}
