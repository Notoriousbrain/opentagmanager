// scripts/generate-demo-events-continuous.ts
import { signIngest } from "../packages/relay-core/src";
import { Header } from "../packages/relay-core/src/types";
import { execSync } from "node:child_process";

const RELAY_URL = "http://localhost:4000/";
const SECRET = "test_secret_public"; // same as your relay's shared secret
const PUBLIC_KEY = "OTM_PK_demo1234567890abcd";

// You can tweak these safely
const EVENTS_PER_CYCLE = 10;     // how many events to send per iteration
const CYCLE_DELAY_MS = 2000;     // how long to wait between cycles

async function sendEvent(i: number) {
  const event = {
    events: [
      {
        eventId: `evt_${i}_${Date.now()}`,
        type: ["click", "page_view", "signup", "purchase"][
          Math.floor(Math.random() * 4)
        ],
        props: {
          value: Math.floor(Math.random() * 1000),
          user: `user_${Math.floor(Math.random() * 50)}`,
        },
      },
    ],
  };

  const body = JSON.stringify(event);
  const ts = Date.now();

  const sig = signIngest({
    method: "POST",
    path: "/",
    body,
    ts,
    secret: SECRET,
  });

  const curl = [
    "curl -s -X POST",
    RELAY_URL,
    `-H "Content-Type: application/json"`,
    `-H "${Header.Key}: ${PUBLIC_KEY}"`,
    `-H "${Header.Timestamp}: ${ts}"`,
    `-H "${Header.Signature}: ${sig}"`,
    `-d '${body}'`,
  ].join(" ");

  try {
    execSync(curl, { stdio: "ignore" });
    console.log(`✅ Event sent: ${event.events[0].eventId}`);
  } catch (err) {
    console.error(`❌ Error sending event:`, (err as Error).message);
  }
}

async function loopForever() {
  console.log("🌊 Starting continuous demo event generator...\n");
  let i = 1;
  while (true) {
    console.log(`\n▶️ Cycle ${i}: sending ${EVENTS_PER_CYCLE} events...`);
    for (let j = 0; j < EVENTS_PER_CYCLE; j++) {
      await sendEvent(i * EVENTS_PER_CYCLE + j);
    }
    console.log(`⏱ Waiting ${CYCLE_DELAY_MS / 1000}s before next cycle...`);
    await new Promise((r) => setTimeout(r, CYCLE_DELAY_MS));
    i++;
  }
}

loopForever().catch(console.error);
