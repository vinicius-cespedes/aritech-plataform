# Módulos da Plataforma Aritech

## 1. Objetivo

Este documento descreve a organização modular da Plataforma Aritech.

A plataforma será desenvolvida inicialmente como um monólito modular, no qual
cada módulo representa um domínio específico do negócio e possui responsabilidades
claramente definidas.

O objetivo da divisão modular é:

- reduzir o acoplamento entre funcionalidades;
- evitar duplicidade de regras;
- melhorar a manutenção;
- facilitar testes;
- permitir evolução incremental;
- preservar a integridade das informações;
- possibilitar futura separação de módulos, quando justificável;
- permitir rastrear o impacto de cada área nos resultados e no valuation da empresa.

---

## 2. Princípios de modularização

Cada módulo deverá:

- possuir responsabilidades próprias;
- manter suas regras de negócio;
- controlar seus dados e operações;
- expor serviços ou interfaces para outros módulos;
- evitar acesso direto às estruturas internas de outros módulos;
- registrar eventos relevantes;
- possuir testes próprios;
- respeitar as regras de autorização;
- manter rastreabilidade das operações críticas;
- identificar a origem dos dados utilizados;
- permitir integração sem dependência direta de fornecedores externos.

A comunicação entre módulos deverá ocorrer por meio de:

- serviços internos;
- contratos bem definidos;
- eventos de domínio;
- consultas autorizadas;
- interfaces de integração.

---

## 3. Visão geral dos módulos

A Plataforma Aritech será composta progressivamente pelos seguintes módulos:

1. Identidade e Acesso;
2. Organização e Cadastros;
3. Marketing e Geração de Demanda;
4. Comercial;
5. Contratos e Projetos;
6. Financeiro;
7. Compras;
8. Controladoria;
9. Pessoas;
10. Produção e Execução;
11. Documentos;
12. Indicadores;
13. Valuation;
14. Notificações;
15. Integrações;
16. Administração e Auditoria.

A implementação ocorrerá em fases, conforme o roadmap da plataforma.

A existência de um módulo na arquitetura não implica sua implementação completa
no primeiro release.

---

## 4. Módulo de Identidade e Acesso

### 4.1 Responsabilidade

Gerenciar usuários, autenticação, perfis, sessões e permissões de acesso.

### 4.2 Funcionalidades principais

- cadastro de usuários;
- ativação e inativação de usuários;
- autenticação;
- recuperação de senha;
- gerenciamento de sessões;
- definição de perfis;
- definição de permissões;
- bloqueio de acesso;
- autenticação multifator, quando aplicável;
- controle de acesso por módulo;
- controle de acesso por operação;
- controle de acesso por empresa, projeto ou área;
- registro de tentativas de acesso.

### 4.3 Entidades principais

- Usuário;
- Perfil;
- Permissão;
- Sessão;
- Credencial;
- Tentativa de acesso;
- Regra de acesso.

### 4.4 Dependências

O módulo será utilizado por todos os demais módulos.

### 4.5 Regras importantes

Nenhum outro módulo deverá implementar mecanismos próprios de autenticação.

As permissões deverão poder diferenciar, no mínimo, as ações de:

- visualizar;
- criar;
- editar;
- excluir;
- aprovar;
- cancelar;
- exportar;
- administrar.

Usuários inativos não poderão acessar a plataforma, mas seus registros históricos
deverão ser preservados.

---

## 5. Módulo de Organização e Cadastros

### 5.1 Responsabilidade

Centralizar os cadastros corporativos compartilhados pelos demais módulos.

### 5.2 Funcionalidades principais

- cadastro da empresa;
- cadastro de clientes;
- cadastro de fornecedores;
- cadastro de contatos;
- cadastro de pessoas físicas e jurídicas;
- cadastro de endereços;
- cadastro de contas bancárias;
- cadastro de centros de custo;
- cadastro de unidades de negócio;
- cadastro de áreas;
- cadastro de categorias financeiras;
- cadastro de condições de pagamento;
- cadastro de moedas;
- cadastro de impostos e retenções;
- cadastro de serviços;
- cadastro de materiais;
- cadastro de parâmetros gerais.

