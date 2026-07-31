"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { CalendarDays, FileText, HandHelping, Home, Users } from "lucide-react";
import { cn } from "@/lib/utils";
import { useDemo } from "@/lib/demo/DemoProvider";
import { isCaregiver } from "@/lib/utils/rbac";

const familyItems = [
  { href: "/oggi", label: "Oggi", icon: Home },
  { href: "/cerchio", label: "Cerchio", icon: HandHelping },
  { href: "/gestione", label: "Gestione", icon: CalendarDays },
  { href: "/documenti", label: "Vault", icon: FileText },
  { href: "/scheda", label: "Scheda", icon: Users },
];

const caregiverItems = [
  { href: "/operatore", label: "Turno", icon: Home },
  { href: "/oggi", label: "Priorità", icon: CalendarDays },
  { href: "/scheda", label: "Scheda", icon: Users },
];

export function BottomNav() {
  const pathname = usePathname();
  const { session } = useDemo();
  if (!session) return null;

  const items = isCaregiver(session.role) ? caregiverItems : familyItems;

  return (
    <nav className="fixed inset-x-0 bottom-0 z-30 mx-auto max-w-md border-t border-line/70 bg-white/92 px-2 pb-[max(0.55rem,env(safe-area-inset-bottom))] pt-2 shadow-[0_-12px_40px_-28px_rgba(12,42,34,0.35)] backdrop-blur-xl">
      <ul className={cn("grid gap-1", items.length === 3 ? "grid-cols-3" : "grid-cols-5")}>
        {items.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || pathname.startsWith(`${href}/`);
          return (
            <li key={href}>
              <Link
                href={href}
                data-touch
                className={cn(
                  "flex min-h-12 flex-col items-center justify-center gap-0.5 rounded-2xl px-1 text-[11px] font-semibold transition",
                  active ? "bg-mist text-pine shadow-[inset_0_0_0_1px_rgba(22,63,52,0.08)]" : "text-muted hover:text-ink"
                )}
              >
                <Icon className={cn("h-5 w-5", active && "text-pine")} strokeWidth={active ? 2.45 : 2} />
                {label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
