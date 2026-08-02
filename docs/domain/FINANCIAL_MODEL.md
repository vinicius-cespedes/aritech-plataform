Financial Domain Model

Status

Estado: proposta inicial
Escopo: modelo conceitual do domínio financeiro
Arquitetura: monólito modular
Persistência prevista: PostgreSQL e Prisma
Integração: API REST com OpenAPI
Documento relacionado: "docs/domain/FINANCIAL_DOMAIN.md"

---

1. Objetivo

Este documento define o modelo conceitual do núcleo financeiro da Plataforma Aritech.

Seu objetivo é transformar as regras apresentadas em "FINANCIAL_DOMAIN.md" em uma estrutura implementável, estabelecendo:

- entidades;
- agregados;
- raízes de agregados;
- objetos de valor;
- relacionamentos;
- cardinalidades;
- estados;
- invariantes;
- eventos de domínio;
- limites transacionais;
- responsabilidades entre módulos;
- escopo prioritário do MVP.

Este documento não substitui o schema do Prisma, as migrações do banco de dados, os contratos OpenAPI ou as regras detalhadas dos casos de uso.

O modelo físico será elaborado posteriormente, respeitando as decisões conceituais registradas neste documento.

---

2. Princípios de modelagem

2.1 Separação entre obrigação, liquidação e movimentação bancária

O modelo deve distinguir três fatos diferentes:

1. a existência de uma obrigação financeira;
2. a liquidação total ou parcial dessa obrigação;
3. a movimentação efetivamente identificada em uma conta financeira.

Exemplo de conta a pagar:

Conta a pagar
    ↓
Parcela
    ↓
Pagamento
    ↓
Movimentação bancária

A conta a pagar representa a obrigação.

A parcela representa uma fração exigível da obrigação.

O pagamento representa a liquidação financeira da parcela.

A movimentação bancária representa a saída efetivamente registrada na conta bancária.

Esses registros poderão ser criados em momentos diferentes.

---

2.2 Separação entre regime de competência e regime de caixa

O modelo deverá armazenar separadamente:

- data de competência;
- data de vencimento;
- data de liquidação;
- data da movimentação bancária;
- data de conciliação.

A data de competência será utilizada na DRE gerencial.

A data de liquidação ou movimentação será utilizada no fluxo de caixa realizado.

A data de vencimento será utilizada no fluxo de caixa previsto.

---

2.3 Imutabilidade dos fatos financeiros

Registros financeiros que já produziram efeito não poderão ser fisicamente apagados.

Correções deverão ocorrer por:

- cancelamento, quando ainda não houver efeito financeiro;
- estorno, quando o efeito financeiro já tiver ocorrido;
- lançamento compensatório;
- reclassificação auditada;
- reabertura formal de período.

---

2.4 Valores monetários

Valores monetários nunca deverão ser armazenados utilizando tipos de ponto flutuante.

Na implementação com PostgreSQL e Prisma, deverão ser utilizados tipos decimais com precisão adequada.

Todo valor monetário deverá estar associado a uma moeda.

No MVP, a moeda funcional padrão será o real brasileiro:

BRL

A modelagem deverá permitir múltiplas moedas futuramente.

---

2.5 Identidade global

Todas as entidades persistidas deverão possuir identificadores globais únicos.

A estratégia exata de identificação será definida na implementação, podendo utilizar:

- UUID;
- UUIDv7;
- CUID2;
- outro identificador compatível com PostgreSQL e Prisma.

Identificadores de banco não deverão ser expostos como números sequenciais previsíveis nas APIs públicas.

---

2.6 Auditoria obrigatória

Toda alteração financeira relevante deverá registrar:

- usuário responsável;
- data e hora;
- operação executada;
- valores anteriores;
- valores posteriores;
- origem da solicitação;
- justificativa, quando exigida;
- entidade afetada;
- identificador de correlação.

A auditoria seguirá a infraestrutura centralizada definida em "docs/adr/ADR-006-audit-trail.md".

---

2.7 Exclusão lógica

Cadastros auxiliares poderão utilizar exclusão lógica.

Exemplos:

- conta financeira;
- centro de custo;
- categoria gerencial;
- condição de pagamento.

Entidades transacionais não poderão ser excluídas, nem mesmo logicamente, quando a exclusão comprometer a rastreabilidade.

Nesses casos deverão ser utilizados estados como:

- cancelado;
- inativo;
- estornado;
- encerrado.

---

3. Contextos e fronteiras do domínio

O domínio financeiro se relacionará com outros módulos do monólito modular.

3.1 Responsabilidade do módulo financeiro

O módulo financeiro será responsável por:

- contas a pagar;
- contas a receber;
- parcelas;
- pagamentos;
- recebimentos;
- contas financeiras;
- movimentações bancárias;
- transferências;
- conciliação bancária;
- períodos financeiros;
- fluxo de caixa;
- classificação gerencial;
- aprovações financeiras;
- consolidações gerenciais;
- indicadores financeiros derivados.

---

3.2 Responsabilidade de outros módulos

O módulo financeiro não será a fonte principal dos seguintes objetos:

Objeto| Módulo responsável
Cliente| CRM ou Cadastro
Fornecedor| Suprimentos ou Cadastro
Projeto| Projetos
Contrato comercial| Contratos ou Comercial
Pedido de compra| Compras
Colaborador| Pessoas
Nota fiscal| Fiscal
Documento armazenado| Documentos
Usuário e permissões| Identidade e Acesso
Auditoria| Auditoria central

O domínio financeiro poderá armazenar referências locais a esses objetos, mas não deverá duplicar sua responsabilidade integral.

---

3.3 Integração entre módulos

A integração entre módulos ocorrerá preferencialmente por:

- serviços de aplicação internos;
- interfaces públicas dos módulos;
- eventos de domínio;
- identificadores estáveis;
- projeções de leitura;
- contratos internos explicitamente definidos.

Um módulo não deverá acessar diretamente as tabelas internas de outro módulo sem uma decisão arquitetural específica.

---

4. Visão geral dos agregados

Os principais agregados financeiros são:

1. "FinancialAccount"
2. "Payable"
3. "Receivable"
4. "BankTransaction"
5. "FinancialTransfer"
6. "BankReconciliation"
7. "FinancialPeriod"
8. "ManagementAccount"
9. "CostCenter"
10. "ApprovalRequest"
11. "CashFlowScenario"

Entidades como "Project", "Contract" e "PurchaseOrder" pertencem prioritariamente a outros módulos, mas possuem forte participação no modelo financeiro.

---

5. Agregado FinancialAccount

5.1 Responsabilidade

Representa uma conta na qual a empresa mantém recursos financeiros ou registra movimentações de caixa.

Exemplos:

- conta corrente;
- caixa físico;
- aplicação financeira;
- conta de pagamento;
- carteira digital;
- conta internacional.

5.2 Raiz do agregado

FinancialAccount

5.3 Atributos conceituais

- "id"
- "legalEntityId"
- "name"
- "type"
- "institutionName"
- "bankCode"
- "branch"
- "accountNumber"
- "accountDigit"
- "currency"
- "openingBalance"
- "openingBalanceDate"
- "status"
- "allowsReconciliation"
- "createdAt"
- "updatedAt"

5.4 Tipos de conta

CHECKING
SAVINGS
CASH
INVESTMENT
PAYMENT
DIGITAL_WALLET
INTERNATIONAL
OTHER

5.5 Estados

ACTIVE
INACTIVE
CLOSED

5.6 Invariantes

