"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Check, ClipboardList, Copy } from "lucide-react";
import { EmergencyButton } from "@/components/caregiver/EmergencyButton";
import { CareRouteLogo } from "@/components/shared/CareRouteLogo";
import { useDemo } from "@/lib/demo/DemoProvider";
import * as demo from "@/lib/demo/store";
import { buildDailyBriefing, buildHandoffDraft, getActionQueue, getAdherenceToday } from "@/lib/care/insights";
import { cn } from "@/lib/utils";
import { formatTodayLabel, todayIsoDate } from "@/lib/utils/dates";
import type { MoodLevel } from "@/types/database";

const moods: { id: MoodLevel; label: string }[] = [
  { id: "sereno", label: "Sereno" },
  { id: "cosi_cosi", label: "Così così" },
  { id: "agitato", label: "Agitato" },
  { id: "giu", label: "Giù" },
];

export default function OperatorePage() {
  const { session } = useDemo();
  const [tick, setTick] = useState(0);
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
  const [mood, setMood] = useState<MoodLevel>("sereno");
  const [meals, setMeals] = useState(true);
  const [hydration, setHydration] = useState(true);
  const [sleep, setSleep] = useState(true);
  const [handoff, setHandoff] = useState("");
  const [alerts, setAlerts] = useState("");
  const [copied, setCopied] = useState(false);
  const [sys, setSys] = useState("128");
  const [dia, setDia] = useState("78");

  const checklist = useMemo(() => {
    void tick;
    return session ? demo.getChecklist(session.care_group_id) : [];
  }, [session, tick]);
  const tasks = useMemo(() => {
    void tick;
    return session ? demo.getDailyTasks(session.care_group_id) : [];
  }, [session, tick]);
  const latestHandoff = useMemo(() => {
    void tick;
    return session ? demo.getHandoffs(session.care_group_id)[0] : null;
  }, [session, tick]);
  const card = useMemo(() => {
    void tick;
    return session ? demo.getCareCard(session.care_group_id) : null;
  }, [session, tick]);
  const openPunch = useMemo(() => {
    void tick;
    return session ? demo.getOpenPunch(session.care_group_id, session.id) : null;
  }, [session, tick]);
  const critical = useMemo(() => {
    void tick;
    return session ? getActionQueue(session.care_group_id).filter((a) => a.priority === "critical") : [];
  }, [session, tick]);
  const adherence = useMemo(() => {
    void tick;
    return session ? getAdherenceToday(session.care_group_id) : null;
  }, [session, tick]);

  if (!session || !adherence) return null;

  const openMeds = tasks.filter((t) => t.status !== "completed" && t.status !== "skipped").length;
  const doneCare = checklist.filter((c) => c.done).length;
  const bump = () => setTick((n) => n + 1);

  const startShift = () => {
    demo.punchIn(session.care_group_id, session.id, "Turno avviato da operatore");
    const draft = buildHandoffDraft(session.care_group_id);
    setHandoff(draft);
    setStep(2);
    bump();
  };

  const finishShift = () => {
    demo.saveWellbeing({
      care_group_id: session.care_group_id,
      date: todayIsoDate(),
      mood,
      meals_ok: meals,
      hydration_ok: hydration,
      sleep_ok: sleep,
      note: null,
      created_by: session.id,
    });
    demo.addVital({
      care_group_id: session.care_group_id,
      recorded_at: new Date().toISOString(),
      systolic: Number(sys) || null,
      diastolic: Number(dia) || null,
      weight_kg: null,
      temperature_c: null,
      pain_level: null,
      note: "Rilevazione fine turno",
      created_by: session.id,
    });
    if (handoff.trim()) {
      demo.addHandoff({
        careGroupId: session.care_group_id,
        shift_label: "Fine turno operatore",
        summary: handoff.trim(),
        open_alerts: alerts.trim() || undefined,
        userId: session.id,
      });
    }
    demo.punchOut(session.care_group_id, session.id);
    setStep(4);
    bump();
  };

  const copyBriefing = async () => {
    const text = buildDailyBriefing(session.care_group_id, session.patient_name);
    await navigator.clipboard.writeText(text);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="px-5 pb-10 pt-5">
      <div className="flex items-center justify-between">
        <CareRouteLogo size="sm" />
        <Link href="/impostazioni" className="text-sm font-bold text-pine">
          Impostazioni
        </Link>
      </div>

      <header className="mt-6 animate-fade-up">
        <p className="text-sm font-medium capitalize text-muted">{formatTodayLabel()}</p>
        <h1 className="mt-1 font-display text-3xl font-semibold text-ink">Turno guidato</h1>
        <p className="mt-2 text-sm text-muted">
          {doneCare}/{checklist.length} cure · {adherence.done}/{adherence.total} dosi ·{" "}
          {openPunch ? "in servizio" : "fuori servizio"}
        </p>
      </header>

      {/* Step indicator */}
      <ol className="mt-5 grid grid-cols-4 gap-1">
        {[
          [1, "Entra"],
          [2, "Cure"],
          [3, "Chiudi"],
          [4, "Fatto"],
        ].map(([n, label]) => (
          <li
            key={n}
            className={cn(
              "rounded-xl px-1 py-2 text-center text-[11px] font-bold",
              step === n ? "bg-pine text-white" : step > (n as number) ? "bg-ok-soft text-ok" : "bg-white/60 text-muted"
            )}
          >
            {label}
          </li>
        ))}
      </ol>

      <div className="mt-5">
        <EmergencyButton phone={session.emergency_phone} doctorPhone={session.doctor_phone} />
      </div>

      {card && card.allergies.length > 0 && (
        <p className="mt-3 rounded-2xl border border-sos/25 bg-sos-soft/70 px-4 py-3 text-sm font-semibold text-sos">
          Allergie: {card.allergies.join(", ")}
          {card.avoid ? ` · ${card.avoid}` : ""}
        </p>
      )}

      {critical.length > 0 && (
        <section className="mt-4 rounded-2xl border border-sos/30 bg-sos-soft/50 p-4">
          <p className="text-xs font-bold uppercase tracking-wide text-sos">Critici adesso</p>
          <ul className="mt-2 space-y-1">
            {critical.slice(0, 3).map((c) => (
              <li key={c.id} className="text-sm font-semibold text-ink">
                · {c.title}
              </li>
            ))}
          </ul>
          <Link href="/oggi" className="mt-3 inline-flex text-sm font-bold text-pine">
            Apri priorità →
          </Link>
        </section>
      )}

      {step === 1 && (
        <section className="mt-6 space-y-4 animate-fade-up">
          {latestHandoff && (
            <div className="rounded-3xl border border-pine/15 bg-white/80 p-4">
              <div className="flex items-center gap-2 text-pine">
                <ClipboardList className="h-4 w-4" />
                <p className="text-xs font-bold uppercase tracking-wide">Cosa ti lasciano</p>
              </div>
              <p className="mt-2 text-sm leading-relaxed text-ink">{latestHandoff.summary}</p>
              {latestHandoff.open_alerts && (
                <p className="mt-2 text-sm font-semibold text-alert">{latestHandoff.open_alerts}</p>
              )}
            </div>
          )}
          <Link href="/scheda" className="flex items-center justify-between rounded-2xl border border-line bg-white/70 px-4 py-3 text-sm font-semibold text-pine">
            Leggi scheda di {session.patient_name} prima di iniziare
            <span>→</span>
          </Link>
          <button data-touch className="cr-btn cr-btn-primary w-full" onClick={startShift}>
            {openPunch ? "Continua il turno" : "Inizia turno (timbra entrata)"}
          </button>
          {openPunch && (
            <button data-touch className="cr-btn cr-btn-secondary w-full" onClick={() => setStep(2)}>
              Vai alle cure
            </button>
          )}
        </section>
      )}

      {step === 2 && (
        <section className="mt-6 space-y-4 animate-fade-up">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-xl font-semibold">Cure e farmaci</h2>
            <Link href="/oggi#farmaci" className="text-sm font-bold text-pine">
              Dosi ({openMeds} aperte) →
            </Link>
          </div>
          <ul className="space-y-3">
            {checklist.map((item) => (
              <li key={item.id}>
                <button
                  data-touch
                  onClick={() => {
                    demo.toggleChecklistItem(item.id, session.id);
                    bump();
                  }}
                  className={cn(
                    "flex w-full items-center gap-3 rounded-2xl border p-3 text-left",
                    item.done ? "border-ok/25 bg-ok-soft/80" : "border-line bg-white/80"
                  )}
                >
                  <span
                    className={cn(
                      "flex h-12 w-12 items-center justify-center rounded-xl border-2",
                      item.done ? "border-ok bg-ok text-white" : "border-line bg-white text-transparent"
                    )}
                  >
                    <Check className="h-6 w-6" strokeWidth={3} />
                  </span>
                  <span>
                    <span className="block font-semibold text-ink">{item.title}</span>
                    <span className="text-sm text-muted">{item.time_hint}</span>
                  </span>
                </button>
              </li>
            ))}
          </ul>
          <button
            data-touch
            className="cr-btn cr-btn-primary w-full"
            onClick={() => {
              setHandoff(buildHandoffDraft(session.care_group_id));
              setStep(3);
            }}
          >
            Avanti: benessere e consegne
          </button>
        </section>
      )}

      {step === 3 && (
        <section className="mt-6 space-y-4 animate-fade-up">
          <div className="rounded-3xl border border-line bg-white/80 p-4">
            <h2 className="font-display text-xl font-semibold">Benessere + pressione</h2>
            <div className="mt-3 grid grid-cols-2 gap-2">
              {moods.map((m) => (
                <button
                  key={m.id}
                  data-touch
                  onClick={() => setMood(m.id)}
                  className={cn(
                    "min-h-12 rounded-xl border text-sm font-bold",
                    mood === m.id ? "border-pine bg-mist text-pine" : "border-line text-muted"
                  )}
                >
                  {m.label}
                </button>
              ))}
            </div>
            <div className="mt-3 space-y-2">
              <ToggleRow label="Pasti ok" value={meals} onChange={setMeals} />
              <ToggleRow label="Idratazione ok" value={hydration} onChange={setHydration} />
              <ToggleRow label="Sonno ok" value={sleep} onChange={setSleep} />
            </div>
            <div className="mt-3 grid grid-cols-2 gap-2">
              <input className="cr-input" type="number" value={sys} onChange={(e) => setSys(e.target.value)} placeholder="Sistolica" />
              <input className="cr-input" type="number" value={dia} onChange={(e) => setDia(e.target.value)} placeholder="Diastolica" />
            </div>
          </div>

          <div className="rounded-3xl border border-line bg-white/80 p-4">
            <h2 className="font-display text-xl font-semibold">Consegne (bozza automatica)</h2>
            <p className="mt-1 text-sm text-muted">Generata da cure, dosi e scorte. Modificala se serve, poi pubblica.</p>
            <textarea className="cr-textarea mt-3" value={handoff} onChange={(e) => setHandoff(e.target.value)} rows={5} />
            <input
              className="cr-input mt-3"
              placeholder="Alert aperti per chi arriva"
              value={alerts}
              onChange={(e) => setAlerts(e.target.value)}
            />
            <button
              data-touch
              className="cr-btn cr-btn-secondary mt-3 w-full"
              onClick={() => setHandoff(buildHandoffDraft(session.care_group_id))}
            >
              Rigenera bozza
            </button>
          </div>

          <button data-touch className="cr-btn cr-btn-primary w-full" onClick={finishShift}>
            Chiudi turno (salva tutto + esci)
          </button>
        </section>
      )}

      {step === 4 && (
        <section className="mt-6 space-y-4 animate-fade-up text-center">
          <div className="rounded-3xl border border-ok/30 bg-ok-soft/70 p-6">
            <Check className="mx-auto h-10 w-10 text-ok" />
            <h2 className="mt-3 font-display text-2xl font-semibold text-ink">Turno chiuso</h2>
            <p className="mt-2 text-sm text-muted">
              Vitali, benessere e consegne salvati. La famiglia può ricevere il briefing aggiornato.
            </p>
          </div>
          <button data-touch className="cr-btn cr-btn-primary w-full" onClick={copyBriefing}>
            <Copy className="h-4 w-4" />
            {copied ? "Briefing copiato" : "Copia briefing per WhatsApp"}
          </button>
          <button
            data-touch
            className="cr-btn cr-btn-secondary w-full"
            onClick={() => {
              setStep(1);
              setHandoff("");
              setAlerts("");
            }}
          >
            Nuovo turno
          </button>
        </section>
      )}
    </div>
  );
}

function ToggleRow({
  label,
  value,
  onChange,
}: {
  label: string;
  value: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <button
      type="button"
      data-touch
      onClick={() => onChange(!value)}
      className="flex min-h-12 w-full items-center justify-between rounded-xl border border-line px-4"
    >
      <span className="font-semibold">{label}</span>
      <span className={cn("text-sm font-bold", value ? "text-ok" : "text-muted")}>{value ? "Sì" : "No"}</span>
    </button>
  );
}
