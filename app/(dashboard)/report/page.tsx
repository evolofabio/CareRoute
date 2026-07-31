"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Copy } from "lucide-react";
import { useDemo } from "@/lib/demo/DemoProvider";
import * as demo from "@/lib/demo/store";
import {
  buildDailyBriefing,
  getRefillInsights,
  getWeeklyReport,
} from "@/lib/care/insights";
import { formatCurrency } from "@/lib/utils/formatCurrency";

export default function ReportPage() {
  const { session } = useDemo();
  const [copied, setCopied] = useState(false);

  const report = useMemo(() => (session ? getWeeklyReport(session.care_group_id) : null), [session]);
  const refills = useMemo(
    () => (session ? getRefillInsights(session.care_group_id) : []),
    [session]
  );
  const contrib = useMemo(
    () => (session ? demo.getContributionStats(session.care_group_id) : []),
    [session]
  );
  const briefing = useMemo(
    () => (session ? buildDailyBriefing(session.care_group_id, session.patient_name) : ""),
    [session]
  );

  if (!session || !report) return null;

  return (
    <div className="px-5 pb-28">
      <header className="animate-fade-up">
        <p className="text-sm font-medium text-muted">Decisioni, non grafici vuoti</p>
        <h1 className="font-display text-2xl font-semibold text-ink">Report di cura</h1>
        <p className="mt-1 text-sm text-muted">
          Quadro chiaro per capire se la giornata tiene, dove manca copertura e cosa ordinare.
        </p>
      </header>

      <section className="mt-6 grid grid-cols-2 gap-3 animate-fade-up">
        <Metric label="Aderenza terapie" value={`${report.adherencePct}%`} hint={`${report.dosesDone}/${report.dosesTotal} dosi`} />
        <Metric label="Ore assistenza" value={`${report.assistanceHours}h`} hint="mese corrente" />
        <Metric label="Compiti aperti" value={String(report.openTasks)} hint={`${report.openHelps} aiuti aperti`} />
        <Metric label="Spese pending" value={formatCurrency(report.expensePending)} hint="da saldare" />
      </section>

      <section className="mt-8 rounded-2xl border border-line/70 bg-white/65 p-4 animate-fade-up">
        <h2 className="font-display text-lg font-semibold">Lettura operativa</h2>
        <ul className="mt-3 space-y-2 text-sm leading-relaxed text-ink">
          <li>
            · {report.adherencePct < 70
              ? "Aderenza bassa: verifica dosi in ritardo e chi è in turno nelle fasce critiche."
              : report.adherencePct < 100
                ? "Aderenza buona ma incompleta: chiudi le dosi residue prima di sera."
                : "Terapie al completo per oggi."}
          </li>
          <li>· {report.moodSummary} · Vitali: {report.lastVital ?? "mancano rilevazioni"}</li>
          <li>· Prossima visita: {report.nextAppointment ?? "nessuna in agenda — valuta se serve controllo"}</li>
          <li>
            · Scorte critiche:{" "}
            {refills.filter((r) => r.status !== "ok").length
              ? refills
                  .filter((r) => r.status !== "ok")
                  .map((r) => `${r.name} (~${r.daysLeft ?? "?"}g)`)
                  .join("; ")
              : "ok"}
          </li>
        </ul>
      </section>

      <section className="mt-8 animate-fade-up">
        <h2 className="font-display text-lg font-semibold">Chi sta portando il carico</h2>
        <ul className="mt-3 space-y-2">
          {contrib.map((c) => (
            <li key={c.userId} className="flex items-center justify-between rounded-2xl border border-line/70 bg-white/60 px-4 py-3">
              <div>
                <p className="font-semibold text-ink">{c.name}</p>
                <p className="text-xs text-muted">
                  {c.tasksDone} compiti · {c.helpsClaimed} aiuti · {formatCurrency(c.expenseTotal)} spese
                </p>
              </div>
              <span className="text-sm font-bold text-pine">{c.score} pt</span>
            </li>
          ))}
        </ul>
      </section>

      <section className="mt-8 rounded-3xl border border-pine/20 bg-pine p-5 text-white animate-fade-up">
        <h2 className="font-display text-xl font-semibold">Briefing da condividere</h2>
        <pre className="mt-3 max-h-48 overflow-auto whitespace-pre-wrap rounded-2xl bg-black/20 p-3 text-xs leading-relaxed text-white/90">
          {briefing}
        </pre>
        <button
          data-touch
          className="cr-btn mt-4 w-full bg-white text-pine"
          onClick={async () => {
            await navigator.clipboard.writeText(briefing);
            setCopied(true);
            window.setTimeout(() => setCopied(false), 2000);
          }}
        >
          <Copy className="h-4 w-4" />
          {copied ? "Copiato" : "Copia per WhatsApp"}
        </button>
      </section>

      <Link href="/oggi" className="cr-btn cr-btn-secondary mt-6 w-full">
        Torna a Cosa fare ora
      </Link>
    </div>
  );
}

function Metric({ label, value, hint }: { label: string; value: string; hint: string }) {
  return (
    <div className="rounded-2xl border border-line/70 bg-white/65 p-4">
      <p className="text-[11px] font-bold uppercase tracking-wide text-muted">{label}</p>
      <p className="mt-1 font-display text-2xl font-semibold text-ink">{value}</p>
      <p className="text-xs text-muted">{hint}</p>
    </div>
  );
}
