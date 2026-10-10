"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Mail, ArrowLeft, ArrowRight, CheckCircle2, Building2 } from "lucide-react";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [resetToken, setResetToken] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      setIsSubmitted(true);
      if (data.resetToken) setResetToken(data.resetToken);
    } catch {
      setIsSubmitted(true);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FAF8FF] flex flex-col justify-between">
      <header className="w-full bg-white/90 backdrop-blur border-b border-slate-200">
        <div className="max-w-7xl mx-auto h-16 px-4 sm:px-8 flex items-center justify-between">
          <Link href="/login" className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-blue-900 flex items-center justify-center text-white font-bold text-sm shadow-sm">
              VU
            </div>
            <span className="font-semibold text-slate-900 text-base">Vanguard University</span>
          </Link>
          <Link href="/login" className="text-xs font-semibold text-blue-700 hover:underline flex items-center gap-1">
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Sign In
          </Link>
        </div>
      </header>

      <main className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-[460px]">
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 sm:p-10">
            <div className="flex flex-col items-center text-center">
              <div className="w-14 h-14 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-900 mb-3 shadow-inner">
                <Mail className="w-7 h-7" />
              </div>
              <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Forgot Password</h1>
              <p className="text-sm text-slate-500 mt-1">
                Enter your registered campus email address and we will dispatch a secure recovery token.
              </p>
            </div>

            {isSubmitted ? (
              <div className="mt-6 text-center space-y-4">
                <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs">
                  <CheckCircle2 className="w-6 h-6 text-emerald-600 mx-auto mb-2" />
                  <p className="font-semibold text-sm text-emerald-900">Recovery Instructions Sent</p>
                  <p className="mt-1">
                    If an account is associated with <strong>{email}</strong>, you will receive a password reset link.
                  </p>
                </div>

                {resetToken && (
                  <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg text-xs text-blue-900 text-left">
                    <p className="font-semibold">Development Testing Link:</p>
                    <Link
                      href={`/reset-password?token=${resetToken}`}
                      className="text-blue-700 underline font-mono break-all text-[11px] mt-1 block"
                    >
                      /reset-password?token={resetToken}
                    </Link>
                  </div>
                )}

                <Link
                  href="/login"
                  className="portal-btn-primary w-full mt-4"
                >
                  Return to Sign In
                </Link>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-800 mb-1.5" htmlFor="email">
                    Institutional Email Address <span className="text-red-600">*</span>
                  </label>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="e.g. aarav.sharma@college.edu"
                    className="portal-input"
                  />
                  <p className="text-[11px] text-slate-400 mt-1">Must be your official registered university email</p>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="portal-btn-primary w-full mt-2 h-11"
                >
                  {isLoading ? "Dispatching..." : "Send Recovery Token"}
                  <ArrowRight className="w-4 h-4 ml-1" />
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
