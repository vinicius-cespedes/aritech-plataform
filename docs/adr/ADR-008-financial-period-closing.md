ADR-008 — Financial Period Closing

Status

Estado: Accepted
Data: 2026-08-13
Escopo: domínio financeiro
Relacionados:

- "docs/domain/FINANCIAL_DOMAIN.md"
- "docs/domain/FINANCIAL_MODEL.md"
- "docs/domain/FINANCIAL_WORKFLOWS.md"
- "docs/domain/FINANCIAL_RULES.md"
- "docs/adr/ADR-006-audit-trail.md"
- "docs/adr/ADR-007-financial-amounts-and-rounding.md"

---

1. Contexto

A Plataforma Aritech deverá produzir informações financeiras confiáveis para:

- fluxo de caixa;
- DRE gerencial;
- margem por projeto;
- capital de giro;
- indicadores financeiros;
- valuation;
- auditoria;
- tomada de decisão.

Sem um mecanismo de fechamento de períodos, lançamentos retroativos poderiam alterar silenciosamente resultados já analisados.

Exemplos de problemas que devem ser evitados:

- alteração da competência de despesas já consolidadas;
- exclusão ou modificação de pagamentos antigos;
- recebimentos retroativos sem controle;
- reclassificação de projetos em meses anteriores;
- mudanças de centros de custo após emissão de relatórios;
- desconciliação de movimentações bancárias antigas;
- alteração de retenções já consideradas;
- modificação de margens históricas;
- mudança de EBITDA histórico sem rastreabilidade.

O domínio financeiro necessita, portanto, de um mecanismo explícito de:

período aberto
↓
validação
↓
fechamento
↓
bloqueio
↓
reabertura controlada
↓
novo fechamento

---

2. Decisão

A Plataforma Aritech utilizará períodos financeiros mensais.

Cada período financeiro será representado por:

FinancialPeriod

com estados:

OPEN
CLOSING
CLOSED
REOPENED

O período mensal será a unidade padrão de fechamento do domínio financeiro.

Exemplo:

2026-07
2026-08
2026-09

---

3. Regra fundamental

Após o fechamento de um período, operações que possam alterar os resultados financeiros ou gerenciais daquele período serão bloqueadas.

Isso inclui alterações em:

- competência;
- valores;
- classificações;
- projetos;
- centros de custo;
- centros de resultado;
- rateios;
- retenções;
- pagamentos;
- recebimentos;
- conciliações;
- estornos;
- baixas;
- ajustes.

Exceções deverão ocorrer apenas através de processo explícito de reabertura ou de lançamento compensatório em período aberto.

---

4. Período financeiro

Cada período deverá possuir, no mínimo:

id
legalEntityId
year
month
startDate
endDate
status
closedAt
closedBy
reopenedAt
reopenedBy
reopeningReason
createdAt
updatedAt

Não poderão existir períodos sobrepostos para a mesma entidade legal.

---

5. Granularidade

O fechamento padrão será mensal.

Não serão criados fechamentos independentes para:

- contas a pagar;
- contas a receber;
- bancos;
- projetos;
- DRE.

Todos utilizarão o mesmo período financeiro mensal.

Isso reduz o risco de estados inconsistentes entre subdomínios.

---

6. Períodos trimestrais e anuais

Trimestres e exercícios poderão ser apresentados em relatórios, mas serão derivados dos períodos mensais.

Exemplo:

Q1 2027
=
Jan/2027
+
Fev/2027
+
Mar/2027

O fechamento anual não substituirá os fechamentos mensais.

---

7. Estado OPEN

Um período "OPEN" permite operações financeiras normais.

Exemplos:

- criação;
- edição;
- pagamento;
- recebimento;
- conciliação;
- rateio;
- classificação;
- estorno;
- cancelamento.

As demais regras de autorização e estado das entidades continuam aplicáveis.

---

8. Estado CLOSING

"CLOSING" representa período em processo de fechamento.

Nesse estado, a plataforma deverá restringir alterações relevantes.

A política inicial será:

«Durante "CLOSING", novas operações com competência no período deverão ser bloqueadas para usuários comuns.»

Usuários autorizados de controladoria poderão corrigir pendências identificadas pelo próprio processo de fechamento.

---

9. Motivo de CLOSING

O estado intermediário evita que o período continue sendo alterado enquanto:

- conciliações estão sendo finalizadas;
- classificações são revisadas;
- rateios são executados;
- pendências são tratadas;
- relatórios são validados.

---

10. Estado CLOSED

