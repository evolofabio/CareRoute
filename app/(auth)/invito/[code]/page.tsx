"use client";

import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
import { CareRouteLogo } from "@/components/shared/CareRouteLogo";
import * as demo from "@/lib/demo/store";
import { useDemo } from "@/lib/demo/DemoProvider";

export default function InvitoPage() {
  const params = useParams<{ code: string }>();
  const router = useRouter();
  const { refresh } = useDemo();
  const [code, setCode] = useState((params.code || "").toUpperCase());
  const [role, setRole] = useState<"member" | "caregiver">("member");
  const [error, setError] = useState<string | null>(null);

  return (
    <div className="cr-atmosphere min-h-dvh">
      <div className="cr-shell px-5 py-8">
        <CareRouteLogo size="sm" />
        <h1 className="mt-10 font-display text-3xl font-semibold">Unisciti al gruppo</h1>
        <p className="mt-2 text-muted">
          Inserisci il codice paziente ricevuto dalla famiglia. In demo il codice è{" "}
          <span className="font-bold text-pine">ELENA42</span>.
        </p>

        <form
          className="mt-8 space-y-4"
          onSubmit={(e) => {
            e.preventDefault();
            try {
              demo.joinByCode(code, role);
              refresh();
              router.push(role === "caregiver" ? "/operatore" : "/oggi");
            } catch (err) {
              setError(err instanceof Error ? err.message : "Codice non valido");
            }
          }}
        >
          <label className="block text-sm font-semibold">
            Codice invito
            <input
              className="cr-input mt-1.5 uppercase tracking-[0.2em]"
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              placeholder="ELENA42"
              required
            />
          </label>

          <fieldset className="space-y-2">
            <legend className="text-sm font-semibold">Il tuo ruolo</legend>
            <label className="flex min-h-12 items-center gap-3 rounded-2xl border border-line bg-white/70 px-4">
              <input
                type="radio"
                name="role"
                checked={role === "member"}
                onChange={() => setRole("member")}
              />
              Familiare
            </label>
            <label className="flex min-h-12 items-center gap-3 rounded-2xl border border-line bg-white/70 px-4">
              <input
                type="radio"
                name="role"
                checked={role === "caregiver"}
                onChange={() => setRole("caregiver")}
              />
              Operatore / badante
            </label>
          </fieldset>

          {error && <p className="text-sm font-semibold text-sos">{error}</p>}

          <button type="submit" data-touch className="cr-btn cr-btn-primary w-full">
            Entra nel gruppo
          </button>
        </form>
      </div>
    </div>
  );
}
