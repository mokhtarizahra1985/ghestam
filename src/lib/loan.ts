export type Loan = {
  id: string;
  name: string;
  principalAmount: number;
  installmentAmount: number;
  installmentCount: number;
  startDate: string | Date;
};

export type MonthKey = string; // "YYYY-MM"

export function monthKey(year: number, month: number): MonthKey {
  return `${year}-${String(month + 1).padStart(2, "0")}`;
}

export function addMonths(date: Date, count: number): Date {
  const d = new Date(date.getFullYear(), date.getMonth() + count, 1);
  return d;
}

// Returns the list of month keys (YYYY-MM) in which the loan has an installment due.
export function loanMonthKeys(loan: Loan): MonthKey[] {
  const start = new Date(loan.startDate);
  const startAtFirstOfMonth = new Date(start.getFullYear(), start.getMonth(), 1);
  const keys: MonthKey[] = [];
  for (let i = 0; i < loan.installmentCount; i++) {
    const d = addMonths(startAtFirstOfMonth, i);
    keys.push(monthKey(d.getFullYear(), d.getMonth()));
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

// Generates a contiguous list of month keys from `from` (inclusive) for `count` months.
export function generateMonthRange(from: Date, count: number): MonthKey[] {
  const start = new Date(from.getFullYear(), from.getMonth(), 1);
  const keys: MonthKey[] = [];
  for (let i = 0; i < count; i++) {
    const d = addMonths(start, i);
    keys.push(monthKey(d.getFullYear(), d.getMonth()));
  }
  return keys;
}

export function formatMonthLabel(key: MonthKey): string {
  const [year, month] = key.split("-").map(Number);
  const persianMonths = [
    "ژانویه",
    "فوریه",
    "مارس",
    "آوریل",
    "می",
    "ژوئن",
    "ژوئیه",
    "اوت",
    "سپتامبر",
    "اکتبر",
    "نوامبر",
    "دسامبر",
  ];
  return `${persianMonths[month - 1]} ${year}`;
}
