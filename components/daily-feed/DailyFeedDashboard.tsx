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
import { formatTime } from "@/lib/utils/dates";
import type { DailyTask, MedStatus } from "@/types/database";
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
  compact = false,
  onChanged,
}: {
  careGroupId: string;
  patientName: string;
  currentUserId: string;
  compact?: boolean;
  onChanged?: () => void;
}) {
  const [tick, setTick] = useState(0);
  const tasks = useMemo(() => {
    void tick;
    return demo.getDailyTasks(careGroupId);
  }, [careGroupId, tick]);
  const card = useMemo(() => {
    void tick;
    return demo.getCareCard(careGroupId);
  }, [careGroupId, tick]);
  const [noteOpen, setNoteOpen] = useState(false);
  const [skipReason, setSkipReason] = useState<{ logId: string; name: string } | null>(null);

  const grouped = useMemo(() => groupByTimeSlot(tasks), [tasks]);
  const progress = useMemo(() => computeProgress(tasks), [tasks]);

  const refresh = () => {
    setTick((n) => n + 1);
    onChanged?.();
  };

  return (
    <div className={cn(!compact && "pb-28")}>
      {!compact && (
        <header className="border-b border-line/70 px-5 pb-4 pt-2">
          <p className="text-sm font-medium text-muted">Somministrazioni · {patientName}</p>
          <div className="mt-3">
            <div className="flex items-center justify-between text-xs font-semibold text-muted">
              <span>Completate</span>
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
          {card.allergies.length > 0 && (
            <p className="mt-3 rounded-xl bg-sos-soft/80 px-3 py-2 text-xs font-semibold text-sos">
              Allergie: {card.allergies.join(", ")}
            </p>
          )}
        </header>
      )}

      <main className="space-y-6 px-5 pt-4">
        {grouped.length === 0 && (
          <div className="mt-8 flex flex-col items-center gap-3 text-center">
            <Clock className="h-10 w-10 text-sand" />
            <p className="text-sm text-muted">Nessuna attività programmata per oggi.</p>
          </div>
        )}

        {grouped.map((slot) => (
          <section key={slot.label}>
            <h2 className="mb-2 text-sm font-bold uppercase tracking-wide text-muted">{slot.label}</h2>
            <ul className="space-y-3">
              {slot.tasks.map((task) => (
                <TaskTimelineItem
                  key={task.logId}
                  task={task}
                  allergies={card.allergies}
                  onToggle={(nextStatus) => {
                    if (nextStatus === "skipped") {
                      setSkipReason({ logId: task.logId, name: task.medicationName });
                      return;
                    }
                    demo.toggleTask(task.logId, nextStatus, currentUserId);
                    if (nextStatus === "completed") {
                      demo.reportStatus({
                        careGroupId,
                        status: "ok",
                        note: `${task.medicationName} somministrata (${task.dosage}).`,
                        userId: currentUserId,
                      });
                    }
                    refresh();
                  }}
                />
              ))}
            </ul>
          </section>
        ))}
      </main>

      {!compact && (
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
      )}

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

      <AnimatePresence>
        {skipReason && (
          <SkipReasonSheet
            medicationName={skipReason.name}
            onClose={() => setSkipReason(null)}
            onConfirm={(reason) => {
              demo.toggleTask(skipReason.logId, "skipped", currentUserId);
              demo.reportStatus({
                careGroupId,
                status: "segnalazione",
                note: `${skipReason.name} non somministrata: ${reason}`,
                userId: currentUserId,
              });
              setSkipReason(null);
              refresh();
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

function TaskTimelineItem({
  task,
  allergies,
  onToggle,
}: {
  task: DailyTask;
  allergies: string[];
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
          isDone ? "animate-check-pop border-ok bg-ok text-white" : "border-line bg-white text-transparent"
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
          {urgency === "overdue" && !isDone && !isSkipped ? " · IN RITARDO" : ""}
        </p>
        {task.instructions && <p className="mt-0.5 truncate text-xs text-muted/80">{task.instructions}</p>}
        {allergies.length > 0 && !isDone && (
          <p className="mt-0.5 text-[11px] font-semibold text-sos">Verifica allergie prima di somministrare</p>
        )}
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

function SkipReasonSheet({
  medicationName,
  onClose,
  onConfirm,
}: {
  medicationName: string;
  onClose: () => void;
  onConfirm: (reason: string) => void;
}) {
  const reasons = [
    "Rifiutata dalla persona",
    "Nausea / non sta bene",
    "Dose non disponibile",
    "Istruzione del medico di sospendere",
    "Altro — da verificare con famiglia",
  ];

  return (
    <motion.div
      className="fixed inset-0 z-40 flex items-end bg-ink/40"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <motion.div
        className="mx-auto w-full max-w-md rounded-t-3xl bg-white p-5 pb-[max(1.5rem,env(safe-area-inset-bottom))]"
        initial={{ y: 40 }}
        animate={{ y: 0 }}
        exit={{ y: 40 }}
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className="font-display text-xl font-semibold">Perché saltare {medicationName}?</h3>
        <p className="mt-1 text-sm text-muted">La famiglia riceverà una segnalazione con il motivo.</p>
        <div className="mt-4 space-y-2">
          {reasons.map((r) => (
            <button
              key={r}
              data-touch
              className="cr-btn cr-btn-secondary w-full justify-start text-left"
              onClick={() => onConfirm(r)}
            >
              {r}
            </button>
          ))}
        </div>
      </motion.div>
    </motion.div>
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

  return (
    <motion.div
      className="fixed inset-0 z-40 flex items-end bg-ink/40"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <motion.div
        className="mx-auto w-full max-w-md rounded-t-3xl bg-white p-5 pb-[max(1.5rem,env(safe-area-inset-bottom))]"
        initial={{ y: 40 }}
        animate={{ y: 0 }}
        exit={{ y: 40 }}
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className="font-display text-xl font-semibold text-ink">Nuova nota</h3>
        <textarea
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="Cosa è successo — concreto e utile a chi arriva dopo"
          rows={4}
          className="cr-textarea mt-3"
        />
        <button
          onClick={() => setFlagAlert((v) => !v)}
          data-touch
          className={cn(
            "mt-3 flex h-12 w-full items-center justify-center gap-2 rounded-xl border-2 text-sm font-bold",
            flagAlert ? "border-alert bg-alert-soft text-alert" : "border-line text-muted"
          )}
        >
          <AlertCircle className="h-4 w-4" />
          {flagAlert ? "Attenzione richiesta" : "Segnala attenzione"}
        </button>
        <div className="mt-5 flex gap-3">
          <button onClick={onClose} data-touch className="cr-btn cr-btn-secondary flex-1">
            Annulla
          </button>
          <button
            onClick={() => {
              if (!note.trim()) return;
              demo.reportStatus({
                careGroupId,
                status: flagAlert ? "segnalazione" : "ok",
                note: note.trim(),
                userId: currentUserId,
              });
              onSaved();
              onClose();
            }}
            disabled={!note.trim()}
            data-touch
            className="cr-btn cr-btn-primary flex-1"
          >
            <PlusCircle className="h-5 w-5" />
            Invia
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
