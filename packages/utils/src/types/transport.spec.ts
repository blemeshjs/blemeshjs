import { describe, expect, it } from "vitest";
import { Transport } from "./transport.js";

describe("Transport", () => {
  it("should throw error when getting AdvertisementDataServiceDataKey from base class", () => {
    expect(() => Transport.AdvertisementDataServiceDataKey).toThrow(
      "Getting advertisement data service data key is not implemented for this transport.",
    );
  });

  it("should allow subclass to override AdvertisementDataServiceDataKey", () => {
    class TestTransport extends Transport {
      static override get AdvertisementDataServiceDataKey(): string {
        return "test-key";
      }
    }

    expect(TestTransport.AdvertisementDataServiceDataKey).toBe("test-key");
  });
});
