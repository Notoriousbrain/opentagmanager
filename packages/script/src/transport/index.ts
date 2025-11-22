import { sendViaBeacon } from "./beacon";
import { sendViaFetch } from "./fetch";
import { sendViaPixel } from "./pixel";
import { sendViaForm } from "./form";

export async function sendBatch(url: string, body: string): Promise<boolean> {
  if (await sendViaBeacon(url, body)) return true;

  if (await sendViaFetch(url, body)) return true;

  if (await sendViaPixel(url, body)) return true;

  if (await sendViaForm(url, body)) return true;

  return false;
}
