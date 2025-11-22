import { bootstrap } from "./bootstrap";
import { api } from "./api";

declare global {
  interface Window {
    osstag?: typeof api;
  }
}

window.osstag = api;

export function init() {
  bootstrap();
}

init();

import { flush } from "./flush";

window.addEventListener("visibilitychange", () => {
  if (document.visibilityState === "hidden") {
    flush();
  }
});
