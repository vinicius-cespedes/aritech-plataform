Financial Workflows

Status

Estado: proposta inicial
Escopo: fluxos operacionais do domínio financeiro
Arquitetura: monólito modular
Documentos relacionados:

- "docs/domain/FINANCIAL_DOMAIN.md"
- "docs/domain/FINANCIAL_MODEL.md"
- "docs/architecture/ARCHITECTURE_OVERVIEW.md"
- "docs/architecture/MODULES.md"
- "docs/architecture/SECURITY.md"
- "docs/adr/ADR-006-audit-trail.md"

---

1. Objetivo

Este documento descreve os principais fluxos operacionais do domínio financeiro da Plataforma Aritech.

Seu objetivo é transformar as entidades, agregados e regras do modelo financeiro em processos claros, auditáveis e implementáveis.

Os fluxos apresentados deverão orientar:

- casos de uso do backend;
- endpoints REST;
- telas do frontend;
- permissões;
- eventos de domínio;
- validações;
- testes automatizados;
- integrações entre módulos;
- critérios de aceite do MVP.

Este documento não substitui os procedimentos administrativos internos da Aritech.

Ele define o comportamento esperado da plataforma.

---

2. Princípios dos fluxos financeiros

2.1 Toda operação deve possuir origem

Uma obrigação, recebível ou movimentação deverá possuir origem identificável.

Exemplos:

- pedido de compra;
- contrato;
- medição;
- nota fiscal;
- folha de pagamento;
- imposto;
- despesa administrativa;
- lançamento manual;
- movimentação bancária importada.

---

2.2 Estados não devem ser alterados arbitrariamente

Mudanças de estado deverão ocorrer por operações de domínio explícitas.

Exemplo incorreto:

Atualizar status da conta para PAGA

Exemplo correto:

Registrar pagamento
    ↓
Alocar pagamento às parcelas
    ↓
Atualizar saldos
    ↓
Determinar novo estado da parcela
    ↓
Determinar novo estado da conta

---

2.3 Operações críticas devem ser transacionais

Sempre que uma operação afetar múltiplas entidades relacionadas, todas as alterações deverão ocorrer na mesma transação de banco de dados.

Exemplos:

- criação de conta e parcelas;
- registro de pagamento;
- registro de recebimento;
- transferência;
- conciliação;
- fechamento;
- estorno;
- aplicação de adiantamento.

---

2.4 Histórico financeiro não deve ser apagado

Operações concluídas não poderão ser removidas.

Correções deverão ocorrer por:

- cancelamento;
- estorno;
- reclassificação;
- reabertura;
- lançamento compensatório;
- nova versão.

---

2.5 O frontend não decide regras críticas

Regras financeiras deverão ser validadas no backend.

Exemplos:

- limite de aprovação;
- período fechado;
- saldo disponível;
- valor máximo de liquidação;
- permissão de estorno;
- tolerância de conciliação;
- segregação de funções.

---

3. Perfis participantes

Os fluxos poderão envolver os seguintes papéis.

3.1 Solicitante

Cria uma solicitação ou informa uma necessidade.

Exemplos:

- comprador;
- engenheiro;
- coordenador;
- responsável por projeto;
- colaborador.

---

3.2 Analista financeiro

Responsável por:

- registrar obrigações;
- conferir documentos;
- programar pagamentos;
- registrar recebimentos;
- importar extratos;
- conciliar movimentações;
- acompanhar vencimentos.

---

3.3 Aprovador

Responsável por aprovar operações dentro de sua alçada.

Exemplos:

- coordenador;
- gerente;
- diretor;
- sócio.

---

3.4 Tesouraria

Responsável pela movimentação efetiva dos recursos.

No MVP, essa função poderá ser exercida pelo mesmo usuário do financeiro, desde que as permissões sejam separadas.

---

3.5 Controladoria

Responsável por:

- fechamento;
- DRE gerencial;
- classificação;
- centros de custo;
- margem por projeto;
- análise de desvios;
- indicadores.

---

3.6 Administrador

Configura:

- permissões;
- alçadas;
- plano de contas;
- períodos;
- parâmetros;
- integrações.

O administrador técnico não deverá automaticamente possuir permissão para aprovar ou movimentar recursos financeiros.

---

4. Fluxo geral de uma obrigação financeira

flowchart TD
    A[Origem da obrigação] --> B[Criação da conta a pagar]
    B --> C[Validação dos dados]
    C --> D{Exige aprovação?}
    D -- Sim --> E[Solicitação de aprovação]
    E --> F{Aprovada?}
    F -- Não --> G[Rejeitada ou devolvida]
    F -- Sim --> H[Conta aberta]
    D -- Não --> H
    H --> I[Programação do pagamento]
    I --> J[Execução do pagamento]
    J --> K[Registro da liquidação]
    K --> L[Conciliação bancária]
    L --> M[Conta liquidada]

---

Parte I — Contas a pagar

5. Criação manual de conta a pagar

5.1 Objetivo

Permitir o registro de uma obrigação que não tenha sido criada automaticamente por outro módulo.

Exemplos:

- aluguel;
- energia;
- contador;
- guia de imposto;
- reembolso;
- despesa administrativa;
- fornecedor sem pedido de compra;
- despesa emergencial.

---

5.2 Pré-condições

- usuário autenticado;
- permissão "financial.payable.create";
- fornecedor ou beneficiário cadastrado;
- plano de contas ativo;
- centro de custo válido;
- período financeiro aberto;
- moeda permitida.

---

5.3 Dados mínimos

