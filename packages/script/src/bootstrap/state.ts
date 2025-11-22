export interface ScriptState {
  projectId: string;
  clientId: string;
  sessionId: string;
  initializedAt: string;
}

let state: ScriptState | null = null;

export function setState(value: ScriptState) {
  state = value;
}

export function getState(): ScriptState {
  if (!state) {
    throw new Error("OSSTag script not initialized");
  }
  return state;
}
