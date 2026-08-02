# ADR-006 — Trilha de Auditoria e Rastreabilidade

## Status

Aceito.

## Data

2026-08-01.

## Contexto

A Plataforma Aritech armazenará e processará informações financeiras,
contratuais, comerciais, operacionais, pessoais e estratégicas.

Entre as operações relevantes estarão:

- criação e alteração de cadastros;
- emissão e revisão de propostas;
- criação e alteração de contratos;
- aprovação de compras;
- criação de contas a pagar e a receber;
- pagamentos;
- recebimentos;
- transferências;
- conciliações bancárias;
- estornos;
- cancelamentos;
- alterações de dados bancários;
- fechamento e reabertura de períodos;
- alteração de perfis e permissões;
- aprovação de documentos;
- criação e aprovação de valuations;
- importações;
- integrações;
- rotinas automáticas.

Essas operações exigem rastreabilidade suficiente para responder perguntas como:

- quem realizou a operação;
- quando ela ocorreu;
- qual informação foi alterada;
- qual era o valor anterior;
- qual passou a ser o novo valor;
- de onde partiu a operação;
- por que a alteração foi realizada;
- qual processo ou integração participou;
- qual versão da informação estava vigente;
- se a operação foi aprovada.

Foi necessário definir uma estratégia comum de auditoria para todos os módulos.

---

## Decisão

A Plataforma Aritech adotará uma trilha de auditoria centralizada, imutável para
usuários comuns e integrada aos módulos de negócio.

A auditoria deverá registrar eventos relevantes realizados por:

- usuários humanos;
- administradores;
- integrações;
- tarefas programadas;
- rotinas automáticas;
- processos internos.

A trilha de auditoria deverá possuir, conforme o tipo de evento:

- identificador único;
- data e hora;
- usuário ou identidade técnica;
- sessão;
- módulo;
- operação;
- entidade;
- identificador da entidade;
- valor anterior;
- valor posterior;
- origem;
- justificativa;
- identificador da requisição;
- integração ou rotina responsável;
- resultado;
- empresa;
- projeto ou contexto relacionado.

Os registros de auditoria não poderão ser alterados ou excluídos por usuários
comuns.

---

## 1. Objetivos da auditoria

A trilha de auditoria deverá apoiar:

- rastreabilidade;
- segurança;
- investigação de incidentes;
- controle interno;
- conformidade;
- revisão de acessos;
- análise de erros;
- prestação de contas;
- validação de operações financeiras;
- análise histórica;
- defesa de direitos;
- confiabilidade das informações;
- suporte ao valuation e ao TCC.

A auditoria não deverá ser utilizada apenas como log técnico.

Ela deverá registrar o significado funcional das operações relevantes.

---

## 2. Diferença entre log e auditoria

### 2.1 Logs técnicos

Logs técnicos são registros utilizados principalmente para:

- diagnóstico;
- monitoramento;
- análise de falhas;
- desempenho;
- disponibilidade;
- observabilidade.

Exemplos:

- erro de conexão;
- tempo de resposta;
- falha em integração;
- início de processamento;
- exceção da aplicação.

### 2.2 Trilha de auditoria

A trilha de auditoria registra ações relevantes do negócio e da segurança.

Exemplos:

- pagamento aprovado;
- fornecedor alterado;
- dado bancário modificado;
- título cancelado;
- permissão concedida;
- período reaberto;
- valuation aprovado.

Logs e auditoria poderão se relacionar, mas não serão tratados como a mesma
estrutura.

---

## 3. Eventos auditáveis

Deverão ser auditados, no mínimo:

- criação;
- alteração;
- aprovação;
- rejeição;
- cancelamento;
- estorno;
- inativação;
- reativação;
- reabertura;
- fechamento;
- liquidação;
- conciliação;
- desconciliação;
- importação;
- exportação sensível;
- alteração de permissão;
- bloqueio de usuário;
- desbloqueio de usuário;
- alteração de configuração;
- alteração de dados bancários;
- criação de versão;
- aprovação de documento;
- exclusão lógica;
- execução de operação crítica.

