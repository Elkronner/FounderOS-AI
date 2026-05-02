# Auditoria da Planilha GameForm

Fonte analisada: `Ferramenta GameForm - Desenvolvimento de Negócios (Nome do Participante) .xlsx`

Data da leitura: 2026-04-27

## Regras De Preservação

- A planilha original é a fonte de verdade da metodologia.
- Células com fórmulas viram campos calculados somente leitura no sistema.
- Células com validação/lista viram selects com as mesmas opções.
- Células abertas sem fórmula viram campos editáveis para usuários.
- Abas ocultas continuam sendo tabelas internas de referência, não telas principais.
- Nenhuma fórmula, validação, lista, célula ou aba deve ser alterada na planilha original para criar o sistema.
- O sistema online deve guardar respostas por empresa/startup e recalcular resultados a partir da mesma lógica da planilha.

## Inventário Das Abas

| Aba | Estado | Células com conteúdo | Fórmulas | Validações | Função no sistema |
| --- | --- | ---: | ---: | ---: | --- |
| MODELO | Oculta | 5 | 0 | 0 | Lista interna de status: Não iniciado, Em andamento, Concluído |
| VISÃO GERAL | Visível | 57 | 34 | 0 | Dashboard executivo e consolidação de status |
| Informações da empresa | Visível | 23 | 1 | 0 | Cadastro institucional da empresa |
| GF-SENSOR (inicial) | Visível | 230 | 17 | 16 | Diagnóstico inicial de maturidade |
| GF-SENSOR (atual) | Visível | 231 | 17 | 16 | Diagnóstico atual e evolução |
| Tamanho de Mercado | Visível | 39 | 17 | 0 | TAM/SAM/SOM e mercado-alvo |
| Concorrência e Diferenciação | Visível | 37 | 5 | 0 | Benchmark e diferenciais |
| Entendimento do problema | Visível | 36 | 0 | 0 | Hipóteses, dores e problema validado |
| Mapa de Empatia | Visível | 5 | 0 | 0 | Canvas qualitativo de cliente |
| Mapa de Influência | Visível | 5 | 0 | 0 | Stakeholders e influenciadores |
| Cadeia de Valor | Visível | 26 | 0 | 0 | Atividades e entrega de valor |
| Canvas da Proposta de Valor | Visível | 5 | 0 | 0 | Encaixe dor, ganho e proposta |
| Buyer Persona | Visível | 55 | 0 | 0 | Persona e segmentação |
| Jornada do cliente | Visível | 17 | 0 | 0 | Jornada de descoberta, adoção e retenção |
| Precificação | Visível | 51 | 3 | 0 | Modelo de preço e margem |
| Listas | Oculta | 356 | 85 | 0 | Tabelas fiscais, referências e listas auxiliares |
| Informações do produto | Visível | 120 | 28 | 4 | Produtos, tributação e premissas comerciais |
| Projeção Financeira (24 meses) | Visível | 727 | 521 | 0 | Projeção mensal detalhada |
| Marcos de Desenvolvimento | Visível | 124 | 52 | 2 | Roadmap, datas e status |
| Projeção Financeira (5 anos) | Visível | 255 | 196 | 0 | Projeção anual e cenários |
| Gantt - Marcos de Desenvolvimen | Visível | 2710 | 2639 | 0 | Cronograma calculado a partir dos marcos |
| Roteiro de Pitch | Visível | 22 | 1 | 0 | Estrutura de pitch |
| Captação de investimentos | Visível | 49 | 16 | 1 | Rodadas, valuation e captação |
| Avaliação de competências | Visível | 87 | 19 | 1 | Gaps e competências da equipe |

Totais extraídos: 24 abas, 22 visíveis, 2 ocultas, 3651 fórmulas e 40 validações/listas.

## Validações E Selects

| Aba | Célula ou intervalo | Tipo | Origem/opções |
| --- | --- | --- | --- |
| GF-SENSOR (inicial) | E4:E19, em 16 validações separadas | Lista | Blocos de opções na própria aba: E22:E85 |
| GF-SENSOR (atual) | E4:E19, em 16 validações separadas | Lista | Blocos de opções na própria aba: E22:E85 |
| Informações do produto | D3 | Lista | Simples Nacional, Lucro Presumido |
| Informações do produto | D4 | Lista | `Listas!$G$2:$G$41` |
| Informações do produto | D5 | Lista | ANEXO 1 a ANEXO 5 |
| Informações do produto | D6 | Lista | `Listas!$A$2:$A$16` |
| Marcos de Desenvolvimento | I12:I47 | Validação customizada | Data final maior que data inicial: `I12>H12` |
| Marcos de Desenvolvimento | J12:J47 | Lista | `$G$7:$G$9` |
| Captação de investimentos | D4:D8 | Lista | Decisão investimento, Valor necessário, Valuation, Investimento captado parcialmente, Investimento captado |
| Avaliação de competências | D6:L6 | Lista | 1, 2, 3 |

## Fórmulas Críticas

- Status das abas: várias telas usam `MODELO!A2:A4` e a visão geral usa `INDEX(MODELO!$A$2:$A$4, ...)` para consolidar Não iniciado, Em andamento e Concluído.
- GF-SENSOR: cada resposta em `E4:E19` é convertida em score com `LEFT(E4,1)+0`; o sistema deve extrair a nota da opção selecionada sem permitir edição direta da nota.
- Precificação: `D11 = SUM(D4:D8)*(1+D9)*(1+D10)` calcula preço/margem a partir de custos e percentuais.
- Informações do produto: usa `RegimeTributário`, `AnexoSimplesNacional`, `AliquotaLucroPresumido`, preços, custos e impostos de produtos como intervalos nomeados.
- Projeções financeiras: usam `SUM`, `EOMONTH`, referências a produtos, impostos, custos e receitas para calcular os 24 meses e 5 anos.
- Tributação: a aba `Listas` contém tabelas de Simples Nacional e fórmulas auxiliares como `PercentualSimples_ANEXO_*`, `DescontoSimples_ANEXO_*`, `RefMensalSimples` e `RefAnualSimples`.
- Gantt: deriva meses e barras de execução a partir de `Marcos de Desenvolvimento`, com fórmulas de intervalo temporal como `IF(AND(mês>=início,mês<=fim),"x","")`.
- Captação: calcula percentual captado, valuation e totais com `IFERROR`, `SUM` e `MAXIFS`.
- Competências: transforma entradas 1/2/3 em leitura de competências, mantendo células calculadas separadas das respostas.

## Implicações Para O Produto

- Cada aba visível deve virar um módulo navegável, com status, responsáveis, comentários, histórico e publicação.
- Cada módulo precisa manter o vínculo entre campo de tela e célula original, por exemplo: `GF-SENSOR (atual)!E4`.
- O banco deve armazenar respostas, seleções e anexos por organização, e resultados calculados como snapshot versionado.
- O motor de cálculo pode ser implementado em duas camadas: regras nativas para fórmulas críticas e um registro explícito da fórmula original para auditoria.
- A IA deve gerar feedback com base nos inputs, scores, evidências e evolução histórica, mas nunca substituir automaticamente fórmula ou seleção da planilha.
- O sistema deve permitir empresas de games e empresas gerais: a metodologia é a mesma, mas linguagem, exemplos e feedbacks podem ser contextualizados por setor.