- Uma conta encerrada não poderá receber novas movimentações.
- O saldo atual não deverá ser armazenado como única fonte da verdade.
- O saldo deverá ser derivado do saldo de abertura e das movimentações válidas.
- Alterações no saldo de abertura deverão ser auditadas.
- A moeda não poderá ser alterada após a primeira movimentação.
- Uma conta com movimentações não poderá ser fisicamente excluída.

5.7 Relacionamentos

FinancialAccount 1 ─── N BankTransaction
FinancialAccount 1 ─── N ReconciliationStatement
FinancialAccount 1 ─── N Transfer

Uma transferência participa de duas contas:

- conta de origem;
- conta de destino.

---

6. Agregado Payable

6.1 Responsabilidade

Representa uma obrigação financeira da empresa perante um fornecedor, colaborador, órgão público, instituição financeira ou outro beneficiário.

6.2 Raiz do agregado

Payable

6.3 Entidades internas

Payable
└── PayableInstallment
    ├── PaymentAllocation
    ├── FinancialAdjustment
    ├── Withholding
    └── CancellationRecord

6.4 Atributos conceituais de Payable

- "id"
- "legalEntityId"
- "counterpartyId"
- "counterpartyType"
- "description"
- "documentNumber"
- "documentType"
- "issueDate"
- "competenceDate"
- "originalAmount"
- "currency"
- "status"
- "sourceType"
- "sourceId"
- "projectId"
- "costCenterId"
- "managementAccountId"
- "contractId"
- "purchaseOrderId"
- "paymentTermId"
- "createdBy"
- "createdAt"
- "updatedAt"

6.5 Origem da obrigação

PURCHASE_ORDER
SUPPLIER_INVOICE
CONTRACT
PAYROLL
TAX
EXPENSE_REIMBURSEMENT
LOAN
RENT
MANUAL_ENTRY
OTHER

6.6 Estados de Payable

DRAFT
PENDING_APPROVAL
APPROVED
OPEN
PARTIALLY_SETTLED
SETTLED
OVERDUE
CANCELLED

O estado "OVERDUE" poderá ser calculado, e não necessariamente persistido.

6.7 Invariantes

- O valor original deverá ser maior que zero.
- A soma dos valores originais das parcelas deverá ser igual ao valor original da obrigação.
- Uma conta pendente de aprovação não poderá ser liquidada.
- Uma conta cancelada não poderá receber pagamentos.
- Uma conta liquidada somente poderá ser corrigida por estorno.
- Uma conta com pagamento não poderá ser cancelada; deverá ser estornada.
- Toda conta deverá possuir classificação gerencial.
- Toda conta deverá possuir beneficiário identificável.
- O vínculo com projeto será obrigatório quando a despesa for diretamente relacionada a um projeto.
- A competência deverá ser informada antes da aprovação definitiva.
- Alterações em períodos fechados deverão ser bloqueadas.

---

7. Entidade PayableInstallment

7.1 Responsabilidade

Representa uma parcela individual de uma conta a pagar.

7.2 Atributos conceituais

- "id"
- "payableId"
- "sequence"
- "dueDate"
- "originalAmount"
- "openAmount"
- "status"
- "expectedPaymentDate"
- "paymentMethod"
- "barcode"
- "pixKey"
- "notes"

7.3 Estados

OPEN
PARTIALLY_SETTLED
SETTLED
OVERDUE
CANCELLED

7.4 Invariantes

- A sequência deverá ser única dentro da conta a pagar.
- O valor da parcela deverá ser maior que zero.
- O saldo em aberto não poderá ser negativo.
- O valor liquidado não poderá superar o valor líquido devido, salvo quando houver adiantamento ou crédito formalmente registrado.
- Uma parcela liquidada não poderá ser alterada diretamente.
- A data de vencimento poderá ser alterada apenas mediante permissão e auditoria.

---

8. Entidade Payment

8.1 Responsabilidade

Representa uma operação de pagamento realizada pela empresa.

Um pagamento poderá liquidar:

- uma única parcela;
- várias parcelas;
- parte de uma parcela;
- parcelas pertencentes a diferentes obrigações, quando permitido.

8.2 Modelagem recomendada

O pagamento deve existir como entidade própria, independente da parcela.

Payment
└── PaymentAllocation

8.3 Atributos conceituais de Payment

- "id"
- "legalEntityId"
- "paymentDate"
- "amount"
- "currency"
- "financialAccountId"
- "bankTransactionId"
- "paymentMethod"
- "reference"
- "status"
- "reversedPaymentId"
- "createdBy"
- "createdAt"

8.4 Estados

PENDING
CONFIRMED
RECONCILED
REVERSED
CANCELLED

8.5 Invariantes

- Um pagamento confirmado deverá possuir valor maior que zero.
- O pagamento deverá ser associado a pelo menos uma alocação, salvo adiantamento.
- A soma das alocações não poderá superar o valor do pagamento.
- Diferenças deverão ser registradas como:
  - adiantamento;
  - crédito;
  - tarifa;
  - juros;
  - desconto;
  - valor não alocado.
- Um pagamento conciliado não poderá ser editado.
- O estorno deverá criar um novo pagamento de reversão ou evento equivalente, sem apagar o original.

---

9. Entidade PaymentAllocation

9.1 Responsabilidade

Representa a parcela do pagamento aplicada a uma obrigação específica.

9.2 Atributos conceituais

- "id"
- "paymentId"
- "payableInstallmentId"
- "principalAmount"
- "interestAmount"
- "penaltyAmount"
- "discountAmount"
- "withholdingAmount"
- "allocatedAmount"

9.3 Invariantes

- Todos os componentes monetários deverão ser não negativos.
- O valor líquido da alocação deverá respeitar a fórmula definida pelo domínio.
- Uma alocação não poderá existir sem pagamento e parcela válidos.
- A parcela deverá ser atualizada na mesma transação da criação da alocação.

---

10. Agregado Receivable

10.1 Responsabilidade

Representa um direito financeiro da empresa contra um cliente ou outro devedor.

10.2 Raiz do agregado

Receivable

10.3 Entidades internas

Receivable
└── ReceivableInstallment
    ├── ReceiptAllocation
    ├── FinancialAdjustment
    ├── Withholding
    └── CancellationRecord

10.4 Atributos conceituais de Receivable

- "id"
- "legalEntityId"
- "customerId"
- "description"
- "documentNumber"
- "documentType"
- "issueDate"
- "competenceDate"
- "originalAmount"
- "currency"
- "status"
- "sourceType"
- "sourceId"
- "projectId"
- "costCenterId"
- "resultCenterId"
- "managementAccountId"
- "contractId"
- "billingScheduleItemId"
- "measurementId"
- "createdBy"
- "createdAt"
- "updatedAt"

10.5 Origens

CONTRACT
BILLING_SCHEDULE
MEASUREMENT
SALES_ORDER
SERVICE_INVOICE
PRODUCT_INVOICE
ADVANCE_REQUEST
MANUAL_ENTRY
OTHER

10.6 Estados

DRAFT
PENDING_APPROVAL
APPROVED
OPEN
PARTIALLY_SETTLED
SETTLED
OVERDUE
CANCELLED
WRITTEN_OFF

10.7 Invariantes

- O valor original deverá ser maior que zero.
- A soma das parcelas deverá corresponder ao valor do recebível.
- Um recebível cancelado não poderá aceitar novos recebimentos.
- Um recebível liquidado não poderá ser alterado diretamente.
- Baixas por perda deverão possuir aprovação e justificativa.
- Retenções não poderão reduzir silenciosamente o valor bruto.
- O valor bruto, o valor retido e o valor líquido deverão permanecer rastreáveis.
- Contas vinculadas a contratos deverão manter referência ao contrato de origem.

