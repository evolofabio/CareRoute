"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Check, ClipboardList } from "lucide-react";
import { EmergencyButton } from "@/components/caregiver/EmergencyButton";
import { CareRouteLogo } from "@/components/shared/CareRouteLogo";
import { useDemo } from "@/lib/demo/DemoProvider";
import * as demo from "@/lib/demo/store";
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
  const [mood, setMood] = useState<MoodLevel>("sereno");
  const [meals, setMeals] = useState(true);
  const [hydration, setHydration] = useState(true);
  const [sleep, setSleep] = useState(true);
  const [handoff, setHandoff] = useState("");
  const [alerts, setAlerts] = useState("");

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

  if (!session) return null;

  const openMeds = tasks.filter((t) => t.status !== "completed" && t.status !== "skipped").length;
  const doneCare = checklist.filter((c) => c.done).length;

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
        <h1 className="mt-1 font-display text-3xl font-semibold text-ink">Turno con {session.patient_name}</h1>
        <p className="mt-2 text-sm text-muted">
          Checklist a una mano · {doneCare}/{checklist.length} cure · {openMeds} dosi aperte
        </p>
      </header>

      <div className="mt-5 animate-fade-up" style={{ animationDelay: "60ms" }}>
        <EmergencyButton phone={session.emergency_phone} doctorPhone={session.doctor_phone} />
      </div>

      {latestHandoff && (
        <section className="mt-6 rounded-3xl border border-pine/15 bg-white/80 p-4 animate-fade-up">
          <div className="flex items-center gap-2 text-pine">
            <ClipboardList className="h-4 w-4" />
            <p className="text-xs font-bold uppercase tracking-wide">Ultimo passaggio consegne</p>
          </div>
          <p className="mt-2 text-sm font-semibold text-ink">{latestHandoff.shift_label}</p>
          <p className="mt-1 text-sm leading-relaxed text-muted">{latestHandoff.summary}</p>
          {latestHandoff.open_alerts && (
            <p className="mt-2 text-sm font-semibold text-alert">{latestHandoff.open_alerts}</p>
          )}
        </section>
      )}

      <section className="mt-6">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-xl font-semibold">Cure di oggi</h2>
          <Link href="/oggi" className="text-sm font-bold text-pine">
            Farmaci →
          </Link>
        </div>
        <ul className="mt-3 space-y-3">
          {checklist.map((item) => (
            <li key={item.id}>
              <button
                data-touch
                onClick={() => {
                  demo.toggleChecklistItem(item.id, session.id);
                  setTick((n) => n + 1);
                }}
                className={cn(
                  "flex w-full items-center gap-3 rounded-2xl border p-3 text-left transition",
                  item.done ? "border-ok/25 bg-ok-soft/80" : "border-line bg-white/80"
                )}
              >
                <span
                  className={cn(
                    "flex h-12 w-12 items-center justify-center rounded-xl border-2",
                    item.done ? "animate-check-pop border-ok bg-ok text-white" : "border-line bg-white text-transparent"
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
      </section>

      <section className="mt-8 rounded-3xl border border-line bg-white/80 p-4">
        <h2 className="font-display text-xl font-semibold">Check-in benessere</h2>
        <p className="mt-1 text-sm text-muted">Umore, pasti, idratazione, sonno — in pochi tocchi.</p>
        <div className="mt-4 grid grid-cols-2 gap-2">
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
        <div className="mt-4 space-y-2">
          <ToggleRow label="Pasti ok" value={meals} onChange={setMeals} />
          <ToggleRow label="Idratazione ok" value={hydration} onChange={setHydration} />
          <ToggleRow label="Sonno ok" value={sleep} onChange={setSleep} />
        </div>
        <button
          data-touch
          className="cr-btn cr-btn-primary mt-4 w-full"
          onClick={() => {
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
            setTick((n) => n + 1);
          }}
        >
          Salva check-in
        </button>
      </section>

      <section className="mt-8 rounded-3xl border border-line bg-white/80 p-4">
        <h2 className="font-display text-xl font-semibold">Passaggio consegne</h2>
        <textarea
          className="cr-textarea mt-3"
          placeholder="Cosa deve sapere chi arriva dopo di te..."
          value={handoff}
          onChange={(e) => setHandoff(e.target.value)}
        />
        <input
          className="cr-input mt-3"
          placeholder="Alert aperti (opzionale)"
          value={alerts}
          onChange={(e) => setAlerts(e.target.value)}
        />
        <button
          data-touch
          className="cr-btn cr-btn-secondary mt-4 w-full"
          disabled={!handoff.trim()}
          onClick={() => {
            demo.addHandoff({
              careGroupId: session.care_group_id,
              shift_label: "Turno corrente",
              summary: handoff.trim(),
              open_alerts: alerts.trim() || undefined,
              userId: session.id,
            });
            setHandoff("");
            setAlerts("");
            setTick((n) => n + 1);
          }}
        >
          Pubblica consegne
        </button>
      </section>

      <Link href="/oggi" className="cr-btn cr-btn-primary mt-8 w-full">
        Apri checklist farmaci
      </Link>
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
