# docs/domain/FINANCIAL_DOMAIN.md

# Financial Domain

## Objetivo

O domínio financeiro é responsável por representar toda a movimentação econômica e financeira da Plataforma Aritech.

Seu objetivo é permitir que a empresa acompanhe a evolução financeira desde a elaboração do orçamento de uma oportunidade comercial até o encerramento completo de um projeto, produzindo informações confiáveis para:

- gestão operacional;
- tomada de decisão;
- fluxo de caixa;
- indicadores financeiros;
- DRE gerencial;
- valuation da empresa;
- auditoria completa.

Este documento define os conceitos, entidades, regras de negócio e princípios que regerão todo o núcleo financeiro da plataforma.

---

# Princípios do domínio

O módulo financeiro foi concebido seguindo alguns princípios fundamentais.

## Fonte única da verdade

Toda movimentação financeira deve possuir uma origem claramente identificável.

Exemplos:

- contrato;
- pedido de compra;
- nota fiscal;
- medição;
- folha de pagamento;
- despesa administrativa;
- projeto.

Não serão permitidos lançamentos "soltos" sem origem identificável, exceto lançamentos manuais devidamente auditados.

---

## Separação entre obrigação e pagamento

Uma obrigação financeira não significa que houve movimentação bancária.

Exemplo:

Uma nota fiscal de fornecedor pode ser lançada hoje para vencimento daqui a 30 dias.

Nesse momento existe:

- obrigação financeira;
- impacto na competência;
- nenhum impacto no caixa.

Somente quando ocorrer o pagamento haverá impacto financeiro no caixa.

---

## Separação entre competência e caixa

Todo lançamento poderá gerar efeitos em dois regimes independentes.

### Regime de Competência

Representa o momento econômico.

Exemplos:

- emissão de nota fiscal;
- recebimento de nota de fornecedor;
- reconhecimento de receita;
- reconhecimento de despesa.

É utilizado principalmente para:

- DRE;
- margem;
- indicadores;
- valuation.

---

### Regime de Caixa

Representa a entrada ou saída efetiva de dinheiro.

Exemplos:

- pagamento;
- recebimento;
- transferência bancária;
- aplicação financeira.

É utilizado principalmente para:

- fluxo de caixa;
- saldo bancário;
- capital de giro.

---

# Estados financeiros

Cada obrigação financeira pode evoluir por diversos estados durante seu ciclo de vida.

Os estados são independentes do pagamento.

## Orçado

Valor previsto durante o orçamento da oportunidade.

Ainda não representa obrigação financeira.

Exemplo:

Foi estimado gastar:

- R$ 150.000 em materiais;
- R$ 40.000 em viagens;
- R$ 300.000 em mão de obra.

Nada disso necessariamente ocorrerá.

---

## Previsto

Representa uma expectativa futura.

Ainda pode sofrer alterações.

Exemplos:

- previsão de faturamento;
- previsão de pagamento;
- previsão de recebimento;
- previsão de compra.

---

## Comprometido

Representa uma obrigação já assumida pela empresa.

Exemplos:

- pedido de compra aprovado;
- contrato assinado;
- fornecedor contratado;
- funcionário contratado;
- aluguel.

Mesmo que ainda não exista pagamento, o recurso financeiro já está comprometido.

---

## Realizado

Representa aquilo que efetivamente aconteceu.

Exemplos:

- pagamento realizado;
- recebimento realizado;
- nota emitida;
- despesa efetivada.

Este estado é imutável, exceto mediante estorno auditado.

---

# Ciclo financeiro

De maneira geral, todo lançamento poderá evoluir conforme o fluxo abaixo.

```
Orçado
    ↓
Previsto
    ↓
Comprometido
    ↓
Realizado
```

Nem todos os lançamentos passarão por todos os estados.

Exemplo:

Uma despesa administrativa eventual poderá nascer diretamente como realizada.

---

# Contas a pagar

Contas a pagar representam obrigações financeiras da empresa.

Podem possuir origem em:

- fornecedores;
- impostos;
- folha de pagamento;
- contratos;
- aluguel;
- energia;
- água;
- fretes;
- reembolsos;
- despesas financeiras.

