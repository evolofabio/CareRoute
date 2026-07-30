"use client";

import { useRouter } from "next/navigation";
import { useDemo } from "@/lib/demo/DemoProvider";
import * as demo from "@/lib/demo/store";
import { EmergencyButton } from "@/components/caregiver/EmergencyButton";

export default function ImpostazioniPage() {
  const { session, logout, setLargeTargets } = useDemo();
  const router = useRouter();
  if (!session) return null;

  return (
    <div className="px-5 pb-28 pt-2">
      <h1 className="font-display text-3xl font-semibold">Impostazioni</h1>
      <p className="mt-1 text-sm text-muted">{session.email}</p>

      <div className="mt-6 space-y-4">
        <label className="flex min-h-14 items-center justify-between rounded-2xl border border-line bg-white/80 px-4">
          <span className="font-semibold">Target touch grandi</span>
          <input
            type="checkbox"
            checked={session.largeTargets}
            onChange={(e) => setLargeTargets(e.target.checked)}
            className="h-5 w-5"
          />
        </label>

        <EmergencyButton phone={session.emergency_phone} doctorPhone={session.doctor_phone} />

        <button
          data-touch
          className="cr-btn cr-btn-secondary w-full"
          onClick={() => {
            demo.resetDemo();
            logout();
            router.push("/");
          }}
        >
          Reset demo
        </button>

        <button
          data-touch
          className="cr-btn w-full border border-sos/30 bg-sos-soft text-sos"
          onClick={() => {
            logout();
            router.push("/");
          }}
        >
          Esci
        </button>
      </div>
    </div>
  );
}
