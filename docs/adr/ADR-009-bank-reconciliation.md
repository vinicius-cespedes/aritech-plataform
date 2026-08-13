ADR-009 — Bank Reconciliation

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
- "docs/adr/ADR-008-financial-period-closing.md"

---

1. Contexto

A Plataforma Aritech deverá controlar não apenas obrigações e recebíveis, mas também aquilo que efetivamente ocorreu nas contas bancárias da empresa.

Sem conciliação bancária, podem existir diferenças entre:

- pagamentos registrados no sistema;
- recebimentos registrados no sistema;
- transferências;
- tarifas;
- rendimentos;
- lançamentos bancários;
- saldos reais das contas.

Exemplos de situações que precisam ser tratadas:

- pagamento registrado internamente, mas não localizado no banco;
- movimentação bancária sem pagamento correspondente;
- recebimento de cliente não identificado;
- pagamento agrupando várias contas;
- recebimento líquido com retenções;
- transferência entre contas;
- tarifa bancária;
- rendimento de aplicação;
- valor bancário divergente;
- pagamento duplicado;
- importação repetida do mesmo extrato.

A conciliação bancária deverá permitir responder:

«O que foi registrado internamente corresponde efetivamente ao que aconteceu no banco?»

---

2. Decisão

A Plataforma Aritech manterá separadas as seguintes entidades conceituais:

Payment / Receipt / Transfer

e:

BankTransaction

A conciliação será responsável por criar a correspondência entre esses dois mundos.

O sistema não assumirá que:

pagamento registrado
=
movimentação bancária

até que essa correspondência seja confirmada.

---

3. Princípio fundamental

A movimentação bancária será tratada como evidência externa da movimentação de caixa.

O registro interno representa a intenção ou reconhecimento operacional.

A conciliação representa a confirmação de correspondência entre ambos.

Fluxo conceitual:

Obrigação
↓
Pagamento
↓
Movimentação bancária
↓
Conciliação

ou:

Recebível
↓
Recebimento
↓
Movimentação bancária
↓
Conciliação

---

4. Fonte inicial de dados bancários

No MVP, a principal forma de entrada será:

OFX

A plataforma deverá ser preparada para suportar futuramente:

- CSV;
- APIs bancárias;
- Open Finance;
- webhooks bancários;
- integração com instituições financeiras;
- integração com plataformas de pagamento.

---

5. Razão da escolha do OFX no MVP

O OFX possui vantagens importantes para a primeira implementação:

- amplamente disponibilizado por bancos;
- simples de importar;
- não exige integração online;
- reduz dependência de APIs externas;
- permite validar o modelo de conciliação antes de adicionar automação bancária;
- acelera a implantação do módulo financeiro.

---

6. Entidades principais

A implementação deverá prever conceitualmente:

FinancialAccount
BankStatementImport
BankTransaction
BankReconciliation
ReconciliationMatch

Também se relacionará com:

Payment
Receipt
FinancialTransfer
Advance

---

7. BankStatementImport

Representa um lote de importação de extrato.

Deverá registrar:

id
financialAccountId
source
fileName
fileHash
periodStart
periodEnd
status
totalRecords
importedRecords
duplicateRecords
rejectedRecords
createdBy
createdAt

---

8. Estados do lote de importação

PENDING
PROCESSING
COMPLETED
COMPLETED_WITH_ERRORS
FAILED
CANCELLED

---

9. Preservação do arquivo original

O arquivo importado deverá ser preservado no armazenamento de documentos compatível com S3.

O domínio financeiro armazenará apenas:

documentId

ou referência equivalente.

Essa decisão mantém consistência com a política central de armazenamento de documentos.

---

10. Hash do arquivo

Todo arquivo importado deverá possuir hash calculado.

Objetivo:

- detectar importações repetidas;
- reduzir duplicidade;
- auxiliar auditoria;
- garantir rastreabilidade.

Exemplo conceitual:

SHA-256

A escolha criptográfica exata poderá seguir infraestrutura já disponível.

---

11. Arquivo duplicado

