# Instruções para o Claude neste repositório

## `aritech_dev` contém dados financeiros reais — não é mais um banco de teste

A partir de 2026-09, o usuário passou a usar o sistema para registrar as
finanças reais da Aritech Soluções Industriais: fornecedores, clientes,
contas a pagar/receber, e o extrato bancário real (importado via OFX) da
empresa. **Nunca** crie dados de teste (fornecedor fictício, OFX sintético,
classificação de conciliação, etc.) diretamente em `aritech_dev` para
verificar uma funcionalidade nova.

Use `aritech_test` para qualquer verificação manual ou exploratória:

```bash
DATABASE_URL="postgresql://aritech:aritech@localhost:5432/aritech_test?schema=public" \
  pnpm --filter @aritech/database exec prisma migrate deploy

DATABASE_URL="postgresql://aritech:aritech@localhost:5432/aritech_test?schema=public" \
  pnpm --filter @aritech/database exec tsx prisma/seed.ts
```

Rode a API contra ele com uma porta diferente (`API_PORT=3002`, por exemplo)
para poder verificar em paralelo sem afetar a instância real.

Se, mesmo assim, alguma verificação tiver que tocar `aritech_dev` (ex.: um bug
só reproduz com o volume real de dados), limpe qualquer registro criado
imediatamente depois — nunca deixe fornecedor/cliente/pagamento/conciliação
de teste para trás. Antes de apagar qualquer coisa em `aritech_dev`, confirme
com o usuário exatamente o que será removido (ver o histórico de conversa de
2026-09-14 para o precedente: uma limpeza de dados de teste legados foi feita
mediante confirmação explícita).

## Operação do dia a dia

O PostgreSQL roda como serviço do Windows (inicia sozinho). A API e o site
são iniciados via `iniciar.bat` / `parar.bat` na raiz do repo — não dependem
de uma sessão do Claude rodando. Depois de qualquer mudança de código, rode
`atualizar.bat` (reinstala, migra, recompila) antes de `iniciar.bat`. Veja o
README para detalhes.

## Antes de commitar

Sempre rodar `pnpm lint && pnpm typecheck && pnpm test && pnpm build` (ou os
pacotes específicos alterados) antes de cada commit — e não considerar
"verde" só pelo build local: o CI do GitHub Actions já teve uma quebra real
(ordem `corepack enable`/`setup-node`) que passou despercebida em vários
commits seguidos só porque a verificação local sempre tem pnpm disponível,
diferente do runner do GitHub. Depois de dar `git push`, confira o resultado
do workflow (`https://api.github.com/repos/vinicius-cespedes/aritech-plataform/actions/runs?per_page=1`)
antes de considerar a tarefa concluída.
