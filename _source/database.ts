// types/database.ts
// Sottoinsieme di tipi rilevanti per la Dashboard "Oggi".
// In produzione: sostituire/estendere con `supabase gen types typescript --linked`.

export type GroupRole = 'admin' | 'member' | 'caregiver';
export type MedStatus = 'completed' | 'skipped' | 'missed';
export type PatientAlertStatus = 'ok' | 'segnalazione';

export interface Medication {
  id: string;
  care_group_id: string;
  name: string;
  dosage: string;
  time_of_day: string[]; // es. ["08:00", "13:00", "20:00"]
  instructions: string | null;
  active: boolean;
}

export interface MedicationLog {
  id: string;
  medication_id: string;
  care_group_id: string;
  scheduled_for: string; // ISO timestamp dello slot atteso
  taken_at: string | null;
  taken_by_user_id: string | null;
  status: MedStatus;
  notes: string | null;
}

export interface PatientStatusUpdate {
  id: string;
  care_group_id: string;
  status: PatientAlertStatus;
  note: string | null;
  audio_url: string | null;
  created_by: string;
  created_at: string;
}

/** Vista "appiattita" usata dalla UI: unisce medications + medication_logs per uno slot del giorno. */
export interface DailyTask {
  logId: string;
  medicationId: string;
  medicationName: string;
  dosage: string;
  instructions: string | null;
  scheduledFor: string; // ISO
  status: MedStatus;
  takenByName: string | null;
}
