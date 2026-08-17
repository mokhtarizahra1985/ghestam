import * as jalaali from "jalaali-js";
import { clampJalaliDay, formatJalaliMonthYear, formatJalaliParts } from "@/lib/jalali";

export type Loan = {
  id: string;
  name: string;
  principalAmount: number | null;
  installmentAmount: number;
  installmentCount: number;
  startDate: string | Date;
};

export type MonthKey = string; // Jalali "jy-jm", e.g. "1405-05"

export function jalaliMonthKey(jy: number, jm: number): MonthKey {
  return `${jy}-${String(jm).padStart(2, "0")}`;
}

export function monthKeyOfDate(date: Date): MonthKey {
  const { jy, jm } = jalaali.toJalaali(date);
  return jalaliMonthKey(jy, jm);
}

export function addJalaliMonths(jy: number, jm: number, count: number): { jy: number; jm: number } {
  const zeroBased = (jy * 12 + (jm - 1)) + count;
  return { jy: Math.floor(zeroBased / 12), jm: (zeroBased % 12) + 1 };
}

// The Jalali day-of-month installments are due on, derived from the loan's start date.
export function loanPaymentDay(loan: Loan): number {
  return jalaali.toJalaali(new Date(loan.startDate)).jd;
}

// Returns the list of month keys in which the loan has an installment due,
// one per calendar month starting from the loan's start date.
export function loanMonthKeys(loan: Loan): MonthKey[] {
  const start = new Date(loan.startDate);
  const { jy, jm } = jalaali.toJalaali(start);
  const keys: MonthKey[] = [];
  for (let i = 0; i < loan.installmentCount; i++) {
    const { jy: y, jm: m } = addJalaliMonths(jy, jm, i);
    keys.push(jalaliMonthKey(y, m));
  }
  return keys;
}

export function loanEndMonthKey(loan: Loan): MonthKey {
  const keys = loanMonthKeys(loan);
  return keys[keys.length - 1];
}

export type MonthlyBreakdown = {
  month: MonthKey;
  total: number;
  loans: { loanId: string; loanName: string; amount: number }[];
};

// Builds a monthly total map across all loans, keyed by month, for the given
// list of month keys (in order).
export function buildMonthlyBreakdown(
  loans: Loan[],
  months: MonthKey[]
): MonthlyBreakdown[] {
  const perLoanMonths = loans.map((loan) => ({
    loan,
    months: new Set(loanMonthKeys(loan)),
  }));

  return months.map((month) => {
    const monthLoans = perLoanMonths
      .filter(({ months: m }) => m.has(month))
      .map(({ loan }) => ({
        loanId: loan.id,
        loanName: loan.name,
        amount: loan.installmentAmount,
      }));
    return {
      month,
      total: monthLoans.reduce((sum, l) => sum + l.amount, 0),
      loans: monthLoans,
    };
  });
}

// Generates a contiguous list of Jalali month keys from `from` (inclusive) for `count` months.
export function generateMonthRange(from: Date, count: number): MonthKey[] {
  const { jy, jm } = jalaali.toJalaali(from);
  const keys: MonthKey[] = [];
  for (let i = 0; i < count; i++) {
    const { jy: y, jm: m } = addJalaliMonths(jy, jm, i);
    keys.push(jalaliMonthKey(y, m));
  }
  return keys;
}

export function formatMonthLabel(key: MonthKey): string {
  const [jy, jm] = key.split("-").map(Number);
  const { gy, gm, gd } = jalaali.toGregorian(jy, jm, 1);
  return formatJalaliMonthYear(new Date(gy, gm - 1, gd));
}

export type InstallmentItem = {
  loanId: string;
  loanName: string;
  month: MonthKey;
  index: number; // 1-based installment number within the loan
  amount: number;
  dateLabel: string; // e.g. "۱۱ تیر ۱۴۰۵"
};

// Flattens every loan into its individual installments, sorted chronologically.
export function allInstallments(loans: Loan[]): InstallmentItem[] {
  const items = loans.flatMap((loan) => {
    const day = loanPaymentDay(loan);
    return loanMonthKeys(loan).map((month, i) => {
      const [jy, jm] = month.split("-").map(Number);
      return {
        loanId: loan.id,
        loanName: loan.name,
        month,
        index: i + 1,
        amount: loan.installmentAmount,
        dateLabel: formatJalaliParts(jy, jm, clampJalaliDay(jy, jm, day)),
      };
    });
  });
  return items.sort((a, b) => (a.month === b.month ? 0 : a.month < b.month ? -1 : 1));
}

// Set membership key for a paid installment: `${loanId}:${month}`.
export function paymentKey(loanId: string, month: string): string {
  return `${loanId}:${month}`;
}

export function remainingInstallmentCount(loan: Loan, paidSet: Set<string>): number {
  return loanMonthKeys(loan).filter((m) => !paidSet.has(paymentKey(loan.id, m))).length;
}

export function remainingAmount(loan: Loan, paidSet: Set<string>): number {
  return remainingInstallmentCount(loan, paidSet) * loan.installmentAmount;
}

export function totalRemainingDebt(loans: Loan[], paidSet: Set<string>): number {
  return loans.reduce((sum, loan) => sum + remainingAmount(loan, paidSet), 0);
}
