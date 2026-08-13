ADR-007 — Financial Amounts and Rounding

Status

Estado: Accepted
Data: 2026-08-13
Escopo: domínio financeiro
Relacionados:

- "docs/domain/FINANCIAL_DOMAIN.md"
- "docs/domain/FINANCIAL_MODEL.md"
- "docs/domain/FINANCIAL_RULES.md"
- "docs/adr/ADR-003-postgresql-and-prisma.md"

---

1. Contexto

O domínio financeiro da Plataforma Aritech deverá manipular valores relacionados a:

- contas a pagar;
- contas a receber;
- pagamentos;
- recebimentos;
- parcelas;
- impostos;
- retenções;
- juros;
- multas;
- descontos;
- contratos;
- pedidos de compra;
- orçamentos;
- margens;
- fluxo de caixa;
- DRE;
- indicadores financeiros;
- valuation.

Valores monetários exigem comportamento determinístico.

Pequenas diferenças de arredondamento podem gerar inconsistências entre:

- parcelas;
- pagamentos;
- recebimentos;
- conciliações;
- saldos;
- DRE;
- relatórios;
- integrações bancárias.

A utilização de tipos de ponto flutuante binário, como "float" ou "double", pode introduzir erros de representação.

Exemplo conceitual:

0.1 + 0.2 != 0.3

em determinadas representações binárias.

Para um sistema financeiro, esse comportamento é inadequado.

Também é necessário definir como distribuir diferenças de centavos em operações como:

- parcelamento;
- rateio;
- retenções;
- percentuais;
- impostos;
- descontos.

Sem uma política central, diferentes partes da aplicação poderiam produzir resultados distintos para a mesma operação.

---

2. Decisão

A Plataforma Aritech adotará representação decimal exata para valores monetários.

Será utilizado:

PostgreSQL NUMERIC

mapeado no Prisma por:

Decimal

Valores monetários não poderão ser persistidos utilizando:

Float
Double
Real

ou equivalentes de ponto flutuante binário.

---

3. Precisão monetária

A precisão padrão para valores monetários será:

NUMERIC(19,4)

onde:

- "19" representa a quantidade total máxima de dígitos;
- "4" representa a quantidade máxima de casas decimais persistidas.

Essa escolha permite armazenar valores superiores às necessidades previsíveis da plataforma, mantendo precisão adicional para cálculos internos.

Exemplo:

999999999999999.9999

A aplicação poderá exibir apenas duas casas decimais para BRL quando apropriado.

A persistência com quatro casas evita perda prematura de precisão em:

- rateios;
- percentuais;
- impostos;
- cálculos de margem;
- juros;
- retenções.

---

4. Valores exibidos

Para valores expressos em reais, a interface normalmente apresentará:

R$ 1.234,56

Entretanto, a representação interna poderá permanecer:

1234.5600

A camada de apresentação será responsável pela formatação.

A formatação visual nunca deverá alterar o valor persistido.

---

5. Moeda

Valores monetários conceitualmente deverão ser representados pelo objeto de valor:

Money

composto por:

amount
currency

Exemplo:

Money {
    amount: 15000.0000
    currency: BRL
}

No MVP, a moeda operacional padrão será:

BRL

O modelo deverá evitar pressupor implicitamente que todo valor do sistema será eternamente BRL.

---

6. Operações entre moedas

Operações aritméticas diretas entre moedas diferentes não serão permitidas.

Exemplo inválido:

BRL 100
+
USD 100

Antes da operação será necessária conversão explícita.

O suporte completo a multimoeda não faz parte do MVP.

Quando implementado, deverá existir ADR específico cobrindo:

- fonte da taxa;
- data da taxa;
- moeda funcional;
- moeda da transação;
- ganhos cambiais;
- perdas cambiais;
- arredondamento cambial.

---

7. Política de arredondamento

A Plataforma Aritech utilizará como política padrão:

ROUND_HALF_EVEN

também conhecida como:

Banker's Rounding

O arredondamento ocorre para o número par mais próximo quando o valor estiver exatamente no meio entre duas possibilidades.

Exemplos com duas casas:

1.225 -> 1.22
1.235 -> 1.24

Essa política reduz viés acumulado em grandes conjuntos de operações.

---

8. Centralização da regra

A aplicação deverá possuir uma implementação única da política de arredondamento.

Não deverá haver chamadas arbitrárias como:

Math.round()

espalhadas pelo código.

As operações financeiras deverão utilizar abstrações do domínio.

Exemplo conceitual:

Money.round()
Money.allocate()
Money.percentage()

ou serviço equivalente.

---

9. Momento do arredondamento

O arredondamento deverá ocorrer o mais tarde possível.

Preferir:

valor original
↓
cálculos intermediários com precisão ampliada
↓
resultado financeiro
↓
arredondamento

Evitar:

calcular
↓
arredondar
↓
calcular novamente
↓
arredondar novamente

Arredondamentos sucessivos aumentam o risco de diferença acumulada.

---

10. Escala operacional

A escala padrão persistida será de quatro casas decimais.

Entretanto, determinadas operações poderão utilizar precisão temporária maior durante o cálculo.

Exemplo:

percentual = 3.33333333%

O resultado não deverá ser truncado prematuramente antes da determinação do valor monetário final.

---

11. Parcelamento

A soma das parcelas deverá ser exatamente igual ao valor original da obrigação.

Regra:

Σ parcelas = valor original

Exemplo:

R$ 100,00 / 3

Resultado:

Parcela 1 = 33,33
Parcela 2 = 33,33
Parcela 3 = 33,34

Nunca:

33,33
33,33
33,33

porque resultaria em:

R$ 99,99

---

12. Distribuição de resíduos no parcelamento

A diferença residual será alocada de forma determinística.

Para parcelamentos financeiros comuns, a regra inicial será:

«A diferença residual será aplicada à última parcela.»

Exemplo:

Valor total = 10.000,00
Parcelas = 3

Resultado:

3.333,33
3.333,33
3.333,34

---

13. Razão da escolha da última parcela

A escolha da última parcela:

- preserva previsibilidade;
- é simples de explicar ao usuário;
- mantém as primeiras parcelas uniformes;
- facilita comparação com condições comerciais;
- elimina decisões arbitrárias.

Caso determinada integração externa utilize política diferente, deverá existir transformação explícita no boundary da integração.

---

14. Rateios percentuais

Rateios deverão preservar o total original.

Exemplo:

Despesa = R$ 10.000,00

Projeto A = 33,33%
Projeto B = 33,33%
Projeto C = 33,34%

Resultado:

Σ valores alocados = R$ 10.000,00

Diferenças residuais deverão seguir algoritmo determinístico.

---

15. Algoritmo de alocação

A recomendação para alocações será:

1. calcular o valor teórico de cada item com precisão ampliada;
2. arredondar cada parcela para a escala monetária necessária;
3. calcular diferença entre soma arredondada e total original;
4. distribuir o resíduo de forma determinística.

Para parcelamento simples:

última parcela

Para rateios mais complexos, poderá ser utilizado método do maior resto.

---

16. Percentuais

Percentuais não deverão ser armazenados como valores monetários.

A precisão recomendada deverá permitir percentuais fracionários.

Exemplo:

3.125000%

A implementação física poderá utilizar algo como:

NUMERIC(9,6)

A definição exata será realizada no schema Prisma.

---

17. Cálculo percentual

Exemplo:

Base = R$ 100.000,00
Taxa = 6,15%

Cálculo conceitual:

100000 × 0,0615 = 6150

Resultado:

R$ 6.150,00

O valor final deverá utilizar a política padrão de arredondamento.

---

18. Retenções

Retenções deverão preservar:

base de cálculo
alíquota
valor calculado

Exemplo:

base = 100000.0000
rate = 6.150000
amount = 6150.0000

Caso o valor informado pelo documento externo seja diferente do calculado, ambos poderão ser preservados.

Exemplo:

calculatedAmount
documentAmount

A política de prevalência dependerá do processo fiscal correspondente.

---

19. Juros

Juros calculados deverão utilizar precisão ampliada antes do arredondamento final.

Exemplo conceitual:

principal × taxa × período

A frequência e metodologia de juros deverão ser definidas pelo caso de uso ou contrato.

Este ADR não define:

- juros simples;
- juros compostos;
- convenção de dias;
- capitalização.

Ele define apenas como o valor resultante deverá ser representado e arredondado.

---

20. Multas

Multas percentuais seguirão a mesma política de cálculo monetário.

Exemplo:

principal = 10.000
multa = 2%

resultado = 200,00

O resultado deverá permanecer separado do principal.

---

21. Descontos

Descontos poderão ser:

- valor fixo;
- percentual.

Em ambos os casos, o valor calculado deverá utilizar a política deste ADR.

---

22. Valores líquidos

Valores líquidos não deverão ser armazenados como substitutos dos componentes.

Exemplo:

principal = 100.000
juros = 500
multa = 200
desconto = 1.000
retenções = 6.150

O sistema deverá preservar cada componente.

O valor líquido poderá ser derivado:

100000
+ 500
+ 200
- 1000
- 6150
=
93.550

A fórmula exata depende da operação.

---

23. Precisão de cálculos de margem

Cálculos como:

margem percentual =
lucro / receita

