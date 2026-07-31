"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useDemo } from "@/lib/demo/DemoProvider";
import * as demo from "@/lib/demo/store";
import { formatTime } from "@/lib/utils/dates";
import { cn } from "@/lib/utils";

export default function NotePage() {
  const { session, refresh } = useDemo();
  const [tick, setTick] = useState(0);
  const [note, setNote] = useState("");
  const [alert, setAlert] = useState(false);
  const [saved, setSaved] = useState(false);

  const feed = useMemo(() => {
    void tick;
    return session ? demo.getStatusFeed(session.care_group_id).slice(0, 8) : [];
  }, [session, tick]);

  if (!session) return null;

  return (
    <div className="px-5 pb-28 pt-5">
      <h1 className="font-display text-3xl font-semibold text-ink">Note</h1>
      <p className="mt-2 text-base text-muted">
        Scrivi cosa è successo. La famiglia lo legge qui.
      </p>

      <form
        className="mt-6 space-y-3"
        onSubmit={(e) => {
          e.preventDefault();
          if (!note.trim()) return;
          demo.reportStatus({
            careGroupId: session.care_group_id,
            status: alert ? "segnalazione" : "ok",
            note: note.trim(),
            userId: session.id,
          });
          setNote("");
          setAlert(false);
          setSaved(true);
          setTick((n) => n + 1);
          refresh();
          window.setTimeout(() => setSaved(false), 2000);
        }}
      >
        <textarea
          className="cr-textarea"
          rows={4}
          placeholder="Es. Ha mangiato bene. Umore tranquillo."
          value={note}
          onChange={(e) => setNote(e.target.value)}
        />
        <button
          type="button"
          data-touch
          onClick={() => setAlert((v) => !v)}
          className={cn(
            "cr-btn w-full border-2",
            alert ? "border-alert bg-alert-soft text-alert" : "border-line bg-white text-muted"
          )}
        >
          {alert ? "Segnalazione attiva" : "Segnala un problema"}
        </button>
        <button type="submit" data-touch className="cr-btn cr-btn-primary w-full" disabled={!note.trim()}>
          {saved ? "Salvata" : "Salva nota"}
        </button>
      </form>

      <h2 className="mt-10 text-sm font-bold uppercase tracking-wide text-muted">Ultime note</h2>
      <ul className="mt-3 space-y-2">
        {feed.length === 0 && (
          <li className="rounded-2xl border border-line bg-white/70 px-4 py-4 text-sm text-muted">
            Ancora nessuna nota.
          </li>
        )}
        {feed.map((n) => (
          <li key={n.id} className="rounded-2xl border border-line bg-white/80 px-4 py-3">
            <div className="flex items-center justify-between gap-2">
              <p className="text-sm font-bold text-pine">{n.author_name ?? "Qualcuno"}</p>
              <p className="text-xs text-muted">{formatTime(n.created_at)}</p>
            </div>
            <p className="mt-1 text-sm leading-relaxed text-ink">{n.note}</p>
            {n.status === "segnalazione" && (
              <p className="mt-2 text-xs font-bold text-alert">Problema segnalato</p>
            )}
          </li>
        ))}
      </ul>

      <Link href="/oggi" className="mt-8 inline-flex text-sm font-bold text-pine">
        ← Torna a oggi
      </Link>
    </div>
  );
}
