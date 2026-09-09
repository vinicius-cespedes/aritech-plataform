/**
 * Interface compatível com S3 — ADR-005. A implementação local em disco (dev)
 * e uma futura implementação S3/R2/MinIO (homologação/produção) compartilham
 * este contrato, para que o domínio de Documentos não dependa do provedor.
 */
export interface StorageAdapter {
  save(key: string, content: Buffer): Promise<void>;
  read(key: string): Promise<Buffer>;
  delete(key: string): Promise<void>;
}

export const STORAGE_ADAPTER = Symbol("STORAGE_ADAPTER");
