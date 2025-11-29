import { createContext } from "react";
import type { Analytics } from "../analytics/create-analytics";

export interface OTMContextValue {
  analytics: Analytics | null;
}

export const OTMContext = createContext<OTMContextValue>({
  analytics: null,
});