- beneficiário;
- descrição;
- tipo de documento;
- número do documento, quando aplicável;
- data de emissão;
- data de competência;
- valor;
- condição de pagamento;
- classificação gerencial;
- centro de custo;
- projeto, quando aplicável;
- origem;
- anexos obrigatórios, conforme a política.

---

5.4 Fluxo principal

1. O usuário inicia uma nova conta a pagar.
2. O sistema atribui um identificador.
3. A conta é criada no estado "DRAFT".
4. O usuário informa os dados obrigatórios.
5. O sistema valida:
   - valores;
   - datas;
   - classificação;
   - fornecedor;
   - período;
   - duplicidade;
   - documentos obrigatórios.
6. O sistema gera as parcelas.
7. A soma das parcelas é validada contra o valor total.
8. O usuário salva o rascunho ou envia para aprovação.
9. Quando enviada, a conta passa para "PENDING_APPROVAL".
10. O evento "PayableSubmittedForApproval" é publicado.

---

5.5 Fluxos alternativos

Documento possivelmente duplicado

Se o sistema encontrar conta com:

- mesmo fornecedor;
- mesmo número de documento;
- mesmo valor;
- data próxima;

deverá alertar o usuário.

A política poderá:

- bloquear;
- permitir com justificativa;
- exigir aprovação adicional.

---

Conta sem projeto

Se a classificação indicar custo direto de projeto e nenhum projeto estiver associado, o sistema deverá bloquear o envio.

---

Período fechado

Se a competência estiver em período fechado:

- a criação deverá ser bloqueada;
- ou deverá ser exigida competência no período atual;
- ou deverá ser iniciado processo formal de reabertura.

---

5.6 Pós-condições

- conta criada;
- parcelas geradas;
- trilha de auditoria registrada;
- aprovação iniciada, quando aplicável;
- nenhum efeito bancário gerado.

---

6. Criação automática por pedido de compra

6.1 Objetivo

Converter compromissos de compras em obrigações financeiras.

6.2 Fluxo conceitual

flowchart TD
    A[Pedido de compra aprovado] --> B[Compromisso financeiro criado]
    B --> C[Fornecedor entrega]
    C --> D[Documento fiscal recebido]
    D --> E[Conferência com pedido]
    E --> F{Valores compatíveis?}
    F -- Sim --> G[Conta a pagar criada]
    F -- Não --> H[Tratamento de divergência]
    G --> I[Compromisso convertido]

---

6.3 Fluxo principal

1. O módulo de Compras publica "PurchaseOrderApproved".
2. O módulo financeiro recebe o evento.
3. É criado um "FinancialCommitment".
4. O compromisso alimenta o fluxo de caixa previsto.
5. Quando o documento fiscal for recebido, o usuário o associa ao pedido.
6. O sistema compara:
   - fornecedor;
   - itens;
   - quantidades;
   - valores;
   - condição de pagamento;
   - impostos;
   - projeto.
7. Se a conferência for aprovada, uma conta a pagar é criada.
8. O compromisso é convertido total ou parcialmente.
9. A conta mantém referência ao pedido e ao compromisso.
10. O saldo comprometido é recalculado.

---

6.4 Divergências possíveis

- valor da nota maior que o pedido;
- quantidade superior;
- fornecedor diferente;
- condição de pagamento divergente;
- projeto incorreto;
- cobrança duplicada;
- frete não previsto;
- imposto adicional;
- entrega parcial.

---

6.5 Tratamento de divergência

A plataforma poderá:

- bloquear a criação;
- permitir conta parcial;
- solicitar revisão do pedido;
- exigir aprovação extraordinária;
- registrar justificativa;
- criar compromisso complementar.

---

7. Aprovação de conta a pagar

7.1 Objetivo

Garantir que obrigações financeiras sejam autorizadas conforme alçadas.

7.2 Fluxo

flowchart TD
    A[Conta pendente] --> B[Determinar política]
    B --> C[Gerar etapas]
    C --> D[Notificar aprovador]
    D --> E{Decisão}
    E -- Aprovar --> F{Há próxima etapa?}
    F -- Sim --> D
    F -- Não --> G[Conta aprovada]
    E -- Rejeitar --> H[Conta rejeitada]
    E -- Devolver --> I[Retorno ao solicitante]

---

7.3 Critérios para determinar alçada

- valor total;
- tipo de despesa;
- centro de custo;
- projeto;
- fornecedor;
- urgência;
- existência de pedido;
- despesa orçada ou não;
- desvio contra orçamento;
- usuário solicitante.

---

7.4 Regras

- o solicitante não deverá aprovar a própria solicitação quando a política exigir segregação;
- aprovações deverão respeitar a ordem;
- rejeições deverão possuir justificativa;
- alteração de valor após aprovação deverá reiniciar o fluxo;
- alteração de fornecedor deverá invalidar a aprovação;
- alteração de classificação poderá exigir nova aprovação;
- todas as decisões deverão ser auditadas.

---

8. Programação de pagamento

8.1 Objetivo

Organizar as parcelas previstas para pagamento.

8.2 Critérios de seleção

- vencimento;
- fornecedor;
- projeto;
- conta financeira;
- prioridade;
- disponibilidade de caixa;
- desconto por antecipação;
- risco de multa;
- aprovação concluída;
- documentos completos.

---

8.3 Estados operacionais sugeridos

A programação não altera necessariamente o estado da obrigação.

Poderá existir uma entidade ou projeção com estados:

NOT_SCHEDULED
SCHEDULED
SENT_TO_BANK
EXECUTED
FAILED
CANCELLED

