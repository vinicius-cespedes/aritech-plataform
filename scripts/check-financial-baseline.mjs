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
    file: 'homologation/financial-baseline-v1/app6.js',
    tokens: ['Vincular manualmente', 'Cadastrar movimentação', 'saldo total'],
  },
  {
    file: 'homologation/financial-baseline-v1/app7.js',
    tokens: ['bestReconciliationCandidateV7', 'allocateOfxToPayable', 'manualReconcile'],
  },
];

const forbidden = [
  {
    file: 'homologation/financial-baseline-v1/app5.js',
    tokens: [
      '823ecd4fbbe373f1f0670186e600e98ff975d0c2',
      'O valor do OFX é maior que o saldo da parcela selecionada.',
    ],
  },
  {
    file: 'homologation/financial-baseline-v1/app6.js',
    tokens: ['O valor do OFX é maior que o saldo da parcela selecionada.'],
  },
  {
    file: 'homologation/financial-baseline-v1/app7.js',
    tokens: ['O valor do OFX é maior que o saldo da parcela selecionada.'],
  },
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

for (const check of forbidden) {
  if (!fs.existsSync(check.file)) continue;
  const content = fs.readFileSync(check.file, 'utf8');
  for (const token of check.tokens) {
    if (content.includes(token)) {
      console.error(`REGRESSION: ${check.file} contém rotina legada proibida: ${token}`);
      failed = true;
    }
  }
}

if (failed) process.exit(1);
console.log('Financial baseline regression guard: OK');
