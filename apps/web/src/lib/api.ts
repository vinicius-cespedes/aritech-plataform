/**
 * Cliente HTTP fino para a API do Aritech Digital.
 *
 * Autenticação via cookies httpOnly (ADR-004 §13) — nunca lê/escreve token
 * manualmente aqui. Erros de domínio (DomainError, ADR/FINANCIAL_MODEL §52)
 * chegam com { code, message, details } e são repassados como ApiError para
 * a UI decidir como exibir.
 *
 * ADR-004 §11: o token de acesso é de curta duração (15m) por design — a
 * renovação via refresh token deve ser transparente para o usuário. Esta
 * camada intercepta um 401, tenta renovar a sessão uma única vez (POST
 * /auth/refresh) e repete a requisição original antes de desistir.
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

/** Emitido quando a sessão não pôde ser renovada — a UI deve tratar como "desconectado". */
export class SessionExpiredError extends ApiError {
  constructor() {
    super(401, "Sua sessão expirou. Faça login novamente.", "UNAUTHENTICATED");
    this.name = "SessionExpiredError";
  }
}

/**
 * Depois de um refresh malsucedido não há como continuar autenticado — melhor
 * levar o usuário de volta ao login imediatamente do que deixá-lo preso numa
 * tela mostrando só uma mensagem de erro genérica.
 */
function redirectToLogin(): void {
  if (typeof window !== "undefined" && window.location.pathname !== "/login") {
    window.location.assign("/login");
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

function buildHeaders(init: RequestInit): HeadersInit | undefined {
  return init.body instanceof FormData ? init.headers : { "Content-Type": "application/json", ...init.headers };
}

async function rawRequest(path: string, init: RequestInit): Promise<Response> {
  return fetch(`${API_URL}/api/v1${path}`, { ...init, credentials: "include", headers: buildHeaders(init) });
}

// Compartilhada entre chamadas concorrentes para não disparar vários refresh ao mesmo tempo.
let refreshInFlight: Promise<boolean> | null = null;

async function tryRefreshSession(): Promise<boolean> {
  if (!refreshInFlight) {
    refreshInFlight = rawRequest("/auth/refresh", { method: "POST" })
      .then((res) => res.ok)
      .catch(() => false)
      .finally(() => {
        refreshInFlight = null;
      });
  }
  return refreshInFlight;
}

const AUTH_ENDPOINTS_WITHOUT_RETRY = new Set(["/auth/login", "/auth/refresh", "/auth/logout"]);

async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
  let response = await rawRequest(path, init);

  if (response.status === 401 && !AUTH_ENDPOINTS_WITHOUT_RETRY.has(path)) {
    const refreshed = await tryRefreshSession();
    if (refreshed) {
      response = await rawRequest(path, init);
    } else {
      redirectToLogin();
      throw new SessionExpiredError();
    }
  }

  if (!response.ok) {
    if (response.status === 401) {
      redirectToLogin();
      throw new SessionExpiredError();
    }
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
