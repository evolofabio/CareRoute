import type {
  Appointment,
  CareChecklistItem,
  CareGroup,
  CareShift,
  DailyTask,
  DemoState,
  DocumentRecord,
  DocumentShare,
  Expense,
  GroupMember,
  HandoffSummary,
  Medication,
  MedicationLog,
  MedStatus,
  PatientAlertStatus,
  PatientStatusUpdate,
  SessionUser,
  SupplyItem,
  UserProfile,
  WellbeingCheckin,
} from "@/types/database";
import { uid } from "@/lib/utils";
import { slotToIso, todayIsoDate } from "@/lib/utils/dates";

const STORAGE_KEY = "careroute.demo.v2";

function hoursFromNow(h: number) {
  const d = new Date();
  d.setHours(d.getHours() + h, 0, 0, 0);
  return d.toISOString();
}

function buildSeed(): DemoState {
  const now = new Date().toISOString();
  const today = todayIsoDate();

  const maria: UserProfile = {
    id: "user_maria",
    email: "maria@famiglia.it",
    full_name: "Maria Bianchi",
    avatar_url: null,
    phone: "+39 333 111 2233",
    created_at: now,
  };
  const luca: UserProfile = {
    id: "user_luca",
    email: "luca@famiglia.it",
    full_name: "Luca Bianchi",
    avatar_url: null,
    phone: "+39 333 444 5566",
    created_at: now,
  };
  const anna: UserProfile = {
    id: "user_anna",
    email: "anna.operatrice@care.it",
    full_name: "Anna Rossi",
    avatar_url: null,
    phone: "+39 340 778 8990",
    created_at: now,
  };

  const group: CareGroup = {
    id: "group_nonna",
    patient_name: "Nonna Elena",
    patient_code: "ELENA42",
    avatar_url: null,
    emergency_phone: "+39 118",
    doctor_phone: "+39 02 555 0199",
    notes: "Ipertensione controllata. Preferisce acqua a temperatura ambiente.",
    created_by: maria.id,
    created_at: now,
  };

  const members: GroupMember[] = [
    { user_id: maria.id, care_group_id: group.id, role: "admin", invited_by: null, joined_at: now, user: maria },
    { user_id: luca.id, care_group_id: group.id, role: "member", invited_by: maria.id, joined_at: now, user: luca },
    { user_id: anna.id, care_group_id: group.id, role: "caregiver", invited_by: maria.id, joined_at: now, user: anna },
  ];

  const medications: Medication[] = [
    {
      id: "med_cardio",
      care_group_id: group.id,
      name: "Cardioaspirina",
      dosage: "1 compressa",
      time_of_day: ["08:00"],
      instructions: "Dopo colazione, con acqua",
      active: true,
      created_by: maria.id,
      created_at: now,
    },
    {
      id: "med_press",
      care_group_id: group.id,
      name: "Ramipril 5mg",
      dosage: "1 compressa",
      time_of_day: ["08:00", "20:00"],
      instructions: "Monitorare pressione se vertigini",
      active: true,
      created_by: maria.id,
      created_at: now,
    },
    {
      id: "med_vitd",
      care_group_id: group.id,
      name: "Vitamina D",
      dosage: "5 gocce",
      time_of_day: ["13:00"],
      instructions: "Durante il pranzo",
      active: true,
      created_by: maria.id,
      created_at: now,
    },
  ];

  const logs: MedicationLog[] = medications.flatMap((med) =>
    med.time_of_day.map((slot) => {
      const scheduled = slotToIso(slot);
      const hour = Number(slot.split(":")[0]);
      const past = hour < new Date().getHours();
      return {
        id: uid("log"),
        medication_id: med.id,
        care_group_id: group.id,
        scheduled_for: scheduled,
        taken_at: past && med.id === "med_cardio" ? new Date().toISOString() : null,
        taken_by_user_id: past && med.id === "med_cardio" ? anna.id : null,
        status: (past && med.id === "med_cardio" ? "completed" : past ? "missed" : "missed") as MedStatus,
        notes: null,
        created_at: now,
      };
    })
  );

  const statusUpdates: PatientStatusUpdate[] = [
    {
      id: uid("status"),
      care_group_id: group.id,
      status: "ok",
      note: "Ha dormito bene. Colazione completa, umore sereno.",
      audio_url: null,
      created_by: anna.id,
      created_at: hoursFromNow(-2),
      author_name: anna.full_name,
    },
  ];

  const expenses: Expense[] = [
    {
      id: uid("exp"),
      care_group_id: group.id,
      paid_by_user_id: maria.id,
      amount: 48.9,
      category: "farmaci",
      description: "Ritiro ricetta mensile",
      receipt_url: null,
      status: "pending",
      date: today,
      created_at: now,
      paid_by_name: maria.full_name,
    },
    {
      id: uid("exp"),
      care_group_id: group.id,
      paid_by_user_id: luca.id,
      amount: 120,
      category: "badante",
      description: "Acconto settimana Anna",
      receipt_url: null,
      status: "pending",
      date: today,
      created_at: now,
      paid_by_name: luca.full_name,
    },
    {
      id: uid("exp"),
      care_group_id: group.id,
      paid_by_user_id: maria.id,
      amount: 35,
      category: "trasporti",
      description: "Taxi visita cardiologo",
      receipt_url: null,
      status: "settled",
      date: today,
      created_at: hoursFromNow(-48),
      paid_by_name: maria.full_name,
    },
  ];

  const documents: DocumentRecord[] = [
    {
      id: "doc_ecg",
      care_group_id: group.id,
      title: "Referto ECG marzo",
      category: "medical",
      file_url: "/demo/ecg-marzo.pdf",
      mime_type: "application/pdf",
      file_size: 240000,
      uploaded_by: maria.id,
      created_at: hoursFromNow(-72),
      uploader_name: maria.full_name,
    },
    {
      id: "doc_cf",
      care_group_id: group.id,
      title: "Tessera sanitaria (scan)",
      category: "legal",
      file_url: "/demo/tessera.pdf",
      mime_type: "application/pdf",
      file_size: 120000,
      uploaded_by: luca.id,
      created_at: hoursFromNow(-120),
      uploader_name: luca.full_name,
    },
  ];

  const shares: DocumentShare[] = [];

  const checklist: CareChecklistItem[] = [
    {
      id: uid("chk"),
      care_group_id: group.id,
      title: "Igiene mattutina",
      kind: "igiene",
      time_hint: "Mattina",
      done: true,
      done_at: hoursFromNow(-3),
      done_by: anna.id,
      date: today,
    },
    {
      id: uid("chk"),
      care_group_id: group.id,
      title: "Colazione completa",
      kind: "pasto",
      time_hint: "Mattina",
      done: true,
      done_at: hoursFromNow(-2),
      done_by: anna.id,
      date: today,
    },
    {
      id: uid("chk"),
      care_group_id: group.id,
      title: "Bicchiere d'acqua ogni 2 ore",
      kind: "idratazione",
      time_hint: "Tutto il giorno",
      done: false,
      done_at: null,
      done_by: null,
      date: today,
    },
    {
      id: uid("chk"),
      care_group_id: group.id,
      title: "Passeggiata breve in casa",
      kind: "mobilita",
      time_hint: "Pomeriggio",
      done: false,
      done_at: null,
      done_by: null,
      date: today,
    },
  ];

  const wellbeing: WellbeingCheckin[] = [
    {
      id: uid("wb"),
      care_group_id: group.id,
      date: today,
      mood: "sereno",
      meals_ok: true,
      hydration_ok: true,
      sleep_ok: true,
      note: "Mattina tranquilla",
      created_by: anna.id,
      created_at: hoursFromNow(-2),
      author_name: anna.full_name,
    },
  ];

  const appointments: Appointment[] = [
    {
      id: uid("apt"),
      care_group_id: group.id,
      title: "Controllo cardiologico",
      kind: "visita",
      location: "Poliambulatorio Verdi",
      starts_at: hoursFromNow(28),
      notes: "Portare ultimo ECG e lista farmaci",
      created_by: maria.id,
      created_at: now,
    },
    {
      id: uid("apt"),
      care_group_id: group.id,
      title: "Esami del sangue",
      kind: "esame",
      location: "Lab. Centro Salute",
      starts_at: hoursFromNow(96),
      notes: "Digiuno dalla mezzanotte",
      created_by: maria.id,
      created_at: now,
    },
  ];

  const handoffs: HandoffSummary[] = [
    {
      id: uid("hand"),
      care_group_id: group.id,
      shift_label: "Mattina → Pomeriggio",
      summary:
        "Farmaci del mattino ok. Ha mangiato bene. Pressione 128/78. Preferisce restare in salotto.",
      open_alerts: "Ricordare vitamina D a pranzo",
      created_by: anna.id,
      created_at: hoursFromNow(-1),
      author_name: anna.full_name,
    },
  ];

  const supplies: SupplyItem[] = [
    {
      id: uid("sup"),
      care_group_id: group.id,
      name: "Ramipril 5mg",
      kind: "farmaco",
      quantity: 12,
      unit: "compresse",
      min_quantity: 10,
      expires_on: null,
      notes: "Rinnovare ricetta questa settimana",
      updated_at: now,
    },
    {
      id: uid("sup"),
      care_group_id: group.id,
      name: "Pannoloni notte",
      kind: "presidio",
      quantity: 8,
      unit: "pz",
      min_quantity: 15,
      expires_on: null,
      notes: null,
      updated_at: now,
    },
    {
      id: uid("sup"),
      care_group_id: group.id,
      name: "Crema idratante",
      kind: "igiene",
      quantity: 1,
      unit: "tubo",
      min_quantity: 1,
      expires_on: "2027-03-01",
      notes: null,
      updated_at: now,
    },
  ];

  const shifts: CareShift[] = [
    {
      id: uid("shift"),
      care_group_id: group.id,
      user_id: anna.id,
      user_name: anna.full_name,
      label: "Mattina",
      starts_at: slotToIso("08:00"),
      ends_at: slotToIso("14:00"),
      notes: "Focus igiene e farmaci mattutini",
    },
    {
      id: uid("shift"),
      care_group_id: group.id,
      user_id: maria.id,
      user_name: maria.full_name,
      label: "Pomeriggio famiglia",
      starts_at: slotToIso("14:00"),
      ends_at: slotToIso("20:00"),
      notes: "Compagnia e cena",
    },
  ];

  return {
    users: [maria, luca, anna],
    group,
    members,
    medications,
    logs,
    statusUpdates,
    expenses,
    documents,
    shares,
    checklist,
    wellbeing,
    appointments,
    handoffs,
    supplies,
    shifts,
    session: null,
  };
}

