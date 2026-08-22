# ADR-013 — Managerial Financial Classification

## Status

**Estado:** Accepted  
**Data:** 2026-08-15  
**Escopo:** domínio financeiro e controladoria

## Contexto

A primeira versão do modelo financeiro associava uma conta a pagar ou receber diretamente a uma única conta gerencial, centro de custo, projeto e centro de resultado. Esse desenho é insuficiente para a realidade operacional da Aritech, porque um mesmo documento pode ser rateado entre diferentes projetos, áreas e linhas de negócio.

A estrutura histórica utilizada pela empresa também mistura naturezas econômicas distintas, como despesas operacionais, custos, receitas, empréstimos, aportes, investimentos e transferências. Para análises gerenciais confiáveis, fluxo de caixa e DRE não podem tratar toda entrada como receita nem toda saída como despesa.

## Decisão

A Plataforma Aritech adotará classificação financeira multidimensional baseada em alocações.

`Payable` e `Receivable` continuarão representando obrigações e direitos financeiros. A classificação analítica será registrada em `FinancialClassificationAllocation`.

Cada alocação poderá informar:

- conta gerencial;
- centro de custo;
- linha de negócio;
- projeto;
- contrato;
- valor e percentual;
- competência;
- comportamento de custo;
- relação direta ou indireta com a operação/projeto.

A soma das alocações de uma obrigação deverá corresponder ao valor classificável da obrigação conforme as regras do domínio.

## Conta gerencial

`ManagementAccount` responderá principalmente à pergunta **"o que é este valor?"**.

Exemplos:

- Aluguel;
- Energia Elétrica;
- Salários;
- Hospedagem;
- Combustíveis;
- Softwares;
- Materiais Aplicados na Prestação de Serviços;
- Tarifas Bancárias;
- Projetos de Engenharia;
- Integração de Sistemas;
- Painéis Elétricos e Automação.

A conta não deverá incorporar projeto, cliente, departamento ou contrato no próprio nome quando essas informações puderem ser representadas por outras dimensões.

## Natureza econômica

Cada conta gerencial possuirá uma `EconomicNature`:

```text
OPERATING_REVENUE
DIRECT_COST
OPERATING_EXPENSE
FINANCIAL_INCOME
FINANCIAL_EXPENSE
TAX
INVESTMENT
FINANCING
EQUITY
TRANSFER
ADJUSTMENT
```

Essa classificação evita, por exemplo, tratar empréstimos bancários como receita ou amortizações de principal como despesa operacional.

## DRE e fluxo de caixa

A classificação de DRE e a classificação de fluxo de caixa serão independentes.

Serão utilizados grupos hierárquicos:

```text
DreGroup
CashFlowGroup
```

Exemplo — empréstimo bancário:

```text
EconomicNature: FINANCING
DRE: sem grupo de resultado
Fluxo de caixa: Atividades de Financiamento > Empréstimos Recebidos
```

Exemplo — aluguel:

```text
EconomicNature: OPERATING_EXPENSE
DRE: Despesas Operacionais > Administrativas > Aluguel
Fluxo de caixa: Atividades Operacionais > Despesas Administrativas
```

## Fixo e variável

A classificação fixa/variável não fará parte da árvore principal do plano de contas.

Será representada por `CostBehavior`:

```text
FIXED
VARIABLE
SEMI_VARIABLE
CONTEXT_DEPENDENT
NOT_APPLICABLE
```

A conta gerencial terá um comportamento padrão, mas a alocação poderá registrar o comportamento efetivo do lançamento.

## Direto e indireto

A relação do custo/despesa com projetos também será uma dimensão independente:

```text
DIRECT
INDIRECT
CONTEXT_DEPENDENT
NOT_APPLICABLE
```

Exemplo: hospedagem pode ser direta quando vinculada a comissionamento de um projeto e indireta quando relacionada a atividade administrativa.

## Centro de custo

`CostCenter` responderá principalmente à pergunta **"qual área consumiu ou é responsável pelo recurso?"**.

Estrutura inicial esperada:

- Engenharia;
- Produção;
- Compras;
- Comercial;
- Marketing;
- Financeiro;
- Administrativo;
- Diretoria.

A estrutura definitiva será configurável.

## Linha de negócio

`BusinessLine` substituirá o conceito inicial de `ResultCenter` no MVP.

Estrutura inicial esperada:

- Projetos de Engenharia;
- Integração de Sistemas;
- Manutenção Industrial;
- Painéis Elétricos e Automação;
- Fornecimento de Equipamentos;
- Fornecimento de Materiais.

Projetos permanecerão como dimensão independente.

Isso permitirá comparar receita, margem, backlog, capital de giro e geração de caixa por linha de negócio sem confundir a linha de negócio com um projeto individual.

## Rateio

Um mesmo documento poderá possuir múltiplas alocações.

Exemplo:

```text
Conta a pagar: R$ 20.000

R$ 12.000 → Projeto A / Integração de Sistemas / Engenharia
R$  5.000 → Projeto B / Projetos de Engenharia / Engenharia
R$  3.000 → Administrativo / sem projeto
```

As regras deverão garantir conservação do valor total.

## ResultCenter

`ResultCenter` não fará parte do MVP enquanto `BusinessLine` e `Project` atenderem às necessidades de análise de resultado.

Ele poderá ser reintroduzido futuramente caso surja uma necessidade organizacional distinta dessas duas dimensões.

## Impacto nos relatórios

A estrutura permitirá gerar a mesma base financeira por diferentes perspectivas:

- DRE consolidada;
- DRE por linha de negócio;
- margem por projeto;
- resultado por cliente;
- custo por centro de custo;
- despesas fixas e variáveis;
- custos diretos e indiretos;
- fluxo de caixa operacional, de investimento e financiamento;
- capital de giro por projeto e linha de negócio;
- indicadores para valuation.

## Consequências

### Positivas

- maior capacidade analítica;
- rateio nativo;
- DRE e fluxo de caixa semanticamente corretos;
- melhor análise de projetos;
- melhor suporte a controladoria e valuation;
- plano de contas mais enxuto e sustentável.

### Negativas

- maior número de dimensões;
- necessidade de validações de rateio;
- interface de classificação mais sofisticada;
- necessidade de defaults e sugestões para evitar excesso de trabalho operacional.

## Regra final

> O plano de contas gerencial descreverá a natureza do valor. Projeto, linha de negócio, centro de custo e características analíticas serão dimensões independentes, combinadas por alocações financeiras, permitindo múltiplas visões gerenciais sobre a mesma fonte transacional.
