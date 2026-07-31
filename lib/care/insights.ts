import type {
  DailyTask,
  HelpRequest,
  FamilyTask,
  SupplyItem,
  VitalReading,
  Appointment,
} from "@/types/database";
import * as demo from "@/lib/demo/store";
import { formatCurrency } from "@/lib/utils/formatCurrency";
import { formatShortDate, formatTime, formatTodayLabel } from "@/lib/utils/dates";

export type ActionPriority = "critical" | "high" | "medium";

export type ActionItem = {
  id: string;
  priority: ActionPriority;
  title: string;
  reason: string;
  href: string;
  cta: string;
};

export type RefillInsight = {
  supplyId: string;
  name: string;
  quantity: number;
  unit: string;
  dosesPerDay: number;
  daysLeft: number | null;
  status: "critical" | "low" | "ok";
  message: string;
};

export type VitalAlert = {
  level: "critical" | "warning" | "ok";
  label: string;
  detail: string;
};

export type WeeklyReport = {
  adherencePct: number;
  dosesDone: number;
  dosesTotal: number;
  openTasks: number;
  openHelps: number;
  lowSupplies: number;
  assistanceHours: number;
  expensePending: number;
  moodSummary: string;
  lastVital: string | null;
  nextAppointment: string | null;
};

function medUrgency(task: DailyTask) {
  if (task.status === "completed" || task.status === "skipped") return "done" as const;
  const diff = +new Date(task.scheduledFor) - Date.now();
  if (diff < -15 * 60_000) return "overdue" as const;
  if (diff <= 45 * 60_000) return "soon" as const;
  return "later" as const;
}

/** Coda operativa: risponde a "cosa devo fare adesso?" */
export function getActionQueue(careGroupId: string): ActionItem[] {
  const items: ActionItem[] = [];
  const tasks = demo.getDailyTasks(careGroupId);
  const card = demo.getCareCard(careGroupId);
  const status = demo.getLatestStatus(careGroupId);
  const helps = demo.getHelpRequests(careGroupId);
  const familyTasks = demo.getFamilyTasks(careGroupId);
  const supplies = demo.getSupplies(careGroupId);
  const appointments = demo.getAppointments(careGroupId);
  const vitals = demo.getVitals(careGroupId);
  const refills = getRefillInsights(careGroupId);

  for (const t of tasks) {
    if (medUrgency(t) === "overdue") {
      items.push({
        id: `med-overdue-${t.logId}`,
        priority: "critical",
        title: `${t.medicationName} in ritardo`,
        reason: `Prevista alle ${formatTime(t.scheduledFor)} · ${t.dosage}${t.instructions ? ` · ${t.instructions}` : ""}`,
        href: "/oggi#farmaci",
        cta: "Somministra ora",
      });
    }
  }

  if (status?.status === "segnalazione") {
    items.push({
      id: "status-alert",
      priority: "critical",
      title: "Segnalazione aperta sulla giornata",
      reason: status.note ?? "Un membro ha chiesto attenzione",
      href: "/oggi",
      cta: "Leggi nota",
    });
  }

  if (card.allergies.length > 0) {
    const overdueOrSoon = tasks.some((t) => {
      const u = medUrgency(t);
      return u === "overdue" || u === "soon";
    });
    if (overdueOrSoon) {
      items.push({
        id: "allergy-banner",
        priority: "high",
        title: `Allergie: ${card.allergies.join(", ")}`,
        reason: "Ricorda prima di qualsiasi somministrazione o nuova terapia",
        href: "/scheda",
        cta: "Apri scheda",
      });
    }
  }

  const latestVital = vitals[0];
  if (latestVital) {
    for (const alert of assessVitals(latestVital)) {
      if (alert.level === "ok") continue;
      items.push({
        id: `vital-${alert.label}`,
        priority: alert.level === "critical" ? "critical" : "high",
        title: alert.label,
        reason: alert.detail,
        href: "/gestione",
        cta: "Vedi vitali",
      });
    }
  }

  for (const r of refills.filter((x) => x.status !== "ok")) {
    items.push({
      id: `refill-${r.supplyId}`,
      priority: r.status === "critical" ? "critical" : "high",
      title: `Scorte: ${r.name}`,
      reason: r.message,
      href: "/gestione",
      cta: "Gestisci scorte",
    });
  }

  for (const h of helps.filter((x) => x.status === "open")) {
    items.push({
      id: `help-${h.id}`,
      priority: "high",
      title: `Aiuto richiesto: ${h.title}`,
      reason: `${h.when_label}${h.notes ? ` · ${h.notes}` : ""}`,
      href: "/cerchio",
      cta: "Prendi in carico",
    });
  }

  for (const t of familyTasks.filter((x) => x.status === "open" && !x.assigned_to)) {
    items.push({
      id: `task-unassigned-${t.id}`,
      priority: "medium",
      title: `Compito senza responsabile: ${t.title}`,
      reason: t.due_date ? `Entro ${t.due_date}` : "Da assegnare a qualcuno del cerchio",
      href: "/cerchio",
      cta: "Assegna",
    });
  }

  for (const t of familyTasks.filter((x) => x.status === "open" && x.assigned_to)) {
    items.push({
      id: `task-${t.id}`,
      priority: "medium",
      title: t.title,
      reason: `Assegnato a ${t.assigned_name ?? "un familiare"}${t.due_date ? ` · entro ${t.due_date}` : ""}`,
      href: "/cerchio",
      cta: "Apri compiti",
    });
  }

  const soonAppt = appointments.find((a) => {
    const hours = (+new Date(a.starts_at) - Date.now()) / 3_600_000;
    return hours >= 0 && hours <= 36;
  });
  if (soonAppt) {
    items.push({
      id: `appt-${soonAppt.id}`,
      priority: "high",
      title: `Visita tra poco: ${soonAppt.title}`,
      reason: `${formatShortDate(soonAppt.starts_at)} · ${formatTime(soonAppt.starts_at)}${soonAppt.location ? ` · ${soonAppt.location}` : ""}${soonAppt.notes ? ` · ${soonAppt.notes}` : ""}`,
      href: "/gestione",
      cta: "Prepara visita",
    });
  }

  for (const t of tasks) {
    if (medUrgency(t) === "soon") {
      items.push({
        id: `med-soon-${t.logId}`,
        priority: "medium",
        title: `${t.medicationName} a breve`,
        reason: `Alle ${formatTime(t.scheduledFor)} · ${t.dosage}`,
        href: "/oggi#farmaci",
        cta: "Vedi dose",
      });
    }
  }

  // Deduplicate by priority sort, cap noise
  const rank = { critical: 0, high: 1, medium: 2 };
  return items.sort((a, b) => rank[a.priority] - rank[b.priority] || a.title.localeCompare(b.title)).slice(0, 10);
}