function readState(): DemoState {
  if (typeof window === "undefined") return buildSeed();
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      const seed = buildSeed();
      localStorage.setItem(STORAGE_KEY, JSON.stringify(seed));
      return seed;
    }
    return JSON.parse(raw) as DemoState;
  } catch {
    const seed = buildSeed();
    localStorage.setItem(STORAGE_KEY, JSON.stringify(seed));
    return seed;
  }
}

function writeState(state: DemoState) {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  window.dispatchEvent(new Event("careroute:demo-update"));
}

export function resetDemo() {
  const seed = buildSeed();
  writeState(seed);
  return seed;
}

export function getDemoState() {
  return readState();
}

export function startDemoSession(role: "admin" | "member" | "caregiver", largeTargets = false): SessionUser {
  const state = readState();
  const member = state.members.find((m) => m.role === role) ?? state.members[0];
  const user = state.users.find((u) => u.id === member.user_id)!;
  const session: SessionUser = {
    id: user.id,
    email: user.email,
    full_name: user.full_name,
    phone: user.phone,
    role: member.role,
    care_group_id: state.group.id,
    patient_name: state.group.patient_name,
    patient_code: state.group.patient_code,
    emergency_phone: state.group.emergency_phone,
    doctor_phone: state.group.doctor_phone,
    isDemo: true,
    largeTargets,
  };
  writeState({ ...state, session });
  return session;
}

