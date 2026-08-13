Financial Rules

Status

Estado: proposta inicial
Escopo: regras transversais do domínio financeiro
Arquitetura: monólito modular
Documentos relacionados:

- "docs/domain/FINANCIAL_DOMAIN.md"
- "docs/domain/FINANCIAL_MODEL.md"
- "docs/domain/FINANCIAL_WORKFLOWS.md"
- "docs/domain/FINANCIAL_USE_CASES.md"
- "docs/architecture/ARCHITECTURE_OVERVIEW.md"
- "docs/architecture/MODULES.md"
- "docs/architecture/SECURITY.md"
- "docs/adr/ADR-006-audit-trail.md"

---

1. Objetivo

Este documento consolida as regras de negócio transversais do domínio financeiro da Plataforma Aritech.

Seu objetivo é evitar que regras críticas sejam definidas de maneira inconsistente em:

- entidades;
- serviços;
- controllers;
- endpoints;
- jobs;
- importadores;
- integrações;
- relatórios;
- telas;
- testes.

As regras aqui definidas deverão ser consideradas invariantes ou políticas do domínio.

Quando uma decisão exigir justificativa arquitetural, deverá ser registrada também em ADR específico.

---

2. Princípios gerais

FR-001 — Toda operação financeira deve ser rastreável

Todo registro financeiro deverá possuir origem identificável.

A origem poderá ser:

- manual;
- pedido de compra;
- contrato;
- medição;
- faturamento;
- nota fiscal;
- folha;
- imposto;
- transferência;
- integração bancária;
- outro módulo.

Lançamentos manuais deverão possuir usuário e justificativa suficientes para auditoria.

---

FR-002 — Fatos financeiros não serão apagados

Registros que já produziram efeito financeiro, gerencial ou bancário não poderão ser removidos fisicamente.

Correções deverão ocorrer por:

- cancelamento;
- estorno;
- reversão;
- reclassificação;
- compensação;
- nova versão.

---

FR-003 — Obrigação não é pagamento

A existência de uma conta a pagar ou receber não significa que houve movimentação de caixa.

O sistema deverá distinguir:

obrigação
liquidação
movimentação bancária
conciliação

---

FR-004 — Competência e caixa são independentes

Toda operação relevante deverá permitir distinguir:

- data de competência;
- data de vencimento;
- data prevista;
- data de pagamento ou recebimento;
- data bancária;
- data de conciliação.

Alterar uma dessas datas não deverá alterar automaticamente as demais sem regra explícita.

---

3. Valores monetários

FR-010 — Proibição de ponto flutuante

Valores monetários não poderão utilizar "float" ou "double".

Deverá ser utilizado tipo decimal exato.

---

FR-011 — Moeda obrigatória

Todo valor monetário persistido deverá possuir moeda ou estar dentro de contexto que determine moeda inequivocamente.

No MVP:

BRL

será a moeda funcional padrão.

---

FR-012 — Valores originais são imutáveis após aprovação

Após uma obrigação ser aprovada, seu valor original não deverá ser sobrescrito.

Alterações deverão ocorrer através de:

- ajuste;
- complemento;
- desconto;
- cancelamento;
- crédito;
- nova versão.

---

FR-013 — Valores derivados não substituem fatos

Exemplo:

valorOriginal
valorPago
saldoAberto

O saldo poderá ser derivado de eventos ou materializado por desempenho, mas os pagamentos que o originaram deverão permanecer registrados.

---

FR-014 — Valores negativos

Entidades de obrigação, parcela, pagamento e recebimento deverão utilizar valores positivos.

O sentido financeiro deverá ser representado pela natureza da operação.

Valores negativos poderão existir apenas em:

- relatórios;
- projeções;
- movimentações contábeis futuras;
- reversões especificamente modeladas.

---

4. Arredondamento

FR-020 — Política única de arredondamento

Todos os módulos deverão utilizar a mesma política de arredondamento financeiro.

A política definitiva será definida em ADR específico.

---

FR-021 — Arredondamento deve ocorrer no menor número possível de etapas

Não deverá haver arredondamentos sucessivos desnecessários durante cálculos intermediários.

Preferência:

calcular com precisão ampliada
↓
arredondar no ponto de negócio definido
↓
persistir ou exibir

---

FR-022 — Distribuição de diferença de centavos

Quando um parcelamento gerar diferença devido ao arredondamento, a diferença deverá ser aplicada a uma parcela de forma determinística.

Recomendação inicial:

última parcela

Exemplo:

R$ 100,00 / 3

33,33
33,33
33,34

Nunca:

33,33
33,33
33,33

---

5. Datas financeiras

FR-030 — Data de competência

Representa o período econômico ao qual a receita ou despesa pertence.

É a principal data utilizada para:

- DRE gerencial;
- margem;
- competência de custos;
- indicadores de resultado.

---

FR-031 — Data de vencimento

Representa a data contratual da obrigação.

É utilizada para:

- contas a pagar;
- contas a receber;
- aging;
- atraso;
- multas;
- juros;
- fluxo de caixa previsto.

---

FR-032 — Data prevista