---

11. Entidade ReceivableInstallment

11.1 Responsabilidade

Representa uma parcela individual de uma conta a receber.

11.2 Atributos conceituais

- "id"
- "receivableId"
- "sequence"
- "dueDate"
- "expectedReceiptDate"
- "originalAmount"
- "openAmount"
- "status"
- "billingReference"
- "collectionStatus"
- "notes"

11.3 Estados

OPEN
PARTIALLY_SETTLED
SETTLED
OVERDUE
CANCELLED
WRITTEN_OFF

11.4 Invariantes

- O saldo em aberto não poderá ser negativo.
- Uma parcela baixada por perda deverá possuir justificativa.
- A alteração de vencimento deverá ser auditada.
- A parcela deverá preservar o vencimento originalmente contratado, quando aplicável.
- Renegociações deverão gerar histórico próprio.

---

12. Entidade Receipt

12.1 Responsabilidade

Representa uma entrada financeira recebida pela empresa.

12.2 Estrutura

Receipt
└── ReceiptAllocation

12.3 Atributos conceituais

- "id"
- "legalEntityId"
- "receiptDate"
- "amount"
- "currency"
- "financialAccountId"
- "bankTransactionId"
- "receiptMethod"
- "reference"
- "status"
- "reversedReceiptId"
- "createdBy"
- "createdAt"

12.4 Estados

PENDING
CONFIRMED
RECONCILED
REVERSED
CANCELLED

12.5 Invariantes

- O recebimento deverá possuir valor maior que zero.
- O recebimento poderá ser parcial.
- Um recebimento poderá liquidar uma ou mais parcelas.
- Um recebimento conciliado não poderá ser editado.
- Valores recebidos sem recebível identificado deverão ser classificados como não alocados ou adiantamento de cliente.
- O estorno não poderá apagar o recebimento original.

---

13. Entidade ReceiptAllocation

13.1 Responsabilidade

Associa um recebimento a uma parcela de conta a receber.

13.2 Atributos conceituais

- "id"
- "receiptId"
- "receivableInstallmentId"
- "principalAmount"
- "interestAmount"
- "penaltyAmount"
- "discountAmount"
- "withholdingAmount"
- "allocatedAmount"

13.3 Invariantes

- A soma das alocações não poderá superar o valor do recebimento.
- A parcela deverá ser atualizada na mesma transação da alocação.
- Retenções deverão ser registradas separadamente do valor recebido em banco.
- Descontos deverão possuir motivo e autorização quando ultrapassarem limite configurado.

---

14. Adiantamentos

14.1 Conceito

Adiantamentos representam recursos pagos ou recebidos antes da obrigação definitiva.

Tipos:

SUPPLIER_ADVANCE
CUSTOMER_ADVANCE
EMPLOYEE_ADVANCE
TRAVEL_ADVANCE
OTHER

14.2 Modelagem

O adiantamento poderá ser representado por uma entidade própria:

Advance

14.3 Atributos conceituais

- "id"
- "type"
- "counterpartyId"
- "projectId"
- "amount"
- "openAmount"
- "currency"
- "date"
- "financialAccountId"
- "paymentId"
- "receiptId"
- "status"
- "purpose"
- "createdBy"

14.4 Estados

OPEN
PARTIALLY_APPLIED
FULLY_APPLIED
REFUNDED
CANCELLED

14.5 Invariantes

- Um adiantamento não deverá ser tratado como despesa ou receita definitiva no momento de sua criação.
- A aplicação deverá manter vínculo com a obrigação compensada.
- O valor aplicado não poderá superar o saldo disponível.
- Devoluções deverão gerar movimentações financeiras específicas.
- Adiantamentos antigos e não compensados deverão ser identificados por indicadores.

---

15. Retenções

15.1 Entidade Withholding

Representa uma retenção tributária ou contratual aplicada a uma obrigação ou liquidação.

15.2 Tipos

IRRF
INSS
ISS
PIS
COFINS
CSLL
CONTRACTUAL_HOLDBACK
WARRANTY_RETENTION
OTHER

15.3 Atributos conceituais

- "id"
- "type"
- "taxCode"
- "calculationBase"
- "rate"
- "amount"
- "responsibleParty"
- "dueDate"
- "status"
- "payableId"
- "receivableId"
- "paymentAllocationId"
- "receiptAllocationId"

15.4 Invariantes

- A base, alíquota e valor deverão permanecer rastreáveis.
- O valor retido não poderá ser negativo.
- A retenção não deverá alterar o valor bruto original.
- Retenções contratuais deverão possuir regra de liberação.
- Retenções tributárias poderão originar novas obrigações fiscais.

---

16. Ajustes financeiros

16.1 Entidade FinancialAdjustment

Representa alterações no valor líquido de uma parcela.

16.2 Tipos

INTEREST
PENALTY
DISCOUNT
REBATE
MONETARY_CORRECTION
EXCHANGE_VARIATION
OTHER

16.3 Atributos conceituais

- "id"
- "type"
- "amount"
- "effectiveDate"
- "reason"
- "approvedBy"
- "payableInstallmentId"
- "receivableInstallmentId"
- "createdAt"

16.4 Invariantes

- Ajustes não poderão substituir o valor original.
- Descontos acima da alçada deverão exigir aprovação.
- Juros e multas deverão permanecer separados do principal.
- Ajustes em períodos fechados deverão ser bloqueados ou tratados em período posterior.

---

17. Agregado BankTransaction

17.1 Responsabilidade

Representa uma movimentação identificada em uma conta financeira.

17.2 Raiz do agregado

BankTransaction

17.3 Atributos conceituais

- "id"
- "financialAccountId"
- "externalId"
- "transactionDate"
- "postingDate"
- "amount"
- "direction"
- "currency"
- "description"
- "documentNumber"
- "counterpartyName"
- "counterpartyDocument"
- "bankReference"
- "source"
- "status"
- "reconciliationStatus"
- "importBatchId"
- "createdAt"

17.4 Direção

CREDIT
DEBIT

17.5 Origem

MANUAL
OFX_IMPORT
CSV_IMPORT
BANK_API
OPEN_FINANCE
SYSTEM_GENERATED

17.6 Estados

PENDING
POSTED
REVERSED
IGNORED

17.7 Estados de conciliação

UNRECONCILED
SUGGESTED
PARTIALLY_RECONCILED
RECONCILED
DIVERGENT

17.8 Invariantes

- O valor absoluto deverá ser maior que zero.
- A direção deverá determinar o efeito no saldo.
- Uma transação conciliada não poderá ser alterada.
- Uma transação importada deverá preservar o conteúdo original.
- Duplicidades de importação deverão ser identificadas.
- A soma das alocações conciliadas não poderá superar o valor da transação.
- Uma transação bancária poderá ser conciliada com mais de uma liquidação.

---

18. Agregado FinancialTransfer

18.1 Responsabilidade

Representa a transferência de recursos entre duas contas financeiras da mesma entidade legal.

18.2 Raiz do agregado

FinancialTransfer

18.3 Atributos conceituais

- "id"
- "sourceAccountId"
- "destinationAccountId"
- "transferDate"
- "amount"
- "currency"
- "feeAmount"
- "status"
- "outgoingBankTransactionId"
- "incomingBankTransactionId"
- "reference"
- "createdBy"

18.4 Estados

DRAFT
CONFIRMED
RECONCILED
REVERSED
CANCELLED

18.5 Invariantes

