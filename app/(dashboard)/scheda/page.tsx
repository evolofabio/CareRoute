"use client";

import { useMemo, useState } from "react";
import {
  AlertTriangle,
  HeartPulse,
  Phone,
  Pill,
  ShieldAlert,
  UserRound,
} from "lucide-react";
import { useDemo } from "@/lib/demo/DemoProvider";
import * as demo from "@/lib/demo/store";
import { canManageMedications } from "@/lib/utils/rbac";

export default function SchedaPage() {
  const { session, refresh } = useDemo();
  const [tick, setTick] = useState(0);
  const [editing, setEditing] = useState(false);

  const card = useMemo(() => {
    void tick;
    return session ? demo.getCareCard(session.care_group_id) : null;
  }, [session, tick]);

  const [prefs, setPrefs] = useState("");
  const [avoid, setAvoid] = useState("");
  const [diet, setDiet] = useState("");

  if (!session || !card) return null;

  const canEdit = canManageMedications(session.role);

  const startEdit = () => {
    setPrefs(card.preferences ?? "");
    setAvoid(card.avoid ?? "");
    setDiet(card.diet_notes ?? "");
    setEditing(true);
  };

  return (
    <div className="px-5 pb-28">
      <header className="animate-fade-up">
        <p className="text-sm font-medium text-muted">Conosci chi assisti</p>
        <h1 className="font-display text-2xl font-semibold text-ink">Scheda di {session.patient_name}</h1>
        <p className="mt-1 text-sm text-muted">
          Informazioni essenziali per chi arriva in sostituzione — allergie, preferenze, mobilità.
        </p>
      </header>

      <section className="mt-6 grid gap-3 animate-fade-up">
        <InfoBlock
          icon={<UserRound className="h-4 w-4" />}
          title="Profilo"
          body={`${card.birth_year ? `Nata nel ${card.birth_year}` : "Età non indicata"}${card.blood_type ? ` · Gruppo ${card.blood_type}` : ""}`}
        />
        <InfoBlock
          icon={<HeartPulse className="h-4 w-4" />}
          title="Condizioni"
          body={card.conditions.length ? card.conditions.join(" · ") : "Nessuna indicata"}
        />
        <InfoBlock
          icon={<ShieldAlert className="h-4 w-4 text-sos" />}
          title="Allergie"
          tone="alert"
          body={card.allergies.length ? card.allergies.join(" · ") : "Nessuna nota"}
        />
        <InfoBlock
          icon={<Pill className="h-4 w-4" />}
          title="Alimentazione"
          body={card.diet_notes ?? "—"}
        />
        <InfoBlock
          icon={<AlertTriangle className="h-4 w-4" />}
          title="Cosa evitare"
          body={card.avoid ?? "—"}
        />
        <InfoBlock
          icon={<HeartPulse className="h-4 w-4" />}
          title="Cosa le piace / aiuta"
          body={card.preferences ?? "—"}
        />
        <InfoBlock
          icon={<UserRound className="h-4 w-4" />}
          title="Mobilità"
          body={card.mobility_notes ?? "—"}
        />
        <InfoBlock
          icon={<Phone className="h-4 w-4" />}
          title="Medico e farmacia"
          body={[
            card.gp_name ? `MMG: ${card.gp_name}` : null,
            card.pharmacy_name
              ? `Farmacia: ${card.pharmacy_name}${card.pharmacy_phone ? ` (${card.pharmacy_phone})` : ""}`
              : null,
            session.doctor_phone ? `Specialista: ${session.doctor_phone}` : null,
            session.emergency_phone ? `Emergenza: ${session.emergency_phone}` : null,
          ]
            .filter(Boolean)
            .join("\n") || "—"}
        />
      </section>

      {canEdit && !editing && (
        <button data-touch className="cr-btn cr-btn-secondary mt-6 w-full" onClick={startEdit}>
          Aggiorna preferenze e note
        </button>
      )}

      {editing && (
        <form
          className="mt-6 space-y-3 rounded-2xl border border-line bg-white/70 p-4 animate-sheet-in"
          onSubmit={(e) => {
            e.preventDefault();
            demo.updateCareCard({
              preferences: prefs.trim() || null,
              avoid: avoid.trim() || null,
              diet_notes: diet.trim() || null,
            });
            setEditing(false);
            setTick((n) => n + 1);
            refresh();
          }}
        >
          <label className="block text-sm font-semibold text-ink">
            Preferenze
            <textarea className="cr-textarea mt-1" value={prefs} onChange={(e) => setPrefs(e.target.value)} />
          </label>
          <label className="block text-sm font-semibold text-ink">
            Cosa evitare
            <textarea className="cr-textarea mt-1" value={avoid} onChange={(e) => setAvoid(e.target.value)} />
          </label>
          <label className="block text-sm font-semibold text-ink">
            Alimentazione
            <textarea className="cr-textarea mt-1" value={diet} onChange={(e) => setDiet(e.target.value)} />
          </label>
          <div className="flex gap-2">
            <button type="button" className="cr-btn cr-btn-secondary flex-1" onClick={() => setEditing(false)}>
              Annulla
            </button>
            <button type="submit" className="cr-btn cr-btn-primary flex-1">
              Salva
            </button>
          </div>
        </form>
      )}
    </div>
  );
}

function InfoBlock({
  icon,
  title,
  body,
  tone,
}: {
  icon: React.ReactNode;
  title: string;
  body: string;
  tone?: "alert";
}) {
  return (
    <article
      className={
        tone === "alert"
          ? "rounded-2xl border border-sos/25 bg-sos-soft/60 p-4"
          : "rounded-2xl border border-line/70 bg-white/65 p-4"
      }
    >
      <div className="mb-1.5 flex items-center gap-2 text-pine">
        {icon}
        <h2 className="text-xs font-bold uppercase tracking-wide">{title}</h2>
      </div>
      <p className="whitespace-pre-line text-sm leading-relaxed text-ink">{body}</p>
    </article>
  );
}