Nem toda leitura comum precisará gerar auditoria.

Leituras de informações restritas poderão ser auditadas conforme o risco.

---

## 4. Estrutura mínima do registro

Cada evento deverá conter, quando aplicável:

- `id`;
- `occurred_at`;
- `actor_type`;
- `actor_id`;
- `user_id`;
- `service_account_id`;
- `session_id`;
- `request_id`;
- `module`;
- `action`;
- `entity_type`;
- `entity_id`;
- `company_id`;
- `project_id`;
- `source`;
- `result`;
- `reason`;
- `previous_values`;
- `new_values`;
- `metadata`;
- `ip_address`;
- `user_agent`;
- `integration_id`;
- `job_id`.

A nomenclatura definitiva será padronizada no modelo físico.

---

## 5. Ator da operação

O ator representa quem ou o que iniciou a operação.

Os tipos iniciais poderão ser:

- USER;
- ADMIN;
- SERVICE_ACCOUNT;
- INTEGRATION;
- SCHEDULED_JOB;
- SYSTEM;
- MIGRATION.

Quando a operação for executada por integração ou rotina automática, deverá ser
registrada a identidade técnica correspondente.

Operações automáticas não deverão aparecer como se tivessem sido realizadas por
um usuário humano.

---

## 6. Identificador da requisição

Cada requisição deverá possuir identificador de correlação.

Esse identificador permitirá relacionar:

- chamadas de API;
- logs técnicos;
- eventos de auditoria;
- integrações;
- processamento assíncrono;
- falhas;
- notificações;
- transações.

O mesmo identificador poderá acompanhar uma operação entre diferentes módulos.

---

## 7. Origem da operação

A origem deverá indicar o canal pelo qual a ação foi iniciada.

Exemplos:

- WEB;
- API;
- IMPORT;
- INTEGRATION;
- SCHEDULED_JOB;
- ADMIN_TOOL;
- MIGRATION;
- MOBILE;
- MANUAL_PROCESS.

A origem ajudará a distinguir operações realizadas pela interface de operações
geradas por processos externos.

---

## 8. Resultado da operação

O evento deverá informar o resultado.

Exemplos:

- SUCCESS;
- FAILURE;
- DENIED;
- PARTIAL;
- CANCELLED.

Operações negadas por falta de permissão poderão gerar evento de segurança,
especialmente quando envolverem funções críticas.

Falhas não deverão registrar dados sensíveis desnecessários.

---

## 9. Valores anteriores e posteriores

Alterações relevantes deverão registrar:

- valores anteriores;
- valores posteriores;
- campos alterados.

Esses dados poderão ser armazenados em estrutura JSON controlada.

A auditoria não deverá armazenar indiscriminadamente toda a entidade em todas as
operações.

Deverão ser registrados somente os dados necessários para rastreabilidade.

---

## 10. Proteção de dados sensíveis

A auditoria não deverá registrar em texto aberto:

- senhas;
- tokens;
- chaves de API;
- segredos;
- códigos de autenticação;
- dados completos de cartão;
- dados bancários completos quando desnecessários;
- documentos pessoais completos;
- conteúdo integral de documentos confidenciais.

Campos sensíveis poderão ser:

- omitidos;
- mascarados;
- substituídos por indicação de alteração;
- protegidos por criptografia adicional;
- armazenados por hash quando apropriado.

Exemplo:

```text
bank_account:
  previous: ****1234
  current: ****9876
## 11. Justificativa

Operações críticas deverão exigir justificativa.

Exemplos:

- cancelamento;
- estorno;
- alteração de título liquidado;
- reabertura de período;
- alteração de dado bancário;
- exclusão lógica;
- alteração manual de saldo;
- alteração de valuation aprovado;
- concessão excepcional de permissão.

A justificativa deverá ser registrada no evento de auditoria.

---

## 12. Aprovação

Quando uma operação depender de aprovação, a auditoria deverá registrar:

- solicitante;
- aprovador;
- data da solicitação;
- data da decisão;
- decisão;
- observação;
- regra de alçada;
- valor;
- versão aprovada;
- níveis de aprovação.

A criação da solicitação e a decisão de aprovação deverão ser eventos distintos.

---

## 13. Operações financeiras

As operações financeiras deverão possuir auditoria reforçada.

Deverão ser auditados:

- criação de título;
- alteração de título;
- alteração de vencimento;
- alteração de valor;
- alteração de fornecedor ou cliente;
- aprovação;
- baixa;
- pagamento;
- recebimento;
- transferência;
- conciliação;
- desconciliação;
- estorno;
- cancelamento;
- ajuste;
- alteração de conta bancária;
- reabertura de período.

A auditoria deverá permitir reconstruir a sequência de eventos do lançamento.

---

## 14. Alteração de dados bancários

Toda alteração de dados bancários deverá registrar:

- entidade afetada;
- usuário;
- data;
- valor anterior mascarado;
- valor posterior mascarado;
- justificativa;
- aprovação, quando exigida;
- origem;
- resultado;
- notificação gerada, quando aplicável.

Essa operação deverá possuir nível de criticidade elevado.

---

## 15. Operações de identidade e acesso

Deverão ser auditados:

- criação de usuário;
- ativação;
- inativação;
- bloqueio;
- desbloqueio;
- redefinição de senha;
- ativação de MFA;
- remoção de MFA;
- concessão de perfil;
- remoção de perfil;
- concessão de permissão;
- remoção de permissão;
- criação de conta técnica;
- revogação de sessão;
- concessão de acesso temporário.

A auditoria não deverá registrar a senha ou o segredo utilizado.

---

## 16. Operações documentais

Deverão ser auditados, conforme a classificação:

- upload;
- criação de versão;
- download;
- visualização de documento restrito;
- alteração de categoria;
- alteração de classificação;
- vinculação;
- desvinculação;
- inativação;
- restauração;
- exclusão física;
- compartilhamento temporário;
- exportação.

O conteúdo integral do documento não deverá ser copiado para a auditoria.

---

## 17. Valuation

O módulo de valuation deverá registrar:

- criação;
- alteração de premissa;
- alteração de cenário;
- execução de cálculo;
- geração de versão;
- comparação;
- aprovação;
- exportação;
- cancelamento;
- substituição.

Uma versão aprovada não deverá ser alterada.

Nova alteração deverá gerar nova versão e novos eventos.

---

## 18. Marketing e Comercial

Deverão ser auditadas, conforme relevância:

- criação de campanha;
- alteração de investimento;
- importação de indicadores;
- alteração da origem do lead;
- qualificação;
- conversão em oportunidade;
- alteração de valor da oportunidade;
- alteração da probabilidade;
- criação e revisão de proposta;
- marcação como ganha ou perdida;
- conversão em contrato.

A origem comercial não deverá ser alterada sem histórico.

---

## 19. Integrações

As integrações deverão registrar:

- início da execução;
- término;
- resultado;
- quantidade de registros;
- registros aceitos;
- registros rejeitados;
- duplicidades;
- identificador externo;
- erros;
- reprocessamentos;
- usuário ou conta técnica;
- arquivo de origem, quando aplicável.

Eventos de integração não deverão expor credenciais.

---

## 20. Importações

Cada lote de importação deverá possuir auditoria própria.

A auditoria deverá permitir identificar:

- arquivo;
- responsável;
- data;
- origem;
- quantidade;
- regras utilizadas;
- registros criados;
- registros alterados;
- registros rejeitados;
- falhas;
- reversões.

A reversão de uma importação deverá gerar novos eventos, sem apagar os anteriores.

---

## 21. Operações automáticas

Tarefas programadas e automações deverão gerar auditoria quando alterarem dados.

Exemplos:

- atualização de indicador;
- geração de parcela;
- envio de notificação crítica;
- fechamento automático;
- importação bancária;
- sincronização de lead;
- atualização de status;
- recálculo de valuation.

A identidade da rotina deverá ser registrada.

---

## 22. Imutabilidade

Registros de auditoria não deverão ser editáveis.

Usuários comuns não poderão:

- alterar;
- excluir;
- sobrescrever;
- ocultar;
- reclassificar eventos.

Correções na própria auditoria deverão ocorrer por evento adicional, nunca pela
alteração do evento original.

---

## 23. Controle de acesso

A consulta da auditoria deverá ser restrita.

Os perfis poderão incluir:

- Auditoria;
- Administração de Segurança;
- Direção;
- Controladoria;
- responsável autorizado.

O acesso deverá considerar:

- módulo;
- empresa;
- projeto;
- classificação;
- tipo de evento;
- sensibilidade.

Um administrador técnico não deverá receber automaticamente acesso irrestrito ao
conteúdo funcional da auditoria.

---

## 24. Exportação

A exportação de registros de auditoria deverá exigir:

- permissão específica;
- filtros;
- justificativa quando aplicável;
- registro da própria exportação;
- proteção do arquivo;
- classificação adequada.

O arquivo exportado deverá conter somente os dados autorizados.

---

## 25. Retenção

A trilha de auditoria deverá possuir política de retenção.

O período deverá considerar:

- necessidade operacional;
- obrigações legais;
- obrigações contratuais;
- controle financeiro;
- investigação;
- defesa de direitos;
- custo de armazenamento.

A política definitiva será definida posteriormente.

Eventos financeiros, de segurança e de valuation poderão possuir retenção maior.

---

## 26. Arquivamento

Registros antigos poderão ser movidos para armazenamento de menor custo.

O arquivamento deverá preservar:

- integridade;
- possibilidade de consulta;
- ordenação;
- identificação;
- segurança;
- rastreabilidade;
- relação com as entidades.

O arquivamento não deverá significar perda de dados.

---

## 27. Integridade da auditoria

A plataforma deverá adotar mecanismos para detectar alterações indevidas.

Poderão ser avaliados:

- permissões restritas;
- banco ou schema separado;
- conta de escrita exclusiva;
- hash;
- encadeamento de hashes;
- assinatura;
- armazenamento externo;
- cópias imutáveis;
- retenção protegida.

A estratégia inicial poderá utilizar o mesmo PostgreSQL com controles rígidos,
evoluindo conforme a criticidade.

---

## 28. Escrita da auditoria

A aplicação deverá possuir mecanismo centralizado para gravação dos eventos.

Os módulos não deverão implementar formatos incompatíveis.

Poderão existir:

- serviço de auditoria;
- interceptor;
- middleware;
- eventos de domínio;
- decoradores;
- chamadas explícitas para operações críticas.

A gravação da auditoria deverá fazer parte do desenho da operação, não ser
adicionada apenas posteriormente.

---

## 29. Auditoria e transações

Quando a auditoria representar uma alteração concluída, ela deverá ser gravada
de forma consistente com a operação principal.

Sempre que possível, o evento deverá estar na mesma transação do banco.

Quando isso não for possível, deverão existir mecanismos para evitar perda do
evento, como:

- outbox transacional;
- fila confiável;
- reprocessamento;
- reconciliação.

A estratégia inicial será definida durante a implementação.

---

## 30. Eventos de tentativa

Nem todo evento de auditoria representa uma alteração concluída.

Poderão ser registrados eventos como:

- tentativa negada;
- aprovação rejeitada;
- operação cancelada;
- falha de integração;
- login recusado.

Esses eventos deverão indicar claramente o resultado.

---

## 31. Histórico funcional

A auditoria não substituirá o histórico funcional das entidades.

Exemplos:

- versões de proposta;
- versões de contrato;
- versões de documento;
- versões de orçamento;
- versões de valuation;
- estados de aprovação.

O histórico funcional representa a evolução da entidade.

A auditoria registra quem realizou cada ação e quando.

Os dois mecanismos serão complementares.

---

## 32. Consulta

A interface de consulta deverá permitir filtros como:

- período;
- usuário;
- módulo;
- ação;
- entidade;
- identificador;
- projeto;
- empresa;
- resultado;
- origem;
- criticidade.

A consulta deverá utilizar paginação.

Grandes volumes não deverão ser carregados integralmente.

---

## 33. Linha do tempo da entidade

A plataforma poderá apresentar uma linha do tempo por entidade.

Exemplo para um título financeiro:

```text
Título criado
→ parcelas geradas
→ título aprovado
→ vencimento alterado
→ pagamento registrado
→ conciliação realizada
→ estorno executado
## 34. Criticidade dos eventos

