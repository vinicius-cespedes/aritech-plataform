import { Global, Module } from "@nestjs/common";
import { AuditService } from "./audit.service";

// Global (ADR-006 §28 — "serviço centralizado" usado por todos os módulos).
@Global()
@Module({
  providers: [AuditService],
  exports: [AuditService],
})
export class AuditModule {}