Cada conta a pagar possuirá pelo menos:

- fornecedor;
- categoria financeira;
- centro de custo;
- projeto (quando aplicável);
- data de emissão;
- vencimento;
- valor original;
- saldo em aberto;
- situação.

---

# Contas a receber

Representam valores que terceiros devem pagar à empresa.

Exemplos:

- contratos;
- medições;
- notas fiscais;
- prestação de serviços;
- venda de equipamentos.

Cada conta a receber poderá estar vinculada a:

- cliente;
- contrato;
- projeto;
- centro de resultado;
- cronograma financeiro.

---

# Parcelas

Um lançamento financeiro poderá possuir uma ou várias parcelas.

Exemplo:

Compra de R$ 120.000

Parcelamento:

- 30 dias
- 60 dias
- 90 dias

Serão criadas três parcelas independentes.

Cada parcela possuirá:

- vencimento próprio;
- situação própria;
- pagamentos próprios;
- histórico próprio.

O lançamento principal apenas consolida essas informações.

---

# Pagamentos parciais

Uma parcela poderá receber diversos pagamentos.

Exemplo:

Parcela:

R$ 100.000

Pagamento 1:

R$ 40.000

Pagamento 2:

R$ 25.000

Pagamento 3:

R$ 35.000

Após o último pagamento a parcela será considerada quitada.

Enquanto existir saldo remanescente permanecerá parcialmente paga.

---

# Recebimentos parciais

O mesmo conceito aplica-se às contas a receber.

Um cliente poderá realizar diversos pagamentos até quitar completamente uma nota fiscal ou contrato.

Cada recebimento ficará registrado individualmente.

Isso permite:

- rastreabilidade;
- conciliação;
- cálculo correto do fluxo de caixa;
- cálculo de inadimplência.

---

# Adiantamentos

O sistema deverá tratar adiantamentos como uma categoria própria.

Exemplos:

- adiantamento para fornecedor;
- adiantamento salarial;
- adiantamento de viagem;
- adiantamento de cliente.

Um adiantamento não encerra a obrigação financeira.

Posteriormente deverá ser compensado contra a obrigação definitiva.

Exemplo:

Fornecedor

Adiantamento:

R$ 30.000

Nota fiscal:

R$ 100.000

Saldo final:

R$ 70.000

Todo vínculo deverá permanecer registrado para auditoria.

---

# Retenções

O sistema deverá permitir retenções financeiras incidentes sobre pagamentos ou recebimentos.

Exemplos:

- INSS;
- ISS;
- IRRF;
- PIS;
- COFINS;
- CSLL;
- retenções contratuais.

As retenções deverão possuir:

- tipo;
- base de cálculo;
- percentual;
- valor;
- responsável pelo recolhimento.

O valor líquido movimentado no caixa poderá ser diferente do valor bruto da obrigação.

Ambos deverão permanecer registrados.

---

# Juros, multas e descontos

Toda parcela poderá sofrer alterações financeiras.

Exemplos:

- multa por atraso;
- juros contratuais;
- desconto comercial;
- desconto financeiro;
- abatimento negociado.

Nenhum desses valores deverá substituir o valor original.

O sistema deverá registrar separadamente:

- valor original;
- acréscimos;
- reduções;
- valor líquido pago;
- motivo da alteração.

Essa abordagem preserva a integridade histórica e permite auditoria completa.

# Estornos

O sistema deverá permitir o estorno de qualquer movimentação financeira, preservando integralmente o histórico da operação original.

Nenhum registro financeiro deverá ser fisicamente excluído após gerar impacto contábil ou financeiro.

O estorno deverá criar uma nova movimentação com efeito inverso, mantendo o vínculo com a operação original.

Exemplo:

```
Pagamento:
R$ 15.000

↓

Estorno:
- R$ 15.000
```

Toda operação de estorno deverá registrar:

- usuário responsável;
- data e hora;
- motivo;
- justificativa;
- movimentação original;
- movimentação gerada.