- Conta de origem e destino deverão ser diferentes.
- O valor deverá ser maior que zero.
- A transferência não deverá gerar receita ou despesa.
- Tarifas poderão gerar despesa financeira separada.
- A saída e a entrada deverão possuir o mesmo identificador de transferência.
- A confirmação deverá criar os dois lados da operação de forma atômica.
- Transferências entre moedas distintas exigirão tratamento cambial específico e ficam fora do MVP.

---

19. Agregado BankReconciliation

19.1 Responsabilidade

Controla a associação entre movimentações bancárias e registros financeiros internos.

19.2 Estrutura

BankReconciliation
└── ReconciliationMatch

19.3 Atributos conceituais

- "id"
- "financialAccountId"
- "statementPeriodStart"
- "statementPeriodEnd"
- "status"
- "startedBy"
- "completedBy"
- "startedAt"
- "completedAt"

19.4 Estados

OPEN
IN_PROGRESS
COMPLETED
REOPENED
CANCELLED

19.5 ReconciliationMatch

Representa a associação entre uma transação bancária e uma ou mais operações internas.

Atributos:

- "id"
- "bankTransactionId"
- "targetType"
- "targetId"
- "matchedAmount"
- "matchType"
- "confidenceScore"
- "matchedBy"
- "matchedAt"

19.6 Tipos de correspondência

AUTOMATIC
MANUAL
RULE_BASED

19.7 Alvos possíveis

PAYMENT
RECEIPT
TRANSFER
BANK_FEE
FINANCIAL_INCOME
ADVANCE
OTHER

19.8 Invariantes

- Uma conciliação concluída não poderá ser editada sem reabertura.
- O valor conciliado não poderá exceder o valor da transação.
- Uma correspondência automática deverá registrar o critério utilizado.
- Correspondências manuais deverão registrar o usuário.
- Uma divergência não poderá ser ocultada sem justificativa.
- A conclusão deverá validar o saldo inicial, movimentações e saldo final.

---

20. Importação de extratos

20.1 Entidade BankStatementImport

Representa um lote de importação de extrato.

20.2 Atributos conceituais

- "id"
- "financialAccountId"
- "source"
- "fileName"
- "fileHash"
- "periodStart"
- "periodEnd"
- "status"
- "totalRecords"
- "importedRecords"
- "duplicateRecords"
- "rejectedRecords"
- "createdBy"
- "createdAt"

20.3 Estados

PENDING
PROCESSING
COMPLETED
COMPLETED_WITH_ERRORS
FAILED
CANCELLED

20.4 Invariantes

- O hash do arquivo deverá ser utilizado para reduzir importações duplicadas.
- O arquivo original deverá ser preservado no armazenamento de documentos.
- Registros rejeitados deverão possuir motivo.
- A importação não deverá conciliar transações automaticamente sem registrar os critérios.

---

21. Agregado FinancialPeriod

21.1 Responsabilidade

Controla a abertura, o fechamento e a reabertura de períodos financeiros.

21.2 Raiz do agregado

FinancialPeriod

21.3 Atributos conceituais

- "id"
- "legalEntityId"
- "year"
- "month"
- "startDate"
- "endDate"
- "status"
- "closedBy"
- "closedAt"
- "reopenedBy"
- "reopenedAt"
- "reopeningReason"

21.4 Estados

OPEN
CLOSING
CLOSED
REOPENED

21.5 Invariantes

- Períodos da mesma entidade legal não poderão se sobrepor.
- Lançamentos com competência em período fechado não poderão ser criados ou alterados.
- A reabertura deverá exigir permissão específica.
- Toda reabertura deverá possuir justificativa.
- O fechamento deverá verificar pendências configuradas.
- O fechamento não deverá apagar ou consolidar irreversivelmente os registros originais.

21.6 Verificações de fechamento

O processo poderá verificar:

- transações bancárias não conciliadas;
- pagamentos pendentes;
- recebimentos não alocados;
- contas sem classificação gerencial;
- adiantamentos sem prestação de contas;
- divergências de saldo;
- aprovações pendentes;
- documentos incompletos.

A política exata de bloqueio será configurável.

---

22. Agregado ManagementAccount

22.1 Responsabilidade

Representa o plano de contas gerencial utilizado para classificar receitas, custos, despesas, investimentos e movimentações não operacionais.

22.2 Raiz do agregado

ManagementAccount

22.3 Atributos conceituais

- "id"
- "code"
- "name"
- "parentId"
- "nature"
- "classification"
- "dreGroup"
- "cashFlowGroup"
- "allowsPosting"
- "status"
- "validFrom"
- "validUntil"

22.4 Natureza

DEBIT
CREDIT
NEUTRAL

22.5 Classificação

REVENUE
TAX_DEDUCTION
DIRECT_COST
INDIRECT_COST
OPERATING_EXPENSE
FINANCIAL_INCOME
FINANCIAL_EXPENSE
INVESTMENT
FINANCING
EQUITY
TRANSFER
OTHER

22.6 Invariantes

- Contas sintéticas não poderão receber lançamentos.
- O código deverá ser único.
- Uma conta utilizada em lançamentos não poderá ser excluída.
- Mudanças na hierarquia deverão preservar relatórios históricos.
- A classificação deverá ser compatível com a utilização da conta.
- Contas de transferência não poderão impactar a DRE.

---

23. Agregado CostCenter

23.1 Responsabilidade

Representa uma unidade organizacional responsável pelo consumo de recursos.

23.2 Atributos conceituais

- "id"
- "code"
- "name"
- "parentId"
- "managerId"
- "status"
- "validFrom"
- "validUntil"

23.3 Exemplos

- Engenharia;
- Automação;
- Elétrica;
- Instrumentação;
- Produção;
- Compras;
- Comercial;
- Marketing;
- Financeiro;
- Administrativo;
- Diretoria.

23.4 Invariantes

- O código deverá ser único.
- Centros inativos não poderão receber novos lançamentos.
- A inativação não poderá eliminar o histórico.
- A hierarquia não poderá possuir ciclos.
- Alterações de responsável deverão ser auditadas.

---

24. Centro de resultado

24.1 Entidade ResultCenter

Representa uma linha de negócio ou unidade geradora de receita.

24.2 Exemplos

- Engenharia;
- Integração de Sistemas;
- Painéis Elétricos;
- Serviços de Campo;
- Terceirização de Manutenção;
- Projetos Multidisciplinares.

24.3 Atributos conceituais

- "id"
- "code"
- "name"
- "parentId"
- "status"
- "validFrom"
- "validUntil"

24.4 Invariantes

- Receitas operacionais deverão possuir centro de resultado quando aplicável.
- Centros inativos não poderão receber novos lançamentos.
- A estrutura histórica deverá ser preservada.

---

25. Vínculo com projetos

25.1 Entidade externa Project

O projeto será mantido pelo módulo de Projetos.

O módulo financeiro utilizará:

- "projectId";
- código;
- nome;
- cliente;
- status;
- datas;
- valor contratado;
- gerente responsável.

25.2 Regras de vínculo

- Custos diretos deverão possuir projeto.
- Receitas contratuais deverão possuir projeto quando originadas de contrato de projeto.
- Despesas administrativas poderão não possuir projeto.
- Um lançamento poderá ser dividido entre vários projetos por meio de alocações.
- Rateios deverão preservar o valor total do lançamento.

25.3 Entidade FinancialProjectAllocation

Quando um lançamento pertencer a mais de um projeto, será utilizada uma entidade de alocação.

Atributos:

- "id"
- "sourceType"
- "sourceId"
- "projectId"
- "amount"
- "percentage"
- "allocationMethod"

Invariantes:

- A soma dos percentuais deverá ser igual a 100%.
- A soma dos valores deverá corresponder ao valor alocável.
- O método de rateio deverá ser registrado.
- Alterações deverão ser auditadas.

