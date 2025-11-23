import { SendBody } from ".";

export async function sendViaFetch(
  url: string,
  body: SendBody
): Promise<boolean> {
  try {
    const res = await fetch(url, {
      method: "POST",
      body: body.json,
      headers: {
        "Content-Type": "application/json",
      },
      keepalive: true,
    });
    return res.ok;
  } catch {
    return false;
  }
}