### 5.3 Entidades principais

- Empresa;
- Cliente;
- Fornecedor;
- Pessoa;
- Contato;
- Endereço;
- Conta bancária;
- Centro de custo;
- Unidade de negócio;
- Área;
- Categoria financeira;
- Condição de pagamento;
- Moeda;
- Imposto;
- Retenção;
- Serviço;
- Material;
- Parâmetro.

### 5.4 Dependências

Este módulo fornece dados para:

- Marketing e Geração de Demanda;
- Comercial;
- Contratos e Projetos;
- Financeiro;
- Compras;
- Controladoria;
- Pessoas;
- Produção e Execução;
- Indicadores;
- Valuation.

### 5.5 Regras importantes

Cadastros compartilhados não deverão ser duplicados em outros módulos.

Clientes e fornecedores poderão representar a mesma pessoa jurídica, mantendo
papéis distintos.

Alterações em cadastros sensíveis deverão gerar registros de auditoria.

---

## 6. Módulo de Marketing e Geração de Demanda

### 6.1 Responsabilidade

Gerenciar campanhas, canais, conteúdos, investimentos em divulgação, geração de
leads e indicadores de marketing da Aritech.

O módulo deverá acompanhar a jornada desde o primeiro contato com a marca até a
transformação do lead em oportunidade, contrato, receita e margem.

### 6.2 Funcionalidades principais

- planejamento de campanhas;
- cadastro de canais de divulgação;
- cadastro de plataformas externas;
- definição de públicos e segmentos;
- planejamento de conteúdo;
- calendário editorial;
- cadastro de conteúdos publicados;
- cadastro de anúncios;
- registro de investimentos em mídia;
- cadastro de palavras-chave;
- acompanhamento de formulários;
- acompanhamento de páginas de conversão;
- captura de leads;
- identificação da origem dos leads;
- classificação inicial dos leads;
- qualificação de marketing;
- registro de interações;
- utilização de parâmetros de rastreamento;
- vinculação entre campanhas, conteúdos, leads e oportunidades;
- acompanhamento de alcance e engajamento;
- análise de custo por lead;
- análise de custo por oportunidade;
- análise de custo de aquisição de cliente;
- análise de receita por campanha;
- análise de margem por campanha;
- análise de retorno sobre investimento em marketing;
- importação de indicadores de plataformas externas.

### 6.3 Plataformas externas previstas

O módulo deverá estar preparado para integração, conforme prioridade e
viabilidade técnica, com:

- site institucional da Aritech;
- formulários do site;
- Google Analytics;
- Google Search Console;
- Google Ads;
- Google Business Profile;
- LinkedIn;
- LinkedIn Ads;
- Instagram;
- Meta Ads;
- ferramentas de e-mail marketing;
- ferramentas de automação de marketing;
- plataformas de landing pages;
- ferramentas de análise de tráfego;
- outras plataformas de geração de leads.

### 6.4 Entidades principais

- Campanha;
- Canal de marketing;
- Plataforma de divulgação;
- Conteúdo;
- Publicação;
- Público-alvo;
- Segmento;
- Palavra-chave;
- Anúncio;
- Investimento de mídia;
- Página de conversão;
- Formulário;
- Visitante identificado;
- Lead;
- Origem do lead;
- Fonte;
- Mídia;
- Interação;
- Evento de conversão;
- Parâmetro de rastreamento;
- Indicador de marketing.

### 6.5 Dependências

Utiliza informações de:

- Organização e Cadastros;
- Identidade e Acesso;
- Documentos;
- Integrações.

Fornece informações para:

- Comercial;
- Indicadores;
- Controladoria;
- Valuation.

### 6.6 Regras importantes

Todo lead deverá possuir, sempre que tecnicamente possível:

- origem;
- canal;
- campanha;
- fonte;
- mídia;
- data de criação;
- responsável;
- situação;
- histórico de interações;
- consentimentos aplicáveis;
- vínculo com oportunidade, quando convertido.

