"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { BottomNav } from "@/components/shared/BottomNav";
import { OfflineBanner } from "@/components/shared/OfflineBanner";
import { CareRouteLogo } from "@/components/shared/CareRouteLogo";
import { useDemo } from "@/lib/demo/DemoProvider";
import { cn } from "@/lib/utils";
import { ROLE_LABELS } from "@/lib/utils/rbac";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { ready, session } = useDemo();
  const router = useRouter();

  useEffect(() => {
    if (ready && !session) router.replace("/login");
  }, [ready, session, router]);

  if (!ready || !session) {
    return (
      <div className="cr-atmosphere flex min-h-dvh flex-col items-center justify-center gap-3 px-6 text-center">
        <CareRouteLogo size="md" />
        <p className="text-sm text-muted">Preparazione del percorso di cura…</p>
      </div>
    );
  }

  return (
    <div className={cn("cr-atmosphere min-h-dvh", session.largeTargets && "large-targets")}>
      <div className="cr-shell relative">
        <OfflineBanner />
        <div className="border-b border-line/40 bg-white/35 px-5 py-3 backdrop-blur-md">
          <div className="flex items-center justify-between gap-3">
            <Link href="/oggi" aria-label="CareRoute home">
              <CareRouteLogo size="sm" />
            </Link>
            <Link
              href="/impostazioni"
              className="rounded-full border border-line/70 bg-white/70 px-3 py-1.5 text-right transition hover:border-pine/30"
            >
              <p className="text-sm font-bold leading-none text-pine">{session.full_name.split(" ")[0]}</p>
              <p className="mt-1 text-[10px] font-semibold uppercase tracking-wide text-muted">
                {ROLE_LABELS[session.role]} · {session.patient_name}
              </p>
            </Link>
          </div>
        </div>
        {children}
        <BottomNav />
      </div>
    </div>
  );
}
