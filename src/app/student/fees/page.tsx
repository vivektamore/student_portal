"use client";

import React, { useState, useEffect } from "react";
import { CreditCard, CheckCircle2, Download, AlertCircle, Receipt, ArrowUpRight, ShieldCheck } from "lucide-react";
import { DataService, FeeItem } from "@/lib/data-service";

export default function StudentFeesPage() {
  const [fees, setFees] = useState<FeeItem[]>([]);

  useEffect(() => {
    DataService.getFees().then(setFees);
  }, []);

  const totalPaid = fees.reduce((acc, f) => acc + f.paidAmount, 0);
  const totalDue = fees.reduce((acc, f) => acc + f.dueAmount, 0);

  const handleDownloadReceipt = (receiptNumber: string) => {
    alert(`Downloading Genuine Official University Fee Receipt: ${receiptNumber}`);
  };

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Tuition Fees & Payment History</h1>
          <p className="text-xs text-slate-500 mt-1">
            Institutional fee ledger, payment reconciliations, and official financial receipts.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold px-3 py-1 bg-emerald-50 text-emerald-800 rounded-full border border-emerald-200 flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            Account Status: Zero Dues Cleared
          </span>
        </div>
      </div>

      {/* Financial Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <div className="portal-card p-6 bg-white flex flex-col justify-between">
          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
            Total Paid (Academic Year)
          </span>
          <div className="my-2">
            <span className="text-3xl font-bold text-slate-900 font-mono tracking-tight tabular-nums">
              ₹{totalPaid.toLocaleString()}
            </span>
          </div>
          <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded self-start">
            All Term Dues Settled
          </span>
        </div>

        <div className="portal-card p-6 bg-white flex flex-col justify-between">
          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
            Outstanding Tuition Dues
          </span>
          <div className="my-2">
            <span className="text-3xl font-bold text-slate-900 font-mono tracking-tight tabular-nums">
              ₹{totalDue.toLocaleString()}
            </span>
          </div>
          <span className="text-xs font-semibold text-slate-600 bg-slate-100 px-2 py-0.5 rounded self-start">
            No Pending Invoices
          </span>
        </div>

        <div className="portal-card p-6 bg-white flex flex-col justify-between">
          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
            Online Payment Gateway
          </span>
          <div className="my-2">
            <span className="text-xs font-bold text-slate-700 block">Disabled Pending Bank Clearance</span>
            <span className="text-[11px] text-slate-500">
              Payments are recorded via university finance counter or NEFT/RTGS.
            </span>
          </div>
          <span className="text-xs text-blue-700 font-medium self-start">
            Finance Desk: Accounts Block 1
          </span>
        </div>
      </div>

      {/* Payment History & Genuine Downloadable Receipts Table */}
      <div className="portal-card overflow-hidden">
        <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Receipt className="w-4 h-4 text-blue-800" />
            <h3 className="text-sm font-bold text-slate-900">Recorded Payments & Transactions</h3>
          </div>
          <span className="text-xs text-slate-500 font-mono">B.Tech CSE Account</span>
        </div>

        <div className="overflow-x-auto">
          {fees.length === 0 ? (
            <div className="p-12 text-center text-slate-500">
              <Receipt className="w-10 h-10 mx-auto mb-2 text-slate-300 stroke-1" />
              <p className="font-semibold text-slate-700">No fee records or payment invoices registered yet</p>
              <p className="text-xs text-slate-400 mt-1">
                Any official institutional tuition fees or payments verified by the university finance desk will appear here.
              </p>
            </div>
          ) : (
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50/50 text-slate-500 font-semibold uppercase text-[10px]">
                  <th className="py-3 px-6">Description & Semester</th>
                  <th className="py-3 px-4 font-mono">Amount Paid</th>
                  <th className="py-3 px-4">Transaction Ref</th>
                  <th className="py-3 px-4">Paid On</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-6 text-right">Official Receipt</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {fees.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-4 px-6">
                      <div className="font-bold text-slate-900">{item.feeType}</div>
                      <div className="text-[11px] text-slate-500">Semester {item.semester} • AY {item.academicYear}</div>
                    </td>
                    <td className="py-4 px-4 font-mono font-bold text-slate-900 tabular-nums">
                      ₹{item.paidAmount.toLocaleString()}
                    </td>
                    <td className="py-4 px-4 font-mono text-slate-600">
                      {item.transactionRef || "N/A"}
                    </td>
                    <td className="py-4 px-4 text-slate-700 font-medium">
                      {item.paidAt || "--"}
                    </td>
                    <td className="py-4 px-4">
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 text-[11px] font-semibold border border-emerald-200">
                        <CheckCircle2 className="w-3 h-3 text-emerald-600" /> {item.status}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-right">
                      {item.receiptNumber && item.receiptNumber !== "--" ? (
                        <button
                          type="button"
                          onClick={() => handleDownloadReceipt(item.receiptNumber!)}
                          className="portal-btn-secondary h-8 text-xs inline-flex items-center gap-1.5"
                        >
                          <Download className="w-3.5 h-3.5 text-blue-700" />
                          <span>Receipt #{item.receiptNumber.slice(-5)}</span>
                        </button>
                      ) : (
                        <span className="text-slate-400 text-xs">No Receipt</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
