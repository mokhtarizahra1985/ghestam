import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const loans = await prisma.loan.findMany({ orderBy: { startDate: "asc" } });
  return NextResponse.json(loans);
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { name, principalAmount, installmentAmount, installmentCount, startDate } = body;

  if (
    !name ||
    (principalAmount !== null && principalAmount !== undefined && typeof principalAmount !== "number") ||
    typeof installmentAmount !== "number" ||
    !Number.isInteger(installmentCount) ||
    installmentCount <= 0 ||
    !startDate
  ) {
    return NextResponse.json({ error: "ورودی نامعتبر است" }, { status: 400 });
  }

  const loan = await prisma.loan.create({
    data: {
      name,
      principalAmount: principalAmount ?? null,
      installmentAmount,
      installmentCount,
      startDate: new Date(startDate),
    },
  });

  return NextResponse.json(loan, { status: 201 });
}
