-- ============================================================================
-- CareRoute — Migrazione iniziale (0001_init.sql)
-- Target: Supabase (PostgreSQL 15+)
-- Contiene: estensioni, tipi enum, tabelle, indici, funzioni helper RBAC,
--           trigger, Row Level Security (RLS) per multi-tenancy per CareGroup.
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 0. ESTENSIONI
-- ----------------------------------------------------------------------------
create extension if not exists "pgcrypto";   -- gen_random_uuid()
create extension if not exists "citext";     -- email case-insensitive

-- ----------------------------------------------------------------------------
-- 1. TIPI ENUM
-- ----------------------------------------------------------------------------
create type public.group_role as enum ('admin', 'member', 'caregiver');
create type public.med_status as enum ('completed', 'skipped', 'missed');
create type public.expense_status as enum ('pending', 'settled');
create type public.expense_category as enum
  ('farmaci', 'visite_mediche', 'badante', 'trasporti', 'casa', 'alimentari', 'altro');
create type public.document_category as enum ('medical', 'legal', 'financial', 'other');
create type public.patient_alert_status as enum ('ok', 'segnalazione');

-- ----------------------------------------------------------------------------
-- 2. TABELLA users
-- Estende auth.users (Supabase Auth) con profilo applicativo.
-- ----------------------------------------------------------------------------
create table public.users (
  id            uuid primary key references auth.users (id) on delete cascade,
  email         citext not null unique,
  full_name     text not null,
  avatar_url    text,
  phone         text,                       -- utile per il bottone "Chiamata rapida"
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

comment on table public.users is
  'Profilo applicativo collegato a auth.users. role_type NON è qui: il ruolo è per-CareGroup, vedi group_members.';

-- trigger: crea automaticamente la riga public.users alla registrazione
create or replace function public.handle_new_auth_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.users (id, email, full_name, avatar_url)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data ->> 'full_name', split_part(new.email, '@', 1)),
    new.raw_user_meta_data ->> 'avatar_url'
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_auth_user();

-- ----------------------------------------------------------------------------
-- 3. TABELLA care_groups
-- ----------------------------------------------------------------------------
create table public.care_groups (
  id            uuid primary key default gen_random_uuid(),
  patient_name  text not null,
  patient_code  text not null unique default upper(substr(replace(gen_random_uuid()::text, '-', ''), 1, 8)),
  avatar_url    text,
  created_by    uuid not null references public.users (id),
  created_at    timestamptz not null default now()
);

comment on column public.care_groups.patient_code is
  'Codice breve univoco usato per invitare nuovi membri/badanti al gruppo.';

-- ----------------------------------------------------------------------------
-- 4. TABELLA group_members (RBAC per-gruppo)
-- ----------------------------------------------------------------------------
create table public.group_members (
  user_id       uuid not null references public.users (id) on delete cascade,
  care_group_id uuid not null references public.care_groups (id) on delete cascade,
  role          public.group_role not null default 'member',
  invited_by    uuid references public.users (id),
  joined_at     timestamptz not null default now(),
  primary key (user_id, care_group_id)
);

create index idx_group_members_group on public.group_members (care_group_id);
create index idx_group_members_user  on public.group_members (user_id);

-- ----------------------------------------------------------------------------
-- 5. TABELLA medications (anagrafica farmaci)
-- ----------------------------------------------------------------------------
create table public.medications (
  id            uuid primary key default gen_random_uuid(),
  care_group_id uuid not null references public.care_groups (id) on delete cascade,
  name          text not null,
  dosage        text not null,               -- es. "1 compressa", "5 ml"
  time_of_day   text[] not null default '{}', -- es. {'08:00','13:00','20:00'}
  instructions  text,
  active        boolean not null default true,
  created_by    uuid not null references public.users (id),
  created_at    timestamptz not null default now()
);

create index idx_medications_group on public.medications (care_group_id) where active;

