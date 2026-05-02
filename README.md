# GameForm Growth System

Aplicação web inspirada na planilha estratégica da Osten Games para acompanhar maturidade, validação, crescimento e evolução por etapas de estúdios e startups.

## Stack

- Next.js + React + Tailwind CSS
- Supabase para autenticação, banco relacional e RLS
- Recharts para gráficos
- React Hook Form + Zod para formulários
- jsPDF para exportação de relatório
- Testes básicos com smoke test TypeScript

## Telas principais

- `/login`
- `/app`
- `/app/startups/new`
- `/app/modules/[slug]`
- `/app/gf-sensor`
- `/app/finance`
- `/app/roadmap`
- `/app/report`
- `/app/mentor`
- `/app/admin`

## Rodando localmente

1. Copie `.env.example` para `.env.local`.
2. Preencha as variáveis do Supabase.
3. Rode `npm install`.
4. Rode `npm run dev`.

Sem variáveis do Supabase, a aplicação entra em modo demo navegável com seleção de papel no login.

## Banco de dados

- Migração: `supabase/migrations/0001_gameform_growth_system.sql`
- Hardening de auth/RLS: `supabase/migrations/0002_auth_rls_hardening.sql`
- Seed inicial: `supabase/seed.sql`

## Segurança e permissões

- Autenticação com Supabase Auth (sessão real; sem confiar em cookie de papel em produção)
- Papéis suportados: `admin`, `mentor`, `founder`, `member`
- Isolamento por startup com RLS por `organization_id`
- Mentor com acesso apenas a startups atribuídas em `mentor_assignments`
- Auditoria automática de alterações sensíveis em `activity_logs`

## Checklist

- [x] Login com email/senha e recuperação de senha preparada
- [x] Middleware e helpers de sessão para Supabase
- [x] Dashboard com progresso, radar e alertas
- [x] Navegação lateral por módulos
- [x] Página individual de módulo com rascunho/publicação
- [x] Comparativo GF-Sensor
- [x] Financeiro 24 meses
- [x] Marcos + Gantt
- [x] Relatório executivo com exportação PDF
- [x] Painel do mentor
- [x] Painel admin Osten Games
- [x] Seed fictício
- [x] Testes unitários básicos
