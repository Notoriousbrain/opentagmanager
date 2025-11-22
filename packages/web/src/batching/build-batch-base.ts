import type { BatchPayload, Event } from "@otm/types";

export function buildBatchBase(params: {
  projectId: string;
  clientId: string;
  sessionId: string;
  events: Event[];
}): BatchPayload {
  return {
    projectId: params.projectId,
    clientId: params.clientId,
    sessionId: params.sessionId,
    sentAt: new Date().toISOString(),
    events: [...params.events],
  };
}
