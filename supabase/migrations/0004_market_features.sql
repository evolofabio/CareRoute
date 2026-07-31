-- CareRoute 0004 — market features: scheda, compiti, aiuto, vitali, timbratura

create type public.task_status as enum ('open', 'done', 'cancelled');
create type public.help_kind as enum ('pasto', 'trasporto', 'farmacia', 'compagnia', 'spesa', 'altro');
create type public.help_status as enum ('open', 'claimed', 'done');

create table public.patient_care_cards (
  care_group_id   uuid primary key references public.care_groups (id) on delete cascade,
  birth_year      int,
  conditions      text[] not null default '{}',
  allergies       text[] not null default '{}',
  blood_type      text,
  diet_notes      text,
  preferences     text,
  avoid           text,
  mobility_notes  text,
  gp_name         text,
  pharmacy_name   text,
  pharmacy_phone  text,
  updated_at      timestamptz not null default now()
);

create table public.family_tasks (
  id             uuid primary key default gen_random_uuid(),
  care_group_id  uuid not null references public.care_groups (id) on delete cascade,
  title          text not null,
  description    text,
  assigned_to    uuid references public.users (id),
  due_date       date,
  status         public.task_status not null default 'open',
  created_by     uuid not null references public.users (id),
  created_at     timestamptz not null default now(),
  completed_at   timestamptz,
  completed_by   uuid references public.users (id)
);

create index idx_family_tasks_group on public.family_tasks (care_group_id, status);

create table public.help_requests (
  id             uuid primary key default gen_random_uuid(),
  care_group_id  uuid not null references public.care_groups (id) on delete cascade,
  title          text not null,
  kind           public.help_kind not null default 'altro',
  when_label     text not null,
  notes          text,
  status         public.help_status not null default 'open',
  created_by     uuid not null references public.users (id),
  claimed_by     uuid references public.users (id),
  created_at     timestamptz not null default now()
);

create index idx_help_requests_group on public.help_requests (care_group_id, status);

create table public.vital_readings (
  id             uuid primary key default gen_random_uuid(),
  care_group_id  uuid not null references public.care_groups (id) on delete cascade,
  recorded_at    timestamptz not null default now(),
  systolic       int,
  diastolic      int,
  weight_kg      numeric(5,2),
  temperature_c  numeric(4,1),
  pain_level     int check (pain_level is null or (pain_level >= 0 and pain_level <= 10)),
  note           text,
  created_by     uuid not null references public.users (id)
);

create index idx_vitals_group on public.vital_readings (care_group_id, recorded_at desc);

create table public.shift_punches (
  id              uuid primary key default gen_random_uuid(),
  care_group_id   uuid not null references public.care_groups (id) on delete cascade,
  user_id         uuid not null references public.users (id) on delete cascade,
  punched_in_at   timestamptz not null default now(),
  punched_out_at  timestamptz,
  note            text,
  check (punched_out_at is null or punched_out_at >= punched_in_at)
);

create index idx_punches_group on public.shift_punches (care_group_id, punched_in_at desc);

alter table public.patient_care_cards enable row level security;
alter table public.family_tasks enable row level security;
alter table public.help_requests enable row level security;
alter table public.vital_readings enable row level security;
alter table public.shift_punches enable row level security;

create policy "care_cards_select_members" on public.patient_care_cards
  for select using (public.is_group_member(care_group_id));
create policy "care_cards_write_admin_member" on public.patient_care_cards
  for all using (public.is_group_admin_or_member(care_group_id))
  with check (public.is_group_admin_or_member(care_group_id));

create policy "family_tasks_select_members" on public.family_tasks
  for select using (public.is_group_member(care_group_id));
create policy "family_tasks_write_members" on public.family_tasks
  for all using (public.is_group_member(care_group_id))
  with check (public.is_group_member(care_group_id));

create policy "help_requests_select_members" on public.help_requests
  for select using (public.is_group_member(care_group_id));
create policy "help_requests_write_members" on public.help_requests
  for all using (public.is_group_member(care_group_id))
  with check (public.is_group_member(care_group_id));

create policy "vitals_select_members" on public.vital_readings
  for select using (public.is_group_member(care_group_id));
create policy "vitals_insert_members" on public.vital_readings
  for insert with check (public.is_group_member(care_group_id) and created_by = auth.uid());

create policy "punches_select_members" on public.shift_punches
  for select using (public.is_group_member(care_group_id));
create policy "punches_write_self_or_admin" on public.shift_punches
  for all using (public.is_group_member(care_group_id) and (user_id = auth.uid() or public.is_group_admin(care_group_id)))
  with check (public.is_group_member(care_group_id) and (user_id = auth.uid() or public.is_group_admin(care_group_id)));
