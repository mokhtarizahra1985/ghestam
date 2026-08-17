"use client";

import { useState, FormEvent } from "react";
import type { Loan } from "@/lib/loan";

type Props = {
  onSaved: () => void;
  editingLoan?: Loan | null;
  onCancelEdit?: () => void;
};

export default function LoanForm({ onSaved, editingLoan, onCancelEdit }: Props) {
  const [name, setName] = useState(editingLoan?.name ?? "");
  const [principalAmount, setPrincipalAmount] = useState(
    editingLoan ? String(editingLoan.principalAmount) : ""
  );
  const [installmentAmount, setInstallmentAmount] = useState(
    editingLoan ? String(editingLoan.installmentAmount) : ""
  );
  const [installmentCount, setInstallmentCount] = useState(
    editingLoan ? String(editingLoan.installmentCount) : ""
  );
  const [startDate, setStartDate] = useState(
    editingLoan
      ? new Date(editingLoan.startDate).toISOString().slice(0, 10)
      : ""
  );
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");

    const payload = {
      name,
      principalAmount: Number(principalAmount),
      installmentAmount: Number(installmentAmount),
      installmentCount: Number(installmentCount),
      startDate,
    };

    if (
      !payload.name.trim() ||
      !payload.principalAmount ||
      !payload.installmentAmount ||
      !payload.installmentCount ||
      !payload.startDate
    ) {
      setError("لطفا همه فیلدها را پر کنید.");
      return;
    }

    setSubmitting(true);
    try {
      const url = editingLoan ? `/api/loans/${editingLoan.id}` : "/api/loans";
      const method = editingLoan ? "PUT" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const data = await res.json();
        setError(data.error ?? "خطایی رخ داد.");
        return;
      }
      if (!editingLoan) {
        setName("");
        setPrincipalAmount("");
        setInstallmentAmount("");
        setInstallmentCount("");
        setStartDate("");
      }
      onSaved();
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white rounded-xl shadow-sm border border-slate-200 p-5 space-y-4"
    >
      <h2 className="text-lg font-bold text-slate-800">
        {editingLoan ? "ویرایش وام" : "افزودن وام جدید"}
      </h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <label className="flex flex-col gap-1 text-sm text-slate-600">
          نام وام
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="مثلا: وام خودرو"
            className="border border-slate-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-400"
          />
        </label>

        <label className="flex flex-col gap-1 text-sm text-slate-600">
          تاریخ شروع (اولین قسط)
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="border border-slate-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-400"
          />
        </label>

        <label className="flex flex-col gap-1 text-sm text-slate-600">
          مبلغ کل وام (تومان)
          <input
            type="number"
            value={principalAmount}
            onChange={(e) => setPrincipalAmount(e.target.value)}
            placeholder="مثلا: 100000000"
            className="border border-slate-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-400"
          />
        </label>

        <label className="flex flex-col gap-1 text-sm text-slate-600">
          تعداد اقساط
          <input
            type="number"
            value={installmentCount}
            onChange={(e) => setInstallmentCount(e.target.value)}
            placeholder="مثلا: 12"
            className="border border-slate-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-400"
          />
        </label>

        <label className="flex flex-col gap-1 text-sm text-slate-600">
          مبلغ هر قسط (تومان)
          <input
            type="number"
            value={installmentAmount}
            onChange={(e) => setInstallmentAmount(e.target.value)}
            placeholder="مثلا: 9000000"
            className="border border-slate-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-400"
          />
        </label>
      </div>

      {error && <p className="text-red-600 text-sm">{error}</p>}

      <div className="flex gap-3">
        <button
          type="submit"
          disabled={submitting}
          className="bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-medium rounded-lg px-5 py-2 transition"
        >
          {editingLoan ? "ذخیره تغییرات" : "افزودن وام"}
        </button>
        {editingLoan && (
          <button
            type="button"
            onClick={onCancelEdit}
            className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium rounded-lg px-5 py-2 transition"
          >
            انصراف
          </button>
        )}
      </div>
    </form>
  );
}