---

8.4 Regras

- somente parcelas aprovadas poderão ser programadas;
- parcelas canceladas não poderão ser incluídas;
- a conta financeira deverá estar ativa;
- o valor programado não poderá superar o saldo;
- programação não significa pagamento confirmado;
- a programação deverá poder ser cancelada antes da execução.

---

9. Registro de pagamento total

9.1 Pré-condições

- conta aprovada;
- parcela aberta;
- período de pagamento disponível;
- usuário com permissão;
- conta financeira ativa.

---

9.2 Fluxo principal

1. O usuário seleciona a parcela.
2. Informa:
   - data;
   - conta financeira;
   - valor;
   - método;
   - juros;
   - multa;
   - desconto;
   - retenções;
   - referência bancária.
3. O sistema calcula o valor líquido.
4. O sistema valida o saldo.
5. Um "Payment" é criado.
6. Uma "PaymentAllocation" é criada.
7. O saldo da parcela é zerado.
8. A parcela passa para "SETTLED".
9. Se todas as parcelas estiverem liquidadas, a conta passa para "SETTLED".
10. Uma movimentação bancária poderá ser criada ou associada.
11. O evento "PaymentConfirmed" é publicado.
12. A auditoria é registrada.

---

9.3 Fórmula conceitual

Valor pago =
principal
+ juros
+ multa
- desconto
- retenções compensáveis

A fórmula exata dependerá da natureza da retenção.

---

10. Pagamento parcial

10.1 Objetivo

Permitir que uma parcela seja liquidada em várias operações.

10.2 Fluxo

1. O usuário seleciona uma parcela aberta.
2. Informa valor inferior ao saldo.
3. O sistema cria o pagamento.
4. O sistema cria a alocação.
5. O saldo da parcela é reduzido.
6. A parcela passa para "PARTIALLY_SETTLED".
7. A conta passa para "PARTIALLY_SETTLED", quando aplicável.
8. O saldo remanescente permanece disponível.

---

10.3 Regras

- o saldo não poderá ficar negativo;
- juros e descontos deverão ser alocados explicitamente;
- o sistema deverá exibir:
  - valor original;
  - total pago;
  - saldo;
  - ajustes;
  - retenções;
- novos pagamentos poderão ser feitos até a quitação;
- pagamento parcial não deverá criar nova parcela automaticamente.

---

11. Pagamento de várias parcelas

11.1 Objetivo

Permitir que um único pagamento liquide várias parcelas.

Exemplo:

Um PIX de R$ 50.000 liquida três notas do mesmo fornecedor.

11.2 Fluxo

1. O usuário inicia um pagamento.
2. Seleciona as parcelas.
3. Define os valores alocados.
4. O sistema valida a soma.
5. Um único "Payment" é criado.
6. São criadas várias "PaymentAllocation".
7. Cada parcela é atualizada.
8. A movimentação bancária é associada ao pagamento único.

---

11.3 Regras

- a soma das alocações não poderá superar o pagamento;
- eventual sobra deverá ser tratada como:
  - adiantamento;
  - crédito;
  - valor não alocado;
- cada parcela manterá sua própria rastreabilidade.

---

12. Pagamento em valor diferente do saldo

12.1 Valor maior

Possíveis causas:

- juros;
- multa;
- tarifa;
- pagamento excedente;
- erro.

O sistema não deverá incorporar a diferença silenciosamente ao principal.

Deverá exigir classificação explícita.

---

12.2 Valor menor

Possíveis causas:

- desconto;
- retenção;
- pagamento parcial;
- abatimento;
- compensação de crédito.

O motivo deverá ser registrado.

---

13. Cancelamento de conta a pagar

13.1 Condições permitidas

A conta poderá ser cancelada quando:

- não houver pagamentos confirmados;
- não houver conciliação;
- não houver retenção liquidada;
- o período permitir;
- o usuário possuir permissão.

---

13.2 Fluxo

1. O usuário solicita cancelamento.
2. Informa justificativa.
3. O sistema verifica efeitos existentes.
4. Se permitido:
   - parcelas são canceladas;
   - compromisso remanescente poderá ser restaurado;
   - conta passa para "CANCELLED";
   - evento "PayableCancelled" é publicado.
5. O histórico permanece preservado.

---

13.3 Condição impeditiva

Se houver pagamento, o sistema deverá orientar o uso do estorno.

---

14. Estorno de pagamento

14.1 Objetivo

Reverter um pagamento já confirmado sem apagar o fato original.

14.2 Fluxo

flowchart TD
    A[Pagamento confirmado] --> B[Solicitar estorno]
    B --> C[Validar permissão e período]
    C --> D{Pagamento conciliado?}
    D -- Sim --> E[Desfazer ou reabrir conciliação]
    D -- Não --> F[Criar reversão]
    E --> F
    F --> G[Restaurar saldo das parcelas]
    G --> H[Atualizar estado da conta]
    H --> I[Registrar auditoria]

---

14.3 Regras

- o pagamento original permanecerá intacto;
- o estorno deverá possuir motivo;
- pagamentos conciliados exigirão tratamento da conciliação;
- em período fechado, poderá ser necessário:
  - reabrir o período;
  - ou registrar a reversão no período atual;
- o saldo da parcela deverá ser restaurado;
- juros, descontos e retenções deverão ser revertidos conforme sua natureza;
- o evento "PaymentReversed" deverá ser publicado.

---

Parte II — Contas a receber

15. Fluxo geral de conta a receber

