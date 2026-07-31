"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { AlertTriangle, Activity, Minus, Package, Plus } from "lucide-react";
import { useDemo } from "@/lib/demo/DemoProvider";
import * as demo from "@/lib/demo/store";
import { cn } from "@/lib/utils";
import type { SupplyKind } from "@/types/database";
import { PageIntro } from "@/components/shared/PageIntro";

const KIND_LABELS: Record<SupplyKind, string> = {
  farmaco: "Farmaco",
  presidio: "Presidio",
  igiene: "Igiene",
  altro: "Altro",
};

export default function GestionePage() {
  const { session, refresh } = useDemo();
  const [tick, setTick] = useState(0);
  const [name, setName] = useState("");
  const [kind, setKind] = useState<SupplyKind>("farmaco");
  const [quantity, setQuantity] = useState(1);
  const [unit, setUnit] = useState("pz");
  const [minQty, setMinQty] = useState(5);

  const supplies = useMemo(() => {
    void tick;
    return session ? demo.getSupplies(session.care_group_id) : [];
  }, [session, tick]);

  const shifts = useMemo(() => {
    void tick;
    return session ? demo.getShifts(session.care_group_id) : [];
  }, [session, tick]);

  const appointments = useMemo(() => {
    void tick;
    return session ? demo.getAppointments(session.care_group_id) : [];
  }, [session, tick]);

  const vitals = useMemo(() => {
    void tick;
    return session ? demo.getVitals(session.care_group_id) : [];
  }, [session, tick]);

  const [sys, setSys] = useState("120");
  const [dia, setDia] = useState("80");
  const [weight, setWeight] = useState("62");
  const [temp, setTemp] = useState("36.5");
  const [pain, setPain] = useState("0");

  const low = supplies.filter((s) => s.quantity <= s.min_quantity);

  if (!session) return null;

  const bump = () => {
    setTick((t) => t + 1);
    refresh();
  };

  return (
    <div className="px-5 pb-28">
      <PageIntro
        eyebrow=""
        title="Scorte e visite"
        description="Cosa sta finendo, chi è in turno, prossime visite e pressione."
      />
      <Link href="/spese" className="mt-3 inline-flex text-sm font-bold text-pine">
        Vai alle spese →
      </Link>

      {low.length > 0 && (
        <div className="mt-5 flex gap-3 rounded-2xl border border-alert/30 bg-alert-soft/80 p-4 animate-fade-up">
          <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-alert" />
          <div>
            <p className="font-semibold text-ink">Attenzione scorte</p>
            <p className="mt-1 text-sm text-muted">
              {low.map((s) => s.name).join(", ")} — sotto la soglia minima.
            </p>
          </div>
        </div>
      )}

      <section className="mt-10 animate-fade-up" style={{ animationDelay: "90ms" }}>
        <div className="mb-3 flex items-center gap-2">
          <Activity className="h-5 w-5 text-pine" />
          <h2 className="font-display text-xl font-semibold text-ink">Parametri vitali</h2>
        </div>
        {vitals[0] && (
          <article className="mb-3 rounded-2xl border border-line/70 bg-white/65 p-4">
            <p className="text-xs font-bold uppercase tracking-wide text-muted">Ultima rilevazione</p>
            <p className="mt-2 text-sm font-semibold text-ink">
              PA {vitals[0].systolic}/{vitals[0].diastolic}
              {vitals[0].weight_kg != null ? ` · ${vitals[0].weight_kg} kg` : ""}
              {vitals[0].temperature_c != null ? ` · ${vitals[0].temperature_c}°C` : ""}
              {vitals[0].pain_level != null ? ` · dolore ${vitals[0].pain_level}/10` : ""}
            </p>
            <p className="mt-1 text-xs text-muted">
              {new Date(vitals[0].recorded_at).toLocaleString("it-IT")}
              {vitals[0].author_name ? ` · ${vitals[0].author_name}` : ""}
            </p>
          </article>
        )}
        <form
          className="space-y-3 rounded-2xl border border-dashed border-line bg-white/40 p-4"
          onSubmit={(e) => {
            e.preventDefault();
            demo.addVital({
              care_group_id: session.care_group_id,
              recorded_at: new Date().toISOString(),
              systolic: Number(sys) || null,
              diastolic: Number(dia) || null,
              weight_kg: Number(weight) || null,
              temperature_c: Number(temp) || null,
              pain_level: Number(pain) || 0,
              note: null,
              created_by: session.id,
            });
            bump();
          }}
        >
          <p className="text-sm font-semibold text-ink">Nuova rilevazione</p>
          <div className="grid grid-cols-2 gap-2">
            <input className="cr-input" type="number" placeholder="Sistolica" value={sys} onChange={(e) => setSys(e.target.value)} />
            <input className="cr-input" type="number" placeholder="Diastolica" value={dia} onChange={(e) => setDia(e.target.value)} />
            <input className="cr-input" type="number" step="0.1" placeholder="Peso kg" value={weight} onChange={(e) => setWeight(e.target.value)} />
            <input className="cr-input" type="number" step="0.1" placeholder="Temp °C" value={temp} onChange={(e) => setTemp(e.target.value)} />
            <input className="cr-input col-span-2" type="number" min={0} max={10} placeholder="Dolore 0-10" value={pain} onChange={(e) => setPain(e.target.value)} />
          </div>
          <button type="submit" className="cr-btn cr-btn-primary w-full" data-touch>
            Salva parametri
          </button>
        </form>
      </section>

      <section className="mt-8 animate-fade-up" style={{ animationDelay: "60ms" }}>
        <div className="mb-3 flex items-center gap-2">
          <Package className="h-5 w-5 text-pine" />
          <h2 className="font-display text-xl font-semibold text-ink">Scorte</h2>
        </div>
        <ul className="space-y-3">
          {supplies.map((s) => {
            const isLow = s.quantity <= s.min_quantity;
            return (
              <li
                key={s.id}
                className={cn(
                  "rounded-2xl border p-4",
                  isLow ? "border-alert/35 bg-alert-soft/50" : "border-line/70 bg-white/60"
                )}
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-semibold text-ink">{s.name}</p>
                    <p className="text-xs font-medium uppercase tracking-wide text-muted">
                      {KIND_LABELS[s.kind]} · min {s.min_quantity} {s.unit}
                    </p>
                    {s.notes && <p className="mt-1 text-sm text-muted">{s.notes}</p>}
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      data-touch
                      aria-label="Diminuisci"
                      className="flex h-11 w-11 items-center justify-center rounded-xl border border-line bg-white"
                      onClick={() => {
                        demo.adjustSupplyQuantity(s.id, -1);
                        bump();
                      }}
                    >
                      <Minus className="h-4 w-4" />
                    </button>
                    <span className="min-w-12 text-center font-display text-lg font-semibold text-pine">
                      {s.quantity}
                    </span>
                    <button
                      data-touch
                      aria-label="Aumenta"
                      className="flex h-11 w-11 items-center justify-center rounded-xl border border-line bg-white"
                      onClick={() => {
                        demo.adjustSupplyQuantity(s.id, 1);
                        bump();
                      }}
                    >
                      <Plus className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>

        <form
          className="mt-4 space-y-3 rounded-2xl border border-dashed border-line bg-white/40 p-4"
          onSubmit={(e) => {
            e.preventDefault();
            if (!name.trim()) return;
            demo.addSupply({
              care_group_id: session.care_group_id,
              name: name.trim(),
              kind,
              quantity,
              unit,
              min_quantity: minQty,
              expires_on: null,
              notes: null,
            });
            setName("");
            bump();
          }}
        >
          <p className="text-sm font-semibold text-ink">Aggiungi scorta</p>
          <input
            className="cr-input"
            placeholder="Nome (es. Vitamina D)"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <div className="grid grid-cols-2 gap-2">
            <select className="cr-select" value={kind} onChange={(e) => setKind(e.target.value as SupplyKind)}>
              {Object.entries(KIND_LABELS).map(([k, label]) => (
                <option key={k} value={k}>
                  {label}
                </option>
              ))}
            </select>
            <input className="cr-input" placeholder="Unità" value={unit} onChange={(e) => setUnit(e.target.value)} />
            <input
              className="cr-input"
              type="number"
              min={0}
              value={quantity}
              onChange={(e) => setQuantity(Number(e.target.value))}
              placeholder="Quantità"
            />
            <input
              className="cr-input"
              type="number"
              min={0}
              value={minQty}
              onChange={(e) => setMinQty(Number(e.target.value))}
              placeholder="Soglia min"
            />
          </div>
          <button type="submit" className="cr-btn cr-btn-primary w-full" data-touch>
            Salva scorta
          </button>
        </form>
      </section>

      <section className="mt-10 animate-fade-up" style={{ animationDelay: "120ms" }}>
        <h2 className="font-display text-xl font-semibold text-ink">Turni di oggi</h2>
        <ul className="mt-3 space-y-3">
          {shifts.map((s) => (
            <li key={s.id} className="rounded-2xl border border-line/70 bg-white/60 p-4">
              <div className="flex items-center justify-between gap-2">
                <p className="font-semibold text-ink">{s.label}</p>
                <span className="rounded-full bg-mist px-2.5 py-1 text-xs font-bold text-pine">
                  {new Date(s.starts_at).toLocaleTimeString("it-IT", { hour: "2-digit", minute: "2-digit" })}
                  –
                  {new Date(s.ends_at).toLocaleTimeString("it-IT", { hour: "2-digit", minute: "2-digit" })}
                </span>
              </div>
              <p className="mt-1 text-sm text-muted">{s.user_name}</p>
              {s.notes && <p className="mt-1 text-sm text-muted">{s.notes}</p>}
            </li>
          ))}
        </ul>
      </section>

      <section className="mt-10 animate-fade-up" style={{ animationDelay: "180ms" }}>
        <h2 className="font-display text-xl font-semibold text-ink">Prossime visite</h2>
        <ul className="mt-3 space-y-3">
          {appointments.map((a) => (
            <li key={a.id} className="rounded-2xl border border-line/70 bg-white/60 p-4">
              <p className="font-semibold text-ink">{a.title}</p>
              <p className="mt-1 text-sm text-muted">
                {new Date(a.starts_at).toLocaleString("it-IT", {
                  weekday: "short",
                  day: "numeric",
                  month: "short",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
                {a.location ? ` · ${a.location}` : ""}
              </p>
              {a.notes && <p className="mt-1 text-sm text-muted">{a.notes}</p>}
            </li>
          ))}
        </ul>
        <Link href="/farmaci" className="mt-6 inline-flex text-sm font-bold text-pine underline-offset-2 hover:underline">
          Gestisci anagrafica farmaci →
        </Link>
      </section>
    </div>
  );
}
