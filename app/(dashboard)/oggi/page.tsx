"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  AlertTriangle,
  Check,
  Copy,
  Share2,
  ChevronRight,
  Pill,
  Activity,
} from "lucide-react";
import { DailyFeedDashboard } from "@/components/daily-feed/DailyFeedDashboard";
import { useDemo } from "@/lib/demo/DemoProvider";
import * as demo from "@/lib/demo/store";
import {
  buildDailyBriefing,
  getActionQueue,
  getAdherenceToday,
  getRefillInsights,
  getWeeklyReport,
  type ActionItem,
} from "@/lib/care/insights";
import { cn } from "@/lib/utils";
import { formatTodayLabel } from "@/lib/utils/dates";
import { formatCurrency } from "@/lib/utils/formatCurrency";
import { PageIntro, SectionTitle } from "@/components/shared/PageIntro";

export default function OggiPage() {
  const { session } = useDemo();
  const [tick, setTick] = useState(0);
  const [copied, setCopied] = useState(false);
  const [showMeds, setShowMeds] = useState(false);

  useEffect(() => {
    const id = window.setInterval(() => setTick((n) => n + 1), 30_000);
    return () => window.clearInterval(id);
  }, []);

  const queue = useMemo(() => {
    void tick;
    return session ? getActionQueue(session.care_group_id) : [];
  }, [session, tick]);

  const adherence = useMemo(() => {
    void tick;
    return session ? getAdherenceToday(session.care_group_id) : null;
  }, [session, tick]);

  const report = useMemo(() => {
    void tick;
    return session ? getWeeklyReport(session.care_group_id) : null;
  }, [session, tick]);

  const refills = useMemo(() => {
    void tick;
    return session ? getRefillInsights(session.care_group_id).filter((r) => r.status !== "ok") : [];
  }, [session, tick]);

  const card = useMemo(() => {
    void tick;
    return session ? demo.getCareCard(session.care_group_id) : null;
  }, [session, tick]);

  const briefing = useMemo(() => {
    void tick;
    return session ? buildDailyBriefing(session.care_group_id, session.patient_name) : "";
  }, [session, tick]);

  if (!session || !adherence || !report) return null;

  const critical = queue.filter((a) => a.priority === "critical");

  const copyBriefing = async () => {
    try {
      await navigator.clipboard.writeText(briefing);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      // fallback: share API
      if (navigator.share) {
        await navigator.share({ text: briefing, title: `Briefing ${session.patient_name}` });
      }
    }
  };

  return (
    <div className="pb-28">
      <div className="px-5 pb-2 pt-5">
        <PageIntro
          eyebrow={`Oggi · ${formatTodayLabel()}`}
          title="Cosa fare ora"
          description={`Priorità operative per ${session.patient_name}: ritardi, vitali, scorte, aiuti e visite — ordinate per urgenza, non per menu.`}
        />
      </div>

      {/* Snapshot utile */}
      <section className="mx-5 mt-5 grid grid-cols-3 gap-2.5 animate-fade-up" style={{ animationDelay: "60ms" }}>
        <Stat
          label="Aderenza"
          value={`${adherence.percent}%`}
          tone={adherence.overdue ? "danger" : adherence.percent >= 80 ? "ok" : "warn"}
          sub={`${adherence.done}/${adherence.total} dosi`}
        />
        <Stat
          label="Critici"
          value={String(critical.length)}
          tone={critical.length ? "danger" : "ok"}
          sub="da risolvere"
        />
        <Stat
          label="Scorte"
          value={String(refills.length)}
          tone={refills.some((r) => r.status === "critical") ? "danger" : refills.length ? "warn" : "ok"}
          sub="sotto soglia"
        />
      </section>

      {card && card.allergies.length > 0 && (
        <div className="mx-5 mt-4 flex gap-3 rounded-2xl border border-sos/30 bg-sos-soft/70 px-4 py-3 animate-fade-up">
          <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-sos" />
          <div>
            <p className="text-sm font-bold text-ink">Allergie attive</p>
            <p className="text-sm text-muted">{card.allergies.join(" · ")}</p>
            {card.avoid && <p className="mt-1 text-xs text-muted">{card.avoid}</p>}
          </div>
        </div>
      )}

      {/* Coda azioni */}
      <section className="mt-7 px-5 animate-fade-up" style={{ animationDelay: "100ms" }}>
        <SectionTitle
          eyebrow="Coda operativa"
          title="Priorità di oggi"
          description="Critico = adesso. Alto = oggi. Medio = non perdere la giornata. Tocca una riga per agire."
        />

        {queue.length === 0 ? (
          <div className="rounded-2xl border border-ok/25 bg-ok-soft/60 p-5 text-center">
            <Check className="mx-auto h-8 w-8 text-ok" />
            <p className="mt-2 font-semibold text-ink">Nessuna urgenza aperta</p>
            <p className="mt-1 text-sm text-muted">Puoi aggiornare note, vitali o preparare il briefing famiglia.</p>
          </div>
        ) : (
          <ul className="space-y-3">
            {queue.map((item) => (
              <ActionRow key={item.id} item={item} />
            ))}
          </ul>
        )}
        <Link href="/report" className="mt-4 inline-flex text-sm font-bold text-pine">
          Apri report di cura completo →
        </Link>
      </section>

      {/* Briefing WhatsApp — valore reale */}
      <section className="relative mx-5 mt-9 overflow-hidden rounded-[1.75rem] border border-pine/20 bg-pine p-5 text-white shadow-[var(--shadow)] animate-fade-up">
        <div className="pointer-events-none absolute -right-10 -top-10 h-36 w-36 rounded-full bg-leaf/30 blur-2xl" />
        <div className="relative flex items-start justify-between gap-3">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-white/65">Briefing famiglia</p>
            <h2 className="mt-1.5 font-display text-xl font-semibold">Messaggio pronto da inviare</h2>
            <p className="mt-1.5 text-sm leading-relaxed text-white/75">
              Un solo testo con dosi, note, vitali, scorte e visite — via WhatsApp o SMS, senza riscrivere tutto.
            </p>
          </div>
          <Share2 className="relative h-5 w-5 shrink-0 text-white/80" />
        </div>
        <pre className="relative mt-4 max-h-40 overflow-auto whitespace-pre-wrap rounded-2xl bg-black/20 p-3 text-xs leading-relaxed text-white/90">
          {briefing}
        </pre>
        <button data-touch className="cr-btn relative mt-4 w-full bg-white text-pine" onClick={copyBriefing}>
          <Copy className="h-4 w-4" />
          {copied ? "Copiato!" : "Copia briefing"}
        </button>
      </section>

      {/* Situazione sintetica */}
      <section className="mx-5 mt-8 grid gap-3 animate-fade-up">
        <h2 className="font-display text-xl font-semibold text-ink">Situazione utile</h2>
        <div className="rounded-2xl border border-line/70 bg-white/65 p-4">
          <div className="flex items-center gap-2 text-pine">
            <Activity className="h-4 w-4" />
            <p className="text-xs font-bold uppercase tracking-wide">Quadro odierno</p>
          </div>
          <ul className="mt-3 space-y-2 text-sm text-ink">
            <li>· {report.moodSummary}</li>
            <li>· Vitali: {report.lastVital ?? "nessuna rilevazione oggi"}</li>
            <li>· Visita: {report.nextAppointment ?? "nessuna in agenda"}</li>
            <li>· Spese aperte: {formatCurrency(report.expensePending)}</li>
            <li>· Ore assistenza mese: {report.assistanceHours}h</li>
            <li>· Compiti aperti: {report.openTasks} · aiuti aperti: {report.openHelps}</li>
          </ul>
        </div>

        {refills.length > 0 && (
          <div className="rounded-2xl border border-alert/25 bg-alert-soft/50 p-4">
            <p className="text-xs font-bold uppercase tracking-wide text-alert">Autonomia scorte</p>
            <ul className="mt-2 space-y-2">
              {refills.map((r) => (
                <li key={r.supplyId} className="text-sm">
                  <span className="font-semibold text-ink">{r.name}</span>
                  <span className="text-muted"> — {r.message}</span>
                </li>
              ))}
            </ul>
            <Link href="/gestione" className="mt-3 inline-flex text-sm font-bold text-pine">
              Apri gestione scorte →
            </Link>
          </div>
        )}
      </section>

      {/* Farmaci: secondari ma accessibili */}
      <section className="mt-8 px-5" id="farmaci">
        <button
          data-touch
          onClick={() => setShowMeds((v) => !v)}
          className="flex w-full items-center justify-between rounded-2xl border border-line bg-white/70 px-4 py-3"
        >
          <span className="flex items-center gap-2 font-semibold text-ink">
            <Pill className="h-4 w-4 text-pine" />
            Checklist farmaci ({adherence.done}/{adherence.total})
          </span>
          <ChevronRight className={cn("h-5 w-5 text-muted transition", showMeds && "rotate-90")} />
        </button>
      </section>

      {showMeds && (
        <div className="mt-2">
          <DailyFeedDashboard
            careGroupId={session.care_group_id}
            patientName={session.patient_name}
            currentUserId={session.id}
            compact
            onChanged={() => setTick((n) => n + 1)}
          />
        </div>
      )}

      {!showMeds && (
        <div className="px-5 pt-3">
          <button data-touch className="cr-btn cr-btn-primary w-full" onClick={() => setShowMeds(true)}>
            Apri somministrazioni
          </button>
        </div>
      )}

      {session.role === "caregiver" && (
        <div className="px-5 pt-4">
          <Link href="/operatore" className="cr-btn cr-btn-secondary w-full">
            Modalità operatore
          </Link>
        </div>
      )}
    </div>
  );
}