Se um arquivo com o mesmo hash já tiver sido processado para a mesma conta, o sistema deverá bloquear nova importação por padrão.

A operação poderá ser liberada apenas por usuário autorizado e com justificativa quando houver motivo real.

---

12. BankTransaction

Cada movimentação do extrato será convertida em um registro:

BankTransaction

Atributos conceituais:

id
financialAccountId
externalId
transactionDate
postingDate
amount
direction
currency
description
documentNumber
counterpartyName
counterpartyDocument
bankReference
source
status
reconciliationStatus
importBatchId
createdAt

---

13. Direção da movimentação

A direção será representada por:

CREDIT
DEBIT

O valor monetário permanecerá positivo.

Exemplo:

amount = 10000.0000
direction = DEBIT

e não:

amount = -10000

Essa abordagem mantém consistência com as demais entidades financeiras.

---

14. Data da movimentação

Quando o arquivo possuir múltiplas datas, deverá ser preservada a distinção entre:

transactionDate
postingDate

A aplicação não deverá sobrescrever uma com a outra.

---

15. Identificador externo

Quando o banco disponibilizar identificador estável da transação, ele deverá ser preservado.

Exemplos:

- FITID do OFX;
- identificador PIX;
- NSU;
- número de documento;
- identificador de transferência.

---

16. Duplicidade de transações

A plataforma não deverá confiar apenas no arquivo para evitar duplicidades.

O sistema deverá verificar candidatos utilizando, quando disponíveis:

financialAccountId
externalId
transactionDate
amount
direction
bankReference

---

17. FITID

No OFX, quando presente, o identificador:

FITID

deverá ser tratado como forte candidato a chave externa da movimentação.

Entretanto, a plataforma não deverá pressupor universalmente que todos os bancos produzam FITIDs perfeitos e globalmente únicos.

---

18. Estados de conciliação

Cada "BankTransaction" possuirá estado conceitual:

UNRECONCILED
SUGGESTED
PARTIALLY_RECONCILED
RECONCILED
DIVERGENT

---

19. UNRECONCILED

Significa que nenhuma correspondência válida foi confirmada.

---

20. SUGGESTED

Significa que o motor de matching encontrou um ou mais candidatos.

Uma sugestão não é conciliação definitiva.

---

21. PARTIALLY_RECONCILED

Parte do valor foi explicada, mas ainda existe saldo não conciliado.

Exemplo:

Transação:
R$ 100.000

Conciliado:
R$ 90.000

Pendente:
R$ 10.000

---

22. RECONCILED

Todo o valor foi explicado por correspondências válidas.

Regra:

Σ matchedAmount = bankTransaction.amount

---

23. DIVERGENT

Indica que existe incompatibilidade não resolvida.

Exemplos:

- operação interna encontrada, mas valor incompatível;
- diferença relevante;
- referência inconsistente;
- conflito de duplicidade;
- classificação pendente.

---

24. ReconciliationMatch

A associação entre movimentação bancária e operação interna será representada por:

ReconciliationMatch

Atributos conceituais:

id
bankTransactionId
targetType
targetId
matchedAmount
matchType
confidenceScore
matchedBy
matchedAt
criteria
status

---

25. Alvos de conciliação

Os principais alvos poderão ser:

PAYMENT
RECEIPT
TRANSFER
BANK_FEE
FINANCIAL_INCOME
ADVANCE
OTHER

---

26. Uma movimentação para uma operação

Caso simples:

BankTransaction R$ 10.000
↕
Payment R$ 10.000

---

27. Uma movimentação para várias operações

Caso permitido:

BankTransaction R$ 50.000
├── Payment A R$ 20.000
├── Payment B R$ 15.000
└── Payment C R$ 15.000

---

28. Várias movimentações para uma operação

Também deverá ser suportado.

Exemplo:

Um cliente paga uma única conta em duas transferências:

Receipt R$ 100.000
├── BankTransaction A R$ 60.000
└── BankTransaction B R$ 40.000

A modelagem não poderá assumir cardinalidade 1:1.

