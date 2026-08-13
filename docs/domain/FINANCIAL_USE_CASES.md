Financial Use Cases

Status

Estado: proposta inicial
Escopo: casos de uso do domínio financeiro
Arquitetura: monólito modular
Documentos relacionados:

- "docs/domain/FINANCIAL_DOMAIN.md"
- "docs/domain/FINANCIAL_MODEL.md"
- "docs/domain/FINANCIAL_WORKFLOWS.md"
- "docs/architecture/ARCHITECTURE_OVERVIEW.md"
- "docs/architecture/MODULES.md"
- "docs/architecture/SECURITY.md"
- "docs/adr/ADR-006-audit-trail.md"

---

1. Objetivo

Este documento especifica os principais casos de uso do domínio financeiro da Plataforma Aritech.

Enquanto "FINANCIAL_MODEL.md" define as entidades e "FINANCIAL_WORKFLOWS.md" descreve os processos operacionais, este documento estabelece as operações que o sistema deverá disponibilizar para usuários e outros módulos.

Cada caso de uso deverá servir como referência para:

- application services;
- commands;
- queries;
- DTOs;
- endpoints REST;
- contratos OpenAPI;
- autorização;
- testes unitários;
- testes de integração;
- testes end-to-end;
- eventos de domínio.

---

2. Convenções

Os casos de uso utilizarão a seguinte estrutura:

Identificador
Nome
Objetivo
Ator principal
Pré-condições
Entrada
Fluxo principal
Fluxos alternativos
Regras
Saída
Eventos
Permissões

Os identificadores utilizarão inicialmente:

FIN-XXX

Os números representam identificação funcional e não prioridade de implementação.

---

3. Princípios

3.1 Commands e Queries

Operações deverão ser conceitualmente divididas entre:

Commands

Alteram o estado do sistema.

Exemplos:

CreatePayable
ApprovePayable
RegisterPayment
ReversePayment

Queries

Consultam informações.

Exemplos:

GetPayable
ListOpenPayables
GetCashFlow
GetProjectMargin

A plataforma não precisa implementar CQRS completo para adotar essa separação conceitual.

---

3.2 Casos de uso representam intenção

Evitar casos de uso genéricos como:

UpdatePayable

Preferir:

ChangePayableDueDate
ChangePayableClassification
SubmitPayableForApproval
CancelPayable

Isso torna regras, auditoria e autorização explícitas.

---

Parte I — Contas financeiras

FIN-001 — Criar conta financeira

Objetivo

Cadastrar uma conta utilizada pela empresa para movimentação ou controle de recursos.

Ator principal

Administrador financeiro.

Pré-condições

- usuário autenticado;
- permissão adequada;
- entidade legal existente.

Entrada

- nome;
- tipo;
- instituição;
- agência;
- conta;
- moeda;
- saldo inicial;
- data do saldo inicial;
- permite conciliação.

Fluxo principal

1. Usuário informa os dados.
2. Sistema valida os campos.
3. Sistema verifica duplicidade.
4. Conta é criada como "ACTIVE".
5. Saldo inicial é registrado.
6. Auditoria é criada.

Regras

- moeda obrigatória;
- saldo inicial deverá possuir data;
- conta duplicada deverá ser rejeitada ou sinalizada;
- dados bancários sensíveis deverão respeitar permissões.

Saída

Conta financeira criada.

Permissão

financial.account.manage

---

FIN-002 — Inativar conta financeira

Objetivo

Impedir novas movimentações sem eliminar o histórico.

Pré-condições

- conta existente;
- usuário autorizado.

Fluxo principal

1. Usuário solicita inativação.
2. Sistema verifica pendências.
3. Sistema solicita confirmação.
4. Conta passa para "INACTIVE".
5. Auditoria é registrada.

Regras

Conta inativa:

- não recebe novos pagamentos;
- não recebe novos recebimentos;
- não participa de novas transferências;
- permanece disponível em relatórios históricos.

---

FIN-003 — Consultar saldo das contas

Objetivo

Apresentar a posição financeira consolidada.

Saída

Para cada conta:

- saldo;
- moeda;
- última movimentação;
- última conciliação;
- transações pendentes.

Também deverá apresentar:

Saldo financeiro consolidado

quando as moedas forem compatíveis.

---

Parte II — Contas a pagar

FIN-010 — Criar conta a pagar

Objetivo

Registrar uma obrigação financeira.

Ator principal

Analista financeiro.

Entrada

- fornecedor ou beneficiário;
- descrição;
- documento;
- competência;
- emissão;
- valor;
- condição de pagamento;
- projeto;
- centro de custo;
- conta gerencial;
- origem;
- anexos.

Fluxo principal

1. Sistema valida beneficiário.
2. Sistema verifica período.
3. Sistema valida classificação.
4. Sistema verifica possível duplicidade.
5. "Payable" é criado como "DRAFT".
6. Parcelas são geradas.
7. Auditoria é registrada.

Regras

A soma das parcelas deverá corresponder ao valor da obrigação.

Custos diretamente associados a projetos deverão possuir "projectId".

Eventos

PayableCreated

Permissão

financial.payable.create

---

FIN-011 — Alterar conta a pagar em rascunho

Objetivo

Permitir correção antes da submissão.

Regras

Somente contas "DRAFT" poderão ser livremente alteradas.

Mudanças deverão ser auditadas.

---

FIN-012 — Submeter conta a pagar para aprovação

Pré-condições

- conta em "DRAFT";
- dados obrigatórios completos;
- parcelas válidas;
- documentos obrigatórios presentes.

Fluxo

1. Sistema executa validação final.
2. Determina política de aprovação.
3. Cria "ApprovalRequest", quando necessário.
4. Conta passa para "PENDING_APPROVAL".

Evento

PayableSubmittedForApproval

---

FIN-013 — Aprovar conta a pagar

Ator

Aprovador.

Pré-condições

- solicitação pendente;
- usuário pertencente à alçada correspondente.

Fluxo

1. Sistema verifica autorização.
2. Registra decisão.
3. Se houver próxima etapa, encaminha para o próximo aprovador.
4. Caso contrário, conta passa para "APPROVED" ou "OPEN".
5. Auditoria é registrada.

Regras

O usuário não poderá aprovar a própria solicitação quando a política exigir segregação.

Evento

PayableApproved

---

FIN-014 — Rejeitar conta a pagar

Entrada

- justificativa.

Regras

Justificativa obrigatória.

O registro original deverá permanecer disponível.

Evento

ApprovalRejected

---

FIN-015 — Alterar vencimento de parcela

Entrada

- parcela;
- novo vencimento;
- motivo.

Regras

- parcela não poderá estar liquidada;
- período deverá permitir alteração;
- mudança deverá ser auditada;
- aprovação poderá ser exigida.

---

FIN-016 — Cancelar conta a pagar

Pré-condições

- nenhum pagamento confirmado.

Entrada

- motivo.

Fluxo

1. Sistema verifica liquidações.
2. Cancela parcelas abertas.
3. Cancela saldo de compromisso quando aplicável.
4. Conta passa para "CANCELLED".
5. Auditoria é registrada.

Evento

PayableCancelled

---

FIN-017 — Consultar contas a pagar

Filtros

- fornecedor;
- vencimento;
- status;
- projeto;
- centro de custo;
- conta gerencial;
- documento;
- valor;
- origem.

Saída

Deverá distinguir:

- aberto;
- parcialmente liquidado;
- liquidado;
- vencido;
- cancelado.

---

FIN-018 — Consultar aging de contas a pagar

Faixas iniciais

A vencer
1–30 dias
31–60 dias
61–90 dias
Acima de 90 dias

Faixas deverão futuramente ser configuráveis.

---

Parte III — Pagamentos

FIN-020 — Registrar pagamento

Objetivo

Registrar a liquidação total ou parcial de uma obrigação.

Entrada

- conta financeira;
- data;
- valor;
- método;
- parcelas;
- alocações;
- juros;
- multas;
- descontos;
- retenções;
- referência bancária.

Fluxo

1. Sistema valida as parcelas.
2. Verifica saldos.
3. Calcula valor líquido.
4. Cria "Payment".
5. Cria "PaymentAllocation".
6. Atualiza parcelas.
7. Atualiza a conta.
8. Registra auditoria.
9. Publica evento.

