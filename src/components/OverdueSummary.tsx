"use client";

import { useMemo, useState } from "react";
import type { Loan } from "@/lib/loan";
import { overdueInstallments } from "@/lib/loan";
import { formatToman } from "@/lib/format";

type Props = {
  loans: Loan[];
  paidSet: Set<string>;
  loading: boolean;
};

export default function OverdueSummary({ loans, paidSet, loading }: Props) {
  const [expanded, setExpanded] = useState(false);
  const overdue = useMemo(() => overdueInstallments(loans, paidSet), [loans, paidSet]);

  if (loans.length === 0 || loading) return null;

  const total = overdue.reduce((sum, item) => sum + item.amount, 0);

  if (overdue.length === 0) {
    return (
      <section className="bg-emerald-50 text-emerald-800 rounded-xl p-5 border border-emerald-200">
        قسط معوقی ندارید — همه‌ی اقساط تا امروز پرداخت شده‌اند.
      </section>
    );
  }

  return (
    <section className="space-y-3">
      <div className="bg-red-600 text-white rounded-xl p-5 flex items-center justify-between flex-wrap gap-2">
        <span className="text-sm sm:text-base">
          اقساط معوق ({overdue.length} قسط، تا امروز)
        </span>
        <span className="text-xl font-bold">{formatToman(total)}</span>
      </div>

      <button
        onClick={() => setExpanded((v) => !v)}
        className="text-sm text-indigo-600 hover:underline"
      >
        {expanded ? "بستن جزئیات" : "نمایش جزئیات اقساط معوق"}
      </button>

      {expanded && (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 divide-y divide-slate-100">
          {overdue.map((item) => (
            <div
              key={`${item.loanId}:${item.month}`}
              className="flex items-center justify-between gap-3 flex-wrap px-4 py-3"
            >
              <span className="text-slate-800">
                {item.loanName} — قسط {item.index} ({item.dateLabel})
              </span>
              <span className="text-red-600 font-medium">{formatToman(item.amount)}</span>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