O estado "CLOSED" representa um período consolidado.

Após o fechamento:

- competência não poderá ser alterada;
- lançamentos retroativos serão bloqueados;
- classificações gerenciais serão protegidas;
- rateios serão protegidos;
- liquidações retroativas serão bloqueadas;
- conciliações serão protegidas;
- DRE histórica permanecerá estável.

---

11. Estado REOPENED

"REOPENED" representa período anteriormente fechado que foi formalmente reaberto.

A plataforma deverá distinguir:

OPEN

de:

REOPENED

para preservar a informação de que aquele período já havia sido consolidado anteriormente.

---

12. Processo de fechamento

O fluxo será:

flowchart TD
    A[Período OPEN] --> B[Solicitar fechamento]
    B --> C[Alterar para CLOSING]
    C --> D[Executar validações]
    D --> E{Existem bloqueios?}
    E -- Sim --> F[Gerar pendências]
    F --> G[Corrigir pendências]
    G --> D
    E -- Não --> H[Confirmar fechamento]
    H --> I[Salvar snapshot de fechamento]
    I --> J[Período CLOSED]

---

13. Usuário responsável

O fechamento somente poderá ser executado por usuário com permissão:

financial.period.close

A reabertura exigirá:

financial.period.reopen

Essas permissões deverão ser independentes.

---

14. Segregação de funções

A plataforma deverá permitir que a política de governança exija segregação entre:

- operador financeiro;
- responsável pela conciliação;
- responsável pelo fechamento;
- aprovador da reabertura.

No MVP, essa segregação poderá ser simplificada, mas as permissões deverão permanecer independentes.

---

15. Validações de fechamento

O fechamento deverá executar verificações automatizadas.

As validações serão classificadas como:

BLOCKING
WARNING
INFORMATIONAL

---

16. Validações BLOCKING

Bloqueios iniciais recomendados:

- lançamento sem competência;
- conta sem classificação gerencial;
- parcela com saldo negativo;
- inconsistência entre obrigação e parcelas;
- pagamento com alocações inconsistentes;
- recebimento com alocações inconsistentes;
- transferência incompleta;
- conciliação com valor superior à transação;
- entidade em estado inválido;
- aprovação obrigatória pendente em operação material.

O fechamento não poderá prosseguir com erros de integridade financeira.

---

17. Transações bancárias não conciliadas

Movimentações bancárias não conciliadas não serão necessariamente bloqueantes.

Elas deverão gerar:

WARNING

A razão é permitir fechamento mesmo quando existirem movimentações legítimas ainda em investigação.

Entretanto, o sistema deverá apresentar:

- quantidade;
- valor total;
- conta;
- antiguidade;
- justificativas.

---

18. Divergências bancárias

Divergências de saldo entre:

saldo calculado pela plataforma

e:

saldo bancário de fechamento

deverão ser tratadas como "BLOCKING", salvo quando houver justificativa formal e política específica.

---

19. Recebimentos não identificados

Recebimentos bancários sem identificação deverão gerar "WARNING".

Se ultrapassarem limite de materialidade configurado, poderão se tornar "BLOCKING".

---

20. Adiantamentos antigos

Adiantamentos não compensados deverão gerar alertas conforme antiguidade.

Exemplo:

0–30 dias
31–60 dias
61–90 dias
> 90 dias

Não serão bloqueantes por padrão.

---

21. Contas vencidas

Contas vencidas não impedem fechamento.

Elas representam situação operacional legítima.

Devem gerar indicadores, não bloqueios.

---

22. Competência

Todas as receitas e despesas utilizadas na DRE deverão possuir competência válida.

O fechamento deverá validar se existem transações relevantes sem competência.

---

23. Fechamento de caixa e competência

O fechamento mensal deverá considerar simultaneamente:

- regime de competência;
- regime de caixa.

Porém, o fechamento de um não deverá modificar semanticamente o outro.

Exemplo:

Uma despesa de julho paga em agosto:

Competência: julho
Caixa: agosto

O fechamento de julho consolida a despesa.

O fechamento de agosto consolida o pagamento.

---

24. Data limite

O sistema deverá permitir configurar uma data operacional de fechamento.

Exemplo:

Julho/2026
fechado em 05/08/2026

A data de fechamento não precisa coincidir com o último dia do mês.

---

25. Fechamento retroativo

Será permitido fechar períodos anteriores ainda abertos.

Porém, a plataforma deverá alertar se existirem períodos anteriores abertos.

Exemplo:

