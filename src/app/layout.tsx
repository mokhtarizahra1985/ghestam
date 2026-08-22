import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "قسط‌یار | ردیاب اقساط وام",
  description: "مدیریت و چشم‌انداز اقساط ماهانه وام‌ها",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="fa" dir="rtl" className="h-full antialiased">
      <body className="min-h-full flex flex-col bg-slate-50 text-slate-900">
        {children}
      </body>
    </html>
  );
}
