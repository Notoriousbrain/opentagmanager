import { sendPageview } from "./pageview";

export function patchHistory(): void {
  sendPageview();

  const pushState = history.pushState;
  history.pushState = function (...args) {
    pushState.apply(this, args);
    sendPageview();
  };

  const replaceState = history.replaceState;
  history.replaceState = function (...args) {
    replaceState.apply(this, args);
    sendPageview();
  };

  window.addEventListener("popstate", () => {
    sendPageview();
  });
}
