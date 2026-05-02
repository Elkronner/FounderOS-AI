# PRD: Sistema Online De Avaliação De Empresas

## Objetivo

Transformar a planilha GameForm em um sistema online seguro para startups, empresas de games e empresas em geral acompanharem diagnóstico, evolução, maturidade, finanças, roadmap, captação e feedbacks com IA.

O produto não deve parecer uma planilha. A planilha é a metodologia e o contrato de cálculo; a experiência deve ser um ambiente SaaS de acompanhamento, avaliação e mentoria.

## Princípios Do Produto

- Fonte de verdade: a metodologia da planilha manda.
- Entrada controlada: usuários preenchem apenas campos abertos e selects.
- Fórmulas preservadas: resultados são somente leitura e auditáveis.
- Segurança real: autenticação, isolamento por empresa, papéis e logs.
- IA assistiva: a IA recomenda, explica e prioriza; ela não muda dados nem fórmulas sem ação humana.
- Evidência: avaliações devem pedir justificativas, anexos e comentários, não apenas notas.

## Personas

- Founder ou membro da empresa: preenche módulos, acompanha evolução, recebe feedback e publica versões.
- Mentor: revisa respostas, comenta, sugere próximos passos e acompanha progresso.
- Admin/Osten: gerencia empresas, ciclos, metodologia, permissões, auditoria e indicadores consolidados.
- Avaliador externo: acessa relatórios autorizados, sem permissão para editar dados da empresa.

## Escopo Funcional

### Módulos Baseados Nas Abas

Cada aba visível vira um módulo:

- Visão geral
- Informações da empresa
- GF-SENSOR inicial
- GF-SENSOR atual
- Tamanho de Mercado
- Concorrência e Diferenciação
- Entendimento do problema
- Mapa de Empatia
- Mapa de Influência
- Cadeia de Valor
- Canvas da Proposta de Valor
- Buyer Persona
- Jornada do cliente
- Precificação
- Informações do produto
- Projeção Financeira 24 meses
- Marcos de Desenvolvimento
- Projeção Financeira 5 anos
- Gantt / Cronograma
- Roteiro de Pitch
- Captação de investimentos
- Avaliação de competências

Abas ocultas viram tabelas internas:

- `MODELO`: status padrão.
- `Listas`: listas fiscais, referências e bases de cálculo.

### Tipos De Campo

- `input_text`: célula aberta textual.
- `input_number`: célula aberta numérica.
- `input_date`: célula aberta de data.
- `select`: célula com validação/lista.
- `formula`: célula calculada, somente leitura.
- `reference`: célula de aba oculta ou tabela auxiliar.
- `comment`: feedback de mentor/admin/IA.
- `attachment`: evidência anexada a um campo ou módulo.

### IA

A IA deve operar em quatro frentes:

- Feedback por módulo: análise de clareza, risco, lacunas e próximos passos.
- Feedback geral: diagnóstico consolidado da empresa com prioridades.
- Acompanhamento: comparação entre versões, evolução do GF-SENSOR e mudanças financeiras.
- Preparação: sugestões para pitch, captação, roadmap e validação de mercado.

Todo feedback de IA deve declarar quais campos e módulos foram usados como base.

## Modelo De Dados Recomendado

- `organizations`: empresas/startups.
- `users`: usuários autenticados.
- `memberships`: relação usuário-empresa-papel.
- `methodology_versions`: versão da planilha/metodologia.
- `workbook_sheets`: abas, estado, ordem e metadados.
- `workbook_cells`: célula original, tipo, fórmula, validação, módulo e rótulo.
- `company_workbook_values`: valores preenchidos por organização/célula/versão.
- `calculation_snapshots`: resultados calculados e congelados por publicação.
- `module_reviews`: comentários, status, responsável e decisão.
- `ai_feedback`: feedbacks gerados, prompt/contexto resumido e campos usados.
- `audit_logs`: toda leitura sensível, alteração, publicação e revisão.
- `attachments`: evidências ligadas a campo, módulo ou relatório.

## Segurança E Governança

- Usar Supabase Auth ou equivalente real, sem simulação de papel em produção.
- Enforce RLS por `organization_id` em todos os dados de empresa.
- Papéis mínimos: `admin`, `mentor`, `founder`, `member`, `viewer`.
- Mentores só veem empresas atribuídas.
- Admin vê todas, mas toda ação administrativa entra em `audit_logs`.
- Fórmulas e tabelas internas são editáveis apenas por admins de metodologia, em nova versão controlada.
- Publicações geram snapshot imutável para auditoria.

## Critérios De Aceite

- Dado um módulo com fórmula, quando o usuário abre a tela, então campos calculados aparecem somente leitura e com referência auditável à célula original.
- Dado um campo com lista na planilha, quando o usuário edita no sistema, então ele só consegue selecionar opções equivalentes à validação da célula.
- Dada uma empresa A, quando um usuário da empresa B acessa o sistema, então nenhum dado da empresa A é retornado pelo backend.
- Dado um mentor sem atribuição, quando tenta abrir uma empresa, então recebe bloqueio de acesso.
- Dado um feedback de IA, quando ele é exibido, então mostra os módulos/campos usados como base e não altera respostas automaticamente.
- Dada uma versão publicada, quando respostas posteriores mudam, então o snapshot publicado permanece preservado.

## MVP Recomendado

1. Importar inventário da planilha para metadados versionados.
2. Criar telas reais para empresa, GF-SENSOR, produto, finanças 24 meses, marcos, captação e competências.
3. Implementar autenticação, RLS, papéis e auditoria antes de uso real.
4. Implementar motor de cálculo para fórmulas críticas mapeadas.
5. Criar feedback de IA por módulo com citação dos campos usados.
6. Criar relatório executivo publicado como snapshot.

## Fora Do Escopo Inicial

- Editor visual de fórmulas.
- Alteração livre da metodologia por cada empresa.
- Importação bidirecional automática para sobrescrever a planilha original.
- IA tomando decisões de aprovação/reprovação sem revisão humana.

