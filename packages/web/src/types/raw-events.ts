export interface RawEvent {
  name: string;
  properties: Record<string, unknown>;
  timestamp: string;
  clientId: string;
  sessionId: string;
  userId?: string;
}
