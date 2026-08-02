# ADR-003 — PostgreSQL, Prisma e Estratégia de Persistência

## Status

Aceito.

## Data

2026-08-01.

## Contexto

A Plataforma Aritech armazenará dados operacionais, financeiros, comerciais,
contratuais, gerenciais e estratégicos.

Entre os principais dados previstos estão:

- usuários e permissões;
- clientes e fornecedores;
- contratos e projetos;
- oportunidades e propostas;
- contas a pagar;
- contas a receber;
- parcelas;
- pagamentos;
- recebimentos;
- movimentações bancárias;
- conciliações;
- pedidos de compra;
- orçamentos;
- plano de contas gerencial;
- DRE;
- indicadores;
- premissas e versões de valuation;
- registros de auditoria.

Esses dados possuem relacionamentos importantes, regras de integridade,
necessidade de transações e histórico.

Foi necessário definir:

- o banco de dados principal;
- a estratégia de acesso aos dados;
- o gerenciamento de migrações;
- o tratamento de transações;
- os tipos utilizados para valores financeiros;
- a organização dos dados por domínio;
- os limites de utilização do ORM.

---

## Decisão

A Plataforma Aritech utilizará:

- PostgreSQL como banco de dados relacional principal;
- Prisma como ORM e ferramenta inicial de migrações;
- UUID como identificador principal das entidades;
- tipos decimais exatos para valores financeiros;
- migrações versionadas no repositório;
- transações para operações que exigem consistência;
- integridade referencial garantida também pelo banco;
- exclusão lógica para dados operacionais relevantes;
- consultas SQL específicas quando o ORM não for suficiente.

O banco será compartilhado pelos módulos do monólito modular, mantendo separação
lógica entre os domínios.

---

## 1. PostgreSQL

### 1.1 Decisão

O PostgreSQL será o banco de dados relacional principal da plataforma.

### 1.2 Motivação

O PostgreSQL foi escolhido por oferecer:

- integridade relacional;
- transações ACID;
- chaves estrangeiras;
- restrições;
- índices;
- consultas complexas;
- tipos decimais;
- suporte a UUID;
- suporte a JSON quando necessário;
- visões;
- visões materializadas;
- funções e recursos analíticos;
- maturidade;
- confiabilidade;
- ampla disponibilidade em provedores de nuvem;
- compatibilidade com Prisma.

Esses recursos são adequados para o domínio da Plataforma Aritech, especialmente
para:

- operações financeiras;
- conciliação bancária;
- controle de parcelas;
- cálculos de saldo;
- DRE;
- contratos;
- orçamentos;
- auditoria;
- valuation.

---

## 2. Prisma

### 2.1 Decisão

O Prisma será utilizado inicialmente como:

- ORM;
- cliente de acesso ao banco;
- ferramenta de modelagem do schema;
- ferramenta de criação e execução de migrações.

### 2.2 Motivação

O Prisma oferece:

- integração com TypeScript;
- cliente tipado;
- boa experiência de desenvolvimento;
- leitura relativamente simples do modelo;
- suporte a migrações;
- compatibilidade com PostgreSQL;
- redução de erros comuns de acesso a dados;
- facilidade de uso com NestJS.

### 2.3 Limites

O Prisma não deverá substituir:

- modelagem de dados;
- regras de domínio;
- validação de negócio;
- integridade no banco;
- análise de desempenho;
- uso de transações;
- consultas SQL específicas;
- visões;
- procedimentos de migração controlados.

O ORM será uma ferramenta de persistência, não o centro da arquitetura.

---

## 3. Organização por domínio

O banco será compartilhado pelos módulos do monólito modular.

Mesmo assim, cada domínio deverá possuir responsabilidade clara sobre suas
entidades.

Exemplos:

- `identity`: usuários, perfis, permissões e sessões;
- `organization`: pessoas, clientes, fornecedores e estrutura organizacional;
- `marketing`: campanhas, canais, conteúdos e leads;
- `commercial`: oportunidades e propostas;
- `contracts`: contratos, projetos, aditivos e marcos;
- `finance`: títulos, parcelas, pagamentos, recebimentos e conciliações;
- `procurement`: solicitações, cotações e pedidos de compra;
- `controlling`: plano de contas, DRE, rateios e fechamentos;
- `valuation`: premissas, cenários e versões de valuation;
- `audit`: trilhas de auditoria.

Um módulo não deverá alterar diretamente dados internos de outro domínio sem
utilizar uma operação autorizada.

---

## 4. Estratégia de schemas

### 4.1 Decisão inicial