Representa a melhor estimativa operacional de pagamento ou recebimento.

Pode ser diferente do vencimento.

Exemplo:

Vencimento: 30/09
Recebimento esperado: 15/10

O fluxo de caixa projetado poderá utilizar a data prevista.

O aging continuará considerando o vencimento original ou renegociado.

---

FR-033 — Data de liquidação

Representa a data em que pagamento ou recebimento foi efetivamente registrado.

---

FR-034 — Data bancária

Representa a data informada pela instituição financeira.

Não deverá ser sobrescrita pela data de lançamento interno.

---

FR-035 — Data de conciliação

Representa o momento no qual a plataforma confirmou a correspondência entre registro interno e movimentação bancária.

---

FR-036 — Datas originais devem ser preservadas

Renegociação ou alteração de vencimento não deverá apagar a data original.

Deverão ser preservadas, quando aplicável:

originalDueDate
currentDueDate

---

6. Status financeiros

FR-040 — Status deve ser consequência do estado do agregado

Sempre que possível, o estado deverá ser derivado de fatos existentes.

Exemplo:

Uma parcela é "SETTLED" quando seu saldo de liquidação é zero.

Não deverá ser possível simplesmente alterar:

status = SETTLED

sem registrar liquidação correspondente.

---

FR-041 — Estados calculados

Estados como:

OVERDUE

deverão preferencialmente ser calculados a partir de:

- saldo em aberto;
- data de vencimento;
- data atual.

Persistência poderá ser utilizada apenas quando houver necessidade clara de desempenho ou histórico.

---

FR-042 — Estados terminais

Estados como:

CANCELLED
REVERSED
WRITTEN_OFF
CLOSED

não deverão retornar arbitrariamente para estados anteriores.

A reversão de estados terminais deverá ocorrer por operação explícita.

---

7. Parcelamento

FR-050 — Soma das parcelas

A soma dos valores originais das parcelas deverá ser exatamente igual ao valor total da obrigação.

Σ parcelas = valor original

---

FR-051 — Sequência única

Dentro de uma obrigação, cada parcela deverá possuir sequência única.

Exemplo:

1/3
2/3
3/3

---

FR-052 — Parcela não poderá ter valor zero

Parcelas deverão possuir valor positivo.

---

FR-053 — Parcela possui ciclo de vida independente

Cada parcela poderá possuir:

- vencimento;
- saldo;
- pagamentos;
- recebimentos;
- ajustes;
- status.

O estado de uma parcela não deverá ser inferido apenas pelo estado da obrigação principal.

---

FR-054 — Parcelas não liquidadas poderão ser renegociadas

A renegociação deverá preservar o histórico anterior.

Não deverá simplesmente substituir as parcelas originais.

---

8. Liquidação

FR-060 — Liquidação total

Uma parcela será considerada totalmente liquidada quando:

principal liquidado
+ compensações válidas
+ retenções reconhecidas
= valor líquido devido

A fórmula exata dependerá da natureza dos ajustes.

---

FR-061 — Liquidação parcial

Quando houver valor remanescente positivo:

status = PARTIALLY_SETTLED

---

FR-062 — Saldo negativo proibido

O saldo em aberto de uma parcela não poderá ser negativo.

Se um pagamento superar o saldo, a diferença deverá ser tratada explicitamente como:

- adiantamento;
- crédito;
- pagamento indevido;
- valor não alocado.

---

FR-063 — Uma liquidação poderá atender múltiplas parcelas

Um "Payment" ou "Receipt" poderá possuir múltiplas alocações.

---

FR-064 — Uma parcela poderá possuir múltiplas liquidações

Pagamentos e recebimentos parciais deverão ser nativos.

---

FR-065 — Liquidação sem conta bancária

O sistema poderá permitir liquidação sem vínculo imediato com movimentação bancária.

Exemplos:

- lançamento antes da importação do extrato;
- caixa físico;
- compensação;
- adiantamento;
- crédito.

Essas operações deverão permanecer pendentes de conciliação quando aplicável.

---

9. Pagamentos

FR-070 — Pagamento confirmado é imutável

Após confirmação, os campos financeiros essenciais do pagamento não deverão ser alterados.

Correção deverá ocorrer por estorno.

---

FR-071 — Pagamento deve possuir conta financeira

Pagamentos em caixa, banco ou carteira deverão identificar a conta correspondente.

Compensações poderão utilizar tipo específico de liquidação.

---

FR-072 — Pagamento parcial não encerra parcela

Somente a quitação integral alterará a parcela para "SETTLED".

---

FR-073 — Data de pagamento não altera competência

Pagar uma despesa em outro mês não deverá mover sua competência automaticamente.

---

FR-074 — Taxa bancária não compõe principal

Quando uma instituição cobrar tarifa, ela deverá ser registrada como despesa financeira separada.

---

10. Recebimentos

FR-080 — Recebimento confirmado é imutável

A mesma regra de pagamentos se aplica aos recebimentos.

---

FR-081 — Recebimento bruto e líquido devem ser distintos quando necessário

Exemplo:

Nota: R$ 100.000
Retenção: R$ 6.150
Banco: R$ 93.850

O recebimento bancário não deverá alterar o valor bruto da receita.

---

FR-082 — Recebimento não identificado não é receita automática

Entradas bancárias sem origem confirmada deverão permanecer classificadas como:

- não identificadas;
- adiantamento;
- transferência;
- outro crédito temporário.

---

11. Juros

FR-090 — Juros devem ser registrados separadamente

Os juros não deverão alterar o principal histórico.

---

FR-091 — Juros podem ser manuais ou calculados

A plataforma deverá permitir:

- valor informado;
- cálculo por regra futura.

---

FR-092 — Juros deverão possuir competência

O impacto gerencial de juros deverá estar associado a uma competência financeira.

---

12. Multas

FR-100 — Multas são ajustes separados

Multas deverão ser registradas independentemente do principal e dos juros.

---

FR-101 — Multas recebidas são receita financeira ou operacional conforme classificação

A classificação dependerá do plano de contas gerencial.

---

13. Descontos

FR-110 — Desconto não altera valor original

O valor original deverá permanecer preservado.

---

FR-111 — Desconto deverá possuir motivo

Motivos poderão incluir:

- comercial;
- financeiro;
- antecipação;
- negociação;
- correção;
- acordo.

---

FR-112 — Desconto acima da alçada exige aprovação

A política será configurável por valor ou percentual.

---

14. Retenções

FR-120 — Retenção não é desconto

Retenção tributária ou contratual não deverá ser tratada como desconto comercial.

---

FR-121 — Valor bruto deve ser preservado

O registro deverá permitir identificar:

valor bruto
retenções
valor líquido

---

FR-122 — Retenção tributária deverá possuir tipo

Exemplos:

- IRRF;
- INSS;
- ISS;
- PIS;
- COFINS;
- CSLL.

---

FR-123 — Retenção contratual possui ciclo próprio

Retenções contratuais poderão permanecer em aberto até:

- aceite;
- término de garantia;
- conclusão de contrato;
- outro marco.

---

15. Adiantamentos

FR-130 — Adiantamento não é despesa ou receita definitiva

No momento da criação, um adiantamento deverá representar crédito ou obrigação de compensação.

---

FR-131 — Aplicação deve ser explícita

Quando o adiantamento for utilizado, deverá ser criada relação entre:

adiantamento
↓
obrigação compensada

---

FR-132 — Saldo do adiantamento não poderá ser negativo

---

FR-133 — Devolução de adiantamento é nova movimentação

Não deverá simplesmente reduzir o registro histórico.

---

FR-134 — Adiantamentos devem possuir aging

A plataforma deverá permitir identificar adiantamentos antigos não compensados.

---

16. Cancelamentos

FR-140 — Cancelamento somente antes do efeito financeiro

Uma obrigação poderá ser cancelada se não houver:

- pagamento confirmado;
- recebimento confirmado;
- compensação aplicada;
- conciliação;
- outro efeito irreversível.

---

FR-141 — Cancelamento exige motivo

---

FR-142 — Cancelamento preserva histórico

O registro deverá permanecer consultável.

---

17. Estornos

FR-150 — Estorno não exclui lançamento original

O lançamento original permanecerá imutável.

---

FR-151 — Estorno deve referenciar origem

Toda reversão deverá possuir referência explícita ao lançamento estornado.

---

FR-152 — Estorno deve restaurar saldos

Exemplo:

Parcela original: R$ 100.000
Pagamento: R$ 40.000
Saldo: R$ 60.000

Estorno: R$ 40.000

Saldo restaurado: R$ 100.000

---

FR-153 — Estorno conciliado exige tratamento bancário

Não deverá ser possível estornar silenciosamente um pagamento ou recebimento já conciliado.

Será necessário:

- desfazer conciliação;
- ou conciliar a movimentação de reversão.

---

FR-154 — Estorno em período fechado

A política definitiva será definida em ADR.

Possibilidades:

1. reabrir período;
2. registrar reversão no período atual;
3. exigir aprovação extraordinária.

---

18. Transferências

FR-160 — Transferência não gera receita ou despesa

Movimentações entre contas da mesma entidade legal possuem impacto líquido zero no resultado.

---

FR-161 — Origem e destino devem ser diferentes

---

FR-162 — Dois lados devem ser atômicos

Não poderá existir transferência confirmada com apenas:

- débito;
- ou crédito.

---

FR-163 — Tarifa de transferência é separada

Tarifa bancária poderá gerar despesa financeira.

---

FR-164 — Transferência entre moedas diferentes

Fica fora do MVP inicial e exigirá:

- taxa de câmbio;
- data de conversão;
- ganho ou perda cambial;
- política de arredondamento.

---

19. Movimentações bancárias

FR-170 — Extrato bancário é evidência externa

Dados importados do banco deverão ser preservados na forma original.

---

FR-171 — Importações devem ser idempotentes

O mesmo arquivo ou transação não poderá gerar duplicidade.

---

FR-172 — Identificador externo deve ser preservado

Quando o banco fornecer identificador estável, ele deverá ser armazenado.

