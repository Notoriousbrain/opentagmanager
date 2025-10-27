export type MsTimestamp = number;

export interface IngestEvent {
  eventId: string;
  type: string;
  data?: unknown;
  timestamp?: string | number;
}

export interface IngestBatch {
  sdk?: string;
  events: IngestEvent[];
}

export interface NormalizedEvent {
  projectId: string;
  tenantId?: string | null;

  eventId: string;
  type: string;
  data: unknown;

  occurredAt?: MsTimestamp | null;
  receivedAt: MsTimestamp;

  ip?: string | null;
  ua?: string | null;
  requestId: string;
}

export interface CallerIdentity {
  publicKey: string;
  projectId?: string;
  tenantId?: string | null;
}

export interface EnqueueBatch {
  projectId: string;
  tenantId?: string | null;

  batchId: string;

  events: NormalizedEvent[];

  ip?: string | null;
  ua?: string | null;
  receivedAt: MsTimestamp;
}

export interface IngestResponse {
  requestId: string;
  eventsAccepted: number;
  receivedAt: MsTimestamp;
  ts: number
}

export type Result<T, E = Error> =
  | { ok: true; value: T }
  | { ok: false; error: E };

export type HttpStatus =
  | 200
  | 400
  | 401
  | 403
  | 404
  | 408
  | 413
  | 422
  | 429
  | 500
  | 502
  | 503
  | 504;

export const Header = {
  Key: "x-otm-key",
  Timestamp: "x-otm-ts",
  Signature: "x-otm-sig",
  RequestId: "x-request-id",
} as const;
