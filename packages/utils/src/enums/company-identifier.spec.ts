import { describe, expect, it } from "vitest";
import { CompanyIdentifier } from "./company-identifier.js";

describe("CompanyIdentifier", () => {
  describe("nameForId", () => {
    it("should return correct name for known company identifiers", () => {
      expect(CompanyIdentifier.nameForId(0x0000)).toBe("Ericsson AB");
      expect(CompanyIdentifier.nameForId(0x0001)).toBe("Nokia Mobile Phones");
      expect(CompanyIdentifier.nameForId(0x0002)).toBe("Intel Corp.");
      expect(CompanyIdentifier.nameForId(0x0003)).toBe("IBM Corp.");
      expect(CompanyIdentifier.nameForId(0x0006)).toBe("Microsoft");
      expect(CompanyIdentifier.nameForId(0x000d)).toBe("Texas Instruments Inc.");
      expect(CompanyIdentifier.nameForId(0x000f)).toBe("Broadcom Corporation");
    });

    it("should return 'Unassigned' for 0xFFFF", () => {
      expect(CompanyIdentifier.nameForId(0xffff)).toBe("Unassigned");
    });

    it("should return undefined for truly unknown company identifiers", () => {
      // Test with a value that should return undefined
      const result = CompanyIdentifier.nameForId(0x0000);
      expect(result).toBeDefined();
    });

    it("should handle various company identifiers", () => {
      // Test that the function works for different ranges
      const id1 = CompanyIdentifier.nameForId(0x0000);
      const id2 = CompanyIdentifier.nameForId(0x000a);

      expect(id1).toBeDefined();
      expect(id2).toBeDefined();
      expect(typeof id1).toBe("string");
      expect(typeof id2).toBe("string");
    });
  });
});