A plataforma deverá preservar o vínculo entre:

- campanha;
- conteúdo;
- anúncio;
- lead;
- oportunidade;
- proposta;
- contrato;
- receita;
- margem.

Um lead poderá possuir diversos pontos de contato antes de sua conversão.

O histórico desses pontos deverá ser preservado para permitir análises futuras
de atribuição.

As informações provenientes de plataformas externas deverão registrar:

- plataforma de origem;
- data de importação;
- período de referência;
- identificador externo;
- responsável pela importação;
- situação da sincronização.

### 6.7 Indicadores principais

O módulo deverá permitir acompanhar, conforme disponibilidade de dados:

- alcance;
- impressões;
- acessos ao site;
- sessões;
- usuários;
- taxa de engajamento;
- taxa de conversão;
- número de leads;
- número de leads qualificados;
- custo por lead;
- custo por lead qualificado;
- oportunidades geradas;
- propostas originadas;
- contratos conquistados;
- custo de aquisição de cliente;
- receita atribuída;
- margem atribuída;
- retorno sobre investimento em marketing;
- tempo médio entre lead e oportunidade;
- tempo médio entre lead e contrato.

### 6.8 Proteção de dados

A coleta e o tratamento de dados pessoais deverão considerar:

- finalidade;
- necessidade;
- controle de acesso;
- registro da origem;
- preferências de comunicação;
- consentimento, quando aplicável;
- possibilidade de correção;
- possibilidade de exclusão conforme as regras vigentes;
- política de retenção;
- rastreabilidade do tratamento.

### 6.9 Escopo inicial

O módulo completo não faz parte do núcleo inicial do MVP financeiro.

Na primeira etapa deverão ser previstos:

- cadastro de canais;
- cadastro de campanhas;
- cadastro da origem dos leads e oportunidades;
- vinculação entre campanha, lead, oportunidade e contrato;
- registro dos investimentos de marketing;
- importação básica de indicadores;
- estrutura de dados necessária para análises futuras.

---

## 7. Módulo Comercial

### 7.1 Responsabilidade

Gerenciar leads qualificados, oportunidades, propostas, negociações e conversões
em contratos.

O módulo Comercial receberá leads originados pelo módulo de Marketing e também
permitirá a criação de oportunidades por prospecção ativa, indicação, convite,
licitação ou relacionamento existente.

### 7.2 Funcionalidades principais

- recebimento de leads;
- qualificação comercial;
- conversão de lead em oportunidade;
- cadastro manual de oportunidades;
- definição de responsável comercial;
- gestão do funil de vendas;
- registro de etapas comerciais;
- elaboração e controle de propostas;
- controle de revisões de propostas;
- acompanhamento de negociações;
- previsão de fechamento;
- previsão de faturamento;
- registro de interações comerciais;
- registro de concorrentes;
- registro de motivos de ganho;
- registro de motivos de perda;
- análise de ganhos e perdas;
- conversão de proposta em contrato;
- acompanhamento de metas comerciais;
- análise de desempenho comercial.

### 7.3 Entidades principais

- Lead qualificado;
- Oportunidade;
- Responsável comercial;
- Etapa comercial;
- Interação comercial;
- Proposta;
- Revisão de proposta;
- Item de proposta;
- Concorrente;
- Previsão de venda;
- Motivo de ganho;
- Motivo de perda.

### 7.4 Dependências

Utiliza informações de:

- Marketing e Geração de Demanda;
- Organização e Cadastros;
- Identidade e Acesso;
- Documentos.

Fornece informações para:

- Contratos e Projetos;
- Indicadores;
- Controladoria;
- Valuation.

### 7.5 Regras importantes

Uma oportunidade poderá ser criada:

- a partir de um lead de marketing;
- por prospecção ativa;
- por indicação;
- por relacionamento existente;
- por convite;
- por licitação;
- por cadastro manual autorizado.

Toda oportunidade deverá possuir:

- origem;
- responsável;
- cliente;
- descrição;
- valor estimado;
- probabilidade;
- previsão de fechamento;
- etapa atual;
- histórico de alterações.

