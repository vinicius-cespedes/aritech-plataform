# ADR-001 — Adoção de Monólito Modular

## Status

Aceito.

## Data

2026-08-01.

## Contexto

A Plataforma Aritech será desenvolvida para digitalizar e integrar os processos
da Aritech Soluções Industriais.

A solução deverá contemplar progressivamente domínios como:

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

A primeira fase será concentrada na digitalização financeira, na controladoria,
na gestão de contratos e projetos e no valuation da empresa.

O projeto será iniciado com uma equipe de desenvolvimento reduzida e deverá
priorizar:

- velocidade de implementação;
- simplicidade operacional;
- baixo custo de infraestrutura;
- facilidade de manutenção;
- consistência transacional;
- rastreabilidade;
- evolução incremental.

Foi necessário definir o estilo arquitetural inicial da aplicação.

---

## Decisão

A Plataforma Aritech será inicialmente desenvolvida como um monólito modular.

A solução será implantada como uma única aplicação de backend, porém organizada
internamente em módulos correspondentes aos domínios de negócio.

Cada módulo deverá possuir:

- responsabilidades claramente definidas;
- regras de negócio próprias;
- serviços de aplicação;
- entidades e modelos;
- interfaces internas;
- testes automatizados;
- controle de permissões;
- registros de auditoria, quando aplicável.

A separação modular deverá existir no código, mesmo que todos os módulos
compartilhem inicialmente:

- o mesmo processo de aplicação;
- o mesmo repositório;
- o mesmo banco de dados PostgreSQL;
- a mesma infraestrutura de implantação.

---

## Motivação

A adoção do monólito modular foi escolhida porque oferece uma relação adequada
entre simplicidade e organização para a fase atual do projeto.

Os principais motivos são:

- equipe inicialmente pequena;
- necessidade de rápida evolução;
- redução da complexidade de infraestrutura;
- menor custo de hospedagem;
- facilidade de depuração;
- facilidade de implantação;
- maior simplicidade nas transações financeiras;
- menor risco de inconsistência entre serviços;
- menor necessidade de ferramentas avançadas de observabilidade;
- possibilidade de manter limites claros entre os domínios;
- possibilidade de futura extração de módulos.

A arquitetura deverá permitir que a plataforma cresça sem adotar prematuramente
a complexidade de microsserviços.

---

## Limites dos módulos

Cada módulo será responsável por suas próprias regras e estruturas internas.

Um módulo não deverá:

- acessar indiscriminadamente tabelas de outro módulo;
- duplicar regras já existentes;
- alterar diretamente dados internos de outro domínio;
- depender de detalhes de implementação de outro módulo;
- realizar integrações externas fora do mecanismo definido.

A comunicação entre módulos deverá ocorrer por meio de:

- serviços internos;
- interfaces;
- contratos;
- comandos;
- consultas autorizadas;
- eventos de domínio.

---

## Banco de dados

Na primeira fase, os módulos compartilharão a mesma instância de PostgreSQL.

O compartilhamento do banco não significa ausência de separação lógica.

As tabelas deverão ser organizadas e nomeadas de forma a deixar evidente o
domínio responsável.

Poderão ser utilizadas estratégias como:

- separação por schema;
- convenções de nomes;
- organização por módulos no ORM;
- controle de acesso pelo código;
- interfaces de repositório;
- validação das dependências.

A estratégia definitiva será detalhada no modelo físico do banco de dados.

---

## Transações

As operações que envolverem vários módulos poderão utilizar transações locais no
mesmo banco de dados.

Isso é especialmente importante para operações como:

- conversão de oportunidade em contrato;
- geração de previsão financeira;
- aprovação de pedido de compra;
- criação de compromisso financeiro;
- liquidação de títulos;
- conciliação bancária;
- fechamento gerencial.

A consistência transacional será priorizada no primeiro estágio da plataforma.

---

## Eventos internos

Eventos de domínio poderão ser utilizados para reduzir o acoplamento.

Exemplos:

- LeadQualificado;
- OportunidadeConquistada;
- ContratoCriado;
- ProjetoCriado;
- PedidoCompraAprovado;
- TituloFinanceiroCriado;
- PagamentoRealizado;
- RecebimentoRealizado;
- PeriodoGerencialFechado;
- ValuationAprovado.

Inicialmente, esses eventos poderão ser processados dentro da própria aplicação.

No futuro, poderão ser encaminhados para mecanismos assíncronos, se necessário.

---

## Organização do código

O backend deverá ser organizado por domínio, e não apenas por tipo técnico.

Estrutura conceitual:

```text
apps/api/src/
├── identity/
├── organization/
├── marketing/
├── commercial/
├── contracts/
├── finance/
├── procurement/
├── controlling/
├── people/
├── execution/
├── documents/
├── indicators/
├── valuation/
├── notifications/
├── integrations/
└── audit/
A estrutura definitiva será detalhada quando o código inicial for criado.

Alternativas consideradas
Microsserviços

A utilização de microsserviços foi considerada, mas não foi selecionada para a
fase inicial.

Os principais motivos foram:

maior complexidade operacional;
necessidade de múltiplas implantações;
maior custo de infraestrutura;
necessidade de mensageria;
necessidade de observabilidade distribuída;
maior dificuldade de transações;
maior complexidade de autenticação entre serviços;
maior esforço de manutenção;
risco de criação de serviços excessivamente pequenos;
equipe inicial reduzida.

Microsserviços poderão ser considerados futuramente para módulos que apresentem
necessidade comprovada.

Aplicação monolítica sem modularização

Também foi considerada uma aplicação monolítica tradicional, organizada apenas
por controladores, serviços e tabelas.

Essa alternativa foi rejeitada porque aumentaria o risco de:

acoplamento excessivo;
duplicidade de regras;
dificuldade de manutenção;
acesso indiscriminado aos dados;
crescimento desorganizado;
dificuldade de extração futura de módulos.
Arquitetura serverless integral

Uma arquitetura baseada integralmente em funções serverless também foi
considerada.

Essa alternativa não foi escolhida inicialmente devido a:

fragmentação das regras de negócio;
maior dificuldade de transações;
dependência elevada do provedor;
maior complexidade de testes integrados;
possível dificuldade de controle de custos;
necessidade de maturidade operacional adicional.

Recursos serverless poderão ser utilizados pontualmente, por exemplo em:

processamento de arquivos;
rotinas agendadas;
notificações;
tarefas de integração.
Consequências positivas

A decisão traz as seguintes vantagens:

menor complexidade inicial;
implantação simplificada;
menor custo de infraestrutura;
facilidade de desenvolvimento local;
maior simplicidade de testes;
transações financeiras mais seguras;
menor latência entre módulos;
facilidade de rastreamento;
evolução rápida do MVP;
organização por domínio;
possibilidade de futura extração de módulos.
Consequências negativas

A decisão também possui limitações:

todos os módulos poderão ser implantados juntos;
uma falha grave poderá afetar toda a aplicação;
o crescimento descontrolado poderá gerar acoplamento;
o banco compartilhado poderá incentivar acessos indevidos;
o escalonamento será inicialmente realizado de forma conjunta;
será necessário disciplina para preservar os limites modulares.

Esses riscos deverão ser controlados por:

revisão de código;
testes;
convenções;
documentação;
interfaces internas;
auditoria das dependências;
proibição de acesso indiscriminado entre módulos.
Critérios para futura extração de módulos

Um módulo poderá ser considerado para extração quando houver justificativa
técnica ou econômica.

Os critérios poderão incluir:

necessidade de escalonamento independente;
carga significativamente diferente;
ciclo de implantação próprio;
equipe responsável própria;
requisito de isolamento;
integração externa intensa;
necessidade de disponibilidade distinta;
alto volume de processamento assíncrono;
necessidade de tecnologia diferente;
limites de domínio estáveis.

A extração não deverá ocorrer apenas por preferência técnica.

Deverá existir benefício mensurável.

Módulos candidatos a futura extração

Dependendo da evolução da plataforma, poderão ser avaliados:

Integrações;
Documentos;
Notificações;
Processamento de arquivos;
Indicadores e análises;
Serviços de inteligência artificial.

Os módulos financeiros centrais deverão permanecer integrados enquanto a
consistência transacional justificar essa decisão.

Regras obrigatórias

A implementação deverá respeitar as seguintes regras:

cada módulo deverá possuir responsabilidade definida;
regras de negócio deverão permanecer no módulo responsável;
módulos não deverão acessar diretamente repositórios internos de outros módulos;
integrações externas deverão ser isoladas;
operações críticas deverão gerar auditoria;
eventos relevantes deverão ser identificados;
dependências circulares deverão ser evitadas;
mudanças arquiteturais deverão ser registradas em ADRs;
o banco compartilhado não deverá eliminar a separação lógica;
a modularidade deverá ser validada durante as revisões de código.
Indicadores de sucesso da decisão

A decisão será considerada adequada se permitir:

implementar o MVP sem complexidade operacional excessiva;
manter os módulos compreensíveis;
preservar a integridade das informações;
executar transações financeiras de forma consistente;
evoluir funcionalidades sem alto grau de retrabalho;
identificar claramente o responsável por cada regra;
realizar testes por módulo;
preparar a plataforma para futura expansão.
Revisão da decisão

Esta decisão deverá ser revisada quando ocorrer uma das seguintes situações:

crescimento significativo da equipe;
aumento expressivo da carga;
necessidade de implantação independente;
indisponibilidade causada por acoplamento;
dificuldade de manutenção;
necessidade de tecnologia específica;
aumento de integrações assíncronas;
surgimento de limites de domínio estáveis;
mudança relevante no modelo de negócio.

A revisão deverá gerar um novo ADR.

Referências internas

Esta decisão está relacionada aos seguintes documentos:

docs/architecture/ARCHITECTURE_OVERVIEW.md;
docs/architecture/SYSTEM_CONTEXT.md;
docs/architecture/MODULES.md;
docs/architecture/DATA_ARCHITECTURE.md;
docs/architecture/SECURITY.md.
