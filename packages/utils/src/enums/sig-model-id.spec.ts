import { describe, expect, it } from "vitest";
import { SigModelId } from "./sig-model-id.js";

describe("SigModelId", () => {
  describe("Foundation models", () => {
    it("should have configurationServerModelId", () => {
      expect(SigModelId.configurationServerModelId).toBe(0x0000);
    });

    it("should have configurationClientModelId", () => {
      expect(SigModelId.configurationClientModelId).toBe(0x0001);
    });

    it("should have healthServerModelId", () => {
      expect(SigModelId.healthServerModelId).toBe(0x0002);
    });

    it("should have healthClientModelId", () => {
      expect(SigModelId.healthClientModelId).toBe(0x0003);
    });
  });

  describe("Configuration models (Mesh Protocol 1.1)", () => {
    it("should have remoteProvisioningServerModelId", () => {
      expect(SigModelId.remoteProvisioningServerModelId).toBe(0x0004);
    });

    it("should have remoteProvisioningClientModelId", () => {
      expect(SigModelId.remoteProvisioningClientModelId).toBe(0x0005);
    });

    it("should have directedForwardingConfigurationServerModelId", () => {
      expect(SigModelId.directedForwardingConfigurationServerModelId).toBe(0x0006);
    });

    it("should have privateBeaconServerModelId", () => {
      expect(SigModelId.privateBeaconServerModelId).toBe(0x000a);
    });

    it("should have sarConfigurationServerModelId", () => {
      expect(SigModelId.sarConfigurationServerModelId).toBe(0x000e);
    });
  });

  describe("Generic models", () => {
    it("should have genericOnOffServerModelId", () => {
      expect(SigModelId.genericOnOffServerModelId).toBe(0x1000);
    });

    it("should have genericOnOffClientModelId", () => {
      expect(SigModelId.genericOnOffClientModelId).toBe(0x1001);
    });

    it("should have genericLevelServerModelId", () => {
      expect(SigModelId.genericLevelServerModelId).toBe(0x1002);
    });

    it("should have genericPowerLevelServerModelId", () => {
      expect(SigModelId.genericPowerLevelServerModelId).toBe(0x1009);
    });

    it("should have genericPropertyClientModelId", () => {
      expect(SigModelId.genericPropertyClientModelId).toBe(0x1015);
    });
  });

  describe("Sensor models", () => {
    it("should have sensorServerModelId", () => {
      expect(SigModelId.sensorServerModelId).toBe(0x1100);
    });
  });
});