Regras

Nenhuma parcela poderá possuir saldo negativo.

Evento

PaymentConfirmed

Permissão

financial.payment.create

---

FIN-021 — Registrar pagamento parcial

Utiliza o mesmo agregado de "FIN-020".

A diferença é que:

valor alocado < saldo da parcela

A parcela passa para:

PARTIALLY_SETTLED

---

FIN-022 — Pagar várias parcelas

Objetivo

Liquidar várias parcelas com uma única operação financeira.

Regras

- uma única entidade "Payment";
- múltiplas "PaymentAllocation";
- soma das alocações compatível com o pagamento;
- sobra explicitamente classificada.

---

FIN-023 — Registrar juros ou multa

Entrada

- tipo;
- valor;
- motivo.

Regras

Juros e multa não deverão alterar o principal histórico.

Devem ser classificados separadamente.

---

FIN-024 — Registrar desconto

Entrada

- valor;
- motivo.

Regras

Descontos acima da alçada configurada deverão exigir aprovação.

---

FIN-025 — Estornar pagamento

Entrada

- pagamento;
- motivo.

Fluxo

1. Sistema valida permissão.
2. Verifica conciliação.
3. Verifica período.
4. Cria operação de reversão.
5. Restaura saldos.
6. Atualiza estados.
7. Registra auditoria.

Evento

PaymentReversed

Permissão

financial.payment.reverse

---

Parte IV — Contas a receber

FIN-030 — Criar conta a receber

Objetivo

Registrar um direito financeiro.

Entrada

- cliente;
- descrição;
- documento;
- competência;
- valor;
- condição;
- projeto;
- centro de resultado;
- conta gerencial;
- contrato;
- origem.

Fluxo

1. Sistema valida cliente.
2. Verifica período.
3. Verifica duplicidade.
4. Cria "Receivable".
5. Gera parcelas.
6. Registra auditoria.

Evento

ReceivableCreated

---

FIN-031 — Criar recebível a partir de contrato

Entrada

- "contractId";
- "billingScheduleItemId".

Regras

- marco deverá estar elegível;
- valor deverá respeitar saldo contratual;
- operação deverá ser idempotente;
- vínculo com contrato deverá permanecer.

---

FIN-032 — Criar recebível por medição

Entrada

- "measurementId".

Regras

A medição deverá estar aprovada.

Retenções deverão ser registradas separadamente.

---

FIN-033 — Alterar vencimento de recebível

Entrada

- parcela;
- novo vencimento;
- motivo.

Regras

A data original deverá permanecer disponível para análise histórica.

---

FIN-034 — Cancelar recebível

Permitido somente quando não houver recebimentos confirmados.

Caso contrário deverá ser utilizado estorno ou procedimento de ajuste.

---

FIN-035 — Consultar contas a receber

Filtros

- cliente;
- projeto;
- contrato;
- vencimento;
- status;
- documento;
- valor;
- centro de resultado.

---

FIN-036 — Consultar aging de contas a receber

Faixas iniciais:

A vencer
1–30 dias
31–60 dias
61–90 dias
Acima de 90 dias

---

FIN-037 — Baixar recebível por perda

Pré-condições

- saldo aberto;
- justificativa;
- aprovação.

Entrada

- valor;
- motivo;
- evidências.

Evento

ReceivableWrittenOff

---

Parte V — Recebimentos

FIN-040 — Registrar recebimento

Entrada

- conta financeira;
- data;
- valor;
- parcelas;
- alocações;
- retenções;
- juros;
- descontos;
- método;
- referência.

Fluxo

1. Sistema valida saldo.
2. Cria "Receipt".
3. Cria alocações.
4. Atualiza parcelas.
5. Atualiza recebível.
6. Registra auditoria.

Evento

ReceiptConfirmed

---

FIN-041 — Registrar recebimento parcial

O saldo remanescente permanece aberto.

A parcela passa para:

PARTIALLY_SETTLED

---

FIN-042 — Alocar recebimento a várias parcelas

Um recebimento poderá liquidar múltiplas parcelas.

A distribuição deverá permanecer explicitamente registrada.

---

FIN-043 — Registrar recebimento não identificado

Objetivo

