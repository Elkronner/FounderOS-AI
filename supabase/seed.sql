insert into public.organizations (id, name, slug, cohort)
values
  ('11111111-1111-1111-1111-111111111111', 'Nebula Forge Studio', 'nebula-forge', 'Cohort 2026.1')
on conflict (id) do nothing;

insert into public.startup_profiles (organization_id, stage, website, target_platforms, team_size, summary)
values
  (
    '11111111-1111-1111-1111-111111111111',
    'Seed readiness',
    'https://nebulaforge.example.com',
    array['PC', 'Console'],
    12,
    'Estúdio fictício focado em multiplayer tático com comunidade creator-led.'
  )
on conflict (organization_id) do nothing;

insert into public.company_info (organization_id, draft_data, published_data, status, completion)
values
  (
    '11111111-1111-1111-1111-111111111111',
    '{"team":"12 pessoas","legal":"LTDA"}'::jsonb,
    '{"team":"12 pessoas","legal":"LTDA"}'::jsonb,
    'concluido',
    100
  )
on conflict (organization_id) do nothing;

insert into public.gf_sensor_initial (
  organization_id, strategy_score, market_score, product_score, operations_score, finance_score, fundraising_score, notes
) values (
  '11111111-1111-1111-1111-111111111111',
  48, 42, 55, 50, 39, 45,
  '{"baseline":"diagnostico de entrada"}'::jsonb
)
on conflict (organization_id) do nothing;

insert into public.gf_sensor_current (
  organization_id, strategy_score, market_score, product_score, operations_score, finance_score, fundraising_score, notes
) values (
  '11111111-1111-1111-1111-111111111111',
  75, 78, 82, 73, 67, 74,
  '{"baseline":"revisao de marco trimestral"}'::jsonb
)
on conflict (organization_id) do nothing;
