"use client";

import Link from "next/link";
import {
  CalendarDays,
  FileText,
  HandHelping,
  IdCard,
  Settings,
  Users,
  Wallet,
  ClipboardList,
  Activity,
} from "lucide-react";
import { useDemo } from "@/lib/demo/DemoProvider";
import { ROLE_LABELS } from "@/lib/utils/rbac";

const links = [
  {
    href: "/scheda",
    title: "Scheda di chi assisti",
    desc: "Allergie, preferenze, medici",
    icon: IdCard,
  },
  {
    href: "/cerchio",
    title: "Aiuto in famiglia",
    desc: "Compiti e chi può dare una mano",
    icon: HandHelping,
  },
  {
    href: "/gestione",
    title: "Scorte e visite",
    desc: "Farmaci in casa, turni, pressione",
    icon: CalendarDays,
  },
  {
    href: "/spese",
    title: "Spese",
    desc: "Chi ha pagato cosa",
    icon: Wallet,
  },
  {
    href: "/documenti",
    title: "Documenti",
    desc: "Referti e carte importanti",
    icon: FileText,
  },
  {
    href: "/gruppo",
    title: "Persone del gruppo",
    desc: "Inviti e ruoli",
    icon: Users,
  },
  {
    href: "/report",
    title: "Riepilogo",
    desc: "Come sta andando la cura",
    icon: ClipboardList,
  },
  {
    href: "/operatore",
    title: "Modalità operatore",
    desc: "Turno semplice a una mano",
    icon: Activity,
  },
  {
    href: "/impostazioni",
    title: "Impostazioni",
    desc: "Accessibilità, SOS, esci",
    icon: Settings,
  },
];

export default function MenuPage() {
  const { session } = useDemo();
  if (!session) return null;

  return (
    <div className="px-5 pb-28 pt-5">
      <h1 className="font-display text-3xl font-semibold text-ink">Menu</h1>
      <p className="mt-2 text-base text-muted">
        {session.full_name} · {ROLE_LABELS[session.role]}
        <br />
        Stai seguendo <strong className="font-semibold text-ink">{session.patient_name}</strong>
      </p>

      <ul className="mt-8 space-y-2">
        {links.map(({ href, title, desc, icon: Icon }) => (
          <li key={href}>
            <Link
              href={href}
              className="flex items-center gap-4 rounded-2xl border border-line/70 bg-white/75 px-4 py-3.5 transition active:scale-[0.99]"
            >
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-mist text-pine">
                <Icon className="h-5 w-5" />
              </span>
              <span className="min-w-0">
                <span className="block font-semibold text-ink">{title}</span>
                <span className="block text-sm text-muted">{desc}</span>
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