flowchart TD
    A[Contrato ou faturamento] --> B[Criação do recebível]
    B --> C[Validação]
    C --> D[Aprovação]
    D --> E[Conta aberta]
    E --> F[Emissão ou cobrança]
    F --> G[Recebimento]
    G --> H[Alocação]
    H --> I[Conciliação]
    I --> J[Conta liquidada]

---

16. Criação manual de conta a receber

16.1 Exemplos

- cobrança extraordinária;
- reembolso de cliente;
- venda sem contrato formal;
- crédito diverso;
- adiantamento solicitado;
- ajuste comercial.

---

16.2 Dados mínimos

- cliente ou devedor;
- descrição;
- origem;
- data de competência;
- data de emissão;
- valor;
- condição de recebimento;
- projeto;
- centro de resultado;
- classificação gerencial;
- documento de origem.

---

16.3 Fluxo

1. A conta é criada como "DRAFT".
2. O usuário preenche os dados.
3. O sistema valida:
   - cliente;
   - valor;
   - competência;
   - classificação;
   - projeto;
   - duplicidade.
4. As parcelas são geradas.
5. A conta é submetida para aprovação, quando exigido.
6. Após aprovação, passa para "OPEN".
7. O evento "ReceivableCreated" é publicado.

---

17. Criação por cronograma de faturamento

17.1 Objetivo

Converter marcos de contratos em contas a receber.

17.2 Fluxo

1. Um marco contratual torna-se elegível.
2. O evento "BillingMilestoneEligible" é publicado.
3. O responsável revisa:
   - valor;
   - data;
   - evidências;
   - retenções;
   - condição de pagamento.
4. O marco é aprovado para faturamento.
5. O módulo fiscal emite o documento, quando integrado.
6. O recebível é criado.
7. O marco passa para "BILLED".
8. O fluxo de caixa é atualizado.

---

17.3 Exemplos de marcos

- aprovação de projeto;
- entrega de painel;
- FAT;
- SAT;
- mobilização;
- medição mensal;
- entrega de documentação;
- aceite final.

---

18. Criação por medição

18.1 Fluxo

1. O projeto gera uma medição.
2. A medição é submetida ao cliente.
3. O cliente aprova total ou parcialmente.
4. A versão aprovada é congelada.
5. O valor bruto é determinado.
6. Retenções são calculadas.
7. O valor faturável é definido.
8. A conta a receber é criada.
9. A medição é vinculada ao recebível.

---

18.2 Medição parcialmente aprovada

O sistema deverá preservar:

- valor solicitado;
- valor aprovado;
- valor rejeitado;
- justificativa;
- saldo potencial futuro.

---

19. Registro de recebimento total

19.1 Fluxo

1. O usuário seleciona a parcela.
2. Informa:
   - data;
   - conta financeira;
   - valor recebido;
   - método;
   - retenções;
   - juros;
   - multa;
   - descontos;
   - referência.
3. O sistema cria o "Receipt".
4. Cria a "ReceiptAllocation".
5. Atualiza o saldo da parcela.
6. A parcela passa para "SETTLED".
7. A conta passa para "SETTLED", se não houver saldo.
8. A movimentação bancária é associada.
9. O evento "ReceiptConfirmed" é publicado.

---

20. Recebimento parcial

20.1 Fluxo

1. O usuário informa valor inferior ao saldo.
2. O recebimento é criado.
3. A alocação é registrada.
4. O saldo é reduzido.
5. A parcela passa para "PARTIALLY_SETTLED".
6. O saldo permanece em cobrança.

---

20.2 Regras

- o sistema deverá distinguir pagamento parcial de desconto;
- retenções deverão permanecer separadas;
- diferenças não poderão ser baixadas automaticamente;
- o aging deverá utilizar o saldo restante.

---

21. Recebimento não identificado

21.1 Situação

Uma movimentação entra no banco, mas não é possível identificar imediatamente o cliente ou a conta correspondente.

21.2 Fluxo

1. A transação bancária é importada.
2. Nenhuma correspondência é encontrada.
3. A transação permanece "UNRECONCILED".
4. O usuário poderá classificá-la como:
   - recebimento não identificado;
   - adiantamento de cliente;
   - transferência;
   - aporte;
   - rendimento;
   - outro crédito.
5. Posteriormente poderá ser alocada a uma conta.
6. O histórico da classificação deverá ser preservado.

---

22. Adiantamento de cliente

22.1 Fluxo

1. O cliente paga antes do faturamento definitivo.
2. Um "Receipt" é registrado.
3. Um "Advance" do tipo "CUSTOMER_ADVANCE" é criado.
4. O valor não é reconhecido automaticamente como receita.
5. Quando a obrigação comercial for faturada:
   - o adiantamento é aplicado;
   - o saldo do recebível é reduzido;
   - o vínculo é registrado.
6. Eventual saldo permanece disponível ou é devolvido.

---

23. Retenção em recebimento

23.1 Exemplo

Valor bruto da nota: R$ 100.000
Retenção tributária: R$ 6.150
Valor recebido em banco: R$ 93.850

23.2 Regras

- o recebível bruto permanecerá em R$ 100.000;
- o valor bancário será R$ 93.850;
- a retenção será registrada separadamente;
- a parcela poderá ser considerada liquidada quando:
  - valor bancário;
  - mais retenção válida;
  - igualarem o valor devido;
- a retenção deverá possuir tipo, base e valor.

---

24. Renegociação de recebível

24.1 Casos

