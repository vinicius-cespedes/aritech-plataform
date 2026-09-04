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

if (failed) process.exit(1);
console.log('Financial baseline regression guard: OK');
