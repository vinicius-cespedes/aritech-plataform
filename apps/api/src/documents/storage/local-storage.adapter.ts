import { mkdir, readFile, rm, writeFile } from "node:fs/promises";
import { dirname, join, resolve } from "node:path";
import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { StorageAdapter } from "./storage-adapter.interface";

/**
 * Implementação local em disco do StorageAdapter — apenas para desenvolvimento
 * (ADR-005 §2.3 deixa o provedor definitivo — S3/R2/MinIO — como decisão
 * pendente; esta classe existe para que o restante da aplicação já trabalhe
 * contra a interface final).
 */
@Injectable()
export class LocalStorageAdapter implements StorageAdapter {
  private readonly root: string;

  constructor(config: ConfigService) {
    this.root = resolve(config.get<string>("DOCUMENT_STORAGE_LOCAL_PATH", "./storage"));
  }

  private resolveKey(key: string): string {
    return join(this.root, key);
  }

  async save(key: string, content: Buffer): Promise<void> {
    const path = this.resolveKey(key);
    await mkdir(dirname(path), { recursive: true });
    await writeFile(path, content);
  }

  async read(key: string): Promise<Buffer> {
    return readFile(this.resolveKey(key));
  }

  async delete(key: string): Promise<void> {
    await rm(this.resolveKey(key), { force: true });
  }
}
