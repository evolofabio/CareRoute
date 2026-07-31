"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  CalendarDays,
  FileHeart,
  HeartHandshake,
  Pill,
  ShieldCheck,
  Smartphone,
  Users,
  Wallet,
  Sparkles,
  HandHeart,
  Route,
  ClipboardCheck,
  Activity,
  BellRing,
} from "lucide-react";
import { CareRouteLogo } from "@/components/shared/CareRouteLogo";
import { SpecList } from "@/components/shared/PageIntro";
import { useDemo } from "@/lib/demo/DemoProvider";

export default function LandingPage() {
  const router = useRouter();
  const { loginAs, session } = useDemo();

  const enterDemo = (role: "admin" | "caregiver") => {
    loginAs(role, role === "caregiver");
    router.push(role === "caregiver" ? "/operatore" : "/oggi");
  };

  return (
    <div className="cr-atmosphere min-h-dvh">
      <div className="cr-shell-wide px-5 pb-24 pt-6 md:px-8">
        <header className="flex items-center justify-between animate-fade-up">
          <CareRouteLogo size="sm" />
          <nav className="flex items-center gap-5">
            <a href="#perche" className="hidden text-sm font-semibold text-muted transition hover:text-pine sm:inline">
              Perché
            </a>
            <a href="#specifiche" className="hidden text-sm font-semibold text-muted transition hover:text-pine md:inline">
              Specifiche
            </a>
            <a href="#funzioni" className="hidden text-sm font-semibold text-muted transition hover:text-pine sm:inline">
              Funzioni
            </a>
            {session ? (
              <Link
                href={session.role === "caregiver" ? "/operatore" : "/oggi"}
                className="cr-btn cr-btn-primary !min-h-10 px-4 text-sm"
              >
                Continua
              </Link>
            ) : (
              <Link href="/login" className="text-sm font-bold text-pine">
                Accedi
              </Link>
            )}
          </nav>
        </header>

        {/* HERO — brand-first, one composition */}
        <section className="relative mt-8 overflow-hidden rounded-[2.4rem] border border-line/45 shadow-[var(--shadow)] animate-fade-up md:mt-12">
          <div className="pointer-events-none absolute inset-0">
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_18%_0%,rgba(63,154,114,0.32),transparent_52%),radial-gradient(ellipse_at_92%_78%,rgba(22,63,52,0.2),transparent_48%),linear-gradient(160deg,#f8fcfa_0%,#e8f2ec_100%)]" />
            <div className="absolute -right-20 top-8 h-72 w-72 rounded-full bg-leaf/15 blur-3xl animate-soft-pulse" />
            <div className="absolute -left-16 bottom-0 h-56 w-56 rounded-full bg-pine/12 blur-3xl" />
          </div>

          <div className="relative grid items-center gap-10 px-6 py-14 md:grid-cols-[1.15fr_0.85fr] md:gap-12 md:px-14 md:py-20">
            <div>
              <p className="cr-eyebrow mb-5 rounded-full border border-line/60 bg-white/55 px-3 py-1.5">
                <Route className="h-3.5 w-3.5" />
                Software di cura familiare
              </p>
              <h1 className="font-display text-[2.9rem] leading-[0.98] font-semibold text-pine-deep md:text-[4rem]">
                CareRoute
              </h1>
              <p className="mt-5 max-w-lg text-[1.15rem] leading-relaxed text-muted md:text-[1.3rem]">
                Il percorso condiviso per chi assiste qualcuno ogni giorno.
                Farmaci, turni, documenti, scorte e priorità — in un’unica interfaccia calma,
                pensata per famiglie e operatori sotto pressione.
              </p>

              <div className="mt-9 flex flex-col gap-3 sm:flex-row sm:items-center">
                <button
                  onClick={() => enterDemo("admin")}
                  data-touch
                  className="cr-btn cr-btn-primary w-full sm:w-auto sm:min-w-[13rem]"
                >
                  Entra nella demo
                  <ArrowRight className="h-5 w-5" />
                </button>
                <button
                  onClick={() => enterDemo("caregiver")}
                  data-touch
                  className="cr-btn cr-btn-secondary w-full sm:w-auto"
                >
                  Demo operatore (una mano)
                </button>
              </div>
              <p className="mt-4 text-sm leading-relaxed text-muted">
                Nessuna carta · nessuna installazione · scenario reale di{" "}
                <strong className="font-semibold text-ink">Nonna Elena</strong>
                {" · "}codice{" "}
                <Link href="/invito/ELENA42" className="font-bold text-pine underline-offset-2 hover:underline">
                  ELENA42
                </Link>
              </p>
            </div>

            <div className="relative flex flex-col items-center text-center">
              <div className="absolute inset-8 rounded-full bg-white/35 blur-2xl" />
              <Image
                src="/brand/careroute-logo.png"
                alt="Logo CareRoute — percorso di cura protetto"
                width={220}
                height={220}
                priority
                className="relative drop-shadow-[0_18px_40px_rgba(22,63,52,0.22)]"
              />
              <p className="relative mt-5 max-w-[17rem] text-sm leading-relaxed text-muted">
                Marchio: un arco-riparo e tre punti di presenza — famiglia, operatore, assistito —
                sullo stesso cammino.
              </p>
            </div>
          </div>
        </section>

        {/* PERCHÉ */}
        <section id="perche" className="mt-24 scroll-mt-10">
          <p className="cr-eyebrow">Perché esiste</p>
          <h2 className="mt-3 max-w-2xl font-display text-3xl font-semibold text-ink md:text-[2.6rem] md:leading-[1.1]">
            Perché assistere non dovrebbe significare vivere nel caos dei messaggi
          </h2>
          <p className="cr-lede mt-4 max-w-2xl text-base">
            CareRoute nasce dal vuoto tra cartelle cliniche fredde e chat di famiglia infinite.
            Serve uno spazio dove la cura quotidiana è leggibile, assegnabile e rassicurante —
            anche quando non puoi essere presente.
          </p>
          <div className="mt-10 grid gap-5 md:grid-cols-3">
            <StoryCard
              title="Dal gruppo WhatsApp al percorso"
              body="«Ha preso la pastiglia?», «Chi paga la badante?», «Dov’è l’ECG?» smettono di essere urgenze sparse. Diventano priorità, compiti e documenti in un solo posto."
            />
            <StoryCard
              title="Due interfacce, uno scopo"
              body="La famiglia vede il quadro completo. L’operatore ha un flusso a una mano: entra, cura, rileva, consegna, esce. Stessi dati, responsabilità diverse."
            />
            <StoryCard
              title="Calma operativa"
              body="Non un altro dashboard pieno di widget. Una coda «Cosa fare ora», un briefing da copiare su WhatsApp, scorte con autonomia stimata in giorni."
            />
          </div>
        </section>

        {/* SPECIFICHE */}
        <section id="specifiche" className="mt-24 scroll-mt-10">
          <p className="cr-eyebrow">Specifiche di prodotto</p>
          <h2 className="mt-3 font-display text-3xl font-semibold text-ink md:text-[2.6rem]">
            Cosa ricevi, in concreto
          </h2>
          <div className="mt-8 grid gap-6 lg:grid-cols-2">
            <article className="cr-panel-strong p-6 md:p-8">
              <h3 className="font-display text-xl font-semibold text-ink">Ambito e utenti</h3>
              <SpecList
                className="mt-5"
                items={[
                  { label: "Destinatari", value: "Famiglie che assistono anziani o persone fragili a domicilio" },
                  { label: "Ruoli", value: "Admin, familiare, operatore/badante (RBAC per gruppo)" },
                  { label: "Unità", value: "Un Care Group = una persona assistita + il suo cerchio" },
                  { label: "Lingua UI", value: "Italiano, microcopy orientata all’azione" },
                  { label: "Dispositivi", value: "Mobile-first PWA, usabile anche da desktop" },
                ]}
              />
            </article>
            <article className="cr-panel-strong p-6 md:p-8">
              <h3 className="font-display text-xl font-semibold text-ink">Moduli operativi</h3>
              <SpecList
                className="mt-5"
                items={[
                  { label: "Priorità", value: "Coda critica/alta/media: dosi, vitali, scorte, aiuti, visite" },
                  { label: "Farmaci", value: "Timeline giornaliera, ritardi, skip con motivo, aderenza %" },
                  { label: "Scheda", value: "Allergie, preferenze, mobilità, MMG, farmacia" },
                  { label: "Cerchio", value: "Compiti, aiuti claimable, equità contributi" },
                  { label: "Operatore", value: "Turno guidato + timbratura + consegne auto-generate" },
                ]}
              />
            </article>
            <article className="cr-panel-strong p-6 md:p-8">
              <h3 className="font-display text-xl font-semibold text-ink">Comfort e sicurezza</h3>
              <SpecList
                className="mt-5"
                items={[
                  { label: "Touch", value: "Target ≥ 48px (56px in modalità accessibilità)" },
                  { label: "SOS", value: "Chiamata emergenza e medico di riferimento" },
                  { label: "Vault", value: "Documenti con link/QR a scadenza e limite visualizzazioni" },
                  { label: "Offline", value: "Banner rete + azioni ottimistiche in demo locale" },
                  { label: "Privacy", value: "Schema multi-tenant con RLS (Supabase) pronto" },
                ]}
              />
            </article>
            <article className="cr-panel-strong p-6 md:p-8">
              <h3 className="font-display text-xl font-semibold text-ink">Stack tecnico MVP</h3>
              <SpecList
                className="mt-5"
                items={[
                  { label: "Frontend", value: "Next.js App Router · TypeScript · Tailwind 4" },
                  { label: "Motion", value: "Framer Motion su progress, sheet, feedback" },
                  { label: "Dati demo", value: "localStorage tipizzato (funziona senza backend)" },
                  { label: "Backend", value: "Supabase (Auth, Postgres, Storage) — migrazioni incluse" },
                  { label: "Deploy", value: "Vercel (fra1) · PWA manifest e icone brand" },
                ]}
              />
            </article>
          </div>
        </section>

        {/* A CHI */}
        <section id="per-chi" className="mt-24 scroll-mt-10">
          <p className="cr-eyebrow">A chi è rivolto</p>
          <h2 className="mt-3 font-display text-3xl font-semibold text-ink md:text-[2.6rem]">
            Quattro profili, un solo percorso
          </h2>
          <div className="mt-8 grid gap-4 md:grid-cols-2">
            <AudienceCard
              icon={<Users className="h-5 w-5" />}
              title="Figli e amministratori"
              body="Chi coordina: vede priorità, spese, documenti e invita il cerchio con un codice paziente."
            />
            <AudienceCard
              icon={<HandHeart className="h-5 w-5" />}
              title="Operatori e badanti"
              body="Turno guidato, checklist grandi, scheda allergie in evidenza, SOS sempre raggiungibile."
            />
            <AudienceCard
              icon={<HeartHandshake className="h-5 w-5" />}
              title="Familiari lontani"
              body="Ricevono briefing chiari invece di telefonate fragmentary. Sanno cosa è stato fatto e cosa manca."
            />
            <AudienceCard
              icon={<ShieldCheck className="h-5 w-5" />}
              title="Medici (in lettura)"
              body="Condivisione temporanea di referti via link/QR, senza spargere PDF nelle chat."
            />
          </div>
        </section>

        {/* FUNZIONI */}
        <section id="funzioni" className="mt-24 scroll-mt-10">
          <p className="cr-eyebrow">A cosa serve</p>
          <h2 className="mt-3 max-w-2xl font-display text-3xl font-semibold text-ink md:text-[2.6rem]">
            Funzioni pensate per la giornata reale di cura
          </h2>
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <FeatureTile icon={<BellRing className="h-5 w-5" />} title="Cosa fare ora" body="Priorità ordinate: ritardi farmaci, vitali anomali, scorte finite, aiuti aperti, visite." />
            <FeatureTile icon={<ClipboardCheck className="h-5 w-5" />} title="Briefing famiglia" body="Messaggio pronto da copiare su WhatsApp con dosi, note, scorte e alert." />
            <FeatureTile icon={<Pill className="h-5 w-5" />} title="Farmaci con motivo" body="Somministra, salta con motivo, calcola aderenza. Allergie sempre visibili." />
            <FeatureTile icon={<Activity className="h-5 w-5" />} title="Vitali intelligenti" body="PA, peso, temperatura, dolore — con avvisi se fuori range clinico di base." />
            <FeatureTile icon={<Sparkles className="h-5 w-5" />} title="Benessere e checklist" body="Umore, pasti, idratazione, igiene e mobilità oltre i soli farmaci." />
            <FeatureTile icon={<CalendarDays className="h-5 w-5" />} title="Visite e turni" body="Agenda controlli + chi è in servizio e quante ore questo mese." />
            <FeatureTile icon={<Wallet className="h-5 w-5" />} title="Spese e saldi" body="Categorie, chi ha anticipato, settlement equo in un tap." />
            <FeatureTile icon={<FileHeart className="h-5 w-5" />} title="Vault documenti" body="Referti e carte con condivisione a tempo e QR per il medico." />
            <FeatureTile icon={<Smartphone className="h-5 w-5" />} title="Turno operatore" body="Entra → cure → vitali → consegne auto → esci. Una mano, zero menu inutili." />
          </div>
        </section>

        {/* COME */}
        <section className="mt-24">
          <p className="cr-eyebrow">Come funziona</p>
          <h2 className="mt-3 font-display text-3xl font-semibold text-ink md:text-[2.6rem]">Tre passi, zero frizione</h2>
          <ol className="mt-8 grid gap-4 md:grid-cols-3">
            <Step n="01" title="Entra nella demo" body="Apri lo scenario di Nonna Elena. Oppure crea un gruppo e invita con codice paziente." />
            <Step n="02" title="Guarda le priorità" body="La home non è un menu: è una coda operativa. Risolvi i critici, copia il briefing." />
            <Step n="03" title="Chiudi il cerchio" body="Operatore timbra e consegna. Famiglia vede scorte, spese e documenti allineati." />
          </ol>
        </section>

        {/* CTA */}
        <section className="relative mt-24 overflow-hidden rounded-[2.2rem] border border-pine/25 bg-pine px-6 py-14 text-center text-white shadow-[var(--shadow)] md:px-14">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_25%_0%,rgba(63,154,114,0.5),transparent_55%)]" />
          <div className="relative">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-white/65">Pronto a provarlo</p>
            <h2 className="mt-3 font-display text-3xl font-semibold md:text-4xl">
              Vedi CareRoute sul campo, non solo sulla carta
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-base leading-relaxed text-white/80">
              La demo include dosi in ritardo, scorte critiche, pressione fuori target e un aiuto da prendere in carico —
              così capisci subito se il prodotto ti serve.
            </p>
            <div className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <button
                onClick={() => enterDemo("admin")}
                data-touch
                className="cr-btn w-full bg-white text-pine hover:bg-mist sm:w-auto sm:min-w-[15rem]"
              >
                Apri la demo famiglia
                <ArrowRight className="h-5 w-5" />
              </button>
              <Link
                href="/invito/ELENA42"
                className="cr-btn w-full border border-white/30 bg-transparent text-white hover:bg-white/10 sm:w-auto"
              >
                Entra con codice ELENA42
              </Link>
            </div>
          </div>
        </section>

        <footer className="mt-20 flex flex-col items-center gap-4 border-t border-line/50 pt-10 text-center">
          <CareRouteLogo size="sm" />
          <p className="max-w-md text-sm leading-relaxed text-muted">
            CareRoute — software di cura per chi ha bisogno di aiuto, e per chi lo offre ogni giorno
            senza potersi permettere di dimenticare nulla.
          </p>
        </footer>
      </div>
    </div>
  );
}