---

26. WBS financeira

26.1 Entidade ProjectFinancialWbsItem

Representa um item da estrutura analítica financeira do projeto.

26.2 Atributos conceituais

- "id"
- "projectId"
- "code"
- "name"
- "parentId"
- "type"
- "allowsPosting"
- "status"

26.3 Tipos

PHASE
DISCIPLINE
WORK_PACKAGE
COST_PACKAGE
REVENUE_PACKAGE
OTHER

26.4 Invariantes

- A estrutura não poderá possuir ciclos.
- Itens sintéticos não poderão receber lançamentos.
- O código deverá ser único dentro do projeto.
- Itens utilizados não poderão ser excluídos.
- A WBS financeira poderá se relacionar com a EAP operacional, mas não precisa ser idêntica.

---

27. Vínculo com contratos

27.1 Entidade externa Contract

O contrato será mantido pelo módulo de Contratos.

O financeiro utilizará referências a:

- contrato;
- cliente;
- valor original;
- aditivos;
- cronograma de faturamento;
- retenções;
- condições de pagamento;
- garantias;
- projeto.

27.2 Entidade BillingScheduleItem

Representa um marco previsto de faturamento.

Atributos conceituais:

- "id"
- "contractId"
- "projectId"
- "sequence"
- "description"
- "triggerType"
- "plannedBillingDate"
- "plannedAmount"
- "percentage"
- "status"
- "receivableId"

27.3 Gatilhos de faturamento

FIXED_DATE
MONTHLY_MEASUREMENT
MILESTONE_APPROVAL
EQUIPMENT_DELIVERY
FAT_APPROVAL
SAT_APPROVAL
FINAL_ACCEPTANCE
OTHER

27.4 Estados

PLANNED
ELIGIBLE
APPROVED
BILLED
PARTIALLY_BILLED
CANCELLED

27.5 Invariantes

- A soma do cronograma deverá ser compatível com o valor contratual faturável.
- Aditivos deverão gerar revisões controladas.
- Marcos faturados não poderão ser removidos.
- Alterações em marcos já utilizados deverão ser auditadas.
- Um marco poderá originar uma ou mais contas a receber.

---

28. Medições contratuais

28.1 Entidade ContractMeasurement

Representa a apuração periódica de serviços ou quantidades executadas.

28.2 Atributos conceituais

- "id"
- "contractId"
- "projectId"
- "measurementNumber"
- "periodStart"
- "periodEnd"
- "grossAmount"
- "withholdingAmount"
- "netAmount"
- "status"
- "submittedAt"
- "approvedAt"
- "approvedBy"
- "receivableId"

28.3 Estados

DRAFT
SUBMITTED
UNDER_REVIEW
APPROVED
PARTIALLY_APPROVED
REJECTED
BILLED
CANCELLED

28.4 Invariantes

- Uma medição aprovada não poderá ser editada diretamente.
- Retificações deverão gerar nova versão.
- O período medido deverá ser válido.
- O valor líquido deverá ser derivado do bruto e das retenções.
- A medição faturada deverá manter vínculo com o recebível correspondente.

---

29. Vínculo com pedidos de compra

29.1 Entidade externa PurchaseOrder

O pedido de compra será mantido pelo módulo de Compras.

O financeiro utilizará referências a:

- fornecedor;
- projeto;
- valor;
- moeda;
- condição de pagamento;
- aprovação;
- itens;
- entregas;
- notas fiscais;
- saldo comprometido.

29.2 Compromisso financeiro

A aprovação do pedido deverá gerar ou atualizar um compromisso financeiro.

29.3 Entidade FinancialCommitment

Representa um valor formalmente comprometido, mas ainda não necessariamente convertido em conta a pagar.

Atributos conceituais:

- "id"
- "sourceType"
- "sourceId"
- "counterpartyId"
- "projectId"
- "managementAccountId"
- "committedAmount"
- "convertedAmount"
- "openAmount"
- "expectedDate"
- "status"

29.4 Estados

OPEN
PARTIALLY_CONVERTED
FULLY_CONVERTED
CANCELLED

29.5 Invariantes

- O valor convertido não poderá superar o valor comprometido, salvo aprovação de divergência.
- O cancelamento do pedido deverá cancelar apenas o saldo ainda não convertido.
- Contas a pagar geradas deverão manter referência ao compromisso.
- O compromisso deverá alimentar o fluxo de caixa previsto.

---

30. Orçamento e baseline

30.1 Agregado FinancialBudget

Representa um orçamento financeiro aprovado para empresa, projeto ou centro de custo.

30.2 Estrutura

FinancialBudget
├── BudgetVersion
└── BudgetLine

30.3 Atributos conceituais de FinancialBudget

- "id"
- "scopeType"
- "scopeId"
- "name"
- "year"
- "status"
- "currentVersionId"

30.4 BudgetVersion

- "id"
- "financialBudgetId"
- "versionNumber"
- "type"
- "status"
- "effectiveDate"
- "approvedBy"
- "approvedAt"

30.5 Tipos de versão

BUDGET
FORECAST
BASELINE
REFORECAST

30.6 BudgetLine

- "id"
- "budgetVersionId"
- "period"
- "managementAccountId"
- "costCenterId"
- "resultCenterId"
- "projectId"
- "wbsItemId"
- "amount"
- "notes"

30.7 Invariantes

- Versões aprovadas deverão ser imutáveis.
- Revisões deverão gerar novas versões.
- Apenas uma versão poderá ser considerada vigente por tipo e escopo.
- O realizado não deverá alterar o orçamento.
- O forecast não deverá substituir a baseline histórica.
- A soma das linhas deverá ser consistente com os totais apresentados.

A implementação completa poderá ocorrer após o MVP financeiro operacional.

---

31. Cenários de fluxo de caixa

31.1 Agregado CashFlowScenario

Representa uma simulação financeira sem alterar os dados oficiais.

31.2 Estrutura

CashFlowScenario
├── ScenarioAssumption
└── ScenarioEntry

31.3 Atributos conceituais

- "id"
- "name"
- "type"
- "baseDate"
- "horizonEndDate"
- "status"
- "createdBy"
- "createdAt"

31.4 Tipos

REALISTIC
CONSERVATIVE
OPTIMISTIC
CUSTOM

31.5 ScenarioAssumption

Exemplos:

- atraso médio de recebimento;
- percentual de inadimplência;
- inflação de custos;
- probabilidade de fechamento de oportunidade;
- postergação de compras;
- contratação adicional;
- novo financiamento.

31.6 Invariantes

- Cenários não poderão alterar contas oficiais.
- Premissas deverão ser explicitamente registradas.
- Resultados deverão ser reproduzíveis com base nas premissas.
- Cenários publicados deverão preservar sua versão.

---

32. Aprovações e alçadas

32.1 Agregado ApprovalRequest

Representa uma solicitação formal de aprovação.

32.2 Estrutura

ApprovalRequest
└── ApprovalStep

32.3 Atributos conceituais

- "id"
- "entityType"
- "entityId"
- "processType"
- "amount"
- "currency"
- "status"
- "requestedBy"
- "requestedAt"
- "currentStep"

32.4 Processos possíveis

PAYABLE_APPROVAL
PAYMENT_APPROVAL
DISCOUNT_APPROVAL
WRITE_OFF_APPROVAL
PERIOD_REOPENING
PURCHASE_COMMITMENT
BUDGET_APPROVAL
OTHER

32.5 Estados

PENDING
APPROVED
REJECTED
CANCELLED
EXPIRED

32.6 ApprovalStep

