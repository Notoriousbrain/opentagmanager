import { describe, it, expect } from "bun:test";
import { parsePublicKey } from "../src/auth";
import { createInMemoryResolver, assertActiveProject } from "../src/resolve";

const keyId = "abc123def456ghi789jkl0ab"; 
const goodKey = `OTM_PK_${keyId}_9z8y7x`;
const parsed = parsePublicKey(goodKey);

describe("createInMemoryResolver", () => {
  const resolver = createInMemoryResolver([
    {
      id: keyId, 
      info: { projectId: "p1", status: "active", tenantId: null },
    },
  ]);

  it("resolves active project", async () => {
    const res = await resolver(parsed);
    expect(res.ok).toBe(true);
    if (res.ok) {
      expect(res.project.projectId).toBe("p1");
    }
  });

  it("assertActiveProject throws on missing", async () => {
    const resolver2 = createInMemoryResolver([]);
    const bad = await resolver2(parsed);
    expect(bad.ok).toBe(false);
    expect(() => assertActiveProject(bad)).toThrow();
  });

  it("assertActiveProject throws on revoked", async () => {
    const resolver3 = createInMemoryResolver([
      { id: keyId, info: { projectId: "p1", status: "revoked" } },
    ]);
    const r = await resolver3(parsed);
    expect(() => assertActiveProject(r)).toThrow(/revoked/i);
  });
});
