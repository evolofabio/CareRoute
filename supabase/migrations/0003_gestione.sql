-- CareRoute — scorte, turni e gestione (0003)
-- Estende lo schema comfort con inventory e shift calendar.

create type public.supply_kind as enum ('farmaco', 'presidio', 'igiene', 'altro');

create table public.supplies (
  id            uuid primary key default gen_random_uuid(),
  care_group_id uuid not null references public.care_groups (id) on delete cascade,
  name          text not null,
  kind          public.supply_kind not null default 'altro',
  quantity      numeric(10,2) not null default 0 check (quantity >= 0),
  unit          text not null default 'pz',
  min_quantity  numeric(10,2) not null default 0 check (min_quantity >= 0),
  expires_on    date,
  notes         text,
  updated_at    timestamptz not null default now(),
  created_at    timestamptz not null default now()
);

create index idx_supplies_group on public.supplies (care_group_id);

create table public.care_shifts (
  id            uuid primary key default gen_random_uuid(),
  care_group_id uuid not null references public.care_groups (id) on delete cascade,
  user_id       uuid not null references public.users (id) on delete cascade,
  label         text not null,
  starts_at     timestamptz not null,
  ends_at       timestamptz not null,
  notes         text,
  created_at    timestamptz not null default now(),
  check (ends_at > starts_at)
);

create index idx_care_shifts_group on public.care_shifts (care_group_id, starts_at);

alter table public.supplies enable row level security;
alter table public.care_shifts enable row level security;

create policy "supplies_select_members"
  on public.supplies for select
  using (public.is_group_member(care_group_id));

create policy "supplies_write_admin_member"
  on public.supplies for all
  using (public.is_group_admin_or_member(care_group_id))
  with check (public.is_group_admin_or_member(care_group_id));

create policy "shifts_select_members"
  on public.care_shifts for select
  using (public.is_group_member(care_group_id));

create policy "shifts_write_admin_member"
  on public.care_shifts for all
  using (public.is_group_admin_or_member(care_group_id))
  with check (public.is_group_admin_or_member(care_group_id));