- "id"
- "approvalRequestId"
- "sequence"
- "approverType"
- "approverId"
- "minimumApprovals"
- "status"
- "decidedBy"
- "decidedAt"
- "comments"

32.7 Invariantes

- O solicitante não poderá aprovar a própria solicitação quando houver segregação obrigatória.
- Etapas deverão respeitar a sequência definida.
- Rejeições deverão possuir justificativa.
- Alterações no valor após aprovação deverão invalidar ou reiniciar o fluxo.
- A decisão deverá ser imutável e auditada.
- As alçadas deverão ser parametrizáveis.

---

33. Documentos financeiros

Entidades financeiras poderão possuir documentos anexos.

Exemplos:

- nota fiscal;
- boleto;
- comprovante;
- contrato;
- pedido de compra;
- medição;
- recibo;
- guia tributária;
- extrato;
- comprovante de transferência.

O módulo financeiro armazenará apenas referências aos documentos mantidos pelo módulo de Documentos.

33.1 Entidade FinancialDocumentLink

Atributos:

- "id"
- "entityType"
- "entityId"
- "documentId"
- "documentRole"
- "createdBy"
- "createdAt"

33.2 Papéis de documento

INVOICE
PAYMENT_SLIP
PAYMENT_PROOF
RECEIPT_PROOF
CONTRACT
PURCHASE_ORDER
MEASUREMENT
TAX_GUIDE
BANK_STATEMENT
OTHER

---

34. Objetos de valor

34.1 Money

Representa um valor monetário.

Money
- amount
- currency

Invariantes:

- valor decimal válido;
- moeda obrigatória;
- operações somente entre moedas compatíveis, salvo conversão explícita;
- arredondamento padronizado.

---

34.2 Percentage

Representa um percentual.

Percentage
- value

Invariantes:

- escala definida;
- intervalo validado conforme o uso;
- retenções e descontos normalmente entre 0% e 100%.

---

34.3 DateRange

Representa um intervalo de datas.

DateRange
- startDate
- endDate

Invariantes:

- data inicial não poderá ser posterior à final.

---

34.4 DocumentReference

Representa um documento comercial ou fiscal.

DocumentReference
- type
- number
- series
- issuer

---

34.5 BankAccountDetails

Representa dados bancários de uma conta.

BankAccountDetails
- bankCode
- branch
- accountNumber
- accountDigit

---

34.6 PaymentTerms

Representa uma condição de pagamento.

Exemplo:

30/60/90 dias

Poderá gerar automaticamente as parcelas de uma obrigação.

---

35. Enums prioritários

35.1 Currency

BRL
USD
EUR

O MVP poderá operar apenas com "BRL", mantendo o enum preparado para expansão.

35.2 CounterpartyType

CUSTOMER
SUPPLIER
EMPLOYEE
GOVERNMENT
BANK
PARTNER
OTHER

35.3 PaymentMethod

PIX
BANK_TRANSFER
BOLETO
CREDIT_CARD
DEBIT_CARD
CASH
DIRECT_DEBIT
CHECK
OTHER

35.4 DocumentType

INVOICE
SERVICE_INVOICE
PRODUCT_INVOICE
RECEIPT
CONTRACT
TAX_GUIDE
PAYROLL
PURCHASE_ORDER
OTHER

---

36. Eventos de domínio

Eventos de domínio deverão representar fatos ocorridos, e não comandos.

36.1 Contas a pagar

PayableCreated
PayableSubmittedForApproval
PayableApproved
PayableCancelled
PayableInstallmentOverdue
PaymentConfirmed
PaymentReversed
PayableSettled

36.2 Contas a receber

ReceivableCreated
ReceivableApproved
ReceivableCancelled
ReceivableInstallmentOverdue
ReceiptConfirmed
ReceiptReversed
ReceivableSettled
ReceivableWrittenOff

36.3 Banco e conciliação

BankStatementImported
BankTransactionCreated
BankTransactionMatched
BankReconciliationCompleted
BankReconciliationReopened
FinancialTransferConfirmed
FinancialTransferReversed

36.4 Fechamento

FinancialPeriodClosingStarted
FinancialPeriodClosed
FinancialPeriodReopened

36.5 Contratos e compras

BillingMilestoneEligible
ContractMeasurementApproved
PurchaseOrderFinanciallyCommitted
FinancialCommitmentConverted

36.6 Aprovação

ApprovalRequested
ApprovalGranted
ApprovalRejected
ApprovalCancelled

---

37. Idempotência

Operações de integração deverão suportar idempotência.

Exemplos:

- importação de extrato;
- criação de conta por evento de pedido de compra;
- criação de recebível por faturamento;
- confirmação de pagamento bancário;
- processamento de webhook futuro;
- reprocessamento de eventos.

Cada integração deverá possuir uma chave idempotente ou identificador externo.

O mesmo evento não poderá criar duplicidades financeiras.

---

38. Concorrência

Operações financeiras críticas deverão utilizar controle de concorrência.

Casos prioritários:

- liquidação simultânea de parcela;
- conciliação da mesma transação;
- alteração do saldo de adiantamento;
- fechamento de período;
- aprovação concorrente;
- conversão de compromisso em obrigação.

A estratégia poderá utilizar:

- transações no PostgreSQL;
- bloqueio otimista;
- coluna de versão;
- restrições únicas;
- bloqueio pessimista em casos específicos.

---

39. Limites transacionais

39.1 Criação de conta e parcelas

A criação de uma conta a pagar ou receber e de todas as suas parcelas deverá ocorrer em uma única transação.

39.2 Liquidação

A confirmação de pagamento deverá atualizar atomicamente:

- pagamento;
- alocações;
- saldo das parcelas;
- estado das parcelas;
- estado da obrigação;
- vínculo bancário, quando existente;
- evento de domínio.

39.3 Transferência

A confirmação de transferência deverá criar atomicamente:

- movimentação de saída;
- movimentação de entrada;
- registro da transferência.

39.4 Conciliação

Uma correspondência deverá atualizar atomicamente:

- conciliação;
- alocação conciliada;
- estado da transação bancária;
- estado do pagamento ou recebimento.

39.5 Fechamento

O fechamento deverá registrar:

- resultado das validações;
- usuário;
- data;
- estado do período;
- pendências aceitas, quando permitido;
- evento de domínio.

---

40. Consultas e projeções

Nem todos os relatórios deverão ser calculados diretamente sobre os agregados transacionais a cada requisição.

Poderão ser utilizadas projeções de leitura para:

- saldo por conta;
- fluxo de caixa diário;
- aging de contas;
- DRE gerencial;
- margem por projeto;
- posição de adiantamentos;
- compromissos financeiros;
- backlog;
- capital de giro;
- indicadores de valuation.

Essas projeções poderão ser atualizadas:

- síncronamente;
- por eventos internos;
- por jobs de consolidação;
- por processamento incremental.

No MVP, deverá ser priorizada simplicidade operacional, evitando infraestrutura distribuída desnecessária.

---

41. Cálculos derivados

Os seguintes valores deverão preferencialmente ser derivados:

- saldo em aberto de parcela;
- total liquidado;
- status de atraso;
- saldo de conta financeira;
- margem de projeto;
- valor comprometido em aberto;
- aging;
- posição de caixa.

Quando valores derivados forem materializados por desempenho, deverá existir mecanismo de reconciliação e reconstrução.

---

42. DRE gerencial

A DRE será uma projeção baseada em:

- competência;
- plano de contas gerencial;
- centros de resultado;
- centros de custo;
- projetos;
- rateios;
- classificações.

O modelo deverá preservar a rastreabilidade entre cada linha da DRE e os lançamentos de origem.