function StoryCard({ title, body }: { title: string; body: string }) {
  return (
    <article className="cr-panel-strong p-6">
      <h3 className="font-display text-[1.35rem] font-semibold text-ink">{title}</h3>
      <p className="mt-3 text-sm leading-relaxed text-muted">{body}</p>
    </article>
  );
}

function AudienceCard({
  icon,
  title,
  body,
}: {
  icon: React.ReactNode;
  title: string;
  body: string;
}) {
  return (
    <article className="flex gap-4 rounded-[1.4rem] border border-line/60 bg-white/60 p-5 backdrop-blur-sm transition hover:border-pine/25 hover:bg-white/85">
      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-pine/10 text-pine">
        {icon}
      </div>
      <div>
        <h3 className="font-semibold text-ink">{title}</h3>
        <p className="mt-1.5 text-sm leading-relaxed text-muted">{body}</p>
      </div>
    </article>
  );
}

function FeatureTile({
  icon,
  title,
  body,
}: {
  icon: React.ReactNode;
  title: string;
  body: string;
}) {
  return (
    <article className="group rounded-[1.35rem] border border-line/55 bg-white/55 p-5 transition hover:-translate-y-0.5 hover:border-pine/30 hover:bg-white/90 hover:shadow-[var(--shadow-soft)]">
      <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-mist text-pine transition group-hover:bg-pine group-hover:text-white">
        {icon}
      </div>
      <h3 className="mt-4 font-semibold text-ink">{title}</h3>
      <p className="mt-1.5 text-sm leading-relaxed text-muted">{body}</p>
    </article>
  );
}

function Step({ n, title, body }: { n: string; title: string; body: string }) {
  return (
    <li className="rounded-[1.4rem] border border-line/55 bg-white/50 p-6">
      <span className="font-display text-3xl font-semibold text-leaf">{n}</span>
      <h3 className="mt-3 font-semibold text-ink">{title}</h3>
      <p className="mt-2 text-sm leading-relaxed text-muted">{body}</p>
    </li>
  );
}