---

29. Conciliação parcial

A plataforma deverá suportar conciliação parcial nativamente.

Regra:

Σ matchedAmount <= bankTransaction.amount

---

30. Saldo não conciliado

Será calculado por:

unreconciledAmount =
bankTransaction.amount
- Σ activeMatches

Não deverá existir saldo negativo.

---

31. Matching automático

A plataforma deverá possuir um mecanismo de sugestão de correspondência.

No MVP, o matching poderá ser baseado em regras determinísticas.

Não será necessário utilizar machine learning.

---

32. Critérios iniciais de matching

Poderão ser considerados:

- valor;
- data;
- conta financeira;
- tipo da movimentação;
- contraparte;
- CNPJ/CPF;
- documento;
- PIX;
- boleto;
- referência;
- descrição;
- vencimento;
- data de pagamento ou recebimento.

---

33. Peso dos critérios

Exemplo inicial:

valor exato             50 pontos
data exata              20 pontos
documento compatível    15 pontos
contraparte compatível  10 pontos
referência compatível    5 pontos

Esses pesos serão configuráveis.

Os valores acima são orientação inicial, não regra financeira imutável.

---

34. Confidence Score

Cada sugestão poderá possuir:

confidenceScore

em escala normalizada, por exemplo:

0–100

---

35. Faixas sugeridas

Exemplo inicial:

90–100 = alta confiança
70–89  = média confiança
< 70   = baixa confiança

A política exata poderá ser ajustada após uso real.

---

36. Conciliação automática definitiva

No primeiro MVP, sugestões automáticas não deverão necessariamente ser confirmadas sem intervenção humana.

A política inicial recomendada será:

«Gerar sugestões automaticamente e exigir confirmação do usuário.»

Essa decisão reduz risco durante a fase inicial do sistema.

---

37. Evolução futura

Após acumular histórico e confiança operacional, poderá ser permitido:

auto reconcile

para correspondências de altíssima confiança.

Essa evolução deverá possuir parâmetro configurável.

---

38. Explicabilidade

Toda sugestão deverá ser explicável.

Exemplo:

Confidence: 95

Motivos:
+ valor exato
+ data dentro de 1 dia
+ CNPJ compatível
+ referência PIX compatível

Não deverá existir matching opaco sem critério auditável.

---

39. Matching por valor

O valor exato terá peso elevado.

Entretanto, valor igual não é suficiente isoladamente.

Exemplo:

Vários pagamentos mensais podem possuir:

R$ 5.000

---

40. Matching por data

A política deverá permitir janela de datas.

Exemplo:

data interna ± 3 dias

Isso considera diferenças entre:

- data de execução;
- data de compensação;
- final de semana;
- processamento bancário.

---

41. Matching por contraparte

Quando o banco disponibilizar:

- nome;
- CPF;
- CNPJ;

essas informações deverão aumentar a confiança da correspondência.

---

42. Matching por descrição

A descrição bancária poderá auxiliar, mas não será considerada evidência forte isoladamente.

Descrições bancárias frequentemente são:

- abreviadas;
- inconsistentes;
- alteradas entre bancos.

---

43. Tolerância monetária

A conciliação não utilizará tolerância monetária para compensar problemas de precisão computacional.

Os valores serão decimais exatos conforme ADR-007.

Qualquer tolerância será uma regra de negócio explícita.

---

44. Tolerância inicial

No MVP, a correspondência automática deverá preferencialmente exigir valor exato.

Diferenças deverão ser tratadas explicitamente como:

- tarifa;
- juros;
- desconto;
- retenção;
- diferença;
- ajuste.

---

45. Exemplo de tarifa bancária

Pagamento interno:

R$ 10.000

Débito bancário:

R$ 10.005

A plataforma não deverá simplesmente considerar os valores equivalentes.

Deverá registrar:

Pagamento: R$ 10.000
Tarifa: R$ 5

---

46. Retenções em recebimentos

Exemplo:

Recebível bruto:
R$ 100.000

Retenção:
R$ 6.150