export function getAdherenceToday(careGroupId: string) {
  const tasks = demo.getDailyTasks(careGroupId);
  const total = tasks.length;
  const done = tasks.filter((t) => t.status === "completed").length;
  const skipped = tasks.filter((t) => t.status === "skipped").length;
  const overdue = tasks.filter((t) => medUrgency(t) === "overdue").length;
  const percent = total === 0 ? 100 : Math.round((done / total) * 100);
  return { total, done, skipped, overdue, percent };
}

/** Giorni di autonomia stimati: quantità / dosi giornaliere (match nome scorta↔farmaco). */
export function getRefillInsights(careGroupId: string): RefillInsight[] {
  const supplies = demo.getSupplies(careGroupId);
  const meds = demo.getMedications(careGroupId).filter((m) => m.active);

  return supplies.map((s) => {
    const med = meds.find(
      (m) =>
        m.name.toLowerCase().includes(s.name.toLowerCase().split(" ")[0]!) ||
        s.name.toLowerCase().includes(m.name.toLowerCase().split(" ")[0]!)
    );
    const dosesPerDay = med?.time_of_day.length || (s.kind === "farmaco" ? 1 : 0);
    const daysLeft =
      dosesPerDay > 0 ? Math.floor(s.quantity / dosesPerDay) : s.quantity <= s.min_quantity ? 0 : null;

    let status: RefillInsight["status"] = "ok";
    let message = `${s.quantity} ${s.unit} disponibili`;

    if (s.quantity <= s.min_quantity || (daysLeft != null && daysLeft <= 3)) {
      status = daysLeft != null && daysLeft <= 2 ? "critical" : "low";
      message =
        daysLeft != null
          ? `Restano circa ${daysLeft} giorni${med ? ` a ${dosesPerDay} dosi/giorno` : ""}. Soglia minima: ${s.min_quantity} ${s.unit}.`
          : `Sotto soglia (${s.quantity}/${s.min_quantity} ${s.unit}).`;
    } else if (daysLeft != null) {
      message = `Autonomia stimata: ${daysLeft} giorni (${dosesPerDay} dosi/giorno).`;
    }

    return {
      supplyId: s.id,
      name: s.name,
      quantity: s.quantity,
      unit: s.unit,
      dosesPerDay,
      daysLeft,
      status,
      message,
    };
  });
}

