"use client";

import { Fragment, useMemo, useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { Loan } from "@/lib/loan";
import { buildMonthlyBreakdown, formatMonthLabel, generateMonthRange, paymentKey } from "@/lib/loan";
import { formatToman } from "@/lib/format";

type Props = {
  loans: Loan[];
  paidSet: Set<string>;
};

const FUTURE_MONTHS_OPTIONS = [6, 12, 24];

export default function MonthlyOverview({ loans, paidSet }: Props) {
  const [futureMonths, setFutureMonths] = useState(12);
  const [expandedMonth, setExpandedMonth] = useState<string | null>(null);

  const breakdown = useMemo(() => {
    const now = new Date();
    const months = generateMonthRange(now, futureMonths);
    return buildMonthlyBreakdown(loans, months);
  }, [loans, futureMonths]);

  const chartData = breakdown.map((row) => ({
    month: formatMonthLabel(row.month),
    total: row.total,
  }));

  if (loans.length === 0) {
    return null;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h2 className="text-lg font-bold text-slate-800">چشم‌انداز اقساط ماهانه</h2>
        <div className="flex gap-2">
          {FUTURE_MONTHS_OPTIONS.map((m) => (
            <button
              key={m}
              onClick={() => setFutureMonths(m)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition ${
                futureMonths === m
                  ? "bg-indigo-600 text-white"
                  : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-100"
              }`}
            >
              {m} ماه آینده
            </button>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5">
        <ResponsiveContainer width="100%" height={280}>
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
            <XAxis dataKey="month" tick={{ fontSize: 12 }} />
            <YAxis
              tick={{ fontSize: 12 }}
              tickFormatter={(v) => new Intl.NumberFormat("fa-IR").format(v)}
              width={70}
            />
            <Tooltip
              formatter={(value) => formatToman(Number(value))}
              labelStyle={{ direction: "rtl" }}
            />
            <Bar dataKey="total" fill="#4f46e5" radius={[6, 6, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-x-auto">
        <table className="w-full text-sm text-right">
          <thead className="bg-slate-50 text-slate-500">
            <tr>
              <th className="px-4 py-3 font-medium">ماه</th>
              <th className="px-4 py-3 font-medium">تعداد قسط</th>
              <th className="px-4 py-3 font-medium">جمع کل</th>
              <th className="px-4 py-3 font-medium"></th>
            </tr>
          </thead>
          <tbody>
            {breakdown.map((row) => (
              <Fragment key={row.month}>
                <tr className="border-t border-slate-100">
                  <td className="px-4 py-3 font-medium text-slate-800">
                    {formatMonthLabel(row.month)}
                  </td>
                  <td className="px-4 py-3">{row.loans.length}</td>
                  <td className="px-4 py-3 font-semibold text-indigo-700">
                    {formatToman(row.total)}
                  </td>
                  <td className="px-4 py-3">
                    {row.loans.length > 0 && (
                      <button
                        onClick={() =>
                          setExpandedMonth(expandedMonth === row.month ? null : row.month)
                        }
                        className="text-indigo-600 hover:underline text-xs"
                      >
                        {expandedMonth === row.month ? "بستن جزئیات" : "نمایش جزئیات"}
                      </button>
                    )}
                  </td>
                </tr>
                {expandedMonth === row.month && (
                  <tr className="bg-slate-50">
                    <td colSpan={4} className="px-4 py-3">
                      <ul className="space-y-1">
                        {row.loans.map((l) => {
                          const isPaid = paidSet.has(paymentKey(l.loanId, row.month));
                          return (
                            <li
                              key={l.loanId}
                              className={`flex justify-between text-xs sm:text-sm ${
                                isPaid ? "text-slate-400 line-through" : "text-slate-600"
                              }`}
                            >
                              <span>{l.loanName}</span>
                              <span>{formatToman(l.amount)}</span>
                            </li>
                          );
                        })}
                      </ul>
                    </td>
                  </tr>
                )}
              </Fragment>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
