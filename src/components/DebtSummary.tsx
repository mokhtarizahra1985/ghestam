"use client";

import type { Loan } from "@/lib/loan";
import { totalRemainingDebt } from "@/lib/loan";
import { formatToman } from "@/lib/format";

type Props = {
  loans: Loan[];
  paidSet: Set<string>;
  loading: boolean;
};

export default function DebtSummary({ loans, paidSet, loading }: Props) {
  if (loans.length === 0 || loading) return null;

  const total = totalRemainingDebt(loans, paidSet);

  return (
    <section className="bg-slate-900 text-white rounded-xl p-5 flex items-center justify-between">
      <span className="text-sm sm:text-base">مجموع بدهی باقی‌مانده (بر اساس اقساط پرداخت‌نشده)</span>
      <span className="text-xl font-bold">{formatToman(total)}</span>
    </section>
  );
}