Na primeira versão, poderá ser utilizado o schema padrão do PostgreSQL, com
convenções claras de nomenclatura e organização no código.

A separação física por schemas de banco poderá ser adotada posteriormente,
desde que compatível com o Prisma e com a operação escolhida.

### 4.2 Motivação

A utilização inicial de um único schema reduz:

- complexidade;
- configuração;
- problemas com migrações;
- esforço operacional;
- dificuldade de desenvolvimento local.

A separação lógica deverá ser garantida por:

- módulos;
- repositórios;
- serviços;
- convenções;
- revisão de código;
- restrição de dependências.

### 4.3 Possível evolução

A utilização de schemas separados poderá ser avaliada quando houver necessidade
de:

- maior isolamento;
- administração independente;
- melhor organização física;
- controle de acesso por schema;
- extração futura de módulos.

---

## 5. Identificadores

### 5.1 Decisão

As entidades principais utilizarão UUID como identificador interno.

### 5.2 Motivação

O UUID oferece:

- baixa possibilidade de colisão;
- geração descentralizada;
- menor exposição da quantidade de registros;
- melhor compatibilidade com integrações;
- facilidade para importações;
- melhor preparação para eventual distribuição futura.

### 5.3 Regras

O identificador interno não deverá depender:

- do CNPJ;
- do CPF;
- do código do cliente;
- do número do contrato;
- do código do projeto;
- da nota fiscal;
- do identificador de sistema externo.

Esses dados deverão ser armazenados como atributos próprios.

### 5.4 Identificadores alternativos

As entidades poderão possuir identificadores de negócio.

Exemplos:

- código do projeto;
- número interno do contrato;
- número da proposta;
- número do pedido de compra;
- número do título;
- número da revisão.

Esses identificadores poderão possuir regras de unicidade próprias.

---

## 6. Valores monetários

### 6.1 Decisão

Valores monetários deverão utilizar tipos decimais exatos.

Não será permitido o uso de tipos de ponto flutuante para valores financeiros.

### 6.2 Regras

Cada valor monetário deverá considerar, quando aplicável:

- valor original;
- moeda;
- taxa de conversão;
- data da taxa;
- valor convertido;
- moeda-base.

A moeda-base inicial será o real brasileiro.

### 6.3 Precisão

A precisão e a escala definitivas serão definidas no modelo físico.

Como referência inicial, poderão ser adotados tipos compatíveis com:

