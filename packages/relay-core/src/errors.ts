import type { HttpStatus } from "./types";

export type RelayErrorCode =
  | "BAD_REQUEST"
  | "UNAUTHORIZED"
  | "FORBIDDEN"
  | "NOT_FOUND"
  | "RATE_LIMITED"
  | "PAYLOAD_TOO_LARGE"
  | "REQUEST_TIMEOUT"
  | "SCHEMA_INVALID"
  | "SIGNATURE_INVALID"
  | "SKEW_EXCEEDED"
  | "KAFKA_UNAVAILABLE"
  | "UPSTREAM_UNAVAILABLE"
  | "INTERNAL_ERROR";

export type RelayErrorKind =
  | "RETRYABLE"
  | "FATAL"
  | "VALIDATION"
  | "AUTH"
  | "RATE_LIMIT"
  | "UNKNOWN";

export interface RelayErrorOptions {
  cause?: unknown;
  detail?: Record<string, unknown>;
}

export class RelayError extends Error {
  readonly name = "RelayError";
  readonly code: RelayErrorCode;
  readonly status: HttpStatus;
  readonly kind: RelayErrorKind;
  readonly detail?: Record<string, unknown>;

  constructor(
    code: RelayErrorCode,
    message: string,
    status: HttpStatus,
    kind: RelayErrorKind = "UNKNOWN",
    opts?: RelayErrorOptions
  ) {
    super(message);
    this.code = code;
    this.status = status;
    this.kind = kind;
    this.detail = opts?.detail;
    if (opts?.cause) (this as any).cause = opts.cause;
  }

  toJSON() {
    return {
      error: {
        code: this.code,
        kind: this.kind,
        message: this.message,
        ...(this.detail ? { detail: this.detail } : {}),
      },
    };
  }
}

export class BadRequestError extends RelayError {
  constructor(message = "Bad request", opts?: RelayErrorOptions) {
    super("BAD_REQUEST", message, 400, "VALIDATION", opts);
  }
}
export class UnauthorizedError extends RelayError {
  constructor(message = "Unauthorized", opts?: RelayErrorOptions) {
    super("UNAUTHORIZED", message, 401, "AUTH", opts);
  }
}
export class ForbiddenError extends RelayError {
  constructor(message = "Forbidden", opts?: RelayErrorOptions) {
    super("FORBIDDEN", message, 403, "AUTH", opts);
  }
}
export class NotFoundError extends RelayError {
  constructor(message = "Not found", opts?: RelayErrorOptions) {
    super("NOT_FOUND", message, 404, "VALIDATION", opts);
  }
}
export class RateLimitError extends RelayError {
  constructor(message = "Rate limit exceeded", opts?: RelayErrorOptions) {
    super("RATE_LIMITED", message, 429, "RATE_LIMIT", opts);
  }
}
export class PayloadTooLargeError extends RelayError {
  constructor(message = "Payload too large", opts?: RelayErrorOptions) {
    super("PAYLOAD_TOO_LARGE", message, 413, "VALIDATION", opts);
  }
}
export class RequestTimeoutError extends RelayError {
  constructor(message = "Request timeout", opts?: RelayErrorOptions) {
    super("REQUEST_TIMEOUT", message, 408, "RETRYABLE", opts);
  }
}
export class SchemaInvalidError extends RelayError {
  constructor(message = "Schema validation failed", opts?: RelayErrorOptions) {
    super("SCHEMA_INVALID", message, 422, "VALIDATION", opts);
  }
}
export class SignatureInvalidError extends RelayError {
  constructor(message = "Signature invalid", opts?: RelayErrorOptions) {
    super("SIGNATURE_INVALID", message, 401, "AUTH", opts);
  }
}
export class SkewExceededError extends RelayError {
  constructor(message = "Timestamp skew exceeded", opts?: RelayErrorOptions) {
    super("SKEW_EXCEEDED", message, 400, "VALIDATION", opts);
  }
}
export class KafkaUnavailableError extends RelayError {
  constructor(message = "Kafka unavailable", opts?: RelayErrorOptions) {
    super("KAFKA_UNAVAILABLE", message, 503, "RETRYABLE", opts);
  }
}
export class UpstreamUnavailableError extends RelayError {
  constructor(message = "Upstream unavailable", opts?: RelayErrorOptions) {
    super("UPSTREAM_UNAVAILABLE", message, 502, "RETRYABLE", opts);
  }
}
export class InternalError extends RelayError {
  constructor(message = "Internal server error", opts?: RelayErrorOptions) {
    super("INTERNAL_ERROR", message, 500, "FATAL", opts);
  }
}

export function toHttp(err: unknown): {
  status: HttpStatus;
  body: { error: { code: string; message: string; detail?: unknown } };
} {
  if (err instanceof RelayError) {
    return { status: err.status, body: err.toJSON() as any };
  }
  return {
    status: 500,
    body: {
      error: { code: "INTERNAL_ERROR", message: "Internal server error" },
    },
  };
}
