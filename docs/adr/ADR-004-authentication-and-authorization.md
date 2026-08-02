# ADR-004 — Autenticação, Sessões e Autorização

## Status

Aceito.

## Data

2026-08-01.

## Contexto

A Plataforma Aritech armazenará e processará informações financeiras,
comerciais, contratuais, bancárias, pessoais e estratégicas.

Entre as operações previstas estão:

- cadastro de usuários;
- gestão de clientes e fornecedores;
- criação de contratos e projetos;
- lançamento de contas a pagar e receber;
- aprovação de compras;
- aprovação de pagamentos;
- conciliação bancária;
- fechamento gerencial;
- consulta de indicadores;
- elaboração e aprovação de valuations;
- gestão de campanhas e oportunidades;
- administração de permissões;
- consulta de trilhas de auditoria.

Foi necessário definir como a plataforma realizará:

- identificação dos usuários;
- autenticação;
- controle de sessões;
- recuperação de acesso;
- autenticação multifator;
- autorização;
- perfis e permissões;
- segregação de funções;
- acesso de terceiros;
- revogação de acessos;
- auditoria dos eventos de segurança.

---

## Decisão

A Plataforma Aritech adotará autenticação centralizada e autorização obrigatória
no backend.

A arquitetura utilizará inicialmente:

- contas individuais por usuário;
- autenticação baseada em credenciais;
- sessões controladas pela aplicação;
- tokens de acesso de curta duração;
- mecanismo de renovação controlada;
- revogação de sessões;
- perfis e permissões;
- controle de acesso por módulo e operação;
- autenticação multifator para perfis críticos;
- trilha de auditoria para eventos relevantes;
- proibição de contas compartilhadas.

A implementação deverá permitir futura integração com um provedor de identidade
externo compatível com padrões como OAuth 2.0 e OpenID Connect.

---

## 1. Identidade dos usuários

Cada usuário deverá possuir uma conta individual.

A conta deverá estar vinculada, quando aplicável, a:

- pessoa;
- colaborador;
- área;
- função;
- empresa;
- perfil;
- situação;
- responsável pela autorização.

O identificador interno do usuário deverá ser diferente do endereço de e-mail.

O e-mail poderá ser utilizado como nome de acesso, mas não deverá funcionar como
identificador técnico principal da entidade.

---

## 2. Contas compartilhadas

Contas compartilhadas não serão permitidas para usuários humanos.

Essa decisão busca garantir:

- identificação individual;
- responsabilização;
- rastreabilidade;
- revisão de acessos;
- revogação específica;
- auditoria confiável.

Contas técnicas poderão existir apenas para:

- integrações;
- tarefas programadas;
- serviços internos;
- processamento automático.

Essas contas não deverão ser utilizadas para acesso interativo comum.

---

## 3. Autenticação centralizada

A autenticação será responsabilidade exclusiva do módulo de Identidade e Acesso.

Nenhum outro módulo deverá:

- armazenar senhas próprias;
- implementar login independente;
- criar sessões paralelas;
- validar credenciais diretamente;
- ignorar o estado global do usuário.

Todos os módulos deverão confiar na identidade autenticada fornecida pela camada
central.

---

## 4. Modelo inicial de autenticação

Na primeira versão, a autenticação poderá utilizar:

- e-mail ou identificador de acesso;
- senha;
- segundo fator para perfis críticos;
- sessão controlada pela aplicação.

A arquitetura deverá manter a possibilidade de evolução para:

- autenticação corporativa;
- login federado;
- provedor externo de identidade;
- autenticação sem senha;
- chaves de segurança;
- passkeys.

A adoção futura não deverá exigir a reescrita das regras de autorização.

---

## 5. Senhas

Caso sejam utilizadas senhas locais, elas deverão:

- possuir comprimento mínimo adequado;
- ser armazenadas exclusivamente por hash seguro;
- utilizar sal individual;
- nunca ser armazenadas em texto simples;
- nunca ser registradas em logs;
- nunca ser exibidas por administradores;
- nunca ser enviadas por e-mail;
- ser validadas contra senhas comuns ou comprometidas;
- possuir recuperação por mecanismo temporário.

A implementação deverá utilizar algoritmo moderno e apropriado para hash de
senhas.

A escolha específica do algoritmo será realizada na fase de implementação,
considerando as recomendações vigentes.

---

## 6. Política de senhas

A política inicial deverá incentivar o uso de frases-senha.

A plataforma deverá considerar:

- comprimento como principal critério;
- bloqueio de senhas comuns;
- proibição de reutilização imediata, quando aplicável;
- proteção contra tentativas repetidas;
- redefinição em caso de comprometimento;
- alteração voluntária pelo usuário.

A troca periódica obrigatória não deverá ser exigida sem motivo específico.

A redefinição deverá ser obrigatória quando houver:

- suspeita de vazamento;
- comprometimento da conta;
- exposição de credenciais;
- redefinição administrativa;
- alteração relevante da política.

---

## 7. Recuperação de acesso

O processo de recuperação deverá:

- utilizar token temporário;
- possuir prazo de validade;
- permitir apenas uma utilização;
- invalidar solicitações anteriores quando aplicável;
- não revelar se um usuário existe;
- registrar o evento;
- revogar sessões existentes em situações de risco.

A redefinição não deverá enviar uma nova senha pronta ao usuário.

---

## 8. Autenticação multifator

A autenticação multifator será obrigatória, no mínimo, para:

- administradores;
- direção;
- usuários com acesso financeiro amplo;
- aprovadores de pagamentos;
- usuários autorizados a alterar dados bancários;
- usuários autorizados a administrar permissões;
- usuários com acesso a informações de valuation;
- usuários com acesso administrativo à infraestrutura.

A autenticação multifator poderá ser ampliada para todos os usuários conforme a
evolução da plataforma.

---

## 9. Métodos de segundo fator

Os métodos preferenciais deverão ser:

- aplicativo autenticador;
- passkey;
- chave de segurança;
- mecanismo equivalente aprovado.

Mensagens por SMS não deverão ser o método preferencial quando houver alternativas
mais seguras disponíveis.

A tecnologia específica será definida durante a implementação.

---

## 10. Sessões

Cada sessão deverá possuir:

- identificador;
- usuário;
- data de criação;
- data do último uso;
- data de expiração;
- situação;
- origem;
- mecanismo de revogação;
- informações mínimas do dispositivo, quando aplicável.

A plataforma deverá permitir:

- encerrar a sessão atual;
- encerrar todas as sessões do usuário;
- revogar sessões administrativamente;
- expirar por inatividade;
- expirar por tempo absoluto;
- revogar após mudança de senha;
- revogar após bloqueio do usuário.

---

## 11. Tokens de acesso

Tokens de acesso deverão possuir duração curta.

Eles deverão conter apenas as informações necessárias para identificar:

- usuário;
- sessão;
- emissor;
- público;
- expiração;
- identificador do token.

Informações sensíveis não deverão ser inseridas no conteúdo do token.

O token não deverá ser tratado como fonte permanente das permissões quando elas
puderem mudar durante a sessão.

---

## 12. Tokens de renovação

Tokens de renovação deverão:

- possuir duração maior que o token de acesso;
- ser armazenados de forma protegida;
- estar vinculados a uma sessão;
- poder ser revogados;
- permitir rotação;
- impedir reutilização indevida;
- ser invalidados em caso de comprometimento.

O armazenamento do token de renovação deverá evitar exposição por scripts do
navegador sempre que tecnicamente possível.

---

## 13. Armazenamento no navegador

Credenciais e tokens não deverão ser armazenados em locais inseguros.

A implementação deverá priorizar mecanismos protegidos, como cookies com:

- `HttpOnly`;
- `Secure`;
- política adequada de `SameSite`;
- escopo restrito;
- expiração definida.

A decisão definitiva sobre cookies e tokens será detalhada na implementação.

---

## 14. Autorização no backend

Toda autorização deverá ser validada pelo backend.

O frontend poderá:

- esconder menus;
- desabilitar botões;
- limitar opções;
- adaptar a interface.

Entretanto, essas medidas serão apenas auxiliares.

Nenhuma operação protegida poderá depender exclusivamente da interface.

---

## 15. Modelo de autorização

O modelo inicial combinará:

- controle por perfil;
- permissões por operação;
- restrições contextuais.

A autorização poderá considerar:

- usuário;
- perfil;
- módulo;
- operação;
- empresa;
- área;
- projeto;
- centro de custo;
- classificação do dado;
- estado do processo;
- valor da operação;
- regra de aprovação.

---

## 16. Perfis

Os perfis iniciais poderão incluir:

- Administrador da Plataforma;
- Direção;
- Financeiro;
- Controladoria;
- Marketing;
- Comercial;
- Gestor de Projetos;
- Compras;
- Engenharia e Produção;
- Consulta;
- Contabilidade Externa;
- Auditoria.

