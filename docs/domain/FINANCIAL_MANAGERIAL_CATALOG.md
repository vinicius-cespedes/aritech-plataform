# Financial Managerial Catalog

## Status

**Estado:** proposta inicial para seed e validação operacional  
**Origem:** categorias financeiras históricas utilizadas pela Aritech, reorganizadas conforme `ADR-013-managerial-financial-classification.md`.

## 1. Objetivo

Este documento registra a primeira taxonomia gerencial da Plataforma Aritech. O catálogo preserva as categorias operacionais já utilizadas pela empresa, mas separa resultado econômico, fluxo de caixa e dimensões analíticas.

O catálogo não substitui o plano contábil legal.

## 2. Dimensões principais

Cada alocação financeira poderá combinar:

- conta gerencial;
- natureza econômica;
- grupo de DRE;
- grupo de fluxo de caixa;
- comportamento fixo/variável;
- direto/indireto;
- centro de custo;
- linha de negócio;
- projeto;
- contrato.

## 3. Linhas de negócio iniciais

| Código | Linha de negócio |
|---|---|
| BL-ENG | Projetos de Engenharia |
| BL-INT | Integração de Sistemas |
| BL-MNT | Manutenção Industrial |
| BL-PNL | Painéis Elétricos e Automação |
| BL-EQP | Fornecimento de Equipamentos |
| BL-MAT | Fornecimento de Materiais |

## 4. Centros de custo iniciais

| Código | Centro de custo |
|---|---|
| CC-ENG | Engenharia |
| CC-PRD | Produção |
| CC-CMP | Compras |
| CC-COM | Comercial |
| CC-MKT | Marketing |
| CC-FIN | Financeiro |
| CC-ADM | Administrativo |
| CC-DIR | Diretoria |

## 5. Estrutura gerencial da DRE

```text
Receita Bruta
├── Receitas de Serviços
└── Receitas de Fornecimentos

(-) Impostos e Deduções sobre Receita
= Receita Líquida

(-) Custos Diretos
= Margem Bruta

(-) Despesas Operacionais
├── Pessoal
├── Administrativas
├── Comerciais
└── Operacionais
= EBITDA Gerencial

(+/-) Resultado Financeiro
├── Receitas Financeiras
└── Despesas Financeiras

= Resultado Gerencial
```

Itens de investimento, financiamento, patrimônio e transferências não entram na DRE operacional apenas por movimentarem caixa.

## 6. Estrutura gerencial do fluxo de caixa

```text
Atividades Operacionais
├── Recebimentos de Clientes
├── Fornecedores e Custos Diretos
├── Pessoal
├── Tributos
├── Despesas Administrativas
├── Despesas Comerciais
└── Outras Operações

Atividades de Investimento
├── Aplicações / Investimentos
└── Resgates / Alienações

Atividades de Financiamento
├── Empréstimos Recebidos
├── Amortizações
├── Aportes de Sócios
└── Distribuições / Retiradas

Transferências Internas
Ajustes
```

## 7. Receitas operacionais

| Código sugerido | Conta gerencial | Natureza | DRE | Caixa |
|---|---|---|---|---|
| REV-SRV-ENG | Projeto de Engenharia | OPERATING_REVENUE | Receitas de Serviços | Recebimentos de Clientes |
| REV-SRV-INT | Integração de Sistemas | OPERATING_REVENUE | Receitas de Serviços | Recebimentos de Clientes |
| REV-SRV-MNT | Manutenção Industrial | OPERATING_REVENUE | Receitas de Serviços | Recebimentos de Clientes |
| REV-SUP-PNL | Painéis Elétricos e Automação | OPERATING_REVENUE | Receitas de Fornecimentos | Recebimentos de Clientes |
| REV-SUP-EQP | Equipamentos | OPERATING_REVENUE | Receitas de Fornecimentos | Recebimentos de Clientes |
| REV-SUP-MAT | Materiais | OPERATING_REVENUE | Receitas de Fornecimentos | Recebimentos de Clientes |

A categoria histórica **Venda de equipamento** será tratada como receita de fornecimento quando se referir à atividade comercial normal. Venda de ativo imobilizado deverá utilizar classificação própria futuramente.

## 8. Pessoal

Categorias históricas preservadas ou consolidadas:

- Salários;
- Férias;
- Vale-Alimentação;
- Plano de Saúde Colaboradores;
- Seguro de Vida;
- Exames Médicos;
- Uniformes;
- Adiantamento Salarial;
- Pró-Labore;
- Pensão Alimentícia.

FGTS, INSS e IRRF relacionados à folha deverão permanecer identificáveis, mas sua apresentação gerencial será associada à dimensão de pessoal/encargos, não confundida com impostos sobre faturamento.

`Adiantamento Salarial` representa antecipação/compensação financeira e não uma nova despesa quando o custo salarial já tiver sido reconhecido.

## 9. Estrutura e despesas administrativas

Categorias iniciais:

- Água e Saneamento;
- Aluguel;
- Energia Elétrica;
- Honorários Contábeis;
- Telefonia e Internet;
- Telefonia Móvel;
- Vigilância e Segurança;
- Alvará de Funcionamento;
- Materiais de Escritório;
- Softwares;
- Infraestrutura;
- Correios / Sedex;
- Jurídico.

