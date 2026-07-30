"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { CareRouteLogo } from "@/components/shared/CareRouteLogo";
import { useDemo } from "@/lib/demo/DemoProvider";

export default function RegistratiPage() {
  const router = useRouter();
  const { loginAs } = useDemo();

  return (
    <div className="cr-atmosphere min-h-dvh">
      <div className="cr-shell px-5 py-8">
        <CareRouteLogo size="sm" />
        <h1 className="mt-10 font-display text-3xl font-semibold">Crea il tuo gruppo di cura</h1>
        <p className="mt-2 text-muted">
          In demo avvii subito il gruppo di Nonna Elena. Con Supabase, qui nascerà il tuo Care Group reale.
        </p>
        <form
          className="mt-8 space-y-4"
          onSubmit={(e) => {
            e.preventDefault();
            loginAs("admin");
            router.push("/oggi");
          }}
        >
          <label className="block text-sm font-semibold text-ink">
            Nome completo
            <input className="cr-input mt-1.5" defaultValue="Maria Bianchi" required />
          </label>
          <label className="block text-sm font-semibold text-ink">
            Email
            <input className="cr-input mt-1.5" type="email" defaultValue="maria@famiglia.it" required />
          </label>
          <label className="block text-sm font-semibold text-ink">
            Nome assistito
            <input className="cr-input mt-1.5" defaultValue="Nonna Elena" required />
          </label>
          <button type="submit" data-touch className="cr-btn cr-btn-primary w-full">
            Avvia gruppo demo
          </button>
        </form>
        <p className="mt-6 text-sm text-muted">
          Hai già un account?{" "}
          <Link href="/login" className="font-bold text-pine">
            Accedi
          </Link>
        </p>
      </div>
    </div>
  );
}