- postergação de vencimento;
- novo parcelamento;
- desconto negociado;
- consolidação de várias parcelas;
- acordo com cliente.

24.2 Fluxo recomendado

1. O usuário solicita renegociação.
2. O sistema preserva a condição original.
3. É criada uma nova versão do acordo.
4. As parcelas antigas são encerradas como renegociadas.
5. Novas parcelas são geradas.
6. O valor principal e os ajustes são conciliados.
7. A renegociação é auditada.
8. Aprovação poderá ser exigida.

---

25. Baixa por perda

25.1 Objetivo

Registrar que um saldo não será mais cobrado.

25.2 Pré-condições

- conta vencida;
- processo de cobrança documentado;
- justificativa;
- aprovação dentro da alçada;
- classificação gerencial específica.

25.3 Fluxo

1. O usuário solicita baixa.
2. A política de aprovação é determinada.
3. Após aprovação, o saldo é baixado.
4. A parcela passa para "WRITTEN_OFF".
5. A perda é reconhecida gerencialmente.
6. O histórico da dívida permanece disponível.

---

26. Estorno de recebimento

O fluxo será equivalente ao estorno de pagamento.

O estorno deverá:

- preservar o recebimento original;
- criar reversão;
- restaurar o saldo;
- atualizar o estado da parcela;
- tratar a conciliação;
- registrar o motivo;
- publicar "ReceiptReversed".

---

Parte III — Transferências e banco

27. Transferência entre contas

27.1 Fluxo

1. O usuário seleciona a conta de origem.
2. Seleciona a conta de destino.
3. Informa:
   - valor;
   - data;
   - tarifa;
   - referência.
4. O sistema valida:
   - contas diferentes;
   - contas ativas;
   - mesma moeda no MVP;
   - período disponível.
5. A transferência é criada como "DRAFT".
6. Após confirmação:
   - cria-se débito na origem;
   - cria-se crédito no destino;
   - vincula-se ambos à transferência.
7. A transferência passa para "CONFIRMED".
8. Posteriormente, ambos os lados são conciliados.

---

27.2 Regras

- transferência não impacta DRE;
- tarifa bancária impacta despesa financeira;
- os dois lados deverão ser atômicos;
- o cancelamento somente será permitido antes da confirmação;
- depois da confirmação deverá haver reversão.

---

28. Importação de extrato OFX

28.1 Fluxo

flowchart TD
    A[Selecionar conta] --> B[Enviar arquivo OFX]
    B --> C[Calcular hash]
    C --> D{Arquivo duplicado?}
    D -- Sim --> E[Bloquear ou alertar]
    D -- Não --> F[Interpretar arquivo]
    F --> G[Validar período e conta]
    G --> H[Detectar transações duplicadas]
    H --> I[Importar registros válidos]
    I --> J[Gerar sugestões de conciliação]

---

28.2 Validações

- formato válido;
- conta compatível;
- período;
- moeda;
- duplicidade de arquivo;
- duplicidade de transação;
- integridade dos registros;
- saldo inicial e final, quando disponíveis.

---

28.3 Resultado

O sistema deverá apresentar:

- registros importados;
- registros duplicados;
- registros rejeitados;
- erros;
- período;
- valor total de créditos;
- valor total de débitos.

---

29. Criação manual de movimentação bancária

Será permitida para:

- caixa físico;
- correção de saldo inicial;
- movimentação não disponível em extrato;
- operação excepcional.

A criação manual deverá:

- exigir permissão específica;
- registrar motivo;
- permanecer identificada como "MANUAL";
- ser auditada;
- não substituir importações bancárias sem justificativa.

---

Parte IV — Conciliação bancária

30. Conciliação automática

30.1 Objetivo

Sugerir correspondências entre transações bancárias e operações internas.

30.2 Critérios possíveis

- valor exato;
- data exata;
- janela de datas;
- documento;
- nome da contraparte;
- CNPJ ou CPF;
- identificação PIX;
- número de boleto;
- referência bancária;
- histórico;
- conta financeira.

---

30.3 Pontuação

Cada sugestão poderá receber uma pontuação.

Exemplo:

Valor exato: 50 pontos
Data compatível: 20 pontos
Documento correspondente: 20 pontos
Contraparte correspondente: 10 pontos

A política exata será configurável.

---

30.4 Fluxo

1. O sistema consulta transações não conciliadas.
2. Busca pagamentos, recebimentos e transferências candidatas.
3. Calcula a confiança.
4. Gera sugestões.
5. Sugestões acima de determinado limite poderão ser:
   - conciliadas automaticamente;
   - ou enviadas para confirmação.
6. Critérios utilizados são registrados.

---

31. Conciliação manual

31.1 Fluxo

1. O usuário abre a transação.
2. Visualiza candidatos.
3. Seleciona uma ou mais operações.
4. Informa valores conciliados.
5. O sistema valida a soma.
6. A correspondência é criada.
7. Os estados são atualizados.
8. A auditoria registra a ação.

---

32. Conciliação de uma transação com várias operações

Exemplo:

Um pagamento bancário de R$ 80.000 liquida quatro contas.

O sistema deverá permitir:

Transação bancária
├── Pagamento 1
├── Pagamento 2
├── Pagamento 3
└── Pagamento 4

A soma conciliada deverá ser igual ou inferior à transação.

---

33. Conciliação parcial

Uma transação poderá ser parcialmente conciliada.

Exemplo:

Transação: R$ 100.000
Identificado: R$ 90.000
Pendente: R$ 10.000

O estado deverá ser "PARTIALLY_RECONCILED".

