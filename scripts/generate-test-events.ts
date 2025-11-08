// scripts/generate-demo-events.ts
import { signIngest } from "../packages/relay-core/src";
import { Header } from "../packages/relay-core/src/types";
import { execSync } from "node:child_process";

const RELAY_URL = "http://localhost:4000/";
const SECRET = "test_secret_public";
const PUBLIC_KEY = "OTM_PK_demo1234567890abcd";

async function main() {
  console.log("🚀 Sending demo events to relay...\n");

  for (let i = 1; i <= 200; i++) {
    const event = {
      events: [
        {
          eventId: `evt_${i}_${Date.now()}`,
          type: "demo_event",
          props: {
            index: i,
            random: Math.floor(Math.random() * 1000),
            hello: "world",
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
      console.log(`✅ Sent event ${i}`);
    } catch (err) {
      console.error(`❌ Failed event ${i}:`, (err as Error).message);
    }

    await new Promise((r) => setTimeout(r, 50));
  }

  console.log("\n🎉 Done sending demo events.");
}

main().catch(console.error);