export function assessVitals(v: VitalReading): VitalAlert[] {
  const alerts: VitalAlert[] = [];

  if (v.systolic != null && v.diastolic != null) {
    if (v.systolic >= 180 || v.diastolic >= 120) {
      alerts.push({
        level: "critical",
        label: "Pressione pericolosamente alta",
        detail: `${v.systolic}/${v.diastolic} mmHg — valuta contatto medico/118 se sintomi.`,
      });
    } else if (v.systolic >= 140 || v.diastolic >= 90) {
      alerts.push({
        level: "warning",
        label: "Pressione sopra target",
        detail: `${v.systolic}/${v.diastolic} mmHg — annota e ripeti a riposo.`,
      });
    } else if (v.systolic < 90 || v.diastolic < 60) {
      alerts.push({
        level: "warning",
        label: "Pressione bassa",
        detail: `${v.systolic}/${v.diastolic} mmHg — verifica vertigini o debolezza.`,
      });
    } else {
      alerts.push({
        level: "ok",
        label: "Pressione nella norma",
        detail: `${v.systolic}/${v.diastolic} mmHg`,
      });
    }
  }

  if (v.temperature_c != null) {
    if (v.temperature_c >= 38) {
      alerts.push({
        level: "critical",
        label: "Febbre",
        detail: `${v.temperature_c}°C — monitora e informa la famiglia.`,
      });
    } else if (v.temperature_c >= 37.5) {
      alerts.push({
        level: "warning",
        label: "Temperatura elevata",
        detail: `${v.temperature_c}°C`,
      });
    }
  }

  if (v.pain_level != null && v.pain_level >= 6) {
    alerts.push({
      level: "warning",
      label: "Dolore significativo",
      detail: `Livello ${v.pain_level}/10 — registra sede e andamento.`,
    });
  }

  return alerts;
}

/** Testo pronto da incollare su WhatsApp / SMS alla famiglia. */
export function buildDailyBriefing(careGroupId: string, patientName: string): string {
  const adherence = getAdherenceToday(careGroupId);
  const status = demo.getLatestStatus(careGroupId);
  const vitals = demo.getVitals(careGroupId)[0];
  const wellbeing = demo.getWellbeing(careGroupId)[0];
  const handoff = demo.getHandoffs(careGroupId)[0];
  const openHelps = demo.getHelpRequests(careGroupId).filter((h) => h.status === "open");
  const refills = getRefillInsights(careGroupId).filter((r) => r.status !== "ok");
  const nextAppt = demo.getAppointments(careGroupId)[0];
  const actions = getActionQueue(careGroupId).filter((a) => a.priority === "critical");
  const punchOpen = demo.getPunches(careGroupId).find((p) => !p.punched_out_at);

  const lines = [
    `📋 Briefing CareRoute — ${patientName}`,
    `📅 ${formatTodayLabel()}`,
    "",
    `💊 Farmaci oggi: ${adherence.done}/${adherence.total} completati (${adherence.percent}%)${adherence.overdue ? ` · ⚠️ ${adherence.overdue} in ritardo` : ""}`,
  ];

  if (status?.note) {
    lines.push(`📝 Ultima nota (${status.author_name ?? "team"}): ${status.note}${status.status === "segnalazione" ? " [ATTENZIONE]" : ""}`);
  }
  if (wellbeing) {
    lines.push(
      `🙂 Benessere: umore ${wellbeing.mood.replace("_", " ")}, pasti ${wellbeing.meals_ok ? "ok" : "no"}, idratazione ${wellbeing.hydration_ok ? "ok" : "no"}, sonno ${wellbeing.sleep_ok ? "ok" : "no"}`
    );
  }
  if (vitals) {
    lines.push(
      `❤️ Vitali: PA ${vitals.systolic ?? "—"}/${vitals.diastolic ?? "—"}${vitals.weight_kg != null ? ` · ${vitals.weight_kg}kg` : ""}${vitals.temperature_c != null ? ` · ${vitals.temperature_c}°C` : ""}${vitals.pain_level != null ? ` · dolore ${vitals.pain_level}/10` : ""}`
    );
  }
  if (handoff) {
    lines.push(`🔁 Consegne (${handoff.shift_label}): ${handoff.summary}${handoff.open_alerts ? ` · Alert: ${handoff.open_alerts}` : ""}`);
  }
  if (punchOpen) {
    lines.push(`⏱️ In servizio ora: ${punchOpen.user_name ?? "operatore"} (dal ${formatTime(punchOpen.punched_in_at)})`);
  }
  if (nextAppt) {
    lines.push(`📌 Prossima visita: ${nextAppt.title} — ${formatShortDate(nextAppt.starts_at)} ${formatTime(nextAppt.starts_at)}${nextAppt.notes ? ` (${nextAppt.notes})` : ""}`);
  }
  if (openHelps.length) {
    lines.push(`🤝 Aiuti aperti: ${openHelps.map((h) => h.title).join("; ")}`);
  }
  if (refills.length) {
    lines.push(`📦 Scorte: ${refills.map((r) => `${r.name} (${r.daysLeft != null ? `${r.daysLeft}g` : "bassa"})`).join("; ")}`);
  }
  if (actions.length) {
    lines.push("", "🚨 Da fare subito:");
    for (const a of actions.slice(0, 5)) lines.push(`• ${a.title}`);
  }
  lines.push("", "— Generato da CareRoute");
  return lines.join("\n");
}