Controlar entradas bancárias cuja origem ainda não tenha sido identificada.

Regras

O valor não deverá ser automaticamente reconhecido como receita.

---

FIN-044 — Estornar recebimento

Entrada

- recebimento;
- motivo.

Evento

ReceiptReversed

---

Parte VI — Adiantamentos

FIN-050 — Registrar adiantamento a fornecedor

Fluxo

1. Solicitação aprovada.
2. Pagamento executado.
3. "Advance" criado.
4. Saldo fica disponível para compensação.

---

FIN-051 — Aplicar adiantamento a conta a pagar

Entrada

- adiantamento;
- conta;
- valor.

Regras

O valor aplicado não poderá exceder:

- saldo do adiantamento;
- saldo da obrigação.

---

FIN-052 — Registrar adiantamento de cliente

O recebimento antecipado deverá criar saldo de adiantamento.

Não deverá gerar receita automaticamente.

---

FIN-053 — Aplicar adiantamento de cliente

Permite compensar o adiantamento contra recebível posterior.

---

FIN-054 — Solicitar adiantamento de viagem

Entrada

- colaborador;
- projeto;
- período;
- finalidade;
- valor.

---

FIN-055 — Prestar contas de adiantamento

Entrada

- despesas;
- comprovantes;
- classificações;
- projeto.

Saída

O sistema deverá determinar:

valor a devolver

ou:

valor adicional a reembolsar

---

Parte VII — Movimentações bancárias

FIN-060 — Importar extrato OFX

Entrada

- conta financeira;
- arquivo.

Fluxo

1. Sistema calcula hash.
2. Verifica duplicidade.
3. Interpreta OFX.
4. Valida conta e período.
5. Detecta transações duplicadas.
6. Cria "BankTransaction".
7. Gera resultado da importação.
8. Inicia sugestões de conciliação.

Evento

BankStatementImported

---

FIN-061 — Consultar movimentações bancárias

Filtros

- conta;
- período;
- crédito/débito;
- valor;
- descrição;
- status;
- conciliação.

---

FIN-062 — Registrar movimentação manual

Regras

- permissão específica;
- motivo obrigatório;
- origem "MANUAL";
- auditoria obrigatória.

---

Parte VIII — Conciliação bancária

FIN-070 — Gerar sugestões de conciliação

Objetivo

Encontrar operações internas compatíveis com movimentações bancárias.

Critérios

- valor;
- data;
- contraparte;
- documento;
- referência;
- histórico.

Saída

Lista de candidatos com "confidenceScore".

---

FIN-071 — Conciliar transação manualmente

Entrada

- transação;
- operação ou operações;
- valores.

Regras

A soma conciliada não poderá exceder o valor da transação.

---

FIN-072 — Confirmar sugestão de conciliação

Transforma uma sugestão em correspondência confirmada.

O sistema deverá registrar:

- usuário;
- regra;
- confiança original;
- data.

---

FIN-073 — Conciliar parcialmente

Permite que apenas parte do valor seja associada.

O saldo permanece pendente.

---

FIN-074 — Desfazer conciliação

Entrada

- correspondência;
- justificativa.

Regras

- exige permissão;
- período fechado poderá bloquear;
- histórico deverá permanecer.

---

FIN-075 — Concluir conciliação do período

Pré-condições

Validações definidas pela política de fechamento da conciliação.

Evento

BankReconciliationCompleted

---

Parte IX — Transferências

FIN-080 — Criar transferência

Entrada

- conta origem;
- conta destino;
- valor;
- data;
- tarifa.

Regras

- contas diferentes;
- contas ativas;
- moeda compatível;
- valor positivo.

---

FIN-081 — Confirmar transferência

Fluxo

A operação deverá criar atomicamente:

débito na origem
+
crédito no destino

Evento

FinancialTransferConfirmed

---

FIN-082 — Estornar transferência

Cria operações inversas.

A transferência original deverá permanecer registrada.

---

Parte X — Compromissos

FIN-090 — Criar compromisso por pedido de compra

Gatilho

PurchaseOrderApproved

Fluxo

1. Evento recebido.
2. Idempotência verificada.
3. Compromisso criado.
4. Fluxo de caixa previsto atualizado.

---

