import { describe, expect, it } from "vitest";
import { MeshMessageSecurity } from "./mesh-message-security.js";

describe("MeshMessageSecurity", () => {
  it("should have low security with value 0", () => {
    expect(MeshMessageSecurity.low).toBe(0);
  });

  it("should have high security with value 1", () => {
    expect(MeshMessageSecurity.high).toBe(1);
  });
});