function Stat({
  label,
  value,
  sub,
  tone,
}: {
  label: string;
  value: string;
  sub: string;
  tone: "ok" | "warn" | "danger";
}) {
  return (
    <div
      className={cn(
        "rounded-[1.25rem] border px-3 py-3.5 shadow-[var(--shadow-soft)]",
        tone === "ok" && "border-ok/20 bg-ok-soft/55",
        tone === "warn" && "border-alert/25 bg-alert-soft/65",
        tone === "danger" && "border-sos/25 bg-sos-soft/65"
      )}
    >
      <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-muted">{label}</p>
      <p className="mt-1 font-display text-[1.65rem] leading-none font-semibold text-ink">{value}</p>
      <p className="mt-1.5 text-[11px] text-muted">{sub}</p>
    </div>
  );
}

function ActionRow({ item }: { item: ActionItem }) {
  return (
    <li>
      <Link
        href={item.href}
        className={cn(
          "flex items-start gap-3 rounded-[1.35rem] border p-4 shadow-[var(--shadow-soft)] transition active:scale-[0.99]",
          item.priority === "critical" && "border-sos/30 bg-sos-soft/55",
          item.priority === "high" && "border-alert/25 bg-alert-soft/50",
          item.priority === "medium" && "border-line/60 bg-white/75"
        )}
      >
        <span
          className={cn(
            "mt-0.5 rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide",
            item.priority === "critical" && "bg-sos text-white",
            item.priority === "high" && "bg-alert text-white",
            item.priority === "medium" && "bg-mist text-pine"
          )}
        >
          {item.priority === "critical" ? "Ora" : item.priority === "high" ? "Presto" : "Oggi"}
        </span>
        <div className="min-w-0 flex-1">
          <p className="font-semibold text-ink">{item.title}</p>
          <p className="mt-1 text-sm leading-relaxed text-muted">{item.reason}</p>
          <p className="mt-2 text-sm font-bold text-pine">{item.cta} →</p>
        </div>
      </Link>
    </li>
  );
}
