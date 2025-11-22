import { getProjectId } from "./get-project-id";
import { getClientId } from "./client-id";
import { getSessionId } from "./session-id";
import { setState } from "./state";
import { patchHistory } from "../auto/history";
import { buildConfig } from "./config";

export function bootstrap() {
  const projectId = getProjectId();
  if (!projectId) {
    console.warn("[osstag] Missing data-osstag attribute on script tag");
    return;
  }

  const clientId = getClientId();
  const sessionId = getSessionId();
  const config = buildConfig();

  setState({
    projectId,
    clientId,
    sessionId,
    initializedAt: new Date().toISOString(),
    config,
  });

  patchHistory();
}
