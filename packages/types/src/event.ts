export type EventProps = Record<string, unknown>;

export interface Viewport {
  width: number;
  height: number;
}

export type FrameworkName =
  | "html"
  | "react"
  | "next"
  | "vue"
  | "svelte"
  | "node"
  | string;

export interface EventContext {
  framework: FrameworkName;
  [key: string]: unknown;
}

export interface Event<TProps extends EventProps = EventProps> {
  id: string;
  name: string;
  props: TProps;

  clientId: string;
  sessionId: string;

  timestamp: string;
  url: string;
  referrer: string | null;

  viewport: Viewport;
  region: string | null;

  context: EventContext;
}

export interface BatchPayload<TProps extends EventProps = EventProps> {
  projectId: string;
  clientId: string;
  sessionId: string;

  sentAt: string;
  events: Event<TProps>[];
}

export interface SignatureInput<TProps extends EventProps = EventProps> {
  batch: BatchPayload<TProps>;
  timestamp: string;
}
