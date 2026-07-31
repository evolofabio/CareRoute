"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  AlertCircle,
  Check,
  Clock,
  Mic,
  PlusCircle,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { formatTime, formatTodayLabel } from "@/lib/utils/dates";
import type { DailyTask, MedStatus, PatientAlertStatus } from "@/types/database";
import * as demo from "@/lib/demo/store";
import { motion, AnimatePresence } from "framer-motion";

function urgencyOf(task: DailyTask) {
  if (task.status === "completed" || task.status === "skipped") return "done" as const;
  const diff = +new Date(task.scheduledFor) - Date.now();
  if (diff < -15 * 60_000) return "overdue" as const;
  if (diff <= 45 * 60_000) return "soon" as const;
  return "later" as const;
}

export function DailyFeedDashboard({
  careGroupId,
  patientName,
  currentUserId,
}: {
  careGroupId: string;
  patientName: string;
  currentUserId: string;
}) {
  const [tick, setTick] = useState(0);
  const tasks = useMemo(() => {
    void tick;
    return demo.getDailyTasks(careGroupId);
  }, [careGroupId, tick]);
  const patientStatus = useMemo(() => {
    void tick;
    return demo.getLatestStatus(careGroupId);
  }, [careGroupId, tick]);
  const [noteOpen, setNoteOpen] = useState(false);

  const grouped = useMemo(() => groupByTimeSlot(tasks), [tasks]);
  const progress = useMemo(() => computeProgress(tasks), [tasks]);
  const nextUp = tasks.filter((t) => t.status !== "completed" && t.status !== "skipped").slice(0, 2);

  const refresh = () => setTick((n) => n + 1);

  return (
    <div className="pb-28">
      <header className="sticky top-0 z-10 border-b border-line/70 bg-fog/85 px-5 pb-4 pt-6 backdrop-blur-md">
        <p className="text-sm font-medium capitalize text-muted">Oggi, {formatTodayLabel()}</p>
        <div className="mt-1 flex items-center justify-between gap-3">
          <h1 className="font-display text-2xl font-semibold text-ink">{patientName}</h1>
          <PatientStatusBadge status={patientStatus?.status ?? "ok"} />
        </div>

        <div className="mt-4">
          <div className="flex items-center justify-between text-xs font-semibold text-muted">
            <span>Attività completate</span>
            <span>
              {progress.done}/{progress.total}
            </span>
          </div>
          <div className="mt-1.5 h-2.5 w-full overflow-hidden rounded-full bg-sand">
            <motion.div
              className="h-full rounded-full bg-leaf"
              initial={false}
              animate={{ width: `${progress.percent}%` }}
              transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            />
          </div>
        </div>

        {nextUp.length > 0 && (
          <div className="mt-4 rounded-2xl border border-alert/20 bg-alert-soft/70 px-3 py-2.5">
            <p className="text-xs font-bold uppercase tracking-wide text-alert">Prossime dosi</p>
            <ul className="mt-1 space-y-1">
              {nextUp.map((t) => {
                const u = urgencyOf(t);
                return (
                  <li key={t.logId} className="flex items-center justify-between text-sm font-medium text-ink">
                    <span>
                      {t.medicationName} · {formatTime(t.scheduledFor)}
                    </span>
                    <span
                      className={cn(
                        "text-xs font-bold",
                        u === "overdue" && "text-sos",
                        u === "soon" && "text-alert",
                        u === "later" && "text-muted"
                      )}
                    >
                      {u === "overdue" ? "In ritardo" : u === "soon" ? "A breve" : "In programma"}
                    </span>
                  </li>
                );
              })}
            </ul>
          </div>
        )}

        <div className="mt-4 flex gap-2 overflow-x-auto pb-1">
          <Link href="/scheda" className="shrink-0 rounded-full border border-line bg-white/80 px-3 py-1.5 text-xs font-bold text-pine">
            Scheda
          </Link>
          <Link href="/cerchio" className="shrink-0 rounded-full border border-line bg-white/80 px-3 py-1.5 text-xs font-bold text-pine">
            Cerchio
          </Link>
          <Link href="/spese" className="shrink-0 rounded-full border border-line bg-white/80 px-3 py-1.5 text-xs font-bold text-pine">
            Spese
          </Link>
          <Link href="/gestione" className="shrink-0 rounded-full border border-line bg-white/80 px-3 py-1.5 text-xs font-bold text-pine">
            Vitali
          </Link>
        </div>
      </header>

      <main className="space-y-6 px-5 pt-5">
        {grouped.length === 0 && (
          <div className="mt-12 flex flex-col items-center gap-3 text-center">
            <Clock className="h-10 w-10 text-sand" />
            <p className="text-sm text-muted">Nessuna attività programmata per oggi.</p>
          </div>
        )}

        {grouped.map((slot) => (
          <section key={slot.label} className="animate-fade-up">
            <h2 className="mb-2 text-sm font-bold uppercase tracking-wide text-muted">{slot.label}</h2>
            <ul className="space-y-3">
              {slot.tasks.map((task) => (
                <TaskTimelineItem
                  key={task.logId}
                  task={task}
                  onToggle={(nextStatus) => {
                    demo.toggleTask(task.logId, nextStatus, currentUserId);
                    refresh();
                  }}
                />
              ))}
            </ul>
          </section>
        ))}
      </main>

      <div className="fixed inset-x-0 bottom-[4.5rem] z-20 mx-auto max-w-md px-4">
        <button
          onClick={() => setNoteOpen(true)}
          data-touch
          className="cr-btn cr-btn-primary w-full shadow-[var(--shadow)]"
        >
          <Mic className="h-5 w-5" />
          Aggiungi nota o segnalazione
        </button>
      </div>

      <AnimatePresence>
        {noteOpen && (
          <QuickNoteSheet
            careGroupId={careGroupId}
            currentUserId={currentUserId}
            onClose={() => setNoteOpen(false)}
            onSaved={refresh}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

function PatientStatusBadge({ status }: { status: PatientAlertStatus }) {
  const isOk = status === "ok";
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-bold",
        isOk ? "bg-ok-soft text-ok" : "bg-alert-soft text-alert"
      )}
    >
      {isOk ? <Check className="h-3.5 w-3.5" /> : <AlertCircle className="h-3.5 w-3.5" />}
      {isOk ? "Tutto ok" : "Segnalazione"}
    </span>
  );
}

function TaskTimelineItem({
  task,
  onToggle,
}: {
  task: DailyTask;
  onToggle: (nextStatus: MedStatus) => void;
}) {
  const isDone = task.status === "completed";
  const isSkipped = task.status === "skipped";
  const urgency = urgencyOf(task);

  return (
    <li
      className={cn(
        "flex items-center gap-3 rounded-2xl border p-3 transition-colors",
        isDone && "border-ok/25 bg-ok-soft/80",
        isSkipped && "border-line bg-sand/50",
        !isDone && !isSkipped && urgency === "overdue" && "border-sos/30 bg-sos-soft/60",
        !isDone && !isSkipped && urgency === "soon" && "border-alert/25 bg-alert-soft/50",
        !isDone && !isSkipped && urgency === "later" && "border-line bg-white/80"
      )}
    >
      <button
        aria-label={isDone ? "Segna come da fare" : "Segna come completato"}
        data-touch
        onClick={() => onToggle(isDone ? "missed" : "completed")}
        className={cn(
          "flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border-2 transition-all active:scale-95",
          isDone
            ? "animate-check-pop border-ok bg-ok text-white"
            : "border-line bg-white text-transparent"
        )}
      >
        <Check className="h-6 w-6" strokeWidth={3} />
      </button>

      <div className="min-w-0 flex-1">
        <p className={cn("truncate text-base font-semibold text-ink", isDone && "text-ok line-through decoration-ok/40")}>
          {task.medicationName}
        </p>
        <p className="text-sm text-muted">
          {task.dosage} · ore {formatTime(task.scheduledFor)}
        </p>
        {task.instructions && <p className="mt-0.5 truncate text-xs text-muted/80">{task.instructions}</p>}
        {isDone && task.takenByName && (
          <p className="mt-0.5 text-xs font-semibold text-ok">Somministrato da {task.takenByName}</p>
        )}
      </div>

      {!isDone && (
        <button
          aria-label="Segna come saltato"
          data-touch
          onClick={() => onToggle("skipped")}
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-muted active:bg-sand"
        >
          <X className="h-5 w-5" />
        </button>
      )}
    </li>
  );
}

function QuickNoteSheet({
  careGroupId,
  currentUserId,
  onClose,
  onSaved,
}: {
  careGroupId: string;
  currentUserId: string;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [note, setNote] = useState("");
  const [flagAlert, setFlagAlert] = useState(false);
  const [pending, setPending] = useState(false);

  const handleSubmit = () => {
    if (!note.trim()) return;
    setPending(true);
    demo.reportStatus({
      careGroupId,
      status: flagAlert ? "segnalazione" : "ok",
      note: note.trim(),
      userId: currentUserId,
    });
    setPending(false);
    onSaved();
    onClose();
  };

  return (
    <motion.div
      className="fixed inset-0 z-40 flex items-end bg-ink/40"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <motion.div
        className="w-full max-w-md rounded-t-3xl bg-white p-5 pb-[max(1.5rem,env(safe-area-inset-bottom))] shadow-2xl mx-auto"
        initial={{ y: 40 }}
        animate={{ y: 0 }}
        exit={{ y: 40 }}
        transition={{ type: "spring", stiffness: 380, damping: 32 }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mx-auto mb-4 h-1.5 w-12 rounded-full bg-sand" />
        <h3 className="font-display text-xl font-semibold text-ink">Nuova nota</h3>
        <p className="mb-4 text-sm text-muted">
          Scrivi cosa è successo oggi. La famiglia la vedrà subito nel feed.
        </p>
        <textarea
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="Es. Ha mangiato bene a pranzo, umore tranquillo..."
          rows={4}
          className="cr-textarea"
        />
        <button
          onClick={() => setFlagAlert((v) => !v)}
          data-touch
          className={cn(
            "mt-3 flex h-12 w-full items-center justify-center gap-2 rounded-xl border-2 text-sm font-bold transition",
            flagAlert ? "border-alert bg-alert-soft text-alert" : "border-line text-muted"
          )}
        >
          <AlertCircle className="h-4 w-4" />
          {flagAlert ? "Attenzione richiesta" : "Segnala attenzione richiesta"}
        </button>
        <div className="mt-5 flex gap-3">
          <button onClick={onClose} data-touch className="cr-btn cr-btn-secondary flex-1">
            Annulla
          </button>
          <button
            onClick={handleSubmit}
            disabled={!note.trim() || pending}
            data-touch
            className="cr-btn cr-btn-primary flex-1"
          >
            <PlusCircle className="h-5 w-5" />
            {pending ? "Invio..." : "Invia"}
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

function groupByTimeSlot(tasks: DailyTask[]) {
  const buckets: Record<string, DailyTask[]> = { Mattina: [], Pomeriggio: [], Sera: [] };
  for (const task of tasks) {
    const hour = new Date(task.scheduledFor).getHours();
    if (hour < 12) buckets.Mattina.push(task);
    else if (hour < 18) buckets.Pomeriggio.push(task);
    else buckets.Sera.push(task);
  }
  return Object.entries(buckets)
    .filter(([, list]) => list.length > 0)
    .map(([label, list]) => ({ label, tasks: list }));
}

function computeProgress(tasks: DailyTask[]) {
  const total = tasks.length;
  const done = tasks.filter((t) => t.status === "completed").length;
  const percent = total === 0 ? 0 : Math.round((done / total) * 100);
  return { total, done, percent };
}
