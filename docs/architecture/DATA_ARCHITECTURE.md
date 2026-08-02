# Arquitetura de Dados da Plataforma Aritech

## 1. Objetivo

Este documento define os princípios, estruturas e regras da arquitetura de dados
da Plataforma Aritech.

A arquitetura deverá permitir:

- centralizar os dados corporativos;
- evitar duplicidades;
- preservar o histórico das informações;
- rastrear a origem de cada lançamento;
- integrar dados financeiros, comerciais e operacionais;
- apoiar o fluxo de caixa;
- gerar informações gerenciais;
- sustentar o valuation da empresa;
- medir os impactos das iniciativas de transformação digital;
- permitir futuras integrações com sistemas externos.

Este documento apresenta o modelo conceitual inicial da plataforma.

O modelo lógico e o modelo físico do banco de dados serão elaborados
posteriormente, antes da implementação dos módulos.

---

## 2. Princípios da arquitetura de dados

A arquitetura de dados será orientada pelos seguintes princípios:

1. fonte única de informação;
2. rastreabilidade;
3. integridade referencial;
4. histórico de alterações;
5. segregação por domínio;
6. reutilização de dados mestres;
7. registro da origem;
8. controle de acesso;
9. auditabilidade;
10. evolução incremental;
11. ausência de exclusão física para dados críticos;
12. separação entre dados operacionais e consolidados;
13. independência entre regras de negócio e tecnologia;
14. versionamento de informações relevantes;
15. proteção de dados pessoais e informações sensíveis.

---

## 3. Banco de dados principal

O PostgreSQL será utilizado como banco de dados relacional principal.

O banco deverá armazenar:

- cadastros;
- relacionamentos;
- transações;
- configurações;
- estados dos processos;
- metadados de documentos;
- históricos;
- registros de auditoria;
- resultados consolidados;
- premissas e versões de valuation.

Arquivos como contratos, propostas, notas fiscais, boletos, comprovantes,
planilhas e documentos técnicos não deverão ser armazenados diretamente no
banco principal.

Esses arquivos serão mantidos em serviço de armazenamento de objetos, enquanto
o banco armazenará seus metadados e vínculos.

---

## 4. Organização dos dados por domínio

Os dados serão organizados conforme os módulos da plataforma:

- Identidade e Acesso;
- Organização e Cadastros;
- Marketing e Geração de Demanda;
- Comercial;
- Contratos e Projetos;
- Financeiro;
- Compras;
- Controladoria;
- Pessoas;
- Produção e Execução;
- Documentos;
- Indicadores;
- Valuation;
- Notificações;
- Integrações;
- Administração e Auditoria.

Cada domínio deverá ser responsável pelas suas entidades e regras.

Um módulo não deverá alterar diretamente dados internos de outro módulo sem
utilizar um serviço, comando ou contrato autorizado.

---

## 5. Convenções gerais

### 5.1 Identificadores

Cada registro deverá possuir um identificador interno único.

Recomenda-se a utilização de UUID como identificador principal das entidades.

Exemplo:

```text
id: 5cf09b83-c51c-4363-8403-b43c7b930be1
Identificadores internos não deverão depender:

do nome do cliente;
do CNPJ;
do número do contrato;
do código do projeto;
do número da nota fiscal;
de códigos de sistemas externos.

Esses valores deverão ser armazenados como atributos ou identificadores
alternativos.

5.2 Datas e horários

Datas e horários deverão ser armazenados com referência de fuso horário quando
representarem eventos do sistema.

Os registros deverão possuir, no mínimo:

data de criação;
data da última alteração;
usuário responsável pela criação;
usuário responsável pela alteração.

Quando aplicável, também deverão possuir:

data de competência;
data de emissão;
data de vencimento;
data de previsão;
data de liquidação;
data de cancelamento;
data de aprovação;
data de integração.
5.3 Valores monetários

Valores financeiros deverão ser armazenados utilizando tipos decimais exatos.

Não deverão ser utilizados tipos de ponto flutuante para valores monetários.

Cada valor monetário deverá considerar:

valor;
moeda;
taxa de conversão, quando aplicável;
data de referência da taxa;
valor convertido para moeda-base, quando necessário.

A moeda-base inicial da plataforma será o real brasileiro.

5.4 Estados e situações

Estados de processo deverão utilizar códigos padronizados.

Exemplos:

RASCUNHO;
PENDENTE;
EM_APROVACAO;
APROVADO;
REJEITADO;
CANCELADO;
PARCIAL;
LIQUIDADO;
ENCERRADO.

Os estados não deverão ser armazenados apenas como textos livres.

5.5 Exclusão lógica

Dados relevantes não deverão ser fisicamente excluídos.

Quando aplicável, os registros deverão possuir:

situação ativa ou inativa;
data de inativação;
usuário responsável;
motivo;
vínculo com registro de auditoria.

Operações financeiras liquidadas, documentos aprovados, contratos e versões de
valuation não poderão ser apagados fisicamente por usuários comuns.

6. Dados mestres

Dados mestres são informações reutilizadas por vários módulos.

Os principais dados mestres da Plataforma Aritech serão:

empresa;
pessoa;
cliente;
fornecedor;
colaborador;
contato;
endereço;
conta bancária;
centro de custo;
unidade de negócio;
área;
categoria financeira;
conta gerencial;
condição de pagamento;
moeda;
imposto;
retenção;
serviço;
material;
usuário;
perfil;
projeto;
contrato.

Os dados mestres deverão possuir responsáveis definidos e regras para prevenção
de duplicidade.

7. Entidade Pessoa

A entidade Pessoa representará pessoas físicas e jurídicas relacionadas à
plataforma.

Uma pessoa poderá assumir um ou mais papéis:

cliente;
fornecedor;
colaborador;
contato;
parceiro;
prestador de serviço;
consultor;
responsável externo.
7.1 Atributos conceituais
identificador;
tipo de pessoa;
nome ou razão social;
nome fantasia;
CPF ou CNPJ;
inscrição estadual;
inscrição municipal;
situação cadastral;
observações;
data de criação;
data de alteração.
7.2 Relacionamentos

Uma pessoa poderá possuir:

diversos endereços;
diversos contatos;
diversas contas bancárias;
diversos documentos;
diversos papéis;
relacionamento com contratos;
relacionamento com projetos;
relacionamento com títulos financeiros.
7.3 Regra de unicidade

CPF e CNPJ deverão ser únicos por pessoa ativa, salvo exceções justificadas e
auditadas.

8. Entidade Empresa

A entidade Empresa representará a organização operada pela plataforma.

Na primeira fase, a Aritech será a única empresa cadastrada como organização
principal.

A arquitetura deverá, entretanto, permitir futura utilização por:

filiais;
outras empresas do grupo;
unidades juridicamente distintas.
8.1 Atributos conceituais
identificador;
razão social;
nome fantasia;
CNPJ;
regime tributário;
moeda-base;
endereço principal;
situação;
parâmetros financeiros;
parâmetros administrativos.
8.2 Regra de segregação

As entidades transacionais deverão possuir vínculo com a empresa responsável,
sempre que aplicável.

Isso permitirá futura segregação de dados por organização.

9. Entidade Cliente

Cliente será um papel atribuído a uma Pessoa.

9.1 Atributos conceituais
identificador;
pessoa relacionada;
código interno;
responsável comercial;
condição de pagamento padrão;
limite de crédito, quando aplicável;
situação;
segmento;
origem;
observações.
9.2 Relacionamentos

Um cliente poderá possuir:

leads;
oportunidades;
propostas;
contratos;
projetos;
contas a receber;
documentos;
contatos;
indicadores comerciais.
10. Entidade Fornecedor

Fornecedor será um papel atribuído a uma Pessoa.

10.1 Atributos conceituais
identificador;
pessoa relacionada;
código interno;
categoria;
condição de pagamento padrão;
dados bancários;
situação;
avaliação;
observações.
10.2 Relacionamentos

Um fornecedor poderá possuir:

cotações;
propostas;
pedidos de compra;
contas a pagar;
documentos fiscais;
avaliações;
contratos de fornecimento.
11. Estrutura organizacional

A estrutura organizacional será representada por:

empresa;
unidade de negócio;
área;
centro de custo;
centro de resultado.
11.1 Unidade de negócio

Representa uma divisão gerencial da empresa.

Exemplos futuros:

Engenharia;
Integração de Sistemas;
Montagem de Painéis;
Manutenção Industrial;
Serviços de Campo.
11.2 Área

Representa uma área funcional.

Exemplos:

Financeiro;
Comercial;
Marketing;
Compras;
Engenharia;
Produção;
Administrativo.
11.3 Centro de custo

Representa uma unidade de acumulação de despesas e custos.

Um centro de custo poderá estar relacionado:

a uma área;
a uma unidade de negócio;
a um projeto;
à administração geral.
11.4 Centro de resultado

Representa uma dimensão utilizada para apuração de resultado.

Poderá corresponder a:

unidade de negócio;
projeto;
contrato;
carteira de serviços;
outro agrupamento gerencial.
12. Marketing e geração de demanda
12.1 Campanha

A entidade Campanha representará uma iniciativa planejada de marketing.

Atributos conceituais:

identificador;
nome;
objetivo;
período;
orçamento;
valor realizado;
canal principal;
público-alvo;
responsável;
situação;
descrição;
indicadores esperados.
12.2 Canal de marketing

Representará o canal utilizado para divulgação ou geração de demanda.

Exemplos:

site;
Google Ads;
LinkedIn;
Instagram;
indicação;
evento;
e-mail;
prospecção ativa;
parceiro comercial.
12.3 Conteúdo

Representará um material ou publicação.

Atributos conceituais:

título;
tipo;
tema;
formato;
canal;
endereço externo;
data de publicação;
campanha;
responsável;
situação.
12.4 Anúncio

Representará uma peça de mídia paga.

Deverá registrar:

plataforma;
campanha;
grupo de anúncios;
nome;
período;
orçamento;
investimento realizado;
identificador externo;
situação.
12.5 Lead

Representará uma pessoa ou empresa potencialmente interessada nos serviços da
Aritech.

Atributos conceituais:

identificador;
pessoa relacionada, quando identificada;
nome;
empresa;
e-mail;
telefone;
cargo;
origem;
canal;
campanha;
conteúdo;
anúncio;
data de entrada;
situação;
classificação;
responsável;
consentimentos aplicáveis.
12.6 Pontos de contato

Cada interação de marketing deverá poder ser registrada como um ponto de contato.

Exemplos:

visita ao site;
preenchimento de formulário;
clique em anúncio;
abertura de e-mail;
participação em evento;
contato por rede social;
download de conteúdo.

Um lead poderá possuir vários pontos de contato.

A arquitetura deverá preservar esse histórico para análises de atribuição.

13. Comercial
13.1 Oportunidade

Representará uma possibilidade concreta de negócio.

Atributos conceituais:

identificador;
cliente;
lead de origem;
campanha de origem;
responsável comercial;
título;
descrição;
valor estimado;
moeda;
probabilidade;
etapa;
previsão de fechamento;
situação;
motivo de perda, quando aplicável.
13.2 Etapa comercial

Representará uma fase do funil.

Exemplos:

identificação;
qualificação;
levantamento de requisitos;
elaboração de proposta;
negociação;
aguardando decisão;
ganha;
perdida.
13.3 Proposta

Representará uma oferta comercial apresentada ao cliente.

Atributos conceituais:

identificador;
oportunidade;
cliente;
número;
revisão;
data de emissão;
validade;
valor;
moeda;
escopo resumido;
condição de pagamento;
situação.
13.4 Revisão da proposta

Uma proposta não deverá ter seu histórico sobrescrito.

Cada revisão deverá manter:

número da revisão;
data;
responsável;
valores;
condições;
descrição das alterações;
documento associado;
situação.
13.5 Conversão comercial

Quando uma oportunidade for conquistada, deverá ser criado ou vinculado:

contrato;
projeto;
previsão de receita;
cronograma de faturamento.

O vínculo com o lead, campanha e canal de origem deverá ser preservado.

14. Contratos e projetos
14.1 Contrato

Representará o instrumento comercial firmado com o cliente.

Atributos conceituais:

identificador;
empresa;
cliente;
oportunidade de origem;
número interno;
número do cliente;
descrição;
valor original;
valor atualizado;
moeda;
data de assinatura;
data de início;
data de término;
condição de pagamento;
situação;
responsável;
retenções;
garantias.
14.2 Aditivo

Representará alteração formal no contrato.

Poderá alterar:

valor;
prazo;
escopo;
condição de pagamento;
quantidade;
responsabilidade;
cronograma.

Cada aditivo deverá registrar:

número;
data;
tipo;
valor;
impacto no prazo;
descrição;
documento;
responsável;
aprovação.
14.3 Projeto

Representará a unidade de execução e controle gerencial.

Atributos conceituais:

identificador;
código;
nome;
contrato;
cliente;
gerente;
centro de custo;
unidade de negócio;
data de início;
data prevista de término;
situação;
orçamento;
moeda;
margem prevista.
14.4 Relação entre contrato e projeto

Um contrato poderá possuir um ou mais projetos.

Um projeto deverá estar relacionado a apenas um contrato principal na primeira
versão, salvo definição posterior.

Contratos internos ou projetos sem contrato externo poderão ser permitidos,
desde que classificados.

14.5 Marco contratual

Representará uma obrigação ou evento relevante do contrato.

Exemplos:

aprovação de projeto;
entrega de painel;
realização de FAT;
emissão de medição;
comissionamento;
aceite final.

Um marco poderá estar vinculado:

a uma data;
a uma entrega;
a um faturamento;
a um recebimento;
a uma aprovação.
15. Orçamento de projeto

O orçamento deverá permitir comparar:

valor original;
valor revisado;
valor previsto;
valor comprometido;
valor realizado.
15.1 Estrutura do orçamento

O orçamento poderá ser dividido por:

categoria;
etapa;
centro de custo;
recurso;
material;
serviço;
período;
fornecedor previsto.
15.2 Versões do orçamento

Alterações relevantes deverão gerar novas versões.

Cada versão deverá registrar:

data;
responsável;
justificativa;
valores;
premissas;
situação de aprovação.

O orçamento aprovado não deverá ser sobrescrito.

16. Compras
16.1 Solicitação de compra

Representará a necessidade de aquisição de material ou serviço.

Deverá registrar:

solicitante;
projeto;
centro de custo;
itens;
quantidade;
necessidade;
prazo;
justificativa;
situação;
aprovações.
16.2 Cotação

Representará o processo de obtenção de propostas de fornecedores.

Uma cotação poderá possuir:

vários fornecedores;
vários itens;
moedas distintas;
condições de pagamento distintas;
prazos de entrega distintos;
análise técnica;
análise comercial.
16.3 Pedido de compra

Representará o compromisso formal de aquisição.

Atributos conceituais:

identificador;
fornecedor;
projeto;
centro de custo;
moeda;
valor;
condição de pagamento;
data;
prazo de entrega;
situação;
aprovadores.
16.4 Compromisso financeiro

A aprovação de um pedido de compra deverá gerar um compromisso financeiro.

Esse compromisso deverá ser considerado no fluxo de caixa comprometido antes do
recebimento da nota fiscal.

16.5 Recebimento

O recebimento poderá ser:

total;
parcial;
de material;
de serviço.

O recebimento não implicará necessariamente pagamento.

17. Arquitetura dos dados financeiros

Os dados financeiros serão estruturados a partir dos documentos e eventos que
originaram cada obrigação ou direito.

A plataforma não deverá armazenar apenas saldos consolidados sem rastreabilidade.

17.1 Origem dos lançamentos

Um lançamento financeiro poderá ter origem em:

contrato;
cronograma de faturamento;
nota fiscal;
pedido de compra;
folha ou custo de pessoal;
despesa administrativa;
imposto;
transferência;
adiantamento;
ajuste autorizado;
importação;
integração bancária.

Cada lançamento deverá registrar sua origem.

17.2 Natureza financeira

Os lançamentos serão classificados como:

entrada;
saída;
transferência;
ajuste.
17.3 Estágio financeiro

Os valores deverão ser diferenciados entre:

orçado;
previsto;
comprometido;
realizado.
Orçado

Valor aprovado no planejamento ou orçamento.

Previsto

Melhor estimativa atual de entrada ou saída futura.

Comprometido

Valor relacionado a obrigação ou direito já assumido.

Exemplos:

pedido de compra aprovado;
contrato assinado;
nota fiscal emitida;
parcela formalizada.
Realizado

Valor efetivamente pago ou recebido.

18. Contas a pagar

A entidade Título a Pagar representará uma obrigação financeira.

18.1 Atributos conceituais
identificador;
empresa;
fornecedor;
documento de origem;
pedido de compra;
projeto;
centro de custo;
categoria financeira;
conta gerencial;
número do documento;
data de emissão;
competência;
valor total;
moeda;
situação;
observações.
18.2 Parcelas

Um título poderá possuir uma ou mais parcelas.

Cada parcela deverá registrar:

número;
valor;
vencimento;
previsão de pagamento;
situação;
saldo;
juros;
multa;
desconto;
data de liquidação.
18.3 Pagamentos

Uma parcela poderá possuir:

pagamento integral;
pagamentos parciais;
adiantamento;
desconto;
juros;
multa;
estorno.
19. Contas a receber

A entidade Título a Receber representará um direito financeiro.

19.1 Atributos conceituais
identificador;
empresa;
cliente;
contrato;
projeto;
nota fiscal;
medição;
categoria financeira;
conta gerencial;
data de emissão;
competência;
valor total;
moeda;
situação.
19.2 Parcelas

Um título poderá possuir uma ou mais parcelas.

Cada parcela deverá registrar:

valor;
vencimento;
previsão de recebimento;
situação;
saldo;
juros;
multa;
desconto;
data de liquidação.
19.3 Recebimentos

Uma parcela poderá possuir:

recebimento integral;
recebimentos parciais;
retenções;
descontos;
juros;
estornos.
20. Movimentações bancárias

A entidade Movimentação Bancária representará um lançamento identificado em uma
conta bancária.

Atributos conceituais:

conta bancária;
data;
valor;
natureza;
descrição;
identificador bancário;
saldo informado;
origem da importação;
situação da conciliação.

Uma movimentação bancária poderá ser vinculada a:

um pagamento;
um recebimento;
vários pagamentos;
vários recebimentos;
transferência;
tarifa;
aplicação;
resgate;
lançamento não identificado.
21. Conciliação bancária

A conciliação deverá relacionar movimentações bancárias a registros internos.

O processo deverá permitir:

conciliação automática;
conciliação manual;
conciliação parcial;
divisão de movimentação;
agrupamento de lançamentos;
registro de diferença;
justificativa;
desfazimento autorizado.

A conciliação deverá manter histórico.

22. Transferências

Transferências entre contas da própria empresa não deverão gerar receita ou
despesa.

Uma transferência deverá produzir:

saída na conta de origem;
entrada na conta de destino;
vínculo entre as duas movimentações;
identificação da operação;
situação da conciliação.

Tarifas associadas serão registradas separadamente como despesas.

23. Fluxo de caixa

O fluxo de caixa deverá ser calculado a partir das movimentações e previsões
financeiras.

Não deverá existir como conjunto independente de lançamentos duplicados.

23.1 Visões do fluxo de caixa

A plataforma deverá disponibilizar:

fluxo realizado;
fluxo previsto;
fluxo comprometido;
fluxo consolidado;
fluxo por projeto;
fluxo por contrato;
fluxo por conta bancária;
fluxo por categoria;
fluxo por centro de custo.
23.2 Data utilizada

As projeções poderão considerar:

data de vencimento;
data prevista de pagamento;
data prevista de recebimento;
data efetiva de liquidação.
23.3 Cenários

A plataforma poderá permitir cenários:

base;
otimista;
pessimista;
personalizado.

Os cenários não deverão alterar os dados operacionais originais.

24. Plano de contas gerencial

A plataforma possuirá plano de contas gerencial próprio.

O plano deverá permitir:

estrutura hierárquica;
contas sintéticas;
contas analíticas;
classificação de receitas;
classificação de custos;
classificação de despesas;
classificação de resultados financeiros;
agrupamento para DRE;
ativação e inativação;
versionamento.

Uma categoria financeira operacional poderá ser mapeada para uma conta gerencial.

25. DRE gerencial

A DRE gerencial será calculada a partir dos lançamentos classificados.

Deverá permitir análise por:

empresa;
período;
projeto;
contrato;
centro de custo;
unidade de negócio;
cliente;
categoria;
conta gerencial.
25.1 Estrutura inicial

A estrutura poderá contemplar:

receita bruta;
deduções;
receita líquida;
custos diretos;
margem bruta;
despesas operacionais;
EBITDA;
depreciações e amortizações;
resultado financeiro;
resultado antes dos impostos;
resultado líquido gerencial.

A estrutura definitiva será detalhada em documento específico.

26. Rateios e apropriações

Despesas compartilhadas poderão ser distribuídas por regras de rateio.

Exemplos de critérios:

faturamento;
horas trabalhadas;
quantidade de colaboradores;
área;
percentual fixo;
utilização;
valor direto;
critério personalizado.

Cada rateio deverá registrar:

origem;
critério;
período;
valores distribuídos;
responsável;
data;
justificativa;
versão da regra.

O lançamento original deverá ser preservado.

27. Pessoas e custos de pessoal

A entidade Colaborador deverá se relacionar à entidade Pessoa.

Os dados poderão contemplar:

área;
função;
vínculo;
custo mensal;
remuneração;
benefícios;
encargos;
disponibilidade;
alocação em projeto;
horas apontadas.

Na primeira fase, poderão ser utilizados custos consolidados mensais.

Dados pessoais sensíveis deverão possuir acesso restrito.

28. Documentos

A entidade Documento representará um documento lógico.

A entidade Arquivo representará o arquivo físico armazenado.

28.1 Metadados mínimos
identificador;
nome;
categoria;
tipo;
tamanho;
localização;
hash;
versão;
responsável;
data de inclusão;
nível de confidencialidade;
situação.
28.2 Vínculos

Um documento poderá ser vinculado a:

cliente;
fornecedor;
oportunidade;
proposta;
contrato;
projeto;
pedido de compra;
título financeiro;
pagamento;
recebimento;
valuation;
auditoria.
28.3 Versionamento

Documentos sujeitos a revisão deverão preservar todas as versões.

Uma nova versão não deverá apagar a anterior.

29. Indicadores

Cada indicador deverá possuir definição formal.

29.1 Atributos conceituais
identificador;
nome;
descrição;
fórmula;
unidade;
periodicidade;
fonte;
responsável;
dimensões;
valor;
período;
versão;
situação.
29.2 Exemplos de indicadores

Marketing:

leads gerados;
custo por lead;
oportunidades por campanha;
receita atribuída;
retorno sobre investimento.

Comercial:

taxa de conversão;
propostas emitidas;
taxa de ganho;
ciclo médio de venda;
valor do pipeline.

Financeiro:

saldo;
necessidade de caixa;
inadimplência;
prazo médio de recebimento;
prazo médio de pagamento.

Projetos:

margem prevista;
margem realizada;
desvio de custo;
capital de giro;
prazo.

Valuation:

receita projetada;
EBITDA;
fluxo de caixa livre;
taxa de desconto;
valor da empresa.
30. Valuation

A arquitetura deverá permitir armazenar múltiplas versões de valuation.

30.1 Valuation

Representará o processo de avaliação da empresa em uma data-base.

30.2 Versão de valuation

Cada versão deverá armazenar:

data-base;
metodologia;
responsável;
situação;
premissas;
projeções;
ajustes;
cenários;
resultados;
documentos;
data de aprovação.
30.3 Premissas

As premissas poderão incluir:

crescimento da receita;
margem;
despesas;
impostos;
investimentos;
capital de giro;
taxa de desconto;
crescimento terminal;
horizonte de projeção.
30.4 Imutabilidade

Após aprovação, uma versão de valuation não poderá ser alterada.

Qualquer mudança deverá gerar uma nova versão.

31. Iniciativas de transformação digital

A plataforma deverá permitir registrar as iniciativas implementadas nas áreas da
empresa.

Exemplos:

automação do fluxo de caixa;
implantação de CRM;
automação de marketing;
digitalização de compras;
controle de produtividade;
melhoria de gestão de projetos;
integração bancária.
31.1 Atributos conceituais
nome;
área;
objetivo;
data de início;
data de conclusão;
responsável;
investimento;
indicadores relacionados;
situação;
benefícios esperados;
benefícios observados.
31.2 Relação com indicadores

Uma iniciativa poderá estar relacionada a vários indicadores.

Exemplos:

redução do prazo de fechamento;
redução da inadimplência;
aumento da conversão;
melhoria da margem;
redução de retrabalho;
redução de capital de giro.
31.3 Relação com valuation

A plataforma deverá permitir comparar os indicadores e valuations antes e depois
das iniciativas.

Essa associação não deverá ser interpretada automaticamente como causalidade.

A análise deverá considerar:

período;
variáveis externas;
mudanças simultâneas;
premissas;
justificativas;
metodologia adotada.
32. Auditoria

Operações críticas deverão gerar registros de auditoria.

32.1 Conteúdo mínimo
identificador;
usuário;
data e hora;
módulo;
operação;
entidade;
identificador da entidade;
valor anterior;
valor posterior;
origem;
justificativa;
identificador da sessão;
endereço de origem, quando aplicável.
32.2 Operações auditáveis
criação;
edição;
cancelamento;
aprovação;
rejeição;
estorno;
reabertura;
exportação sensível;
alteração de permissão;
alteração de configuração;
importação;
integração;
exclusão lógica.
32.3 Imutabilidade

Registros de auditoria não deverão ser alterados por usuários comuns.

33. Histórico e versionamento

Deverão possuir histórico ou versionamento:

propostas;
contratos;
aditivos;
orçamentos;
plano de contas;
regras de rateio;
indicadores;
documentos;
permissões;
configurações;
valuation;
premissas;
cenários;
integrações;
dados financeiros críticos.

O tipo de versionamento poderá variar conforme a entidade.

34. Integrações e identificadores externos

Dados importados de sistemas externos deverão registrar:

sistema de origem;
identificador externo;
data da importação;
data da última sincronização;
versão externa, quando disponível;
hash ou mecanismo de controle;
situação da sincronização.

O par formado por sistema de origem e identificador externo deverá ser utilizado
para evitar duplicidades.

35. Importação de dados históricos

A plataforma deverá permitir importar dados anteriores à implantação.

A importação poderá envolver:

clientes;
fornecedores;
contratos;
projetos;
contas a pagar;
contas a receber;
movimentações bancárias;
fluxo de caixa;
DRE;
indicadores;
campanhas;
oportunidades;
documentos;
valuations anteriores.
35.1 Requisitos da importação

Cada lote deverá registrar:

arquivo de origem;
data;
responsável;
quantidade de registros;
registros aceitos;
registros rejeitados;
erros;
regras de transformação;
situação;
possibilidade de reversão controlada.
36. Segurança e classificação

Os dados poderão ser classificados como:

público;
interno;
confidencial;
restrito.

Exemplos de dados restritos:

credenciais;
dados bancários;
remuneração;
documentos pessoais;
informações estratégicas;
valuation;
informações financeiras detalhadas.

O nível de acesso deverá considerar:

perfil;
área;
módulo;
operação;
empresa;
projeto;
classificação do dado.
37. Proteção de dados pessoais

A arquitetura deverá considerar:

minimização dos dados;
finalidade;
necessidade;
acesso restrito;
retenção;
correção;
anonimização, quando aplicável;
exclusão conforme regras legais e contratuais;
registro de consentimento, quando necessário;
rastreabilidade do tratamento.

A política detalhada será definida em documento específico.

38. Dados transacionais e dados analíticos

O banco operacional armazenará os dados necessários à execução dos processos.

Consultas analíticas complexas não deverão prejudicar a operação.

Inicialmente, poderão ser utilizadas:

consultas otimizadas;
visões;
visões materializadas;
tabelas de consolidação;
rotinas de atualização.

No futuro, poderá ser criado um ambiente analítico separado.

39. Valores calculados

Sempre que possível, valores consolidados deverão ser calculados a partir dos
registros de origem.

Exemplos:

saldo de título;
saldo bancário;
fluxo de caixa;
margem;
DRE;
EBITDA;
capital de giro;
indicadores;
valuation.

Quando um resultado calculado for armazenado por desempenho, deverá registrar:

fórmula ou regra;
data de cálculo;
período;
versão;
dados de origem;
possibilidade de recálculo.
40. Modelo conceitual resumido
41. Entidades prioritárias do MVP

A primeira implementação deverá priorizar:

Identidade
Usuário;
Perfil;
Permissão.
Cadastros
Empresa;
Pessoa;
Cliente;
Fornecedor;
Contato;
Conta bancária;
Centro de custo;
Categoria financeira;
Conta gerencial.
Marketing e Comercial básico
Canal;
Campanha;
Lead;
Oportunidade;
Proposta.
Contratos e Projetos
Contrato;
Projeto;
Aditivo;
Marco contratual;
Cronograma de faturamento;
Orçamento do projeto.
Financeiro
Título a pagar;
Parcela a pagar;
Pagamento;
Título a receber;
Parcela a receber;
Recebimento;
Movimentação bancária;
Conciliação;
Transferência;
Projeção financeira.
Controladoria
Plano de contas gerencial;
Estrutura da DRE;
Classificação gerencial;
Período de fechamento.
Documentos
Documento;
Arquivo;
Versão;
Vínculo documental.
Valuation
Valuation;
Versão;
Premissa;
Cenário;
Projeção.
Governança
Registro de auditoria;
Importação;
Integração;
Notificação.
42. Decisões pendentes

Ainda deverão ser definidos:

atributos obrigatórios de cada entidade;
regras de unicidade;
estratégia definitiva de UUID;
quantidade de empresas suportadas inicialmente;
modelo de endereços;
modelo de contatos;
modelo de impostos e retenções;
estrutura do plano de contas gerencial;
estrutura detalhada da DRE;
critérios de reconhecimento gerencial;
regras de competência;
modelo de aprovação;
política de fechamento;
modelo de conciliação automática;
estratégia de cenários de fluxo de caixa;
método de atribuição de marketing;
critérios de qualificação de leads;
tratamento de múltiplas moedas;
política de retenção;
política de anonimização;
regras de importação histórica;
estratégia de visões e consolidações;
critérios de imutabilidade;
modelo físico do banco de dados.