---

FR-173 — Movimentação manual deve ser identificável

Movimentações manuais deverão possuir:

source = MANUAL

e auditoria reforçada.

---

20. Conciliação bancária

FR-180 — Conciliação representa correspondência

Conciliar não significa alterar o valor da movimentação bancária.

---

FR-181 — Uma transação pode conciliar múltiplas operações

Exemplo:

Débito bancário: R$ 50.000

Pagamento A: R$ 20.000
Pagamento B: R$ 15.000
Pagamento C: R$ 15.000

---

FR-182 — Conciliação parcial é permitida

O saldo restante deverá permanecer visível.

---

FR-183 — Valor conciliado não pode ultrapassar transação

Σ matches <= valor da transação

---

FR-184 — Conciliação automática deve ser explicável

Toda sugestão automática deverá registrar os critérios utilizados.

---

FR-185 — Desconciliação exige motivo

---

FR-186 — Conciliação não pode ocultar diferença

Diferenças deverão ser explicitamente classificadas.

---

21. Competência

FR-190 — Despesas devem possuir competência

Uma despesa não poderá participar da DRE sem competência válida.

---

FR-191 — Receitas devem possuir competência

Receitas reconhecidas deverão possuir período econômico definido.

---

FR-192 — Pagamento não define competência

A data do pagamento não deverá ser usada automaticamente como competência.

---

FR-193 — Recebimento não define competência

A data de recebimento não deverá definir automaticamente o reconhecimento da receita.

---

FR-194 — Reconhecimento de receita de contratos

Contratos de longa duração poderão exigir política específica de reconhecimento.

Essa política deverá ser definida antes da implementação de margem avançada e valuation.

---

22. Fluxo de caixa

FR-200 — Fluxo realizado utiliza caixa

O fluxo realizado deverá utilizar pagamentos, recebimentos e movimentações efetivas.

---

FR-201 — Fluxo previsto utiliza obrigações e expectativas

Deverá considerar:

- contas abertas;
- compromissos;
- cronogramas;
- contratos;
- previsões.

---

FR-202 — Transferência não altera caixa consolidado

Ela altera apenas a distribuição entre contas.

---

FR-203 — Caixa consolidado deve evitar dupla contagem

Quando um pagamento estiver associado a uma movimentação bancária, ambos não poderão ser somados separadamente.

---

FR-204 — Projeção deve identificar qualidade da informação

Cada entrada ou saída projetada deverá permitir identificar sua origem:

ORÇADO
PREVISTO
COMPROMETIDO
REALIZADO

---

23. Orçado, previsto, comprometido e realizado

FR-210 — Orçado

Representa intenção aprovada em planejamento.

Não gera obrigação.

---

FR-211 — Previsto

Representa expectativa operacional.

Pode ser alterado conforme novas informações.

---

FR-212 — Comprometido

Representa obrigação econômica assumida.

Exemplos:

- pedido de compra aprovado;
- contrato assinado;
- contratação formal.

---

FR-213 — Realizado

Representa fato ocorrido.

No regime de competência poderá signific:

- despesa reconhecida;
- receita reconhecida.

No regime de caixa poderá signific:

- pagamento;
- recebimento.

O relatório deverá sempre indicar qual conceito de realizado está sendo utilizado.

---

FR-214 — Estados não devem ser somados sem critério

Exemplo incorreto:

Previsto + Comprometido + Realizado

pode gerar dupla contagem.

Cada relatório deverá definir a precedência das fontes.

---

24. Precedência para projeções

FR-220 — Fonte mais concreta substitui estimativa

Exemplo:

Antes do pedido:

Previsto: R$ 100.000

Depois do pedido:

Comprometido: R$ 98.000

O fluxo não deverá mostrar:

100.000 + 98.000

Deverá substituir ou relacionar a previsão ao compromisso.

---

FR-221 — Realizado reduz saldo do comprometido

Exemplo:

Pedido: R$ 100.000
Nota recebida: R$ 60.000
Saldo comprometido: R$ 40.000

---

FR-222 — Recebível realizado reduz previsão correspondente

O mesmo princípio vale para receitas.

---

25. Contratos

FR-230 — Valor contratado deve possuir versionamento

Aditivos não deverão simplesmente sobrescrever o valor original.

Deverão existir:

valor original
aditivos
valor vigente

---

FR-231 — Cronograma de faturamento não é recebível

Ele representa previsão até que o marco gere obrigação financeira real.

---

FR-232 — Faturamento deve respeitar saldo contratual

Exceções deverão exigir justificativa ou aditivo.

---

FR-233 — Contrato cancelado não apaga histórico financeiro

Recebíveis já criados deverão continuar rastreáveis.

---

26. Medições

FR-240 — Medição aprovada é imutável

Correções deverão ocorrer por revisão ou retificação.

---

FR-241 — Valor solicitado e aprovado devem ser preservados

---

FR-242 — Medição não é automaticamente receita reconhecida

O reconhecimento dependerá da política de competência e faturamento.

---

27. Pedidos de compra e compromissos

FR-250 — Pedido aprovado gera compromisso