export function endDemoSession() {
  const state = readState();
  writeState({ ...state, session: null });
}

export function getSession(): SessionUser | null {
  return readState().session;
}

export function updateSessionPrefs(patch: Partial<Pick<SessionUser, "largeTargets">>) {
  const state = readState();
  if (!state.session) return null;
  const session = { ...state.session, ...patch };
  writeState({ ...state, session });
  return session;
}

export function getDailyTasks(careGroupId: string): DailyTask[] {
  const state = readState();
  const start = new Date();
  start.setHours(0, 0, 0, 0);
  const end = new Date();
  end.setHours(23, 59, 59, 999);

  return state.logs
    .filter(
      (l) =>
        l.care_group_id === careGroupId &&
        new Date(l.scheduled_for) >= start &&
        new Date(l.scheduled_for) <= end
    )
    .map((l) => {
      const med = state.medications.find((m) => m.id === l.medication_id);
      const taker = state.users.find((u) => u.id === l.taken_by_user_id);
      return {
        logId: l.id,
        medicationId: l.medication_id,
        medicationName: med?.name ?? "Farmaco",
        dosage: med?.dosage ?? "",
        instructions: med?.instructions ?? null,
        scheduledFor: l.scheduled_for,
        status: l.status,
        takenByName: taker?.full_name ?? null,
      };
    })
    .sort((a, b) => +new Date(a.scheduledFor) - +new Date(b.scheduledFor));
}

