create table if not exists public.gameform_snapshots (
  organization_id uuid primary key references public.organizations (id) on delete cascade,
  snapshot jsonb not null default '{}'::jsonb,
  updated_by uuid references public.users (id) on delete set null,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

alter table public.gameform_snapshots enable row level security;

create policy "gameform snapshots scoped by org" on public.gameform_snapshots
  for all using (public.can_access_org(organization_id))
  with check (public.can_write_org(organization_id));