FIN-091 — Converter compromisso em conta a pagar

Entrada

- compromisso;
- documento fiscal;
- valor convertido.

Regras

O valor convertido não poderá superar o saldo sem tratamento de divergência.

---

FIN-092 — Cancelar saldo de compromisso

Utilizado quando pedido ou saldo remanescente for cancelado.

O histórico do compromisso deverá permanecer.

---

Parte XI — Retenções

FIN-100 — Registrar retenção tributária

Entrada

- tipo;
- base;
- alíquota;
- valor;
- obrigação relacionada.

Regras

A retenção não altera o valor bruto histórico.

---

FIN-101 — Registrar retenção contratual

Entrada

- contrato;
- recebível;
- percentual ou valor;
- condição de liberação.

---

FIN-102 — Liberar retenção contratual

Pré-condições

Marco contratual atendido.

Entrada

- retenção;
- evidência;
- data.

Saída

Novo direito financeiro ou liberação do saldo correspondente.

---

Parte XII — Períodos

FIN-110 — Validar fechamento

Objetivo

Executar checklist financeiro do período.

Saída

Pendências classificadas como:

BLOCKING
WARNING
INFORMATIONAL

---

FIN-111 — Fechar período

Pré-condições

- usuário autorizado;
- nenhuma pendência bloqueante.

Fluxo

1. Executa validação final.
2. Registra fechamento.
3. Período passa para "CLOSED".
4. Operações retroativas são bloqueadas.

Evento

FinancialPeriodClosed

---

FIN-112 — Solicitar reabertura

Entrada

- período;
- justificativa.

Poderá gerar "ApprovalRequest".

---

FIN-113 — Reabrir período

Pré-condições

Aprovação concluída, quando exigida.

Evento

FinancialPeriodReopened

---

Parte XIII — Fluxo de caixa

FIN-120 — Consultar fluxo de caixa

Entrada

- data inicial;
- data final;
- contas;
- projetos;
- cenário.

Saída

Para cada período:

- saldo inicial;
- entradas;
- saídas;
- saldo final.

Deverá distinguir:

REALIZED
EXPECTED
COMMITTED
BUDGETED

---

FIN-121 — Consultar fluxo de caixa por projeto

Permite analisar impacto de determinado projeto no caixa da empresa.

Deverá considerar:

- faturamento;
- recebimentos;
- compras;
- pagamentos;
- compromissos;
- custos previstos.

---

FIN-122 — Projetar necessidade de capital de giro

Saída

- menor saldo projetado;
- data do menor saldo;
- necessidade adicional de caixa;
- duração da exposição;
- recuperação prevista.

---

FIN-123 — Criar cenário financeiro

Entrada

- nome;
- período;
- tipo;
- premissas.

---

FIN-124 — Simular novo contrato

Entrada

- valor contratado;
- cronograma de faturamento;
- prazo de recebimento;
- impostos;
- custos;
- compras;
- retenções;
- mobilização.

Saída

- fluxo incremental;
- capital de giro necessário;
- margem projetada;
- pico de exposição;
- prazo de recuperação do caixa.

---

Parte XIV — DRE gerencial

FIN-130 — Consultar DRE gerencial

Entrada

- período;
- projeto;
- centro de resultado;
- centro de custo;
- comparação.

Saída

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
(-) Tributos
Resultado Líquido

---

FIN-131 — Comparar DRE

Comparações:

- período anterior;
- mesmo período do ano anterior;
- budget;
- forecast;
- cenário.

---

FIN-132 — Detalhar linha da DRE

Objetivo

Garantir rastreabilidade.

O usuário deverá poder navegar:

DRE
↓
Conta gerencial
↓
Lançamentos
↓
Documento de origem

---

Parte XV — Projetos

FIN-140 — Consultar posição financeira do projeto

Saída

- valor contratado;
- aditivos;
- faturado;
- recebido;
- contas a receber;
- custos orçados;
- custos comprometidos;
- custos realizados;
- pagamentos;
- margem;
- necessidade de caixa.

---

FIN-141 — Consultar margem do projeto

Saída

Margem da baseline
Margem atual
Margem projetada
Desvio

---

FIN-142 — Ratear custo entre projetos

Entrada