Junho OPEN
Julho CLOSED

Essa situação deverá ser evitada.

A política recomendada será:

«Um período somente poderá ser fechado se todos os períodos anteriores obrigatórios estiverem fechados.»

---

26. Primeiro período da plataforma

Na implantação inicial será necessário definir:

openingFinancialPeriod

e:

openingBalances

Períodos anteriores poderão existir apenas como histórico importado, sem necessidade de reconstrução completa dos eventos.

---

27. Snapshot de fechamento

A plataforma deverá registrar um snapshot lógico do fechamento.

Esse snapshot não substituirá os dados transacionais.

Deverá registrar pelo menos:

- data;
- usuário;
- período;
- quantidade de pendências;
- warnings aceitos;
- indicadores consolidados;
- hash ou versão dos dados consolidados, quando aplicável.

---

28. Finalidade do snapshot

O snapshot permitirá comparar:

resultado no momento do fechamento

com:

resultado após eventual reabertura

Isso é especialmente importante para:

- DRE;
- margem;
- valuation;
- auditoria.

---

29. Versionamento de fechamento

Cada novo fechamento deverá criar uma versão.

Exemplo:

Jul/2026 — Closing Version 1
Jul/2026 — Reopened
Jul/2026 — Closing Version 2

A versão anterior não deverá ser apagada.

---

30. Entidade conceitual

Poderá existir:

FinancialPeriodClosing

com:

id
financialPeriodId
version
closedAt
closedBy
status
blockingIssues
warnings
metricsSnapshot
previousClosingId

A modelagem física definitiva será definida no Prisma.

---

31. Reabertura

Um período fechado poderá ser reaberto somente mediante processo explícito.

Fluxo:

flowchart TD
    A[Período CLOSED] --> B[Solicitar reabertura]
    B --> C[Informar motivo]
    C --> D[Analisar impacto]
    D --> E{Exige aprovação?}
    E -- Sim --> F[Aprovação]
    F --> G{Aprovado?}
    G -- Não --> H[Solicitação rejeitada]
    G -- Sim --> I[Reabrir período]
    E -- Não --> I
    I --> J[Estado REOPENED]

---

32. Motivo obrigatório

Toda reabertura deverá registrar justificativa.

Exemplos:

- documento recebido em atraso;
- erro de competência;
- lançamento duplicado;
- classificação incorreta;
- pagamento não registrado;
- recebimento não identificado;
- correção de retenção;
- solicitação da contabilidade.

---

33. Impacto da reabertura

Antes da aprovação, o sistema deverá apresentar quando possível:

- DRE afetada;
- projetos afetados;
- margem afetada;
- caixa afetado;
- relatórios afetados;
- indicadores afetados;
- valuation potencialmente afetado.

No MVP, essa análise poderá começar de forma simplificada.

---

34. Aprovação de reabertura

A política inicial recomendada será:

«Reabertura sempre exige usuário com permissão específica.»

A aprovação em múltiplas alçadas poderá ser implementada posteriormente.

---

35. Operações após reabertura

O período "REOPENED" deverá permitir apenas operações autorizadas.

A plataforma poderá futuramente limitar a reabertura ao escopo solicitado.

Exemplo:

reabrir apenas para corrigir lançamento X

No MVP, o período reaberto poderá se comportar funcionalmente como aberto, com auditoria reforçada.

---

36. Novo fechamento obrigatório

Um período reaberto não poderá permanecer indefinidamente nesse estado.

Após a correção:

REOPENED
↓
CLOSING
↓
CLOSED

deverá ser executado novamente.

---

37. Estorno em período fechado

A política adotada será:

«O sistema não reabrirá automaticamente um período apenas para permitir estorno.»

Quando um pagamento ou recebimento de período fechado precisar ser revertido, haverá duas opções.

---

38. Opção A — Estorno no período atual

Será a opção padrão.

Exemplo:

Pagamento original: julho
Período de julho: fechado
Erro identificado: agosto

O pagamento original permanecerá em julho.

A reversão será registrada em agosto.

O vínculo entre ambos será preservado.

---

39. Benefícios do estorno no período atual

- preserva fechamento histórico;
- evita reaberturas frequentes;
- mantém trilha cronológica;
- simplifica governança;
- aproxima-se da lógica de ajustes contábeis posteriores.

---

40. Consequência

Relatórios poderão apresentar:

Julho:
Pagamento R$ 100.000

Agosto:
Estorno R$ 100.000

O sistema deverá permitir rastrear os dois como uma única cadeia de eventos.

