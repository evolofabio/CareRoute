"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Check, Copy } from "lucide-react";
import { DailyFeedDashboard } from "@/components/daily-feed/DailyFeedDashboard";
import { useDemo } from "@/lib/demo/DemoProvider";
import * as demo from "@/lib/demo/store";
import {
  buildDailyBriefing,
  getActionQueue,
  getAdherenceToday,
  type ActionItem,
} from "@/lib/care/insights";
import { cn } from "@/lib/utils";
import { formatTodayLabel } from "@/lib/utils/dates";

/** Mappa priorità tecniche in frasi semplici. */
function plainTitle(item: ActionItem) {
  if (item.id.startsWith("med-overdue")) return item.title.replace(" in ritardo", ": da dare ora");
  if (item.id.startsWith("med-soon")) return item.title.replace(" a breve", ": tra poco");
  if (item.id.startsWith("refill")) return `Manca: ${item.title.replace("Scorte: ", "")}`;
  if (item.id.startsWith("help")) return item.title.replace("Aiuto richiesto: ", "Serve aiuto: ");
  if (item.id.startsWith("appt")) return item.title.replace("Visita tra poco: ", "Visita: ");
  if (item.id === "allergy-banner") return "Ricorda le allergie";
  if (item.id.startsWith("vital")) return item.title;
  if (item.id === "status-alert") return "C’è una segnalazione";
  return item.title;
}

export default function OggiPage() {
  const { session } = useDemo();
  const [tick, setTick] = useState(0);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const id = window.setInterval(() => setTick((n) => n + 1), 30_000);
    return () => window.clearInterval(id);
  }, []);

  const queue = useMemo(() => {
    void tick;
    if (!session) return [];
    // Solo le cose davvero importanti, max 4
    return getActionQueue(session.care_group_id)
      .filter((a) => a.priority === "critical" || a.priority === "high")
      .slice(0, 4);
  }, [session, tick]);

  const adherence = useMemo(() => {
    void tick;
    return session ? getAdherenceToday(session.care_group_id) : null;
  }, [session, tick]);

  const card = useMemo(() => {
    void tick;
    return session ? demo.getCareCard(session.care_group_id) : null;
  }, [session, tick]);

  const briefing = useMemo(() => {
    void tick;
    return session ? buildDailyBriefing(session.care_group_id, session.patient_name) : "";
  }, [session, tick]);

  if (!session || !adherence) return null;

  const copyBriefing = async () => {
    try {
      await navigator.clipboard.writeText(briefing);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      if (navigator.share) {
        await navigator.share({ text: briefing, title: session.patient_name });
      }
    }
  };

  return (
    <div className="pb-28">
      <header className="px-5 pt-5">
        <p className="text-sm capitalize text-muted">{formatTodayLabel()}</p>
        <h1 className="mt-1 font-display text-3xl font-semibold text-ink">{session.patient_name}</h1>
        <p className="mt-2 text-base text-muted">
          {adherence.done} di {adherence.total} farmaci fatti
          {adherence.overdue > 0 ? ` · ${adherence.overdue} in ritardo` : ""}.
        </p>
      </header>

      {card && card.allergies.length > 0 && (
        <p className="mx-5 mt-4 rounded-2xl bg-sos-soft px-4 py-3 text-sm font-semibold text-sos">
          Allergie: {card.allergies.join(", ")}
        </p>
      )}

      {/* Da fare — semplice */}
      <section className="mt-6 px-5">
        <h2 className="text-sm font-bold uppercase tracking-wide text-muted">Da fare</h2>
        {queue.length === 0 ? (
          <div className="mt-3 flex items-center gap-3 rounded-2xl border border-ok/20 bg-ok-soft/70 px-4 py-4">
            <Check className="h-6 w-6 text-ok" />
            <p className="font-semibold text-ink">Per ora è tutto a posto</p>
          </div>
        ) : (
          <ul className="mt-3 space-y-2">
            {queue.map((item) => (
              <li key={item.id}>
                <Link
                  href={item.href}
                  className={cn(
                    "block rounded-2xl border px-4 py-3.5",
                    item.priority === "critical"
                      ? "border-sos/25 bg-sos-soft/60"
                      : "border-line bg-white/80"
                  )}
                >
                  <p className="font-semibold text-ink">{plainTitle(item)}</p>
                  <p className="mt-1 text-sm text-muted">{item.reason}</p>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* Un solo bottone utile */}
      <section className="mt-6 px-5">
        <button data-touch className="cr-btn cr-btn-primary w-full" onClick={copyBriefing}>
          <Copy className="h-4 w-4" />
          {copied ? "Messaggio copiato" : "Copia messaggio per la famiglia"}
        </button>
        <p className="mt-2 text-center text-xs text-muted">
          Incollalo su WhatsApp: dice cosa è successo oggi.
        </p>
      </section>

      {/* Farmaci sempre visibili */}
      <section className="mt-8 border-t border-line/50 pt-6" id="farmaci">
        <h2 className="px-5 text-sm font-bold uppercase tracking-wide text-muted">Farmaci di oggi</h2>
        <DailyFeedDashboard
          careGroupId={session.care_group_id}
          patientName={session.patient_name}
          currentUserId={session.id}
          compact
          onChanged={() => setTick((n) => n + 1)}
        />
      </section>

      {session.role === "caregiver" && (
        <div className="px-5 pt-2">
          <Link href="/operatore" className="cr-btn cr-btn-secondary w-full">
            Torna al turno
          </Link>
        </div>
      )}
    </div>
  );
}
