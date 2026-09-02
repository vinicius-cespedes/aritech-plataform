# Baseline de regressão — Financeiro

Esta baseline registra funcionalidades já homologadas que não podem desaparecer em alterações posteriores do módulo financeiro.

## Regra de publicação

Nenhuma nova versão da homologação deve ser publicada sem verificar os itens abaixo. Se uma funcionalidade existente for alterada intencionalmente, a alteração deve ser registrada antes da publicação.

## Fornecedores

- Cadastro, edição e exclusão/inativação conforme histórico financeiro.
- Razão social ou nome fantasia obrigatórios em conjunto: pelo menos um deve ser informado.
- CPF/CNPJ opcional, com máscara e validação quando preenchido.
- Ramo de atuação.
- Inscrição estadual formatada conforme UF selecionada.
- Inscrição municipal.
- Site.
- Endereço completo: CEP, logradouro, número, complemento, bairro, cidade, UF e país.
- Contato, e-mail, DDI, telefone e observações.
- Compatibilidade com cadastros criados em versões anteriores da homologação.

## Colaboradores

- Cadastro, edição e exclusão/inativação conforme histórico financeiro.
- Nome, CPF, vínculo, cargo/função, centro de custo, admissão, PIX e banco.
- CPF com máscara e validação quando preenchido.

## Contas a pagar

- Beneficiário pode ser fornecedor ou colaborador.
- Cadastro rápido de novo fornecedor dentro de Contas a Pagar.
- Cadastro rápido de novo colaborador dentro de Contas a Pagar.
- O beneficiário criado rapidamente deve ficar selecionado automaticamente.
- Tipo da obrigação muda conforme o tipo do beneficiário.
- Descrição, valor, emissão, competência e vencimento.
- Máscara monetária no padrão brasileiro.
- Parcelamento.
- Conta gerencial e centro de custo obrigatórios.
- Custo direto exige Linha de Negócio e Projeto.
- Nova conta segue para aprovação.

## Aprovações

- Listar contas pendentes.
- Aprovar conta.
- Reprovar com justificativa.
- Alterações relevantes em conta aprovada devem invalidar a aprovação no sistema oficial.

## Pagamentos

- Somente parcelas aprovadas/abertas podem ser pagas.
- Pagamento total ou parcial.
- Principal, juros, multa e desconto separados.
- Conta financeira e forma de pagamento.
- Atualização do saldo da parcela e do status da conta.
- Estorno preserva histórico no sistema oficial.

## Conciliação

- Importar OFX.
- Ler movimentações bancárias.
- Sugerir correspondência com pagamentos.
- Confirmação humana da conciliação.

## Critério de aceite da baseline

Para considerar uma nova versão apta à homologação, deve ser possível executar o fluxo mínimo completo:

1. Criar um beneficiário dentro de Contas a Pagar.
2. Criar uma conta para esse beneficiário.
3. Aprovar a conta.
4. Registrar pagamento total ou parcial.
5. Verificar atualização do saldo/status.
6. Importar OFX e confirmar uma conciliação compatível.

Além disso, cadastros de fornecedor e colaborador devem continuar disponíveis e editáveis.