---

41. Opção B — Reabertura

Será utilizada quando a correção precisar efetivamente alterar o período histórico.

Exemplos:

- competência materialmente incorreta;
- erro relevante de fechamento;
- obrigação registrada no período errado;
- solicitação formal de controladoria.

Nesse caso:

solicitar reabertura
↓
aprovar
↓
corrigir
↓
fechar novamente

---

42. Materialidade

A plataforma deverá permitir futuramente configurar critérios de materialidade.

Exemplo:

R$ 100
R$ 1.000
1% do faturamento

Abaixo de determinado limite, ajustes poderão preferencialmente ser lançados no período corrente.

Acima do limite, poderá ser recomendada reabertura.

A política será configurável.

---

43. Alteração de competência em período fechado

Será proibida.

Para alterar:

competenceDate

de um lançamento em período fechado, será necessária reabertura.

---

44. Alteração de vencimento

Vencimentos podem ter impacto operacional sem alterar a DRE.

Mesmo assim, se a parcela pertencer a período fechado, a plataforma deverá preservar:

originalDueDate

e registrar a alteração.

Alteração do vencimento poderá ser permitida sem reabertura se não modificar competência nem fatos históricos.

---

45. Alteração de data prevista

Datas previstas de pagamento e recebimento são projeções.

Elas poderão ser atualizadas mesmo quando a competência estiver em período fechado.

Exemplo:

Receita reconhecida em julho
Recebimento previsto inicialmente em agosto
Nova expectativa: setembro

A DRE de julho não muda.

O fluxo de caixa projetado muda.

---

46. Alteração de classificação gerencial

Classificações que afetam DRE histórica não poderão ser alteradas em período fechado.

Será necessária:

- reabertura;
- ou reclassificação compensatória no período corrente, quando a política permitir.

---

47. Alteração de projeto

Se a mudança alterar:

- margem histórica;
- custo do projeto;
- centro de resultado;

o período deverá ser reaberto.

---

48. Rateios

Rateios executados em período fechado serão imutáveis.

Novo rateio histórico exige reabertura.

---

49. Conciliação bancária em período fechado

Movimentações bancárias já conciliadas em período fechado não poderão ser desconciliadas diretamente.

Será necessário:

- reabrir o período;
- ou criar tratamento compensatório no período corrente quando aplicável.

---

50. Importação tardia de extrato

Se um extrato antigo for importado após fechamento:

1. as transações deverão ser importadas;
2. permanecerão identificadas como pertencentes à data bancária original;
3. a plataforma deverá alertar que o período correspondente está fechado;
4. conciliação retroativa poderá exigir reabertura.

---

51. Documento recebido em atraso

Exemplo:

Nota fiscal de julho recebida em agosto após fechamento de julho.

A plataforma deverá permitir duas políticas:

Competência original

Competência: julho

exige reabertura.

Competência atual

Competência: agosto

poderá ser registrada sem reabertura, se permitido pela política financeira.

A decisão operacional ficará com usuário autorizado.

---

52. Contabilidade externa

Como o MVP não substitui a contabilidade legal, poderão ocorrer ajustes solicitados pelo contador após o fechamento gerencial.

Esses ajustes deverão ser registrados como:

- nova operação;
- reclassificação;
- ajuste de competência;
- reabertura;

conforme sua natureza.

---

53. DRE histórica

Após fechamento, a DRE daquele período deverá permanecer estável.

Se ocorrer reabertura e novo fechamento, a plataforma deverá permitir comparar:

DRE versão 1
DRE versão 2

---

54. Indicadores históricos

Indicadores utilizados no valuation também deverão respeitar versões de fechamento.

Exemplo:

EBITDA Jul/2026 — Closing V1
EBITDA Jul/2026 — Closing V2

A versão vigente será a do fechamento mais recente.

As anteriores permanecerão auditáveis.

---

55. Data de corte

Consultas históricas deverão permitir usar:

asOfDate

e, quando aplicável:

closingVersion

Isso permitirá reconstruir a visão disponível em determinado momento.

---

56. Fluxo de caixa histórico

O fechamento não deverá congelar projeções futuras.

Exemplo:

No fechamento de julho:

recebimento previsto em setembro

poderá ser posteriormente alterado para outubro.

A competência de julho permanece congelada.

A previsão de caixa continua dinâmica.

---

57. Budget e forecast

Budget e forecast terão políticas próprias de versionamento.

O fechamento mensal não deverá alterar:

Budget
Baseline

