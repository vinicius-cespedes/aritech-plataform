import { PrismaClient } from "@prisma/client";

// Evita múltiplas instâncias do PrismaClient durante hot-reload em dev
// (padrão recomendado pela documentação do Prisma para Next.js/Nest com watch mode).
declare global {
  // eslint-disable-next-line no-var
  var __aritechPrisma: PrismaClient | undefined;
}

export const prisma: PrismaClient =
  globalThis.__aritechPrisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["warn", "error"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") {
  globalThis.__aritechPrisma = prisma;
}

export * from "@prisma/client";
