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
      <div className="cr-shell flex flex-col px-5 py-8">
        <CareRouteLogo size="md" />
        <h1 className="mt-10 font-display text-3xl font-semibold text-ink">Bentornata</h1>
        <p className="mt-2 text-muted">
          Per l&apos;MVP su Vercel usiamo la modalità demo locale. Collega Supabase quando sei pronta per i dati reali.
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
            Entra come familiare (admin)
          </button>
          <button
            data-touch
            className="cr-btn cr-btn-secondary w-full"
            onClick={() => {
              loginAs("member");
              router.push("/oggi");
            }}
          >
            Entra come familiare
          </button>
          <button
            data-touch
            className="cr-btn cr-btn-secondary w-full"
            onClick={() => {
              loginAs("caregiver", true);
              router.push("/operatore");
            }}
          >
            Entra come operatore
          </button>
        </div>

        <p className="mt-8 text-sm text-muted">
          Non hai un account?{" "}
          <Link href="/registrati" className="font-bold text-pine">
            Crea gruppo
          </Link>{" "}
          oppure{" "}
          <Link href="/invito/ELENA42" className="font-bold text-pine">
            unisciti con codice
          </Link>
          .
        </p>
      </div>
    </div>
  );
}
