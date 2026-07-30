# CareRoute — Struttura del Progetto (MVP)

Stack: **Next.js 14 (App Router) + TypeScript + TailwindCSS + shadcn/ui + Supabase + TanStack Query**, configurato come **PWA** (next-pwa / Serwist per Service Worker, manifest, offline caching e Web Push).

```
careroute/
├── public/
│   ├── icons/                        # icone PWA (192, 512, maskable)
│   ├── manifest.webmanifest          # manifest PWA
│   └── sw.js                         # service worker generato (build)
│
├── app/
│   ├── (auth)/
│   │   ├── login/page.tsx
│   │   ├── registrati/page.tsx
│   │   └── invito/[code]/page.tsx    # onboarding tramite patient_code / invito
│   │
│   ├── (dashboard)/                  # area autenticata, layout condiviso
│   │   ├── layout.tsx                # bottom-nav mobile, guard RBAC, provider React Query
│   │   ├── oggi/
│   │   │   └── page.tsx              # Dashboard "Oggi" (Daily Feed) — modulo 1
│   │   ├── spese/
│   │   │   ├── page.tsx              # Expense Tracker — modulo 2
│   │   │   └── nuova/page.tsx
│   │   ├── documenti/
│   │   │   ├── page.tsx              # Health Vault — modulo 3
│   │   │   └── [id]/condividi/page.tsx
│   │   ├── farmaci/
│   │   │   ├── page.tsx              # gestione anagrafica farmaci (solo admin/member)
│   │   │   └── [id]/page.tsx
│   │   ├── gruppo/
│   │   │   └── page.tsx              # gestione membri e ruoli (solo admin)
│   │   └── impostazioni/page.tsx
│   │
│   ├── (caregiver)/                  # interfaccia ultra-semplificata badante
│   │   └── operatore/
│   │       ├── layout.tsx            # layout minimale, 1 mano, no menu complessi
│   │       └── page.tsx              # checklist + nota rapida + SOS
│   │
│   ├── api/
│   │   ├── push/subscribe/route.ts   # registrazione subscription Web Push
│   │   ├── push/send/route.ts        # invio notifiche (edge function trigger)
│   │   ├── documents/share/route.ts  # generazione link/QR temporaneo firmato
│   │   └── webhooks/supabase/route.ts
│   │
│   ├── layout.tsx                    # root layout, <html>, meta PWA, theme provider
│   └── globals.css                   # tailwind base + design tokens
│
├── components/
│   ├── ui/                           # shadcn/ui (button, card, checkbox, sheet, dialog...)
│   ├── daily-feed/
│   │   ├── DailyFeedDashboard.tsx    # ⭐ componente principale (vedi file dedicato)
│   │   ├── TaskTimelineItem.tsx
│   │   ├── PatientStatusBadge.tsx
│   │   └── QuickNoteSheet.tsx
│   ├── expenses/
│   │   ├── ExpenseForm.tsx
│   │   ├── ExpenseSummaryCard.tsx
│   │   └── BalanceSplitTable.tsx
│   ├── documents/
│   │   ├── VaultFolderGrid.tsx
│   │   ├── DocumentCard.tsx
│   │   └── ShareQrDialog.tsx
│   ├── caregiver/
│   │   ├── EmergencyButton.tsx
│   │   └── SimpleChecklist.tsx
│   └── shared/
│       ├── RoleGuard.tsx             # wrapper RBAC lato client
│       ├── BottomNav.tsx
│       └── OfflineBanner.tsx
│
├── lib/
│   ├── supabase/
│   │   ├── client.ts                 # client browser (anon key)
│   │   ├── server.ts                 # client server-side (SSR, cookies)
│   │   └── middleware.ts             # refresh sessione
│   ├── query/
│   │   ├── queryClient.ts            # config TanStack Query (retry, cacheTime offline)
│   │   ├── keys.ts                   # query key factory
│   │   └── hooks/
│   │       ├── useMedicationLogs.ts
│   │       ├── useExpenses.ts
│   │       ├── useDocuments.ts
│   │       └── useCareGroup.ts
│   ├── push/
│   │   └── webPush.ts
│   └── utils/
│       ├── rbac.ts                   # helper permessi per ruolo
│       ├── dates.ts
│       └── formatCurrency.ts
│
├── types/
│   └── database.ts                   # tipi generati da `supabase gen types typescript`
│
├── middleware.ts                     # protezione route + refresh auth Supabase
├── next.config.js                    # config next-pwa / Serwist
├── tailwind.config.ts
├── components.json                   # config shadcn/ui
│
└── supabase/
    ├── migrations/
    │   └── 0001_init.sql             # ⭐ schema iniziale (vedi file dedicato)
    ├── seed.sql
    └── config.toml
```

## Note architetturali chiave

- **Multi-tenancy**: isolamento dati per `care_group_id`, applicato interamente via **Row Level Security** in Postgres (mai filtri solo lato client).
- **RBAC**: il ruolo (`admin` / `member` / `caregiver`) vive in `group_members`, non in `users`, perché una stessa persona può avere ruoli diversi in `care_group` diversi (es. admin per la propria mamma, member per la suocera).
- **Offline-first**: TanStack Query con `persistQueryClient` (IndexedDB) + mutazioni ottimistiche in coda; il Service Worker gestisce caching delle risposte GET e background sync per i log farmaci registrati offline.
- **Storage cifrato**: bucket Supabase Storage privato, cifratura at-rest nativa del provider + accesso solo via URL firmate a breve scadenza generate da Edge Function.
- **Interfaccia caregiver separata**: route group `(caregiver)` con layout proprio (niente sidebar, niente moduli finanziari), per rispettare il requisito "one-hand usability".
