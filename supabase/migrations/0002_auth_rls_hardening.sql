do $$
begin
  alter type public.app_role add value if not exists 'member';
exception
  when duplicate_object then null;
end $$;

create table if not exists public.mentor_assignments (
  id uuid primary key default gen_random_uuid(),
  mentor_user_id uuid not null references public.users (id) on delete cascade,
  organization_id uuid not null references public.organizations (id) on delete cascade,
  assigned_at timestamptz not null default timezone('utc', now()),
  unique (mentor_user_id, organization_id)
);

create index if not exists idx_memberships_org_user_role
  on public.memberships (organization_id, user_id, role);
create index if not exists idx_mentor_assignments_org_mentor
  on public.mentor_assignments (organization_id, mentor_user_id);
create index if not exists idx_activity_logs_org_created_at
  on public.activity_logs (organization_id, created_at desc);

create or replace function public.current_app_role()
returns public.app_role
language sql
stable
security definer
set search_path = public
as $$
  select coalesce((select role from public.users where id = auth.uid()), 'member'::public.app_role);
$$;

create or replace function public.is_admin()
returns boolean
language sql
stable
as $$
  select public.current_app_role() = 'admin'::public.app_role;
$$;

create or replace function public.can_access_org(target_org uuid)
returns boolean
language sql
stable
as $$
  select
    public.is_admin()
    or exists (
      select 1
      from public.memberships m
      where m.user_id = auth.uid()
        and m.organization_id = target_org
        and m.role in ('founder'::public.app_role, 'member'::public.app_role)
    )
    or exists (
      select 1
      from public.mentor_assignments ma
      where ma.mentor_user_id = auth.uid()
        and ma.organization_id = target_org
    );
$$;

create or replace function public.can_write_org(target_org uuid)
returns boolean
language sql
stable
as $$
  select
    public.is_admin()
    or exists (
      select 1
      from public.memberships m
      where m.user_id = auth.uid()
        and m.organization_id = target_org
        and m.role in ('founder'::public.app_role, 'member'::public.app_role)
    );
$$;

create or replace function public.can_comment_org(target_org uuid)
returns boolean
language sql
stable
as $$
  select
    public.can_write_org(target_org)
    or exists (
      select 1
      from public.mentor_assignments ma
      where ma.mentor_user_id = auth.uid()
        and ma.organization_id = target_org
    );
$$;

create or replace function public.can_manage_org(target_org uuid)
returns boolean
language sql
stable
as $$
  select
    public.is_admin()
    or exists (
      select 1
      from public.memberships m
      where m.user_id = auth.uid()
        and m.organization_id = target_org
        and m.role = 'founder'::public.app_role
    );
$$;

create or replace function public.handle_new_auth_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  resolved_role public.app_role := 'member'::public.app_role;
begin
  begin
    if new.raw_user_meta_data ? 'app_role' then
      resolved_role := (new.raw_user_meta_data ->> 'app_role')::public.app_role;
    end if;
  exception
    when others then
      resolved_role := 'member'::public.app_role;
  end;

  insert into public.users (id, full_name, email, role)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'full_name', split_part(new.email, '@', 1)),
    new.email,
    resolved_role
  )
  on conflict (id) do update
  set
    full_name = excluded.full_name,
    email = excluded.email,
    role = excluded.role;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_auth_user();

create or replace function public.log_sensitive_change()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  payload jsonb;
  org_id uuid;
  row_id text;
  action_name text;
begin
  payload := case when tg_op = 'DELETE' then to_jsonb(old) else to_jsonb(new) end;
  org_id := nullif(payload ->> 'organization_id', '')::uuid;

  if org_id is null then
    return coalesce(new, old);
  end if;

  row_id := coalesce(payload ->> 'id', payload ->> 'organization_id');
  action_name := case tg_op
    when 'INSERT' then 'created'
    when 'UPDATE' then 'updated'
    else 'deleted'
  end;

  insert into public.activity_logs (
    organization_id,
    actor_id,
    action,
    entity_name,
    entity_id,
    meta
  )
  values (
    org_id,
    auth.uid(),
    action_name,
    tg_table_name,
    row_id,
    jsonb_build_object(
      'operation', tg_op,
      'table', tg_table_name,
      'before', case when tg_op in ('UPDATE', 'DELETE') then to_jsonb(old) else null end,
      'after', case when tg_op in ('INSERT', 'UPDATE') then to_jsonb(new) else null end
    )
  );

  return coalesce(new, old);
