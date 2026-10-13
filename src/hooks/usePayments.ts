"use client";

import { useCallback, useEffect, useState } from "react";
import { paymentKey } from "@/lib/loan";

export function usePayments() {
  const [paidSet, setPaidSet] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/payments")
      .then((res) => res.json())
      .then((payments: { loanId: string; monthKey: string }[]) => {
        setPaidSet(new Set(payments.map((p) => paymentKey(p.loanId, p.monthKey))));
        setLoading(false);
      });
  }, []);

  const togglePaid = useCallback(async (loanId: string, month: string) => {
    const key = paymentKey(loanId, month);
    let nextPaid = false;

    setPaidSet((prev) => {
      const next = new Set(prev);
      nextPaid = !next.has(key);
      if (nextPaid) next.add(key);
      else next.delete(key);
      return next;
    });

    await fetch("/api/payments", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ loanId, month, paid: nextPaid }),
    });
  }, []);

  return { paidSet, loading, togglePaid };
}
