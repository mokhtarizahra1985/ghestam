"use client";

import { useMemo } from "react";
import type { Loan, MonthKey } from "@/lib/loan";
import {
  formatMonthLabel,
  loanMonthKeys,
  loanPaymentDay,
  remainingAmount,
  remainingInstallmentCount,
} from "@/lib/loan";
import { formatToman } from "@/lib/format";
import { formatJalaliDate } from "@/lib/jalali";

type Props = {
  loans: Loan[];
  paidSet: Set<string>;
  onEdit: (loan: Loan) => void;
  onDeleted: () => void;
};

export default function LoanList({ loans, paidSet, onEdit, onDeleted }: Props) {
  const sortedLoans = useMemo(
    () => [...loans].sort((a, b) => loanPaymentDay(a) - loanPaymentDay(b)),
    [loans]
  );

  async function handleDelete(id: string) {
    if (!confirm("این وام حذف شود؟")) return;
    await fetch(`/api/loans/${id}`, { method: "DELETE" });
    onDeleted();
  }

  if (loans.length === 0) {
    return (
      <p className="text-slate-500 text-sm bg-white border border-slate-200 rounded-xl p-5">
        هنوز وامی ثبت نشده است.
      </p>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-x-auto">
      <table className="w-full text-sm text-right">
        <thead className="bg-slate-50 text-slate-500">
          <tr>
            <th className="px-4 py-3 font-medium">نام وام</th>
            <th className="px-4 py-3 font-medium">مبلغ کل</th>
            <th className="px-4 py-3 font-medium">مبلغ قسط</th>
            <th className="px-4 py-3 font-medium">مبلغ باقی‌مانده</th>
            <th className="px-4 py-3 font-medium">تعداد اقساط</th>
            <th className="px-4 py-3 font-medium">اقساط باقی‌مانده</th>
            <th className="px-4 py-3 font-medium">روز پرداخت</th>
            <th className="px-4 py-3 font-medium">شروع</th>
            <th className="px-4 py-3 font-medium">پایان</th>
            <th className="px-4 py-3 font-medium"></th>
          </tr>
        </thead>
        <tbody>
          {sortedLoans.map((loan) => {
            const months: MonthKey[] = loanMonthKeys(loan);
            return (
              <tr key={loan.id} className="border-t border-slate-100">
                <td className="px-4 py-3 font-medium text-slate-800">{loan.name}</td>
                <td className="px-4 py-3">
                  {loan.principalAmount != null ? formatToman(loan.principalAmount) : "—"}
                </td>
                <td className="px-4 py-3">{formatToman(loan.installmentAmount)}</td>
                <td className="px-4 py-3 font-medium text-indigo-700">
                  {formatToman(remainingAmount(loan, paidSet))}
                </td>
                <td className="px-4 py-3">{loan.installmentCount}</td>
                <td className="px-4 py-3">{remainingInstallmentCount(loan, paidSet)}</td>
                <td className="px-4 py-3">{loanPaymentDay(loan)}</td>
                <td className="px-4 py-3">{formatJalaliDate(loan.startDate)}</td>
                <td className="px-4 py-3">{formatMonthLabel(months[months.length - 1])}</td>
                <td className="px-4 py-3 whitespace-nowrap">
                  <button
                    onClick={() => onEdit(loan)}
                    className="text-indigo-600 hover:underline ml-3"
                  >
                    ویرایش
                  </button>
                  <button
                    onClick={() => handleDelete(loan.id)}
                    className="text-red-600 hover:underline"
                  >
                    حذف
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