- lançamento;
- projetos;
- percentuais ou valores;
- método.

Regras

Total deverá ser 100% ou corresponder integralmente ao valor alocável.

---

FIN-143 — Consultar curva financeira do projeto

Saída

Evolução temporal de:

- orçamento;
- comprometido;
- realizado;
- faturamento;
- recebimentos.

---

Parte XVI — Orçamento e forecast

FIN-150 — Criar orçamento

Entrada

- escopo;
- período;
- linhas orçamentárias.

---

FIN-151 — Submeter orçamento para aprovação

Após submissão, a versão deverá ficar protegida contra alterações não controladas.

---

FIN-152 — Aprovar baseline

Uma baseline aprovada deverá ser imutável.

---

FIN-153 — Criar forecast

O forecast deverá partir de:

- versão anterior;
- realizado;
- compromissos;
- projeções atualizadas.

---

FIN-154 — Comparar orçamento, forecast e realizado

Saída

Para cada dimensão:

Budget
Forecast
Committed
Realized
Variance
Variance %

---

Parte XVII — Aprovações

FIN-160 — Solicitar aprovação

Caso de uso genérico interno utilizado por processos financeiros.

Não deverá ser exposto como CRUD indiscriminado.

---

FIN-161 — Aprovar solicitação

Regras

- usuário deve possuir alçada;
- etapa deve estar ativa;
- decisão imutável;
- auditoria obrigatória.

---

FIN-162 — Rejeitar solicitação

Justificativa obrigatória.

---

FIN-163 — Consultar aprovações pendentes

Saída

Lista personalizada para o usuário autenticado.

Filtros:

- processo;
- valor;
- solicitante;
- data;
- projeto.

---

Parte XVIII — Dashboard

FIN-170 — Consultar dashboard financeiro

Objetivo

Fornecer visão executiva da situação financeira.

Indicadores iniciais

- saldo disponível;
- saldo projetado;
- contas a pagar;
- contas a receber;
- contas vencidas;
- recebíveis vencidos;
- fluxo de caixa 30 dias;
- fluxo de caixa 90 dias;
- receita do mês;
- custos do mês;
- EBITDA gerencial;
- margem;
- backlog;
- capital de giro.

---

FIN-171 — Consultar alertas financeiros

Alertas possíveis

- caixa abaixo do mínimo;
- cliente inadimplente;
- pagamento vencendo;
- compromisso acima do orçamento;
- projeto com margem negativa;
- retenção liberável;
- adiantamento antigo;
- conciliação pendente;
- fechamento pendente.

---

Parte XIX — Valuation

FIN-180 — Fornecer indicadores para valuation

Objetivo

Disponibilizar dados financeiros normalizados ao módulo analítico.

Dados

- receita;
- EBITDA;
- geração de caixa;
- margem;
- crescimento;
- capital de giro;
- backlog;
- receita recorrente;
- concentração de clientes;
- dívida;
- investimentos.

O módulo financeiro não calculará necessariamente o valuation.

---

FIN-181 — Consultar série histórica de indicador

Entrada

- indicador;
- período;
- granularidade.

Saída

Série temporal auditável.

---

Parte XX — Auditoria

FIN-190 — Consultar histórico de entidade financeira

Entrada

- entidade;
- identificador.

Saída

Linha do tempo:

Criação
Alterações
Aprovações
Liquidações
Conciliações
Estornos
Cancelamentos

---

FIN-191 — Consultar auditoria financeira

Filtros

- usuário;
- operação;
- período;
- entidade;
- projeto;
- valor.

Permissão

financial.audit.read

---

Parte XXI — Exportações

FIN-200 — Exportar contas a pagar

Formatos iniciais:

CSV
XLSX

---

FIN-201 — Exportar contas a receber

Mesma política de autorização da consulta correspondente.

---

FIN-202 — Exportar fluxo de caixa

Deverá preservar:

- filtros;
- cenário;
- data da geração;
- usuário;
- unidade monetária.

---

FIN-203 — Exportar DRE gerencial

Deverá permitir detalhamento conforme autorização.

---

Parte XXII — Requisitos transversais

204. Autorização

Todos os commands deverão verificar autorização no backend.

Queries também deverão respeitar escopo de acesso.