Ao ser conquistada, a oportunidade deverá gerar ou ser vinculada a um contrato
ou projeto.

O histórico entre a origem comercial e o resultado financeiro deverá ser
preservado.

Propostas não deverão ser sobrescritas. Cada alteração relevante deverá gerar
uma nova revisão.

### 7.6 Escopo inicial

Inicialmente deverão ser mantidas as informações mínimas para:

- identificar a origem do negócio;
- registrar a oportunidade;
- registrar o valor estimado;
- registrar a probabilidade;
- vincular a proposta;
- converter a oportunidade em contrato;
- relacionar o contrato à campanha ou canal de origem.

---

## 8. Módulo de Contratos e Projetos

### 8.1 Responsabilidade

Gerenciar contratos, projetos, escopos, orçamentos, cronogramas financeiros e
resultados associados.

### 8.2 Funcionalidades principais

- cadastro de contratos;
- cadastro de projetos;
- associação entre contrato e projeto;
- registro de escopo;
- registro de valor contratado;
- definição de cronograma de faturamento;
- orçamento de receitas;
- orçamento de custos;
- controle de alterações contratuais;
- acompanhamento de aditivos;
- controle de marcos contratuais;
- previsão de margem;
- acompanhamento de margem realizada;
- análise de necessidade de capital de giro;
- acompanhamento de saldo contratual;
- encerramento de contratos;
- encerramento de projetos.

### 8.3 Entidades principais

- Contrato;
- Projeto;
- Escopo;
- Aditivo;
- Marco contratual;
- Cronograma de faturamento;
- Orçamento do projeto;
- Receita prevista;
- Custo previsto;
- Alteração de escopo;
- Saldo contratual.

### 8.4 Dependências

Utiliza informações de:

- Organização e Cadastros;
- Comercial;
- Identidade e Acesso;
- Documentos.

Fornece informações para:

- Financeiro;
- Compras;
- Produção e Execução;
- Controladoria;
- Indicadores;
- Valuation.

### 8.5 Regras importantes

Todo lançamento financeiro relacionado a um contrato deverá, quando aplicável,
estar vinculado a um projeto.

O sistema deverá permitir contratos com:

- um único projeto;
- múltiplos projetos;
- múltiplos centros de custo;
- diferentes etapas de faturamento;
- aditivos positivos ou negativos;
- diferentes moedas;
- retenções contratuais;
- garantias;
- medições;
- marcos de pagamento.

Alterações no valor, prazo ou escopo deverão manter histórico.

---

## 9. Módulo Financeiro

### 9.1 Responsabilidade

Gerenciar obrigações, direitos, pagamentos, recebimentos, saldos e movimentações
financeiras.

### 9.2 Funcionalidades principais

- contas a pagar;
- contas a receber;
- parcelamentos;
- vencimentos;
- pagamentos;
- recebimentos;
- baixas parciais;
- juros;
- multas;
- descontos;
- adiantamentos;
- estornos;
- transferências entre contas;
- conciliação bancária;
- fluxo de caixa realizado;
- fluxo de caixa previsto;
- fluxo de caixa comprometido;
- controle de inadimplência;
- anexação de comprovantes;
- aprovação financeira;
- classificação gerencial;
- importação de extratos;
- controle de saldos;
- projeção de necessidade de caixa.

### 9.3 Entidades principais

- Título a pagar;
- Título a receber;
- Parcela;
- Pagamento;
- Recebimento;
- Conta bancária;
- Movimentação bancária;
- Transferência;
- Conciliação;
- Adiantamento;
- Documento financeiro;
- Aprovação financeira;
- Projeção de caixa.

### 9.4 Dependências

Utiliza informações de:

- Organização e Cadastros;
- Contratos e Projetos;
- Compras;
- Documentos;
- Identidade e Acesso;
- Integrações.

Fornece informações para:

- Controladoria;
- Indicadores;
- Valuation;
- Administração e Auditoria.

### 9.5 Regras importantes

O módulo deverá distinguir:

- valor orçado;
- valor previsto;
- valor comprometido;
- valor realizado;
- valor vencido;
- valor liquidado;
- valor pendente;
- valor cancelado.

Nenhum registro financeiro liquidado deverá ser excluído fisicamente.

Correções deverão ocorrer por meio de:

- estorno;
- cancelamento;
- lançamento de ajuste;
- registro de justificativa.

Pagamentos e recebimentos parciais deverão ser permitidos.

Transferências entre contas não deverão ser tratadas como receita ou despesa.

---

## 10. Módulo de Compras

### 10.1 Responsabilidade

Gerenciar solicitações, cotações, aprovações, pedidos e compromissos de compra.

### 10.2 Funcionalidades principais

- solicitação de compra;
- aprovação de solicitação;
- cotação com fornecedores;
- mapa comparativo;
- análise técnica;
- análise comercial;
- emissão de pedido de compra;
- controle de entrega;
- recebimento de materiais;
- recebimento de serviços;
- vínculo com projeto;
- vínculo com centro de custo;
- previsão de desembolso;
- acompanhamento de saldo do pedido;
- cancelamento de pedido;
- avaliação de fornecedores.

### 10.3 Entidades principais

- Solicitação de compra;
- Item de solicitação;
- Cotação;
- Item de cotação;
- Proposta de fornecedor;
- Mapa comparativo;
- Pedido de compra;
- Item de pedido;
- Recebimento;
- Aprovação de compra;
- Avaliação de fornecedor.

### 10.4 Dependências

Utiliza informações de:

- Organização e Cadastros;
- Contratos e Projetos;
- Identidade e Acesso;
- Documentos.

Fornece informações para:

- Financeiro;
- Controladoria;
- Produção e Execução;
- Indicadores.

### 10.5 Regras importantes

Um pedido aprovado deverá gerar um compromisso financeiro, ainda que a nota
fiscal ainda não tenha sido recebida.

Esse compromisso deverá ser considerado no fluxo de caixa comprometido.

Um pedido poderá possuir:

- entregas parciais;
- pagamentos parcelados;
- itens vinculados a projetos diferentes;
- moedas diferentes;
- retenções;
- impostos;
- fretes;
- despesas adicionais.

---

## 11. Módulo de Controladoria

### 11.1 Responsabilidade

Consolidar informações gerenciais, econômicas e financeiras para análise de
desempenho.

### 11.2 Funcionalidades principais

- plano de contas gerencial;
- DRE gerencial;
- análise por centro de custo;
- análise por unidade de negócio;
- análise por projeto;
- análise por contrato;
- comparação entre orçado e realizado;
- comparação entre previsto e realizado;
- rateio de despesas;
- apuração de custos diretos;
- apuração de custos indiretos;
- acompanhamento de margem;
- análise de desvios;
- fechamento gerencial;
- consolidação mensal;
- ajustes gerenciais;
- análise de capital de giro;
- análise de rentabilidade.

### 11.3 Entidades principais

- Conta gerencial;
- Estrutura da DRE;
- Regra de classificação;
- Regra de rateio;
- Lançamento gerencial;
- Período de fechamento;
- Ajuste gerencial;
- Centro de resultado;
- Critério de apropriação.

### 11.4 Dependências

Recebe dados de:

- Marketing e Geração de Demanda;
- Comercial;
- Financeiro;
- Contratos e Projetos;
- Compras;
- Pessoas;
- Produção e Execução.

Fornece informações para:

- Indicadores;
- Valuation;
- Direção.

### 11.5 Regras importantes

A visão gerencial poderá ser diferente da classificação contábil oficial.

As diferenças deverão ser documentadas e rastreáveis.

Os períodos gerenciais poderão ser encerrados para impedir alterações retroativas
sem autorização.

A reabertura de um período deverá exigir justificativa e permissão específica.

---

## 12. Módulo de Pessoas

### 12.1 Responsabilidade

Gerenciar informações básicas dos colaboradores, custos de pessoal, alocação e
disponibilidade.

### 12.2 Funcionalidades principais

