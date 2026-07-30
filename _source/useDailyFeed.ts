// lib/query/hooks/useDailyFeed.ts
'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { createClient } from '@/lib/supabase/client';
import type { DailyTask, MedStatus, PatientAlertStatus, PatientStatusUpdate } from '@/types/database';

const startOfToday = () => {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
};
const endOfToday = () => {
  const d = new Date();
  d.setHours(23, 59, 59, 999);
  return d;
};

export const dailyFeedKeys = {
  tasks: (groupId: string) => ['daily-feed', 'tasks', groupId] as const,
  status: (groupId: string) => ['daily-feed', 'status', groupId] as const,
};

/**
 * Recupera i task di oggi (medication_logs joinati con medications) per un CareGroup.
 * In assenza di rete, TanStack Query serve la cache persistita (IndexedDB) — vedi query/queryClient.ts.
 */
export function useDailyTasks(careGroupId: string) {
  const supabase = createClient();

  return useQuery({
    queryKey: dailyFeedKeys.tasks(careGroupId),
    queryFn: async (): Promise<DailyTask[]> => {
      const { data, error } = await supabase
        .from('medication_logs')
        .select(
          `
          id,
          medication_id,
          status,
          taken_at,
          scheduled_for,
          medications ( name, dosage, instructions ),
          taken_by:taken_by_user_id ( full_name )
        `
        )
        .eq('care_group_id', careGroupId)
        .gte('scheduled_for', startOfToday().toISOString())
        .lte('scheduled_for', endOfToday().toISOString())
        .order('scheduled_for', { ascending: true });

      if (error) throw error;

      return (data ?? []).map((row: any): DailyTask => ({
        logId: row.id,
        medicationId: row.medication_id,
        medicationName: row.medications?.name ?? 'Farmaco',
        dosage: row.medications?.dosage ?? '',
        instructions: row.medications?.instructions ?? null,
        scheduledFor: row.scheduled_for,
        status: row.status,
        takenByName: row.taken_by?.full_name ?? null,
      }));
    },
    staleTime: 60_000,
  });
}

/** Ultimo "Stato Assistito" segnalato (ok / segnalazione). */
export function usePatientStatus(careGroupId: string) {
  const supabase = createClient();

  return useQuery({
    queryKey: dailyFeedKeys.status(careGroupId),
    queryFn: async (): Promise<PatientStatusUpdate | null> => {
      const { data, error } = await supabase
        .from('patient_status_updates')
        .select('*')
        .eq('care_group_id', careGroupId)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error) throw error;
      return data;
    },
    staleTime: 30_000,
  });
}

interface ToggleTaskInput {
  logId: string;
  careGroupId: string;
  nextStatus: MedStatus;
  userId: string;
}

/**
 * Mutazione ottimistica: lo spunto si riflette istantaneamente in UI,
 * poi sincronizza con Supabase. In offline, React Query mette la mutazione
 * in coda (persistQueryClient) e la riesegue al ripristino della rete.
 */
export function useToggleTask(careGroupId: string) {
  const supabase = createClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ logId, nextStatus, userId }: ToggleTaskInput) => {
      const { error } = await supabase
        .from('medication_logs')
        .update({
          status: nextStatus,
          taken_at: nextStatus === 'completed' ? new Date().toISOString() : null,
          taken_by_user_id: nextStatus === 'completed' ? userId : null,
        })
        .eq('id', logId);

      if (error) throw error;
    },
    onMutate: async ({ logId, nextStatus }) => {
      await queryClient.cancelQueries({ queryKey: dailyFeedKeys.tasks(careGroupId) });
      const previous = queryClient.getQueryData<DailyTask[]>(dailyFeedKeys.tasks(careGroupId));

      queryClient.setQueryData<DailyTask[]>(dailyFeedKeys.tasks(careGroupId), (old) =>
        (old ?? []).map((t) => (t.logId === logId ? { ...t, status: nextStatus } : t))
      );

      return { previous };
    },
    onError: (_err, _vars, context) => {
      if (context?.previous) {
        queryClient.setQueryData(dailyFeedKeys.tasks(careGroupId), context.previous);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: dailyFeedKeys.tasks(careGroupId) });
    },
  });
}

interface ReportStatusInput {
  careGroupId: string;
  status: PatientAlertStatus;
  note: string;
  userId: string;
}

export function useReportPatientStatus(careGroupId: string) {
  const supabase = createClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ status, note, userId }: ReportStatusInput) => {
      const { error } = await supabase.from('patient_status_updates').insert({
        care_group_id: careGroupId,
        status,
        note,
        created_by: userId,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: dailyFeedKeys.status(careGroupId) });
    },
  });
}
