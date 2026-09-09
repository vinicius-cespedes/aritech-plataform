import { Module } from "@nestjs/common";
import { DocumentsController } from "./documents.controller";
import { DocumentsService } from "./documents.service";
import { LocalStorageAdapter } from "./storage/local-storage.adapter";
import { STORAGE_ADAPTER } from "./storage/storage-adapter.interface";

@Module({
  controllers: [DocumentsController],
  providers: [
    DocumentsService,
    // DOCUMENT_STORAGE_DRIVER só suporta "local" nesta iteração — trocar por
    // um adapter S3/R2/MinIO aqui quando o provedor for definido (ADR-005 §2.3).
    { provide: STORAGE_ADAPTER, useClass: LocalStorageAdapter },
  ],
  exports: [DocumentsService],
})
export class DocumentsModule {}