Quando configurado, a aprovação do pedido deverá gerar "FinancialCommitment".

---

FR-251 — Compromisso não é conta a pagar

Até a ocorrência do fato gerador, representa obrigação futura comprometida.

---

FR-252 — Conversão reduz saldo comprometido

saldo comprometido =
valor do compromisso
- valores convertidos em obrigações
- cancelamentos

---

FR-253 — Cancelamento não afeta parte já convertida

Apenas o saldo ainda não convertido poderá ser cancelado.

---

28. Projetos

FR-260 — Custos diretos devem possuir projeto

Quando identificável como custo direto, "projectId" deverá ser obrigatório.

---

FR-261 — Despesas administrativas podem não possuir projeto

---

FR-262 — Rateios devem preservar total

Σ alocações = valor alocável

---

FR-263 — Percentuais devem totalizar 100%

Quando o método de rateio for percentual.

---

FR-264 — Critério de rateio deve ser registrado

---

29. Centros de custo

FR-270 — Centro inativo não recebe novos lançamentos

---

FR-271 — Centro histórico não pode ser removido

---

FR-272 — Hierarquia não pode possuir ciclos

---

30. Plano de contas gerencial

FR-280 — Todo lançamento gerencial deve possuir classificação

Receitas e despesas que alimentam relatórios deverão possuir conta gerencial.

---

FR-281 — Contas sintéticas não aceitam lançamentos

---

FR-282 — Transferências não impactam DRE

Devem utilizar classificação neutra.

---

FR-283 — Alteração do plano não pode reescrever histórico silenciosamente

Reclassificações deverão ser controladas.

---

31. DRE gerencial

FR-290 — DRE utiliza competência

---

FR-291 — DRE gerencial não substitui contabilidade oficial

---

FR-292 — Toda linha deve ser rastreável

O usuário deverá poder chegar ao lançamento de origem.

---

FR-293 — Reclassificação deve refletir período adequado

Reclassificações em período fechado exigirão política específica.

---

32. Margem por projeto

FR-300 — Margem deve indicar base de cálculo

Exemplos:

Margem contratada
Margem orçada
Margem comprometida
Margem realizada
Margem projetada

---

FR-301 — Margens diferentes não devem ser comparadas sem indicação

Relatórios deverão explicitar qual receita e qual custo estão sendo utilizados.

---

FR-302 — Custo comprometido deve participar da margem projetada

---

FR-303 — Custo realizado deve participar da margem realizada

---

FR-304 — Custos indiretos só entram quando regra de rateio estiver definida

---

33. Capital de giro

FR-310 — Capital de giro deve separar realizado de projetado

---

FR-311 — Contas a receber vencidas não devem ser tratadas como caixa disponível

---

FR-312 — Compromissos futuros devem participar da projeção

---

FR-313 — Saldos de aplicações devem possuir regra de liquidez

Nem toda aplicação financeira deverá ser considerada imediatamente disponível.

---

34. Aprovações

FR-320 — Alçada é definida no backend

---

FR-321 — Solicitante não aprova automaticamente sua própria operação

Quando houver política de segregação.

---

FR-322 — Alteração material invalida aprovação

Campos materiais incluem, em princípio:

- valor;
- fornecedor;
- cliente;
- conta bancária;
- projeto;
- classificação;
- condição;
- vencimento;
- descontos;
- retenções relevantes.

---

FR-323 — Rejeição exige justificativa

---

FR-324 — Aprovação não pode ser apagada

---

FR-325 — Delegação deve possuir validade

Toda delegação deverá ter:

- início;
- fim;
- escopo;
- delegante;
- delegado.

---

35. Períodos financeiros

FR-330 — Períodos não podem se sobrepor

---

FR-331 — Período fechado bloqueia alterações de competência

---

FR-332 — Fechamento deve executar validações

---

FR-333 — Reabertura deve ser explícita

---

FR-334 — Reabertura exige justificativa

---

FR-335 — Reabertura deve ser auditada

---

FR-336 — Novo fechamento não apaga o anterior

O histórico de reabertura e novo fechamento deverá permanecer.

---

36. Auditoria

FR-340 — Auditoria é separada de log técnico

Logs de aplicação não substituem trilha de auditoria.

---

FR-341 — Operações críticas devem registrar antes e depois

Quando tecnicamente aplicável.

---

FR-342 — Auditoria não pode ser alterada por usuários comuns

---

FR-343 — Eventos de auditoria devem possuir correlação

Operações compostas deverão poder ser rastreadas ponta a ponta.

---

37. Idempotência

FR-350 — Integrações financeiras devem ser idempotentes

---

FR-351 — Chave idempotente deve ter escopo definido

Exemplo:

eventType + externalId

---

FR-352 — Reprocessamento não pode duplicar efeito

---

FR-353 — Resposta repetida deve ser consistente

Quando o mesmo comando idempotente for reexecutado, o resultado deverá indicar o recurso original ou sucesso equivalente.

---

38. Concorrência

FR-360 — Liquidações concorrentes devem ser protegidas

