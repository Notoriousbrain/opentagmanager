// apps/ingest/scripts/test-ingest.ts
import { randomUUID } from "node:crypto";

const url = "http://localhost:4000/";
const now = Date.now();

const body = {
  events: [
    {
      eventId: randomUUID(),
      type: "test_event",
      data: { source: "relay-local-test" },
      timestamp: now,
    },
  ],
};

async function main() {
  const res = await fetch(url, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "x-otm-key": "OTM_PK_abcdef1234567890_abcd1234",
      "x-otm-ts": now.toString(),
      "x-otm-sig": "dummy", 
    },
    body: JSON.stringify(body),
  });

  console.log("→ Relay response:", await res.text());
}

main().catch(console.error);