Os eventos poderão ser classificados por criticidade.

Exemplos:

- LOW;
- MEDIUM;
- HIGH;
- CRITICAL.

Eventos de alta criticidade poderão incluir:

- mudança de dados bancários;
- alteração de permissão administrativa;
- pagamento;
- estorno;
- reabertura de período;
- exclusão física;
- exportação de dados restritos;
- remoção de MFA;
- aprovação de valuation.

A criticidade poderá orientar alertas e retenção.

---

## 35. Alertas

Determinados eventos poderão gerar alertas.

Exemplos:

- alteração de conta bancária;
- várias tentativas de acesso;
- concessão de perfil administrativo;
- exportação massiva;
- reabertura de período;
- estorno de alto valor;
- download de documento restrito;
- falha repetida de integração.

A geração do alerta não deverá alterar o evento original.

---

## 36. Desempenho

A auditoria poderá gerar grande volume de dados.

Deverão ser considerados:

- índices;
- paginação;
- particionamento futuro;
- arquivamento;
- retenção;
- consultas por período;
- escrita eficiente;
- campos JSON controlados.

O registro de auditoria não deverá prejudicar excessivamente as operações
principais.

---

## 37. Particionamento

O particionamento não será obrigatório no MVP.

Poderá ser avaliado quando houver grande volume de eventos.

