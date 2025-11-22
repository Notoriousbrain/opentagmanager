export function sendViaPixel(url: string, body: string): Promise<boolean> {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => resolve(true);
    img.onerror = () => resolve(false);

    img.src = `${url}?d=${encodeURIComponent(body)}`;
  });
}