Dois usuários não poderão liquidar simultaneamente o mesmo saldo produzindo valor negativo.

---

FR-361 — Conciliação concorrente deve ser protegida

Uma transação não poderá ser conciliada duas vezes acima de seu valor.

---

FR-362 — Aplicação de adiantamento deve ser atômica

---

FR-363 — Fechamento deve bloquear alterações concorrentes

---

39. Duplicidades

FR-370 — Contas potencialmente duplicadas devem ser detectadas

Critérios sugeridos:

- fornecedor;
- documento;
- valor;
- emissão.

---

FR-371 — Extratos duplicados devem ser detectados por hash

---

FR-372 — Transações duplicadas devem utilizar identificadores bancários quando disponíveis

---

FR-373 — Duplicidade não deve ser ignorada silenciosamente

---

40. Documentos

FR-380 — Documento financeiro deverá possuir referência ao armazenamento central

---

FR-381 — Documentos não deverão ser armazenados diretamente nas tabelas financeiras

---

FR-382 — Documentos obrigatórios poderão depender de política

Exemplo:

pagamentos > R$ 10.000 exigem documento de suporte

O valor é apenas ilustrativo e deverá ser configurado.

---

41. Segurança

FR-390 — Autorização sempre no backend

---

FR-391 — Permissões devem ser granulares

Exemplos:

criar
aprovar
pagar
estornar
conciliar
fechar
reabrir
visualizar auditoria

---

FR-392 — Visualizar não implica alterar

---

FR-393 — Administrador técnico não é aprovador financeiro por padrão

---

FR-394 — Dados sensíveis devem respeitar menor privilégio

---

42. Relatórios

FR-400 — Relatórios devem indicar data de corte

---

FR-401 — Relatórios devem indicar moeda

---

FR-402 — Relatórios devem indicar regime

Exemplo:

Caixa
Competência

---

FR-403 — Relatórios devem indicar cenário quando aplicável

---

FR-404 — Relatórios históricos não devem mudar silenciosamente

Se regras ou classificações forem alteradas, a plataforma deverá permitir identificar a versão ou política aplicada.

---

43. Fluxo de caixa projetado

FR-410 — Cada projeção deve possuir origem

Exemplo:

conta a pagar
pedido de compra
contrato
recebível
forecast
premissa de cenário

---

FR-411 — Não haverá dupla contagem entre previsão e obrigação

---

FR-412 — Previsões substituídas deverão permanecer historicamente rastreáveis

---

44. Cenários

FR-420 — Cenários não alteram dados oficiais

---

FR-421 — Premissas devem ser persistidas

---

FR-422 — Cenários publicados devem ser versionados

---

FR-423 — Resultados devem ser reproduzíveis

---

45. Orçamento e forecast

FR-430 — Budget aprovado é imutável

---

FR-431 — Forecast pode ser revisado

---

FR-432 — Baseline deve ser preservada

---

FR-433 — Revisões geram nova versão

---

FR-434 — Realizado não altera budget

---

46. Backlog

FR-440 — Backlog representa receita contratada não reconhecida ou faturada conforme definição do relatório

A definição exata deverá ser explicitada no indicador.

---

FR-441 — O mesmo valor não pode aparecer simultaneamente como faturado e backlog sem distinção

---

FR-442 — Contratos cancelados devem reduzir backlog futuro

Sem alterar receita já realizada.

---

47. Aging

FR-450 — Aging utiliza saldo aberto

---

FR-451 — Aging utiliza vencimento aplicável

Caso haja renegociação válida, o relatório deverá indicar se utiliza:

- vencimento original;
- vencimento renegociado.

---

FR-452 — Parcelas liquidadas não participam do aging aberto

---

48. Indicadores

FR-460 — Indicadores devem possuir fórmula documentada

---

FR-461 — Indicadores devem possuir periodicidade

---

FR-462 — Indicadores devem informar fonte

---

FR-463 — Mudança de fórmula deve gerar versão

Especialmente para indicadores utilizados no valuation.

---

49. Valuation

FR-470 — O domínio financeiro fornece dados, não necessariamente o valuation final

---

FR-471 — Indicadores enviados ao valuation devem ser rastreáveis

---

FR-472 — Séries históricas não devem ser sobrescritas

---

FR-473 — Ajustes extraordinários deverão ser identificáveis

Exemplos:

- receita não recorrente;
- despesa extraordinária;
- evento não operacional.

Isso permitirá normalização futura de EBITDA e fluxo de caixa.

---

50. Eventos de domínio

FR-480 — Eventos representam fatos passados

Correto:

PaymentConfirmed

Evitar:

ConfirmPayment

---

FR-481 — Evento deve possuir identificador único

---

FR-482 — Evento deve possuir timestamp

---

FR-483 — Evento deve possuir correlationId quando aplicável

---

FR-484 — Consumidores devem ser idempotentes

---

51. Erros de domínio

FR-490 — Erros devem possuir código estável

---

FR-491 — Erros não devem expor detalhes internos

---

FR-492 — Mensagem de erro não substitui regra

A validação deverá existir no domínio ou aplicação, não apenas na interface.

---

