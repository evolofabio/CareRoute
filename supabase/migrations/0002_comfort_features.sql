-- CareRoute — comfort features beyond original brief
-- appointments, care checklist, wellbeing, handoffs, emergency contacts

create type public.mood_level as enum ('sereno', 'cosi_cosi', 'agitato', 'giu');
create type public.care_task_kind as enum ('igiene', 'pasto', 'idratazione', 'mobilita', 'compagnia', 'altro');
create type public.appointment_kind as enum ('visita', 'esame', 'terapia', 'altro');

alter table public.care_groups
  add column if not exists emergency_phone text,
  add column if not exists doctor_phone text,
  add column if not exists notes text;

-- Auto-add creator as admin
create or replace function public.handle_new_care_group()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.group_members (user_id, care_group_id, role, invited_by)
  values (new.created_by, new.id, 'admin', null)
  on conflict do nothing;
  return new;
end;
$$;

drop trigger if exists on_care_group_created on public.care_groups;
create trigger on_care_group_created
  after insert on public.care_groups
  for each row execute function public.handle_new_care_group();

create table public.care_checklist_items (
  id            uuid primary key default gen_random_uuid(),
  care_group_id uuid not null references public.care_groups (id) on delete cascade,
  title         text not null,
  kind          public.care_task_kind not null default 'altro',
  time_hint     text,
  done          boolean not null default false,
  done_at       timestamptz,
  done_by       uuid references public.users (id),
  date          date not null default current_date,
  created_at    timestamptz not null default now()
);

create index idx_care_checklist_group_date on public.care_checklist_items (care_group_id, date);

create table public.wellbeing_checkins (
  id            uuid primary key default gen_random_uuid(),
  care_group_id uuid not null references public.care_groups (id) on delete cascade,
  date          date not null default current_date,
  mood          public.mood_level not null default 'sereno',
  meals_ok      boolean not null default true,
  hydration_ok  boolean not null default true,
  sleep_ok      boolean not null default true,
  note          text,
  created_by    uuid not null references public.users (id),
  created_at    timestamptz not null default now(),
  unique (care_group_id, date, created_by)
);

create table public.appointments (
  id            uuid primary key default gen_random_uuid(),
  care_group_id uuid not null references public.care_groups (id) on delete cascade,
  title         text not null,
  kind          public.appointment_kind not null default 'visita',
  location      text,
  starts_at     timestamptz not null,
  notes         text,
  created_by    uuid not null references public.users (id),
  created_at    timestamptz not null default now()
);

create index idx_appointments_group_starts on public.appointments (care_group_id, starts_at);

create table public.handoff_summaries (
  id            uuid primary key default gen_random_uuid(),
  care_group_id uuid not null references public.care_groups (id) on delete cascade,
  shift_label   text not null,
  summary       text not null,
  open_alerts   text,
  created_by    uuid not null references public.users (id),
  created_at    timestamptz not null default now()
);

alter table public.care_checklist_items enable row level security;
alter table public.wellbeing_checkins enable row level security;
alter table public.appointments enable row level security;
alter table public.handoff_summaries enable row level security;

create policy "checklist_select_members" on public.care_checklist_items for select using (public.is_group_member(care_group_id));
create policy "checklist_write_members" on public.care_checklist_items for all using (public.is_group_member(care_group_id)) with check (public.is_group_member(care_group_id));

create policy "wellbeing_select_members" on public.wellbeing_checkins for select using (public.is_group_member(care_group_id));
create policy "wellbeing_insert_members" on public.wellbeing_checkins for insert with check (public.is_group_member(care_group_id) and created_by = auth.uid());

create policy "appointments_select_members" on public.appointments for select using (public.is_group_member(care_group_id));
create policy "appointments_write_admin_member" on public.appointments for all using (public.is_group_admin_or_member(care_group_id)) with check (public.is_group_admin_or_member(care_group_id));

create policy "handoff_select_members" on public.handoff_summaries for select using (public.is_group_member(care_group_id));
create policy "handoff_insert_members" on public.handoff_summaries for insert with check (public.is_group_member(care_group_id) and created_by = auth.uid());

-- Fix expense balances view to respect RLS invoker
drop view if exists public.expense_balances;
create view public.expense_balances
with (security_invoker = true)
as
select
  e.care_group_id,
  e.paid_by_user_id as user_id,
  u.full_name,
  sum(e.amount) filter (where e.status = 'pending') as pending_amount,
  sum(e.amount) as total_amount
from public.expenses e
join public.users u on u.id = e.paid_by_user_id
group by e.care_group_id, e.paid_by_user_id, u.full_name;
