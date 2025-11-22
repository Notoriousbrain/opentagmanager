import { createContext } from "react";
import type { WebClient } from "../client/create-client";

export interface OTMContextValue {
  client: WebClient | null;
}

export const OTMContext = createContext<OTMContextValue>({
  client: null,
});