A diferença deverá permanecer visível.

---

34. Divergência de conciliação

Possíveis causas:

- tarifa bancária;
- desconto;
- juros;
- retenção;
- valor incorreto;
- duplicidade;
- pagamento agrupado;
- recebimento sem identificação.

O sistema deverá permitir classificar a diferença, mas nunca ocultá-la.

---

35. Desfazer conciliação

35.1 Regras

- exige permissão;
- exige justificativa;
- pode ser bloqueado em período fechado;
- não apaga a correspondência original;
- registra evento de reversão;
- restaura os estados anteriores.

---

36. Fechamento da conciliação

Para concluir uma conciliação de período, o sistema deverá verificar:

- saldo inicial;
- créditos;
- débitos;
- saldo final;
- transações pendentes;
- divergências;
- valores parcialmente conciliados.

A política poderá permitir conclusão com pendências justificadas.

---

Parte V — Fechamento financeiro

37. Preparação do fechamento mensal

37.1 Checklist mínimo

- todas as contas relevantes registradas;
- competências revisadas;
- contas classificadas;
- pagamentos registrados;
- recebimentos registrados;
- extratos importados;
- conciliações concluídas;
- adiantamentos revisados;
- retenções registradas;
- projetos vinculados;
- rateios executados;
- pendências justificadas.

---

38. Validação de fechamento

38.1 Fluxo

1. O usuário inicia a validação.
2. O período passa para "CLOSING".
3. O sistema executa verificações.
4. Gera relatório de pendências.
5. As pendências são classificadas como:
   - bloqueantes;
   - alertas;
   - informativas.
6. O usuário corrige ou justifica.
7. O sistema valida novamente.
8. O período fica apto ao fechamento.

---

38.2 Pendências bloqueantes sugeridas

- conta sem classificação gerencial;
- lançamento sem competência;
- inconsistência de parcelas;
- conciliação com diferença;
- pagamento com valor inválido;
- saldo negativo inesperado;
- transação duplicada;
- aprovação obrigatória pendente.

---

38.3 Alertas sugeridos

- adiantamentos antigos;
- contas vencidas;
- recebimentos não identificados;
- despesas sem projeto;
- margens negativas;
- compromissos sem conversão.

---

39. Fechamento do período

39.1 Fluxo

1. O usuário solicita fechamento.
2. O sistema verifica permissão.
3. As validações são executadas novamente.
4. O usuário confirma.
5. O período passa para "CLOSED".
6. Novos lançamentos retroativos são bloqueados.
7. Alterações são bloqueadas.
8. Consolidações podem ser geradas.
9. O evento "FinancialPeriodClosed" é publicado.
10. O fechamento é auditado.

---

40. Reabertura de período

40.1 Pré-condições

- permissão "financial.period.reopen";
- justificativa;
- aprovação, quando configurada;
- identificação do impacto;
- período posterior compatível.

40.2 Fluxo

1. O usuário solicita reabertura.
2. Informa a justificativa.
3. O sistema inicia aprovação.
4. Após aprovação, o período passa para "REOPENED".
5. Alterações autorizadas são realizadas.
6. O período deverá passar novamente pelo fechamento.
7. O histórico da versão anterior é preservado.

---

Parte VI — Fluxo de caixa

41. Formação do fluxo de caixa

O fluxo de caixa deverá consolidar:

Entradas

- recebíveis abertos;
- cronogramas de faturamento;
- adiantamentos previstos;
- contratos recorrentes;
- outros créditos.

Saídas

- contas a pagar;
- compromissos;
- folha;
- tributos;
- contratos recorrentes;
- empréstimos;
- investimentos.

Realizado

- recebimentos;
- pagamentos;
- transferências;
- movimentações bancárias.

---

42. Data utilizada na projeção

A ordem de prioridade poderá ser:

Contas a pagar

1. data prevista de pagamento;
2. data de vencimento;
3. data estimada por condição contratual.

Contas a receber

1. data prevista de recebimento;
2. data de vencimento;
3. data ajustada pelo histórico do cliente;
4. data prevista de faturamento mais prazo de pagamento.

---

43. Fluxo de caixa diário

Para cada dia:

Saldo inicial
+ entradas previstas
- saídas previstas
= saldo final

O saldo final será o saldo inicial do dia seguinte.

---

44. Cenário conservador

Poderá considerar:

- atraso médio de clientes;
- inadimplência;
- despesas adicionais;
- postergação de faturamento;
- antecipação de compras;
- redução de vendas.

---

45. Cenário otimista

Poderá considerar:

- recebimentos antecipados;
- novos contratos;
- redução de custos;
- postergação de saídas;
- liberação de retenções.

---

46. Simulação de novo contrato

46.1 Fluxo

1. O usuário cria cenário.
2. Informa:
   - valor;
   - cronograma de faturamento;
   - prazo de recebimento;
   - custos;
   - compras;
   - mobilização;
   - impostos;
   - retenções.
3. O sistema projeta entradas e saídas.
4. Calcula:
   - pico de necessidade de caixa;
   - capital de giro;
   - margem;
   - prazo de retorno;
   - exposição financeira.
5. O cenário não altera os dados oficiais.

---

Parte VII — Projetos e margem

47. Apropriação de custo a projeto

47.1 Fluxo

1. Uma conta a pagar é criada.
2. O sistema identifica sua origem.
3. O projeto é sugerido.
4. O usuário confirma ou divide o valor.
5. A alocação é salva.
6. O custo passa a compor:
   - comprometido;
   - realizado por competência;
   - realizado por caixa, conforme o relatório.