Banco:
R$ 93.850

A conciliação deverá ser capaz de reconhecer:

Receipt = 93.850
Withholding = 6.150
Receivable settled = 100.000

A movimentação bancária deverá conciliar apenas o valor efetivamente recebido.

---

47. Recebimento não identificado

Quando uma entrada não possuir correspondência:

BankTransaction
status = UNRECONCILED

O usuário poderá posteriormente classificá-la como:

- adiantamento de cliente;
- aporte;
- transferência;
- rendimento financeiro;
- recebimento diverso;
- recebimento pendente de identificação.

---

48. Pagamento não identificado

Débitos sem correspondência poderão representar:

- tarifa;
- imposto;
- débito automático;
- cartão;
- pagamento não registrado;
- fraude;
- lançamento bancário.

Eles não deverão ser automaticamente convertidos em despesa sem confirmação.

---

49. Transferências entre contas

Uma transferência deve gerar:

DEBIT

na conta de origem e:

CREDIT

na conta de destino.

A plataforma deverá conciliar os dois lados com:

FinancialTransfer

---

50. Matching de transferência

Critérios fortes:

- mesmo valor;
- datas próximas;
- contas correspondentes;
- referência bancária;
- identificador da transferência.

---

51. Transferência não altera caixa consolidado

Mesmo que duas movimentações bancárias existam, relatórios consolidados não poderão contar:

saída
+
entrada

como despesa e receita.

---

52. Conciliação manual

Usuário autorizado poderá criar correspondência manual.

Permissão recomendada:

financial.reconciliation.manage

---

53. Registro da conciliação manual

Deverá registrar:

- usuário;
- timestamp;
- valores;
- alvo;
- motivo, quando aplicável;
- origem "MANUAL".

---

54. Conciliação automática confirmada pelo usuário

O "matchType" deverá preservar que a origem da sugestão foi:

RULE_BASED

mesmo após confirmação humana.

---

55. Tipos de matching

AUTOMATIC
MANUAL
RULE_BASED

"AUTOMATIC" será utilizado futuramente quando o sistema puder concluir a conciliação sem intervenção.

---

56. Desfazer conciliação

A plataforma deverá permitir desconciliação controlada.

Pré-condições:

- usuário autorizado;
- período permitido;
- justificativa;
- correspondência existente.

---

57. Histórico de desconciliação

Uma correspondência removida não deverá ser fisicamente apagada.

Poderá possuir estado:

ACTIVE
REVERSED

ou mecanismo equivalente.

---

58. Período fechado

Conciliações pertencentes a período fechado não poderão ser desfeitas diretamente.

Aplicar ADR-008.

Alternativas:

- reabrir período;
- criar tratamento compensatório no período atual, quando cabível.

---

59. BankReconciliation

Além dos matches individuais, a plataforma poderá possuir processo de conciliação por conta e período:

BankReconciliation

Atributos conceituais:

id
financialAccountId
statementPeriodStart
statementPeriodEnd
status
startedAt
startedBy
completedAt
completedBy

---

60. Estados do processo

OPEN
IN_PROGRESS
COMPLETED
REOPENED
CANCELLED

---

61. Conclusão da conciliação

Antes de concluir, o sistema deverá verificar:

- saldo inicial;
- créditos;
- débitos;
- saldo final;
- transações conciliadas;
- transações pendentes;
- divergências.

---

62. Transações pendentes

A existência de transações não conciliadas poderá não impedir a conclusão operacional, dependendo da política da empresa.

Entretanto, elas deverão permanecer explicitamente visíveis.

---

63. Saldo final

Quando o extrato fornecer saldo final, a plataforma deverá comparar:

openingBalance
+ credits
- debits

com:

closingBalance

---

64. Divergência de saldo

Diferença não explicada deverá ser tratada como erro de integridade da importação ou conciliação.

Não poderá ser ocultada por ajuste automático.

---

65. Importação parcial

A política inicial será permitir importação parcial de registros válidos quando o lote possuir erros isolados.

O resultado deverá ser:

COMPLETED_WITH_ERRORS

---

66. Registros rejeitados

Cada registro rejeitado deverá possuir:

- índice ou referência;
- conteúdo relevante;
- código do erro;
- descrição.

---

67. Atomicidade por registro

Cada transação importada deverá ser persistida de forma segura.

Não é necessário que um arquivo com milhares de linhas permaneça em uma única transação longa.

---

68. Auditoria

Eventos que deverão ser auditados:

BankStatementImported
BankTransactionCreated
ReconciliationSuggested
BankTransactionMatched
ReconciliationMatchReversed
BankReconciliationCompleted
BankReconciliationReopened

---

69. Idempotência

Importações deverão ser protegidas em dois níveis.

Arquivo

fileHash

Transação

externalId

ou composição de atributos quando identificador externo não existir.

---

70. Estratégia de chave de duplicidade

A implementação poderá utilizar restrição única condicional ou lógica equivalente para:

financialAccountId + externalId

quando "externalId" estiver disponível e for confiável.

---

71. Transações sem externalId

Quando não houver identificador confiável, a detecção poderá utilizar fingerprint.

Exemplo conceitual:

account
date
amount
direction
description
reference

---

72. Fingerprint

O fingerprint será uma heurística, não prova absoluta.

O sistema deverá distinguir:

definite duplicate

de:

possible duplicate

---

73. Segurança

Importação e conciliação deverão possuir permissões independentes.

Exemplo:

financial.bank.import
financial.bank.read
financial.reconciliation.manage
financial.reconciliation.reverse

---

74. Segregação de funções

Futuramente poderá ser exigido que:

- quem registra pagamento;
- não seja necessariamente quem concilia.

A arquitetura deverá permitir essa separação.

---

75. API

Recursos conceituais:

POST /api/v1/financial/bank-statements/import
GET  /api/v1/financial/bank-statements/{id}

GET  /api/v1/financial/bank-transactions
GET  /api/v1/financial/bank-transactions/{id}

GET  /api/v1/financial/bank-transactions/{id}/suggestions

POST /api/v1/financial/bank-transactions/{id}/matches
DELETE ou POST reverse em matches conforme design final

POST /api/v1/financial/reconciliations
POST /api/v1/financial/reconciliations/{id}/complete
POST /api/v1/financial/reconciliations/{id}/reopen

O contrato definitivo será especificado em OpenAPI.

---

76. Sugestão de conciliação

Exemplo conceitual de resposta:

{
  "bankTransactionId": "bt_123",
  "amount": "93850.0000",
  "direction": "CREDIT",
  "suggestions": [
    {
      "targetType": "RECEIPT",
      "targetId": "rcp_456",
      "confidenceScore": 95,
      "matchedAmount": "93850.0000",
      "criteria": [
        "EXACT_AMOUNT",
        "DATE_WITHIN_1_DAY",
        "COUNTERPARTY_DOCUMENT_MATCH"
      ]
    }
  ]
}

---

77. Criação de match

Exemplo conceitual:

{
  "matches": [
    {
      "targetType": "PAYMENT",
      "targetId": "pay_001",
      "matchedAmount": "20000.0000"
    },
    {
      "targetType": "PAYMENT",
      "targetId": "pay_002",
      "matchedAmount": "30000.0000"
    }
  ]
}

---

78. Validação do backend

O backend deverá validar:

Σ matchedAmount
<=
bankTransaction.amount

independentemente do frontend.

---

79. Frontend

A tela de conciliação deverá permitir visualização lado a lado.

Exemplo:

Extrato bancário | Lançamentos internos

O usuário deverá conseguir:

- filtrar;
- pesquisar;
- aceitar sugestão;
- rejeitar sugestão;
- conciliar parcialmente;
- dividir valor;
- criar classificação;
- consultar histórico.

---

80. Ordenação recomendada

Transações deverão poder ser ordenadas por:

- data;
- valor;
- status;
- confidenceScore;
- antiguidade.

---

81. Indicadores de conciliação

O dashboard poderá apresentar:

% de transações conciliadas
valor não conciliado
quantidade de pendências
tempo médio para conciliar
transações divergentes

---

82. Matching futuro com IA

A arquitetura poderá evoluir para modelos que utilizem:

- histórico do fornecedor;
- padrões de descrição;
- comportamento recorrente;
- aprendizado de decisões humanas.

Entretanto, IA deverá gerar sugestões explicáveis.

A decisão final deverá permanecer auditável.

---

83. Feedback de conciliação

Confirmações e rejeições feitas por usuários poderão ser armazenadas futuramente como sinal para melhorar modelos de matching.

Essa funcionalidade não faz parte do MVP.

---

84. Open Finance

Quando integrado, Open Finance deverá gerar o mesmo modelo interno:

BankTransaction

A origem muda.

O domínio não deverá possuir lógica financeira diferente apenas porque a transação veio por API.

---

85. Source

Possíveis valores:

OFX_IMPORT
CSV_IMPORT
BANK_API
OPEN_FINANCE
MANUAL
SYSTEM_GENERATED

---

86. Independência de fornecedor

O domínio não deverá conter entidades específicas como:

SantanderTransaction
ItauTransaction
BancoDoBrasilTransaction

Diferenças entre bancos deverão ser tratadas por adapters de infraestrutura.

---

87. Adapter de importação

Estrutura conceitual:

BankStatementParser
├── OfxBankStatementParser
├── CsvBankStatementParser
└── ApiBankStatementAdapter

O domínio recebe um modelo normalizado.

---

88. Normalização

O adapter deverá converter informações externas em algo equivalente a:

ExternalBankTransaction

antes da criação de "BankTransaction".

---

89. Erros esperados

Códigos iniciais:

BANK_STATEMENT_DUPLICATE
BANK_STATEMENT_INVALID_FORMAT
BANK_STATEMENT_ACCOUNT_MISMATCH
BANK_TRANSACTION_DUPLICATE
BANK_TRANSACTION_ALREADY_RECONCILED
BANK_TRANSACTION_MATCH_AMOUNT_EXCEEDED
RECONCILIATION_PERIOD_CLOSED
RECONCILIATION_MATCH_NOT_FOUND
RECONCILIATION_REVERSE_NOT_ALLOWED

---

90. Testes obrigatórios

Deverão existir testes para:

- importar OFX válido;
- bloquear arquivo duplicado;
- detectar transação duplicada;
- importar arquivo parcialmente inválido;
- gerar sugestão por valor;
- gerar sugestão por valor e data;
- conciliar uma operação;
- conciliar várias operações;
- conciliar parcialmente;
- bloquear valor excedente;
- desfazer match;
- bloquear desconciliação em período fechado;
- conciliar retenção;
- conciliar transferência.

---

91. Exemplo — pagamento simples

Given:

Payment = R$ 10.000

And:

BankTransaction DEBIT = R$ 10.000

When:

Match confirmado

Then:

matchedAmount = 10.000
BankTransaction = RECONCILED
Payment = RECONCILED

---

92. Exemplo — pagamento agrupado

Given:

BankTransaction DEBIT = R$ 50.000

And:

Payment A = 20.000
Payment B = 30.000

Then:

Match A = 20.000
Match B = 30.000

BankTransaction = RECONCILED

---

93. Exemplo — parcial

Given:

BankTransaction = 100.000

When:

Match = 80.000

Then:

BankTransaction = PARTIALLY_RECONCILED
Unreconciled = 20.000

---

94. Exemplo — retenção

Given:

Receivable = 100.000
Withholding = 6.150
Receipt = 93.850
BankTransaction = 93.850

When:

Receipt conciliado ao banco

Then:

BankTransaction = RECONCILED
Receipt = RECONCILED
Receivable = SETTLED

---

95. Exemplo — transferência

Given:

Transfer = 30.000

Bank A:

DEBIT 30.000

Bank B:

CREDIT 30.000

Both:

matched to same FinancialTransfer

O resultado consolidado continua neutro.

---

