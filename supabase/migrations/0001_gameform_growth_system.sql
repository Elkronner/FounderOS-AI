create extension if not exists "pgcrypto";

create type public.app_role as enum ('founder', 'mentor', 'admin');
create type public.module_status as enum ('nao_iniciado', 'em_andamento', 'concluido');

create table public.users (
  id uuid primary key references auth.users (id) on delete cascade,
  full_name text not null,
  email text not null unique,
  role public.app_role not null default 'founder',
  created_at timestamptz not null default timezone('utc', now())
);

create table public.organizations (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  cohort text,
  created_at timestamptz not null default timezone('utc', now())
);

create table public.memberships (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users (id) on delete cascade,
  organization_id uuid not null references public.organizations (id) on delete cascade,
  role public.app_role not null,
  unique (user_id, organization_id)
);

create table public.mentors (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references public.users (id) on delete cascade,
  bio text,
  expertise text[]
);

create table public.startup_profiles (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null unique references public.organizations (id) on delete cascade,
  stage text,
  website text,
  target_platforms text[],
  team_size integer,
  summary text
);

create table public.company_info (
  organization_id uuid primary key references public.organizations (id) on delete cascade,
  draft_data jsonb not null default '{}'::jsonb,
  published_data jsonb not null default '{}'::jsonb,
  status public.module_status not null default 'nao_iniciado',
  completion numeric(5,2) not null default 0,
  published_at timestamptz,
  updated_by uuid references public.users (id),
  updated_at timestamptz not null default timezone('utc', now())
);

create table public.vision_overview (like public.company_info including all);
alter table public.vision_overview add primary key (organization_id);
create table public.market_analysis (like public.company_info including all);
alter table public.market_analysis add primary key (organization_id);
create table public.competitors (like public.company_info including all);
alter table public.competitors add primary key (organization_id);
create table public.problem_analysis (like public.company_info including all);
alter table public.problem_analysis add primary key (organization_id);
create table public.empathy_map (like public.company_info including all);
alter table public.empathy_map add primary key (organization_id);
create table public.influence_map (like public.company_info including all);
alter table public.influence_map add primary key (organization_id);
create table public.value_chain (like public.company_info including all);
alter table public.value_chain add primary key (organization_id);
create table public.value_proposition_canvas (like public.company_info including all);
alter table public.value_proposition_canvas add primary key (organization_id);
create table public.buyer_persona (like public.company_info including all);
alter table public.buyer_persona add primary key (organization_id);
create table public.customer_journey (like public.company_info including all);
alter table public.customer_journey add primary key (organization_id);
create table public.pricing (like public.company_info including all);
alter table public.pricing add primary key (organization_id);
create table public.product_info (like public.company_info including all);
alter table public.product_info add primary key (organization_id);
create table public.pitch_script (like public.company_info including all);
alter table public.pitch_script add primary key (organization_id);
create table public.fundraising (like public.company_info including all);
alter table public.fundraising add primary key (organization_id);
create table public.competencies (like public.company_info including all);
alter table public.competencies add primary key (organization_id);

create table public.gf_sensor_initial (
  organization_id uuid primary key references public.organizations (id) on delete cascade,
  strategy_score numeric(5,2) default 0,
  market_score numeric(5,2) default 0,
  product_score numeric(5,2) default 0,
  operations_score numeric(5,2) default 0,
  finance_score numeric(5,2) default 0,
  fundraising_score numeric(5,2) default 0,
  notes jsonb not null default '{}'::jsonb
);

create table public.gf_sensor_current (like public.gf_sensor_initial including all);
alter table public.gf_sensor_current add primary key (organization_id);

create table public.finance_24m (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id) on delete cascade,
  month_index integer not null,
  label text not null,
  revenue numeric(12,2) not null default 0,
  costs numeric(12,2) not null default 0,
  cash_balance numeric(12,2) not null default 0,
  unique (organization_id, month_index)
);

create table public.milestones (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id) on delete cascade,
  title text not null,
  description text,
  owner text,
  due_date date,
  status public.module_status not null default 'nao_iniciado',
  completion numeric(5,2) not null default 0
);

create table public.finance_5y (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id) on delete cascade,
  fiscal_year integer not null,
  revenue numeric(14,2) not null default 0,
  ebitda numeric(14,2) not null default 0,
  headcount integer not null default 0,
  cash_needed numeric(14,2) not null default 0,
  unique (organization_id, fiscal_year)
);

create table public.gantt_items (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id) on delete cascade,
  milestone_id uuid references public.milestones (id) on delete set null,
  title text not null,
  owner text,
  start_date date,
  end_date date,
  status public.module_status not null default 'nao_iniciado',
  completion numeric(5,2) not null default 0
);

create table public.comments (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id) on delete cascade,
  module_key text not null,
  author_id uuid not null references public.users (id) on delete cascade,
  body text not null,
  created_at timestamptz not null default timezone('utc', now())
);

create table public.activity_logs (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id) on delete cascade,
  actor_id uuid references public.users (id) on delete set null,
  action text not null,
  entity_name text not null,
  entity_id text,
  meta jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default timezone('utc', now())
);

create or replace function public.current_app_role()
returns public.app_role
language sql
stable
as $$
  select coalesce((select role from public.users where id = auth.uid()), 'founder'::public.app_role);
$$;

