import { signIngest } from "../packages/relay-core/src";
import { Header } from "../packages/relay-core/src/types";

const SECRET = "test_secret_public";
const PUBLIC_KEY = "OTM_PK_demo1234567890abcd";
const METHOD = "POST";
const PATH = "/";
const BODY =
  '{"events":[{"eventId":"evt_123","type":"demo_event","props":{"hello":"world"}}]}';

const ts = Date.now();

const sig = signIngest({
  method: METHOD,
  path: PATH,
  body: BODY,
  ts,
  secret: SECRET,
});

console.log("🔐 Generated Relay Headers:");
console.log(`${Header.Key}: ${PUBLIC_KEY}`);
console.log(`${Header.Timestamp}: ${ts}`);
console.log(`${Header.Signature}: ${sig}`);

console.log("\n📦 Body:", BODY);

console.log(`
💡 Example curl command:
curl -X POST http://localhost:4000/ \\
  -H "Content-Type: application/json" \\
  -H "${Header.Key}: ${PUBLIC_KEY}" \\
  -H "${Header.Timestamp}: ${ts}" \\
  -H "${Header.Signature}: ${sig}" \\
  -d '${BODY}'
`);
