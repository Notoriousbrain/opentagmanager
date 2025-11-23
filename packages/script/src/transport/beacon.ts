import { SendBody } from ".";

export async function sendViaBeacon(
  url: string,
  body: SendBody
): Promise<boolean> {
  try {
    const blob = new Blob([body.json], { type: "application/json" });
    return navigator.sendBeacon(url, blob);
  } catch {
    return false;
  }
}