create or replace function public.can_access_org(target_org uuid)
returns boolean
language sql
stable
as $$
  select exists (
    select 1 from public.memberships m
    where m.user_id = auth.uid() and m.organization_id = target_org
  )
  or public.current_app_role() = 'admin'::public.app_role;
$$;

alter table public.users enable row level security;
alter table public.organizations enable row level security;
alter table public.memberships enable row level security;
alter table public.mentors enable row level security;
alter table public.startup_profiles enable row level security;
alter table public.company_info enable row level security;
alter table public.vision_overview enable row level security;
alter table public.market_analysis enable row level security;
alter table public.competitors enable row level security;
alter table public.problem_analysis enable row level security;
alter table public.empathy_map enable row level security;
alter table public.influence_map enable row level security;
alter table public.value_chain enable row level security;
alter table public.value_proposition_canvas enable row level security;
alter table public.buyer_persona enable row level security;
alter table public.customer_journey enable row level security;
alter table public.pricing enable row level security;
alter table public.product_info enable row level security;
alter table public.pitch_script enable row level security;
alter table public.fundraising enable row level security;
alter table public.competencies enable row level security;
alter table public.gf_sensor_initial enable row level security;
alter table public.gf_sensor_current enable row level security;
alter table public.finance_24m enable row level security;
alter table public.milestones enable row level security;
alter table public.finance_5y enable row level security;
alter table public.gantt_items enable row level security;
alter table public.comments enable row level security;
alter table public.activity_logs enable row level security;

create policy "organizations scoped by membership" on public.organizations
  for select using (public.can_access_org(id));

create policy "memberships scoped by org" on public.memberships
  for select using (public.can_access_org(organization_id));

create policy "comments scoped by org" on public.comments
  for all using (public.can_access_org(organization_id))
  with check (public.can_access_org(organization_id));

create policy "activity scoped by org" on public.activity_logs
  for select using (public.can_access_org(organization_id));

create policy "profiles scoped by org" on public.startup_profiles
  for all using (public.can_access_org(organization_id))
  with check (public.can_access_org(organization_id));

create policy "company info scoped by org" on public.company_info
  for all using (public.can_access_org(organization_id))
  with check (public.can_access_org(organization_id));

create policy "vision overview scoped by org" on public.vision_overview
  for all using (public.can_access_org(organization_id))
  with check (public.can_access_org(organization_id));

create policy "market analysis scoped by org" on public.market_analysis
  for all using (public.can_access_org(organization_id))
  with check (public.can_access_org(organization_id));

create policy "competitors scoped by org" on public.competitors
  for all using (public.can_access_org(organization_id))
  with check (public.can_access_org(organization_id));

create policy "problem analysis scoped by org" on public.problem_analysis
  for all using (public.can_access_org(organization_id))
  with check (public.can_access_org(organization_id));

create policy "empathy map scoped by org" on public.empathy_map
  for all using (public.can_access_org(organization_id))
  with check (public.can_access_org(organization_id));

create policy "influence map scoped by org" on public.influence_map
  for all using (public.can_access_org(organization_id))
  with check (public.can_access_org(organization_id));

create policy "value chain scoped by org" on public.value_chain
  for all using (public.can_access_org(organization_id))
  with check (public.can_access_org(organization_id));

create policy "value proposition scoped by org" on public.value_proposition_canvas
  for all using (public.can_access_org(organization_id))
  with check (public.can_access_org(organization_id));

create policy "buyer persona scoped by org" on public.buyer_persona
  for all using (public.can_access_org(organization_id))
  with check (public.can_access_org(organization_id));

create policy "customer journey scoped by org" on public.customer_journey
  for all using (public.can_access_org(organization_id))
  with check (public.can_access_org(organization_id));

create policy "pricing scoped by org" on public.pricing
  for all using (public.can_access_org(organization_id))
  with check (public.can_access_org(organization_id));

create policy "product info scoped by org" on public.product_info
  for all using (public.can_access_org(organization_id))
  with check (public.can_access_org(organization_id));

create policy "pitch script scoped by org" on public.pitch_script
  for all using (public.can_access_org(organization_id))
  with check (public.can_access_org(organization_id));

create policy "fundraising scoped by org" on public.fundraising
  for all using (public.can_access_org(organization_id))
  with check (public.can_access_org(organization_id));

create policy "competencies scoped by org" on public.competencies
  for all using (public.can_access_org(organization_id))
  with check (public.can_access_org(organization_id));

create policy "gf initial scoped by org" on public.gf_sensor_initial
  for all using (public.can_access_org(organization_id))
  with check (public.can_access_org(organization_id));

create policy "gf current scoped by org" on public.gf_sensor_current
  for all using (public.can_access_org(organization_id))
  with check (public.can_access_org(organization_id));

create policy "finance 24m scoped by org" on public.finance_24m
  for all using (public.can_access_org(organization_id))
  with check (public.can_access_org(organization_id));

create policy "milestones scoped by org" on public.milestones
  for all using (public.can_access_org(organization_id))
  with check (public.can_access_org(organization_id));

create policy "finance 5y scoped by org" on public.finance_5y
  for all using (public.can_access_org(organization_id))
  with check (public.can_access_org(organization_id));

create policy "gantt scoped by org" on public.gantt_items
  for all using (public.can_access_org(organization_id))
  with check (public.can_access_org(organization_id));