export function toggleTask(logId: string, nextStatus: MedStatus, userId: string) {
  const state = readState();
  state.logs = state.logs.map((l) =>
    l.id === logId
      ? {
          ...l,
          status: nextStatus,
          taken_at: nextStatus === "completed" ? new Date().toISOString() : null,
          taken_by_user_id: nextStatus === "completed" ? userId : null,
        }
      : l
  );
  writeState(state);
}

export function reportStatus(input: {
  careGroupId: string;
  status: PatientAlertStatus;
  note: string;
  userId: string;
}) {
  const state = readState();
  const author = state.users.find((u) => u.id === input.userId);
  const row: PatientStatusUpdate = {
    id: uid("status"),
    care_group_id: input.careGroupId,
    status: input.status,
    note: input.note,
    audio_url: null,
    created_by: input.userId,
    created_at: new Date().toISOString(),
    author_name: author?.full_name,
  };
  state.statusUpdates = [row, ...state.statusUpdates];
  writeState(state);
  return row;
}

export function getLatestStatus(careGroupId: string) {
  return (
    readState().statusUpdates.find((s) => s.care_group_id === careGroupId) ?? null
  );
}

export function getStatusFeed(careGroupId: string) {
  return readState().statusUpdates.filter((s) => s.care_group_id === careGroupId);
}

export function getExpenses(careGroupId: string) {
  return readState().expenses.filter((e) => e.care_group_id === careGroupId);
}

export function addExpense(input: Omit<Expense, "id" | "created_at" | "paid_by_name" | "receipt_url" | "status"> & { status?: Expense["status"] }) {
  const state = readState();
  const payer = state.users.find((u) => u.id === input.paid_by_user_id);
  const row: Expense = {
    ...input,
    id: uid("exp"),
    receipt_url: null,
    status: input.status ?? "pending",
    created_at: new Date().toISOString(),
    paid_by_name: payer?.full_name,
  };
  state.expenses = [row, ...state.expenses];
  writeState(state);
  return row;
}

export function settleExpenses(careGroupId: string) {
  const state = readState();
  state.expenses = state.expenses.map((e) =>
    e.care_group_id === careGroupId && e.status === "pending" ? { ...e, status: "settled" } : e
  );
  writeState(state);
}

