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
  session: SessionUser | null;
}
