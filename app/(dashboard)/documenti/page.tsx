"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useDemo } from "@/lib/demo/DemoProvider";
import * as demo from "@/lib/demo/store";
import { DOCUMENT_CATEGORY_LABELS } from "@/lib/utils/labels";
import { canManageDocuments } from "@/lib/utils/rbac";
import { formatShortDate } from "@/lib/utils/dates";
import type { DocumentCategory } from "@/types/database";

export default function DocumentiPage() {
  const { session } = useDemo();
  const [tick, setTick] = useState(0);
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState<DocumentCategory>("medical");
  const docs = useMemo(() => {
    void tick;
    return session ? demo.getDocuments(session.care_group_id) : [];
  }, [session, tick]);

  if (!session) return null;
  if (!canManageDocuments(session.role)) {
    return (
      <div className="px-5 py-10">
        <h1 className="font-display text-2xl font-semibold">Documenti</h1>
        <p className="mt-2 text-muted">Il vault è riservato ai familiari.</p>
      </div>
    );
  }

  return (
    <div className="px-5 pb-28 pt-2">
      <h1 className="font-display text-3xl font-semibold">Health Vault</h1>
      <p className="mt-1 text-sm text-muted">Referti e documenti, pronti da condividere con scadenza.</p>

      <form
        className="mt-6 space-y-3 rounded-3xl border border-line bg-white/80 p-4"
        onSubmit={(e) => {
          e.preventDefault();
          if (!title.trim()) return;
          demo.addDocument({
            careGroupId: session.care_group_id,
            title: title.trim(),
            category,
            userId: session.id,
          });
          setTitle("");
          setTick((n) => n + 1);
        }}
      >
        <p className="text-sm font-bold text-ink">Aggiungi documento (demo)</p>
        <input className="cr-input" placeholder="Titolo" value={title} onChange={(e) => setTitle(e.target.value)} />
        <select className="cr-select" value={category} onChange={(e) => setCategory(e.target.value as DocumentCategory)}>
          {(Object.keys(DOCUMENT_CATEGORY_LABELS) as DocumentCategory[]).map((c) => (
            <option key={c} value={c}>
              {DOCUMENT_CATEGORY_LABELS[c]}
            </option>
          ))}
        </select>
        <button type="submit" data-touch className="cr-btn cr-btn-primary w-full">
          Carica nel vault
        </button>
      </form>

      <ul className="mt-6 space-y-3">
        {docs.map((d) => (
          <li key={d.id} className="rounded-2xl border border-line bg-white/75 p-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="font-semibold">{d.title}</p>
                <p className="text-sm text-muted">
                  {DOCUMENT_CATEGORY_LABELS[d.category]} · {d.uploader_name} · {formatShortDate(d.created_at)}
                </p>
              </div>
              <Link href={`/documenti/${d.id}/condividi`} className="text-sm font-bold text-pine">
                Condividi
              </Link>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
