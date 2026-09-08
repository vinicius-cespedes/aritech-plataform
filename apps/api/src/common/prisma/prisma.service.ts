import { Injectable, Logger, OnModuleDestroy, OnModuleInit } from "@nestjs/common";
import { prisma, PrismaClient } from "@aritech/database";

/**
 * Reexpõe o PrismaClient singleton de packages/database como um provider
 * NestJS injetável, para que todos os módulos usem a mesma conexão.
 */
@Injectable()
export class PrismaService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(PrismaService.name);
  readonly client: PrismaClient = prisma;

  async onModuleInit(): Promise<void> {
    await this.client.$connect();
    this.logger.log("Conectado ao PostgreSQL via Prisma.");
  }

  async onModuleDestroy(): Promise<void> {
    await this.client.$disconnect();
  }
}
