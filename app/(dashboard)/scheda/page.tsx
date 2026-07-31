"use client";

import { useMemo, useState } from "react";
import { useDemo } from "@/lib/demo/DemoProvider";
import * as demo from "@/lib/demo/store";
import { canManageMedications } from "@/lib/utils/rbac";
import { PageIntro, SpecList } from "@/components/shared/PageIntro";

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
      <PageIntro
        eyebrow="Conosci chi assisti"
        title={`Scheda di ${session.patient_name}`}
        description="Il foglio che serve a chi arriva in sostituzione: allergie, preferenze, mobilità e contatti — prima di improvvisare."
      />

      <div className="cr-panel-strong mt-6 p-5 animate-fade-up">
        <h2 className="font-display text-lg font-semibold text-ink">Anagrafica sintetica</h2>
        <p className="cr-lede mt-1">Specifiche cliniche e quotidiane del Care Group.</p>
        <SpecList
          className="mt-4"
          items={[
            {
              label: "Profilo",
              value: `${card.birth_year ? `Nata nel ${card.birth_year}` : "Età non indicata"}${card.blood_type ? ` · Gruppo ${card.blood_type}` : ""}`,
            },
            { label: "Condizioni", value: card.conditions.length ? card.conditions.join(" · ") : "Nessuna indicata" },
            { label: "Allergie", value: card.allergies.length ? card.allergies.join(" · ") : "Nessuna nota" },
            { label: "Dieta", value: card.diet_notes ?? "—" },
            { label: "Evitare", value: card.avoid ?? "—" },
            { label: "Preferenze", value: card.preferences ?? "—" },
            { label: "Mobilità", value: card.mobility_notes ?? "—" },
            {
              label: "Contatti",
              value: [
                card.gp_name ? `MMG ${card.gp_name}` : null,
                card.pharmacy_name
                  ? `Farmacia ${card.pharmacy_name}${card.pharmacy_phone ? ` (${card.pharmacy_phone})` : ""}`
                  : null,
                session.doctor_phone ? `Specialista ${session.doctor_phone}` : null,
                session.emergency_phone ? `Emergenza ${session.emergency_phone}` : null,
              ]
                .filter(Boolean)
                .join(" · ") || "—",
            },
          ]}
        />
      </div>

      {canEdit && !editing && (
        <button data-touch className="cr-btn cr-btn-secondary mt-6 w-full" onClick={startEdit}>
          Aggiorna preferenze e note
        </button>
      )}

      {editing && (
        <form
          className="cr-panel-strong mt-6 space-y-3 p-5 animate-sheet-in"
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
