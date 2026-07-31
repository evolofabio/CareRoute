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
} from "lucide-react";
import { CareRouteLogo } from "@/components/shared/CareRouteLogo";
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
      {/* Wide marketing canvas */}
      <div className="mx-auto w-full max-w-5xl px-5 pb-20 pt-6 md:px-8">
        <header className="flex items-center justify-between animate-fade-up">
          <CareRouteLogo size="sm" />
          <nav className="flex items-center gap-4">
            <a href="#perche" className="hidden text-sm font-semibold text-muted hover:text-pine sm:inline">
              Perché
            </a>
            <a href="#funzioni" className="hidden text-sm font-semibold text-muted hover:text-pine sm:inline">
              Funzioni
            </a>
            <a href="#per-chi" className="hidden text-sm font-semibold text-muted hover:text-pine md:inline">
              Per chi
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

        {/* HERO — brand first, one composition */}
        <section className="relative mt-8 overflow-hidden rounded-[2.25rem] border border-line/50 bg-white/35 shadow-[var(--shadow)] animate-fade-up md:mt-12">
          <div className="pointer-events-none absolute inset-0">
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_20%_0%,rgba(61,155,116,0.28),transparent_55%),radial-gradient(ellipse_at_90%_80%,rgba(26,77,62,0.18),transparent_50%),linear-gradient(165deg,rgba(248,251,249,0.9),rgba(231,240,235,0.75))]" />
            <div className="absolute -right-16 top-10 h-64 w-64 rounded-full bg-leaf/10 blur-3xl" />
            <div className="absolute -left-10 bottom-0 h-48 w-48 rounded-full bg-pine/10 blur-3xl" />
          </div>

          <div className="relative grid items-center gap-8 px-6 py-12 md:grid-cols-[1.1fr_0.9fr] md:gap-10 md:px-12 md:py-16">
            <div>
              <p className="mb-4 inline-flex items-center gap-2 rounded-full border border-line/70 bg-white/60 px-3 py-1 text-xs font-bold uppercase tracking-[0.14em] text-pine">
                <Route className="h-3.5 w-3.5" />
                Coordinamento di cura
              </p>
              <h1 className="font-display text-[2.75rem] leading-[1.02] font-semibold text-pine-deep md:text-[3.6rem]">
                CareRoute
              </h1>
              <p className="mt-4 max-w-md text-lg leading-relaxed text-muted md:text-xl">
                La cura di chi ami, organizzata con calma. Un percorso condiviso per famiglia e
                operatori — farmaci, turni, documenti e benessere in un solo posto.
              </p>

              <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
                <button
                  onClick={() => enterDemo("admin")}
                  data-touch
                  className="cr-btn cr-btn-primary w-full sm:w-auto sm:min-w-[12.5rem]"
                >
                  Entra nella demo
                  <ArrowRight className="h-5 w-5" />
                </button>
                <button
                  onClick={() => enterDemo("caregiver")}
                  data-touch
                  className="cr-btn cr-btn-secondary w-full sm:w-auto"
                >
                  Demo operatore
                </button>
              </div>
              <p className="mt-3 text-sm text-muted">
                Nessuna registrazione · codice invito demo{" "}
                <Link href="/invito/ELENA42" className="font-bold text-pine underline-offset-2 hover:underline">
                  ELENA42
                </Link>
              </p>
            </div>

            <div className="flex flex-col items-center text-center">
              <Image
                src="/brand/careroute-logo.png"
                alt="Logo CareRoute — percorso di cura protetto"
                width={200}
                height={200}
                priority
                className="drop-shadow-md"
              />
              <p className="mt-4 max-w-[16rem] text-sm leading-relaxed text-muted">
                Un arco di riparo, una via di presenza: famiglia, operatore e assistito sullo stesso cammino.
              </p>
            </div>
          </div>
        </section>

        {/* PERCHÉ */}
        <section id="perche" className="mt-20 scroll-mt-8 animate-fade-up" style={{ animationDelay: "60ms" }}>
          <SectionEyebrow>Perché esiste</SectionEyebrow>
          <h2 className="mt-3 max-w-2xl font-display text-3xl font-semibold text-ink md:text-4xl">
            Perché assistere non dovrebbe significare sentirsi soli
          </h2>
          <div className="mt-8 grid gap-5 md:grid-cols-3">
            <StoryCard
              title="Nato dalla realtà quotidiana"
              body="Quando un familiare ha bisogno di assistenza, i messaggi si moltiplicano: «Ha preso la pastiglia?», «Chi paga la badante?», «Dov’è il referto?». CareRoute nasce per mettere ordine senza togliere umanità."
            />
            <StoryCard
              title="Un software per chi aiuta"
              body="È pensato per figli, nipoti, coniugi e operatori che ogni giorno tengono insieme la cura. Non è una cartella clinica fredda: è un percorso condiviso, chiaro e rassicurante."
            />
            <StoryCard
              title="Calma al posto del caos"
              body="Meno chiamate di emergenza per dimenticanze, più consapevolezza su cosa è stato fatto, da chi, e cosa resta da fare. La famiglia resta unita anche quando i turni cambiano."
            />
          </div>
        </section>

        {/* A CHI / A COSA SERVE */}
        <section id="per-chi" className="mt-20 scroll-mt-8">
          <SectionEyebrow>A chi è rivolto</SectionEyebrow>
          <h2 className="mt-3 font-display text-3xl font-semibold text-ink md:text-4xl">
            Per famiglie e chi lavora sul campo
          </h2>
          <div className="mt-8 grid gap-4 md:grid-cols-2">
            <AudienceCard
              icon={<Users className="h-5 w-5" />}
              title="Familiari e amministratori"
              body="Chi coordina la cura: vede la giornata, le spese, i documenti e può invitare membri con un codice semplice."
            />
            <AudienceCard
              icon={<HandHeart className="h-5 w-5" />}
              title="Operatori e badanti"
              body="Interfaccia a una mano: checklist grandi, note rapide, passaggio consegne e SOS — senza menu complicati."
            />
            <AudienceCard
              icon={<HeartHandshake className="h-5 w-5" />}
              title="Chi vive lontano"
              body="Fratelli e sorelle che non possono essere presenti ogni giorno, ma vogliono sapere che tutto procede."
            />
            <AudienceCard
              icon={<ShieldCheck className="h-5 w-5" />}
              title="Medici e specialisti (in lettura)"
              body="Condivisione temporanea di documenti con link/QR a scadenza, senza spargere allegati nei chat."
            />
          </div>
        </section>

        {/* COSA FA */}
        <section id="funzioni" className="mt-20 scroll-mt-8">
          <SectionEyebrow>A cosa serve</SectionEyebrow>
          <h2 className="mt-3 max-w-2xl font-display text-3xl font-semibold text-ink md:text-4xl">
            Tutto il percorso di cura, in un’unica app
          </h2>
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <FeatureTile icon={<Users className="h-5 w-5" />} title="Scheda del caro" body="Allergie, preferenze, mobilità e contatti — pronti per chi arriva in sostituzione." />
            <FeatureTile icon={<HeartHandshake className="h-5 w-5" />} title="Cerchio e equità" body="Compiti assegnati, richieste di aiuto claimable e trasparenza sul carico familiare." />
            <FeatureTile icon={<ShieldCheck className="h-5 w-5" />} title="Vitali e timbratura" body="Pressione, peso, dolore e ore di assistenza registrate sul campo." />
            <FeatureTile icon={<Pill className="h-5 w-5" />} title="Farmaci del giorno" body="Timeline con urgenze, ritardi e spunte ottimistiche — anche offline." />
            <FeatureTile icon={<Sparkles className="h-5 w-5" />} title="Benessere e checklist" body="Umore, pasti, idratazione, igiene e mobilità oltre i soli farmaci." />
            <FeatureTile icon={<CalendarDays className="h-5 w-5" />} title="Visite e appuntamenti" body="Prossimi controlli e terapie sempre visibili per tutta la famiglia." />
            <FeatureTile icon={<Wallet className="h-5 w-5" />} title="Spese e saldi" body="Chi ha anticipato cosa, categorie chiare e settlement in un tap." />
            <FeatureTile icon={<FileHeart className="h-5 w-5" />} title="Vault documenti" body="Referti e carte al sicuro, condivisibili con QR a tempo." />
            <FeatureTile icon={<Smartphone className="h-5 w-5" />} title="Turni e consegne" body="Handoff tra operatori, presenza in servizio e SOS a una mano." />
          </div>
        </section>

        {/* COME FUNZIONA */}
        <section className="mt-20">
          <SectionEyebrow>Come funziona</SectionEyebrow>
          <h2 className="mt-3 font-display text-3xl font-semibold text-ink md:text-4xl">Tre passi, zero frizione</h2>
          <ol className="mt-8 grid gap-4 md:grid-cols-3">
            <Step n="01" title="Entra in demo o crea il gruppo" body="Prova subito la famiglia di Nonna Elena, oppure registrati e invita con un codice." />
            <Step n="02" title="Organizza la giornata" body="Farmaci, checklist, visite e note. L’operatore vede solo ciò che gli serve." />
            <Step n="03" title="Resta allineati" body="Feed familiari, saldi spese e documenti condivisi: tutti sulla stessa strada." />
          </ol>
        </section>

        {/* CTA FINALE */}
        <section className="relative mt-20 overflow-hidden rounded-[2rem] border border-pine/20 bg-pine px-6 py-12 text-center text-white shadow-[var(--shadow)] md:px-12">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_30%_0%,rgba(61,155,116,0.45),transparent_55%)]" />
          <div className="relative">
            <h2 className="font-display text-3xl font-semibold md:text-4xl">Pronto a vedere CareRoute in azione?</h2>
            <p className="mx-auto mt-3 max-w-lg text-base text-white/80">
              Apri la demo interattiva: nessuna carta, nessuna installazione. Solo la calma di un percorso di cura ben organizzato.
            </p>
            <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <button
                onClick={() => enterDemo("admin")}
                data-touch
                className="cr-btn w-full bg-white text-pine hover:bg-mist sm:w-auto sm:min-w-[14rem]"
              >
                Apri la demo
                <ArrowRight className="h-5 w-5" />
              </button>
              <Link href="/invito/ELENA42" className="cr-btn w-full border border-white/30 bg-transparent text-white hover:bg-white/10 sm:w-auto">
                Usa codice ELENA42
              </Link>
            </div>
          </div>
        </section>

        <footer className="mt-16 flex flex-col items-center gap-3 border-t border-line/60 pt-8 text-center text-sm text-muted">
          <CareRouteLogo size="sm" />
          <p>CareRoute — software di cura per chi ha bisogno di aiuto, e per chi lo offre ogni giorno.</p>
        </footer>
      </div>
    </div>
  );
}

