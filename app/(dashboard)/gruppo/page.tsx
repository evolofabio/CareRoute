"use client";

import { useMemo } from "react";
import { useDemo } from "@/lib/demo/DemoProvider";
import * as demo from "@/lib/demo/store";
import { ROLE_LABELS } from "@/lib/utils/rbac";

export default function GruppoPage() {
  const { session } = useDemo();
  const members = useMemo(() => (session ? demo.getMembers(session.care_group_id) : []), [session]);

  if (!session) return null;

  return (
    <div className="px-5 pb-28 pt-2">
      <h1 className="font-display text-3xl font-semibold">Gruppo</h1>
      <p className="mt-1 text-sm text-muted">
        Assistito: <span className="font-bold text-ink">{session.patient_name}</span>
      </p>

      <div className="mt-6 rounded-3xl border border-line bg-white/80 p-5">
        <p className="text-sm font-semibold text-muted">Codice invito</p>
        <p className="mt-1 font-display text-3xl font-semibold tracking-[0.18em] text-pine-deep">
          {session.patient_code}
        </p>
        <p className="mt-2 text-sm text-muted">Condividilo con familiari o operatori per farli entrare nel gruppo.</p>
      </div>

      <h2 className="mt-8 font-display text-xl font-semibold">Membri</h2>
      <ul className="mt-3 space-y-3">
        {members.map((m) => (
          <li key={m.user_id} className="flex items-center justify-between rounded-2xl border border-line bg-white/75 px-4 py-3">
            <div>
              <p className="font-semibold">{m.user?.full_name ?? m.user_id}</p>
              <p className="text-sm text-muted">{m.user?.phone}</p>
            </div>
            <span className="rounded-full bg-mist px-3 py-1 text-xs font-bold text-pine">
              {ROLE_LABELS[m.role]}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
