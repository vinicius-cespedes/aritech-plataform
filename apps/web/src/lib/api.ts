/**
 * Cliente HTTP fino para a API do Aritech Digital.
 *
 * Autenticação via cookies httpOnly (ADR-004 §13) — nunca lê/escreve token
 * manualmente aqui. Erros de domínio (DomainError, ADR/FINANCIAL_MODEL §52)
 * chegam com { code, message, details } e são repassados como ApiError para
 * a UI decidir como exibir.
 */

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001";

export class ApiError extends Error {
  readonly status: number;
  readonly code?: string;
  readonly issues?: unknown;

  constructor(status: number, message: string, code?: string, issues?: unknown) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.code = code;
    this.issues = issues;
  }
}

async function parseErrorBody(response: Response): Promise<{ message: string; code?: string; issues?: unknown }> {
  try {
    const body = await response.json();
    return {
      message: body.message ?? response.statusText,
      code: body.code,
      issues: body.issues ?? body.details,
    };
  } catch {
    return { message: response.statusText };
  }
}

async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
  const response = await fetch(`${API_URL}/api/v1${path}`, {
    ...init,
    credentials: "include",
    headers:
      init.body instanceof FormData
        ? init.headers
        : { "Content-Type": "application/json", ...init.headers },
  });

  if (!response.ok) {
    const { message, code, issues } = await parseErrorBody(response);
    throw new ApiError(response.status, message, code, issues);
  }

  if (response.status === 204) {
    return undefined as T;
  }
  return response.json() as Promise<T>;
}

export const api = {
  get: <T>(path: string) => request<T>(path, { method: "GET" }),
  post: <T>(path: string, body?: unknown) =>
    request<T>(path, { method: "POST", body: body !== undefined ? JSON.stringify(body) : undefined }),
  patch: <T>(path: string, body?: unknown) =>
    request<T>(path, { method: "PATCH", body: body !== undefined ? JSON.stringify(body) : undefined }),
  postForm: <T>(path: string, formData: FormData) => request<T>(path, { method: "POST", body: formData }),
};

export function apiFileUrl(path: string): string {
  return `${API_URL}/api/v1${path}`;
}
