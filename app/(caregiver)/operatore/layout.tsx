"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { OfflineBanner } from "@/components/shared/OfflineBanner";
import { CareRouteLogo } from "@/components/shared/CareRouteLogo";
import { CaregiverNav } from "@/components/caregiver/CaregiverNav";
import { useDemo } from "@/lib/demo/DemoProvider";
import { cn } from "@/lib/utils";

export default function CaregiverLayout({ children }: { children: React.ReactNode }) {
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
    <div className={cn("cr-atmosphere min-h-dvh", (session.largeTargets || session.role === "caregiver") && "large-targets")}>
      <div className="cr-shell pb-24">
        <OfflineBanner />
        {children}
        <CaregiverNav />
      </div>
    </div>
  );
}
