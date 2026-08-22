"use client";

import { useMemo, useState } from "react";
import type { Loan } from "@/lib/loan";
import { allInstallments, paymentKey } from "@/lib/loan";
import { formatToman } from "@/lib/format";

type Props = {
  loans: Loan[];
  paidSet: Set<string>;
  loading: boolean;
  onTogglePaid: (loanId: string, month: string) => void;
};

export default function PaymentChecklist({ loans, paidSet, loading, onTogglePaid }: Props) {
  const [hideRest, setHideRest] = useState(true);

  const installments = useMemo(() => allInstallments(loans), [loans]);

  if (loans.length === 0) return null;

  const visibleInstallments = hideRest
    ? installments.filter((i) => !paidSet.has(paymentKey(i.loanId, i.month)))
    : installments;

  const paidCount = installments.filter((i) => paidSet.has(paymentKey(i.loanId, i.month))).length;

  return (
    <section className="space-y-3">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h2 className="text-lg font-bold text-slate-800">چک‌لیست پرداخت اقساط</h2>
        <label className="flex items-center gap-2 text-sm text-slate-600">
          <input
            type="checkbox"
            checked={hideRest}
            onChange={(e) => setHideRest(e.target.checked)}
            className="w-4 h-4 accent-indigo-600"
          />
          فقط پرداخت‌نشده‌ها
        </label>
      </div>

      <p className="text-sm text-slate-500">
        {paidCount} از {installments.length} قسط پرداخت شده
      </p>

      {loading ? (
        <p className="text-slate-400 text-sm">در حال بارگذاری...</p>
      ) : visibleInstallments.length === 0 ? (
        <p className="text-slate-500 text-sm bg-white border border-slate-200 rounded-xl p-5">
          {hideRest ? "همه‌ی اقساط پرداخت شده‌اند." : "قسطی برای نمایش نیست."}
        </p>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 divide-y divide-slate-100">
          {visibleInstallments.map((item) => {
            const key = paymentKey(item.loanId, item.month);
            const isPaid = paidSet.has(key);
            return (
              <label
                key={key}
                className="flex items-center gap-3 px-4 py-3 cursor-pointer hover:bg-slate-50 transition"
              >
                <input
                  type="checkbox"
                  checked={isPaid}
                  onChange={() => onTogglePaid(item.loanId, item.month)}
                  className="w-5 h-5 accent-indigo-600 shrink-0"
                />
                <div className="flex-1 flex items-center justify-between gap-3 flex-wrap">
                  <span className={isPaid ? "text-slate-400 line-through" : "text-slate-800"}>
                    {item.loanName} — قسط {item.index} ({item.dateLabel})
                  </span>
                  <span className={isPaid ? "text-slate-400" : "text-slate-700 font-medium"}>
                    {formatToman(item.amount)}
                  </span>
                </div>
              </label>
            );
          })}
        </div>
      )}
    </section>
  );
}
