"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight } from "lucide-react";
import { CareRouteLogo } from "@/components/shared/CareRouteLogo";
import { useDemo } from "@/lib/demo/DemoProvider";

export default function LandingPage() {
  const router = useRouter();
  const { loginAs, session } = useDemo();

  const start = () => {
    loginAs("admin");
    router.push("/oggi");
  };

  return (
    <div className="cr-atmosphere min-h-dvh">
      <div className="mx-auto flex min-h-dvh w-full max-w-lg flex-col px-6 pb-10 pt-8">
        <header className="flex items-center justify-between">
          <CareRouteLogo size="sm" />
          {session ? (
            <Link href="/oggi" className="text-sm font-bold text-pine">
              Continua
            </Link>
          ) : (
            <Link href="/login" className="text-sm font-bold text-pine">
              Accedi
            </Link>
          )}
        </header>

        <main className="flex flex-1 flex-col justify-center py-10">
          <div className="flex flex-col items-center text-center">
            <Image
              src="/brand/careroute-logo.png"
              alt="CareRoute"
              width={120}
              height={120}
              priority
              className="mb-6"
            />
            <h1 className="font-display text-4xl font-semibold text-pine-deep">CareRoute</h1>
            <p className="mt-4 max-w-sm text-lg leading-relaxed text-muted">
              Aiuta la famiglia a curare qualcuno senza confusione.
              Farmaci, note e turni — in un posto solo.
            </p>
          </div>

          <div className="mt-10 space-y-3">
            <button data-touch onClick={start} className="cr-btn cr-btn-primary w-full">
              Prova subito
              <ArrowRight className="h-5 w-5" />
            </button>
            <button
              data-touch
              className="cr-btn cr-btn-secondary w-full"
              onClick={() => {
                loginAs("caregiver", true);
                router.push("/operatore");
              }}
            >
              Sono un operatore
            </button>
          </div>

          <ul className="mt-10 space-y-4 text-left text-sm leading-relaxed text-muted">
            <li>
              <strong className="text-ink">1. Vedi cosa manca oggi</strong>
              <br />
              Dosi da dare, cose da comprare, visite in arrivo.
            </li>
            <li>
              <strong className="text-ink">2. Segna cosa hai fatto</strong>
              <br />
              Un tocco. Tutta la famiglia lo vede.
            </li>
            <li>
              <strong className="text-ink">3. Scrivi un aggiornamento</strong>
              <br />
              Pronto da mandare su WhatsApp.
            </li>
          </ul>
        </main>

        <p className="text-center text-xs text-muted">
          Demo gratuita · codice invito{" "}
          <Link href="/invito/ELENA42" className="font-bold text-pine">
            ELENA42
          </Link>
        </p>
      </div>
    </div>
  );
}