Estrutura inicial:

Receita Bruta
(-) Impostos e Deduções
Receita Líquida
(-) Custos Diretos
Lucro Bruto
(-) Despesas Operacionais
EBITDA
(-) Depreciação e Amortização
EBIT
(+/-) Resultado Financeiro
Resultado Antes dos Tributos
(-) Tributos sobre o Resultado
Resultado Líquido

O controle contábil oficial não faz parte do MVP.

A DRE será gerencial e não substituirá a contabilidade legal.

---

43. Margem por projeto

A margem por projeto utilizará dados de:

- contrato;
- faturamento;
- competência de receitas;
- custos diretos;
- custos comprometidos;
- despesas alocadas;
- rateio de custos indiretos;
- provisões;
- orçamento;
- forecast.

Indicadores iniciais:

Receita contratada
Receita faturada
Receita reconhecida
Receita recebida
Custo orçado
Custo comprometido
Custo realizado
Margem bruta
Margem projetada
Desvio de margem

A política de reconhecimento de receita e rateio de custos indiretos permanece como decisão pendente.

---

44. Capital de giro

O capital de giro será calculado a partir de projeções financeiras e, futuramente, de informações patrimoniais.

No MVP, a análise poderá utilizar:

- saldos financeiros;
- contas a receber;
- contas a pagar;
- compromissos;
- adiantamentos;
- fluxo de caixa;
- pagamentos e recebimentos previstos.

Indicadores patrimoniais completos dependerão de integração contábil e de estoque.

---

45. Integração com valuation

O domínio financeiro fornecerá dados para indicadores utilizados no valuation da Aritech.

Exemplos:

- receita histórica;
- crescimento;
- EBITDA gerencial;
- margem;
- geração de caixa;
- capital de giro;
- backlog;
- concentração de clientes;
- recorrência de receitas;
- previsibilidade de contratos;
- endividamento;
- investimentos;
- retorno sobre projetos.

O cálculo do valuation pertencerá a um módulo analítico próprio.

O domínio financeiro será responsável por fornecer dados íntegros, rastreáveis e temporalmente consistentes.

---

46. Modelo conceitual simplificado