O lançamento original permanecerá preservado para fins de auditoria.

---

# Cancelamentos

Cancelamento é diferente de estorno.

## Cancelamento

Ocorre quando a obrigação financeira deixa de existir antes de produzir efeitos financeiros.

Exemplos:

- pedido de compra cancelado;
- contrato rescindido antes da execução;
- nota fiscal cancelada;
- parcela emitida por engano.

Neste caso, a obrigação deixa de existir.

---

## Estorno

Ocorre quando já houve efeito financeiro.

Exemplos:

- pagamento realizado incorretamente;
- recebimento duplicado;
- lançamento bancário incorreto.

Neste caso, cria-se uma movimentação inversa.

---

# Transferências entre contas

Transferências representam apenas movimentação de recursos entre contas financeiras da empresa.

Não representam:

- receita;
- despesa;
- lucro;
- prejuízo.

Exemplos:

Conta Corrente Santander

↓

Aplicação Financeira XP

↓

Conta Corrente Banco do Brasil

O sistema deverá registrar simultaneamente:

Movimentação de saída

e

Movimentação de entrada

ambas pertencentes à mesma transferência.

A soma financeira deverá ser sempre igual a zero.

---

# Contas financeiras

O sistema deverá permitir o cadastro de diversas contas financeiras.

Exemplos:

- Conta Corrente Santander;
- Conta Corrente Itaú;
- Conta Corrente Banco do Brasil;
- Caixa;
- Aplicações financeiras;
- Conta internacional;
- Carteiras digitais.

Cada conta possuirá:

- instituição financeira;
- agência;
- número;
- moeda;
- saldo atual;
- saldo conciliado;
- situação.

---

# Movimentações bancárias

Uma movimentação bancária representa qualquer alteração no saldo de uma conta financeira.

Exemplos:

Entradas

- recebimento de clientes;
- rendimento financeiro;
- aporte de sócios;
- estorno bancário.

Saídas

- pagamentos;
- impostos;
- tarifas;
- aplicações;
- empréstimos;
- transferências.

Cada movimentação deverá possuir:

- conta financeira;
- data;
- valor;
- tipo;
- histórico;
- documento;
- origem;
- usuário responsável.

---

# Conciliação bancária

A conciliação garante que os registros internos da plataforma sejam compatíveis com o extrato bancário.

Cada movimentação poderá assumir um dos seguintes estados:

- pendente;
- conciliada automaticamente;
- conciliada manualmente;
- divergente.

A conciliação poderá ocorrer por:

- importação OFX;
- importação CSV;
- integração via Open Finance;
- integração bancária futura.

---

## Critérios de conciliação

Preferencialmente serão utilizados:

- valor;
- data;
- documento;
- identificação PIX;
- número da TED;
- boleto;
- histórico bancário.

Caso não exista correspondência automática, o usuário poderá realizar a associação manual.

Todas as associações permanecerão auditadas.

---

# Fluxo de Caixa

O fluxo de caixa é uma das principais funcionalidades do domínio financeiro.

Seu objetivo é responder:

- Quanto dinheiro existe hoje?
- Quanto existirá amanhã?
- Quanto existirá nos próximos meses?
- Quando faltará caixa?
- Quando haverá sobra financeira?

O fluxo de caixa utilizará exclusivamente o Regime de Caixa.

---

## Componentes do fluxo de caixa

O cálculo deverá considerar:

Entradas previstas

- contratos;
- medições;
- notas fiscais;
- recebimentos previstos.

Saídas previstas

- fornecedores;
- salários;
- impostos;
- aluguel;
- financiamentos;
- compras;
- despesas administrativas.

Também deverão ser considerados:

- saldo inicial;
- aplicações;
- resgates;
- transferências.

---

## Fluxo diário

O sistema deverá calcular automaticamente o saldo projetado para cada dia.

Exemplo:

```
Saldo inicial

↓

Entradas previstas

↓

Saídas previstas

↓

Saldo final do dia

↓

Saldo inicial do dia seguinte
```

Essa projeção permitirá identificar antecipadamente necessidades de capital de giro.

---

# Cenários de projeção

