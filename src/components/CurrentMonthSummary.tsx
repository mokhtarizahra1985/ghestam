"use client";

import type { Loan } from "@/lib/loan";
import { currentMonthSummary, formatMonthLabel } from "@/lib/loan";
import { formatToman } from "@/lib/format";

type Props = {
  loans: Loan[];
  paidSet: Set<string>;
  loading: boolean;
};

export default function CurrentMonthSummary({ loans, paidSet, loading }: Props) {
  if (loans.length === 0 || loading) return null;

  const { month, total, paid, remaining } = currentMonthSummary(loans, paidSet);

  if (total === 0) return null;

  return (
    <section className="bg-indigo-600 text-white rounded-xl p-5 space-y-2">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <span className="text-sm sm:text-base">
          اقساط {formatMonthLabel(month)} — پرداخت‌شده {formatToman(paid)} از {formatToman(total)}
        </span>
      </div>
      <div className="flex items-center justify-between flex-wrap gap-2 border-t border-white/20 pt-2">
        <span className="text-sm sm:text-base">
          {remaining > 0 ? "مانده تا پایان ماه" : "این ماه تمام شد"}
        </span>
        <span className="text-xl font-bold">{formatToman(remaining)}</span>
      </div>
    </section>
  );
}