- cadastro de colaboradores;
- função;
- área;
- vínculo contratual;
- custo mensal;
- remuneração;
- benefícios;
- alocação em projetos;
- registro de disponibilidade;
- apontamento de horas;
- controle de afastamentos;
- integração com folha de pagamento;
- cálculo de custo por projeto;
- acompanhamento de utilização de recursos.

### 12.3 Entidades principais

- Colaborador;
- Função;
- Área;
- Vínculo;
- Benefício;
- Alocação;
- Apontamento de horas;
- Custo de pessoal;
- Disponibilidade;
- Afastamento.

### 12.4 Dependências

Utiliza informações de:

- Organização e Cadastros;
- Identidade e Acesso;
- Contratos e Projetos.

Fornece informações para:

- Produção e Execução;
- Controladoria;
- Indicadores;
- Valuation.

### 12.5 Escopo inicial

Na primeira fase poderão ser registrados apenas os custos consolidados necessários
para a DRE, a análise de projetos e o valuation.

---

## 13. Módulo de Produção e Execução

### 13.1 Responsabilidade

Acompanhar a execução física e operacional dos projetos.

### 13.2 Funcionalidades principais

- planejamento de atividades;
- cronograma de execução;
- apontamento de progresso;
- registro de horas;
- utilização de materiais;
- acompanhamento de entregáveis;
- controle de pendências;
- registro de desvios;
- medição física;
- acompanhamento de produtividade;
- acompanhamento de marcos;
- encerramento de atividades;
- registro de não conformidades;
- acompanhamento de retrabalho.

### 13.3 Entidades principais

- Atividade;
- Cronograma;
- Apontamento;
- Entregável;
- Medição;
- Pendência;
- Desvio;
- Recurso;
- Não conformidade;
- Retrabalho.

### 13.4 Dependências

Utiliza informações de:

- Contratos e Projetos;
- Pessoas;
- Compras;
- Documentos.

Fornece informações para:

- Financeiro;
- Controladoria;
- Indicadores.

### 13.5 Escopo inicial

Este módulo não faz parte do núcleo inicial do MVP financeiro.

---

## 14. Módulo de Documentos

### 14.1 Responsabilidade

Gerenciar arquivos, metadados, versões, categorias e vínculos documentais.

### 14.2 Funcionalidades principais

- upload de arquivos;
- download controlado;
- vinculação de documentos;
- classificação;
- controle de versões;
- histórico;
- pesquisa;
- armazenamento de metadados;
- controle de acesso;
- retenção;
- exclusão controlada;
- validação de integridade;
- associação com entidades do sistema.

### 14.3 Entidades principais

- Documento;
- Arquivo;
- Versão;
- Categoria documental;
- Vínculo documental;
- Permissão documental;
- Histórico documental.

### 14.4 Dependências

O módulo será utilizado por todos os módulos que necessitem armazenar ou consultar
documentos.

### 14.5 Regras importantes

Os arquivos não deverão ser armazenados diretamente no banco de dados principal.

O banco de dados deverá armazenar:

- identificação;
- localização;
- nome;
- tipo;
- tamanho;
- versão;
- responsável;
- data;
- vínculos;
- hash de integridade, quando aplicável;
- classificação de confidencialidade.

A exclusão de documentos deverá respeitar as políticas de retenção.

---

## 15. Módulo de Indicadores

### 15.1 Responsabilidade

Consolidar e apresentar indicadores operacionais, comerciais, financeiros e
estratégicos.

### 15.2 Funcionalidades principais

- dashboards;
- indicadores de marketing;
- indicadores comerciais;
- indicadores financeiros;
- indicadores de contratos;
- indicadores de projetos;
- indicadores de compras;
- indicadores de pessoas;
- análise de tendências;
- comparações;
- metas;
- alertas;
- exportações;
- acompanhamento da evolução histórica;
- comparação antes e depois das transformações digitais.

### 15.3 Entidades principais

- Indicador;
- Meta;
- Valor apurado;
- Período;
- Dimensão;
- Alerta;
- Fórmula;
- Fonte de dados.

### 15.4 Dependências