O fluxo de caixa deverá suportar múltiplos cenários.

Exemplos:

## Cenário Real

Considera apenas dados efetivamente existentes.

---

## Cenário Conservador

Considera:

- atraso médio de clientes;
- aumento de despesas;
- inadimplência.

---

## Cenário Otimista

Considera:

- recebimentos antecipados;
- redução de custos;
- faturamento adicional.

---

## Cenário Personalizado

O usuário poderá criar projeções específicas para estudos financeiros.

Exemplos:

- novo contrato Petrobras;
- aquisição de máquinas;
- contratação de equipe;
- expansão da empresa;
- abertura de nova unidade.

Nenhum cenário alterará os dados oficiais do sistema.

Serão apenas simulações.

---

# Contratos

Os contratos representam uma das principais origens das receitas da Plataforma Aritech.

Um contrato poderá possuir:

- cliente;
- projeto;
- centro de resultado;
- cronograma físico;
- cronograma financeiro;
- valor contratado;
- reajustes;
- retenções;
- aditivos.

O contrato poderá originar diversas contas a receber ao longo de sua execução.

---

# Cronograma de faturamento

Cada contrato poderá possuir um cronograma de faturamento independente.

Exemplos:

- medição mensal;
- entrega de equipamentos;
- marcos de engenharia;
- aceite de FAT;
- aceite de SAT;
- entrega final.

Cada marco poderá gerar automaticamente:

- previsão de faturamento;
- previsão de recebimento;
- contas a receber.

---

# Pedidos de Compra

O Pedido de Compra (PC) representa um compromisso financeiro formal assumido pela empresa.

Após sua aprovação, o valor correspondente deverá migrar do estado **Previsto** para **Comprometido**, mesmo antes da emissão da nota fiscal pelo fornecedor.

Cada pedido de compra poderá conter:

- fornecedor;
- projeto;
- centro de custo;
- itens;
- quantidades;
- preços;
- impostos;
- condições de pagamento;
- cronograma de entrega.

Um pedido poderá originar uma ou mais contas a pagar conforme as notas fiscais forem recebidas.

---

# Compromissos financeiros

Nem toda obrigação financeira nasce de uma nota fiscal.

Existem compromissos assumidos previamente que já impactam a gestão financeira.

Exemplos:

- pedidos de compra aprovados;
- contratos de locação;
- contratos de prestação de serviços;
- folha de pagamento;
- financiamentos;
- leasing;
- parcelas de empréstimos;
- contratos de manutenção recorrentes.

Esses compromissos deverão alimentar automaticamente:

- fluxo de caixa previsto;
- projeções financeiras;
- necessidade de capital de giro;
- indicadores gerenciais.

Mesmo antes do pagamento efetivo, eles representam recursos financeiros comprometidos pela empresa.
# Projetos

Na Plataforma Aritech, praticamente toda movimentação financeira deverá estar vinculada a um projeto.

Essa abordagem permitirá conhecer com precisão:

- custo real de execução;
- margem financeira;
- margem operacional;
- fluxo de caixa do projeto;
- rentabilidade por cliente;
- rentabilidade por contrato;
- desempenho da engenharia;
- desempenho da produção.

Projetos representam o principal eixo analítico do sistema.

---

## Custos diretos

São custos diretamente relacionados à execução do projeto.

Exemplos:

- materiais;
- componentes elétricos;
- instrumentos;
- painéis;
- cabos;
- equipamentos;
- mão de obra dedicada;
- viagens técnicas;
- hospedagem;
- alimentação em campo;
- fretes específicos;
- subcontratações.

Todos os custos diretos deverão compor automaticamente o custo do projeto.

---

## Custos indiretos

Custos indiretos representam despesas necessárias para operação da empresa, mas que não pertencem exclusivamente a um único projeto.

Exemplos:

- aluguel;
- internet;
- energia;
- contador;
- softwares;
- marketing;
- RH;
- administrativo;
- diretoria.

O sistema deverá permitir diferentes critérios de rateio.

Exemplos:

