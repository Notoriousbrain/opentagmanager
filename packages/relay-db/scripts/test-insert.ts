import { insertBatchToClickhouse } from "../../relay-consumer/src/insert-batch-to-clickhouse";
import { NormalizedEvent } from "../../relay-core/src";

const now = Date.now();

const testEvents: NormalizedEvent[] = [
  {
    projectId: "demo123",
    tenantId: null,
    eventId: "evt_test_1",
    type: "page_view",
    data: { url: "/home" },
    occurredAt: now,
    receivedAt: now,
    ip: "127.0.0.1",
    ua: "curl-test",
    requestId: "req_local_test",
  },
  {
    projectId: "demo123",
    tenantId: null,
    eventId: "evt_test_2",
    type: "signup",
    data: { ref: "twitter" },
    occurredAt: now,
    receivedAt: now,
    ip: "127.0.0.1",
    ua: "curl-test",
    requestId: "req_local_test",
  },
];

insertBatchToClickhouse(testEvents).then(() => {
  console.log("✅ Test insert complete");
});
