import { createHash, randomUUID } from "node:crypto";
import { Inject, Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../common/prisma/prisma.service";
import { AuditService } from "../audit/audit.service";
import { STORAGE_ADAPTER, StorageAdapter } from "./storage/storage-adapter.interface";

export interface UploadDocumentInput {
  title: string;
  category: string;
  classification?: "PUBLIC" | "INTERNAL" | "CONFIDENTIAL" | "RESTRICTED";
  file: Express.Multer.File;
  linkTo?: { payableId?: string; receivableId?: string; role: string };
}

@Injectable()
export class DocumentsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly audit: AuditService,
    @Inject(STORAGE_ADAPTER) private readonly storage: StorageAdapter,
  ) {}

  async get(id: string) {
    const document = await this.prisma.client.document.findUnique({
      where: { id },
      include: { versions: { orderBy: { versionNumber: "desc" } } },
    });
    if (!document) throw new NotFoundException({ code: "NOT_FOUND", message: "Documento não encontrado." });
    return document;
  }

  /** ADR-005 §51 (MVP): upload, metadados, categoria/classificação, hash, vínculo. */
  async upload(input: UploadDocumentInput, actorUserId: string) {
    const hash = createHash("sha256").update(input.file.buffer).digest("hex");
    const storageKey = `documents/${randomUUID()}/${input.file.originalname}`;
    await this.storage.save(storageKey, input.file.buffer);

    const document = await this.prisma.client.$transaction(async (tx) => {
      const created = await tx.document.create({
        data: {
          title: input.title,
          category: input.category,
          classification: input.classification ?? "INTERNAL",
          status: "AVAILABLE",
          createdById: actorUserId,
        },
      });

      const version = await tx.documentVersion.create({
        data: {
          documentId: created.id,
          versionNumber: 1,
          storageDriver: "local",
          storageKey,
          originalName: input.file.originalname,
          mimeType: input.file.mimetype,
          sizeBytes: input.file.size,
          hash,
          authorId: actorUserId,
          status: "AVAILABLE",
        },
      });

      await tx.document.update({ where: { id: created.id }, data: { currentVersionId: version.id } });

      if (input.linkTo && (input.linkTo.payableId || input.linkTo.receivableId)) {
        await tx.financialDocumentLink.create({
          data: {
            documentId: created.id,
            payableId: input.linkTo.payableId,
            receivableId: input.linkTo.receivableId,
            role: input.linkTo.role as never,
            createdById: actorUserId,
          },
        });
      }

      await this.audit.record(tx, {
        actorType: "USER",
        actorUserId,
        module: "documents",
        action: "UPLOAD",
        entityType: "Document",
        entityId: created.id,
        source: "WEB",
        result: "SUCCESS",
        newValues: { title: created.title, category: created.category, hash },
      });

      return created;
    });

    return this.get(document.id);
  }

  async download(id: string): Promise<{ buffer: Buffer; fileName: string; mimeType: string }> {
    const document = await this.get(id);
    const currentVersion = document.versions.find((v) => v.id === document.currentVersionId) ?? document.versions[0];
    if (!currentVersion) {
      throw new NotFoundException({ code: "NOT_FOUND", message: "Documento sem versão disponível." });
    }
    const buffer = await this.storage.read(currentVersion.storageKey);
    return { buffer, fileName: currentVersion.originalName, mimeType: currentVersion.mimeType };
  }
}