- percentual fixo;
- horas trabalhadas;
- faturamento;
- custo direto;
- quantidade de colaboradores;
- outro critério definido pela empresa.

---

# Centros de Custo

Centros de custo representam agrupamentos administrativos utilizados para controlar despesas.

Eles são independentes dos projetos.

Um lançamento poderá possuir:

- projeto;
- centro de custo;

ou apenas um deles.

Exemplos de centros de custo:

- Engenharia;
- Automação;
- Elétrica;
- Instrumentação;
- Produção;
- Almoxarifado;
- Compras;
- Comercial;
- Marketing;
- Administrativo;
- Financeiro;
- Diretoria.

Essa separação permitirá analisar tanto a rentabilidade dos projetos quanto a eficiência operacional de cada departamento.

---

# Centros de Resultado

Enquanto os centros de custo controlam despesas, os centros de resultado permitem analisar receitas.

Exemplos:

- Engenharia;
- Painéis Elétricos;
- Integração de Sistemas;
- Serviços de Campo;
- Contratos de Manutenção;
- Projetos Multidisciplinares.

Um mesmo projeto poderá possuir diversos centros de resultado.

Isso permitirá identificar quais linhas de negócio geram maior retorno para a empresa.

---

# Plano de Contas Gerencial

O plano de contas gerencial será utilizado para classificar todas as receitas e despesas da plataforma.

Diferentemente do plano de contas contábil, seu objetivo é fornecer informações para gestão do negócio.

A estrutura deverá ser hierárquica.

Exemplo:

```
Receitas

    Engenharia

    Automação

    Integração

    Painéis

    Serviços

Despesas

    Materiais

    Mão de obra

    Viagens

    Terceiros

    Ferramentas

Administrativas

    Aluguel

    Energia

    Marketing

    RH

Financeiras

    Juros

    Tarifas

    IOF

Investimentos

    Máquinas

    Equipamentos

    Obras
```

Cada lançamento financeiro deverá possuir exatamente uma classificação gerencial.

---

# DRE Gerencial

A Demonstração de Resultado Gerencial será produzida automaticamente utilizando o Regime de Competência.

Ela deverá permitir diferentes níveis de detalhamento.

Estrutura sugerida:

```
Receita Bruta

(-) Impostos

(-) Devoluções

Receita Líquida

(-) Custos Diretos

Lucro Bruto

(-) Despesas Operacionais

EBITDA

(-) Depreciação

Resultado Operacional

(+/-) Resultado Financeiro

Lucro Líquido
```

Todos os valores deverão ser rastreáveis até os lançamentos originais.

---

# Margem por Projeto

A plataforma deverá calcular automaticamente a margem de cada projeto.

Indicadores mínimos:

- receita contratada;
- receita faturada;
- receita recebida;
- custo orçado;
- custo comprometido;
- custo realizado;
- lucro bruto;
- margem bruta;
- margem líquida.

Também deverão ser apresentados indicadores de evolução durante toda a execução do projeto.

---

# Capital de Giro

O sistema deverá acompanhar continuamente a necessidade de capital de giro da empresa.

Para isso deverá considerar:

- saldo bancário;
- contas a receber;
- contas a pagar;
- estoques;
- compromissos futuros;
- contratos assinados;
- pedidos de compra;
- financiamentos;
- aplicações financeiras.

O objetivo é antecipar situações de insuficiência de caixa antes que elas ocorram.

---

# Aprovações e Alçadas

Determinadas operações financeiras dependerão de aprovação.

O sistema deverá suportar múltiplos níveis de alçada.

Exemplo:

Até R$ 5.000

→ Coordenador

Até R$ 50.000

→ Gerente

Até R$ 200.000

→ Diretor

Acima desse valor

→ Sócios

As regras deverão ser parametrizáveis.

Cada aprovação deverá registrar:

- usuário;
- data;
- decisão;
- justificativa;
- comentários.

---

# Fechamento de Períodos

O fechamento financeiro impede alterações em períodos já consolidados.

Após o fechamento:

- novos lançamentos não poderão ser incluídos;
- pagamentos não poderão ser alterados;
- conciliações permanecerão bloqueadas;
- indicadores permanecerão consistentes.

