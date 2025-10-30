import { signIngest } from "../src";

const body = JSON.stringify({ events: [{ type: "page_view" }] });
const ts = Date.now();
const secret = "test_secret";

const sig = signIngest({
  method: "POST",
  path: "/",
  body,
  ts,
  secret,
});

console.log("x-otm-ts:", ts);
console.log("x-otm-sig:", sig);
