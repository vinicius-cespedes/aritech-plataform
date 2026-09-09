# syntax=docker/dockerfile:1
# Build multi-stage usando `turbo prune` para copiar apenas o necessário do
# monorepo (apps/api + packages/database, packages/shared, packages/validation).
# Build a partir da RAIZ do monorepo:
#   docker build -f apps/api/Dockerfile -t aritech-api .

FROM node:20-alpine AS base
RUN corepack enable

# ---- Etapa 1: poda o monorepo para o escopo de apps/api -------------------
FROM base AS pruner
WORKDIR /app
RUN apk add --no-cache libc6-compat
COPY . .
RUN npx turbo prune api --docker

# ---- Etapa 2: instala dependências e builda --------------------------------
FROM base AS builder
WORKDIR /app
COPY --from=pruner /app/out/json/ .
RUN pnpm install --frozen-lockfile
COPY --from=pruner /app/out/full/ .
RUN pnpm --filter @aritech/shared build \
 && pnpm --filter @aritech/validation build \
 && pnpm --filter @aritech/database build \
 && pnpm --filter @aritech/database exec prisma generate \
 && pnpm --filter api build

# ---- Etapa 3: runtime -------------------------------------------------------
FROM base AS runner
WORKDIR /app
ENV NODE_ENV=production
RUN addgroup --system --gid 1001 aritech && adduser --system --uid 1001 aritech

COPY --from=builder /app .
USER aritech

EXPOSE 3001
# As migrações (`prisma migrate deploy`) devem ser executadas como um passo
# de deploy separado, não no entrypoint do contêiner (ADR-003 §17).
CMD ["node", "apps/api/dist/main.js"]
