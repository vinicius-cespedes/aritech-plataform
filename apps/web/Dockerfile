# syntax=docker/dockerfile:1
# Build a partir da RAIZ do monorepo:
#   docker build -f apps/web/Dockerfile -t aritech-web .

FROM node:20-alpine AS base
RUN corepack enable

FROM base AS pruner
WORKDIR /app
RUN apk add --no-cache libc6-compat
COPY . .
RUN npx turbo prune web --docker

FROM base AS builder
WORKDIR /app
COPY --from=pruner /app/out/json/ .
RUN pnpm install --frozen-lockfile
COPY --from=pruner /app/out/full/ .
ARG NEXT_PUBLIC_API_URL=http://localhost:3001
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL
RUN pnpm --filter @aritech/shared build \
 && pnpm --filter @aritech/validation build \
 && pnpm --filter web build

# ---- Runtime (Next.js standalone) ------------------------------------------
FROM base AS runner
WORKDIR /app
ENV NODE_ENV=production
RUN addgroup --system --gid 1001 aritech && adduser --system --uid 1001 aritech

COPY --from=builder /app/apps/web/public ./apps/web/public
COPY --from=builder --chown=aritech:aritech /app/apps/web/.next/standalone ./
COPY --from=builder --chown=aritech:aritech /app/apps/web/.next/static ./apps/web/.next/static

USER aritech
EXPOSE 3000
CMD ["node", "apps/web/server.js"]