deverão utilizar precisão maior do que a utilizada para exibição.

Exemplo:

23.476218%

A interface poderá exibir:

23,48%

sem alterar o valor de origem.

---

24. DRE

A DRE deverá somar valores monetários já normalizados segundo esta política.

O arredondamento visual de cada linha não deverá causar alteração nos totais internos.

Diferenças apenas visuais de centavos poderão ocorrer quando a interface apresentar dados agregados com menor precisão.

Sempre que possível, os totais exibidos deverão ser calculados a partir do mesmo conjunto de valores já arredondados conforme a regra de negócio.

---

25. Fluxo de caixa

O fluxo de caixa deverá utilizar valores persistidos ou derivados com precisão decimal.

Projeções não poderão usar ponto flutuante binário.

Isso é especialmente importante em projeções de longo prazo contendo:

- centenas de movimentos;
- percentuais;
- ajustes;
- múltiplos cenários.

---

26. Saldos bancários

Saldos deverão ser calculados utilizando valores exatos.

Regra conceitual:

saldo =
saldo de abertura
+ créditos
- débitos

O cálculo não poderá introduzir diferenças devido à representação numérica.

---

27. Integrações bancárias

Valores recebidos de:

- OFX;
- CSV;
- API;
- Open Finance;

deverão ser convertidos diretamente para representação decimal.

Não deverão passar por representação "Number" quando isso puder introduzir perda de precisão.

---

28. JavaScript e TypeScript

O tipo nativo:

number

não deverá ser utilizado para aritmética financeira crítica.

Exemplo proibido:

const total = price * quantity;

quando "price" representar valor monetário em ponto flutuante.

A aplicação deverá utilizar:

- "Prisma.Decimal";
- biblioteca decimal adotada;
- objeto de valor "Money";
- abstração equivalente.

A escolha específica de biblioteca ficará vinculada à implementação da stack.

---

29. Fronteira da API

Valores monetários expostos pela API REST não deverão depender de interpretação de ponto flutuante do consumidor.

A representação recomendada será string decimal.

Exemplo:

{
  "amount": "12345.6700",
  "currency": "BRL"
}

Evitar:

{
  "amount": 12345.67
}

para contratos onde precisão financeira precisa ser preservada de ponta a ponta.

---

30. Entrada da API

A API deverá validar valores decimais recebidos.

Exemplo válido:

"10000.25"

Exemplos inválidos:

"10.000,25"
"R$ 10000,25"
"abc"

Formatação localizada pertence ao frontend.

---

31. Frontend

O frontend poderá aceitar entrada localizada:

10.000,25

mas deverá convertê-la antes de enviar à API:

10000.25

O frontend não deverá ser responsável por cálculos financeiros definitivos.

---

32. Formatação

A apresentação seguirá locale apropriado.

Para português brasileiro:

pt-BR

Exemplo:

12345.67

será exibido como:

R$ 12.345,67

---

33. Prisma

Exemplo conceitual:

amount Decimal @db.Decimal(19, 4)

Aplicável a campos como:

originalAmount
openAmount
principalAmount
interestAmount
penaltyAmount
discountAmount
withholdingAmount
openingBalance

A escala poderá variar para tipos não monetários.

---

34. PostgreSQL

A aplicação utilizará "NUMERIC", pois oferece precisão decimal arbitrária dentro da configuração definida.

Não serão utilizados para valores monetários:

REAL
DOUBLE PRECISION
MONEY

O tipo PostgreSQL "MONEY" não será adotado porque introduz dependências de locale e possui menor flexibilidade para o modelo de domínio.

---

35. Restrições no banco

Sempre que aplicável, deverão ser utilizadas constraints.

Exemplos:

amount > 0
open_amount >= 0
rate >= 0

Parte das invariantes continuará pertencendo ao domínio porque envolve múltiplas entidades e não pode ser representada apenas por constraints simples.

---

36. Comparação de valores

Comparações monetárias deverão utilizar valores decimais exatos.

Exemplo:

paymentAmount > installmentOpenAmount

não deverá possuir tolerância arbitrária devido a erro de ponto flutuante.

---

37. Tolerância financeira

Tolerâncias poderão existir apenas quando justificadas pelo processo de negócio.

Exemplo:

diferença de conciliação permitida

Essa tolerância é diferente de erro de precisão computacional.

Nunca deverá ser utilizada tolerância para mascarar erro numérico da aplicação.

---

38. Valores nulos

"null" e zero possuem significados diferentes.

Exemplo:

discount = null

pode significar:

«não informado ou não aplicável»

enquanto:

discount = 0

significa:

«valor explicitamente zero»

A escolha deverá respeitar a semântica de cada entidade.

---

39. Valor zero