Os perfis representam agrupamentos de permissões.

Eles não deverão substituir permissões específicas quando o risco exigir maior
granularidade.

---

## 17. Permissões

As permissões deverão seguir uma convenção clara.

Exemplo conceitual:

```text
finance.payable.view
finance.payable.create
finance.payable.update
finance.payable.approve
finance.payment.execute
finance.payment.reverse
finance.bank-account.update
valuation.version.approve
identity.user.manage
audit.log.view
As permissões deverão ser legíveis, estáveis e associadas ao domínio responsável.

18. Operações padrão

Os módulos poderão utilizar operações padronizadas como:

visualizar;
criar;
editar;
inativar;
aprovar;
rejeitar;
cancelar;
estornar;
reabrir;
exportar;
administrar.

Operações críticas deverão possuir permissões próprias.

Por exemplo, a permissão de editar títulos financeiros não deverá conceder
automaticamente permissão para:

aprovar pagamento;
executar pagamento;
estornar pagamento;
alterar dados bancários;
reabrir período.
19. Escopo de acesso

Além da permissão funcional, o acesso poderá ser limitado por escopo.

Exemplos:

somente a própria empresa;
somente determinada área;
somente projetos sob responsabilidade do usuário;
somente determinado centro de custo;
somente informações consolidadas;
somente documentos de determinada classificação;
somente consulta.

Um usuário poderá possuir permissão para visualizar projetos, mas apenas dentro
do seu escopo autorizado.

20. Administradores

Administradores deverão possuir poderes técnicos, mas não necessariamente acesso
automático a todo conteúdo do negócio.

A arquitetura deverá distinguir:

administração técnica;
administração de usuários;
administração de permissões;
acesso financeiro;
acesso ao valuation;
acesso à auditoria.

Sempre que possível, o acesso administrativo deverá respeitar a necessidade de
conhecimento.

21. Segregação de funções

A autorização deverá permitir separar atividades incompatíveis.

Exemplos:

cadastrar fornecedor;
alterar dados bancários;
criar conta a pagar;
aprovar conta a pagar;
executar pagamento;
conciliar;
estornar;
reabrir período;
administrar permissões;
consultar auditoria.

A plataforma deverá identificar combinações críticas de permissões.

Na fase inicial, acumulações poderão existir devido ao tamanho da empresa, mas
deverão ser:

conhecidas;
autorizadas;
auditadas;
revisadas;
compensadas por controles adicionais.
22. Aprovações

A autorização não substitui regras de aprovação.

Um usuário poderá possuir permissão para solicitar uma operação, mas não para
aprová-la.

As aprovações poderão considerar:

valor;
categoria;
projeto;
centro de custo;
tipo de operação;
solicitante;
aprovador;
risco;
quantidade de níveis.

A plataforma deverá impedir que uma pessoa aprove sua própria solicitação quando
a regra exigir segregação.

23. Acesso a dados financeiros

O acesso financeiro deverá ser granular.

Deverão existir permissões distintas para:

consultar títulos;
criar títulos;
alterar títulos;
aprovar títulos;
consultar contas bancárias;
alterar contas bancárias;
registrar pagamentos;
aprovar pagamentos;
executar pagamentos;
conciliar;
estornar;
exportar;
consultar relatórios financeiros.

Dados bancários completos deverão ser restritos aos usuários necessários.

24. Acesso ao valuation

O módulo de valuation deverá possuir acesso restrito.

As permissões poderão distinguir:

visualizar;
criar;
editar rascunho;
criar cenário;
alterar premissa;
aprovar versão;
exportar;
comparar versões;
administrar metodologia.

Uma versão aprovada deverá permanecer imutável, independentemente das permissões
comuns de edição.

25. Acesso à auditoria

O acesso aos registros de auditoria deverá ser restrito.

Usuários com acesso poderão:

consultar;
filtrar;
exportar quando autorizado;
investigar eventos.

Eles não deverão poder:

alterar;
apagar;
sobrescrever;
ocultar eventos.

A administração da plataforma não deverá conceder automaticamente direito de
alteração da auditoria.

26. Acesso de terceiros

Contadores, consultores e auditores deverão possuir contas individuais.

O acesso deverá ser:

limitado;
temporário quando aplicável;
aprovado;
rastreável;
revogável;
restrito às informações necessárias.

O acesso de terceiros poderá possuir data de expiração automática.

27. Contas técnicas

Contas técnicas deverão possuir:

finalidade definida;
responsável;
permissões mínimas;
credencial própria;
mecanismo de rotação;
data de criação;
registro de uso;
possibilidade de revogação.

Essas contas não deverão utilizar senha de usuário humano.

Quando possível, deverão utilizar:

chave;
token técnico;
certificado;
identidade de serviço.
28. Bloqueio de usuários

Um usuário poderá ser bloqueado por:

ação administrativa;
desligamento;
excesso de tentativas inválidas;
suspeita de comprometimento;
violação de política;
término de acesso temporário;
inatividade prolongada.

O bloqueio deverá:

impedir novos acessos;
revogar sessões, quando aplicável;
preservar o histórico;
gerar auditoria;
registrar motivo e responsável.
29. Tentativas de autenticação

A plataforma deverá registrar tentativas relevantes de autenticação.

O sistema deverá aplicar controles contra ataques de força bruta, como:

limitação de tentativas;
atraso progressivo;
bloqueio temporário;
alerta;
desafio adicional;
monitoramento de comportamento anormal.

As mensagens não deverão revelar detalhes excessivos.

30. Eventos de segurança

Deverão gerar registros de segurança:

login bem-sucedido;
login recusado;
recuperação solicitada;
senha redefinida;
MFA ativado;
MFA removido;
sessão revogada;
usuário bloqueado;
usuário desbloqueado;
perfil alterado;
permissão concedida;
permissão removida;
acesso negado;
conta técnica criada;
acesso de terceiro concedido.
31. Auditoria de permissões

Alterações em acessos deverão registrar:

usuário afetado;
perfil anterior;
perfil posterior;
permissões anteriores;
permissões posteriores;
responsável;
data e hora;
justificativa;
aprovação, quando aplicável.

As alterações não deverão ser sobrescritas sem preservação do histórico.

32. Revisão periódica de acessos

Os acessos deverão ser revisados periodicamente.

A revisão deverá avaliar:

usuários ativos;
usuários sem uso;
usuários desligados;
perfis acumulados;
permissões críticas;
contas administrativas;
contas técnicas;
acessos de terceiros;
usuários sem responsável;
acessos temporários vencidos.

A periodicidade definitiva será estabelecida posteriormente.

33. Princípio do menor privilégio

Todo usuário deverá receber apenas o acesso necessário.

A concessão de acesso deverá considerar:

função atual;
área;
responsabilidade;
projeto;
necessidade;
período;
nível de sensibilidade.

Permissões não deverão ser concedidas apenas por conveniência.

34. Privilégios temporários

A plataforma deverá permitir concessões temporárias.

Exemplos:

substituição de férias;
atuação em projeto;
auditoria;
fechamento mensal;
suporte;
migração de dados.

A concessão deverá possuir:

início;
término;
responsável;
justificativa;
permissões;
auditoria.

Ao término, o acesso deverá expirar automaticamente quando possível.

35. Mudança de função

Mudanças de função, área ou responsabilidade deverão gerar revisão de acesso.

A plataforma deverá evitar o acúmulo histórico de permissões desnecessárias.

O processo deverá considerar:

remoção das permissões anteriores;
concessão das novas permissões;
validação pelo responsável;
registro da alteração;
revisão de conflitos.
36. Desligamento

Em caso de desligamento, deverão ser realizadas:

inativação da conta;
revogação das sessões;
revogação de tokens;
revogação de acessos externos;
rotação de credenciais compartilhadas eventualmente conhecidas;
preservação do histórico;
transferência de responsabilidades pendentes.

A ação deverá ocorrer no momento definido pelo processo de desligamento.

37. Tratamento de acesso negado

Quando o usuário tentar realizar uma operação não autorizada, a plataforma deverá:

impedir a operação;
apresentar mensagem adequada;
não revelar detalhes internos;
registrar o evento quando relevante;
manter o sistema em estado consistente.

A tentativa não deverá produzir alteração parcial.

38. Integração com provedor externo

A arquitetura deverá permitir futura utilização de um provedor externo de
identidade.

Nesse cenário, o provedor poderá ser responsável por:

autenticação;
recuperação de acesso;
MFA;
federação;
políticas de sessão;
proteção contra ataques.

A Plataforma Aritech continuará responsável por:

perfis;
permissões;
escopos;
regras de negócio;
segregação;
aprovações;
auditoria funcional.
39. Alternativas consideradas
Autenticação exclusiva pelo Next.js

Foi considerada a implementação de autenticação apenas na camada do frontend.

Essa alternativa foi rejeitada porque:

a autorização deve ser garantida pela API;
o backend poderá atender outros clientes;
regras financeiras não podem depender da interface;
aumenta o risco de acessos indevidos.
Tokens de longa duração sem sessão

Foi considerada a utilização de tokens de longa duração sem controle central de
sessão.

Essa alternativa foi rejeitada porque dificultaria:

revogação;
bloqueio;
encerramento remoto;
detecção de comprometimento;
controle por dispositivo.
Permissões apenas por perfil

Foi considerada a utilização exclusiva de perfis fixos.

Essa alternativa foi considerada insuficiente porque o sistema precisará de:

permissões específicas;
segregação;
escopos;
alçadas;
exceções controladas;
acesso temporário.
Contas compartilhadas por área

Foi considerada a utilização de contas comuns, como financeiro@....

Essa alternativa foi rejeitada por comprometer:

rastreabilidade;
responsabilização;
revogação;
auditoria;
segurança.
Provedor externo obrigatório desde o início

Foi considerada a adoção imediata de um serviço externo de identidade.

A decisão foi adiada porque ainda serão avaliados:

custos;
hospedagem;
quantidade de usuários;
requisitos;
integração;
operação.

A arquitetura permanecerá preparada para essa evolução.

40. Consequências positivas

A decisão proporciona:

rastreabilidade individual;
autorização centralizada;
maior proteção de operações financeiras;
revogação de sessões;
suporte a MFA;
segregação de funções;
revisão de acessos;
controle granular;
preparação para integração futura;
menor dependência da interface.
41. Consequências negativas

A decisão também gera:

maior complexidade de implementação;
necessidade de administrar sessões;
necessidade de modelar permissões;
necessidade de revisar acessos;
maior esforço de testes;
necessidade de fluxos de recuperação;
necessidade de gestão de MFA;
manutenção de regras de escopo.
42. Riscos

Os principais riscos são:

permissões excessivas;
usuários acumulando perfis;
falhas de autorização;
tokens expostos;
sessões não revogadas;
recuperação de acesso insegura;
administradores com acesso excessivo;
contas técnicas sem controle;
ausência de revisão periódica;
regras inconsistentes entre módulos.

Os riscos deverão ser reduzidos por:

testes;
revisão de código;
auditoria;
menor privilégio;
autorização centralizada;
MFA;
gestão de sessões;
revisão de acessos;
documentação.
43. Regras obrigatórias

A implementação deverá respeitar:

contas individuais para usuários humanos;
autenticação centralizada;
autorização obrigatória no backend;
sessões revogáveis;
tokens de acesso de curta duração;
MFA para perfis críticos;
proibição de senhas em texto simples;
perfis combinados com permissões;
escopos contextuais quando necessários;
auditoria de alterações de acesso;
segregação de operações críticas;
preservação do histórico de usuários inativos;
contas técnicas com privilégios mínimos;
recuperação por token temporário;
bloqueio e revogação em caso de comprometimento.
44. Decisões pendentes

Ainda deverão ser definidos:

provedor de identidade;
algoritmo de hash;
comprimento mínimo da senha;
duração do token de acesso;
duração da sessão;
duração do token de renovação;
política de rotação;
método de MFA;
estratégia definitiva de cookies;
matriz inicial de permissões;
perfis iniciais;
regras de escopo;
periodicidade da revisão de acessos;
política de bloqueio;
política de usuários inativos;
procedimento de desligamento;
política de acesso temporário;
tratamento de dispositivos confiáveis;
integração com diretório corporativo.
45. Critérios de revisão

Esta decisão deverá ser revisada quando:

for escolhido um provedor de identidade;
houver adoção de login federado;
houver exigência de autenticação corporativa;
a quantidade de usuários crescer significativamente;
ocorrer incidente de segurança relevante;
a política de acesso se tornar insuficiente;
houver necessidade de múltiplas empresas;
surgirem novos requisitos regulatórios;
houver adoção de aplicativo móvel.

A revisão deverá ser registrada em novo ADR.

46. Referências internas

Esta decisão está relacionada a:

docs/architecture/ARCHITECTURE_OVERVIEW.md;
docs/architecture/MODULES.md;
docs/architecture/DATA_ARCHITECTURE.md;
docs/architecture/SECURITY.md;
docs/adr/ADR-001-modular-monolith.md;
docs/adr/ADR-002-technology-stack.md;
docs/adr/ADR-003-postgresql-and-prisma.md.
