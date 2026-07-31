"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { CareRouteLogo } from "@/components/shared/CareRouteLogo";
import { useDemo } from "@/lib/demo/DemoProvider";

export default function LoginPage() {
  const router = useRouter();
  const { loginAs } = useDemo();

  return (
    <div className="cr-atmosphere min-h-dvh">
      <div className="cr-shell flex flex-col justify-center px-6 py-10">
        <Link href="/">
          <CareRouteLogo size="md" />
        </Link>

        <h1 className="mt-10 font-display text-3xl font-semibold text-ink">Chi sei?</h1>
        <p className="mt-2 text-base leading-relaxed text-muted">
          Scegli come vuoi usare CareRoute. Puoi cambiare dopo.
        </p>

        <div className="mt-8 space-y-3">
          <button
            data-touch
            className="cr-btn cr-btn-primary w-full"
            onClick={() => {
              loginAs("admin");
              router.push("/oggi");
            }}
          >
            Sono di famiglia
          </button>
          <button
            data-touch
            className="cr-btn cr-btn-secondary w-full"
            onClick={() => {
              loginAs("caregiver", true);
              router.push("/operatore");
            }}
          >
            Sono un operatore / badante
          </button>
        </div>

        <p className="mt-8 text-sm text-muted">
          <Link href="/" className="font-bold text-pine">
            ← Torna indietro
          </Link>
        </p>
      </div>
    </div>
  );
}