```text
DECIMAL(19,4)
A necessidade de mais casas decimais deverá ser avaliada para:

taxas;
percentuais;
câmbio;
cálculos intermediários;
índices.
6.4 Cálculos

Cálculos monetários deverão evitar conversões para tipos numéricos imprecisos.

Arredondamentos deverão seguir regras formalmente definidas.

7. Percentuais e taxas

Percentuais deverão ser armazenados de forma consistente.

A convenção deverá indicar se o valor será armazenado como:

percentual inteiro, como 15,00;
fator decimal, como 0,1500.

A plataforma deverá adotar uma única convenção por tipo de dado.

Taxas como juros, descontos, margem e câmbio deverão possuir precisão suficiente
para evitar distorções.

8. Datas e horários
8.1 Datas sem horário

Datas de negócio sem necessidade de horário deverão utilizar tipo de data.

Exemplos:

competência;
vencimento;
emissão;
início do contrato;
término do contrato;
data-base do valuation.
8.2 Eventos com horário

Eventos do sistema deverão utilizar data e horário com referência de fuso.

Exemplos:

criação;
alteração;
aprovação;
login;
importação;
integração;
auditoria.
8.3 Fuso horário

Os eventos poderão ser armazenados em UTC.

A apresentação ao usuário deverá considerar o fuso configurado.

A regra definitiva será documentada antes da implementação.

9. Integridade referencial

O banco deverá utilizar chaves estrangeiras sempre que aplicável.

Não será suficiente depender apenas da aplicação para preservar os
relacionamentos.

Exemplos:

projeto vinculado a contrato;
título a receber vinculado a cliente;
título a pagar vinculado a fornecedor;
parcela vinculada a título;
pagamento vinculado a parcela;
recebimento vinculado a parcela;
proposta vinculada a oportunidade;
lead vinculado a campanha.

As regras de exclusão e atualização deverão ser definidas explicitamente.

10. Restrições

O banco deverá utilizar restrições para impedir dados inválidos.

Poderão ser utilizadas:

NOT NULL;
UNIQUE;
CHECK;
chaves estrangeiras;
índices únicos;
restrições compostas.

Exemplos:

CNPJ único por pessoa ativa;
código de projeto único por empresa;
número de contrato único por empresa;
valor de parcela não negativo;
data final não anterior à data inicial;
status dentro de conjunto permitido;
identificador externo único por integração.

As regras críticas não deverão depender apenas da interface.

11. Estados dos registros

Estados de processo deverão ser controlados.

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

A utilização de enumerações no banco deverá ser avaliada com cuidado.

11.1 Estratégia inicial

Estados poderão ser representados por campos textuais controlados pela aplicação
e por validações.

11.2 Motivação

Essa abordagem facilita:

migrações;
evolução de estados;
compatibilidade com o ORM;
manutenção.

Quando necessário, poderão existir tabelas de domínio para estados configuráveis.

12. Exclusão lógica
12.1 Decisão

Dados relevantes utilizarão exclusão lógica ou inativação.

12.2 Campos possíveis

Os registros poderão possuir:

is_active;
deleted_at;
deleted_by;
deletion_reason.

A nomenclatura definitiva será padronizada.

12.3 Entidades críticas

Não deverão ser excluídos fisicamente por usuários comuns:

contratos;
projetos;
títulos;
parcelas;
pagamentos;
recebimentos;
conciliações;
pedidos aprovados;
documentos aprovados;
registros de auditoria;
versões de valuation;
períodos fechados.

Correções deverão ocorrer por:

cancelamento;
estorno;
nova versão;
ajuste autorizado;
inativação.
13. Auditoria

A trilha de auditoria será armazenada no banco.

Cada registro deverá possuir, quando aplicável:

usuário;
módulo;
operação;
entidade;
identificador;
valor anterior;
valor posterior;
data e hora;
origem;
justificativa;
identificador da sessão;
integração ou rotina responsável.

Os registros de auditoria deverão ser imutáveis para usuários comuns.

A estratégia detalhada será formalizada em ADR próprio.

14. Transações
14.1 Decisão

Operações que alterem múltiplos registros relacionados deverão utilizar
transações.

14.2 Exemplos

Deverão utilizar transação, quando aplicável:

criação de título e parcelas;
pagamento e atualização do saldo;
recebimento e atualização do saldo;
transferência entre contas;
aprovação de pedido e criação de compromisso;
conciliação bancária;
estorno;
fechamento gerencial;
conversão de oportunidade em contrato e projeto;
criação de nova versão de valuation.
14.3 Regra

Uma transação deverá concluir integralmente ou não produzir alteração parcial.

14.4 Escopo

As transações deverão ser mantidas curtas.

Chamadas a serviços externos não deverão permanecer dentro de transações longas.

15. Concorrência

A plataforma deverá considerar conflitos de atualização.

Exemplos:

dois usuários editando o mesmo título;
dois processos conciliando a mesma movimentação;
duas aprovações simultâneas;
importações duplicadas;
pagamento processado mais de uma vez.

Poderão ser utilizados:

versionamento otimista;
campos de versão;
atualização condicional;
restrições únicas;
bloqueios transacionais;
chaves de idempotência.

A estratégia será definida por processo.

16. Idempotência

Operações financeiras e integrações deverão evitar duplicidade.

Cada operação crítica poderá possuir:

identificador da solicitação;
chave de idempotência;
identificador externo;
restrição única;
registro de tentativa.

Exemplos:

importação bancária;
criação de título por integração;
envio de pagamento;
processamento de webhook;
sincronização de lead;
geração de parcela.
17. Migrações
17.1 Decisão

Toda alteração no banco deverá ocorrer por migração versionada.

17.2 Regras

As migrações deverão:

permanecer no repositório;
possuir nome descritivo;
ser revisadas;
ser testadas;
ser aplicadas em ambiente de homologação;
ser executadas de forma controlada em produção;
evitar perda de dados;
considerar compatibilidade com versões em implantação.

Alterações manuais em produção deverão ser excepcionais.

17.3 Migrações destrutivas

Operações como remoção de coluna, alteração de tipo ou exclusão de tabela deverão
ser realizadas em etapas.

Exemplo:

criar nova estrutura;
adaptar aplicação;
migrar dados;
validar;
desativar estrutura antiga;
remover em versão posterior.
18. Dados iniciais

Dados necessários ao funcionamento poderão ser carregados por rotinas de
inicialização.

Exemplos:

perfis;
permissões;
moedas;
estados;
categorias;
parâmetros;
estrutura inicial da DRE.

Esses dados deverão ser versionados e controlados.

Dados reais da empresa não deverão ser incluídos diretamente em scripts públicos
do repositório.

19. Ambientes

Cada ambiente deverá possuir banco separado.

Ambientes previstos:

desenvolvimento;
homologação;
produção.

Os ambientes não deverão compartilhar:

dados;
credenciais;
usuários administrativos;
backups;
integrações.

Dados de produção não deverão ser copiados para desenvolvimento sem anonimização
ou autorização.

20. Consultas analíticas

Consultas gerenciais poderão exigir recursos além do acesso transacional comum.

Poderão ser utilizados:

SQL específico;
visões;
visões materializadas;
tabelas de consolidação;
consultas agregadas;
funções de janela;
índices especializados.

Exemplos:

fluxo de caixa;
DRE;
margem por projeto;
capital de giro;
pipeline comercial;
atribuição de marketing;
indicadores;
projeções de valuation.

O uso dessas estruturas deverá preservar a rastreabilidade até os registros de
origem.

21. Valores calculados

Valores consolidados deverão ser calculados a partir dos dados de origem sempre
que possível.

Exemplos:

saldo de título;
saldo de parcela;
fluxo de caixa;
margem;
DRE;
EBITDA;
capital de giro;
indicadores;
valuation.

Quando o resultado for persistido para desempenho, deverá registrar:

data do cálculo;
fórmula ou versão;
período;
dados de origem;
possibilidade de recálculo.
22. Documentos

Arquivos não serão armazenados diretamente no banco de dados principal.

O banco armazenará:

metadados;
localização;
hash;
tipo;
tamanho;
versão;
classificação;
responsável;
vínculos.

O conteúdo será armazenado em serviço compatível com S3.

23. JSON

Campos JSON poderão ser utilizados quando houver justificativa.

Exemplos possíveis:

payload bruto de integração;
dados técnicos de execução;
configurações variáveis;
valores anteriores e posteriores de auditoria;
metadados externos.

JSON não deverá ser utilizado para evitar modelagem relacional de entidades
centrais.

Dados utilizados em filtros, relacionamentos, regras ou relatórios frequentes
deverão preferencialmente possuir estrutura relacional.

24. Índices

Os índices deverão ser definidos com base nos padrões reais de acesso.

Poderão ser necessários índices para:

CNPJ e CPF;
código de projeto;
número do contrato;
vencimento;
situação;
cliente;
fornecedor;
projeto;
conta bancária;
competência;
data de liquidação;
identificador externo;
data de auditoria.

Índices excessivos também deverão ser evitados, pois aumentam o custo das
operações de escrita.

25. Paginação

Consultas com grande volume deverão utilizar paginação.

A estratégia poderá utilizar:

paginação por deslocamento;
paginação por cursor.

Paginação por cursor deverá ser considerada para:

auditoria;
movimentações bancárias;
eventos;
grandes históricos;
integrações.
26. Backup

O banco deverá possuir backups automatizados.

A política deverá definir:

frequência;
retenção;
criptografia;
local de armazenamento;
testes de restauração;
responsabilidade;
monitoramento.

A existência de backup sem teste de restauração não será considerada suficiente.

27. Alta disponibilidade

O MVP não exigirá inicialmente arquitetura avançada de alta disponibilidade.

Mesmo assim, o provedor deverá permitir evolução futura para:

replicação;
redundância;
recuperação automática;
réplicas de leitura;
restauração pontual.

A adoção dependerá da criticidade e do crescimento da plataforma.

28. Desempenho

A estratégia de desempenho deverá considerar:

índices;
consultas eficientes;
eliminação de consultas repetitivas;
paginação;
carregamento seletivo;
transações curtas;
monitoramento;
análise de consultas lentas;
consolidações.

O ORM não deverá ocultar problemas de desempenho.

29. SQL específico

Consultas SQL diretas serão permitidas quando justificadas.

Exemplos:

relatórios complexos;
consolidações;
consultas analíticas;
funções de janela;
visões materializadas;
otimizações;
operações não suportadas adequadamente pelo Prisma.

Essas consultas deverão:

ser parametrizadas;
ser testadas;
ser documentadas;
respeitar os limites do módulo;
evitar SQL inseguro;
possuir revisão.
30. Repositórios de domínio

Cada módulo deverá possuir sua própria camada de acesso aos dados.

Outros módulos não deverão importar diretamente o cliente Prisma interno de um
domínio para alterar suas entidades.

O acesso deverá ocorrer por:

serviços;
interfaces;
comandos;
consultas autorizadas;
eventos.

O cliente Prisma poderá ser compartilhado tecnicamente, mas a responsabilidade
sobre as entidades deverá permanecer modular.

31. Alternativas consideradas
MySQL

Foi considerado como banco relacional.

Não foi escolhido porque o PostgreSQL oferece melhor combinação de:

recursos analíticos;
extensibilidade;
tipos avançados;
consultas complexas;
suporte futuro a consolidações.
MongoDB

Foi considerado para flexibilidade de estrutura.

Não foi escolhido como banco principal porque a plataforma depende de:

relacionamentos;
transações;
integridade;
conciliações;
saldos;
controles financeiros;
consultas gerenciais.
Banco separado por módulo

Foi considerada a utilização de banco independente por domínio.

Essa alternativa não foi adotada inicialmente porque:

aumentaria a complexidade;
dificultaria transações;
exigiria sincronização;
aumentaria custos;
não seria adequada à equipe inicial;
aproximaria prematuramente a solução de microsserviços.
SQL sem ORM

Foi considerada a utilização direta de SQL em toda a aplicação.

Essa alternativa não foi adotada como padrão devido a:

maior esforço de desenvolvimento;
menor integração com TypeScript;
maior repetição;
menor produtividade inicial.

SQL continuará disponível para casos específicos.

TypeORM

Foi considerado como alternativa de ORM.

O Prisma foi preferido pela experiência de desenvolvimento, tipagem e clareza do
schema.

32. Consequências positivas

A decisão proporciona:

consistência;
integridade;
transações;
tipagem;
produtividade;
migrações versionadas;
bom suporte ao domínio financeiro;
compatibilidade com relatórios;
preparação para crescimento;
menor complexidade inicial.
33. Consequências negativas

A decisão também apresenta limitações:

banco compartilhado exige disciplina modular;
Prisma poderá limitar consultas específicas;
migrações complexas exigirão cuidado;
consultas analíticas poderão precisar de SQL;
crescimento do schema poderá aumentar a complexidade;
alterações estruturais precisarão de planejamento;
o banco poderá se tornar ponto central de falha.
34. Riscos

Os principais riscos são:

acesso direto indevido entre módulos;
migrações destrutivas;
perda de dados;
valores financeiros armazenados incorretamente;
ausência de índices;
consultas ineficientes;
exclusões físicas indevidas;
duplicidade em integrações;
conflitos de concorrência;
falta de testes de restauração.

Os riscos serão reduzidos por:

revisão;
testes;
backups;
migrações controladas;
restrições;
transações;
auditoria;
monitoramento;
documentação.
35. Regras obrigatórias

A implementação deverá respeitar:

PostgreSQL como banco principal;
Prisma como ORM inicial;
UUID para entidades principais;
tipos decimais exatos para valores financeiros;
migrações versionadas;
integridade referencial no banco;
uso de transações em operações críticas;
exclusão lógica de dados relevantes;
proibição de ponto flutuante para valores monetários;
proibição de alteração direta entre módulos;
SQL parametrizado quando utilizado;
backups automatizados;
ambientes com bancos separados;
auditoria de operações críticas;
identificação da origem dos dados importados.
36. Decisões pendentes

Ainda deverão ser definidos:

versão inicial do PostgreSQL;
estratégia definitiva de schemas;
precisão monetária padrão;
convenção de percentuais;
estratégia de fuso horário;
convenção de nomes de tabelas e colunas;
estratégia de campos de auditoria;
padrão de exclusão lógica;
modelo de concorrência otimista;
política de índices;
estratégia de paginação;
estratégia de seeds;
provedor do banco;
política de backup;
objetivos de recuperação;
critérios de utilização de JSON;
critérios de uso de SQL direto;
estratégia de leitura analítica;
política de retenção de auditoria.
37. Critérios de revisão

Esta decisão deverá ser revisada quando:

o Prisma limitar significativamente o desenvolvimento;
o banco apresentar problemas de desempenho;
houver necessidade de separar módulos;
o volume de dados exigir arquitetura analítica própria;
houver necessidade de múltiplos bancos;
o provedor escolhido gerar limitações relevantes;
as exigências de disponibilidade aumentarem;
ocorrer mudança do estilo arquitetural.

A revisão deverá ser registrada em novo ADR.

38. Referências internas

Esta decisão está relacionada a:

docs/architecture/ARCHITECTURE_OVERVIEW.md;
docs/architecture/DATA_ARCHITECTURE.md;
docs/architecture/SECURITY.md;
docs/adr/ADR-001-modular-monolith.md;
docs/adr/ADR-002-technology-stack.md.
