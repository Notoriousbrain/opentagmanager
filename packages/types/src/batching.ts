import type { RawEvent } from "./raw-event";

export interface RawBatchPayload {
  projectId: string;
  clientId: string;
  sessionId: string;
  sentAt: string;
  events: RawEvent[];
}

export function buildBatchBase(params: {
  projectId: string;
  clientId: string;
  sessionId: string;
  events: RawEvent[];
}): RawBatchPayload {
  return {
    projectId: params.projectId,
    clientId: params.clientId,
    sessionId: params.sessionId,
    sentAt: new Date().toISOString(),
    events: [...params.events],
  };
}
