# ADR-002 — Definição da Stack Tecnológica

## Status

Aceito.

## Data

2026-08-01.

## Contexto

A Plataforma Aritech será desenvolvida como uma aplicação web corporativa para
digitalizar e integrar os processos da Aritech Soluções Industriais.

A solução deverá atender progressivamente áreas como:

- Financeiro;
- Controladoria;
- Contratos e Projetos;
- Compras;
- Marketing;
- Comercial;
- Pessoas;
- Produção e Execução;
- Indicadores;
- Valuation.

A primeira fase será concentrada na digitalização financeira, no fluxo de caixa,
na controladoria e no valuation inicial da empresa.

Foi necessário definir uma stack tecnológica que ofereça:

- velocidade de desenvolvimento;
- facilidade de manutenção;
- segurança;
- boa organização do código;
- suporte a aplicações corporativas;
- integração com sistemas externos;
- capacidade de evolução;
- baixo custo inicial;
- facilidade de contratação de profissionais;
- compatibilidade com arquitetura modular;
- suporte a testes automatizados;
- implantação por contêineres.

---

## Decisão

A Plataforma Aritech utilizará inicialmente a seguinte stack tecnológica:

| Camada | Tecnologia |
|---|---|
| Linguagem principal | TypeScript |
| Frontend | Next.js |
| Biblioteca de interface | React |
| Estilização | Tailwind CSS |
| Componentes de interface | Biblioteca compatível com React e Tailwind |
| Backend | NestJS |
| API | REST com OpenAPI |
| Banco de dados | PostgreSQL |
| ORM | Prisma |
| Validação | Biblioteca de schemas compatível com TypeScript |
| Testes unitários e de integração | Jest |
| Testes de interface | Playwright |
| Contêineres | Docker |
| Automação de integração e implantação | GitHub Actions |
| Controle de versão | Git e GitHub |
| Armazenamento de documentos | Serviço compatível com S3 |
| Documentação de arquitetura | Markdown e Mermaid |

A definição do provedor de hospedagem será realizada posteriormente.

---

## 1. TypeScript

### 1.1 Decisão

TypeScript será utilizado como linguagem principal no frontend e no backend.

### 1.2 Motivação

A utilização de uma única linguagem reduz a complexidade do projeto e facilita:

- compartilhamento de conhecimento;
- reutilização de tipos;
- padronização;
- manutenção;
- revisão de código;
- formação da equipe;
- identificação antecipada de erros;
- integração entre frontend e backend.

O sistema possuirá muitas estruturas de dados, regras financeiras e contratos
entre módulos. A tipagem estática ajudará a reduzir erros de implementação.

### 1.3 Consequências

A equipe deverá manter:

- configurações consistentes do TypeScript;
- modo estrito habilitado;
- tipos explícitos em regras críticas;
- proibição de uso indiscriminado de `any`;
- validação dos dados recebidos em tempo de execução.

A tipagem estática não substitui a validação de entradas externas.

---

## 2. Next.js

### 2.1 Decisão

O frontend da Plataforma Aritech será desenvolvido com Next.js e React.

### 2.2 Motivação

O Next.js foi escolhido por oferecer:

- estrutura consolidada para aplicações web;
- integração com React;
- roteamento;
- renderização no servidor quando necessária;
- geração de páginas;
- suporte a layouts;
- otimização de recursos;
- bom ecossistema;
- facilidade de implantação;
- suporte a TypeScript;
- possibilidade de evolução para PWA.

A plataforma será uma aplicação web responsiva acessível por navegador.

### 2.3 Responsabilidades do frontend

O frontend será responsável por:

- interação com os usuários;
- apresentação de dados;
- navegação;
- formulários;
- validações auxiliares;
- dashboards;
- relatórios visuais;
- tratamento de estados da interface;
- consumo da API.

O frontend não deverá ser a fonte exclusiva das regras de negócio ou de
autorização.

### 2.4 Consequências

Será necessário definir:

- estrutura de rotas;
- padrões de componentes;
- gestão de estado;
- estratégia de formulários;
- tratamento de erros;
- controle de sessão;
- padrões de acessibilidade;
- responsividade.

---

## 3. React

### 3.1 Decisão

React será utilizado como biblioteca principal de interface.

### 3.2 Motivação

React permite:

- criação de componentes reutilizáveis;
- grande disponibilidade de bibliotecas;
- boa integração com Next.js;
- manutenção modular;
- composição de telas;
- testes de componentes;
- desenvolvimento de interfaces responsivas.

### 3.3 Consequências

Os componentes deverão ser organizados em:

- componentes compartilhados;
- componentes por domínio;
- formulários;
- tabelas;
- dashboards;
- layouts;
- elementos de navegação.

Regras de negócio não deverão ficar dispersas em componentes visuais.

---

## 4. Tailwind CSS

### 4.1 Decisão

Tailwind CSS será utilizado como ferramenta principal de estilização.

### 4.2 Motivação

A escolha busca:

- rapidez no desenvolvimento;
- consistência visual;
- padronização;
- responsividade;
- redução de arquivos CSS isolados;
- facilidade de manutenção;
- integração com bibliotecas modernas de componentes.

### 4.3 Consequências

Deverão ser definidos:

- tokens de design;
- tipografia;
- espaçamentos;
- padrões de cores;
- componentes reutilizáveis;
- padrões de estados;
- modo de impressão;
- acessibilidade visual.

A utilização de classes utilitárias não deverá impedir a criação de componentes
padronizados.

---

## 5. Biblioteca de componentes

### 5.1 Decisão

Será adotada uma biblioteca de componentes compatível com React e Tailwind CSS.

A biblioteca específica será definida durante a criação do frontend.

### 5.2 Requisitos

A biblioteca deverá oferecer:

- componentes acessíveis;
- formulários;
- tabelas;
- modais;
- seletores;
- alertas;
- menus;
- componentes de navegação;
- componentes personalizáveis;
- boa compatibilidade com TypeScript;
- manutenção ativa.

### 5.3 Consequências

A biblioteca não deverá criar dependência excessiva ou impedir personalizações
necessárias para os processos da Aritech.

---

## 6. NestJS

### 6.1 Decisão

O backend será desenvolvido com NestJS.

### 6.2 Motivação

O NestJS foi escolhido por oferecer:

- estrutura modular;
- suporte nativo a TypeScript;
- injeção de dependências;
- organização por módulos;
- controladores;
- serviços;
- filtros;
- interceptadores;
- validação;
- testes;
- documentação de API;
- integração com bancos e filas;
- boa compatibilidade com monólito modular.

A estrutura do NestJS é compatível com a divisão por domínios definida na
arquitetura.

### 6.3 Responsabilidades do backend

O backend será responsável por:

- autenticação;
- autorização;
- regras de negócio;
- validação;
- persistência;
- transações;
- integrações;
- auditoria;
- cálculos financeiros;
- processamento de documentos;
- geração de eventos;
- exposição da API.

### 6.4 Consequências

A equipe deverá evitar estruturar o backend apenas por camadas técnicas globais.

Os módulos deverão refletir os domínios do negócio.

---

## 7. API REST

### 7.1 Decisão

A comunicação inicial entre frontend e backend ocorrerá por API REST.

### 7.2 Motivação

REST foi escolhido por oferecer:

- simplicidade;
- ampla compatibilidade;
- facilidade de teste;
- documentação consolidada;
- integração com sistemas externos;
- familiaridade da equipe;
- compatibilidade com ferramentas de monitoramento.

### 7.3 Regras

A API deverá:

- utilizar recursos e operações consistentes;
- aplicar autenticação;
- validar autorização;
- validar entradas;
- padronizar respostas;
- padronizar erros;
- suportar paginação;
- suportar filtros;
- registrar operações críticas;
- utilizar versionamento quando necessário.

### 7.4 Alternativas futuras

GraphQL poderá ser avaliado futuramente caso existam necessidades comprovadas de
consultas altamente flexíveis.

Não será adotado na fase inicial.

---

## 8. OpenAPI

### 8.1 Decisão

A API será documentada utilizando OpenAPI.

### 8.2 Motivação

A documentação deverá permitir:

- consulta dos endpoints;
- entendimento dos contratos;
- geração de clientes;
- testes;
- validação;
- integração com terceiros;
- apoio ao desenvolvimento do frontend.

### 8.3 Consequências

A documentação deverá refletir o comportamento real da API.

Rotas internas ou administrativas poderão possuir exposição controlada no
ambiente de produção.

---

## 9. PostgreSQL

### 9.1 Decisão

PostgreSQL será o banco de dados relacional principal.

### 9.2 Motivação

O PostgreSQL foi escolhido por oferecer:

- integridade relacional;
- transações;
- consistência;
- suporte a consultas complexas;
- recursos analíticos;
- maturidade;
- desempenho;
- confiabilidade;
- suporte a tipos decimais;
- suporte a JSON quando necessário;
- ampla disponibilidade em provedores;
- compatibilidade com Prisma.

Esses recursos são especialmente relevantes para:

- contas a pagar;
- contas a receber;
- conciliação;
- fluxo de caixa;
- DRE;
- contratos;
- auditoria;
- valuation.

### 9.3 Consequências

O banco deverá utilizar:

- restrições;
- chaves estrangeiras;
- índices;
- transações;
- tipos monetários adequados;
- migrações versionadas;
- backups;
- monitoramento;
- conexão segura.

---

## 10. Prisma

### 10.1 Decisão

Prisma será utilizado como ORM e ferramenta de migração.

### 10.2 Motivação

O Prisma foi escolhido por oferecer:

- integração com TypeScript;
- modelos tipados;
- migrações;
- cliente de banco gerado;
- boa experiência de desenvolvimento;
- facilidade de leitura do esquema;
- compatibilidade com PostgreSQL;
- redução de erros de acesso aos dados.

### 10.3 Limites

O Prisma não deverá substituir:

- modelagem adequada;
- regras de domínio;
- validação;
- integridade no banco;
- transações;
- consultas específicas quando necessárias.

Consultas SQL poderão ser utilizadas em casos justificados, especialmente para:

- relatórios;
- consolidações;
- consultas analíticas;
- otimizações;
- visões materializadas.

### 10.4 Consequências

As migrações deverão ser:

- versionadas;
- revisadas;
- testadas;
- executadas de forma controlada;
- acompanhadas de estratégia de reversão quando aplicável.

---

## 11. Validação de dados

### 11.1 Decisão

Será utilizada uma biblioteca de schemas compatível com TypeScript para
validação de dados.

A ferramenta específica será formalizada posteriormente.

### 11.2 Responsabilidades

A validação deverá ocorrer:

- no frontend, para melhorar a experiência;
- no backend, de forma obrigatória;
- no banco, por restrições quando aplicável.

### 11.3 Regras

A validação deverá cobrir:

- tipos;
- formatos;
- campos obrigatórios;
- faixas;
- estados;
- relacionamentos;
- regras de negócio;
- dados monetários;
- datas;
- identificadores.

---

## 12. Jest

### 12.1 Decisão

Jest será utilizado para testes unitários e de integração.

### 12.2 Motivação

A ferramenta possui boa integração com:

- TypeScript;
- NestJS;
- React;
- automação;
- cobertura de testes;
- mocks;
- execução em pipeline.

### 12.3 Prioridades de teste

Deverão receber maior cobertura:

- cálculos financeiros;
- autorização;
- regras de aprovação;
- conciliação;
- estornos;
- classificação gerencial;
- valuation;
- importações;
- integrações;
- auditoria.

---

## 13. Playwright

### 13.1 Decisão

Playwright será utilizado para testes de ponta a ponta da interface.

### 13.2 Motivação

A ferramenta permitirá validar fluxos completos como:

- autenticação;
- cadastro;
- criação de título;
- aprovação;
- pagamento;
- recebimento;
- conciliação;
- geração de relatório;
- restrição por perfil.

### 13.3 Consequências

Os testes de ponta a ponta deverão utilizar dados controlados e ambientes
separados.

---

## 14. Docker

### 14.1 Decisão

A aplicação será empacotada e executada por contêineres Docker.

### 14.2 Motivação

O Docker permitirá:

- padronização de ambientes;
- execução local;
- isolamento;
- implantação consistente;
- facilidade de testes;
- redução de diferenças entre desenvolvimento e produção;
- portabilidade entre provedores.

### 14.3 Componentes iniciais

Poderão existir contêineres para:

- frontend;
- backend;
- PostgreSQL em desenvolvimento;
- serviços auxiliares;
- tarefas de migração.

### 14.4 Consequências

As imagens deverão:

- utilizar versões controladas;
- evitar segredos;
- minimizar dependências;
- ser atualizadas;
- executar com privilégios mínimos;
- possuir processo automatizado de construção.

---

## 15. GitHub Actions

### 15.1 Decisão

GitHub Actions será utilizado para integração contínua e implantação automatizada.

### 15.2 Responsabilidades

Os workflows poderão executar:

- instalação de dependências;
- lint;
- verificação de tipos;
- testes;
- análise de segurança;
- construção;
- validação de migrações;
- construção de imagens;
- implantação;
- geração de artefatos.

### 15.3 Consequências

Credenciais deverão ser armazenadas em segredos protegidos do GitHub ou no
provedor de infraestrutura.

Os workflows não deverão expor segredos em logs.

---

## 16. Git e GitHub

### 16.1 Decisão

Git será utilizado para controle de versão, com hospedagem no GitHub.

### 16.2 Estratégia inicial

O projeto utilizará:

- branch principal;
- branches de trabalho;
- pull requests;
- revisão;
- commits descritivos;
- proteção da branch principal;
- registro de decisões em ADRs.

### 16.3 Estrutura inicial do repositório

```text
aritech-plataform/
├── apps/
│   ├── web/
│   └── api/
├── packages/
│   ├── shared/
│   ├── database/
│   ├── validation/
│   └── ui/
├── docs/
├── infrastructure/
└── .github/
A estrutura poderá ser revisada durante a inicialização técnica do projeto.

17. Monorepositório
17.1 Decisão

Frontend, backend, pacotes compartilhados e documentação permanecerão
inicialmente no mesmo repositório.

17.2 Motivação

O monorepositório facilitará:

coordenação entre frontend e backend;
compartilhamento de tipos;
padronização;
execução dos testes;
versionamento conjunto;
manutenção por equipe pequena;
automação de workflows.
17.3 Consequências

Será necessário definir:

ferramenta de gerenciamento do workspace;
limites dos pacotes;
dependências permitidas;
scripts padronizados;
estratégia de build;
estratégia de cache.

A ferramenta específica de gerenciamento do monorepositório será definida na
inicialização do código.

18. Pacotes compartilhados

Poderão ser criados pacotes internos para:

tipos;
validações;
componentes visuais;
cliente da API;
configurações;
utilitários;
contratos de eventos.

Regras de domínio não deverão ser movidas indiscriminadamente para pacotes
genéricos.

Cada regra deverá permanecer no domínio responsável.

19. Armazenamento de documentos
19.1 Decisão

Os arquivos serão armazenados em serviço compatível com a interface S3.

19.2 Motivação

Essa abordagem oferece:

armazenamento separado do banco;
escalabilidade;
controle de acesso;
versionamento;
criptografia;
links temporários;
integração com provedores diferentes;
menor dependência tecnológica.
19.3 Consequências

O banco armazenará apenas:

metadados;
localização;
hash;
versão;
vínculo;
classificação;
responsável.

O provedor específico será definido em ADR separado.

20. Mermaid e Markdown
20.1 Decisão

A documentação técnica será mantida em Markdown, com diagramas em Mermaid quando
adequado.

20.2 Motivação

Essa abordagem permite:

versionamento;
revisão;
leitura direta no GitHub;
atualização junto ao código;
menor dependência de ferramentas externas;
rastreabilidade das alterações.
21. Alternativas consideradas
21.1 Python com FastAPI

Python com FastAPI foi considerado para o backend.

Vantagens observadas:

boa produtividade;
forte ecossistema de dados;
integração com inteligência artificial;
simplicidade da API;
ampla disponibilidade de bibliotecas.

Não foi selecionado como tecnologia principal porque:

criaria duas linguagens principais;
reduziria o compartilhamento de tipos;
exigiria maior diversidade de conhecimento;
aumentaria a separação entre frontend e backend.

Python poderá ser utilizado futuramente em serviços específicos de:

análise de dados;
inteligência artificial;
processamento científico;
modelos estatísticos;
rotinas especializadas.
21.2 Next.js como frontend e backend único

Foi considerada a utilização exclusiva de Next.js para frontend e backend.

Essa alternativa não foi escolhida porque o sistema deverá possuir:

regras financeiras complexas;
integrações;
auditoria;
aprovações;
tarefas assíncronas;
organização modular;
API independente.

O backend separado em NestJS oferece limites mais claros.

21.3 Java com Spring Boot

Java e Spring Boot foram considerados por sua robustez corporativa.

Não foram selecionados inicialmente devido a:

maior complexidade para a equipe inicial;
menor compartilhamento com o frontend;
maior volume de configuração;
menor velocidade esperada para o MVP.
21.4 C# com ASP.NET

C# e ASP.NET também foram considerados.

A solução apresenta boa robustez, mas não foi escolhida inicialmente porque a
padronização integral em TypeScript foi considerada mais adequada à equipe e ao
ritmo esperado.

21.5 MySQL

MySQL foi considerado como banco relacional.

PostgreSQL foi preferido por sua combinação de:

recursos relacionais;
consultas complexas;
extensibilidade;
suporte analítico;
tipos avançados;
maturidade para o domínio financeiro.
21.6 MongoDB

MongoDB foi considerado, mas não foi selecionado como banco principal.

O domínio da plataforma possui:

relacionamentos;
transações;
integridade;
cálculos financeiros;
conciliações;
estruturas hierárquicas;
necessidade de consistência.

Essas características favorecem um banco relacional.

21.7 Microsserviços com bancos separados

Essa alternativa foi rejeitada na fase inicial conforme definido no
ADR-001 — Adoção de Monólito Modular.

22. Consequências positivas

A stack escolhida oferece:

uma linguagem principal;
tipagem entre as camadas;
boa produtividade;
organização modular;
tecnologias consolidadas;
ampla documentação;
suporte a testes;
portabilidade;
baixo custo inicial;
facilidade de implantação;
possibilidade de evolução;
boa compatibilidade com o domínio financeiro.
23. Consequências negativas

A decisão também possui limitações:

dependência significativa do ecossistema Node.js;
necessidade de controle rigoroso das dependências;
possibilidade de excesso de bibliotecas;
necessidade de disciplina para evitar duplicação de tipos;
necessidade de otimização para consultas analíticas;
Prisma poderá não atender sozinho a todas as consultas complexas;
frontend e backend precisarão de pipelines coordenados;
equipe deverá dominar várias ferramentas do ecossistema TypeScript.
24. Riscos

Os principais riscos são:

dependências vulneráveis;
mudanças frequentes no ecossistema;
acoplamento entre frontend e backend;
uso indevido de lógica no frontend;
excesso de abstrações;
crescimento desorganizado do monorepositório;
consultas de baixa eficiência;
uso inadequado do ORM;
baixa cobertura de testes.

Os riscos deverão ser controlados por:

revisão de código;
atualizações;
testes;
documentação;
análise de dependências;
padrões de projeto;
monitoramento;
revisão de desempenho.
25. Regras obrigatórias

A implementação deverá observar:

TypeScript em modo estrito;
validação obrigatória no backend;
regras de negócio concentradas nos módulos responsáveis;
autorização realizada no backend;
valores monetários sem ponto flutuante;
migrações versionadas;
proibição de segredos no código;
testes das regras críticas;
API documentada;
imagens Docker controladas;
workflows sem exposição de credenciais;
dependências revisadas;
documentação arquitetural atualizada;
alterações relevantes registradas em ADR.
26. Decisões ainda pendentes

Ainda deverão ser formalizadas:

ferramenta de workspace do monorepositório;
biblioteca de componentes;
biblioteca de validação;
estratégia de gerenciamento de estado;
estratégia de formulários;
estratégia de autenticação;
provedor de identidade;
provedor de hospedagem;
provedor do PostgreSQL;
provedor de armazenamento de documentos;
provedor de segredos;
ferramenta de monitoramento;
ferramenta de logs;
ferramenta de filas;
estratégia de tarefas agendadas;
estratégia de e-mails;
política de cache;
estratégia de relatórios;
estratégia de análise de dados;
estratégia de implantação.

Essas decisões deverão ser registradas em novos ADRs conforme se tornarem
necessárias.

27. Critérios de revisão

Esta decisão deverá ser revisada quando:

a equipe não conseguir manter a stack;
houver limitação relevante de desempenho;
alguma tecnologia deixar de receber manutenção;
custos se tornarem inadequados;
requisitos de integração exigirem outra abordagem;
requisitos de segurança não puderem ser atendidos;
houver necessidade de tecnologia especializada;
ocorrer mudança significativa na arquitetura;
a plataforma exigir separação de serviços.

A revisão deverá gerar um novo ADR, preservando o histórico desta decisão.

28. Referências internas

Esta decisão está relacionada a:

docs/architecture/ARCHITECTURE_OVERVIEW.md;
docs/architecture/MODULES.md;
docs/architecture/DATA_ARCHITECTURE.md;
docs/architecture/SECURITY.md;
docs/adr/ADR-001-modular-monolith.md.
