export interface ApiErrorBody {
  readonly statusCode: number;
  readonly error: string;
  readonly message: string | string[];
  readonly requestId?: string;
  readonly path?: string;
  readonly timestamp?: string;
}

export class ApiError extends Error {
  readonly status: number;
  readonly code: string;
  readonly requestId?: string;
  readonly messages: readonly string[];

  constructor(status: number, body: Partial<ApiErrorBody>, fallback = 'The request failed.') {
    const messages = Array.isArray(body.message)
      ? body.message
      : [body.message ?? fallback];

    super(messages[0] ?? fallback);

    this.name = 'ApiError';
    this.status = status;
    this.code = body.error ?? 'UnknownError';
    this.requestId = body.requestId;
    this.messages = messages;
  }

  /** 401 — no session, or one the API no longer accepts. */
  get isUnauthenticated(): boolean {
    return this.status === 401;
  }

  /** 403 — signed in, but the role does not hold the permission. */
  get isForbidden(): boolean {
    return this.status === 403;
  }

  get isNotFound(): boolean {
    return this.status === 404;
  }

  /** Validation, conflict or business-rule errors; safe to show verbatim. */
  get isActionable(): boolean {
    return this.status >= 400 && this.status < 500 && !this.isUnauthenticated;
  }
}

export function isApiError(value: unknown): value is ApiError {
  return value instanceof ApiError;
}
