#!/usr/bin/env bun

import { signIngest } from "../src";

const secret = process.env.TEST_SECRET || "test_secret_for_demo";
const method = process.env.METHOD || "POST";
const path = process.env.PATH || "/";
const body = process.env.BODY || JSON.stringify({ events: [{ type: "page_view" }] });
const ts = Date.now();

const sig = signIngest({
  method,
  path,
  body,
  ts,
  secret,
});

console.log("=== Signature Debug Info ===");
console.log("Timestamp (ms):", ts);
console.log("Secret:", secret);
console.log("Method:", method);
console.log("Path:", path);
console.log("Body:", body);
console.log("\nSignature:", sig);
console.log(`\nUse with:\n`);
console.log(
  `curl -X ${method} http://localhost:4000${path} \\\n` +
    `  -H "x-otm-key: OTM_PK_demo123_abc" \\\n` +
    `  -H "x-otm-ts: ${ts}" \\\n` +
    `  -H "x-otm-sig: ${sig}" \\\n` +
    `  -H "content-type: application/json" \\\n` +
    `  -d '${body}'\n`
);
