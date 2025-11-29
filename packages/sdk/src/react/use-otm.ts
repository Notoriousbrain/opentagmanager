import { useContext } from "react";
import { OTMContext } from "./context";
import type { Analytics } from "../analytics/create-analytics";

export function useOTM(): Analytics {
  const { analytics } = useContext(OTMContext);

  if (!analytics) {
    throw new Error("[otm] useOTM() must be used inside <OTMProvider>");
  }

  return analytics;
}
