"use client";

import { useEffect, useMemo, useState } from "react";
import { DailyFeedDashboard } from "@/components/daily-feed/DailyFeedDashboard";
import { useDemo } from "@/lib/demo/DemoProvider";
import * as demo from "@/lib/demo/store";
import { formatShortDate, formatTime } from "@/lib/utils/dates";
import Link from "next/link";
import { CalendarDays, NotebookPen } from "lucide-react";

export default function OggiPage() {
  const { session } = useDemo();
  const [tick, setTick] = useState(0);

  useEffect(() => {
    const id = window.setInterval(() => setTick((n) => n + 1), 60_000);
    return () => window.clearInterval(id);
  }, []);

  const feed = useMemo(() => {
    void tick;
    if (!session) return [];
    return demo.getStatusFeed(session.care_group_id).slice(0, 4);
  }, [session, tick]);

  const appointments = useMemo(() => {
    void tick;
    if (!session) return [];
    return demo.getAppointments(session.care_group_id).slice(0, 2);
  }, [session, tick]);

  if (!session) return null;

  return (
    <>
      <DailyFeedDashboard
        careGroupId={session.care_group_id}
        patientName={session.patient_name}
        currentUserId={session.id}
      />

      <section className="space-y-3 px-5 pb-36">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-xl font-semibold">Prossimi appuntamenti</h2>
          <CalendarDays className="h-5 w-5 text-pine" />
        </div>
        {appointments.map((a) => (
          <div key={a.id} className="rounded-2xl border border-line bg-white/75 px-4 py-3">
            <p className="font-semibold text-ink">{a.title}</p>
            <p className="text-sm text-muted">
              {formatShortDate(a.starts_at)} · {formatTime(a.starts_at)}
              {a.location ? ` · ${a.location}` : ""}
            </p>
          </div>
        ))}

        <div className="flex items-center justify-between pt-4">
          <h2 className="font-display text-xl font-semibold">Feed famiglia</h2>
          <NotebookPen className="h-5 w-5 text-pine" />
        </div>
        {feed.map((n) => (
          <article key={n.id} className="rounded-2xl border border-line bg-white/75 px-4 py-3">
            <div className="flex items-center justify-between gap-2">
              <p className="text-sm font-bold text-pine">{n.author_name ?? "Membro"}</p>
              <span className="text-xs text-muted">{formatTime(n.created_at)}</span>
            </div>
            <p className="mt-1 text-sm leading-relaxed text-ink">{n.note}</p>
            {n.status === "segnalazione" && (
              <p className="mt-2 text-xs font-bold uppercase tracking-wide text-alert">Attenzione richiesta</p>
            )}
          </article>
        ))}

        {session.role === "caregiver" && (
          <Link href="/operatore" className="cr-btn cr-btn-secondary w-full">
            Torna alla modalità operatore
          </Link>
        )}
      </section>
    </>
  );
}
