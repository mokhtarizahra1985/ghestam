import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  await prisma.loan.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await req.json();
  const { name, principalAmount, installmentAmount, installmentCount, startDate } = body;

  if (
    !name ||
    typeof principalAmount !== "number" ||
    typeof installmentAmount !== "number" ||
    !Number.isInteger(installmentCount) ||
    installmentCount <= 0 ||
    !startDate
  ) {
    return NextResponse.json({ error: "ورودی نامعتبر است" }, { status: 400 });
  }

  const loan = await prisma.loan.update({
    where: { id },
    data: {
      name,
      principalAmount,
      installmentAmount,
      installmentCount,
      startDate: new Date(startDate),
    },
  });

  return NextResponse.json(loan);
}