Obrigações e parcelas financeiras normalmente não poderão possuir valor zero.

Entretanto, campos componentes poderão possuir:

0.0000

Exemplos:

- juros;
- multa;
- desconto;
- retenção.

---

40. Testes obrigatórios

A política monetária deverá possuir testes automatizados.

Casos mínimos:

Soma decimal

0,10 + 0,20 = 0,30

---

Parcelamento

100 / 3

33,33
33,33
33,34

---

Grande valor

999.999.999,99

deverá ser manipulado sem perda.

---

Percentual

100.000 × 6,15% = 6.150

---

Arredondamento HALF_EVEN

1,225 -> 1,22
1,235 -> 1,24

---

Rateio

Σ allocations = originalAmount

---

Pagamento parcial

100.000 - 40.000 = 60.000

---

Estorno

60.000 + 40.000 = 100.000

---

41. Testes de propriedade

Futuramente poderão ser utilizados property-based tests para garantir invariantes como:

Σ parcelas = total

para grande quantidade de valores e números de parcelas.

Também:

saldo nunca < 0

e:

allocate(total) conserva total

---

42. Alternativas consideradas

Alternativa A — armazenar centavos como integer

Exemplo:

R$ 100,25
=
10025

Vantagens

- operações inteiras;
- ausência de ponto flutuante;
- simplicidade em moedas com duas casas.

Desvantagens

- menor flexibilidade para cálculos de quatro ou mais casas;
- multimoeda mais complexa;
- maior necessidade de conversões;
- rateios e percentuais exigem cuidado adicional.

Decisão

Não adotada como estratégia principal.

---

Alternativa B — Decimal com duas casas

NUMERIC(19,2)

Vantagens

- simples;
- suficiente para valores finais em BRL.

Desvantagens

- perda prematura de precisão em cálculos;
- rateios e impostos podem exigir casas adicionais;
- necessidade de cálculos temporários externos à persistência.

Decisão

Não adotada.

---

Alternativa C — Float / Double

Vantagens

- suporte nativo;
- desempenho;
- simplicidade aparente.

Desvantagens

- imprecisão binária;
- inconsistência acumulada;
- inadequado para domínio financeiro.

Decisão

Rejeitada.

---

43. Consequências positivas

A decisão proporciona:

- cálculos determinísticos;
- consistência entre backend e banco;
- parcelamentos exatos;
- conciliação confiável;
- menor risco de diferenças de centavos;
- suporte futuro a cálculos avançados;
- maior rastreabilidade;
- melhor suporte a testes.

---

44. Consequências negativas

A decisão também implica:

- necessidade de biblioteca ou abstração decimal;
- maior cuidado no frontend;
- serialização por string em APIs;
- código um pouco mais explícito;
- atenção especial em conversões de bibliotecas externas.

Esses custos são aceitáveis diante da criticidade do domínio financeiro.

---

45. Impacto no banco de dados

O "schema.prisma" deverá utilizar tipos compatíveis com esta decisão.

Exemplo:

Decimal @db.Decimal(19, 4)

Não deverá haver campos monetários utilizando "Float".

---

46. Impacto na API

A OpenAPI deverá representar valores financeiros preferencialmente como:

type: string
pattern decimal

acompanhados da moeda quando necessário.

---

47. Impacto no frontend

O frontend deverá:

- formatar valores;
- converter inputs locais;
- evitar cálculos críticos usando "number";
- receber valores decimais como string;
- utilizar biblioteca decimal quando precisar calcular valores para pré-visualização.

O backend continuará sendo a autoridade final.

---

48. Impacto nos relatórios

Relatórios deverão utilizar a mesma política.

Exportações em:

- CSV;
- XLSX;
- PDF;

deverão preservar o valor numérico correto independentemente da formatação visual.

---

49. Impacto em valuation

Como indicadores de valuation serão derivados de:

- receita;
- EBITDA;
- margem;
- fluxo de caixa;
- crescimento;

a consistência monetária definida neste ADR deverá ser preservada em todas as séries históricas utilizadas pelos cálculos.

---

50. Regra final

O princípio central deste ADR é:

«Valores financeiros deverão ser armazenados e calculados utilizando representação decimal exata, com uma política única e determinística de arredondamento.»

Nenhuma camada da Plataforma Aritech poderá substituir essa regra por aritmética de ponto flutuante por conveniência local.

---

51. Próximo passo

O próximo ADR recomendado é:

docs/adr/ADR-008-financial-period-closing.md

Ele deverá definir:

- conceito de período;
- fechamento;
- bloqueios;
- validações;
- competência;
- caixa;
- reabertura;
- ajustes retroativos;
- estornos em períodos fechados;
- versionamento de fechamento;
- permissões.