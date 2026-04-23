import { describe, it, expect } from "vitest";
import { GenericOnOff } from "./generic-on-off.js";
import { AccessError } from "@mesh-link-js/utils";
import type { Model } from "@mesh-link-js/core";
import { CoreMeshNetworkManager } from "../mesh-network/core-mesh-network-manager.js";

function makeModel(boundAppKeyCount = 0): Model {
  return {
    boundApplicationKeys: Array.from({ length: boundAppKeyCount }, (_, i) => ({
      name: `key${i}`,
    })),
  } as unknown as Model;
}

describe("GenericOnOff", () => {
  it("has a stable key property", () => {
    expect(GenericOnOff.key).toBe("genericOnOff");
  });

  describe("get()", () => {
    it("throws AccessError.modelNotBoundToAppKey when no keys are bound", async () => {
      const model = makeModel(0);
      const ext = GenericOnOff(model, CoreMeshNetworkManager.instance);
      await expect(ext.get()).rejects.toThrow(AccessError.modelNotBoundToAppKey.message);
    });
  });

  describe("set()", () => {
    it("throws AccessError.modelNotBoundToAppKey when no keys are bound", async () => {
      const model = makeModel(0);
      const ext = GenericOnOff(model, CoreMeshNetworkManager.instance);
      await expect(ext.set(true)).rejects.toThrow(AccessError.modelNotBoundToAppKey.message);
    });
  });
});