Recebe dados dos demais módulos, especialmente:

- Marketing e Geração de Demanda;
- Comercial;
- Financeiro;
- Controladoria;
- Contratos e Projetos;
- Compras;
- Pessoas;
- Produção e Execução.

### 15.5 Regras importantes

Cada indicador deverá possuir:

- nome;
- definição;
- fórmula;
- fonte de dados;
- periodicidade;
- responsável;
- unidade de medida;
- dimensões;
- histórico;
- data da última atualização.

Mudanças de fórmula deverão gerar uma nova versão do indicador.

---

## 16. Módulo de Valuation

### 16.1 Responsabilidade

Gerenciar premissas, cálculos, cenários e versões do valuation da empresa.

### 16.2 Funcionalidades principais

- registro de premissas;
- projeção de receitas;
- projeção de custos;
- projeção de despesas;
- cálculo de EBITDA;
- cálculo de fluxo de caixa livre;
- cálculo de capital de giro;
- definição de taxa de desconto;
- definição de crescimento terminal;
- criação de cenários;
- análise de sensibilidade;
- registro de versões;
- comparação entre valuations;
- análise do impacto das melhorias;
- registro dos impactos por área;
- comparação entre situação inicial e situação posterior.

### 16.3 Entidades principais

- Valuation;
- Versão de valuation;
- Premissa;
- Cenário;
- Projeção;
- Taxa de desconto;
- Fluxo de caixa livre;
- Valor terminal;
- Ajuste;
- Indicador de impacto;
- Iniciativa de transformação.

### 16.4 Dependências

Recebe dados de:

- Marketing e Geração de Demanda;
- Comercial;
- Controladoria;
- Financeiro;
- Contratos e Projetos;
- Pessoas;
- Indicadores.

### 16.5 Regras importantes

Cada valuation deverá ser imutável após sua aprovação.

Alterações deverão gerar uma nova versão.

Cada versão deverá registrar:

- data-base;
- metodologia;
- premissas;
- responsável;
- dados utilizados;
- ajustes;
- cenários;
- resultado;
- justificativas.

O sistema deverá permitir associar variações do valuation a iniciativas de
transformação digital, sem assumir automaticamente relação de causalidade.

---

## 17. Módulo de Notificações

### 17.1 Responsabilidade

Gerenciar avisos e comunicações geradas pela plataforma.

### 17.2 Funcionalidades principais

- notificações internas;
- envio de e-mails;
- avisos de vencimento;
- avisos de aprovação;
- alertas de inadimplência;
- alertas de orçamento;
- alertas de fluxo de caixa;
- alertas de projeto;
- alertas comerciais;
- alertas de marketing;
- registro de envio;
- controle de leitura;
- configuração de preferências.

### 17.3 Entidades principais

- Notificação;
- Modelo de mensagem;
- Destinatário;
- Canal;
- Evento;
- Status de envio;
- Preferência de notificação.

### 17.4 Dependências

Pode ser utilizado por todos os módulos.

### 17.5 Regras importantes

A geração de uma notificação não deverá impedir a conclusão da operação principal,
salvo quando a notificação fizer parte de uma obrigação formal do processo.

Falhas de envio deverão ser registradas e poderão ser reprocessadas.

---

## 18. Módulo de Integrações

### 18.1 Responsabilidade

Isolar, controlar e monitorar as integrações com sistemas e plataformas externas.

### 18.2 Funcionalidades principais

- importação de arquivos;
- exportação de arquivos;
- integração bancária;
- integração contábil;
- integração fiscal;
- integração com armazenamento;
- integração com e-mail;
- integração com plataformas de marketing;
- integração com redes sociais;
- integração com ferramentas comerciais;
- integração com serviços de inteligência artificial;
- controle de filas;
- tratamento de falhas;
- reprocessamento;
- registro de execução;
- mapeamento de dados;
- controle de sincronização;
- prevenção de duplicidades.

### 18.3 Entidades principais

- Integração;
- Conector;
- Credencial externa;
- Execução;
- Arquivo importado;
- Arquivo exportado;
- Erro;
- Tentativa;
- Mapeamento de dados;
- Sincronização;
- Evento externo.

