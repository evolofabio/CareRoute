"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Menu, NotebookPen } from "lucide-react";
import { cn } from "@/lib/utils";
import { useDemo } from "@/lib/demo/DemoProvider";
import { isCaregiver } from "@/lib/utils/rbac";

const familyItems = [
  { href: "/oggi", label: "Oggi", icon: Home },
  { href: "/note", label: "Note", icon: NotebookPen },
  { href: "/menu", label: "Menu", icon: Menu },
];

const caregiverItems = [
  { href: "/operatore", label: "Turno", icon: Home },
  { href: "/oggi", label: "Oggi", icon: NotebookPen },
  { href: "/menu", label: "Menu", icon: Menu },
];

export function BottomNav() {
  const pathname = usePathname();
  const { session } = useDemo();
  if (!session) return null;

  const items = isCaregiver(session.role) ? caregiverItems : familyItems;

  return (
    <nav className="fixed inset-x-0 bottom-0 z-30 mx-auto max-w-md border-t border-line/70 bg-white/95 px-3 pb-[max(0.55rem,env(safe-area-inset-bottom))] pt-2 backdrop-blur-xl">
      <ul className="grid grid-cols-3 gap-1">
        {items.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || (href !== "/oggi" && pathname.startsWith(`${href}/`));
          return (
            <li key={href}>
              <Link
                href={href}
                data-touch
                className={cn(
                  "flex min-h-12 flex-col items-center justify-center gap-0.5 rounded-2xl text-[12px] font-semibold",
                  active ? "bg-mist text-pine" : "text-muted"
                )}
              >
                <Icon className="h-5 w-5" strokeWidth={active ? 2.4 : 2} />
                {label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