end;
$$;

do $$
declare
  tbl text;
begin
  foreach tbl in array[
    'startup_profiles',
    'company_info',
    'vision_overview',
    'market_analysis',
    'competitors',
    'problem_analysis',
    'empathy_map',
    'influence_map',
    'value_chain',
    'value_proposition_canvas',
    'buyer_persona',
    'customer_journey',
    'pricing',
    'product_info',
    'pitch_script',
    'fundraising',
    'competencies',
    'gf_sensor_initial',
    'gf_sensor_current',
    'finance_24m',
    'milestones',
    'finance_5y',
    'gantt_items'
  ] loop
    execute format('drop trigger if exists trg_audit_%I on public.%I', tbl, tbl);
    execute format(
      'create trigger trg_audit_%I after insert or update or delete on public.%I for each row execute function public.log_sensitive_change()',
      tbl,
      tbl
    );
  end loop;
end $$;

drop trigger if exists trg_audit_comments on public.comments;
create trigger trg_audit_comments
  after insert or update or delete on public.comments
  for each row execute function public.log_sensitive_change();

alter table public.users enable row level security;
alter table public.organizations enable row level security;
alter table public.memberships enable row level security;
alter table public.mentors enable row level security;
alter table public.mentor_assignments enable row level security;
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

drop policy if exists "organizations scoped by membership" on public.organizations;
drop policy if exists "memberships scoped by org" on public.memberships;
drop policy if exists "comments scoped by org" on public.comments;
drop policy if exists "activity scoped by org" on public.activity_logs;
drop policy if exists "profiles scoped by org" on public.startup_profiles;
drop policy if exists "company info scoped by org" on public.company_info;
drop policy if exists "vision overview scoped by org" on public.vision_overview;
drop policy if exists "market analysis scoped by org" on public.market_analysis;
drop policy if exists "competitors scoped by org" on public.competitors;
drop policy if exists "problem analysis scoped by org" on public.problem_analysis;
drop policy if exists "empathy map scoped by org" on public.empathy_map;
drop policy if exists "influence map scoped by org" on public.influence_map;
drop policy if exists "value chain scoped by org" on public.value_chain;
drop policy if exists "value proposition scoped by org" on public.value_proposition_canvas;
drop policy if exists "buyer persona scoped by org" on public.buyer_persona;
drop policy if exists "customer journey scoped by org" on public.customer_journey;
drop policy if exists "pricing scoped by org" on public.pricing;
drop policy if exists "product info scoped by org" on public.product_info;
drop policy if exists "pitch script scoped by org" on public.pitch_script;
drop policy if exists "fundraising scoped by org" on public.fundraising;
drop policy if exists "competencies scoped by org" on public.competencies;
drop policy if exists "gf initial scoped by org" on public.gf_sensor_initial;
drop policy if exists "gf current scoped by org" on public.gf_sensor_current;
drop policy if exists "finance 24m scoped by org" on public.finance_24m;
drop policy if exists "milestones scoped by org" on public.milestones;
drop policy if exists "finance 5y scoped by org" on public.finance_5y;
drop policy if exists "gantt scoped by org" on public.gantt_items;

drop policy if exists users_select_self_or_admin on public.users;
create policy users_select_self_or_admin
  on public.users
  for select
  using (id = auth.uid() or public.is_admin());

drop policy if exists users_update_self_or_admin on public.users;
create policy users_update_self_or_admin
  on public.users
  for update
  using (id = auth.uid() or public.is_admin())
  with check (
    public.is_admin()
    or (
      id = auth.uid()
      and role = public.current_app_role()
    )
  );

drop policy if exists organizations_select_scoped on public.organizations;
create policy organizations_select_scoped
  on public.organizations
  for select
  using (public.can_access_org(id));

drop policy if exists organizations_insert_admin on public.organizations;
create policy organizations_insert_admin
  on public.organizations
  for insert
  with check (public.is_admin());

drop policy if exists organizations_update_manager on public.organizations;
create policy organizations_update_manager
  on public.organizations
  for update
  using (public.can_manage_org(id))
  with check (public.can_manage_org(id));

