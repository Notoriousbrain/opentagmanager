export async function sendViaBeacon(
  url: string,
  body: string
): Promise<boolean> {
  try {
    const blob = new Blob([body], { type: "application/json" });
    return navigator.sendBeacon(url, blob);
  } catch {
    return false;
  }
}
