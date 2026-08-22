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

// Formats a Jalali (jy, jm, jd) triple directly, e.g. "۱۵ مرداد ۱۴۰۵".
export function formatJalaliParts(jy: number, jm: number, jd: number): string {
  return `${toPersianDigits(jd)} ${PERSIAN_MONTHS[jm - 1]} ${toPersianDigits(jy)}`;
}

// Clamps a day-of-month to what's valid for the given Jalali month (handles
// months with 29-31 days, e.g. Esfand in a non-leap year).
export function clampJalaliDay(jy: number, jm: number, jd: number): number {
  return Math.min(jd, jalaali.jalaaliMonthLength(jy, jm));
}