O realizado fechado será utilizado para comparação contra essas versões.

---

58. Margem de projeto

A margem realizada histórica utilizará períodos fechados.

A margem projetada continuará sendo recalculada com:

- compromissos;
- forecasts;
- novos custos;
- novas receitas.

Assim:

margem realizada

pode permanecer estável enquanto:

margem projetada

continua evoluindo.

---

59. Auditoria

As seguintes operações deverão ser auditadas:

FinancialPeriodClosingStarted
FinancialPeriodClosed
FinancialPeriodReopeningRequested
FinancialPeriodReopened
FinancialPeriodClosingCancelled

---

60. Dados mínimos de auditoria

- período;
- usuário;
- data e hora;
- versão;
- motivo;
- warnings;
- blockers;
- aprovações;
- indicadores de fechamento;
- correlationId.

---

61. Eventos de domínio

Eventos recomendados:

FinancialPeriodClosingStarted
FinancialPeriodClosingFailed
FinancialPeriodClosed
FinancialPeriodReopeningRequested
FinancialPeriodReopened

---

62. Idempotência

O comando de fechamento deverá ser idempotente.

Tentar fechar duas vezes a mesma versão não poderá gerar:

- snapshots duplicados;
- eventos duplicados;
- versões conflitantes.

---

63. Concorrência

Ao iniciar fechamento:

OPEN -> CLOSING

deverá ocorrer atomicamente.

Operações concorrentes que tentem registrar dados no período durante a transição deverão ser rejeitadas ou serializadas.

---

64. Lock lógico

O estado "CLOSING" funcionará como lock lógico do domínio.

Não será necessário manter lock de banco durante todo o processo de fechamento.

Isso evita transações de longa duração.

---

65. Processo recomendado

Transaction 1:
OPEN -> CLOSING

↓ validações fora de transação longa

Transaction 2:
validar estado ainda CLOSING
criar closing snapshot
CLOSING -> CLOSED

---

66. Falha durante fechamento

Caso ocorra falha:

CLOSING

não deverá automaticamente virar "CLOSED".

A plataforma deverá permitir:

- retry;
- retorno a "OPEN", quando autorizado;
- investigação da falha.

---

67. Cancelar processo de fechamento

Usuário autorizado poderá cancelar fechamento ainda não concluído.

Fluxo:

CLOSING -> OPEN

A operação deverá ser auditada.

---

68. API

Recursos conceituais:

GET /api/v1/financial/periods
GET /api/v1/financial/periods/{id}
POST /api/v1/financial/periods/{id}/validate
POST /api/v1/financial/periods/{id}/close
POST /api/v1/financial/periods/{id}/reopen
GET /api/v1/financial/periods/{id}/closings

---

69. Endpoint de validação

Exemplo conceitual de resposta:

{
  "period": "2026-07",
  "status": "OPEN",
  "canClose": false,
  "blockingIssues": [
    {
      "code": "PAYABLE_WITHOUT_MANAGEMENT_ACCOUNT",
      "count": 3
    }
  ],
  "warnings": [
    {
      "code": "UNRECONCILED_BANK_TRANSACTION",
      "count": 5,
      "amount": "12500.0000"
    }
  ]
}

---

70. Endpoint de fechamento

O comando deverá exigir confirmação explícita.

Exemplo conceitual:

{
  "acceptWarnings": true
}

Warnings não aceitos impedirão o fechamento.

---

71. Reabertura

Exemplo conceitual:

{
  "reason": "Fornecedor enviou documento fiscal após o fechamento e a competência deve permanecer em julho."
}

---

72. Frontend

A interface de fechamento deverá apresentar:

- período;
- status;
- última validação;
- blockers;
- warnings;
- indicadores;
- conciliações pendentes;
- contas sem classificação;
- usuário responsável.

---

73. Interface de reabertura

Deverá apresentar claramente:

«A reabertura poderá alterar relatórios e indicadores históricos.»

O usuário deverá informar justificativa.

---

74. Dashboard

O dashboard financeiro deverá indicar:

Período atual: OPEN
Último período fechado: Jul/2026

Também poderá alertar:

Fechamento de Ago/2026 pendente

---

75. Jobs automáticos

A plataforma poderá executar automaticamente:

- validações preliminares;
- identificação de pendências;
- lembretes de fechamento.

O fechamento definitivo não deverá ocorrer automaticamente no MVP.

---

76. Fechamento automático futuro

Poderá ser considerado apenas quando:

