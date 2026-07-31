"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { BottomNav } from "@/components/shared/BottomNav";
import { OfflineBanner } from "@/components/shared/OfflineBanner";
import { CareRouteLogo } from "@/components/shared/CareRouteLogo";
import { useDemo } from "@/lib/demo/DemoProvider";
import { cn } from "@/lib/utils";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { ready, session } = useDemo();
  const router = useRouter();

  useEffect(() => {
    if (ready && !session) router.replace("/login");
  }, [ready, session, router]);

  if (!ready || !session) {
    return (
      <div className="cr-atmosphere flex min-h-dvh items-center justify-center">
        <CareRouteLogo size="md" />
      </div>
    );
  }

  return (
    <div className={cn("cr-atmosphere min-h-dvh", session.largeTargets && "large-targets")}>
      <div className="cr-shell relative">
        <OfflineBanner />
        <div className="flex items-center justify-between px-5 py-3">
          <Link href="/oggi" aria-label="Home">
            <CareRouteLogo size="sm" />
          </Link>
          <Link href="/menu" className="text-sm font-bold text-pine">
            {session.full_name.split(" ")[0]}
          </Link>
        </div>
        {children}
        <BottomNav />
      </div>
    </div>
  );
}