drop policy if exists memberships_select_scoped on public.memberships;
create policy memberships_select_scoped
  on public.memberships
  for select
  using (public.is_admin() or user_id = auth.uid() or public.can_manage_org(organization_id));

drop policy if exists memberships_manage_admin on public.memberships;
create policy memberships_manage_admin
  on public.memberships
  for all
  using (public.is_admin())
  with check (public.is_admin());

drop policy if exists mentors_select_scoped on public.mentors;
create policy mentors_select_scoped
  on public.mentors
  for select
  using (public.is_admin() or user_id = auth.uid());

drop policy if exists mentors_manage_self_or_admin on public.mentors;
create policy mentors_manage_self_or_admin
  on public.mentors
  for all
  using (public.is_admin() or user_id = auth.uid())
  with check (public.is_admin() or user_id = auth.uid());

drop policy if exists mentor_assignments_select_scoped on public.mentor_assignments;
create policy mentor_assignments_select_scoped
  on public.mentor_assignments
  for select
  using (
    public.is_admin()
    or mentor_user_id = auth.uid()
    or public.can_manage_org(organization_id)
  );

drop policy if exists mentor_assignments_manage_admin on public.mentor_assignments;
create policy mentor_assignments_manage_admin
  on public.mentor_assignments
  for all
  using (public.is_admin())
  with check (public.is_admin());

do $$
declare
  tbl text;
begin
  foreach tbl in array[
    'startup_profiles',
    'company_info',
    'vision_overview',
    'market_analysis',
    'competitors',
    'problem_analysis',
    'empathy_map',
    'influence_map',
    'value_chain',
    'value_proposition_canvas',
    'buyer_persona',
    'customer_journey',
    'pricing',
    'product_info',
    'pitch_script',
    'fundraising',
    'competencies',
    'gf_sensor_initial',
    'gf_sensor_current',
    'finance_24m',
    'milestones',
    'finance_5y',
    'gantt_items'
  ] loop
    execute format('drop policy if exists %I on public.%I', 'org_select_' || tbl, tbl);
    execute format('drop policy if exists %I on public.%I', 'org_insert_' || tbl, tbl);
    execute format('drop policy if exists %I on public.%I', 'org_update_' || tbl, tbl);
    execute format('drop policy if exists %I on public.%I', 'org_delete_' || tbl, tbl);

    execute format(
      'create policy %I on public.%I for select using (public.can_access_org(organization_id))',
      'org_select_' || tbl,
      tbl
    );
    execute format(
      'create policy %I on public.%I for insert with check (public.can_write_org(organization_id))',
      'org_insert_' || tbl,
      tbl
    );
    execute format(
      'create policy %I on public.%I for update using (public.can_access_org(organization_id)) with check (public.can_write_org(organization_id))',
      'org_update_' || tbl,
      tbl
    );
    execute format(
      'create policy %I on public.%I for delete using (public.can_write_org(organization_id))',
      'org_delete_' || tbl,
      tbl
    );
  end loop;
end $$;

drop policy if exists comments_select_scoped on public.comments;
create policy comments_select_scoped
  on public.comments
  for select
  using (public.can_access_org(organization_id));

drop policy if exists comments_insert_scoped on public.comments;
create policy comments_insert_scoped
  on public.comments
  for insert
  with check (
    public.can_comment_org(organization_id)
    and author_id = auth.uid()
  );

drop policy if exists comments_update_owner_or_admin on public.comments;
create policy comments_update_owner_or_admin
  on public.comments
  for update
  using (public.is_admin() or author_id = auth.uid())
  with check (public.is_admin() or author_id = auth.uid());

drop policy if exists comments_delete_owner_or_admin on public.comments;
create policy comments_delete_owner_or_admin
  on public.comments
  for delete
  using (public.is_admin() or author_id = auth.uid());

drop policy if exists activity_logs_select_scoped on public.activity_logs;
create policy activity_logs_select_scoped
  on public.activity_logs
  for select
  using (public.can_access_org(organization_id));

drop policy if exists activity_logs_insert_scoped on public.activity_logs;
create policy activity_logs_insert_scoped
  on public.activity_logs
  for insert
  with check (
    public.can_access_org(organization_id)
    and (actor_id is null or actor_id = auth.uid())
  );
