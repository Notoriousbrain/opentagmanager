import { getProjectId } from "./get-project-id";
import { getClientId } from "./client-id";
import { getSessionId } from "./session-id";
import { setState } from "./state";

export function bootstrap() {
  const projectId = getProjectId();
  if (!projectId) {
    console.warn("[osstag] Missing data-osstag attribute on script tag");
    return;
  }

  const clientId = getClientId();
  const sessionId = getSessionId();

  setState({
    projectId,
    clientId,
    sessionId,
    initializedAt: new Date().toISOString()
  });
}
