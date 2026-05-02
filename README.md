# FounderOS-AI

FounderOS AI is an AI-native operating system for entrepreneurs, startup programs, universities, accelerators, and early-stage founders who need to turn ideas into validated, structured, and investable businesses.

## Plataforma atual

Aplicação web inspirada na metodologia GameForm para acompanhar maturidade, validação, crescimento e evolução por etapas de estúdios e startups.

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