export function getExpenseBalances(careGroupId: string) {
  const expenses = getExpenses(careGroupId).filter((e) => e.status === "pending");
  const byUser = new Map<string, { userId: string; name: string; amount: number }>();
  for (const e of expenses) {
    const cur = byUser.get(e.paid_by_user_id) ?? {
      userId: e.paid_by_user_id,
      name: e.paid_by_name ?? "Membro",
      amount: 0,
    };
    cur.amount += e.amount;
    byUser.set(e.paid_by_user_id, cur);
  }
  const rows = [...byUser.values()];
  const total = rows.reduce((s, r) => s + r.amount, 0);
  const fairShare = rows.length ? total / rows.length : 0;
  return rows.map((r) => ({
    ...r,
    fairShare,
    balance: r.amount - fairShare,
  }));
}

export function getDocuments(careGroupId: string) {
  return readState().documents.filter((d) => d.care_group_id === careGroupId);
}

export function addDocument(input: {
  careGroupId: string;
  title: string;
  category: DocumentRecord["category"];
  userId: string;
}) {
  const state = readState();
  const author = state.users.find((u) => u.id === input.userId);
  const row: DocumentRecord = {
    id: uid("doc"),
    care_group_id: input.careGroupId,
    title: input.title,
    category: input.category,
    file_url: `/demo/${uid("file")}.pdf`,
    mime_type: "application/pdf",
    file_size: 100000,
    uploaded_by: input.userId,
    created_at: new Date().toISOString(),
    uploader_name: author?.full_name,
  };
  state.documents = [row, ...state.documents];
  writeState(state);
  return row;
}

export function createShare(documentId: string, userId: string, hours = 24) {
  const state = readState();
  const expires = new Date();
  expires.setHours(expires.getHours() + hours);
  const row: DocumentShare = {
    id: uid("share"),
    document_id: documentId,
    token: uid("tok").replace(/_/g, ""),
    created_by: userId,
    expires_at: expires.toISOString(),
    max_views: 5,
    view_count: 0,
    created_at: new Date().toISOString(),
  };
  state.shares = [row, ...state.shares];
  writeState(state);
  return row;
}

export function getShareByToken(token: string) {
  const state = readState();
  const share = state.shares.find((s) => s.token === token);
  if (!share) return null;
  const doc = state.documents.find((d) => d.id === share.document_id);
  return { share, document: doc ?? null };
}

export function getMedications(careGroupId: string) {
  return readState().medications.filter((m) => m.care_group_id === careGroupId);
}

export function addMedication(input: {
  careGroupId: string;
  name: string;
  dosage: string;
  time_of_day: string[];
  instructions?: string;
  userId: string;
}) {
  const state = readState();
  const med: Medication = {
    id: uid("med"),
    care_group_id: input.careGroupId,
    name: input.name,
    dosage: input.dosage,
    time_of_day: input.time_of_day,
    instructions: input.instructions ?? null,
    active: true,
    created_by: input.userId,
    created_at: new Date().toISOString(),
  };
  state.medications = [med, ...state.medications];
  for (const slot of med.time_of_day) {
    state.logs.push({
      id: uid("log"),
      medication_id: med.id,
      care_group_id: med.care_group_id,
      scheduled_for: slotToIso(slot),
      taken_at: null,
      taken_by_user_id: null,
      status: "missed",
      notes: null,
      created_at: new Date().toISOString(),
    });
  }
  writeState(state);
  return med;
}

export function getMembers(careGroupId: string) {
  return readState().members.filter((m) => m.care_group_id === careGroupId);
}

export function getChecklist(careGroupId: string) {
  const today = todayIsoDate();
  return readState().checklist.filter((c) => c.care_group_id === careGroupId && c.date === today);
}

export function toggleChecklistItem(id: string, userId: string) {
  const state = readState();
  state.checklist = state.checklist.map((c) =>
    c.id === id
      ? {
          ...c,
          done: !c.done,
          done_at: !c.done ? new Date().toISOString() : null,
          done_by: !c.done ? userId : null,
        }
      : c
  );
  writeState(state);
}

