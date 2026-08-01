# Arquitetura da Plataforma Aritech

## 1. Objetivo

Este documento apresenta a arquitetura de referência da Plataforma Aritech,
sistema corporativo destinado à digitalização, integração e gestão dos processos
da Aritech Soluções Industriais.

A plataforma deverá consolidar informações operacionais, comerciais, financeiras
e gerenciais, permitindo maior controle dos processos, rastreabilidade das
informações e suporte à tomada de decisão.

A primeira etapa do desenvolvimento será concentrada na digitalização financeira,
na geração de informações gerenciais e na elaboração do valuation inicial da
empresa.

---

## 2. Princípios arquiteturais

A arquitetura da plataforma será orientada pelos seguintes princípios:

1. Modularidade;
2. Rastreabilidade;
3. Segurança desde a concepção;
4. Separação de responsabilidades;
5. Integridade das informações;
6. Automação de processos;
7. Evolução incremental;
8. Baixo acoplamento entre módulos;
9. Centralização das regras de negócio;
10. Histórico e auditabilidade das operações.

---

## 3. Estilo arquitetural

A plataforma será inicialmente desenvolvida como um monólito modular.

A aplicação será implantada como uma solução única, mas será internamente
organizada em módulos correspondentes aos diferentes domínios do negócio.

Cada módulo deverá possuir:

- responsabilidades claramente definidas;
- regras de negócio próprias;
- serviços de aplicação;
- interfaces de acesso;
- entidades e modelos;
- testes automatizados;
- controle de permissões.

A comunicação entre módulos deverá ocorrer por meio de serviços ou contratos
internos definidos, evitando o acesso indiscriminado às estruturas internas
de outros módulos.

A arquitetura deverá permitir que, futuramente, módulos específicos sejam
extraídos e transformados em serviços independentes, caso essa evolução seja
tecnicamente e economicamente justificável.

---

## 4. Arquitetura em camadas

Cada módulo deverá seguir, sempre que aplicável, as seguintes camadas:

### 4.1 Interface

Responsável pela interação com os usuários e pela apresentação das informações.

### 4.2 Aplicação

Responsável pela coordenação dos casos de uso, validação de permissões e
orquestração das operações.

### 4.3 Domínio

Responsável pelas regras de negócio, entidades, políticas, cálculos e restrições.

### 4.4 Infraestrutura

Responsável pelo banco de dados, armazenamento de arquivos, serviços externos,
mensageria e demais recursos tecnológicos.

As regras essenciais do negócio deverão permanecer na camada de domínio,
sem dependência direta da interface ou da tecnologia de persistência.

---

## 5. Componentes principais

A solução será formada pelos seguintes componentes:

- aplicação web responsiva;
- API de backend;
- banco de dados relacional;
- armazenamento de documentos;
- serviço de autenticação e autorização;
- mecanismo de auditoria;
- rotinas de integração;
- serviços de geração de relatórios;
- infraestrutura de implantação e monitoramento.

---

## 6. Domínios da plataforma

A plataforma deverá contemplar progressivamente os seguintes domínios:

- Identidade e acesso;
- Organização e cadastros;
- Comercial;
- Contratos e projetos;
- Financeiro;
- Compras;
- Controladoria;
- Pessoas;
- Produção e execução;
- Documentos;
- Indicadores;
- Valuation;
- Administração e auditoria.

A existência de um domínio na arquitetura não implica sua implementação imediata.
Os módulos serão desenvolvidos conforme as prioridades definidas no roadmap
do produto.

---

## 7. Escopo da primeira fase

A primeira fase será direcionada à digitalização financeira da Aritech e deverá
contemplar:

- usuários, perfis e permissões;
- empresas, clientes e fornecedores;
- contas bancárias;
- plano de contas gerencial;
- categorias financeiras;
- centros de custo;
- contratos e projetos;
- contas a pagar;
- contas a receber;
- parcelas;
- pagamentos e recebimentos;
- movimentações bancárias;
- fluxo de caixa realizado;
- fluxo de caixa previsto;
- fluxo de caixa comprometido;
- DRE gerencial;
- indicadores financeiros;
- premissas de valuation;
- versões do valuation;
- trilha de auditoria.

---

## 8. Arquitetura de dados

O PostgreSQL será utilizado como banco de dados relacional principal.

A plataforma deverá registrar os eventos e documentos que originam cada
informação financeira, evitando a utilização de saldos isolados sem
rastreabilidade.

As informações deverão ser classificadas, quando aplicável, como:

- orçadas;
- previstas;
- comprometidas;
- realizadas.

Cada movimentação deverá possuir dimensões gerenciais que permitam sua análise,
incluindo:

- empresa;
- projeto;
- contrato;
- cliente ou fornecedor;
- centro de custo;
- categoria financeira;
- competência;
- vencimento;
- data de liquidação;
- conta bancária;
- situação;
- origem da informação.

Os valores consolidados deverão ser calculados a partir das movimentações e
documentos de origem.

---

## 9. Segurança e autorização

O acesso à plataforma será autenticado.

As permissões deverão ser definidas por perfil, módulo e operação, contemplando
ações como:

- visualizar;
- criar;
- editar;
- excluir;
- aprovar;
- cancelar;
- exportar;
- administrar.

Operações financeiras relevantes poderão exigir aprovação conforme regras de
alçada a serem definidas.

Informações sensíveis não deverão ser registradas diretamente no código-fonte
ou no repositório.

---

## 10. Auditoria

Operações críticas deverão gerar registros de auditoria contendo, no mínimo:

- usuário responsável;
- data e hora;
- tipo da operação;
- entidade afetada;
- identificador do registro;
- valores anteriores;
- valores posteriores;
- origem da solicitação;
- justificativa, quando aplicável.

Os registros de auditoria não poderão ser alterados pelos usuários comuns da
plataforma.

---

## 11. Integrações

A arquitetura deverá permitir a integração futura com:

- bancos e arquivos bancários;
- sistemas contábeis;
- emissão de notas fiscais;
- serviços de armazenamento;
- serviços de assinatura eletrônica;
- plataformas de marketing e vendas;
- sistemas de gestão de projetos;
- ferramentas de comunicação;
- serviços de inteligência artificial.

As integrações deverão ser isoladas da lógica central do domínio por meio de
adaptadores e interfaces.

---

## 12. Disponibilidade e continuidade

A plataforma deverá possuir:

- cópias de segurança automatizadas;
- processo documentado de restauração;
- ambientes separados para desenvolvimento e produção;
- registro centralizado de erros;
- monitoramento básico de disponibilidade;
- controle de versões;
- processo automatizado de implantação.

---

## 13. Evolução da arquitetura

A arquitetura será revisada de forma incremental durante o desenvolvimento.

Alterações significativas deverão ser registradas por meio de Architecture
Decision Records — ADRs.

Cada ADR deverá registrar:

- contexto;
- decisão;
- alternativas consideradas;
- justificativa;
- consequências;
- status da decisão.

---

## 14. Decisões iniciais

As seguintes decisões deverão ser formalizadas em ADRs:

- adoção do monólito modular;
- utilização de TypeScript;
- utilização de Next.js;
- utilização de NestJS;
- utilização de PostgreSQL;
- utilização de Prisma;
- utilização de Docker;
- implementação de trilha de auditoria;
- estratégia de autenticação;
- estratégia de armazenamento de documentos.

---

## 15. Pontos pendentes

Os seguintes pontos ainda deverão ser detalhados:

- provedor de hospedagem;
- política de backup;
- política de retenção de documentos;
- modelo de autenticação;
- regras de aprovação financeira;
- níveis de acesso;
- integrações bancárias;
- integração contábil;
- política de logs;
- estratégia de recuperação de desastre.