- maturidade do processo aumentar;
- validações estiverem estáveis;
- conciliações forem automatizadas;
- regras administrativas estiverem maduras.

---

77. Alternativa considerada — sem fechamento

Vantagem

Maior simplicidade.

Desvantagem

Relatórios históricos poderiam mudar a qualquer momento.

Decisão

Rejeitada.

---

78. Alternativa considerada — soft close

Permitir alterações em períodos fechados apenas registrando auditoria.

Vantagem

Maior flexibilidade.

Desvantagens

- baixa confiabilidade histórica;
- DRE instável;
- difícil auditoria;
- valuation inconsistente.

Decisão

Rejeitada como comportamento padrão.

---

79. Alternativa considerada — fechamento irreversível

Uma vez fechado, nunca reabrir.

Vantagem

Máxima estabilidade.

Desvantagens

- impraticável em operação real;
- erros acontecem;
- documentos atrasam;
- contabilidade pode solicitar correções.

Decisão

Rejeitada.

---

80. Decisão adotada

Será utilizado:

hard close
+
controlled reopen

Ou seja:

- período fechado bloqueia alterações;
- reabertura é possível;
- reabertura é explícita;
- reabertura é auditada;
- novo fechamento gera nova versão.

---

81. Consequências positivas

- estabilidade histórica;
- maior confiabilidade da DRE;
- melhor auditoria;
- margens históricas consistentes;
- suporte a valuation;
- controle de alterações retroativas;
- clareza sobre ajustes.

---

82. Consequências negativas

- maior complexidade operacional;
- necessidade de processo de reabertura;
- usuários precisarão entender competência;
- documentos atrasados exigirão decisão;
- mais regras no backend.

Essas consequências são aceitáveis diante da criticidade das informações financeiras.

---

83. Impacto no Prisma

O modelo deverá prever algo conceitualmente equivalente a:

FinancialPeriod
FinancialPeriodClosing
FinancialPeriodReopening

Não é obrigatório que existam três tabelas separadas.

A implementação deverá preservar:

- estado atual;
- histórico de fechamentos;
- histórico de reaberturas.

---

84. Impacto nas entidades financeiras

Commands que modifiquem dados deverão consultar o período correspondente antes de persistir alterações.

Exemplo:

FinancialPeriodPolicy.assertCanModify(competenceDate)

ou abstração equivalente.

---

85. Impacto na API

Erros esperados:

FINANCIAL_PERIOD_CLOSED
FINANCIAL_PERIOD_CLOSING
FINANCIAL_PERIOD_ALREADY_CLOSED
FINANCIAL_PERIOD_HAS_BLOCKING_ISSUES
FINANCIAL_PERIOD_REOPEN_PERMISSION_REQUIRED

---

86. Impacto nos testes

Deverão existir testes para:

- criar lançamento em período aberto;
- bloquear lançamento em período fechado;
- fechamento com blocker;
- fechamento com warning;
- aceite de warning;
- reabertura;
- novo fechamento;
- estorno no período atual;
- alteração de data prevista após fechamento;
- bloqueio de competência retroativa;
- concorrência durante fechamento.

---

87. Exemplo completo

Julho

Despesa:
R$ 100.000

Competência:
Jul/2026

Pagamento:
Ago/2026

Julho é fechado.

Resultado:

DRE Jul:
Despesa = R$ 100.000

Fluxo Jul:
Pagamento = R$ 0

---

Agosto

Pagamento ocorre.

Fluxo Ago:
Saída = R$ 100.000

A competência de julho permanece inalterada.

---

Erro identificado em setembro

O pagamento foi feito indevidamente e precisa ser estornado.

Como agosto está fechado:

Pagamento Ago = R$ 100.000
Estorno Set = R$ 100.000

Agosto não precisa ser reaberto.

A cadeia histórica permanece rastreável.

---

88. Regra final

O princípio central deste ADR é:

«Períodos financeiros fechados representam uma visão consolidada e historicamente estável da operação da empresa. Alterações retroativas serão bloqueadas por padrão e somente ocorrerão por reabertura controlada ou ajuste explícito em período aberto.»

---

89. Próximo passo

O próximo ADR recomendado é:

docs/adr/ADR-009-bank-reconciliation.md

Ele deverá definir:

- importação de extratos;
- transações bancárias;
- matching;
- conciliação manual;
- conciliação automática;
- conciliação parcial;
- tolerâncias;
- duplicidade;
- desfazer conciliação;
- explicabilidade das sugestões;
- OFX no MVP;
- evolução para APIs bancárias e Open Finance.