export function getWellbeing(careGroupId: string) {
  return readState().wellbeing.filter((w) => w.care_group_id === careGroupId);
}

export function saveWellbeing(input: Omit<WellbeingCheckin, "id" | "created_at" | "author_name">) {
  const state = readState();
  const author = state.users.find((u) => u.id === input.created_by);
  const row: WellbeingCheckin = {
    ...input,
    id: uid("wb"),
    created_at: new Date().toISOString(),
    author_name: author?.full_name,
  };
  state.wellbeing = [row, ...state.wellbeing.filter((w) => !(w.care_group_id === input.care_group_id && w.date === input.date))];
  writeState(state);
  return row;
}

export function getAppointments(careGroupId: string) {
  return readState()
    .appointments.filter((a) => a.care_group_id === careGroupId)
    .sort((a, b) => +new Date(a.starts_at) - +new Date(b.starts_at));
}

export function addAppointment(input: Omit<Appointment, "id" | "created_at">) {
  const state = readState();
  const row: Appointment = { ...input, id: uid("apt"), created_at: new Date().toISOString() };
  state.appointments = [row, ...state.appointments];
  writeState(state);
  return row;
}

export function getHandoffs(careGroupId: string) {
  return readState().handoffs.filter((h) => h.care_group_id === careGroupId);
}

export function addHandoff(input: {
  careGroupId: string;
  shift_label: string;
  summary: string;
  open_alerts?: string;
  userId: string;
}) {
  const state = readState();
  const author = state.users.find((u) => u.id === input.userId);
  const row: HandoffSummary = {
    id: uid("hand"),
    care_group_id: input.careGroupId,
    shift_label: input.shift_label,
    summary: input.summary,
    open_alerts: input.open_alerts ?? null,
    created_by: input.userId,
    created_at: new Date().toISOString(),
    author_name: author?.full_name,
  };
  state.handoffs = [row, ...state.handoffs];
  writeState(state);
  return row;
}

export function joinByCode(code: string, role: SessionUser["role"] = "member") {
  const state = readState();
  if (code.trim().toUpperCase() !== state.group.patient_code) {
    throw new Error("Codice invito non valido");
  }
  return startDemoSession(role === "caregiver" ? "caregiver" : role === "admin" ? "admin" : "member");
}

export function getSupplies(careGroupId: string) {
  return readState()
    .supplies.filter((s) => s.care_group_id === careGroupId)
    .sort((a, b) => a.name.localeCompare(b.name, "it"));
}

export function addSupply(input: Omit<SupplyItem, "id" | "updated_at">) {
  const state = readState();
  const row: SupplyItem = {
    ...input,
    id: uid("sup"),
    updated_at: new Date().toISOString(),
  };
  state.supplies = [row, ...state.supplies];
  writeState(state);
  return row;
}

export function adjustSupplyQuantity(id: string, delta: number) {
  const state = readState();
  state.supplies = state.supplies.map((s) =>
    s.id === id
      ? {
          ...s,
          quantity: Math.max(0, s.quantity + delta),
          updated_at: new Date().toISOString(),
        }
      : s
  );
  writeState(state);
}

export function getLowSupplies(careGroupId: string) {
  return getSupplies(careGroupId).filter((s) => s.quantity <= s.min_quantity);
}

export function getShifts(careGroupId: string) {
  return readState()
    .shifts.filter((s) => s.care_group_id === careGroupId)
    .sort((a, b) => +new Date(a.starts_at) - +new Date(b.starts_at));
}

export function addShift(input: Omit<CareShift, "id" | "user_name"> & { user_name?: string }) {
  const state = readState();
  const user = state.users.find((u) => u.id === input.user_id);
  const row: CareShift = {
    ...input,
    id: uid("shift"),
    user_name: input.user_name ?? user?.full_name,
  };
  state.shifts = [row, ...state.shifts];
  writeState(state);
  return row;
}