---

48. Rateio entre projetos

Exemplo:

Uma viagem atende dois projetos.

Projeto A: 60%
Projeto B: 40%

Regras:

- total deve ser 100%;
- critério deve ser registrado;
- valor total deve ser preservado;
- alterações devem ser auditadas;
- período fechado bloqueia alteração.

---

49. Cálculo de margem

49.1 Componentes

- receita contratada;
- receita prevista;
- receita reconhecida;
- receita faturada;
- receita recebida;
- custo orçado;
- custo comprometido;
- custo realizado;
- custos indiretos;
- provisões.

49.2 Indicadores

Margem bruta realizada =
receita reconhecida - custos diretos realizados

Margem projetada =
receita total projetada - custo total projetado

Desvio de margem =
margem projetada atual - margem da baseline

---

50. Alerta de desvio de projeto

O sistema poderá gerar alerta quando:

- custo comprometido ultrapassar orçamento;
- margem cair abaixo do limite;
- faturamento estiver atrasado;
- recebimento estiver vencido;
- custo financeiro aumentar;
- projeto consumir caixa além da previsão.

---

Parte VIII — Adiantamentos

51. Adiantamento a fornecedor

51.1 Fluxo

1. O pedido ou contrato prevê adiantamento.
2. Uma solicitação é criada.
3. A aprovação é realizada.
4. O pagamento é executado.
5. Um adiantamento aberto é criado.
6. Quando a nota chegar:
   - o adiantamento é aplicado;
   - o saldo é reduzido;
   - a diferença vira conta a pagar.
7. Eventual saldo é devolvido ou permanece aberto.

---

52. Adiantamento de viagem

52.1 Fluxo

1. O colaborador solicita adiantamento.
2. Informa:
   - projeto;
   - período;
   - finalidade;
   - estimativa.
3. A solicitação é aprovada.
4. O pagamento é realizado.
5. O adiantamento fica aberto.
6. Após a viagem, o colaborador presta contas.
7. As despesas são classificadas.
8. O sistema calcula:
   - valor gasto;
   - valor a devolver;
   - valor adicional a reembolsar.
9. O adiantamento é encerrado.

---

53. Prestação de contas

A prestação deverá conter:

- despesas;
- documentos;
- datas;
- fornecedores;
- classificações;
- projeto;
- centro de custo;
- justificativas.

Despesas sem comprovante poderão exigir aprovação específica.

---

Parte IX — Retenções contratuais

54. Retenção de cliente

54.1 Fluxo

1. O contrato define retenção.
2. Uma medição é aprovada.
3. O recebível bruto é criado.
4. A retenção é separada.
5. O valor líquido é cobrado.
6. O saldo retido permanece controlado.
7. Quando o marco de liberação ocorrer:
   - cria-se novo recebível;
   - ou libera-se saldo existente.
8. O recebimento encerra a retenção.

---

55. Liberação de retenção

Possíveis gatilhos:

- aceite final;
- entrega de documentação;
- fim da garantia;
- emissão de termo;
- aprovação do cliente.

A liberação deverá exigir evidência documental.

---

Parte X — Aprovações

56. Alteração após aprovação

Alterações relevantes deverão invalidar a aprovação.

Exemplos:

- valor;
- fornecedor;
- conta bancária do beneficiário;
- projeto;
- classificação;
- condição de pagamento;
- vencimento antecipado;
- desconto;
- forma de pagamento.

Alterações meramente descritivas poderão não reiniciar o fluxo.

---

57. Aprovação emergencial

O sistema poderá permitir fluxo emergencial.

Requisitos:

- justificativa obrigatória;
- marcação explícita;
- notificação aos responsáveis;
- alçada adequada;
- auditoria reforçada;
- relatório posterior.

Urgência não deverá significar ausência de controle.

---

58. Delegação de aprovação

A delegação deverá possuir:

- usuário delegante;
- usuário delegado;
- período;
- escopo;
- motivo;
- limites.

A delegação não deverá conceder permissões além das já autorizadas.

---

Parte XI — Auditoria

59. Eventos auditados

Obrigatoriamente:

- criação;
- edição;
- aprovação;
- rejeição;
- cancelamento;
- pagamento;
- recebimento;
- estorno;
- conciliação;
- desconciliação;
- fechamento;
- reabertura;
- importação;
- alteração de classificação;
- alteração de vencimento;
- baixa por perda;
- aplicação de adiantamento.

---

60. Informações de auditoria

- usuário;
- data e hora;
- entidade;
- operação;
- valores anteriores;
- valores novos;
- justificativa;
- endereço técnico ou origem da requisição, quando aplicável;
- identificador de correlação;
- resultado.

---

Parte XII — Notificações

61. Notificações operacionais

A plataforma poderá notificar:

- conta próxima do vencimento;
- conta vencida;
- aprovação pendente;
- recebimento atrasado;
- conciliação pendente;
- período próximo do fechamento;
- adiantamento sem prestação;
- retenção disponível para liberação;
- desvio de margem;
- insuficiência futura de caixa.

---

62. Canais

Inicialmente:

- notificações internas;
- e-mail.

Futuramente:

- Microsoft Teams;
- Slack;
- WhatsApp corporativo;
- push;
- webhook.

---

Parte XIII — Requisitos de idempotência

63. Fluxos idempotentes

Os seguintes fluxos deverão ser protegidos contra duplicidade:

- criação por evento de pedido;
- criação por medição;
- importação de extrato;
- confirmação de pagamento;
- confirmação de recebimento;
- processamento de integração fiscal;
- eventos de contrato;
- transferências.