`Correios` e `Sedex` deverão ser consolidados preferencialmente em uma conta gerencial única, mantendo a descrição da transação para detalhamento.

## 10. Operação, engenharia e produção

Categorias iniciais:

- Ferramentas;
- Computadores e Periféricos;
- CREA;
- Cursos e Treinamentos;
- Materiais Aplicados em Máquinas;
- Materiais Aplicados na Prestação de Serviços;
- Leasing de Máquinas e Equipamentos;
- Manutenção de Veículos;
- Importação;
- P&D;
- SMS.

A conta não determinará sozinha se o valor é custo direto ou despesa indireta. A alocação do lançamento definirá o tratamento efetivo.

## 11. Viagens e mobilização

Categorias iniciais:

- Hospedagem;
- Aluguel de Carro;
- Combustíveis;
- Pedágios;
- Lanches e Refeições;
- Viagens e Representações.

Exemplo de uso:

```text
Hospedagem + Projeto + BL-INT + CC-ENG + DIRECT
→ custo direto do projeto
```

ou:

```text
Hospedagem + sem projeto + CC-COM + INDIRECT
→ despesa comercial
```

## 12. Comercial e marketing

Categorias iniciais:

- Marketing e Publicidade;
- Anúncio de Vaga no LinkedIn, quando relacionado a recrutamento;
- Viagens e Representações, quando de natureza comercial.

O contexto da alocação determinará centro de custo e tratamento final.

## 13. Logística e fornecimentos

Categorias iniciais:

- Transporte de Mercadorias Vendidas;
- Fretes;
- Importação;
- Materiais Aplicados em Máquinas;
- Materiais Aplicados na Prestação de Serviços.

Quando diretamente associados a contrato/projeto, deverão alimentar a margem do respectivo projeto.

## 14. Resultado financeiro

### Receitas financeiras

- Rendimentos de Aplicações;
- Juros Recebidos.

### Despesas financeiras

- Juros de Conta Garantida;
- Tarifas Bancárias;
- Tarifas de Cartões de Crédito;
- Tarifas de Negativação;
- juros de empréstimos e financiamentos.

`Empréstimo Bancário` não é receita financeira. Apenas juros e rendimentos afetam o resultado financeiro.

## 15. Financiamentos

Categorias históricas como:

- Empréstimos de Bancos;
- Empréstimos de Instituições;
- Empréstimos de Outras Instituições;

serão tratadas como `FINANCING`.

O catálogo deverá distinguir pelo menos:

- Empréstimos Recebidos;
- Amortização de Empréstimos.

O principal recebido ou amortizado afeta caixa e dívida, mas não a DRE gerencial.

## 16. Investimentos

Categorias:

- Aplicações / Investimentos;
- Resgate de Investimentos;
- Capitalização, quando representar aplicação de recursos.

A aplicação e o resgate do principal são movimentos de investimento. O rendimento correspondente é receita financeira.

## 17. Sócios e patrimônio

`Aporte Financeiro` será tratado como `EQUITY` quando representar aporte de sócios, e não como receita ou despesa.

`Retirada de Lucro` será tratada como distribuição aos sócios, com impacto no caixa e patrimônio, sem reduzir EBITDA ou resultado operacional do período.

## 18. Tributos e encargos

Categorias históricas:

- Simples Nacional - DAS;
- DARE;
- FGTS e Multa de FGTS;
- INSS sobre Salários - GPS;
- IRRF sobre Salários.

A classificação gerencial deverá distinguir:

- imposto sobre faturamento;
- encargos de pessoal;
- outros tributos/taxas.

`Multas de Trânsito` não serão classificadas como imposto; serão despesa operacional extraordinária ou administrativa conforme o contexto.

## 19. Ajustes e estornos

Categorias históricas:

- Estorno de Seguro de Empréstimo;
- Estorno de Material Comprado;
- Diferença no Controle.

Serão classificadas como `ADJUSTMENT` quando não puderem ser associadas diretamente à reversão do lançamento original.

Sempre que possível, estornos deverão referenciar e reverter a operação original, evitando inflar receitas ou despesas.

## 20. Indefinido

A categoria histórica `Indefinido` não será uma conta gerencial oficial.

Movimentações ainda não identificadas permanecerão em estado de classificação pendente e deverão ser resolvidas antes do fechamento quando ultrapassarem os critérios de materialidade.

## 21. Regras de uso

1. Conta gerencial responde **o que é**.
2. Centro de custo responde **qual área é responsável**.
3. Linha de negócio responde **qual negócio econômico**.
4. Projeto e contrato identificam **onde o resultado foi gerado/consumido**.
5. Fixo/variável é atributo, não grupo principal do plano.
6. Direto/indireto é atributo da alocação.
7. DRE e fluxo de caixa possuem classificações independentes.
8. Entradas de financiamento, aportes e resgates não são receitas operacionais.
9. Saídas para amortização, investimento e distribuição de lucros não são despesas operacionais.
10. Um documento poderá ser rateado entre múltiplas alocações.

## 22. Próximo passo

Após validação operacional deste catálogo, ele deverá ser transformado em seed idempotente do Prisma para popular:

- `DreGroup`;
- `CashFlowGroup`;
- `BusinessLine`;
- `CostCenter`;
- `ManagementAccount`.