O fechamento poderá ocorrer por:

- mês;
- trimestre;
- exercício.

---

# Reabertura de Períodos

Somente usuários autorizados poderão reabrir períodos encerrados.

Toda reabertura deverá registrar:

- usuário responsável;
- data;
- motivo;
- período afetado;
- justificativa formal.

Após a nova consolidação, será criada uma nova versão lógica do fechamento, preservando o histórico de auditoria.

---

# Auditoria

Todo o domínio financeiro deverá utilizar a infraestrutura de auditoria definida na arquitetura da Plataforma Aritech.

Os seguintes eventos deverão ser auditados obrigatoriamente:

- criação;
- edição;
- exclusão lógica;
- aprovação;
- cancelamento;
- estorno;
- pagamento;
- recebimento;
- conciliação;
- fechamento;
- reabertura.

Nenhuma informação financeira crítica poderá ser alterada sem rastreabilidade completa.

---

# Integração com Indicadores e Valuation

O domínio financeiro será a principal fonte de dados para os módulos analíticos da plataforma.

Os dados produzidos alimentarão automaticamente indicadores como:

- faturamento mensal;
- receita recorrente;
- backlog;
- margem operacional;
- EBITDA;
- geração de caixa;
- capital de giro;
- liquidez;
- inadimplência;
- prazo médio de recebimento;
- prazo médio de pagamento;
- ROI;
- ROIC;
- crescimento anual.

Esses indicadores servirão de base para o módulo de Business Intelligence e para o acompanhamento da evolução do valuation da Aritech ao longo do processo de transformação digital.

---

# Entidades Prioritárias do MVP

A primeira versão da Plataforma Aritech deverá contemplar, no mínimo, as seguintes entidades:

- ContaFinanceira
- MovimentacaoFinanceira
- ContaPagar
- ContaReceber
- Parcela
- Pagamento
- Recebimento
- Transferencia
- ConciliacaoBancaria
- Projeto
- CentroCusto
- CentroResultado
- PlanoContaGerencial
- Contrato
- CronogramaFinanceiro
- PedidoCompra
- Fornecedor
- Cliente

Essas entidades constituem o núcleo mínimo necessário para suportar a operação financeira da empresa.

---

# Regras de Negócio Prioritárias

O domínio financeiro deverá obedecer às seguintes regras:

1. Nenhuma movimentação financeira poderá ser excluída fisicamente.

2. Todo estorno deverá gerar uma nova movimentação compensatória.

3. Toda movimentação deverá possuir origem identificável.

4. Toda movimentação deverá possuir trilha de auditoria.

5. Pagamentos parciais deverão ser suportados nativamente.

6. Recebimentos parciais deverão ser suportados nativamente.

7. Parcelas deverão possuir ciclo de vida independente.

8. O fluxo de caixa utilizará exclusivamente movimentações em regime de caixa.

9. A DRE utilizará exclusivamente informações em regime de competência.

10. Toda receita e despesa deverá possuir classificação gerencial.

11. Projetos deverão ser capazes de consolidar automaticamente receitas, custos e margens.

12. Fechamentos financeiros deverão impedir alterações retroativas, salvo mediante processo formal de reabertura.

---

# Decisões Pendentes

Os seguintes temas deverão ser detalhados em ADRs ou documentos específicos durante a evolução da plataforma:

- Política de rateio de custos indiretos.
- Modelo de integração bancária (Open Finance, OFX e APIs).
- Estratégia de importação de extratos.
- Integração com emissão de Nota Fiscal eletrônica.
- Integração com folha de pagamento.
- Controle de ativos e depreciação.
- Controle orçamentário avançado (Budget x Forecast).
- Planejamento financeiro plurianual.
- Consolidação entre múltiplas empresas (holding).
- Integração com módulo fiscal e contábil.
- Cálculo automatizado de indicadores de valuation.
- Regras de reconhecimento de receita para contratos de longa duração.
- Integração com o módulo de Compras, Estoque, Produção e CRM.

---

# Considerações Finais

