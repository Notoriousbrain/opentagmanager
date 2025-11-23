import { sendViaBeacon } from "./beacon";
import { sendViaFetch } from "./fetch";
import { sendViaPixel } from "./pixel";
import { sendViaForm } from "./form";

type TransportFn = (url: string, body: SendBody) => Promise<boolean> | boolean;

const TRANSPORTS: TransportFn[] = [
  sendViaBeacon,
  sendViaFetch,
  sendViaPixel,
  sendViaForm,
];

export interface SendBody {
  json: string;
  base64: string;
}

export async function sendBatch(url: string, body: SendBody): Promise<boolean> {
  const startIndex = Math.floor(Math.random() * TRANSPORTS.length);

  for (let i = 0; i < TRANSPORTS.length; i++) {
    const idx = (startIndex + i) % TRANSPORTS.length;
    const transport = TRANSPORTS[idx];

    if (typeof transport === "function") {
      if (await transport(url, body)) {
        return true;
      }
    }
  }

  return false;
}
