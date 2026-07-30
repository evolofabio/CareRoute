"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useDemo } from "@/lib/demo/DemoProvider";
import * as demo from "@/lib/demo/store";
import { formatCurrency } from "@/lib/utils/formatCurrency";
import { EXPENSE_CATEGORY_LABELS } from "@/lib/utils/labels";
import { formatShortDate } from "@/lib/utils/dates";
import { canManageExpenses } from "@/lib/utils/rbac";

export default function SpesePage() {
  const { session } = useDemo();
  const [tick, setTick] = useState(0);
  const expenses = useMemo(() => {
    void tick;
    return session ? demo.getExpenses(session.care_group_id) : [];
  }, [session, tick]);
  const balances = useMemo(() => {
    void tick;
    return session ? demo.getExpenseBalances(session.care_group_id) : [];
  }, [session, tick]);

  if (!session) return null;
  if (!canManageExpenses(session.role)) {
    return (
      <div className="px-5 py-10">
        <h1 className="font-display text-2xl font-semibold">Spese</h1>
        <p className="mt-2 text-muted">Questo modulo è riservato ai familiari.</p>
      </div>
    );
  }

  const pendingTotal = expenses.filter((e) => e.status === "pending").reduce((s, e) => s + e.amount, 0);

  return (
    <div className="px-5 pb-28 pt-2">
      <div className="flex items-end justify-between gap-3">
        <div>
          <h1 className="font-display text-3xl font-semibold">Spese</h1>
          <p className="mt-1 text-sm text-muted">Trasparenza tra familiari, senza stress.</p>
        </div>
        <Link href="/spese/nuova" className="cr-btn cr-btn-primary px-4">
          Nuova
        </Link>
      </div>

      <div className="mt-6 rounded-3xl border border-line bg-white/80 p-5 shadow-[var(--shadow)]">
        <p className="text-sm font-semibold text-muted">Da saldare</p>
        <p className="mt-1 font-display text-3xl font-semibold text-pine-deep">{formatCurrency(pendingTotal)}</p>
        <button
          data-touch
          className="cr-btn cr-btn-secondary mt-4 w-full"
          onClick={() => {
            demo.settleExpenses(session.care_group_id);
            setTick((n) => n + 1);
          }}
        >
          Segna tutto come saldato
        </button>
      </div>

      <h2 className="mt-8 font-display text-xl font-semibold">Saldi tra membri</h2>
      <ul className="mt-3 space-y-2">
        {balances.map((b) => (
          <li key={b.userId} className="flex items-center justify-between rounded-2xl border border-line bg-white/70 px-4 py-3">
            <span className="font-semibold">{b.name}</span>
            <span className={b.balance >= 0 ? "font-bold text-ok" : "font-bold text-alert"}>
              {b.balance >= 0 ? "+" : ""}
              {formatCurrency(b.balance)}
            </span>
          </li>
        ))}
      </ul>

      <h2 className="mt-8 font-display text-xl font-semibold">Movimenti</h2>
      <ul className="mt-3 space-y-3">
        {expenses.map((e) => (
          <li key={e.id} className="rounded-2xl border border-line bg-white/75 px-4 py-3">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="font-semibold text-ink">{e.description || EXPENSE_CATEGORY_LABELS[e.category]}</p>
                <p className="text-sm text-muted">
                  {EXPENSE_CATEGORY_LABELS[e.category]} · {e.paid_by_name} · {formatShortDate(e.date)}
                </p>
              </div>
              <div className="text-right">
                <p className="font-bold text-ink">{formatCurrency(e.amount)}</p>
                <p className="text-xs font-semibold uppercase text-muted">{e.status === "pending" ? "Aperto" : "Saldato"}</p>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
