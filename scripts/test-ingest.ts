// scripts/test-ingest.ts
import { createSignedHeaders } from "./utils/signer";

const PUBLIC_KEY = "OTM_PK_demo1234567890abcd";
const SECRET = "43b986d8cf5aae2a766f229263396245";
const RELAY_URL = "http://localhost:4000/";

async function sendBatch(n = 10) {
  const events = Array.from({ length: n }, (_, i) => ({
    type: "test_event",
    props: { index: i, value: Math.random() },
  }));

  const body = JSON.stringify({ events });
  const headers = createSignedHeaders({
    secret: SECRET,
    publicKey: PUBLIC_KEY,
    body,
  });

  const res = await fetch(RELAY_URL, { method: "POST", headers, body });
  const json = await res.json().catch(() => ({}));

  console.log(`[${res.status}]`, json);
}

sendBatch(10);
