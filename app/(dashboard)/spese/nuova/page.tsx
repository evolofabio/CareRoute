"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { useDemo } from "@/lib/demo/DemoProvider";
import * as demo from "@/lib/demo/store";
import { EXPENSE_CATEGORY_LABELS } from "@/lib/utils/labels";
import type { ExpenseCategory } from "@/types/database";
import { todayIsoDate } from "@/lib/utils/dates";

const categories = Object.keys(EXPENSE_CATEGORY_LABELS) as ExpenseCategory[];

export default function NuovaSpesaPage() {
  const { session } = useDemo();
  const router = useRouter();
  const [amount, setAmount] = useState("25");
  const [category, setCategory] = useState<ExpenseCategory>("farmaci");
  const [description, setDescription] = useState("");

  if (!session) return null;

  return (
    <div className="px-5 pb-28 pt-2">
      <h1 className="font-display text-3xl font-semibold">Nuova spesa</h1>
      <form
        className="mt-6 space-y-4"
        onSubmit={(e) => {
          e.preventDefault();
          demo.addExpense({
            care_group_id: session.care_group_id,
            paid_by_user_id: session.id,
            amount: Number(amount),
            category,
            description: description || null,
            date: todayIsoDate(),
          });
          router.push("/spese");
        }}
      >
        <label className="block text-sm font-semibold">
          Importo (€)
          <input className="cr-input mt-1.5" inputMode="decimal" value={amount} onChange={(e) => setAmount(e.target.value)} required />
        </label>
        <label className="block text-sm font-semibold">
          Categoria
          <select className="cr-select mt-1.5" value={category} onChange={(e) => setCategory(e.target.value as ExpenseCategory)}>
            {categories.map((c) => (
              <option key={c} value={c}>
                {EXPENSE_CATEGORY_LABELS[c]}
              </option>
            ))}
          </select>
        </label>
        <label className="block text-sm font-semibold">
          Descrizione
          <input className="cr-input mt-1.5" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Es. Farmacia sotto casa" />
        </label>
        <button type="submit" data-touch className="cr-btn cr-btn-primary w-full">
          Salva spesa
        </button>
      </form>
    </div>
  );
}