Exemplo:

Um gerente de projeto poderá visualizar somente projetos sob sua responsabilidade caso essa política seja adotada.

---

205. Auditoria

Commands financeiramente relevantes deverão gerar auditoria.

O log deverá registrar:

- ator;
- operação;
- entidade;
- estado anterior;
- estado posterior;
- timestamp;
- correlação;
- justificativa.

---

206. Idempotência

Commands originados por integração deverão aceitar chave idempotente.

Exemplos:

CreatePayableFromPurchaseOrder
CreateReceivableFromMeasurement
ImportBankStatement
ProcessBankWebhook

---

207. Validação de período

Commands que afetem competência ou caixa deverão verificar o "FinancialPeriod".

---

208. Documentos

Casos de uso poderão exigir documentos conforme:

- tipo da operação;
- valor;
- política;
- fornecedor;
- projeto.

---

209. Observabilidade

Casos de uso críticos deverão registrar métricas técnicas.

Exemplos:

- duração;
- sucesso;
- falha;
- retries;
- duplicidades bloqueadas;
- erros de integração.

Logs técnicos não deverão substituir auditoria.

---

Parte XXIII — Priorização do MVP

210. MVP 1 — Fundação

Implementar:

FIN-001
FIN-002
FIN-003
FIN-010
FIN-011
FIN-015
FIN-016
FIN-017
FIN-018
FIN-020
FIN-021
FIN-022
FIN-025
FIN-030
FIN-033
FIN-034
FIN-035
FIN-036
FIN-040
FIN-041
FIN-042
FIN-044
FIN-060
FIN-061
FIN-070
FIN-071
FIN-073
FIN-074
FIN-080
FIN-081
FIN-120
FIN-170
FIN-190

Objetivo:

«substituir controles financeiros operacionais mantidos em planilhas e consolidar uma fonte única da verdade.»

---

211. MVP 2 — Governança

Adicionar:

FIN-012
FIN-013
FIN-014
FIN-023
FIN-024
FIN-037
FIN-062
FIN-072
FIN-075
FIN-082
FIN-110
FIN-111
FIN-112
FIN-113
FIN-130
FIN-132
FIN-160
FIN-161
FIN-162
FIN-163
FIN-191

Objetivo:

«adicionar aprovação, fechamento, DRE e controles de governança.»

---

212. MVP 3 — Integração operacional

Adicionar:

FIN-031
FIN-032
FIN-050
FIN-051
FIN-052
FIN-053
FIN-054
FIN-055
FIN-090
FIN-091
FIN-092
FIN-100
FIN-101
FIN-102
FIN-140
FIN-141
FIN-142
FIN-143

Objetivo:

«integrar financeiro, projetos, contratos e compras.»

---

213. Evolução analítica

Adicionar:

FIN-121
FIN-122
FIN-123
FIN-124
FIN-131
FIN-150
FIN-151
FIN-152
FIN-153
FIN-154
FIN-171
FIN-180
FIN-181

Objetivo:

«transformar o financeiro operacional em uma plataforma de planejamento e apoio à decisão.»

---

214. Mapeamento inicial para API

A API REST poderá seguir recursos como:

/api/v1/financial/accounts
/api/v1/financial/payables
/api/v1/financial/payments
/api/v1/financial/receivables
/api/v1/financial/receipts
/api/v1/financial/advances
/api/v1/financial/bank-transactions
/api/v1/financial/reconciliations
/api/v1/financial/transfers
/api/v1/financial/periods
/api/v1/financial/cash-flow
/api/v1/financial/reports

Commands específicos deverão utilizar ações semanticamente explícitas quando apropriado.

Exemplo:

POST /payables/{id}/submit
POST /payables/{id}/approve
POST /payables/{id}/cancel

POST /payments/{id}/reverse

POST /reconciliations/{id}/complete

POST /periods/{id}/close
POST /periods/{id}/reopen

O desenho definitivo será realizado na especificação OpenAPI.

---

215. Mapeamento para application layer

Exemplo de estrutura:

application/
├── commands/
│   ├── create-payable/
│   ├── submit-payable/
│   ├── approve-payable/
│   ├── cancel-payable/
│   ├── register-payment/
│   ├── reverse-payment/
│   ├── create-receivable/
│   ├── register-receipt/
│   ├── import-bank-statement/
│   ├── reconcile-bank-transaction/
│   └── close-financial-period/
│
└── queries/
    ├── get-payable/
    ├── list-payables/
    ├── get-receivable/
    ├── list-receivables/
    ├── get-cash-flow/
    ├── get-financial-dashboard/
    ├── get-management-dre/
    └── get-project-margin/

Não é necessário criar uma classe para cada linha deste documento caso operações possam ser agrupadas sem perda de semântica.

---

216. Relação com testes

Cada caso de uso deverá possuir pelo menos:

- cenário de sucesso;
- falha por autorização;
- falha por dados inválidos;
- falha por estado incompatível;
- falha por período fechado;
- teste das invariantes aplicáveis.

Casos financeiros críticos deverão possuir testes adicionais para:

- arredondamento;
- parcialidade;
- estorno;
- idempotência;
- concorrência;
- auditoria.

---

217. Exemplo de cenário de teste

Caso:

FIN-021 — Registrar pagamento parcial

Given:

Conta a pagar: R$ 100.000
Saldo da parcela: R$ 100.000
Estado: OPEN

When:

Pagamento: R$ 40.000

Then:

Total pago: R$ 40.000
Saldo: R$ 60.000
Parcela: PARTIALLY_SETTLED
Conta: PARTIALLY_SETTLED

And:

Payment criado
PaymentAllocation criada
AuditEvent criado
PaymentConfirmed publicado

---

218. Exemplo de cenário de estorno

Given:

Conta: R$ 100.000
Pagamento confirmado: R$ 40.000
Saldo: R$ 60.000

When:

Pagamento de R$ 40.000 é estornado

Then:

Pagamento original permanece
Reversão é criada
Saldo retorna para R$ 100.000
Parcela retorna para OPEN
Auditoria registra o motivo
PaymentReversed é publicado

---

219. Exemplo de conciliação

Given:

BankTransaction:
CREDIT R$ 93.850

And:

Receivable:
Valor bruto R$ 100.000
Retenção R$ 6.150

When:

Transação é conciliada ao recebimento

Then:

Valor bancário: R$ 93.850
Retenção: R$ 6.150
Valor liquidado: R$ 100.000
ReceivableInstallment: SETTLED
BankTransaction: RECONCILED

---

220. Decisões pendentes

Antes da implementação completa dos casos de uso deverão ser definidos:

1. valores das alçadas;
2. política de segregação de funções;
3. documentos obrigatórios;
4. precisão monetária;
5. política de arredondamento;
6. tolerâncias de conciliação;
7. regras de período fechado;
8. política de baixa por perda;
9. tratamento de renegociações;
10. política de rateio;
11. reconhecimento de receita;
12. estrutura inicial do plano de contas;
13. integração bancária inicial;
14. escopo exato do primeiro MVP.

As decisões estruturais deverão ser registradas em ADRs quando apropriado.

---

221. Próximo documento

Após a aprovação dos casos de uso, deverá ser elaborado:

docs/domain/FINANCIAL_RULES.md

Esse documento consolidará as invariantes e regras financeiras transversais que não devem ficar duplicadas entre entidades, workflows e casos de uso.

Depois dele, deverão ser tratados os ADRs financeiros antes da criação definitiva do "schema.prisma".

---

222. Conclusão

Os casos de uso apresentados formam a interface funcional do núcleo financeiro da Plataforma Aritech.

Eles conectam:

necessidade operacional
        ↓
caso de uso
        ↓
regra de domínio
        ↓
application service
        ↓
agregado
        ↓
persistência
        ↓
evento
        ↓
auditoria

Essa estrutura permitirá desenvolver o módulo financeiro de maneira incremental sem perder a visão integrada da plataforma.

O primeiro objetivo da implementação deverá ser substituir controles financeiros dispersos por uma fonte única, consistente e auditável.

A partir dessa fundação, a Plataforma Aritech poderá evoluir para integrar compras, contratos, projetos, planejamento financeiro, indicadores e valuation, permitindo que cada evento operacional relevante seja refletido de forma estruturada no desempenho financeiro da empresa.