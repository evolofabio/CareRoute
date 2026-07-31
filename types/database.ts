export type GroupRole = "admin" | "member" | "caregiver";
export type MedStatus = "completed" | "skipped" | "missed";
export type PatientAlertStatus = "ok" | "segnalazione";
export type ExpenseStatus = "pending" | "settled";
export type ExpenseCategory =
  | "farmaci"
  | "visite_mediche"
  | "badante"
  | "trasporti"
  | "casa"
  | "alimentari"
  | "altro";
export type DocumentCategory = "medical" | "legal" | "financial" | "other";
export type MoodLevel = "sereno" | "cosi_cosi" | "agitato" | "giu";
export type CareTaskKind =
  | "igiene"
  | "pasto"
  | "idratazione"
  | "mobilita"
  | "compagnia"
  | "altro";
export type AppointmentKind = "visita" | "esame" | "terapia" | "altro";

export interface UserProfile {
  id: string;
  email: string;
  full_name: string;
  avatar_url: string | null;
  phone: string | null;
  created_at: string;
}

export interface CareGroup {
  id: string;
  patient_name: string;
  patient_code: string;
  avatar_url: string | null;
  emergency_phone: string | null;
  doctor_phone: string | null;
  notes: string | null;
  created_by: string;
  created_at: string;
}

export interface GroupMember {
  user_id: string;
  care_group_id: string;
  role: GroupRole;
  invited_by: string | null;
  joined_at: string;
  user?: UserProfile;
}

export interface Medication {
  id: string;
  care_group_id: string;
  name: string;
  dosage: string;
  time_of_day: string[];
  instructions: string | null;
  active: boolean;
  created_by: string;
  created_at: string;
}

export interface MedicationLog {
  id: string;
  medication_id: string;
  care_group_id: string;
  scheduled_for: string;
  taken_at: string | null;
  taken_by_user_id: string | null;
  status: MedStatus;
  notes: string | null;
  created_at: string;
}

export interface PatientStatusUpdate {
  id: string;
  care_group_id: string;
  status: PatientAlertStatus;
  note: string | null;
  audio_url: string | null;
  created_by: string;
  created_at: string;
  author_name?: string;
}

export interface Expense {
  id: string;
  care_group_id: string;
  paid_by_user_id: string;
  amount: number;
  category: ExpenseCategory;
  description: string | null;
  receipt_url: string | null;
  status: ExpenseStatus;
  date: string;
  created_at: string;
  paid_by_name?: string;
}

export interface DocumentRecord {
  id: string;
  care_group_id: string;
  title: string;
  category: DocumentCategory;
  file_url: string;
  mime_type: string | null;
  file_size: number | null;
  uploaded_by: string;
  created_at: string;
  uploader_name?: string;
}

export interface DocumentShare {
  id: string;
  document_id: string;
  token: string;
  created_by: string;
  expires_at: string;
  max_views: number;
  view_count: number;
  created_at: string;
}

export interface DailyTask {
  logId: string;
  medicationId: string;
  medicationName: string;
  dosage: string;
  instructions: string | null;
  scheduledFor: string;
  status: MedStatus;
  takenByName: string | null;
}

export interface CareChecklistItem {
  id: string;
  care_group_id: string;
  title: string;
  kind: CareTaskKind;
  time_hint: string | null;
  done: boolean;
  done_at: string | null;
  done_by: string | null;
  date: string;
}

export interface WellbeingCheckin {
  id: string;
  care_group_id: string;
  date: string;
  mood: MoodLevel;
  meals_ok: boolean;
  hydration_ok: boolean;
  sleep_ok: boolean;
  note: string | null;
  created_by: string;
  created_at: string;
  author_name?: string;
}

export interface Appointment {
  id: string;
  care_group_id: string;
  title: string;
  kind: AppointmentKind;
  location: string | null;
  starts_at: string;
  notes: string | null;
  created_by: string;
  created_at: string;
}