---

64. Estratégias

- chave idempotente;
- identificador externo;
- hash;
- restrição única;
- registro de evento processado;
- transação de banco.

---

Parte XIV — Casos de falha

65. Falha durante pagamento

Se ocorrer falha após criar o pagamento, mas antes de atualizar a parcela, toda a operação deverá ser revertida.

Não poderá existir pagamento confirmado sem alocação consistente.

---

66. Falha durante transferência

Não poderá existir somente o débito ou somente o crédito.

Os dois lados deverão ser criados na mesma transação.

---

67. Falha durante importação

Registros válidos poderão ser mantidos somente se a estratégia de importação parcial estiver explicitamente adotada.

Caso contrário, todo o lote deverá ser revertido.

O resultado deverá sempre indicar:

- processados;
- rejeitados;
- duplicados;
- erros.

---

68. Falha de integração entre módulos

Eventos internos deverão poder ser reprocessados.

O processamento deverá:

- ser idempotente;
- registrar falhas;
- permitir tentativa posterior;
- não gerar duplicidade;
- manter correlação com a origem.

---

Parte XV — Fluxos prioritários do MVP

69. Prioridade 1

- cadastrar contas financeiras;
- cadastrar plano de contas;
- cadastrar centros de custo;
- criar contas a pagar;
- gerar parcelas;
- registrar pagamentos;
- criar contas a receber;
- registrar recebimentos;
- importar extrato OFX;
- conciliar movimentações;
- consultar fluxo de caixa;
- consultar saldos.

---

70. Prioridade 2

- transferências;
- pagamentos e recebimentos parciais;
- juros, multas e descontos;
- estornos;
- fechamento mensal;
- DRE gerencial;
- projetos;
- margem básica por projeto;
- aprovações simples.

---

71. Prioridade 3

- adiantamentos;
- retenções;
- compromissos de pedidos;
- cronograma de faturamento;
- medições;
- rateios;
- cenários;
- forecast;
- baseline;
- alçadas avançadas.

---

Parte XVI — Critérios de aceite

72. Conta a pagar

O fluxo será considerado aceito quando for possível:

- criar obrigação;
- parcelar;
- aprovar;
- pagar parcialmente;
- quitar;
- estornar;
- cancelar antes do pagamento;
- consultar histórico;
- auditar alterações.

---

73. Conta a receber

O fluxo será considerado aceito quando for possível:

- criar recebível;
- parcelar;
- receber parcialmente;
- quitar;
- registrar retenção;
- estornar;
- controlar vencimento;
- consultar inadimplência.

---

74. Conciliação

O fluxo será considerado aceito quando for possível:

- importar extrato;
- detectar duplicidades;
- sugerir correspondências;
- conciliar manualmente;
- conciliar parcialmente;
- desfazer com permissão;
- consultar diferenças.

---

75. Fechamento

O fluxo será considerado aceito quando for possível:

- validar pendências;
- fechar;
- bloquear alterações;
- reabrir com justificativa;
- fechar novamente;
- consultar auditoria.

---

76. Fluxo de caixa

O fluxo será considerado aceito quando apresentar:

- saldo atual;
- entradas previstas;
- saídas previstas;
- saldo diário;
- filtros por conta;
- filtros por projeto;
- horizonte configurável;
- distinção entre previsto e realizado.

---

Parte XVII — Decisões pendentes

77. Regras administrativas

- quais contas exigem aprovação;
- valores das alçadas;
- segregação entre criação e aprovação;
- documentos obrigatórios;
- tolerância para duplicidade;
- política de pagamentos emergenciais;
- política de baixa por perda;
- política de adiantamentos.

---

78. Regras financeiras

- cálculo de juros;
- tolerância de conciliação;
- tratamento de período fechado;
- política de competência;
- reconhecimento de receita;
- rateio de custos;
- cálculo de margem;
- cálculo de capital de giro.

---

79. Integrações

- OFX como primeira opção;
- CSV bancário;
- APIs bancárias;
- Open Finance;
- emissão fiscal;
- compras;
- contratos;
- projetos;
- folha;
- contabilidade.

---

80. Próximos documentos

Após este documento, recomenda-se elaborar:

docs/domain/FINANCIAL_USE_CASES.md
docs/domain/FINANCIAL_RULES.md

Em seguida:

docs/adr/ADR-007-financial-amounts-and-rounding.md
docs/adr/ADR-008-financial-period-closing.md
docs/adr/ADR-009-bank-reconciliation.md
docs/adr/ADR-010-financial-domain-events.md

Posteriormente:

prisma/schema.prisma

---

81. Conclusão

Os fluxos financeiros da Plataforma Aritech deverão refletir a realidade operacional de uma empresa de engenharia, automação industrial, integração de sistemas, montagem de painéis e prestação de serviços técnicos.

A plataforma deverá representar de maneira explícita:

- origem das obrigações;
- aprovações;
- compromissos;
- parcelas;
- liquidações;
- movimentações bancárias;
- conciliações;
- competências;
- projetos;
- contratos;
- retenções;
- adiantamentos;
- fechamentos;
- estornos.

A implementação deverá priorizar integridade, rastreabilidade e clareza operacional.

O objetivo não é apenas digitalizar lançamentos financeiros, mas construir uma base confiável para:

- controle de caixa;
- DRE gerencial;
- margem por projeto;
- capital de giro;
- indicadores;
- análise de desempenho;
- valuation contínuo da Aritech.