erDiagram
    FINANCIAL_ACCOUNT ||--o{ BANK_TRANSACTION : contains
    FINANCIAL_ACCOUNT ||--o{ PAYMENT : executes
    FINANCIAL_ACCOUNT ||--o{ RECEIPT : receives

    PAYABLE ||--|{ PAYABLE_INSTALLMENT : contains
    PAYABLE_INSTALLMENT ||--o{ PAYMENT_ALLOCATION : settled_by
    PAYMENT ||--|{ PAYMENT_ALLOCATION : allocates

    RECEIVABLE ||--|{ RECEIVABLE_INSTALLMENT : contains
    RECEIVABLE_INSTALLMENT ||--o{ RECEIPT_ALLOCATION : settled_by
    RECEIPT ||--|{ RECEIPT_ALLOCATION : allocates

    BANK_TRANSACTION ||--o{ RECONCILIATION_MATCH : matched_by
    BANK_RECONCILIATION ||--|{ RECONCILIATION_MATCH : contains

    FINANCIAL_TRANSFER }o--|| FINANCIAL_ACCOUNT : source
    FINANCIAL_TRANSFER }o--|| FINANCIAL_ACCOUNT : destination

    MANAGEMENT_ACCOUNT ||--o{ PAYABLE : classifies
    MANAGEMENT_ACCOUNT ||--o{ RECEIVABLE : classifies

    COST_CENTER ||--o{ PAYABLE : allocates
    RESULT_CENTER ||--o{ RECEIVABLE : allocates

    PROJECT ||--o{ PAYABLE : incurs
    PROJECT ||--o{ RECEIVABLE : earns

    CONTRACT ||--o{ BILLING_SCHEDULE_ITEM : defines
    BILLING_SCHEDULE_ITEM ||--o| RECEIVABLE : generates

    PURCHASE_ORDER ||--o| FINANCIAL_COMMITMENT : creates
    FINANCIAL_COMMITMENT ||--o{ PAYABLE : converts_to

    FINANCIAL_PERIOD ||--o{ PAYABLE : controls
    FINANCIAL_PERIOD ||--o{ RECEIVABLE : controls

    APPROVAL_REQUEST ||--|{ APPROVAL_STEP : contains

---

47. Entidades prioritárias do MVP

47.1 Obrigatórias

FinancialAccount
Payable
PayableInstallment
Payment
PaymentAllocation
Receivable
ReceivableInstallment
Receipt
ReceiptAllocation
BankTransaction
BankStatementImport
BankReconciliation
ReconciliationMatch
FinancialTransfer
ManagementAccount
CostCenter
ResultCenter
FinancialPeriod
FinancialDocumentLink

47.2 Integrações mínimas

Customer
Supplier
Project
Contract
PurchaseOrder
User
Document
AuditEvent

Essas entidades poderão ser referências a módulos ainda simplificados.

47.3 Recomendadas após o núcleo operacional

Advance
Withholding
FinancialAdjustment
FinancialCommitment
BillingScheduleItem
ContractMeasurement
ApprovalRequest
ApprovalStep
ProjectFinancialWbsItem
FinancialProjectAllocation

47.4 Fases futuras

FinancialBudget
BudgetVersion
BudgetLine
CashFlowScenario
ScenarioAssumption
Loan
Investment
ContractGuarantee
Provision
Asset
Depreciation
ExchangeRate

---

48. Organização sugerida no backend

Estrutura inicial do módulo NestJS:

apps/api/src/modules/financial/
├── application/
│   ├── commands/
│   ├── queries/
│   ├── services/
│   └── dto/
├── domain/
│   ├── aggregates/
│   ├── entities/
│   ├── value-objects/
│   ├── events/
│   ├── repositories/
│   ├── policies/
│   └── errors/
├── infrastructure/
│   ├── persistence/
│   ├── repositories/
│   ├── mappers/
│   ├── imports/
│   └── integrations/
├── presentation/
│   ├── controllers/
│   └── presenters/
└── financial.module.ts

Essa estrutura é uma referência, não uma exigência definitiva.

O monólito modular não deverá ser transformado em uma reprodução excessivamente complexa de arquitetura de microsserviços.

---

49. Repositórios de domínio

Interfaces iniciais:

FinancialAccountRepository
PayableRepository
ReceivableRepository
PaymentRepository
ReceiptRepository
BankTransactionRepository
BankReconciliationRepository
FinancialTransferRepository
FinancialPeriodRepository
ManagementAccountRepository
CostCenterRepository
ApprovalRequestRepository

Repositórios deverão representar necessidades do domínio e não abstrações genéricas de CRUD.

Evitar:

GenericRepository<T>

Preferir operações semanticamente relevantes:

findOpenInstallmentsBySupplier()
findOverdueReceivables()
findTransactionsPendingReconciliation()
findPeriodByCompetenceDate()
savePaymentWithAllocations()

---

50. Serviços de domínio

Serviços de domínio poderão ser utilizados quando uma regra:

- envolver mais de um agregado;
- não pertencer naturalmente a uma entidade;
- exigir política configurável;
- depender de cálculo financeiro especializado.

Exemplos:

PaymentAllocationService
ReceiptAllocationService
CashFlowProjectionService
FinancialPeriodClosingService
BankReconciliationMatchingService
ProjectMarginCalculationService
IndirectCostAllocationService
ApprovalPolicyService

---

51. Casos de uso prioritários

51.1 Cadastros

- criar conta financeira;
- cadastrar plano de contas;
- cadastrar centro de custo;
- cadastrar centro de resultado;
- encerrar conta financeira.

51.2 Contas a pagar

- criar conta a pagar;
- gerar parcelas;
- aprovar conta a pagar;
- editar conta em rascunho;
- cancelar conta sem liquidação;
- registrar pagamento parcial;
- registrar pagamento total;
- estornar pagamento;
- consultar contas vencidas.

51.3 Contas a receber

- criar conta a receber;
- gerar parcelas;
- registrar recebimento parcial;
- registrar recebimento total;
- estornar recebimento;
- renegociar vencimento;
- baixar perda aprovada;
- consultar inadimplência.

51.4 Banco

- importar extrato;
- identificar duplicidades;
- cadastrar movimentação manual;
- conciliar movimentação;
- desfazer conciliação autorizada;
- transferir entre contas;
- consultar saldo.

51.5 Fechamento

- validar período;
- fechar período;
- consultar pendências;
- reabrir período;
- fechar novamente.

51.6 Relatórios

- fluxo de caixa;
- aging;
- saldos bancários;
- DRE gerencial;
- margem por projeto;
- posição de compromissos;
- posição de adiantamentos.

---

52. Erros de domínio

Erros deverão possuir códigos estáveis para uso nas APIs.

Exemplos:

FINANCIAL_PERIOD_CLOSED
PAYABLE_ALREADY_SETTLED
PAYABLE_HAS_PAYMENTS
INSTALLMENT_AMOUNT_EXCEEDED
PAYMENT_ALREADY_RECONCILED
RECEIPT_ALREADY_RECONCILED
BANK_TRANSACTION_ALREADY_MATCHED
TRANSFER_ACCOUNTS_MUST_DIFFER
MANAGEMENT_ACCOUNT_NOT_POSTABLE
APPROVAL_REQUIRED
APPROVAL_LIMIT_EXCEEDED
ADVANCE_BALANCE_EXCEEDED
DUPLICATE_BANK_STATEMENT
CURRENCY_MISMATCH

Mensagens poderão ser traduzidas na camada de apresentação.

---

53. Requisitos de segurança

As permissões deverão ser avaliadas no backend.

Exemplos de permissões:

financial.account.read
financial.account.manage
financial.payable.read
financial.payable.create
financial.payable.approve
financial.payment.create
financial.payment.reverse
financial.receivable.read
financial.receivable.create
financial.receipt.create
financial.receipt.reverse
financial.reconciliation.manage
financial.period.close
financial.period.reopen
financial.report.read
financial.audit.read

Operações críticas deverão exigir autorização específica.

A interface frontend não será considerada mecanismo de segurança.

---

54. Dados sensíveis

Dados financeiros deverão receber proteção adequada.

Exemplos:

- dados bancários;
- documentos fiscais;
- valores contratuais;
- salários;
- dados de fornecedores;
- comprovantes;
- extratos.

Regras:

- acesso pelo menor privilégio;
- logs sem exposição indevida;
- mascaramento de dados quando aplicável;
- auditoria de acesso;
- proteção no armazenamento;
- URLs temporárias para documentos;
- proibição de dados sensíveis em mensagens de erro.

---

55. Requisitos de desempenho

Consultas frequentes deverão possuir índices adequados.

Candidatos iniciais:

- vencimento;
- status;
- competência;
- projeto;
- cliente;
- fornecedor;
- conta financeira;
- número do documento;
- identificador externo;
- origem;
- data da movimentação;
- estado de conciliação.

Relatórios de grande volume poderão utilizar:

- paginação;
- filtros obrigatórios;
- projeções;
- tabelas de consolidação;
- processamento assíncrono;
- exportação em arquivo.

---

56. Estratégia inicial para Prisma

O primeiro schema do Prisma deverá:

- preservar os limites dos agregados;
- utilizar relações explícitas;
- evitar campos genéricos sem semântica;
- utilizar "Decimal" para valores;
- utilizar enums apenas quando o conjunto for estável;
- possuir índices e restrições únicas;
- evitar cascatas destrutivas;
- registrar datas de criação e atualização;
- prever versionamento otimista quando necessário.

Polimorfismo genérico, como pares "entityType" e "entityId", deverá ser utilizado com cautela, pois o PostgreSQL não consegue garantir integridade referencial completa nesses casos.

Quando possível, deverão ser preferidas relações explícitas.

---

57. Decisões pendentes

Os seguintes pontos ainda precisam de decisão formal:

1. Estratégia de identificação das entidades.
2. Precisão decimal padrão para valores monetários.
3. Suporte a múltiplas moedas no MVP.
4. Política de arredondamento.
5. Política de reconhecimento de receita.
6. Política de rateio de custos indiretos.
7. Modelo de aprovações e alçadas.
8. Tratamento de renegociação de parcelas.
9. Critérios de baixa por perda.
10. Regras de tolerância para conciliação.
11. Tratamento de pagamentos sem movimentação bancária.
12. Tratamento de caixa físico.
13. Política de estorno em período fechado.
14. Integração inicial com extratos bancários.
15. Estrutura do plano de contas gerencial.
16. Política de fechamento mensal.
17. Tratamento de retenções tributárias.
18. Relacionamento entre medição, faturamento e nota fiscal.
19. Controle de múltiplas empresas.
20. Modelo de projeções e cenários.
21. Materialização de saldos e indicadores.
22. Estratégia para eventos internos no monólito modular.

---

58. Critérios de aceite do modelo

O modelo será considerado adequado para iniciar a implementação quando:

- as entidades prioritárias estiverem aprovadas;
- as fronteiras entre módulos estiverem claras;
- as invariantes principais estiverem documentadas;
- os ciclos de vida estiverem definidos;
- as operações de estorno estiverem especificadas;
- as regras de fechamento estiverem validadas;
- o plano de contas inicial estiver disponível;
- os casos de uso do MVP estiverem priorizados;
- as decisões críticas estiverem registradas em ADRs;
- o primeiro schema Prisma puder ser elaborado sem decisões estruturais implícitas.

---

59. Próximos documentos

Após a aprovação deste modelo, deverão ser elaborados:

docs/domain/FINANCIAL_WORKFLOWS.md
docs/domain/FINANCIAL_USE_CASES.md
docs/domain/FINANCIAL_RULES.md

Também poderão ser necessários ADRs específicos:

docs/adr/ADR-007-financial-amounts-and-rounding.md
docs/adr/ADR-008-financial-period-closing.md
docs/adr/ADR-009-bank-reconciliation.md
docs/adr/ADR-010-financial-domain-events.md

Depois da consolidação desses documentos, poderá ser iniciada a implementação de:

prisma/schema.prisma

---

60. Conclusão

O modelo financeiro da Plataforma Aritech deverá representar com clareza a diferença entre planejamento, compromisso, obrigação, liquidação, movimentação bancária e reconhecimento gerencial.

A separação entre contas, parcelas, pagamentos, recebimentos e movimentações bancárias é essencial para permitir:

- pagamentos parciais;
- recebimentos parciais;
- conciliação bancária;
- estornos;
- retenções;
- adiantamentos;
- rastreabilidade;
- fechamento de períodos;
- fluxo de caixa confiável;
- DRE gerencial;
- margem por projeto;
- indicadores de capital de giro;
- integração futura com valuation.

O modelo deverá ser implementado de maneira incremental, priorizando o núcleo operacional do MVP e evitando complexidade prematura.

Ao mesmo tempo, suas entidades, invariantes e fronteiras deverão permitir a evolução futura da Plataforma Aritech para uma solução integrada de gestão financeira, projetos, contratos, compras, indicadores e inteligência empresarial.