function SectionEyebrow({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-xs font-bold uppercase tracking-[0.16em] text-pine-mid">{children}</p>
  );
}

function StoryCard({ title, body }: { title: string; body: string }) {
  return (
    <article className="cr-panel p-5 md:p-6">
      <h3 className="font-display text-xl font-semibold text-ink">{title}</h3>
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
    <article className="flex gap-4 rounded-2xl border border-line/70 bg-white/55 p-5 backdrop-blur-sm">
      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-pine/10 text-pine">
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
    <article className="group rounded-2xl border border-line/60 bg-white/50 p-5 transition hover:border-pine/30 hover:bg-white/80">
      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-mist text-pine transition group-hover:bg-pine group-hover:text-white">
        {icon}
      </div>
      <h3 className="mt-4 font-semibold text-ink">{title}</h3>
      <p className="mt-1.5 text-sm leading-relaxed text-muted">{body}</p>
    </article>
  );
}

function Step({ n, title, body }: { n: string; title: string; body: string }) {
  return (
    <li className="rounded-2xl border border-line/60 bg-white/45 p-5">
      <span className="font-display text-2xl font-semibold text-leaf">{n}</span>
      <h3 className="mt-2 font-semibold text-ink">{title}</h3>
      <p className="mt-1.5 text-sm leading-relaxed text-muted">{body}</p>
    </li>
  );
}
