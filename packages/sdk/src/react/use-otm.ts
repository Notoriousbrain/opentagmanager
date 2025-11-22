import { useContext } from "react";
import { OTMContext } from "./context";
import type { WebClient } from "../client/create-client";

export function useOTM(): WebClient {
  const { client } = useContext(OTMContext);

  if (!client) {
    throw new Error(
      "[otm] useOTM() must be used inside <OTMProvider config={...}>"
    );
  }

  return client;
}