52. Regras de escopo do MVP

FR-500 — MVP opera prioritariamente em BRL

---

FR-501 — MVP não implementará contabilidade oficial

---

FR-502 — MVP não implementará fiscal completo

---

FR-503 — MVP poderá importar OFX antes de possuir Open Finance

---

FR-504 — MVP deverá priorizar operação financeira diária

Prioridades:

- contas;
- parcelas;
- pagamentos;
- recebimentos;
- banco;
- conciliação;
- fluxo de caixa;
- projetos;
- relatórios básicos.

---

53. Regras futuras

As seguintes regras permanecem fora da primeira implementação, mas deverão ser consideradas na arquitetura.

FR-510 — Multimoeda

Deverá prever:

- moeda funcional;
- moeda da transação;
- taxa de câmbio;
- diferença cambial.

---

FR-511 — Empréstimos

Deverão permitir separar:

- principal;
- juros;
- tarifas;
- amortização.

---

FR-512 — Aplicações financeiras

Deverão distinguir:

- principal investido;
- rendimento;
- resgate;
- liquidez;
- tributação.

---

FR-513 — Ativos

Futuramente poderão gerar:

- investimentos;
- depreciação;
- ganho ou perda na venda.

---

FR-514 — Provisões

Deverão possuir:

- origem;
- competência;
- probabilidade;
- reversão;
- realização.

---

54. Regras prioritárias para implementação

Antes de iniciar o "schema.prisma", deverão ser consideradas obrigatórias as seguintes regras:

FR-001
FR-002
FR-003
FR-004

FR-010
FR-011
FR-012

FR-020
FR-022

FR-030
FR-031
FR-032
FR-033

FR-040
FR-041

FR-050
FR-051
FR-053

FR-060
FR-061
FR-062
FR-063
FR-064

FR-070
FR-073

FR-080
FR-081
FR-082

FR-110
FR-120

FR-140
FR-150
FR-151
FR-152

FR-160
FR-162

FR-170
FR-171

FR-180
FR-181
FR-182
FR-183

FR-190
FR-192
FR-193

FR-200
FR-203
FR-204

FR-210
FR-211
FR-212
FR-213
FR-214

FR-220
FR-221

FR-260
FR-262

FR-280

FR-320
FR-322

FR-330
FR-331
FR-333

FR-340

FR-350
FR-352

FR-360
FR-361

FR-390

---

55. Matriz de invariantes

Regra| Entidade/Agregado principal| Validação
Parcelas = valor total| Payable / Receivable| síncrona
Saldo >= 0| Installment| transacional
Valor alocado <= liquidação| Payment / Receipt| transacional
Conta aberta para movimentação| FinancialAccount| síncrona
Período aberto| FinancialPeriod| síncrona
Conta gerencial ativa| ManagementAccount| síncrona
Projeto obrigatório em custo direto| Payable| política
Transferência possui dois lados| FinancialTransfer| transacional
Conciliação <= transação| BankTransaction| transacional
Adiantamento >= aplicação| Advance| transacional
Aprovação válida| ApprovalRequest| síncrona
Evento não duplicado| Integrações| idempotência

---

56. Ordem de precedência das validações

Uma operação financeira deverá preferencialmente validar nesta ordem:

1. autenticação
2. autorização
3. existência dos recursos
4. estado das entidades
5. período financeiro
6. integridade dos valores
7. regras de alçada
8. regras específicas do negócio
9. persistência transacional
10. auditoria
11. eventos

Essa ordem é conceitual e poderá variar tecnicamente quando necessário.

---

57. Regras para transações de banco

Operações que alteram simultaneamente múltiplos registros deverão ser executadas dentro de uma única transação PostgreSQL.

Casos obrigatórios:

- criação de conta e parcelas;
- pagamento e alocações;
- recebimento e alocações;
- estorno;
- aplicação de adiantamento;
- transferência;
- conciliação;
- fechamento;
- conversão de compromisso;
- rateio.

---

58. Regras para eventos após commit

Eventos externos ou efeitos que não possam participar da transação do banco deverão ser disparados somente após confirmação da persistência.

O projeto poderá adotar futuramente padrão Outbox caso a confiabilidade dos eventos internos assim exija.

A adoção formal deverá ocorrer por ADR.

---

59. Regras para auditoria de alterações

Alterações de baixo impacto poderão registrar apenas:

- usuário;
- timestamp;
- operação.

Alterações financeiras materiais deverão registrar também:

- valor anterior;
- valor posterior;
- motivo;
- origem;
- correlação.

---

60. Regras para dados históricos

A plataforma deverá favorecer estruturas temporais em vez de sobrescrever informações utilizadas historicamente.

Exemplos:

- vencimento original;
- versão de contrato;
- baseline;
- classificação vigente;
- rateio aplicado;
- fórmula de indicador.

---

61. Regras de consistência entre relatórios

Dois relatórios que utilizem a mesma métrica, período, regime e filtros deverão apresentar o mesmo resultado.

Exemplo:

Total de contas a receber abertas no Dashboard
=
Total de contas a receber abertas no relatório detalhado

