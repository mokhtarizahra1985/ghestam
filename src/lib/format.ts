export function formatToman(amount: number): string {
  return new Intl.NumberFormat("fa-IR").format(Math.round(amount)) + " تومان";
}

// Strips everything but digits, e.g. for reading back a formatted number input.
export function digitsOnly(value: string): string {
  return value.replace(/[^\d]/g, "");
}

// Formats a plain digit string with thousand separators, e.g. "1000000" -> "1,000,000".
export function formatWithSeparators(digits: string): string {
  if (!digits) return "";
  return new Intl.NumberFormat("en-US").format(Number(digits));
}
