import { bootstrap } from "./bootstrap";
import { api } from "./api";

export function init() {
  bootstrap();
}

init();

declare global {
  interface Window {
    osstag?: typeof api;
  }
}

window.osstag = api;
