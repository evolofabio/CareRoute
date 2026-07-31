"use client";

import { useMemo, useState } from "react";
import { Check, HandHelping, ListTodo, Scale, UserPlus } from "lucide-react";
import { useDemo } from "@/lib/demo/DemoProvider";
import * as demo from "@/lib/demo/store";
import { cn } from "@/lib/utils";
import { formatCurrency } from "@/lib/utils/formatCurrency";
import { todayIsoDate } from "@/lib/utils/dates";
import type { HelpKind } from "@/types/database";
import { canManageMedications } from "@/lib/utils/rbac";
import { PageIntro } from "@/components/shared/PageIntro";

const HELP_LABELS: Record<HelpKind, string> = {
  pasto: "Pasto",
  trasporto: "Trasporto",
  farmacia: "Farmacia",
  compagnia: "Compagnia",
  spesa: "Spesa",
  altro: "Altro",
};

export default function CerchioPage() {
  const { session, refresh } = useDemo();
  const [tick, setTick] = useState(0);
  const [tab, setTab] = useState<"compiti" | "aiuto" | "equita">("compiti");
  const [taskTitle, setTaskTitle] = useState("");
  const [helpTitle, setHelpTitle] = useState("");
  const [helpKind, setHelpKind] = useState<HelpKind>("trasporto");
  const [helpWhen, setHelpWhen] = useState("");

  const tasks = useMemo(() => {
    void tick;
    return session ? demo.getFamilyTasks(session.care_group_id) : [];
  }, [session, tick]);
  const helps = useMemo(() => {
    void tick;
    return session ? demo.getHelpRequests(session.care_group_id) : [];
  }, [session, tick]);
  const stats = useMemo(() => {
    void tick;
    return session ? demo.getContributionStats(session.care_group_id) : [];
  }, [session, tick]);
  const members = useMemo(() => {
    void tick;
    return session ? demo.getMembers(session.care_group_id) : [];
  }, [session, tick]);

  if (!session) return null;
  const canCreate = canManageMedications(session.role);
  const bump = () => {
    setTick((n) => n + 1);
    refresh();
  };

  return (
    <div className="px-5 pb-28">
      <header className="animate-fade-up">
        <PageIntro
          eyebrow="Cerchio di cura"
          title="Compiti e aiuto"
          description="Dividi il carico in modo visibile: compiti assegnati, richieste claimable ed equità tra familiari — così nessuno resta solo."
        />
      </header>

      <div className="mt-5 grid grid-cols-3 gap-2 rounded-2xl border border-line/70 bg-white/50 p-1">
        {(
          [
            ["compiti", "Compiti", ListTodo],
            ["aiuto", "Aiuto", HandHelping],
            ["equita", "Equità", Scale],
          ] as const
        ).map(([id, label, Icon]) => (
          <button
            key={id}
            data-touch
            onClick={() => setTab(id)}
            className={cn(
              "flex min-h-11 items-center justify-center gap-1.5 rounded-xl text-xs font-bold transition",
              tab === id ? "bg-pine text-white" : "text-muted"
            )}
          >
            <Icon className="h-3.5 w-3.5" />
            {label}
          </button>
        ))}
      </div>

      {tab === "compiti" && (
        <section className="mt-6 space-y-3 animate-fade-up">
          {tasks.map((t) => (
            <article
              key={t.id}
              className={cn(
                "rounded-2xl border p-4",
                t.status === "done" ? "border-ok/25 bg-ok-soft/50" : "border-line/70 bg-white/65"
              )}
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className={cn("font-semibold text-ink", t.status === "done" && "line-through opacity-70")}>
                    {t.title}
                  </p>
                  {t.description && <p className="mt-1 text-sm text-muted">{t.description}</p>}
                  <p className="mt-2 text-xs font-medium text-muted">
                    {t.assigned_name ? `Assegnato a ${t.assigned_name}` : "Non assegnato"}
                    {t.due_date ? ` · entro ${t.due_date}` : ""}
                  </p>
                </div>
                {t.status === "open" && (
                  <div className="flex flex-col gap-2">
                    {!t.assigned_to && (
                      <button
                        data-touch
                        className="flex h-11 w-11 items-center justify-center rounded-xl border border-line bg-white"
                        aria-label="Prendi in carico"
                        onClick={() => {
                          demo.claimFamilyTask(t.id, session.id);
                          bump();
                        }}
                      >
                        <UserPlus className="h-4 w-4 text-pine" />
                      </button>
                    )}
                    <button
                      data-touch
                      className="flex h-11 w-11 items-center justify-center rounded-xl bg-pine text-white"
                      aria-label="Completa"
                      onClick={() => {
                        demo.completeFamilyTask(t.id, session.id);
                        bump();
                      }}
                    >
                      <Check className="h-4 w-4" />
                    </button>
                  </div>
                )}
              </div>
            </article>
          ))}

          {canCreate && (
            <form
              className="space-y-3 rounded-2xl border border-dashed border-line bg-white/40 p-4"
              onSubmit={(e) => {
                e.preventDefault();
                if (!taskTitle.trim()) return;
                demo.addFamilyTask({
                  careGroupId: session.care_group_id,
                  title: taskTitle.trim(),
                  dueDate: todayIsoDate(),
                  userId: session.id,
                  assignedTo: members.find((m) => m.role !== "caregiver")?.user_id ?? session.id,
                });
                setTaskTitle("");
                bump();
              }}
            >
              <p className="text-sm font-semibold text-ink">Nuovo compito</p>
              <input
                className="cr-input"
                placeholder="Es. Ritirare pannoloni"
                value={taskTitle}
                onChange={(e) => setTaskTitle(e.target.value)}
              />
              <button type="submit" className="cr-btn cr-btn-primary w-full" data-touch>
                Aggiungi compito
              </button>
            </form>
          )}
        </section>
      )}

      {tab === "aiuto" && (
        <section className="mt-6 space-y-3 animate-fade-up">
          {helps.map((h) => (
            <article key={h.id} className="rounded-2xl border border-line/70 bg-white/65 p-4">
              <div className="flex items-center justify-between gap-2">
                <span className="rounded-full bg-mist px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide text-pine">
                  {HELP_LABELS[h.kind]}
                </span>
                <span className="text-xs font-semibold text-muted">
                  {h.status === "open" ? "Aperto" : h.status === "claimed" ? "Preso" : "Fatto"}
                </span>
              </div>
              <p className="mt-2 font-semibold text-ink">{h.title}</p>
              <p className="mt-1 text-sm text-muted">{h.when_label}</p>
              {h.notes && <p className="mt-1 text-sm text-muted">{h.notes}</p>}
              {h.claimed_name && (
                <p className="mt-2 text-xs font-bold text-pine">Ci pensa {h.claimed_name}</p>
              )}
              <div className="mt-3 flex gap-2">
                {h.status === "open" && (
                  <button
                    data-touch
                    className="cr-btn cr-btn-primary flex-1"
                    onClick={() => {
                      demo.claimHelpRequest(h.id, session.id);
                      bump();
                    }}
                  >
                    Ci penso io
                  </button>
                )}
                {h.status === "claimed" && h.claimed_by === session.id && (
                  <button
                    data-touch
                    className="cr-btn cr-btn-secondary flex-1"
                    onClick={() => {
                      demo.completeHelpRequest(h.id);
                      bump();
                    }}
                  >
                    Segna come fatto
                  </button>
                )}
              </div>
            </article>
          ))}

          {canCreate && (
            <form
              className="space-y-3 rounded-2xl border border-dashed border-line bg-white/40 p-4"
              onSubmit={(e) => {
                e.preventDefault();
                if (!helpTitle.trim() || !helpWhen.trim()) return;
                demo.addHelpRequest({
                  careGroupId: session.care_group_id,
                  title: helpTitle.trim(),
                  kind: helpKind,
                  whenLabel: helpWhen.trim(),
                  userId: session.id,
                });
                setHelpTitle("");
                setHelpWhen("");
                bump();
              }}
            >
              <p className="text-sm font-semibold text-ink">Chiedi aiuto al cerchio</p>
              <input
                className="cr-input"
                placeholder="Cosa serve?"
                value={helpTitle}
                onChange={(e) => setHelpTitle(e.target.value)}
              />
              <select
                className="cr-select"
                value={helpKind}
                onChange={(e) => setHelpKind(e.target.value as HelpKind)}
              >
                {Object.entries(HELP_LABELS).map(([k, label]) => (
                  <option key={k} value={k}>
                    {label}
                  </option>
                ))}
              </select>
              <input
                className="cr-input"
                placeholder="Quando (es. Sabato 11:00)"
                value={helpWhen}
                onChange={(e) => setHelpWhen(e.target.value)}
              />
              <button type="submit" className="cr-btn cr-btn-primary w-full" data-touch>
                Pubblica richiesta
              </button>
            </form>
          )}
        </section>
      )}

      {tab === "equita" && (
        <section className="mt-6 space-y-3 animate-fade-up">
          <p className="text-sm text-muted">
            Una vista semplice del carico: compiti completati, aiuti presi in carico e spese anticipate.
            Non è una gara — è trasparenza per evitare risentimenti.
          </p>
          {stats.map((s, i) => (
            <article key={s.userId} className="rounded-2xl border border-line/70 bg-white/65 p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-semibold text-ink">
                    {i === 0 ? "★ " : ""}
                    {s.name}
                  </p>
                  <p className="text-xs font-medium uppercase tracking-wide text-muted">{s.role}</p>
                </div>
                <span className="rounded-full bg-mist px-3 py-1 text-sm font-bold text-pine">
                  {s.score} pt
                </span>
              </div>
              <dl className="mt-3 grid grid-cols-3 gap-2 text-center text-xs">
                <div className="rounded-xl bg-fog px-2 py-2">
                  <dt className="text-muted">Compiti</dt>
                  <dd className="mt-0.5 text-base font-bold text-ink">{s.tasksDone}</dd>
                </div>
                <div className="rounded-xl bg-fog px-2 py-2">
                  <dt className="text-muted">Aiuti</dt>
                  <dd className="mt-0.5 text-base font-bold text-ink">{s.helpsClaimed}</dd>
                </div>
                <div className="rounded-xl bg-fog px-2 py-2">
                  <dt className="text-muted">Spese</dt>
                  <dd className="mt-0.5 text-sm font-bold text-ink">{formatCurrency(s.expenseTotal)}</dd>
                </div>
              </dl>
            </article>
          ))}
        </section>
      )}
    </div>
  );
}