export interface HandoffSummary {
  id: string;
  care_group_id: string;
  shift_label: string;
  summary: string;
  open_alerts: string | null;
  created_by: string;
  created_at: string;
  author_name?: string;
}

export type SupplyKind = "farmaco" | "presidio" | "igiene" | "altro";
export type TaskStatus = "open" | "done" | "cancelled";
export type HelpKind = "pasto" | "trasporto" | "farmacia" | "compagnia" | "spesa" | "altro";
export type HelpStatus = "open" | "claimed" | "done";

export interface SupplyItem {
  id: string;
  care_group_id: string;
  name: string;
  kind: SupplyKind;
  quantity: number;
  unit: string;
  min_quantity: number;
  expires_on: string | null;
  notes: string | null;
  updated_at: string;
}

export interface CareShift {
  id: string;
  care_group_id: string;
  user_id: string;
  user_name?: string;
  label: string;
  starts_at: string;
  ends_at: string;
  notes: string | null;
}

/** Scheda del caro — info essenziali per chi arriva in sostituzione (Famirelay/Cerchi pattern). */
export interface PatientCareCard {
  care_group_id: string;
  birth_year: number | null;
  conditions: string[];
  allergies: string[];
  blood_type: string | null;
  diet_notes: string | null;
  preferences: string | null;
  avoid: string | null;
  mobility_notes: string | null;
  gp_name: string | null;
  pharmacy_name: string | null;
  pharmacy_phone: string | null;
  updated_at: string;
}

/** Compiti familiari assegnabili — equità tra fratelli (CircleCare pattern). */
export interface FamilyTask {
  id: string;
  care_group_id: string;
  title: string;
  description: string | null;
  assigned_to: string | null;
  assigned_name?: string | null;
  due_date: string | null;
  status: TaskStatus;
  created_by: string;
  created_at: string;
  completed_at: string | null;
  completed_by: string | null;
}

/** Richieste di aiuto claimable — pasti, passaggi, farmacia (Lotsa/ianacare pattern). */
export interface HelpRequest {
  id: string;
  care_group_id: string;
  title: string;
  kind: HelpKind;
  when_label: string;
  notes: string | null;
  status: HelpStatus;
  created_by: string;
  claimed_by: string | null;
  claimed_name?: string | null;
  created_at: string;
}

/** Parametri vitali semplici — pressione, peso, temperatura, dolore. */
export interface VitalReading {
  id: string;
  care_group_id: string;
  recorded_at: string;
  systolic: number | null;
  diastolic: number | null;
  weight_kg: number | null;
  temperature_c: number | null;
  pain_level: number | null;
  note: string | null;
  created_by: string;
  author_name?: string;
}

/** Timbratura presenza operatore — ore assistenza (Seremy pattern). */
export interface ShiftPunch {
  id: string;
  care_group_id: string;
  user_id: string;
  user_name?: string;
  punched_in_at: string;
  punched_out_at: string | null;
  note: string | null;
}

export interface SessionUser {
  id: string;
  email: string;
  full_name: string;
  phone: string | null;
  role: GroupRole;
  care_group_id: string;
  patient_name: string;
  patient_code: string;
  emergency_phone: string | null;
  doctor_phone: string | null;
  isDemo: boolean;
  largeTargets: boolean;
}

export interface DemoState {
  users: UserProfile[];
  group: CareGroup;
  members: GroupMember[];
  medications: Medication[];
  logs: MedicationLog[];
  statusUpdates: PatientStatusUpdate[];
  expenses: Expense[];
  documents: DocumentRecord[];
  shares: DocumentShare[];
  checklist: CareChecklistItem[];
  wellbeing: WellbeingCheckin[];
  appointments: Appointment[];
  handoffs: HandoffSummary[];
  supplies: SupplyItem[];
  shifts: CareShift[];
  careCard: PatientCareCard;
  familyTasks: FamilyTask[];
  helpRequests: HelpRequest[];
  vitals: VitalReading[];
  punches: ShiftPunch[];
  session: SessionUser | null;
}
