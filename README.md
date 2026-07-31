# CareRoute

Coordinamento familiare per l’assistenza quotidiana: farmaci, turni, documenti, spese e benessere — con un’interfaccia calma, leggibile e a una mano.

**Stack:** Next.js 16 (App Router) · TypeScript · Tailwind CSS 4 · Framer Motion · TanStack Query (pronto) · Supabase (schema + client) · Demo mode locale (nessuna env richiesta) · Vercel-ready · PWA manifest

---

## Logo — concetto

Il marchio CareRoute rappresenta un **percorso di cura protetto**: una via gentile che si curva in un arco-riparo, con tre punti di presenza (famiglia / operatore / assistito) lungo il cammino. Non è una croce ospedaliera né un cuore banale: comunica amore, continuità e lavoro dedicato, in palette pine/teal.

| Asset | Path |
|------|------|
| Mark raster (hero/PWA) | `public/brand/careroute-logo.png` |
| Lockup raster | `public/brand/careroute-lockup.png` |
| Mark SVG + wordmark | `components/shared/CareRouteLogo.tsx` |
| PWA 192 / 512 | `public/icons/icon-192.png`, `icon-512.png` |
| Apple touch / favicon | `public/apple-touch-icon.png`, `public/favicon.png` |

---

## Avvio locale

```bash
export NVM_DIR="$HOME/.nvm" && . "$NVM_DIR/nvm.sh" && nvm use 20
cd /Users/evolofabio/Developer/CareRoute
npm install
npm run dev
```

Apri [http://localhost:3000](http://localhost:3000).  
**Demo senza Supabase:** dalla landing scegli “Prova demo famiglia” o “Prova demo operatore”. Codice invito demo: `ELENA42`.

## Deploy su Vercel

```bash
npx vercel
# oppure collega il repo su vercel.com — framework Next.js, region fra1 (vedi vercel.json)
```

Nessuna variabile obbligatoria per l’MVP demo. Per dati reali, copia `.env.example` e applica le migrazioni in `supabase/migrations/`.

---

## Moduli shippati

| Area | Route | Note |
|------|-------|------|
| Landing brand-first | `/` | Perché / a chi / funzioni + CTA demo |
| Auth / onboarding | `/login`, `/registrati`, `/invito/[code]` | Demo session locale |
| Oggi (Daily Feed) | `/oggi` | **Cosa fare ora** — priorità, briefing, aderenza |
| Report | `/report` | Quadro operativo + equità + briefing |
| Gestione | `/gestione` | Scorte, turni, visite, vitali |
| Cerchio | `/cerchio` | Compiti, aiuto claimable, equità |
| Scheda | `/scheda` | Profilo assistito (allergie, preferenze) |
| Spese | `/spese`, `/spese/nuova` | Categorie, saldi, settlement |
| Health Vault | `/documenti`, `/documenti/[id]/condividi` | Share + QR |
| Share pubblico | `/condividi/[token]` | Link a scadenza |
| Farmaci | `/farmaci` | Anagrafica + slot orari |
| Gruppo | `/gruppo` | Membri + codice invito |
| Impostazioni | `/impostazioni` | Accessibilità, SOS, reset |
| Operatore | `/operatore` | UI a una mano caregiver |

---

## Comfort features oltre il brief originale (`_source/`)

1. **Urgenza dosi / prossime dosi** — evidenzia ritardi e slot imminenti  
2. **SOS + chiamata medico** — contatti emergenza sempre a portata  
3. **Feed note familiari** — timeline aggiornamenti sotto “Oggi”  
4. **Passaggio consegne (handoff)** — riepilogo turno per chi arriva dopo  
5. **Appuntamenti / visite** — prossimi controlli in dashboard  
6. **Check-in benessere** — umore, pasti, idratazione, sonno  
7. **Checklist cure** — igiene, pasti, mobilità oltre i soli farmaci  
8. **Modalità target grandi** — accessibilità touch per operatori  
9. **Banner offline** — feedback chiaro quando manca la rete  
10. **Condivisione documenti QR/scadenza** — link temporaneo per medici  
11. **Helper saldi spese** — chi ha anticipato cosa, settlement one-tap  
12. **Onboarding invito UX** — codice paziente chiaro (`ELENA42` in demo)  
13. **Design system pine/mist + logo** — non flat white, non purple-AI  
14. **Scorte e soglie** — alert quando farmaci/presidi scendono sotto il minimo  
15. **Turni di cura** — chi è presente e in quale fascia oraria  
16. **Scheda del caro** — allergie, preferenze, mobilità (pattern Famirelay/Cerchi)  
17. **Compiti familiari** — assegnazione e completamento (pattern CircleCare)  
18. **Richieste di aiuto** — pasti/trasporti claimable (pattern Lotsa/ianacare)  
19. **Equità contributi** — trasparenza sul carico tra familiari  
20. **Parametri vitali** — PA, peso, temperatura, dolore  
21. **Timbratura presenza** — ore assistenza operatore (pattern Seremy)  

Schema SQL: `supabase/migrations/` (`0001`…`0004_market_features`)

## Analisi mercato → priorità prodotto

Benchmark 2025–26: Caring Village, CircleCare, Famirelay, Cerchi, Seremy, Lotsa Helping Hands, Medisafe.

| Bisogno di mercato | Competitor tipico | In CareRoute |
|--------------------|-------------------|--------------|
| Scheda persona / handoff | Famirelay, Cerchi | `/scheda` |
| Task + equità fratelli | CircleCare | `/cerchio` |
| Aiuto comunità claimable | Lotsa, ianacare | tab Aiuto |
| Vitali quotidiani | Famirelay, Caring Village | `/gestione` |
| Ore badante / presenza | Seremy | punch Entra/Esci |
| Meds + vault + spese | CareZone legacy, Carevio | già MVP |

Prossimi candidati (non ancora shippati): messaggistica in-app, refill scanner, sync calendario esterno, AI assistente cura, meal-train ricorrente.

> **Nota Supabase:** sull’org EVsoftware il limite free (2 progetti attivi) è già saturo. Per collegare CareRoute: metti in pausa o elimina un progetto attivo, crea `CareRoute` in `eu-west-1`, applica le migrazioni e copia URL + anon key in `.env.local` / Vercel.

---

## Design direction

- **Tipografia:** Fraunces (brand/display) + Manrope (UI)  
- **Palette:** pine `#1A4D3E`, leaf, mist/fog atmospheric gradients, amber attenzione, rosso solo SOS  
- **Motion:** progress bar, checkbox pop, sheet spring  
- **Touch:** min 48px (56px in modalità large targets)  
- **Composition:** mobile-first max-width shell, brand hero sulla landing

---

## Note architetturali

- Multi-tenancy per `care_group_id` via RLS (quando Supabase è collegato)  
- Ruoli `admin` / `member` / `caregiver` in `group_members`  
- MVP attuale: **demo store** in `lib/demo/store.ts` (localStorage) per Vercel senza backend  
- Sorgenti originali conservati in `_source/`