export function buildHandoffDraft(careGroupId: string): string {
  const adherence = getAdherenceToday(careGroupId);
  const checklist = demo.getChecklist(careGroupId);
  const doneCare = checklist.filter((c) => c.done).map((c) => c.title);
  const openCare = checklist.filter((c) => !c.done).map((c) => c.title);
  const vitals = demo.getVitals(careGroupId)[0];
  const wellbeing = demo.getWellbeing(careGroupId)[0];
  const overdue = demo.getDailyTasks(careGroupId).filter((t) => medUrgency(t) === "overdue");
  const refills = getRefillInsights(careGroupId).filter((r) => r.status !== "ok");

  const parts = [
    `Farmaci: ${adherence.done}/${adherence.total} ok.`,
    doneCare.length ? `Cure fatte: ${doneCare.join(", ")}.` : null,
    openCare.length ? `Cure ancora da fare: ${openCare.join(", ")}.` : null,
    wellbeing
      ? `Umore ${wellbeing.mood.replace("_", " ")}, pasti ${wellbeing.meals_ok ? "ok" : "da verificare"}, idratazione ${wellbeing.hydration_ok ? "ok" : "da verificare"}.`
      : null,
    vitals
      ? `Ultimi vitali PA ${vitals.systolic}/${vitals.diastolic}${vitals.note ? ` (${vitals.note})` : ""}.`
      : null,
    overdue.length ? `ATTENZIONE dosi in ritardo: ${overdue.map((t) => t.medicationName).join(", ")}.` : null,
    refills.length ? `Scorte basse: ${refills.map((r) => r.name).join(", ")}.` : null,
  ].filter(Boolean);

  return parts.join(" ");
}

export function getWeeklyReport(careGroupId: string): WeeklyReport {
  const adherence = getAdherenceToday(careGroupId);
  const openTasks = demo.getFamilyTasks(careGroupId).filter((t) => t.status === "open").length;
  const openHelps = demo.getHelpRequests(careGroupId).filter((h) => h.status === "open").length;
  const lowSupplies = getRefillInsights(careGroupId).filter((r) => r.status !== "ok").length;
  const assistanceHours = demo.getMonthAssistanceHours(careGroupId);
  const expensePending = demo
    .getExpenses(careGroupId)
    .filter((e) => e.status === "pending")
    .reduce((s, e) => s + e.amount, 0);
  const wb = demo.getWellbeing(careGroupId)[0];
  const vitals = demo.getVitals(careGroupId)[0];
  const next = demo.getAppointments(careGroupId)[0];

  return {
    adherencePct: adherence.percent,
    dosesDone: adherence.done,
    dosesTotal: adherence.total,
    openTasks,
    openHelps,
    lowSupplies,
    assistanceHours,
    expensePending,
    moodSummary: wb ? `Umore ${wb.mood.replace("_", " ")}` : "Nessun check-in oggi",
    lastVital: vitals
      ? `PA ${vitals.systolic}/${vitals.diastolic}${vitals.weight_kg != null ? ` · ${vitals.weight_kg}kg` : ""}`
      : null,
    nextAppointment: next
      ? `${next.title} · ${formatShortDate(next.starts_at)} ${formatTime(next.starts_at)}`
      : null,
  };
}

export function formatExpenseLine(amount: number) {
  return formatCurrency(amount);
}

export type _Keep = HelpRequest | FamilyTask | SupplyItem | Appointment;
