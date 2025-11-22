import { getState, setState } from "./bootstrap/state";

export function identify(userId: string): void {
  const state = getState();

  setState({
    ...state,
    clientId: `${state.clientId}:${userId}`,
  });
}
