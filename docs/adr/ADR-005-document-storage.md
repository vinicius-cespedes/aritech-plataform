# ADR-005 — Armazenamento e Gestão de Documentos

## Status

Aceito.

## Data

2026-08-01.

## Contexto

A Plataforma Aritech deverá armazenar e relacionar documentos de diversas áreas
e processos da empresa.

Entre os principais documentos previstos estão:

- propostas comerciais;
- contratos;
- aditivos;
- pedidos de compra;
- cotações;
- notas fiscais;
- boletos;
- comprovantes de pagamento;
- comprovantes de recebimento;
- extratos bancários;
- documentos de clientes e fornecedores;
- documentos de colaboradores;
- relatórios;
- documentos técnicos;
- desenhos;
- memoriais;
- folhas de dados;
- registros de inspeção;
- documentos de valuation;
- planilhas;
- arquivos de integração.

Foi necessário definir:

- onde os arquivos serão armazenados;
- como os metadados serão organizados;
- como o acesso será controlado;
- como as versões serão preservadas;
- como os documentos serão vinculados às entidades;
- como serão tratados classificação, retenção e auditoria;
- como evitar exposição pública indevida;
- como preparar a solução para crescimento futuro.

---

## Decisão

Os arquivos da Plataforma Aritech serão armazenados em serviço de armazenamento
de objetos compatível com a interface S3.

O PostgreSQL armazenará apenas os metadados, vínculos, classificações, versões e
informações necessárias para localizar e controlar os arquivos.

A plataforma adotará:

- armazenamento de objetos separado do banco de dados;
- arquivos privados por padrão;
- acesso mediado pela aplicação;
- links temporários para upload e download;
- metadados no PostgreSQL;
- controle de versões;
- classificação de confidencialidade;
- validação de uploads;
- registro de integridade;
- exclusão lógica;
- políticas de retenção;
- auditoria de operações relevantes.

O provedor específico será definido posteriormente.

---

## 1. Separação entre documento e arquivo

A arquitetura deverá diferenciar:

- Documento;
- Arquivo;
- Versão do documento;
- Vínculo documental.

### 1.1 Documento

Representa o objeto lógico relacionado ao negócio.

Exemplos:

- contrato com cliente;
- proposta comercial;
- nota fiscal;
- comprovante;
- desenho técnico;
- relatório de inspeção.

### 1.2 Arquivo

Representa o conteúdo físico armazenado no serviço de objetos.

Exemplos:

- PDF;
- DOCX;
- XLSX;
- imagem;
- arquivo compactado;
- documento técnico em formato específico.

### 1.3 Versão

Representa uma versão específica do documento.

Um mesmo documento poderá possuir várias versões, cada uma vinculada a um arquivo
diferente.

### 1.4 Vínculo documental

Representa a relação entre um documento e uma entidade da plataforma.

Um documento poderá estar vinculado a várias entidades.

---

## 2. Serviço compatível com S3

### 2.1 Decisão

O armazenamento deverá utilizar interface compatível com S3.

### 2.2 Motivação

Essa abordagem oferece:

- separação entre banco e arquivos;
- escalabilidade;
- alta durabilidade;
- controle de acesso;
- criptografia;
- versionamento;
- links temporários;
- portabilidade entre provedores;
- facilidade de backup;
- integração com ferramentas de processamento.

### 2.3 Provedores possíveis

Poderão ser avaliados:

- Amazon S3;
- Cloudflare R2;
- MinIO;
- serviço de objetos do provedor de hospedagem;
- outro serviço compatível com S3.

A escolha deverá considerar:

- custo;
- localização;
- segurança;
- disponibilidade;
- latência;
- suporte;
- versionamento;
- política de saída de dados;
- compatibilidade técnica.

---

## 3. Arquivos fora do banco de dados

Os arquivos não deverão ser armazenados diretamente no PostgreSQL.

O banco armazenará:

- identificador do documento;
- identificador do arquivo;
- identificador da versão;
- chave do objeto;
- nome original;
- nome interno;
- extensão;
- tipo MIME;
- tamanho;
- hash;
- data de inclusão;
- responsável;
- classificação;
- situação;
- vínculos;
- política de retenção;
- origem;
- provedor;
- bucket;
- região, quando aplicável.

Essa separação evita:

- crescimento excessivo do banco;
- backups maiores;
- maior custo de consulta;
- dificuldade de distribuição;
- complexidade na gestão de arquivos grandes.

---

## 4. Estrutura conceitual

As entidades iniciais serão:

- Documento;
- Arquivo;
- VersãoDocumento;
- CategoriaDocumento;
- VinculoDocumento;
- PermissaoDocumento;
- HistoricoDocumento;
- RegraRetencao.

### 4.1 Documento

Deverá conter:

- identificador;
- título;
- descrição;
- categoria;
- classificação;
- situação;
- versão atual;
- responsável;
- data de criação;
- data de atualização.

### 4.2 Arquivo

Deverá conter:

- identificador;
- chave do objeto;
- provedor;
- bucket;
- nome original;
- nome interno;
- extensão;
- tipo MIME;
- tamanho;
- hash;
- data de armazenamento;
- situação.

### 4.3 VersãoDocumento

Deverá conter:

- identificador;
- documento;
- arquivo;
- número da versão;
- data;
- autor;
- descrição da alteração;
- situação;
- versão anterior, quando aplicável.

### 4.4 VinculoDocumento

Deverá conter:

- documento;
- módulo;
- tipo de entidade;
- identificador da entidade;
- tipo do vínculo;
- data;
- responsável.

---

## 5. Categorias documentais

Os documentos deverão possuir categorias padronizadas.

Exemplos:

- Proposta Comercial;
- Contrato;
- Aditivo;
- Pedido de Compra;
- Cotação;
- Nota Fiscal;
- Boleto;
- Comprovante;
- Extrato Bancário;
- Documento Cadastral;
- Documento Pessoal;
- Documento Técnico;
- Desenho;
- Memorial;
- Folha de Dados;
- Relatório;
- Documento de Valuation;
- Arquivo de Integração;
- Outro.

As categorias poderão possuir regras próprias de:

- acesso;
- retenção;
- obrigatoriedade;
- versionamento;
- classificação;
- validação.

---

## 6. Classificação de confidencialidade

Todo documento deverá possuir classificação.

Os níveis iniciais serão:

- Público;
- Interno;
- Confidencial;
- Restrito.

### 6.1 Público

Pode ser divulgado externamente.

### 6.2 Interno

Destinado ao uso interno.

### 6.3 Confidencial

Pode causar prejuízo comercial, financeiro ou operacional em caso de exposição.

### 6.4 Restrito

Exige proteção reforçada.

Exemplos:

- documentos pessoais;
- informações bancárias;
- remuneração;
- valuation;
- contratos sensíveis;
- documentos estratégicos.

---

## 7. Acesso privado por padrão

Todos os objetos serão privados por padrão.

Não deverão existir links públicos permanentes para documentos internos.

O acesso deverá ocorrer por:

- aplicação autenticada;
- autorização no backend;
- link temporário;
- política específica do provedor.

A existência da chave do objeto não deverá ser suficiente para acesso.

---

## 8. Links temporários

A aplicação poderá gerar links temporários para:

- upload;
- download;
- visualização controlada.

Esses links deverão possuir:

- prazo curto;
- escopo limitado;
- operação específica;
- vínculo com usuário ou processo, quando possível;
- possibilidade de revogação indireta;
- registro da emissão, quando necessário.

Links temporários não deverão ser usados como mecanismo permanente de
compartilhamento.

---

## 9. Upload direto

Quando adequado, o frontend poderá enviar o arquivo diretamente ao serviço de
objetos por meio de link temporário.

O fluxo recomendado será:

```text
Usuário solicita upload
→ backend valida permissão
→ backend cria registro temporário
→ backend gera link de upload
→ frontend envia arquivo
→ backend confirma conclusão
→ arquivo é validado
→ versão do documento é registrada
O backend deverá manter controle sobre:

autorização;
tamanho;
tipo;
chave;
vínculo;
classificação;
confirmação do upload.
10. Nomes dos arquivos

O nome fornecido pelo usuário deverá ser preservado apenas como metadado.

O nome físico do objeto deverá ser gerado pela plataforma.

Exemplo conceitual:

organization/{empresaId}/contracts/{contratoId}/documents/{documentoId}/{versaoId}

A estrutura definitiva da chave será definida na implementação.

Não deverão ser utilizados diretamente na chave:

nomes de pessoas;
CNPJ;
CPF;
senhas;
informações bancárias;
dados sensíveis desnecessários.
11. Validação de uploads

Todo upload deverá ser validado.

A validação deverá considerar:

tamanho máximo;
extensão;
tipo MIME informado;
tipo real do arquivo;
nome;
categoria;
classificação;
usuário;
vínculo;
situação;
conteúdo potencialmente malicioso.

A extensão do arquivo não deverá ser a única forma de validação.

12. Tipos permitidos

A plataforma deverá manter lista de tipos permitidos por categoria.

Exemplos iniciais:

PDF;
DOCX;
XLSX;
CSV;
TXT;
JPG;
JPEG;
PNG;
arquivos técnicos previamente autorizados.

Arquivos executáveis deverão ser bloqueados, salvo necessidade formal e controle
específico.

Arquivos compactados deverão ser avaliados conforme o caso.

13. Limite de tamanho

Cada categoria poderá possuir limite de tamanho.

Os limites deverão considerar:

experiência do usuário;
custo;
tempo de upload;
processamento;
segurança;
necessidade real.

Arquivos muito grandes poderão utilizar upload multipart ou fluxo específico.

14. Verificação de conteúdo malicioso

Arquivos enviados deverão ser submetidos a verificações compatíveis com o risco.

Poderão ser utilizados:

antivírus;
análise de conteúdo;
bloqueio de macros;
validação de estrutura;
quarentena;
processamento assíncrono.

O documento poderá permanecer em situação:

PENDENTE_VALIDACAO;
DISPONIVEL;
BLOQUEADO;
REJEITADO;
EM_QUARENTENA.
15. Hash de integridade

Cada arquivo deverá possuir hash de integridade.

O hash poderá ser utilizado para:

validar integridade;
identificar duplicidade;
detectar alteração;
comprovar versão;
apoiar auditoria.

A escolha do algoritmo será definida durante a implementação.

16. Versionamento

Documentos sujeitos a revisão deverão preservar todas as versões.

Exemplos:

propostas;
contratos;
desenhos;
memoriais;
relatórios;
valuation;
documentos técnicos;
políticas.

Uma nova versão não deverá sobrescrever a anterior.

Cada versão deverá registrar:

número;
data;
autor;
descrição da alteração;
arquivo;
situação;
versão anterior;
aprovação, quando aplicável.
17. Versão atual

O documento deverá possuir referência para a versão atual.

A versão atual poderá mudar apenas por processo controlado.

Versões anteriores deverão permanecer acessíveis a usuários autorizados.

A exclusão de uma versão deverá respeitar:

retenção;
aprovação;
auditoria;
vínculos;
exigências contratuais ou legais.
18. Imutabilidade

Determinados documentos aprovados poderão ser considerados imutáveis.

Exemplos:

contrato assinado;
nota fiscal;
comprovante;
relatório aprovado;
versão aprovada de valuation;
documento formal emitido.

Nesses casos, uma correção deverá gerar:

nova versão;
documento substituto;
cancelamento;
documento de ajuste;
vínculo entre original e substituto.
19. Vínculos com entidades

Um documento poderá ser vinculado a:

cliente;
fornecedor;
colaborador;
campanha;
lead;
oportunidade;
proposta;
contrato;
aditivo;
projeto;
marco;
solicitação de compra;
cotação;
pedido de compra;
título a pagar;
título a receber;
pagamento;
recebimento;
movimentação bancária;
conciliação;
indicador;
valuation;
auditoria.

Os vínculos deverão ser rastreáveis.

20. Vários vínculos

Um documento poderá possuir vários vínculos.

Exemplo:

Uma nota fiscal de fornecedor poderá estar vinculada a:

fornecedor;
pedido de compra;
projeto;
conta a pagar;
recebimento de material.

A plataforma não deverá duplicar fisicamente o arquivo para cada vínculo.

21. Controle de acesso

O acesso deverá considerar:

usuário;
perfil;
módulo;
operação;
empresa;
projeto;
classificação;
categoria;
vínculo;
situação.

As operações poderão incluir:

visualizar metadados;
visualizar arquivo;
fazer download;
enviar;
criar nova versão;
vincular;
desvincular;
classificar;
inativar;
restaurar;
exportar;
administrar.
22. Herança de permissões

O acesso a um documento poderá ser herdado da entidade vinculada.

Exemplo:

Um usuário com acesso a determinado contrato poderá visualizar documentos desse
contrato, desde que:

a categoria permita;
a classificação permita;
o perfil possua permissão;
não exista restrição adicional.

Documentos restritos poderão exigir permissão específica, mesmo quando vinculados
a uma entidade acessível.

23. Permissões específicas

Alguns documentos poderão possuir regras próprias.

Exemplos:

documento pessoal;
contrato sigiloso;
valuation;
dados bancários;
remuneração;
auditoria.

Nesses casos, o acesso poderá ser concedido individualmente ou por grupo
específico.

24. Auditoria documental

Deverão gerar auditoria, quando aplicável:

upload;
download de documento restrito;
criação de versão;
alteração de classificação;
alteração de categoria;
vinculação;
desvinculação;
inativação;
restauração;
exclusão;
exportação;
compartilhamento temporário.

A auditoria deverá registrar:

usuário;
data e hora;
documento;
versão;
operação;
entidade vinculada;
origem;
justificativa, quando necessária.
25. Logs de acesso

O acesso a documentos restritos poderá gerar log específico.

O log poderá registrar:

usuário;
documento;
versão;
data;
ação;
resultado;
origem.

Os logs não deverão registrar o conteúdo integral do documento.

26. Exclusão lógica

A exclusão comum deverá ser lógica.

O documento ou arquivo poderá ser marcado como:

ATIVO;
INATIVO;
EXCLUIDO_LOGICAMENTE;
BLOQUEADO;
EXPIRADO.

O conteúdo físico poderá permanecer armazenado durante o período de retenção.

27. Exclusão física

A exclusão física somente deverá ocorrer quando:

o período de retenção tiver sido cumprido;
não houver obrigação legal ou contratual;
não houver vínculo ativo que exija preservação;
houver autorização;
a operação for auditada;
o backup e a política aplicável forem considerados.

Documentos de auditoria ou registros obrigatórios poderão possuir retenção
prolongada ou permanente.

28. Retenção

A plataforma deverá permitir regras de retenção por:

categoria;
classificação;
entidade;
tipo de processo;
exigência legal;
exigência contratual;
situação;
data de encerramento.

Cada regra deverá indicar:

evento inicial da contagem;
período;
ação ao final;
necessidade de aprovação;
possibilidade de suspensão.
29. Suspensão de descarte

A plataforma deverá permitir suspender exclusão ou descarte.

Exemplos:

processo judicial;
auditoria;
investigação;
exigência de cliente;
disputa contratual;
incidente;
determinação da direção.

A suspensão deverá possuir:

motivo;
responsável;
início;
término, quando aplicável;
documentos afetados.
30. Backup

O armazenamento de documentos deverá possuir estratégia de backup ou redundância
compatível com o risco.

A política deverá considerar:

durabilidade do provedor;
versionamento do bucket;
replicação;
exclusão acidental;
criptografia;
retenção;
testes de recuperação.

A existência de alta durabilidade no provedor não elimina a necessidade de
estratégia contra exclusão indevida.

31. Versionamento do bucket

O versionamento nativo do serviço de objetos poderá ser utilizado como controle
adicional.

Esse mecanismo não substituirá o versionamento funcional da aplicação.

A plataforma continuará responsável por:

versão lógica;
autor;
justificativa;
situação;
aprovação;
vínculo.
32. Criptografia

Os arquivos deverão utilizar criptografia em repouso.

A comunicação deverá utilizar criptografia em trânsito.

Documentos especialmente sensíveis poderão utilizar proteção adicional.

As chaves não deverão ser armazenadas no código-fonte.

33. Segregação por ambiente

Cada ambiente deverá possuir armazenamento separado.

Ambientes previstos:

desenvolvimento;
homologação;
produção.

Os ambientes não deverão compartilhar:

buckets;
chaves;
credenciais;
documentos;
políticas;
links temporários.

Dados reais não deverão ser enviados ao ambiente de desenvolvimento sem
autorização e tratamento adequado.

34. Segregação por empresa

A arquitetura deverá permitir separar documentos por empresa.

A separação poderá ocorrer por:

prefixos;
buckets;
metadados;
políticas;
chaves;
validação na aplicação.

Na primeira fase, a Aritech será a empresa principal, mas a estrutura deverá
permitir evolução futura.

35. Importação de documentos históricos

A plataforma deverá permitir importar documentos anteriores.

Cada lote de importação deverá registrar:

origem;
responsável;
data;
quantidade;
arquivos aceitos;
arquivos rejeitados;
erros;
vínculos;
classificação;
categoria;
hash;
possibilidade de reversão controlada.

Documentos históricos poderão não possuir todos os metadados, mas as ausências
deverão ser identificadas.

36. Processamento assíncrono

Tarefas pesadas deverão poder ser processadas de forma assíncrona.

Exemplos:

antivírus;
geração de miniaturas;
extração de texto;
OCR;
classificação automática;
cálculo de hash;
conversão de formato;
indexação;
leitura por inteligência artificial.

O upload não deverá depender de processamento prolongado para responder ao
usuário.

37. Extração de texto e OCR

A plataforma poderá futuramente extrair texto de documentos.

Possíveis usos:

pesquisa;
classificação;
conferência;
leitura de notas fiscais;
análise de contratos;
apoio a integrações;
inteligência artificial.

O texto extraído deverá ser tratado como dado derivado e manter vínculo com a
versão do arquivo de origem.

38. Pesquisa documental

A busca inicial poderá utilizar metadados.

Exemplos:

nome;
categoria;
cliente;
fornecedor;
projeto;
contrato;
período;
responsável;
classificação.

A pesquisa por conteúdo poderá ser implementada futuramente.

39. Pré-visualização

A plataforma poderá oferecer pré-visualização de formatos suportados.

A pré-visualização deverá:

respeitar permissões;
evitar links públicos;
utilizar versão autorizada;
proteger conteúdo restrito;
não substituir o arquivo original.
40. Download

O download deverá ser autorizado pelo backend.

O sistema deverá validar:

usuário;
permissão;
escopo;
classificação;
situação;
vínculo.

Downloads de documentos restritos poderão exigir auditoria adicional.

41. Compartilhamento externo

O compartilhamento externo não fará parte do núcleo inicial.

Quando implementado, deverá utilizar:

link temporário;
prazo;
senha ou autenticação, quando aplicável;
destinatário;
limitação de downloads;
revogação;
auditoria;
classificação compatível.

Links públicos permanentes não serão permitidos para documentos internos.

42. Integrações

Sistemas externos poderão:

enviar documentos;
consultar metadados;
solicitar download;
associar documentos;
receber arquivos exportados.

As integrações deverão utilizar:

credenciais técnicas;
permissões mínimas;
identificação externa;
idempotência;
auditoria;
validação;
limites.
43. Inteligência artificial

Documentos poderão ser enviados a serviços de inteligência artificial somente
quando houver:

finalidade definida;
autorização;
análise de sensibilidade;
controle de acesso;
avaliação do fornecedor;
tratamento de dados pessoais;
política de retenção;
possibilidade de anonimização.

Documentos restritos não deverão ser enviados automaticamente a serviços externos.

44. Alternativas consideradas
Arquivos armazenados no PostgreSQL

Essa alternativa foi rejeitada porque:

aumentaria o tamanho do banco;
tornaria backups mais pesados;
dificultaria escalabilidade;
aumentaria custos;
reduziria flexibilidade;
misturaria dados transacionais com arquivos grandes.
Sistema de arquivos local do servidor

Essa alternativa foi rejeitada porque:

dificulta escalabilidade;
aumenta risco de perda;
complica implantação por contêineres;
reduz portabilidade;
dificulta redundância;
dificulta acesso distribuído.
Google Drive ou OneDrive como repositório principal

Essas ferramentas poderão ser utilizadas em integrações, mas não foram escolhidas
como armazenamento principal porque:

o controle de vínculos seria mais complexo;
a aplicação dependeria de permissões externas;
o versionamento funcional seria limitado;
haveria maior acoplamento ao fornecedor;
seria mais difícil controlar acesso por entidade.
Links públicos

Essa alternativa foi rejeitada por não atender ao nível de confidencialidade
necessário.

45. Consequências positivas

A decisão proporciona:

separação adequada entre dados e arquivos;
melhor escalabilidade;
menor crescimento do banco;
maior segurança;
links temporários;
controle de versões;
portabilidade;
suporte a processamento futuro;
rastreabilidade;
controle de retenção.
46. Consequências negativas

A decisão também gera:

necessidade de serviço adicional;
maior complexidade operacional;
sincronização entre banco e armazenamento;
necessidade de tratar uploads incompletos;
necessidade de limpeza de objetos órfãos;
custo de armazenamento e tráfego;
necessidade de monitoramento;
dependência de políticas do provedor.
47. Riscos

Os principais riscos são:

arquivo armazenado sem registro no banco;
registro no banco sem arquivo válido;
link temporário exposto;
upload malicioso;
classificação incorreta;
exclusão acidental;
vínculo incorreto;
duplicidade;
armazenamento de dados sensíveis sem controle;
custo crescente;
dependência excessiva do provedor.

Os riscos deverão ser reduzidos por:

transações compensatórias;
estados intermediários;
validação;
hash;
auditoria;
monitoramento;
políticas de retenção;
revisão de acesso;
rotinas de reconciliação.
48. Consistência entre banco e armazenamento

Como o banco e o serviço de objetos são sistemas distintos, a operação não será
uma transação única.

A aplicação deverá utilizar estados controlados.

Exemplo:

PENDENTE_UPLOAD
→ UPLOAD_CONCLUIDO
→ EM_VALIDACAO
→ DISPONIVEL

Falhas deverão permitir:

reprocessamento;
cancelamento;
limpeza;
auditoria;
identificação de objetos órfãos.
49. Objetos órfãos

A plataforma deverá possuir rotina para identificar:

arquivo sem registro válido;
registro sem arquivo;
upload incompleto;
versão sem documento;
objeto marcado para exclusão.

A remoção automática deverá respeitar prazo de segurança e auditoria.

50. Regras obrigatórias

A implementação deverá respeitar:

arquivos fora do PostgreSQL;
serviço compatível com S3;
objetos privados por padrão;
acesso autorizado pelo backend;
links temporários;
metadados no banco;
versionamento funcional;
hash de integridade;
validação de uploads;
controle de tipos e tamanhos;
classificação de confidencialidade;
exclusão lógica;
retenção;
auditoria;
segregação por ambiente;
credenciais fora do código;
proibição de links públicos permanentes;
controle de consistência entre banco e objeto.
51. Requisitos mínimos do MVP

O MVP deverá permitir:

upload;
download autorizado;
cadastro de metadados;
categoria;
classificação;
vínculo com entidades;
uma ou mais versões;
hash;
exclusão lógica;
controle básico de acesso;
registro do responsável;
armazenamento privado;
links temporários;
auditoria das operações críticas.

Funcionalidades como OCR, pesquisa por conteúdo e compartilhamento externo poderão
ser implementadas posteriormente.

52. Decisões pendentes

Ainda deverão ser definidos:

provedor de armazenamento;
região;
quantidade de buckets;
padrão definitivo das chaves;
tamanho máximo por categoria;
tipos permitidos;
ferramenta de antivírus;
algoritmo de hash;
política de retenção;
política de backup;
política de versionamento do bucket;
processo de exclusão física;
estratégia de miniaturas;
estratégia de OCR;
estratégia de pesquisa;
política de compartilhamento externo;
custo máximo aceitável;
regras de acesso por classificação;
política de objetos órfãos;
política de migração entre provedores.
53. Critérios de revisão

Esta decisão deverá ser revisada quando:

o provedor for definido;
os custos se tornarem inadequados;
houver necessidade de compartilhamento externo;
o volume de documentos crescer significativamente;
houver necessidade de pesquisa por conteúdo;
surgirem exigências de retenção;
ocorrer incidente relevante;
houver necessidade de armazenamento local;
a arquitetura migrar para múltiplas empresas;
for adotado sistema corporativo de gestão documental.

A revisão deverá ser registrada em novo ADR.

54. Referências internas

Esta decisão está relacionada a:

docs/architecture/ARCHITECTURE_OVERVIEW.md;
docs/architecture/MODULES.md;
docs/architecture/DATA_ARCHITECTURE.md;
docs/architecture/SECURITY.md;
docs/adr/ADR-001-modular-monolith.md;
docs/adr/ADR-002-technology-stack.md;
docs/adr/ADR-003-postgresql-and-prisma.md;
docs/adr/ADR-004-authentication-and-authorization.md.