Possíveis critérios:

- período;
- empresa;
- tipo de evento.

A adoção deverá ser justificada por métricas reais.

---

## 38. Dados derivados

Relatórios e indicadores de auditoria poderão ser calculados a partir dos eventos.

Exemplos:

- quantidade de estornos;
- alterações de dados bancários;
- acessos negados;
- usuários bloqueados;
- operações por módulo;
- alterações fora de horário;
- exportações sensíveis;
- falhas de integração.

Os relatórios derivados não deverão substituir os eventos originais.

---

## 39. Privacidade

A consulta da auditoria deverá respeitar a privacidade e a necessidade de acesso.

O fato de um dado estar em auditoria não significa que ele poderá ser consultado
por qualquer administrador.

Campos pessoais e sensíveis deverão continuar protegidos.

---

## 40. Alternativas consideradas

### Auditoria apenas por logs da aplicação

Essa alternativa foi rejeitada porque logs técnicos:

- podem ser removidos;
- não possuem estrutura funcional adequada;
- podem não registrar valores anteriores;
- podem não estar vinculados às entidades;
- não oferecem garantia suficiente de rastreabilidade.

### Auditoria apenas por triggers do banco

Triggers foram considerados, mas não serão a única estratégia.

Eles conseguem detectar alterações no banco, porém podem não identificar
adequadamente:

- intenção da operação;
- justificativa;
- usuário funcional;
- aprovação;
- contexto;
- origem;
- regra de negócio.

Triggers poderão ser utilizados como proteção complementar.

### Auditoria completa de todas as leituras

Essa alternativa não será adotada inicialmente porque poderia gerar:

- alto volume;
- custo;
- complexidade;
- baixo valor para leituras comuns.

Leituras sensíveis poderão ser auditadas de forma seletiva.

### Alteração dos registros de auditoria para correção

Essa alternativa foi rejeitada porque comprometeria a confiabilidade.

Correções deverão ocorrer por eventos complementares.

---

## 41. Consequências positivas

A decisão proporciona:

- rastreabilidade;
- maior confiança;
- suporte a investigação;
- controle de operações financeiras;
- análise histórica;
- apoio a auditorias;
- revisão de acessos;
- segurança;
- transparência;
- suporte ao valuation.