O domínio financeiro constitui o núcleo estratégico da Plataforma Aritech. Sua modelagem foi concebida para suportar empresas de engenharia, automação industrial, integração de sistemas, montagem de painéis elétricos e prestação de serviços técnicos, priorizando rastreabilidade, integridade dos dados, flexibilidade operacional e geração de informações gerenciais confiáveis.

A separação clara entre obrigações financeiras, movimentações de caixa, competência econômica e análise gerencial permitirá que a plataforma evolua de um ERP operacional para uma solução integrada de gestão, inteligência de negócios e apoio à tomada de decisão, sustentando o crescimento da empresa e fornecendo dados consistentes para avaliação contínua de desempenho e valuation.
---

# Estrutura Orçamentária

O módulo financeiro deverá diferenciar claramente os conceitos de orçamento, previsão e execução.

Embora frequentemente tratados como sinônimos, representam informações distintas.

## Budget (Orçamento Base)

Representa o planejamento financeiro oficial aprovado para um determinado período.

Características:

- aprovado pela diretoria;
- congelado após aprovação;
- utilizado como referência para comparação;
- somente poderá ser alterado mediante revisão formal.

Exemplo:

Orçamento anual de 2027.

---

## Forecast

Representa a melhor estimativa da empresa para o resultado futuro.

Pode ser atualizado mensalmente.

Exemplo:

Embora o orçamento previsse faturamento de R$ 2.000.000 no trimestre, o forecast atualizado indica R$ 2.350.000.

O forecast nunca substitui o orçamento.

---

## Realizado

Representa aquilo que efetivamente ocorreu.

Sempre será comparado contra:

- Budget
- Forecast

permitindo análises como:

```
Budget x Realizado

Forecast x Realizado

Budget x Forecast
```

---

# Baseline Financeira

Cada projeto poderá possuir uma Baseline Financeira.

A Baseline representa uma fotografia congelada do planejamento financeiro em determinado momento.

Exemplos:

- assinatura do contrato;
- aprovação do orçamento;
- aprovação de aditivo;
- revisão extraordinária.

Sempre que houver uma revisão significativa, uma nova Baseline poderá ser criada.

As versões anteriores permanecerão preservadas.

---

# Estrutura Analítica Financeira (WBS)

Todo projeto poderá possuir uma estrutura analítica financeira alinhada à EAP (Estrutura Analítica do Projeto).

Exemplo:

Projeto Petrobras

- Engenharia

  - Instrumentação

  - Elétrica

  - Automação

- Suprimentos

- Montagem

- Comissionamento

Cada lançamento financeiro poderá ser associado a um item da WBS.

Isso permitirá responder perguntas como:

- Quanto custou a engenharia?

- Quanto custou a montagem?

- Qual disciplina consumiu maior orçamento?

---

# Curva S

O sistema deverá calcular automaticamente a Curva S dos projetos.

Serão mantidas duas curvas principais.

## Curva Física

Representa o avanço da execução.

Exemplo:

Projeto executado:

45%

---

## Curva Financeira

Representa os recursos consumidos.

Exemplo:

Valor realizado:

60%

---

A comparação entre ambas permitirá identificar desvios como:

- projeto adiantado financeiramente;
- projeto atrasado;
- sobrecusto;
- subutilização do orçamento.

---

# Medições

Grande parte dos contratos de engenharia utiliza medições periódicas.

O sistema deverá permitir:

- medições mensais;
- medições extraordinárias;
- medições complementares;
- medições retificadoras.

Cada medição poderá gerar:

- faturamento;
- nota fiscal;
- contas a receber;
- previsão de caixa.

---

# Tipos de Contrato

O domínio deverá suportar diferentes modalidades de contratação.

## Preço Global

Valor previamente definido.

O faturamento ocorre conforme cronograma.

---

## Preço Unitário

O faturamento depende das quantidades efetivamente executadas.

---

## Homem-Hora

O faturamento ocorre conforme horas aprovadas.

---

## Time & Material

Receitas calculadas por:

- horas;
- equipamentos;
- materiais consumidos.

---

## Contrato de Manutenção

