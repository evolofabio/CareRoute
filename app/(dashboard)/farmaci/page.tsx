"use client";

import { useMemo, useState } from "react";
import { useDemo } from "@/lib/demo/DemoProvider";
import * as demo from "@/lib/demo/store";
import { canManageMedications } from "@/lib/utils/rbac";

export default function FarmaciPage() {
  const { session } = useDemo();
  const [tick, setTick] = useState(0);
  const [name, setName] = useState("");
  const [dosage, setDosage] = useState("1 compressa");
  const [times, setTimes] = useState("08:00,20:00");
  const meds = useMemo(() => {
    void tick;
    return session ? demo.getMedications(session.care_group_id) : [];
  }, [session, tick]);

  if (!session) return null;

  return (
    <div className="px-5 pb-28 pt-2">
      <h1 className="font-display text-3xl font-semibold">Farmaci</h1>
      <p className="mt-1 text-sm text-muted">Anagrafica terapie del gruppo di cura.</p>

      {canManageMedications(session.role) && (
        <form
          className="mt-6 space-y-3 rounded-3xl border border-line bg-white/80 p-4"
          onSubmit={(e) => {
            e.preventDefault();
            demo.addMedication({
              careGroupId: session.care_group_id,
              name,
              dosage,
              time_of_day: times.split(",").map((t) => t.trim()).filter(Boolean),
              userId: session.id,
            });
            setName("");
            setTick((n) => n + 1);
          }}
        >
          <input className="cr-input" placeholder="Nome farmaco" value={name} onChange={(e) => setName(e.target.value)} required />
          <input className="cr-input" placeholder="Dosaggio" value={dosage} onChange={(e) => setDosage(e.target.value)} required />
          <input className="cr-input" placeholder="Orari (es. 08:00,20:00)" value={times} onChange={(e) => setTimes(e.target.value)} required />
          <button type="submit" data-touch className="cr-btn cr-btn-primary w-full">
            Aggiungi farmaco
          </button>
        </form>
      )}

      <ul className="mt-6 space-y-3">
        {meds.map((m) => (
          <li key={m.id} className="rounded-2xl border border-line bg-white/75 px-4 py-3">
            <p className="font-semibold">{m.name}</p>
            <p className="text-sm text-muted">
              {m.dosage} · {m.time_of_day.join(" · ")}
            </p>
            {m.instructions && <p className="mt-1 text-xs text-muted">{m.instructions}</p>}
          </li>
        ))}
      </ul>
    </div>
  );
}