Diferenças deverão ser explicáveis por:

- regime;
- data de corte;
- cenário;
- moeda;
- filtro;
- granularidade.

---

62. Data de corte

Todo relatório financeiro deverá possuir uma data de corte explícita ou implicitamente determinada.

Exemplo:

Posição em 31/07/2026

Essa data deverá afetar corretamente:

- saldos;
- aging;
- caixa;
- DRE;
- margem;
- backlog;
- indicadores.

---

63. Dados futuros

Movimentações previstas com data futura não deverão aparecer como realizadas.

---

64. Dados retroativos

Lançamentos retroativos somente serão permitidos quando:

- período estiver aberto;
- ou processo de reabertura tiver sido concluído.

---

65. Integridade entre módulos

Referências a entidades de outros módulos deverão validar a existência do recurso através da interface pública apropriada do módulo.

O módulo financeiro não deverá assumir propriedade sobre:

- cliente;
- fornecedor;
- projeto;
- contrato;
- pedido;
- usuário.

---

66. Falha de referência externa

Se um recurso externo for posteriormente inativado, os registros financeiros históricos deverão permanecer válidos.

Exemplo:

Fornecedor inativo não invalida contas antigas.

---

67. Regras de exclusão lógica

Cadastros auxiliares poderão possuir:

ACTIVE
INACTIVE

Entidades transacionais deverão utilizar estados do domínio, e não "deleted = true" como mecanismo principal.

---

68. Valores agregados

Totais exibidos deverão ser calculados a partir dos mesmos componentes persistidos.

Exemplo:

totalLiquidado =
Σ PaymentAllocation válidas

e não de campo manualmente editável.

---

69. Reconstrução

Quando valores derivados forem materializados, deverá existir possibilidade técnica de reconstrução a partir da fonte transacional.

---

70. Regras de testes

Cada regra deste documento deverá possuir cobertura apropriada.

Categorias:

- unitário;
- integração;
- banco;
- end-to-end.

Regras monetárias deverão possuir testes com:

- valores inteiros;
- centavos;
- arredondamento;
- valores altos;
- múltiplas parcelas;
- pagamentos parciais;
- estornos.

---

71. Exemplos críticos de testes

Pagamento parcial

Conta = 100.000
Pagamento = 40.000

Saldo esperado = 60.000
Status = PARTIALLY_SETTLED

---

Quitação posterior

Saldo = 60.000
Pagamento = 60.000

Saldo esperado = 0
Status = SETTLED

---

Excesso de pagamento

Saldo = 60.000
Pagamento = 70.000

Resultado esperado:

operação bloqueada

ou diferença classificada explicitamente conforme caso de uso.

---

Estorno

Saldo original = 100.000
Pagamento = 40.000
Saldo = 60.000

Estorno = 40.000

Saldo final = 100.000

---

Parcelamento

R$ 100,00 / 3

33,33
33,33
33,34

---

Retenção

Recebível bruto = 100.000
Retenção = 6.150
Banco = 93.850

Saldo final = 0

desde que a retenção esteja corretamente reconhecida.

---

72. Decisões que exigem ADR

Os seguintes pontos deverão possuir ADR específico antes ou durante a implementação:

1. precisão e arredondamento monetário;
2. política de fechamento e reabertura;
3. estratégia de conciliação bancária;
4. estratégia de eventos internos;
5. política de reconhecimento de receita, quando necessária;
6. multimoeda, quando entrar no escopo;
7. materialização de saldos, caso adotada;
8. estratégia Outbox, caso necessária.

---

73. ADRs recomendados na sequência

docs/adr/ADR-007-financial-amounts-and-rounding.md
docs/adr/ADR-008-financial-period-closing.md
docs/adr/ADR-009-bank-reconciliation.md
docs/adr/ADR-010-financial-domain-events.md

A sequência recomendada é essa porque os quatro ADRs possuem impacto direto sobre o primeiro schema financeiro.

---

74. Próximo passo técnico

Após aprovação das regras e ADRs financeiros, deverá ser elaborado o primeiro modelo físico em:

prisma/schema.prisma

A primeira versão deverá priorizar apenas:

FinancialAccount
ManagementAccount
CostCenter
ResultCenter
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
FinancialPeriod

Entidades avançadas deverão ser introduzidas gradualmente.

---

75. Conclusão

As regras deste documento representam as invariantes fundamentais do núcleo financeiro da Plataforma Aritech.

A implementação deverá garantir que nenhuma camada consiga violar regras críticas relacionadas a:

- valores;
- parcelas;
- liquidação;
- competência;
- caixa;
- conciliação;
- estorno;
- aprovação;
- período;
- projeto;
- auditoria.

A combinação entre:

FINANCIAL_DOMAIN
+
FINANCIAL_MODEL
+
FINANCIAL_WORKFLOWS
+
FINANCIAL_USE_CASES
+
FINANCIAL_RULES

forma a especificação funcional e conceitual inicial do domínio financeiro.

A partir desse ponto, as principais decisões arquiteturais restantes deverão ser formalizadas em ADRs antes da implementação definitiva da persistência e da API.