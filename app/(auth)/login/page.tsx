"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { CareRouteLogo } from "@/components/shared/CareRouteLogo";
import { SpecList } from "@/components/shared/PageIntro";
import { useDemo } from "@/lib/demo/DemoProvider";

export default function LoginPage() {
  const router = useRouter();
  const { loginAs } = useDemo();

  return (
    <div className="cr-atmosphere min-h-dvh">
      <div className="cr-shell flex flex-col px-5 py-8">
        <Link href="/">
          <CareRouteLogo size="md" />
        </Link>

        <p className="cr-eyebrow mt-10">Accesso demo</p>
        <h1 className="mt-2 font-display text-3xl font-semibold text-ink">Bentornata nel percorso</h1>
        <p className="cr-lede mt-3">
          Scegli il ruolo con cui vuoi vivere la giornata di cura. Ogni profilo vede priorità e
          strumenti diversi — stessi dati, responsabilità diverse.
        </p>

        <div className="cr-panel-strong mt-8 p-5">
          <h2 className="font-display text-lg font-semibold text-ink">Specifiche accesso MVP</h2>
          <SpecList
            className="mt-4"
            items={[
              { label: "Modalità", value: "Demo locale (localStorage), senza account obbligatorio" },
              { label: "Scenario", value: "Care group «Nonna Elena» · codice ELENA42" },
              { label: "Admin", value: "Quadro completo: priorità, spese, vault, cerchio" },
              { label: "Familiare", value: "Stesso cerchio, focus su compiti e aggiornamenti" },
              { label: "Operatore", value: "Turno guidato a una mano + target grandi" },
            ]}
          />
        </div>

        <div className="mt-6 space-y-3">
          <button
            data-touch
            className="cr-btn cr-btn-primary w-full"
            onClick={() => {
              loginAs("admin");
              router.push("/oggi");
            }}
          >
            Entra come familiare admin
          </button>
          <p className="-mt-1 px-1 text-xs text-muted">Vedi «Cosa fare ora», briefing, scorte e report.</p>

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
          <p className="-mt-1 px-1 text-xs text-muted">Prendi compiti e aiuti, senza gestire il gruppo.</p>

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
          <p className="-mt-1 px-1 text-xs text-muted">Flusso Entra → Cure → Vitali → Consegne → Esci.</p>
        </div>

        <hr className="cr-divider" />

        <p className="text-sm leading-relaxed text-muted">
          Non hai un account?{" "}
          <Link href="/registrati" className="font-bold text-pine">
            Crea gruppo
          </Link>{" "}
          oppure{" "}
          <Link href="/invito/ELENA42" className="font-bold text-pine">
            unisciti con codice
          </Link>
          .{" "}
          <Link href="/" className="font-bold text-pine">
            Torna alla landing
          </Link>
          .
        </p>
      </div>
    </div>
  );
}