96. Alternativa considerada — pagamento cria movimentação bancária definitiva

Vantagem

Modelo mais simples.

Desvantagem

Assume que toda operação registrada aconteceu no banco.

Isso dificulta:

- divergências;
- falhas;
- lançamentos antecipados;
- compensação;
- conciliação real.

Decisão

Rejeitada.

---

97. Alternativa considerada — BankTransaction como única fonte

Nesse modelo não existiriam "Payment" ou "Receipt" independentes.

Vantagem

Menos entidades.

Desvantagens

- perde intenção financeira;
- dificulta contas a pagar;
- pagamentos programados;
- alocações;
- retenções;
- controles gerenciais.

Decisão

Rejeitada.

---

98. Alternativa considerada — conciliação obrigatoriamente 1:1

Vantagem

Implementação simples.

Desvantagem

Não representa operações reais como:

- pagamentos agrupados;
- recebimentos fracionados;
- transferências;
- conciliações parciais.

Decisão

Rejeitada.

---

99. Alternativa considerada — auto reconciliação total no MVP

Vantagem

Maior automação.

Desvantagem

Risco operacional elevado sem histórico real suficiente para calibrar as regras.

Decisão

Rejeitada no primeiro momento.

---

100. Decisão adotada

A plataforma utilizará:

BankTransaction separado
+
ReconciliationMatch N:N
+
matching baseado em regras
+
confirmação humana no MVP
+
suporte a conciliação parcial

---

101. Consequências positivas

- alta rastreabilidade;
- representação fiel da realidade bancária;
- suporte a pagamentos agrupados;
- suporte a recebimentos fracionados;
- possibilidade de automação futura;
- melhor controle de divergências;
- fluxo de caixa confiável;
- evolução natural para Open Finance.

---

102. Consequências negativas

- maior número de entidades;
- lógica de matching mais complexa;
- necessidade de interface dedicada;
- necessidade de tratamento de exceções;
- usuários precisarão realizar conciliação inicialmente.

Esses custos são aceitáveis devido à importância do processo.

---

103. Impacto no Prisma

O primeiro schema financeiro deverá contemplar, no mínimo:

FinancialAccount
BankStatementImport
BankTransaction
BankReconciliation
ReconciliationMatch

Além das entidades de:

Payment
Receipt
FinancialTransfer

---

104. Impacto na arquitetura

Parsers bancários deverão ficar na camada de infraestrutura.

Exemplo:

financial/
└── infrastructure/
    └── banking/
        ├── parsers/
        │   └── ofx/
        └── adapters/

O domínio não deverá depender do formato OFX.

---

105. Impacto no fluxo de caixa

Para o caixa realizado, a plataforma deverá evitar dupla contagem.

Se um "Payment" estiver associado a "BankTransaction", o relatório não poderá somar ambos.

A fonte lógica deverá ser definida de forma consistente.

---

106. Fonte recomendada para caixa realizado

A fonte primária do caixa realizado será a liquidação financeira confirmada.

A conciliação bancária confirmará sua ocorrência no extrato.

Relatórios bancários poderão usar "BankTransaction".

Relatórios financeiros poderão usar "Payment" e "Receipt", garantindo vínculo com o banco quando aplicável.

---

107. Regra de dupla contagem

Nunca:

Payment
+
BankTransaction correspondente

como duas saídas.

Eles representam perspectivas diferentes do mesmo fato.

---

108. Regra final

O princípio central deste ADR é:

«A Plataforma Aritech manterá separadas as operações financeiras internas e as movimentações bancárias externas, utilizando uma camada explícita de conciliação capaz de representar relações N:N, conciliações parciais e sugestões explicáveis.»

---

109. Próximo passo

O próximo ADR recomendado é:

docs/adr/ADR-010-financial-domain-events.md

Ele deverá definir:

- eventos internos do monólito modular;
- publicação após commit;
- idempotência;
- handlers;
- integração entre módulos;
- falhas;
- retries;
- correlação;
- eventual Outbox;
- distinção entre Domain Events e Integration Events.