---

## 42. Consequências negativas

A decisão também gera:

- aumento do volume de dados;
- maior complexidade;
- necessidade de definir eventos;
- necessidade de mascarar dados;
- custo de armazenamento;
- necessidade de consultas especializadas;
- necessidade de retenção e arquivamento;
- impacto adicional nas operações de escrita.

---

## 43. Riscos

Os principais riscos são:

- perda de evento;
- gravação incompleta;
- exposição de dados sensíveis;
- volume excessivo;
- falta de padronização;
- usuários com acesso excessivo;
- auditoria sem contexto;
- eventos duplicados;
- ausência de retenção;
- alteração indevida dos registros.

Os riscos deverão ser reduzidos por:

- serviço centralizado;
- transações;
- validação;
- mascaramento;
- controle de acesso;
- monitoramento;
- retenção;
- testes;
- revisão de código;
- reconciliação.

---

## 44. Regras obrigatórias

A implementação deverá respeitar:

1. auditoria centralizada;
2. registros imutáveis para usuários comuns;
3. identificação do ator;
4. registro de data e hora;
5. identificação do módulo e da entidade;
6. identificação da origem;
7. valores anteriores e posteriores quando aplicável;
8. justificativa para operações críticas;
9. proteção de dados sensíveis;
10. auditoria de operações financeiras;
11. auditoria de alterações de acesso;
12. auditoria de alterações bancárias;
13. auditoria de versões de valuation;
14. auditoria de integrações;
15. separação entre logs técnicos e auditoria;
16. consulta restrita;
17. exportação controlada;
18. política de retenção;
19. identificação de requisição;
20. preservação do evento original.

---

## 45. Requisitos mínimos do MVP

O MVP deverá auditar, no mínimo:

- login e bloqueio;
- criação e alteração de usuários;
- alteração de perfis e permissões;
- criação e alteração de clientes e fornecedores;
- alteração de dados bancários;
- criação de contratos e projetos;
- criação e alteração de títulos;
- pagamentos;
- recebimentos;
- conciliações;
- estornos;
- cancelamentos;
- fechamento e reabertura;
- upload e exclusão lógica de documentos;
- criação e aprovação de valuation;
- importações;
- integrações críticas.

---

## 46. Decisões pendentes

Ainda deverão ser definidos:

- estrutura física da tabela;
- estratégia de partição;
- formato dos valores anteriores e posteriores;
- campos que deverão ser mascarados;
- política de retenção;
- política de arquivamento;
- eventos de leitura auditáveis;
- níveis de criticidade;
- regras de alerta;
- estratégia de transação;
- utilização de outbox;
- utilização de hash encadeado;
- necessidade de schema separado;
- índices;
- interface de consulta;
- política de exportação;
- responsáveis pelo acesso;
- prazo de retenção por tipo de evento.

---

## 47. Critérios de revisão

Esta decisão deverá ser revisada quando:

- o volume de eventos crescer significativamente;
- houver necessidade de auditoria externa;
- ocorrer incidente de integridade;
- novas obrigações legais surgirem;
- houver necessidade de armazenamento imutável;
- o banco for separado por módulo;
- forem adotados microsserviços;
- houver necessidade de monitoramento avançado;
- a política de retenção for formalizada.

A revisão deverá ser registrada em novo ADR.

---

## 48. Referências internas

Esta decisão está relacionada a:

- `docs/architecture/ARCHITECTURE_OVERVIEW.md`;
- `docs/architecture/MODULES.md`;
- `docs/architecture/DATA_ARCHITECTURE.md`;
- `docs/architecture/SECURITY.md`;
- `docs/adr/ADR-001-modular-monolith.md`;
- `docs/adr/ADR-002-technology-stack.md`;
- `docs/adr/ADR-003-postgresql-and-prisma.md`;
- `docs/adr/ADR-004-authentication-and-authorization.md`;
- `docs/adr/ADR-005-document-storage.md`.