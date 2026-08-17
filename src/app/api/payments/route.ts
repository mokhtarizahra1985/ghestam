import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const payments = await prisma.installmentPayment.findMany({
    where: { paid: true },
  });
  return NextResponse.json(payments);
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { loanId, month, paid } = body;

  if (typeof loanId !== "string" || typeof month !== "string" || typeof paid !== "boolean") {
    return NextResponse.json({ error: "ورودی نامعتبر است" }, { status: 400 });
  }

  const payment = await prisma.installmentPayment.upsert({
    where: { loanId_monthKey: { loanId, monthKey: month } },
    update: { paid, paidAt: paid ? new Date() : null },
    create: { loanId, monthKey: month, paid, paidAt: paid ? new Date() : null },
  });

  return NextResponse.json(payment);
}
