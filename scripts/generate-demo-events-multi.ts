// scripts/generate-demo-events-multi.ts
import { signIngest } from "../packages/relay-core/src";
import { Header } from "../packages/relay-core/src/types";
import { execSync } from "node:child_process";

const RELAY_URL = "http://localhost:4000/";
const SECRET = "test_secret_public";
const PUBLIC_KEY = "OTM_PK_demo1234567890abcd";

const PROJECTS = ["demo_project_1"];
const EVENTS_PER_PROJECT = 5;
const CYCLE_DELAY_MS = 2000;

function randomEventType() {
  return ["page_view", "click", "signup", "purchase", "scroll"][
    Math.floor(Math.random() * 5)
  ];
}

function randomProps() {
  return {
    user: `user_${Math.floor(Math.random() * 1000)}`,
    value: Math.floor(Math.random() * 5000),
    region: ["US", "EU", "IN", "SG"][Math.floor(Math.random() * 4)],
  };
}

async function sendEvent(projectId: string, i: number) {
  const event = {
    events: [
      {
        eventId: `${projectId}_${i}_${Date.now()}`,
        type: randomEventType(),
        props: randomProps(),
        userId: `user_${Math.floor(Math.random() * 1000)}`,
        timestamp: Date.now(),
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
    console.log(`✅ [${projectId}] event ${i} sent`);
  } catch (err) {
    console.error(`❌ [${projectId}] failed`, (err as Error).message);
  }
}

async function loopForever() {
  console.log("🌍 Starting multi-project demo generator...\n");
  let i = 1;

  while (true) {
    console.log(
      `▶️ Cycle ${i}: sending ${EVENTS_PER_PROJECT * PROJECTS.length} events...`
    );

    for (const project of PROJECTS) {
      for (let j = 0; j < EVENTS_PER_PROJECT; j++) {
        await sendEvent(project, i * 1000 + j);
      }
    }

    console.log(`⏱ Waiting ${CYCLE_DELAY_MS / 1000}s before next cycle...`);
    await new Promise((r) => setTimeout(r, CYCLE_DELAY_MS));
    i++;
  }
}

loopForever().catch(console.error);
