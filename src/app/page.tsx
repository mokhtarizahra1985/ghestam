"use client";

import { useCallback, useEffect, useState } from "react";
import type { Loan } from "@/lib/loan";
import LoanForm from "@/components/LoanForm";
import LoanList from "@/components/LoanList";
import MonthlyOverview from "@/components/MonthlyOverview";
import PaymentChecklist from "@/components/PaymentChecklist";
import DebtSummary from "@/components/DebtSummary";
import { usePayments } from "@/hooks/usePayments";
import { formatToman } from "@/lib/format";

export default function Home() {
  const [loans, setLoans] = useState<Loan[]>([]);
  const [editingLoan, setEditingLoan] = useState<Loan | null>(null);
  const [loading, setLoading] = useState(true);
  const { paidSet, loading: paymentsLoading, togglePaid } = usePayments();

  const fetchLoans = useCallback(async () => {
    const res = await fetch("/api/loans");
    const data = await res.json();
    setLoans(data);
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchLoans();
  }, [fetchLoans]);

  function handleSaved() {
    setEditingLoan(null);
    fetchLoans();
  }

  const totalMonthlyNow = loans
    .filter((loan) => {
      const now = new Date();
      const start = new Date(loan.startDate);
      const startMonth = new Date(start.getFullYear(), start.getMonth(), 1);
      const endMonth = new Date(
        startMonth.getFullYear(),
        startMonth.getMonth() + loan.installmentCount - 1,
        1
      );
      const currentMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      return currentMonth >= startMonth && currentMonth <= endMonth;
    })
    .reduce((sum, l) => sum + l.installmentAmount, 0);

  return (
    <main className="max-w-4xl mx-auto w-full px-4 py-8 space-y-8">
      <header className="space-y-1">
        <h1 className="text-2xl font-bold text-slate-900">قسط‌یار</h1>
        <p className="text-slate-500 text-sm">
          مدیریت وام‌ها و مشاهده چشم‌انداز اقساط ماهانه
        </p>
      </header>

      {!loading && loans.length > 0 && (
        <div className="bg-indigo-600 text-white rounded-xl p-5 flex items-center justify-between">
          <span className="text-sm sm:text-base">جمع اقساط این ماه</span>
          <span className="text-xl font-bold">{formatToman(totalMonthlyNow)}</span>
        </div>
      )}

      {!loading && <DebtSummary loans={loans} paidSet={paidSet} loading={paymentsLoading} />}

      <LoanForm
        onSaved={handleSaved}
        editingLoan={editingLoan}
        onCancelEdit={() => setEditingLoan(null)}
      />

      <section className="space-y-3">
        <h2 className="text-lg font-bold text-slate-800">لیست وام‌ها</h2>
        {loading ? (
          <p className="text-slate-400 text-sm">در حال بارگذاری...</p>
        ) : (
          <LoanList loans={loans} paidSet={paidSet} onEdit={setEditingLoan} onDeleted={fetchLoans} />
        )}
      </section>

      {!loading && (
        <PaymentChecklist
          loans={loans}
          paidSet={paidSet}
          loading={paymentsLoading}
          onTogglePaid={togglePaid}
        />
      )}

      {!loading && <MonthlyOverview loans={loans} />}
    </main>
  );
}
