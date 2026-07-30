"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ClipboardList, Home, Settings } from "lucide-react";
import { cn } from "@/lib/utils";

const items = [
  { href: "/operatore", label: "Turno", icon: ClipboardList },
  { href: "/oggi", label: "Farmaci", icon: Home },
  { href: "/impostazioni", label: "Altro", icon: Settings },
];

export function CaregiverNav() {
  const pathname = usePathname();
  return (
    <nav className="fixed inset-x-0 bottom-0 z-30 mx-auto max-w-md border-t border-line/80 bg-white/90 px-3 pb-[max(0.5rem,env(safe-area-inset-bottom))] pt-2 backdrop-blur-md">
      <ul className="grid grid-cols-3 gap-2">
        {items.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || (href !== "/operatore" && pathname.startsWith(href));
          return (
            <li key={href}>
              <Link
                href={href}
                data-touch
                className={cn(
                  "flex min-h-14 flex-col items-center justify-center gap-0.5 rounded-2xl text-xs font-bold",
                  active ? "bg-mist text-pine" : "text-muted"
                )}
              >
                <Icon className="h-5 w-5" />
                {label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
