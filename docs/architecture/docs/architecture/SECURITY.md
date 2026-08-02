# Segurança da Plataforma Aritech

## 1. Objetivo

Este documento estabelece os princípios, controles e requisitos de segurança da
Plataforma Aritech.

A plataforma armazenará e processará informações financeiras, bancárias,
comerciais, contratuais, operacionais, estratégicas e pessoais da Aritech
Soluções Industriais.

A segurança deverá ser considerada desde a concepção da solução, abrangendo:

- usuários;
- aplicações;
- banco de dados;
- documentos;
- integrações;
- infraestrutura;
- código-fonte;
- ambientes;
- registros de auditoria;
- continuidade operacional.

Este documento define as diretrizes iniciais de segurança. Políticas operacionais
mais detalhadas poderão ser criadas conforme a evolução da plataforma.

---

## 2. Princípios de segurança

A segurança da Plataforma Aritech será orientada pelos seguintes princípios:

1. menor privilégio;
2. necessidade de acesso;
3. segregação de funções;
4. defesa em profundidade;
5. segurança por padrão;
6. rastreabilidade;
7. proteção de dados;
8. autenticação segura;
9. validação de todas as entradas;
10. prevenção de exposição de credenciais;
11. continuidade operacional;
12. atualização contínua;
13. tratamento seguro de falhas;
14. revisão periódica de acessos;
15. registro de operações críticas.

Os usuários deverão possuir apenas os acessos necessários para o exercício de
suas responsabilidades.

---

## 3. Escopo da segurança

As regras deste documento se aplicam a:

- aplicação web;
- API;
- banco de dados;
- armazenamento de documentos;
- integrações externas;
- rotinas automáticas;
- infraestrutura de hospedagem;
- repositórios de código;
- pipelines de implantação;
- ambientes de desenvolvimento;
- ambientes de homologação;
- ambiente de produção;
- estações administrativas;
- cópias de segurança;
- registros de auditoria.

---

## 4. Classificação das informações

As informações da plataforma deverão ser classificadas conforme seu nível de
sensibilidade.

### 4.1 Público

Informações que podem ser divulgadas externamente sem causar prejuízo.

Exemplos:

- conteúdos institucionais;
- materiais de marketing publicados;
- informações comerciais públicas;
- dados disponíveis no site da Aritech.

### 4.2 Interno

Informações destinadas ao uso interno, mas que não representam alto risco em
caso de divulgação limitada.

Exemplos:

- procedimentos internos;
- cadastros gerais;
- comunicações administrativas;
- informações operacionais não sensíveis.

### 4.3 Confidencial

Informações cuja divulgação indevida poderá causar prejuízos comerciais,
financeiros ou operacionais.

Exemplos:

- propostas;
- contratos;
- preços;
- margens;
- informações de clientes;
- informações de fornecedores;
- projetos;
- relatórios gerenciais;
- campanhas ainda não divulgadas.

### 4.4 Restrito

Informações que exigem o mais alto nível de proteção.

Exemplos:

- credenciais;
- tokens;
- chaves de API;
- dados bancários;
- remunerações;
- documentos pessoais;
- informações financeiras detalhadas;
- valuation;
- dados estratégicos;
- trilhas de auditoria;
- configurações de segurança.

O acesso às informações classificadas como confidenciais ou restritas deverá
ser concedido somente mediante necessidade comprovada.

---

## 5. Identidade dos usuários

Cada usuário deverá possuir uma conta individual.

Não será permitido o compartilhamento de contas.

Cada conta deverá estar vinculada, quando aplicável, a:

- uma pessoa;
- uma função;
- uma área;
- um perfil de acesso;
- uma empresa;
- uma situação;
- um responsável pela autorização.

Os usuários deverão ser identificados de forma única.

Contas genéricas somente poderão ser utilizadas para integrações ou rotinas
automáticas, com controles específicos e sem acesso interativo comum.

---

## 6. Ciclo de vida dos usuários

O ciclo de vida das contas deverá contemplar:

- solicitação de acesso;
- aprovação;
- criação;
- definição de perfil;
- ativação;
- alteração de função;
- revisão de permissões;
- bloqueio;
- inativação;
- preservação do histórico.

A criação de um usuário deverá exigir autorização de responsável definido.

A mudança de função ou área deverá gerar revisão das permissões existentes.

Usuários desligados ou sem necessidade de acesso deverão ser bloqueados
imediatamente.

A inativação da conta não deverá excluir:

- registros históricos;
- aprovações realizadas;
- lançamentos efetuados;
- documentos incluídos;
- eventos de auditoria.

---

## 7. Autenticação

O acesso à plataforma deverá exigir autenticação.

O mecanismo deverá oferecer:

- identificação do usuário;
- validação segura da credencial;
- proteção contra tentativas repetidas;
- recuperação controlada de acesso;
- encerramento de sessões;
- revogação de sessões;
- autenticação multifator, conforme o risco.

A autenticação deverá ser centralizada no módulo de Identidade e Acesso.

Nenhum módulo deverá manter mecanismo próprio e independente de autenticação.

---

## 8. Política de senhas

Caso a plataforma utilize senhas próprias, deverão ser adotadas as seguintes
diretrizes:

- comprimento mínimo adequado;
- incentivo ao uso de frases-senha;
- proibição de senhas comuns ou comprometidas;
- armazenamento somente por hash seguro;
- proibição de armazenamento em texto simples;
- proibição de envio de senha por e-mail;
- recuperação por mecanismo temporário;
- invalidação de links de recuperação após o uso;
- bloqueio ou atraso progressivo após tentativas inválidas;
- possibilidade de alteração voluntária pelo usuário.

A senha não deverá ser exibida em logs, auditorias, mensagens de erro ou telas
administrativas.

Não deverá ser exigida alteração periódica sem motivo, salvo em caso de:

- suspeita de comprometimento;
- vazamento;
- redefinição administrativa;
- alteração de política;
- exigência específica de segurança.

---

## 9. Autenticação multifator

A autenticação multifator deverá ser obrigatória, no mínimo, para:

- administradores;
- usuários com acesso financeiro amplo;
- usuários com acesso a dados bancários;
- usuários autorizados a aprovar pagamentos;
- usuários autorizados a alterar permissões;
- usuários com acesso ao valuation;
- acessos administrativos à infraestrutura.

A aplicação poderá ampliar gradualmente a autenticação multifator para todos os
usuários.

---

## 10. Sessões e tokens

As sessões deverão possuir:

- identificador único;
- data de criação;
- data de expiração;
- usuário relacionado;
- mecanismo de revogação;
- registro do último uso;
- origem, quando aplicável.

Tokens de acesso deverão possuir duração limitada.

Tokens de renovação deverão ser protegidos e poderão ser revogados.

A plataforma deverá permitir:

- encerramento da sessão atual;
- encerramento de todas as sessões do usuário;
- revogação administrativa;
- expiração por inatividade;
- expiração absoluta;
- bloqueio após alteração de credencial.

Tokens não deverão ser armazenados em locais inseguros no navegador.

---

## 11. Autorização

A autorização deverá ocorrer no backend.

A interface poderá ocultar funções não autorizadas, mas essa ocultação não
substitui a validação realizada pela API.

O modelo inicial deverá considerar:

- perfil;
- módulo;
- operação;
- empresa;
- projeto;
- área;
- nível de confidencialidade;
- situação do processo.

As operações poderão incluir:

- visualizar;
- criar;
- editar;
- excluir logicamente;
- aprovar;
- rejeitar;
- cancelar;
- estornar;
- reabrir;
- exportar;
- administrar.

Toda operação protegida deverá validar a autorização antes de ser executada.

---

## 12. Perfis de acesso

Os perfis iniciais poderão incluir:

- Administrador da Plataforma;
- Direção;
- Financeiro;
- Controladoria;
- Comercial;
- Marketing;
- Gestor de Projetos;
- Compras;
- Engenharia e Produção;
- Consulta;
- Contabilidade Externa;
- Auditoria.