-- ----------------------------------------------------------------------------
-- 6. TABELLA medication_logs (registro giornaliero / checklist)
-- ----------------------------------------------------------------------------
create table public.medication_logs (
  id               uuid primary key default gen_random_uuid(),
  medication_id    uuid not null references public.medications (id) on delete cascade,
  care_group_id    uuid not null references public.care_groups (id) on delete cascade,
  scheduled_for    timestamptz not null,       -- slot atteso (per raggruppare la giornata)
  taken_at         timestamptz,
  taken_by_user_id uuid references public.users (id),
  status           public.med_status not null default 'missed',
  notes            text,
  created_at       timestamptz not null default now(),
  unique (medication_id, scheduled_for)
);

create index idx_med_logs_group_date on public.medication_logs (care_group_id, scheduled_for);

-- ----------------------------------------------------------------------------
-- 7. TABELLA daily_notes (note vocali/testo dell'operatore) + patient_status
-- ----------------------------------------------------------------------------
create table public.patient_status_updates (
  id            uuid primary key default gen_random_uuid(),
  care_group_id uuid not null references public.care_groups (id) on delete cascade,
  status        public.patient_alert_status not null default 'ok',
  note          text,
  audio_url     text,                         -- nota vocale su Storage
  created_by    uuid not null references public.users (id),
  created_at    timestamptz not null default now()
);

create index idx_patient_status_group on public.patient_status_updates (care_group_id, created_at desc);

-- ----------------------------------------------------------------------------
-- 8. TABELLA expenses
-- ----------------------------------------------------------------------------
create table public.expenses (
  id             uuid primary key default gen_random_uuid(),
  care_group_id  uuid not null references public.care_groups (id) on delete cascade,
  paid_by_user_id uuid not null references public.users (id),
  amount         numeric(10,2) not null check (amount > 0),
  category       public.expense_category not null default 'altro',
  description    text,
  receipt_url    text,                        -- foto scontrino su Storage (cifrato)
  status         public.expense_status not null default 'pending',
  date           date not null default current_date,
  created_at     timestamptz not null default now()
);

create index idx_expenses_group_date on public.expenses (care_group_id, date desc);

-- ----------------------------------------------------------------------------
-- 9. TABELLA documents (Health Vault)
-- ----------------------------------------------------------------------------
create table public.documents (
  id            uuid primary key default gen_random_uuid(),
  care_group_id uuid not null references public.care_groups (id) on delete cascade,
  title         text not null,
  category      public.document_category not null default 'other',
  file_url      text not null,                -- path nel bucket privato Storage
  mime_type     text,
  file_size     bigint,
  uploaded_by   uuid not null references public.users (id),
  created_at    timestamptz not null default now()
);

create index idx_documents_group_cat on public.documents (care_group_id, category);

-- ----------------------------------------------------------------------------
-- 10. TABELLA document_shares (link/QR temporanei per consultazione medici)
-- ----------------------------------------------------------------------------
create table public.document_shares (
  id            uuid primary key default gen_random_uuid(),
  document_id   uuid not null references public.documents (id) on delete cascade,
  token         text not null unique default encode(gen_random_bytes(24), 'base64url'),
  created_by    uuid not null references public.users (id),
  expires_at    timestamptz not null default (now() + interval '24 hours'),
  max_views     int not null default 5,
  view_count    int not null default 0,
  created_at    timestamptz not null default now()
);

create index idx_doc_shares_token on public.document_shares (token);

-- ----------------------------------------------------------------------------
-- 11. FUNZIONI HELPER RBAC (usate nelle policy RLS)
-- SECURITY DEFINER per evitare ricorsione infinita nelle policy su group_members.
-- ----------------------------------------------------------------------------
create or replace function public.is_group_member(p_group_id uuid)
returns boolean
language sql
security definer
stable
set search_path = public
as $$
  select exists (
    select 1 from public.group_members
    where care_group_id = p_group_id and user_id = auth.uid()
  );
$$;

create or replace function public.get_group_role(p_group_id uuid)
returns public.group_role
language sql
security definer
stable
set search_path = public
as $$
  select role from public.group_members
  where care_group_id = p_group_id and user_id = auth.uid()
  limit 1;
$$;

create or replace function public.is_group_admin(p_group_id uuid)
returns boolean
language sql
security definer
stable
set search_path = public
as $$
  select public.get_group_role(p_group_id) = 'admin';
$$;

create or replace function public.is_group_admin_or_member(p_group_id uuid)
returns boolean
language sql
security definer
stable
set search_path = public
as $$
  select public.get_group_role(p_group_id) in ('admin', 'member');
$$;

-- ----------------------------------------------------------------------------
-- 12. ABILITAZIONE ROW LEVEL SECURITY
-- ----------------------------------------------------------------------------
alter table public.users                     enable row level security;
alter table public.care_groups               enable row level security;
alter table public.group_members             enable row level security;
alter table public.medications               enable row level security;
alter table public.medication_logs           enable row level security;
alter table public.patient_status_updates    enable row level security;
alter table public.expenses                  enable row level security;
alter table public.documents                 enable row level security;
alter table public.document_shares           enable row level security;

-- ----------------------------------------------------------------------------
-- 13. POLICY: users
-- ----------------------------------------------------------------------------
create policy "users_select_self_or_groupmates"
  on public.users for select
  using (
    id = auth.uid()
    or exists (
      select 1 from public.group_members gm1
      join public.group_members gm2 on gm1.care_group_id = gm2.care_group_id
      where gm1.user_id = auth.uid() and gm2.user_id = public.users.id
    )
  );

create policy "users_update_self"
  on public.users for update
  using (id = auth.uid());

-- ----------------------------------------------------------------------------
-- 14. POLICY: care_groups
-- ----------------------------------------------------------------------------
create policy "care_groups_select_member"
  on public.care_groups for select
  using (public.is_group_member(id));

create policy "care_groups_insert_authenticated"
  on public.care_groups for insert
  with check (created_by = auth.uid());

create policy "care_groups_update_admin"
  on public.care_groups for update
  using (public.is_group_admin(id));

create policy "care_groups_delete_admin"
  on public.care_groups for delete
  using (public.is_group_admin(id));

-- ----------------------------------------------------------------------------
-- 15. POLICY: group_members
-- ----------------------------------------------------------------------------
create policy "group_members_select_same_group"
  on public.group_members for select
  using (public.is_group_member(care_group_id));

create policy "group_members_insert_admin_or_self_join"
  on public.group_members for insert
  with check (
    public.is_group_admin(care_group_id) or user_id = auth.uid()
  );

create policy "group_members_update_admin"
  on public.group_members for update
  using (public.is_group_admin(care_group_id));

create policy "group_members_delete_admin_or_self"
  on public.group_members for delete
  using (public.is_group_admin(care_group_id) or user_id = auth.uid());

-- ----------------------------------------------------------------------------
-- 16. POLICY: medications (admin/member gestiscono, caregiver legge)
-- ----------------------------------------------------------------------------
create policy "medications_select_group_members"
  on public.medications for select
  using (public.is_group_member(care_group_id));

create policy "medications_insert_admin_member"
  on public.medications for insert
  with check (public.is_group_admin_or_member(care_group_id));

create policy "medications_update_admin_member"
  on public.medications for update
  using (public.is_group_admin_or_member(care_group_id));

create policy "medications_delete_admin"
  on public.medications for delete
  using (public.is_group_admin(care_group_id));

-- ----------------------------------------------------------------------------
-- 17. POLICY: medication_logs (tutti i ruoli, incluso caregiver, possono spuntare)
-- ----------------------------------------------------------------------------
create policy "med_logs_select_group_members"
  on public.medication_logs for select
  using (public.is_group_member(care_group_id));

create policy "med_logs_insert_group_members"
  on public.medication_logs for insert
  with check (public.is_group_member(care_group_id));

create policy "med_logs_update_group_members"
  on public.medication_logs for update
  using (public.is_group_member(care_group_id));

-- ----------------------------------------------------------------------------
-- 18. POLICY: patient_status_updates (note rapide / stato assistito)
-- ----------------------------------------------------------------------------
create policy "status_select_group_members"
  on public.patient_status_updates for select
  using (public.is_group_member(care_group_id));

create policy "status_insert_group_members"
  on public.patient_status_updates for insert
  with check (public.is_group_member(care_group_id) and created_by = auth.uid());

-- ----------------------------------------------------------------------------
-- 19. POLICY: expenses (caregiver NON ha accesso: solo admin/member)
-- ----------------------------------------------------------------------------
create policy "expenses_select_admin_member"
  on public.expenses for select
  using (public.is_group_admin_or_member(care_group_id));

create policy "expenses_insert_admin_member"
  on public.expenses for insert
  with check (public.is_group_admin_or_member(care_group_id) and paid_by_user_id = auth.uid());

create policy "expenses_update_admin_or_owner"
  on public.expenses for update
  using (
    public.is_group_admin(care_group_id)
    or (paid_by_user_id = auth.uid() and public.is_group_admin_or_member(care_group_id))
  );

create policy "expenses_delete_admin"
  on public.expenses for delete
  using (public.is_group_admin(care_group_id));

-- ----------------------------------------------------------------------------
-- 20. POLICY: documents (caregiver NON ha accesso: solo admin/member)
-- ----------------------------------------------------------------------------
create policy "documents_select_admin_member"
  on public.documents for select
  using (public.is_group_admin_or_member(care_group_id));

create policy "documents_insert_admin_member"
  on public.documents for insert
  with check (public.is_group_admin_or_member(care_group_id) and uploaded_by = auth.uid());

create policy "documents_delete_admin"
  on public.documents for delete
  using (public.is_group_admin(care_group_id));

-- ----------------------------------------------------------------------------
-- 21. POLICY: document_shares
-- Nota: la CONSULTAZIONE pubblica del link/QR da parte del medico NON passa da
-- qui (avviene via Edge Function con service_role che valida token/scadenza/
-- view_count), quindi qui limitiamo solo la CREAZIONE/GESTIONE ai membri.
-- ----------------------------------------------------------------------------
create policy "doc_shares_select_owner_group"
  on public.document_shares for select
  using (
    exists (
      select 1 from public.documents d
      where d.id = document_shares.document_id
        and public.is_group_admin_or_member(d.care_group_id)
    )
  );

create policy "doc_shares_insert_admin_member"
  on public.document_shares for insert
  with check (
    created_by = auth.uid()
    and exists (
      select 1 from public.documents d
      where d.id = document_shares.document_id
        and public.is_group_admin_or_member(d.care_group_id)
    )
  );

-- ----------------------------------------------------------------------------
-- 22. STORAGE BUCKET (referti/documenti cifrati) + policy
-- ----------------------------------------------------------------------------
insert into storage.buckets (id, name, public)
values ('care-documents', 'care-documents', false)
on conflict (id) do nothing;

-- path convenzionale: {care_group_id}/{document_id}/{filename}
create policy "storage_select_group_members"
  on storage.objects for select
  using (
    bucket_id = 'care-documents'
    and public.is_group_admin_or_member((storage.foldername(name))[1]::uuid)
  );

create policy "storage_insert_group_members"
  on storage.objects for insert
  with check (
    bucket_id = 'care-documents'
    and public.is_group_admin_or_member((storage.foldername(name))[1]::uuid)
  );

-- ----------------------------------------------------------------------------
-- 23. VISTA DI COMODO: riepilogo saldi spese per membro (per Expense Tracker)
-- ----------------------------------------------------------------------------
create view public.expense_balances as
select
  e.care_group_id,
  e.paid_by_user_id as user_id,
  u.full_name,
  sum(e.amount) filter (where e.status = 'pending') as pending_amount,
  sum(e.amount) as total_amount
from public.expenses e
join public.users u on u.id = e.paid_by_user_id
group by e.care_group_id, e.paid_by_user_id, u.full_name;

-- ============================================================================
-- FINE MIGRAZIONE 0001_init.sql
-- ============================================================================
