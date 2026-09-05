import fs from 'node:fs';

const checks = [
  {
    file: 'apps/web/app/payables/new/page.tsx',
    tokens: [
      "type CounterpartyType='SUPPLIER'|'EMPLOYEE'",
      'Cadastro rápido de',
      'Criar e selecionar',
      'quickCreate',
      'counterpartyType',
      'counterpartyId',
      'obligationType',
      'Custos diretos exigem linha de negócio e projeto.',
      'formatMoneyInput',
      "type=\"month\"",
    ],
  },
  {
    file: 'apps/web/app/approvals/page.tsx',
    tokens: ['Aprovações', 'approve', 'reject'],
  },
  {
    file: 'apps/web/app/payments/page.tsx',
    tokens: ['Pagamentos', 'principalAmount', 'interestAmount', 'penaltyAmount', 'discountAmount'],
  },
  {
    file: 'apps/web/app/reconciliation/page.tsx',
    tokens: ['Conciliação', 'OFX', 'suggestions', 'confirm-payment'],
  },
  {
    file: 'homologation/financial-baseline-v1/index.html',
    tokens: ['+ Novo beneficiário', 'Criar e selecionar', 'Fornecedores', 'Colaboradores', 'Contas a pagar', 'Aprovações', 'Pagamentos', 'Conciliação'],
  },
  {
    file: 'homologation/financial-baseline-v1/app9.js',
    tokens: [
      'Selecionar pagamento/recebimento...',
      'Vincular manualmente',
      'Classificar operação',
      'Registrar recebimento',
      'Registrar e conciliar',
      "cashEventType='PAYMENT'",
      "cashEventType='RECEIPT'",
      '__ARITECH_RECONCILIATION_V9__',
    ],
  },
];

const forbidden = [
  ['homologation/financial-baseline-v1/app5.js', '823ecd4fbbe373f1f0670186e600e98ff975d0c2'],
  ['homologation/financial-baseline-v1/app9.js', 'saldo da parcela selecionada'],
  ['homologation/financial-baseline-v1/app9.js', "kind==='PAYABLE'"],
  ['homologation/financial-baseline-v1/app9.js', "kind==='RECEIVABLE'"],
];

let failed = false;
for (const check of checks) {
  if (!fs.existsSync(check.file)) {
    console.error(`REGRESSION: arquivo ausente: ${check.file}`);
    failed = true;
    continue;
  }
  const content = fs.readFileSync(check.file, 'utf8');
  for (const token of check.tokens) {
    if (!content.includes(token)) {
      console.error(`REGRESSION: ${check.file} perdeu requisito: ${token}`);
      failed = true;
    }
  }
}
for (const [file, token] of forbidden) {
  if (!fs.existsSync(file)) continue;
  const content = fs.readFileSync(file, 'utf8');
  if (content.includes(token)) {
    console.error(`REGRESSION: ${file} contém rotina legada proibida: ${token}`);
    failed = true;
  }
}

if (failed) process.exit(1);
console.log('Financial baseline regression guard: OK');
