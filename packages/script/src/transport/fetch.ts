export async function sendViaFetch(
  url: string,
  body: string
): Promise<boolean> {
  try {
    const res = await fetch(url, {
      method: "POST",
      body,
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
