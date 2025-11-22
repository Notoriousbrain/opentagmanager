import { api } from "../api";
import { getUTM } from "./utm";

let lastPath = "";

export function sendPageview(): void {
  const path = window.location.pathname + window.location.search;

  if (path === lastPath) return;
  lastPath = path;

  api.track("pageview", {
    path,
    title: document.title,
    utm: getUTM(),
  });
}