Os nomes e permissões definitivos serão definidos em documento específico.

Um usuário poderá possuir mais de um perfil, desde que autorizado.

A plataforma deverá evitar combinações de permissões que gerem conflitos
inaceitáveis.

---

## 13. Segregação de funções

A plataforma deverá permitir separar atividades incompatíveis.

Exemplos de funções que poderão exigir segregação:

- cadastrar fornecedor;
- alterar dados bancários do fornecedor;
- criar conta a pagar;
- aprovar conta a pagar;
- realizar pagamento;
- conciliar pagamento;
- cancelar pagamento;
- alterar permissões;
- consultar auditoria;
- aprovar valuation;
- reabrir período gerencial.

Na fase inicial, uma mesma pessoa poderá exercer mais de uma função devido ao
porte da Aritech.

Nesses casos, a plataforma deverá:

- registrar a acumulação de funções;
- manter auditoria;
- exigir justificativa quando aplicável;
- permitir revisão posterior;
- aplicar aprovação adicional em operações críticas.

---

## 14. Aprovações e alçadas

Operações críticas poderão depender de aprovação.

A arquitetura deverá permitir configurar aprovações por:

- tipo de operação;
- valor;
- categoria;
- projeto;
- centro de custo;
- área;
- usuário solicitante;
- risco;
- situação.

Exemplos de operações que poderão exigir aprovação:

- pedido de compra;
- alteração de dados bancários;
- conta a pagar;
- pagamento;
- desconto relevante;
- cancelamento de recebimento;
- estorno;
- reabertura de período;
- ajuste gerencial;
- alteração de valuation;
- exportação de dados restritos.

As regras de alçada serão definidas em documento específico.

A aprovação deverá registrar:

- aprovador;
- data e hora;
- decisão;
- observação;
- valor aprovado;
- versão do registro;
- regra utilizada.

---

## 15. Operações financeiras críticas

As seguintes operações deverão possuir controles reforçados:

- criação ou alteração de conta bancária;
- criação ou alteração de dados bancários de fornecedor;
- pagamento;
- recebimento;
- transferência;
- estorno;
- cancelamento;
- baixa manual;
- conciliação manual;
- ajuste de saldo;
- reabertura de período;
- alteração de título liquidado.

Essas operações deverão, conforme o risco:

- exigir permissão específica;
- gerar auditoria;
- solicitar justificativa;
- exigir aprovação;
- registrar valores anteriores e posteriores;
- impedir exclusão física.

---

## 16. Alteração de dados bancários

A alteração de dados bancários de clientes, fornecedores ou da própria empresa
deverá ser tratada como operação crítica.

O processo deverá considerar:

- permissão específica;
- registro do valor anterior;
- registro do valor posterior;
- identificação do responsável;
- data e hora;
- justificativa;
- aprovação adicional, quando aplicável;
- notificação aos responsáveis;
- período de validação, quando necessário.

Informações bancárias não deverão ser alteradas automaticamente com base apenas
em documentos recebidos por e-mail.

---

## 17. Validação de dados de entrada

Todas as entradas deverão ser validadas no backend.

A validação deverá contemplar:

- tipo;
- formato;
- tamanho;
- obrigatoriedade;
- faixa permitida;
- integridade;
- relacionamento;
- situação;
- permissão;
- conteúdo potencialmente malicioso.

A aplicação deverá proteger-se contra:

- injeção de comandos;
- injeção de SQL;
- execução de scripts;
- manipulação de parâmetros;
- upload de arquivos maliciosos;
- requisições indevidas;
- repetição de operações;
- alteração de identificadores.

A validação do frontend será complementar e não substituirá a validação do
backend.

---

## 18. Proteção contra duplicidade de operações

Operações financeiras e integrações deverão possuir mecanismos para evitar
execução duplicada.

A plataforma deverá considerar:

- identificadores únicos;
- chaves de idempotência;
- validação de documentos;
- identificadores externos;
- controle de estado;
- transações;
- bloqueios adequados;
- registro de tentativas.

Exemplos:

- pagamento enviado duas vezes;
- título importado duas vezes;
- movimentação bancária duplicada;
- lead criado repetidamente;
- pedido processado mais de uma vez.

---

## 19. Segurança da API

A API deverá:

- exigir autenticação nas rotas protegidas;
- validar autorização;
- utilizar comunicação criptografada;
- validar entradas;
- limitar tamanho de requisições;
- limitar tentativas abusivas;
- controlar origens autorizadas;
- não expor detalhes internos em erros;
- registrar eventos relevantes;
- possuir documentação controlada;
- proteger rotas administrativas.

Endpoints públicos deverão ser minimizados.

A exposição de documentação da API em produção deverá ser controlada.

---

## 20. Segurança da aplicação web

A aplicação web deverá adotar controles para:

- impedir execução de conteúdo não confiável;
- proteger sessões;
- proteger formulários;
- evitar envio indevido de dados;
- controlar recursos externos;
- impedir incorporação não autorizada;
- reduzir exposição de informações;
- ocultar detalhes internos da aplicação.

Informações sensíveis não deverão ser armazenadas de forma desnecessária no
navegador.

A interface não deverá exibir:

- credenciais;
- tokens;
- segredos;
- detalhes técnicos internos;
- informações não autorizadas.

---

## 21. Criptografia em trânsito

Toda comunicação entre usuários, aplicações e serviços deverá utilizar conexão
criptografada.

A exigência se aplica a:

- acesso web;
- API;
- banco de dados;
- armazenamento de documentos;
- integrações externas;
- ferramentas administrativas;
- transferência de backups.

Conexões não criptografadas não deverão ser permitidas no ambiente de produção,
salvo situações internas tecnicamente controladas e justificadas.

---

## 22. Criptografia em repouso

Informações sensíveis deverão ser protegidas quando armazenadas.

A infraestrutura deverá oferecer criptografia, quando aplicável, para:

- banco de dados;
- armazenamento de documentos;
- volumes;
- backups;
- segredos;
- logs sensíveis.

Campos especialmente sensíveis poderão receber proteção adicional.

Exemplos:

- dados bancários;
- documentos pessoais;
- tokens;
- credenciais externas;
- chaves privadas.

As chaves de criptografia deverão ser protegidas separadamente dos dados.

---

## 23. Credenciais e segredos

Credenciais não deverão ser incluídas no código-fonte.

São considerados segredos:

- senhas;
- tokens;
- chaves de API;
- chaves privadas;
- credenciais bancárias;
- credenciais de banco de dados;
- segredos de autenticação;
- certificados;
- strings de conexão.

Os segredos deverão ser armazenados em:

- variáveis de ambiente protegidas;
- cofre de segredos;
- serviço gerenciado equivalente.

Arquivos `.env` reais não deverão ser enviados ao GitHub.

O repositório poderá conter um arquivo de exemplo:

```text
.env.example
Esse arquivo deverá conter somente os nomes das variáveis, sem valores reais.

24. Repositório GitHub

O repositório deverá seguir as seguintes regras:

não armazenar credenciais;
não armazenar dados financeiros reais;
não armazenar informações pessoais reais;
não armazenar documentos confidenciais;
não armazenar arquivos de produção;
utilizar revisão de código;
proteger a branch principal;
impedir alterações diretas não autorizadas;
exigir validações automáticas;
registrar decisões relevantes em commits;
manter dependências atualizadas.

A branch principal deverá representar código aprovado.

Alterações deverão ocorrer preferencialmente por:

branch de trabalho
→ pull request
→ revisão
→ testes
→ aprovação
→ merge
25. Proteção de branches

A branch principal deverá, quando o projeto iniciar o desenvolvimento de código,
possuir regras de proteção.

As regras poderão incluir:

exigência de pull request;
exigência de aprovação;
exigência de testes aprovados;
bloqueio de push forçado;
bloqueio de exclusão;
exigência de resolução de comentários;
restrição de administradores autorizados;
validação de conflitos.

No início do projeto, as regras poderão ser adaptadas ao tamanho da equipe, mas
a rastreabilidade deverá ser preservada.

26. Dependências de software

As dependências deverão ser:

conhecidas;
necessárias;
mantidas;
atualizadas;
avaliadas quanto à segurança;
compatíveis com suas licenças.

A plataforma deverá possuir mecanismos automáticos para identificar:

vulnerabilidades conhecidas;
versões desatualizadas;
dependências abandonadas;
alterações de integridade.

Dependências sem manutenção ou com risco relevante deverão ser substituídas.

27. Desenvolvimento seguro

O desenvolvimento deverá considerar:

revisão de código;
validação de entradas;
tratamento seguro de erros;
testes automatizados;
análise de dependências;
separação entre configurações e código;
proibição de segredos no repositório;
controle de permissões;
auditoria de operações críticas;
proteção contra acesso indevido;
documentação das decisões.

Funcionalidades sensíveis deverão ser revisadas antes da implantação.

28. Ambientes

A plataforma deverá possuir ambientes separados para:

desenvolvimento;
homologação;
produção.

Os ambientes não deverão compartilhar, sem controle:

credenciais;
bancos de dados;
documentos;
tokens;
integrações;
chaves;
usuários administrativos.

Dados reais de produção não deverão ser copiados para desenvolvimento sem
tratamento adequado.

Quando forem necessários dados para testes, deverão ser utilizados:

dados fictícios;
dados anonimizados;
amostras controladas.
29. Produção

O ambiente de produção deverá possuir controles mais restritivos.

O acesso administrativo deverá ser limitado.

Alterações deverão ocorrer preferencialmente por processo automatizado de
implantação.

Mudanças manuais deverão:

ser excepcionais;
possuir autorização;
ser documentadas;
gerar registro;
ser posteriormente incorporadas à configuração controlada.
30. Banco de dados

O banco de dados deverá possuir:

usuários individuais ou identidades de serviço;
privilégios mínimos;
conexão criptografada;
backups;
registro de falhas;
monitoramento;
controle de acesso;
separação entre aplicação e administração;
política de atualização;
proteção contra exposição pública.

A aplicação não deverá utilizar conta com privilégios administrativos gerais.

Migrações do banco deverão ser versionadas e revisadas.

31. Documentos e arquivos

O armazenamento de documentos deverá possuir:

controle de acesso;
criptografia;
links temporários;
validação do tipo de arquivo;
limite de tamanho;
verificação de integridade;
classificação;
histórico de versões;
política de retenção;
registro de acesso, quando necessário.

Os documentos não deverão ser disponibilizados por links públicos permanentes.

O acesso deverá ser autorizado pela aplicação ou por mecanismo equivalente.

32. Upload de arquivos

Uploads deverão ser controlados.

A plataforma deverá verificar:

extensão;
tipo real do arquivo;
tamanho;
nome;
conteúdo potencialmente malicioso;
usuário;
entidade relacionada;
classificação;
permissão.

Os arquivos deverão receber nomes internos controlados.

O nome fornecido pelo usuário deverá ser tratado apenas como metadado.

Arquivos executáveis ou tipos desnecessários deverão ser bloqueados.

33. Integrações externas

Cada integração deverá possuir:

identificação;
finalidade;
responsável;
credenciais próprias;
permissões mínimas;
registro de execução;
tratamento de erros;
controle de duplicidade;
possibilidade de revogação;
política de atualização;
limitação de chamadas;
monitoramento.

Uma integração não deverá utilizar credenciais pessoais quando houver identidade
técnica apropriada.

A indisponibilidade de uma integração externa não deverá comprometer funções
internas independentes.

34. Webhooks e eventos externos

Eventos recebidos de sistemas externos deverão ser validados.

A validação poderá considerar:

assinatura;
segredo;
origem;
identificador;
horário;
repetição;
integridade do conteúdo.

Eventos repetidos não deverão gerar operações duplicadas.

Eventos inválidos deverão ser rejeitados e registrados.

35. Serviços de inteligência artificial

Dados enviados a serviços de inteligência artificial deverão ser controlados.

Antes do envio, deverão ser avaliados:

finalidade;
necessidade;
sensibilidade;
confidencialidade;
dados pessoais;
retenção pelo fornecedor;
contrato;
permissões;
possibilidade de anonimização.

Informações restritas não deverão ser enviadas a serviços externos sem
autorização e controles adequados.

Resultados gerados por inteligência artificial não deverão executar operações
financeiras críticas sem validação humana e autorização.

36. Logs

A plataforma deverá registrar informações necessárias para:

diagnóstico;
segurança;
auditoria;
monitoramento;
investigação de falhas.

Os logs poderão conter:

data e hora;
nível;
serviço;
operação;
identificador da requisição;
usuário;
entidade;
resultado;
erro controlado.

Os logs não deverão conter:

senhas;
tokens completos;
chaves;
dados bancários completos;
documentos pessoais completos;
conteúdo confidencial desnecessário.
37. Auditoria

Operações críticas deverão gerar trilha de auditoria.

A auditoria deverá registrar:

usuário;
data e hora;
módulo;
operação;
entidade;
identificador;
valor anterior;
valor posterior;
origem;
justificativa;
sessão;
integração ou rotina responsável.

Os registros de auditoria deverão possuir proteção contra alteração.

Usuários comuns não poderão editar ou excluir a trilha de auditoria.

38. Monitoramento

A infraestrutura deverá monitorar, conforme a maturidade do projeto:

disponibilidade;
falhas;
uso de recursos;
erros da aplicação;
tentativas de acesso;
falhas de autenticação;
integrações;
backups;
filas;
tarefas automáticas;
desempenho.

Alertas deverão ser enviados para responsáveis definidos.

39. Tratamento de erros

As mensagens exibidas aos usuários deverão ser claras, mas não deverão revelar:

estrutura interna;
consultas;
nomes de tabelas;
caminhos de arquivos;
credenciais;
detalhes de infraestrutura;
rastros técnicos completos.

Os detalhes técnicos deverão ser registrados internamente para diagnóstico.

Erros não deverão deixar transações em estado inconsistente.

40. Backup

A plataforma deverá possuir cópias de segurança automatizadas.

Os backups deverão contemplar:

banco de dados;
documentos;
configurações críticas;
informações necessárias para restauração.

A política deverá definir:

frequência;
retenção;
local de armazenamento;
criptografia;
responsabilidade;
monitoramento;
procedimento de restauração.

A existência de backup não será suficiente sem testes periódicos de restauração.

41. Recuperação de desastre

A plataforma deverá possuir processo documentado para recuperação.

O processo deverá considerar:

indisponibilidade da aplicação;
perda do banco;
perda de documentos;
falha de implantação;
comprometimento de credenciais;
exclusão indevida;
corrupção de dados;
indisponibilidade do provedor.

Deverão ser definidos futuramente:

objetivo de tempo de recuperação;
objetivo de perda máxima de dados;
responsáveis;
ordem de recuperação;
critérios de validação;
comunicação do incidente.
42. Continuidade operacional

Os processos críticos da Aritech não deverão depender exclusivamente da
disponibilidade imediata da plataforma sem procedimento alternativo.

Para processos financeiros críticos, poderão ser definidos procedimentos
temporários para:

registro manual controlado;
aprovação emergencial;
armazenamento temporário;
posterior lançamento;
conciliação após restauração.

O uso de procedimento alternativo deverá ser documentado e regularizado no
sistema.

43. Gestão de incidentes

A Aritech deverá possuir um processo básico para tratamento de incidentes de
segurança.

O processo deverá contemplar:

identificação;
registro;
classificação;
contenção;
investigação;
correção;
recuperação;
comunicação;
análise das causas;
definição de melhorias.

Exemplos de incidentes:

acesso indevido;
vazamento;
credencial exposta;
arquivo malicioso;
alteração financeira suspeita;
indisponibilidade;
perda de dados;
integração comprometida;
envio indevido de informações.
44. Resposta a credencial comprometida

Em caso de suspeita de comprometimento, deverão ser consideradas:

revogação de sessões;
bloqueio do usuário;
troca de senha;
rotação de tokens;
rotação de chaves;
revisão dos acessos;
consulta da auditoria;
investigação das operações;
comunicação aos responsáveis;
correção da causa.

Credenciais expostas no GitHub deverão ser consideradas comprometidas mesmo que
o arquivo seja posteriormente excluído.

45. Revisão de acessos

Os acessos deverão ser revisados periodicamente.

A revisão deverá verificar:

usuários ativos;
usuários sem uso;
usuários desligados;
perfis acumulados;
permissões administrativas;
acessos financeiros;
acessos ao valuation;
contas técnicas;
credenciais de integração;
acessos de terceiros.

A periodicidade será definida conforme o risco e a maturidade da plataforma.

46. Acesso de terceiros

Contadores, consultores, auditores e outros terceiros deverão possuir acesso:

individual;
limitado;
temporário, quando aplicável;
autorizado;
rastreável;
revogável.

O acesso deverá ser restrito às informações necessárias.

O término da atividade deverá gerar revisão ou revogação do acesso.

47. Proteção de dados pessoais

O tratamento de dados pessoais deverá considerar:

finalidade;
necessidade;
minimização;
transparência;
segurança;
acesso restrito;
correção;
retenção;
anonimização;
exclusão conforme regras aplicáveis;
registro da origem;
rastreabilidade.

Dados pessoais sensíveis deverão possuir controles reforçados.

O acesso a remuneração, documentos pessoais e informações equivalentes deverá
ser restrito.

48. Retenção de dados

A plataforma deverá possuir política de retenção.

A retenção deverá considerar:

necessidade operacional;
obrigação legal;
obrigação contratual;
auditoria;
defesa de direitos;
segurança;
finalidade original.

Após o período de retenção, os dados poderão ser:

eliminados;
anonimizados;
arquivados;
preservados mediante justificativa.

A política detalhada será criada posteriormente.

49. Exportação de dados

Exportações deverão respeitar as permissões dos usuários.

Exportações sensíveis poderão exigir:

permissão específica;
justificativa;
aprovação;
marcação de confidencialidade;
registro de auditoria;
limitação de conteúdo;
proteção do arquivo.

O usuário não deverá conseguir exportar dados aos quais não possui acesso na
plataforma.

50. Segurança de relatórios

Relatórios deverão aplicar os mesmos controles de acesso dos dados de origem.

Relatórios não deverão permitir exposição indireta de informações restritas.

Consultas agregadas deverão ser avaliadas quando puderem revelar:

remuneração individual;
dados bancários;
margens confidenciais;
informações estratégicas;
dados pessoais.
51. Segurança de notificações

Notificações e e-mails não deverão expor informações sensíveis
desnecessariamente.

Mensagens poderão informar que existe uma pendência, direcionando o usuário à
plataforma para consultar o conteúdo protegido.

Links enviados por e-mail deverão:

possuir validade;
ser revogáveis;
evitar exposição de tokens;
exigir autenticação quando aplicável.
52. Testes de segurança

Antes da implantação de funcionalidades críticas, deverão ser realizados testes
compatíveis com o risco.

Os testes poderão incluir:

autenticação;
autorização;
validação de entradas;
acesso indevido;
upload;
sessão;
APIs;
integrações;
operações financeiras;
segregação entre usuários;
tratamento de erros;
recuperação de backup.

Vulnerabilidades identificadas deverão ser classificadas e corrigidas.

53. Atualizações e correções

A plataforma, infraestrutura e dependências deverão ser atualizadas de forma
controlada.

Atualizações deverão considerar:

risco;
compatibilidade;
testes;
possibilidade de reversão;
impacto operacional;
documentação;
janela de implantação.

Correções críticas de segurança deverão receber prioridade.

54. Segurança por fase do projeto
54.1 Fase de documentação

Nesta fase deverão ser definidos:

princípios;
classificação;
responsabilidades;
arquitetura;
perfis;
operações críticas;
requisitos de auditoria.
54.2 Fase de desenvolvimento

Deverão ser implementados:

autenticação;
autorização;
validação;
proteção de segredos;
logs;
auditoria;
testes;
análise de dependências.
54.3 Fase de homologação

Deverão ser avaliados:

permissões;
fluxos de aprovação;
segregação;
exposição de dados;
falhas;
backups;
restauração;
integrações.
54.4 Fase de produção

Deverão estar ativos:

conexão criptografada;
monitoramento;
backups;
alertas;
controle de acesso;
auditoria;
processo de incidentes;
implantação controlada.
55. Responsabilidades
55.1 Direção

A direção será responsável por:

aprovar diretrizes;
definir riscos aceitáveis;
autorizar acessos críticos;
aprovar alçadas;
apoiar resposta a incidentes relevantes.
55.2 Administração da plataforma

Será responsável por:

gerenciar usuários;
aplicar configurações;
acompanhar falhas;
manter controles;
revisar acessos;
apoiar auditorias.
55.3 Desenvolvimento

Será responsável por:

seguir práticas seguras;
proteger segredos;
corrigir vulnerabilidades;
manter dependências;
implementar validações;
preservar auditoria.
55.4 Usuários

Os usuários deverão:

proteger suas credenciais;
não compartilhar contas;
respeitar permissões;
comunicar incidentes;
evitar exportações indevidas;
utilizar a plataforma conforme sua finalidade.
55.5 Terceiros

Terceiros deverão respeitar:

finalidade autorizada;
confidencialidade;
restrições de acesso;
orientações de segurança;
encerramento do acesso.
56. Requisitos mínimos do MVP

O primeiro MVP deverá possuir, no mínimo:

autenticação;
usuários individuais;
bloqueio de usuários;
recuperação segura de acesso;
autorização no backend;
perfis e permissões;
comunicação criptografada;
senhas armazenadas por hash seguro;
proteção de segredos;
ambientes separados;
validação de entradas;
logs de erros;
auditoria de operações críticas;
exclusão lógica;
backup do banco;
controle de acesso aos documentos;
proteção de dados financeiros;
registro de alterações;
possibilidade de revogação de sessões.
57. Controles prioritários para o módulo financeiro

O módulo financeiro deverá priorizar:

permissão específica para pagamentos;
aprovação por alçada;
auditoria de alterações;
proteção dos dados bancários;
impedimento de exclusão de registros liquidados;
estornos rastreáveis;
justificativa para ajustes;
separação entre criação, aprovação e pagamento;
prevenção de duplicidade;
conciliação auditável;
fechamento de períodos;
controle de reabertura;
exportação restrita;
registro de importações bancárias.
58. Controles prioritários para o valuation

O módulo de valuation deverá possuir:

acesso restrito;
versões imutáveis após aprovação;
registro das premissas;
identificação dos responsáveis;
histórico de alterações;
documentos vinculados;
auditoria;
controle de exportação;
classificação como informação restrita;
criação de nova versão para qualquer alteração aprovada.
59. Controles prioritários para marketing e comercial

Os módulos de Marketing e Comercial deverão possuir:

controle de acesso aos dados dos leads;
registro da origem;
controle das preferências de comunicação;
restrição de exportações;
rastreabilidade de alterações;
proteção de dados pessoais;
controle de integrações externas;
gestão de consentimentos, quando aplicável;
prevenção de duplicidade;
política de retenção.
60. Decisões pendentes

Ainda deverão ser definidos:

provedor de identidade;
modelo definitivo de autenticação;
tecnologia de autenticação multifator;
duração das sessões;
política definitiva de senhas;
matriz de permissões;
perfis iniciais;
regras de alçada;
operações que exigirão dupla aprovação;
campos sujeitos a criptografia adicional;
provedor de armazenamento;
provedor de segredos;
política de backups;
tempo de retenção;
objetivos de recuperação;
política de incidentes;
periodicidade de revisão de acessos;
política de acesso de terceiros;
ferramentas de monitoramento;
ferramentas de análise de dependências;
controles do pipeline de implantação;
critérios de testes de segurança;
política de privacidade;
política de retenção e descarte;
responsáveis formais por segurança.
