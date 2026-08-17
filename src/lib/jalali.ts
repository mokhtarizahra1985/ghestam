import * as jalaali from "jalaali-js";

const PERSIAN_MONTHS = [
  "فروردین",
  "اردیبهشت",
  "خرداد",
  "تیر",
  "مرداد",
  "شهریور",
  "مهر",
  "آبان",
  "آذر",
  "دی",
  "بهمن",
  "اسفند",
];

const PERSIAN_DIGITS = ["۰", "۱", "۲", "۳", "۴", "۵", "۶", "۷", "۸", "۹"];

export function toPersianDigits(input: string | number): string {
  return String(input).replace(/[0-9]/g, (d) => PERSIAN_DIGITS[Number(d)]);
}

// Formats a Gregorian Date as a full Jalali date string, e.g. "۱۵ مرداد ۱۴۰۵".
export function formatJalaliDate(date: Date | string): string {
  const d = new Date(date);
  const { jy, jm, jd } = jalaali.toJalaali(d);
  return `${toPersianDigits(jd)} ${PERSIAN_MONTHS[jm - 1]} ${toPersianDigits(jy)}`;
}

// Formats a Gregorian Date as "ماه سال" in Jalali, e.g. "مرداد ۱۴۰۵".
export function formatJalaliMonthYear(date: Date | string): string {
  const d = new Date(date);
  const { jy, jm } = jalaali.toJalaali(d);
  return `${PERSIAN_MONTHS[jm - 1]} ${toPersianDigits(jy)}`;
}
