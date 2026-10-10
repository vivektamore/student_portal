"use client";

import React, { useState, useEffect } from "react";
import { CreditCard, Plus, CheckCircle2, Receipt, Search, Download, ShieldCheck } from "lucide-react";
import { DataService, FeeItem } from "@/lib/data-service";

export default function AdminFeesPage() {
  const [fees, setFees] = useState<FeeItem[]>([]);
  const [showRecordModal, setShowRecordModal] = useState(false);
  const [studentId, setStudentId] = useState("VU-2022-CSE-0142");
  const [amount, setAmount] = useState(65000);
  const [paymentMethod, setPaymentMethod] = useState("NEFT / RTGS");
  const [transactionRef, setTransactionRef] = useState("TXN-984210492817");

  useEffect(() => {
    DataService.getFees().then(setFees);
  }, []);

  const handleRecordPayment = (e: React.FormEvent) => {
    e.preventDefault();
    const newPayment: FeeItem = {
      id: `fee_${Date.now()}`,
      feeType: "Semester VI Tuition Fee",
      semester: 6,
      academicYear: "2025–2026",
      totalAmount: Number(amount),
      paidAmount: Number(amount),
      dueAmount: 0,
      dueDate: "Jan 15, 2025",
      status: "PAID",
      transactionRef,
      receiptNumber: `REC-${Date.now().toString().slice(-6)}`,
      paidAt: "Today",
    };
    setFees([newPayment, ...fees]);
    setShowRecordModal(false);
  };

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Institutional Fee Collection & Ledgers</h1>
          <p className="text-xs text-slate-500 mt-1">
            Review cohort balances, record authorized bank transactions, generate verified receipts, and audit ledgers.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setShowRecordModal(true)}
          className="portal-btn-primary h-9 text-xs"
        >
          <Plus className="w-4 h-4" /> Record Authorized Payment
        </button>
      </div>

      {/* Modal */}
      {showRecordModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-xl border border-slate-200">
            <h2 className="text-base font-bold text-slate-900 mb-1">Record Authorized Fee Receipt</h2>
            <p className="text-xs text-slate-500 mb-4">Validate bank reference and update student fee balance.</p>
            <form onSubmit={handleRecordPayment} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-800 mb-1">Student Roll ID *</label>
                <input
                  type="text"
                  required
                  value={studentId}
                  onChange={(e) => setStudentId(e.target.value)}
                  className="portal-input font-mono"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-800 mb-1">Amount Paid (₹) *</label>
                <input
                  type="number"
                  required
                  value={amount}
                  onChange={(e) => setAmount(Number(e.target.value))}
                  className="portal-input font-mono"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-800 mb-1">Payment Channel</label>
                <select
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  className="portal-input text-xs"
                >
                  <option value="NEFT / RTGS">NEFT / RTGS Transfer</option>
                  <option value="Demand Draft">Demand Draft (Bank DD)</option>
                  <option value="Cash Counter">University Accounts Counter</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-800 mb-1">Bank UTR / Transaction Reference *</label>
                <input
                  type="text"
                  required
                  value={transactionRef}
                  onChange={(e) => setTransactionRef(e.target.value)}
                  className="portal-input font-mono"
                />
              </div>

              <div className="pt-3 flex items-center justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowRecordModal(false)}
                  className="portal-btn-secondary h-8 text-xs"
                >
                  Cancel
                </button>
                <button type="submit" className="portal-btn-primary h-8 text-xs">
                  Validate & Issue Receipt
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Transactions Table */}
      <div className="portal-card overflow-hidden">
        <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CreditCard className="w-4 h-4 text-blue-800" />
            <h3 className="text-sm font-bold text-slate-900">Recorded Tuition Receipts ({fees.length})</h3>
          </div>
          <span className="text-xs text-emerald-700 font-semibold bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
            Audit Ledger Reconciled
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/50 text-slate-500 font-semibold uppercase text-[10px]">
                <th className="py-3 px-6">Description</th>
                <th className="py-3 px-4">Amount</th>
                <th className="py-3 px-4">Reference UTR</th>
                <th className="py-3 px-4">Receipt Number</th>
                <th className="py-3 px-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {fees.map((f) => (
                <tr key={f.id} className="hover:bg-slate-50/60 transition-colors">
                  <td className="py-4 px-6 font-semibold text-slate-900">
                    {f.feeType}
                    <div className="text-[11px] text-slate-400">Semester {f.semester}</div>
                  </td>
                  <td className="py-4 px-4 font-mono font-bold text-slate-900 tabular-nums">
                    ₹{f.paidAmount.toLocaleString()}
                  </td>
                  <td className="py-4 px-4 font-mono text-slate-600">{f.transactionRef}</td>
                  <td className="py-4 px-4 font-mono font-semibold text-blue-900">{f.receiptNumber}</td>
                  <td className="py-4 px-6 text-right">
                    <button
                      type="button"
                      onClick={() => alert(`Downloading verified institutional receipt: ${f.receiptNumber}`)}
                      className="portal-btn-secondary h-7 text-xs px-2.5 py-1"
                    >
                      <Download className="w-3.5 h-3.5 text-blue-700" /> Print Receipt
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