### 18.4 Dependências

Interage com os módulos internos conforme o tipo de integração.

### 18.5 Regras importantes

Credenciais externas não deverão ser armazenadas em código-fonte.

As integrações deverão possuir:

- autenticação;
- registro de execução;
- tratamento de erros;
- rastreabilidade;
- controle de duplicidade;
- possibilidade de reprocessamento;
- identificação da origem;
- data da última sincronização;
- política de limite de chamadas.

A indisponibilidade de uma plataforma externa não deverá comprometer toda a
Plataforma Aritech.

---

## 19. Módulo de Administração e Auditoria

### 19.1 Responsabilidade

Gerenciar configurações gerais e registrar operações críticas da plataforma.

### 19.2 Funcionalidades principais

- parâmetros do sistema;
- consulta de logs;
- consulta de auditoria;
- gestão de configurações;
- controle de funcionalidades;
- gerenciamento de ambientes;
- acompanhamento de falhas;
- registro de alterações;
- exportação de trilhas de auditoria;
- gestão de permissões administrativas;
- consulta do histórico de integrações;
- consulta de alterações sensíveis.

### 19.3 Entidades principais

- Registro de auditoria;
- Evento de sistema;
- Configuração;
- Parâmetro;
- Log de erro;
- Alteração;
- Justificativa;
- Histórico de acesso.

### 19.4 Dependências

Recebe eventos e registros de todos os demais módulos.

### 19.5 Regras importantes

Os registros de auditoria deverão conter:

- usuário;
- data e hora;
- operação;
- módulo;
- entidade;
- identificador;
- valor anterior;
- valor posterior;
- origem;
- endereço de origem, quando aplicável;
- justificativa, quando aplicável.

Os registros de auditoria não deverão ser editáveis por usuários comuns.

Operações críticas deverão ser registradas mesmo quando forem executadas por
integrações ou rotinas automáticas.

---

## 20. Dependências entre módulos

```mermaid
flowchart TD
    IAM[Identidade e Acesso]
    CAD[Organização e Cadastros]
    MKT[Marketing e Geração de Demanda]
    COM[Comercial]
    PROJ[Contratos e Projetos]
    COMP[Compras]
    FIN[Financeiro]
    PES[Pessoas]
    PROD[Produção e Execução]
    CTRL[Controladoria]
    IND[Indicadores]
    VAL[Valuation]
    DOC[Documentos]
    NOT[Notificações]
    INT[Integrações]
    AUD[Administração e Auditoria]

    IAM --> MKT
    IAM --> COM
    IAM --> PROJ
    IAM --> COMP
    IAM --> FIN
    IAM --> PES

    CAD --> MKT
    CAD --> COM
    CAD --> PROJ
    CAD --> COMP
    CAD --> FIN
    CAD --> PES

    INT --> MKT
    INT --> FIN
    INT --> CTRL
    INT --> DOC

    MKT --> COM
    MKT --> IND
    MKT --> CTRL
    MKT --> VAL

    COM --> PROJ
    COM --> IND
    COM --> CTRL
    COM --> VAL

    PROJ --> COMP
    PROJ --> FIN
    PROJ --> PROD
    PROJ --> IND

    COMP --> FIN
    COMP --> CTRL
    COMP --> PROD

    PES --> PROD
    PES --> CTRL
    PES --> IND

    PROD --> CTRL
    PROD --> IND

    FIN --> CTRL
    FIN --> IND
    FIN --> VAL

    CTRL --> IND
    CTRL --> VAL

    IND --> VAL

    DOC --> MKT
    DOC --> COM
    DOC --> PROJ
    DOC --> COMP
    DOC --> FIN
    DOC --> PES

    NOT --> MKT
    NOT --> COM
    NOT --> PROJ
    NOT --> COMP
    NOT --> FIN

    MKT --> AUD
    COM --> AUD
    PROJ --> AUD
    COMP --> AUD
    FIN --> AUD
    CTRL --> AUD
    VAL --> AUD
