import { describe, it, expect } from "bun:test";
import { parsePublicKey, tryParsePublicKey, PUBLIC_KEY_PREFIX, maskPublicKey } from "../src/auth";

describe("parsePublicKey", () => {
  const good = "OTM_PK_abc123def456ghi789jkl0abc_9z8y7x";

  it("parses valid key", () => {
    const p = parsePublicKey(good);
    expect(p.prefix).toBe(PUBLIC_KEY_PREFIX);
    expect(p.id).toBe("abc123def456ghi789jkl0abc");
    expect(p.checksum).toBe("9z8y7x");
  });

  it("accepts lowercase id/checksum and case-insensitive prefix", () => {
    const p = parsePublicKey("otm_pk_abcdefabcdefabcdefab_cd1234");
    expect(p.id).toBe("abcdefabcdefabcdefab");
    expect(p.checksum).toBe("cd1234");
  });

  it("rejects bad prefix", () => {
    expect(() => parsePublicKey("OTM_SK_foo")).toThrow();
  });

  it("rejects invalid id length/charset", () => {
    expect(() => parsePublicKey("OTM_PK_short_aaaaaa")).toThrow();
    expect(() => parsePublicKey("OTM_PK_ABCDEFGHIJKL_aaaaaa")).toThrow();
  });

  it("rejects invalid checksum", () => {
    expect(() => parsePublicKey("OTM_PK_abcdefghijklmnopq_-bad-")).toThrow();
  });
});

describe("tryParsePublicKey", () => {
  it("returns null on invalid", () => {
    expect(tryParsePublicKey("bad")).toBeNull();
  });
});

describe("maskPublicKey", () => {
  it("masks middle part", () => {
    const masked = maskPublicKey("OTM_PK_abc123def456ghi789");
    expect(masked).toMatch(/\*\*\*/);
  });
});
