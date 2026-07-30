// components/daily-feed/DailyFeedDashboard.tsx
'use client';

import { useMemo, useState } from 'react';
import { Check, AlertCircle, Clock, X, Mic, PlusCircle } from 'lucide-react';
import { useDailyTasks, usePatientStatus, useToggleTask, useReportPatientStatus } from '@/lib/query/hooks/useDailyFeed';
import type { DailyTask, MedStatus } from '@/types/database';
import { cn } from '@/lib/utils';

interface DailyFeedDashboardProps {
  careGroupId: string;
  patientName: string;
  currentUserId: string;
}

/**
 * Dashboard "Oggi" — modulo 1.
 * Timeline dei farmaci/attività della giornata con caselle di spunta grandi
 * (touch-target >= 48px) e feedback visivo verde immediato, più indicatore
 * di stato dell'assistito ("Tutto ok" / "Segnalazione presente").
 */
export default function DailyFeedDashboard({
  careGroupId,
  patientName,
  currentUserId,
}: DailyFeedDashboardProps) {
  const { data: tasks, isLoading, isError } = useDailyTasks(careGroupId);
  const { data: patientStatus } = usePatientStatus(careGroupId);
  const toggleTask = useToggleTask(careGroupId);
  const [noteOpen, setNoteOpen] = useState(false);

  const grouped = useMemo(() => groupByTimeSlot(tasks ?? []), [tasks]);
  const progress = useMemo(() => computeProgress(tasks ?? []), [tasks]);

  return (
    <div className="mx-auto flex min-h-dvh max-w-md flex-col bg-slate-50 pb-28">
      {/* Header */}
      <header className="sticky top-0 z-10 border-b border-slate-200 bg-white/95 px-5 pb-4 pt-6 backdrop-blur">
        <p className="text-sm font-medium text-slate-500">Oggi, {formatTodayLabel()}</p>
        <div className="mt-1 flex items-center justify-between">
          <h1 className="text-xl font-bold text-slate-900">{patientName}</h1>
          <PatientStatusBadge status={patientStatus?.status ?? 'ok'} />
        </div>

        {/* Barra progresso giornata */}
        <div className="mt-4">
          <div className="flex items-center justify-between text-xs font-medium text-slate-500">
            <span>Attività completate</span>
            <span>{progress.done}/{progress.total}</span>
          </div>
          <div className="mt-1.5 h-2.5 w-full overflow-hidden rounded-full bg-slate-200">
            <div
              className="h-full rounded-full bg-emerald-500 transition-all duration-500 ease-out"
              style={{ width: `${progress.percent}%` }}
            />
          </div>
        </div>
      </header>

      {/* Contenuto */}
      <main className="flex-1 px-5 pt-5">
        {isLoading && <TimelineSkeleton />}

        {isError && (
          <div className="mt-8 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            Impossibile caricare le attività di oggi. Se sei offline, verranno mostrati i dati
            salvati localmente non appena disponibili.
          </div>
        )}

        {!isLoading && !isError && grouped.length === 0 && (
          <div className="mt-16 flex flex-col items-center gap-3 text-center">
            <Clock className="h-10 w-10 text-slate-300" />
            <p className="text-sm text-slate-500">
              Nessuna attività programmata per oggi in questo gruppo di assistenza.
            </p>
          </div>
        )}

        <div className="space-y-6">
          {grouped.map((slot) => (
            <section key={slot.label}>
              <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-slate-400">
                {slot.label}
              </h2>
              <ul className="space-y-3">
                {slot.tasks.map((task) => (
                  <TaskTimelineItem
                    key={task.logId}
                    task={task}
                    onToggle={(nextStatus) =>
                      toggleTask.mutate({
                        logId: task.logId,
                        careGroupId,
                        nextStatus,
                        userId: currentUserId,
                      })
                    }
                  />
                ))}
              </ul>
            </section>
          ))}
        </div>
      </main>

      {/* Azione rapida: nota / segnalazione (barra fissa, raggiungibile con un pollice) */}
      <div className="fixed inset-x-0 bottom-0 mx-auto max-w-md border-t border-slate-200 bg-white p-4 pb-[max(1rem,env(safe-area-inset-bottom))]">
        <button
          onClick={() => setNoteOpen(true)}
          className="flex h-14 w-full items-center justify-center gap-2 rounded-2xl bg-slate-900 text-base font-semibold text-white shadow-sm transition active:scale-[0.98]"
        >
          <Mic className="h-5 w-5" />
          Aggiungi nota o segnalazione
        </button>
      </div>

      {noteOpen && (
        <QuickNoteSheet
          careGroupId={careGroupId}
          currentUserId={currentUserId}
          onClose={() => setNoteOpen(false)}
        />
      )}
    </div>
  );
}

// ----------------------------------------------------------------------------
// Sottocomponenti
// ----------------------------------------------------------------------------