Receitas recorrentes.

Podem possuir:

- valor fixo mensal;
- SLA;
- faturamento automático.

---

# Retenção Contratual (Holdback)

Diversos contratos de engenharia retêm parte do pagamento.

Exemplo:

Valor da medição

R$ 500.000

Retenção

10%

Recebimento imediato

R$ 450.000

Saldo retido

R$ 50.000

Esse saldo deverá permanecer controlado separadamente.

Sua liberação poderá ocorrer:

- entrega final;
- aceite definitivo;
- término da garantia;
- outro marco contratual.

---

# Garantias Contratuais

O sistema deverá controlar garantias fornecidas e recebidas.

Exemplos:

- seguro garantia;
- carta fiança;
- caução;
- retenção contratual.

Cada garantia possuirá:

- valor;
- vigência;
- beneficiário;
- situação.

---

# Provisões

Além das obrigações existentes, o sistema deverá controlar provisões financeiras.

Exemplos:

- férias;
- décimo terceiro;
- bônus;
- participação nos lucros;
- contingências;
- garantias futuras;
- manutenção prevista.

Essas provisões impactam indicadores gerenciais mesmo antes da saída efetiva de caixa.

---

# Backlog Financeiro

Backlog representa a receita contratada ainda não faturada.

Indicadores:

- valor contratado;
- valor faturado;
- valor recebido;
- saldo contratual;
- receita futura prevista.

Esse indicador será fundamental para estimar o crescimento da empresa.

---

# Aging Financeiro

O sistema deverá produzir análises de envelhecimento financeiro.

## Contas a Receber

Faixas sugeridas:

- a vencer;
- 1–30 dias;
- 31–60 dias;
- 61–90 dias;
- acima de 90 dias.

---

## Contas a Pagar

Mesma estrutura.

Essas informações permitirão:

- identificar inadimplência;
- priorizar cobranças;
- negociar fornecedores;
- calcular indicadores financeiros.

---

# Indicadores Financeiros

O módulo deverá calcular automaticamente indicadores estratégicos.

Exemplos:

Liquidez

- Liquidez Corrente
- Liquidez Seca
- Liquidez Imediata

Caixa

- Geração Operacional
- Burn Rate
- Runway

Clientes

- Prazo Médio de Recebimento
- Inadimplência
- Ticket Médio

Fornecedores

- Prazo Médio de Pagamento

Projetos

- Margem Bruta
- Margem Líquida
- ROI
- Desvio Orçamentário

Empresa

- EBITDA
- EBIT
- Receita Recorrente
- Backlog
- Capital de Giro
- Crescimento Mensal
- Crescimento Anual

Todos esses indicadores deverão ser consumidos diretamente pelo módulo de Business Intelligence da Plataforma Aritech.

---

# Eventos de Domínio

O domínio financeiro deverá publicar eventos sempre que ocorrerem alterações relevantes.

Exemplos:

- ContaPagarCriada
- ContaPagarCancelada
- ContaPaga
- ContaReceberCriada
- ContaRecebida
- ContratoAssinado
- MedicaoAprovada
- PedidoCompraAprovado
- FluxoCaixaAtualizado
- ConciliacaoRealizada
- PeriodoFechado

Esses eventos permitirão integração desacoplada entre os módulos da plataforma.

---

# Evolução do Domínio

Embora o MVP contemple apenas o núcleo financeiro operacional, toda a modelagem deverá ser preparada para evolução futura, incluindo:

- Inteligência Artificial para previsão de fluxo de caixa;
- previsão automática de inadimplência;
- sugestão de compras baseada em histórico;
- previsão de necessidade de capital de giro;
- análise automática de margem por projeto;
- valuation contínuo da empresa;
- dashboards executivos em tempo real;
- integração com Open Finance;
- integração fiscal e contábil;
- consolidação financeira de múltiplas empresas.

Essa estratégia garante que a Plataforma Aritech evolua gradualmente de um ERP operacional para uma plataforma inteligente de gestão empresarial orientada por dados, apoiando decisões estratégicas e sustentando o crescimento da organização.