function PatientStatusBadge({ status }: { status: 'ok' | 'segnalazione' }) {
  const isOk = status === 'ok';
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold',
        isOk ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-800'
      )}
    >
      {isOk ? <Check className="h-3.5 w-3.5" /> : <AlertCircle className="h-3.5 w-3.5" />}
      {isOk ? 'Tutto ok' : 'Segnalazione presente'}
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
  const isDone = task.status === 'completed';
  const isSkipped = task.status === 'skipped';

  return (
    <li
      className={cn(
        'flex items-center gap-3 rounded-2xl border p-3 transition-colors',
        isDone
          ? 'border-emerald-200 bg-emerald-50'
          : isSkipped
          ? 'border-slate-200 bg-slate-100'
          : 'border-slate-200 bg-white'
      )}
    >
      {/* Checkbox grande: min 48x48px per touch-target */}
      <button
        aria-label={isDone ? 'Segna come da fare' : 'Segna come completato'}
        onClick={() => onToggle(isDone ? 'missed' : 'completed')}
        className={cn(
          'flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border-2 transition-all active:scale-95',
          isDone
            ? 'border-emerald-500 bg-emerald-500 text-white'
            : 'border-slate-300 bg-white text-transparent'
        )}
      >
        <Check className="h-6 w-6" strokeWidth={3} />
      </button>

      <div className="min-w-0 flex-1">
        <p
          className={cn(
            'truncate text-base font-semibold text-slate-900',
            isDone && 'text-emerald-800 line-through decoration-emerald-400'
          )}
        >
          {task.medicationName}
        </p>
        <p className="text-sm text-slate-500">
          {task.dosage} · ore {formatTime(task.scheduledFor)}
        </p>
        {task.instructions && (
          <p className="mt-0.5 truncate text-xs text-slate-400">{task.instructions}</p>
        )}
        {isDone && task.takenByName && (
          <p className="mt-0.5 text-xs font-medium text-emerald-600">
            Somministrato da {task.takenByName}
          </p>
        )}
      </div>

      {/* Azione secondaria: salta */}
      {!isDone && (
        <button
          aria-label="Segna come saltato"
          onClick={() => onToggle('skipped')}
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-slate-400 active:bg-slate-100"
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
}: {
  careGroupId: string;
  currentUserId: string;
  onClose: () => void;
}) {
  const [note, setNote] = useState('');
  const [flagAlert, setFlagAlert] = useState(false);
  const reportStatus = useReportPatientStatus(careGroupId);

  const handleSubmit = () => {
    if (!note.trim()) return;
    reportStatus.mutate(
      {
        careGroupId,
        status: flagAlert ? 'segnalazione' : 'ok',
        note: note.trim(),
        userId: currentUserId,
      },
      { onSuccess: onClose }
    );
  };

  return (
    <div className="fixed inset-0 z-20 flex items-end bg-black/40" onClick={onClose}>
      <div
        className="w-full rounded-t-3xl bg-white p-5 pb-[max(1.5rem,env(safe-area-inset-bottom))]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mx-auto mb-4 h-1.5 w-12 rounded-full bg-slate-200" />
        <h3 className="text-lg font-bold text-slate-900">Nuova nota</h3>
        <p className="mb-4 text-sm text-slate-500">
          Scrivi cosa è successo oggi con {`l'assistito`}. La famiglia la vedrà subito.
        </p>

        <textarea
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="Es. Ha mangiato bene a pranzo, umore tranquillo..."
          rows={4}
          className="w-full rounded-2xl border border-slate-200 bg-slate-50 p-4 text-base text-slate-900 outline-none focus:border-slate-400"
        />

        <button
          onClick={() => setFlagAlert((v) => !v)}
          className={cn(
            'mt-3 flex h-12 w-full items-center justify-center gap-2 rounded-xl border-2 text-sm font-semibold transition',
            flagAlert
              ? 'border-amber-400 bg-amber-50 text-amber-800'
              : 'border-slate-200 text-slate-500'
          )}
        >
          <AlertCircle className="h-4 w-4" />
          {flagAlert ? 'Segnalata come attenzione richiesta' : 'Segnala come attenzione richiesta'}
        </button>

        <div className="mt-5 flex gap-3">
          <button
            onClick={onClose}
            className="h-14 flex-1 rounded-2xl bg-slate-100 text-base font-semibold text-slate-700"
          >
            Annulla
          </button>
          <button
            onClick={handleSubmit}
            disabled={!note.trim() || reportStatus.isPending}
            className="flex h-14 flex-1 items-center justify-center gap-2 rounded-2xl bg-slate-900 text-base font-semibold text-white disabled:opacity-40"
          >
            <PlusCircle className="h-5 w-5" />
            {reportStatus.isPending ? 'Invio...' : 'Invia nota'}
          </button>
        </div>
      </div>
    </div>
  );
}

function TimelineSkeleton() {
  return (
    <div className="space-y-3 pt-2">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="h-20 animate-pulse rounded-2xl bg-slate-100" />
      ))}
    </div>
  );
}

// ----------------------------------------------------------------------------
// Utility locali
// ----------------------------------------------------------------------------

function groupByTimeSlot(tasks: DailyTask[]) {
  const buckets: Record<string, DailyTask[]> = { Mattina: [], Pomeriggio: [], Sera: [] };

  for (const task of tasks) {
    const hour = new Date(task.scheduledFor).getHours();
    if (hour < 12) buckets['Mattina'].push(task);
    else if (hour < 18) buckets['Pomeriggio'].push(task);
    else buckets['Sera'].push(task);
  }

  return Object.entries(buckets)
    .filter(([, list]) => list.length > 0)
    .map(([label, list]) => ({ label, tasks: list }));
}

function computeProgress(tasks: DailyTask[]) {
  const total = tasks.length;
  const done = tasks.filter((t) => t.status === 'completed').length;
  const percent = total === 0 ? 0 : Math.round((done / total) * 100);
  return { total, done, percent };
}

function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' });
}

function formatTodayLabel() {
  return new Date().toLocaleDateString('it-IT', { weekday: 'long', day: 'numeric', month: 'long' });
}
